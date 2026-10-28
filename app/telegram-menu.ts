import { env } from 'cloudflare:workers';
import qrcode from 'qrcode-generator';
import { telegram, html, site } from './telegram';
import { ensurePassCode, PASS_PREFIX, receiptNumber } from './booking-pass';
import { liveTables, freeNow } from './live-tables';
import { countedReview } from './review-rules';

/*
 * The bot's own menu, for customers who prefer to stay in the chat:
 *  /start (or /menu) shows the Mini App button (the whole site inside Telegram) and quick views answered in
 *  the chat itself: restaurants (photo, rating, tables free right now), a restaurant's free tables and
 *  menu, the flower catalogue, and the customer's active bookings with their QR pass as a picture.
 * Booking, ordering and paying always happen in the Mini App (online deposit, the phone, the rules), never
 * from a chat button. Demo restaurants are not listed. Only private chats get the menu.
 */
const PAGE = 5;
export const miniAppUrl = (go = '') => site() + '/?source=tg_miniapp' + (go ? '&go=' + encodeURIComponent(go) : '');
const openButton = (text: string, go = '') => ({ text, web_app: { url: miniAppUrl(go) } });
const money = (n: unknown) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';
const photoUrl = (u: unknown) => {
  const v = String(u || '').trim();
  return /^https:\/\/[^\s]+$/.test(v) ? v : /^\/[^\s/][^\s]*$/.test(v) ? site() + v : '';
};
// Same visibility rule as the public flower catalogue (app/api/flowers).
const FLOWERS_PUBLIC = "f.active=1 AND f.status='active' AND f.is_approved=1 AND f.in_stock=1 AND COALESCE(a.status,'active')<>'suspended' AND COALESCE(a.role,'admin') IN ('florist','admin')";

export const mainMenu = () => ({
  inline_keyboard: [
    [openButton('🍽️ Restoranlar, 3D Stol va Menyu (Ochish)')],
    [{ text: '🏢 Restoranlar ro‘yxati', callback_data: 'm:r:0' }],
    [{ text: '💐 Gullar katalogi', callback_data: 'm:f:0' }],
    [{ text: '📅 Mening bronlarim va QR-Chek', callback_data: 'm:b' }],
  ],
});

/** A card with a photo when there is one (and Telegram can fetch it), else a plain message. */
async function card(chatId: string, image: string, text: string, reply_markup: unknown) {
  if (image && (await telegram('sendPhoto', { chat_id: chatId, photo: image, caption: text.slice(0, 1024), parse_mode: 'HTML', reply_markup }))) return;
  await telegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup, link_preview_options: { is_disabled: true } });
}

async function restaurants(chatId: string, offset: number) {
  const rows = (
    await env.DB!.prepare("SELECT r.id,r.name,r.address,r.cuisine,r.image_url,r.booking_open,r.booking_close,(SELECT AVG(stars) FROM reviews WHERE restaurant_id=r.id AND " + countedReview('reviews', 'r') + ') AS rating,(SELECT COUNT(*) FROM reviews WHERE restaurant_id=r.id AND ' + countedReview('reviews', 'r') + ") AS review_count FROM restaurants r WHERE r.status='active' AND COALESCE(r.is_demo,0)=0 ORDER BY r.name LIMIT ? OFFSET ?")
      .bind(PAGE + 1, offset)
      .all<any>()
  ).results;
  if (!rows.length) {
    await telegram('sendMessage', { chat_id: chatId, text: offset ? 'Boshqa restoran yo‘q.' : 'Hozircha faol restoran yo‘q.', reply_markup: mainMenu() });
    return 'menu_restaurants_empty';
  }
  const live = await liveTables();
  for (const r of rows.slice(0, PAGE)) {
    const t = freeNow(live, r.id, r.booking_open, r.booking_close);
    const rating = r.review_count ? `⭐ ${Number(r.rating).toFixed(1)} (${r.review_count} ta baho)` : '⭐ Hali baho yo‘q';
    const tables = !t.total ? '🪑 Stollar hali kiritilmagan' : t.free == null ? '🪑 Hozir yopiq' : `🪑 Hozir bo‘sh stollar: <b>${t.free}</b> / ${t.total}`;
    const text = [`🏢 <b>${html(r.name)}</b>`, rating, tables, r.cuisine ? '🍴 ' + html(r.cuisine) : '', r.address ? '📍 ' + html(r.address) : ''].filter(Boolean).join('\n');
    await card(chatId, photoUrl(r.image_url), text, {
      inline_keyboard: [[{ text: '🪑 Bo‘sh stollarni ko‘rish', callback_data: 'm:t:' + r.id }], [{ text: '📖 Menyuni ko‘rish', callback_data: 'm:m:' + r.id }], [openButton('⚡ 1 bosishda Stol Bron qilish', '/restaurant/' + r.id)]],
    });
  }
  if (rows.length > PAGE) await telegram('sendMessage', { chat_id: chatId, text: 'Yana restoranlar bor:', reply_markup: { inline_keyboard: [[{ text: '➡️ Keyingi', callback_data: 'm:r:' + (offset + PAGE) }]] } });
  return 'menu_restaurants';
}

