import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * Paid table decorations a restaurant offers with a booking ("Marry me", birthday balloons, flowers on
 * the table…). The list lives in app_settings ('decor:<restaurantId>'); a chosen decoration becomes one
 * extra line of the booking's preorder, so the receipt, the online deposit and the restaurant's booking
 * card all include it without a separate column.
 */
export interface Decoration {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const MAX_DECORATIONS = 20;
const key = (restaurantId: string) => 'decor:' + restaurantId;
const valid = (d: any): d is Decoration => !!d && typeof d.id === 'string' && typeof d.name === 'string' && Number.isSafeInteger(d.price) && d.price >= 0;

export async function decorationsOf(restaurantId: string): Promise<Decoration[]> {
  const row = await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key(restaurantId)).first<{ value: string }>();
  try {
    const list = JSON.parse(row?.value || '[]');
    return Array.isArray(list) ? list.filter(valid) : [];
  } catch {
    return [];
  }
}

export async function saveDecorations(restaurantId: string, list: Decoration[], by: string) {
  await env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at,updated_by=excluded.updated_by")
    .bind(key(restaurantId), JSON.stringify(list), new Date().toISOString(), by)
    .run();
}

/** A decoration from the owner's form: name 2–60 characters, price 0–20 000 000 so'm, short description. */
export function cleanDecoration(input: any, id: string): Decoration {
  const name = typeof input?.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
  const price = Number(input?.price);
  const description = typeof input?.description === 'string' ? input.description.trim().slice(0, 200) : '';
  if (name.length < 2 || name.length > 60) throw new ApiError(400, 'Dekoratsiya nomi 2–60 belgi bo‘lsin.');
  if (!Number.isSafeInteger(price) || price < 0 || price > 20000000) throw new ApiError(400, 'Dekoratsiya narxi 0 dan 20 000 000 so‘mgacha bo‘lsin.');
  return { id, name, price, description };
}

/** The booking line for a chosen decoration (id prefixed so it never clashes with a dish). */
export const decorationLine = (d: Decoration) => ({ id: 'decor:' + d.id, name: '🎀 ' + d.name, price: d.price, quantity: 1 });
