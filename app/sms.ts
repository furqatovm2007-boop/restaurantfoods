import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * SMS through Eskiz.uz, used for booking phone verification. Eskiz only delivers texts
 * whose template was approved in its cabinet, so the message wording below must match it.
 * The bearer token is cached per isolate and refreshed once on 401.
 */
const BASE = 'https://notify.eskiz.uz/api';
let token: string | null = null;

// Eskiz's login "password" is the secret key from the cabinet; ESKIZ_SECRET_KEY wins over ESKIZ_PASSWORD.
const eskizKey = () => (env.ESKIZ_SECRET_KEY?.trim() || env.ESKIZ_PASSWORD?.trim() || '');
export const smsConfigured = () => !!(env.ESKIZ_EMAIL?.trim() && eskizKey());
export const bookingOtpRequired = () => env.BOOKING_PHONE_OTP === 'true';
/** Codes can also go to the customer's linked Telegram chat (free), see booking-otp.ts. */
export const telegramOtpConfigured = () => !!(env.TELEGRAM_BOT_TOKEN?.trim() && env.TELEGRAM_BOT_USERNAME?.trim());
/** One switch for every phone code (booking and profile): BOOKING_PHONE_OTP on and a channel (Eskiz SMS or the Telegram bot) present. */
export const phoneOtpEnabled = () => bookingOtpRequired() && (smsConfigured() || telegramOtpConfigured());

async function login() {
  const form = new FormData();
  form.set('email', env.ESKIZ_EMAIL!.trim());
  form.set('password', eskizKey());
  const res = await fetch(BASE + '/auth/login', { method: 'POST', body: form, signal: AbortSignal.timeout(8000) });
  const data = (await res.json().catch(() => ({}))) as { data?: { token?: string } };
  if (!res.ok || !data.data?.token) throw new Error('ESKIZ_LOGIN_FAILED');
  return (token = data.data.token);
}

/** Sends one SMS. `phone` is +998XXXXXXXXX. Throws ApiError(503) when SMS is unavailable. */
export async function sendSms(phone: string, message: string) {
  if (!smsConfigured()) throw new ApiError(503, 'SMS xizmati hali ulanmagan.');
  const send = async (bearer: string) => {
    const form = new FormData();
    form.set('mobile_phone', phone.replace(/^\+/, ''));
    form.set('message', message);
    form.set('from', env.ESKIZ_FROM?.trim() || '4546');
    return fetch(BASE + '/message/sms/send', { method: 'POST', headers: { Authorization: 'Bearer ' + bearer }, body: form, signal: AbortSignal.timeout(8000) });
  };
  let res: Response;
  try {
    res = await send(token ?? (await login()));
    if (res.status === 401) res = await send(await login());
  } catch (e) {
    const badLogin = String((e as Error).message || e) === 'ESKIZ_LOGIN_FAILED';
    console.error(JSON.stringify({ event: 'sms_failed', reason: badLogin ? 'login' : 'network' }));
    throw new ApiError(503, badLogin ? 'SMS xizmatiga ulanib bo‘lmadi: Eskiz email yoki paroli noto‘g‘ri.' : 'SMS yuborilmadi. Birozdan keyin qayta urinib ko‘ring.');
  }
  if (res.ok) return;
  // Eskiz explains refusals in `message`; digits are masked so no phone number or code reaches the logs.
  const detail = (await res.text().catch(() => '')).replace(/\d/g, '#').slice(0, 300);
  console.error(JSON.stringify({ event: 'sms_failed', status: res.status, detail }));
  throw new ApiError(503, smsFailure(detail));
}

/** Turns Eskiz's refusal into a message the restaurant owner can act on. */
export function smsFailure(detail: string) {
  const d = detail.toLowerCase();
  if (/модерац|moderat|шаблон|template|не прош|not approved|тест|test/.test(d)) return 'SMS yuborilmadi: SMS matni Eskiz kabinetida hali tasdiqlanmagan.';
  if (/баланс|balance|недостаточно|insufficient|not enough/.test(d)) return 'SMS yuborilmadi: Eskiz balansida mablag‘ yetarli emas.';
  if (/from|nick|отправител|sender/.test(d)) return 'SMS yuborilmadi: Eskiz yuboruvchi nomi (ESKIZ_FROM) noto‘g‘ri.';
  return 'SMS yuborilmadi. Birozdan keyin qayta urinib ko‘ring.';
}
