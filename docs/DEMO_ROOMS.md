# Demo rooms — 2026-10-19

## Data boundary
The existing application uses D1 for restaurants, menus, orders and legacy reservations. These were not migrated or removed. Supabase Auth remains the identity authority. New demo room data lives only in `rf_demo_*` tables in Supabase project `edfpytsribkqxtdfimww`.

D1 migration 0013 labels existing demo data with `is_demo`, adds illustrative stock cover/gallery and menu images, and blocks new demo orders/reservations in real fulfillment tables. Existing legacy demo reservations are preserved. New demo menu/table/review records inherit the flag. No users were added or removed.

Ten demo concepts, 60 menu items, nine interactive tables per demo restaurant, two floors. Table nine demonstrates unavailable status. The existing D1 table editor for a demo restaurant redirects to the isolated demo map. Production restaurants retain their existing editor and booking flow.

## Booking and authorization
`/api/demo-room` validates origin, authentication, action allowlist and user rate limits before forwarding the HttpOnly access token to `rf_demo_room`. No service-role key is used. The public config exposes only the existing public anon key for Realtime.

The public RPC is SECURITY INVOKER; the private, search-path-pinned function performs explicit identity/admin checks and exposes a restricted availability projection. Direct table writes are revoked with RLS enabled. Only own reservation rows can be directly read; the public snapshot never exposes other users' identities or reservation UUIDs. Administrator is the existing pinned Auth UUID, never a user-editable role claim.

Mutations lock the restaurant then table inside one Postgres transaction. Overlapping half-open intervals conflict; adjacent bookings are allowed. Holds last exactly 300 server seconds. Expired holds stop blocking immediately; snapshots/mutations persist cancellation. The UI uses server clock offset, one-second countdown and a 15-second availability fallback. Realtime carries only a revision number; it triggers a safe refetch. Confirming expired holds fails on the server.

Default view is tomorrow 13:00–15:00 Samarqand. Seeded occupied/reserved examples use that initial date. Administrators can use **Create sample availability** for any selected interval; it fills only empty slots, preserving existing demo bookings. Yellow sample holds also expire after five minutes.

## Controls
Customer: select date/time/guests, filter availability, floor buttons, SVG seat counts, pan/pinch/zoom, table details, hold, confirm, cancel. Selection of an available suitable table automatically creates a hold for a signed-in user. An unauthenticated user sees sign-in instead.

Admin: occupy, hold, reserve, confirm, cancel, free, add/edit/remove table, click map to set coordinates, global demo enable/disable. Active future bookings must be cancelled before editing/removing a table. Mobile details use a bottom sheet; the map includes its own bottom navigation. Settings also contains a per-browser demo catalog visibility switch and admin global mode controls.

## Cleanup
The **Clear demo bookings** action requires administrator identity plus literal confirmation and affects only the chosen demo restaurant's isolated reservations. No real data tables are reachable by that operation. Global disable is reversible and is preferable to removal while testing.

For full later removal, use `docs/sql/demo-cleanup-plan.sql` first to review counts. Then run the listed D1 delete statements as a single D1 `DB.batch` transaction, with foreign keys enabled, and the Supabase deletion in a separate transaction. Never delete users. This full removal was prepared but NOT executed. Keep a backup before permanent cleanup. D1 and Supabase are separate transactional systems; disable demo mode first so a partial failure stays unavailable, then retry only the failed side.

## Assets and rebuild
Illustrative stock images are locally served and lazy loaded; they do not depict the fictional restaurants or exact dishes. Sources are recorded in DEMO_IMAGES.json. No real business claims or indexing: existing SEO filters now explicitly include `is_demo=0` and demo routes remain noindex.

`node scripts/build-locales.cjs`
`node scripts/build-demo-realtime.cjs` (bundles pinned @supabase/realtime-js 2.115.0)

## Validation
- Supabase transaction tests: holds, exact 5-minute TTL, overlapping rejection, adjacent acceptance, confirm/cancel, expired confirmation denial and release, anonymous privacy, normal authenticated customer, administrator restrictions and global disable. All transaction-test changes rolled back.
- Two concurrent Postgres transactions: exactly one accepted, second `DEMO_CONFLICT`. Only the test hold was then removed.
- Local tests cover all 2/4/6/8 chair counts in all shapes, D1 guards, images, proxy CSRF/roles/session forwarding, existing table and commerce behavior.
- Browser automation is unavailable in this workspace. Desktop/mobile styling, pinch, bottom-sheet gestures and actual browser Realtime delivery have not been visually exercised. Responsive CSS and JS were checked statically; do not report a visual device test as passed.
- Existing Supabase advisor warning: leaked password protection is disabled (unrelated to demo change). Enable in Auth password security when available for the project.
