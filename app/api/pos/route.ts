import { env } from 'cloudflare:workers';
import { identity } from '../../access';
import { ApiError, body, failure, integer, json, sameOrigin, text, throttle } from '../../http';
import { restaurantAccess } from '../../staff';
import { depositProviders, paymentLinks } from '../../deposits';
import { barcodeOf, cancelSale, completeSale, createSale, isPosId, lines, newBarcode, saleById, sweepSales, type PosMethod } from '../../pos';
export const dynamic = 'force-dynamic';

/*
 * POS cash desk of one restaurant. Waiters and up sell (cash, card terminal, Payme / Click QR);
 * managers and the owner keep the goods base (barcode, name, price, stock) and refund paid sales.
 */
const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');
const receiptUrl = (s: { id: string; receipt_key: string }) => site() + '/#/chek/' + encodeURIComponent(s.id) + '/' + s.receipt_key;
const saleView = (s: Awaited<ReturnType<typeof saleById>>) =>
  s && { id: s.id, receiptNo: s.receipt_no, items: lines(s), total: s.total, method: s.method, status: s.status, provider: s.provider, received: s.received, change: s.received != null ? Math.max(0, s.received - s.total) : null, createdAt: s.created_at, paidAt: s.paid_at, receiptUrl: receiptUrl(s) };

