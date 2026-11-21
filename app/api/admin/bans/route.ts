import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, body, text, throttle } from '../../../http';
import { intlPhone } from '../../../phone-codes';
export const dynamic = 'force-dynamic';

/*
 * Blacklist (app/guest-policy.ts): "ban:ph:<phone>" / "ban:tg:<chat>" rows, and the 7-day cancellation
 * strikes "strike:…". The admin lists them, lifts a ban (or clears strikes), or blocks a phone by hand.
 * Every change is written to admin_audit.
 */
async function admin() {
  const u = await identity();
  if (u?.role !== 'admin') throw new ApiError(403, 'Ruxsat yo‘q.');
  return u;
}
const audit = (actor: string, target: string, action: string, details: unknown) =>
  env.DB!.prepare('INSERT INTO admin_audit (id,actor_id,target_id,action,details,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(), actor, target, action, JSON.stringify(details), new Date().toISOString());

export async function GET() {
  try {
    await admin();
    const rows = (await env.DB!.prepare("SELECT key,value,updated_at FROM app_settings WHERE key LIKE 'ban:%' OR key LIKE 'strike:%' ORDER BY updated_at DESC LIMIT 300").all<any>()).results;
    return json({
      bans: rows.filter((r) => r.key.startsWith('ban:')).map((r) => {
        let v: any = {};
        try {
          v = JSON.parse(r.value);
        } catch {}
        return { key: r.key, kind: r.key.split(':')[1], who: r.key.split(':').slice(2).join(':'), at: v.at || r.updated_at, reason: String(v.reason || '') };
      }),
      strikes: rows.filter((r) => r.key.startsWith('strike:')).map((r) => {
        let n = 0;
        try {
          n = (JSON.parse(r.value) as number[]).filter((t) => Date.now() - t < 7 * 86400000).length;
        } catch {}
        return { key: r.key, kind: r.key.split(':')[1], who: r.key.split(':').slice(2).join(':'), count: n };
      }).filter((s) => s.count > 0),
    });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    const b = await body(request),
      u = await admin();
    await throttle('admin-bans:' + u.userId, 60);
    if (b.action === 'unban' || b.action === 'clear') {
      const key = text(b.key, 5, 80);
      if (!/^(ban|strike):(ph|tg):[+\d-]{3,25}$/.test(key)) throw new ApiError(400, 'Kalit noto‘g‘ri.');
      await env.DB!.batch([env.DB!.prepare('DELETE FROM app_settings WHERE key=?').bind(key), audit(u.userId, key, b.action === 'unban' ? 'ban-lifted' : 'strikes-cleared', {})]);
      return json({ ok: true });
    }
    if (b.action === 'ban') {
      const phone = intlPhone(typeof b.phone === 'string' ? b.phone.replace(/[\s()-]/g, '') : b.phone);
      const reason = typeof b.reason === 'string' && b.reason.trim() ? text(b.reason, 1, 200) : 'Administrator';
      const key = 'ban:ph:' + phone;
      await env.DB!.batch([
        env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'admin') ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(key, JSON.stringify({ at: new Date().toISOString(), reason }), new Date().toISOString()),
        audit(u.userId, key, 'ban-added', { reason }),
      ]);
      return json({ ok: true });
    }
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
