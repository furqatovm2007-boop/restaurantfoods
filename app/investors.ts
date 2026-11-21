import { planSections, planHead, planLang, langLinks } from './plan-content';
/*
 * /investors — "💼 Investorlar va Biznes-reja": the public pitch (what the platform is, the revenue model and
 * unit economics, the 12-month growth plan, answers to investors' questions). Static HTML in plain Uzbek,
 * printable on A4 / savable as PDF (public/investors.js). Figures are the company's plan, marked as such.
 */
const sum = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const REVENUE: [string, string, string][] = [
  ['Restoran oylik obunasi', `${sum(699000)} so‘m / oy`, `Kuniga atigi ${sum(23300)} so‘m`],
  ['Oldindan buyurtma va gullar', '3% komissiya', 'Faqat amalga oshgan savdodan'],
  ['3D Zal yaratib berish (VIP)', '1,9 – 5,9 mln so‘m', 'Bir martalik: 15 / 35 stol / ko‘p qavatli majmua'],
];
export const COSTS: [string, string][] = [
  ['AI (GPT-6 Luna + GPT-6.1 Sol) va server, 1 restoran', `${sum(45000)} – ${sum(75000)} so‘m / oy`],
  ['Obuna daromadi, 1 restoran', `${sum(699000)} so‘m / oy`],
  ['Marja (AI va server xarajatidan keyin)', '≈ 90%'],
];
// The bar heights (public/investors.css .inv-h0–2) follow these monthly revenues: 23 / 115 / 400 mln.
export const GROWTH: [string, number, string, number][] = [
  ['1–3 oylar', 20, '≈ 23 mln so‘m / oy', 23],
  ['4–6 oylar', 100, '≈ 115 mln so‘m / oy', 115],
  ['7–12 oylar', 350, '400+ mln so‘m / oy', 400],
];
export const FAQ: [string, string][] = [
  [
    'Yandex Eats va Uzum Tezkordan farqingiz nimada?',
    'Ular ovqatni uyga yetkazadi va har bir buyurtmadan taxminan 30% komissiya oladi. Biz esa mehmonni restoranning o‘ziga olib kiramiz: stol bron qilish, oldindan buyurtma, stolga guldasta. Restoran 699 000 so‘m oylik obuna va faqat amalga oshgan savdodan 3% to‘laydi.',
  ],
  ['Restoran nega obuna uchun pul to‘laydi?', 'Bo‘sh stollar to‘ladi, mehmon kelmasdan oldin taom buyurtma qiladi (oshxona tayyor turadi), kelmay qolishlar kamayadi, tug‘ilgan kun mijozlari qaytib keladi. Hammasi bitta kabinetda: bron, kassa, jonli zal xaritasi, AI tahlil.'],
  [
    'Kelmay qolish (No-Show) muammosi qanday hal qilinadi?',
    'Uch qatlamli himoya: onlayn bron kamida 1 soat oldin yopiladi; tanlangan stol 5 daqiqa ushlab turiladi va to‘lanmasa avtomatik bo‘shaydi; bron vaqtiga 2 soat qolganda Call AI mijozga qo‘ng‘iroq qilib, kelishini tasdiqlatadi. Onlayn zaklad (Payme / Click) bilan mehmon jiddiy bron qiladi.',
  ],
  [
    'Jonli navbat va onlayn bron to‘qnashmaydimi?',
    'Yo‘q. 70/30 qoidasi: egasi stollarning ≈30% ini «Faqat jonli mehmonlar (Walk-in) uchun» deb belgilaydi — ular onlayn bron qilinmaydi. Onlayn bron 1 soat oldin yopiladi; bron mijozi 10 daqiqa ichida kelmasa, hostess stolni bir bosishda jonli mehmonga beradi. Stol hali tayyor bo‘lmasa, mijozga Telegram’da «5 daqiqa kuting» xabari va bepul ichimlik kuponi boradi (virtual kutish zali).',
  ],
  ['Smart Vision kameralari uchun qo‘shimcha xarajat bormi?', 'Restoranning mavjud kameralari 0 so‘m qo‘shimcha xarajat bilan ulanadi. AI to‘g‘ridan-to‘g‘ri qurilmada ishlaydi va stollarni «Bo‘sh / Band» deb belgilaydi; kamera tasviri serverga yuborilmaydi.'],
  ['Tug‘ilgan kun CRM qanday ishlaydi va suiiste’moldan qanday himoyalangan?', 'Mijoz tug‘ilgan kunida 15% chegirma oladi. Tug‘ilgan sana bir marta kiritiladi va keyin o‘zgartirilmaydi — har oy «tug‘ilgan kun» qilib chegirma olishning iloji yo‘q.'],
  ['3D Zal xizmati nima?', 'Mutaxassislar zalni o‘lchab, uning 3D modelini yaratib tizimga ulaydi: mijoz zal ichini 3D ko‘rinishda aylanib stol tanlaydi. Bu bir martalik VIP xizmat: 1,9 / 3,5 / 5,9 mln so‘m. Qolgan restoranlar premium 2D zal sxemasidan foydalanadi.'],
  ['AI va server xarajatlari qancha?', 'Bitta restoranga oyiga taxminan 45 000 – 75 000 so‘m (AI modellari va server). 699 000 so‘m obunaga nisbatan bu ≈ 90% marja beradi.'],
  ['Mijozlar ilova o‘rnatishi shartmi?', 'Yo‘q. Sayt Telegram Mini App sifatida ishlaydi: mijoz botdan bir bosishda kiradi, kod so‘ralmaydi, telefon raqami Telegramning o‘zi orqali tasdiqlanadi. Bronlar va QR-chek botda ham ko‘rinadi.'],
  ['Restoran qanday ulanadi va qancha vaqt oladi?', 'Restoran egasi ro‘yxatdan o‘tib, restoranini qo‘shadi va 14 kunlik bepul Premium sinovni oladi. Zal sxemasini 2D konstruktorda bir necha daqiqada o‘zi joylashtiradi, menyuni yuklaydi — keyin bron qabul qila boshlaydi.'],
];

/*
 * The page itself (since the MVP pricing update): every section comes from app/plan-content.ts — the same
 * renderer the admin's PDF (/business-plan) uses, so both say exactly the same, in UZ / RU / EN (?lang=).
 * The older pitch data above (699 000 obuna, 12-month bars, FAQ) is kept for reference, no longer shown.
 */
export function investorsHtml(langRaw?: unknown) {
  const lang = planLang(langRaw),
    d = planHead(lang);
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${d.rich(d.title)}</title><meta name="description" content="${d.rich(d.h1)}"><link rel="icon" href="/favicon.ico?v=2"><link rel="stylesheet" href="/investors.css?v=3"><script src="/investors.js?v=2" defer></script></head><body>
<header class="inv-hero"><div class="inv-top"><a class="inv-back" href="/${lang}#/discover">${d.rich(d.back)}</a>${langLinks('/investors', lang)}</div><p class="inv-eyebrow">${d.rich(d.eyebrow)}</p><h1>${d.rich(d.h1)}</h1><p class="inv-lead">${d.rich(d.lead)}</p><div class="inv-actions"><button type="button" class="inv-print" data-print>${d.rich(d.print)}</button></div>
<ul class="inv-pills">${d.pills.map((x) => `<li>${d.rich(x)}</li>`).join('')}</ul></header>
<main>${planSections(lang, (inner) => `<section>${inner}</section>`)}</main><footer class="inv-foot"><p>RestaurantFoods · restaurantfoods.online · ${new Date().getFullYear()}</p></footer></body></html>`;
}
