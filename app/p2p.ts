import { env } from 'cloudflare:workers';
import { ApiError } from './http';
import { telegram, html, notifyBooking, customerLines } from './telegram';
import { adminChats } from './health';
import { CENTRAL_PAYMENT_CARD, CENTRAL_PAYMENT_HOLDER, SUPER_ADMIN_TG_ID } from './mvp';
import { imageContent } from './image-content';
import { ban, guestKeys, loadGuestBooking, type GuestBooking } from './guest-policy';

/*
 * Prepayment by card transfer to ONE central card (SIMPLE_MVP_MODE), checked by hand by the site owner:
 *  1. the quick booking holds the table (status pending, deposit_status "p2p_wait") for 30 minutes and shows
 *     the card, the holder and the exact amount; the restaurant is NOT told yet;
 *  2. the guest uploads the receipt screenshot: the same image (SHA-256) is never accepted twice; it goes as a
 *     photo to the owner's Telegram (SUPER_ADMIN_TG_ID, else the admin chats) with the amount, the order time,
 *     restaurant, table, guest and dishes, and three buttons; deposit_status becomes "p2p_review";
 *  3. ✅ Pul tushdi → confirmed + "p2p_paid", the restaurant gets the booking card ("Oldindan to‘lov markaziy
 *     hisobga qabul qilindi") and the guest a Telegram message; ⚠️ Chek noaniq → the guest is asked for a clear
 *     receipt (30 more minutes); 🚫 Soxta chek → the booking is cancelled and the phone + Telegram are banned.
 * No migration: the details live in app_settings (p2p:<bookingId>, p2phash:<sha256>).
 */
export const P2P_HOLD_MS = 30 * 60000;
export const DUPLICATE_RECEIPT = 'Bu chek rasmi avval ishlatilgan! Iltimos, yangi to‘lov chekini yuklang.';
const MAX_BYTES = 5 * 1024 * 1024;

export function p2pCard() {
  const card = (env.CENTRAL_PAYMENT_CARD?.trim() || CENTRAL_PAYMENT_CARD).replace(/\s+/g, ' ');
  return { card, holder: env.CENTRAL_PAYMENT_HOLDER?.trim() || CENTRAL_PAYMENT_HOLDER, ready: /^\d{4} ?\d{4} ?\d{4} ?\d{4}$/.test(card) };
}
export async function ownerChats() {
  const own = env.SUPER_ADMIN_TG_ID?.trim() || SUPER_ADMIN_TG_ID;
  return own ? [own] : await adminChats();
}
/** On only with a real card number and a chat that can verify receipts. */
export const p2pEnabled = async () => p2pCard().ready && (await ownerChats()).length > 0;

interface P2PState {
  amount: number;
  until: number;
  createdAt: number;
  hash?: string;
}
const key = (id: string) => 'p2p:' + id;
export async function p2pState(id: string): Promise<P2PState | null> {
  const row = await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key(id)).first<{ value: string }>();
  try {
    return row ? (JSON.parse(row.value) as P2PState) : null;
  } catch {
    return null;
  }
}
const saveState = (id: string, s: P2PState) =>
  env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'p2p') ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(key(id), JSON.stringify(s), new Date().toISOString()).run();

/** Called by the quick booking right after the insert (deposit_status already "p2p_wait"). */
export async function startP2P(id: string, amount: number, now = Date.now()) {
  await saveState(id, { amount, until: now + P2P_HOLD_MS, createdAt: now });
  return paymentInfo(amount, now + P2P_HOLD_MS);
}
export const paymentInfo = (amount: number, until: number) => {
  const c = p2pCard();
  return { card: c.card, holder: c.holder, amount, until: new Date(until).toISOString() };
};

