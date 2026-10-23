import { env } from 'cloudflare:workers';
import { authConfig } from './auth-service';
import { planState } from './plans';
import { telegram, telegramConfigured, html } from './telegram';

/*
 * Call AI (Premium only): two hours before a booking the assistant "calls" the customer in their
 * linked Telegram chat — a spoken voice note (OpenAI TTS through the Edge Function) plus the same
 * question as text with Yes / No buttons. The customer answers with a button, a word or a voice
 * reply (transcribed). "Yes" confirms the booking; "No", no answer within NO_ANSWER_MINUTES or no
 * reachable chat is reported to the restaurant at once (Telegram chat + dashboard badge).
 * Runs from the Worker's cron trigger (runCallAi) every few minutes.
 */
export const CALL_LEAD_MINUTES = 120;
export const NO_ANSWER_MINUTES = 20;
type Lang = 'uz' | 'ru' | 'en';

const TEXT = {
  uz: {
    ask: (name: string) => `Salom ${name}, RestaurantFoods orqali qilgan broningizga 2 soat qoldi. Kelishingizni tasdiqlaysizmi?`,
    yes: '✅ Ha, kelaman',
    no: '❌ Kela olmayman',
    thanks: 'Rahmat! Broningiz tasdiqlandi — sizni kutamiz. 🙌',
    sorry: 'Tushundim, restoranga xabar berdim. Bronni bekor qilish uchun restoranga qo‘ng‘iroq qiling (2 soatdan kam qolganda kelishilgan jarima qo‘llanadi).',
    unclear: 'Kechirasiz, tushunmadim. “Ha” yoki “Yo‘q” deb javob bering yoki tugmani bosing.',
  },
  ru: {
    ask: (name: string) => `Здравствуйте, ${name}! До вашей брони через RestaurantFoods осталось 2 часа. Подтверждаете, что придёте?`,
    yes: '✅ Да, приду',
    no: '❌ Не смогу',
    thanks: 'Спасибо! Бронь подтверждена — ждём вас. 🙌',
    sorry: 'Понял, сообщил ресторану. Чтобы отменить бронь, позвоните в ресторан (менее чем за 2 часа действует согласованный штраф).',
    unclear: 'Извините, не понял. Ответьте «Да» или «Нет» или нажмите кнопку.',
  },
  en: {
    ask: (name: string) => `Hello ${name}, your RestaurantFoods booking starts in 2 hours. Can you confirm you are coming?`,
    yes: '✅ Yes, I’m coming',
    no: '❌ I can’t come',
    thanks: 'Thank you! Your booking is confirmed — see you soon. 🙌',
    sorry: 'Understood, I have told the restaurant. To cancel, phone the restaurant (the agreed penalty applies less than 2 hours before).',
    unclear: 'Sorry, I didn’t catch that. Reply “Yes” or “No”, or tap a button.',
  },
} as const;

