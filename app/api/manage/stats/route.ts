import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure } from '../../../http';
import { countedReview } from '../../../review-rules';
export const dynamic = 'force-dynamic';

/*
 * 📊 Owner analytics (#/stats): one restaurant of the signed-in owner / manager (the admin: any), for today,
 * the last 7 or the last 30 days (Tashkent days). Everything comes from D1:
 *  - revenue  = advances actually paid for bookings in the period (online deposits + approved receipt
 *               transfers) + totals of completed orders created in the period;
 *  - orders   = confirmed / completed bookings (one per reservation, extra tables of a group not counted) +
 *               confirmed / completed delivery & pickup orders; pending ones are counted apart ("to confirm");
 *  - top dishes from order items and pre-ordered booking dishes (not cancelled), by quantity, with revenue;
 *  - rating   = the public rating (countedReview) and the latest reviews.
 */
const PERIODS: Record<string, number> = { today: 1, week: 7, month: 30 };
const day = (ms: number) => new Date(ms + 5 * 3600000).toISOString().slice(0, 10);

export async function GET(request: Request) {
  try {
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    const q = new URL(request.url).searchParams;
    const period = PERIODS[q.get('period') || 'today'] ? q.get('period') || 'today' : 'today';
    const mine = (
      await env.DB!.prepare(
        u.role === 'admin'
          ? "SELECT id,name,is_demo FROM restaurants WHERE status<>'deleted' ORDER BY name LIMIT 200"
          : "SELECT id,name,is_demo FROM restaurants WHERE status<>'deleted' AND (owner_id=?1 OR id IN (SELECT restaurant_id FROM restaurant_staff WHERE user_id=?1 AND role='manager')) ORDER BY name",
      )
        .bind(...(u.role === 'admin' ? [] : [u.userId]))
        .all<{ id: string; name: string; is_demo: number }>()
    ).results;
    if (!mine.length) return json({ period, restaurants: [], restaurant: null });
    const r = mine.find((x) => x.id === q.get('restaurantId')) || mine[0];
    const today = day(Date.now()),
      since = day(Date.now() - (PERIODS[period] - 1) * 86400000),
      sinceIso = new Date(Date.parse(since + 'T00:00:00+05:00')).toISOString();

    const [bookings, orders, rating, reviews] = await Promise.all([
      env.DB!.prepare(
        "SELECT b.id,b.status,b.preorder_items,b.deposit_status,(SELECT amount FROM deposits d WHERE d.booking_id=b.id AND d.state='paid') AS deposit_paid,CASE WHEN b.deposit_status='p2p_paid' THEN COALESCE(json_extract(ps.value,'$.paid'),json_extract(ps.value,'$.deposit'),json_extract(ps.value,'$.total'),json_extract(ps.value,'$.amount')) END AS p2p_paid FROM bookings b LEFT JOIN app_settings ps ON ps.key='p2p:'||b.id WHERE b.restaurant_id=? AND b.date BETWEEN ? AND ? AND b.deposit_status<>'group_hold'",
      )
        .bind(r.id, since, today)
        .all<any>(),
      env.DB!.prepare('SELECT id,status,total,items,fulfillment FROM orders WHERE restaurant_id=? AND created_at>=?').bind(r.id, sinceIso).all<any>(),
      env.DB!.prepare(`SELECT AVG(stars) AS avg,COUNT(*) AS n FROM reviews rv JOIN restaurants r ON r.id=rv.restaurant_id WHERE rv.restaurant_id=? AND ${countedReview('rv', 'r')}`).bind(r.id).first<{ avg: number | null; n: number }>(),
      env.DB!.prepare(`SELECT rv.stars,rv.comment,rv.created_at,a.name FROM reviews rv JOIN restaurants r ON r.id=rv.restaurant_id LEFT JOIN accounts a ON a.id=rv.user_id WHERE rv.restaurant_id=? AND ${countedReview('rv', 'r')} ORDER BY rv.created_at DESC LIMIT 10`).bind(r.id).all<any>(),
    ]);

    const done = (s: string) => s === 'confirmed' || s === 'completed';
    let depositRevenue = 0,
      orderRevenue = 0;
    const dishes = new Map<string, { name: string; quantity: number; revenue: number }>();
    const addItems = (raw: unknown) => {
      let list: any[] = [];
      try {
        list = typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
      } catch {}
      for (const it of Array.isArray(list) ? list : []) {
        const qn = Number(it?.quantity) || 0,
          price = Number(it?.price) || 0,
          name = String(it?.name || '').slice(0, 80);
        if (!qn || !name) continue;
        const key = String(it?.id || name);
        const d = dishes.get(key) || { name, quantity: 0, revenue: 0 };
        d.quantity += qn;
        d.revenue += qn * price;
        dishes.set(key, d);
      }
    };
    let bookingsDone = 0,
      bookingsPending = 0;
    for (const b of bookings.results) {
      depositRevenue += (Number(b.deposit_paid) || 0) + (Number(b.p2p_paid) || 0);
      if (done(b.status)) bookingsDone++;
      if (b.status === 'pending' && !['p2p_wait', 'p2p_review'].includes(b.deposit_status)) bookingsPending++;
      if (b.status !== 'cancelled') addItems(b.preorder_items);
    }
    let ordersDone = 0,
      ordersPending = 0,
      delivery = 0;
    for (const o of orders.results) {
      if (o.status === 'completed') orderRevenue += Number(o.total) || 0;
      if (done(o.status)) ordersDone++;
      if (o.status === 'pending') ordersPending++;
      if (o.fulfillment === 'delivery' && o.status !== 'cancelled') delivery++;
      if (o.status !== 'cancelled') addItems(o.items);
    }
    const top = [...dishes.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue).slice(0, 10);
    return json({
      period,
      since,
      until: today,
      restaurants: mine.map(({ id, name }) => ({ id, name })),
      restaurant: { id: r.id, name: r.name, demo: !!r.is_demo || r.id.startsWith('rf-demo-') },
      revenue: { total: depositRevenue + orderRevenue, deposits: depositRevenue, orders: orderRevenue },
      count: { total: bookingsDone + ordersDone, bookings: bookingsDone, orders: ordersDone, delivery, pending: bookingsPending + ordersPending },
      rating: { average: rating?.avg ? Math.round(rating.avg * 10) / 10 : null, count: Number(rating?.n) || 0 },
      top,
      reviews: reviews.results.map((x: any) => ({ stars: x.stars, comment: String(x.comment || '').slice(0, 500), at: x.created_at, name: x.name && !String(x.name).startsWith('guest:') ? String(x.name).split(' ')[0] : '' })),
    });
  } catch (e) {
    return failure(e);
  }
}
