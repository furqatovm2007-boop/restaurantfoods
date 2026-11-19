import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, sameOrigin, throttle } from '../../../http';
import { submitReceipt, p2pState, paymentInfo } from '../../../p2p';
export const dynamic = 'force-dynamic';

/*
 * Central-card prepayment (app/p2p.ts) for the guest's own booking:
 *  GET  ?id=…  the card, holder, exact amount and the deadline (while the transfer is awaited);
 *  POST ?id=…  the receipt screenshot as the request body (image/*, ≤ 5 MB) → sent to the owner's Telegram.
 */
const ownWaiting = async (id: string, userId: string) => {
  const b = await env.DB!.prepare('SELECT user_id,status,deposit_status FROM bookings WHERE id=?').bind(id).first<{ user_id: string; status: string; deposit_status: string }>();
  if (!b || b.user_id !== userId || b.status !== 'pending' || !['p2p_wait', 'p2p_review'].includes(b.deposit_status)) throw new ApiError(404, 'To‘lov kutilayotgan bron topilmadi.');
  return b;
};
const bookingId = (request: Request) => {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new ApiError(400, 'Bron raqami noto‘g‘ri.');
  return id;
};

export async function GET(request: Request) {
  try {
    // ?status=1: only the payment state of this booking (no personal data; the id is an unguessable UUID) — for the
    // return from the Click app, which may open in a browser without the guest's session.
    if (new URL(request.url).searchParams.get('status') === '1') {
      const s = await env.DB!.prepare('SELECT status,deposit_status FROM bookings WHERE id=?').bind(bookingId(request)).first<{ status: string; deposit_status: string }>();
      const state = !s ? 'unknown' : s.status === 'cancelled' || s.status === 'rejected' ? 'cancelled' : s.deposit_status === 'p2p_paid' ? 'paid' : s.deposit_status === 'p2p_review' ? 'review' : s.deposit_status === 'p2p_wait' ? 'wait' : s.status === 'confirmed' ? 'confirmed' : 'pending';
      return json({ state });
    }
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    const id = bookingId(request);
    const b = await ownWaiting(id, u.userId);
    const s = await p2pState(id);
    if (!s) throw new ApiError(404, 'To‘lov kutilayotgan bron topilmadi.');
    return json({ ...paymentInfo(s), status: b.deposit_status });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    const id = bookingId(request);
    await throttle('p2p-receipt:' + u.userId, 10, 3600000);
    // ?deposit= the amount sent now (full bill or an advance, checked against the minimum).
    return json(await submitReceipt(id, u.userId, request, Date.now(), new URL(request.url).searchParams.get('deposit')));
  } catch (e) {
    return failure(e);
  }
}
