import { env } from 'cloudflare:workers';

/*
 * The customer bot in three languages (Uzbek, Russian, English).
 *  - The chat's language is chosen with /start, /language or the "🌐 Til / Язык / Language" key (inline
 *    🇺🇿 / 🇷🇺 / 🇬🇧 buttons). It is kept per chat ('tglang:<chat>' in app_settings, so it also works before
 *    the chat is linked to an account) and copied to the linked account's preferred_language, which the
 *    site and Call AI use. Changing the language on the site copies it back to the linked chat.
 *  - A chat that never chose gets Uzbek, as before.
 *  - The persistent keyboard's labels are per language; a tap is recognised in any language (and the
 *    labels of the earlier keyboard, still shown in old chats).
 * Restaurant staff messages (new bookings, Call AI reports) stay in Uzbek.
 */
export type Lang = 'uz' | 'ru' | 'en';
export const LANGS: Lang[] = ['uz', 'ru', 'en'];
export const normLang = (v: unknown): Lang => (v === 'ru' || v === 'en' ? v : 'uz');
export const isLang = (v: unknown): v is Lang => v === 'uz' || v === 'ru' || v === 'en';
export const LANG_KEY = '🌐 Til / Язык / Language';
export const LANG_PICKER = {
  text: '🌐 Tilni tanlang / Выберите язык / Choose your language:',
  reply_markup: { inline_keyboard: [[{ text: '🇺🇿 O‘zbekcha', callback_data: 'm:l:uz' }, { text: '🇷🇺 Русский', callback_data: 'm:l:ru' }, { text: '🇬🇧 English', callback_data: 'm:l:en' }]] },
};

const key = (chatId: string | number) => 'tglang:' + chatId;
/** The chat's language: the one chosen in the bot (or on the site by the linked account), else Uzbek. */
export async function chatLang(chatId: string | number): Promise<Lang> {
  const row = await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key(chatId)).first<{ value: string }>();
  return normLang(row?.value);
}
/** Whether this chat has chosen a language yet. */
export const langChosen = async (chatId: string | number) => !!(await env.DB!.prepare('SELECT 1 FROM app_settings WHERE key=?').bind(key(chatId)).first());
const saveLang = (chatId: string | number, l: Lang, by: string) =>
  env.DB!.prepare('INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at,updated_by=excluded.updated_by').bind(key(chatId), l, new Date().toISOString(), by).run();
/** Chosen in the bot: the chat and its linked account (preferred_language, used by the site and Call AI). */
export async function setChatLang(chatId: string | number, l: Lang) {
  await saveLang(chatId, l, 'bot');
  await env.DB!.prepare('UPDATE accounts SET preferred_language=? WHERE telegram_chat_id=?').bind(l, String(chatId)).run();
}
/** Chosen on the site: the account's linked chat follows. */
export async function syncAccountLang(userId: string, l: Lang) {
  const a = await env.DB!.prepare('SELECT telegram_chat_id AS chat FROM accounts WHERE id=?').bind(userId).first<{ chat: string | null }>();
  if (a?.chat) await saveLang(a.chat, l, userId);
}

/** Labels of the persistent keyboard. */
export const KEY_LABELS: Record<Lang, { app: string; restaurants: string; menu: string; flowers: string; bookings: string; ai: string; profile: string }> = {
  uz: { app: '🚀 Mini App: 3D stol va bron', restaurants: '🍽️ Restoranlar', menu: '📖 Menyu', flowers: '💐 Gullar', bookings: '📅 Bronlarim', ai: '🤖 AI Yordamchi', profile: '👤 Profilim' },
  ru: { app: '🚀 Mini App: 3D-зал и бронь', restaurants: '🍽️ Рестораны', menu: '📖 Меню', flowers: '💐 Цветы', bookings: '📅 Мои брони', ai: '🤖 ИИ Помощник', profile: '👤 Профиль' },
  en: { app: '🚀 Mini App: 3D tables & booking', restaurants: '🍽️ Restaurants', menu: '📖 Menu', flowers: '💐 Flowers', bookings: '📅 My Bookings', ai: '🤖 AI Assistant', profile: '👤 My profile' },
};
// The earlier (Uzbek only) keyboard, still shown in chats that have not pressed anything since.
const LEGACY: Record<string, Section> = { '🏢 Restoranlar ro‘yxati': 'restaurants', '🍽️ Stol Bron qilish': 'restaurants', '📅 Bronlarim va QR': 'bookings' };
export type Section = 'restaurants' | 'menu' | 'flowers' | 'bookings' | 'ai' | 'profile' | 'language';
/** The section a keyboard tap asks for, in any language; null for other text. */
export function keySection(text: string): Section | null {
  if (text === LANG_KEY) return 'language';
  if (LEGACY[text]) return LEGACY[text];
  for (const l of LANGS) for (const [k, v] of Object.entries(KEY_LABELS[l])) if (k !== 'app' && v === text) return k as Section;
  return null;
}

