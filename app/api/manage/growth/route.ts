import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { accessToken, authConfig } from '../../../auth-service';
import { ApiError, json, failure, body, text, integer, throttle } from '../../../http';
import { planState, BUSINESS_AI_REPORTS_DAILY, BUSINESS_ADVISOR_DAILY, PREMIUM_ADVISOR_DAILY, type Feature } from '../../../plans';
import { readSse } from '../../../sse';
import { restaurantAccess, staffMemberships, STAFF_ROLES, atLeast } from '../../../staff';
import { guestDossier, weeklyStats, vipUsers, happyNow } from '../../../growth';
import { birthdayOffer, DEFAULT_PERCENT } from '../../../birthday';
import { aiHeaders, cloudflareOnly } from '../../../ai-key';
import { fallbackAnalysis } from '../../../ai-fallback';
export const dynamic = 'force-dynamic';

/*
 * Business/Premium settings and data for the restaurant dashboard:
 *   GET  view=settings (owner/manager) · view=alerts (waiter+) · view=guest (hostess+, Premium)
 *        view=staff (the staff panel: bookings without money for hostesses, + orders for waiters,
 *        + finance for managers) · view=memberships (restaurants where I work)
 *   POST peak_save / peak_delete · staff_add / staff_remove · settings · alert_resolve · report
 */
const need = (r: any, feature: Feature) => {
  if (!planState(r).features[feature]) throw new ApiError(402, 'PLAN_UPGRADE_REQUIRED');
};
const today = () => new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);

