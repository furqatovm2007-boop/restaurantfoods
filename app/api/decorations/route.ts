import { identity } from '../../access';
import { ApiError, json, failure, body, text, throttle } from '../../http';
import { restaurantAccess } from '../../staff';
import { cleanDecoration, decorationsOf, saveDecorations, MAX_DECORATIONS } from '../../decorations';
export const dynamic = 'force-dynamic';

/** Public: a restaurant's decorations for the booking form. */
export async function GET(request: Request) {
  try {
    const restaurantId = text(new URL(request.url).searchParams.get('restaurantId'));
    return json({ decorations: await decorationsOf(restaurantId) });
  } catch (e) {
    return failure(e);
  }
}

/** Owner or manager: add / edit ('save') or remove ('delete') a decoration. */
export async function POST(request: Request) {
  try {
    const b = await body(request),
      u = await identity();
    const restaurantId = text(b.restaurantId);
    await restaurantAccess(restaurantId, u, 'manager');
    await throttle('decorations:' + u!.userId, 60);
    const list = await decorationsOf(restaurantId);
    if (b.action === 'delete') {
      const next = list.filter((d) => d.id !== text(b.id));
      if (next.length === list.length) throw new ApiError(404, 'Dekoratsiya topilmadi.');
      await saveDecorations(restaurantId, next, u!.userId);
      return json({ decorations: next });
    }
    if (b.action !== 'save') throw new ApiError(400, 'Noma’lum amal.');
    const id = typeof b.decoration?.id === 'string' && list.some((d) => d.id === b.decoration.id) ? b.decoration.id : crypto.randomUUID();
    const item = cleanDecoration(b.decoration, id);
    const next = list.some((d) => d.id === id) ? list.map((d) => (d.id === id ? item : d)) : [...list, item];
    if (next.length > MAX_DECORATIONS) throw new ApiError(400, 'Bitta restoranda ' + MAX_DECORATIONS + ' tagacha dekoratsiya bo‘ladi.');
    await saveDecorations(restaurantId, next, u!.userId);
    return json({ decorations: next });
  } catch (e) {
    return failure(e);
  }
}
