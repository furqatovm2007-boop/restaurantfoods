import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * Live queue (virtual queue) for guests waiting in the hall when the restaurant is full. Staff add a
 * party on the hall till (tablet / laptop), see how long each has waited and which free table fits, and
 * seat them. Online bookings close an hour ahead (booking-rules.ts), so a booked guest arriving with a QR
 * pass never competes with this queue for the same table. Kept in app_settings ('livequeue:<restaurant>').
 */
export interface QueueEntry {
  id: string;
  name: string;
  guests: number;
  phone: string;
  createdAt: string;
}

export const MAX_QUEUE = 60;
const key = (restaurantId: string) => 'livequeue:' + restaurantId;

export async function queueOf(restaurantId: string): Promise<QueueEntry[]> {
  const row = await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key(restaurantId)).first<{ value: string }>();
  try {
    const list = JSON.parse(row?.value || '[]');
    return Array.isArray(list) ? list.filter((e) => e && typeof e.id === 'string' && typeof e.name === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveQueue(restaurantId: string, list: QueueEntry[], by: string) {
  await env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at,updated_by=excluded.updated_by")
    .bind(key(restaurantId), JSON.stringify(list), new Date().toISOString(), by)
    .run();
}

/** A party from the staff form: a name or label (1–40), 1–30 guests, an optional Uzbek phone. */
export function cleanEntry(input: any, now = new Date()): QueueEntry {
  const name = typeof input?.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
  const guests = Number(input?.guests);
  const phone = typeof input?.phone === 'string' ? input.phone.replace(/[\s()-]/g, '') : '';
  if (name.length < 1 || name.length > 40) throw new ApiError(400, 'Mehmon ismi yoki belgisi 1–40 belgi bo‘lsin.');
  if (!Number.isInteger(guests) || guests < 1 || guests > 30) throw new ApiError(400, 'Mehmonlar soni 1 dan 30 gacha.');
  if (phone && !/^\+998\d{9}$/.test(phone)) throw new ApiError(400, 'Telefon: +998 va 9 ta raqam (ixtiyoriy).');
  return { id: crypto.randomUUID(), name, guests, phone, createdAt: now.toISOString() };
}
