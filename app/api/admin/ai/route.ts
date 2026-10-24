import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { authConfig } from '../../../auth-service';
import { ApiError, body, failure, json, sameOrigin, throttle } from '../../../http';
import { audit } from '../../../account-admin';
import { aiHeaders, keyStorageAvailable, saveOpenAiKey, storedKeyInfo } from '../../../ai-key';
export const dynamic = 'force-dynamic';

/*
 * Site administrator: AI status (which OpenAI models the key can use — GPT-6 Luna / GPT-6.1 Sol and
 * their backups — and whether the Workers AI reserve is bound) and the OpenAI key update. The key is
 * checked with OpenAI before it is saved, stored encrypted (app/ai-key.ts) and never sent back.
 */
async function admin() {
  const u = await identity();
  if (!u) throw new ApiError(401, 'Kirish talab etiladi');
  if (u.role !== 'admin') throw new ApiError(403, 'Ruxsat yo‘q');
  return u;
}

/** Edge Function status call (proxy secret only). `candidate` checks a key before it is saved. */
async function edgeStatus(candidate?: string) {
  const c = authConfig();
  if (!c.url || !c.key || !c.proxy) return null;
  try {
    const base = { apikey: c.key, Authorization: 'Bearer ' + c.key, 'Content-Type': 'application/json', 'X-RF-Proxy': c.proxy, 'X-RF-Service': 'status' };
    const res = await fetch(c.url + '/functions/v1/restaurantfoods-ai', { method: 'POST', headers: candidate ? { ...base, 'X-RF-OpenAI-Key': candidate } : await aiHeaders(base), body: '{}', signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return (await res.json()) as { keySource: string; keyValid: boolean | null; luna: { model: string; backup: string }; sol: { model: string; backup: string }; models: Record<string, boolean> };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await admin();
    const [status, stored] = await Promise.all([edgeStatus(), storedKeyInfo()]);
    const active = (pair?: { model: string; backup: string }) => (pair && status?.keyValid ? (status.models[pair.model] ? pair.model : status.models[pair.backup] ? pair.backup : null) : null);
    return json({
      edge: status,
      luna: { model: status?.luna.model || 'gpt-6-luna', backup: 'gpt-4o-mini', active: active(status?.luna) },
      sol: { model: status?.sol.model || 'gpt-6.1-sol', backup: 'gpt-4o', active: active(status?.sol) },
      key: { source: status?.keySource || 'unknown', valid: status?.keyValid ?? null, stored, storageAvailable: keyStorageAvailable() },
      reserve: { workersAi: !!(env as unknown as { AI?: unknown }).AI, rules: true },
    });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const u = await admin();
    await throttle('admin-ai-key:' + u.userId, 10);
    const b = await body(request);
    if (b.action === 'remove') {
      await saveOpenAiKey(null, u.userId);
      await audit(u.userId, 'openai-key', 'ai-key-remove', {}).run();
      return json({ ok: true });
    }
    if (b.action !== 'save') throw new ApiError(400, 'Noma’lum amal.');
    if (!keyStorageAvailable()) throw new ApiError(503, 'Kalitni saqlash uchun Worker’da RF_PROXY_SECRET sozlangan bo‘lishi kerak.');
    const key = typeof b.key === 'string' ? b.key.trim() : '';
    if (!/^sk-[A-Za-z0-9_-]{20,300}$/.test(key)) throw new ApiError(400, 'OpenAI kaliti “sk-” bilan boshlanadi. Uni to‘liq nusxalab qo‘ying.');
    const check = await edgeStatus(key);
    if (!check) throw new ApiError(503, 'Kalitni tekshirib bo‘lmadi: AI xizmati javob bermadi. Birozdan keyin urinib ko‘ring.');
    if (check.keyValid !== true) throw new ApiError(400, 'OpenAI bu kalitni qabul qilmadi. Kalit to‘g‘ri va faol ekanini tekshiring.');
    await saveOpenAiKey(key, u.userId);
    await audit(u.userId, 'openai-key', 'ai-key-save', { last4: key.slice(-4) }).run();
    return json({ ok: true, last4: key.slice(-4), models: check.models });
  } catch (e) {
    return failure(e);
  }
}
