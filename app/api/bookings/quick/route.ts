import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, body, text, integer, phone, throttle, clientIp } from '../../../http';
import { interval, minutes, endMinuteSQL } from '../../../table-rules';
import { quoteBookingMeals } from '../../../booking-preorder';
import { bookingSlot, seatedWindow, SEATED_MESSAGE } from '../../../booking-rules';
import { notifyBooking, notifyCustomer } from '../../../telegram';
import { otherHold, releaseHolds } from '../../../holds';
import { walkinTables, WALKIN_ONLY } from '../../../hall-layout';
import { ensurePassCode, PASS_PREFIX } from '../../../booking-pass';
import { SIMPLE_MVP_MODE, MVP_CHECKOUT } from '../../../mvp';
export const dynamic = 'force-dynamic';

/*
 * One-click booking for SIMPLE_MVP_MODE (app/mvp.ts): time and guests, with name and phone from Telegram
 * (MVP_CHECKOUT "telegram"; typed in for "guest") — no card binding, online
 * deposit, SMS code or penalty texts. The table rules stay: the restaurant's hours, the table's seats, walk-in
 * tables, tables held or occupied right now and overlapping bookings are all refused as in /api/bookings.
 * Abuse guard instead of the code: same-origin JSON only, at most 5 bookings per phone and 10 per network an
 * hour. The booking is made under the Telegram account (a guest record by phone in "guest" mode).
 * The restaurant gets its Telegram card at once (✅ Tasdiqlash / ❌ Joy band) and the guest a Telegram message
 * with the details and a map link; the restaurant's answer reaches the guest in Telegram too.
 * Demo restaurants run the same checks and answer with a sample pass, but nothing is saved or sent.
 */
export async function POST(request: Request) {
  try {
    if (!SIMPLE_MVP_MODE) throw new ApiError(404, 'Topilmadi.');
    const b = await body(request);
    // Telegram checkout: the signed-in Telegram account gives the name, the phone and the chat.
    const u = await identity().catch(() => null);
    let name = '',
      contact = '';
    if (MVP_CHECKOUT === 'telegram') {
      const acc = u ? await env.DB!.prepare('SELECT name,telegram_chat_id,contact_phone,contact_phone_verified,telegram_phone FROM accounts WHERE id=?').bind(u.userId).first<any>() : null;
      if (!acc?.telegram_chat_id) throw new ApiError(401, 'TELEGRAM_LOGIN');
      contact = (acc.contact_phone_verified && acc.contact_phone) || acc.telegram_phone || '';
      if (!/^\+998\d{9}$/.test(contact)) throw new ApiError(428, 'TELEGRAM_PHONE');
      name = String(acc.name || 'Mijoz').slice(0, 60);
    } else {
      name = text(b.name, 2, 60).replace(/\s+/g, ' ');
      contact = phone(b.phone);
    }
    const restaurantId = text(b.restaurantId),
      date = text(b.date),
      slot = text(b.slot),
      endSlot = text(b.endSlot),
      guests = integer(b.guests, 1, 30),
      tableNumber = integer(b.tableNumber, 1, 50);
    await throttle('quick-booking:ip:' + clientIp(request), 10, 3600000);
    await throttle('quick-booking:phone:' + contact, 5, 3600000);
    bookingSlot(date, slot);
    const [start, end] = interval(slot, endSlot);
    const r = await env.DB!.prepare("SELECT * FROM restaurants WHERE id=? AND status='active'").bind(restaurantId).first<any>();
    if (!r || start < minutes(r.booking_open) || end > minutes(r.booking_close)) throw new ApiError(400, 'Vaqt restoran bron soatlariga mos emas.');
    const table = await env.DB!.prepare('SELECT id,seats FROM restaurant_tables WHERE restaurant_id=? AND number=? AND active=1').bind(restaurantId, tableNumber).first<any>();
    if (table && b.tableId != null && String(b.tableId) !== String(table.id)) throw new ApiError(409, 'Bu stol tanlangan restoranga tegishli emas. Sahifani yangilang.');
    if (!table || guests > table.seats) throw new ApiError(400, 'Stol mavjud emas yoki sig‘imi yetarli emas.');
    if ((await walkinTables(restaurantId)).has(tableNumber)) throw new ApiError(409, WALKIN_ONLY);
    const meals = Array.isArray(b.preorderItems) && b.preorderItems.length ? (await env.DB!.prepare('SELECT id,name,price,available FROM menu WHERE restaurant_id=? AND available=1').bind(restaurantId).all<any>()).results : [];
    const preorder = quoteBookingMeals(b.preorderItems, meals);
    const summary = { restaurant: r.name, table: tableNumber, date, slot, endSlot, guests, name, phone: contact, preorderItems: preorder.items, preorderTotal: preorder.total };
    // Demo: the whole flow on screen, nothing saved or sent.
    if (r.is_demo || restaurantId.startsWith('rf-demo-')) {
      const code = 'DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase();
      return json({ ok: true, demo: true, id: 'demo', passCode: code, passPayload: PASS_PREFIX + code, notified: false, ...summary }, 201);
    }
    let userId = u?.userId || '';
    if (!userId) {
      // Guest record keyed by the phone: the restaurant sees the name and number, nothing else is kept.
      userId = 'guest:' + contact;
      await env.DB!.prepare("INSERT INTO accounts (id,email,name,created_at,role,role_selected,provider,contact_phone) VALUES (?,'',?,?,'customer',1,'guest',?) ON CONFLICT(id) DO UPDATE SET name=excluded.name").bind(userId, name, new Date().toISOString(), contact).run();
    }
    if (await otherHold(restaurantId, [tableNumber], date, start, end, userId)) throw new ApiError(409, 'Bu stolni hozirgina boshqa mijoz tanladi. Boshqa stol tanlang.');
    if (seatedWindow(date, slot) && (await env.DB!.prepare("SELECT 1 FROM table_live_status WHERE restaurant_id=? AND table_number=? AND status='occupied' AND updated_at>=strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes')").bind(restaurantId, tableNumber).first())) throw new ApiError(409, SEATED_MESSAGE);
    const id = crypto.randomUUID();
    const result = await env.DB!.prepare(
      "INSERT INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at,preorder_items,preorder_total,deposit_status,phone_verified,penalty_accepted) SELECT ?,?,?,?,?,?,?,?,?,'pending',?,?,?,'not_required',0,0 WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE restaurant_id=? AND date=? AND (table_number=? OR merged_table=?) AND status IN ('pending','confirmed') AND CAST(substr(slot,1,2) AS INTEGER)*60+CAST(substr(slot,4,2) AS INTEGER)<? AND (" + endMinuteSQL + ')>?)',
    )
      .bind(id, restaurantId, userId, date, slot, endSlot, tableNumber, guests, contact, new Date().toISOString(), JSON.stringify(preorder.items), preorder.total, restaurantId, date, tableNumber, tableNumber, end, start)
      .run();
    if (!result.meta.changes) throw new ApiError(409, 'Bu stol tanlangan vaqtda band. Boshqa vaqt yoki stol tanlang.');
    await releaseHolds(userId).catch(() => null);
    const code = await ensurePassCode(id, null);
    // The restaurant gets the card with Confirm / Cancel at once; a linked customer gets their own message.
    const notified = await notifyBooking(id);
    await notifyCustomer(id, 'created').catch(() => false);
    return json({ ok: true, demo: false, id, passCode: code, passPayload: code ? PASS_PREFIX + code : '', notified, ...summary }, 201);
  } catch (e) {
    return failure(e);
  }
}
