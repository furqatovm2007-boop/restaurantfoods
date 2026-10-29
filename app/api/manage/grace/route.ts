import { identity } from '../../../access';
import { ApiError, json, failure, body, text, throttle } from '../../../http';
import { restaurantAccess } from '../../../staff';
import { releaseBooking, coffeeBonus } from '../../../grace';
export const dynamic = 'force-dynamic';

/** Hostess and up: release a late booking's table to walk-in guests, or send the coffee bonus (app/grace.ts). */
export async function POST(request: Request) {
  try {
    const b = await body(request),
      u = await identity();
    const restaurantId = text(b.restaurantId),
      bookingId = text(b.bookingId);
    await restaurantAccess(restaurantId, u, 'hostess');
    await throttle('grace:' + u!.userId, 60);
    if (b.action === 'release') return json(await releaseBooking(restaurantId, bookingId, b.force === true));
    if (b.action === 'coffee') return json(await coffeeBonus(restaurantId, bookingId, u!.userId));
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
