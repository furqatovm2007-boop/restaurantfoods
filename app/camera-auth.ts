import { env } from 'cloudflare:workers';
import { identity } from './access';
import { ApiError, sameOrigin } from './http';

const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), (v) => v.toString(16).padStart(2, '0')).join('');

/** Camera agents send `Authorization: Bearer rfcam_…`; managers use their normal session. */
export async function authorizeCamera(request: Request, restaurantId: string) {
  const header = request.headers.get('authorization') || '';
  if (header.startsWith('Bearer rfcam_')) {
    const hash = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(header.slice(7).trim())));
    const key = await env.DB!.prepare('SELECT id FROM camera_keys WHERE key_hash=? AND restaurant_id=? AND revoked=0').bind(hash, restaurantId).first<{ id: string }>();
    if (!key) throw new ApiError(401, 'Kamera kaliti yaroqsiz.');
    await env.DB!.prepare('UPDATE camera_keys SET last_used_at=? WHERE id=?').bind(new Date().toISOString(), key.id).run();
    return 'camera';
  }
  sameOrigin(request);
  const u = await identity();
  if (!u || !['admin', 'restaurant_owner'].includes(u.role)) throw new ApiError(403, 'Ruxsat yo‘q.');
  const owner = await env.DB!.prepare('SELECT owner_id FROM restaurants WHERE id=?').bind(restaurantId).first<{ owner_id: string | null }>();
  if (!owner || (u.role !== 'admin' && owner.owner_id !== u.userId)) throw new ApiError(403, 'Restoranga ruxsat yo‘q.');
  return 'manager';
}

