# 3D menu book — review only

Pilot: restaurant `rf-demo-restaurant-01`, only when `is_demo` is truthy. All other restaurants retain the categorized menu list. No production deployment or database changes.

The restaurant's own name, menu photographs, descriptions, ingredients, allergens, availability and current prices populate a green-and-gold cover and paper pages. Two dishes per page; two pages above 680px container width, one on smaller containers. Buttons, arrow keys and horizontal pointer swipes turn pages. Vertical movement, multiple contacts, form controls and reduced-motion preferences are handled. The reference TXT was incomplete; its portfolio, remote images and fonts were not imported.

Quantity inputs remain the original form nodes across pagination/filtering. Existing cart handlers compute prices and persist quantities. Decorative animated copies are inert, disabled, unnamed and removed on finish, timeout or disposal. Demo checkout restrictions stay in the existing backend. No new ordering or booking endpoint.

Review: `docs/review/restaurantfoods-3d-menu.html`. Rebuild with `node scripts/build-menu-book-review.cjs`. This self-contained HTML embeds illustrative local photos and actual renderer/controller/CSS, supports UZ/RU/EN and local total calculations, and sends no API requests or orders.

Validation: all 30 CJS test suites, TypeScript noEmit and production build passed. Added behavioral coverage for pilot isolation, escaping, unique quantity controls, pagination, category selection, retained quantity values, mobile width, keyboard, horizontal versus vertical gestures, reduced motion and page lifecycle. Browser/mobile visual QA, screenshots and FPS measurements remain unperformed. The supported control-browser skill is unavailable in this environment; Sites instructs to skip browser QA in that case.

## Add-to-cart feedback

Explicit Add to cart buttons reuse the existing input/cart acceptance handler. Only accepted additions launch a 720ms food-photo flight to the visible mobile cart or desktop header cart; arrival pulses the cart and synthesizes a quiet two-note chime with Web Audio. Audio is unlocked in the click gesture, failures are harmless, mute persists, and no audio/media download is needed. Missing pictures and reduced-motion mode use immediate feedback. Flights are capped at four and cancelled on route changes, backgrounding and page hide. Tests verify timing, mute, reduced motion, cleanup, existing cart totals, quantity limits and rejected restaurant switches. Actual audio playback on iPhone/Android remains unverified.

## Drinks and paper curl revision

Added Juices (UZ/RU/EN) and juice/sok/соки aliases to owner category suggestions. Migration 0017 adds five repeat-safe beverage fixtures to the explicitly isolated demo pilot only: cola, sparkling lemonade, orange/apple juices and still water. Their local SVG illustrations are marked DEMO. The migration is prepared for review and has not run against production. The standalone review includes these drinks immediately.

Page turns now use six or eight articulated strips with front/back faces and a curved rotating spine, 760ms. Original input controls stay in the form; disabled, inert decorative snapshots are discarded on completion, cancellation or unmount. A short filtered-noise Web Audio rustle plays on turns; the separate Page sound toggle persists and works independently of cart sound. Only one rustle is active, and navigation/backgrounding stops it. No audio files or external dependencies. Mobile browser appearance and actual audio remain unverified.
