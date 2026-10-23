import { env } from 'cloudflare:workers';
import { identity } from '../../access';
import { ApiError, json, failure, body, text, integer, throttle } from '../../http';
import { expireHolds, MAX_ACTIVE_PER_USER } from '../../waitlist';
export const dynamic = 'force-dynamic';

/** The customer's active waitlist entries (waiting, or notified with a running hold). */
export async function GET() {
  try {
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval akkauntingizga kiring.');
    await expireHolds();
    const rows = await env.DB!.prepare("SELECT w.id,w.restaurant_id,w.table_number,w.guests,w.status,w.notified_at,w.hold_until,w.created_at,r.name AS restaurant_name,(SELECT COUNT(*) FROM waitlist o WHERE o.restaurant_id=w.restaurant_id AND o.table_number=w.table_number AND o.status='waiting' AND o.created_at<w.created_at)+1 AS position FROM waitlist w JOIN restaurants r ON r.id=w.restaurant_id WHERE w.user_id=? AND w.status IN ('waiting','notified') ORDER BY w.created_at").bind(u.userId).all();
    return json({ entries: rows.results });
  } catch (e) {
    return failure(e);
  }
}

/** Join the queue for a table that is occupied right now, or leave it (action: 'leave'). */
export async function POST(request: Request) {
  try {
    const b = await body(request);
    const u = await identity();
    if (!u) throw new ApiError(401, 'Navbatga yozilish uchun akkauntingizga kiring.');
    await throttle('waitlist:' + u.userId, 20);
    if (b.action === 'leave') {
      await env.DB!.prepare("UPDATE waitlist SET status='left' WHERE id=? AND user_id=? AND status IN ('waiting','notified')").bind(text(b.id), u.userId).run();
      return json({ ok: true });
    }
    const restaurantId = text(b.restaurantId), tableNumber = integer(b.tableNumber, 1, 500), guests = integer(b.guests ?? 2, 1, 30);
    const table = await env.DB!.prepare("SELECT t.seats FROM restaurant_tables t JOIN restaurants r ON r.id=t.restaurant_id WHERE t.restaurant_id=? AND t.number=? AND t.active=1 AND r.status='active'").bind(restaurantId, tableNumber).first<{ seats: number }>();
    if (!table) throw new ApiError(404, 'Stol topilmadi.');
    const live = await env.DB!.prepare("SELECT status FROM table_live_status WHERE restaurant_id=? AND table_number=? AND updated_at>=strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes')").bind(restaurantId, tableNumber).first<{ status: string }>();
    if (!live || live.status === 'free') throw new ApiError(409, 'Stol hozir bo‘sh — uni bron qilishingiz mumkin.');
    const mine = await env.DB!.prepare("SELECT id,restaurant_id,table_number FROM waitlist WHERE user_id=? AND status IN ('waiting','notified')").bind(u.userId).all<{ id: string; restaurant_id: string; table_number: number }>();
    const same = mine.results.find((m) => m.restaurant_id === restaurantId && m.table_number === tableNumber);
    if (same) return json({ ok: true, id: same.id, already: true });
    if (mine.results.length >= MAX_ACTIVE_PER_USER) throw new ApiError(400, `Bir vaqtda ko‘pi bilan ${MAX_ACTIVE_PER_USER} ta navbat.`);
    const id = crypto.randomUUID();
    await env.DB!.prepare("INSERT INTO waitlist (id,restaurant_id,table_number,user_id,guests,status,created_at) VALUES (?,?,?,?,?,'waiting',?)").bind(id, restaurantId, tableNumber, u.userId, guests, new Date().toISOString()).run();
    const position = await env.DB!.prepare("SELECT COUNT(*) AS n FROM waitlist WHERE restaurant_id=? AND table_number=? AND status='waiting'").bind(restaurantId, tableNumber).first<{ n: number }>();
    return json({ ok: true, id, position: position?.n ?? 1 }, 201);
  } catch (e) {
    return failure(e);
  }
}
