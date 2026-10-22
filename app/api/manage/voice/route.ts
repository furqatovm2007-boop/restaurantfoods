import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, failure } from '../../../http';
import { planState } from '../../../plans';
import { voiceProxy } from '../../../ai-voice';
export const dynamic = 'force-dynamic';

// Voice for the restaurant Admin AI orb: owners and administrators of a restaurant with Admin AI.
export async function POST(request: Request) {
  try {
    const u = await identity();
    if (!u) throw new ApiError(401, 'AI_LOGIN_REQUIRED');
    if (!['admin', 'restaurant_owner'].includes(u.role)) throw new ApiError(403, 'AI_ADMIN_ONLY');
    if (u.role !== 'admin') {
      const rows = (await env.DB!.prepare('SELECT plan,trial_ends_at,paid_until FROM restaurants WHERE owner_id=? LIMIT 50').bind(u.userId).all<any>()).results;
      if (!rows.some((r) => planState(r).features.adminAi)) throw new ApiError(402, 'PLAN_UPGRADE_REQUIRED');
    }
    return await voiceProxy(request, 'voice-admin:' + u.userId);
  } catch (e) {
    return failure(e);
  }
}
