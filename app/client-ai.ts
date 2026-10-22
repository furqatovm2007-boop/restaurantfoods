import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * Rules of the customer AI assistant (separate from the restaurant Admin AI):
 *  - customers only: couriers and restaurant staff do not get it;
 *  - one free question per Tashkent day, plus one for every real booking or order the
 *    customer placed that day (at most MAX_BONUS); site administrators are not limited;
 *  - it only talks about restaurants whose plan includes `clientAi` (Premium or trial).
 * A question is counted before the model is called and refunded if the call fails.
 */
export const FREE_QUESTIONS_PER_DAY = 1;
export const MAX_BONUS = 5;

export interface AiUser {
  userId: string;
  role: string;
}

/** Calendar day in Tashkent (UTC+5), e.g. 2026-10-22. */
export const tashkentDay = (now = Date.now()) => new Date(now + 5 * 3600000).toISOString().slice(0, 10);
const dayStart = (day: string) => new Date(Date.parse(day + 'T00:00:00+05:00')).toISOString();

export function assertClientAiUser(u: AiUser) {
  if (u.role === 'courier') throw new ApiError(403, 'AI_NOT_FOR_COURIERS');
  if (u.role === 'restaurant_owner') throw new ApiError(403, 'AI_USE_ADMIN_ASSISTANT');
}

export async function clientAiQuota(userId: string, now = Date.now()) {
  const day = tashkentDay(now),
    since = dayStart(day);
  const row = await env
    .DB!.prepare(
      "SELECT (SELECT COUNT(*) FROM bookings WHERE user_id=? AND is_demo=0 AND status<>'cancelled' AND created_at>=?)+(SELECT COUNT(*) FROM orders WHERE user_id=? AND is_demo=0 AND status<>'cancelled' AND created_at>=?) AS bonus,(SELECT used FROM ai_quota WHERE user_id=? AND day=?) AS used",
    )
    .bind(userId, since, userId, since, userId, day)
    .first<{ bonus: number; used: number | null }>();
  const limit = FREE_QUESTIONS_PER_DAY + Math.min(Number(row?.bonus) || 0, MAX_BONUS);
  const used = Number(row?.used) || 0;
  return { day, limit, used, remaining: Math.max(0, limit - used) };
}

/** Counts one question or throws 429 AI_DAILY_LIMIT. Returns null for unlimited administrators. */
export async function takeClientAiQuestion(u: AiUser, now = Date.now()) {
  if (u.role === 'admin') return null;
  const quota = await clientAiQuota(u.userId, now);
  const row = await env
    .DB!.prepare('INSERT INTO ai_quota (user_id,day,used) VALUES (?,?,1) ON CONFLICT(user_id,day) DO UPDATE SET used=ai_quota.used+1 WHERE ai_quota.used<? RETURNING used')
    .bind(u.userId, quota.day, quota.limit)
    .first<{ used: number }>();
  if (!row || row.used > quota.limit) throw new ApiError(429, 'AI_DAILY_LIMIT');
  return { day: quota.day, limit: quota.limit, used: row.used, remaining: quota.limit - row.used };
}

export async function refundClientAiQuestion(userId: string, day: string) {
  await env.DB!.prepare('UPDATE ai_quota SET used=MAX(used-1,0) WHERE user_id=? AND day=?').bind(userId, day).run();
}
