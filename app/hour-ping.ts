import { env } from 'cloudflare:workers';
import { telegram, html, restaurantChats, customerLines } from './telegram';
import { chatLang, type Lang } from './bot-i18n';

/*
 * One hour before the table (every restaurant, no SMS): the bot asks the guest in Telegram "Kelasizmi?" with
 * "✅ Ha, yo‘ldaman" / "❌ Bekor qilish". The answer goes to the restaurant's chats at once, with the guest's
 * Telegram profile and phone; "Bekor qilish" frees the table. Only guests whose Telegram chat is known get it
 * (booked through Telegram, or took the booking with the t.me link). Sent once per booking (app_settings
 * "ping1h:<id>": sent → yes / no), from the Worker's cron every 5 minutes; skipped for demo restaurants and
 * for bookings the Premium Call AI already settled.
 */
export const PING_LEAD_MINUTES = 60;
const WINDOW = [48, 66]; // minutes before the start: the 5-minute cron always lands inside once

const TEXT: Record<Lang, { ask: (r: string) => string; when: (slot: string, n: number) => string; yes: string; no: string; thanks: string; cancelled: string; gone: string }> = {
  uz: {
    ask: (r) => `${r} restoranidagi stolingizga 1 soat qoldi. Kelasizmi?`,
    when: (slot, n) => `🕒 ${slot} · 🍽 ${n}-stol`,
    yes: '✅ Ha, yo‘ldaman',
    no: '❌ Bekor qilish',
    thanks: '✅ Rahmat! Restoranga xabar berdik — sizni kutishmoqda. 🙌',
    cancelled: '❌ Bron bekor qilindi, restoranga xabar berdik.',
    gone: 'Bu bron endi faol emas.',
  },
  ru: {
    ask: (r) => `До вашего столика в ресторане ${r} остался 1 час. Вы придёте?`,
    when: (slot, n) => `🕒 ${slot} · 🍽 стол ${n}`,
    yes: '✅ Да, уже еду',
    no: '❌ Отменить',
    thanks: '✅ Спасибо! Мы сообщили ресторану — вас ждут. 🙌',
    cancelled: '❌ Бронь отменена, ресторан предупреждён.',
    gone: 'Эта бронь уже не активна.',
  },
  en: {
    ask: (r) => `Your table at ${r} is in 1 hour. Are you coming?`,
    when: (slot, n) => `🕒 ${slot} · 🍽 table ${n}`,
    yes: '✅ Yes, on my way',
    no: '❌ Cancel',
    thanks: '✅ Thank you! We told the restaurant — they are expecting you. 🙌',
    cancelled: '❌ Booking cancelled, the restaurant has been told.',
    gone: 'This booking is no longer active.',
  },
};

interface PingRow {
  id: string;
  date: string;
  slot: string;
  table_number: number;
  guests: number;
  status: string;
  phone: string;
  restaurant_id: string;
  restaurant_name: string;
  customer_name: string | null;
  customer_chat: string | null;
  customer_username: string | null;
  call_status: string | null;
  is_demo: number | null;
  ping: string | null;
}
const CHAT = "COALESCE(NULLIF(a.telegram_chat_id,''),bc.value)";
const SELECT = `SELECT b.id,b.date,b.slot,b.table_number,b.guests,b.status,b.phone,b.restaurant_id,b.call_status,r.name AS restaurant_name,r.is_demo,a.name AS customer_name,${CHAT} AS customer_chat,u.value AS customer_username,p.value AS ping FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id LEFT JOIN accounts a ON a.id=b.user_id LEFT JOIN app_settings bc ON bc.key='bookchat:'||b.id LEFT JOIN app_settings u ON u.key='tguser:'||${CHAT} LEFT JOIN app_settings p ON p.key='ping1h:'||b.id `;
const setPing = (id: string, value: string, only?: string) =>
  only
    ? env.DB!.prepare("UPDATE app_settings SET value=?,updated_at=? WHERE key=? AND value=?").bind(value, new Date().toISOString(), 'ping1h:' + id, only).run()
    : env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'bot') ON CONFLICT(key) DO NOTHING").bind('ping1h:' + id, value, new Date().toISOString()).run();

