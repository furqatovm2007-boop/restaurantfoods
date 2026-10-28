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

## Telegram Mini App and bot menu

- The site runs inside Telegram from the bot: `/start` (or `/menu`) shows the "🍽️ Restoranlar, 3D Stol va Menyu (Ochish)" Mini App button and in-chat views: restaurants (photo, rating, tables free now), free tables, menu, flowers, and "📅 Mening bronlarim va QR-Chek" (QR pass sent as a PNG drawn on the server). Demo restaurants are not listed. Booking and payment happen only in the Mini App.
- Bot menu: commands `/start /restaurants /menu /flowers /mybookings /ai /profile` (setMyCommands, default scope) and the menu button left of the input as the commands list (setChatMenuButton `commands`). A persistent keyboard next to 📎 (Mini App on top, then the sections) comes with `/start`, any other text and the contact flows; its plain-text labels open the same sections. The cron (`build/sites-worker.ts`, every 5 min) sets the commands once per release and sends the one-time "✨ Yangilanish!" message with the keyboard to every linked chat in batches (progress in `app_settings`, nobody twice, suspended and `/stop` chats skipped). Admin panel → Telegram bot has buttons for both (`POST /api/telegram/setup-miniapp`, `POST /api/telegram/sync-old-users`, admin only).
- The keyboard's Mini App button opens the site without Telegram's signed launch data, so there the usual sign-in (remembered device / Telegram login) is used; the inline "Ochish" buttons sign in with zero clicks.
- Sign-in: `public/tg-miniapp.js` loads `telegram-web-app.js` only inside Telegram and sends the signed `initData` to `POST /api/auth/telegram-webapp`. The server checks the HMAC signature (key `HMAC("WebAppData", TELEGRAM_BOT_TOKEN)`), a 24-hour age and a real user; `initDataUnsafe` is never trusted. Admin and suspended accounts are refused.
- Phone: `telegram-contact-start` → Telegram `requestContact` → the bot receives the user's own contact and saves it as verified (or moves the chat to the account that already owns that number) → `telegram-contact-status`.
- Works in the Telegram mobile and desktop apps. web.telegram.org embeds Mini Apps in a frame; the site keeps `frame-ancestors 'none'` and SameSite=Lax session cookies, so the Mini App is not supported there (use the Telegram app or the website).

## Hall: 2D standard plan and 3D VIP hall

- Every restaurant gets the 2D architectural plan (`public/hall-plan.js`): tables drawn by kind and capacity (2-seat with armchairs, round, rectangular, VIP U-sofa booth), zone filters (main hall, terrace, VIP, window), zoom/pan, neon states (free, selected, 5-minute hold, busy with its time) and a preview card with the table photo, capacity and amenities.
- The 3D hall is a one-time VIP service: owners request it (packages 1 900 000 / 3 500 000 / 5 900 000 so‘m) from Zal xaritasi or Tariflar; the request appears in Admin panel → 3D zal arizalari and in the administrator's Telegram. The administrator switches `has_3d_hall` on per restaurant (Restoranlarni boshqarish → restoran → 3D Zal) and attaches the model link or notes. Until then the "3D ko‘rinish" button says the 3D hall is coming soon.
- The owner's 2D constructor (Zal xaritasi → 🧭 2D Zal konstruktori) drags tables and ambience (entrance, stage, bar, plants, windows) and sets seats, shape, zone and amenities. Ambience is drawn only where the owner placed it.
- Storage without a migration: app_settings `hall3d:<restaurant>`, `tablemeta:<restaurant>`, `hallscene:<restaurant>`, `hall3d-leads`.

## Full-screen hall, restaurant lock, CCTV wall, investors page

- Hall plan full screen: "⛶ To‘liq ekran" on the 2D plan (and the owner's constructor, and the 3D hall) covers the whole screen with the restaurant's name, zones, zoom and "✕ Kichraytirish"; a chosen table opens its card at the bottom with "✅ Shu stolni bron qilish". Escape and Telegram's back button leave it.
- Restaurant lock: the bot lists restaurants first (one button each), then the chosen restaurant's card with "🪑 Shu restoran stollarini ko‘rish va Bron qilish" → `?restaurant_id=ID&action=book`, which opens exactly that booking room. The room shows "📍 Siz tanlagan restoran: …" with "🔄 Boshqa restoranga qaytish"; the page accepts only that restaurant's tables and the server checks the table id and number against the restaurant. Telegram's back button walks back: full screen → booking room → restaurant → list.
- Smart Vision: 1x1 (one camera, ‹ › to switch), 2x2, 3x3; double tap or ⛶ opens one camera full screen with its table boxes, "Bo‘sh / Band" counts and "⬅️ Barcha kameralarga qaytish (Grid)".
- `/investors`: public pitch & FAQ (revenue model, unit economics, 12-month plan marked as a forecast, 10 answers) with "📥 PDF / Chop etish"; linked from the footer and the admin panel.
