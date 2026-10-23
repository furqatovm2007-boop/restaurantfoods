export const dynamic = 'force-dynamic';

/** Apple returns through Supabase to /auth/complete; this path forwards there with the same query (code, state). */
export function GET(request: Request) {
  const from = new URL(request.url);
  return Response.redirect(new URL('/auth/complete' + from.search, from).href, 302);
}
