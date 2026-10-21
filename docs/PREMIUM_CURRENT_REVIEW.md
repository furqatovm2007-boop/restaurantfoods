# Premium UI review on current RestaurantFoods source

Baseline: published Site version 45, source bd9f3bf1aea85cdd218ea0d9896630ef7562a0d5.
Local branch: feature/premium-current-review-20261021.

This review ports the premium marketplace changes onto the current source. It retains the uploaded-reference book menu, explicit Add-to-cart quantities and animation, profile-first navigation, in-app help, and OpenAI robot integration. The earlier GitHub PR #2 is based on older application code and must not be merged as a replacement for the current deployed source.

Home gains a food hero, delivery/pickup/reservation links, full discovery listing, cuisine-diverse recommendations and reservation promotion. Search retains the filters. Cards receive stable image proportions, DEMO/cuisine labels and delivery/hours facts. Real reviews alone populate the popular section. Cursor glow/tilt uses the latest pointer location. Tap particles retain 24 particles and a ripple with bounded cleanup; scrolling, cancellation, multi-touch, disabled controls and reduced motion suppress them. Navigation selected-state animation uses aria-current. Booking visuals retain the existing backend state and improve light/dark styling.

New copy is supplied in UZ/RU/EN. No backend, database, secret, payment configuration, Supabase function or production deployment is changed by this review.

Validation performed on this branch:
- All 35 CJS test suites passed.
- TypeScript noEmit passed.
- Production build passed with Sites 1.1.0 build helper.
- Review HTML and generated menu sample built successfully.

Browser QA remains blocked. The preview supervisor started, but the cloud browser first reached a connection error and subsequently refused access under its URL security policy. No desktop/mobile screenshot, device touch test, sound quality check, FPS or Lighthouse measurement is claimed.

`docs/review/restaurantfoods-review.html` is the offline visual review; `node scripts/build-review.cjs` regenerates it. The review uses fictional data and does not test actual reservations or orders. The separate menu sample exercises local cart feedback only. Canva banner export remains unavailable; no thumbnail is presented as an optimized production image.

`docs/review/premium-current-v45.patch` contains source changes against the exact v45 baseline; generated HTML/demo bundles are regenerated with:

    node scripts/build-locales.cjs
    node scripts/build-review.cjs
    node scripts/build-menu-book-review.cjs

Apply that patch only to the named baseline. The GitHub copy is a review supplement to the older PR, not a claim that GitHub and Sites histories are synchronized or that the PR is ready to merge. Review actual responsive screens before approving production deployment.
