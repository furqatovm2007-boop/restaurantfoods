import { env } from 'cloudflare:workers';

/*
 * Storage for one-time phone codes, shared by the SMS/Telegram sender (booking-otp.ts) and the
 * Telegram bot (telegram.ts). Only a SHA-256 of (id + code) is kept; a code lives 5 minutes.
 */
export const OTP_TTL_MS = 5 * 60000;

export const otpDigest = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), (v) => v.toString(16).padStart(2, '0')).join('');

/** Creates a fresh 6-digit code for this user and phone; returns the plain code once, for sending. */
export async function issueOtp(userId: string, phone: string) {
  const id = crypto.randomUUID();
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
  const now = Date.now();
  await env.DB!.prepare('INSERT INTO booking_phone_otps (id,user_id,phone,code_hash,expires_at,created_at) VALUES (?,?,?,?,?,?)').bind(id, userId, phone, await otpDigest(id + code), now + OTP_TTL_MS, now).run();
  return { id, code };
}

/** Codes issued for this user in the last 10 minutes (bot-side flood guard). */
export const recentOtps = async (userId: string) => (await env.DB!.prepare('SELECT COUNT(*) AS n FROM booking_phone_otps WHERE user_id=? AND created_at>?').bind(userId, Date.now() - 600000).first<{ n: number }>())?.n ?? 0;
