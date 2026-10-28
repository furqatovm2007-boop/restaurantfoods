import { env } from 'cloudflare:workers';
import { issueOtp, recentOtps } from './otp-store';
import { createMagicLink } from './telegram-login';
import { planState } from './plans';

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
  preorder_items?: string | null;
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
  // A paid decoration ("Marry me"…) must be prepared before the guests arrive.
  let items: { id?: string; name?: string; price?: number }[] = [];
  try {
    items = JSON.parse(b.preorder_items || '[]');
  } catch {}
  for (const d of Array.isArray(items) ? items.filter((i) => String(i?.id).startsWith('decor:')) : []) lines.push(`🎀 <b>Dekoratsiya:</b> ${html(String(d.name || '').replace(/^🎀\s*/, ''))} · ${Number(d.price || 0).toLocaleString('ru-RU').replace(/[\s,]/g, ' ')} so‘m`);
  if (STATUS_TEXT[b.status]) lines.push('', `<b>${STATUS_TEXT[b.status]}</b>`);
  return lines.join('\n');
}

export const bookingKeyboard = (id: string) => ({
  inline_keyboard: [[{ text: '✅ Tasdiqlash', callback_data: 'b:c:' + id }, { text: '❌ Bekor qilish', callback_data: 'b:x:' + id }]],
});

async function loadBooking(id: string) {
  return env.DB!.prepare(
    'SELECT b.id,b.phone,b.table_number,b.date,b.slot,b.end_slot,b.guests,b.status,b.deposit_status,b.preorder_items,b.restaurant_id,r.name AS restaurant_name,r.telegram_chat_id,d.provider AS deposit_provider FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id LEFT JOIN deposits d ON d.booking_id=b.id WHERE b.id=?',
  )
    .bind(id)
    .first<BookingMessage & { restaurant_id: string; telegram_chat_id: string | null }>();
}

/**
 * Where a restaurant's alerts go: its linked restaurant chat, or the owner's own Telegram when no
 * restaurant chat was linked, plus managers who linked theirs while the plan includes staff accounts.
 */
export async function restaurantChats(restaurantId: string) {
  const r = await env.DB!.prepare('SELECT r.telegram_chat_id AS chat,a.telegram_chat_id AS owner_chat,r.plan,r.trial_ends_at,r.paid_until FROM restaurants r LEFT JOIN accounts a ON a.id=r.owner_id WHERE r.id=?')
    .bind(restaurantId)
    .first<{ chat: string | null; owner_chat: string | null; plan: string | null; trial_ends_at: string | null; paid_until: string | null }>();
  if (!r) return [];
  const chats = new Set<string>();
  if (r.chat) chats.add(r.chat);
  else if (r.owner_chat) chats.add(r.owner_chat);
  if (planState(r).features.staffAccounts) {
    const managers = await env.DB!.prepare("SELECT a.telegram_chat_id AS chat FROM restaurant_staff s JOIN accounts a ON a.id=s.user_id WHERE s.restaurant_id=? AND s.role='manager' AND a.telegram_chat_id IS NOT NULL AND a.telegram_chat_id<>''").bind(restaurantId).all<{ chat: string }>();
    for (const m of managers.results) chats.add(m.chat);
  }
  return [...chats];
}

/** Sends the new-booking card to the restaurant's chats (restaurantChats). Never throws. */
export async function notifyBooking(id: string) {
  if (!telegramConfigured()) return false;
  try {
    const b = await loadBooking(id);
    if (!b) return false;
    let sent = false;
    for (const chat_id of await restaurantChats(b.restaurant_id)) if (await telegram('sendMessage', { chat_id, text: bookingText(b), parse_mode: 'HTML', reply_markup: b.status === 'pending' ? bookingKeyboard(b.id) : undefined })) sent = true;
    return sent;
  } catch {
    return false;
  }
}

const TRANSITIONS: Record<string, Record<string, string>> = { c: { pending: 'confirmed' }, x: { pending: 'cancelled', confirmed: 'cancelled' } };

interface Update {
  message?: { chat: { id: number }; from?: { id: number; first_name?: string; last_name?: string }; text?: string; contact?: { phone_number: string; user_id?: number } };
  callback_query?: { id: string; data?: string; message?: { chat: { id: number }; message_id: number } };
}

/** Telegram phone ("998901234567" or "+998901234567") → "+998901234567"; null when not Uzbek. */
export function telegramPhone(raw: string) {
  const digits = String(raw || '').replace(/\D/g, '');
  return /^998\d{9}$/.test(digits) ? '+' + digits : null;
}

const CONTACT_KEYBOARD = { keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true };
const REMOVE_KEYBOARD = { remove_keyboard: true };
export const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');

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

