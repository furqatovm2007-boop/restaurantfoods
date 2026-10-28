import { env } from 'cloudflare:workers';
import { identity } from '../../access';
import { ApiError, json, failure, body, text, throttle } from '../../http';
import { restaurantAccess } from '../../staff';
import { telegram, html } from '../../telegram';
import { adminChats } from '../../health';
import { PACKAGES, addLead, leadsOf, markLead, hall3dOf, saveHall3d } from '../../hall-layout';
export const dynamic = 'force-dynamic';

/*
 * 3D hall (VIP, one-time service).
 *  GET  ?restaurantId — owner/admin: the restaurant's 3D state and its open request; admin without an id: all requests.
 *  POST lead — owner: a request (package, phone, note) → admin panel + the administrator's Telegram.
 *  POST set  — admin: switch the 3D hall on/off and attach the prepared model / configuration.
 *  POST mark — admin: request handled / reopened.
 */
const money = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';

export async function GET(request: Request) {
  try {
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval akkauntingizga kiring.');
    const id = new URL(request.url).searchParams.get('restaurantId');
    if (!id) {
      if (u.role !== 'admin') throw new ApiError(403, 'Faqat administrator uchun.');
      return json({ leads: await leadsOf(), packages: PACKAGES });
    }
    await restaurantAccess(text(id), u, 'owner');
    const [hall, leads] = await Promise.all([hall3dOf(text(id)), leadsOf()]);
    return json({ hall3d: u.role === 'admin' ? hall : { enabled: hall.enabled }, lead: leads.find((l) => l.restaurantId === id && l.status === 'new') || null, packages: PACKAGES });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    const b = await body(request),
      u = await identity();
    if (!u) throw new ApiError(401, 'Avval akkauntingizga kiring.');
    if (b.action === 'lead') {
      const restaurantId = text(b.restaurantId);
      const { r } = await restaurantAccess(restaurantId, u, 'owner');
      await throttle('hall3d-lead:' + u.userId, 10);
      const name = String(r.name || 'Restoran');
      const lead = await addLead({ restaurantId, restaurantName: name, ownerId: u.userId, package: b.package, phone: b.phone || u.contactPhone || '', note: b.note });
      const text3d = `✨ <b>3D zal uchun yangi ariza</b>\n🏢 ${html(name)}\n📦 ${html(PACKAGES[lead.package].label)} — ${money(lead.price)}\n📱 ${html(lead.phone || 'ko‘rsatilmagan')}${lead.note ? '\n📝 ' + html(lead.note) : ''}\n\nAdmin panel → 3D zal arizalari.`;
      for (const chat_id of await adminChats()) await telegram('sendMessage', { chat_id, text: text3d, parse_mode: 'HTML' });
      return json({ ok: true, lead }, 201);
    }
    if (u.role !== 'admin') throw new ApiError(403, 'Faqat administrator uchun.');
    if (b.action === 'set') {
      const restaurantId = text(b.restaurantId);
      if (!(await env.DB!.prepare('SELECT 1 FROM restaurants WHERE id=?').bind(restaurantId).first())) throw new ApiError(404, 'Restoran topilmadi.');
      return json({ ok: true, hall3d: await saveHall3d(restaurantId, b.enabled === true, b.config, u.userId) });
    }
    if (b.action === 'mark') return json({ ok: true, lead: await markLead(text(b.id), b.status === 'new' ? 'new' : 'done', u.userId) });
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