export async function GET(request: Request) {
  try {
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    const url = new URL(request.url),
      view = url.searchParams.get('view') || 'settings';
    if (view === 'memberships') return json({ memberships: await staffMemberships(u.userId) });
    const restaurantId = text(url.searchParams.get('restaurantId'));
    if (view === 'alerts') {
      // Hostesses get the feed too (new bookings, guest calls); resolving stays with waiters and up.
      const { level } = await restaurantAccess(restaurantId, u, 'hostess');
      const alerts = (await env.DB!.prepare('SELECT id,table_number,minutes,created_at FROM service_alerts WHERE restaurant_id=? AND resolved_at IS NULL ORDER BY created_at DESC LIMIT 20').bind(restaurantId).all()).results;
      // Guests calling the waiter or asking for the bill from their booking (app/api/bookings/service).
      const requests = await (env.DB!.prepare("SELECT id,table_number,kind,created_at FROM service_requests WHERE restaurant_id=? AND resolved_at IS NULL AND created_at>? ORDER BY created_at DESC LIMIT 20").bind(restaurantId, new Date(Date.now() - 3 * 3600000).toISOString()).all()
        .then((r) => r.results)
        .catch(() => [])); // the table arrives with migration 0034; until then the timer alerts still work
      // New bookings of the last 6 hours: the panel chimes once for each id it has not seen yet.
      const bookings = (await env.DB!.prepare("SELECT id,table_number,merged_table,date,slot,guests,created_at FROM bookings WHERE restaurant_id=? AND status='pending' AND created_at>? ORDER BY created_at DESC LIMIT 20").bind(restaurantId, new Date(Date.now() - 6 * 3600000).toISOString()).all()).results;
      return json({ alerts, requests, bookings, canResolve: level !== 'hostess' });
    }
    if (view === 'guest') {
      const { r } = await restaurantAccess(restaurantId, u, 'hostess');
      need(r, 'vipGuests');
      const b = await env.DB!.prepare('SELECT user_id FROM bookings WHERE id=? AND restaurant_id=?').bind(text(url.searchParams.get('bookingId')), restaurantId).first<{ user_id: string }>();
      if (!b) throw new ApiError(404, 'Bron topilmadi.');
      return json({ guest: await guestDossier(restaurantId, b.user_id) });
    }
    if (view === 'staff') {
      const { r, level } = await restaurantAccess(restaurantId, u, 'hostess');
      const f = planState(r).features;
      const money = atLeast(level, 'manager');
      const rows = (await env.DB!.prepare("SELECT b.id,b.user_id,b.date,b.slot,b.end_slot,b.table_number,b.merged_table,b.guests,b.status,b.checked_in_at,b.call_status,b.phone,b.preorder_items,b.preorder_total,b.prep_status,b.discount_percent,a.name AS customer_name,p.amount AS penalty_amount,p.status AS penalty_status FROM bookings b LEFT JOIN accounts a ON a.id=b.user_id LEFT JOIN penalties p ON p.booking_id=b.id WHERE b.restaurant_id=? AND b.date BETWEEN ? AND date(?,'+7 days') ORDER BY b.date,b.slot LIMIT 200").bind(restaurantId, today(), today()).all<any>()).results;
      const vip = f.vipGuests ? await vipUsers(restaurantId) : new Set<string>();
      // Hostesses never see money: no pre-order totals, penalties or orders.
      const bookings = rows.map((b) => ({ id: b.id, date: b.date, slot: b.slot, end_slot: b.end_slot, table_number: b.table_number, merged_table: b.merged_table, guests: b.guests, status: b.status, checked_in_at: b.checked_in_at, call_status: b.call_status, phone: b.phone, customer: String(b.customer_name || '').split(' ')[0], vip: vip.has(b.user_id), ...(money ? { preorder_total: b.preorder_total, penalty_amount: b.penalty_amount, penalty_status: b.penalty_status, discount_percent: b.discount_percent } : {}) }));
      const orders = atLeast(level, 'waiter') ? (await env.DB!.prepare("SELECT id,items,status,fulfillment,created_at" + (money ? ',total' : '') + " FROM orders WHERE restaurant_id=? AND substr(created_at,1,10)>=date(?,'-1 day') ORDER BY created_at DESC LIMIT 100").bind(restaurantId, today()).all()).results : [];
      const finance = money ? await env.DB!.prepare("SELECT COALESCE(SUM(CASE WHEN status='paid' THEN amount END),0) AS paid,COALESCE(SUM(CASE WHEN status='failed' THEN amount END),0) AS unpaid FROM penalties WHERE restaurant_id=?").bind(restaurantId).first() : null;
      return json({ restaurant: { id: r.id, name: r.name, tables: r.tables }, level, features: { serviceTimer: f.serviceTimer, vipGuests: f.vipGuests, liveTables: f.liveTables, aiReports: f.aiReports }, bookings, orders, finance });
    }
    // settings: owner and manager
    const { r, level } = await restaurantAccess(restaurantId, u, 'manager');
    const f = planState(r).features;
    const [peak, staff] = await Promise.all([
      env.DB!.prepare('SELECT id,days,date,start,end,amount,label FROM peak_rules WHERE restaurant_id=? ORDER BY date,days,start').bind(restaurantId).all(),
      level === 'owner' ? env.DB!.prepare('SELECT s.user_id,s.role,s.created_at,a.name,a.email FROM restaurant_staff s JOIN accounts a ON a.id=s.user_id WHERE s.restaurant_id=? ORDER BY s.created_at').bind(restaurantId).all() : Promise.resolve({ results: [] }),
    ]);
    return json({
      level,
      features: Object.fromEntries((['peakDeposit', 'tableMerge', 'birthdayCrm', 'staffAccounts', 'aiReports', 'serviceTimer', 'vipGuests', 'happyHours', 'tableView'] as Feature[]).map((k) => [k, f[k]])),
      peak: peak.results,
      staff: staff.results,
      settings: { birthdayEnabled: !!r.birthday_enabled, birthdayKind: birthdayOffer(r).type, birthdayPercent: r.birthday_percent || DEFAULT_PERCENT, birthdayAmount: r.birthday_amount, birthdayMinOrder: r.birthday_min_order, birthdayGift: r.birthday_gift, happyEnabled: !!r.happy_enabled, happyThreshold: r.happy_threshold, happyPercent: r.happy_percent, serviceTimerMin: r.service_timer_min },
      happy: await happyNow(r),
    });
  } catch (e) {
    return failure(e);
  }
}

const time = (v: unknown) => {
  if (typeof v !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) throw new ApiError(400, 'Vaqt HH:MM formatida bo‘lsin.');
  return v;
};

