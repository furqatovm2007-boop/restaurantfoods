/*
 * One source for the investor documents: the public page /investors (app/investors.ts) and the admin's
 * "Biznes-reja (PDF)" /business-plan (app/business-plan.ts) both draw their sections with planSections() from
 * the data below, so the page and the downloaded PDF say exactly the same thing, in UZ, RU and EN.
 *
 * Figures describe the live MVP (SIMPLE_MVP_MODE) and the company's plan; plan figures are marked as such.
 * The scaling tiers' prices are the ones in app/plans.ts.
 */
import { PLANS } from './plans';

export type PlanLang = 'uz' | 'ru' | 'en';
export const PLAN_LANGS: PlanLang[] = ['uz', 'ru', 'en'];
export const planLang = (v: unknown): PlanLang => (PLAN_LANGS.includes(v as PlanLang) ? (v as PlanLang) : 'uz');

export const PILOT_PRICE = 100000; // so'm per restaurant per month (Phase 1 — pilot / bootstrapping)

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const som = (n: number, lang: PlanLang) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (lang === 'uz' ? ' so‘m' : lang === 'ru' ? ' сум' : ' UZS');
// Text may carry <b>…</b> only: everything else is escaped.
const rich = (s: string) => esc(s).replace(/&lt;(\/?)b&gt;/g, '<$1b>');

interface Copy {
  doc: { title: string; eyebrow: string; h1: string; lead: string; print: string; back: string; admin: string; forecastNote: string; date: string };
  pills: string[];
  s1: { h: string; intro: string; stackH: string; stack: string; featuresH: string; features: [string, string][] };
  s2: { h: string; cols: [string, string, string, string]; rows: [string, string, string, string][]; tiersH: string; tiersNote: string; addonsH: string; addons: [string, string][] };
  s3: { h: string; intro: string; items: [string, string][]; flowH: string; flow: string[] };
  s4: { h: string; intro: string; cols: [string, string, string]; rows: [string, string, string][]; mrrH: string; mrrCols: [string, string]; mrrNote: string };
  s5: { h: string; phases: { name: string; when: string; goal: string; items: string[] }[] };
  s6: { h: string; faq: [string, string][] };
}

