# RestaurantFoods

Vinext / Cloudflare Workers / D1. Public URL: https://restaurantfoods.mythicfern9.chatgpt.site

Only database-backed restaurant, menu, booking, order, account and review data is displayed. No example listings or browser-local order data is used. Administrator email: furqatovm2007@gmail.com (server-verified identity only). Existing owner entry: /admin-login.

Customer email/password, signup OTP, password recovery/change OTP, Google/Apple PKCE OAuth and Turnstile integration are implemented but fail closed until external services are configured. See AUTH_SETUP.md for activation and production tests. No password/email delivery is simulated, and no provider credentials are in the source.

Real restaurant management, assigned-owner permissions, server-priced pickup orders, atomically reserved two-hour booking slots, customer history and cancellation are implemented. One 1–5 star review per customer/restaurant requires a completed booking/order. Owners and admins cannot rate.

Payment processing, delivery, automatic reminders, and expense accounting are not connected. Pickup orders are paid at the venue. Completing an order does not create a payment. The financial report reads only recorded payments.

Validation: node tests/access.test.cjs; node tests/domain.test.cjs; node tests/auth.test.cjs; python tests/database.py; TypeScript noEmit; Sites build helper. These tests do not verify actual SMTP, CAPTCHA provider or OAuth credentials.
