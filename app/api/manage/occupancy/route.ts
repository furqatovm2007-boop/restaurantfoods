import { env } from 'cloudflare:workers';
import { ApiError, json, failure, text, throttle } from '../../../http';
import { authorizeCamera } from '../../../camera-auth';
import { requireFeature } from '../../../plans';
export const dynamic = 'force-dynamic';

/*
 * Smart Vision: the camera page detects people on the device (TensorFlow.js) and posts only
 * per-table "free" / "occupied" / "cleaning" (staff standing at the table) here; no frames reach the server. Statuses land in
 * table_live_status as source 'camera', so the live map and the customer booking plan show them.
 * A staff override ('manual') keeps priority for 20 minutes, as with the cloud vision agent.
 */
export async function POST(request: Request) {
  try {
    // Parsed here rather than with body(): key-holding camera agents send no Origin header;
    // browser sessions get the same-origin check inside authorizeCamera.
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new ApiError(415, 'JSON talab etiladi.');
    const raw = await request.text();
    if (raw.length > 8000) throw new ApiError(413, 'Ma’lumot juda katta.');
    let b: any;
    try {
      b = JSON.parse(raw);
    } catch {
      throw new ApiError(400, 'Noto‘g‘ri ma’lumot.');
    }
    if (!b || typeof b !== 'object' || Array.isArray(b)) throw new ApiError(400, 'Noto‘g‘ri ma’lumot.');
    const restaurantId = text(b.restaurantId);
    const source = await authorizeCamera(request, restaurantId);
    await requireFeature(restaurantId, 'liveTables');
    // The page posts on every change plus a heartbeat each minute; 200 per 10 minutes is ample.
    await throttle('occupancy:' + restaurantId, 200);
    if (!Array.isArray(b.tables) || !b.tables.length || b.tables.length > 50) throw new ApiError(400, '1–50 ta stol holatini yuboring.');
    const known = new Set((await env.DB!.prepare('SELECT number FROM restaurant_tables WHERE restaurant_id=? AND active=1').bind(restaurantId).all<{ number: number }>()).results.map((t) => t.number));
    const seen = new Set<number>();
    const rows = b.tables.map((t: any) => {
      if (!t || typeof t !== 'object' || !Number.isInteger(t.number) || !known.has(t.number) || seen.has(t.number)) throw new ApiError(400, 'Stol raqami noto‘g‘ri yoki restoranda yo‘q.');
      if (!['free', 'occupied', 'cleaning'].includes(t.status)) throw new ApiError(400, 'Holat noto‘g‘ri.');
      seen.add(t.number);
      const confidence = typeof t.confidence === 'number' && Number.isFinite(t.confidence) ? Math.max(0, Math.min(1, t.confidence)) : null;
      return { number: t.number as number, status: t.status as string, confidence };
    });
    const now = new Date().toISOString();
    const manualUntil = new Date(Date.now() - 20 * 60000).toISOString();
    await env.DB!.batch(
      rows.map((r: { number: number; status: string; confidence: number | null }) =>
        env.DB!.prepare("INSERT INTO table_live_status (restaurant_id,table_number,status,source,confidence,updated_at,since) VALUES (?,?,?,'camera',?,?,?) ON CONFLICT(restaurant_id,table_number) DO UPDATE SET since=CASE WHEN table_live_status.status=excluded.status THEN COALESCE(table_live_status.since,excluded.since) ELSE excluded.since END,status=excluded.status,source=excluded.source,confidence=excluded.confidence,updated_at=excluded.updated_at WHERE table_live_status.source<>'manual' OR table_live_status.updated_at<?")
          .bind(restaurantId, r.number, r.status, r.confidence, now, now, manualUntil),
      ),
    );
    return json({ ok: true, source, updatedAt: now, count: rows.length });
  } catch (e) {
    return failure(e);
  }
}
