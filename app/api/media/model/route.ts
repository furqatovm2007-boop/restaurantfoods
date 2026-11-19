import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, sameOrigin, text, throttle } from '../../../http';
import { isGlb, MODEL_KEY, MODEL_MAX_BYTES, modelUrl } from '../../../dish-model';
export const dynamic = 'force-dynamic';

/** Upload a dish's 3D model (.glb, ≤ 15 MB): the restaurant's owner or the admin. Body = the file. */
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const u = await identity();
    if (!u || !['restaurant_owner', 'admin'].includes(u.role)) throw new ApiError(403, '3D model yuklashga ruxsat yo‘q.');
    const restaurantId = text(new URL(request.url).searchParams.get('restaurantId'));
    const r = await env.DB!.prepare('SELECT owner_id FROM restaurants WHERE id=?').bind(restaurantId).first<{ owner_id: string }>();
    if (!r || (u.role !== 'admin' && r.owner_id !== u.userId)) throw new ApiError(403, 'Bu restoran sizga tegishli emas.');
    await throttle('model:' + u.userId, 20);
    if (!env.BUCKET) throw new ApiError(503, 'Fayl saqlash xizmati ulanmagan.');
    if (Number(request.headers.get('content-length')) > MODEL_MAX_BYTES) throw new ApiError(413, '3D model 15 MB dan kichik bo‘lsin.');
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (bytes.length > MODEL_MAX_BYTES) throw new ApiError(413, '3D model 15 MB dan kichik bo‘lsin.');
    if (!isGlb(bytes)) throw new ApiError(400, 'Bu .glb (glTF 2.0 binary) fayl emas.');
    const key = 'models/' + crypto.randomUUID() + '.glb';
    await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: 'model/gltf-binary' }, customMetadata: { restaurantId } });
    return json({ url: modelUrl(key) }, 201);
  } catch (e) {
    return failure(e);
  }
}

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get('key') || '';
    if (!MODEL_KEY.test(key)) throw new ApiError(404, '3D model topilmadi.');
    const object = await env.BUCKET?.get(key);
    if (!object) throw new ApiError(404, '3D model topilmadi.');
    return new Response(object.body, { headers: { 'Content-Type': 'model/gltf-binary', 'Cache-Control': 'public,max-age=31536000,immutable', 'X-Content-Type-Options': 'nosniff', ETag: object.httpEtag } });
  } catch (e) {
    return failure(e);
  }
}
