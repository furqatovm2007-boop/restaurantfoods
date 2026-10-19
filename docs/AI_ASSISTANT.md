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

## Added integration

public/ai-chat.js and public/ai-chat.css provide a small, accessible native-dialog chatbot on public and application pages. Uzbek, Russian and English UI, response-language selector, loading state, localized errors, close and clear actions. Styling follows the existing light/dark design. Conversation stays only in memory and is cleared on close; it is not written to local storage or the application database. Each question is independent, matching the existing Edge Function contract.

Browser POST /api/ai -> authenticated site backend -> Supabase /functions/v1/restaurantfoods-ai -> Gemini.

The backend uses the existing HttpOnly session cookie and forwards the user JWT only server-to-server. No Gemini key is added to site settings, files or browser bundles. Supabase retains GEMINI_API_KEY. The existing ACTIVE version 1 function was inspected: verify_jwt=true, /auth/v1/user verification, message length check, Gemini 2.5 Flash Lite, 400 output tokens, 15-second provider timeout, safe error messages and no live restaurant data or action tools. Its deployed source was not modified.

The site proxy limits messages to 1,400 characters (leaving space for the requested language), 15 requests per user per 10 minutes and 200 total per 10 minutes. These proxy limits do not protect direct calls to the existing Supabase function; Edge-level quotas/rate limiting remain a follow-up before broad public rollout. The function itself requires a valid user session. Replies render as text, never executable HTML. AI cannot call reservation/order/payment endpoints.

## Validation and limits

Local tests cover authenticated access, CSRF, message limits, languages, upstream response parsing, timeout, quota, session and malformed-response errors, response secrecy and absence of write actions. TypeScript and JavaScript syntax checks pass. Existing auth and SEO tests run alongside the new tests.

A signed-in real Gemini request has not been tested from this environment: no user session is available for that test. Mock upstream responses test the integration contract only. ACTIVE status does not verify API quota, billing or successful generation. User should sign in, open the AI button, and test one question in each language. Missing configuration/quota/upstream errors are displayed honestly. No automatic retries or simulated AI replies.

Useful test prompts:
- Uzbek: Stol bron qilishdan oldin nimalarni tekshirish kerak?
- Russian: Что уточнить у ресторана перед посещением?
- English: What should I check before choosing a restaurant?
- Action boundary: Book a table now. Expected: no booking created; the assistant explains its limitation.
