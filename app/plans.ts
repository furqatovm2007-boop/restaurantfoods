import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * Subscription plans. Every new restaurant starts a 14-day Premium trial; afterwards the
 * plan it chose is active only while `paid_until` is in the future. Unpaid restaurants keep
 * a working listing with Start-level features and see a payment request in the dashboard.
 * Payments are not processed online yet: an administrator records the paid period.
 */
export type PlanId = 'start' | 'business' | 'premium';
export type Feature = 'menu3d' | 'room3d' | 'adminAi' | 'liveTables' | 'clientAi' | 'visionTables' | 'analytics';
export type PlanStatus = 'trial' | 'active' | 'payment_required';

export const TRIAL_DAYS = 14;
const DAY = 86400000;

export const PLANS: Record<PlanId, { price: number; features: Feature[] }> = {
  start: { price: 199000, features: [] },
  // Business: 3D menu and a limited admin AI (bookings and incoming requests only, daily quota).
  // The camera, the live table map and the 3D hall are Premium only, together with the customer AI.
  business: { price: 399000, features: ['menu3d', 'adminAi'] },
  premium: { price: 699000, features: ['menu3d', 'room3d', 'adminAi', 'liveTables', 'clientAi', 'visionTables', 'analytics'] },
};
export const PLAN_IDS = Object.keys(PLANS) as PlanId[];
const ALL_FEATURES = PLANS.premium.features;

export interface PlanRow {
  plan?: string | null;
  trial_ends_at?: string | null;
  paid_until?: string | null;
}

export interface PlanState {
  /** Plan the restaurant pays for (or will pay for after the trial). */
  plan: PlanId;
  /** Plan whose features are currently on. */
  effective: PlanId;
  status: PlanStatus;
  trialEndsAt: string | null;
  paidUntil: string | null;
  /** Whole days left in the trial or paid period, 0 when payment is required. */
  daysLeft: number;
  features: Record<Feature, boolean>;
}

export const isPlan = (value: unknown): value is PlanId => typeof value === 'string' && value in PLANS;
const future = (iso: string | null | undefined, now: number) => !!iso && Date.parse(iso) > now;

export function planState(row: PlanRow, now = Date.now()): PlanState {
  const plan = isPlan(row.plan) ? row.plan : 'premium';
  const paid = future(row.paid_until, now);
  const trial = !paid && future(row.trial_ends_at, now);
  const status: PlanStatus = paid ? 'active' : trial ? 'trial' : 'payment_required';
  const effective: PlanId = paid ? plan : trial ? 'premium' : 'start';
  const until = paid ? row.paid_until : trial ? row.trial_ends_at : null;
  const enabled = new Set(PLANS[effective].features);
  return {
    plan,
    effective,
    status,
    trialEndsAt: row.trial_ends_at ?? null,
    paidUntil: row.paid_until ?? null,
    daysLeft: until ? Math.ceil((Date.parse(until) - now) / DAY) : 0,
    features: Object.fromEntries(ALL_FEATURES.map((f) => [f, enabled.has(f)])) as Record<Feature, boolean>,
  };
}

/** Admin AI questions per restaurant per day on Business; Premium (and the trial) is unlimited. */
export const BUSINESS_ADMIN_AI_DAILY = 30;

export const trialEnd = (now = Date.now()) => new Date(now + TRIAL_DAYS * DAY).toISOString();

/** Extends the paid period by whole 30-day months from today or from the current paid end. */
export function extendPaid(paidUntil: string | null | undefined, months: number, now = Date.now()) {
  const start = Math.max(now, paidUntil ? Date.parse(paidUntil) || 0 : 0);
  return new Date(start + months * 30 * DAY).toISOString();
}

export async function restaurantPlan(restaurantId: string) {
  const row = await env.DB!.prepare('SELECT id,owner_id,status,plan,trial_ends_at,paid_until FROM restaurants WHERE id=?').bind(restaurantId).first<PlanRow & { id: string; owner_id: string | null; status: string }>();
  if (!row) throw new ApiError(404, 'Restoran topilmadi.');
  return { row, state: planState(row) };
}

const PAID_CALLS: Feature[] = ['adminAi', 'clientAi', 'visionTables'];

/** Route guard: throws 402 when the restaurant's current plan does not include `feature`. */
export async function requireFeature(restaurantId: string, feature: Feature) {
  const result = await restaurantPlan(restaurantId);
  if (!result.state.features[feature]) throw new ApiError(402, 'PLAN_UPGRADE_REQUIRED');
  // Features that spend money on AI calls start once an administrator has approved the restaurant.
  if (PAID_CALLS.includes(feature) && result.row.status !== 'active') throw new ApiError(403, 'RESTAURANT_NOT_APPROVED');
  return result;
}
