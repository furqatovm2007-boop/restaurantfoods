import { env } from 'cloudflare:workers';
import { ApiError, throttle, clientIp } from './http';
import { sendSms, smsConfigured } from './sms';
import { sendTelegramCode } from './telegram';

/*
 * One-time codes proving the booking phone belongs to the customer. Only a SHA-256
 * of (id + code) is stored; a code lives 5 minutes, allows 5 attempts and is used once.
 * Channel: the customer's linked Telegram chat when Telegram already vouched for this very number
 * (shared contact), otherwise SMS. Telegram is free, so it is tried first.
 */
export const TELEGRAM_REQUIRED = 'Kod yuborish uchun profilingizda Telegram botni ulang va raqamingizni ulashing.';
const TTL_MS = 5 * 60000;
const MAX_ATTEMPTS = 5;

const digest = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), (v) => v.toString(16).padStart(2, '0')).join('');

const DAY = 86400000;
/** Sends a code with every SMS limit applied: per account, per phone, per network address and per day overall. */
export async function sendGuardedOtp(request: Request, userId: string, phone: string) {
  await throttle('booking-otp:' + userId, 5);
  await throttle('booking-otp-day:' + userId, 10, DAY);
  await throttle('booking-otp-phone:' + phone, 3);
  await throttle('booking-otp-ip:' + clientIp(request), 8);
  await throttle('sms:global', 1000, DAY);
  return sendBookingOtp(userId, phone);
}

export async function sendBookingOtp(userId: string, phone: string) {
  const id = crypto.randomUUID();
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
  const now = Date.now();
  await env.DB!.prepare('INSERT INTO booking_phone_otps (id,user_id,phone,code_hash,expires_at,created_at) VALUES (?,?,?,?,?,?)').bind(id, userId, phone, await digest(id + code), now + TTL_MS, now).run();
  const tg = await env.DB!.prepare('SELECT telegram_chat_id,telegram_phone FROM accounts WHERE id=?').bind(userId).first<{ telegram_chat_id: string | null; telegram_phone: string | null }>();
  if (tg?.telegram_chat_id && tg.telegram_phone === phone && (await sendTelegramCode(tg.telegram_chat_id, code))) return { id, expiresIn: TTL_MS / 1000, channel: 'telegram' as const };
  if (!smsConfigured()) throw new ApiError(503, TELEGRAM_REQUIRED);
  // Must match the text approved in the Eskiz cabinet word for word (Eskiz wants the site name and purpose).
  await sendSms(phone, `restaurantfoods.online saytida telefon raqamingizni tasdiqlash uchun kod: ${code}. Kodni hech kimga bermang.`);
  return { id, expiresIn: TTL_MS / 1000, channel: 'sms' as const };
}

/** Checks the code for this user and phone. Does not consume it; call consumeBookingOtp after the booking is saved. */
export async function verifyBookingOtp(userId: string, phone: string, id: unknown, code: unknown) {
  if (typeof id !== 'string' || typeof code !== 'string' || !/^\d{6}$/.test(code)) throw new ApiError(400, 'Telefon raqamini tasdiqlash kodi bilan tasdiqlang.');
  const row = await env.DB!.prepare('SELECT * FROM booking_phone_otps WHERE id=? AND user_id=? AND phone=? AND consumed=0').bind(id, userId, phone).first<{ code_hash: string; expires_at: number; attempts: number }>();
  if (!row || row.expires_at < Date.now() || row.attempts >= MAX_ATTEMPTS) throw new ApiError(400, 'Kod eskirgan. Yangi kod oling.');
  if ((await digest(id + code)) !== row.code_hash) {
    await env.DB!.prepare('UPDATE booking_phone_otps SET attempts=attempts+1 WHERE id=?').bind(id).run();
    throw new ApiError(400, 'Kod noto‘g‘ri.');
  }
  await env.DB!.prepare('UPDATE booking_phone_otps SET verified_at=COALESCE(verified_at,?) WHERE id=?').bind(Date.now(), id).run();
}

export const consumeBookingOtp = (id: string) => env.DB!.prepare('UPDATE booking_phone_otps SET consumed=1 WHERE id=?').bind(id).run();
