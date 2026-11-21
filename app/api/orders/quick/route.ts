import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, body, text, integer, throttle, clientIp } from '../../../http';
import { intlPhone } from '../../../phone-codes';
import { point } from '../../../geo';
import { banned, guestKeys, BAN_MESSAGE } from '../../../guest-policy';
import { telegram, html, restaurantChats, prettyPhone, site } from '../../../telegram';
import { SIMPLE_MVP_MODE } from '../../../mvp';
import { issueSession } from '../../../telegram-login';
export const dynamic = 'force-dynamic';

/*
 * 🛵 Yetkazib berish (SIMPLE_MVP_MODE cart, #/cart): a delivery order without a password — name, phone (E.164
 * from the country selector), address (map pin and comment optional) and the cart. Prices and the delivery fee
 * come from the database, never from the browser. The order lands in the same orders table the owner's
 * dashboard (#/manage) confirms or rejects, and the restaurant's Telegram chats get it at once. Payment: cash /
 * card to the courier (pay_on_delivery). Like the quick booking, the browser gets a guest record and a session
 * so "Profil" shows the order; same-origin JSON only, at most 5 orders per phone and 10 per network an hour.
 * Demo restaurants answer with a sample result: nothing is saved or sent.
 */
export async function POST(request: Request) {
  try {
    if (!SIMPLE_MVP_MODE) throw new ApiError(404, 'Topilmadi.');
    const b = await body(request);
    const u = await identity().catch(() => null);
    const name = text(b.name, 2, 60).replace(/\s+/g, ' ');
    const contact = intlPhone(typeof b.phone === 'string' ? b.phone.replace(/[\s()-]/g, '') : b.phone);
    const restaurantId = text(b.restaurantId);
    const address = text(b.address, 3, 300);
    const comment = typeof b.comment === 'string' && b.comment.trim() ? text(b.comment, 1, 300) : '';
    const [lat, lng] = point(b.lat ?? null, b.lng ?? null, false);
    if (!Array.isArray(b.items) || !b.items.length || b.items.length > 30) throw new ApiError(400, 'Kamida bitta taom tanlang.');
    await throttle('quick-order:ip:' + clientIp(request), 10, 3600000);
    await throttle('quick-order:phone:' + contact, 5, 3600000);
    if (await banned(guestKeys(contact))) throw new ApiError(403, BAN_MESSAGE);
    const r = await env.DB!.prepare("SELECT id,name,is_demo,delivery_enabled,delivery_fee,delivery_minutes FROM restaurants WHERE id=? AND status='active'").bind(restaurantId).first<any>();
    if (!r) throw new ApiError(404, 'Restoran topilmadi.');
    if (!r.delivery_enabled) throw new ApiError(409, 'Bu restoran hozircha yetkazib bermaydi.');
    const rows = (await env.DB!.prepare('SELECT id,name,price FROM menu WHERE restaurant_id=? AND available=1').bind(restaurantId).all<any>()).results;
    const used = new Set<string>();
    let subtotal = 0;
    const items = b.items.map((it: any) => {
      if (!it || typeof it !== 'object' || typeof it.id !== 'string') throw new ApiError(400, 'Taom ma’lumoti noto‘g‘ri.');
      const quantity = integer(it.quantity, 1, 20);
      if (used.has(it.id)) throw new ApiError(400, 'Takroriy taom.');
      used.add(it.id);
      const m = rows.find((x: any) => x.id === it.id);
      if (!m) throw new ApiError(409, 'Taom mavjud emas. Menyuni yangilang.');
      subtotal += m.price * quantity;
      return { id: m.id, name: m.name, price: m.price, quantity };
    });
    const fee = Number(r.delivery_fee) || 0,
      total = subtotal + fee;
    if (!Number.isSafeInteger(total) || total > 100000000) throw new ApiError(400, 'Buyurtma summasi juda katta.');
    const summary = { subtotal, fee, total, minutes: Number(r.delivery_minutes) || 0, payment: 'pay_on_delivery' };
    if (r.is_demo || restaurantId.startsWith('rf-demo-')) return json({ ok: true, demo: true, id: 'demo', ...summary }, 201);
    let userId = u?.userId || '';
    if (!userId) {
      userId = 'guest:' + crypto.randomUUID();
      await env.DB!.prepare("INSERT INTO accounts (id,email,name,created_at,role,role_selected,provider,contact_phone) VALUES (?,'',?,?,'customer',1,'guest',?)").bind(userId, name, new Date().toISOString(), contact).run();
    } else if (userId.startsWith('guest:')) {
      await env.DB!.prepare('UPDATE accounts SET name=?,contact_phone=? WHERE id=?').bind(name, contact, userId).run();
    }
    const id = crypto.randomUUID();
    const where = comment ? `${address} — ${comment}` : address;
    await env.DB!.prepare("INSERT INTO orders (id,restaurant_id,user_id,items,total,phone,status,created_at,fulfillment,delivery_address,delivery_lat,delivery_lng,delivery_fee) VALUES (?,?,?,?,?,?,'pending',?,'delivery',?,?,?,?)")
      .bind(id, restaurantId, userId, JSON.stringify(items), total, contact, new Date().toISOString(), where.slice(0, 300), lat, lng, fee)
      .run();
    if (!u) await issueSession(userId);
    const money = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';
    const textMsg = [
      `🛵 <b>Yangi yetkazib berish buyurtmasi</b> — ${html(r.name)}`,
      ...items.map((i: any) => `• ${html(i.name)} × ${i.quantity} — ${money(i.price * i.quantity)}`),
      `Taomlar: ${money(subtotal)} · Yetkazish: ${money(fee)}`,
      `<b>Jami: ${money(total)}</b> (yetkazilganda to‘lanadi)`,
      `👤 ${html(name)} · 📞 ${html(prettyPhone(contact))}`,
      `📍 ${html(address)}${lat !== null ? ` — https://maps.google.com/?q=${lat},${lng}` : ''}`,
      ...(comment ? [`💬 ${html(comment)}`] : []),
      `Tasdiqlash / rad etish: ${site()}/#/manage`,
    ].join('\n');
    let notified = false;
    for (const chat_id of await restaurantChats(restaurantId)) if (await telegram('sendMessage', { chat_id, text: textMsg, parse_mode: 'HTML', disable_web_page_preview: true })) notified = true;
    return json({ ok: true, demo: false, id, notified, ...summary }, 201);
  } catch (e) {
    return failure(e);
  }
}
