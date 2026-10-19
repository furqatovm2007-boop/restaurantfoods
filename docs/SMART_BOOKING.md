# Smart booking — demo rollout

Only the Supabase `rf_demo_*` system changed. D1 restaurants and real reservations are untouched.

Each demo restaurant has cleaning_buffer_minutes (0–240, default 60), booking_duration_minutes (30–360, default 120), grace_period_minutes (0–120, default 15) and an optional owner_id. Existing pinned administrator and the server-assigned owner_id can operate the restaurant; user metadata is never used for authorization. Global demo settings remain administrator-only. Current demo restaurants are managed by the existing administrator. To delegate, set owner_id to the verified owner's Auth UUID in the database and assign that restaurant in the existing owner dashboard.

Every new reservation snapshots its cleaning buffer. Configuration changes apply to new reservations; existing confirmed times/buffers are preserved. The map uses the configured duration as a default when the start time changes; the end remains editable for specific party needs.

Effective occupancy: [start, scheduled_end + stored_buffer). For early departure use actual_end + stored_buffer; an explicit Available transition records ready_at and releases from that server timestamp. Both the requested booking and existing bookings' effective ranges are compared, including future bookings and unexpired holds. The next-slot finder walks all blockers for the requested duration and buffer, not just one reservation's end. It returns no candidate outside the selected day's opening hours or when staff action is required.

Confirmed -> Checked-in -> Seated -> Completed -> Cleaning -> Available. Seated/Occupied can also move directly to Cleaning. Confirmed can be explicitly Cancelled or No-show; No-show is rejected until the restaurant grace period ends. Check-in is allowed from start minus grace period. Customers may cancel only holds/confirmed reservations, not an active seated service. Existing occupied demo examples remain compatible.

Overdue seated/occupied/checked-in service blocks new reservations until staff resolve it. Overdue cleaning also requires explicit readiness. No later confirmed reservation is cancelled, moved, or rewritten. The dashboard shows overstay/grace warnings; it does not send SMS, email, or push notifications. Realtime revision events plus 15-second polling update the map; clock-driven warnings appear on refresh. Orange means hold, yellow means cleaning.

Server transactions take a per-user advisory lock and a restaurant row lock, then table/booking locks. All mutation paths share the locking order. Confirmation rechecks conflicts, including a new overstay since the hold was created. Holds expire after five server minutes, as before. RLS and safe public availability projection remain enabled.

## Validation
- `docs/sql/test-demo-turnover.sql`: rolled-back live Postgres test of 14:00–16:00 +60 min; 16:30 rejected; 17:00 accepted; incoming buffer colliding with a later booking; expired holds; early departure; exact 16:15 readiness; unchanged scheduled end; all service lifecycle transitions; overdue blocking; grace period and no-show.
- Two concurrent live transactions with booking intervals 14:00–16:00 and 16:30–18:30: exactly one accepted, other DEMO_CONFLICT. Test hold removed afterward.
- JavaScript syntax, TypeScript, SVG/API/isolation tests, real booking regression tests and CSRF/security tests passed.
- Desktop/mobile browser visual QA is unavailable in this workspace. Responsive controls and live browser Realtime reception are implemented but not claimed as visually tested.
- Existing Auth advisor warning (not introduced by this change): leaked-password protection disabled: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Try tomorrow's DEMO table 1: book 14:00–16:00, then inspect 16:30 and 17:00. Existing sample reservations on other tables are preserved. Dashboard settings are below the floor map. Select a table and its daily booking to apply service states. Actual service timestamps always come from the server; future check-in is intentionally refused until the grace window.
