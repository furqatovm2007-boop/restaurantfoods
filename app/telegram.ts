import { env } from 'cloudflare:workers';
import { issueOtp, recentOtps } from './otp-store';

/*
 * Telegram bot.
 *  Restaurants: a restaurant links its chat once (/start CODE from the dashboard deep link); new
 *  bookings are sent there with Confirm / Cancel buttons that act on the booking after checking
 *  the chat still belongs to that restaurant.
 *  Customers: /start c_CODE (from the profile) links the customer's chat; the bot then asks for
 *  the phone via Telegram's own "share contact" button (accepted only for the sender's own number).
 *  The server immediately generates a one-time code and sends it here; the phone becomes verified
 *  only after that code is typed on the site (contact-verify). Linked customers also get later
 *  codes and booking updates here. Only the chat id and the phone are stored. /stop unlinks.
 */
const API = 'https://api.telegram.org/bot';

export const telegramConfigured = () => !!env.TELEGRAM_BOT_TOKEN?.trim();

export async function telegram(method: string, payload: unknown) {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return null;
  try {
    const res = await fetch(API + token + '/' + method, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { ok: boolean; result?: unknown; description?: string };
    if (!data.ok) console.error(JSON.stringify({ event: 'telegram_failed', method, description: String(data.description || '').slice(0, 120) }));
    return data.ok ? data.result : null;
  } catch {
    console.error(JSON.stringify({ event: 'telegram_unreachable', method }));
    return null;
  }
}

export const html = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** +998901234567 → +998 90 123 45 67 */
export function prettyPhone(phone: string) {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : phone;
}

const DEPOSIT_TEXT: Record<string, string> = {
  paid: 'To‘langan',
  pending: 'Kutilmoqda',
  not_required: 'Talab qilinmaydi',
  refunded: 'Qaytarilgan',
  cancelled: 'Bekor qilingan',
};
const STATUS_TEXT: Record<string, string> = { confirmed: '✅ Tasdiqlandi', cancelled: '❌ Bekor qilindi', completed: '☑️ Yakunlandi' };

export interface BookingMessage {
  id: string;
  restaurant_name: string;
  phone: string;
  table_number: number;
  date: string;
  slot: string;
  end_slot: string;
  guests: number;
  deposit_status: string;
  deposit_provider?: string | null;
  status: string;
}

export function bookingText(b: BookingMessage) {
  const provider = b.deposit_status === 'paid' && b.deposit_provider ? ` (${b.deposit_provider === 'payme' ? 'Payme' : 'Click'})` : '';
  const lines = [
    '📌 <b>Yangi Bron!</b>',
    `🏠 <b>Restoran:</b> ${html(b.restaurant_name)}`,
    `👤 <b>Mijoz:</b> ${html(prettyPhone(b.phone))}`,
    `🍽 <b>Stol:</b> ${b.table_number}-stol · ${b.guests} kishi`,
    `📅 <b>Sana:</b> ${html(b.date)}`,
    `🕒 <b>Vaqt:</b> ${html(b.slot)}${b.end_slot ? '–' + html(b.end_slot.slice(0, 5)) : ''}`,
    `💵 <b>Depozit:</b> ${DEPOSIT_TEXT[b.deposit_status] ?? html(b.deposit_status)}${provider}`,
  ];
  if (STATUS_TEXT[b.status]) lines.push('', `<b>${STATUS_TEXT[b.status]}</b>`);
  return lines.join('\n');
}

export const bookingKeyboard = (id: string) => ({
  inline_keyboard: [[{ text: '✅ Tasdiqlash', callback_data: 'b:c:' + id }, { text: '❌ Bekor qilish', callback_data: 'b:x:' + id }]],
});

async function loadBooking(id: string) {
  return env.DB!.prepare(
    'SELECT b.id,b.phone,b.table_number,b.date,b.slot,b.end_slot,b.guests,b.status,b.deposit_status,b.restaurant_id,r.name AS restaurant_name,r.telegram_chat_id,d.provider AS deposit_provider FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id LEFT JOIN deposits d ON d.booking_id=b.id WHERE b.id=?',
  )
    .bind(id)
    .first<BookingMessage & { restaurant_id: string; telegram_chat_id: string | null }>();
}

/** Sends the new-booking card to the restaurant's linked chat. Never throws. */
export async function notifyBooking(id: string) {
  if (!telegramConfigured()) return false;
  try {
    const b = await loadBooking(id);
    if (!b?.telegram_chat_id) return false;
    return !!(await telegram('sendMessage', { chat_id: b.telegram_chat_id, text: bookingText(b), parse_mode: 'HTML', reply_markup: b.status === 'pending' ? bookingKeyboard(b.id) : undefined }));
  } catch {
    return false;
  }
}

const TRANSITIONS: Record<string, Record<string, string>> = { c: { pending: 'confirmed' }, x: { pending: 'cancelled', confirmed: 'cancelled' } };

interface Update {
  message?: { chat: { id: number }; from?: { id: number }; text?: string; contact?: { phone_number: string; user_id?: number } };
  callback_query?: { id: string; data?: string; message?: { chat: { id: number }; message_id: number } };
}

/** Telegram phone ("998901234567" or "+998901234567") → "+998901234567"; null when not Uzbek. */
export function telegramPhone(raw: string) {
  const digits = String(raw || '').replace(/\D/g, '');
  return /^998\d{9}$/.test(digits) ? '+' + digits : null;
}

const CONTACT_KEYBOARD = { keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true };
const REMOVE_KEYBOARD = { remove_keyboard: true };
const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');

/** Sends a one-time code to a customer's linked chat. */
export async function sendTelegramCode(chatId: string, code: string) {
  return !!(await telegram('sendMessage', { chat_id: chatId, text: `🔐 RestaurantFoods tasdiqlash kodi: <b>${code}</b>\nKod 5 daqiqa amal qiladi. Uni hech kimga bermang.`, parse_mode: 'HTML' }));
}

const CUSTOMER_TEXT: Record<string, string> = {
  created: '📌 Broningiz qabul qilindi — restoran tasdiqlashini kuting.',
  confirmed: '✅ Broningiz tasdiqlandi.',
  cancelled: '❌ Broningiz bekor qilindi.',
  no_show: '⚠️ Bron vaqtida kelmaganingiz qayd etildi.',
};

/** Booking update to the customer who made it, when their Telegram is linked. Never throws. */
export async function notifyCustomer(bookingId: string, kind: keyof typeof CUSTOMER_TEXT) {
  if (!telegramConfigured()) return false;
  try {
    const b = await env.DB!.prepare('SELECT b.date,b.slot,b.end_slot,b.table_number,b.guests,r.name AS restaurant_name,r.address,a.telegram_chat_id FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id JOIN accounts a ON a.id=b.user_id WHERE b.id=?').bind(bookingId).first<any>();
    if (!b?.telegram_chat_id) return false;
    const text = [`<b>${CUSTOMER_TEXT[kind]}</b>`, `🏠 ${html(b.restaurant_name)}${b.address ? ' · ' + html(b.address) : ''}`, `📅 ${html(b.date)} · 🕒 ${html(String(b.slot).slice(0, 5))}${b.end_slot ? '–' + html(String(b.end_slot).slice(0, 5)) : ''}`, `🍽 ${b.table_number}-stol · ${b.guests} kishi`].join('\n');
    return !!(await telegram('sendMessage', { chat_id: b.telegram_chat_id, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🧾 Chek va QR chipta', url: site() + '/#/bookings' }]] } }));
  } catch {
    return false;
  }
}

/** "Your table is free" for a customer on the waitlist (10-minute hold). Never throws. */
export async function notifyWaitlist(entryId: string) {
  if (!telegramConfigured()) return false;
  try {
    const w = await env.DB!.prepare('SELECT w.table_number,w.restaurant_id,w.hold_until,r.name AS restaurant_name,a.telegram_chat_id FROM waitlist w JOIN restaurants r ON r.id=w.restaurant_id JOIN accounts a ON a.id=w.user_id WHERE w.id=?').bind(entryId).first<any>();
    if (!w?.telegram_chat_id) return false;
    return !!(await telegram('sendMessage', { chat_id: w.telegram_chat_id, text: `🔔 <b>${html(w.restaurant_name)}: ${w.table_number}-stol bo‘shadi!</b>\nStol 10 daqiqa siz uchun ushlab turiladi — hozir bron qiling.`, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '📅 Bron qilish', url: site() + '/#/restaurant/' + encodeURIComponent(w.restaurant_id) }]] } }));
  } catch {
    return false;
  }
}

