# ChatGPT (Sites) uchun topshiriq — RestaurantFoods yangilanishi

> 3-versiya (konsol xatolari): `trackingTimer` TDZ xatosi tuzatildi (e'lon fayl boshida, ishga tushirish fayl oxirida); CSP sarlavhasiga Google Fonts (`style-src https://fonts.googleapis.com`, `font-src https://fonts.gstatic.com`) va 3D tekstura uchun `blob:` qo'shildi — HTML'ga CSP meta-teg QO'SHILMAYDI, CSP faqat `app/route.ts` va `app/seo.ts` sarlavhalarida; R3F'dagi `THREE.Clock` build paytida `THREE.Timer` bilan almashtiriladi (`vite.menu-book.config.ts`); favicon qo'shildi. Yangilanadigan fayllar: ui/restaurant.js, public/restaurant.js, app/route.ts, app/seo.ts, app/site-html.ts, vite.menu-book.config.ts, public/rf-3d.js, public/rf-3d.css, public/rf-3d-loader.js, public/favicon.ico, public/apple-touch-icon.png, public/icon-192.png, tests/food-ui.test.cjs.

> 2-versiya: Admin Orb ovozli (TTS + mikrofon), egasi/admin uchun mijozlar robot tugmasi yashirildi, menyu kartasidagi miqdor bloki karta chetidan chiqmaydi. Agar oldingi arxiv allaqachon birlashtirilgan bo‘lsa, faqat shu fayllarni yangilang: components/admin-orb/*, public/rf-3d.js, public/rf-3d.css, public/rf-3d-loader.js, public/premium.css, public/ai-chat.js, ui/restaurant.js, public/restaurant.js, app/site-html.ts, docs/PLANS_AI_3D.md.

Ilova qilingan arxiv: RestaurantFoods-plans-ai-3d.zip. U sizdagi Sites v47 kodiga (commit d356c6b) asoslangan.

## Nima qilish kerak

1. Arxivni oching. Avval docs/PLANS_AI_3D.md va docs/MENU_BOOK_3D.md ni o'qing.
2. Joriy Sites kodini v47 bilan solishtiring. Agar v47 dan keyin o'zgarish bo'lgan bo'lsa, arxiv bilan ustidan yozmang, quyidagi fayllardagi o'zgarishlarni qo'lda birlashtiring.
3. Yangi fayllarni qo'shing, o'zgargan fayllarni yangilang (ro'yxat pastda).
4. Buyruqlar:
   pnpm install --frozen-lockfile
   pnpm build:3d
   node scripts/build-locales.cjs
   for f in tests/*.test.cjs; do node "$f" || exit 1; done
   python tests/database.py
   node node_modules/typescript/bin/tsc --noEmit --incremental false
   pnpm build
5. D1 bazasi: avval zaxira oling, keyin faqat bitta yangi migratsiyani qo'llang: drizzle/0018_plans_trial.sql. Eski migratsiyalarni qayta ishga tushirmang.
6. Sites secret qo'shing: OPENAI_API_KEY (kamera Vision uchun, serverda qoladi, frontendga chiqmaydi).
7. Supabase Edge Function'ni qayta deploy qiling: supabase/functions/restaurantfoods-ai/index.ts (streaming va admin AI rejimi). JWT tekshiruvi yoqilgan holda qolsin.
8. Sites'ga deploy qiling. Tekshiring: /rf-3d-demo.html ochiladi; restoran sahifasida "3D menyuni ochish" tugmasi bor; restoran egasi kabinetida "Tarif" bloki ko'rinadi; o'ng pastda Admin AI Orb chiqadi.

## Saqlanishi shart

- Auth, JWT, CSRF, rollar, rate limit himoyalari olib tashlanmasin.
- AI buyurtma, bron yoki to'lovni o'zi yaratmasin.
- Onlayn to'lov ulanmagan: to'lovni administrator kabinetdagi "To'lovni tasdiqlash" bilan qayd etadi.
- OpenAI kaliti frontendga qo'yilmasin.

## O'zgargan fayllar

app/ai-catalog.ts, app/api/ai/route.ts, app/api/catalog/route.ts, app/api/manage/route.ts, app/api/tables/route.ts, app/site-html.ts, cloudflare-env.d.ts, db/schema.ts, drizzle/meta/_journal.json, package.json, pnpm-lock.yaml, public/ai-chat.js, public/locales/messages.json, public/messages.js, public/premium.css, public/restaurant.js, public/robot-viewer.js, public/tables.js, supabase/functions/restaurantfoods-ai/index.ts, ui/restaurant.js, ui/tables.js, tests/ai-voice.test.cjs, tests/ai.test.cjs, tests/delivery.test.cjs, tests/food.test.cjs, tests/menu-book.test.cjs, tests/tables.test.cjs

## Yangi fayllar

app/plans.ts, app/sse.ts, app/vision.ts, app/api/ai/stream/route.ts, app/api/manage/assistant/route.ts, app/api/manage/events/route.ts, app/api/manage/vision/route.ts, components/menu-book-3d/*, components/hall-3d/*, components/assistant-avatar/*, components/admin-orb/*, components/shared/*, drizzle/0018_plans_trial.sql, drizzle/meta/0018_snapshot.json, public/rf-3d.js, public/rf-3d.css, public/rf-3d-loader.js, public/rf-3d-demo.html, public/rf-3d-demo.js, scripts/camera-agent.mjs, vite.menu-book.config.ts, tests/plans.test.cjs, tests/menu-book-3d.test.cjs, docs/PLANS_AI_3D.md, docs/MENU_BOOK_3D.md

## Natijani menga qaytaring

Qaysi testlar o'tdi, migratsiya qo'llandimi, secret va Edge Function deploy qilindimi, Sites versiya raqami. Real telefon va real OpenAI bilan tekshirilmagan narsalarni alohida yozing.