export async function POST(request: Request) {
  try {
    const b = await body(request),
      u = await identity();
    if (!u) throw new ApiError(401, 'Avval kiring.');
    const restaurantId = text(b.restaurantId);
    await throttle('growth:' + u.userId, 120);
    if (b.action === 'request_resolve') {
      await restaurantAccess(restaurantId, u, 'waiter');
      await env.DB!.prepare('UPDATE service_requests SET resolved_at=? WHERE id=? AND restaurant_id=? AND resolved_at IS NULL').bind(new Date().toISOString(), text(b.id), restaurantId).run();
      return json({ ok: true });
    }
    // Live tracker: the kitchen step of a confirmed booking's pre-ordered dishes, seen by the customer at once.
    if (b.action === 'prep') {
      await restaurantAccess(restaurantId, u, 'waiter');
      const status = text(b.status);
      if (!['preparing', 'serving', 'ready'].includes(status)) throw new ApiError(400, 'Holat noto‘g‘ri.');
      const done = await env.DB!.prepare("UPDATE bookings SET prep_status=? WHERE id=? AND restaurant_id=? AND status IN ('confirmed','completed')").bind(status, text(b.id), restaurantId).run();
      if (!done.meta.changes) throw new ApiError(409, 'Avval bronni tasdiqlang.');
      return json({ ok: true });
    }
    if (b.action === 'alert_resolve') {
      await restaurantAccess(restaurantId, u, 'waiter');
      const a = await env.DB!.prepare('UPDATE service_alerts SET resolved_at=? WHERE id=? AND restaurant_id=? AND resolved_at IS NULL RETURNING table_number').bind(new Date().toISOString(), text(b.id), restaurantId).first<{ table_number: number }>();
      if (a) await env.DB!.prepare('UPDATE table_live_status SET served_at=COALESCE(served_at,?) WHERE restaurant_id=? AND table_number=?').bind(new Date().toISOString(), restaurantId, a.table_number).run();
      return json({ ok: true });
    }
    if (b.action === 'report') return await aiReport(restaurantId, u, b.lang);
    if (b.action === 'advisor') return await aiAdvisor(restaurantId, u, b);
    const { r } = await restaurantAccess(restaurantId, u, b.action === 'settings' || b.action?.startsWith('peak_') ? 'manager' : 'owner');
    if (b.action === 'peak_save') {
      need(r, 'peakDeposit');
      const days = Array.isArray(b.days) ? [...new Set(b.days.map((d: unknown) => integer(d, 0, 6)))].sort().join(',') : '';
      const date = typeof b.date === 'string' && b.date ? (/^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : (() => { throw new ApiError(400, 'Sana noto‘g‘ri.'); })()) : '';
      if (!days && !date) throw new ApiError(400, 'Hafta kunlari yoki bayram sanasini tanlang.');
      const start = time(b.start),
        end = time(b.end);
      if (end <= start) throw new ApiError(400, 'Tugash vaqti boshlanishdan keyin bo‘lsin.');
      const amount = integer(b.amount, 10000, 5000000),
        label = text(b.label || '', 0, 60);
      if (b.id) {
        const res = await env.DB!.prepare('UPDATE peak_rules SET days=?,date=?,start=?,end=?,amount=?,label=? WHERE id=? AND restaurant_id=?').bind(days, date, start, end, amount, label, text(b.id), restaurantId).run();
        if (!res.meta.changes) throw new ApiError(404, 'Qoida topilmadi.');
        return json({ ok: true, id: b.id });
      }
      const count = (await env.DB!.prepare('SELECT COUNT(*) AS n FROM peak_rules WHERE restaurant_id=?').bind(restaurantId).first<{ n: number }>())?.n ?? 0;
      if (count >= 20) throw new ApiError(409, 'Ko‘pi bilan 20 ta tig‘iz vaqt qoidasi.');
      const id = crypto.randomUUID();
      await env.DB!.prepare('INSERT INTO peak_rules (id,restaurant_id,days,date,start,end,amount,label,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, restaurantId, days, date, start, end, amount, label, new Date().toISOString()).run();
      return json({ ok: true, id }, 201);
    }
    if (b.action === 'peak_delete') {
      await env.DB!.prepare('DELETE FROM peak_rules WHERE id=? AND restaurant_id=?').bind(text(b.id), restaurantId).run();
      return json({ ok: true });
    }
    if (b.action === 'staff_add') {
      need(r, 'staffAccounts');
      const role = text(b.role);
      if (!(STAFF_ROLES as readonly string[]).includes(role)) throw new ApiError(400, 'Rol noto‘g‘ri.');
      const email = text(b.email, 3, 254).toLowerCase();
      const a = await env.DB!.prepare("SELECT id,role FROM accounts WHERE lower(email)=? AND status='active'").bind(email).first<{ id: string; role: string }>();
      if (!a) throw new ApiError(404, 'Bu email bilan akkaunt topilmadi. Xodim avval saytda ro‘yxatdan o‘tsin.');
      if (a.id === r.owner_id || a.role === 'admin') throw new ApiError(400, 'Restoran egasi yoki administratorni xodim qilib bo‘lmaydi.');
      const count = (await env.DB!.prepare('SELECT COUNT(*) AS n FROM restaurant_staff WHERE restaurant_id=?').bind(restaurantId).first<{ n: number }>())?.n ?? 0;
      if (count >= 30) throw new ApiError(409, 'Ko‘pi bilan 30 ta xodim.');
      await env.DB!.prepare('INSERT INTO restaurant_staff (restaurant_id,user_id,role,created_by,created_at) VALUES (?,?,?,?,?) ON CONFLICT(restaurant_id,user_id) DO UPDATE SET role=excluded.role').bind(restaurantId, a.id, role, u.userId, new Date().toISOString()).run();
      return json({ ok: true });
    }
    if (b.action === 'staff_remove') {
      await env.DB!.prepare('DELETE FROM restaurant_staff WHERE restaurant_id=? AND user_id=?').bind(restaurantId, text(b.userId)).run();
      return json({ ok: true });
    }
    if (b.action === 'settings') {
      const f = planState(r).features;
      const set: string[] = [],
        args: unknown[] = [];
      const put = (col: string, v: unknown) => (set.push(col + '=?'), args.push(v));
      if (b.birthdayPercent !== undefined) (need(r, 'birthdayCrm'), put('birthday_percent', integer(b.birthdayPercent, 5, 50)));
      if (b.birthdayEnabled !== undefined) (need(r, 'birthdayCrm'), put('birthday_enabled', b.birthdayEnabled === true ? 1 : 0));
      if (b.birthdayAmount !== undefined) (need(r, 'birthdayCrm'), put('birthday_amount', integer(b.birthdayAmount, 10000, 1000000)));
      if (b.birthdayMinOrder !== undefined) (need(r, 'birthdayCrm'), put('birthday_min_order', integer(b.birthdayMinOrder, 0, 10000000)));
      if (b.birthdayGift !== undefined) (need(r, 'birthdayCrm'), put('birthday_gift', typeof b.birthdayGift === 'string' ? b.birthdayGift.trim().slice(0, 120) : ''));
      if (b.birthdayKind !== undefined) {
        need(r, 'birthdayCrm');
        if (!['percent', 'amount', 'gift'].includes(String(b.birthdayKind))) throw new ApiError(400, 'Chegirma turi: foiz, summa yoki sovg‘a.');
        if (b.birthdayKind === 'gift' && !(typeof b.birthdayGift === 'string' ? b.birthdayGift : r.birthday_gift || '').trim()) throw new ApiError(400, 'Sovg‘a nomini yozing (masalan: bepul bayram torti).');
        put('birthday_kind', b.birthdayKind);
      }
      if (b.happyEnabled !== undefined) {
        if (b.happyEnabled === true && !f.happyHours) need(r, 'happyHours');
        put('happy_enabled', b.happyEnabled === true ? 1 : 0);
      }
      if (b.happyThreshold !== undefined) put('happy_threshold', integer(b.happyThreshold, 30, 95));
      if (b.happyPercent !== undefined) put('happy_percent', integer(b.happyPercent, 5, 50));
      if (b.serviceTimerMin !== undefined) (need(r, 'serviceTimer'), put('service_timer_min', integer(b.serviceTimerMin, 0, 60)));
      if (!set.length) throw new ApiError(400, 'O‘zgarish yo‘q.');
      await env.DB!.prepare('UPDATE restaurants SET ' + set.join(',') + ' WHERE id=?').bind(...args, restaurantId).run();
      return json({ ok: true });
    }
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}

/** AI weekly report: numbers from the database, a short written analysis from the model on top. */
async function aiReport(restaurantId: string, u: { userId: string; role: string }, lang: unknown) {
  const { r } = await restaurantAccess(restaurantId, u, 'manager');
  need(r, 'aiReports');
  const premium = planState(r).effective === 'premium';
  // Business: limited reports per day; Premium: unlimited (only an abuse guard).
  await throttle('ai-report-day:' + restaurantId, premium ? 50 : BUSINESS_AI_REPORTS_DAILY, 86400000).catch((e) => {
    throw e instanceof ApiError && e.status === 429 ? new ApiError(429, premium ? 'Bugungi hisobotlar soni tugadi.' : 'Business tarifida kuniga ' + BUSINESS_AI_REPORTS_DAILY + ' ta AI hisobot. Cheksiz — Premium tarifida.') : e;
  });
  const stats = await weeklyStats(restaurantId);
  const l = ['uz', 'ru', 'en'].includes(String(lang)) ? String(lang) : 'uz';
  const analysis = await askAnalysis(l, 'Write a weekly report for the owner: best-selling dishes, busiest hours, bookings, no-shows and penalty income, then 3-5 concrete recommendations with their expected effect. Max 220 words. Use only the numbers given.', { restaurant: r.name, weeklyStats: stats }, []);
  return json({ stats, summary: analysis.text.slice(0, 3000), ai: !!analysis.text, model: analysis.model });
}

/**
 * Finance and business analytics on the larger model (gpt-4o via the Edge Function, analysis:true).
 * Returns the written answer, or '' when the AI is unavailable (the numbers are still shown).
 */
/** Sol (gpt-6.1-sol, backup gpt-4o) through the Edge Function; the internal engine answers when OpenAI cannot. */
async function askAnalysis(lang: string, message: string, context: unknown, history: { role: string; content: string }[]) {
  const token = await accessToken(),
    c = authConfig();
  let out = '',
    model = '';
  // Admin chose Cloudflare Workers AI only: skip OpenAI, the internal engine below answers.
  if (token && c.url && c.key && !(await cloudflareOnly()))
    try {
      const res = await fetch(c.url + '/functions/v1/restaurantfoods-ai', {
        method: 'POST',
        headers: await aiHeaders({ 'Content-Type': 'application/json', apikey: c.key, Authorization: 'Bearer ' + token, ...(c.proxy ? { 'X-RF-Proxy': c.proxy } : {}) }),
        body: JSON.stringify({ mode: 'admin_chat', analysis: true, lang, voice: false, message, context, history }),
        signal: AbortSignal.timeout(60000),
      });
      if (res.ok && res.body)
        for await (const ev of readSse(res.body)) {
          try {
            const d = JSON.parse(ev.data);
            if (ev.event === 'delta' && typeof d?.text === 'string') out += d.text;
            if (ev.event === 'done' && typeof d?.model === 'string') model = d.model;
            if (ev.event === 'error') out = '';
          } catch {}
        }
    } catch {
      out = '';
    }
  if (out.trim()) return { text: out.trim().slice(0, 6000), model: model || 'gpt-6.1-sol' };
  const fb = await fallbackAnalysis(lang as 'uz', message, context, history).catch(() => null);
  return fb ? { text: fb.reply.slice(0, 6000), model: fb.engine === 'workers-ai' ? 'Workers AI' : 'RestaurantFoods AI' } : { text: '', model: '' };
}

/** AI finance and business advisor (Business: limited per day, Premium: generous): the owner's question + 7 and 30 day numbers. */
async function aiAdvisor(restaurantId: string, u: { userId: string; role: string }, b: any) {
  const { r } = await restaurantAccess(restaurantId, u, 'manager');
  need(r, 'aiReports');
  const premium = planState(r).effective === 'premium';
  const limit = premium ? PREMIUM_ADVISOR_DAILY : BUSINESS_ADVISOR_DAILY;
  await throttle('ai-advisor-day:' + restaurantId, limit, 86400000).catch((e) => {
    throw e instanceof ApiError && e.status === 429 ? new ApiError(429, (premium ? 'Bugungi savollar soni tugadi' : 'Business tarifida kuniga ' + limit + ' ta savol. Ko‘proq — Premium tarifida') + '.') : e;
  });
  const question = text(b.question, 3, 1200);
  const l = ['uz', 'ru', 'en'].includes(String(b.lang)) ? String(b.lang) : 'uz';
  const history = (Array.isArray(b.history) ? b.history : []).slice(-6).filter((m: any) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.length <= 3000);
  const [week, month] = await Promise.all([weeklyStats(restaurantId), weeklyStats(restaurantId, Date.now(), 30)]);
  const context = { restaurant: r.name, plan: planState(r).effective, serviceFeePercent: r.service_fee_percent, depositAmount: r.deposit_amount, last7Days: week, last30Days: month };
  const answer = await askAnalysis(l, question, context, history);
  if (!answer.text) throw new ApiError(503, 'AI maslahatchi hozir javob bera olmadi. Birozdan keyin urinib ko‘ring.');
  return json({ answer: answer.text, model: answer.model, stats: { last7Days: week, last30Days: month } });
}