const ADMIN_ID = 'sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe';
/** Telegram birthday ("YYYY-MM-DD") when the user shows it to bots with the year; otherwise null. */
async function telegramBirthday(chatId: string) {
  const chat = (await telegram('getChat', { chat_id: chatId })) as { birthdate?: { day: number; month: number; year?: number } } | null;
  const b = chat?.birthdate;
  if (!b?.year || !b.month || !b.day) return null;
  return `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`;
}
/** The shared own contact approves a sign-in request: existing account with that verified number, or a new one. */
async function approveLogin(code: string, chatId: string, from: { id: number; first_name?: string; last_name?: string } | undefined, phone: string | null, viaContact = true) {
  const deny = async (reason: string, text: string) => {
    await env.DB!.prepare("UPDATE telegram_logins SET status='denied' WHERE code=?").bind(code).run();
    await telegram('sendMessage', { chat_id: chatId, text, reply_markup: REMOVE_KEYBOARD });
    return reason;
  };
  if (!phone || !from) return deny('login_not_uz', 'Hozircha faqat O‘zbekiston raqamlari (+998) bilan kirish mumkin.');
  const digits = phone.slice(1);
  const existing = await env.DB!.prepare("SELECT id,role,status FROM accounts WHERE telegram_chat_id=? OR (contact_phone=? AND contact_phone_verified=1) OR (phone=? AND phone_verified=1) ORDER BY CASE WHEN telegram_chat_id=? THEN 0 ELSE 1 END LIMIT 1").bind(chatId, phone, digits, chatId).first<{ id: string; role: string; status: string }>();
  if (existing && (existing.id === ADMIN_ID || existing.role === 'admin')) return deny('login_admin', 'Administrator akkaunti Telegram orqali kira olmaydi. Saytda odatdagidek kiring.');
  if (existing?.status === 'suspended') return deny('login_suspended', 'Akkaunt to‘xtatilgan. Supportga murojaat qiling.');
  const birthday = await telegramBirthday(chatId);
  const name = [from.first_name, from.last_name].filter(Boolean).join(' ').trim().slice(0, 80) || 'Mijoz';
  const userId = existing?.id || 'tg:' + from.id;
  // One chat per account.
  await env.DB!.prepare('UPDATE accounts SET telegram_chat_id=NULL WHERE telegram_chat_id=? AND id<>?').bind(chatId, userId).run();
  if (existing)
    await env.DB!.prepare("UPDATE accounts SET telegram_chat_id=?,telegram_phone=?,contact_phone=CASE WHEN contact_phone='' THEN ? ELSE contact_phone END,contact_phone_verified=CASE WHEN contact_phone IN ('',?) THEN 1 ELSE contact_phone_verified END,birth_date=COALESCE(birth_date,?) WHERE id=?").bind(chatId, phone, phone, phone, birthday, userId).run();
  else
    await env.DB!.prepare("INSERT INTO accounts (id,email,name,created_at,role,role_selected,phone,phone_verified,provider,contact_phone,contact_phone_verified,telegram_chat_id,telegram_phone,birth_date) VALUES (?,?,?,?,'customer',1,?,1,'telegram',?,1,?,?,?) ON CONFLICT(id) DO UPDATE SET telegram_chat_id=excluded.telegram_chat_id,telegram_phone=excluded.telegram_phone,contact_phone=excluded.contact_phone,contact_phone_verified=1,birth_date=COALESCE(accounts.birth_date,excluded.birth_date)").bind(userId, '', name, new Date().toISOString(), digits, phone, chatId, phone, birthday).run();
  await env.DB!.prepare("UPDATE telegram_logins SET status='approved',user_id=? WHERE code=?").bind(userId, code).run();
  // The shared-contact keyboard goes away first; then one button back to the site (the browser that asked is
  // signed in by its own polling, the button is for coming back to it).
  if (viaContact) await telegram('sendMessage', { chat_id: chatId, text: `✅ ${prettyPhone(phone)} tasdiqlandi.`, reply_markup: REMOVE_KEYBOARD });
  // The button signs in whichever browser opens it (Telegram's own included) with a one-time link.
  const magic = await createMagicLink(userId);
  await telegram('sendMessage', { chat_id: chatId, text: viaContact ? 'Kirish tayyor — “🚀 Saytga kirish” tugmasini bosing.' : `✅ Siz tanildingiz (${prettyPhone(phone)}). Raqam qayta so‘ralmaydi — “🚀 Saytga kirish” tugmasini bosing.`, reply_markup: { inline_keyboard: [[{ text: '🚀 Saytga kirish', url: site() + '/#/tg/' + magic }]] } });
  return 'login_approved';
}

/*
 * The own contact shared from the Mini App (requestContact) for the signed-in account of this chat. Telegram
 * proves the number belongs to the sender (contact.user_id === from.id, checked above), so it is saved as
 * verified at once. A number that already belongs to another account moves the chat there instead (as
 * sign-in with Telegram does); the page then signs into it. The administrator account is never taken over.
 */
