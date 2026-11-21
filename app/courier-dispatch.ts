import { env } from 'cloudflare:workers';
import { telegram, html, restaurantChats, site } from './telegram';
import { afterResponse } from '../lib/after-response';

/*
 * 🛵 Courier offers in Telegram, 10 seconds each.
 * When a delivery order is confirmed by the restaurant and has no courier, the first free courier (approved,
 * active, "online" in the app, with a linked Telegram chat, no delivery in progress, not asked yet for this
 * order) gets: the restaurant (pickup), the drop-off address, the delivery fee, "⏱ 10 soniya" and
 * ✅ Qabul qilish / ❌ Rad etish. The offer lives in app_settings "offer:<orderId>" =
 * { courier, chat, msg, expires, tried[] }.
 *  - ✅ within 10 s: the order is assigned to that courier at once (same rule as a manual assignment: only an
 *    unassigned, confirmed order, and only a courier with no other active delivery); the restaurant is told.
 *  - ❌, or 10 s without an answer: the message becomes "⏱ Vaqt tugadi / O‘tkazib yuborildi" and the next
 *    courier is asked. A late ✅ is refused.
 * The timer runs after the response (afterResponse → ctx.waitUntil, at most ~25 s per request); offers still
 * open after that are moved on by advanceOffers(), called by the cron and by incoming requests.
 * No free courier: the restaurant hears so once and can assign one by hand in its dashboard.
 */
export const OFFER_MS = 10_000;
const KEY = 'offer:';
const ONLINE = 'courier_online:';
type Offer = { courier: string | null; chat: string | null; msg: number | null; expires: number; tried: string[]; none?: boolean };

const getOffer = async (id: string) => {
  const v = (await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(KEY + id).first<{ value: string }>())?.value;
  try {
    return v ? (JSON.parse(v) as Offer) : null;
  } catch {
    return null;
  }
};
const putOffer = (id: string, o: Offer) =>
  env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'dispatch') ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(KEY + id, JSON.stringify(o), new Date().toISOString()).run();
const dropOffer = (id: string) => env.DB!.prepare('DELETE FROM app_settings WHERE key=?').bind(KEY + id).run();
/** Compare-and-set on the stored JSON, so two requests never move the same offer twice. */
const swapOffer = async (id: string, from: Offer, to: Offer | null) => {
  const r = to
    ? await env.DB!.prepare('UPDATE app_settings SET value=?,updated_at=? WHERE key=? AND value=?').bind(JSON.stringify(to), new Date().toISOString(), KEY + id, JSON.stringify(from)).run()
    : await env.DB!.prepare('DELETE FROM app_settings WHERE key=? AND value=?').bind(KEY + id, JSON.stringify(from)).run();
  return !!r.meta.changes;
};

export async function setCourierOnline(userId: string, online: boolean) {
  if (online) await env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,'1',?,'courier') ON CONFLICT(key) DO UPDATE SET value='1',updated_at=excluded.updated_at").bind(ONLINE + userId, new Date().toISOString()).run();
  else await env.DB!.prepare('DELETE FROM app_settings WHERE key=?').bind(ONLINE + userId).run();
}
export const courierOnline = async (userId: string) => !!(await env.DB!.prepare('SELECT 1 FROM app_settings WHERE key=?').bind(ONLINE + userId).first());

interface OrderRow {
  id: string;
  status: string;
  fulfillment: string;
  delivery_status: string | null;
  courier_id: string | null;
  total: number;
  delivery_fee: number;
  delivery_address: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
}
const loadOrder = (id: string) =>
  env.DB!.prepare('SELECT o.id,o.status,o.fulfillment,o.delivery_status,o.courier_id,o.total,o.delivery_fee,o.delivery_address,o.restaurant_id,r.name AS restaurant_name,r.address AS restaurant_address FROM orders o JOIN restaurants r ON r.id=o.restaurant_id WHERE o.id=?').bind(id).first<OrderRow>();
const open = (o: OrderRow | null) => !!o && o.status === 'confirmed' && o.fulfillment === 'delivery' && !o.courier_id && (o.delivery_status || 'unassigned') === 'unassigned';
const money = (n: number) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';

