import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * 3D models of dishes (.glb). Stored in the site's own R2 bucket (models/<uuid>.glb, uploaded by the restaurant's
 * owner or the admin through /api/media/model) and served from the same origin, so the page's Content-Security-
 * Policy (connect-src 'self') lets the 3D viewer load them. The link of each dish is kept in app_settings
 * (dish3d:<menuId>) — no migration; the catalogue returns it as menu.model_3d_url.
 */
export const MODEL_MAX_BYTES = 15 * 1024 * 1024;
export const MODEL_KEY = /^models\/[a-f0-9-]{36}\.glb$/;
export const modelUrl = (key: string) => '/api/media/model?key=' + encodeURIComponent(key);
/** A binary glTF starts with "glTF" and its version 2. */
export const isGlb = (b: Uint8Array) => b.length > 20 && b[0] === 0x67 && b[1] === 0x6c && b[2] === 0x54 && b[3] === 0x46 && b[4] === 2;

/** Saves (or clears with '') a dish's model link after checking it is this restaurant's own uploaded model. */
export async function saveDishModel(menuId: string, restaurantId: string, raw: unknown) {
  if (raw === undefined) return;
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) {
    await env.DB!.prepare('DELETE FROM app_settings WHERE key=?').bind('dish3d:' + menuId).run();
    return;
  }
  const m = value.match(/^\/api\/media\/model\?key=(models(?:%2F|\/)[a-f0-9-]{36}\.glb)$/);
  if (!m) throw new ApiError(400, '3D model: “🧊 .glb faylni yuklash” tugmasi bilan yuklang (saytning o‘z omboridagi havola bo‘lishi kerak).');
  const key = decodeURIComponent(m[1]);
  const object = await env.BUCKET?.head(key);
  if (!object || object.customMetadata?.restaurantId !== restaurantId) throw new ApiError(403, '3D model bu restoranga tegishli emas.');
  await env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'menu') ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind('dish3d:' + menuId, modelUrl(key), new Date().toISOString()).run();
}
