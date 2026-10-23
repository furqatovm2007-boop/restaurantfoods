import { env } from 'cloudflare:workers';
import { planState } from './plans';
import { telegram, telegramConfigured, html } from './telegram';

/*
 * Business/Premium growth features shared by the booking, table, camera and dashboard routes:
 * peak-hour deposits, table merging, promo / happy-hour discounts, VIP guest dossiers, the service
 * timer and the weekly analytics numbers. Pure helpers are exported for tests.
 */

const minutesOf = (hhmm: string) => {
  const [h, m] = String(hhmm).slice(0, 5).split(':').map(Number);
  return h * 60 + m;
};

// ---- Peak-hour deposit ----
export interface PeakRule {
  id?: string;
  days: string;
  date: string;
  start: string;
  end: string;
  amount: number;
  label?: string;
}
/** Weekday of a YYYY-MM-DD date (0 = Sunday). */
export const weekday = (date: string) => new Date(date + 'T12:00:00Z').getUTCDay();
/** The highest deposit among the rules covering this date and start time, or null. */
export function peakDepositFor(rules: PeakRule[], date: string, slot: string) {
  const at = minutesOf(slot),
    day = String(weekday(date));
  let best: PeakRule | null = null;
  for (const r of rules) {
    const dayMatch = r.date ? r.date === date : r.days.split(',').includes(day);
    if (dayMatch && at >= minutesOf(r.start) && at < minutesOf(r.end) && (!best || r.amount > best.amount)) best = r;
  }
  return best;
}
export const peakRules = async (restaurantId: string) => (await env.DB!.prepare('SELECT * FROM peak_rules WHERE restaurant_id=? ORDER BY date,days,start').bind(restaurantId).all<PeakRule>()).results;

// ---- Table merging ----
export interface PlanTable {
  number: number;
  floor: number;
  seats: number;
  x: number;
  y: number;
}
/** Two tables can be joined when they stand on the same floor this close on the plan (percent units). */
export const MERGE_DISTANCE = 24;
export const tablesClose = (a: PlanTable, b: PlanTable) => a.number !== b.number && a.floor === b.floor && Math.hypot(a.x - b.x, a.y - b.y) <= MERGE_DISTANCE;
/** Free neighbouring pairs that seat the group, best fit first (fewest spare seats, then nearest). */
export function mergeSuggestions(tables: PlanTable[], busy: Set<number>, guests: number, limit = 3) {
  const free = tables.filter((t) => !busy.has(t.number));
  const pairs: { tables: [number, number]; seats: number; distance: number }[] = [];
  for (let i = 0; i < free.length; i++)
    for (let j = i + 1; j < free.length; j++) {
      const a = free[i],
        b = free[j];
      if (tablesClose(a, b) && a.seats + b.seats >= guests) pairs.push({ tables: [a.number, b.number], seats: a.seats + b.seats, distance: Math.hypot(a.x - b.x, a.y - b.y) });
    }
  return pairs.sort((p, q) => p.seats - q.seats || p.distance - q.distance).slice(0, limit);
}

// ---- Discounts: birthday promo codes and happy hours ----
export async function validPromo(code: unknown, userId: string, restaurantId: string) {
  if (typeof code !== 'string' || !/^[A-Z0-9-]{6,20}$/.test(code.trim().toUpperCase())) return null;
  return env.DB!.prepare('SELECT * FROM promo_codes WHERE code=? AND user_id=? AND restaurant_id=? AND used_booking_id IS NULL AND expires_at>?').bind(code.trim().toUpperCase(), userId, restaurantId, new Date().toISOString()).first<{ code: string; percent: number; kind: string }>();
}