async function nextCourier(tried: string[]) {
  const rows = (
    await env.DB!.prepare(
      "SELECT a.id,a.telegram_chat_id AS chat FROM accounts a JOIN app_settings s ON s.key='courier_online:'||a.id WHERE a.role='courier' AND a.courier_approved=1 AND a.status='active' AND a.telegram_chat_id IS NOT NULL AND a.telegram_chat_id<>'' AND NOT EXISTS (SELECT 1 FROM orders x WHERE x.courier_id=a.id AND x.status='confirmed') AND NOT EXISTS (SELECT 1 FROM app_settings p WHERE p.key LIKE 'offer:%' AND json_extract(p.value,'$.courier')=a.id) ORDER BY s.updated_at",
    ).all<{ id: string; chat: string }>()
  ).results;
  return rows.find((r) => !tried.includes(r.id)) || null;
}

const offerText = (o: OrderRow) =>
  [
    '🛵 <b>Yangi yetkazib berish!</b>',
    `🍽 Olish: <b>${html(o.restaurant_name)}</b>${o.restaurant_address ? ' — ' + html(o.restaurant_address) : ''}`,
    `🏠 Yetkazish: ${html(o.delivery_address || '—')}`,
    `💵 Yetkazish haqi: <b>${money(o.delivery_fee)}</b> · Buyurtma: ${money(o.total)}`,
    '',
    '⏱ <b>10 soniya</b> ichida javob bering — keyin taklif keyingi kuryerga o‘tadi.',
  ].join('\n');

/** Ask the next free courier (or record that there is none). Returns the new offer, or null. */
async function offerNext(id: string, prev: Offer | null): Promise<Offer | null> {
  const o = await loadOrder(id);
  if (!open(o)) {
    if (prev) await dropOffer(id);
    return null;
  }
  const tried = prev?.tried || [];
  const c = await nextCourier(tried);
  if (!c) {
    const none: Offer = { courier: null, chat: null, msg: null, expires: 0, tried, none: true };
    if (!prev?.none) {
      await putOffer(id, none);
      for (const chat_id of await restaurantChats(o!.restaurant_id)) await telegram('sendMessage', { chat_id, text: `⚠️ Hozir bo‘sh kuryer topilmadi — buyurtma #${id.slice(0, 8)} uchun kuryerni kabinetda o‘zingiz biriktiring: ${site()}/#/zakazlar` });
    }
    return null;
  }
  const sent = (await telegram('sendMessage', {
    chat_id: c.chat,
    text: offerText(o!),
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [[{ text: '✅ Qabul qilish', callback_data: 'co:a:' + id }, { text: '❌ Rad etish', callback_data: 'co:r:' + id }]] },
  })) as { message_id?: number } | null;
  const offer: Offer = { courier: c.id, chat: c.chat, msg: sent?.message_id ?? null, expires: Date.now() + OFFER_MS, tried: [...tried, c.id] };
  await putOffer(id, offer);
  return offer;
}

