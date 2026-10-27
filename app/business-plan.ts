/*
 * Investor business plan (A4, print-ready). Everything is rendered on the server as static HTML with
 * inline SVG charts, so "Print / Save as PDF" in any browser gives the same document. The forecast
 * numbers come from forecast() below with the assumptions stated in the document.
 */
export const USD_RATE = 12800; // so'm per $1: $20,000 = 256,000,000 so'm
export const INVESTMENT_USD = 20000;

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const sum = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
const mln = (n: number) => (n / 1e6).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).replace(/ /g, ' ');
const usd = (n: number) => '$' + n.toLocaleString('en-US');

export const BUDGET = [
  { name: 'Dasturlash: Backend, Frontend, AI va iOS/Android ilovalar', usd: 6880, color: '#14b8a6', items: [['Backend, kassa va to‘lov integratsiyalari (Workers, D1, API, xavfsizlik)', 1600], ['Frontend va 3D (zal, 3D menyu kitobi, 5 ta rol kabineti)', 1300], ['AI: Smart Vision, Call AI, o‘zbekcha ovoz va matn, zaxira AI', 1500], ['iOS va Android ilovalar (PWA → do‘kon ilovalari)', 1600], ['Yangi imkoniyatlar: onlayn zaklad, dekoratsiyalar, avto yetkazish vaqti, 3D menyu kattalashtirish', 880]] },
  { name: 'Serverlar va AI xizmatlari (1 yil)', usd: 2800, color: '#38bdf8', items: [['Cloudflare Paid (Workers, D1, R2, Workers AI)', 500], ['OpenAI API (matn, tabiiy ovoz, nutqni tanish)', 900], ['Call AI / Vapi telefoniya daqiqalari', 900], ['Apple App Store (yillik)', 99], ['Google Play (bir martalik)', 25], ['SMS (Eskiz) va xarita API', 376]] },
  { name: 'Pilot restoranlar: noutbuklar va kassa uskunalari', usd: 2120, color: '#a78bfa', items: [['Noutbuklar — har 5–6 restoranga 1 ta, o‘rnatib beramiz (2 dona × $550): kamera, zal kassasi va hostess ekrani', 1100], ['80 mm termal chek printerlari (5 dona × $80)', 400], ['Shtrix-kod skanerlari (5 dona × $40)', 200], ['O‘rnatish, kronshteyn, tarmoq', 420]] },
  { name: 'Marketing, target, promo-video va B2B sotuv jamoasi', usd: 5800, color: '#f59e0b', items: [['Target reklama (Instagram, Telegram, Google)', 2800], ['Promo-video va kontent', 900], ['B2B sotuv jamoasi (2 kishi × 4 oy)', 1600], ['Tadbirlar va bosma materiallar', 500]] },
  { name: 'Yuridik, to‘lov/fiskal integratsiya, xavfsizlik va zaxira', usd: 2400, color: '#f43f5e', items: [['MChJ ro‘yxatdan o‘tkazish va yuridik xizmat', 300], ['Patent / tovar belgisi', 400], ['Click, Payme, Uzum va OFD (fiskal chek) integratsiyasi', 700], ['Xavfsizlik auditi va ma’lumotlar himoyasi', 300], ['Operatsion zaxira', 700]] },
];

export const PLAN_ROWS: [string, string | number, string | number, string | number][] = [
  ['Narx (so‘m / oy)', '199 000', '399 000', '699 000'],
  ['Restoran sahifasi, menyu, onlayn bron', 1, 1, 1],
  ['Telegram bildirishnomalari, QR chipta va raqamli chek', 1, 1, 1],
  ['2 soatlik qoida, karta kafolati va avtomatik jarima', 1, 1, 1],
  ['3D menyu (to‘liq ekran)', 0, 1, 1],
  ['Admin AI yordamchi', 0, '30 / kun', 'Cheksiz'],
  ['Tig‘iz vaqt depoziti', 0, 1, 1],
  ['Stollarni birlashtirish (katta kompaniyalar)', 0, 1, 1],
  ['Tug‘ilgan kun CRM + promokod', 0, 1, 1],
  ['Xodimlar: Hostess, Ofitsiant, Menejer', 0, 1, 1],
  ['AI haftalik analitika', 0, '1 / kun', 'Cheksiz'],
  ['AI Smart Vision kamera va jonli stollar xaritasi', 0, 0, 1],
  ['Multi-camera va avtomatik saqlash', 0, 0, 1],
  ['AI Service Timer (7 daqiqa nazorat)', 0, 0, 1],
  ['3D zal va stoldan ko‘rinish (panorama)', 0, 0, 1],
  ['Call AI — 2 soat oldin ovozli tasdiqlash', 0, 0, 1],
  ['VIP mijoz dosyesi', 0, 0, 1],
  ['Bo‘sh soatlarni to‘ldirish (avto chegirma)', 0, 0, 1],
  ['Mijozlar uchun ovozli 3D AI robot', 0, 0, 1],
  ['Zal kassasi: stollar, zakaz, xizmat haqi, 80 mm chek', 1, 1, 1],
  ['Do‘kon kassasi (POS): skaner, ombor, Payme/Click/Uzum QR', 1, 1, 1],
  ['Stop-list va 4 bosqichli jonli buyurtma kuzatuvi', 1, 1, 1],
  ['Stolni 5 daqiqa ushlab turish va offline QR chipta', 1, 1, 1],
  ['Ofitsiantni chaqirish / hisobni so‘rash tugmasi', 1, 1, 1],
];

