import { env } from 'cloudflare:workers';
import { ApiError, json, failure, text, integer, throttle } from '../../../http';
import { authorizeCamera as authorize } from '../../../camera-auth';
import { requireFeature } from '../../../plans';
import { IMAGE_TYPES, MAX_IMAGE_BASE64, readings, visionRequest, type VisionTable } from '../../../vision';
export const dynamic = 'force-dynamic';

async function readJson(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new ApiError(415, 'JSON talab etiladi.');
  const limit = MAX_IMAGE_BASE64 + 4000;
  if (Number(request.headers.get('content-length')) > limit) throw new ApiError(413, 'Kadr juda katta.');
  const raw = await request.text();
  if (raw.length > limit) throw new ApiError(413, 'Kadr juda katta.');
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
    return value;
  } catch {
    throw new ApiError(400, 'Noto‘g‘ri ma’lumot.');
  }
}

export async function POST(request: Request) {
  try {
    const b = await readJson(request);
    const restaurantId = text(b.restaurantId);
    const source = await authorize(request, restaurantId);
    await requireFeature(restaurantId, 'visionTables');
    // ~1 frame every 15 s per restaurant is plenty for occupancy and bounds API cost.
    // Cameras send a frame every 5 minutes; 6 per 10 minutes leaves room for up to three cameras.
    await throttle('vision:' + restaurantId, 6);

    const mimeType = typeof b.mimeType === 'string' && IMAGE_TYPES.includes(b.mimeType) ? b.mimeType : null;
    if (!mimeType || typeof b.image !== 'string' || !b.image.length || b.image.length > MAX_IMAGE_BASE64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(b.image)) throw new ApiError(400, 'Kadr JPEG, PNG yoki WebP base64 bo‘lsin.');
    const floor = b.floor === undefined ? null : integer(b.floor, 1, 10);
    const visible = Array.isArray(b.tables) ? new Set(b.tables.filter((n: unknown) => Number.isInteger(n)).slice(0, 50)) : null;

    const all = (await env.DB!.prepare('SELECT number,floor,seats,x,y,shape FROM restaurant_tables WHERE restaurant_id=? AND active=1 ORDER BY number').bind(restaurantId).all<VisionTable>()).results;
    const tables = all.filter((t) => (floor === null || t.floor === floor) && (!visible || visible.has(t.number)));
    if (!tables.length) throw new ApiError(400, 'Bu kamera uchun stollar topilmadi.');

    const key = env.OPENAI_API_KEY?.trim();
    if (!key) throw new ApiError(503, 'VISION_NOT_CONFIGURED');
    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify(visionRequest(env.OPENAI_VISION_MODEL || 'gpt-4o-mini', tables, b.image, mimeType, b.detail === 'high' ? 'high' : 'low')),
        signal: AbortSignal.timeout(25000),
      });
    } catch {
      throw new ApiError(504, 'AI_TIMEOUT');
    }
    if (!response.ok) throw new ApiError(response.status === 429 ? 429 : 503, response.status === 429 ? 'AI_LIMIT' : 'AI_UNAVAILABLE');
    let parsed: unknown;
    try {
      parsed = JSON.parse(((await response.json()) as any).choices?.[0]?.message?.content ?? '');
    } catch {
      throw new ApiError(502, 'AI_UNAVAILABLE');
    }

    const result = readings(parsed, tables);
    const now = new Date().toISOString();
    // A staff override stays in force for the live-status lifetime (20 min) before the camera takes over again.
    const manualUntil = new Date(Date.now() - 20 * 60000).toISOString();
    if (result.length)
      await env.DB!.batch(
        result.map((r) =>
          env.DB!.prepare("INSERT INTO table_live_status (restaurant_id,table_number,status,source,confidence,updated_at,since) VALUES (?,?,?,'vision',?,?,?) ON CONFLICT(restaurant_id,table_number) DO UPDATE SET since=CASE WHEN table_live_status.status=excluded.status THEN COALESCE(table_live_status.since,excluded.since) ELSE excluded.since END,status=excluded.status,source=excluded.source,confidence=excluded.confidence,updated_at=excluded.updated_at WHERE table_live_status.source<>'manual' OR table_live_status.updated_at<?")
            .bind(restaurantId, r.number, r.status, r.confidence, now, now, manualUntil),
        ),
      );
    return json({ ok: true, source, updatedAt: now, tables: result, skipped: tables.length - result.length });
  } catch (e) {
    return failure(e);
  }
}