const money = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const hhmm = (ms: number) => new Date(ms + 5 * 3600000).toISOString().slice(11, 16);
function dishes(raw: string | null | undefined) {
  try {
    return (JSON.parse(raw || '[]') as { name?: string; quantity?: number }[]).map((d) => `${d.name} × ${d.quantity}`).join(', ');
  } catch {
    return '';
  }
}
export function ownerCaption(b: GuestBooking & { preorder_items?: string | null; end_slot?: string | null }, amount: number, now: number) {
  const name = b.customer_name && !b.customer_name.startsWith('guest:') ? b.customer_name : 'Mijoz';
  const meals = dishes(b.preorder_items);
  return [
    '🧾 <b>Yangi to‘lov cheki</b>',
    `💰 Kutilayotgan summa: <b>${money(amount)} UZS</b>`,
    `🕒 Zakaz vaqti: <b>${hhmm(now)}</b> (chekdagi vaqt bilan solishtiring!)`,
    `🏪 Restoran: <b>${html(b.restaurant_name)}</b> | Stol #${b.table_number}`,
    `👤 Mijoz: ${html(name)} (${html(b.phone)})`,
    customerLines(b)[2],
    `📅 Bron: ${html(b.date)} · ${html(String(b.slot).slice(0, 5))}${b.end_slot ? '–' + html(String(b.end_slot).slice(0, 5)) : ''} · ${b.guests} kishi`,
    meals ? `🍽 Taomlar: ${html(meals)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
export const ownerKeyboard = (id: string) => ({
  inline_keyboard: [[{ text: '✅ Pul tushdi (Tasdiqlash)', callback_data: 'pp:ok:' + id }], [{ text: '⚠️ Chek noaniq (Qayta so‘rash)', callback_data: 'pp:re:' + id }], [{ text: '🚫 Soxta chek (Bloklash)', callback_data: 'pp:ban:' + id }]],
});

async function sendPhoto(chatId: string, bytes: Uint8Array, type: string, caption: string, reply_markup: unknown) {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return false;
  const form = new FormData();
  form.set('chat_id', chatId);
  form.set('caption', caption.slice(0, 1024));
  form.set('parse_mode', 'HTML');
  form.set('reply_markup', JSON.stringify(reply_markup));
  form.set('photo', new Blob([bytes as Uint8Array<ArrayBuffer>], { type }), 'receipt.' + (type.split('/')[1] || 'jpg'));
  try {
    const res = await fetch('https://api.telegram.org/bot' + token + '/sendPhoto', { method: 'POST', body: form, signal: AbortSignal.timeout(15000) });
    return ((await res.json()) as { ok?: boolean }).ok === true;
  } catch {
    return false;
  }
}

async function readImage(request: Request) {
  if (Number(request.headers.get('content-length')) > MAX_BYTES) throw new ApiError(413, 'Rasm 5 MB dan kichik bo‘lsin.');
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (!bytes.length) throw new ApiError(400, 'Chek rasmi yuborilmadi.');
  if (bytes.length > MAX_BYTES) throw new ApiError(413, 'Rasm 5 MB dan kichik bo‘lsin.');
  const content = imageContent(bytes);
  if (!content) throw new ApiError(400, 'Rasm ochilmadi. Chekning JPG yoki PNG skrinshotini tanlang.');
  return { bytes, type: content.type };
}
export const sha256Hex = async (bytes: Uint8Array) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>)), (v) => v.toString(16).padStart(2, '0')).join('');

/** The guest's receipt for their own booking (the booking's account = this browser's session). */
export async function submitReceipt(id: string, userId: string, request: Request, now = Date.now()) {
  const b = await env.DB!.prepare('SELECT b.user_id,b.status,b.deposit_status,b.preorder_items,b.end_slot FROM bookings b WHERE b.id=?').bind(id).first<{ user_id: string; status: string; deposit_status: string; preorder_items: string | null; end_slot: string | null }>();
  if (!b || b.user_id !== userId || b.status !== 'pending') throw new ApiError(404, 'Bron topilmadi.');
  if (b.deposit_status === 'p2p_review') throw new ApiError(409, 'Chek allaqachon yuborilgan — tekshirilmoqda.');
  const state = await p2pState(id);
  if (b.deposit_status !== 'p2p_wait' || !state) throw new ApiError(409, 'Bu bron uchun to‘lov kutilmayapti.');
  if (state.until < now) throw new ApiError(410, 'To‘lov vaqti tugadi — bron bekor qilindi. Qaytadan bron qiling.');
  const { bytes, type } = await readImage(request);
  const hash = await sha256Hex(bytes);
  // The same picture is accepted once, for any booking.
  const fresh = await env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'p2p') ON CONFLICT(key) DO NOTHING").bind('p2phash:' + hash, id, new Date(now).toISOString()).run();
  if (!fresh.meta.changes) throw new ApiError(409, DUPLICATE_RECEIPT);
  const full = await loadGuestBooking(id);
  if (!full) throw new ApiError(404, 'Bron topilmadi.');
  const caption = ownerCaption({ ...full, preorder_items: b.preorder_items, end_slot: b.end_slot }, state.amount, now);
  let sent = false;
  for (const chat of await ownerChats()) if (await sendPhoto(chat, bytes, type, caption, ownerKeyboard(id))) sent = true;
  if (!sent) {
    await env.DB!.prepare('DELETE FROM app_settings WHERE key=?').bind('p2phash:' + hash).run();
    throw new ApiError(503, 'Chekni hozir yuborib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.');
  }
  await env.DB!.prepare("UPDATE bookings SET deposit_status='p2p_review' WHERE id=? AND deposit_status='p2p_wait'").bind(id).run();
  await saveState(id, { ...state, hash });
  return { ok: true, status: 'p2p_review' };
}

const customerText = {
  ok: '✅ To‘lovingiz tasdiqlandi va stolingiz band qilindi!',
  again: '⚠️ To‘lov cheki noaniq. Summa va vaqt aniq ko‘rinadigan chekni qayta yuklang: saytda “👤 Profil / Bronlarim” → “🧾 Chekni yuklash” (30 daqiqa ichida).',
  fake: '🚫 To‘lov cheki tasdiqlanmadi, bron bekor qilindi.',
};
/** The owner's buttons under a receipt; only the owner's chats may press them. Null for other updates. */
export async function handleP2P(update: any): Promise<string | null> {
  const cb = update?.callback_query;
  if (typeof cb?.data !== 'string' || !cb.data.startsWith('pp:') || !cb.message) return null;
  const [, op, id] = cb.data.split(':');
  const chatId = String(cb.message.chat.id);
  const answer = (text = '') => telegram('answerCallbackQuery', { callback_query_id: cb.id, ...(text ? { text } : {}) });
  if (!(await ownerChats()).includes(chatId) || !['ok', 're', 'ban'].includes(op) || !id) {
    await answer('Ruxsat yo‘q.');
    return 'p2p_denied';
  }
  const b = await loadGuestBooking(id);
  if (!b || b.status !== 'pending' || b.deposit_status !== 'p2p_review') {
    await answer('Holat allaqachon o‘zgargan.');
    return 'p2p_stale';
  }
  const done = async (label: string) => {
    await answer(label);
    const caption = String(cb.message.caption || '');
    await telegram('editMessageCaption', { chat_id: chatId, message_id: cb.message.message_id, caption: (caption + '\n\n' + label).slice(0, 1024), reply_markup: { inline_keyboard: [] } });
  };
  const toGuest = (text: string) => (b.customer_chat ? telegram('sendMessage', { chat_id: b.customer_chat, text }) : null);
  if (op === 'ok') {
    const res = await env.DB!.prepare("UPDATE bookings SET status='confirmed',deposit_status='p2p_paid' WHERE id=? AND status='pending' AND deposit_status='p2p_review'").bind(id).run();
    if (!res.meta.changes) return (await answer('Holat allaqachon o‘zgargan.'), 'p2p_stale');
    await done('✅ Tasdiqlandi — restoranga yuborildi');
    await notifyBooking(id);
    await toGuest(customerText.ok);
    return 'p2p_confirmed';
  }
  if (op === 're') {
    const state = await p2pState(id);
    await env.DB!.prepare("UPDATE bookings SET deposit_status='p2p_wait' WHERE id=? AND deposit_status='p2p_review'").bind(id).run();
    if (state) await saveState(id, { ...state, until: Date.now() + P2P_HOLD_MS });
    await done('⚠️ Mijozdan aniq chek so‘raldi');
    await toGuest(customerText.again);
    return 'p2p_again';
  }
  await env.DB!.prepare("UPDATE bookings SET status='cancelled',deposit_status='p2p_fake' WHERE id=? AND deposit_status='p2p_review'").bind(id).run();
  const account = await env.DB!.prepare('SELECT telegram_chat_id FROM accounts WHERE id=?').bind(b.user_id).first<{ telegram_chat_id: string | null }>();
  await ban(guestKeys(b.phone, [b.customer_chat, account?.telegram_chat_id]), 'fake_receipt:' + id);
  await done('🚫 Soxta chek — bron bekor qilindi, raqam va Telegram bloklandi');
  await toGuest(customerText.fake);
  return 'p2p_banned';
}

/** Cron: a table held for a transfer that never came (no receipt in time) is released. */
export async function sweepP2P(now = Date.now()) {
  const rows = (await env.DB!.prepare("SELECT b.id,s.value FROM bookings b JOIN app_settings s ON s.key='p2p:'||b.id WHERE b.status='pending' AND b.deposit_status='p2p_wait' LIMIT 300").all<{ id: string; value: string }>()).results;
  let released = 0;
  for (const r of rows) {
    let until = 0;
    try {
      until = Number(JSON.parse(r.value).until) || 0;
    } catch {}
    if (until && until < now) {
      const res = await env.DB!.prepare("UPDATE bookings SET status='cancelled',deposit_status='cancelled' WHERE id=? AND status='pending' AND deposit_status='p2p_wait'").bind(r.id).run();
      released += res.meta.changes ? 1 : 0;
    }
  }
  return { released };
}
