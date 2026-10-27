import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, body, text, throttle } from '../../../http';
import { telegram, html, restaurantChats } from '../../../telegram';
export const dynamic = 'force-dynamic';

/*
 * A guest at the table calls the waiter or asks for the bill from their active booking. Allowed from
 * 30 minutes before the booking until 30 minutes after it ends (or once checked in), at most once a
 * minute per kind. The request appears on the restaurant's staff panel and goes to its Telegram chat.
 */
const KINDS: Record<string, string> = { waiter: '🔔 Ofitsiantni chaqirmoqda', bill: '🧾 Hisobni so‘ramoqda' };
const minutesOf = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

export async function POST(request: Request) {
  try {
    const b = await body(request);
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    const kind = text(b.kind);
    if (!KINDS[kind]) throw new ApiError(400, 'Noma’lum so‘rov.');
    const bk = await env.DB!.prepare("SELECT b.id,b.restaurant_id,b.date,b.slot,b.end_slot,b.table_number,b.status,b.checked_in_at,r.name AS restaurant_name,r.telegram_chat_id FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id WHERE b.id=? AND b.user_id=?").bind(text(b.bookingId), u.userId).first<any>();
    if (!bk || !['pending', 'confirmed'].includes(bk.status)) throw new ApiError(404, 'Faol bron topilmadi.');
    const local = new Date(Date.now() + 5 * 3600000).toISOString();
    const now = minutesOf(local.slice(11, 16)),
      start = minutesOf(String(bk.slot)),
      end = bk.end_slot ? minutesOf(String(bk.end_slot)) : start + 120;
    if (!bk.checked_in_at && (bk.date !== local.slice(0, 10) || now < start - 30 || now > end + 30)) throw new ApiError(409, 'Bu tugma bron vaqtida, restoranda bo‘lganingizda ishlaydi.');
    await throttle('table-service:' + bk.id, 10);
    const recent = await env.DB!.prepare('SELECT 1 FROM service_requests WHERE booking_id=? AND kind=? AND resolved_at IS NULL AND created_at>?').bind(bk.id, kind, new Date(Date.now() - 60000).toISOString()).first();
    if (recent) return json({ ok: true, repeated: true });
    await env.DB!.prepare('INSERT INTO service_requests (id,restaurant_id,booking_id,table_number,kind,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(), bk.restaurant_id, bk.id, bk.table_number, kind, new Date().toISOString()).run();
    for (const chat_id of await restaurantChats(bk.restaurant_id)) await telegram('sendMessage', { chat_id, parse_mode: 'HTML', text: `<b>${bk.table_number}-stol: ${KINDS[kind]}</b>\n🏠 ${html(bk.restaurant_name)}` });
    return json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
