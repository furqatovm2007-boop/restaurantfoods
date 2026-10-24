import { env } from 'cloudflare:workers';
import { authConfig } from './auth-service';
import { planState } from './plans';
import { telegram, telegramConfigured, html } from './telegram';
import { aiHeaders } from './ai-key';
import { fallbackIntent } from './ai-fallback';

/*
 * Call AI (Premium only): two hours before a booking the assistant calls the customer, free of charge:
 *  - Telegram: a spoken voice note (OpenAI TTS through the Edge Function) and the question with three
 *    buttons — "answer the AI operator" (opens the live web call /call-ai/:id), "Yes" and "No";
 *  - web call: /call-ai/:id rings like a phone call; the AI asks, listens (speech recognition) and
 *    confirms; signed-in customers also get the ringing overlay on the site;
 *  - a real phone call when VAPI_API_KEY (+ assistant and phone number ids) or CALL_AI_WEBHOOK_URL is
 *    configured — the provider reports the answer back to /api/call-ai/hook.
 * "Yes" confirms the booking; "No" or no answer within NO_ANSWER_MINUTES is reported to the
 * restaurant at once (Telegram chat + dashboard badge). Runs from the Worker's cron trigger.
 */
export const CALL_LEAD_MINUTES = 120;
export const NO_ANSWER_MINUTES = 20;
type Lang = 'uz' | 'ru' | 'en';

