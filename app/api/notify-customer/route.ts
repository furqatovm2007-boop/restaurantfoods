import { env } from 'cloudflare:workers';
import { identity } from '../../access';
import { ApiError, body, failure, json, sameOrigin, text, throttle } from '../../http';
import { restaurantAccess } from '../../staff';
import { html, telegram } from '../../telegram';
import { sendSms, smsConfigured } from '../../sms';
import { orderById, orderItems } from '../../hall';
export const dynamic = 'force-dynamic';

/*
 * After a table's bill is closed: the electronic receipt to the customer who booked the table — a formatted
 * message through the Telegram bot (when their account is linked to it) and a short SMS through Eskiz.
 * Staff of that restaurant only, once per bill. The reply says honestly what was sent and what was not.
 */
const money = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' so‘m';
const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');
type Outcome = 'sent' | 'skipped' | 'failed';

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    const b = await body(request);
    const order = await orderById(text(b.orderId));
    if (!order) throw new ApiError(404, 'Hisob topilmadi.');
    await restaurantAccess(order.restaurant_id, u, 'waiter');
    await throttle('notify:' + u.userId, 120);
    if (order.status !== 'closed') throw new ApiError(409, 'Avval hisobni yoping.');
    if (!order.booking_id && !order.customer_id) return json({ telegram: 'skipped', sms: 'skipped', reason: 'no_customer' });
    // Once per bill, even if the button is pressed twice.
    const claim = await env.DB!.prepare('UPDATE table_orders SET notified_at=? WHERE id=? AND notified_at IS NULL').bind(new Date().toISOString(), order.id).run();
    if (!claim.meta.changes) return json({ telegram: 'skipped', sms: 'skipped', reason: 'already_sent' });

    const r = await env.DB!.prepare('SELECT name FROM restaurants WHERE id=?').bind(order.restaurant_id).first<{ name: string }>();
    const customer = order.customer_id ? await env.DB!.prepare('SELECT name,telegram_chat_id FROM accounts WHERE id=?').bind(order.customer_id).first<{ name: string; telegram_chat_id: string | null }>() : null;
    const items = orderItems(order);
    const url = site() + '/#/chek/' + encodeURIComponent(order.id) + '/' + order.receipt_key;

    let tg: Outcome = 'skipped';
    if (customer?.telegram_chat_id) {
      const lines = items.map((i) => `• ${html(i.name)}${i.comment ? ` <i>(${html(i.comment)})</i>` : ''} — ${i.qty} × ${money(i.price)} = <b>${money(i.price * i.qty)}</b>`).join('\n');
      const textMsg =
        `🧾 <b>${html(r?.name || 'RestaurantFoods')}</b> — elektron chek\n` +
        `Chek № <b>${html(order.receipt_no || '')}</b> · ${order.table_number}-stol\n\n${lines}\n\n` +
        `Taomlar summasi: ${money(order.subtotal)}\n` +
        (order.service ? `Xizmat haqi (${order.service_percent}%): ${money(order.service)}\n` : '') +
        `<b>Jami to‘lov: ${money(order.total)}</b>\n\nTashrifingiz uchun rahmat! Yana kutib qolamiz 😊`;
      const sent = await telegram('sendMessage', { chat_id: customer.telegram_chat_id, text: textMsg, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🧾 Elektron chekni ochish', url }]] } });
      tg = sent ? 'sent' : 'failed';
    }

    let sms: Outcome = 'skipped';
    if (/^\+998\d{9}$/.test(order.customer_phone) && smsConfigured()) {
      try {
        // Short and plain: Eskiz sends only texts approved in its cabinet.
        await sendSms(order.customer_phone, `${(r?.name || 'RestaurantFoods').slice(0, 40)}: chek ${order.receipt_no}, jami ${money(order.total)}. Tashrifingiz uchun rahmat!`);
        sms = 'sent';
      } catch {
        sms = 'failed';
      }
    }
    if (tg !== 'sent' && sms !== 'sent') await env.DB!.prepare('UPDATE table_orders SET notified_at=NULL WHERE id=?').bind(order.id).run();
    return json({ telegram: tg, sms });
  } catch (e) {
    return failure(e);
  }
}
