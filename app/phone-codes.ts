import { ApiError, text } from './http';

/*
 * Countries the booking phone may come from (public/phone-input.js offers the same list): dial code and the
 * allowed number of local digits. Uzbekistan first; the rest are where most Samarkand tourists come from.
 */
export const PHONE_COUNTRIES: { id: string; dial: string; len: number[] }[] = [
  { id: 'uz', dial: '998', len: [9] },
  { id: 'ru', dial: '7', len: [10] },
  { id: 'us', dial: '1', len: [10] },
  { id: 'gb', dial: '44', len: [10] },
  { id: 'tr', dial: '90', len: [10] },
  { id: 'ae', dial: '971', len: [9] },
  { id: 'de', dial: '49', len: [10, 11] },
  { id: 'kr', dial: '82', len: [9, 10] },
];

/** An E.164 phone ("+998993847384", "+15551234567") from one of PHONE_COUNTRIES; anything else is a 400. */
export function intlPhone(value: unknown) {
  const v = text(value, 9, 16);
  const ok = /^\+\d{8,15}$/.test(v) && PHONE_COUNTRIES.some((c) => v.startsWith('+' + c.dial) && c.len.includes(v.length - 1 - c.dial.length));
  if (!ok) throw new ApiError(400, 'Telefon raqam noto‘g‘ri: mamlakat kodi va to‘liq raqamni kiriting.');
  return v;
}
