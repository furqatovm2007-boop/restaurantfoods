import { env } from 'cloudflare:workers';
import { identity } from '../../access';
import { ApiError, body, failure, integer, json, sameOrigin, text, throttle } from '../../http';
import { restaurantAccess } from '../../staff';
import { cancelOrder, closeOrder, orderById, orderItems, paymentOf, saveOrder, SERVICE_RATES, todaysBookings, type TableOrderRow } from '../../hall';
export const dynamic = 'force-dynamic';

/*
 * Hall cash desk API (waiters and up): the tables with their status (Bo‘sh / Band / Bron qilingan), open bills
 * and today's bookings, the menu, and save / close / cancel of a table's bill. Cancelling a bill with dishes
 * needs a manager or the owner.
 */
const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');
const orderView = (o: TableOrderRow) => ({
  id: o.id,
  table: o.table_number,
  items: orderItems(o),
  servicePercent: o.service_percent,
  subtotal: o.subtotal,
  service: o.service,
  total: o.total,
  status: o.status,
  payment: o.payment,
  receiptNo: o.receipt_no,
  customer: o.booking_id || o.customer_name ? { name: o.customer_name, phone: o.customer_phone, bookingId: o.booking_id } : null,
  waiter: o.waiter_name,
  openedAt: o.opened_at,
  closedAt: o.closed_at,
  version: o.updated_at,
  notified: !!o.notified_at,
  receiptUrl: site() + '/#/chek/' + encodeURIComponent(o.id) + '/' + o.receipt_key,
});

async function staff(restaurantId: string, need: 'waiter' | 'manager' = 'waiter') {
  const u = await identity();
  if (!u) throw new ApiError(401, 'Avval kiring.');
  const { r, level } = await restaurantAccess(restaurantId, u, need);
  return { u, r, level };
}

export async function GET(request: Request) {
  try {
    const restaurantId = text(new URL(request.url).searchParams.get('restaurantId'));
    const { r, level } = await staff(restaurantId);
    const [tables, open, menu, bookings] = await Promise.all([
      env.DB!.prepare('SELECT number,seats,floor,atmosphere FROM restaurant_tables WHERE restaurant_id=? AND active=1 ORDER BY floor,number').bind(restaurantId).all<any>(),
      env.DB!.prepare("SELECT * FROM table_orders WHERE restaurant_id=? AND status='open'").bind(restaurantId).all<TableOrderRow>(),
      env.DB!.prepare('SELECT id,name,price,category,image_url FROM menu WHERE restaurant_id=? AND available=1 ORDER BY category,name').bind(restaurantId).all<any>(),
      todaysBookings(restaurantId),
    ]);
    const orders = new Map(open.results.map((o) => [o.table_number, o]));
    return json({
      restaurant: { id: r.id, name: r.name, address: r.address || '', phone: r.phone || '', serviceFee: SERVICE_RATES.includes(Number(r.service_fee_percent)) ? Number(r.service_fee_percent) : 0 },
      canCancel: level === 'manager' || level === 'owner',
      tables: tables.results.map((t) => {
        const o = orders.get(t.number),
          b = bookings.get(t.number);
        // "Bron qilingan" when the booking is going on now or starts within 3 hours.
        const reserved = !o && b && b.startsIn <= 180;
        return {
          number: t.number,
          seats: t.seats,
          floor: t.floor,
          vip: /vip/i.test(t.atmosphere || ''),
          status: o ? 'busy' : reserved ? 'reserved' : 'free',
          order: o ? orderView(o) : null,
          booking: b ? { id: b.id, name: b.name, phone: b.phone, slot: b.slot, endSlot: b.endSlot, guests: b.guests, telegram: b.telegram, status: b.status, soon: b.startsIn <= 180 } : null,
        };
      }),
      menu: menu.results,
    });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const b = await body(request),
      restaurantId = text(b.restaurantId),
      action = text(b.action);
    const { u, level } = await staff(restaurantId);
    await throttle('hall:' + u.userId, 900);
    if (action === 'save') {
      const order = await saveOrder(restaurantId, integer(b.table, 1, 999), { id: u.userId, name: u.displayName || u.email || '' }, b.items, Number(b.servicePercent ?? 0), typeof b.version === 'string' ? b.version : null);
      return json({ order: orderView(order) });
    }
    const order = typeof b.orderId === 'string' ? await orderById(b.orderId) : null;
    if (!order || order.restaurant_id !== restaurantId) throw new ApiError(404, 'Hisob topilmadi.');
    if (action === 'close') {
      if (typeof b.version === 'string' && b.version !== order.updated_at) throw new ApiError(409, 'Zakaz o‘zgargan. Stolni qayta oching va tekshiring.');
      const closed = await closeOrder(order, paymentOf(b.payment));
      return json({ order: orderView(closed) });
    }
    if (action === 'cancel') {
      if (orderItems(order).length && level !== 'manager' && level !== 'owner') throw new ApiError(403, 'Taomli hisobni faqat menejer yoki restoran egasi bekor qiladi.');
      await cancelOrder(order);
      return json({ ok: true });
    }
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
