import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, body, text, integer, phone, throttle, clientIp } from '../../../http';
import { intlPhone } from '../../../phone-codes';
import { banned, restricted, guestKeys, BAN_MESSAGE, STRIKE_MESSAGE } from '../../../guest-policy';
import { p2pEnabled, startP2P } from '../../../p2p';
import { DEPOSIT_MIN } from '../../../deposits';
import { addGroupTables, GROUP_MAX_TABLES } from '../../../table-group';
import { interval, minutes, endMinuteSQL } from '../../../table-rules';
import { quoteBookingMeals } from '../../../booking-preorder';
import { bookingSlot, seatedWindow, SEATED_MESSAGE } from '../../../booking-rules';
import { notifyBooking, notifyCustomer } from '../../../telegram';
import { otherHold, releaseHolds } from '../../../holds';
import { walkinTables, WALKIN_ONLY } from '../../../hall-layout';
import { ensurePassCode, PASS_PREFIX } from '../../../booking-pass';
import { SIMPLE_MVP_MODE, MVP_CHECKOUT } from '../../../mvp';
import { botUsername, issueSession } from '../../../telegram-login';
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
      // The number that works now: typed over the Telegram one when that SIM is off (+998 XX XXX XX XX only).
      const typedPhone = typeof b.phone === 'string' && b.phone.trim() ? phone(b.phone.replace(/[\s()-]/g, '')) : '';
      contact = typedPhone || (acc.contact_phone_verified && acc.contact_phone) || acc.telegram_phone || '';
      if (!/^\+998\d{9}$/.test(contact)) throw new ApiError(428, 'TELEGRAM_PHONE');
      name = String(acc.name || 'Mijoz').slice(0, 60);
    } else {
      name = text(b.name, 2, 60).replace(/\s+/g, ' ');
      // E.164 from the checkout's country selector (+998 and the tourists' countries, app/phone-codes.ts).
      contact = intlPhone(typeof b.phone === 'string' ? b.phone.replace(/[\s()-]/g, '') : b.phone);
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
    // Several tables in one reservation (app/table-group.ts): the others come as extraTables [{number,id}].
    const extraRaw = Array.isArray(b.extraTables) ? b.extraTables.slice(0, GROUP_MAX_TABLES) : [];
    if (Array.isArray(b.extraTables) && b.extraTables.length > GROUP_MAX_TABLES - 1) throw new ApiError(400, `Bir bronda ko‘pi bilan ${GROUP_MAX_TABLES} ta stol.`);
    const extras: { id: string; number: number; seats: number }[] = [];
    for (const x of extraRaw) {
      const n = integer(x?.number, 1, 50);
      if (n === tableNumber || extras.some((e) => e.number === n)) throw new ApiError(400, 'Bir stol ikki marta tanlangan.');
      const t = await env.DB!.prepare('SELECT id,seats FROM restaurant_tables WHERE restaurant_id=? AND number=? AND active=1').bind(restaurantId, n).first<any>();
      if (!t || (x?.id != null && String(x.id) !== String(t.id))) throw new ApiError(409, `Stol #${n} bu restoranga tegishli emas. Sahifani yangilang.`);
      extras.push({ id: String(t.id), number: n, seats: Number(t.seats) || 0 });
    }
    const seatsTotal = (Number(table?.seats) || 0) + extras.reduce((s, t) => s + t.seats, 0);
    if (!table || guests > seatsTotal) throw new ApiError(400, extras.length ? `Tanlangan stollarda jami ${seatsTotal} o‘rin bor — mehmonlar sonini kamaytiring yoki yana stol qo‘shing.` : 'Stol mavjud emas yoki sig‘imi yetarli emas.');
    const walkins = await walkinTables(restaurantId);
    if (walkins.has(tableNumber) || extras.some((t) => walkins.has(t.number))) throw new ApiError(409, WALKIN_ONLY);
    const meals = Array.isArray(b.preorderItems) && b.preorderItems.length ? (await env.DB!.prepare('SELECT id,name,price,available FROM menu WHERE restaurant_id=? AND available=1').bind(restaurantId).all<any>()).results : [];
    const preorder = quoteBookingMeals(b.preorderItems, meals);
    const tablesAll = [tableNumber, ...extras.map((t) => t.number)];
    const summary = { restaurant: r.name, table: tableNumber, tables: tablesAll, seatsTotal, date, slot, endSlot, guests, name, phone: contact, preorderItems: preorder.items, preorderTotal: preorder.total };
    // Demo: the whole flow on screen, nothing saved or sent.
    if (r.is_demo || restaurantId.startsWith('rf-demo-')) {
      const code = 'DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase();
      return json({ ok: true, demo: true, id: 'demo', passCode: code, passPayload: PASS_PREFIX + code, notified: false, ...summary }, 201);
    }
    // Anti-spam (app/guest-policy.ts): a banned phone / Telegram never books; 2 own cancellations in 7 days stop
    // 1-click booking — with the central card on, such a guest may still book by paying in advance.
    const tgChat = u ? (await env.DB!.prepare('SELECT telegram_chat_id FROM accounts WHERE id=?').bind(u.userId).first<{ telegram_chat_id: string | null }>())?.telegram_chat_id : null;
    const keys = guestKeys(contact, [tgChat]);
    if (await banned(keys)) throw new ApiError(403, BAN_MESSAGE);
    const strike = await restricted(keys);
    const prepay = await p2pEnabled();
    if (strike && !prepay) throw new ApiError(403, STRIKE_MESSAGE);
    // Prepayment to the central card (app/p2p.ts). The bill: the pre-ordered dishes (or the deposit itself when
    // nothing is ordered). The least the guest may send now: the restaurant's deposit, 100 000 after strikes,
    // else 100 000 or the whole bill when it is smaller — the guest picks full or an advance. 0 = no payment.
    // Several tables: the default advance grows with them (100 000 × tables).
    const required = Math.max(Number(r.deposit_amount) || 0, strike ? DEPOSIT_MIN : 0, extras.length ? DEPOSIT_MIN * tablesAll.length : 0);
    const amount = prepay ? Math.max(preorder.total, required) : 0;
    const minDeposit = Math.min(amount, Math.max(required, DEPOSIT_MIN));
    let userId = u?.userId || '';
    if (!userId) {
      /*
       * A guest record of this browser (not of the phone number: the number is not verified, so another
       * browser typing the same number never sees these bookings). The browser gets a site session (HttpOnly
       * cookie, 30 days, only the hash kept), so "👤 Profil / Bronlarim" shows the bookings without a password;
       * signing in with Telegram later moves them to that account (app/telegram-login.ts adoptGuest).
       */
      userId = 'guest:' + crypto.randomUUID();
      await env.DB!.prepare("INSERT INTO accounts (id,email,name,created_at,role,role_selected,provider,contact_phone) VALUES (?,'',?,?,'customer',1,'guest',?)").bind(userId, name, new Date().toISOString(), contact).run();
    } else if (userId.startsWith('guest:')) {
      await env.DB!.prepare('UPDATE accounts SET name=?,contact_phone=? WHERE id=?').bind(name, contact, userId).run();
    }
    if (await otherHold(restaurantId, tablesAll, date, start, end, userId)) throw new ApiError(409, 'Bu stolni hozirgina boshqa mijoz tanladi. Boshqa stol tanlang.');
    if (seatedWindow(date, slot) && (await env.DB!.prepare("SELECT 1 FROM table_live_status WHERE restaurant_id=? AND table_number IN (SELECT value FROM json_each(?)) AND status='occupied' AND updated_at>=strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes')").bind(restaurantId, JSON.stringify(tablesAll)).first())) throw new ApiError(409, SEATED_MESSAGE);
    const id = crypto.randomUUID();
    const result = await env.DB!.prepare(
      "INSERT INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at,preorder_items,preorder_total,deposit_status,phone_verified,penalty_accepted) SELECT ?,?,?,?,?,?,?,?,?,'pending',?,?,?,?,0,0 WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE restaurant_id=? AND date=? AND (table_number=? OR merged_table=?) AND status IN ('pending','confirmed') AND CAST(substr(slot,1,2) AS INTEGER)*60+CAST(substr(slot,4,2) AS INTEGER)<? AND (" + endMinuteSQL + ')>?)',
    )
      .bind(id, restaurantId, userId, date, slot, endSlot, tableNumber, guests, contact, new Date().toISOString(), JSON.stringify(preorder.items), preorder.total, amount ? 'p2p_wait' : 'not_required', restaurantId, date, tableNumber, tableNumber, end, start)
      .run();
    if (!result.meta.changes) throw new ApiError(409, 'Bu stol tanlangan vaqtda band. Boshqa vaqt yoki stol tanlang.');
    if (extras.length) {
      const group = await addGroupTables({ id, restaurantId, userId, date, slot, endSlot, guests, phone: contact, status: 'pending', createdAt: new Date().toISOString() }, extras, [{ number: tableNumber, seats: Number(table.seats) || 0 }, ...extras]);
      if (!group) throw new ApiError(409, 'Tanlangan stollardan biri shu vaqtda band bo‘lib qoldi. Zalni yangilab, boshqa stol tanlang.');
    }
    await releaseHolds(userId).catch(() => null);
    if (!u) await issueSession(userId);
    const code = await ensurePassCode(id, null);
    const bot = botUsername();
    const telegramLink = bot ? `https://t.me/${bot}?start=book_${id}` : '';
    if (amount) {
      // Held for the transfer: the restaurant hears about it only after the receipt is approved.
      const payment = await startP2P(id, amount, minDeposit);
      return json({ ok: true, demo: false, id, passCode: code, passPayload: code ? PASS_PREFIX + code : '', notified: false, telegramLink, payment, restricted: strike ? STRIKE_MESSAGE + ' Oldindan to‘lov bilan bron qilishingiz mumkin.' : '', ...summary }, 201);
    }
    // The restaurant gets the card with Confirm / Cancel at once; a linked customer gets their own message.
    const notified = await notifyBooking(id);
    await notifyCustomer(id, 'created').catch(() => false);
    // One tap to get the booking (and later the restaurant's answer) in Telegram: telegramLink above.
    return json({ ok: true, demo: false, id, passCode: code, passPayload: code ? PASS_PREFIX + code : '', notified, telegramLink, ...summary }, 201);
  } catch (e) {
    return failure(e);
  }
}
