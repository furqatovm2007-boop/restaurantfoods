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
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    const id = bookingId(request);
    const b = await ownWaiting(id, u.userId);
    const s = await p2pState(id);
    if (!s) throw new ApiError(404, 'To‘lov kutilayotgan bron topilmadi.');
    return json({ ...paymentInfo(s.amount, s.until), status: b.deposit_status });
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
    return json(await submitReceipt(id, u.userId, request));
  } catch (e) {
    return failure(e);
  }
}
