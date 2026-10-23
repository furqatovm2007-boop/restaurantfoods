import { env } from 'cloudflare:workers';
import { ApiError } from './http';
import { planState } from './plans';

/*
 * Restaurant access levels. The owner (and the site admin) can do everything; staff accounts are
 * granted per restaurant by the owner (Business/Premium, feature staffAccounts):
 *   hostess — sees bookings and checks guests in by QR; no money figures at all;
 *   waiter  — + orders, live table marks, "served" on the service timer;
 *   manager — + finance (penalties, balances), analytics, late cancel / no-show, Call AI.
 * Staff keep their own customer role; access comes only from restaurant_staff rows.
 */
export type Level = 'hostess' | 'waiter' | 'manager' | 'owner';
export const STAFF_ROLES = ['hostess', 'waiter', 'manager'] as const;
const RANK: Record<Level, number> = { hostess: 1, waiter: 2, manager: 3, owner: 4 };
export const atLeast = (level: Level, need: Level) => RANK[level] >= RANK[need];

interface Who {
  userId: string;
  role: string;
}

/** The restaurant row and the caller's level there; throws 403 below `need`. */
export async function restaurantAccess(restaurantId: string, u: Who | null, need: Level = 'owner') {
  if (!u) throw new ApiError(401, 'Avval kiring.');
  const r = await env.DB!.prepare('SELECT * FROM restaurants WHERE id=?').bind(restaurantId).first<any>();
  if (!r) throw new ApiError(403, 'Restoranga ruxsat yo‘q.');
  let level: Level | null = u.role === 'admin' || r.owner_id === u.userId ? 'owner' : null;
  if (!level) {
    const staff = await env.DB!.prepare('SELECT role FROM restaurant_staff WHERE restaurant_id=? AND user_id=?').bind(restaurantId, u.userId).first<{ role: Level }>();
    // Staff access works only while the restaurant's plan includes staff accounts.
    if (staff && planState(r).features.staffAccounts) level = staff.role;
  }
  if (!level || !atLeast(level, need)) throw new ApiError(403, 'Restoranga ruxsat yo‘q.');
  return { r, level };
}

/** Restaurants where the user works as staff (for the dashboard and navigation). */
export async function staffMemberships(userId: string) {
  const rows = (await env.DB!.prepare('SELECT s.restaurant_id,s.role,r.name,r.plan,r.trial_ends_at,r.paid_until FROM restaurant_staff s JOIN restaurants r ON r.id=s.restaurant_id WHERE s.user_id=?').bind(userId).all<any>()).results;
  return rows.filter((r) => planState(r).features.staffAccounts).map((r) => ({ restaurantId: r.restaurant_id as string, role: r.role as Level, name: r.name as string }));
}
