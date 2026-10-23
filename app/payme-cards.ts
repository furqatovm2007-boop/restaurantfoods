import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * Payme Subscribe API (card binding and recurring charges). The browser tokenizes the card
 * directly with Payme using only the public cash-register id (cards.create → SMS code →
 * cards.verify), so the card number and the SMS code never pass through our server. The server
 * keeps the token and charges it with the secret key (receipts.create + receipts.pay).
 * Enabled by PAYME_SUBSCRIBE=true (Payme turns the Subscribe API on per cash register);
 * PAYME_TEST=true uses Payme's test environment.
 */
export const cardBindingEnabled = () => env.PAYME_SUBSCRIBE === 'true' && !!env.PAYME_MERCHANT_ID?.trim() && !!env.PAYME_KEY?.trim();
export const paymeEndpoint = () => (env.PAYME_TEST === 'true' ? 'https://checkout.test.paycom.uz/api' : 'https://checkout.paycom.uz/api');

export class PaymeError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

async function rpc(method: string, params: unknown) {
  if (!cardBindingEnabled()) throw new ApiError(503, 'Karta to‘lovi hali ulanmagan.');
  let res: Response;
  try {
    res = await fetch(paymeEndpoint(), { method: 'POST', headers: { 'X-Auth': env.PAYME_MERCHANT_ID!.trim() + ':' + env.PAYME_KEY!.trim(), 'Content-Type': 'application/json' }, body: JSON.stringify({ id: Date.now(), method, params }), signal: AbortSignal.timeout(15000) });
  } catch {
    console.error(JSON.stringify({ event: 'payme_unreachable', method }));
    throw new PaymeError(-1, 'Payme bilan bog‘lanib bo‘lmadi.');
  }
  const data = (await res.json().catch(() => ({}))) as { result?: any; error?: { code?: number; message?: unknown } };
  if (data.error || !data.result) {
    const m = data.error?.message;
    const message = typeof m === 'string' ? m : (m as Record<string, string> | undefined)?.uz || (m as Record<string, string> | undefined)?.ru || 'Payme rad etdi.';
    console.error(JSON.stringify({ event: 'payme_failed', method, code: data.error?.code ?? res.status }));
    throw new PaymeError(Number(data.error?.code ?? -1), String(message).slice(0, 200));
  }
  return data.result;
}

/** A token is accepted only for a verified card that allows recurring charges. */
export async function checkCard(token: string) {
  const card = (await rpc('cards.check', { token }))?.card;
  if (!card?.verify || !card.recurrent) throw new ApiError(400, 'Karta tasdiqlanmagan yoki avtomatik yechishga ruxsat bermaydi.');
  return { masked: String(card.number || '').slice(0, 19), expire: String(card.expire || '').slice(0, 5) };
}

/** Charges `amount` so'm from the saved card. Returns the Payme receipt id once paid (state 4). */
export async function chargeCard(token: string, amount: number, account: Record<string, string>, description: string) {
  const created = await rpc('receipts.create', { amount: amount * 100, account, description: description.slice(0, 200) });
  const id = created?.receipt?._id;
  if (!id) throw new PaymeError(-1, 'Chek yaratilmadi.');
  const paid = await rpc('receipts.pay', { id, token });
  if (paid?.receipt?.state !== 4) throw new PaymeError(-1, 'To‘lov yakunlanmadi.');
  return String(id);
}

export const removeCard = (token: string) => rpc('cards.remove', { token }).catch(() => null);
