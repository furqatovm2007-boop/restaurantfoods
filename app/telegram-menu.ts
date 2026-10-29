import { env } from 'cloudflare:workers';
import qrcode from 'qrcode-generator';
import { telegram, html, site, mainKeyboard } from './telegram';
import { ensurePassCode, PASS_PREFIX, receiptNumber } from './booking-pass';
import { liveTables, freeNow } from './live-tables';
import { countedReview } from './review-rules';
import { BOT, COMMANDS_BY_LANG, LANG_PICKER, chatLang, isLang, keySection, setChatLang, type BotText, type Lang } from './bot-i18n';

/*
 * The bot's own menu, for customers who prefer to stay in the chat:
 *  /start (or /menu) shows the Mini App button (the whole site inside Telegram) and quick views answered in
 *  the chat itself: restaurants (photo, rating, tables free right now), a restaurant's free tables and
 *  menu, the flower catalogue, and the customer's active bookings with their QR pass as a picture.
 * Commands (/restaurants, /menu, /flowers, /mybookings, /ai, /profile, /language) and the same sections
 * from the persistent keyboard next to 📎 (plain text labels, app/telegram.ts) open the section at once.
 * Everything is in the chat's language (Uzbek, Russian or English, app/bot-i18n.ts); the Mini App opens in
 * the same language (?lang=).
 * Booking, ordering and paying always happen in the Mini App (online deposit, the phone, the rules), never
 * from a chat button. Demo restaurants are not listed. Only private chats get the menu.
 */
const PAGE = 5;
export const miniAppUrl = (go = '', l: Lang = 'uz') => site() + '/?source=tg_miniapp&lang=' + l + (go ? '&go=' + encodeURIComponent(go) : '');
const openButton = (text: string, l: Lang, go = '') => ({ text, web_app: { url: miniAppUrl(go, l) } });
const money = (n: unknown, t: BotText) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + t.sum;
const photoUrl = (u: unknown) => {
  const v = String(u || '').trim();
  return /^https:\/\/[^\s]+$/.test(v) ? v : /^\/[^\s/][^\s]*$/.test(v) ? site() + v : '';
};
// Same visibility rule as the public flower catalogue (app/api/flowers).
const FLOWERS_PUBLIC = "f.active=1 AND f.status='active' AND f.is_approved=1 AND f.in_stock=1 AND COALESCE(a.status,'active')<>'suspended' AND COALESCE(a.role,'admin') IN ('florist','admin')";

export const mainMenu = (l: Lang = 'uz') => {
  const t = BOT[l];
  return {
    inline_keyboard: [[openButton(t.openApp, l)], [{ text: t.list, callback_data: 'm:r:0' }], [{ text: t.flowersCatalog, callback_data: 'm:f:0' }], [{ text: t.myBookings, callback_data: 'm:b' }]],
  };
};

/** A card with a photo when there is one (and Telegram can fetch it), else a plain message. */
async function card(chatId: string, image: string, text: string, reply_markup: unknown) {
  if (image && (await telegram('sendPhoto', { chat_id: chatId, photo: image, caption: text.slice(0, 1024), parse_mode: 'HTML', reply_markup }))) return;
  await telegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup, link_preview_options: { is_disabled: true } });
}

/*
 * Restaurants step by step, so a booking never lands at the wrong place:
 *  1. the list (name, district / address, rating, tables free now), one button per restaurant;
 *  2. the chosen restaurant's card: "🪑 Shu restoran stollarini ko‘rish va Bron qilish" opens the Mini App with
 *     ?restaurant_id=ID&action=book (that restaurant's booking room only), "📖 Menyu", "⬅️ Orqaga";
 *  3. the booking room shows "📍 Siz tanlagan restoran: …" and accepts only that restaurant's tables (the
 *     server checks the table id and number against the restaurant too).
 */