/** Yes / no / unknown from a short reply in Uzbek, Russian or English. Negatives are checked first. */
export function parseAnswer(raw: string): 'yes' | 'no' | null {
  const t = ' ' + String(raw || '').toLowerCase().replace(/[‘’ʻʼ`']/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim() + ' ';
  if (/ (yo'?q|yoq|kelmayman|kela olmayman|kelolmayman|bormayman|bora olmayman|bekor|нет|не приду|не смогу|не буду|отмен\p{L}*|no|nope|cancel|can't|cannot|not coming) /u.test(t)) return 'no';
  if (/ (ha|xa|haa|hа|albatta|kelaman|boraman|tasdiqlayman|tasdiq|ok|okay|да|приду|буду|подтверждаю|конечно|yes|yeah|yep|sure|coming|confirm) /u.test(t)) return 'yes';
  return null;
}

const lang = (v: unknown): Lang => (v === 'ru' || v === 'en' ? v : 'uz');

/** Edge Function voice for server-side use; needs RF_PROXY_SECRET in the Worker and in Supabase. */
async function serviceVoice(payload: Record<string, unknown>) {
  const c = authConfig();
  if (!c.url || !c.key || !c.proxy) return null;
  try {
    const res = await fetch(c.url + '/functions/v1/restaurantfoods-ai', { method: 'POST', headers: { apikey: c.key, Authorization: 'Bearer ' + c.key, 'Content-Type': 'application/json', 'X-RF-Proxy': c.proxy, 'X-RF-Service': 'call' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(26000) });
    if (!res.ok) return null;
    return (await res.json()) as { audio?: string; mimeType?: string; transcript?: string };
  } catch {
    return null;
  }
}

async function sendVoice(chatId: string, base64: string) {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return false;
  const form = new FormData();
  form.set('chat_id', chatId);
  form.set('voice', new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], { type: 'audio/ogg' }), 'call.ogg');
  try {
    const res = await fetch('https://api.telegram.org/bot' + token + '/sendVoice', { method: 'POST', body: form, signal: AbortSignal.timeout(15000) });
    return ((await res.json()) as { ok?: boolean }).ok === true;
  } catch {
    return false;
  }
}

interface CallRow {
  id: string;
  date: string;
  slot: string;
  table_number: number;
  guests: number;
  phone: string;
  status: string;
  call_status: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_chat: string | null;
  plan: string | null;
  trial_ends_at: string | null;
  paid_until: string | null;
  restaurant_status: string;
  customer_name: string;
  customer_chat: string | null;
  customer_lang: string | null;
}
const SELECT =
  'SELECT b.id,b.date,b.slot,b.table_number,b.guests,b.phone,b.status,b.call_status,b.restaurant_id,r.name AS restaurant_name,r.telegram_chat_id AS restaurant_chat,r.plan,r.trial_ends_at,r.paid_until,r.status AS restaurant_status,a.name AS customer_name,a.telegram_chat_id AS customer_chat,a.preferred_language AS customer_lang FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id LEFT JOIN accounts a ON a.id=b.user_id ';

export const callAiEnabled = (r: Pick<CallRow, 'plan' | 'trial_ends_at' | 'paid_until' | 'restaurant_status'>) => r.restaurant_status === 'active' && planState(r).features.callAi;

const REPORT: Record<string, string> = {
  confirmed: '✅ <b>Call AI:</b> mijoz kelishini tasdiqladi.',
  declined: '❌ <b>Call AI:</b> mijoz kela olmasligini aytdi. Bekor qilish va jarima — kabinetda “Bekor qilish va jarimani yechish”.',
  no_answer: '⚠️ <b>Call AI:</b> mijoz ' + NO_ANSWER_MINUTES + ' daqiqa ichida javob bermadi. Mijozga o‘zingiz qo‘ng‘iroq qiling.',
  unreachable: '⚠️ <b>Call AI:</b> mijozning Telegrami ulanmagan — tasdiqlash qo‘ng‘irog‘i yuborilmadi. Mijozga o‘zingiz qo‘ng‘iroq qiling.',
};

/** Tells the restaurant's linked Telegram chat; the dashboard shows the same call_status badge. */
async function report(b: CallRow, outcome: keyof typeof REPORT) {
  if (!b.restaurant_chat || !telegramConfigured()) return;
  await telegram('sendMessage', { chat_id: b.restaurant_chat, parse_mode: 'HTML', text: `${REPORT[outcome]}\n🏠 ${html(b.restaurant_name)} · ${b.table_number}-stol · ${b.guests} kishi\n📅 ${html(b.date)} ${html(String(b.slot).slice(0, 5))}\n📞 ${html(b.phone)}` });
}

/** Places one confirmation call. Returns the new call_status. */
export async function callBooking(b: CallRow) {
  const now = new Date().toISOString();
  if (!b.customer_chat || !telegramConfigured()) {
    const res = await env.DB!.prepare("UPDATE bookings SET call_status='unreachable',call_sent_at=? WHERE id=? AND call_status IN ('','no_answer','unreachable')").bind(now, b.id).run();
    if (res.meta.changes) await report(b, 'unreachable');
    return 'unreachable';
  }
  // Claimed first so two cron runs never call twice.
  const claimed = await env.DB!.prepare("UPDATE bookings SET call_status='calling',call_sent_at=?,call_answered_at=NULL WHERE id=? AND call_status IN ('','no_answer','unreachable')").bind(now, b.id).run();
  if (!claimed.meta.changes) return b.call_status;
  const l = lang(b.customer_lang),
    t = TEXT[l],
    name = (b.customer_name || '').split(/\s+/)[0] || 'mehmon';
  const question = t.ask(name);
  const voice = await serviceVoice({ mode: 'call_speech', lang: l, text: question });
  if (voice?.audio && voice.mimeType === 'audio/ogg') await sendVoice(b.customer_chat, voice.audio);
  const sent = await telegram('sendMessage', { chat_id: b.customer_chat, parse_mode: 'HTML', text: `📞 <b>${html(question)}</b>\n🏠 ${html(b.restaurant_name)} · ${b.table_number}-stol\n🕒 ${html(b.date)} ${html(String(b.slot).slice(0, 5))}`, reply_markup: { inline_keyboard: [[{ text: t.yes, callback_data: 'cc:y:' + b.id }, { text: t.no, callback_data: 'cc:n:' + b.id }]] } });
  if (!sent) {
    await env.DB!.prepare("UPDATE bookings SET call_status='unreachable' WHERE id=?").bind(b.id).run();
    await report(b, 'unreachable');
    return 'unreachable';
  }
  return 'calling';
}

/** Cron entry: calls bookings that start within 2 hours, then closes calls nobody answered. */
export async function runCallAi(nowMs = Date.now()) {
  const due = await env.DB!.prepare(SELECT + "WHERE b.status IN ('pending','confirmed') AND b.call_status='' AND b.date BETWEEN date(?,'unixepoch','+5 hours','-1 day') AND date(?,'unixepoch','+5 hours','+1 day') LIMIT 200").bind(Math.floor(nowMs / 1000), Math.floor(nowMs / 1000)).all<CallRow>();
  let called = 0;
  for (const b of due.results) {
    const left = (Date.parse(b.date + 'T' + String(b.slot).slice(0, 5) + ':00+05:00') - nowMs) / 60000;
    // Inside the 2-hour window but not in the last 15 minutes (too late to be useful).
    if (left > CALL_LEAD_MINUTES || left < 15 || !callAiEnabled(b)) continue;
    await callBooking(b);
    called++;
  }
  const stale = await env.DB!.prepare(SELECT + "WHERE b.call_status='calling' AND b.call_sent_at<? LIMIT 200").bind(new Date(nowMs - NO_ANSWER_MINUTES * 60000).toISOString()).all<CallRow>();
  for (const b of stale.results) {
    const res = await env.DB!.prepare("UPDATE bookings SET call_status='no_answer' WHERE id=? AND call_status='calling'").bind(b.id).run();
    if (res.meta.changes) await report(b, 'no_answer');
  }
  return { called, noAnswer: stale.results.length };
}

async function answer(b: CallRow, verdict: 'yes' | 'no', chatId: string) {
  const t = TEXT[lang(b.customer_lang)];
  const now = new Date().toISOString();
  if (verdict === 'yes') {
    await env.DB!.prepare("UPDATE bookings SET call_status='confirmed',call_answered_at=?,status=CASE WHEN status='pending' THEN 'confirmed' ELSE status END WHERE id=? AND status IN ('pending','confirmed')").bind(now, b.id).run();
    await telegram('sendMessage', { chat_id: chatId, text: t.thanks });
    await report(b, 'confirmed');
    return 'call_confirmed';
  }
  await env.DB!.prepare("UPDATE bookings SET call_status='declined',call_answered_at=? WHERE id=?").bind(now, b.id).run();
  await telegram('sendMessage', { chat_id: chatId, text: t.sorry });
  await report(b, 'declined');
  return 'call_declined';
}

async function transcribeVoice(fileId: string, l: Lang) {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const file = (await telegram('getFile', { file_id: fileId })) as { file_path?: string; file_size?: number } | null;
  if (!token || !file?.file_path || (file.file_size ?? 0) > 400000) return '';
  try {
    const bytes = new Uint8Array(await (await fetch('https://api.telegram.org/file/bot' + token + '/' + file.file_path, { signal: AbortSignal.timeout(10000) })).arrayBuffer());
    let raw = '';
    for (let i = 0; i < bytes.length; i += 8192) raw += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return (await serviceVoice({ mode: 'call_transcribe', lang: l, audio: { mimeType: 'audio/ogg', data: btoa(raw) } }))?.transcript || '';
  } catch {
    return '';
  }
}

interface Update {
  message?: { chat: { id: number }; text?: string; voice?: { file_id: string; duration?: number } };
  callback_query?: { id: string; data?: string; message?: { chat: { id: number }; message_id: number } };
}

/**
 * Webhook hook: answers to an open confirmation call (buttons, text or voice). Returns null when
 * the update is not a call answer, so the regular bot handles it.
 */
export async function handleCallReply(update: Update) {
  const cb = update.callback_query;
  if (cb?.data?.startsWith('cc:') && cb.message) {
    const [, op, id] = cb.data.split(':');
    const chatId = String(cb.message.chat.id);
    const b = await env.DB!.prepare(SELECT + 'WHERE b.id=?').bind(id || '').first<CallRow>();
    // Only the customer's own chat may answer, and only while the booking is active.
    if (!b || b.customer_chat !== chatId || !['pending', 'confirmed'].includes(b.status) || !['calling', 'no_answer'].includes(b.call_status)) {
      await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: '—' });
      return 'call_denied';
    }
    await telegram('answerCallbackQuery', { callback_query_id: cb.id });
    await telegram('editMessageReplyMarkup', { chat_id: chatId, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
    return answer(b, op === 'y' ? 'yes' : 'no', chatId);
  }
  const msg = update.message;
  if (!msg || (!msg.voice && !msg.text) || msg.text?.startsWith('/')) return null;
  const chatId = String(msg.chat.id);
  const b = await env.DB!.prepare(SELECT + "WHERE a.telegram_chat_id=? AND b.call_status IN ('calling','no_answer') AND b.status IN ('pending','confirmed') ORDER BY b.call_sent_at DESC LIMIT 1").bind(chatId).first<CallRow>();
  if (!b) return null;
  const text = msg.voice ? ((msg.voice.duration ?? 0) <= 30 ? await transcribeVoice(msg.voice.file_id, lang(b.customer_lang)) : '') : msg.text || '';
  const verdict = parseAnswer(text);
  if (!verdict) {
    await telegram('sendMessage', { chat_id: chatId, text: TEXT[lang(b.customer_lang)].unclear });
    return 'call_unclear';
  }
  return answer(b, verdict, chatId);
}

/** Manual "call now" from the dashboard (Premium). */
export async function callNow(bookingId: string) {
  const b = await env.DB!.prepare(SELECT + "WHERE b.id=? AND b.status IN ('pending','confirmed')").bind(bookingId).first<CallRow>();
  if (!b) return null;
  if (!callAiEnabled(b)) return 'plan';
  return callBooking(b);
}
