import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { ApiError } from './http';

/*
 * Sign-in with Telegram (no SMS code, no password):
 *  1. the browser asks for a login request: a one-time code (10 minutes) bound to this browser by a
 *     random nonce kept in an HttpOnly cookie (only its hash is stored);
 *  2. the user opens t.me/<bot>?start=l_CODE and shares their own contact with the bot's button
 *     (app/telegram.ts checks contact.user_id === from.id, so the number is proven to be theirs); the
 *     bot finds the account with that verified number or creates one, saves the phone as verified (and
 *     the Telegram birthday when the user shows it) and approves the request;
 *  3. the browser polls; once approved it receives a site session of its own (30 days, HttpOnly
 *     cookie, only the hash in D1). identity() accepts it next to the Supabase session.
 * The site administrator account never signs in this way.
 */
const LOGIN_COOKIE = '__Host-rf-tglogin';
const SESSION_COOKIE = '__Host-rf-tg';
const LOGIN_TTL = 10 * 60000;
const SESSION_DAYS = 30;
const DEVICE_COOKIE = '__Host-rf-device';
const DEVICE_DAYS = 180;
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const random = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (v) => ABC[v % 62]).join('');
export async function sha256(text: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), (v) => v.toString(16).padStart(2, '0')).join('');
}
const cookieOptions = (maxAge: number) => ({ httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge });
export const botUsername = () => (env.TELEGRAM_BOT_USERNAME || '').trim().replace(/^@/, '');
export const telegramLoginAvailable = () => !!(env.TELEGRAM_BOT_TOKEN?.trim() && env.TELEGRAM_WEBHOOK_SECRET?.trim() && /^[A-Za-z0-9_]{5,64}$/.test(botUsername()));

export async function startTelegramLogin() {
  if (!telegramLoginAvailable()) throw new ApiError(503, 'Telegram orqali kirish hozircha yoqilmagan.');
  const code = 'l_' + random(24),
    nonce = random(32),
    now = Date.now();
  await env.DB!.prepare('DELETE FROM telegram_logins WHERE expires_at<?').bind(now).run();
  await env.DB!.prepare('INSERT INTO telegram_logins (code,browser_hash,status,expires_at,created_at) VALUES (?,?,?,?,?)').bind(code, await sha256(nonce), 'pending', now + LOGIN_TTL, now).run();
  (await cookies()).set(LOGIN_COOKIE, code + '.' + nonce, cookieOptions(LOGIN_TTL / 1000));
  return { url: 'https://t.me/' + botUsername() + '?start=' + code, expiresIn: LOGIN_TTL / 1000 };
}

/** The browser's login request: pending / awaiting_contact / denied / approved (then a session is issued). */
export async function pollTelegramLogin() {
  const jar = await cookies();
  const [code, nonce] = String(jar.get(LOGIN_COOKIE)?.value || '').split('.');
  if (!code || !nonce) throw new ApiError(410, 'So‘rov eskirgan. “Telegram orqali kirish”ni qayta bosing.');
  const row = await env.DB!.prepare('SELECT status,user_id FROM telegram_logins WHERE code=? AND browser_hash=? AND expires_at>?').bind(code, await sha256(nonce), Date.now()).first<{ status: string; user_id: string | null }>();
  if (!row) throw new ApiError(410, 'So‘rov eskirgan. “Telegram orqali kirish”ni qayta bosing.');
  if (row.status !== 'approved' || !row.user_id) return { status: row.status };
  // One-time: the request is consumed by the browser that started it.
  const claimed = await env.DB!.prepare("DELETE FROM telegram_logins WHERE code=? AND status='approved' RETURNING user_id").bind(code).first<{ user_id: string }>();
  if (!claimed) throw new ApiError(410, 'So‘rov allaqachon ishlatilgan.');
  await issueSession(claimed.user_id);
  await rememberDevice(claimed.user_id);
  jar.set(LOGIN_COOKIE, '', cookieOptions(0));
  return { status: 'approved' };
}

/*
 * "🚀 Saytga kirish" in the bot: the button opens in Telegram's own browser (or another one), not in the
 * browser that polls, so it carries a one-time sign-in link of its own: 10 minutes, one use, sent only to
 * the chat that just proved the phone number (only the code's hash is kept). Never for the administrator.
 */
