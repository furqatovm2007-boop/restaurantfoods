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