/** Happy hours: the hall is at least `threshold`% free right now (camera marks + bookings in progress). */
export function happyState(r: { happy_enabled: number; happy_threshold: number; happy_percent: number }, enabled: boolean, totalTables: number, busyNow: number) {
  if (!enabled || !r.happy_enabled || totalTables <= 0) return { active: false, percent: 0, freePercent: 0 };
  const freePercent = Math.round(((totalTables - busyNow) / totalTables) * 100);
  const active = freePercent >= r.happy_threshold;
  return { active, percent: active ? r.happy_percent : 0, freePercent };
}
/** Tables busy at this moment: fresh camera/staff "occupied" marks plus bookings covering now. */
export async function busyTablesNow(restaurantId: string, now = Date.now()) {
  const local = new Date(now + 5 * 3600000).toISOString(),
    date = local.slice(0, 10),
    hhmm = local.slice(11, 16);
  const [live, bookings] = await Promise.all([
    env.DB!.prepare("SELECT table_number FROM table_live_status WHERE restaurant_id=? AND status='occupied' AND updated_at>=strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes')").bind(restaurantId).all<{ table_number: number }>(),
    env.DB!.prepare("SELECT table_number,merged_table FROM bookings WHERE restaurant_id=? AND date=? AND status IN ('pending','confirmed') AND slot<=? AND (CASE WHEN end_slot<>'' THEN end_slot ELSE time(slot,'+2 hours') END)>?").bind(restaurantId, date, hhmm, hhmm).all<{ table_number: number; merged_table: number | null }>(),
  ]);
  const busy = new Set<number>(live.results.map((t) => t.table_number));
  for (const b of bookings.results) {
    busy.add(b.table_number);
    if (b.merged_table) busy.add(b.merged_table);
  }
  return busy;
}
export async function happyNow(r: any) {
  const enabled = planState(r).features.happyHours && !!r.happy_enabled;
  if (!enabled) return { active: false, percent: 0, freePercent: 0 };
  const total = (await env.DB!.prepare('SELECT COUNT(*) AS n FROM restaurant_tables WHERE restaurant_id=? AND active=1').bind(r.id).first<{ n: number }>())?.n ?? 0;
  const busy = await busyTablesNow(r.id);
  // Only during opening hours.
  const hhmm = new Date(Date.now() + 5 * 3600000).toISOString().slice(11, 16);
  if (r.booking_open && r.booking_close && (hhmm < r.booking_open || hhmm >= r.booking_close)) return { active: false, percent: 0, freePercent: 0 };
  return happyState(r, true, total, busy.size);
}

// ---- VIP guest dossier ----
export const VIP_VISITS = 3;
export const VIP_SPEND = 3000000;
export const isVip = (visits: number, spend: number) => visits > VIP_VISITS || spend >= VIP_SPEND;

