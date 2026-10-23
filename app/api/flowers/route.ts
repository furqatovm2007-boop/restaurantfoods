import { env } from 'cloudflare:workers';
import { identity } from '../../access';
import { ApiError, json, failure, body, text, integer, phone, throttle } from '../../http';
import { imageUrl, point } from '../../geo';
import { cardBindingEnabled, chargeCard, refundReceipt } from '../../payme-cards';
export const dynamic = 'force-dynamic';

/*
 * Flowers. Florists (role 'florist', granted by the admin) post bouquets; customers order them
 * delivered to a table they booked or to their home, paid from their bound card (Payme). From
 * every paid order the platform keeps COMMISSION_RATE; the rest is the florist's.
 * One table (flowers) feeds both the florist cabinet and the public showcase: a post is public while
 * it is on sale (active=1), status 'active', approved and its seller's account is not suspended —
 * whoever added it (florist or admin; a seller who lost the florist role is hidden). Approved couriers see paid orders that need delivering.
 */
const PUBLIC = "f.active=1 AND f.status='active' AND f.is_approved=1 AND COALESCE(a.status,'active')<>'suspended' AND COALESCE(a.role,'admin') IN ('florist','admin')";
export const COMMISSION_RATE = 0.03;
export const commissionOf = (total: number) => Math.round(total * COMMISSION_RATE);
const PAID = "('paid','accepted','delivering','delivered')";
const NEXT: Record<string, string[]> = { paid: ['accepted', 'cancelled'], accepted: ['delivering', 'cancelled'], delivering: ['delivered'] };