interface Month {
  m: number;
  restaurants: number;
  subs: number;
  setup: number;
  flowers: number;
  revenue: number;
  costs: number;
  net: number;
  cumulative: number;
}
/**
 * Forecast. Assumptions (stated in the document): paying restaurants per month, Business/Premium mix,
 * a one-time 2 000 000 so'm Smart Vision set-up fee for each new Premium restaurant, flower GMV with a
 * 3% commission, costs = 9 mln so'm fixed + 12% of revenue (payment fees, sales commissions, support).
 */
export function forecast(restaurants: number[], flowerGmvMln: number[], premiumShare: number, setupFee: number): Month[] {
  const arpu = (1 - premiumShare) * 399000 + premiumShare * 699000;
  let prev = 0,
    cumulative = -INVESTMENT_USD * USD_RATE;
  return restaurants.map((n, i) => {
    const added = n - prev;
    prev = n;
    const subs = n * arpu,
      setup = Math.round(added * premiumShare) * setupFee,
      flowers = flowerGmvMln[i] * 1e6 * 0.03;
    const revenue = subs + setup + flowers,
      costs = 9_000_000 + 0.12 * revenue,
      net = revenue - costs;
    cumulative += net;
    return { m: i + 1, restaurants: n, subs, setup, flowers, revenue, costs, net, cumulative };
  });
}
export const TARGET = forecast([15, 35, 60, 88, 118, 150, 180, 210, 240, 270, 300, 330], [5, 12, 22, 35, 50, 65, 80, 95, 110, 125, 140, 155], 0.45, 2_000_000);
export const CONSERVATIVE = forecast([4, 10, 18, 28, 40, 55, 70, 86, 102, 118, 135, 152], [0, 5, 10, 18, 28, 40, 55, 70, 85, 100, 118, 135], 0.4, 1_500_000);
const paybackMonth = (rows: Month[]) => rows.find((r) => r.cumulative >= 0)?.m ?? null;

// ---- SVG charts ----
function donut() {
  const total = BUDGET.reduce((s, b) => s + b.usd, 0);
  let angle = -Math.PI / 2;
  const R = 80,
    r = 48,
    cx = 100,
    cy = 100;
  const arcs = BUDGET.map((b) => {
    const a = (b.usd / total) * Math.PI * 2,
      a2 = angle + a;
    const p = (ang: number, rad: number) => `${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`;
    const large = a > Math.PI ? 1 : 0;
    const d = `M${p(angle, R)} A${R},${R} 0 ${large} 1 ${p(a2, R)} L${p(a2, r)} A${r},${r} 0 ${large} 0 ${p(angle, r)} Z`;
    angle = a2;
    return `<path d="${d}" fill="${b.color}"><title>${esc(b.name)}: ${usd(b.usd)}</title></path>`;
  }).join('');
  return `<svg viewBox="0 0 200 200" class="donut" role="img" aria-label="Xarajatlar taqsimoti">${arcs}<text x="100" y="96" text-anchor="middle" class="donut-total">$20 000</text><text x="100" y="114" text-anchor="middle" class="donut-sub">256 mln so‘m</text></svg>`;
}

