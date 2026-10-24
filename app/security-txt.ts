/** RFC 9116 security contact, served at /.well-known/security.txt by build/sites-worker.ts. */
export function securityTxt() {
  // Expires must be under a year ahead; computed per request so it never goes stale.
  const expires = new Date(Date.now() + 360 * 86400000);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    '# RestaurantFoods — https://restaurantfoods.online',
    '# Xavfsizlik zaifliklari haqida xabar bering / Report security vulnerabilities',
    'Contact: mailto:admin@restaurantfoods.online',
    'Expires: ' + expires.toISOString(),
    'Preferred-Languages: uz, ru, en',
    'Canonical: https://restaurantfoods.online/.well-known/security.txt',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' } });
}
