import { env } from 'cloudflare:workers';
import { notifyWaitlist } from './telegram';

/*
 * Smart waitlist. A customer waits for a table the camera (or staff) shows as occupied. When the
 * table turns free, the first one waiting is notified and holds it for HOLD_MINUTES: during the
 * hold nobody else can book that table for the next 2 hours. An unused hold expires and the next
 * customer in line is notified.
 */
export const HOLD_MINUTES = 10;
export const MAX_ACTIVE_PER_USER = 3;

/** Expired holds give the table to the next in line (when it is still free). */
export async function expireHolds(restaurantId?: string) {
  const now = new Date().toISOString();
  const expired = (await env.DB!.prepare("SELECT DISTINCT restaurant_id,table_number FROM waitlist WHERE status='notified' AND hold_until<?" + (restaurantId ? ' AND restaurant_id=?' : '')).bind(...(restaurantId ? [now, restaurantId] : [now])).all<{ restaurant_id: string; table_number: number }>()).results;
  if (!expired.length) return;
  await env.DB!.prepare("UPDATE waitlist SET status='expired' WHERE status='notified' AND hold_until<?" + (restaurantId ? ' AND restaurant_id=?' : '')).bind(...(restaurantId ? [now, restaurantId] : [now])).run();
  for (const t of expired) await notifyNext(t.restaurant_id, t.table_number);
}

/**
 * Called when a table is reported free: if nobody holds it yet, the oldest waiting customer gets a
 * 10-minute hold. Safe to call on every heartbeat — it does nothing while a hold is running.
 */
export async function notifyNext(restaurantId: string, tableNumber: number) {
  const now = new Date();
  const live = await env.DB!.prepare("SELECT status FROM table_live_status WHERE restaurant_id=? AND table_number=? AND updated_at>=strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes')").bind(restaurantId, tableNumber).first<{ status: string }>();
  if (live && live.status !== 'free') return null;
  const holding = await env.DB!.prepare("SELECT id FROM waitlist WHERE restaurant_id=? AND table_number=? AND status='notified' AND hold_until>=?").bind(restaurantId, tableNumber, now.toISOString()).first();
  if (holding) return null;
  const next = await env.DB!.prepare("SELECT id FROM waitlist WHERE restaurant_id=? AND table_number=? AND status='waiting' ORDER BY created_at LIMIT 1").bind(restaurantId, tableNumber).first<{ id: string }>();
  if (!next) return null;
  const until = new Date(now.getTime() + HOLD_MINUTES * 60000).toISOString();
  await env.DB!.prepare("UPDATE waitlist SET status='notified',notified_at=?,hold_until=? WHERE id=? AND status='waiting'").bind(now.toISOString(), until, next.id).run();
  await notifyWaitlist(next.id);
  return next.id;
}
