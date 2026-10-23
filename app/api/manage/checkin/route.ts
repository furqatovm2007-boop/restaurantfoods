import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, body, throttle } from '../../../http';
import { parsePass, receiptNumber } from '../../../booking-pass';
import { restaurantAccess } from '../../../staff';
import { planState } from '../../../plans';
import { guestDossier, trackSeats } from '../../../growth';
export const dynamic = 'force-dynamic';

const tashkentToday = () => new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);

/*
 * Door check-in by QR pass. Staff scan the guest's pass: without `confirm` the booking is shown;
 * with `confirm` it is marked arrived (checked_in_at) and the table becomes "occupied" on the live
 * map (a staff mark, so the camera does not override it for 20 minutes).
 */
export async function POST(request: Request) {
  try {
    const b = await body(request);
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    await throttle('checkin:' + u.userId, 120);
    const code = parsePass(b.code);
    if (!code) throw new ApiError(400, 'QR kod RestaurantFoods broniga tegishli emas.');
    const row = await env.DB!.prepare('SELECT b.*,r.name AS restaurant_name,r.owner_id,a.name AS customer_name,a.no_show_count FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id LEFT JOIN accounts a ON a.id=b.user_id WHERE b.pass_code=?').bind(code).first<any>();
    if (!row) throw new ApiError(404, 'Bu restoranda bunday bron yo‘q.');
    // Owner, admin or any staff member of this restaurant (hostess included).
    const access = await restaurantAccess(row.restaurant_id, u, 'hostess').catch(() => null);
    if (!access) throw new ApiError(404, 'Bu restoranda bunday bron yo‘q.');
    const warnings: string[] = [];
    if (!['pending', 'confirmed'].includes(row.status)) warnings.push('Bron faol emas: ' + row.status);
    if (row.date !== tashkentToday()) warnings.push('Bron sanasi bugun emas: ' + row.date);
    if (row.checked_in_at) warnings.push('Mijoz allaqachon kelgan deb belgilangan.');
    const view = { id: row.id, receiptNo: receiptNumber(row), restaurant: row.restaurant_name, date: row.date, slot: row.slot, endSlot: row.end_slot, table: row.table_number, guests: row.guests, status: row.status, customer: String(row.customer_name || '').split(' ')[0], noShowCount: row.no_show_count || 0, checkedInAt: row.checked_in_at, mergedTable: row.merged_table, warnings, guest: planState(access.r).features.vipGuests && row.user_id ? await guestDossier(row.restaurant_id, row.user_id) : null };
    if (b.confirm !== true) return json({ booking: view });
    if (!['pending', 'confirmed'].includes(row.status)) throw new ApiError(409, 'Bron faol emas.');
    const now = new Date().toISOString();
    await env.DB!.batch([
      env.DB!.prepare("UPDATE bookings SET checked_in_at=COALESCE(checked_in_at,?),status='confirmed' WHERE id=?").bind(now, row.id),
      env.DB!.prepare("INSERT INTO table_live_status (restaurant_id,table_number,status,source,confidence,updated_at,since) VALUES (?,?,'occupied','manual',1,?,?) ON CONFLICT(restaurant_id,table_number) DO UPDATE SET since=CASE WHEN table_live_status.status='occupied' THEN COALESCE(table_live_status.since,excluded.since) ELSE excluded.since END,status='occupied',source='manual',confidence=1,updated_at=excluded.updated_at").bind(row.restaurant_id, row.table_number, now, now),
    ]);
    await trackSeats(row.restaurant_id, [row.table_number]);
    return json({ ok: true, booking: { ...view, status: 'confirmed', checkedInAt: row.checked_in_at || now } });
  } catch (e) {
    return failure(e);
  }
}
