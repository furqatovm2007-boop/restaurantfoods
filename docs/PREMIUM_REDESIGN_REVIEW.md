# RestaurantFoods premium marketplace — review draft

Branch: `feature/premium-motion-review-20261020`.
Baseline: deployed Sites source `e5316bf1ebc3257941b84a49157f44db2de58b13`, mirrored in GitHub commit `85bc60eed123806fe71b53b05276993dbac916f8`.
Production deployment: **not performed**. No production settings, databases, Supabase functions or secrets were changed.

## Result

Home is a discovery page with an animated food hero, delivery/pickup/reservation links, restaurant discovery, cuisine-diverse recommendations and a reservation promotion. Highly rated restaurants appear only when real catalog records have reviews; DEMO ratings never populate that section. All search inputs and cuisine/price/reset controls remain on Search. Home ignores retained Search filters. Its service links open Search with the selected service.

Cards use consistent image ratios, explicit image dimensions, lazy decoding/loading, cuisine overlays, DEMO badges, delivery/hours and a native accessible menu/reservation link. Desktop cursor lighting and tilt follow the latest pointer position. A pending animation frame cannot reapply hover after the cursor leaves. Body clicks retain the existing restaurant navigation; keyboard users use native links.

Pointer taps emit 24 particles, 2–5px, from the contact position with an expanding circular ripple. Particles use 450–630ms transforms/opacity and are removed by 650ms. Element scale uses 220ms. Background colors are unchanged by the burst. Scroll, drag, cancellation, multiple contacts and disabled controls suppress the burst. Effects are limited to four concurrent layers; page hide, visibility changes and reduced-motion changes clear layers and timers. SVG booking table controls participate without overwriting their placement transforms.

The visual layer adds ambient light, one-time card/section reveals, a loading ring, selected navigation icon animation, keyboard outlines, dark/light booking map polish and safe-area-aware navigation. All new product copy is in Uzbek, Russian and English. No animation dependency was added. Existing authentication, role checks, carts, booking intervals/holds/turnover, Realtime and API implementations are retained.

## Review artifact

`docs/review/restaurantfoods-review.html` is a self-contained, offline visual review built by `node scripts/build-review.cjs`. Download and open it in a browser. It includes actual generated Home/Search/card functions, CSS and SVG table glyphs, three clearly fictional DEMO catalog entries, language/theme controls and particle interactions. Restaurant links open the floor-plan visual. It has no API access, authentication, real reservation holds, payment or order execution. It is a review aid, not evidence that production flows were exercised.

The artifact embeds existing local images; original logo identity is retained. It does not load a video background or remote font.

## Verification

- All **27** existing CJS test suites passed after the UI changes.
- TypeScript `tsc --noEmit` passed.
- Production `npm run build` passed (Vinext/Vite).
- Expanded pointer tests passed: coordinates, 24 particles, scrolling, cancellation, multiple contacts, disabled/reduced motion, four-layer cap, latest hover position, leave-before-frame handling and resource cleanup.
- Home regression checks passed: retained Search query does not filter Home, no search controls, service links/hero/promotion present, demo-only ratings excluded from popularity.
- Offline review script compiles, and its inline JavaScript compiles with Node's VM parser.

**Not verified:** actual desktop/mobile layout, screenshots, Android Chrome/iPhone Safari touch behavior, WebGL robot behavior, FPS/Lighthouse, actual logged-in authentication, real booking lifecycle or provider calls in a browser. No production request or database write was made for this redesign.

The Sites skill requires: “If `$control-browser` is unavailable, skip browser QA: do not start a preview server, install a browser, or improvise another browser-control path.” That skill is unavailable in this session, so no browser screenshots are claimed.

## Connected integrations

GitHub repository `furqatovm2007-boop/restaurantfoods` is private and accessible through the connected integration. A separate feature branch was created for these changes. The PR targets the existing implementation branch `feature/premium-neon-redesign` so the review diff contains only this redesign; the existing implementation PR to `main` remains separate.

Canva generated image `MAHYhGcyWqs`, 1680×944, for a premium food banner:
https://www.canva.com/M/MAHYhGcyWqs?utm_source=OC-AaBlKrqBJJNF&utm_campaign=agent_connector_create_image_asset_opened

The connector returned only a 200×112 thumbnail and exposed no full-resolution export operation. The Canva asset is available for review in Canva but **is not embedded or claimed as a web export**. Existing local restaurant photography is used in the implementation. Exporting the approved full-resolution image and converting it to responsive WebP/AVIF remains before replacing that photography.

References inspected: `2467.jpg` and sampled frames of `2466.mp4`. Neon rings and radial motion are adapted to food content rather than used as a heavy full-page video effect.

## Required before production approval

- Inspect Home, Search, restaurant menu, booking modal and management sidebar at 360, 390, 768 and 1440px in light/dark and all three languages.
- Test Android Chrome and iPhone Safari scrolling, multi-touch, safe areas, reduced motion, keyboard focus and modal pointer coordinates.
- Exercise actual login/session refresh, cart quantity/checkout, DEMO hold/confirm/expiry, 14:00–16:00 booking + 16:00–17:00 cleaning, and real booking availability in the approved test environment.
- Capture real desktop/mobile screenshots, review the Canva asset and measure performance.
- Obtain review before merging/deploying. Neither PR creation nor passing mocked tests constitutes production approval.