async function activeRestaurant(id: string) {
  return env.DB!.prepare("SELECT id,name,booking_open,booking_close FROM restaurants WHERE id=? AND status='active' AND COALESCE(is_demo,0)=0").bind(id).first<{ id: string; name: string; booking_open: string; booking_close: string }>();
}

async function freeTables(chatId: string, id: string) {
  const r = await activeRestaurant(id);
  if (!r) return gone(chatId);
  const [live, tables] = await Promise.all([liveTables(), env.DB!.prepare('SELECT number,seats,floor FROM restaurant_tables WHERE restaurant_id=? AND active=1 ORDER BY floor,number').bind(id).all<{ number: number; seats: number; floor: number }>()]);
  const t = freeNow(live, id, r.booking_open, r.booking_close),
    busy = live.busy.get(id) || new Set<number>();
  const free = tables.results.filter((x) => !busy.has(Number(x.number)));
  const lines = t.free == null ? [t.total ? 'Restoran hozir yopiq. Bronni ochiq vaqtga qilishingiz mumkin.' : 'Stollar hali kiritilmagan.'] : free.length ? free.slice(0, 30).map((x) => `• ${x.number}-stol · ${x.seats} o‘rin${Number(x.floor) > 1 ? ` · ${x.floor}-qavat` : ''}`) : ['Hozir bo‘sh stol yo‘q. Keyingi vaqtga bron qilishingiz mumkin.'];
  await telegram('sendMessage', {
    chat_id: chatId,
    text: `🪑 <b>${html(r.name)}</b> — hozir bo‘sh stollar (${live.hhmm}):\n${lines.join('\n')}${free.length > 30 ? `\n… yana ${free.length - 30} ta` : ''}\n\nOnlayn bron kamida 1 soat oldin qilinadi.`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [[openButton('⚡ Stol bron qilish (3D zal)', '/restaurant/' + id)]] },
  });
  return 'menu_tables';
}

async function menu(chatId: string, id: string) {
  const r = await activeRestaurant(id);
  if (!r) return gone(chatId);
  const items = (await env.DB!.prepare("SELECT name,price,COALESCE(category,'') AS category FROM menu WHERE restaurant_id=? AND available=1 AND COALESCE(is_demo,0)=0 ORDER BY category,name LIMIT 60").bind(id).all<{ name: string; price: number; category: string }>()).results;
  let text = `📖 <b>${html(r.name)}</b> — menyu\n`;
  let last: string | null = null,
    shown = 0;
  for (const m of items) {
    const head = m.category && m.category !== last ? `\n<b>${html(m.category)}</b>\n` : '';
    const line = `${head}• ${html(m.name)} — ${money(m.price)}\n`;
    if (text.length + line.length > 3500) break;
    text += line;
    last = m.category;
    shown++;
  }
  if (!items.length) text += '\nMenyu hali kiritilmagan.';
  else if (shown < items.length) text += '\n… to‘liq menyu Mini App’da.';
  await telegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[openButton('📖 3D menyuni ochish va buyurtma', '/restaurant/' + id)]] } });
  return 'menu_dishes';
}

