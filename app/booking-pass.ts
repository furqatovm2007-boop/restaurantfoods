import { env } from 'cloudflare:workers';

/*
 * Receipts and QR booking passes. Every active booking gets an unguessable pass code (80 random
 * bits, base32) the first time its receipt is opened; the QR holds "RFB1:<code>". Staff scan it
 * at the door to check the guest in. The receipt number is readable and derived from the booking.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const PASS_PREFIX = 'RFB1:';

export function newPassCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => ALPHABET[b % 32]).join('');
}

/** Accepts the QR text ("RFB1:CODE") or the code typed by hand (spaces/dashes ignored). */
export function parsePass(value: unknown) {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase().replace(/^RFB1:/, '').replace(/[\s-]/g, '');
  return /^[A-Z2-9]{16}$/.test(code) ? code : null;
}

export const receiptNumber = (b: { id: string; date: string }) => 'RF-' + b.date.replace(/-/g, '').slice(2) + '-' + b.id.replace(/-/g, '').slice(0, 6).toUpperCase();

export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
}

/** Line items, subtotal, the restaurant's service fee (percent, rounded to whole sum) and the total. */
export function receiptTotals(items: { name: string; price: number; quantity: number }[], serviceFeePercent: number) {
  const lines: ReceiptItem[] = items.map((i) => ({ name: String(i.name), price: Number(i.price) || 0, quantity: Number(i.quantity) || 0, total: (Number(i.price) || 0) * (Number(i.quantity) || 0) }));
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const percent = Math.max(0, Math.min(30, Math.round(serviceFeePercent || 0)));
  const serviceFee = Math.round((subtotal * percent) / 100);
  return { lines, subtotal, serviceFeePercent: percent, serviceFee, total: subtotal + serviceFee };
}

/** Gives the booking a pass code if it has none yet and returns it. */
export async function ensurePassCode(bookingId: string, current: string | null) {
  if (current) return current;
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newPassCode();
    try {
      await env.DB!.prepare('UPDATE bookings SET pass_code=? WHERE id=? AND pass_code IS NULL').bind(code, bookingId).run();
    } catch {
      continue; // unique clash, try another code
    }
    const row = await env.DB!.prepare('SELECT pass_code FROM bookings WHERE id=?').bind(bookingId).first<{ pass_code: string | null }>();
    if (row?.pass_code) return row.pass_code;
  }
  return null;
}