const TEXT = {
  uz: {
    ask: (name: string, restaurant = 'restoran', table: number | string = '') => `Assalomu alaykum ${name}! ${restaurant}dagi ${table}-stol broningizga 2 soat qoldi. Kelishingizni tasdiqlaysizmi?`,
    web: '📞 AI Operatorga javob berish (Jonli qo‘ng‘iroq)',
    yes: '✅ Ha, albatta boraman',
    no: '❌ Bora olmayman (Restoran bilan bog‘lanish)',
    thanks: 'Rahmat, broningiz tasdiqlandi! Sizni kutamiz! 🙌',
    sorry: 'Tushundim, restoranga xabar berdim. Bron vaqtiga 2 soatdan kam qolganda uni ilova orqali bekor qilib bo‘lmaydi — restoranga telefon qiling; oldindan kelishilgan jarima kartangizdan yechiladi.',
    phone: 'Restoran telefoni',
    unclear: 'Kechirasiz, tushunmadim. “Ha” yoki “Yo‘q” deb javob bering yoki tugmani bosing.',
  },
  ru: {
    ask: (name: string, restaurant = 'ресторан', table: number | string = '') => `Здравствуйте, ${name}! До вашей брони стола ${table} в «${restaurant}» осталось 2 часа. Подтверждаете, что придёте?`,
    web: '📞 Ответить AI-оператору (живой звонок)',
    yes: '✅ Да, обязательно приду',
    no: '❌ Не смогу (связаться с рестораном)',
    thanks: 'Спасибо, бронь подтверждена! Ждём вас! 🙌',
    sorry: 'Понял, сообщил ресторану. Менее чем за 2 часа бронь нельзя отменить в приложении — позвоните в ресторан; согласованный штраф спишется с вашей карты.',
    phone: 'Телефон ресторана',
    unclear: 'Извините, не понял. Ответьте «Да» или «Нет» или нажмите кнопку.',
  },
  en: {
    ask: (name: string, restaurant = 'the restaurant', table: number | string = '') => `Hello ${name}! Your table ${table} booking at ${restaurant} starts in 2 hours. Can you confirm you are coming?`,
    web: '📞 Answer the AI operator (live call)',
    yes: '✅ Yes, I’m coming',
    no: '❌ I can’t come (contact the restaurant)',
    thanks: 'Thank you, your booking is confirmed! See you soon! 🙌',
    sorry: 'Understood, I have told the restaurant. Less than 2 hours before, the booking cannot be cancelled in the app — phone the restaurant; the agreed penalty is charged to your card.',
    phone: 'Restaurant phone',
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

/** Yes / no from the customer's words: instant word matching first, then gpt-4o-mini (fast) for free-form replies. */
export async function understand(text: string, l: Lang): Promise<'yes' | 'no' | null> {
  const quick = parseAnswer(text);
  if (quick || !text.trim()) return quick;
  const r = (await serviceVoice({ mode: 'call_intent', lang: l, text: text.slice(0, 500) })) as { answer?: string } | null;
  if (r?.answer === 'yes' || r?.answer === 'no') return r.answer;
  // OpenAI unavailable: Workers AI classifies the reply instead.
  return r ? null : await fallbackIntent(text.slice(0, 500)).catch(() => null);
}

export const lang = (v: unknown): Lang => (v === 'ru' || v === 'en' ? v : 'uz');
export const CALL_TEXT = TEXT;
const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
export const newCallToken = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => ALPHABET[b % ALPHABET.length]).join('');
export const callUrl = (id: string, token: string) => site() + '/call-ai/' + encodeURIComponent(id) + '?k=' + token;

/** Edge Function voice for server-side use; needs RF_PROXY_SECRET in the Worker and in Supabase. */
export async function serviceVoice(payload: Record<string, unknown>) {
  const c = authConfig();
  if (!c.url || !c.key || !c.proxy) return null;
  try {
    const res = await fetch(c.url + '/functions/v1/restaurantfoods-ai', { method: 'POST', headers: await aiHeaders({ apikey: c.key, Authorization: 'Bearer ' + c.key, 'Content-Type': 'application/json', 'X-RF-Proxy': c.proxy, 'X-RF-Service': 'call' }), body: JSON.stringify(payload), signal: AbortSignal.timeout(26000) });
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
  restaurant_phone: string;
  call_token: string | null;
  user_id: string;
}
const SELECT =
  'SELECT b.id,b.user_id,b.date,b.slot,b.table_number,b.guests,b.phone,b.status,b.call_status,b.call_token,b.restaurant_id,r.name AS restaurant_name,r.phone AS restaurant_phone,r.telegram_chat_id AS restaurant_chat,r.plan,r.trial_ends_at,r.paid_until,r.status AS restaurant_status,a.name AS customer_name,a.telegram_chat_id AS customer_chat,a.preferred_language AS customer_lang FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id LEFT JOIN accounts a ON a.id=b.user_id ';

export type { CallRow };
export const SELECT_CALL = SELECT;
export const callAiEnabled = (r: Pick<CallRow, 'plan' | 'trial_ends_at' | 'paid_until' | 'restaurant_status'>) => r.restaurant_status === 'active' && planState(r).features.callAi;

const REPORT: Record<string, string> = {
  confirmed: '✅ <b>Call AI:</b> mijoz kelishini tasdiqladi.',
  declined: '❌ <b>Call AI:</b> mijoz kela olmasligini aytdi. Bekor qilish va jarima — kabinetda “Bekor qilish va jarimani yechish”.',
  no_answer: '⚠️ <b>Call AI:</b> mijoz ' + NO_ANSWER_MINUTES + ' daqiqa ichida javob bermadi. Mijozga o‘zingiz qo‘ng‘iroq qiling.',
  unreachable: '⚠️ <b>Call AI:</b> mijozning Telegrami ulanmagan va telefon qo‘ng‘iroq xizmati sozlanmagan — mijoz faqat saytga kirsa javob bera oladi. Mijozga o‘zingiz qo‘ng‘iroq qiling.',
};

/** Tells the restaurant's linked Telegram chat; the dashboard shows the same call_status badge. */
async function report(b: CallRow, outcome: keyof typeof REPORT) {
  if (!b.restaurant_chat || !telegramConfigured()) return;
  await telegram('sendMessage', { chat_id: b.restaurant_chat, parse_mode: 'HTML', text: `${REPORT[outcome]}\n🏠 ${html(b.restaurant_name)} · ${b.table_number}-stol · ${b.guests} kishi\n📅 ${html(b.date)} ${html(String(b.slot).slice(0, 5))}\n📞 ${html(b.phone)}` });
}

/** Real phone call through Vapi, or a generic provider webhook. Returns true when the provider accepted it. */
export const phoneProvider = () => (env.VAPI_API_KEY?.trim() && env.VAPI_ASSISTANT_ID?.trim() && env.VAPI_PHONE_NUMBER_ID?.trim() ? 'vapi' : env.CALL_AI_WEBHOOK_URL?.trim() ? 'webhook' : null);
const hmac = async (secret: string, body: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))), (v) => v.toString(16).padStart(2, '0')).join('');
};
export { hmac as callHmac };
async function phoneCall(b: CallRow, question: string, token: string, l: Lang) {
  const provider = phoneProvider();
  if (!provider || !/^\+998\d{9}$/.test(b.phone)) return false;
  try {
    if (provider === 'vapi') {
      const res = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.VAPI_API_KEY!.trim(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId: env.VAPI_ASSISTANT_ID!.trim(), phoneNumberId: env.VAPI_PHONE_NUMBER_ID!.trim(), customer: { number: b.phone, name: (b.customer_name || '').slice(0, 40) }, assistantOverrides: { firstMessage: question, variableValues: { bookingId: b.id, name: (b.customer_name || '').split(/\s+/)[0], restaurant: b.restaurant_name, table: String(b.table_number), date: b.date, time: String(b.slot).slice(0, 5), lang: l } }, metadata: { bookingId: b.id } }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) console.error(JSON.stringify({ event: 'vapi_call_failed', status: res.status }));
      return res.ok;
    }
    const body = JSON.stringify({ bookingId: b.id, phone: b.phone, name: (b.customer_name || '').split(/\s+/)[0], restaurant: b.restaurant_name, table: b.table_number, date: b.date, time: String(b.slot).slice(0, 5), lang: l, question, webCallUrl: callUrl(b.id, token), callbackUrl: site() + '/api/call-ai/hook' });
    const secret = env.CALL_AI_WEBHOOK_SECRET?.trim() || '';
    const res = await fetch(env.CALL_AI_WEBHOOK_URL!.trim(), { method: 'POST', headers: { 'Content-Type': 'application/json', ...(secret ? { 'X-RF-Signature': await hmac(secret, body) } : {}) }, body, signal: AbortSignal.timeout(15000) });
    return res.ok;
  } catch {
    console.error(JSON.stringify({ event: 'phone_call_failed', provider }));
    return false;
  }
}