const LIST_PAGE = 8;
export const bookUrl = (id: string, l: Lang = 'uz') => site() + '/?source=tg_miniapp&lang=' + l + '&restaurant_id=' + encodeURIComponent(id) + '&action=book';
const bookButton = (id: string, l: Lang, text = BOT[l].book) => ({ text, web_app: { url: bookUrl(id, l) } });
const backToList = (t: BotText) => ({ text: t.back, callback_data: 'm:r:0' });
const RESTAURANT_SQL =
  "SELECT r.id,r.name,r.address,r.city,r.cuisine,r.image_url,r.booking_open,r.booking_close,(SELECT AVG(stars) FROM reviews WHERE restaurant_id=r.id AND " +
  countedReview('reviews', 'r') +
  ') AS rating,(SELECT COUNT(*) FROM reviews WHERE restaurant_id=r.id AND ' +
  countedReview('reviews', 'r') +
  ") AS review_count FROM restaurants r WHERE r.status='active' AND COALESCE(r.is_demo,0)=0";
const place = (r: any) => [r.city, r.address].filter(Boolean).join(', ');

async function restaurants(chatId: string, offset: number, l: Lang) {
  const t = BOT[l];
  const rows = (await env.DB!.prepare(RESTAURANT_SQL + ' ORDER BY r.name LIMIT ? OFFSET ?').bind(LIST_PAGE + 1, offset).all<any>()).results;
  if (!rows.length) {
    await telegram('sendMessage', { chat_id: chatId, text: offset ? t.noMoreRestaurants : t.noRestaurants, reply_markup: mainMenu(l) });
    return 'menu_restaurants_empty';
  }
  const live = await liveTables(),
    shown = rows.slice(0, LIST_PAGE);
  const lines = shown.map((r: any, i: number) => {
    const f = freeNow(live, r.id, r.booking_open, r.booking_close);
    const free = !f.total ? '' : f.free == null ? ' · ' + t.closed : ' · ' + t.freeShort(f.free);
    return `${offset + i + 1}. <b>${html(r.name)}</b>${place(r) ? ' — 📍 ' + html(place(r)) : ''}\n    ${r.review_count ? '⭐ ' + Number(r.rating).toFixed(1) : '⭐ —'}${free}`;
  });
  const buttons = shown.map((r: any) => {
    const f = freeNow(live, r.id, r.booking_open, r.booking_close);
    const label = `🏢 ${r.name}${r.review_count ? ' · ⭐' + Number(r.rating).toFixed(1) : ''}${f.free != null && f.total ? ' · 🪑' + f.free : ''}`;
    return [{ text: label.length > 60 ? label.slice(0, 59) + '…' : label, callback_data: 'm:c:' + r.id }];
  });
  const nav = [...(offset ? [{ text: t.prev, callback_data: 'm:r:' + Math.max(0, offset - LIST_PAGE) }] : []), ...(rows.length > LIST_PAGE ? [{ text: t.next, callback_data: 'm:r:' + (offset + LIST_PAGE) }] : [])];
  await telegram('sendMessage', {
    chat_id: chatId,
    text: `${t.pick}\n\n${lines.join('\n')}`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [...buttons, ...(nav.length ? [nav] : [])] },
  });
  return 'menu_restaurants';
}

/** Step 2: one restaurant's card with its own booking button and the way back to the list. */
async function restaurantCard(chatId: string, id: string, l: Lang) {
  const t = BOT[l];
  const r = await env.DB!.prepare(RESTAURANT_SQL + ' AND r.id=?').bind(id).first<any>();
  if (!r) return gone(chatId, l);
  const f = freeNow(await liveTables(), r.id, r.booking_open, r.booking_close);
  const rating = r.review_count ? t.rating(Number(r.rating).toFixed(1), r.review_count) : t.noRating;
  const tables = !f.total ? t.noTables : f.free == null ? t.closedNow : t.freeNow(f.free, f.total);
  const text = [`🏢 <b>${html(r.name)}</b>`, place(r) ? '📍 ' + html(place(r)) : '', rating, tables, r.cuisine ? '🍴 ' + html(r.cuisine) : ''].filter(Boolean).join('\n');
  await card(chatId, photoUrl(r.image_url), text, { inline_keyboard: [[bookButton(r.id, l)], [{ text: t.menuBtn, callback_data: 'm:m:' + r.id }, { text: t.freeBtn, callback_data: 'm:t:' + r.id }], [backToList(t)]] });
  return 'menu_restaurant';
}

async function activeRestaurant(id: string) {
  return env.DB!.prepare("SELECT id,name,booking_open,booking_close FROM restaurants WHERE id=? AND status='active' AND COALESCE(is_demo,0)=0").bind(id).first<{ id: string; name: string; booking_open: string; booking_close: string }>();
}

