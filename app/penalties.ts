import { env } from 'cloudflare:workers';
import { bookingStartMs } from './booking-rules';
import { chargeCard, cardBindingEnabled } from './payme-cards';

/*
 * Late-cancellation and no-show charges. Cancelling 2 hours or more before the start is free;
 * later the charge grows as the start gets closer, and a no-show costs the top amount. The charge
 * is taken from the customer's bound card (Payme) and belongs to the restaurant: paid penalties
 * are the restaurant's balance (restaurant_balance()).
 */
export const FREE_CANCEL_MINUTES = 120;
export const PENALTY_TIERS = [
  { above: 60, amount: 50000 }, // under 2 h, more than 1 h left (≈1.5 h)
  { above: 30, amount: 100000 }, // 1 h … 31 min left
  { above: -Infinity, amount: 150000 }, // 30 min or less
] as const;
export const NO_SHOW_PENALTY = 150000;

/** Charge for cancelling now; 0 when free. */
export function cancellationPenalty(date: string, slot: string, now = Date.now()) {
  const left = (bookingStartMs(date, slot) - now) / 60000;
  if (left >= FREE_CANCEL_MINUTES) return 0;
  return PENALTY_TIERS.find((t) => left > t.above)!.amount;
}

export const PENALTY_RULES_TEXT = 'Bronni boshlanishidan 2 soat oldin ilova orqali bepul bekor qilish mumkin. Bron vaqtiga 2 soatdan kam vaqt qolganda uni ilova orqali o‘zingiz bekor qila olmaysiz: restoranga telefon qilasiz va kelishilgan jarima kartangizdan baribir yechiladi — 2 soatdan kam (≈1,5 soat) qolganda 50 000 so‘m, 1 soat qolganda 100 000 so‘m, 30 daqiqa va kam qolganda yoki kelmasangiz 150 000 so‘m. Jarima restoranga o‘tkaziladi.';

/**
 * Records and charges a penalty once per booking. Never throws: a failed charge stays 'failed'
 * (the restaurant sees it as unpaid) so the cancellation itself is never blocked by the bank.
 */
export async function chargePenalty(bookingId: string, reason: 'late_cancel' | 'no_show', amount: number) {
  if (amount <= 0) return null;
  const b = await env.DB!.prepare('SELECT b.id,b.user_id,b.restaurant_id,b.penalty_accepted,c.token FROM bookings b LEFT JOIN payment_cards c ON c.user_id=b.user_id WHERE b.id=?').bind(bookingId).first<{ id: string; user_id: string; restaurant_id: string; penalty_accepted: number; token: string | null }>();
  // Only bookings made under the accepted rules with a bound card can be charged.
  if (!b || !b.penalty_accepted || !b.token || !cardBindingEnabled()) return null;
  const id = crypto.randomUUID();
  const inserted = await env.DB!.prepare("INSERT INTO penalties (id,booking_id,user_id,restaurant_id,amount,reason,status,created_at) VALUES (?,?,?,?,?,?,'pending',?) ON CONFLICT(booking_id) DO NOTHING").bind(id, b.id, b.user_id, b.restaurant_id, amount, reason, new Date().toISOString()).run();
  if (!inserted.meta.changes) return null;
  try {
    const receipt = await chargeCard(b.token, amount, { penalty_id: id }, reason === 'no_show' ? 'Bronga kelmaganlik jarimasi' : 'Bronni kech bekor qilish jarimasi');
    await env.DB!.prepare("UPDATE penalties SET status='paid',receipt_id=?,paid_at=? WHERE id=?").bind(receipt, new Date().toISOString(), id).run();
    return { id, amount, status: 'paid' as const };
  } catch (e) {
    await env.DB!.prepare("UPDATE penalties SET status='failed',error=? WHERE id=?").bind(String((e as Error).message || e).slice(0, 200), id).run();
    return { id, amount, status: 'failed' as const };
  }
}

/** Paid penalties per restaurant (the restaurant's balance from charges). */
export const restaurantBalance = (restaurantId: string) => env.DB!.prepare("SELECT COALESCE(SUM(CASE WHEN status='paid' THEN amount END),0) AS paid,COALESCE(SUM(CASE WHEN status='failed' THEN amount END),0) AS unpaid FROM penalties WHERE restaurant_id=?").bind(restaurantId).first<{ paid: number; unpaid: number }>();
