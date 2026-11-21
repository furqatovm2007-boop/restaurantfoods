import { env } from 'cloudflare:workers';

/*
 * SIMPLE_MVP_MODE: the 3-step flow — 1) choose a restaurant, 2) pick a table (and optionally dishes) on one
 * page, 3) confirm with name, phone, time and guests. While it is on:
 *  - the site hides flowers, the AI assistant, Call AI, Smart Vision and pricing tiers from the menus and the
 *    landing page (public/mvp-mode.js mirrors this flag for the browser; tests keep both in step);
 *  - POST /api/bookings/quick takes a booking without card binding, online deposit, SMS code or penalty
 *    texts, saves it and tells the restaurant on Telegram.
 * Nothing is removed: switch this to false and every full feature (deposits, OTP, card guarantee, flowers,
 * AI, pricing) is back as it was. The regular /api/bookings keeps all its checks either way.
 */
export const SIMPLE_MVP_MODE = true;
/*
 * Who may book in this mode: 'telegram' — the guest signs in with Telegram at checkout (the Mini App signs in
 * by itself; on the web the bot asks for the contact once), so name, phone and the Telegram chat come from
 * Telegram and both sides get messages there. 'guest' (now) — name and phone typed in, no sign-in; the success
 * screen gives a t.me/<bot>?start=book_<id> link so the guest gets the booking and the restaurant's answer in
 * Telegram with one tap.
 */
export const MVP_CHECKOUT: 'telegram' | 'guest' = 'guest';

/*
 * Prepayment to one central card (app/p2p.ts): shown to the guest when the restaurant asks for a deposit,
 * dishes are pre-ordered, or the guest has 2 recent cancellations. The site owner checks each receipt in
 * Telegram (SUPER_ADMIN_TG_ID) and forwards the money to the restaurant. Set the real card and chat id here or
 * as Worker variables (CENTRAL_PAYMENT_CARD, CENTRAL_PAYMENT_HOLDER, SUPER_ADMIN_TG_ID); while the card still
 * has X's in it the step stays off and bookings go through without prepayment.
 */
export const CENTRAL_PAYMENT_CARD = '8600 XXXX XXXX XXXX';
export const CENTRAL_PAYMENT_HOLDER = 'MUHAMMADJON F.';
export const SUPER_ADMIN_TG_ID = '';

/*
 * "Amanda Restaurant": the featured demo card (first in the catalogue). It is a demo (is_demo=1, DEMO tag
 * on the card and page): bookings for it run the whole flow on screen but are not saved or sent anywhere.
 * Created once, idempotently (INSERT OR IGNORE), by the cron and the catalogue.
 */
export const AMANDA_ID = 'rf-demo-amanda';
const ADMIN_ID = 'sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe';
const TABLES: [number, number, string, number, number, string][] = [
  [1, 2, 'Deraza yonida, ikki kishilik', 18, 22, 'round'],
  [2, 2, 'Deraza yonida, romantik', 38, 22, 'round'],
  [3, 4, 'Zal markazi', 62, 22, 'round'],
  [4, 4, 'Zal markazi', 82, 22, 'round'],
  [5, 4, 'Oilaviy stol', 18, 52, 'rectangle'],
  [6, 6, 'Katta oilaviy stol', 40, 52, 'rectangle'],
  [7, 6, 'Katta oilaviy stol', 62, 52, 'rectangle'],
  [8, 2, 'Bar yonida', 84, 52, 'round'],
  [9, 8, 'VIP kabina — yumshoq divan', 26, 80, 'rectangle'],
  [10, 4, 'Terrasa tomonda', 62, 80, 'round'],
];
const MENU: [string, string, number, string, string, string][] = [
  ['steak', 'Amanda signature steyk', 145000, 'Asosiy taomlar', 'food-grill.jpg', 'Ko‘mirda pishirilgan mol go‘shti, sabzavotlar va sous.'],
  ['caesar', 'Sezar salati', 58000, 'Salatlar', 'food-salad.jpg', 'Tovuq, aysberg, parmezan va kreker.'],
  ['pasta', 'Pasta Alfredo', 72000, 'Asosiy taomlar', 'food-pasta.jpg', 'Qaymoqli sous, tovuq va qo‘ziqorin.'],
  ['pizza', 'Margarita pitsa', 85000, 'Pitsa', 'food-pizza.jpg', 'Tomat sousi, motsarella va rayhon.'],
  ['burger', 'Amanda burger', 65000, 'Asosiy taomlar', 'food-burger.jpg', 'Mol go‘shti kotleti, cheddar, kartoshka fri bilan.'],
  ['bread', 'Tandir non va qaymoq', 22000, 'Nonlar', 'food-bread.jpg', 'Issiq tandir noni, uy qaymog‘i va asal.'],
  ['cheesecake', 'Chizkeyk', 45000, 'Desertlar', 'food-dessert.jpg', 'Klassik Nyu-York chizkeyki, rezavor sous.'],
  ['cappuccino', 'Kapuchino', 28000, 'Ichimliklar', 'food-coffee.jpg', 'Arabika, sut ko‘pigi.'],
];

