export const dynamic = 'force-dynamic';

/*
 * Live web call page opened from the Telegram "answer the AI operator" button. A small standalone
 * page (works in Telegram's in-app browser): public/call-ai.js rings, speaks the question, listens
 * for the answer and records it through /api/call-ai. The booking id comes from the path, the call
 * token from ?k=.
 */
const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' blob: data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};

export function GET() {
  return new Response(
    `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex"><meta name="theme-color" content="#06141a"><title>RestaurantFoods AI — qo‘ng‘iroq</title><link rel="stylesheet" href="/call-ai.css?v=1"></head><body class="rf-call-page"><main id="rfCall" class="rf-call" aria-live="polite"><p class="rf-call-muted">RestaurantFoods AI…</p></main><script src="/call-ai.js?v=1" defer></script></body></html>`,
    { headers: HEADERS },
  );
}
