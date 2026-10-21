# Menu book publication

Release is based on the current hosted source, e5316bf, and changes only menu presentation, explicit add-to-cart feedback and read-only demo beverages. Unreleased Home redesign and AI edits are not included. No database migration or production record write is performed.

- 3D menu book and animated add-to-cart controls are enabled on every restaurant detail page, including real restaurants. Demo beverages remain isolated to rf-demo-restaurant-01.
- Same-origin demonstration: /menu-demo.html, noindex, external JS/CSS and no orders or API writes.
- Curved 6/8-strip page turns; original form inputs retained.
- Self-hosted book-page-turn.wav plays on a turn; the persistent page-sound toggle is independent of cart sound. Web Audio remains a fallback.
- Read-only drink fixtures: soda, sparkling lemonade, orange/apple juice and still water. Real menus are unchanged; existing fixture IDs/names are not duplicated.
- Added DOM integration check ran the full generated document without script errors, opened the cover, changed page status and invoked audio. Web Animations and Audio were stubbed for this check, so actual visual animation and audible playback are not verified by that test.
- 31 CJS suites and TypeScript noEmit passed. Physical desktop/mobile visual and audio verification remains pending.

## Full restaurant rollout

The user authorized enabling the full menu experience on the main site. All restaurant detail pages now use their own real menu records in the 3D book; no example drinks or demo prices are inserted into real menus. Accepted additions use the existing cart, with food-photo flight and arrival sound. Existing order submission, booking and payment behavior remains unchanged.

## Cart feedback and natural page audio fix

Fixed feedback suppression when the source photo is unloaded/absent/offscreen or navigation cart targets are hidden. A fixed menu cart destination with live quantity count remains visible while scrolling. Photo flights use an on-screen curved path; missing photos use a plate placeholder. Accepted cart mutations still happen immediately. A self-hosted cart-add.wav chime is unlocked in the original click, then played at arrival, with a louder Web Audio fallback. Mute/reduced motion, cancellation and four-flight bounds remain.

Page sound is now a real CC0 page-turn recording: OwlStorm, Page Turn (1), https://freesound.org/people/OwlStorm/sounds/151220/ . Source: https://cdn.freesound.org/previews/151/151220_140737-hq.mp3 . Converted to mono PCM, gently filtered and faded; served locally as book-page-turn.wav. No original login-only download was used. License verified on the source page: Creative Commons 0.

Verification for this fix: 31 CJS suites and TypeScript noEmit passed. A DOM integration check executed the full generated document and actual Add to cart handler: count increment, source-image loading fallback, arrival target pulse, muted priming versus audible media invocation, and missing-photo fallback all passed without script errors. Rendering and media playback were stubbed in that test, so physical browser animation and heard audio are not claimed verified.

## Table preorder and header cart revision

Removed the fixed lower-left cart. The fixed upper-right header cart now carries the count and is the sole primary destination for 880ms food flights, including a forward lift before the arc. Media sound is still played only at arrival.

Dining in opens table/date selection, then a separate menu and review step. Meals are optional. Real reservation meals and totals are priced on the server and stored atomically in bookings.preorder_items and bookings.preorder_total; manager/customer histories display them. Migration 0017 adds only those constant-default columns, preserving existing rows. Drizzle generation initially repeated the already-applied persistent_sessions creation from migration 0014; this unapplied duplicate was removed before publication. Existing overlap constraints are retained. Pickup/delivery carts remain separate.

Demo meal selections are explicitly browser-only examples, attached to the local confirmed-demo receipt after the existing demo hold/confirm API succeeds; no demo food order is sent to a real restaurant.

Verification of the table-preorder revision: all 32 CJS suites and TypeScript noEmit passed. Added real SQLite API tests cover server-priced meals saved in the booking row, old-row defaults, optional table-only reservations, wrong-restaurant/unavailable dishes, invalid quantities/duplicates, unchanged overlap protection and private booking history. DOM checks exercised the actual main header/cart handler and the meal dialog: no lower-left dock, header count, forward lift/arrival/audio calls, category selection, review before submission, table-only and failed-submit recovery. Animations/media in DOM checks are stubbed; physical device rendering and audible playback remain unverified.
