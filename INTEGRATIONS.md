# Authentication and role upgrade (version 15)

Existing Supabase Auth users/passwords and D1 business data are preserved. Public signup always creates a customer; request metadata cannot grant elevated roles. Admin-granted roles live in D1. The already established admin is preserved by immutable Supabase subject ID, not by an email-match rule. Legacy `owner` roles remain supported and serialize as `restaurant_owner`.

## Source and translations

Edit `ui/restaurant.js`, `ui/tables.js`, and `ui/auth-ui.js`. `node scripts/build-locales.cjs` emits the corresponding public scripts. Edit translations in `public/locales/messages.json` (Russian default, Uzbek Latin, English). The compiler translates developer-authored static text only; dynamic restaurant names, addresses, menus, reviews, and account names are untouched. Build translations before packaging if these inputs change. No client secrets belong in these files.

Guest language is local. Signed-in language lives in `accounts.preferred_language`. An explicit choice during sign-in is saved; otherwise the stored account language wins. Booking times remain Samarkand UTC+5.

## Pending provider configuration — no simulated success

Runtime flags currently absent: `AUTH_PHONE_ENABLED`, `AUTH_GOOGLE_ENABLED`, `AUTH_APPLE_ENABLED`. These methods remain clearly unavailable until configured. Email authentication remains active.

### Phone

In the existing Supabase project `edfpytsribkqxtdfimww`, enable Phone auth and configure a real supported SMS provider (e.g. Twilio, MessageBird, Vonage) in Supabase secrets/provider settings. Set SMS OTP length to 6, expiry to 600 seconds, and resend interval to at least 60 seconds. Remove all test OTP mappings. Verify real delivery to Uzbekistan numbers before setting the Sites runtime flag `AUTH_PHONE_ENABLED=true`.

The application uses the real `/auth/v1/otp` and `/verify` SMS APIs, E.164 validation, CAPTCHA on sends, a server-side 10-minute phone-bound challenge, five verification attempts per challenge, IP/phone throttles, and one-use verification. No OTP is stored or logged by the application. Only confirmed provider identities receive the Secure HttpOnly session cookie. SMS delivery and configured provider expiry have not been verified live.

### Google / Apple

Configure each OAuth provider in Supabase with its real client credentials. Register the Supabase project's callback URL shown by its dashboard with the provider. Include `https://restaurantfoods.online/auth/complete` in Supabase's redirect allowlist. Enable the matching Sites runtime flag only after configuration. The app uses Supabase authorization, PKCE with a 10-minute HttpOnly verifier cookie, and one-time code exchange. It never assigns admin by provider/email or merges D1 users based on unverified addresses.

Apple requires a valid Sign in with Apple setup and periodically renewed provider credentials as applicable. Neither Google nor Apple live sign-in has been tested in this deployment.

## Admin workflow

Admin dashboard → account management: grant owner/courier roles to verified existing customers; approve/reject partnership requests; suspend/reactivate accounts; enable/disable courier delivery access. Admin accounts cannot be edited through these operations. Suspending an account invalidates existing application sessions and clears shared GPS points.

For a new partner, create an email-bound invitation link. It expires after 7 days and can be accepted once, only by the matching verified customer account. The partner signs up with their own password, then accepts. The admin copies/sends the link; no email is automatically sent and no Supabase user is silently created. This does not require a service-role secret. Role/permission/invitation changes and restaurant ownership/status changes are audited atomically in D1. Avoid sharing raw invitation links publicly.

Restaurant ownership is assigned in restaurant management to active owner accounts. Removing an owner role is blocked while restaurants remain assigned; removing a courier role is blocked during active deliveries.

## Verification limits

Automated checks cover real SQLite migrations/transactions, permission boundaries, invitations, suspension, OTP flow with mocked provider responses, localization render output, bookings/overlaps, media validation, delivery/GPS authorization, and the production build. No browser automation capability is available in this environment; physical-device layout, SMS delivery, OAuth, and GPS need live device verification. The existing native-app/background-location and online-payment limitations remain unchanged.

## Turnstile (version 16)

The official widget uses automatic `execution: render`, `appearance: interaction-only`, light/flexible presentation, automatic retries and expiry refresh. App success text appears only from the real widget success callback. Standard Cloudflare interaction remains visible when required. App status supports RU/UZ/EN; the vendor iframe falls back to English for Uzbek. Expiry, failed loading, unsupported browsers, timeout, and stale callbacks clear the local token. OTP verification remains protected by account-bound codes and attempt limits; sending/resending codes requires CAPTCHA.