async function freeTables(chatId: string, id: string, l: Lang) {
  const t = BOT[l];
  const r = await activeRestaurant(id);
  if (!r) return gone(chatId, l);
  const [live, tables] = await Promise.all([liveTables(), env.DB!.prepare('SELECT number,seats,floor FROM restaurant_tables WHERE restaurant_id=? AND active=1 ORDER BY floor,number').bind(id).all<{ number: number; seats: number; floor: number }>()]);
  const f = freeNow(live, id, r.booking_open, r.booking_close),
    busy = live.busy.get(id) || new Set<number>();
  const free = tables.results.filter((x) => !busy.has(Number(x.number)));
  const lines = f.free == null ? [f.total ? t.closedLong : t.tablesMissing] : free.length ? free.slice(0, 30).map((x) => t.tableLine(x.number, x.seats, Number(x.floor))) : [t.noFree];
  await telegram('sendMessage', {
    chat_id: chatId,
    text: `${t.freeTitle(html(r.name), live.hhmm)}\n${lines.join('\n')}${free.length > 30 ? '\n' + t.more(free.length - 30) : ''}\n\n${t.leadNote}`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [[bookButton(id, l, t.bookHere)], [{ text: t.backToRestaurant, callback_data: 'm:c:' + id }, backToList(t)]] },
  });
  return 'menu_tables';
}

async function menu(chatId: string, id: string, l: Lang) {
  const t = BOT[l];
  const r = await activeRestaurant(id);
  if (!r) return gone(chatId, l);
  const items = (await env.DB!.prepare("SELECT name,price,COALESCE(category,'') AS category FROM menu WHERE restaurant_id=? AND available=1 AND COALESCE(is_demo,0)=0 ORDER BY category,name LIMIT 60").bind(id).all<{ name: string; price: number; category: string }>()).results;
  let text = t.menuTitle(html(r.name)) + '\n';
  let last: string | null = null,
    shown = 0;
  for (const m of items) {
    const head = m.category && m.category !== last ? `\n<b>${html(m.category)}</b>\n` : '';
    const line = `${head}• ${html(m.name)} — ${money(m.price, t)}\n`;
    if (text.length + line.length > 3500) break;
    text += line;
    last = m.category;
    shown++;
  }
  if (!items.length) text += '\n' + t.menuEmpty;
  else if (shown < items.length) text += '\n' + t.menuMore;
  await telegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[openButton(t.menu3d, l, '/restaurant/' + id)], [bookButton(id, l, t.bookHere)], [{ text: t.backToRestaurant, callback_data: 'm:c:' + id }, backToList(t)]] } });
  return 'menu_dishes';
}

