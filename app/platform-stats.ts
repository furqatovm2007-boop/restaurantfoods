import { env } from 'cloudflare:workers';
import { countedReview } from './review-rules';

/*
 * Platform figures shared by the owner's 📊 Statistika (Top-3 and own rank) and the admin dashboard
 * (combined revenue, every restaurant ranked). All from D1; demo and inactive restaurants are left out of
 * the ranking.
 *  - period revenue  = advances actually paid for bookings dated in the period (online deposits + approved
 *                      receipt transfers) + totals of completed orders created in the period;
 *  - period orders   = confirmed / completed bookings (no extra-table rows) + confirmed / completed orders;
 *  - rank            = served orders of all time (completed orders + confirmed / completed bookings up to today)
 *                      weighted by the rating: score = served × rating / 5, where the rating is the public
 *                      average pulled towards 4.0 by 5 imaginary reviews (one 5★ review cannot jump a busy
 *                      4.7★ place). Ties: the higher rating, then the name.
 */
export const PERIODS: Record<string, number> = { today: 1, week: 7, month: 30 };
export const tashkentDay = (ms: number) => new Date(ms + 5 * 3600000).toISOString().slice(0, 10);
export function periodRange(period: string) {
  const days = PERIODS[period] || 1;
  const until = tashkentDay(Date.now()),
    since = tashkentDay(Date.now() - (days - 1) * 86400000);
  return { period: PERIODS[period] ? period : 'today', since, until, sinceIso: new Date(Date.parse(since + 'T00:00:00+05:00')).toISOString() };
}

export interface PeriodRow {
  restaurant_id: string;
  bookings: number;
  orders: number;
  delivery: number;
  deposits: number;
  order_revenue: number;
}
/** Period figures per restaurant (only restaurants with activity are returned). */
export async function periodByRestaurant(since: string, until: string, sinceIso: string, restaurantId?: string) {
  const one = restaurantId ? ' AND b.restaurant_id=?' : '',
    oneO = restaurantId ? ' AND o.restaurant_id=?' : '';
  const [b, o] = await Promise.all([
    env.DB!.prepare(
      `SELECT b.restaurant_id,SUM(CASE WHEN b.status IN ('confirmed','completed') THEN 1 ELSE 0 END) AS bookings,SUM(COALESCE((SELECT amount FROM deposits d WHERE d.booking_id=b.id AND d.state='paid'),0)+CASE WHEN b.deposit_status='p2p_paid' THEN COALESCE(json_extract(ps.value,'$.paid'),json_extract(ps.value,'$.deposit'),json_extract(ps.value,'$.total'),json_extract(ps.value,'$.amount'),0) ELSE 0 END) AS deposits FROM bookings b LEFT JOIN app_settings ps ON ps.key='p2p:'||b.id WHERE b.date BETWEEN ? AND ? AND b.deposit_status<>'group_hold'${one} GROUP BY b.restaurant_id`,
    )
      .bind(since, until, ...(restaurantId ? [restaurantId] : []))
      .all<any>(),
    env.DB!.prepare(
      `SELECT o.restaurant_id,SUM(CASE WHEN o.status IN ('confirmed','completed') THEN 1 ELSE 0 END) AS orders,SUM(CASE WHEN o.fulfillment='delivery' AND o.status<>'cancelled' THEN 1 ELSE 0 END) AS delivery,SUM(CASE WHEN o.status='completed' THEN o.total ELSE 0 END) AS order_revenue FROM orders o WHERE o.created_at>=?${oneO} GROUP BY o.restaurant_id`,
    )
      .bind(sinceIso, ...(restaurantId ? [restaurantId] : []))
      .all<any>(),
  ]);
  const map = new Map<string, PeriodRow>();
  const row = (id: string) => map.get(id) || map.set(id, { restaurant_id: id, bookings: 0, orders: 0, delivery: 0, deposits: 0, order_revenue: 0 }).get(id)!;
  for (const x of b.results) Object.assign(row(x.restaurant_id), { bookings: Number(x.bookings) || 0, deposits: Number(x.deposits) || 0 });
  for (const x of o.results) Object.assign(row(x.restaurant_id), { orders: Number(x.orders) || 0, delivery: Number(x.delivery) || 0, order_revenue: Number(x.order_revenue) || 0 });
  return map;
}

export interface Ranked {
  rank: number;
  id: string;
  name: string;
  rating: number | null;
  reviews: number;
  served: number;
  score: number;
}
const PRIOR = 4,
  PRIOR_N = 5;
/** Every active, non-demo restaurant ranked (see the note above). */
export async function ranking(): Promise<Ranked[]> {
  const today = tashkentDay(Date.now());
  const rows = (
    await env.DB!.prepare(
      `SELECT r.id,r.name,(SELECT AVG(rv.stars) FROM reviews rv WHERE rv.restaurant_id=r.id AND ${countedReview('rv', 'r')}) AS avg,(SELECT COUNT(*) FROM reviews rv WHERE rv.restaurant_id=r.id AND ${countedReview('rv', 'r')}) AS n,(SELECT COUNT(*) FROM orders o WHERE o.restaurant_id=r.id AND o.status='completed')+(SELECT COUNT(*) FROM bookings b WHERE b.restaurant_id=r.id AND b.status IN ('confirmed','completed') AND b.date<=? AND b.deposit_status<>'group_hold') AS served FROM restaurants r WHERE r.status='active' AND COALESCE(r.is_demo,0)=0 AND r.id NOT LIKE 'rf-demo-%'`,
    )
      .bind(today)
      .all<any>()
  ).results;
  return rows
    .map((r) => {
      const n = Number(r.n) || 0,
        avg = r.avg == null ? null : Number(r.avg);
      const bayes = (PRIOR * PRIOR_N + (avg ?? 0) * n) / (PRIOR_N + n);
      const served = Number(r.served) || 0;
      return { id: r.id, name: r.name, rating: avg == null ? null : Math.round(avg * 10) / 10, reviews: n, served, score: Math.round(served * (bayes / 5) * 100) / 100, bayes };
    })
    .sort((a, b) => b.score - a.score || b.bayes - a.bayes || String(a.name).localeCompare(String(b.name)))
    .map(({ bayes: _b, ...r }, i) => ({ rank: i + 1, ...r }));
}
