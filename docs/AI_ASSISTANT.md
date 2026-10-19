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

The AI launcher now becomes an animated smiling robot with a jump/open-arm greeting. There is no text composer or chat log. Captions are off by default and optional. The robot uses the current site language (Uzbek, Russian or English), pauses when the language changes or page hides, and provides explicit pause/resume and close controls.

After the customer activates AI, Web Audio is unlocked. `/api/ai-voice` requests spoken greetings/replies from Gemini TTS through the authenticated Edge Function; browser speech synthesis is a fallback if cloud speech fails. The Edge uses the Interactions audio response and `GEMINI_TTS_MODEL` (default `gemini-3.8-flash-lite-tts`). Only three fixed greeting clips are cached in memory. Personalized replies and recordings are not cached.

MediaRecorder captures microphone audio after permission. Local voice activity detection sends an utterance after about 1.1 seconds of silence, with a 14-second utterance cap and 20-second idle pause. Gemini transcribes audio, the existing catalog concierge generates a short reply and actions, and speech plays automatically before listening resumes. Microphone tracks are disabled during processing/playback and stopped on pause/close. Audio and recent transcripts are kept in memory only; Google processes them to provide the service. This is sequential transcription, generation and speech, not full-duplex streaming. Provider latency applies and interruption uses pause/close.

Structured restaurant/menu IDs and quantities are validated at the Sites backend; names and prices come from D1. Guide actions are allowlisted to opening a catalog restaurant, scrolling/highlighting catalog foods, and checking availability. The robot scrolls to a restaurant card and animates a pointer click, opens its menu and highlights the suggested dishes. It never submits orders, holds, bookings or payments.

Availability requires a valid restaurant, date, start/end and guest count. The backend checks real active tables and overlapping pending/confirmed bookings in D1. DEMO availability uses the same authenticated snapshot RPC as the floor plan, including holds and cleaning state. Unknown/error responses never become a free-table claim. The authoritative check replaces the model reply and includes a DEMO label when applicable. Availability is a snapshot, not a reservation guarantee. The guide can open the floor plan and set the requested time, but the customer selects/confirms any booking.

Requests require a confirmed authenticated user; JWT verification stays enabled. Text requests are bounded to 1,400 characters with ten history entries, 15 per user/200 per site per ten minutes. Voice requests have explicit audio MIME/base64/size limits and 60 per user/500 per site per ten minutes. Direct authenticated Edge calls are not covered by the Sites proxy limiter; provider quotas remain enforced. Provider errors use safe codes; no secrets, prompts or recordings are logged. Missing Gemini credentials/quota cannot be repaired by a simulated recommendation.

## Menu and demo cart

Restaurant category buttons now filter displayed sections without discarding quantities. All restores every category. Quantity steppers are bounded to 0–20 and update the cart. First and second courses, desserts and drink groups are distinguished. A demo-only migration fills missing dessert sections (67 total demo menu entries). Real restaurant menus are not invented or overwritten. Demo quantities/cart are usable, but checkout produces a browser-only demo receipt; production order APIs still reject demo records.

## Verification and remaining limits

Unit/integration tests use mocked Gemini and authenticated sessions. They cover authorization, CSRF, history and catalog forwarding, response secrecy, validated IDs/prices, provider error/model fallback, automatic voice lifecycle, voice API bounds, actual real/demo availability, menu filters/steppers and existing commerce/booking behavior. TypeScript checks and production build are required before publication.

An actual signed-in Gemini generation and microphone playback on Android/iPhone have not been tested in this environment. ACTIVE status alone does not prove the stored key has working quota or permissions. No simulated AI answer is used as a fallback. After signing in, click AI, allow the microphone and say: “4 kishilik oilaviy kechki ovqat, 400 ming so‘m. Qaysi restoran va taomlarni tavsiya qilasiz?”