/** Customer side of the webhook: /start c_CODE, the shared contact, /stop. Null when not a customer message. */
async function customerUpdate(msg: NonNullable<Update['message']>) {
  const chatId = String(msg.chat.id);
  if (msg.contact) {
    // Telegram sets contact.user_id to the sender only for their own number (the share-contact button).
    if (!msg.from || msg.contact.user_id !== msg.from.id) {
      await telegram('sendMessage', { chat_id: chatId, text: 'Faqat o‘zingizning raqamingizni “📱 Raqamni yuborish” tugmasi bilan yuboring.', reply_markup: CONTACT_KEYBOARD });
      return 'contact_not_own';
    }
    const phone = telegramPhone(msg.contact.phone_number);
    const account = await env.DB!.prepare('SELECT id FROM accounts WHERE telegram_chat_id=?').bind(chatId).first<{ id: string }>();
    if (!account) {
      await telegram('sendMessage', { chat_id: chatId, text: 'Avval saytdagi profilingizdan “Telegram orqali tasdiqlash” tugmasini bosing.', reply_markup: REMOVE_KEYBOARD });
      return 'contact_unlinked';
    }
    if (!phone) {
      await telegram('sendMessage', { chat_id: chatId, text: 'Hozircha faqat O‘zbekiston raqamlari (+998) qabul qilinadi.', reply_markup: REMOVE_KEYBOARD });
      return 'contact_not_uz';
    }
    // Not verified yet: the number is verified only when the code below is typed on the site.
    await env.DB!.prepare('UPDATE accounts SET telegram_phone=? WHERE id=?').bind(phone, account.id).run();
    if ((await recentOtps(account.id)) >= 5) {
      await telegram('sendMessage', { chat_id: chatId, text: 'Juda ko‘p urinish. 10 daqiqadan keyin qayta urinib ko‘ring.', reply_markup: REMOVE_KEYBOARD });
      return 'otp_throttled';
    }
    const { code } = await issueOtp(account.id, phone);
    await telegram('sendMessage', { chat_id: chatId, text: `📱 ${prettyPhone(phone)}\n🔐 Tasdiqlash kodi: <b>${code}</b>\n\nKodni saytdagi maydonga kiriting — raqam shundan keyin tasdiqlanadi. Kod 5 daqiqa amal qiladi, uni hech kimga bermang.`, parse_mode: 'HTML', reply_markup: REMOVE_KEYBOARD });
    return 'code_sent';
  }
  const text = msg.text?.trim() || '';
  if (text === '/stop') {
    const res = await env.DB!.prepare('UPDATE accounts SET telegram_chat_id=NULL WHERE telegram_chat_id=?').bind(chatId).run();
    await telegram('sendMessage', { chat_id: chatId, text: res.meta.changes ? 'Telegram akkauntingizdan uzildi. Qayta ulash uchun saytdagi profilingizga kiring.' : 'Bu chat hech qaysi akkauntga ulanmagan.', reply_markup: REMOVE_KEYBOARD });
    return 'unlinked';
  }
  const code = text.startsWith('/start') ? text.split(/\s+/)[1]?.trim() : '';
  if (!code?.startsWith('c_')) return null;
  const link = /^c_[A-Za-z0-9]{24}$/.test(code) ? await env.DB!.prepare('DELETE FROM telegram_user_links WHERE code=? AND expires_at>? RETURNING user_id').bind(code, Date.now()).first<{ user_id: string }>() : null;
  if (!link) {
    await telegram('sendMessage', { chat_id: chatId, text: 'Havola eskirgan. Saytdagi profilingizdan yangisini oling.' });
    return 'link_expired';
  }
  // One chat per account and one account per chat.
  await env.DB!.prepare('UPDATE accounts SET telegram_chat_id=NULL WHERE telegram_chat_id=? AND id<>?').bind(chatId, link.user_id).run();
  await env.DB!.prepare('UPDATE accounts SET telegram_chat_id=? WHERE id=?').bind(chatId, link.user_id).run();
  await telegram('sendMessage', { chat_id: chatId, text: '👋 RestaurantFoods akkauntingiz ulandi.\nTelefon raqamingizni tasdiqlash uchun pastdagi “📱 Raqamni yuborish” tugmasini bosing.', reply_markup: CONTACT_KEYBOARD });
  return 'customer_linked';
}

