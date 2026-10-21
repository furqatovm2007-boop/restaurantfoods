# RestaurantFoods — Claude uchun topshirish

## Avval shu faylni o‘qing

Bu arxiv amaldagi saytning kod nusxasi. Manba commit: `d356c6b77f4dbd8e8855cf7740bd00ce97876aa6`.
Sayt: https://restaurantfoods.online
Oxirgi tasdiqlangan nashr: Sites v47. Ushbu arxiv tayyorlanayotganda yangi kod o‘zgarishi yoki deploy qilinmadi.
Eski README va docs fayllarida oldingi holatlar uchrashi mumkin. Joriy kod va ushbu topshirish faylini asos qilib oling.

## Hozir bajarilishi kerak bo‘lgan ish

Foydalanuvchining oxirgi talabi:
“Varaqlash sust ishlaydi, uni ravon va tez qil. AI uzoq o‘ylaydi; restoranlar haqida bilsin, savollarga javob bersin. Mijoz menyuni yoki qidiruvni och desa, o‘sha bo‘limni ochsin.”

Bu talab uchun faqat kod o‘rganildi. Quyidagi optimizatsiyalar HALI KIRITILMAGAN:
1. Kitob animatsiyasini yengillashtirish. `public/menu-book.js` har varaqlashda mobil uchun 20, desktop uchun 28 segment yaratadi. Har segmentda old/orqa to‘liq DOM nusxasi bor. Oddiy sahifa 1050 ms, muqova 850 ms. Nusxalashni kamaytiring, animatsiyani taxminan 500–600 ms bilan tekshiring. CSS 3D egilishi, tabiiy ovoz, reduced motion, resize/dispose himoyalari va tanlangan miqdor saqlansin. Balandlik o‘zgarishi animatsiyani bekor qilishi yoki CSS filter 3D ni tekislashi oldin tuzatilgan — qaytarmang.
2. “Qidiruvni och” singari aniq buyruqlarni modelni kutmasdan bajartirish. UZ/RU/EN, faqat ruxsat etilgan ichki sahifalar, inkor va noaniqlik holatlarini tekshiring. Buyruqlar buyurtma/bron/to‘lovni avtomatik yaratmasin. Oddiy ochish buyrug‘ida uzoq robot ekskursiyasi kerak emas.
3. `app/ai-catalog.ts` hozir restoranlarni SQL LIMIT 40, yakunida 20 taga cheklaydi; menyu uchun umumiy LIMIT 400 mavjud. Edge ham catalog.slice(0,20) qiladi. Shuning uchun barcha restoranlar haqida biladi deb da’vo qilmang. Joriy katalog va savolga tegishli menyularni ixcham, ishonchli tanlashni yaxshilang. Modelga shaxsiy akkaunt/buyurtma ma’lumotlarini yubormang.
4. Oddiy umumiy savollarni ham qisqa javoblashga ruxsat berish; restoran narxi, mavjudligi, manzili kabi faktlar faqat joriy ishonchli manbadan olinsin. Bandlik haqidagi javoblar haqiqiy backend tekshiruvidan chiqsin.
5. Voice zanjiri ketma-ket STT → chat → TTS. `public/ai-chat.js` dagi harakat/nutq kutishlari sekinlik qo‘shadi: scroll ~700 ms, robot yurishi ~950 ms, tanaffus ~650 ms, varaqlash kutishi ~950 ms. Aniq navigatsiyani tez yo‘lga ajrating; tavsiya ekskursiyasining tartibli nutqini saqlang. Ovozning haqiqiy telefon sifati va provayder kechikishi bu muhitda tekshirilmagan.

## Muhim fayllar

- `ui/restaurant.js`: asosiy tahrirlanadigan frontend.
- `app/site-html.ts`: HTML shell, JSON string sifatida export qilingan.
- `public/restaurant.css`, `public/premium.css`: dizayn va mobil ko‘rinish.
- `public/menu-book.js`, `public/menu-book.css`: 3D kitob va varaqlash.
- `public/book-page-turn-v2.wav`: joriy tabiiy varaqlash ovozi.
- `public/cart-fx.js`: savatga uchish effekti.
- `public/ai-chat.js`, `public/robot-viewer.js`, `public/models/assistant-robot.glb`: ovozli AI va robot.
- `app/api/ai/route.ts`, `app/api/ai-voice/route.ts`: autentifikatsiyalangan AI API.
- `app/ai-catalog.ts`, `app/ai-guide.ts`: katalog, ruxsat etilgan amallar, bandlik tekshiruvi.
- `supabase/functions/restaurantfoods-ai/index.ts`: OpenAI chat/STT/TTS Edge Function.
- `public/locales/messages.json`: UZ/RU/EN matnlari.
- `drizzle/`: D1 SQL migratsiyalari; `docs/sql/`: qo‘shimcha SQL.
- `AUTH_SETUP.md`, `docs/AI_ASSISTANT.md`: integratsiya tavsifi; ayrim eski checkout yo‘llari eskirgan.

## Saqlanishi kerak bo‘lgan xatti-harakatlar

