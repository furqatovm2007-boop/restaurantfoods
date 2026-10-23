import { env } from 'cloudflare:workers';
import { notifyBooking, notifyCustomer } from './telegram';

/*
 * Booking deposits paid through Click or Payme. A deposit holds the table for HOLD_MS;
 * unpaid ones are released by sweepDeposits(). Payment state only changes from the
 * provider callbacks (app/api/payments/*), never from the browser.
 */
export const HOLD_MS = 30 * 60000;
export type Provider = 'click' | 'payme';

export function depositProviders(): Provider[] {
  const list: Provider[] = [];
  if (env.CLICK_SERVICE_ID?.trim() && env.CLICK_MERCHANT_ID?.trim() && env.CLICK_SECRET_KEY?.trim()) list.push('click');
  if (env.PAYME_MERCHANT_ID?.trim() && env.PAYME_KEY?.trim()) list.push('payme');
  return list;
}

export function paymentLinks(depositId: string, amount: number, returnUrl: string) {
  const links: Partial<Record<Provider, string>> = {};
  const providers = depositProviders();
  if (providers.includes('click'))
    links.click =
      'https://my.click.uz/services/pay?' +
      new URLSearchParams({ service_id: env.CLICK_SERVICE_ID!.trim(), merchant_id: env.CLICK_MERCHANT_ID!.trim(), amount: String(amount), transaction_param: depositId, return_url: returnUrl });
  if (providers.includes('payme')) links.payme = 'https://checkout.paycom.uz/' + btoa(`m=${env.PAYME_MERCHANT_ID!.trim()};ac.deposit_id=${depositId};a=${amount * 100};c=${returnUrl}`);
  return links;
}

export async function createDeposit(bookingId: string, restaurantId: string, amount: number) {
  const id = crypto.randomUUID();
  await env.DB!.prepare('INSERT INTO deposits (id,booking_id,restaurant_id,amount,created_at) VALUES (?,?,?,?,?)').bind(id, bookingId, restaurantId, amount, new Date().toISOString()).run();
  return id;
}

export interface DepositRow {
  id: string;
  booking_id: string;
  restaurant_id: string;
  amount: number;
  state: string;
  provider: string | null;
  click_trans_id: string | null;
  click_prepare_id: number | null;
  payme_transaction: string | null;
  payme_state: number | null;
  payme_create_time: number | null;
  payme_perform_time: number | null;
  payme_cancel_time: number | null;
  payme_reason: number | null;
  created_at: string;
  booking_status: string;
}

const SELECT = 'SELECT d.*,b.status AS booking_status FROM deposits d JOIN bookings b ON b.id=d.booking_id WHERE ';
export const depositById = (id: string) => env.DB!.prepare(SELECT + 'd.id=?').bind(id).first<DepositRow>();
export const depositByPayme = (transaction: string) => env.DB!.prepare(SELECT + 'd.payme_transaction=?').bind(transaction).first<DepositRow>();

/** Unpaid and its booking still active. */
export const active = (d: DepositRow | null): d is DepositRow => !!d && d.state === 'pending' && ['pending', 'confirmed'].includes(d.booking_status);
/** A payment may start now: active and inside the hold window. */
export const payable = (d: DepositRow | null): d is DepositRow => active(d) && Date.parse(d.created_at) + HOLD_MS > Date.now();

/** Marks the deposit paid once and sends the Telegram card. Returns false if it was not pending. */
export async function markPaid(id: string, provider: Provider) {
  const done = await env.DB!.prepare("UPDATE deposits SET state='paid',provider=?,paid_at=? WHERE id=? AND state='pending'").bind(provider, new Date().toISOString(), id).run();
  if (!done.meta.changes) return false;
  const d = await depositById(id);
  if (d) {
    await env.DB!.prepare("UPDATE bookings SET deposit_status='paid' WHERE id=?").bind(d.booking_id).run();
    await notifyBooking(d.booking_id);
    await notifyCustomer(d.booking_id, 'created');
  }
  return true;
}

/** Cancels an unpaid deposit and frees its table, or marks a paid one refunded. */
export async function cancelDeposit(id: string, refunded = false) {
  const from = refunded ? 'paid' : 'pending',
    to = refunded ? 'refunded' : 'cancelled';
  const done = await env.DB!.prepare('UPDATE deposits SET state=? WHERE id=? AND state=?').bind(to, id, from).run();
  if (!done.meta.changes) return false;
  await env.DB!.prepare("UPDATE bookings SET deposit_status=?,status=CASE WHEN status IN ('pending','confirmed') THEN 'cancelled' ELSE status END WHERE id=(SELECT booking_id FROM deposits WHERE id=?)").bind(to, id).run();
  return true;
}

/** Releases tables held by deposits nobody paid. A Payme transaction in progress keeps its hold. */
export async function sweepDeposits(now = Date.now()) {
  const cutoff = new Date(now - HOLD_MS).toISOString();
  const stale = await env.DB!.prepare("SELECT id FROM deposits WHERE state='pending' AND created_at<? AND NOT (COALESCE(payme_state,0)=1 AND COALESCE(payme_create_time,0)>?) LIMIT 50").bind(cutoff, now - HOLD_MS).all<{ id: string }>();
  for (const { id } of stale.results) await cancelDeposit(id);
  return stale.results.length;
}
