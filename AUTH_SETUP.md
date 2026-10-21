# RestaurantFoods authentication activation

The public site uses no example restaurant, payment, rating or booking data. Catalog and operations are backed by D1. Customer authentication stays closed until its external services are configured. No email/CAPTCHA/OAuth success is simulated.

## Connect Supabase Auth

Use an existing or owner-approved Supabase project. Only its HTTPS project URL and **anon/publishable key** are needed by this application. Do not use a service-role key. Supabase stores passwords and verifies identity; RestaurantFoods validates authenticated users through `/auth/v1/user` and stores the access token only in a Secure, HttpOnly, SameSite=Lax cookie. Sessions currently expire after at most one hour, then require sign-in again.

Configure in Supabase:

- Email/password authentication and mandatory email confirmation.
- Minimum password length 8.
- OTP expiry 600 seconds, resend interval at least 60 seconds, suitable provider rate limits.
- Confirm signup and Reset password templates must contain `{{ .Token }}` (six-digit code), not only confirmation links.
- A production SMTP sender with verified sending domain. Test delivery to an external address; the provider's default test sender is not sufficient for public launch.
- Turnstile CAPTCHA protection with its **secret key entered in Supabase**, not the browser. App passes `gotrue_meta_security.captcha_token`; Supabase validates it server-side. Do not disable provider CAPTCHA while exposing public signup.
- Site URL `https://restaurantfoods.online`.
- OAuth redirect allowlist: exact `https://restaurantfoods.online/auth/complete` (plus only domains actually deployed).

Google and Apple are enabled only after their client configuration is complete in Supabase. Register the Supabase-provided callback URL in the respective Google/Apple developer console. Apple requires the owner's Apple Developer configuration. No placeholder provider credentials are present.

Set the following runtime variables using Sites environment settings:

| Name | Value |
| --- | --- |
| SUPABASE_URL | Supabase project URL without trailing slash |
| SUPABASE_ANON_KEY | Project anon/publishable key, preferably stored as a secret |
| TURNSTILE_SITE_KEY | Public Turnstile site key restricted to the deployed hostname |
| AUTH_GOOGLE_ENABLED | `true` only after configured and tested |
| AUTH_APPLE_ENABLED | `true` only after configured and tested |
| AUTH_SETUP_COMPLETE | `true` only after the settings above are confirmed |

Redeploy to apply variables. Before announcing registration as available, test real signup -> email delivery -> wrong/expired/valid code -> login, forgot password, account password change with code, failed CAPTCHA, OAuth callbacks, and denied admin access from another verified account. Local tests use mocked providers and do not prove production email/CAPTCHA/OAuth delivery.

## Existing owner access

The existing Sites-managed owner login is retained at `/admin-login`; it is absent from public navigation. Server authorization, not the hidden link, protects administrator APIs. Only the verified email `furqatovm2007@gmail.com` has admin rights. Client role fields are ignored. The same verified email will receive admin rights through Supabase once configured. Restaurant ownership is assigned by the admin to an already verified account.

## Operations

Admins can add real restaurants and menus, assign restaurant owners, and enable listings. Owners/admins process pending bookings and pickup orders. Booking slots last two hours and are protected by a database unique index; cancellation frees capacity. Bookings must be at least one hour ahead and within 90 days. No courier, email reminders or payment processor is connected; these are not represented as working services. Pickup orders are paid at the restaurant, and completing an order does not automatically record a payment.

Reviews require a completed server-side booking or order and a customer role. Owners/admins cannot rate. One review per customer per restaurant; 1–5 stars and a 3–1000 character comment, editable/deletable by that customer. Public reviews show only the first name (never an email). No seeded ratings.