async function flowers(chatId: string, offset: number, l: Lang) {
  const t = BOT[l];
  const rows = (await env.DB!.prepare("SELECT f.title,f.kind,f.size,f.price,f.image_url,COALESCE(a.name,'RestaurantFoods') AS florist_name FROM flowers f LEFT JOIN accounts a ON a.id=f.florist_id WHERE " + FLOWERS_PUBLIC + ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?').bind(PAGE + 1, offset).all<any>()).results;
  if (!rows.length) {
    await telegram('sendMessage', { chat_id: chatId, text: offset ? t.noMoreFlowers : t.noFlowers, reply_markup: mainMenu(l) });
    return 'menu_flowers_empty';
  }
  for (const f of rows.slice(0, PAGE)) {
    const text = [`💐 <b>${html(f.title)}</b>`, [f.kind, f.size].filter(Boolean).map(html).join(' · '), '💰 ' + money(f.price, t), '🌸 ' + html(f.florist_name)].filter(Boolean).join('\n');
    await card(chatId, photoUrl(f.image_url), text, { inline_keyboard: [[openButton(t.addFlowers, l, '/flowers')]] });
  }
  if (rows.length > PAGE) await telegram('sendMessage', { chat_id: chatId, text: t.moreFlowers, reply_markup: { inline_keyboard: [[{ text: t.next, callback_data: 'm:f:' + (offset + PAGE) }]] } });
  return 'menu_flowers';
}

async function bookings(chatId: string, l: Lang) {
  const t = BOT[l];
  const acc = await env.DB!.prepare('SELECT id FROM accounts WHERE telegram_chat_id=?').bind(chatId).first<{ id: string }>();
  if (!acc) return (await signIn(chatId, '/bookings', t.bookingsSignIn, l)) && 'menu_bookings_signin';
  const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
  const rows = (await env.DB!.prepare("SELECT b.id,b.date,b.slot,b.end_slot,b.table_number,b.guests,b.status,b.pass_code,r.name AS restaurant_name FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id WHERE b.user_id=? AND b.status IN ('pending','confirmed') AND b.date>=? ORDER BY b.date,b.slot LIMIT 3").bind(acc.id, today).all<any>()).results;
  if (!rows.length) {
    await telegram('sendMessage', { chat_id: chatId, text: t.noBookings, reply_markup: { inline_keyboard: [[openButton(t.bookTable, l)]] } });
    return 'menu_bookings_empty';
  }
  for (const b of rows) {
    const code = await ensurePassCode(b.id, b.pass_code);
    const caption = [`🧾 <b>${html(b.restaurant_name)}</b> · ${receiptNumber(b)}`, `📅 ${b.date} · ${b.slot}${b.end_slot ? '–' + b.end_slot : ''}`, t.table(b.table_number, b.guests), b.status === 'confirmed' ? t.confirmed : t.waiting, '', t.showQr].join('\n');
    const keyboard = { inline_keyboard: [[openButton(t.openReceipt, l, '/bookings')]] };
    if (!code || !(await sendPng(chatId, await qrPng(PASS_PREFIX + code), caption, keyboard))) await telegram('sendMessage', { chat_id: chatId, text: caption + (code ? `\n\n${t.code}: <code>${code}</code>` : ''), parse_mode: 'HTML', reply_markup: keyboard });
  }
  return 'menu_bookings';
}

async function menuPicker(chatId: string, l: Lang) {
  const t = BOT[l];
  const rows = (await env.DB!.prepare("SELECT id,name FROM restaurants WHERE status='active' AND COALESCE(is_demo,0)=0 ORDER BY name LIMIT 20").all<{ id: string; name: string }>()).results;
  await telegram('sendMessage', {
    chat_id: chatId,
    text: rows.length ? t.whichMenu : t.noRestaurants,
    reply_markup: { inline_keyboard: [...rows.map((r) => [{ text: '📖 ' + r.name.slice(0, 50), callback_data: 'm:m:' + r.id }]), [openButton(t.menuApp, l)]] },
  });
  return 'menu_picker';
}

async function assistant(chatId: string, l: Lang) {
  const t = BOT[l];
  await telegram('sendMessage', { chat_id: chatId, text: t.ai, reply_markup: { inline_keyboard: [[openButton(t.aiOpen, l, '/discover')]] } });
  return 'menu_ai';
}

const maskPhone = (p: string) => (/^\+998\d{9}$/.test(p) ? `+998 ${p.slice(4, 6)} *** ** ${p.slice(11)}` : '');
async function profile(chatId: string, l: Lang) {
  const t = BOT[l];
  const a = await env.DB!.prepare('SELECT id,name,contact_phone,contact_phone_verified,birth_date FROM accounts WHERE telegram_chat_id=?').bind(chatId).first<{ id: string; name: string; contact_phone: string; contact_phone_verified: number; birth_date: string | null }>();
  if (!a) return signIn(chatId, '/account', t.profileSignIn, l);
  const birth = a.birth_date && /^\d{4}-\d{2}-\d{2}$/.test(a.birth_date) ? t.birthday(`${a.birth_date.slice(8, 10)}.${a.birth_date.slice(5, 7)}`) : t.noBirthday;
  const phone = a.contact_phone_verified && maskPhone(a.contact_phone) ? '📱 ' + maskPhone(a.contact_phone) + ' ✅' : t.phoneUnverified;
  await telegram('sendMessage', { chat_id: chatId, text: `👤 <b>${html(a.name || t.customer)}</b>\n${phone}\n${birth}`, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[openButton(t.profileOpen, l, '/account')]] } });
  return 'menu_profile';
}

async function signIn(chatId: string, go: string, text: string, l: Lang) {
  await telegram('sendMessage', { chat_id: chatId, text, reply_markup: { inline_keyboard: [[openButton(BOT[l].openMiniApp, l, go)]] } });
  return 'menu_signin';
}

