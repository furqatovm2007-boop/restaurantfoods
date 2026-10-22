import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { accessToken, authConfig } from '../../../auth-service';
import { ApiError, body, text, throttle, failure } from '../../../http';
import { requireFeature } from '../../../plans';
import { readSse, sseFrame, sseHeaders } from '../../../sse';
export const dynamic = 'force-dynamic';

/** Samarkand calendar date (UTC+5), the same convention as bookings. */
const today = () => new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);

/** Compact, owner-only snapshot the admin assistant may answer from. */
async function restaurantContext(restaurantId: string, plan: unknown) {
  const date = today();
  const [restaurant, bookings, week, orders, live, unavailable] = await Promise.all([
    env.DB!.prepare('SELECT name,address,hours,tables,floors,booking_open,booking_close FROM restaurants WHERE id=?').bind(restaurantId).first(),
    env.DB!.prepare("SELECT slot,end_slot,table_number,guests,status,preorder_total FROM bookings WHERE restaurant_id=? AND date=? AND status IN ('pending','confirmed','completed') ORDER BY slot LIMIT 80").bind(restaurantId, date).all(),
    env.DB!.prepare("SELECT date,COUNT(*) AS bookings,SUM(guests) AS guests FROM bookings WHERE restaurant_id=? AND date BETWEEN date(?,'-6 days') AND ? AND status IN ('pending','confirmed','completed') GROUP BY date ORDER BY date").bind(restaurantId, date, date).all(),
    env.DB!.prepare("SELECT status,fulfillment,COUNT(*) AS n,SUM(total) AS total FROM orders WHERE restaurant_id=? AND substr(created_at,1,10)>=date(?,'-1 day') GROUP BY status,fulfillment").bind(restaurantId, date).all(),
    env.DB!.prepare("SELECT table_number,status,source,updated_at FROM table_live_status WHERE restaurant_id=? AND updated_at>=strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes') ORDER BY table_number").bind(restaurantId).all(),
    env.DB!.prepare('SELECT name FROM menu WHERE restaurant_id=? AND available=0 ORDER BY name LIMIT 40').bind(restaurantId).all(),
  ]);
  return { today: date, restaurant, plan, bookingsToday: bookings.results, last7Days: week.results, ordersSinceYesterday: orders.results, liveTables: live.results, unavailableDishes: unavailable.results.map((r: any) => r.name) };
}

export async function POST(request: Request) {
  try {
    const b = await body(request);
    const u = await identity();
    if (!u) throw new ApiError(401, 'AI_LOGIN_REQUIRED');
    if (!['admin', 'restaurant_owner'].includes(u.role)) throw new ApiError(403, 'Ruxsat yo‘q.');
    const restaurantId = text(b.restaurantId);
    const message = text(b.message, 1, 1400);
    const lang = text(b.lang);
    if (!['uz', 'ru', 'en'].includes(lang)) throw new ApiError(400, 'AI_INVALID_LANGUAGE');
    const { row, state } = await requireFeature(restaurantId, 'adminAi');
    if (u.role !== 'admin' && row.owner_id !== u.userId) throw new ApiError(403, 'Restoranga ruxsat yo‘q.');
    await throttle('admin-ai:' + u.userId, 40);
    const token = await accessToken();
    const c = authConfig();
    if (!token) throw new ApiError(401, 'AI_LOGIN_REQUIRED');
    if (!c.url || !c.key) throw new ApiError(503, 'AI_UNAVAILABLE');
    const history = Array.isArray(b.history) ? b.history.slice(-8).filter((m: any) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.length <= 1600) : [];
    const context = await restaurantContext(restaurantId, { status: state.status, plan: state.plan, daysLeft: state.daysLeft });

    let upstream: Response;
    try {
      upstream = await fetch(c.url + '/functions/v1/restaurantfoods-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: c.key, Authorization: 'Bearer ' + token, ...(c.proxy ? { 'X-RF-Proxy': c.proxy } : {}) },
        body: JSON.stringify({ mode: 'admin_chat', message, lang, history, context, voice: b.voice === true }),
        signal: AbortSignal.timeout(35000),
      });
    } catch {
      throw new ApiError(504, 'AI_TIMEOUT');
    }
    if (!upstream.ok || !upstream.body || !upstream.headers.get('content-type')?.includes('text/event-stream')) throw new ApiError(upstream.status === 429 ? 429 : 503, upstream.status === 429 ? 'AI_LIMIT' : 'AI_UNAVAILABLE');
    const source = upstream.body;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const e of readSse(source)) {
            let data: any;
            try {
              data = JSON.parse(e.data);
            } catch {
              continue;
            }
            if (e.event === 'delta' && typeof data.text === 'string') controller.enqueue(sseFrame('delta', { text: data.text.slice(0, 4000) }));
            else if (e.event === 'done') {
              controller.enqueue(sseFrame('done', { reply: String(data.reply || '').slice(0, 8000) }));
              break;
            } else if (e.event === 'error') {
              controller.enqueue(sseFrame('error', { error: 'AI_UNAVAILABLE' }));
              break;
            }
          }
        } catch {
          controller.enqueue(sseFrame('error', { error: 'AI_UNAVAILABLE' }));
        }
        controller.close();
      },
      cancel() {
        source.cancel().catch(() => {});
      },
    });
    return new Response(stream, { headers: sseHeaders });
  } catch (e) {
    return failure(e);
  }
}