const T = (lang: PlanLang, pilot = som(PILOT_PRICE, lang)): Copy => {
  const [start, business, premium] = (['start', 'business', 'premium'] as const).map((p) => som(PLANS[p].price, lang));
  if (lang === 'ru')
    return {
      doc: {
        title: 'Инвесторам и бизнес-план — RestaurantFoods',
        eyebrow: '💼 Инвесторам и бизнес-план · живой MVP',
        h1: 'Бронирование столиков в ресторанах Самарканда — уже работает',
        lead: '<b>restaurantfoods.online</b> и Telegram-бот: гость выбирает стол на плане зала, по желанию заранее выбирает блюда и вносит аванс в 1 касание через Click. Ресторан получает бронь и чек в Telegram.',
        print: '📥 Скачать PDF / Печать',
        back: '← restaurantfoods.online',
        admin: '← Админ-панель',
        forecastNote: 'Цифры дорожной карты — план компании (прогноз), а не гарантия.',
        date: 'Дата',
      },
      pills: ['🪑 Бронь по плану зала', '👥 Несколько столов в одной брони', '📖 3D-меню + 🛒 Корзина', '💳 Аванс через Click', '✈️ Telegram-бот', '🌗 Тёмная / светлая тема', '🌐 UZ | RU | EN'],
      s1: {
        h: '1. Живой MVP — что уже работает',
        intro: 'Продукт запущен и принимает брони. Пилотный ресторан — <b>Amanda</b> (Самарканд). Цель первой фазы — не новые функции, а подключение ресторанов и реальные брони.',
        stackH: 'Технологии',
        stack: 'Веб-платформа <b>restaurantfoods.online</b> + Telegram-бот · Supabase (вход) · React (3D-меню) · Cloudflare Workers, D1, R2.',
        featuresH: 'Уже сделано',
        features: [
          ['Бронь по плану зала', 'Гость видит зал, выбирает свободный стол, дату и время; бронь приходит ресторану в Telegram.'],
          ['Групповая бронь нескольких столов', '2–4 стола (до 6) в одной брони — для дней рождения и мероприятий: один номер брони, один чек, одна оплата.'],
          ['Интерактивное 3D-меню', 'Меню-книга в 3D с обычными фото как запасным вариантом (если устройство не тянет 3D) и 3D-модели блюд.'],
          ['Корзина (Korzinka)', 'Отдельная страница корзины, общая для обычного и 3D-меню, с анимацией «блюдо летит в корзину» и счётчиком на нижней панели.'],
          ['Аванс и чек', 'Click в 1 касание или перевод на карту; учёт: сумма, оплачено, остаток.'],
          ['Интерфейс', 'Тёмная / светлая тема, нижняя навигация по ролям (гость / админ), языки UZ | RU | EN с мгновенным переключением.'],
        ],
      },
      s2: {
        h: '2. Цены и монетизация: от пилота к масштабу',
        cols: ['Фаза', 'Тариф', 'Цена', 'Когда'],
        rows: [
          ['Фаза 1 — пилот / bootstrapping', 'Пилот', `${pilot} / мес`, 'Сейчас: первые 10–30 ресторанов Самарканда, начиная с Amanda'],
          ['Фаза 2–3 — масштаб', 'Start', `${start} / мес`, 'После 20–30+ активных ресторанов и стабильного потока броней'],
          ['Фаза 2–3 — масштаб', 'Business', `${business} / мес`, 'То же условие'],
          ['Фаза 2–3 — масштаб', 'Premium', `${premium} / мес`, 'То же условие'],
        ],
        tiersH: 'Почему так',
        tiersNote: `Сейчас главное — быстро подключить рестораны: ${pilot} в месяц не требует долгих переговоров. Тарифы Start / Business / Premium вводятся, когда у ресторанов уже есть реальные брони через платформу и цифры, которые окупают подписку.`,
        addonsH: 'Дополнительные доходы (позже)',
        addons: [
          ['3D-тур по залу (VIP)', 'Платная разовая услуга — фаза 3'],
          ['Цветы / торт к столу', 'Комиссия 3–5 % — фаза 4'],
        ],
      },
      s3: {
        h: '3. Оплата, доверие и защита от мошенничества',
        intro: 'Вместо устаревшей схемы «обязательная привязка карты и штраф» в продукте работает следующий процесс:',
        items: [
          ['Click в 1 касание', 'У каждого ресторана своя платёжная ссылка Click Business: гость платит в одно касание, деньги идут ресторану. Запасной путь — перевод на карту.'],
          ['Учёт аванса', 'У каждой брони три суммы: <b>total_amount</b> (всего), <b>paid_amount</b> (оплачено), <b>remaining_amount</b> (остаток — платится в ресторане). Гость может внести не меньше минимального аванса или всю сумму.'],
          ['Проверка чека в Telegram', 'Гость загружает чек об оплате; он сразу приходит в Telegram с кнопками «✅ Подтвердить / ❌ Отклонить / 🚫 Заблокировать» — подтверждение за секунды.'],
          ['Автоматическая блокировка спама', 'Отмена гостем — не позже чем за 1 час. 2 отмены за 7 дней ограничивают бронь в 1 клик (только с предоплатой); поддельный чек блокирует номер и Telegram навсегда. За 1 час до брони бот спрашивает «Придёте?».'],
        ],
        flowH: 'Как это выглядит для гостя',
        flow: ['Выбирает стол (и блюда)', 'Платит аванс через Click или картой', 'Отправляет чек — ресторан подтверждает в Telegram', 'Приходит; остаток оплачивает в ресторане'],
      },
      s4: {
        h: '4. Экономика: почти нулевые постоянные расходы',
        intro: 'На этапе bootstrapping постоянные расходы почти нулевые, поэтому даже пилотная цена приносит прибыль с первых ресторанов.',
        cols: ['Статья', 'Как у нас', 'Вместо'],
        rows: [
          ['Вход и уведомления', 'Telegram-бот: вход в 1 касание и все уведомления — <b>0 сум</b>', 'Платные SMS-шлюзы (Eskiz.uz) — оплата за каждое SMS'],
          ['Подключение ресторана', 'Реальные фото столов — <b>$0</b> на производство', 'Дорогое 3D-моделирование зала заранее'],
          ['3D-тур по залу', 'Платная VIP-услуга в фазе 3 — приносит доход', 'Бесплатная 3D-модель для всех'],
          ['Платежи', 'Ссылка Click ресторана: деньги сразу идут ресторану', 'Своя эквайринговая инфраструктура'],
          ['Инфраструктура', 'Cloudflare + Supabase: оплата по факту использования', 'Собственные серверы'],
        ],
        mrrH: 'Выручка по пилотной цене (простой расчёт)',
        mrrCols: ['Активных ресторанов', 'Выручка в месяц'],
        mrrNote: `Расчёт: число ресторанов × ${pilot}. С фазы 2–3 к этому добавляются тарифы Start / Business / Premium и доп. услуги.`,
      },
      s5: {
        h: '5. Дорожная карта по этапам',
        phases: [
          { name: 'Фаза 1 — Пилот', when: 'Месяц 1 · 1–10 ресторанов', goal: 'Только продажи и подключение ресторанов в Самарканде, доказать реальный поток броней. Никаких лишних функций.', items: ['Пилот в Amanda', `Цена ${pilot} / мес`, 'Фото столов вместо 3D-зала'] },
          { name: 'Фаза 2 — Автоматизация', when: 'Месяцы 2–3 · 15–30 ресторанов', goal: 'Меньше ручной работы для ресторанов и гостей.', items: ['Click / Payme Merchant API с вебхуками — автоподтверждение без загрузки чека', 'Telegram Mini App', 'Отзывы гостей и аналитика для ресторана'] },
          { name: 'Фаза 3 — Масштаб', when: 'Месяцы 4–6 · 50+ ресторанов', goal: 'Глубже в работу ресторана и новые доходы.', items: ['Интеграции с POS: R-Keeper, iiko, Poster', 'Платные VIP 3D-туры по залу', 'Лояльность / кэшбэк'] },
          { name: 'Фаза 4 — Экосистема', when: 'Месяцы 6–12 · Ташкент и регионы', goal: 'Новые города и доп. сервисы.', items: ['Выход в Ташкент и другие города', 'Цветы / торт к столу — комиссия 3–5 %', 'AI и Call AI ассистенты для сетей ресторанов'] },
        ],
      },
      s6: {
        h: '6. Вопросы инвесторов',
        faq: [
          ['Почему всего 100 000 сум в месяц?', 'Это цена пилота: ресторан соглашается быстро, без долгих переговоров. Наши постоянные расходы почти нулевые (Telegram вместо SMS, фото вместо 3D), поэтому мы зарабатываем уже на первых ресторанах. Тарифы Start / Business / Premium — после 20–30+ активных ресторанов.'],
          ['Как вы боретесь с неявкой?', 'Аванс через Click или картой, чек проверяется в Telegram, отмена — не позже чем за 1 час, за 1 час до брони бот спрашивает «Придёте?». 2 отмены за 7 дней — ограничение, поддельный чек — вечная блокировка.'],
          ['Есть ли обязательная привязка карты и штрафы?', 'Нет. Мы отказались от этой схемы: она отпугивала гостей. Вместо неё — добровольный аванс, проверка чека и автоматическая блокировка злоупотреблений.'],
          ['Куда идут деньги гостя?', 'Если ресторан указал свою ссылку Click или карту — сразу ресторану. Иначе — на центральную карту платформы (запасной путь), после чего ресторан получает бронь.'],
          ['Сколько стоит подключить ресторан?', 'Почти ноль: фото реальных столов и меню, план зала ресторан собирает сам. Дорогой 3D-тур по залу — платная VIP-услуга в фазе 3.'],
          ['Почему не SMS?', 'Каждое SMS через шлюз (Eskiz.uz) стоит денег. Telegram-бот даёт вход в 1 касание и все уведомления бесплатно, а гости в Узбекистане и так пользуются Telegram.'],
          ['Что уже работает, а что в планах?', 'Работает: сайт и бот, бронь по плану зала, групповая бронь, 3D-меню и корзина, аванс через Click, проверка чеков, блокировки, 3 языка, тёмная/светлая тема. В планах (фазы 2–4): автоподтверждение оплат по API, Mini App, отзывы, интеграции с POS, VIP 3D-туры, лояльность, Ташкент.'],
          ['Какой главный риск?', 'Скорость продаж. Поэтому фаза 1 — только продажи и подключение в Самарканде, а каждая следующая фаза начинается после достижения цели по числу ресторанов.'],
        ],
      },
    };
  if (lang === 'en')
    return {
      doc: {
        title: 'Investors & business plan — RestaurantFoods',
        eyebrow: '💼 Investors & business plan · live MVP',
        h1: 'Restaurant table booking in Samarkand — already live',
        lead: '<b>restaurantfoods.online</b> and a Telegram bot: guests pick a table on the hall plan, optionally pre-order dishes and pay an advance in one tap with Click. The restaurant gets the booking and the receipt in Telegram.',
        print: '📥 Download PDF / Print',
        back: '← restaurantfoods.online',
        admin: '← Admin panel',
        forecastNote: 'Roadmap figures are the company’s plan (a forecast), not a guarantee.',
        date: 'Date',
      },
      pills: ['🪑 Booking on the hall plan', '👥 Several tables in one booking', '📖 3D menu + 🛒 Cart', '💳 Click advance', '✈️ Telegram bot', '🌗 Dark / light mode', '🌐 UZ | RU | EN'],
      s1: {
        h: '1. Live MVP — what already works',
        intro: 'The product is live and taking bookings. The pilot restaurant is <b>Amanda</b> (Samarkand). Phase 1 is about onboarding restaurants and real bookings, not new features.',
        stackH: 'Technology',
        stack: 'Web platform <b>restaurantfoods.online</b> + Telegram bot · Supabase (sign-in) · React (3D menu) · Cloudflare Workers, D1, R2.',
        featuresH: 'Already built',
        features: [
          ['Booking on the hall plan', 'The guest sees the hall, picks a free table, date and time; the restaurant gets the booking in Telegram.'],
          ['Multi-table group booking', '2–4 tables (up to 6) in one reservation for birthdays and events: one booking number, one receipt, one payment.'],
          ['Interactive 3D menu', 'A 3D menu book with regular photos as a seamless fallback (when a device cannot run 3D), plus 3D dish models.'],
          ['Cart (Korzinka)', 'A dedicated cart page shared by the list and the 3D menu, with a fly-to-cart animation and a live counter in the bottom bar.'],
          ['Advance and receipt', 'One-tap Click or a card transfer; tracked as total, paid and remaining.'],
          ['Interface', 'Dark / light mode, role-based bottom navigation (guest / admin), UZ | RU | EN with instant switching.'],
        ],
      },
      s2: {
        h: '2. Pricing & monetization: from bootstrapping to scale',
        cols: ['Phase', 'Plan', 'Price', 'When'],
        rows: [
          ['Phase 1 — pilot / bootstrapping', 'Pilot', `${pilot} / month`, 'Now: the first 10–30 restaurants in Samarkand, starting with Amanda'],
          ['Phase 2–3 — scale', 'Start', `${start} / month`, 'Once there are 20–30+ active restaurants and steady booking volume'],
          ['Phase 2–3 — scale', 'Business', `${business} / month`, 'Same condition'],
          ['Phase 2–3 — scale', 'Premium', `${premium} / month`, 'Same condition'],
        ],
        tiersH: 'Why',
        tiersNote: `Right now speed of onboarding matters most: ${pilot} a month needs no long negotiation. Start / Business / Premium come in once restaurants already see real bookings through the platform and numbers that pay for the subscription.`,
        addonsH: 'Additional revenue (later)',
        addons: [
          ['3D hall virtual tour (VIP)', 'Paid one-time service — Phase 3'],
          ['Flowers / cake to the table', '3–5% commission — Phase 4'],
        ],
      },
      s3: {
        h: '3. Payment, trust & anti-fraud',
        intro: 'The outdated “mandatory card binding and penalty fee” model has been replaced by this live workflow:',
        items: [
          ['1-tap Click Business', 'Each restaurant has its own Click payment link: the guest pays in one tap and the money goes to the restaurant. Fallback: a card transfer.'],
          ['Advance deposit accounting', 'Every booking carries <b>total_amount</b>, <b>paid_amount</b> and <b>remaining_amount</b> (paid at the restaurant). The guest pays at least the minimum advance, or the full amount.'],
          ['Receipt check in Telegram', 'The guest uploads the payment receipt; it arrives in Telegram at once with “✅ Approve / ❌ Reject / 🚫 Ban” — approved in seconds.'],
          ['Automated anti-spam blocking', 'Guests may cancel up to 1 hour before. 2 cancellations within 7 days restrict 1-click booking (prepayment only); a fake receipt bans the phone and the Telegram account for good. One hour before, the bot asks “Are you coming?”.'],
        ],
        flowH: 'What the guest does',
        flow: ['Picks a table (and dishes)', 'Pays the advance with Click or by card', 'Sends the receipt — the restaurant approves in Telegram', 'Arrives; pays the rest at the restaurant'],
      },
      s4: {
        h: '4. Lean unit economics: near-zero burn rate',
        intro: 'During bootstrapping fixed costs are close to zero, so even the pilot price is profitable from the first restaurants.',
        cols: ['Item', 'Our way', 'Instead of'],
        rows: [
          ['Sign-in and notifications', 'Telegram bot: 1-tap sign-in and all notifications — <b>0 UZS</b>', 'Paid SMS gateways (Eskiz.uz), paid per message'],
          ['Restaurant onboarding', 'Real table photos — <b>$0</b> production cost', 'Expensive upfront 3D hall modeling'],
          ['3D hall tour', 'Paid VIP add-on in Phase 3 — a revenue line', 'A free 3D model for everyone'],
          ['Payments', 'The restaurant’s Click link: money goes straight to the restaurant', 'Own acquiring infrastructure'],
          ['Infrastructure', 'Cloudflare + Supabase: pay as you use', 'Own servers'],
        ],
        mrrH: 'Revenue at the pilot price (simple arithmetic)',
        mrrCols: ['Active restaurants', 'Revenue per month'],
        mrrNote: `Restaurants × ${pilot}. From Phase 2–3 the Start / Business / Premium plans and add-ons come on top.`,
      },
      s5: {
        h: '5. Phased roadmap (milestone-driven)',
        phases: [
          { name: 'Phase 1 — Pilot', when: 'Month 1 · 1–10 restaurants', goal: 'Sales and onboarding in Samarkand only, proving real booking traction. Zero feature bloat.', items: ['Pilot at Amanda', `${pilot} / month`, 'Table photos instead of a 3D hall'] },
          { name: 'Phase 2 — Automation', when: 'Months 2–3 · 15–30 restaurants', goal: 'Less manual work for restaurants and guests.', items: ['Click / Payme Merchant API webhooks — auto-confirmation without a receipt upload', 'Telegram Mini App', 'Customer reviews and restaurant analytics'] },
          { name: 'Phase 3 — Scale', when: 'Months 4–6 · 50+ restaurants', goal: 'Deeper into restaurant operations, new revenue.', items: ['POS integrations: R-Keeper, iiko, Poster', 'Paid VIP 3D hall tours', 'Loyalty / cashback'] },
          { name: 'Phase 4 — Ecosystem', when: 'Months 6–12 · Tashkent & regions', goal: 'New cities and add-on services.', items: ['Expansion to Tashkent and other cities', 'Flowers / cake to the table — 3–5% commission', 'AI and Call AI assistants for restaurant chains'] },
        ],
      },
      s6: {
        h: '6. Investor questions',
        faq: [
          ['Why only 100,000 UZS a month?', 'It is the pilot price: restaurants say yes quickly, without long negotiation. Our fixed costs are near zero (Telegram instead of SMS, photos instead of 3D), so we earn from the first restaurants. Start / Business / Premium follow at 20–30+ active restaurants.'],
          ['How do you fight no-shows?', 'An advance via Click or card, the receipt checked in Telegram, cancellation no later than 1 hour before, and a “Are you coming?” message 1 hour before. 2 cancellations in 7 days mean a restriction; a fake receipt means a permanent ban.'],
          ['Is there mandatory card binding and a penalty fee?', 'No. We dropped that model — it scared guests away. Instead: a voluntary advance, a receipt check and automatic blocking of abusers.'],
          ['Where does the guest’s money go?', 'If the restaurant set its own Click link or card — straight to the restaurant. Otherwise to the platform’s central card (fallback), and the restaurant then gets the booking.'],
          ['What does it cost to onboard a restaurant?', 'Almost nothing: real table and dish photos; the restaurant lays out its hall plan itself. The expensive 3D hall tour is a paid VIP service in Phase 3.'],
          ['Why not SMS?', 'Every SMS through a gateway (Eskiz.uz) costs money. The Telegram bot gives 1-tap sign-in and all notifications for free, and guests in Uzbekistan already use Telegram.'],
          ['What is live and what is planned?', 'Live: the site and bot, hall-plan booking, group booking, the 3D menu and cart, Click advance, receipt checks, blocking, 3 languages, dark/light mode. Planned (Phases 2–4): API payment auto-confirmation, Mini App, reviews, POS integrations, VIP 3D tours, loyalty, Tashkent.'],
          ['What is the main risk?', 'Sales speed. That is why Phase 1 is sales and onboarding in Samarkand only, and each next phase starts once its restaurant milestone is reached.'],
        ],
      },
    };
  return {
    doc: {
      title: 'Investorlar va Biznes-reja — RestaurantFoods',
      eyebrow: '💼 Investorlar va Biznes-reja · ishlab turgan MVP',
      h1: 'Samarqand restoranlarida stol bron qilish — allaqachon ishlayapti',
      lead: '<b>restaurantfoods.online</b> va Telegram bot: mehmon zal rejasidan stol tanlaydi, xohlasa taomlarni oldindan tanlaydi va Click orqali bir bosishda avans to‘laydi. Restoran bron va chekni Telegram’da oladi.',
      print: '📥 PDF shaklida yuklab olish / Chop etish',
      back: '← restaurantfoods.online',
      admin: '← Admin panel',
      forecastNote: 'Yo‘l xaritasidagi raqamlar — kompaniya rejasi (prognoz), kafolat emas.',
      date: 'Sana',
    },
    pills: ['🪑 Zal rejasidan bron', '👥 Bitta bronda bir nechta stol', '📖 3D menyu + 🛒 Korzinka', '💳 Click orqali avans', '✈️ Telegram bot', '🌗 Tungi / kunduzgi rejim', '🌐 UZ | RU | EN'],
    s1: {
      h: '1. Ishlab turgan MVP — hozir nima ishlaydi',
      intro: 'Mahsulot ishga tushgan va bron qabul qilmoqda. Pilot restoran — <b>Amanda</b> (Samarqand). Birinchi bosqich maqsadi yangi funksiyalar emas, balki restoranlarni ulash va haqiqiy bronlar.',
      stackH: 'Texnologiya',
      stack: 'Veb-platforma <b>restaurantfoods.online</b> + Telegram bot · Supabase (kirish) · React (3D menyu) · Cloudflare Workers, D1, R2.',
      featuresH: 'Allaqachon tayyor',
      features: [
        ['Zal rejasidan bron', 'Mehmon zalni ko‘radi, bo‘sh stol, sana va vaqtni tanlaydi; bron restoranga Telegram’da keladi.'],
        ['Bir nechta stolni guruh bilan bron qilish', '2–4 ta (6 tagacha) stol bitta bronda — tug‘ilgan kun va tadbirlar uchun: bitta bron raqami, bitta chek, bitta to‘lov.'],
        ['Interaktiv 3D menyu', '3D menyu-kitob, qurilma 3D’ni tortmasa oddiy rasmlarga silliq o‘tadi; taomlarning 3D modellari.'],
        ['Korzinka', 'Oddiy va 3D menyu uchun umumiy alohida savat sahifasi: “taom savatga uchadi” animatsiyasi va pastki menyuda jonli hisoblagich.'],
        ['Avans va chek', 'Click orqali bir bosishda yoki kartaga o‘tkazma; hisob: jami, to‘langan, qolgan summa.'],
        ['Interfeys', 'Tungi / kunduzgi rejim, rolga qarab pastki menyu (mijoz / admin), UZ | RU | EN tillari bir zumda almashadi.'],
      ],
    },
    s2: {
      h: '2. Narxlar va monetizatsiya: pilotdan kengayishgacha',
      cols: ['Bosqich', 'Tarif', 'Narx', 'Qachon'],
      rows: [
        ['1-bosqich — pilot / bootstrapping', 'Pilot', `${pilot} / oy`, 'Hozir: Samarqanddagi birinchi 10–30 restoran, Amanda’dan boshlab'],
        ['2–3-bosqich — kengayish', 'Start', `${start} / oy`, '20–30+ faol restoran va barqaror bron oqimi bo‘lgach'],
        ['2–3-bosqich — kengayish', 'Business', `${business} / oy`, 'Shu shart bilan'],
        ['2–3-bosqich — kengayish', 'Premium', `${premium} / oy`, 'Shu shart bilan'],
      ],
      tiersH: 'Nega shunday',
      tiersNote: `Hozir eng muhimi — restoranlarni tez ulash: oyiga ${pilot} uzoq muzokarani talab qilmaydi. Start / Business / Premium tariflari restoranlar platforma orqali haqiqiy bronlarni va obunani oqlaydigan raqamlarni ko‘rgach kiritiladi.`,
      addonsH: 'Qo‘shimcha daromadlar (keyinroq)',
      addons: [
        ['Zalning 3D virtual turi (VIP)', 'Pullik bir martalik xizmat — 3-bosqich'],
        ['Stolga gul / tort yetkazish', '3–5% komissiya — 4-bosqich'],
      ],
    },
    s3: {
      h: '3. To‘lov, ishonch va firibgarlikdan himoya',
      intro: 'Eskirgan “majburiy karta ulash va jarima” sxemasi o‘rniga mahsulotda quyidagi jarayon ishlaydi:',
      items: [
        ['Click Business — bir bosishda', 'Har bir restoranning o‘z Click to‘lov havolasi bor: mehmon bir bosishda to‘laydi, pul restoranga tushadi. Zaxira yo‘l — kartaga o‘tkazma.'],
        ['Avans hisobi', 'Har bir bronda uchta summa: <b>total_amount</b> (jami), <b>paid_amount</b> (to‘langan), <b>remaining_amount</b> (qolgan — restoranda to‘lanadi). Mehmon eng kam avansdan kam bo‘lmagan summani yoki to‘liq summani to‘laydi.'],
        ['Chekni Telegram’da tekshirish', 'Mehmon to‘lov chekini yuklaydi; u darhol Telegram’ga “✅ Tasdiqlash / ❌ Rad etish / 🚫 Bloklash” tugmalari bilan keladi — tasdiq bir necha soniyada.'],
        ['Avtomatik anti-spam bloklash', 'Mehmon bronni ko‘pi bilan 1 soat oldin bekor qila oladi. 7 kunda 2 marta bekor qilish 1 bosishli bronni cheklaydi (faqat oldindan to‘lov bilan); soxta chek raqam va Telegram akkauntni butunlay bloklaydi. Bronga 1 soat qolganda bot “Kelasizmi?” deb so‘raydi.'],
      ],
      flowH: 'Mehmon uchun qanday ko‘rinadi',
      flow: ['Stol (va taomlarni) tanlaydi', 'Avansni Click yoki karta orqali to‘laydi', 'Chekni yuboradi — restoran Telegram’da tasdiqlaydi', 'Keladi; qolgan summani restoranda to‘laydi'],
    },
    s4: {
      h: '4. Unit-iqtisodiyot: deyarli nol doimiy xarajat',
      intro: 'Bootstrapping bosqichida doimiy xarajatlar deyarli nolga teng, shuning uchun pilot narxi ham birinchi restoranlardanoq foyda keltiradi.',
      cols: ['Modda', 'Bizda', 'O‘rniga'],
      rows: [
        ['Kirish va bildirishnomalar', 'Telegram bot: bir bosishda kirish va barcha xabarlar — <b>0 so‘m</b>', 'Pullik SMS shlyuzlari (Eskiz.uz) — har bir SMS uchun to‘lov'],
        ['Restoranni ulash', 'Haqiqiy stol rasmlari — ishlab chiqarish xarajati <b>$0</b>', 'Oldindan qimmat 3D zal modellashtirish'],
        ['Zalning 3D turi', '3-bosqichda pullik VIP xizmat — daromad manbai', 'Hammaga bepul 3D model'],
        ['To‘lovlar', 'Restoranning Click havolasi: pul to‘g‘ridan-to‘g‘ri restoranga', 'O‘z ekvayring infratuzilmasi'],
        ['Infratuzilma', 'Cloudflare + Supabase: foydalanishga qarab to‘lov', 'O‘z serverlari'],
      ],
      mrrH: 'Pilot narxidagi tushum (oddiy hisob)',
      mrrCols: ['Faol restoranlar', 'Oylik tushum'],
      mrrNote: `Hisob: restoranlar soni × ${pilot}. 2–3-bosqichdan boshlab bunga Start / Business / Premium tariflari va qo‘shimcha xizmatlar qo‘shiladi.`,
    },
    s5: {
      h: '5. Bosqichma-bosqich yo‘l xaritasi',
      phases: [
        { name: '1-bosqich — Pilot', when: '1-oy · 1–10 restoran', goal: 'Faqat sotuv va Samarqandda restoranlarni ulash, haqiqiy bron oqimini isbotlash. Ortiqcha funksiyalarsiz.', items: ['Amanda’da pilot', `Narx ${pilot} / oy`, '3D zal o‘rniga stol rasmlari'] },
        { name: '2-bosqich — Avtomatlashtirish', when: '2–3-oylar · 15–30 restoran', goal: 'Restoran va mehmon uchun qo‘l mehnatini kamaytirish.', items: ['Click / Payme Merchant API webhooklari — chek yuklamasdan avtomatik tasdiq', 'Telegram Mini App', 'Mijoz sharhlari va restoran analitikasi'] },
        { name: '3-bosqich — Kengayish', when: '4–6-oylar · 50+ restoran', goal: 'Restoran ishiga chuqurroq kirish va yangi daromadlar.', items: ['POS integratsiyalari: R-Keeper, iiko, Poster', 'Pullik VIP 3D zal turlari', 'Sadoqat / keshbek tizimi'] },
        { name: '4-bosqich — Ekotizim', when: '6–12-oylar · Toshkent va viloyatlar', goal: 'Yangi shaharlar va qo‘shimcha xizmatlar.', items: ['Toshkent va boshqa shaharlarga chiqish', 'Stolga gul / tort yetkazish — 3–5% komissiya', 'Restoran tarmoqlari uchun AI va Call AI yordamchilari'] },
      ],
    },
    s6: {
      h: '6. Investorlar savollari',
      faq: [
        ['Nega oyiga atigi 100 000 so‘m?', 'Bu pilot narxi: restoran uzoq muzokarasiz tez rozi bo‘ladi. Doimiy xarajatimiz deyarli nol (SMS o‘rniga Telegram, 3D o‘rniga rasm), shuning uchun birinchi restoranlardanoq daromad olamiz. Start / Business / Premium — 20–30+ faol restorandan keyin.'],
        ['Kelmay qolish (No-Show) bilan qanday kurashasiz?', 'Click yoki karta orqali avans, chek Telegram’da tekshiriladi, bekor qilish ko‘pi bilan 1 soat oldin, bronga 1 soat qolganda bot “Kelasizmi?” deb so‘raydi. 7 kunda 2 marta bekor qilish — cheklov, soxta chek — butunlay bloklash.'],
        ['Majburiy karta ulash va jarima bormi?', 'Yo‘q. Bu sxemadan voz kechdik — u mehmonlarni cho‘chitardi. O‘rniga: ixtiyoriy avans, chekni tekshirish va suiiste’mol qiluvchilarni avtomatik bloklash.'],
        ['Mehmonning puli qayerga tushadi?', 'Restoran o‘z Click havolasi yoki kartasini kiritgan bo‘lsa — to‘g‘ridan-to‘g‘ri restoranga. Aks holda platformaning markaziy kartasiga (zaxira yo‘l), so‘ng restoran bronni oladi.'],
        ['Restoranni ulash qancha turadi?', 'Deyarli nol: haqiqiy stol va taom rasmlari, zal rejasini restoran o‘zi joylaydi. Qimmat 3D zal turi — 3-bosqichdagi pullik VIP xizmat.'],
        ['Nega SMS emas?', 'Shlyuz (Eskiz.uz) orqali har bir SMS pul turadi. Telegram bot bir bosishda kirish va barcha xabarlarni bepul beradi, O‘zbekistondagi mehmonlar esa Telegram’dan baribir foydalanadi.'],
        ['Nima ishlayapti, nima rejada?', 'Ishlayapti: sayt va bot, zal rejasidan bron, guruh bron, 3D menyu va Korzinka, Click orqali avans, chek tekshiruvi, bloklash, 3 til, tungi/kunduzgi rejim. Rejada (2–4-bosqichlar): API orqali to‘lovni avtomatik tasdiqlash, Mini App, sharhlar, POS integratsiyalari, VIP 3D turlar, sadoqat tizimi, Toshkent.'],
        ['Asosiy xavf nima?', 'Sotuv tezligi. Shuning uchun 1-bosqich faqat Samarqandda sotuv va ulash, har bir keyingi bosqich esa restoranlar soni bo‘yicha maqsadga erishilgach boshlanadi.'],
      ],
    },
  };
};

