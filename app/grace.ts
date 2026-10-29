import { env } from 'cloudflare:workers';
import { ApiError } from './http';
import { telegram, html, notifyCustomer } from './telegram';
import { chargePenalty, NO_SHOW_PENALTY } from './penalties';
import { notifyNext } from './waitlist';
import { GRACE_MIN } from './hall-layout';

/*
 * Online guests vs walk-in guests at the door (hostess panel, public/hall-pos.js).
 *  - Grace period: a booked table is kept for GRACE_MIN minutes after the booking starts. After that, if
 *    the guest has not arrived (no QR check-in, no bill opened), the hostess may release it to a walk-in
 *    guest: the booking becomes a no-show (the usual count and penalty rules) and the hall's waiting list
 *    is told the table is free. A guest who confirmed through Call AI is released only on a second,
 *    explicit confirmation.
 *  - Virtual wait with a coffee bonus: when the booked guest has arrived but the table is still being
 *    prepared, the hostess sends one Telegram message per booking — "about 5 minutes" plus a coupon for a
 *    free drink at the bar. The coupon code is kept so it is sent once and the bar can check it.
 */
export { GRACE_MIN };
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const coupon = () => 'KOFE-' + Array.from(crypto.getRandomValues(new Uint8Array(4)), (v) => ABC[v % ABC.length]).join('');
const startOf = (b: { date: string; slot: string }) => Date.parse(b.date + 'T' + String(b.slot).slice(0, 5) + ':00+05:00');

async function activeBooking(restaurantId: string, bookingId: string) {
  const b = await env.DB!.prepare('SELECT b.*,a.name AS customer_name,a.telegram_chat_id,r.name AS restaurant_name FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id LEFT JOIN accounts a ON a.id=b.user_id WHERE b.id=? AND b.restaurant_id=?').bind(bookingId, restaurantId).first<any>();
  if (!b) throw new ApiError(404, 'Bu restoranda bunday bron yo‘q.');
  if (!['pending', 'confirmed'].includes(b.status)) throw new ApiError(409, 'Bron faol emas.');
  return b;
}

/** Releases a booked table to walk-in guests once the grace period is over and the guest has not arrived. */
export async function releaseBooking(restaurantId: string, bookingId: string, force = false, now = Date.now()) {
  const b = await activeBooking(restaurantId, bookingId);
  if (b.checked_in_at) throw new ApiError(409, 'Mijoz kelgan (QR yoki hisob ochilgan) — stolni bo‘shatib bo‘lmaydi.');
  const open = await env.DB!.prepare("SELECT 1 FROM table_orders WHERE booking_id=? AND status='open'").bind(b.id).first();
  if (open) throw new ApiError(409, 'Bu bron bo‘yicha hisob ochilgan — mijoz zalda.');
  if (now < startOf(b) + GRACE_MIN * 60000) throw new ApiError(409, `Bron boshlanganidan ${GRACE_MIN} daqiqa o‘tgach bo‘shatish mumkin.`);
  if (b.call_status === 'confirmed' && !force) throw new ApiError(428, 'Mijoz Call AI orqali kelishini tasdiqlagan. Baribir bo‘shatish uchun qayta tasdiqlang.');
  const changed = await env.DB!.prepare("UPDATE bookings SET status='no_show' WHERE id=? AND status IN ('pending','confirmed') AND checked_in_at IS NULL").bind(b.id).run();
  if (!changed.meta.changes) throw new ApiError(409, 'Holat allaqachon o‘zgargan.');
  await env.DB!.prepare('UPDATE accounts SET no_show_count=no_show_count+1 WHERE id=?').bind(b.user_id).run();
  await chargePenalty(b.id, 'no_show', NO_SHOW_PENALTY).catch(() => null);
  await notifyCustomer(b.id, 'no_show').catch(() => false);
  // Guests waiting for this table (smart waitlist) hear it is free.
  for (const t of [b.table_number, b.merged_table].filter((x) => x != null)) await notifyNext(restaurantId, Number(t)).catch(() => false);
  return { ok: true, table: b.table_number };
}

/** "☕ 5 daqiqa kutish + Kofe bonusi": one Telegram message per booking with a free-drink coupon. */
export async function coffeeBonus(restaurantId: string, bookingId: string, by: string) {
  const b = await activeBooking(restaurantId, bookingId);
  if (!b.telegram_chat_id) throw new ApiError(409, 'Mijoz Telegram’ga ulanmagan — bonusni og‘zaki ayting.');
  const key = 'coffee:' + b.id;
  const sent = await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key).first<{ value: string }>();
  if (sent) throw new ApiError(409, 'Kofe bonusi bu bronga allaqachon yuborilgan: ' + (JSON.parse(sent.value).code || ''));
  const code = coupon();
  const name = String(b.customer_name || '').split(/\s+/)[0] || 'Hurmatli mehmon';
  const ok = await telegram('sendMessage', {
    chat_id: b.telegram_chat_id,
    text: `☕ <b>${html(name)}, stolingiz tayyorlanmoqda!</b>\nIltimos, taxminan 5 daqiqa kuting — ${html(b.restaurant_name)} jamoasi joyingizni hozirlayapti.\n\n🎁 Kutganingiz uchun bar hisobidan <b>bepul ichimlik</b>: kupon <code>${code}</code>\nKuponni barmen yoki ofitsiantga ko‘rsating.`,
    parse_mode: 'HTML',
  });
  if (!ok) throw new ApiError(502, 'Telegram xabari yetkazilmadi. Bonusni og‘zaki ayting.');
  await env.DB!.prepare('INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,?) ON CONFLICT(key) DO NOTHING').bind(key, JSON.stringify({ code, table: b.table_number }), new Date().toISOString(), by).run();
  return { ok: true, code };
}