function barChart(rows: Month[]) {
  const W = 640,
    H = 260,
    pad = { l: 46, r: 12, t: 14, b: 30 };
  const max = Math.max(...rows.map((r) => r.revenue)) * 1.1,
    min = Math.min(0, ...rows.map((r) => r.net));
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - (v - min) / (max - min));
  const bw = (W - pad.l - pad.r) / rows.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + (max - min) * f);
  const grid = ticks.map((v) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="grid"/><text x="${pad.l - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" class="axis">${Math.round(v / 1e6)}</text>`).join('');
  const bars = rows
    .map((r, i) => {
      const x = pad.l + i * bw;
      return `<rect x="${(x + bw * 0.12).toFixed(1)}" y="${y(r.revenue).toFixed(1)}" width="${(bw * 0.38).toFixed(1)}" height="${(y(0) - y(r.revenue)).toFixed(1)}" class="bar-rev"><title>${r.m}-oy daromad: ${mln(r.revenue)} mln</title></rect><rect x="${(x + bw * 0.52).toFixed(1)}" y="${y(Math.max(0, r.net)).toFixed(1)}" width="${(bw * 0.38).toFixed(1)}" height="${Math.abs(y(0) - y(r.net)).toFixed(1)}" class="${r.net >= 0 ? 'bar-net' : 'bar-loss'}"><title>${r.m}-oy sof foyda: ${mln(r.net)} mln</title></rect><text x="${(x + bw / 2).toFixed(1)}" y="${H - 10}" text-anchor="middle" class="axis">${r.m}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Oylik daromad va sof foyda, mln so‘m">${grid}<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" class="zero"/>${bars}</svg>`;
}

function lineChart(a: Month[], b: Month[]) {
  const W = 640,
    H = 240,
    pad = { l: 52, r: 12, t: 14, b: 30 };
  const vals = [...a, ...b].map((r) => r.cumulative);
  const max = Math.max(...vals) * 1.08,
    min = Math.min(...vals) * 1.08;
  const x = (m: number) => pad.l + ((W - pad.l - pad.r) * (m - 1)) / 11;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - (v - min) / (max - min));
  const path = (rows: Month[]) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(r.m).toFixed(1)},${y(r.cumulative).toFixed(1)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + (max - min) * f);
  const grid = ticks.map((v) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="grid"/><text x="${pad.l - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" class="axis">${Math.round(v / 1e6)}</text>`).join('');
  const labels = a.map((r) => `<text x="${x(r.m).toFixed(1)}" y="${H - 10}" text-anchor="middle" class="axis">${r.m}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Jamg‘arilgan pul oqimi, mln so‘m">${grid}<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" class="zero"/><path d="${path(b)}" class="line-cons"/><path d="${path(a)}" class="line-target"/>${a.map((r) => `<circle cx="${x(r.m).toFixed(1)}" cy="${y(r.cumulative).toFixed(1)}" r="3" class="dot-target"/>`).join('')}${labels}</svg>`;
}

const mark = (v: string | number) => (v === 1 ? '<span class="yes">✓</span>' : v === 0 ? '<span class="no">—</span>' : `<b>${esc(v)}</b>`);

