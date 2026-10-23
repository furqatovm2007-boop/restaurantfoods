import { env } from 'cloudflare:workers';
import { identity } from '../../access';
import { ApiError, json, failure, body, text, throttle } from '../../http';
import { cardBindingEnabled, paymeEndpoint, checkCard, removeCard } from '../../payme-cards';
import { PENALTY_RULES_TEXT, PENALTY_TIERS, NO_SHOW_PENALTY, FREE_CANCEL_MINUTES } from '../../penalties';
export const dynamic = 'force-dynamic';

/*
 * The customer's bound card. GET tells the page whether binding is on and which public Payme
 * cash-register id to tokenize with; POST {action:'save', token} stores a token the browser got
 * from Payme after the SMS check (verified again here with cards.check); 'remove' unbinds it.
 * The token is never returned to the browser.
 */
export async function GET() {
  try {
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval akkauntingizga kiring.');
    const card = await env.DB!.prepare('SELECT masked,expire,created_at FROM payment_cards WHERE user_id=?').bind(u.userId).first();
    const enabled = cardBindingEnabled();
    return json({ enabled, required: enabled, merchantId: enabled ? env.PAYME_MERCHANT_ID!.trim() : null, endpoint: enabled ? paymeEndpoint() : null, card, rules: { text: PENALTY_RULES_TEXT, freeMinutes: FREE_CANCEL_MINUTES, tiers: PENALTY_TIERS.map((t) => ({ above: Number.isFinite(t.above) ? t.above : 0, amount: t.amount })), noShow: NO_SHOW_PENALTY } });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    const b = await body(request),
      u = await identity();
    if (!u) throw new ApiError(401, 'Avval akkauntingizga kiring.');
    await throttle('card:' + u.userId, 10);
    if (!cardBindingEnabled()) throw new ApiError(503, 'Karta ulash hali yoqilmagan.');
    const old = await env.DB!.prepare('SELECT token FROM payment_cards WHERE user_id=?').bind(u.userId).first<{ token: string }>();
    if (b.action === 'save') {
      if (b.acceptRules !== true) throw new ApiError(400, 'Jarima qoidalariga rozilik bildiring.');
      const token = text(b.token, 10, 2000);
      const card = await checkCard(token);
      await env.DB!.prepare('INSERT INTO payment_cards (id,user_id,provider,token,masked,expire,created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET token=excluded.token,masked=excluded.masked,expire=excluded.expire,created_at=excluded.created_at').bind(crypto.randomUUID(), u.userId, 'payme', token, card.masked, card.expire, new Date().toISOString()).run();
      if (old && old.token !== token) await removeCard(old.token);
      return json({ ok: true, card });
    }
    if (b.action === 'remove') {
      if (!old) return json({ ok: true });
      // Upcoming bookings were accepted with this card as the guarantee.
      const active = await env.DB!.prepare("SELECT 1 FROM bookings WHERE user_id=? AND penalty_accepted=1 AND status IN ('pending','confirmed') AND date>=date('now','+5 hours') LIMIT 1").bind(u.userId).first();
      if (active) throw new ApiError(409, 'Faol broningiz bor — karta kafolat sifatida kerak. Avval bronni yakunlang yoki bekor qiling.');
      await env.DB!.prepare('DELETE FROM payment_cards WHERE user_id=?').bind(u.userId).run();
      await removeCard(old.token);
      return json({ ok: true });
    }
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
