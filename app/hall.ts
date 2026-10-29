import { env } from 'cloudflare:workers';
import { ApiError, text } from './http';

/*
 * Hall cash desk: one open bill per table. Waiters pick dishes by hand from the restaurant's own menu
 * (prices always from the menu in the database), save the bill to the table (the table becomes "Band"),
 * add more later and close it: totals with the service charge, a receipt number, the booking completed and
 * the table free again. Saving sends the version the waiter saw, so two waiters never overwrite each other.
 */
export type HallItem = { menuId: string; name: string; price: number; qty: number; comment: string };
export const SERVICE_RATES = [0, 10, 15];
export interface TableOrderRow {
  id: string;
  restaurant_id: string;
  table_number: number;
  booking_id: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  waiter_id: string;
  waiter_name: string;
  items: string;
  service_percent: number;
  subtotal: number;
  service: number;
  total: number;
  status: string;
  payment: string | null;
  receipt_no: string | null;
  receipt_key: string;
  notified_at: string | null;
  opened_at: string;
  updated_at: string;
  closed_at: string | null;
}
export const orderItems = (o: Pick<TableOrderRow, 'items'>): HallItem[] => {
  try {
    const v = JSON.parse(o.items);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
export function totals(items: HallItem[], percent: number) {
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const service = Math.round((subtotal * percent) / 100);
  return { subtotal, service, total: subtotal + service };
}
export const orderById = (id: string) => env.DB!.prepare('SELECT * FROM table_orders WHERE id=?').bind(id).first<TableOrderRow>();
const openOrder = (restaurantId: string, table: number) => env.DB!.prepare("SELECT * FROM table_orders WHERE restaurant_id=? AND table_number=? AND status='open'").bind(restaurantId, table).first<TableOrderRow>();

/** Tashkent "now": date and minutes since midnight. */
export function localNow(now = Date.now()) {
  const d = new Date(now + 5 * 3600000).toISOString();
  return { date: d.slice(0, 10), minutes: Number(d.slice(11, 13)) * 60 + Number(d.slice(14, 16)) };
}
const minutes = (v: string) => Number(String(v).slice(0, 2)) * 60 + Number(String(v).slice(3, 5));

/** Today's next booking per table (or one going on now): customer name, phone and whether Telegram is linked. */
export async function todaysBookings(restaurantId: string, now = Date.now()) {
  const { date, minutes: m } = localNow(now);
  const rows = (
    await env.DB!.prepare(
      "SELECT b.id,b.table_number,b.merged_table,b.slot,CASE WHEN b.end_slot<>'' THEN b.end_slot ELSE time(b.slot,'+2 hours') END AS end_slot,b.guests,b.phone,b.status,b.user_id,b.checked_in_at,b.call_status,a.name,a.telegram_chat_id FROM bookings b LEFT JOIN accounts a ON a.id=b.user_id WHERE b.restaurant_id=? AND b.date=? AND b.status IN ('pending','confirmed') ORDER BY b.slot",
    )
      .bind(restaurantId, date)
      .all<any>()
  ).results.filter((b) => minutes(b.end_slot) > m);
  const byTable = new Map<number, any>();
  for (const b of rows)
    for (const t of [b.table_number, b.merged_table].filter((x) => x != null))
      if (!byTable.has(t))
        byTable.set(t, { id: b.id, name: b.name || '', phone: b.phone, slot: String(b.slot).slice(0, 5), endSlot: String(b.end_slot).slice(0, 5), guests: b.guests, status: b.status, userId: b.user_id, telegram: !!b.telegram_chat_id, startsIn: minutes(b.slot) - m, checkedIn: !!b.checked_in_at, callStatus: String(b.call_status || '') });
  return byTable;
}

/** Dishes priced from the restaurant's menu (available ones only); quantities 1–99, short comments. */
export async function priceItems(restaurantId: string, raw: unknown): Promise<HallItem[]> {
  if (!Array.isArray(raw) || raw.length > 80) throw new ApiError(400, 'Zakaz ro‘yxati noto‘g‘ri.');
  if (!raw.length) return [];
  const ids = [...new Set(raw.map((i: any) => (typeof i?.menuId === 'string' ? i.menuId : '')))].filter(Boolean);
  if (ids.length !== new Set(raw.map((i: any) => i?.menuId)).size) throw new ApiError(400, 'Taom tanlanmagan.');
  const menu = new Map(
    (await env.DB!.prepare(`SELECT id,name,price FROM menu WHERE restaurant_id=? AND available=1 AND id IN (${ids.map(() => '?').join(',')})`).bind(restaurantId, ...ids).all<{ id: string; name: string; price: number }>()).results.map((m) => [m.id, m]),
  );
  return raw.map((i: any) => {
    const m = menu.get(i.menuId);
    if (!m) throw new ApiError(409, 'Ayrim taomlar menyuda yo‘q yoki tugagan. Menyuni yangilang.');
    const qty = Number(i.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) throw new ApiError(400, 'Taom soni 1 dan 99 gacha bo‘lsin.');
    const comment = typeof i.comment === 'string' ? i.comment.trim().replace(/\s+/g, ' ').slice(0, 80) : '';
    return { menuId: m.id, name: m.name, price: m.price, qty, comment };
  });
}

/** Saves the table's bill (opens it on the first save). `version` is the updated_at the waiter saw. */
export async function saveOrder(restaurantId: string, table: number, staff: { id: string; name: string }, rawItems: unknown, percent: number, version?: string | null) {
  if (!SERVICE_RATES.includes(percent)) throw new ApiError(400, 'Xizmat haqi 0, 10 yoki 15% bo‘lishi mumkin.');
  const t = await env.DB!.prepare('SELECT number FROM restaurant_tables WHERE restaurant_id=? AND number=? AND active=1').bind(restaurantId, table).first();
  if (!t) throw new ApiError(404, 'Stol topilmadi.');
  const items = await priceItems(restaurantId, rawItems);
  const sum = totals(items, percent),
    now = new Date().toISOString();
  const current = await openOrder(restaurantId, table);
  if (current) {
    if (version && version !== current.updated_at) throw new ApiError(409, 'Bu stol zakazini boshqa xodim o‘zgartirdi. Stolni qayta oching.');
    if (!items.length) throw new ApiError(400, 'Zakazda kamida bitta taom bo‘lsin. Bo‘sh zakazni bekor qiling.');
    const done = await env.DB!.prepare("UPDATE table_orders SET items=?,service_percent=?,subtotal=?,service=?,total=?,updated_at=? WHERE id=? AND status='open' AND updated_at=?").bind(JSON.stringify(items), percent, sum.subtotal, sum.service, sum.total, now, current.id, current.updated_at).run();
    if (!done.meta.changes) throw new ApiError(409, 'Bu stol zakazini boshqa xodim o‘zgartirdi. Stolni qayta oching.');
    return (await orderById(current.id))!;
  }
  if (!items.length) throw new ApiError(400, 'Avval taom tanlang.');
  // A customer who booked this table today (now or within 3 hours) is linked to the bill and marked arrived.
  const booking = (await todaysBookings(restaurantId)).get(table);
  const linked = booking && booking.startsIn <= 180 ? booking : null;
  const id = 'tb_' + crypto.randomUUID();
  const key = Array.from(crypto.getRandomValues(new Uint8Array(18)), (v) => v.toString(16).padStart(2, '0')).join('');
  try {
    await env.DB!.prepare('INSERT INTO table_orders (id,restaurant_id,table_number,booking_id,customer_id,customer_name,customer_phone,waiter_id,waiter_name,items,service_percent,subtotal,service,total,status,receipt_key,opened_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, restaurantId, table, linked?.id ?? null, linked?.userId ?? null, linked?.name ?? '', linked?.phone ?? '', staff.id, staff.name.slice(0, 80), JSON.stringify(items), percent, sum.subtotal, sum.service, sum.total, 'open', key, now, now)
      .run();
  } catch (e) {
    if (/UNIQUE/i.test(String((e as Error)?.message || e))) throw new ApiError(409, 'Bu stolda allaqachon ochiq zakaz bor. Stolni qayta oching.');
    throw e;
  }
  if (linked && !linked.checkedIn) await env.DB!.prepare('UPDATE bookings SET checked_in_at=? WHERE id=? AND checked_in_at IS NULL').bind(now, linked.id).run();
  await markTable(restaurantId, table, 'occupied');
  return (await orderById(id))!;
}

/** The live table map follows the cash desk: occupied while a bill is open, free when it is closed. */
async function markTable(restaurantId: string, table: number, status: 'occupied' | 'free') {
  const now = new Date().toISOString();
  await env.DB!.prepare("INSERT INTO table_live_status (restaurant_id,table_number,status,source,confidence,updated_at,since) VALUES (?,?,?,'manual',1,?,?) ON CONFLICT(restaurant_id,table_number) DO UPDATE SET status=excluded.status,source='manual',confidence=1,updated_at=excluded.updated_at,since=CASE WHEN table_live_status.status=excluded.status THEN COALESCE(table_live_status.since,excluded.since) ELSE excluded.since END")
    .bind(restaurantId, table, status, now, now)
    .run()
    .catch(() => null);
}

/** Closes the bill: final totals, receipt number, payment, booking completed, table free. */
export async function closeOrder(order: TableOrderRow, payment: string) {
  if (order.status !== 'open') throw new ApiError(409, 'Bu hisob allaqachon yopilgan.');
  const items = orderItems(order);
  if (!items.length) throw new ApiError(400, 'Bo‘sh hisobni yopib bo‘lmaydi.');
  const sum = totals(items, order.service_percent);
  const { date } = localNow();
  const day = date.slice(2).replace(/-/g, '');
  const n = await env.DB!.prepare("SELECT COUNT(*) AS n FROM table_orders WHERE restaurant_id=? AND receipt_no LIKE ?").bind(order.restaurant_id, 'Z-' + day + '-%').first<{ n: number }>();
  const receiptNo = 'Z-' + day + '-' + String((n?.n || 0) + 1).padStart(4, '0');
  const now = new Date().toISOString();
  const done = await env.DB!.prepare("UPDATE table_orders SET status='closed',payment=?,receipt_no=?,subtotal=?,service=?,total=?,closed_at=?,updated_at=? WHERE id=? AND status='open'").bind(payment, receiptNo, sum.subtotal, sum.service, sum.total, now, now, order.id).run();
  if (!done.meta.changes) throw new ApiError(409, 'Bu hisob allaqachon yopilgan.');
  if (order.booking_id) await env.DB!.prepare("UPDATE bookings SET status='completed' WHERE id=? AND status IN ('pending','confirmed')").bind(order.booking_id).run();
  await markTable(order.restaurant_id, order.table_number, 'free');
  return (await orderById(order.id))!;
}

export async function cancelOrder(order: TableOrderRow) {
  const done = await env.DB!.prepare("UPDATE table_orders SET status='cancelled',closed_at=?,updated_at=? WHERE id=? AND status='open'").bind(new Date().toISOString(), new Date().toISOString(), order.id).run();
  if (!done.meta.changes) throw new ApiError(409, 'Bu hisob allaqachon yopilgan.');
  await markTable(order.restaurant_id, order.table_number, 'free');
}

export const paymentOf = (v: unknown) => {
  const p = text(v || 'cash');
  if (!['cash', 'card', 'payme', 'click'].includes(p)) throw new ApiError(400, 'To‘lov turini tanlang.');
  return p;
};