export async function GET(request: Request) {
  try {
    const url = new URL(request.url),
      view = url.searchParams.get('view') || 'catalog';
    if (view === 'catalog') {
      const rows = await env.DB!.prepare("SELECT f.id,f.title,f.kind,f.size,f.price,f.image_url,f.description,f.florist_id,COALESCE(a.name,'RestaurantFoods') AS florist_name FROM flowers f LEFT JOIN accounts a ON a.id=f.florist_id WHERE " + PUBLIC + ' ORDER BY f.created_at DESC LIMIT 200').all();
      return json({ flowers: rows.results, commissionRate: COMMISSION_RATE, card: cardBindingEnabled() });
    }
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval akkauntingizga kiring.');
    if (view === 'mine') {
      // Customer: own orders and upcoming bookings a bouquet can be delivered to.
      const [orders, bookings] = await Promise.all([
        env.DB!.prepare('SELECT o.id,o.title,o.quantity,o.total,o.delivery_type,o.address,o.deliver_at,o.status,o.created_at,a.name AS florist_name FROM flower_orders o JOIN accounts a ON a.id=o.florist_id WHERE o.user_id=? ORDER BY o.created_at DESC LIMIT 100').bind(u.userId).all(),
        env.DB!.prepare("SELECT b.id,b.date,b.slot,b.table_number,r.name AS restaurant_name FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id WHERE b.user_id=? AND b.status IN ('pending','confirmed') AND b.date>=date('now','+5 hours') ORDER BY b.date,b.slot LIMIT 20").bind(u.userId).all(),
      ]);
      return json({ orders: orders.results, bookings: bookings.results });
    }
    if (view === 'florist') {
      if (!['florist', 'admin'].includes(u.role)) throw new ApiError(403, 'Gulchi kabineti faqat admin tasdiqlagan gulchilar uchun.');
      const [flowers, orders, sums] = await Promise.all([
        env.DB!.prepare('SELECT * FROM flowers WHERE florist_id=? ORDER BY created_at DESC').bind(u.userId).all(),
        env.DB!.prepare('SELECT id,title,quantity,total,commission,florist_amount,delivery_type,address,lat,lng,phone,note,deliver_at,status,created_at,(SELECT name FROM accounts WHERE id=courier_id) AS courier_name FROM flower_orders WHERE florist_id=? AND status NOT IN (?,?) ORDER BY created_at DESC LIMIT 200').bind(u.userId, 'pending_payment', 'payment_failed').all(),
        env.DB!.prepare(`SELECT COALESCE(SUM(florist_amount),0) AS earned,COALESCE(SUM(commission),0) AS commission,COUNT(*) AS count FROM flower_orders WHERE florist_id=? AND status IN ${PAID}`).bind(u.userId).first(),
      ]);
      return json({ flowers: flowers.results, orders: orders.results, totals: sums, commissionRate: COMMISSION_RATE });
    }
    if (view === 'admin') {
      if (u.role !== 'admin') throw new ApiError(403, 'Ruxsat yo‘q.');
      const [totals, orders] = await Promise.all([
        env.DB!.prepare(`SELECT COALESCE(SUM(total),0) AS sales,COALESCE(SUM(commission),0) AS commission,COUNT(*) AS count FROM flower_orders WHERE status IN ${PAID}`).first(),
        env.DB!.prepare("SELECT o.id,o.title,o.quantity,o.total,o.commission,o.florist_amount,o.delivery_type,o.address,o.status,o.created_at,COALESCE(f.name,'—') AS florist_name,COALESCE(c.name,'') AS courier_name FROM flower_orders o LEFT JOIN accounts f ON f.id=o.florist_id LEFT JOIN accounts c ON c.id=o.courier_id WHERE o.status<>'pending_payment' ORDER BY o.created_at DESC LIMIT 50").all(),
      ]);
      return json({ totals, orders: orders.results, commissionRate: COMMISSION_RATE });
    }
    if (view === 'courier') {
      // Approved couriers: paid orders the florist accepted, not yet taken by someone else.
      if (u.role !== 'courier' || !u.courierApproved) throw new ApiError(403, 'Kuryer akkaunti tasdiqlanmagan.');
      const rows = await env.DB!.prepare("SELECT o.id,o.title,o.quantity,o.delivery_type,o.address,o.lat,o.lng,o.phone,o.note,o.deliver_at,o.status,o.courier_id,COALESCE(f.name,'') AS florist_name FROM flower_orders o LEFT JOIN accounts f ON f.id=o.florist_id WHERE (o.status='accepted' AND o.courier_id IS NULL) OR (o.courier_id=? AND o.status IN ('accepted','delivering')) ORDER BY o.created_at LIMIT 50").bind(u.userId).all();
      return json({ orders: rows.results });
    }
    throw new ApiError(400, 'Noma’lum bo‘lim.');
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    const b = await body(request),
      u = await identity();
    if (!u) throw new ApiError(401, 'Avval akkauntingizga kiring.');
    const florist = ['florist', 'admin'].includes(u.role);
    if (b.action === 'save') {
      if (!florist) throw new ApiError(403, 'Gul joylash uchun admin gulchi huquqini berishi kerak.');
      await throttle('flower-save:' + u.userId, 60);
      const row = { title: text(b.title, 2, 120), kind: text(b.kind, 2, 60), size: text(b.size, 1, 60), price: integer(b.price, 1000, 50000000), image: imageUrl(b.imageUrl) || '', description: text(b.description || '', 0, 1000), active: b.active === false ? 0 : 1 };
      if (b.id) {
        const res = await env.DB!.prepare("UPDATE flowers SET title=?,kind=?,size=?,price=?,image_url=?,description=?,active=?,status='active',is_approved=1 WHERE id=? AND florist_id=?").bind(row.title, row.kind, row.size, row.price, row.image, row.description, row.active, text(b.id), u.userId).run();
        if (!res.meta.changes) throw new ApiError(404, 'Post topilmadi.');
        return json({ ok: true, id: b.id });
      }
      const id = crypto.randomUUID();
      // A new post is on the public showcase at once: on sale, active and approved.
      await env.DB!.prepare("INSERT INTO flowers (id,florist_id,title,kind,size,price,image_url,description,active,status,is_approved,created_at) VALUES (?,?,?,?,?,?,?,?,1,'active',1,?)").bind(id, u.userId, row.title, row.kind, row.size, row.price, row.image, row.description, new Date().toISOString()).run();
      return json({ ok: true, id }, 201);
    }
    if (b.action === 'remove') {
      if (!florist) throw new ApiError(403, 'Ruxsat yo‘q.');
      await env.DB!.prepare('UPDATE flowers SET active=0 WHERE id=? AND florist_id=?').bind(text(b.id), u.userId).run();
      return json({ ok: true });
    }
    if (b.action === 'order') {
      await throttle('flower-order:' + u.userId, 10);
      if (!cardBindingEnabled()) throw new ApiError(503, 'Karta orqali to‘lov hali ulanmagan.');
      const card = await env.DB!.prepare('SELECT token FROM payment_cards WHERE user_id=?').bind(u.userId).first<{ token: string }>();
      if (!card) throw new ApiError(402, 'To‘lov uchun avval bank kartangizni ulang (Profil → Karta).');
      const f = await env.DB!.prepare('SELECT f.* FROM flowers f LEFT JOIN accounts a ON a.id=f.florist_id WHERE f.id=? AND ' + PUBLIC).bind(text(b.flowerId)).first<any>();
      if (!f) throw new ApiError(404, 'Gul topilmadi yoki sotuvda emas.');
      if (f.florist_id === u.userId) throw new ApiError(400, 'O‘z gulingizni buyurtma qilib bo‘lmaydi.');
      const quantity = integer(b.quantity, 1, 20),
        total = f.price * quantity,
        commission = commissionOf(total),
        contact = phone(b.phone),
        note = text(b.note || '', 0, 300);
      let address = '',
        lat: number | null = null,
        lng: number | null = null,
        bookingId: string | null = null,
        deliverAt = '';
      if (b.deliveryType === 'table') {
        // To the customer's own upcoming booking: the restaurant, the table and its start time.
        const bk = await env.DB!.prepare("SELECT b.id,b.date,b.slot,b.table_number,r.name,r.address,r.latitude,r.longitude FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id WHERE b.id=? AND b.user_id=? AND b.status IN ('pending','confirmed')").bind(text(b.bookingId), u.userId).first<any>();
        if (!bk) throw new ApiError(400, 'Faol broningizni tanlang.');
        bookingId = bk.id;
        address = `${bk.name}${bk.address ? ', ' + bk.address : ''} — ${bk.table_number}-stol`;
        lat = bk.latitude ?? null;
        lng = bk.longitude ?? null;
        deliverAt = bk.date + ' ' + String(bk.slot).slice(0, 5);
      } else if (b.deliveryType === 'home') {
        [lat, lng] = point(b.latitude, b.longitude, true);
        address = typeof b.address === 'string' && b.address.trim() ? text(b.address, 1, 300) : 'Xaritada belgilangan joy';
        deliverAt = typeof b.deliverAt === 'string' ? text(b.deliverAt, 0, 40) : '';
      } else throw new ApiError(400, 'Yetkazish turini tanlang.');
      const id = crypto.randomUUID(),
        now = new Date().toISOString();
      await env.DB!.prepare("INSERT INTO flower_orders (id,user_id,florist_id,flower_id,title,quantity,total,commission,florist_amount,delivery_type,booking_id,address,lat,lng,phone,note,deliver_at,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending_payment',?)").bind(id, u.userId, f.florist_id, f.id, f.title, quantity, total, commission, total - commission, b.deliveryType, bookingId, address, lat, lng, contact, note, deliverAt, now).run();
      try {
        const receipt = await chargeCard(card.token, total, { flower_order_id: id }, 'Gul: ' + f.title);
        await env.DB!.prepare("UPDATE flower_orders SET status='paid',receipt_id=?,paid_at=? WHERE id=?").bind(receipt, new Date().toISOString(), id).run();
      } catch (e) {
        await env.DB!.prepare("UPDATE flower_orders SET status='payment_failed' WHERE id=?").bind(id).run();
        throw new ApiError(402, 'Kartadan to‘lov o‘tmadi: ' + String((e as Error).message || '').slice(0, 120));
      }
      return json({ ok: true, id, total, commission, status: 'paid' }, 201);
    }
    if (b.action === 'courier_take' || b.action === 'courier_done') {
      if (u.role !== 'courier' || !u.courierApproved) throw new ApiError(403, 'Kuryer akkaunti tasdiqlanmagan.');
      const res =
        b.action === 'courier_take'
          ? await env.DB!.prepare("UPDATE flower_orders SET courier_id=?,status='delivering' WHERE id=? AND status='accepted' AND courier_id IS NULL").bind(u.userId, text(b.id)).run()
          : await env.DB!.prepare("UPDATE flower_orders SET status='delivered' WHERE id=? AND courier_id=? AND status='delivering'").bind(text(b.id), u.userId).run();
      if (!res.meta.changes) throw new ApiError(409, 'Buyurtmani boshqa kuryer olgan yoki holati o‘zgargan.');
      return json({ ok: true });
    }
    if (b.action === 'status') {
      if (!florist) throw new ApiError(403, 'Ruxsat yo‘q.');
      const o = await env.DB!.prepare('SELECT id,status,receipt_id FROM flower_orders WHERE id=? AND florist_id=?').bind(text(b.id), u.userId).first<{ id: string; status: string; receipt_id: string | null }>();
      if (!o) throw new ApiError(404, 'Buyurtma topilmadi.');
      const next = text(b.status);
      if (!NEXT[o.status]?.includes(next)) throw new ApiError(409, 'Holatni bunday o‘zgartirib bo‘lmaydi.');
      // A cancelled paid order is refunded to the customer's card before it is marked cancelled.
      if (next === 'cancelled' && o.receipt_id) await refundReceipt(o.receipt_id);
      const res = await env.DB!.prepare('UPDATE flower_orders SET status=? WHERE id=? AND status=?').bind(next === 'cancelled' ? 'refunded' : next, o.id, o.status).run();
      if (!res.meta.changes) throw new ApiError(409, 'Holat allaqachon o‘zgargan.');
      return json({ ok: true });
    }
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
