import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure } from '../../../http';
import { planState } from '../../../plans';
export const dynamic = 'force-dynamic';

/**
 * Feed for the admin AI orb: new bookings since `since` and live table counts for the
 * manager's restaurants that have the Admin AI feature. Polled every few seconds.
 */
export async function GET(request: Request) {
  try {
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    if (!['admin', 'restaurant_owner'].includes(u.role)) throw new ApiError(403, 'Ruxsat yo‘q.');
    const sinceParam = new URL(request.url).searchParams.get('since');
    const now = new Date();
    // Cap the look-back so a stale client cannot pull the whole history.
    const floor = new Date(now.getTime() - 24 * 3600000);
    const since = sinceParam && !Number.isNaN(Date.parse(sinceParam)) ? new Date(Math.max(Date.parse(sinceParam), floor.getTime())) : new Date(now.getTime() - 60000);

    const owned = (
      await env.DB!.prepare('SELECT id,name,tables,plan,trial_ends_at,paid_until FROM restaurants WHERE ' + (u.role === 'admin' ? '1=1' : 'owner_id=?') + ' ORDER BY name LIMIT 50')
        .bind(...(u.role === 'admin' ? [] : [u.userId]))
        .all<any>()
    ).results.map((r) => ({ id: r.id as string, name: r.name as string, tables: r.tables as number, plan: planState(r) }));
    const enabled = owned.filter((r) => r.plan.features.adminAi);
    if (!enabled.length) return json({ now: now.toISOString(), enabled: false, restaurants: owned.map(({ id, name, plan }) => ({ id, name, plan })), bookings: [], live: [] });

    const ids = enabled.map((r) => r.id);
    const marks = ids.map(() => '?').join(',');
    const [bookings, live] = await Promise.all([
      env.DB!.prepare(`SELECT b.id,b.restaurant_id,r.name AS restaurant_name,b.date,b.slot,b.end_slot,b.table_number,b.guests,b.status,b.preorder_total,b.created_at FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id WHERE b.restaurant_id IN (${marks}) AND b.created_at>? AND b.is_demo=0 ORDER BY b.created_at LIMIT 20`)
        .bind(...ids, since.toISOString())
        .all(),
      env.DB!.prepare(`SELECT restaurant_id,status,COUNT(*) AS n FROM table_live_status WHERE restaurant_id IN (${marks}) AND updated_at>=strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes') GROUP BY restaurant_id,status`)
        .bind(...ids)
        .all(),
    ]);
    return json({
      now: now.toISOString(),
      enabled: true,
      restaurants: owned.map(({ id, name, plan }) => ({ id, name, plan })),
      bookings: bookings.results,
      live: live.results,
    });
  } catch (e) {
    return failure(e);
  }
}
