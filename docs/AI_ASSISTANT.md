# RestaurantFoods AI Assistant

## Existing architecture

Checkout: /workspace/sites/restaurantfoods-menu-release (Sites-managed Git repository).
- ui/restaurant.js, ui/tables.js and ui/auth-ui.js: editable application JavaScript. scripts/build-locales.cjs generates public counterparts.
- public/restaurant.css and public/i18n.js: styles and language selection.
- app/site-html.ts: existing application HTML shell.
- app/seo.ts: public server-rendered pages in Uzbek, Russian and English.
- app/api: TypeScript backend routes, using Vinext/Vite on Cloudflare Workers.
- D1 stores application data; R2 stores uploads. Supabase provides authentication and the AI Edge Function. The frontend is not hosted in Supabase.
- .openai/hosting.json binds the existing Sites project. The supported Sites workflow builds, commits/pushes source, packages output, saves a version and deploys it to production. Main domain: https://restaurantfoods.online.

## Catalog concierge and voice

Browser POST /api/ai → authenticated Sites backend → Supabase restaurantfoods-ai → OpenAI. OPENAI_API_KEY remains exclusively in Supabase Secrets. An OpenAI key beginning with sk- stored under the former GEMINI_API_KEY secret is also accepted; actual Google keys are not sent to OpenAI. No key is shipped to the browser. The deployed function source is tracked in supabase/functions/restaurantfoods-ai/index.ts; verify_jwt remains true and the function validates the user with /auth/v1/user.

The backend builds a bounded public catalog from active restaurants and available menu items in D1. No account details, emails, phone numbers or private orders are included. OpenAI receives recent user/assistant history (up to ten messages), the public catalog and the requested language. It asks about occasion, guests, budget and dietary needs, then recommends restaurants and a menu. Demo records remain explicitly labeled DEMO.

The AI launcher opens the local uploaded Robot Playground (Hadrien59) GLB viewer. A separate control panel remains fixed while the character travels using composited transforms. There is no text composer or chat log. Captions are off by default and optional. The robot uses the current site language (Uzbek, Russian or English), pauses when the language changes or page hides, and provides explicit pause/resume and close controls.

After the customer activates AI, Web Audio is unlocked. `/api/ai-voice` requests greetings/replies from OpenAI `/v1/audio/speech`, with `OPENAI_TTS_MODEL` defaulting to `gpt-4o-mini-tts` and MP3 output. Browser speech synthesis remains a fallback. The panel identifies its voice as AI-generated. Only three fixed greeting clips are cached in memory. Personalized replies and recordings are not cached. Chat uses `/v1/chat/completions`, the explicitly selected `gpt-4o-mini` chat model, JSON output and `store:false`. Transcription uses a real multipart audio upload to `/v1/audio/transcriptions`, with `OPENAI_TRANSCRIBE_MODEL` defaulting to `gpt-4o-mini-transcribe`.

MediaRecorder captures microphone audio after permission. Local voice activity detection sends an utterance after about 1.1 seconds of silence, with a 14-second utterance cap and 20-second idle pause. OpenAI transcribes audio, the existing catalog concierge generates a short reply and actions, and speech plays automatically before listening resumes. Microphone tracks are disabled during processing/playback and stopped on pause/close. Audio and recent transcripts are kept in memory only; OpenAI processes them to provide the service. This is sequential transcription, generation and speech, not full-duplex streaming. Provider latency applies and interruption uses pause/close.

Structured restaurant/menu IDs and quantities are validated at the Sites backend; names and prices come from D1. Guide actions are allowlisted to opening a catalog restaurant, scrolling/highlighting catalog foods, and checking availability. The robot moves alongside a restaurant card, narrates it before opening its menu, then reveals and explains each suggested dish in sequence. It never submits orders, holds, bookings or payments.

Availability requires a valid restaurant, date, start/end and guest count. The backend checks real active tables and overlapping pending/confirmed bookings in D1. DEMO availability uses the same authenticated snapshot RPC as the floor plan, including holds and cleaning state. Unknown/error responses never become a free-table claim. The authoritative check replaces the model reply and includes a DEMO label when applicable. Availability is a snapshot, not a reservation guarantee. The guide can open the floor plan and set the requested time, but the customer selects/confirms any booking.

Requests require a confirmed authenticated user; JWT verification stays enabled. Text requests are bounded to 1,400 characters with ten history entries, 15 per user/200 per site per ten minutes. Voice requests have explicit audio MIME/base64/size limits and 60 per user/500 per site per ten minutes. Direct authenticated Edge calls are not covered by the Sites proxy limiter; provider quotas remain enforced. Provider errors use safe codes; no secrets, prompts or recordings are logged. Missing OpenAI credentials/quota cannot be repaired by a simulated recommendation.

## Menu and demo cart

