export const dynamic = 'force-dynamic';

/*
 * Sign in with Apple (iCloud). Apple OAuth / OpenID Connect runs through Supabase Auth: this starts
 * the same PKCE flow as Google (/api/auth/oauth?provider=apple), Apple returns to Supabase, and
 * Supabase returns to /auth/complete, which stores the session. Enabled by AUTH_APPLE_ENABLED=true
 * once the Apple provider is configured in Supabase (needs an Apple Developer account).
 */
export function GET(request: Request) {
  return Response.redirect(new URL('/api/auth/oauth?provider=apple', request.url).href, 302);
}
