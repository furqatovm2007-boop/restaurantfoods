import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * POS cash desk: goods and dishes with barcodes and stock, and sales.
 *  - Prices always come from the database (the browser sends product ids and quantities only).
 *  - Stock is taken when a sale is paid, in one D1 batch together with the sale: the CHECK (stock >= 0)
 *    on pos_products makes an oversell fail as a whole, so nothing is half-sold.
 *  - Cash and card-terminal sales are paid at once; online sales (Payme / Click) stay pending until the
 *    provider's callback (app/api/payments/*) pays them. Their ids start with "pos_" so the callbacks
 *    can tell them from booking deposits; unpaid ones expire after HOLD_MS like deposits.
 */
export const POS_PREFIX = 'pos_';
export const POS_HOLD_MS = 30 * 60000;
export type PosMethod = 'cash' | 'card' | 'payme' | 'click';
export type PosLine = { productId: string; barcode: string; name: string; price: number; qty: number; sum: number };
export interface PosSaleRow {
  id: string;
  restaurant_id: string;
  cashier_id: string;
  items: string;
  total: number;
  method: string;
  status: string;
  receipt_no: string;
  receipt_key: string;
  received: number | null;
  provider: string | null;
  click_trans_id: string | null;
  click_prepare_id: number | null;
  payme_transaction: string | null;
  payme_state: number | null;
  payme_create_time: number | null;
  payme_perform_time: number | null;
  payme_cancel_time: number | null;
  payme_reason: number | null;
  created_at: string;
  paid_at: string | null;
}
export const isPosId = (id: string) => typeof id === 'string' && id.startsWith(POS_PREFIX);
export const saleById = (id: string) => env.DB!.prepare('SELECT * FROM pos_sales WHERE id=?').bind(id).first<PosSaleRow>();
export const lines = (s: Pick<PosSaleRow, 'items'>): PosLine[] => {
  try {
    const v = JSON.parse(s.items);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

/** EAN-13 check digit for 12 digits. */
export function ean13(base12: string) {
  const sum = [...base12].reduce((n, d, i) => n + Number(d) * (i % 2 ? 3 : 1), 0);
  return base12 + ((10 - (sum % 10)) % 10);
}
/** A new in-store EAN-13 (prefix 200–299 is reserved for a shop's own codes), unused in this restaurant. */
export async function newBarcode(restaurantId: string) {
  for (let i = 0; i < 12; i++) {
    const digits = Array.from(crypto.getRandomValues(new Uint8Array(9)), (v) => v % 10).join('');
    const code = ean13('2' + String(crypto.getRandomValues(new Uint8Array(1))[0] % 100).padStart(2, '0') + digits);
    if (!(await env.DB!.prepare('SELECT 1 FROM pos_products WHERE restaurant_id=? AND barcode=?').bind(restaurantId, code).first())) return code;
  }
  throw new ApiError(503, 'Shtrix-kod yaratib bo‘lmadi. Qayta urinib ko‘ring.');
}
export function barcodeOf(v: unknown) {
  const code = typeof v === 'string' ? v.trim() : '';
  if (!/^[0-9A-Za-z._-]{3,48}$/.test(code)) throw new ApiError(400, 'Shtrix-kod 3–48 ta raqam yoki harfdan iborat bo‘lsin.');
  return code;
}

/** Lines priced from the database; quantities merged per product; stock checked for a clear message. */
export async function quote(restaurantId: string, items: unknown) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new ApiError(400, 'Chek bo‘sh.');
  const qty = new Map<string, number>();
  for (const i of items as any[]) {
    const id = typeof i?.productId === 'string' ? i.productId : '';
    const n = Number(i?.qty);
    if (!id || !Number.isInteger(n) || n < 1 || n > 999) throw new ApiError(400, 'Mahsulot soni noto‘g‘ri.');
    qty.set(id, (qty.get(id) || 0) + n);
  }
  const ids = [...qty.keys()];
  const rows = (await env.DB!.prepare(`SELECT id,barcode,name,price,stock FROM pos_products WHERE restaurant_id=? AND id IN (${ids.map(() => '?').join(',')})`).bind(restaurantId, ...ids).all<{ id: string; barcode: string; name: string; price: number; stock: number }>()).results;
  if (rows.length !== ids.length) throw new ApiError(409, 'Chekdagi ayrim mahsulotlar bazadan o‘chirilgan. Chekni yangilang.');
  const out: PosLine[] = [];
  for (const r of rows) {
    const n = qty.get(r.id)!;
    if (n > r.stock) throw new ApiError(409, `Omborda yetarli emas: ${r.name} — qoldiq ${r.stock} ta.`);
    out.push({ productId: r.id, barcode: r.barcode, name: r.name, price: r.price, qty: n, sum: r.price * n });
  }
  return { lines: out, total: out.reduce((n, l) => n + l.sum, 0) };
}

/** Receipt number per restaurant and day: K-YYMMDD-0007. */
async function receiptNo(restaurantId: string) {
  const day = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
  const n = await env.DB!.prepare("SELECT COUNT(*) AS n FROM pos_sales WHERE restaurant_id=? AND substr(receipt_no,3,6)=?").bind(restaurantId, day.slice(2).replace(/-/g, '')).first<{ n: number }>();
  return 'K-' + day.slice(2).replace(/-/g, '') + '-' + String((n?.n || 0) + 1).padStart(4, '0');
}
const key = () => Array.from(crypto.getRandomValues(new Uint8Array(18)), (v) => v.toString(16).padStart(2, '0')).join('');

export async function createSale(restaurantId: string, cashierId: string, items: unknown, method: PosMethod, received?: number | null) {
  const q = await quote(restaurantId, items);
  if (!q.total) throw new ApiError(400, 'Chek summasi nol bo‘lishi mumkin emas.');
  if (method === 'cash' && received != null && received < q.total) throw new ApiError(400, 'Olingan naqd pul chek summasidan kam.');
  const id = POS_PREFIX + crypto.randomUUID();
  await env.DB!.prepare('INSERT INTO pos_sales (id,restaurant_id,cashier_id,items,total,method,status,receipt_no,receipt_key,received,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, restaurantId, cashierId, JSON.stringify(q.lines), q.total, method, 'pending', await receiptNo(restaurantId), key(), method === 'cash' ? received ?? q.total : null, new Date().toISOString()).run();
  if (method === 'cash' || method === 'card') {
    if (!(await completeSale(id, method))) throw new ApiError(409, 'Omborda yetarli emas — sotuv bekor qilindi.');
  }
  return (await saleById(id))!;
}

/** Pays a pending sale and takes its stock, all or nothing. False when it was not pending or stock ran out. */
export async function completeSale(id: string, provider: string) {
  const sale = await saleById(id);
  if (!sale || sale.status !== 'pending') return false;
  const take = lines(sale).map((l) =>
    env.DB!.prepare("UPDATE pos_products SET stock=stock-?,updated_at=? WHERE id=? AND restaurant_id=? AND EXISTS(SELECT 1 FROM pos_sales WHERE id=? AND status='pending')").bind(l.qty, new Date().toISOString(), l.productId, sale.restaurant_id, id),
  );
  try {
    const results = await env.DB!.batch([...take, env.DB!.prepare("UPDATE pos_sales SET status='paid',provider=?,paid_at=? WHERE id=? AND status='pending'").bind(provider, new Date().toISOString(), id)]);
    return !!results[results.length - 1]?.meta?.changes;
  } catch (e) {
    if (/CHECK constraint|pos_products_stock_check/i.test(String((e as Error)?.message || e))) return false;
    throw e;
  }
}

/** Cancels a pending sale, or refunds a paid one and puts its stock back. */
export async function cancelSale(id: string, refunded = false) {
  if (!refunded) return !!(await env.DB!.prepare("UPDATE pos_sales SET status='cancelled' WHERE id=? AND status='pending'").bind(id).run()).meta.changes;
  const sale = await saleById(id);
  if (!sale || sale.status !== 'paid') return false;
  const back = lines(sale).map((l) => env.DB!.prepare("UPDATE pos_products SET stock=stock+?,updated_at=? WHERE id=? AND restaurant_id=? AND EXISTS(SELECT 1 FROM pos_sales WHERE id=? AND status='paid')").bind(l.qty, new Date().toISOString(), l.productId, sale.restaurant_id, id));
  const results = await env.DB!.batch([...back, env.DB!.prepare("UPDATE pos_sales SET status='refunded' WHERE id=? AND status='paid'").bind(id)]);
  return !!results[results.length - 1]?.meta?.changes;
}

/** Online sales nobody paid in time (a Payme transaction in progress keeps its sale). */
export async function sweepSales(now = Date.now()) {
  const cutoff = new Date(now - POS_HOLD_MS).toISOString();
  return (await env.DB!.prepare("UPDATE pos_sales SET status='cancelled' WHERE status='pending' AND created_at<? AND NOT (COALESCE(payme_state,0)=1 AND COALESCE(payme_create_time,0)>?)").bind(cutoff, now - POS_HOLD_MS).run()).meta.changes;
}
