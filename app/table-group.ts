import { env } from 'cloudflare:workers';

/*
 * Several tables in one reservation (large groups, birthdays; SIMPLE_MVP_MODE quick booking).
 * The reservation is ONE booking (one id, pass, receipt, restaurant card, payment): it keeps the first table
 * in table_number; every other table gets a linked "hold" row in bookings for the same time — so every existing
 * availability check (hall map, holds, live status, the overlap triggers) sees those tables busy without a
 * migration. The links live in app_settings:
 *   grpm:<mainId>      = {"tables":[2,3,4],"seats":14}   (all tables of the reservation, in order)
 *   grp:<holdRowId>    = <mainId>
 * A trigger keeps the hold rows' status equal to the main booking's (confirm, reject, cancel, no-show…), and the
 * customer's lists hide the hold rows (NOT_GROUP_HOLD).
 */
export const GROUP_MAX_TABLES = 6;
export const NOT_GROUP_HOLD = (alias = 'b') => `NOT EXISTS (SELECT 1 FROM app_settings g WHERE g.key='grp:'||${alias}.id)`;

let triggerReady = false;
export async function ensureGroupTrigger() {
  if (triggerReady) return;
  await env.DB!.prepare(
    "CREATE TRIGGER IF NOT EXISTS booking_group_status AFTER UPDATE OF status ON bookings WHEN NEW.status<>OLD.status BEGIN UPDATE bookings SET status=NEW.status WHERE status<>NEW.status AND id IN (SELECT substr(key,5) FROM app_settings WHERE key LIKE 'grp:%' AND value=NEW.id); END",
  ).run();
  triggerReady = true;
}

export interface GroupInfo {
  tables: number[];
  seats: number;
}
export function parseGroup(raw: string | null | undefined): GroupInfo | null {
  if (!raw) return null;
  try {
    const g = JSON.parse(raw) as GroupInfo;
    return Array.isArray(g.tables) && g.tables.length > 1 ? { tables: g.tables.map(Number), seats: Number(g.seats) || 0 } : null;
  } catch {
    return null;
  }
}
/** "🪑 Stollar: #2, #3, #4 (Jami 14 o‘rin)" — or null for a one-table booking. */
export const groupLine = (g: GroupInfo | null) => (g ? `🪑 Stollar: ${g.tables.map((n) => '#' + n).join(', ')} (Jami ${g.seats} o‘rin)` : null);

/**
 * The hold rows for the other tables of a booking that was just inserted (same restaurant, date, time, guest,
 * phone, status). All or nothing: if any table is taken meanwhile, the hold rows and the main booking are removed
 * and the caller answers 409.
 */
export async function addGroupTables(
  main: { id: string; restaurantId: string; userId: string; date: string; slot: string; endSlot: string; guests: number; phone: string; status: string; createdAt: string },
  tables: { number: number; seats: number }[],
  allTables: { number: number; seats: number }[],
) {
  await ensureGroupTrigger();
  const ids = tables.map(() => crypto.randomUUID());
  try {
    await env.DB!.batch(
      tables.map((t, i) =>
        env.DB!.prepare("INSERT INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at,preorder_items,preorder_total,deposit_status,phone_verified,penalty_accepted) VALUES (?,?,?,?,?,?,?,?,?,?,?,'[]',0,'group_hold',0,0)").bind(
          ids[i],
          main.restaurantId,
          main.userId,
          main.date,
          main.slot,
          main.endSlot,
          t.number,
          0,
          main.phone,
          main.status,
          main.createdAt,
        ),
      ),
    );
  } catch {
    await env.DB!.prepare('DELETE FROM bookings WHERE id=?').bind(main.id).run();
    return null;
  }
  const info: GroupInfo = { tables: allTables.map((t) => t.number), seats: allTables.reduce((s, t) => s + (Number(t.seats) || 0), 0) };
  const now = new Date().toISOString();
  await env.DB!.batch([
    env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'group')").bind('grpm:' + main.id, JSON.stringify(info), now),
    ...ids.map((hid) => env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'group')").bind('grp:' + hid, main.id, now)),
  ]);
  return info;
}