/** The bot's texts. `{n}` style values are passed as function arguments. */
export const BOT = {
  uz: {
    langSaved: '✅ Til saqlandi: O‘zbekcha',
    welcome: '👋 RestaurantFoods’ga xush kelibsiz! Pastdagi tugmalar doim shu yerda turadi 👇',
    welcomeMore: 'Restoranlar, 3D stol va menyuni Telegram’dan chiqmasdan oching — kirish avtomatik, kod so‘ralmaydi. Yoki shu chatning o‘zida ko‘ring:',
    hint: 'Pastdagi tugmalardan birini tanlang 👇 yoki /start ni bosing.',
    openApp: '🍽️ Restoranlar, 3D Stol va Menyu (Ochish)',
    list: '🏢 Restoranlar ro‘yxati',
    flowersCatalog: '💐 Gullar katalogi',
    myBookings: '📅 Mening bronlarim va QR-Chek',
    noMoreRestaurants: 'Boshqa restoran yo‘q.',
    noRestaurants: 'Hozircha faol restoran yo‘q.',
    closed: '🌙 yopiq',
    freeShort: (n: number) => `🪑 ${n} bo‘sh`,
    pick: '🍽️ <b>Restoranni tanlang</b> — bron faqat siz tanlagan restoranga qilinadi:',
    prev: '⬅️ Oldingi',
    next: '➡️ Keyingi',
    book: '🪑 Shu restoran stollarini ko‘rish va Bron qilish',
    bookHere: '🪑 Shu restoranda stol bron qilish',
    back: '⬅️ Orqaga (Barcha restoranlar)',
    backToRestaurant: '⬅️ Restoranga qaytish',
    rating: (r: string, n: number) => `⭐ ${r} (${n} ta baho)`,
    noRating: '⭐ Hali baho yo‘q',
    noTables: '🪑 Stollar hali kiritilmagan',
    closedNow: '🪑 Hozir yopiq',
    freeNow: (f: number, t: number) => `🪑 Hozir bo‘sh stollar: <b>${f}</b> / ${t}`,
    menuBtn: '📖 Menyu',
    freeBtn: '🪑 Bo‘sh stollar',
    closedLong: 'Restoran hozir yopiq. Bronni ochiq vaqtga qilishingiz mumkin.',
    tablesMissing: 'Stollar hali kiritilmagan.',
    tableLine: (n: number, s: number, f: number) => `• ${n}-stol · ${s} o‘rin${f > 1 ? ` · ${f}-qavat` : ''}`,
    noFree: 'Hozir bo‘sh stol yo‘q. Keyingi vaqtga bron qilishingiz mumkin.',
    freeTitle: (name: string, hhmm: string) => `🪑 <b>${name}</b> — hozir bo‘sh stollar (${hhmm}):`,
    more: (n: number) => `… yana ${n} ta`,
    leadNote: 'Onlayn bron kamida 1 soat oldin qilinadi.',
    menuTitle: (name: string) => `📖 <b>${name}</b> — menyu`,
    menuEmpty: 'Menyu hali kiritilmagan.',
    menuMore: '… to‘liq menyu Mini App’da.',
    menu3d: '📖 3D menyuni ochish va buyurtma',
    noMoreFlowers: 'Boshqa guldasta yo‘q.',
    noFlowers: 'Hozircha sotuvda guldasta yo‘q.',
    addFlowers: '💐 Stolga qo‘shish',
    moreFlowers: 'Yana guldastalar bor:',
    bookingsSignIn: 'Bronlaringizni ko‘rish uchun Mini App’ni oching — Telegram orqali avtomatik kirasiz.',
    noBookings: 'Faol broningiz yo‘q.',
    bookTable: '🍽️ Stol bron qilish',
    table: (n: number, g: number) => `🪑 ${n}-stol · ${g} kishi`,
    confirmed: '✅ Tasdiqlangan',
    waiting: '⏳ Restoran tasdig‘ini kutmoqda',
    showQr: 'QR-kodni eshikda xodimga ko‘rsating.',
    openReceipt: '🧾 Chekni ochish',
    code: 'Kod',
    whichMenu: '📖 Qaysi restoran menyusini ko‘rasiz?',
    menuApp: '🍽️ 3D menyu (Mini App)',
    ai: '🤖 AI yordamchi Mini App ichida ishlaydi: oching va pastki burchakdagi 🤖 tugmasini bosing.\nU restoran, taom va bo‘sh vaqt tanlashda maslahat beradi. Buyurtma, bron va to‘lovni o‘zi qilmaydi — ularni siz tasdiqlaysiz.',
    aiOpen: '🤖 AI yordamchini ochish',
    profileSignIn: 'Profilingizni ko‘rish uchun Mini App’ni oching — Telegram orqali avtomatik kirasiz.',
    birthday: (d: string) => `🎂 Tug‘ilgan kun: ${d} — o‘sha kuni aksiyadagi restoranlarda 15% chegirma.`,
    noBirthday: '🎂 Tug‘ilgan kuningizni kiriting — o‘sha kuni aksiyadagi restoranlarda 15% chegirma olasiz.',
    phoneUnverified: '📱 Raqam tasdiqlanmagan — Mini App’da 1 bosishda tasdiqlang.',
    customer: 'Mijoz',
    profileOpen: '👤 Profilni ochish',
    openMiniApp: '🍽️ Mini App’ni ochish',
    gone: 'Bu restoran hozir mavjud emas.',
    sum: 'so‘m',
  },
  ru: {
    langSaved: '✅ Язык сохранён: Русский',
    welcome: '👋 Добро пожаловать в RestaurantFoods! Кнопки внизу всегда под рукой 👇',
    welcomeMore: 'Откройте рестораны, 3D-зал и меню, не выходя из Telegram — вход автоматический, без кодов. Или смотрите прямо в этом чате:',
    hint: 'Выберите кнопку внизу 👇 или нажмите /start.',
    openApp: '🍽️ Рестораны, 3D-зал и меню (открыть)',
    list: '🏢 Список ресторанов',
    flowersCatalog: '💐 Каталог цветов',
    myBookings: '📅 Мои брони и QR-чек',
    noMoreRestaurants: 'Больше ресторанов нет.',
    noRestaurants: 'Пока нет активных ресторанов.',
    closed: '🌙 закрыто',
    freeShort: (n: number) => `🪑 свободно ${n}`,
    pick: '🍽️ <b>Выберите ресторан</b> — бронь оформляется только в выбранном ресторане:',
    prev: '⬅️ Назад',
    next: '➡️ Далее',
    book: '🪑 Столы этого ресторана и бронь',
    bookHere: '🪑 Забронировать стол здесь',
    back: '⬅️ Назад (все рестораны)',
    backToRestaurant: '⬅️ К ресторану',
    rating: (r: string, n: number) => `⭐ ${r} (оценок: ${n})`,
    noRating: '⭐ Оценок пока нет',
    noTables: '🪑 Столы ещё не добавлены',
    closedNow: '🪑 Сейчас закрыто',
    freeNow: (f: number, t: number) => `🪑 Свободных столов сейчас: <b>${f}</b> / ${t}`,
    menuBtn: '📖 Меню',
    freeBtn: '🪑 Свободные столы',
    closedLong: 'Ресторан сейчас закрыт. Бронь можно оформить на время работы.',
    tablesMissing: 'Столы ещё не добавлены.',
    tableLine: (n: number, s: number, f: number) => `• стол ${n} · мест: ${s}${f > 1 ? ` · ${f} этаж` : ''}`,
    noFree: 'Свободных столов сейчас нет. Можно забронировать на другое время.',
    freeTitle: (name: string, hhmm: string) => `🪑 <b>${name}</b> — свободные столы сейчас (${hhmm}):`,
    more: (n: number) => `… и ещё ${n}`,
    leadNote: 'Онлайн-бронь — минимум за 1 час.',
    menuTitle: (name: string) => `📖 <b>${name}</b> — меню`,
    menuEmpty: 'Меню ещё не добавлено.',
    menuMore: '… полное меню в Mini App.',
    menu3d: '📖 Открыть 3D-меню и заказать',
    noMoreFlowers: 'Больше букетов нет.',
    noFlowers: 'Сейчас букетов в продаже нет.',
    addFlowers: '💐 Добавить к столу',
    moreFlowers: 'Есть ещё букеты:',
    bookingsSignIn: 'Откройте Mini App, чтобы увидеть брони — вход через Telegram автоматический.',
    noBookings: 'Активных броней нет.',
    bookTable: '🍽️ Забронировать стол',
    table: (n: number, g: number) => `🪑 стол ${n} · гостей: ${g}`,
    confirmed: '✅ Подтверждена',
    waiting: '⏳ Ждёт подтверждения ресторана',
    showQr: 'Покажите QR-код сотруднику у входа.',
    openReceipt: '🧾 Открыть чек',
    code: 'Код',
    whichMenu: '📖 Меню какого ресторана показать?',
    menuApp: '🍽️ 3D-меню (Mini App)',
    ai: '🤖 ИИ-помощник работает в Mini App: откройте его и нажмите 🤖 в нижнем углу.\nОн подскажет ресторан, блюда и свободное время. Заказы, брони и оплату он не оформляет — их подтверждаете вы.',
    aiOpen: '🤖 Открыть ИИ-помощника',
    profileSignIn: 'Откройте Mini App, чтобы увидеть профиль — вход через Telegram автоматический.',
    birthday: (d: string) => `🎂 День рождения: ${d} — в этот день скидка 15% в ресторанах-участниках.`,
    noBirthday: '🎂 Укажите день рождения — в этот день получите скидку 15% в ресторанах-участниках.',
    phoneUnverified: '📱 Номер не подтверждён — подтвердите в Mini App одним нажатием.',
    customer: 'Гость',
    profileOpen: '👤 Открыть профиль',
    openMiniApp: '🍽️ Открыть Mini App',
    gone: 'Этот ресторан сейчас недоступен.',
    sum: 'сум',
  },
  en: {
    langSaved: '✅ Language saved: English',
    welcome: '👋 Welcome to RestaurantFoods! The buttons below are always here 👇',
    welcomeMore: 'Open restaurants, the 3D hall and menus without leaving Telegram — you are signed in automatically, no codes. Or browse right here in the chat:',
    hint: 'Pick one of the buttons below 👇 or tap /start.',
    openApp: '🍽️ Restaurants, 3D tables & menu (open)',
    list: '🏢 Restaurant list',
    flowersCatalog: '💐 Flower catalogue',
    myBookings: '📅 My bookings & QR receipt',
    noMoreRestaurants: 'No more restaurants.',
    noRestaurants: 'No active restaurants yet.',
    closed: '🌙 closed',
    freeShort: (n: number) => `🪑 ${n} free`,
    pick: '🍽️ <b>Choose a restaurant</b> — the booking is made only at the one you choose:',
    prev: '⬅️ Previous',
    next: '➡️ Next',
    book: '🪑 See this restaurant’s tables and book',
    bookHere: '🪑 Book a table here',
    back: '⬅️ Back (all restaurants)',
    backToRestaurant: '⬅️ Back to the restaurant',
    rating: (r: string, n: number) => `⭐ ${r} (${n} ratings)`,
    noRating: '⭐ No ratings yet',
    noTables: '🪑 Tables not added yet',
    closedNow: '🪑 Closed now',
    freeNow: (f: number, t: number) => `🪑 Free tables now: <b>${f}</b> / ${t}`,
    menuBtn: '📖 Menu',
    freeBtn: '🪑 Free tables',
    closedLong: 'The restaurant is closed now. You can book for its opening hours.',
    tablesMissing: 'Tables not added yet.',
    tableLine: (n: number, s: number, f: number) => `• table ${n} · ${s} seats${f > 1 ? ` · floor ${f}` : ''}`,
    noFree: 'No free tables right now. You can book for a later time.',
    freeTitle: (name: string, hhmm: string) => `🪑 <b>${name}</b> — free tables now (${hhmm}):`,
    more: (n: number) => `… ${n} more`,
    leadNote: 'Online bookings close 1 hour before.',
    menuTitle: (name: string) => `📖 <b>${name}</b> — menu`,
    menuEmpty: 'The menu has not been added yet.',
    menuMore: '… the full menu is in the Mini App.',
    menu3d: '📖 Open the 3D menu and order',
    noMoreFlowers: 'No more bouquets.',
    noFlowers: 'No bouquets on sale right now.',
    addFlowers: '💐 Add to my table',
    moreFlowers: 'More bouquets:',
    bookingsSignIn: 'Open the Mini App to see your bookings — you are signed in through Telegram automatically.',
    noBookings: 'You have no active bookings.',
    bookTable: '🍽️ Book a table',
    table: (n: number, g: number) => `🪑 table ${n} · ${g} guests`,
    confirmed: '✅ Confirmed',
    waiting: '⏳ Waiting for the restaurant to confirm',
    showQr: 'Show the QR code to the staff at the door.',
    openReceipt: '🧾 Open the receipt',
    code: 'Code',
    whichMenu: '📖 Which restaurant’s menu would you like to see?',
    menuApp: '🍽️ 3D menu (Mini App)',
    ai: '🤖 The AI assistant works inside the Mini App: open it and tap 🤖 in the bottom corner.\nIt helps you choose a restaurant, dishes and a free time. It never orders, books or pays by itself — you confirm those.',
    aiOpen: '🤖 Open the AI assistant',
    profileSignIn: 'Open the Mini App to see your profile — you are signed in through Telegram automatically.',
    birthday: (d: string) => `🎂 Birthday: ${d} — 15% off that day at participating restaurants.`,
    noBirthday: '🎂 Add your birthday — get 15% off that day at participating restaurants.',
    phoneUnverified: '📱 Number not verified — verify it in the Mini App with one tap.',
    customer: 'Guest',
    profileOpen: '👤 Open my profile',
    openMiniApp: '🍽️ Open the Mini App',
    gone: 'This restaurant is not available right now.',
    sum: 'UZS',
  },
};
export type BotText = (typeof BOT)['uz'];