async function who(restaurantId: string, need: 'waiter' | 'manager') {
  const u = await identity();
  if (!u) throw new ApiError(401, 'Avval kiring.');
  const { r, level } = await restaurantAccess(restaurantId, u, need);
  return { u, r, level };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url),
      restaurantId = text(url.searchParams.get('restaurantId')),
      view = url.searchParams.get('view') || 'products';
    const { r, level } = await who(restaurantId, 'waiter');
    await sweepSales().catch(() => 0);
    if (view === 'products') {
      const products = (await env.DB!.prepare('SELECT id,barcode,name,price,stock,updated_at FROM pos_products WHERE restaurant_id=? ORDER BY name COLLATE NOCASE LIMIT 2000').bind(restaurantId).all()).results;
      return json({ restaurant: { id: r.id, name: r.name }, products, canEdit: level === 'manager' || level === 'owner', online: depositProviders() });
    }
    if (view === 'lookup') {
      const product = await env.DB!.prepare('SELECT id,barcode,name,price,stock FROM pos_products WHERE restaurant_id=? AND barcode=?').bind(restaurantId, barcodeOf(url.searchParams.get('barcode'))).first();
      if (!product) throw new ApiError(404, 'Bu shtrix-kod bazada yo‘q.');
      return json({ product });
    }
    if (view === 'sale') {
      const sale = await saleById(text(url.searchParams.get('id')));
      if (!sale || sale.restaurant_id !== restaurantId) throw new ApiError(404, 'Sotuv topilmadi.');
      return json({ sale: saleView(sale) });
    }
    if (view === 'sales') {
      const day = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
      const sales = (await env.DB!.prepare('SELECT * FROM pos_sales WHERE restaurant_id=? ORDER BY created_at DESC LIMIT 60').bind(restaurantId).all<any>()).results.map(saleView);
      const today = await env.DB!.prepare("SELECT COUNT(*) AS count,COALESCE(SUM(total),0) AS total,COALESCE(SUM(CASE WHEN provider='cash' THEN total END),0) AS cash,COALESCE(SUM(CASE WHEN provider='card' THEN total END),0) AS card,COALESCE(SUM(CASE WHEN provider IN ('payme','click') THEN total END),0) AS online FROM pos_sales WHERE restaurant_id=? AND status='paid' AND substr(receipt_no,3,6)=?").bind(restaurantId, day.slice(2).replace(/-/g, '')).first();
      return json({ sales, today });
    }
    throw new ApiError(400, 'Noma’lum bo‘lim.');
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
    const editing = ['product_save', 'product_delete', 'barcode_new', 'sale_refund'].includes(action);
    const { u } = await who(restaurantId, editing ? 'manager' : 'waiter');
    await throttle('pos:' + u.userId, 600);
    const now = new Date().toISOString();
    if (action === 'barcode_new') return json({ barcode: await newBarcode(restaurantId) });
    if (action === 'product_save') {
      const name = text(b.name, 1, 120),
        price = integer(b.price, 0, 100000000),
        stock = integer(b.stock, 0, 1000000),
        barcode = b.barcode ? barcodeOf(b.barcode) : await newBarcode(restaurantId);
      const clash = await env.DB!.prepare('SELECT id FROM pos_products WHERE restaurant_id=? AND barcode=?').bind(restaurantId, barcode).first<{ id: string }>();
      if (clash && clash.id !== b.id) throw new ApiError(409, 'Bu shtrix-kod boshqa mahsulotga biriktirilgan.');
      if (b.id) {
        const done = await env.DB!.prepare('UPDATE pos_products SET barcode=?,name=?,price=?,stock=?,updated_at=? WHERE id=? AND restaurant_id=?').bind(barcode, name, price, stock, now, text(b.id), restaurantId).run();
        if (!done.meta.changes) throw new ApiError(404, 'Mahsulot topilmadi.');
        return json({ ok: true, id: b.id, barcode });
      }
      const count = await env.DB!.prepare('SELECT COUNT(*) AS n FROM pos_products WHERE restaurant_id=?').bind(restaurantId).first<{ n: number }>();
      if ((count?.n || 0) >= 2000) throw new ApiError(400, 'Bitta restoranda 2000 tagacha mahsulot saqlanadi.');
      const id = crypto.randomUUID();
      await env.DB!.prepare('INSERT INTO pos_products (id,restaurant_id,barcode,name,price,stock,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, restaurantId, barcode, name, price, stock, now, now).run();
      return json({ ok: true, id, barcode }, 201);
    }
    if (action === 'product_delete') {
      const done = await env.DB!.prepare('DELETE FROM pos_products WHERE id=? AND restaurant_id=?').bind(text(b.id), restaurantId).run();
      if (!done.meta.changes) throw new ApiError(404, 'Mahsulot topilmadi.');
      return json({ ok: true });
    }
    if (action === 'sale_create') {
      const method = text(b.method) as PosMethod;
      if (!['cash', 'card', 'payme', 'click'].includes(method)) throw new ApiError(400, 'To‘lov turini tanlang.');
      if ((method === 'payme' || method === 'click') && !depositProviders().includes(method)) throw new ApiError(503, (method === 'payme' ? 'Payme' : 'Click') + ' hali ulanmagan.');
      const received = method === 'cash' && b.received != null && b.received !== '' ? integer(b.received, 0, 1000000000) : null;
      const sale = await createSale(restaurantId, u.userId, b.items, method, received);
      // Online: a link with the amount, shown as a QR code for the customer's phone.
      const pay = method === 'payme' || method === 'click' ? paymentLinks(sale.id, sale.total, receiptUrl(sale))[method] || null : null;
      return json({ sale: saleView(sale), payUrl: pay }, 201);
    }
    const sale = isPosId(b.id) ? await saleById(b.id) : null;
    if (!sale || sale.restaurant_id !== restaurantId) throw new ApiError(404, 'Sotuv topilmadi.');
    if (action === 'sale_pay') {
      // The customer paid another way (cash / card terminal) instead of the QR code.
      const method = text(b.method);
      if (!['cash', 'card'].includes(method)) throw new ApiError(400, 'To‘lov turini tanlang.');
      if (sale.payme_state === 1 || sale.click_prepare_id) throw new ApiError(409, 'Onlayn to‘lov jarayonda — natijasini kuting.');
      await env.DB!.prepare("UPDATE pos_sales SET method=?,received=? WHERE id=? AND status='pending'").bind(method, method === 'cash' ? sale.total : null, sale.id).run();
      if (!(await completeSale(sale.id, method))) throw new ApiError(409, 'Sotuvni yakunlab bo‘lmadi: u to‘langan, bekor qilingan yoki omborda yetarli emas.');
      return json({ sale: saleView(await saleById(sale.id)) });
    }
    if (action === 'sale_cancel') {
      if (sale.payme_state === 1 || sale.click_prepare_id) throw new ApiError(409, 'Onlayn to‘lov jarayonda — bekor qilib bo‘lmaydi.');
      if (!(await cancelSale(sale.id))) throw new ApiError(409, 'Faqat to‘lanmagan sotuv bekor qilinadi.');
      return json({ ok: true });
    }
    if (action === 'sale_refund') {
      // Online payments are refunded by the provider (its callback restores the stock); here only cash / card.
      if (!['cash', 'card'].includes(sale.provider || '')) throw new ApiError(409, 'Onlayn to‘lov Payme / Click kabineti orqali qaytariladi.');
      if (!(await cancelSale(sale.id, true))) throw new ApiError(409, 'Faqat to‘langan sotuv qaytariladi.');
      return json({ ok: true });
    }
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
