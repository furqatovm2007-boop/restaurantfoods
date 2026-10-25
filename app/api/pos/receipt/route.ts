import { env } from 'cloudflare:workers';
import { ApiError, failure, json, text } from '../../../http';
import { lines, saleById } from '../../../pos';
import { orderById, orderItems } from '../../../hall';
export const dynamic = 'force-dynamic';

/** Public electronic receipt: anyone with the receipt's secret key (from its QR code) can see it. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = text(url.searchParams.get('id')),
      key = url.searchParams.get('k') || '';
    // Hall bills (tb_ ids): table, waiter, customer and the service charge as well.
    if (id.startsWith('tb_')) {
      const o = await orderById(id);
      if (!o || o.status !== 'closed' || !/^[a-f0-9]{36}$/.test(key) || key !== o.receipt_key) throw new ApiError(404, 'Chek topilmadi.');
      const r = await env.DB!.prepare('SELECT name,address,phone FROM restaurants WHERE id=?').bind(o.restaurant_id).first<{ name: string; address: string; phone: string }>();
      return json({ receipt: { no: o.receipt_no, restaurant: r?.name || '', address: r?.address || '', phone: r?.phone || '', table: o.table_number, waiter: o.waiter_name, customer: o.customer_name, items: orderItems(o).map((i) => ({ name: i.name, comment: i.comment, price: i.price, qty: i.qty, sum: i.price * i.qty })), subtotal: o.subtotal, servicePercent: o.service_percent, service: o.service, total: o.total, method: o.payment, status: 'paid', createdAt: o.opened_at, paidAt: o.closed_at } });
    }
    const sale = await saleById(id);
    if (!sale || !/^[a-f0-9]{36}$/.test(key) || key !== sale.receipt_key) throw new ApiError(404, 'Chek topilmadi.');
    const r = await env.DB!.prepare('SELECT name,address,phone FROM restaurants WHERE id=?').bind(sale.restaurant_id).first<{ name: string; address: string; phone: string }>();
    return json({
      receipt: { no: sale.receipt_no, restaurant: r?.name || '', address: r?.address || '', phone: r?.phone || '', items: lines(sale).map((l) => ({ name: l.name, barcode: l.barcode, price: l.price, qty: l.qty, sum: l.sum })), total: sale.total, method: sale.provider || sale.method, status: sale.status, received: sale.received, change: sale.received != null ? Math.max(0, sale.received - sale.total) : null, createdAt: sale.created_at, paidAt: sale.paid_at },
    });
  } catch (e) {
    return failure(e);
  }
}