async function welcome(chatId: string, l: Lang) {
  // The persistent keyboard comes with the greeting, then the language choice and the inline menu.
  await telegram('sendMessage', { chat_id: chatId, text: BOT[l].welcome, reply_markup: mainKeyboard(l) });
  await telegram('sendMessage', { chat_id: chatId, ...LANG_PICKER });
  await telegram('sendMessage', { chat_id: chatId, text: BOT[l].welcomeMore, reply_markup: mainMenu(l) });
  return 'menu';
}

/** 🇺🇿 / 🇷🇺 / 🇬🇧 tapped: saved for the chat and the linked account, then the keyboard and menu in that language. */
async function chooseLanguage(chatId: string, l: Lang, messageId?: number) {
  await setChatLang(chatId, l);
  if (messageId) await telegram('editMessageText', { chat_id: chatId, message_id: messageId, text: BOT[l].langSaved });
  await telegram('sendMessage', { chat_id: chatId, text: BOT[l].welcome, reply_markup: mainKeyboard(l) });
  await telegram('sendMessage', { chat_id: chatId, text: BOT[l].welcomeMore, reply_markup: mainMenu(l) });
  return 'menu_language_' + l;
}

async function gone(chatId: string, l: Lang) {
  await telegram('sendMessage', { chat_id: chatId, text: BOT[l].gone, reply_markup: mainMenu(l) });
  return 'menu_gone';
}

/** Menu messages and buttons of a private chat; null for every other update (handled by app/telegram.ts). */
export async function handleMenu(update: any): Promise<string | null> {
  const msg = update?.message;
  if (msg?.chat?.type === 'private' && typeof msg.text === 'string') {
    const chatId = String(msg.chat.id),
      text = msg.text.trim();
    const command = /^\/([a-z]+)(@\w+)?(\s+miniapp)?$/i.exec(text)?.[1]?.toLowerCase();
    const section = keySection(text);
    if (!command && !section && text.startsWith('/')) return null;
    const l = await chatLang(chatId);
    if (command === 'start') return welcome(chatId, l);
    if (command === 'language' || section === 'language') {
      await telegram('sendMessage', { chat_id: chatId, ...LANG_PICKER });
      return 'menu_language';
    }
    if (command === 'restaurants' || command === 'book' || section === 'restaurants') return restaurants(chatId, 0, l);
    if (command === 'menu' || section === 'menu') return menuPicker(chatId, l);
    if (command === 'flowers' || section === 'flowers') return flowers(chatId, 0, l);
    if (command === 'mybookings' || section === 'bookings') return bookings(chatId, l);
    if (command === 'ai' || section === 'ai') return assistant(chatId, l);
    if (command === 'profile' || section === 'profile') return profile(chatId, l);
    // Anything else typed (not a command with a code, not /stop): the menu comes back with a short hint.
    if (!text.startsWith('/')) {
      await telegram('sendMessage', { chat_id: chatId, text: BOT[l].hint, reply_markup: mainKeyboard(l) });
      return 'menu_hint';
    }
    return null;
  }
  const cb = update?.callback_query;
  if (typeof cb?.data !== 'string' || !cb.data.startsWith('m:') || !cb.message) return null;
  await telegram('answerCallbackQuery', { callback_query_id: cb.id });
  if (cb.message.chat?.type && cb.message.chat.type !== 'private') return 'menu_not_private';
  const chatId = String(cb.message.chat.id),
    [, op, ...rest] = cb.data.split(':'),
    arg = rest.join(':');
  if (op === 'l') return isLang(arg) ? chooseLanguage(chatId, arg, cb.message.message_id) : 'menu_unknown';
  const l = await chatLang(chatId);
  const offset = Math.max(0, Math.min(1000, Number(arg) || 0));
  if (op === 'r') return restaurants(chatId, offset, l);
  if (op === 'c') return restaurantCard(chatId, arg, l);
  if (op === 't') return freeTables(chatId, arg, l);
  if (op === 'm') return menu(chatId, arg, l);
  if (op === 'f') return flowers(chatId, offset, l);
  if (op === 'b') return bookings(chatId, l);
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

export const COMMANDS = COMMANDS_BY_LANG.uz;
/**
 * The bot's commands for everyone (default scope, Uzbek; Russian and English for Telegram apps in those
 * languages) and the menu button left of the input field as the commands list, so old and new users alike
 * see /start, /restaurants… (the Mini App is the first key of the keyboard and the inline buttons).
 * setChatMenuButton without chat_id changes the default for all chats.
 */
export async function setupMiniApp() {
  const [button, commands, ru, en] = await Promise.all([
    telegram('setChatMenuButton', { menu_button: { type: 'commands' } }),
    telegram('setMyCommands', { commands: COMMANDS, scope: { type: 'default' } }),
    telegram('setMyCommands', { commands: COMMANDS_BY_LANG.ru, scope: { type: 'default' }, language_code: 'ru' }),
    telegram('setMyCommands', { commands: COMMANDS_BY_LANG.en, scope: { type: 'default' }, language_code: 'en' }),
  ]);
  return { menuButton: button === true, commands: commands === true && ru === true && en === true, url: miniAppUrl() };
}

/*
 * Once per release of the bot menu (cron, every 5 minutes, see build/sites-worker.ts):
 *  1. the commands and the menu button are set (again only when SETUP_VERSION changes);
 *  2. every account with a linked Telegram chat gets one message with the new persistent keyboard, a
 *     batch per run (Telegram allows ~30 messages a second; the batch stays far below that and below
 *     the Worker's subrequest limit). Progress is kept in app_settings so nobody gets it twice; chats that
 *     unlinked themselves (/stop) are not linked any more and are skipped, as are suspended accounts.
 */
const SETUP_VERSION = '3';
export const SYNC_KEY = 'tg:sync-old-users:v1';
export const SYNC_TEXT = '✨ Yangilanish! Endi restoranlarni ko‘rish, 3D stol bron qilish va menyu bevosita Telegram ichida ishlaydi! Pastdagi tugmalardan foydalaning 👇';
const setting = async (key: string) => (await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key).first<{ value: string }>())?.value ?? null;
const saveSetting = (key: string, value: string) =>
  env.DB!.prepare('INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at,updated_by=excluded.updated_by').bind(key, value, new Date().toISOString(), 'bot').run();

