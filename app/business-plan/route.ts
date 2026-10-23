import { identity } from '../access';
import { businessPlanHtml } from '../business-plan';
export const dynamic = 'force-dynamic';

/*
 * /business-plan — the investor business plan (A4, print / save as PDF). Internal financial
 * document: only the site administrator may open it; others are sent to sign in.
 */
const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};

export async function GET() {
  const u = await identity().catch(() => null);
  if (!u) return new Response(null, { status: 302, headers: { Location: '/#/login', 'Cache-Control': 'no-store' } });
  if (u.role !== 'admin') return new Response('<!doctype html><meta charset="utf-8"><title>403</title><p style="font-family:system-ui;padding:24px">Biznes-reja faqat administrator uchun.</p>', { status: 403, headers: HEADERS });
  return new Response(businessPlanHtml(), { headers: HEADERS });
}
