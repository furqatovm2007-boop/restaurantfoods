# RestaurantFoods AI Assistant

## Existing architecture

Checkout: /workspace/sites/restaurantfoods (Sites-managed Git repository).
- ui/restaurant.js, ui/tables.js and ui/auth-ui.js: editable application JavaScript. scripts/build-locales.cjs generates public counterparts.
- public/restaurant.css and public/i18n.js: styles and language selection.
- app/site-html.ts: existing application HTML shell.
- app/seo.ts: public server-rendered pages in Uzbek, Russian and English.
- app/api: TypeScript backend routes, using Vinext/Vite on Cloudflare Workers.
- D1 stores application data; R2 stores uploads. Supabase provides authentication and the AI Edge Function. The frontend is not hosted in Supabase.
- .openai/hosting.json binds the existing Sites project. The supported Sites workflow builds, commits/pushes source, packages output, saves a version and deploys it to production. Main domain: https://restaurantfoods.online.

## Catalog concierge and voice

Browser POST /api/ai → authenticated Sites backend → Supabase restaurantfoods-ai → Gemini. GEMINI_API_KEY remains exclusively in Supabase Secrets. No key is shipped to the browser. The deployed function source is tracked in supabase/functions/restaurantfoods-ai/index.ts; verify_jwt remains true and the function validates the user with /auth/v1/user.

The backend builds a bounded public catalog from active restaurants and available menu items in D1. No account details, emails, phone numbers or private orders are included. Gemini receives recent user/assistant history (up to ten messages), the public catalog and the requested language. It asks about occasion, guests, budget and dietary needs, then recommends restaurants and a menu. Demo records remain explicitly labeled DEMO.

Structured recommendations are validated again at the Sites backend: unknown restaurant/item IDs, cross-restaurant items and duplicates are discarded. Prices and names are hydrated from D1, never trusted from model output. Customer buttons open the corresponding restaurant or prepare a cart. Existing cart replacement requires confirmation. Neither Gemini nor the chat submits orders, bookings or payments; the customer reviews checkout.

Messages are rendered as text. Chat history stays in memory, survives closing/reopening the dialog and is cleared explicitly or by a page reload. Requests are limited to 1,400 characters, 15 per user per ten minutes and 200 per site per ten minutes. The browser bounds UTF-8 history size. The Edge Function has input limits and requires an authenticated confirmed user. Direct authenticated Edge calls are not covered by the Sites proxy's per-user rate limiter; provider quotas remain enforced.

The function uses Gemini structured JSON output, a configurable GEMINI_MODEL (default gemini-2.5-flash-lite) and a model-list fallback for model-not-found responses. Missing key, permission/configuration, model, quota, timeout and generic provider failures have distinct safe errors. Provider statuses/model names may be logged; prompts, API keys and user tokens are never logged.

Microphone capture uses SpeechRecognition/webkitSpeechRecognition only after an explicit click. The transcript is placed in the text box for review and must be sent by the customer. Speech synthesis provides per-reply playback and an optional read-aloud checkbox. Closing or stopping the chat aborts recognition and cancels playback. Unsupported browsers fall back to typing. Browser speech providers and available language voices vary, particularly for Uzbek. The application permits same-origin microphone use; no permanent audio recording is stored by RestaurantFoods. Voice may be processed by the browser's speech provider, disclosed in the chat.

## Menu and demo cart

Restaurant category buttons now filter displayed sections without discarding quantities. All restores every category. Quantity steppers are bounded to 0–20 and update the cart. First and second courses, desserts and drink groups are distinguished. A demo-only migration fills missing dessert sections (67 total demo menu entries). Real restaurant menus are not invented or overwritten. Demo quantities/cart are usable, but checkout produces a browser-only demo receipt; production order APIs still reject demo records.

## Verification and remaining limits

Unit/integration tests use mocked Gemini and authenticated sessions. They cover authorization, CSRF, history and catalog forwarding, response secrecy, validated IDs/prices, provider error/model fallback, speech lifecycle, menu filters/steppers and existing commerce/booking behavior. TypeScript checks and production build are required before publication.

An actual signed-in Gemini generation and microphone playback on Android/iPhone have not been tested in this environment. ACTIVE status alone does not prove the stored key has working quota or permissions. No simulated AI answer is used as a fallback. After signing in, test: “4 kishilik oilaviy kechki ovqat, 400 ming so‘m. Qaysi restoran va taomlarni tavsiya qilasiz?”
