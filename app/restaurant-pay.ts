import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * A restaurant's own payment details (set by its owner or the admin; no migration: app_settings pay:<restaurantId>):
 *  clickPayUrl — the restaurant's Click Business / Click Pass payment link (https://…click.uz/…): the guest gets a
 *                1-tap "Click orqali to‘lash" button with the exact amount and the booking id added;
 *  card, holder — the restaurant's card, shown when there is no Click link.
 * Without either the central card (app/p2p.ts) is used. The receipt check stays the same.
 */
export interface RestaurantPay {
  clickPayUrl: string;
  card: string;
  holder: string;
}
const EMPTY: RestaurantPay = { clickPayUrl: '', card: '', holder: '' };
const key = (id: string) => 'pay:' + id;

export async function getRestaurantPay(restaurantId: string): Promise<RestaurantPay> {
  const row = await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key(restaurantId)).first<{ value: string }>();
  try {
    return row ? { ...EMPTY, ...JSON.parse(row.value) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

/** Only https links on click.uz (my.click.uz, indoor.click.uz…); amount / transaction_param are added per booking. */
export function clickUrl(raw: unknown) {
  const v = typeof raw === 'string' ? raw.trim() : '';
  if (!v) return '';
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    throw new ApiError(400, 'Click havolasi noto‘g‘ri.');
  }
  if (u.protocol !== 'https:' || !/(^|\.)click\.uz$/.test(u.hostname)) throw new ApiError(400, 'Click havolasi https://…click.uz bilan boshlanishi kerak (masalan https://my.click.uz/services/pay?service_id=…&merchant_id=…).');
  u.searchParams.delete('amount');
  u.searchParams.delete('transaction_param');
  return u.toString().slice(0, 500);
}
export function cardNumber(raw: unknown) {
  const d = String(raw ?? '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length !== 16) throw new ApiError(400, 'Karta raqami 16 ta raqam bo‘lishi kerak.');
  return d.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export async function saveRestaurantPay(restaurantId: string, b: Record<string, unknown>) {
  const value: RestaurantPay = { clickPayUrl: clickUrl(b.clickPayUrl), card: cardNumber(b.cardNumber), holder: String(b.cardHolder ?? '').trim().slice(0, 60) };
  if (value.card && !value.holder) throw new ApiError(400, 'Karta egasining ismini kiriting.');
  if (!value.clickPayUrl && !value.card) await env.DB!.prepare('DELETE FROM app_settings WHERE key=?').bind(key(restaurantId)).run();
  else await env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'pay') ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(key(restaurantId), JSON.stringify(value), new Date().toISOString()).run();
  return value;
}