/** Visits, spend, favourite dishes and table of one customer at one restaurant, with a short note. */
export async function guestDossier(restaurantId: string, userId: string) {
  const [visits, orders, account] = await Promise.all([
    env.DB!.prepare("SELECT table_number,date,preorder_items,preorder_total FROM bookings WHERE restaurant_id=? AND user_id=? AND (status='completed' OR checked_in_at IS NOT NULL) ORDER BY date DESC").bind(restaurantId, userId).all<any>(),
    env.DB!.prepare("SELECT items,total FROM orders WHERE restaurant_id=? AND user_id=? AND status IN ('confirmed','completed')").bind(restaurantId, userId).all<any>(),
    env.DB!.prepare('SELECT name,no_show_count FROM accounts WHERE id=?').bind(userId).first<any>(),
  ]);
  const dishes = new Map<string, number>(),
    tables = new Map<number, number>();
  const addItems = (raw: unknown) => {
    let list: any[] = [];
    try {
      list = typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    } catch {}
    for (const i of Array.isArray(list) ? list : []) if (i?.name) dishes.set(String(i.name), (dishes.get(String(i.name)) || 0) + (Number(i.quantity) || 1));
  };
  let spend = 0;
  for (const v of visits.results) {
    tables.set(v.table_number, (tables.get(v.table_number) || 0) + 1);
    addItems(v.preorder_items);
    spend += Number(v.preorder_total) || 0;
  }
  for (const o of orders.results) {
    addItems(o.items);
    spend += Number(o.total) || 0;
  }
  const favorites = [...dishes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }));
  const favoriteTable = [...tables.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const count = visits.results.length,
    vip = isVip(count, spend),
    last = visits.results[0]?.date ?? null;
  const name = String(account?.name || '').split(' ')[0] || 'Mehmon';
  const parts = [`${vip ? '⭐ VIP. ' : ''}${name}: ${count} marta kelgan`];
  if (favoriteTable) parts.push(`odatda ${favoriteTable}-stolni tanlaydi`);
  if (favorites.length) parts.push('sevimli taomlari: ' + favorites.map((f) => f.name).join(', '));
  if (last) parts.push('oxirgi tashrif: ' + last);
  if (account?.no_show_count) parts.push(`${account.no_show_count} marta kelmay qolgan`);
  return { vip, visits: count, spend, favorites, favoriteTable, lastVisit: last, noShows: account?.no_show_count || 0, note: parts.join(', ') + '.' };
}
/** VIP flags for many customers at once (dashboard booking list). */
export async function vipUsers(restaurantId: string) {
  const rows = (await env.DB!.prepare("SELECT user_id,SUM(CASE WHEN status='completed' OR checked_in_at IS NOT NULL THEN 1 ELSE 0 END) AS visits,SUM(CASE WHEN status='completed' OR checked_in_at IS NOT NULL THEN preorder_total ELSE 0 END) AS spend FROM bookings WHERE restaurant_id=? GROUP BY user_id").bind(restaurantId).all<{ user_id: string; visits: number; spend: number }>()).results;
  const orders = (await env.DB!.prepare("SELECT user_id,SUM(total) AS spend FROM orders WHERE restaurant_id=? AND status IN ('confirmed','completed') GROUP BY user_id").bind(restaurantId).all<{ user_id: string; spend: number }>()).results;
  const spend = new Map(orders.map((o) => [o.user_id, Number(o.spend) || 0]));
  return new Set(rows.filter((r) => isVip(Number(r.visits) || 0, (Number(r.spend) || 0) + (spend.get(r.user_id) || 0))).map((r) => r.user_id));
}

// ---- Service timer ----
/** Keeps seated/served times in step with table statuses after a camera, check-in or staff update. */
export async function trackSeats(restaurantId: string, numbers: number[]) {
  if (!numbers.length) return;
  const now = new Date().toISOString();
  await env.DB!.prepare(
    `UPDATE table_live_status SET seated_at=CASE WHEN status='occupied' THEN COALESCE(seated_at,?) WHEN status='free' THEN NULL ELSE seated_at END,served_at=CASE WHEN status='free' THEN NULL WHEN status='cleaning' AND seated_at IS NOT NULL THEN COALESCE(served_at,?) ELSE served_at END,alerted_at=CASE WHEN status='free' THEN NULL ELSE alerted_at END WHERE restaurant_id=? AND table_number IN (${numbers.map(() => '?').join(',')})`,
  ).bind(now, now, restaurantId, ...numbers).run();
  await env.DB!.prepare(`UPDATE service_alerts SET resolved_at=? WHERE restaurant_id=? AND resolved_at IS NULL AND table_number IN (SELECT table_number FROM table_live_status WHERE restaurant_id=? AND (status='free' OR served_at IS NOT NULL))`).bind(now, restaurantId, restaurantId).run();
}

