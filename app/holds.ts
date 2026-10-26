import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * Seat hold: a customer who picked a free table and went on to the next step (dishes, confirmation) keeps
 * it for HOLD_MS. Other customers see the table busy for that time range and cannot book over it; the
 * holder's own booking goes through and removes the hold. One hold per customer at a time.
 */
export const HOLD_MS = 5 * 60000;
const startSQL = 'CAST(substr(slot,1,2) AS INTEGER)*60+CAST(substr(slot,4,2) AS INTEGER)';
const endSQL = 'CAST(substr(end_slot,1,2) AS INTEGER)*60+CAST(substr(end_slot,4,2) AS INTEGER)';
const minutes = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5));

/** Another customer's live hold on these tables overlapping start–end (minutes), or null. */
export function otherHold(restaurantId: string, tables: number[], date: string, start: number, end: number, userId: string, now = Date.now()) {
  const [a, b] = [tables[0], tables[1] ?? tables[0]];
  return env.DB!.prepare(`SELECT id,expires_at FROM table_holds WHERE restaurant_id=? AND date=? AND expires_at>? AND user_id<>? AND (table_number IN (?,?) OR merged_table IN (?,?)) AND ${startSQL}<? AND ${endSQL}>? LIMIT 1`)
    .bind(restaurantId, date, now, userId, a, b, a, b, end, start)
    .first<{ id: string; expires_at: number }>();
}

/** Live holds of a day, as busy ranges for the hall map (the viewer's own hold is left out). */
export async function holdsFor(restaurantId: string, date: string, exceptUser: string | null, now = Date.now()) {
  const rows = (await env.DB!.prepare('SELECT table_number,merged_table,slot,end_slot,user_id FROM table_holds WHERE restaurant_id=? AND date=? AND expires_at>?').bind(restaurantId, date, now).all<any>()).results;
  return rows
    .filter((h) => h.user_id !== exceptUser)
    .flatMap((h) => [h.table_number, h.merged_table].filter((t) => t != null).map((t) => ({ table_number: t, slot: h.slot, end_slot: h.end_slot, held: true })));
}

export async function placeHold(restaurantId: string, userId: string, tables: number[], date: string, slot: string, endSlot: string, now = Date.now()) {
  await env.DB!.prepare('DELETE FROM table_holds WHERE expires_at<=?').bind(now).run();
  const [start, end] = [minutes(slot), minutes(endSlot)];
  const [a, b] = [tables[0], tables[1] ?? tables[0]];
  const real = await env.DB!.prepare("SELECT COUNT(DISTINCT t.number) AS n FROM restaurant_tables t JOIN restaurants r ON r.id=t.restaurant_id WHERE t.restaurant_id=? AND r.status='active' AND t.active=1 AND t.number IN (?,?)")
    .bind(restaurantId, a, b)
    .first<{ n: number }>();
  if (Number(real?.n) !== new Set(tables).size) throw new ApiError(404, 'Stol topilmadi.');
  const booked = await env.DB!.prepare(`SELECT 1 FROM bookings WHERE restaurant_id=? AND date=? AND (table_number IN (?,?) OR merged_table IN (?,?)) AND status IN ('pending','confirmed') AND ${startSQL}<? AND (CASE WHEN end_slot<>'' THEN ${endSQL} ELSE ${startSQL}+120 END)>? LIMIT 1`)
    .bind(restaurantId, date, a, b, a, b, end, start)
    .first();
  if (booked) throw new ApiError(409, 'Bu stol tanlangan vaqtda band. Boshqa stol yoki vaqt tanlang.');
  if (await otherHold(restaurantId, tables, date, start, end, userId, now)) throw new ApiError(409, 'Bu stolni hozirgina boshqa mijoz tanladi — u 5 daqiqa ushlab turiladi. Boshqa stol tanlang.');
  await env.DB!.prepare('DELETE FROM table_holds WHERE user_id=?').bind(userId).run();
  const expiresAt = now + HOLD_MS;
  await env.DB!.prepare('INSERT INTO table_holds (id,restaurant_id,table_number,merged_table,date,slot,end_slot,user_id,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(), restaurantId, a, tables[1] ?? null, date, slot, endSlot, userId, expiresAt, now).run();
  return expiresAt;
}

export const releaseHolds = (userId: string) => env.DB!.prepare('DELETE FROM table_holds WHERE user_id=?').bind(userId).run();