Restaurant category buttons now filter displayed sections without discarding quantities. All restores every category. Quantity steppers select a draft amount, initially one, bounded to 0–20. They never change the committed cart. Only the explicit Add button adds the selected dish and quantity, up to 20 per committed dish. The floating cart appears at the lower right on accepted Add, receives the photo animation/sound, and hides 2.6 seconds after arrival. Persistent cart access remains in the drawer/mobile navigation. First and second courses, desserts and drink groups are distinguished. A demo-only migration fills missing dessert sections (67 total demo menu entries). Real restaurant menus are not invented or overwritten. Demo quantities/cart are usable, but checkout produces a browser-only demo receipt; production order APIs still reject demo records.

## Verification and remaining limits

Unit/integration tests use mocked OpenAI and authenticated sessions. They cover authorization, CSRF, history and catalog forwarding, response secrecy, validated IDs/prices, provider error mapping, automatic voice lifecycle, voice API bounds, actual real/demo availability, menu filters/steppers and existing commerce/booking behavior. TypeScript checks and production build are required before publication.

An actual signed-in OpenAI generation and microphone playback on Android/iPhone have not been tested in this environment. ACTIVE status alone does not prove the stored key has working quota or permissions. No simulated AI answer is used as a fallback. After signing in, click AI, allow the microphone and say: “4 kishilik oilaviy kechki ovqat, 400 ming so‘m. Qaysi restoran va taomlarni tavsiya qilasiz?”

## Local GLB robot and guided narration

The user supplied `robot_playground.glb` (Robot Playground by Hadrien59). Its embedded metadata licenses it CC BY 4.0 and identifies source https://sketchfab.com/3d-models/robot-playground-59fc99d8dcb146f3a6c16dbbcc4680da. UI attribution links to the source, author and license. `scripts/prepare-assistant-glb.py` derives `public/models/assistant-robot.glb` while leaving the upload untouched: the decorative holo/ground branch and its animation channels are excluded; the robot's 112-joint skin, embedded textures and 25.04-second Experiment animation remain intact. Modification is recorded in the derived GLB metadata.

The assistant renders the actual GLB on a transparent model-viewer canvas, with no iframe, added background, shadow plane, image or video substitution. The Apache-2.0 model-viewer 4.1.0 bundle and its license are served locally from public/vendor, loaded on demand when AI opens. No Sketchfab SDK or model host is needed. The file contains one general animation, so gesture requests reuse that authored clip without restarting its time on every guide step; no new pointing/walking clip or arbitrary fingertip IK is claimed. Native pause/resume, reduced motion and cleanup are retained.

The control panel is a separate fixed sibling. Movement changes only the character transform. `moveBefore` preserves the model element across modal changes where supported; older browsers remount the renderer on that transition. Closing pauses playback, removes the model source and releases the viewer. There is no browser-control skill in this environment; physical WebGL presentation and actual microphone/audio quality remain unverified.

Guide execution is sequential: reveal the restaurant card, move alongside it, finish speaking its name, announce entry, then open its real menu link. Each dish uses RFMenuBook.reveal to turn to its actual page before the robot approaches and narrates it. A pause between completed speech and the next step lets the customer follow. No booking/order submission is activated. All guide operations are epoch-cancellable; pause/close abort every pending fetch and delay, stop playback/microphone, and clear highlights.

Audio is fetched/decoded ahead for the next guide phrase and cached only within the current bounded session. Prefetch never plays audio. Narration awaits the current audio's end, with a duration-based watchdog and browser speech fallback; separate AbortControllers avoid cancelling unrelated prefetches. Unit/DOM tests stub the viewer and audio, so they prove sequencing/cancellation rather than real network performance or subjective sound quality.

## Navigation and reading

The drawer starts with a profile card and initials avatar. One Help center entry replaces separate Help, Support, FAQ and public-blog entries. Hash routes `#/help/faq`, `#/help/blog`, `#/help/blog/:slug` and `#/help/contact` render in the existing application shell. `/api/info` reads localized FAQs and only published blog posts; admin blog editing remains protected separately. Public SSR pages are retained for search engines and direct external visitors.

## Voice input and robot palette update

Robot meshes now use separate emerald, gold, pearl, graphite and eye materials, without the source's full-white emissive atlas. The original upload remains unchanged. Browser recordings are normalized to mono 16 kHz PCM WAV where decoding is supported, with leading silence trimmed, a bounded 12.5-second utterance, and an original-format fallback. Uzbek uses automatic input-language detection rather than sending a potentially rejected explicit language hint. A production transcription 400 was observed; its precise provider error was not logged by the old version. New safe diagnostics retain only provider status/code/parameter, never messages/audio/keys. Invalid recording errors are distinct from authentication/configuration, rate limits and billing/spend limits. Real signed-in provider success still requires a live speech test; mock tests are not a substitute.