export const planCopy = (lang: PlanLang) => T(lang);
export const MRR_STEPS = [1, 10, 30];

/**
 * The shared sections, in order. `wrap` gives each section its frame (the page's card or the PDF's A4 sheet);
 * everything inside is the same for both documents.
 */
export function planSections(lang: PlanLang, wrap: (inner: string, i: number) => string) {
  const t = T(lang);
  const list = (items: string[]) => `<ul>${items.map((x) => `<li>${rich(x)}</li>`).join('')}</ul>`;
  const table = (cols: string[], rows: string[][], cls = '') => `<table class="plan-t${cls ? ' ' + cls : ''}"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td>${i === 2 && cls === 'prices' ? `<b>${rich(c)}</b>` : rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const cards = (items: [string, string][]) => `<div class="plan-cards">${items.map(([h, p]) => `<article><b>${esc(h)}</b><p>${rich(p)}</p></article>`).join('')}</div>`;
  const sections = [
    `<h2>${esc(t.s1.h)}</h2><p>${rich(t.s1.intro)}</p><h3>${esc(t.s1.featuresH)}</h3>${cards(t.s1.features)}<h3>${esc(t.s1.stackH)}</h3><p>${rich(t.s1.stack)}</p>`,
    `<h2>${esc(t.s2.h)}</h2>${table(t.s2.cols, t.s2.rows, 'prices')}<h3>${esc(t.s2.tiersH)}</h3><p>${rich(t.s2.tiersNote)}</p><h3>${esc(t.s2.addonsH)}</h3>${table([{ uz: 'Xizmat', ru: 'Услуга', en: 'Service' }[lang], t.s2.cols[3]], t.s2.addons)}`,
    `<h2>${esc(t.s3.h)}</h2><p>${rich(t.s3.intro)}</p>${cards(t.s3.items)}<h3>${esc(t.s3.flowH)}</h3><ol class="plan-flow">${t.s3.flow.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`,
    `<h2>${esc(t.s4.h)}</h2><p>${rich(t.s4.intro)}</p>${table(t.s4.cols, t.s4.rows)}<h3>${esc(t.s4.mrrH)}</h3>${table(
      t.s4.mrrCols,
      MRR_STEPS.map((n) => [String(n), `<b>${som(n * PILOT_PRICE, lang)}</b>`]),
    )}<p class="plan-note">${esc(t.s4.mrrNote)}</p>`,
    `<h2>${esc(t.s5.h)}</h2><div class="plan-phases">${t.s5.phases.map((p, i) => `<article class="plan-phase plan-phase-${i + 1}"><b>${esc(p.name)}</b><small>${esc(p.when)}</small><p>${esc(p.goal)}</p>${list(p.items)}</article>`).join('')}</div><p class="plan-note">${esc(t.doc.forecastNote)}</p>`,
    `<h2>${esc(t.s6.h)}</h2><ol class="plan-faq">${t.s6.faq.map(([q, a]) => `<li><b>${esc(q)}</b><p>${esc(a)}</p></li>`).join('')}</ol>`,
  ];
  return sections.map((s, i) => wrap(s, i)).join('');
}

/** "UZ | RU | EN" links for the page at `path`; the current language is marked. */
export const langLinks = (path: string, lang: PlanLang) =>
  `<nav class="plan-langs" aria-label="Til / Язык / Language">${PLAN_LANGS.map((l) => (l === lang ? `<b aria-current="true">${l.toUpperCase()}</b>` : `<a href="${path}?lang=${l}" hreflang="${l}">${l.toUpperCase()}</a>`)).join('')}</nav>`;
export const planHead = (lang: PlanLang) => {
  const t = T(lang);
  return { ...t.doc, pills: t.pills, rich };
};