async function webAppContact(chatId: string, phone: string | null) {
  const key = 'tgcontact:' + chatId;
  const row = await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key).first<{ value: string }>();
  let flag: any = null;
  try {
    flag = row ? JSON.parse(row.value) : null;
  } catch {}
  if (!flag || flag.status !== 'waiting' || Date.now() > flag.until) return null;
  const save = (status: string, extra: Record<string, unknown> = {}) => env.DB!.prepare('UPDATE app_settings SET value=?,updated_at=? WHERE key=?').bind(JSON.stringify({ ...flag, ...extra, status }), new Date().toISOString(), key).run();
  const account = await env.DB!.prepare('SELECT id FROM accounts WHERE id=? AND telegram_chat_id=?').bind(flag.userId, chatId).first<{ id: string }>();
  if (!account) return null;
  if (!phone) {
    await save('not_uz');
    await telegram('sendMessage', { chat_id: chatId, text: 'Hozircha faqat O‘zbekiston raqamlari (+998) qabul qilinadi.', reply_markup: REMOVE_KEYBOARD });
    return 'webapp_contact_not_uz';
  }
  const other = await env.DB!.prepare('SELECT id,role,status FROM accounts WHERE id<>? AND ((contact_phone=? AND contact_phone_verified=1) OR (phone=? AND phone_verified=1)) LIMIT 1').bind(account.id, phone, phone.slice(1)).first<{ id: string; role: string; status: string }>();
  if (other && (other.id === ADMIN_ID || other.role === 'admin' || other.status === 'suspended')) {
    await save('taken');
    await telegram('sendMessage', { chat_id: chatId, text: 'Bu raqam boshqa akkauntga tegishli. Supportga murojaat qiling.', reply_markup: REMOVE_KEYBOARD });
    return 'webapp_contact_taken';
  }
  if (other) {
    await env.DB!.prepare('UPDATE accounts SET telegram_chat_id=NULL WHERE telegram_chat_id=?').bind(chatId).run();
    await env.DB!.prepare('UPDATE accounts SET telegram_chat_id=?,telegram_phone=? WHERE id=?').bind(chatId, phone, other.id).run();
    await save('switched', { target: other.id });
    await telegram('sendMessage', { chat_id: chatId, text: `✅ ${prettyPhone(phone)} tasdiqlandi. Bu raqamdagi akkauntingizga ulandingiz — Mini App’ga qayting.`, reply_markup: REMOVE_KEYBOARD });
    return 'webapp_contact_switched';
  }
  await env.DB!.prepare('UPDATE accounts SET contact_phone=?,contact_phone_verified=1,telegram_phone=? WHERE id=?').bind(phone, phone, account.id).run();
  await save('saved');
  await telegram('sendMessage', { chat_id: chatId, text: `✅ ${prettyPhone(phone)} saqlandi. Mini App’ga qayting — bron davom etadi.`, reply_markup: REMOVE_KEYBOARD });
  return 'webapp_contact_saved';
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
    // Sign-in with Telegram: this chat opened a login request from the site (app/telegram-login.ts).
    const login = await env.DB!.prepare("SELECT code FROM telegram_logins WHERE chat_id=? AND status='awaiting_contact' AND expires_at>? ORDER BY created_at DESC LIMIT 1").bind(chatId, Date.now()).first<{ code: string }>();
    if (login) return approveLogin(login.code, chatId, msg.from, phone);
    // Mini App: the page asked for the number with Telegram's requestContact (app/telegram-login.ts).
    const shared = await webAppContact(chatId, phone);
    if (shared) return shared;
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
  if (code && /^l_[A-Za-z0-9]{24}$/.test(code)) {
    const opened = await env.DB!.prepare("UPDATE telegram_logins SET chat_id=?,status='awaiting_contact' WHERE code=? AND status IN ('pending','awaiting_contact') AND expires_at>?").bind(chatId, code, Date.now()).run();
    // This Telegram account already belongs to a site account with a verified number: approve at once,
    // without asking for the contact again.
    const known = opened.meta.changes ? await env.DB!.prepare("SELECT contact_phone FROM accounts WHERE telegram_chat_id=? AND contact_phone_verified=1 AND contact_phone<>'' LIMIT 1").bind(chatId).first<{ contact_phone: string }>() : null;
    if (known && msg.from) return approveLogin(code, chatId, msg.from, known.contact_phone, false);
    await telegram('sendMessage', opened.meta.changes ? { chat_id: chatId, text: '👋 RestaurantFoods’ga kirish.\nPastdagi “📱 Raqamni yuborish” tugmasini bosing — raqamingiz tasdiqlanadi va saytga kirasiz.', reply_markup: CONTACT_KEYBOARD } : { chat_id: chatId, text: 'Havola eskirgan. Saytda “Telegram orqali kirish”ni qayta bosing.' });
    return opened.meta.changes ? 'login_opened' : 'login_expired';
  }
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
    // Only a chat that receives this restaurant's alerts may act on it.
    if (!b || !TRANSITIONS[op] || !(await restaurantChats(b.restaurant_id)).includes(String(cb.message.chat.id))) {
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
