import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, body, text, throttle } from '../../../http';
import { requireFeature } from '../../../plans';
import { MAX_CAMERAS, cleanStreamUrl, cleanZones } from '../../../camera-feeds';
export const dynamic = 'force-dynamic';

/*
 * Smart Vision cameras, kept per restaurant so the camera page reconnects to the same cameras
 * and zones on any visit. A camera is either a device on the computer/phone running the page
 * (deviceId is per browser, so the label is kept to find it again) or an HTTPS stream URL
 * (MJPEG, MP4/WebM or HLS). RTSP has to go through a gateway that serves one of those.
 */
async function manager(restaurantId: string) {
  const u = await identity();
  if (!u || !['admin', 'restaurant_owner'].includes(u.role)) throw new ApiError(403, 'Ruxsat yo‘q.');
  const r = await env.DB!.prepare('SELECT owner_id FROM restaurants WHERE id=?').bind(restaurantId).first<{ owner_id: string | null }>();
  if (!r || (u.role !== 'admin' && r.owner_id !== u.userId)) throw new ApiError(403, 'Restoranga ruxsat yo‘q.');
  await requireFeature(restaurantId, 'liveTables');
  return u;
}

const row = (c: any) => ({ id: c.id, name: c.name, kind: c.kind, deviceId: c.device_id, deviceLabel: c.device_label, streamUrl: c.stream_url, zones: JSON.parse(c.zones || '[]'), sort: c.sort, updatedAt: c.updated_at });

export async function GET(request: Request) {
  try {
    const restaurantId = text(new URL(request.url).searchParams.get('restaurantId'));
    await manager(restaurantId);
    const list = await env.DB!.prepare('SELECT * FROM camera_feeds WHERE restaurant_id=? ORDER BY sort,created_at').bind(restaurantId).all();
    return json({ cameras: list.results.map(row) });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    const b = await body(request);
    const restaurantId = text(b.restaurantId);
    const u = await manager(restaurantId);
    await throttle('cameras:' + u.userId, 120);
    if (b.action === 'delete') {
      await env.DB!.prepare('DELETE FROM camera_feeds WHERE id=? AND restaurant_id=?').bind(text(b.id), restaurantId).run();
      return json({ ok: true });
    }
    if (b.action !== 'save' || !b.camera || typeof b.camera !== 'object') throw new ApiError(400, 'Noto‘g‘ri so‘rov.');
    const c = b.camera;
    const kind = c.kind === 'stream' ? 'stream' : c.kind === 'device' ? 'device' : null;
    if (!kind) throw new ApiError(400, 'Kamera turi noto‘g‘ri.');
    const name = text(c.name, 1, 60);
    const deviceId = kind === 'device' ? text(c.deviceId || '', 0, 300) : '';
    const deviceLabel = kind === 'device' ? text(c.deviceLabel || '', 0, 200) : '';
    const streamUrl = kind === 'stream' ? cleanStreamUrl(c.streamUrl) : '';
    const zones = JSON.stringify(cleanZones(c.zones ?? []));
    const sort = Number.isInteger(c.sort) ? Math.max(0, Math.min(99, c.sort)) : 0;
    const now = new Date().toISOString();
    if (c.id) {
      const res = await env.DB!.prepare('UPDATE camera_feeds SET name=?,kind=?,device_id=?,device_label=?,stream_url=?,zones=?,sort=?,updated_at=? WHERE id=? AND restaurant_id=?').bind(name, kind, deviceId, deviceLabel, streamUrl, zones, sort, now, text(c.id), restaurantId).run();
      if (!res.meta.changes) throw new ApiError(404, 'Kamera topilmadi.');
      return json({ ok: true, id: c.id });
    }
    const count = await env.DB!.prepare('SELECT COUNT(*) AS n FROM camera_feeds WHERE restaurant_id=?').bind(restaurantId).first<{ n: number }>();
    if ((count?.n ?? 0) >= MAX_CAMERAS) throw new ApiError(400, `Ko‘pi bilan ${MAX_CAMERAS} ta kamera.`);
    const id = crypto.randomUUID();
    await env.DB!.prepare('INSERT INTO camera_feeds (id,restaurant_id,name,kind,device_id,device_label,stream_url,zones,sort,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, restaurantId, name, kind, deviceId, deviceLabel, streamUrl, zones, sort, now, now).run();
    return json({ ok: true, id }, 201);
  } catch (e) {
    return failure(e);
  }
}
