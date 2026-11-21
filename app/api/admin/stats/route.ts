import { identity } from '../../../access';
import { ApiError, json, failure } from '../../../http';
import { periodRange, periodByRestaurant, ranking } from '../../../platform-stats';
export const dynamic = 'force-dynamic';

/**
 * Admin dashboard: combined revenue, bookings and deliveries of the whole platform for today / 7 / 30 days,
 * and every restaurant ranked (rating, reviews, orders and revenue of the period). Demo restaurants are
 * not part of the platform figures.
 */
export async function GET(request: Request) {
  try {
    const u = await identity();
    if (u?.role !== 'admin') throw new ApiError(403, 'Ruxsat yo‘q.');
    const p = periodRange(new URL(request.url).searchParams.get('period') || 'today');
    const [per, ranked] = await Promise.all([periodByRestaurant(p.since, p.until, p.sinceIso), ranking()]);
    const real = new Set(ranked.map((r) => r.id));
    const totals = { revenue: 0, deposits: 0, orderRevenue: 0, bookings: 0, orders: 0, delivery: 0 };
    for (const [id, x] of per) {
      if (!real.has(id)) continue;
      totals.deposits += x.deposits;
      totals.orderRevenue += x.order_revenue;
      totals.bookings += x.bookings;
      totals.orders += x.orders;
      totals.delivery += x.delivery;
    }
    totals.revenue = totals.deposits + totals.orderRevenue;
    return json({
      ...p,
      totals,
      restaurants: ranked.map((r) => {
        const x = per.get(r.id);
        return { ...r, periodOrders: (x?.bookings || 0) + (x?.orders || 0), periodRevenue: (x?.deposits || 0) + (x?.order_revenue || 0) };
      }),
    });
  } catch (e) {
    return failure(e);
  }
}
