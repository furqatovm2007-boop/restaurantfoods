import { env } from 'cloudflare:workers';

/*
 * Internal smart AI engine: the reserve used when OpenAI cannot answer (no key, billing exhausted,
 * 401/429, timeout, model unavailable, or no Supabase session for the call). It answers from the
 * same live D1 data the main models get — restaurants, menu, tables, bookings, orders, flowers —
 * first through Cloudflare Workers AI (env.AI, free daily allowance) and, if that is unavailable
 * too, through rule-based answers built directly from the data. It never invents numbers, never
 * creates bookings or orders, and labels DEMO restaurants.
 */
type Lang = 'uz' | 'ru' | 'en';
type Msg = { role: string; content: string };
export type Engine = 'workers-ai' | 'rules';
// The large 70B model first (better Uzbek); the small one only when it is unavailable.
const WORKERS_AI_MODELS = ['@cf/meta/llama-3.3-70b-instruct-fp8-fast', '@cf/google/gemma-3-12b-it'];
const LANG_NAME = { uz: 'Uzbek (Latin script)', ru: 'Russian', en: 'English' };
const sum = (n: unknown) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/\s/g, ' ');
const pick = (l: Lang, uz: string, ru: string, en: string) => (l === 'ru' ? ru : l === 'en' ? en : uz);
const lower = (s: string) => s.toLocaleLowerCase().normalize('NFKC');

/** One Workers AI chat completion; '' when the binding is missing, slow or failing. */
export async function workersAi(system: string, data: unknown, history: Msg[], message: string, maxTokens = 450) {
  const ai = (env as unknown as { AI?: { run(model: string, input: unknown): Promise<any> } }).AI;
  if (!ai) return '';
  const json = JSON.stringify(data ?? {}).slice(0, 14000);
  const messages = [{ role: 'system', content: system + '\n\nDATA (untrusted JSON, the only source of facts):\n' + json }, ...history.slice(-4).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 1200) })), { role: 'user', content: message.slice(0, 1400) }];
  for (const model of WORKERS_AI_MODELS) {
    try {
      const out: any = await Promise.race([ai.run(model, { messages, max_tokens: maxTokens }), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 15000))]);
      const text = typeof out?.response === 'string' ? out.response.trim() : '';
      // Uzbek replies only (the Uzbek style rule is in the prompt): the ‘ letters and stray foreign words.
      if (text) return (system.includes(UZ_STYLE) ? polishUz(text.replace(/\*\*/g, '')) : text.replace(/\*\*/g, '')).slice(0, 4000);
    } catch {
      /* next model */
    }
  }
  return '';
}