export async function ensureBotSetup() {
  if ((await setting('tg:setup')) === SETUP_VERSION) return { already: true };
  const r = await setupMiniApp();
  if (r.menuButton && r.commands) await saveSetting('tg:setup', SETUP_VERSION);
  return r;
}

interface SyncState {
  after: string;
  sent: number;
  failed: number;
  finished: boolean;
}
export async function syncOldUsers(limit = 40): Promise<SyncState> {
  let state: SyncState = { after: '', sent: 0, failed: 0, finished: false };
  try {
    state = { ...state, ...JSON.parse((await setting(SYNC_KEY)) || '{}') };
  } catch {}
  if (state.finished) return state;
  const rows = (await env.DB!.prepare("SELECT id,telegram_chat_id AS chat FROM accounts WHERE telegram_chat_id IS NOT NULL AND telegram_chat_id<>'' AND COALESCE(status,'active')<>'suspended' AND id>? ORDER BY id LIMIT ?").bind(state.after, limit).all<{ id: string; chat: string }>()).results;
  // The batch is claimed before sending, so an overlapping run never messages the same people.
  const claimed: SyncState = { ...state, after: rows.length ? rows[rows.length - 1].id : state.after, finished: rows.length < limit };
  await saveSetting(SYNC_KEY, JSON.stringify(claimed));
  let sent = 0,
    failed = 0;
  for (const r of rows) {
    if (!/^\d{1,15}$/.test(r.chat)) continue; // private chats only
    (await telegram('sendMessage', { chat_id: r.chat, text: SYNC_TEXT, reply_markup: mainKeyboard() })) ? sent++ : failed++;
    await new Promise((ok) => setTimeout(ok, 60));
  }
  const done: SyncState = { ...claimed, sent: state.sent + sent, failed: state.failed + failed };
  await saveSetting(SYNC_KEY, JSON.stringify(done));
  return done;
}

/** Cron: the bot setup and the one-time announcement, each only until it is done. */
export async function runBotSync() {
  if (!env.TELEGRAM_BOT_TOKEN?.trim()) return null;
  await ensureBotSetup();
  return syncOldUsers();
}