async function flowers(chatId: string, offset: number) {
  const rows = (await env.DB!.prepare("SELECT f.title,f.kind,f.size,f.price,f.image_url,COALESCE(a.name,'RestaurantFoods') AS florist_name FROM flowers f LEFT JOIN accounts a ON a.id=f.florist_id WHERE " + FLOWERS_PUBLIC + ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?').bind(PAGE + 1, offset).all<any>()).results;
  if (!rows.length) {
    await telegram('sendMessage', { chat_id: chatId, text: offset ? 'Boshqa guldasta yo‘q.' : 'Hozircha sotuvda guldasta yo‘q.', reply_markup: mainMenu() });
    return 'menu_flowers_empty';
  }
  for (const f of rows.slice(0, PAGE)) {
    const text = [`💐 <b>${html(f.title)}</b>`, [f.kind, f.size].filter(Boolean).map(html).join(' · '), '💰 ' + money(f.price), '🌸 ' + html(f.florist_name)].filter(Boolean).join('\n');
    await card(chatId, photoUrl(f.image_url), text, { inline_keyboard: [[openButton('💐 Stolga qo‘shish', '/flowers')]] });
  }
  if (rows.length > PAGE) await telegram('sendMessage', { chat_id: chatId, text: 'Yana guldastalar bor:', reply_markup: { inline_keyboard: [[{ text: '➡️ Keyingi', callback_data: 'm:f:' + (offset + PAGE) }]] } });
  return 'menu_flowers';
}

async function bookings(chatId: string) {
  const acc = await env.DB!.prepare('SELECT id FROM accounts WHERE telegram_chat_id=?').bind(chatId).first<{ id: string }>();
  if (!acc) {
    await telegram('sendMessage', { chat_id: chatId, text: 'Bronlaringizni ko‘rish uchun Mini App’ni oching — Telegram orqali avtomatik kirasiz.', reply_markup: { inline_keyboard: [[openButton('🍽️ Mini App’ni ochish', '/bookings')]] } });
    return 'menu_bookings_signin';
  }
  const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
  const rows = (await env.DB!.prepare("SELECT b.id,b.date,b.slot,b.end_slot,b.table_number,b.guests,b.status,b.pass_code,r.name AS restaurant_name FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id WHERE b.user_id=? AND b.status IN ('pending','confirmed') AND b.date>=? ORDER BY b.date,b.slot LIMIT 3").bind(acc.id, today).all<any>()).results;
  if (!rows.length) {
    await telegram('sendMessage', { chat_id: chatId, text: 'Faol broningiz yo‘q.', reply_markup: { inline_keyboard: [[openButton('🍽️ Stol bron qilish')]] } });
    return 'menu_bookings_empty';
  }
  for (const b of rows) {
    const code = await ensurePassCode(b.id, b.pass_code);
    const caption = [`🧾 <b>${html(b.restaurant_name)}</b> · ${receiptNumber(b)}`, `📅 ${b.date} · ${b.slot}${b.end_slot ? '–' + b.end_slot : ''}`, `🪑 ${b.table_number}-stol · ${b.guests} kishi`, b.status === 'confirmed' ? '✅ Tasdiqlangan' : '⏳ Restoran tasdig‘ini kutmoqda', '', 'QR-kodni eshikda xodimga ko‘rsating.'].join('\n');
    const keyboard = { inline_keyboard: [[openButton('🧾 Chekni ochish', '/bookings')]] };
    if (!code || !(await sendPng(chatId, await qrPng(PASS_PREFIX + code), caption, keyboard))) await telegram('sendMessage', { chat_id: chatId, text: caption + (code ? `\n\nKod: <code>${code}</code>` : ''), parse_mode: 'HTML', reply_markup: keyboard });
  }
  return 'menu_bookings';
}

async function gone(chatId: string) {
  await telegram('sendMessage', { chat_id: chatId, text: 'Bu restoran hozir mavjud emas.', reply_markup: mainMenu() });
  return 'menu_gone';
}

/** Menu messages and buttons of a private chat; null for every other update (handled by app/telegram.ts). */
export async function handleMenu(update: any): Promise<string | null> {
  const msg = update?.message;
  if (msg?.chat?.type === 'private' && typeof msg.text === 'string' && /^\/(start|menu)(@\w+)?( miniapp)?$/.test(msg.text.trim())) {
    await telegram('sendMessage', {
      chat_id: msg.chat.id,
      text: '👋 RestaurantFoods’ga xush kelibsiz!\n\nRestoranlar, 3D stol va menyuni Telegram’dan chiqmasdan oching — kirish avtomatik, kod so‘ralmaydi. Yoki shu chatning o‘zida ko‘ring:',
      reply_markup: mainMenu(),
    });
    return 'menu';
  }
  const cb = update?.callback_query;
  if (typeof cb?.data !== 'string' || !cb.data.startsWith('m:') || !cb.message) return null;
  await telegram('answerCallbackQuery', { callback_query_id: cb.id });
  if (cb.message.chat?.type && cb.message.chat.type !== 'private') return 'menu_not_private';
  const chatId = String(cb.message.chat.id),
    [, op, ...rest] = cb.data.split(':'),
    arg = rest.join(':');
  const offset = Math.max(0, Math.min(1000, Number(arg) || 0));
  if (op === 'r') return restaurants(chatId, offset);
  if (op === 't') return freeTables(chatId, arg);
  if (op === 'm') return menu(chatId, arg);
  if (op === 'f') return flowers(chatId, offset);
  if (op === 'b') return bookings(chatId);
  return 'menu_unknown';
}

/** The pass as a PNG picture (black on white, quiet zone), drawn here: no outside QR service sees the code. */
export async function qrPng(text: string, scale = 8, margin = 4) {
  const q = qrcode(0, 'M');
  q.addData(text);
  q.make();
  const n = q.getModuleCount(),
    size = (n + margin * 2) * scale,
    raw = new Uint8Array((size + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size + 1),
      my = Math.floor(y / scale) - margin;
    for (let x = 0; x < size; x++) {
      const mx = Math.floor(x / scale) - margin;
      raw[row + 1 + x] = mx >= 0 && my >= 0 && mx < n && my < n && q.isDark(my, mx) ? 0 : 255;
    }
  }
  const stream = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'));
  const idat = new Uint8Array(await new Response(stream).arrayBuffer());
  const ihdr = new Uint8Array(13);
  new DataView(ihdr.buffer).setUint32(0, size);
  new DataView(ihdr.buffer).setUint32(4, size);
  ihdr.set([8, 0, 0, 0, 0], 8); // 8-bit greyscale
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}
const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function chunk(type: string, data: Uint8Array) {
  const out = new Uint8Array(12 + data.length),
    view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  let c = 0xffffffff;
  for (let i = 4; i < 8 + data.length; i++) c = CRC[(c ^ out[i]) & 0xff] ^ (c >>> 8);
  view.setUint32(8 + data.length, (c ^ 0xffffffff) >>> 0);
  return out;
}

async function sendPng(chatId: string, png: Uint8Array, caption: string, reply_markup: unknown) {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return false;
  const form = new FormData();
  form.set('chat_id', chatId);
  form.set('caption', caption);
  form.set('parse_mode', 'HTML');
  form.set('reply_markup', JSON.stringify(reply_markup));
  form.set('photo', new Blob([png as Uint8Array<ArrayBuffer>], { type: 'image/png' }), 'qr.png');
  try {
    const res = await fetch('https://api.telegram.org/bot' + token + '/sendPhoto', { method: 'POST', body: form, signal: AbortSignal.timeout(10000) });
    return !!((await res.json()) as { ok?: boolean }).ok;
  } catch {
    console.error(JSON.stringify({ event: 'telegram_unreachable', method: 'sendPhoto' }));
    return false;
  }
}

/** Admin: the chat's menu button opens the Mini App, and the bot lists its commands. */
export async function setupMiniApp() {
  const [button, commands] = await Promise.all([
    telegram('setChatMenuButton', { menu_button: { type: 'web_app', text: '🍽️ Stol Bron & Menyu', web_app: { url: miniAppUrl() } } }),
    telegram('setMyCommands', { commands: [{ command: 'start', description: 'Bosh menyu' }, { command: 'menu', description: 'Restoranlar, gullar va bronlarim' }] }),
  ]);
  return { menuButton: button === true, commands: commands === true, url: miniAppUrl() };
}
