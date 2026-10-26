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


## Follow-up review — 2026-10-26
Scope: source review, `pnpm audit`, the regression suite (63 test files) and browser checks of every role on a local Worker. No production data was modified by tests. Still not an external penetration test.

### Current controls (verified in code and tests)
- **Sessions:** Supabase sessions and own Telegram sessions use `__Host-` HttpOnly, Secure, SameSite=Lax cookies; D1 keeps only SHA-256 hashes of session, device and one-time sign-in tokens. Telegram sign-in links are browser-bound (nonce cookie) or one-time (10 minutes, hash only); remembered-device keys rotate on every use; the administrator can never sign in through Telegram or a device key.
- **CSRF / input:** every JSON write goes through `body()` (same-origin check, `application/json` only, 20 KB streaming limit, object-only JSON). Camera agents (`/api/manage/occupancy`, `/api/manage/vision`) are the documented exception: key-holding agents send no Origin, browser sessions get the same-origin check inside `authorizeCamera`. Voice uploads use `sameOrigin` with a 650 KB limit.
- **Authorization:** restaurant data goes through `restaurantAccess` (admin / owner / staff role, staff only while the plan includes staff accounts); admin-only routes check the verified role; prices, totals, holds, promo windows and stop-lists are enforced on the server.
- **Anti-fraud (new):** birth date saved once and locked (admin-only reset, audited); birthday promo only within ±3 days, once a year per restaurant; 5-minute exclusive table holds checked again at booking; public ratings count only reviews of existing active accounts (plus labelled demo reviews of demo restaurants) — `app/review-rules.ts`.
- **Privacy:** card numbers never reach the server (Payme tokens); Smart Vision analyses frames on the device and sends only per-table statuses; offline QR passes live in the customer's own browser and are cleared on sign-out.
- **Headers:** CSP without inline scripts, `frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy: same-origin`; the investor plan is admin-only, `no-store` and `noindex`.
- **Abuse limits:** `throttle()` on sign-in, OTP, holds, table service, AI, cameras and payments.

### Dependencies (2026-10-26)
- Updated `next` 16.3.4 → 16.4.2, `eslint-config-next` → 16.4.2, `react`/`react-dom`/`react-server-dom-webpack` → 19.2.9, `vite` → 8.3.4, `zod` → 4.6.7; removed the unused `@hookform/resolvers`; pinned patched transitive versions in `pnpm-workspace.yaml` (sharp, browserslist, source-map-js, baseline-browser-mapping, @babel/core, image-size, undici 7, ws 8, js-yaml 4, brace-expansion).
- `pnpm audit --prod`: **0** vulnerabilities. All dependencies including build/lint tools: 0 critical, 0 high, 5 moderate, 3 low (build-time only).
- The Next.js advisories did not reach runtime before either: the site runs on Vinext, and `next/og`, `next/image`, `use cache` and Server Actions are not used.

### Monitoring (new)
- `app/health.ts`, on the existing 5-minute cron: the Telegram webhook must point at this site, deliver without errors (last 15 minutes) and not queue more than 20 updates; 5xx API responses are counted per 10 minutes by the Worker. A problem sends one Telegram message to the administrator (admin accounts with a linked chat, or `ADMIN_TELEGRAM_CHAT_ID`), repeats at most hourly, and a recovery message follows. The admin panel's Telegram card shows the last result.
- Action needed: the administrator account has no linked Telegram chat yet, so alerts are only logged until it is linked (Profile → “Telegram orqali tasdiqlash”) or `ADMIN_TELEGRAM_CHAT_ID` is set.

### Remaining risks and launch gates
- **Data residency:** D1 runs in Cloudflare's EU region (Frankfurt). Uzbekistan's personal-data law requires citizens' personal data to be stored on servers in Uzbekistan; phone numbers, names and bookings are personal data. Needs a legal opinion and possibly a local data store.
- **No external penetration test** and no load test.
- **Subscriptions are recorded by the administrator**; there is no automatic recurring billing.
- Inline styles are still allowed by the CSP (`style-src` is not nonce-based).
- Production header stripping for the hosting proxy and real provider flows (Google OAuth, SMS delivery) still need periodic end-to-end checks.
