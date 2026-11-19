import { env } from 'cloudflare:workers';
import { telegram, html, restaurantChats, customerLines } from './telegram';
import { bookingStartMs } from './booking-rules';
import { groupLine, parseGroup } from './table-group';

/*
 * Guest cancellation & anti-spam (SIMPLE_MVP_MODE, site "Profil / Bronlarim" and the bot's "Mening bronlarim"):
 *  - a guest cancels up to 1 hour before the start: the booking becomes "cancelled" at once (the table is free
 *    on the hall map again, every availability query counts only pending/confirmed) and the restaurant gets
 *    "⚠️ Bron bekor qilindi! …" in Telegram; in the last hour only the restaurant can cancel (its phone shown);
 *  - every self-cancel is a strike on the phone number and on the guest's Telegram chat; 2 strikes within 7
 *    days stop 1-click booking for that phone / chat (with the central card prepayment on, they may still book
 *    by paying in advance — app/p2p.ts);
 *  - a fake payment receipt bans the phone and the chat for good.
 * Kept in app_settings (no migration): strike:ph:<phone> / strike:tg:<chat> = JSON list of times,
 * ban:ph:<phone> / ban:tg:<chat> = when and why.
 */
export const SELF_CANCEL_MS = 60 * 60000;
export const STRIKE_WINDOW_MS = 7 * 86400000;
export const STRIKE_LIMIT = 2;
export const STRIKE_MESSAGE = 'Siz ketma-ket 2 marta bronni bekor qilganingiz uchun cheklov qo‘yildi.';
export const BAN_MESSAGE = 'Bu raqam yoki Telegram akkaunt orqali bron qilish bloklangan. Savollar bo‘lsa, restoran bilan bog‘laning.';
export const tooLateText = (phone: string) => `Bron vaqtiga 1 soatdan kam qoldi. Bekor qilish uchun restoran admini bilan bog‘laning: ${phone || 'restoran telefoni'}`;

export const guestKeys = (phone: string | null | undefined, chats: (string | null | undefined)[] = []) => [
  ...(phone ? ['ph:' + phone] : []),
  ...[...new Set(chats.filter((c): c is string => !!c && /^-?\d{1,20}$/.test(c)))].map((c) => 'tg:' + c),
];
const setting = async (key: string) => (await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key).first<{ value: string }>())?.value ?? null;
const save = (key: string, value: string) =>
  env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'policy') ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(key, value, new Date().toISOString()).run();
const times = (raw: string | null, now: number) => {
  try {
    return (JSON.parse(raw || '[]') as number[]).filter((t) => typeof t === 'number' && now - t < STRIKE_WINDOW_MS);
  } catch {
    return [];
  }
};

/** Cancellations in the last 7 days for each key (the highest counts). */
export async function strikeCount(keys: string[], now = Date.now()) {
  let n = 0;
  for (const k of keys) n = Math.max(n, times(await setting('strike:' + k), now).length);
  return n;
}
export const restricted = async (keys: string[], now = Date.now()) => (await strikeCount(keys, now)) >= STRIKE_LIMIT;
export async function addStrike(keys: string[], now = Date.now()) {
  for (const k of keys) await save('strike:' + k, JSON.stringify([...times(await setting('strike:' + k), now), now]));
}
export async function banned(keys: string[]) {
  for (const k of keys) if (await setting('ban:' + k)) return true;
  return false;
}
export async function ban(keys: string[], reason: string) {
  for (const k of keys) await save('ban:' + k, JSON.stringify({ at: new Date().toISOString(), reason }));
}

const CHAT = "COALESCE(NULLIF(a.telegram_chat_id,''),bc.value)";
export interface GuestBooking {
  id: string;
  user_id: string;
  date: string;
  slot: string;
  table_number: number;
  guests: number;
  status: string;
  deposit_status: string;
  phone: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_phone: string | null;
  customer_name: string | null;
  customer_chat: string | null;
  customer_username: string | null;
  group_tables?: string | null;
}
export const loadGuestBooking = (id: string) =>
  env.DB!.prepare(
    `SELECT b.id,b.user_id,b.date,b.slot,b.table_number,b.guests,b.status,b.deposit_status,b.phone,b.restaurant_id,r.name AS restaurant_name,r.phone AS restaurant_phone,a.name AS customer_name,${CHAT} AS customer_chat,u.value AS customer_username,gm.value AS group_tables FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id LEFT JOIN app_settings gm ON gm.key='grpm:'||b.id LEFT JOIN accounts a ON a.id=b.user_id LEFT JOIN app_settings bc ON bc.key='bookchat:'||b.id LEFT JOIN app_settings u ON u.key='tguser:'||${CHAT} WHERE b.id=?`,
  )
    .bind(id)
    .first<GuestBooking>();

export const canSelfCancel = (b: Pick<GuestBooking, 'date' | 'slot'>, now = Date.now()) => bookingStartMs(b.date, String(b.slot).slice(0, 5)) - now > SELF_CANCEL_MS;

/** The restaurant's alert; not sent for a booking it never saw (prepayment still waiting / under review). */
export async function tellRestaurantCancelled(b: GuestBooking) {
  if (b.deposit_status === 'p2p_wait' || b.deposit_status === 'p2p_review') return;
  const name = b.customer_name && !b.customer_name.startsWith('guest:') ? b.customer_name : 'Mijoz';
  const text = [
    `⚠️ <b>Bron bekor qilindi!</b> Mijoz: ${html(name)} (${html(b.phone)}), ${groupLine(parseGroup(b.group_tables))?.replace(/^🪑 /, '') || 'Stol #' + b.table_number}, Vaqt: ${html(String(b.slot).slice(0, 5))}. Stol yana bo‘sh.`,
    `🏠 ${html(b.restaurant_name)} · 📅 ${html(b.date)}`,
    customerLines(b)[2],
  ].join('\n');
  for (const chat_id of await restaurantChats(b.restaurant_id)) await telegram('sendMessage', { chat_id, text, parse_mode: 'HTML' });
}

export type CancelResult = { ok: true } | { ok: false; reason: 'not_found' | 'too_late'; phone?: string };
/**
 * The guest cancels their own booking: the site account (userId) or the Telegram chat that owns it. More than
 * 1 hour before the start only; a strike is recorded on the phone and the chat; the restaurant is told.
 */
export async function cancelByGuest(id: string, who: { userId?: string; chatId?: string }, now = Date.now()): Promise<CancelResult> {
  const b = await loadGuestBooking(id);
  const mine = !!b && ((!!who.userId && b.user_id === who.userId) || (!!who.chatId && b.customer_chat === who.chatId));
  if (!b || !mine || !['pending', 'confirmed'].includes(b.status)) return { ok: false, reason: 'not_found' };
  if (!canSelfCancel(b, now)) return { ok: false, reason: 'too_late', phone: b.restaurant_phone || '' };
  const res = await env.DB!.prepare("UPDATE bookings SET status='cancelled',deposit_status=CASE WHEN deposit_status IN ('pending','p2p_wait','p2p_review') THEN 'cancelled' ELSE deposit_status END WHERE id=? AND status IN ('pending','confirmed')").bind(id).run();
  if (!res.meta.changes) return { ok: false, reason: 'not_found' };
  await env.DB!.prepare("UPDATE deposits SET state='cancelled' WHERE booking_id=? AND state='pending'").bind(id).run();
  await addStrike(guestKeys(b.phone, [b.customer_chat]), now);
  await tellRestaurantCancelled(b).catch(() => null);
  return { ok: true };
}
