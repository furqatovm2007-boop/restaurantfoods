# Telegram, depozit (Click / Payme), SMS OTP va avtomatik deploy

Barcha kalitlar faqat Cloudflare'da saqlanadi: **Workers & Pages → restaurantfoods → Settings → Variables and Secrets**.
Kodda va GitHub'da hech qanday maxfiy kalit yo‘q. Kalitlar qo‘shilmaguncha har bir funksiya o‘chiq turadi va sayt odatdagidek ishlaydi.

## 1. Telegram bot

1. Telegram'da **@BotFather** → `/newbot` → token oling.
2. Cloudflare'ga qo‘shing:
   - `TELEGRAM_BOT_TOKEN` (Secret) — BotFather bergan token
   - `TELEGRAM_WEBHOOK_SECRET` (Secret) — o‘zingiz o‘ylagan uzun tasodifiy satr (A–Z, a–z, 0–9, `_`, `-`)
   - `TELEGRAM_BOT_USERNAME` (Text) — bot nomi, `@`siz
3. Deploy tugagach, admin akkaunt bilan **Restoran kabineti → Bildirishnomalar va depozit → Webhookni yangilash** tugmasini bosing.
4. Restoran egasi **Telegram'ni ulash** tugmasini bosadi → Telegram ochiladi → **Start**. Shu chat restoranga bog‘lanadi (havola 15 daqiqa, bir marta ishlaydi).

Yangi bron xabari:

```
📌 Yangi Bron!
🏠 Restoran: …
👤 Mijoz: +998 90 123 45 67
🍽 Stol: 4-stol · 2 kishi
📅 Sana: 2026-11-01
🕒 Vaqt: 19:30–21:30
💵 Depozit: To‘langan (Payme)
[✅ Tasdiqlash] [❌ Bekor qilish]
```

Tugmalarni faqat restoranga ulangan chat bosishi mumkin. Depozit talab qilinsa, xabar to‘lov tushgandan keyin keladi.

## 2. Depozit: Click va Payme

Restoran egasi kabinetda depozit summasini kiritadi (0 — depozitsiz). To‘lanmagan depozit 30 daqiqada bekor bo‘ladi va stol bo‘shaydi.
To‘lov holati faqat Click/Payme serverlaridan keladigan so‘rovlar orqali o‘zgaradi — brauzer to‘lovni “to‘landi” deb belgilay olmaydi.

**Click (SHOP-API)** — kabinetda:
- Prepare URL va Complete URL: `https://restaurantfoods.online/api/payments/click`
- Cloudflare: `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID` (Text), `CLICK_SECRET_KEY` (Secret)

**Payme (Merchant API)** — kabinetda:
- Endpoint URL: `https://restaurantfoods.online/api/payments/payme`
- Hisob (account) maydoni: `deposit_id`
- Cloudflare: `PAYME_MERCHANT_ID` (Text), `PAYME_KEY` (Secret; avval test kalitini qo‘yib, Payme sandbox testlaridan o‘ting)

## 3. Bron uchun SMS OTP (Eskiz.uz)

- `ESKIZ_EMAIL` (Text), `ESKIZ_PASSWORD` (Secret), ixtiyoriy `ESKIZ_FROM` (standart `4546`)
- `BOOKING_PHONE_OTP` = `true` — bronda SMS kodni majburiy qiladi
- Eskiz kabinetida shu shablonni tasdiqlating: `RestaurantFoods: bron tasdiqlash kodi %d. Kodni hech kimga bermang.`
- Akkaunti aynan shu telefon raqami bilan tasdiqlangan mijozdan qayta kod so‘ralmaydi.

## 4. Admin jonli stol xaritasi

Business/Premium tarifda kabinetda **Jonli stol xaritasi** chiqadi: yashil — bo‘sh, qizil — band (AI kamera yoki qo‘lda), sariq — saytdan bron.
Stolni bosib **Bo‘sh / Band / Bron / Avtomatik** tanlanadi. Qo‘lda qo‘yilgan belgi 20 daqiqa amal qiladi, shu vaqtda kamera uni o‘zgartirmaydi.
Admin Orb yangi bron yoki kamera o‘zgarishida ovozli signal beradi va yuqori o‘ng burchakda xabar ko‘rsatadi.

## 5. Avtomatik deploy (GitHub → Cloudflare)

- **Deploy**: Cloudflare Workers Builds `main` ga har push'da o‘zi build qilib deploy qiladi. Bu loyiha Worker + D1 + SSR bo‘lgani uchun Cloudflare **Pages** emas, **Workers** ishlatiladi.
- **CI** (`.github/workflows/ci.yml`): typecheck, UI lint, 40 ta test va build — har push va PR'da.
- **Claude Code** (`.github/workflows/claude.yml`, `anthropics/claude-code-action@v1`): issue yoki PR izohida `@claude` deb yozing. GitHub → Settings → Secrets → Actions: `ANTHROPIC_API_KEY`. Faqat egasi/a’zolar/hamkorlar ishga tushira oladi.
- **D1 migratsiyalar** (`.github/workflows/d1-migrate.yml`): Actions → *D1 migrations* → *Run workflow*. Secrets: `CLOUDFLARE_API_TOKEN` (D1 Edit huquqi bilan) va `CLOUDFLARE_ACCOUNT_ID`. Yangi `drizzle/*.sql` qo‘shilganda kodni deploy qilishdan oldin ishga tushiring.

## Avatar modeli

`public/models/assistant-robot.draco.glb` (2.1 MB) va `assistant-robot.lite.glb` (0.8 MB, sekin internet / Save-Data) asl 8.7 MB modeldan `scripts/compress-avatar.mjs` bilan olingan. Draco decoder `public/draco/` da o‘zimizda turadi.

## Xavfsizlik: AI funksiyasini faqat sayt chaqira olsin (`RF_PROXY_SECRET`)

Supabase Edge Function (`restaurantfoods-ai`) kunlik limit, rol va tarifni bilmaydi — buni Worker tekshiradi. Funksiyaga to‘g‘ridan-to‘g‘ri murojaatni yopish uchun ikkala joyga **bir xil** uzun tasodifiy qiymat qo‘ying:

1. Cloudflare → Workers & Pages → restaurantfoods → Settings → Variables and Secrets → **Secret** `RF_PROXY_SECRET`.
2. Deploy tugagach: Supabase → Edge Functions → Secrets → `RF_PROXY_SECRET` (aynan o‘sha qiymat).

Tartib muhim: avval Cloudflare, keyin Supabase. Supabase'da qiymat yo‘q ekan, tekshiruv o‘chiq turadi va AI odatdagidek ishlaydi.