/** Raises "guest waiting" alerts for tables seated longer than the restaurant's limit without service. */
export async function checkServiceTimer(restaurantId: string, nowMs = Date.now()) {
  const r = await env.DB!.prepare('SELECT * FROM restaurants WHERE id=?').bind(restaurantId).first<any>();
  if (!r || !r.service_timer_min || !planState(r).features.serviceTimer) return [];
  const limit = new Date(nowMs - r.service_timer_min * 60000).toISOString();
  const late = (await env.DB!.prepare("SELECT table_number,seated_at FROM table_live_status WHERE restaurant_id=? AND status='occupied' AND seated_at IS NOT NULL AND seated_at<? AND served_at IS NULL AND alerted_at IS NULL").bind(restaurantId, limit).all<{ table_number: number; seated_at: string }>()).results;
  const now = new Date(nowMs).toISOString();
  for (const t of late) {
    const claimed = await env.DB!.prepare('UPDATE table_live_status SET alerted_at=? WHERE restaurant_id=? AND table_number=? AND alerted_at IS NULL').bind(now, restaurantId, t.table_number).run();
    if (!claimed.meta.changes) continue;
    const waited = Math.max(r.service_timer_min, Math.round((nowMs - Date.parse(t.seated_at)) / 60000));
    await env.DB!.prepare('INSERT INTO service_alerts (id,restaurant_id,table_number,minutes,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(), restaurantId, t.table_number, waited, now).run();
    if (!telegramConfigured()) continue;
    const text = `⚠️ <b>${t.table_number}-stolda mijoz ${waited} daqiqadan beri kutmoqda!</b>\n🏠 ${html(r.name)}`;
    // The owner's restaurant chat and every manager who linked Telegram.
    const chats = new Set<string>();
    if (r.telegram_chat_id) chats.add(r.telegram_chat_id);
    for (const m of (await env.DB!.prepare("SELECT a.telegram_chat_id FROM restaurant_staff s JOIN accounts a ON a.id=s.user_id WHERE s.restaurant_id=? AND s.role='manager' AND a.telegram_chat_id IS NOT NULL").bind(restaurantId).all<{ telegram_chat_id: string }>()).results) chats.add(m.telegram_chat_id);
    for (const chat of chats) await telegram('sendMessage', { chat_id: chat, text, parse_mode: 'HTML' });
  }
  return late.map((t) => t.table_number);
}

// ---- Weekly analytics numbers (the AI report writes on top of these) ----
export async function weeklyStats(restaurantId: string, nowMs = Date.now()) {
  const today = new Date(nowMs + 5 * 3600000).toISOString().slice(0, 10);
  const from = new Date(nowMs + 5 * 3600000 - 6 * 86400000).toISOString().slice(0, 10);
  const [bookings, orders, penalties] = await Promise.all([
    env.DB!.prepare('SELECT slot,status,guests,preorder_items,preorder_total FROM bookings WHERE restaurant_id=? AND date BETWEEN ? AND ?').bind(restaurantId, from, today).all<any>(),
    env.DB!.prepare("SELECT items,total,status FROM orders WHERE restaurant_id=? AND substr(created_at,1,10) BETWEEN ? AND ?").bind(restaurantId, from, today).all<any>(),
    env.DB!.prepare("SELECT reason,status,SUM(amount) AS amount,COUNT(*) AS n FROM penalties WHERE restaurant_id=? AND substr(created_at,1,10)>=? GROUP BY reason,status").bind(restaurantId, from).all<any>(),
  ]);
  const dishes = new Map<string, number>(),
    hours = new Map<string, number>();
  const add = (raw: unknown) => {
    let list: any[] = [];
    try {
      list = typeof raw === 'string' ? JSON.parse(raw) : [];
    } catch {}
    for (const i of Array.isArray(list) ? list : []) if (i?.name) dishes.set(String(i.name), (dishes.get(String(i.name)) || 0) + (Number(i.quantity) || 1));
  };
  let guests = 0,
    noShows = 0,
    cancelled = 0;
  for (const b of bookings.results) {
    if (['pending', 'confirmed', 'completed'].includes(b.status)) {
      const h = String(b.slot).slice(0, 2) + ':00';
      hours.set(h, (hours.get(h) || 0) + 1);
      guests += Number(b.guests) || 0;
      add(b.preorder_items);
    }
    if (b.status === 'no_show') noShows++;
    if (b.status === 'cancelled') cancelled++;
  }
  let revenue = 0;
  for (const o of orders.results)
    if (['confirmed', 'completed'].includes(o.status)) {
      add(o.items);
      revenue += Number(o.total) || 0;
    }
  const penaltyPaid = penalties.results.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
  const penaltyUnpaid = penalties.results.filter((p: any) => p.status === 'failed').reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
  return {
    from,
    to: today,
    bookings: bookings.results.length,
    guests,
    noShows,
    cancelled,
    orderRevenue: revenue,
    topDishes: [...dishes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
    busyHours: [...hours.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([hour, count]) => ({ hour, count })),
    penaltyPaid,
    penaltyUnpaid,
  };
}