/** Handles one webhook update. Returns what was done, for logs and tests. */
export async function handleUpdate(update: Update) {
  const msg = update.message;
  if (msg) {
    const customer = await customerUpdate(msg);
    if (customer) return customer;
  }
  if (msg?.text?.startsWith('/start')) {
    const code = msg.text.split(/\s+/)[1]?.trim();
    const chatId = String(msg.chat.id);
    if (!code || !/^[A-Za-z0-9]{8,32}$/.test(code)) {
      await telegram('sendMessage', { chat_id: chatId, text: 'RestaurantFoods: restoran kabinetidagi “Telegram’ni ulash” tugmasi orqali kiring.' });
      return 'start_without_code';
    }
    const link = await env.DB!.prepare('DELETE FROM telegram_links WHERE code=? AND expires_at>? RETURNING restaurant_id').bind(code, Date.now()).first<{ restaurant_id: string }>();
    if (!link) {
      await telegram('sendMessage', { chat_id: chatId, text: 'Havola eskirgan. Kabinetdan yangisini oling.' });
      return 'link_expired';
    }
    const r = await env.DB!.prepare('UPDATE restaurants SET telegram_chat_id=? WHERE id=? RETURNING name').bind(chatId, link.restaurant_id).first<{ name: string }>();
    await telegram('sendMessage', { chat_id: chatId, text: `✅ ${r?.name ?? 'Restoran'} ulandi. Yangi bronlar shu yerga keladi.` });
    return 'linked';
  }

  const cb = update.callback_query;
  if (cb?.data && cb.message) {
    const [, op, id] = cb.data.split(':');
    const answer = (text: string) => telegram('answerCallbackQuery', { callback_query_id: cb.id, text });
    const b = id ? await loadBooking(id) : null;
    // Only the chat linked to the booking's restaurant may act on it.
    if (!b || !TRANSITIONS[op] || b.telegram_chat_id !== String(cb.message.chat.id)) {
      await answer('Ruxsat yo‘q yoki bron topilmadi.');
      return 'denied';
    }
    const next = TRANSITIONS[op][b.status];
    if (!next) {
      await answer('Holat allaqachon o‘zgargan.');
      return 'stale';
    }
    const result = await env.DB!.prepare('UPDATE bookings SET status=? WHERE id=? AND status=?').bind(next, b.id, b.status).run();
    if (!result.meta.changes) {
      await answer('Holat allaqachon o‘zgargan.');
      return 'stale';
    }
    if (next === 'cancelled') await env.DB!.prepare("UPDATE deposits SET state='cancelled' WHERE booking_id=? AND state='pending'").bind(b.id).run();
    if (next === 'cancelled' && b.deposit_status === 'pending') await env.DB!.prepare("UPDATE bookings SET deposit_status='cancelled' WHERE id=?").bind(b.id).run();
    await telegram('editMessageText', { chat_id: cb.message.chat.id, message_id: cb.message.message_id, text: bookingText({ ...b, status: next, deposit_status: next === 'cancelled' && b.deposit_status === 'pending' ? 'cancelled' : b.deposit_status }), parse_mode: 'HTML' });
    await answer(next === 'confirmed' ? 'Tasdiqlandi' : 'Bekor qilindi');
    await notifyCustomer(b.id, next as 'confirmed' | 'cancelled');
    return next;
  }
  return 'ignored';
}
