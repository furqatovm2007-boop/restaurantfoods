import { identity } from '../../../access';
import { ApiError, json, failure, body, text } from '../../../http';
import { restaurantAccess } from '../../../staff';
import { getRestaurantPay, saveRestaurantPay } from '../../../restaurant-pay';
export const dynamic = 'force-dynamic';

/** The restaurant's payment details (Click link, card) — its owner or the admin (app/restaurant-pay.ts). */
async function owned(restaurantId: string) {
  const u = await identity();
  if (!u) throw new ApiError(401, 'Avval kiring.');
  const { r } = await restaurantAccess(restaurantId, u, 'owner');
  if (!r) throw new ApiError(403, 'Bu restoran sizga tegishli emas.');
}

export async function GET(request: Request) {
  try {
    const restaurantId = text(new URL(request.url).searchParams.get('restaurantId'));
    await owned(restaurantId);
    return json(await getRestaurantPay(restaurantId));
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    const b = await body(request);
    const restaurantId = text(b.restaurantId);
    await owned(restaurantId);
    return json({ ok: true, ...(await saveRestaurantPay(restaurantId, b)) });
  } catch (e) {
    return failure(e);
  }
}