const expiredText = (o: OrderRow | null) => (o ? offerText(o).split('\n').slice(0, 4).join('\n') : '🛵') + '\n\n⏱ <b>Vaqt tugadi / O‘tkazib yuborildi</b>';
async function closeMessage(of: Offer, text: string) {
  if (of.chat && of.msg) await telegram('editMessageText', { chat_id: of.chat, message_id: of.msg, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
}

/** Expire the current offer (timeout or ❌) and ask the next courier. */
async function expireAndNext(id: string, of: Offer) {
  const moved: Offer = { ...of, courier: null, expires: 0 };
  if (!(await swapOffer(id, of, moved))) return null; // someone else moved it already
  await closeMessage(of, expiredText(await loadOrder(id)));
  return offerNext(id, moved);
}

/** The 10-second timer, after the response: up to ~25 s of offers per request. */
function runTimer(id: string, of: Offer | null, started = Date.now()) {
  if (!of) return;
  afterResponse(
    async () => {
      let cur: Offer | null = of;
      while (cur && Date.now() - started < 25_000) {
        await new Promise((r) => setTimeout(r, Math.max(0, cur!.expires - Date.now()) + 300));
        const now = await getOffer(id);
        if (!now || now.courier !== cur.courier || now.expires !== cur.expires) return; // answered
        cur = await expireAndNext(id, now);
      }
    },
  );
}

/** A delivery order was confirmed (or freed): start offering it. */
export async function startDispatch(orderId: string) {
  const o = await loadOrder(orderId);
  if (!open(o)) return;
  const prev = await getOffer(orderId);
  if (prev && prev.courier && prev.expires > Date.now()) return;
  runTimer(orderId, await offerNext(orderId, prev ? { ...prev, none: false } : null));
}

/** Offers whose 10 s are over (cron, incoming requests) and orders still waiting for a courier. */
let lastSweep = 0;
export async function advanceOffers(force = false) {
  if (!force && Date.now() - lastSweep < 5000) return;
  lastSweep = Date.now();
  const rows = (await env.DB!.prepare("SELECT key,value FROM app_settings WHERE key LIKE 'offer:%' LIMIT 50").all<{ key: string; value: string }>()).results;
  for (const r of rows) {
    const id = r.key.slice(KEY.length);
    let of: Offer;
    try {
      of = JSON.parse(r.value);
    } catch {
      continue;
    }
    if (of.courier && of.expires < Date.now() - 500) runTimer(id, await expireAndNext(id, of));
    else if (of.none && force) runTimer(id, await offerNext(id, { ...of, none: true }));
  }
}

/** ✅ / ❌ from the courier's chat; null for any other update. */
export async function handleCourierOffer(update: any): Promise<string | null> {
  const cb = update?.callback_query;
  if (typeof cb?.data !== 'string' || !cb.data.startsWith('co:') || !cb.message) return null;
  const [, op, id] = cb.data.split(':');
  const chat = String(cb.message.chat.id);
  const of = id ? await getOffer(id) : null;
  const order = id ? await loadOrder(id) : null;
  if (!of || of.chat !== chat || !of.courier || (op !== 'a' && op !== 'r')) {
    await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: '⏱ Vaqt tugadi' });
    await telegram('editMessageText', { chat_id: chat, message_id: cb.message.message_id, text: expiredText(order), parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
    return 'offer_stale';
  }
  if (op === 'r' || Date.now() > of.expires) {
    await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: op === 'r' ? '❌ Rad etildi' : '⏱ Vaqt tugadi' });
    runTimer(id, await expireAndNext(id, of));
    return op === 'r' ? 'offer_rejected' : 'offer_late';
  }
  // Accept: the same guard as a manual assignment.
  const done = await env.DB!.prepare(
    "UPDATE orders SET courier_id=?,delivery_status='assigned',courier_lat=NULL,courier_lng=NULL,location_at=NULL WHERE id=? AND status='confirmed' AND fulfillment='delivery' AND courier_id IS NULL AND COALESCE(delivery_status,'unassigned')='unassigned' AND NOT EXISTS (SELECT 1 FROM orders other WHERE other.courier_id=? AND other.status='confirmed' AND other.id<>?)",
  )
    .bind(of.courier, id, of.courier, id)
    .run();
  if (!done.meta.changes || !(await swapOffer(id, of, null))) {
    await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: 'Buyurtma allaqachon olingan.' });
    await closeMessage(of, expiredText(order));
    return 'offer_taken';
  }
  await telegram('answerCallbackQuery', { callback_query_id: cb.id, text: '✅ Qabul qilindi' });
  await closeMessage(of, (order ? offerText(order).split('\n').slice(0, 4).join('\n') : '🛵') + `\n\n✅ <b>Siz qabul qildingiz.</b> Restoranga boring va taomni oling.\n${site()}/#/courier/active`);
  const name = (await env.DB!.prepare('SELECT name FROM accounts WHERE id=?').bind(of.courier).first<{ name: string }>())?.name || 'Kuryer';
  if (order) for (const chat_id of await restaurantChats(order.restaurant_id)) await telegram('sendMessage', { chat_id, text: `🛵 ${name} buyurtma #${id.slice(0, 8)} ni qabul qildi — taomni tayyorlab qo‘ying.` });
  return 'offer_accepted';
}