const MAGIC_TTL = 10 * 60000;
export async function createMagicLink(userId: string) {
  const code = 'm_' + random(32),
    now = Date.now();
  await env.DB!.prepare('INSERT INTO telegram_logins (code,browser_hash,status,user_id,expires_at,created_at) VALUES (?,?,?,?,?,?)').bind(await sha256(code), 'magic', 'approved', userId, now + MAGIC_TTL, now).run();
  return code;
}
export async function magicLogin(code: unknown) {
  if (typeof code !== 'string' || !/^m_[A-Za-z0-9]{32}$/.test(code)) throw new ApiError(410, 'Havola eskirgan. Telegram orqali qayta kiring.');
  const row = await env.DB!.prepare("DELETE FROM telegram_logins WHERE code=? AND browser_hash='magic' AND status='approved' AND expires_at>? RETURNING user_id").bind(await sha256(code), Date.now()).first<{ user_id: string }>();
  const acc = row ? await env.DB!.prepare('SELECT id,role,status FROM accounts WHERE id=?').bind(row.user_id).first<{ id: string; role: string; status: string }>() : null;
  if (!acc) throw new ApiError(410, 'Havola eskirgan yoki allaqachon ishlatilgan. Telegram orqali qayta kiring.');
  if (acc.role === 'admin' || acc.status === 'suspended') throw new ApiError(403, 'Bu akkaunt bilan tezkor kirish mumkin emas.');
  await issueSession(acc.id);
  await rememberDevice(acc.id);
  return { ok: true };
}

/** A site session of its own for this browser (30 days, HttpOnly cookie, only the hash in D1). */
async function issueSession(userId: string) {
  const token = random(48),
    now = Date.now();
  await env.DB!.prepare('INSERT INTO telegram_sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)').bind(await sha256(token), userId, now + SESSION_DAYS * 86400000, now).run();
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_DAYS * 86400));
}

/*
 * Remembered device: after a sign-in with a verified phone (Telegram or SMS), this browser keeps a separate
 * device key for 180 days in an HttpOnly cookie that "Chiqish" does not remove. The next "Telegram orqali
 * kirish" on this browser signs in at once, without the bot or the phone number. Only the hash is stored
 * (in telegram_sessions under a "device:" prefix, so it can never pass as a session token); the key is
 * replaced on every use, and "Bu qurilmani unutish" deletes it. Never for the site administrator.
 */
export const hasDevice = async () => !!(await cookies()).get(DEVICE_COOKIE)?.value;
export async function rememberDevice(userId: string) {
  const token = random(48),
    now = Date.now();
  await env.DB!.prepare('INSERT INTO telegram_sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)').bind(await sha256('device:' + token), userId, now + DEVICE_DAYS * 86400000, now).run();
  (await cookies()).set(DEVICE_COOKIE, token, cookieOptions(DEVICE_DAYS * 86400));
}
export async function deviceLogin() {
  const jar = await cookies(),
    token = jar.get(DEVICE_COOKIE)?.value;
  if (!token || token.length < 32) throw new ApiError(410, 'Bu qurilma eslab qolinmagan. Telegram orqali kiring.');
  const hash = await sha256('device:' + token);
  const row = await env.DB!.prepare('SELECT a.id,a.role,a.status FROM telegram_sessions s JOIN accounts a ON a.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(hash, Date.now()).first<{ id: string; role: string; status: string }>();
  // One use per key: the old one is gone whatever happens next.
  await env.DB!.prepare('DELETE FROM telegram_sessions WHERE token_hash=?').bind(hash).run();
  if (!row) {
    jar.set(DEVICE_COOKIE, '', cookieOptions(0));
    throw new ApiError(410, 'Qurilma kaliti eskirgan. Telegram orqali qayta kiring.');
  }
  if (row.role === 'admin' || row.status === 'suspended') {
    jar.set(DEVICE_COOKIE, '', cookieOptions(0));
    throw new ApiError(403, 'Bu akkaunt bilan tezkor kirish mumkin emas.');
  }
  await issueSession(row.id);
  await rememberDevice(row.id);
  return { ok: true };
}
export async function forgetDevice() {
  const jar = await cookies(),
    token = jar.get(DEVICE_COOKIE)?.value;
  if (token) await env.DB!.prepare('DELETE FROM telegram_sessions WHERE token_hash=?').bind(await sha256('device:' + token)).run();
  jar.set(DEVICE_COOKIE, '', cookieOptions(0));
}

/** Identity for a Telegram session (same shape as the Supabase one), or null. */
export async function telegramIdentity() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 32) return null;
  const a = await env.DB!.prepare('SELECT a.id,a.email,a.name,a.email_verified,a.contact_phone,a.contact_phone_verified FROM telegram_sessions s JOIN accounts a ON a.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(await sha256(token), Date.now()).first<any>();
  if (!a) return null;
  return {
    userId: String(a.id),
    email: a.email_verified ? String(a.email || '') : '',
    phone: String(a.contact_phone || '').replace(/^\+/, ''),
    emailVerified: !!(a.email_verified && a.email),
    phoneVerified: !!a.contact_phone_verified,
    providerName: 'telegram',
    displayName: String(a.name || 'Mijoz').slice(0, 100),
    fullName: null,
    source: 'telegram',
  };
}

export async function endTelegramSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await env.DB!.prepare('DELETE FROM telegram_sessions WHERE token_hash=?').bind(await sha256(token)).run();
  jar.set(SESSION_COOKIE, '', cookieOptions(0));
}