/** Bot commands per language (setMyCommands with language_code; Uzbek is the default for everyone else). */
export const COMMANDS_BY_LANG: Record<Lang, { command: string; description: string }[]> = {
  uz: [
    { command: 'start', description: '🚀 Botni yangilash va Asosiy menyu' },
    { command: 'restaurants', description: '🍽️ Restoranlar va 3D Stol Bron qilish' },
    { command: 'menu', description: '📖 Taomlar menyusi va 3D ko‘rinish' },
    { command: 'flowers', description: '💐 Stolga va manzilga Gullar buyurtma qilish' },
    { command: 'mybookings', description: '📅 Mening bronlarim va QR-Chek' },
    { command: 'ai', description: '🤖 AI Yordamchi bilan suhbat' },
    { command: 'profile', description: '👤 Profilim va 15% Tug‘ilgan kun chegirmasi' },
    { command: 'language', description: '🌐 Til / Язык / Language' },
  ],
  ru: [
    { command: 'start', description: '🚀 Обновить бота и главное меню' },
    { command: 'restaurants', description: '🍽️ Рестораны и бронь стола в 3D' },
    { command: 'menu', description: '📖 Меню блюд и 3D-просмотр' },
    { command: 'flowers', description: '💐 Цветы к столу и с доставкой' },
    { command: 'mybookings', description: '📅 Мои брони и QR-чек' },
    { command: 'ai', description: '🤖 Чат с ИИ-помощником' },
    { command: 'profile', description: '👤 Профиль и скидка 15% в день рождения' },
    { command: 'language', description: '🌐 Til / Язык / Language' },
  ],
  en: [
    { command: 'start', description: '🚀 Refresh the bot and main menu' },
    { command: 'restaurants', description: '🍽️ Restaurants and 3D table booking' },
    { command: 'menu', description: '📖 Food menus and 3D view' },
    { command: 'flowers', description: '💐 Flowers to your table or address' },
    { command: 'mybookings', description: '📅 My bookings and QR receipt' },
    { command: 'ai', description: '🤖 Chat with the AI assistant' },
    { command: 'profile', description: '👤 My profile and 15% birthday discount' },
    { command: 'language', description: '🌐 Til / Язык / Language' },
  ],
};
