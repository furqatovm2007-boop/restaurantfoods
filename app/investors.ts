/*
 * /investors — "💼 Investorlar va Biznes-reja": the public pitch (what the platform is, the revenue model and
 * unit economics, the 12-month growth plan, answers to investors' questions). Static HTML in plain Uzbek,
 * printable on A4 / savable as PDF (public/investors.js). Figures are the company's plan, marked as such.
 */
const sum = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const REVENUE: [string, string, string][] = [
  ['Restoran oylik obunasi', `${sum(699000)} so‘m / oy`, `Kuniga atigi ${sum(23300)} so‘m`],
  ['Oldindan buyurtma va gullar', '3% komissiya', 'Faqat amalga oshgan savdodan'],
  ['3D Zal yaratib berish (VIP)', '1,9 – 5,9 mln so‘m', 'Bir martalik: 15 / 35 stol / ko‘p qavatli majmua'],
];
const COSTS: [string, string][] = [
  ['AI (GPT-6 Luna + GPT-6.1 Sol) va server, 1 restoran', `${sum(45000)} – ${sum(75000)} so‘m / oy`],
  ['Obuna daromadi, 1 restoran', `${sum(699000)} so‘m / oy`],
  ['Marja (AI va server xarajatidan keyin)', '≈ 90%'],
];
// The bar heights (public/investors.css .inv-h0–2) follow these monthly revenues: 23 / 115 / 400 mln.
const GROWTH: [string, number, string, number][] = [
  ['1–3 oylar', 20, '≈ 23 mln so‘m / oy', 23],
  ['4–6 oylar', 100, '≈ 115 mln so‘m / oy', 115],
  ['7–12 oylar', 350, '400+ mln so‘m / oy', 400],
];
const FAQ: [string, string][] = [
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

export function investorsHtml() {
  return `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Investorlar va Biznes-reja — RestaurantFoods</title><meta name="description" content="RestaurantFoods: restoranlarga mehmon olib kiruvchi platforma va Telegram Mini App — daromad modeli, unit-iqtisodiyot, 12 oylik o‘sish rejasi va investorlar savollariga javoblar."><link rel="icon" href="/favicon.ico?v=2"><link rel="stylesheet" href="/investors.css?v=1"><script src="/investors.js?v=1" defer></script></head><body>
<header class="inv-hero"><a class="inv-back" href="/#/discover">← restaurantfoods.online</a><p class="inv-eyebrow">💼 Investorlar va Biznes-reja · Pitch &amp; FAQ</p><h1>Mijozni restoranning o‘ziga olib kiruvchi yagona platforma</h1><p class="inv-lead"><b>restaurantfoods.online</b> — restoranda o‘tirib ovqatlanish va oldindan buyurtma berish, 2D / 3D zaldan stol tanlash, stolga guldasta yetkazish va AI kamera nazoratini birlashtirgan platforma hamda Telegram Mini App.</p><div class="inv-actions"><button type="button" class="inv-print" data-print>📥 PDF shaklida yuklab olish / Chop etish</button></div>
<ul class="inv-pills"><li>🪑 2D / 3D zal va stol tanlash</li><li>🍽️ Oldindan buyurtma</li><li>💐 Stolga guldasta</li><li>📷 Smart Vision AI</li><li>📞 Call AI tasdiqlash</li><li>✈️ Telegram Mini App</li></ul></header>
<main>
<section><h2>1. Loyiha mohiyati</h2><div class="inv-grid3"><article><b>Muammo</b><p>Restoranlarda kechqurun stollar to‘lib-toshadi, kunduzi bo‘sh turadi; mehmonlar bron qilib kelmay qoladi; yetkazib berish platformalari 30% komissiya oladi.</p></article><article><b>Yechim</b><p>Mehmon zal xaritasidan aniq stolni tanlaydi, onlayn zaklad bilan bron qiladi, taomni oldindan buyurtma qiladi va kelganda QR-chipta bilan o‘tiradi.</p></article><article><b>Natija</b><p>Restoran ko‘proq mehmon va oldindan tushum oladi, kelmay qolish kamayadi, Smart Vision esa zal holatini jonli ko‘rsatadi.</p></article></div></section>
<section><h2>2. Daromad modeli</h2><table><thead><tr><th>Manba</th><th>Narx</th><th>Izoh</th></tr></thead><tbody>${REVENUE.map((r) => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td></tr>`).join('')}</tbody></table>
<h3>Unit-iqtisodiyot (1 restoran)</h3><table><tbody>${COSTS.map((r) => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join('')}</tbody></table>
<div class="inv-margin" role="img" aria-label="Xarajat obunaning taxminan 10 foizi, marja taxminan 90 foiz"><span class="inv-cost">≈10%</span><span class="inv-profit">≈90% marja</span></div><p class="inv-note">Xarajat: AI modellari va server. Marja = obuna − AI va server xarajati.</p></section>
<section><h2>3. 12 oylik o‘sish rejasi</h2><div class="inv-bars">${GROWTH.map((g, i) => `<div class="inv-bar"><span class="inv-bar-fill inv-h${i}"><b>${g[2]}</b></span><small>${g[0]}<br>${g[1]}${g[1] >= 350 ? '+' : ''} ta restoran</small></div>`).join('')}</div>
<table><thead><tr><th>Davr</th><th>Restoranlar</th><th>Oylik tushum (reja)</th></tr></thead><tbody>${GROWTH.map((g) => `<tr><td>${g[0]}</td><td>${g[1]}${g[1] >= 350 ? '+' : ''}</td><td><b>${g[2]}</b></td></tr>`).join('')}</tbody></table><p class="inv-note">Tushum: obuna + 3% komissiya + 3D zal xizmati. Bu kompaniyaning rejasi (prognoz), kafolat emas.</p></section>
<section><h2>4. Investorlarning 10 ta savoliga javob</h2><div class="inv-faq">${FAQ.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${i + 1}. ${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</div></section>
</main><footer class="inv-foot"><p>RestaurantFoods · restaurantfoods.online · ${new Date().getFullYear()}</p></footer></body></html>`;
}
