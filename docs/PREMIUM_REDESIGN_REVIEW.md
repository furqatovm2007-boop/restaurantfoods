# Premium marketplace redesign — review draft

Branch: feature/premium-neon-redesign
Baseline: 02e49dff7f72410de36444f74af134deeda9de28
Production deployment: NOT performed.

## Pull request draft

Title: Separate Home discovery from Search and add lightweight neon interactions

Home previously duplicated the dedicated Search filters. This change gives Home a discovery hero, delivery/pickup/booking links, restaurant recommendations and a booking promotion. Search retains dish, cuisine, price and service filtering. Highly rated sections only use non-demo records with reviews; demo labels remain visible.

Reusable restaurant cards gain consistent photography, rounded surfaces, subtle desktop lift and cursor lighting. Pointer interactions emit 24 radial particles and a circular ripple without changing backgrounds, delaying actions or adding animation dependencies. Scroll, pointer cancellation, multi-touch and reduced-motion preferences suppress the effect. Effects are capped at four simultaneous bursts and removed after 650 ms. Desktop management pages reuse authorized navigation in a collapsible sidebar. Existing mobile navigation and AI placement remain.

New copy is supplied in Uzbek, Russian and English. Authentication, APIs, database schemas, booking lifecycle and production configuration are unchanged.

## Verification

Passed: JavaScript syntax; TypeScript noEmit; production build; commerce, table, demo-room, localization, security and premium interaction tests.
Premium tests cover Home/Search separation with retained filters, excluding demo ratings from popularity, exact pointer coordinates, particle count, scroll/cancel/multi-touch/disabled/reduced-motion handling and resource bounds.

Not verified: actual desktop browser layout, Android/iPhone behavior, screenshots, 60 FPS, Lighthouse scores, live authentication flow. No supported control-browser skill is available in this session. Browser QA is a release gate, not claimed complete.

## Integration status

GitHub access is now verified for the owner's private furqatovm2007-boop/restaurantfoods repository. Source is imported on feature/premium-neon-redesign for review. The repository was empty apart from its initialization README, so the first PR includes the existing source baseline and redesign together. Main remains unchanged until review and merge. API secrets and local runtime data are excluded.

Canva generated promotional media MAHYdNz1rik (1680 × 944):
https://www.canva.com/M/MAHYdNz1rik?utm_source=OC-AaBlKrqBJJNF&utm_campaign=agent_connector_create_image_asset_opened
Only a 200px thumbnail was exposed by the asset metadata tool. The generated asset is NOT embedded in the website or represented as an optimized export. Existing local restaurant/food imagery is retained until a full-resolution export is available.

References reviewed: 2467.jpg and frames from 2466.mp4. Ambient neon and radial movement are adapted without a heavy video background.

## Remaining before merge / deployment

- Review responsive screens at 360, 390, 768 and 1440px, including light/dark and all three languages.
- Check actual touch scrolling, pinch zoom and table holds; keyboard navigation and reduced motion.
- Verify login, cart, booking and owner flows in a staging environment.
- Export and optimize approved Canva banner if selected.
- Review the initial source import and redesign PR before merging.
- Supply actual screenshots and obtain user review before production deployment.
