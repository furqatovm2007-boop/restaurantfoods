import { ApiError } from './http';

/*
 * Kitchen types a restaurant can pick (the owner's form shows them as chips, up to 3; ui/restaurant.js keeps
 * the same list). Stored as "Yevropa · Milliy". The home page filters (Milliy / Yevropa / Fast-food) read it.
 */
export const CUISINES = ['Milliy', 'Yevropa', 'Fast-food', 'Italyan', 'Turk', 'Osiyo', 'Kavkaz', 'Grill / Shashlik', 'Dengiz mahsulotlari', 'Kafe va qandolat', 'Choyxona', 'Vegetarian'];
export const CUISINE_MAX = 3;

/** "Yevropa · Milliy" from the form → the same, checked against the list (empty is allowed). */
export function cuisineOf(raw: unknown) {
  const parts = [...new Set(String(raw ?? '').split('·').map((x) => x.trim()).filter(Boolean))];
  if (parts.length > CUISINE_MAX || parts.some((p) => !CUISINES.includes(p))) throw new ApiError(400, 'Oshxona turini ro‘yxatdan tanlang (ko‘pi bilan 3 ta).');
  return parts.join(' · ');
}
