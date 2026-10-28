import { investorsHtml } from '../investors';
export const dynamic = 'force-dynamic';

/** /investors — the public pitch and FAQ (see app/investors.ts); same strict headers as the other static pages. */
const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};

export async function GET() {
  return new Response(investorsHtml(), { headers: HEADERS });
}