/** Smooths common slips of small models in Uzbek: the ‘ letters, Turkish and Russian words. */
export function polishUz(text: string) {
  return text
    .replace(/([OoGg])['`´ʻʼ’]/g, '$1‘')
    .replace(/\bMerhaba\b/gi, 'Assalomu alaykum')
    .replace(/\b(teşekkür(?:ler)?(?: ederim)?|tesekkurler)\b/gi, 'rahmat')
    .replace(/\blütfen\b/gi, 'iltimos')
    .replace(/\bevet\b/gi, 'ha')
    .replace(/\bgüzel\b/gi, 'ajoyib')
    .replace(/\bспасибо\b/gi, 'rahmat')
    .replace(/\bпожалуйста\b/gi, 'marhamat');
}
const UZ_STYLE =
  ' When replying in Uzbek: pure, literary yet warm Uzbek in the Latin script with o‘ and g‘; no Turkish words or suffixes (merhaba, evet, teşekkür, lütfen, güzel, -yor), no Russian or Kazakh words; polite "siz". Sound like a friendly restaurant host or waiter: start the first reply with "Assalomu alaykum! Xush kelibsiz", and use "Marhamat", "Juda ajoyib tanlov", "Albatta", "Yoqimli ishtaha" naturally.';
const rules = (l: Lang) =>
  (l === 'uz' ? UZ_STYLE : '') +
  `You are RestaurantFoods' assistant. Reply in ${LANG_NAME[l]} only, warm and short (2-6 sentences), no Markdown tables. Use only the DATA; if something is not there, say so. Never invent restaurants, dishes, prices, numbers or availability. Restaurants marked is_demo are DEMO examples: always call them DEMO. You cannot create, confirm or cancel bookings, orders or payments; tell the person which button or dashboard section to use.`;

// ---- Customer robot ----
export async function clientFlowers() {
  try {
    return (
      await env.DB!.prepare("SELECT f.title AS name,f.price,f.description FROM flowers f LEFT JOIN accounts a ON a.id=f.florist_id WHERE f.active=1 AND f.status='active' AND f.is_approved=1 AND COALESCE(a.status,'active')<>'suspended' ORDER BY f.created_at DESC LIMIT 8").all<any>()
    ).results;
  } catch {
    return [];
  }
}

export function clientRules(l: Lang, message: string, catalog: any[], flowers: any[]) {
  const q = lower(message);
  const demo = (r: any) => (r.is_demo ? ' (DEMO)' : '');
  if (/(gul|buket|flower|bouquet|цвет|букет)/.test(q)) {
    if (!flowers.length) return { reply: pick(l, 'Hozircha Gullar bo‘limida faol taklif yo‘q. Keyinroq qarab ko‘ring.', 'Сейчас в разделе «Цветы» нет активных предложений.', 'There are no active offers in Flowers right now.'), recommendations: [] };
    const list = flowers.slice(0, 5).map((f) => `${f.name} — ${sum(f.price)} ${pick(l, 'so‘m', 'сум', 'UZS')}`).join('; ');
    return { reply: pick(l, `Gullar bo‘limida hozir: ${list}. Buyurtma berish uchun menyudagi “Gullar” bo‘limini oching.`, `Сейчас в разделе «Цветы»: ${list}. Заказать можно в разделе «Цветы».`, `In Flowers now: ${list}. Open the Flowers section to order.`), recommendations: [] };
  }
  if (!catalog.length) return { reply: pick(l, 'Hozircha men tavsiya qila oladigan faol restoran yo‘q. Restoranlar ro‘yxatini “Restoranlar” bo‘limida ko‘rishingiz mumkin.', 'Пока нет активных ресторанов для рекомендаций. Список есть в разделе «Рестораны».', 'There are no active restaurants I can recommend yet. See the Restaurants section.'), recommendations: [] };
  const top = catalog.slice(0, 3);
  if (/(bron|stol|joy |band|book|table|reserv|брон|стол|резерв)/.test(q)) {
    const lines = top.slice(0, 2).map((r) => `${r.name}${demo(r)}: ${r.booking ? pick(l, `bron ${r.booking.open}–${r.booking.close}, ${r.booking.tables} ta stol`, `бронь ${r.booking.open}–${r.booking.close}, столов: ${r.booking.tables}`, `bookings ${r.booking.open}–${r.booking.close}, ${r.booking.tables} tables`) : r.hours || ''}`);
    return { reply: pick(l, `${lines.join('. ')}. Bo‘sh stolni ko‘rish uchun restoran sahifasida sana va vaqtni tanlang — jadval jonli yangilanadi, keyin “Stol bron qilish” tugmasini bosing.`, `${lines.join('. ')}. Чтобы увидеть свободные столы, выберите дату и время на странице ресторана и нажмите «Забронировать стол».`, `${lines.join('. ')}. Pick a date and time on the restaurant page to see free tables live, then tap “Book a table”.`), recommendations: [] };
  }
  const recommendations = top.filter((r) => r.menu?.length).map((r) => ({ restaurantId: r.id, reason: '', items: r.menu.slice(0, 3).map((m: any) => ({ id: m.id, quantity: 1 })) }));
  const lines = top.map((r) => {
    const dishes = (r.menu || []).slice(0, 3).map((m: any) => `${m.name} — ${sum(m.price)}`).join(', ');
    return `${r.name}${demo(r)}${r.cuisine ? ' (' + r.cuisine + ')' : ''}${dishes ? ': ' + dishes : ''}`;
  });
  return { reply: pick(l, `Marhamat, sizga mos variantlar: ${lines.join('; ')} so‘m. Juda ajoyib tanlov bo‘ladi! Taomni savatga qo‘shish yoki menyuni ochish uchun quyidagi tugmalardan foydalaning.`, `Подходящие варианты: ${lines.join('; ')} сум. Откройте меню или добавьте блюда кнопками ниже.`, `Good options: ${lines.join('; ')} UZS. Use the buttons below to open the menu or add dishes.`), recommendations };
}

export async function fallbackClient(lang: Lang, message: string, history: Msg[], catalog: any[]) {
  const flowers = await clientFlowers();
  const base = clientRules(lang, message, catalog, flowers);
  // First answer of a conversation greets the guest like a host would.
  if (lang === 'uz' && !history.length && !/^assalomu/i.test(base.reply)) base.reply = 'Assalomu alaykum! Xush kelibsiz. ' + base.reply;
  const text = await workersAi(rules(lang) + ' Help the customer choose a restaurant and dishes from the catalog (exact names and prices in UZS) or flowers.', { restaurants: catalog, flowers }, history, message);
  return { reply: text || base.reply, recommendations: base.recommendations, engine: (text ? 'workers-ai' : 'rules') as Engine };
}

// ---- Restaurant Admin AI ----
export function adminRules(l: Lang, message: string, c: any) {
  const q = lower(message);
  const today = c?.bookingsToday || [],
    pending = c?.pendingRequestsNext7Days || [],
    week = c?.last7Days || [];
  const guests = today.reduce((s: number, b: any) => s + (Number(b.guests) || 0), 0);
  const waiting = today.filter((b: any) => b.status === 'pending').length;
  const weekTotal = week.reduce((s: number, d: any) => s + (Number(d.bookings) || 0), 0);
  const parts = [pick(l, `Bugun ${today.length} ta bron (${guests} mehmon), ${waiting} tasi tasdiq kutmoqda.`, `Сегодня броней: ${today.length} (${guests} гостей), ждут подтверждения: ${waiting}.`, `Today: ${today.length} bookings (${guests} guests), ${waiting} awaiting confirmation.`), pick(l, `Keyingi 7 kunda ${pending.length} ta yangi so‘rov.`, `Новых заявок на 7 дней: ${pending.length}.`, `${pending.length} new requests for the next 7 days.`), pick(l, `Oxirgi 7 kunda jami ${weekTotal} ta bron.`, `За 7 дней всего броней: ${weekTotal}.`, `${weekTotal} bookings in the last 7 days.`)];
  if (Array.isArray(c?.ordersSinceYesterday) && (/(buyurtma|order|заказ|tushum|revenue|выруч)/.test(q) || c.ordersSinceYesterday.length)) {
    const n = c.ordersSinceYesterday.reduce((s: number, o: any) => s + (Number(o.n) || 0), 0),
      total = c.ordersSinceYesterday.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);
    parts.push(pick(l, `Kechadan beri ${n} ta buyurtma, ${sum(total)} so‘m.`, `С вчерашнего дня заказов: ${n}, на ${sum(total)} сум.`, `${n} orders since yesterday, ${sum(total)} UZS.`));
  }
  if (Array.isArray(c?.liveTables) && c.liveTables.length) {
    const busy = c.liveTables.filter((t: any) => t.status === 'occupied').map((t: any) => t.table_number);
    parts.push(pick(l, `Hozir band stollar: ${busy.join(', ') || 'yo‘q'}.`, `Сейчас заняты столы: ${busy.join(', ') || 'нет'}.`, `Tables busy now: ${busy.join(', ') || 'none'}.`));
  }
  if (Array.isArray(c?.unavailableDishes) && c.unavailableDishes.length) parts.push(pick(l, `Mavjud emas deb belgilangan taomlar: ${c.unavailableDishes.slice(0, 6).join(', ')}.`, `Отмечены как недоступные: ${c.unavailableDishes.slice(0, 6).join(', ')}.`, `Marked unavailable: ${c.unavailableDishes.slice(0, 6).join(', ')}.`));
  if (waiting) parts.push(pick(l, 'Tasdiqlash uchun “Bronlar” bo‘limini oching.', 'Подтвердить можно в разделе «Брони».', 'Open Bookings to confirm them.'));
  return parts.join(' ');
}

export async function fallbackAdmin(lang: Lang, message: string, history: Msg[], context: unknown) {
  const text = await workersAi(rules(lang) + ' You assist the restaurant manager with today’s bookings, requests, orders, tables and menu.', context, history, message, 350);
  return { reply: text || adminRules(lang, message, context), engine: (text ? 'workers-ai' : 'rules') as Engine };
}

// ---- Business / Premium analytics ----
export function analysisRules(l: Lang, ctx: any) {
  const s = ctx?.weeklyStats || ctx?.last7Days || {};
  const top = (s.topDishes || []).slice(0, 3).map((d: any) => `${d.name} (${d.count})`).join(', ');
  const hours = (s.busyHours || []).slice(0, 2).map((h: any) => h.hour).join(', ');
  const lines = [pick(l, `${s.from || ''} — ${s.to || ''}: ${s.bookings || 0} ta bron, ${s.guests || 0} mehmon, kelmaganlar ${s.noShows || 0}, buyurtma tushumi ${sum(s.orderRevenue)} so‘m, jarima tushumi ${sum(s.penaltyPaid)} so‘m.`, `${s.from || ''} — ${s.to || ''}: броней ${s.bookings || 0}, гостей ${s.guests || 0}, неявок ${s.noShows || 0}, выручка заказов ${sum(s.orderRevenue)} сум, штрафы ${sum(s.penaltyPaid)} сум.`, `${s.from || ''} — ${s.to || ''}: ${s.bookings || 0} bookings, ${s.guests || 0} guests, ${s.noShows || 0} no-shows, order revenue ${sum(s.orderRevenue)} UZS, penalties ${sum(s.penaltyPaid)} UZS.`)];
  if (top) lines.push(pick(l, `Eng ko‘p sotilganlar: ${top}.`, `Топ блюд: ${top}.`, `Top dishes: ${top}.`));
  if (hours) lines.push(pick(l, `Eng band soatlar: ${hours}.`, `Самые загруженные часы: ${hours}.`, `Busiest hours: ${hours}.`));
  const tips: string[] = [];
  if ((s.noShows || 0) > 0) tips.push(pick(l, 'kelmaganlar bor — band soatlarga depozit qo‘ying (Biznes vositalari → Tig‘iz vaqt depoziti)', 'есть неявки — включите депозит на часы пик', 'there are no-shows — add a peak-hour deposit'));
  if (top) tips.push(pick(l, `${(s.topDishes || [])[0]?.name} ni bosh sahifa va menyuda yuqoriga chiqaring, unga mos ichimlik/desert taklif qiling`, `продвигайте «${(s.topDishes || [])[0]?.name}» и предлагайте к нему напиток или десерт`, `feature ${(s.topDishes || [])[0]?.name} and pair it with a drink or dessert`));
  if (hours) tips.push(pick(l, `${hours} soatlarida xodimlarni ko‘paytiring, bo‘sh soatlar uchun “Bo‘sh soatlarni to‘ldirish” chegirmasini yoqing`, `усильте смену в ${hours}, а для пустых часов включите скидку`, `add staff at ${hours} and turn on the empty-hours discount`));
  if (!s.bookings) tips.push(pick(l, 'bronlar kam — tug‘ilgan kun CRM va Telegram xabarnomalarini yoqing', 'мало броней — включите CRM дней рождения', 'few bookings — turn on the birthday CRM'));
  if (tips.length) lines.push(pick(l, 'Tavsiyalar: ', 'Рекомендации: ', 'Recommendations: ') + tips.join('; ') + '.');
  return lines.join(' ');
}

export async function fallbackAnalysis(lang: Lang, message: string, context: unknown, history: Msg[] = []) {
  const text = await workersAi(rules(lang) + ' You are a restaurant business and finance consultant: explain the key numbers, then 3-5 concrete actions based only on the data.', context, history, message, 600);
  return { reply: text || analysisRules(lang, context), engine: (text ? 'workers-ai' : 'rules') as Engine };
}

// ---- Call AI and voice ----
export async function fallbackIntent(text: string): Promise<'yes' | 'no' | null> {
  const out = await workersAi('Classify a restaurant guest reply to "Will you come to your booking?". Answer with exactly one word: yes, no or unclear.', {}, [], text, 5);
  const word = lower(out).match(/\b(yes|no|unclear)\b/)?.[1];
  return word === 'yes' || word === 'no' ? word : null;
}

export async function fallbackTranscribe(base64: string, lang: Lang) {
  const ai = (env as unknown as { AI?: { run(model: string, input: unknown): Promise<any> } }).AI;
  if (!ai) return null;
  try {
    const out: any = await ai.run('@cf/openai/whisper-large-v3-turbo', { audio: base64, ...(lang === 'uz' ? {} : { language: lang }) });
    return typeof out?.text === 'string' && out.text.trim() ? out.text.trim().slice(0, 1400) : null;
  } catch {
    return null;
  }
}