export async function ensureDemoAmanda() {
  if (!SIMPLE_MVP_MODE) return false;
  if (await env.DB!.prepare('SELECT 1 FROM restaurants WHERE id=?').bind(AMANDA_ID).first()) return false;
  const stmts = [
    env.DB!.prepare(
      "INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close,is_demo,gallery) VALUES (?,?,?,'active',?,'',?,?,?,?,'[]',39.6542,66.9597,'/demo-assets/room-modern.jpg','10:00–23:00',0,0,0,16,12,1,'10:00','23:00',1,?)",
    ).bind(AMANDA_ID, 'Amanda Restaurant', ADMIN_ID, 'DEMO — Samarqand, Registon ko‘chasi', 'DEMO: namuna restoran. Zal, stollar va menyu saytni sinash uchun; bronlar haqiqiy restoranga yuborilmaydi.', 'Yevropa · Milliy', TABLES.length, Math.max(...TABLES.map((t) => t[1])), JSON.stringify(['/demo-assets/room-modern.jpg', '/demo-assets/room-evening.jpg', '/demo-assets/room-warm.jpg'])),
    ...TABLES.map(([n, seats, atmosphere, x, y, shape]) =>
      env.DB!.prepare('INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active,is_demo) VALUES (?,?,?,1,?,?,?,?,?,1,1)').bind(AMANDA_ID + '-t' + n, AMANDA_ID, n, seats, atmosphere + ' — DEMO', x, y, shape),
    ),
    ...MENU.map(([code, name, price, category, image, description]) =>
      env.DB!.prepare("INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available,image_url,is_demo) VALUES (?,?,?,?,?,?,'DEMO','DEMO — tarkibni restorandan aniqlashtiring.',1,?,1)").bind(AMANDA_ID + '-' + code, AMANDA_ID, name, price, 'DEMO · ' + description, category, '/demo-assets/' + image),
    ),
  ];
  await env.DB!.batch(stmts);
  return true;
}

/*
 * One hall map for every restaurant (SIMPLE_MVP_MODE): the other DEMO restaurants used to open the older demo
 * room (Floor 1 / Floor 2, − 100% +, "Guest overstaying"…), whose tables live outside D1. They now open the same
 * hall map as everyone; a demo restaurant with no tables in D1 gets a simple DEMO layout once (idempotent,
 * INSERT OR IGNORE, is_demo=1 rows only — like Amanda above). Bookings for demos are still never saved.
 */
const DEMO_SPOTS: [number, number, string][] = [
  [18, 22, 'round'], [40, 22, 'round'], [62, 22, 'round'], [84, 22, 'round'],
  [18, 52, 'rectangle'], [40, 52, 'rectangle'], [62, 52, 'rectangle'], [84, 52, 'round'],
  [22, 80, 'rectangle'], [44, 80, 'round'], [66, 80, 'round'], [86, 80, 'round'],
];
const DEMO_SEATS = [2, 2, 4, 4, 4, 6, 6, 2, 8, 4, 4, 2];
export async function ensureDemoTables(r: { id: string; is_demo?: number | null; tables?: number | null }) {
  if (!SIMPLE_MVP_MODE || !(r.is_demo || r.id.startsWith('rf-demo-'))) return false;
  if (await env.DB!.prepare('SELECT 1 FROM restaurant_tables WHERE restaurant_id=? LIMIT 1').bind(r.id).first()) return false;
  const n = Math.max(4, Math.min(DEMO_SPOTS.length, Number(r.tables) || 8));
  await env.DB!.batch(
    DEMO_SPOTS.slice(0, n).map(([x, y, shape], i) =>
      env.DB!.prepare('INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active,is_demo) VALUES (?,?,?,1,?,?,?,?,?,1,1)').bind(`${r.id}-t${i + 1}`, r.id, i + 1, DEMO_SEATS[i], 'DEMO stol', x, y, shape),
    ),
  );
  return true;
}