export async function runHourPing(nowMs = Date.now()) {
  const sec = Math.floor(nowMs / 1000);
  const due = await env.DB!.prepare(SELECT + "WHERE b.status IN ('pending','confirmed') AND p.value IS NULL AND b.date BETWEEN date(?,'unixepoch','+5 hours','-1 day') AND date(?,'unixepoch','+5 hours','+1 day') LIMIT 300").bind(sec, sec).all<PingRow>();
  let sent = 0;
  for (const b of due.results) {
    const left = (Date.parse(b.date + 'T' + String(b.slot).slice(0, 5) + ':00+05:00') - nowMs) / 60000;
    if (left < WINDOW[0] || left > WINDOW[1] || !b.customer_chat || b.is_demo || b.restaurant_id.startsWith('rf-demo-')) continue;
    if (b.call_status === 'confirmed' || b.call_status === 'declined') continue;
    // Claimed first, so two overlapping cron runs never send it twice.
    if (!(await setPing(b.id, 'sent')).meta.changes) continue;
    const t = TEXT[await chatLang(b.customer_chat)];
    const ok = await telegram('sendMessage', {
      chat_id: b.customer_chat,
      text: `⏰ ${t.ask(b.restaurant_name)}\n${t.when(String(b.slot).slice(0, 5), b.table_number)}`,
      reply_markup: { inline_keyboard: [[{ text: t.yes, callback_data: 'hp:y:' + b.id }, { text: t.no, callback_data: 'hp:n:' + b.id }]] },
    });
    if (ok) sent++;
  }
  return { sent };
}

const restaurantText = (b: PingRow, yes: boolean) =>
  [
    yes ? '✅ <b>Mijoz yo‘lda</b> (1 soatlik eslatmaga javob)' : '❌ <b>Mijoz bronni bekor qildi</b> (1 soatlik eslatmaga javob) — stol bo‘shadi',
    `🏠 ${html(b.restaurant_name)} · 🍽 ${b.table_number}-stol · ${b.guests} kishi`,
    `📅 ${html(b.date)} · 🕒 ${html(String(b.slot).slice(0, 5))}`,
    ...customerLines(b),
  ].join('\n');

/** "✅ Ha, yo‘ldaman" / "❌ Bekor qilish" from the guest's chat; null for any other update. */
export async function handleHourPing(update: any): Promise<string | null> {
  const cb = update?.callback_query;
  if (typeof cb?.data !== 'string' || !cb.data.startsWith('hp:') || !cb.message) return null;
  const [, op, id] = cb.data.split(':');
  const chatId = String(cb.message.chat.id);
  const b = id ? await env.DB!.prepare(SELECT + 'WHERE b.id=?').bind(id).first<PingRow>() : null;
  const t = TEXT[await chatLang(chatId)];
  // Only the guest's own chat, once, while the booking is active.
  if (!b || b.customer_chat !== chatId || (op !== 'y' && op !== 'n')) {
    await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: '—' });
    return 'ping_denied';
  }
  if (!['pending', 'confirmed'].includes(b.status) || b.ping !== 'sent' || !(await setPing(b.id, op === 'y' ? 'yes' : 'no', 'sent')).meta.changes) {
    await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: t.gone });
    return 'ping_stale';
  }
  await telegram('answerCallbackQuery', { callback_query_id: cb.id });
  if (op === 'n') {
    await env.DB!.prepare("UPDATE bookings SET status='cancelled',deposit_status=CASE WHEN deposit_status='pending' THEN 'cancelled' ELSE deposit_status END WHERE id=? AND status IN ('pending','confirmed')").bind(b.id).run();
    await env.DB!.prepare("UPDATE deposits SET state='cancelled' WHERE booking_id=? AND state='pending'").bind(b.id).run();
  }
  await telegram('editMessageReplyMarkup', { chat_id: chatId, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
  await telegram('sendMessage', { chat_id: chatId, text: op === 'y' ? t.thanks : t.cancelled });
  for (const chat_id of await restaurantChats(b.restaurant_id)) await telegram('sendMessage', { chat_id, text: restaurantText(b, op === 'y'), parse_mode: 'HTML' });
  return op === 'y' ? 'ping_yes' : 'ping_no';
}
