# RestaurantFoods security review — 2026-10-14

Scope: source review and isolated adversarial regression tests. No production data was modified by attack tests. This is not a comprehensive penetration-test certification.

Implemented:
- JSON input is limited to 20,000 bytes while streaming, including multibyte payloads; non-object JSON is rejected with 400.
- Supabase logout records a SHA-256 token digest in D1 before clearing the cookie. Replayed revoked tokens are rejected before contacting the provider, including during a provider outage. A best-effort provider local sign-out is also performed. Raw tokens are never stored in this table. Revocations are retained; expires_at is metadata, not currently a deletion policy.
- Main page and admin-login share a CSP that restricts script sources, disables objects, base URL changes and framing. Turnstile remains allowed. Inline CSS remains allowed for existing UI styles; inline JavaScript is not allowed.

Tests passed: anonymous/non-admin access denial, verified admin email only, forged role ignored, CSRF rejection, required CAPTCHA input, invalid OTP rejection, account-bound password changes, server-calculated order prices, completed-order-only customer reviews, booking uniqueness, multibyte oversized payload rejection, and logout token replay rejection. TypeScript and production build are checked before publication.

Limits and remaining launch gates:
- Real Supabase, Google/Apple OAuth, SMTP and Turnstile are not configured. Mock tests do not establish that provider-side CAPTCHA, OTP delivery, OAuth redirects or user-facing recovery work. Keep AUTH_SETUP_COMPLETE disabled until configured and tested.
- Password recovery now records a per-account session cutoff before and after the provider password update. Previously issued tokens are rejected on subsequent authenticated requests; real provider recovery still needs end-to-end verification.
- ChatGPT owner identity relies on the hosting proxy's authenticated headers. Three low-volume forged-header probes to the custom domain failed with network URLError in this environment, so production header stripping could not be independently verified here.
- No browser automation was available; CSP/Turnstile and navigation need a real-browser smoke test.
- No dependency vulnerability advisory audit, load testing or independent external penetration test was completed.

Maps / delivery design (not implemented): restaurant owner/admin supplies verified coordinates and address. Only an assigned courier can publish GPS updates for an active delivery, with explicit device permission. Only that order's customer, assigned courier and authorized restaurant/admin can read the location. Store the latest location, accuracy and server timestamp; clearly mark stale updates and stop sharing on completion/cancellation. Do not expose a public courier-location feed. Background mobile tracking and store publication require a separate native-app implementation and device testing.


## Follow-up review — 2026-10-15
- Removed the legacy hosting-header admin identity fallback. Application roles now require a verified Supabase identity; /admin-login redirects to ordinary login.
- Reject malformed order items with 400 before accessing their properties.
- Regression coverage includes a forged legacy owner identity, forged customer role, private order queries, server-owned prices, cross-origin writes, OTP denial, token replay and password-reset session cutoffs.
- Last observed production signup error remains captcha_failed / invalid-input-response. No successful end-to-end signup or email delivery verified in this review.
- Restaurant coordinates and courier GPS are not implemented. Courier tracking must be restricted to the assigned courier, customer for that order, authorized restaurant and administrator; stop collecting after delivery/cancellation.
- Source and mocked adversarial tests are not a complete external penetration test.
