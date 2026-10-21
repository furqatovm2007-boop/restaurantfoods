import { env } from 'cloudflare:workers';

/*
 * Telegram booking notifications. A restaurant links its chat once (/start CODE from the
 * dashboard deep link); new bookings are sent there with Confirm / Cancel buttons that act
 * on the booking after checking the chat still belongs to that restaurant.
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

const html = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
  message?: { chat: { id: number }; text?: string };
  callback_query?: { id: string; data?: string; message?: { chat: { id: number }; message_id: number } };
}

/** Handles one webhook update. Returns what was done, for logs and tests. */
export async function handleUpdate(update: Update) {
  const msg = update.message;
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
    return next;
  }
  return 'ignored';
}
