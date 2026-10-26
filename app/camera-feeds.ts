import { ApiError, text } from './http';

/* Validation for Smart Vision camera records (app/api/manage/cameras). */
export const MAX_CAMERAS = 8;
export const MAX_ZONES = 40;

/** Zones are fractions of the picture: { table, x, y, w, h } with x+w and y+h inside 0..1. */
export function cleanZones(value: unknown) {
  if (!Array.isArray(value) || value.length > MAX_ZONES) throw new ApiError(400, 'Zonalar noto‘g‘ri.');
  return value.map((z: any) => {
    const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 10000) / 10000 : NaN);
    const zone = { table: z?.table, x: n(z?.x), y: n(z?.y), w: n(z?.w), h: n(z?.h) };
    if (!Number.isInteger(zone.table) || zone.table < 1 || zone.table > 500 || [zone.x, zone.y].some((v) => !(v >= 0 && v <= 1)) || [zone.w, zone.h].some((v) => !(v >= 0.02 && v <= 1)) || zone.x + zone.w > 1.0001 || zone.y + zone.h > 1.0001) throw new ApiError(400, 'Zonalar noto‘g‘ri.');
    // Boxes found by the AI table finder keep a flag so the page can mark them.
    return z?.ai === true ? { ...zone, ai: true } : zone;
  });
}

/** Only HTTPS streams: an http:// stream would be blocked as mixed content on the site anyway. */
export function cleanStreamUrl(value: unknown) {
  const raw = text(value, 8, 600);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ApiError(400, 'Oqim manzili noto‘g‘ri.');
  }
  if (url.protocol !== 'https:' || url.username || url.password) throw new ApiError(400, 'Oqim manzili https:// bilan boshlansin (login/parolsiz).');
  return url.toString();
}

