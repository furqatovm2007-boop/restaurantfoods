import { identity } from '../../../access';
import { ApiError, body, failure, integer, json, sameOrigin, text, throttle } from '../../../http';
import { bookingSlot } from '../../../booking-rules';
import { interval } from '../../../table-rules';
import { placeHold, releaseHolds } from '../../../holds';
import { walkinTables, WALKIN_ONLY } from '../../../hall-layout';
export const dynamic = 'force-dynamic';

/** POST {action:'hold', restaurantId, table, mergeTable?, date, slot, endSlot} → {expiresAt}; {action:'release'}. */
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const u = await identity();
    if (!u) throw new ApiError(401, 'Bron qilish uchun akkauntingizga kiring.');
    const b = await body(request);
    if (b.action === 'release') {
      await releaseHolds(u.userId);
      return json({ ok: true });
    }
    await throttle('hold:' + u.userId, 40);
    const restaurantId = text(b.restaurantId),
      date = text(b.date),
      slot = text(b.slot),
      endSlot = text(b.endSlot);
    bookingSlot(date, slot);
    interval(slot, endSlot);
    const tables = [integer(b.table, 1, 999), ...(b.mergeTable != null ? [integer(b.mergeTable, 1, 999)] : [])];
    // Walk-in-only tables (the owner's 70/30 buffer) cannot be held for an online booking.
    const walkins = await walkinTables(restaurantId);
    if (tables.some((n) => walkins.has(n))) throw new ApiError(409, WALKIN_ONLY);
    return json({ expiresAt: await placeHold(restaurantId, u.userId, tables, date, slot, endSlot) });
  } catch (e) {
    return failure(e);
  }
}