/** Places one confirmation call on every available channel. `force` re-calls (dashboard test). Returns the new call_status. */
export async function callBooking(b: CallRow, force = false) {
  const now = new Date().toISOString(),
    token = newCallToken();
  // Claimed first so two cron runs never call twice.
  const claimed = await env.DB!.prepare(`UPDATE bookings SET call_status='calling',call_sent_at=?,call_answered_at=NULL,call_token=? WHERE id=? AND status IN ('pending','confirmed')${force ? '' : " AND call_status IN ('','no_answer','unreachable')"}`).bind(now, token, b.id).run();
  if (!claimed.meta.changes) return b.call_status;
  const l = lang(b.customer_lang),
    t = TEXT[l],
    name = (b.customer_name || '').split(/\s+/)[0] || 'mehmon';
  const question = t.ask(name, b.restaurant_name, b.table_number);
  const channels: string[] = ['web'];
  if (b.customer_chat && telegramConfigured()) {
    const voice = await serviceVoice({ mode: 'call_speech', lang: l, text: question });
    if (voice?.audio && voice.mimeType === 'audio/ogg') await sendVoice(b.customer_chat, voice.audio);
    const sent = await telegram('sendMessage', {
      chat_id: b.customer_chat,
      parse_mode: 'HTML',
      text: `📞 <b>${html(question)}</b>\n🏠 ${html(b.restaurant_name)} · ${b.table_number}-stol · ${b.guests} kishi\n🕒 ${html(b.date)} ${html(String(b.slot).slice(0, 5))}`,
      reply_markup: { inline_keyboard: [[{ text: t.web, url: callUrl(b.id, token) }], [{ text: t.yes, callback_data: 'cc:y:' + b.id }], [{ text: t.no, callback_data: 'cc:n:' + b.id }]] },
    });
    if (sent) channels.push('telegram');
  }
  if (await phoneCall(b, question, token, l)) channels.push('phone');
  await env.DB!.prepare('UPDATE bookings SET call_channel=? WHERE id=?').bind(channels.join(','), b.id).run();
  // Only the website is left: the restaurant should phone the guest themselves.
  if (channels.length === 1) await report(b, 'unreachable');
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

/** Records the customer's answer from any channel; replies in their Telegram chat when it is linked. */
export async function answerCall(b: CallRow, verdict: 'yes' | 'no', chatId: string | null = b.customer_chat) {
  const t = TEXT[lang(b.customer_lang)];
  const now = new Date().toISOString();
  if (verdict === 'yes') {
    await env.DB!.prepare("UPDATE bookings SET call_status='confirmed',call_answered_at=?,status=CASE WHEN status='pending' THEN 'confirmed' ELSE status END WHERE id=? AND status IN ('pending','confirmed')").bind(now, b.id).run();
    if (chatId) await telegram('sendMessage', { chat_id: chatId, text: t.thanks });
    await report(b, 'confirmed');
    return { result: 'call_confirmed', message: t.thanks };
  }
  await env.DB!.prepare("UPDATE bookings SET call_status='declined',call_answered_at=? WHERE id=?").bind(now, b.id).run();
  const sorry = t.sorry + (b.restaurant_phone ? `\n📞 ${t.phone}: ${b.restaurant_phone}` : '');
  if (chatId) await telegram('sendMessage', { chat_id: chatId, text: sorry });
  await report(b, 'declined');
  return { result: 'call_declined', message: sorry };
}
const answer = async (b: CallRow, verdict: 'yes' | 'no', chatId: string) => (await answerCall(b, verdict, chatId)).result;

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
  const verdict = await understand(text, lang(b.customer_lang));
  if (!verdict) {
    await telegram('sendMessage', { chat_id: chatId, text: TEXT[lang(b.customer_lang)].unclear });
    return 'call_unclear';
  }
  return answer(b, verdict, chatId);
}

/** Manual "call now (test)" from the dashboard (Premium): calls again even if a call was made. */
export async function callNow(bookingId: string) {
  const b = await env.DB!.prepare(SELECT + "WHERE b.id=? AND b.status IN ('pending','confirmed')").bind(bookingId).first<CallRow>();
  if (!b) return null;
  if (!callAiEnabled(b)) return 'plan';
  return callBooking(b, true);
}

/** A booking the web call page may open: the customer's own (signed in) or with the call token. */
export async function callForWeb(id: string, token: string | null, userId: string | null) {
  const b = await env.DB!.prepare(SELECT + 'WHERE b.id=?').bind(id).first<CallRow>();
  if (!b) return null;
  const tokenOk = !!token && !!b.call_token && token.length === b.call_token.length && token === b.call_token;
  return tokenOk || (userId && b.user_id === userId) ? b : null;
}
/** Signed-in customer's bookings with an open call (the site rings while they browse). */
export const openCallsFor = async (userId: string) => (await env.DB!.prepare(SELECT + "WHERE b.user_id=? AND b.call_status IN ('calling','no_answer') AND b.status IN ('pending','confirmed') ORDER BY b.call_sent_at DESC LIMIT 3").bind(userId).all<CallRow>()).results;
