import { identity } from '../../../access';
import { ApiError, json, failure, body, text, throttle } from '../../../http';
import { restaurantAccess } from '../../../staff';
import { cleanEntry, queueOf, saveQueue, MAX_QUEUE } from '../../../live-queue';
export const dynamic = 'force-dynamic';

/** Staff (hostess and up): the hall's live queue, oldest first. */
export async function GET(request: Request) {
  try {
    const u = await identity();
    const restaurantId = text(new URL(request.url).searchParams.get('restaurantId'));
    await restaurantAccess(restaurantId, u, 'hostess');
    return json({ queue: await queueOf(restaurantId) });
  } catch (e) {
    return failure(e);
  }
}

/** Staff: add a waiting party ('add'), or take one off the queue ('seat' / 'remove'). */
export async function POST(request: Request) {
  try {
    const b = await body(request),
      u = await identity();
    const restaurantId = text(b.restaurantId);
    await restaurantAccess(restaurantId, u, 'hostess');
    await throttle('livequeue:' + u!.userId, 120);
    const list = await queueOf(restaurantId);
    if (b.action === 'add') {
      if (list.length >= MAX_QUEUE) throw new ApiError(400, 'Navbatda ' + MAX_QUEUE + ' tagacha mehmon bo‘ladi.');
      const next = [...list, cleanEntry(b)];
      await saveQueue(restaurantId, next, u!.userId);
      return json({ queue: next }, 201);
    }
    if (b.action === 'seat' || b.action === 'remove') {
      const next = list.filter((e) => e.id !== text(b.id));
      if (next.length === list.length) throw new ApiError(404, 'Navbatda bunday mehmon yo‘q.');
      await saveQueue(restaurantId, next, u!.userId);
      return json({ queue: next });
    }
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