export function businessPlanHtml(today = new Date()) {
  const date = today.toLocaleDateString('ru-RU', { timeZone: 'Asia/Tashkent' });
  const total = BUDGET.reduce((s, b) => s + b.usd, 0);
  const pbTarget = paybackMonth(TARGET),
    pbCons = paybackMonth(CONSERVATIVE);
  const breakEven = TARGET.find((r) => r.net > 0)?.m ?? null;
  const y1 = TARGET.reduce((s, r) => s + r.revenue, 0),
    y1net = TARGET.reduce((s, r) => s + r.net, 0);
  const forecastRows = (rows: Month[]) => rows.map((r) => `<tr class="${r.cumulative >= 0 ? 'pos' : ''}"><td>${r.m}</td><td>${r.restaurants}</td><td>${mln(r.subs)}</td><td>${mln(r.setup)}</td><td>${mln(r.flowers)}</td><td><b>${mln(r.revenue)}</b></td><td>${mln(r.costs)}</td><td class="${r.net >= 0 ? 'good' : 'bad'}">${mln(r.net)}</td><td class="${r.cumulative >= 0 ? 'good' : 'bad'}">${mln(r.cumulative)}</td></tr>`).join('');
  const qa = [
    ['Restoranlar oyiga 399–699 ming so‘m to‘lashga tayyormi?', 'Bitta kelmay qolgan 6 kishilik bron restoranga 600 000–1 500 000 so‘m yo‘qotish. Avtomatik jarima va Call AI tasdiqlashi oyiga bir nechta shunday holatni oldini olsa, tarif o‘zini qoplaydi. Pilotda buni raqamlar bilan ko‘rsatamiz: 14 kunlik bepul Premium sinov.'],
    ['Mijoz jarima to‘lashni xohlamasa-chi?', 'Qoidalar bron oynasida qizil rangda ko‘rsatiladi va mijoz belgilash orqali rozilik beradi. Karta Payme orqali tokenlanadi — karta raqami bizning serverga tushmaydi. Bepul bekor qilish 2 soatgacha ochiq; jarima faqat kech bekor qilish yoki kelmaslikda va restoran hisobiga tushadi.'],
    ['Kamera — maxfiylik muammosi emasmi?', 'Smart Vision kadrlarni serverga yubormaydi: odamni aniqlash qurilmaning o‘zida (brauzerda) bajariladi, serverga faqat “bo‘sh / band / tozalanmoqda” holati boradi. Yuz tanish yo‘q, video saqlanmaydi.'],
    ['Raqobatchilar (yetkazib berish ilovalari, Google Maps, kassa dasturlari) bunday qila oladimi?', 'Ular yoki buyurtma va xaritaga, yoki faqat kassaga ixtisoslashgan. Bizda bitta tizimda: onlayn bron va zaldagi real holat (kamera), jarima/kafolat, Call AI, zal kassasi va POS, 3D zal va o‘zbek tilida tabiiy ovozli AI. Bu restoranning butun ichki operatsiyasini qamraydigan B2B vosita.'],
    ['Nega aynan $20 000?', 'Mahsulotning asosiy qismi allaqachon ishlab turibdi (restaurantfoods.online): bron, 3D zal, AI, zal kassasi va POS. Mablag‘ yangi mahsulot yaratishga emas — do‘kon ilovalari, 1 yillik serverlar va AI xizmatlari, 10 ta pilot restoran uchun noutbuklar (har 5–6 restoranga bittadan), chek printeri va skanerlar hamda sotuvga sarflanadi. Har bir yo‘nalish smetada dollargacha ko‘rsatilgan.'],
    ['Investitsiya qachon qaytadi?', `Maqsadli ssenariyda ${pbTarget ?? '—'}-oyda, konservativ ssenariyda ${pbCons ?? '—'}-oyda. Oylik foyda maqsadli ssenariyda ${breakEven ?? '—'}-oydan ijobiy. Taxminlar hujjatda ochiq yozilgan va har oy haqiqiy ko‘rsatkichlar bilan solishtiriladi.`],
    ['Asosiy xavf nima va uni qanday kamaytirasiz?', 'Sotuv tezligi. Shuning uchun byudjetning 29% marketing va B2B sotuvga, 11% pilot uskunalarga ajratilgan: birinchi 10 restoranga noutbuk (har 5–6 restoranga bittadan — kamera, kassa va hostess ekrani), chek printeri va skanerni bepul o‘rnatib, natijani keyingi mijozlarga ko‘rsatamiz. Texnik xavf past — infratuzilma Cloudflare’da, AI uchun ichki zaxira bor, xarajat foydalanishga qarab o‘sadi.'],
  ];
  return `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>RestaurantFoods — Biznes-reja</title><link rel="stylesheet" href="/business-plan.css?v=2"></head><body>
<div class="toolbar no-print"><a href="/#/admin">← Admin panel</a><button type="button" id="printPlan">📥 PDF yuklab olish / Chop etish</button></div>
<main class="doc">
<section class="page cover">
  <p class="eyebrow">Investorlar uchun · Startap himoyasi</p>
  <h1>RestaurantFoods</h1>
  <p class="subtitle">Restoranlar uchun sun’iy intellektli bron, zal kassasi, nazorat va mijoz xizmati platformasi</p>
  <div class="kpis"><div><small>Investitsiya</small><b>$20 000</b><span>256 000 000 so‘m</span></div><div><small>Investitsiya qaytishi</small><b>${pbTarget ?? '—'}-oy</b><span>maqsadli ssenariy</span></div><div><small>1-yil daromadi</small><b>${mln(y1)} mln</b><span>so‘m, prognoz</span></div><div><small>1-yil sof foydasi</small><b>${mln(y1net)} mln</b><span>so‘m, prognoz</span></div></div>
  <p class="meta">restaurantfoods.online · Samarqand, O‘zbekiston · ${esc(date)} · Kurs: $1 = ${sum(USD_RATE)} so‘m</p>
  <ol class="toc"><li>Loyiha tavsifi va texnologiya</li><li>Moliya, qoidalar va to‘lov xavfsizligi</li><li>AI: Call AI, mijoz roboti, o‘zbekcha ovoz; Gullar va rollar</li><li>Restoran operatsiyasi: zal kassasi, POS va bron himoyasi</li><li>Tariflar taqqoslamasi</li><li>$20 000 xarajatlar smetasi</li><li>12 oylik moliyaviy prognoz</li><li>Pitch nutqi va 7 ta qiyin savol-javob</li></ol>
</section>

<section class="page">
  <h2><span>1</span> Loyiha tavsifi</h2>
  <p><b>restaurantfoods.online</b> — restoranlar uchun yagona onlayn platforma: mijoz stolni 2D/3D zal rejasidan tanlab bron qiladi, taom va gul buyurtma beradi; restoran esa zaldagi real holatni AI kamera orqali ko‘radi, bronlarni boshqaradi va kelmay qolgan mijozlardan yo‘qotishni jarima tizimi bilan qoplaydi. Mahsulot ishlab turibdi: Cloudflare Workers + D1 + R2, Telegram bot, Payme/Click/Uzum, OpenAI matn va tabiiy ovoz modellari, Cloudflare Workers AI zaxirasi. Sayt o‘zbek, rus va ingliz tillarida, kunduzgi/tungi rejimda va telefon ilovasi (PWA) sifatida ishlaydi.</p>
  <h3>Muammo</h3>
  <ul><li>Bron qilib kelmay qolgan mijozlar (no-show) restoranning eng band soatlarida stollarni bo‘sh qoldiradi.</li><li>Administrator zalda qaysi stol bo‘shligini real vaqtda bilmaydi; onlayn bron va jonli mehmonlar to‘qnashadi.</li><li>Ofitsiant kechikishi mijoz tajribasini buzadi, egasi buni o‘z vaqtida bilmaydi.</li><li>Bron, zal hisoblari va kassa alohida dasturlarda — ma’lumot bir joyda emas, chek va hisobot qo‘lda.</li></ul>
  <h3>Yechim — AI Smart Vision kamera</h3>
  <table class="grid-table"><tbody>
    <tr><th>Aniqlash</th><td>Mijoz stolga o‘tirganidan <b>3 soniya</b> ichida stol holati avtomatik o‘zgaradi. Odamni aniqlash qurilmaning o‘zida (TensorFlow.js, COCO-SSD) bajariladi.</td></tr>
    <tr><th>Ranglar</th><td><span class="chip red">Qizil — band</span> <span class="chip yellow">Sariq — tozalanmoqda</span> <span class="chip blue">Ko‘k — onlayn bron</span> <span class="chip green">Yashil — bo‘sh</span></td></tr>
    <tr><th>Yangilanish</th><td>Jonli xarita har <b>15 soniyada</b> yangilanadi; kamera holati o‘zgarganda darhol yuboriladi.</td></tr>
    <tr><th>Band stolni bloklash</th><td>Kamera “band” deb ko‘rgan stolni keyingi 2 soatga onlayn bron qilib bo‘lmaydi — to‘qnashuv yo‘q.</td></tr>
    <tr><th>Multi-camera</th><td>Bir nechta kamera (qurilma kamerasi yoki IP-oqim), har birining zonalari ma’lumotlar bazasida <b>avtomatik saqlanadi</b>, uzilishda avtomatik qayta ulanadi.</td></tr>
    <tr><th>AI Service Timer</th><td>Mijoz o‘tirgach taymer ishga tushadi; <b>7 daqiqa</b> ichida ofitsiant yaqinlashmasa, egasi va menejerga Telegram hamda kabinetda signal: “⚠️ 5-stolda mijoz 7 daqiqadan beri kutmoqda!”.</td></tr>
  </tbody></table>
  <h3>Bozor va daromad modeli</h3>
  <p>Birinchi bosqich — Samarqand va Toshkentdagi o‘rta va premium segment restoranlari, kafelar, choyxonalar. Daromad: oylik obuna (Start / Business / Premium), Premium uchun bir martalik Smart Vision o‘rnatish to‘lovi, Gullar bo‘limidan 3% komissiya. Zal kassasi va POS barcha tariflarda bor — restoran bitta tizimdan chiqmaydi, bu esa obunani uzoq saqlaydi.</p>
</section>

<section class="page">
  <h2><span>2</span> Moliya, qoidalar va to‘lov xavfsizligi</h2>
  <h3>2 soatlik bekor qilish qoidasi</h3>
  <p>Bron boshlanishiga <b>2 soat va undan ko‘p</b> qolganda mijoz ilovada bepul bekor qiladi. 2 soatdan kam qolganda ilova orqali bekor qilib bo‘lmaydi — mijoz restoranga qo‘ng‘iroq qiladi, xodim “Bekor qilish va jarimani yechish” tugmasini bosadi va kelishilgan jarima avtomatik yechiladi.</p>
  <h3>Karta ulash va avtomatik jarima</h3>
  <p>Bron qilishda mijoz bank kartasini Payme orqali ulaydi (karta raqami serverga tushmaydi, faqat token saqlanadi) va jarima qoidalariga rozilik beradi. Jarima <b>to‘g‘ridan-to‘g‘ri restoran balansiga</b> yoziladi.</p>
  <table class="data"><thead><tr><th>Bekor qilish vaqti</th><th>Jarima</th><th>Kimga</th></tr></thead><tbody>
    <tr><td>2 soat va undan oldin</td><td class="good">Bepul</td><td>—</td></tr>
    <tr><td>1,5 soat qolganda (2 soatdan kam)</td><td><b>50 000 so‘m</b></td><td>Restoran</td></tr>
    <tr><td>1 soat qolganda</td><td><b>100 000 so‘m</b></td><td>Restoran</td></tr>
    <tr><td>30 daqiqa va kam qolganda / kelmaslik</td><td><b>150 000 so‘m</b></td><td>Restoran</td></tr>
  </tbody></table>
  <h3>Raqamli chek va QR-kod chiptasi</h3>
  <p>Har bir bron uchun raqamli chek (oldindan buyurtma qilingan taomlar, xizmat haqi, chegirma, depozit hisobi) va QR-chipta beriladi. Hostess eshikda QR’ni skanerlaydi — mijoz “keldi” deb belgilanadi, stol jonli xaritada band bo‘ladi. Chek PDF ko‘rinishida yuklab olinadi va chop etiladi.</p>
  <h3>Qo‘shimcha moliyaviy vositalar (Business/Premium)</h3>
  <ul><li><b>Tig‘iz vaqt depoziti:</b> Juma/Shanba kechasi yoki bayram kunlari uchun majburiy depozit, chekda hisobga olinadi.</li><li><b>Tug‘ilgan kun CRM:</b> 3 kun oldin Telegram orqali shaxsiy promokod.</li><li><b>Bo‘sh soatlarni to‘ldirish:</b> zal 70% bo‘sh bo‘lsa, avtomatik chegirma banneri.</li></ul>
</section>

<section class="page">
  <h2><span>3</span> AI: Call AI, mijoz roboti, o‘zbekcha ovoz; Gullar va rollar</h2>
  <h3>Call AI — 2 soat oldin ovozli tasdiqlash (Premium)</h3>
  <p>Bron boshlanishiga 2 soat qolganda tizim avtomatik (har 5 daqiqalik tekshiruv) mijozga murojaat qiladi: Telegram’da AI ovozli xabar va 3 tugma (jonli AI qo‘ng‘iroq / “Ha, boraman” / “Bora olmayman”), saytda telefon qo‘ng‘irog‘iga o‘xshash jonli AI suhbat (nutqni tanish), Vapi ulangan bo‘lsa — oddiy telefon qo‘ng‘irog‘i. “Ha” — bron tasdiqlanadi; “Yo‘q” yoki javob bo‘lmasa — restoranga darhol xabar.</p>
  <h3>Mijoz AI roboti</h3>
  <p>3D ovozli robot o‘zbek, rus va ingliz tillarida suhbatlashadi: restoran va taom tanlashga yordam beradi, bo‘sh stollarni tekshiradi, menyuni ko‘rsatadi. Buyurtma, bron va to‘lovni mijoz o‘zi tasdiqlaydi — AI hech narsani o‘zicha bajarmaydi.</p>
  <h3>AI yangilanishi</h3>
  <ul><li><b>Tabiiy o‘zbekcha ovoz:</b> javoblar ayol yoki erkak ovozida (OpenAI TTS) o‘qiladi, nutq matnga aylantiriladi; ovozni bir tugma bilan o‘chirish mumkin.</li><li><b>Vazifaga qarab modellar:</b> mijoz bilan tezkor model, restoran tahlili va maslahat uchun kuchli model; har birining zaxira modeli bor.</li><li><b>Ichki zaxira AI:</b> tashqi AI ishlamay qolsa ham Cloudflare Workers AI (Llama 3.3, Gemma 3, Whisper) va restoran ma’lumotlari asosidagi qoidalar javob beradi — xizmat to‘xtamaydi.</li><li><b>Admin AI holati:</b> kalit shifrlangan holda saqlanadi, admin panelda AI holati va zaxiraga o‘tish ko‘rinadi.</li></ul>
  <h3>Gullar bo‘limi (Flowers) — 3% komissiya</h3>
  <p>Gulchilar o‘z postlarini joylaydi; mijoz gulni bron qilingan stolga yoki uyiga yetkazishni kartadan to‘laydi. Har bir buyurtmadan <b>3% platformaga</b>, 97% gulchiga. Buyurtma gulchi, kuryer va admin kabinetida bir vaqtda ko‘rinadi.</p>
  <h3>5 xil rol</h3>
  <table class="data"><thead><tr><th>Rol</th><th>Imkoniyatlar</th></tr></thead><tbody>
    <tr><td><b>Mijoz</b></td><td>Bron (2D/3D), taom va gul buyurtmasi, karta, QR chipta, chek, Telegram bildirishnomalari, AI robot</td></tr>
    <tr><td><b>Restoran</b></td><td>Kabinet: menyu, stollar, bronlar, jonli xarita, kamera, jarimalar balansi, xodimlar (Hostess / Ofitsiant / Menejer), AI analitika</td></tr>
    <tr><td><b>Gulchi</b></td><td>Gul postlari, buyurtmalar, daromad (komissiyadan keyin)</td></tr>
    <tr><td><b>Kuryer</b></td><td>Taom va gul yetkazish, GPS kuzatuv, holatni bir bosishda yangilash</td></tr>
    <tr><td><b>Administrator</b></td><td>Restoran, gulchi va kuryerlarni tasdiqlash, tariflar, AI holati, blog, Telegram bot sozlamalari</td></tr>
  </tbody></table>
  <p class="note">Barcha foydalanuvchilar mijoz sifatida ro‘yxatdan o‘tadi (email, Google yoki Telegram orqali bir bosishda); Restoran, Gulchi va Kuryer huquqini faqat administrator tasdiqlaydi.</p>
</section>

<section class="page">
  <h2><span>4</span> Restoran operatsiyasi: zal kassasi, POS va bron himoyasi</h2>
  <h3>Zal kassasi</h3>
  <p>Ofitsiant telefon yoki noutbukda barcha stollarni holati bilan ko‘radi: <span class="chip green">Bo‘sh</span> <span class="chip red">Band</span> <span class="chip blue">Bron qilingan</span> (mijoz ismi, telefoni, vaqti). Stolni ochib, menyudan rasm va kategoriyalar bo‘yicha taom qo‘shadi, izoh yozadi, “Zakazni saqlash” bilan hisobni yuritadi. Xizmat haqi 0 / 10 / 15%. “Hisobni yopish va Chek chiqarish” — stol bo‘shaydi, 80 mm chek QR-kod bilan chop etiladi, mijozga Telegram yoki SMS orqali elektron chek yuboriladi.</p>
  <h3>Do‘kon kassasi (POS)</h3>
  <p>Telefon kamerasi yoki USB/Bluetooth skaner bilan shtrix-kodni o‘qish, tovarlar bazasi va ombor qoldig‘i, bir urishda narx. To‘lov: naqd (qaytim hisobi), karta, Payme / Click / Uzum dinamik QR. 58/80 mm termal chek va QR-kodli elektron chek.</p>
  <h3>Bron himoyasi va mijoz tajribasi</h3>
  <table class="grid-table"><tbody>
    <tr><th>Ish vaqti</th><td>Bron faqat restoran ish vaqtida, 30 daqiqalik qadamlarda; o‘tgan vaqt va eng yaqin 30 daqiqa tanlanmaydi.</td></tr>
    <tr><th>Stolni ushlab turish</th><td>Tanlangan stol <b>5 daqiqa</b> shu mijoz uchun saqlanadi (ekranda taymer), boshqalar uni band ko‘radi.</td></tr>
    <tr><th>Stop-list</th><td>Egasi taomni, gulchi gulni bir bosishda “Vaqtincha tugadi” qiladi — mijoz uni buyurtma qila olmaydi.</td></tr>
    <tr><th>Jonli kuzatuv</th><td>✅ Qabul qilindi → 👨‍🍳 Tayyorlanmoqda → 🛵 Yetkazilmoqda → 🍽️ Stolga tayyor — xodim bosganda mijoz ekranida darhol yangilanadi.</td></tr>
    <tr><th>Offline QR chipta</th><td>Aktiv bron va QR chek telefonda saqlanadi: internet bo‘lmasa ham eshikda 1 soniyada ochiladi.</td></tr>
    <tr><th>Tug‘ilgan kun himoyasi</th><td>Sana bir marta saqlanib qulflanadi; chegirma yiliga bir marta, tug‘ilgan kunning ±3 kuni ichida.</td></tr>
    <tr><th>Stol xizmati</th><td>Mijoz stoldan “Ofitsiantni chaqirish” yoki “Hisobni so‘rash” tugmasini bosadi — xodimga ovozli signal va Telegram xabar.</td></tr>
    <tr><th>Onlayn zaklad</th><td>Bron faqat Payme / Click orqali zaklad to‘langach tasdiqlanadi: <b>100 000 – 600 000 so‘m</b>, oldindan buyurtma qilingan taomlarga qarab; 30 daqiqada to‘lanmasa bron bekor bo‘ladi.</td></tr>
    <tr><th>Dekoratsiyalar</th><td>“Marry me”, tug‘ilgan kun, sharlar — restoran narxini o‘zi belgilaydi, mijoz bron paytida tanlaydi; summa zaklad va chekka qo‘shiladi, restoranga Telegram’da xabar boradi — qo‘shimcha daromad.</td></tr>
    <tr><th>Yetkazish va menyu</th><td>Yetkazish vaqti xaritadan avtomatik: tayyorlash 15–20 daqiqa + yo‘l. 3D menyu kattalashadi, “+” bosilganda taom savatga uchib tushadi.</td></tr>
  </tbody></table>
</section>

<section class="page">
  <h2><span>5</span> Tariflar taqqoslamasi</h2>
  <table class="data plans"><thead><tr><th>Imkoniyat</th><th>Start</th><th class="hl">Business</th><th class="hl2">Premium</th></tr></thead><tbody>${PLAN_ROWS.map(([name, s, b, p]) => `<tr><td>${esc(name)}</td><td>${mark(s)}</td><td class="hl">${mark(b)}</td><td class="hl2">${mark(p)}</td></tr>`).join('')}</tbody></table>
  <p class="note">Har bir yangi restoran 14 kunlik bepul Premium sinovdan boshlaydi. Premium uchun bir martalik Smart Vision o‘rnatish to‘lovi (prognozda 2 000 000 so‘m) alohida.</p>
</section>

<section class="page">
  <h2><span>6</span> $20 000 xarajatlar smetasi</h2>
  <div class="budget-head">${donut()}<ul class="legend">${BUDGET.map((b) => `<li><i style="background:${b.color}"></i>${esc(b.name)} — <b>${usd(b.usd)}</b> (${((b.usd / total) * 100).toFixed(1)}%)</li>`).join('')}</ul></div>
  <table class="data budget"><thead><tr><th>Yo‘nalish / tarkib</th><th>USD</th><th>So‘m</th><th>%</th></tr></thead><tbody>${BUDGET.map((b) => `<tr class="group"><td>${esc(b.name)}</td><td>${usd(b.usd)}</td><td>${sum(b.usd * USD_RATE)}</td><td>${((b.usd / total) * 100).toFixed(1)}%</td></tr>${b.items.map(([n, v]) => `<tr class="item"><td>${esc(n)}</td><td>${usd(Number(v))}</td><td>${sum(Number(v) * USD_RATE)}</td><td></td></tr>`).join('')}`).join('')}<tr class="total"><td>JAMI</td><td>${usd(total)}</td><td>${sum(total * USD_RATE)}</td><td>100%</td></tr></tbody></table>
</section>

<section class="page">
  <h2><span>7</span> 12 oylik moliyaviy prognoz</h2>
  <p>Maqsadli ssenariy: oylik foyda <b>${breakEven ?? '—'}-oydan</b> ijobiy, $20 000 investitsiya <b>${pbTarget ?? '—'}-oyda</b> to‘liq qaytadi. Konservativ ssenariyda qaytish ${pbCons ?? '—'}-oyda. Summalar — mln so‘m.</p>
  <figure>${barChart(TARGET)}<figcaption><i class="sw rev"></i>Oylik daromad <i class="sw net"></i>Sof foyda (maqsadli ssenariy), mln so‘m</figcaption></figure>
  <table class="data fc"><thead><tr><th>Oy</th><th>Restoran</th><th>Obuna</th><th>O‘rnatish</th><th>Gullar 3%</th><th>Daromad</th><th>Xarajat</th><th>Sof foyda</th><th>Jamg‘arma*</th></tr></thead><tbody>${forecastRows(TARGET)}</tbody></table>
  <figure>${lineChart(TARGET, CONSERVATIVE)}<figcaption><i class="sw target"></i>Maqsadli <i class="sw cons"></i>Konservativ — investitsiyadan keyingi jamg‘arilgan pul oqimi, mln so‘m</figcaption></figure>
  <p class="note">* Jamg‘arma = −256 mln so‘m investitsiya + oylik sof foydalar yig‘indisi. <b>Taxminlar:</b> to‘lovchi restoranlar soni (jadvalda), 45% Premium / 55% Business; yangi Premium restoran uchun 2 000 000 so‘m o‘rnatish to‘lovi; gullar oylik aylanmasi 5→155 mln so‘m, 3% komissiya; xarajat = 9 mln so‘m qat’iy (qo‘llab-quvvatlash, sotuv) + daromadning 12% (to‘lov komissiyalari, sotuv bonuslari). Konservativ: 4→152 restoran, 40% Premium, o‘rnatish 1 500 000 so‘m. Bu prognoz, kafolat emas; har oy haqiqiy ko‘rsatkichlar bilan solishtiriladi.</p>
</section>

<section class="page">
  <h2><span>8</span> Pitch nutqi (2 daqiqa)</h2>
  <blockquote>Assalomu alaykum! Restoranlar har hafta bir xil muammoga duch keladi: mijoz stol bron qiladi va kelmaydi. Juma kechasi 6 kishilik bo‘sh stol — bu 1 million so‘mdan ortiq yo‘qotilgan daromad. Administrator esa zalda qaysi stol bo‘shligini real vaqtda bilmaydi.<br><br>
  Biz <b>RestaurantFoods</b>ni yaratdik — u allaqachon restaurantfoods.online’da ishlab turibdi. AI kamera 3 soniyada stol band bo‘lganini ko‘radi va uni onlayn bronlardan himoya qiladi. Mijoz bron qilganda kartasini ulaydi: 2 soatdan kam qolganda bekor qilsa yoki kelmasa, 50 000 dan 150 000 so‘mgacha jarima avtomatik restoranga o‘tadi. Bron vaqtiga 2 soat qolganda Call AI mijozga o‘zi qo‘ng‘iroq qilib, kelishini tasdiqlatadi. Ofitsiant 7 daqiqa kechiksa — egasining telefoniga signal keladi. Zal kassasi va POS bilan hisob, chek va ombor ham shu tizimda; AI esa o‘zbek tilida tabiiy ovozda gapiradi.<br><br>
  Daromadimiz — oylik obuna: Business 399 ming, Premium 699 ming so‘m, Premium uchun o‘rnatish to‘lovi va Gullar bo‘limidan 3% komissiya. Biz $20 000 so‘raymiz: dasturlash va mobil ilovalarga, bir yillik serverlar va AI xizmatlariga, 10 ta pilot restoran uchun noutbuk, chek printeri va skanerlarga, marketing va sotuv jamoasiga. Maqsadli ssenariyda investitsiya ${pbTarget ?? '—'}-oyda qaytadi, birinchi yil oxiriga 330 ta restoran.<br><br>
  Biz restoranlarga stol emas — kafolatlangan mehmonni sotamiz. Rahmat!</blockquote>
</section>

<section class="page">
  <h2 class="qa-title">Investorlarning 7 ta qiyin savoli va javoblar</h2>
  <ol class="qa">${qa.map(([q, a]) => `<li><b>${esc(q)}</b><p>${esc(a)}</p></li>`).join('')}</ol>
  <p class="meta end">RestaurantFoods · restaurantfoods.online · ${esc(date)}</p>
</section>
</main>
<script src="/business-plan.js?v=2" defer></script>
</body></html>`;
}