**Configuration ownership:** Widget Managed mode must be selected for the existing site key in Cloudflare's dashboard; this setting is not controlled by client render options and was not remotely verified. Supabase Auth is the Siteverify owner for this architecture. Its CAPTCHA setting must remain enabled with provider Turnstile and the matching secret stored in Supabase's backend secret settings. The Site stores only `TURNSTILE_SITE_KEY`; no Turnstile secret was available to copy into Sites. Tokens are forwarded once in `gotrue_meta_security.captcha_token` for signup/login/recovery/resend/SMS. Do not validate the same token a second time in the Worker: Cloudflare tokens are single-use. No CAPTCHA disabling or service-role bypass was added. A live bot check cannot be proven by the unit tests; verify with a real browser after confirming Cloudflare Managed and Supabase CAPTCHA configuration.

## Version 17 — phone hardening and food photographs

- Phone remains deliberately disabled in production: Sites revision 3 has no AUTH_PHONE_ENABLED and no SMS provider credentials were supplied. No SMS delivery or live OTP verification was performed. Do not set the flag merely to remove the notice.
- Integration uses Supabase's real `/otp` and `/verify` SMS flow (existing email/OAuth identities retained), not locally generated codes. Supabase enforces unique phone identities; never merge different email and phone users based on a typed name/contact number. Existing accounts can log in only with a phone verified on that provider identity.
- To activate the supported Twilio SMS transport, configure **Supabase Authentication → Providers → Phone** with the real Twilio Account SID, Auth Token, and Messaging Service SID in Supabase's secure backend settings. Enable Uzbekistan delivery and configure the sender under the provider's Uzbekistan requirements. Use paid/production credentials. Set SMS OTP length **6**, expiry **300 seconds**, resend frequency **60 seconds**, phone confirmation required, and no test OTP mappings. Keep Turnstile enabled in Supabase. No SMS secrets belong in public assets or browser environment variables.
- Then validate actual SMS delivery with the owner's test number, wrong/expired OTP, resend and existing-user login. Only then set Sites AUTH_PHONE_ENABLED=true and deploy. The tools in this session cannot inspect/change Supabase provider credentials. Provider config and real delivery remain blockers, not passed tests.
- Application phone challenge expiry is now 300 seconds and 5 attempts; resend cooldown uses an atomic per-phone deadline, including across minute boundaries. Resend invalidates previous application challenges. Uzbekistan E.164 normalization accepts +998 plus nine digits without restricting operators by a stale prefix list. UI formats +998 XX XXX XX XX.
- Migration 0008 only adds three menu columns with empty defaults and an SMS cooldown table. No existing records are deleted or rewritten.
- Menu images use the existing R2 binding. Owner/admin authentication and restaurant ownership checked before upload; max streamed request 5 MB. JPG marker/dimension structure, PNG chunk bounds/CRC, WebP RIFF/dimensions are validated server-side; this is container validation, not a general-purpose pixel decoder. Browser decodes and re-encodes cropped menu images as JPEG. Animated WebP rejected. SVG/HTML and truncated containers rejected.
- Food save checks R2 object metadata restaurantId; external/arbitrary URLs and other restaurants' files rejected. Image removal clears the menu reference; old objects are retained to avoid deleting any shared restaurant/table reference. Orphan cleanup is not included.
- Preview/crop is a 4:3 canvas with zoom and horizontal/vertical controls; phone gallery and computer picker supported. Customer cards show category/description/availability; unavailable items cannot be selected and server order validation remains authoritative. Broken images show a placeholder.
- Local validation: real sample image containers, SQLite migrations/upload authorization/menu edits/removal/ownership/catalog, phone provider-mocked expiry/attempt/cooldown, auth and Turnstile callback tests. No real SMS, live Turnstile/browser, gallery/crop/mobile gestures or production object-storage upload end-to-end test has been claimed.

## Owner-authorized test cleanup — 2026-10-16
The owner explicitly requested retaining only the pinned admin and deleting the four existing test accounts and test restaurant/menu. `cleanupTestAccounts` runs only on the pinned authenticated admin's next `/api/me` call, atomically deletes the exact observed D1 IDs and their test records, writes a one-time audit marker, and preserves all future registrations. Supabase Auth records/session revocation are performed separately via authorized administrative SQL. No public cleanup endpoint or auth bypass. R2 orphan images are not deleted by this account cleanup.