- `+` va `−` faqat tanlanayotgan miqdorni o‘zgartiradi. Faqat “Savatga qo‘shish” savatga qo‘shadi va uchish/ovozni ishga tushiradi.
- Mobil pastki navigatsiya: Bosh sahifa / Qidiruv / Savat / Profil. Profil ichida Bronlarim va Buyurtmalarim. Header/logo ixcham, drawer boshida avatarli profil.
- Bosh sahifada bron/pickup CTA yo‘q. Restoran ichidagi haqiqiy bron oqimi saqlangan.
- AI pauza/yopish boshqaruvlari robotdan alohida va joyida turadi. Mikrofon, audio, kechikkan so‘rovlar yopish/pauzada to‘xtaydi.
- AI chat modeli foydalanuvchi tanlagan `gpt-4o-mini`. Kalitni frontendga qo‘ymang.
- JWT, tasdiqlangan foydalanuvchi, CSRF, rollar va rate limit himoyalarini olib tashlamang.
- Demo ma’lumotlar haqiqiy restoran/buyurtma sifatida ko‘rsatilmasin. AI avtomatik to‘lov, bron yoki buyurtma yaratmasin.

## Texnologiya va mahalliy ishga tushirish

Node >=22.13, pnpm 11.25.0, Vinext/Vite, React, Cloudflare Workers, D1, R2; Supabase Auth va AI Edge Function.

```sh
corepack enable
pnpm install --frozen-lockfile
node scripts/build-locales.cjs
pnpm dev
```

`pnpm dev` toza ko‘chirmada portable profilni tanlaydi (odatda 5173-port). Mahalliy D1 bo‘sh bo‘ladi; SQL sxema/migratsiyalarini tekshirib o‘rnating. Auth, AI va saqlash uchun tegishli xizmatlar/config zarur. Bu buyruqlar Claude kompyuterida sinab ko‘rilmagan.

Tekshiruv:
```sh
node node_modules/typescript/bin/tsc --noEmit --incremental false
for f in tests/*.test.cjs; do node "$f" || exit 1; done
pnpm build
```
Muhim testlar: `paper-turn`, `menu-book`, `cart-fx`, `ai`, `ai-guide`, `ai-edge`, `ai-voice`, `ai-recording`, `ai-voice-api`. Testlar asosan mocked provider/DOM; real mikrofon yoki telefon unumdorligi isboti emas.

Generatsiya:
```sh
node scripts/build-locales.cjs
node scripts/build-review.cjs
node scripts/build-menu-book-review.cjs
```
`ui/restaurant.js` o‘zgarishlarini birinchi buyruq `public/restaurant.js` ga chiqaradi. HTML dagi tegishli asset cache versiyalarini yangilang.

## Muhit va deploy

Arxivda maxfiy kalitlar, node_modules, .git, runtime holati yoki ishlab turgan bazaning nusxasi yo‘q. SQL migratsiyalar sxema/demo seed bo‘lib, joriy mijoz ma’lumotlari emas. Masofadagi R2 yuklamalari kod arxiviga kirmaydi.

Mavjud Sites project: `appgprj_6ace75b6e91c81918adfe2ff2b5c2cdf`; hosting manifest `.openai/hosting.json` da. D1 binding `DB`, R2 binding `BUCKET`.
Supabase project ref: `edfpytsribkqxtdfimww`; function: `restaurantfoods-ai`, JWT tekshiruvi yoqilgan.
Server Auth konfiguratsiyasi: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `AUTH_SETUP_COMPLETE`, kerak bo‘lsa Turnstile va OAuth sozlamalari (`AUTH_SETUP.md`).
Edge secrets: `OPENAI_API_KEY`; ixtiyoriy `OPENAI_TTS_MODEL` (default `gpt-4o-mini-tts`), `OPENAI_TRANSCRIBE_MODEL` (default `gpt-4o-mini-transcribe`). Supabase o‘z standart envlarini ta’minlaydi. Hozirgi kalit/kredit holati arxivda berilmagan.

Sayt frontendi Supabase’da host qilinmagan. Edge Function va asosiy sayt alohida deploy qilinadi. Claude’da Sites integratsiyasi bo‘lmasa, Cloudflare/D1/R2 hosting va secretslarni moslashtirish kerak; bu loyiha oddiy statik HTML sifatida to‘liq ishlamaydi. Mavjud prod bazada barcha migratsiyalarni ko‘r-ko‘rona qayta ishlatmang.

Eski GitHub branch joriy Sites kodidan orqada bo‘lishi mumkin. Uni ushbu arxiv ustiga almashtirmang. Yangi GitHub yozuvi/PR uchun foydalanuvchining aniq ruxsatini oling; oldingi GitHub yozish urinishi avtomatik ruxsat tekshiruvida rad etilgan. Bu arxivni foydalanuvchiga berish uchun tayyorlash yangi GitHub yozuvi emas.

## Claude uchun boshlang‘ich topshiriq

“CLAUDE_HANDOFF.md ni o‘qi. RestaurantFoods’ning mavjud imkoniyatlarini saqlab, varaqlashni ravon va tez qil. AI’da UZ/RU/EN aniq ichki navigatsiya buyruqlarini tez bajaradigan yo‘l qo‘sh, joriy restoran katalogidan to‘g‘ri foydalanishni va qisqa javoblarni yaxshila. Kalitlarni kodga yozma, auth himoyasini olib tashlama, buyurtma/bron/to‘lovni avtomatik yuborma. Tegishli testlarni bajargin. Real qurilmada tekshirilmagan natijalarni alohida aytgin.”
