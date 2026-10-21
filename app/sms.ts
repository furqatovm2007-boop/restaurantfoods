import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * SMS through Eskiz.uz, used for booking phone verification. Eskiz only delivers texts
 * whose template was approved in its cabinet, so the message wording below must match it.
 * The bearer token is cached per isolate and refreshed once on 401.
 */
const BASE = 'https://notify.eskiz.uz/api';
let token: string | null = null;

export const smsConfigured = () => !!(env.ESKIZ_EMAIL?.trim() && env.ESKIZ_PASSWORD?.trim());
export const bookingOtpRequired = () => env.BOOKING_PHONE_OTP === 'true';

async function login() {
  const form = new FormData();
  form.set('email', env.ESKIZ_EMAIL!.trim());
  form.set('password', env.ESKIZ_PASSWORD!.trim());
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
  try {
    let res = await send(token ?? (await login()));
    if (res.status === 401) res = await send(await login());
    if (!res.ok) throw new Error('ESKIZ_' + res.status);
  } catch (e) {
    console.error(JSON.stringify({ event: 'sms_failed', reason: String((e as Error).message || e).slice(0, 60) }));
    throw new ApiError(503, 'SMS yuborilmadi. Birozdan keyin qayta urinib ko‘ring.');
  }
}
