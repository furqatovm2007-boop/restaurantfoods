# Tariflar, 14 kunlik trial, AI streaming, Vision va 3D modullar

## 1. Tariflar va trial

| | Start — 199 000 | Business — 399 000 | Premium — 699 000 |
|---|---|---|---|
| 2D menyu, ro‘yxatli bron | ✓ | ✓ | ✓ |
| To‘liq ekranli 3D menyu (`menu3d`) | — | ✓ | ✓ |
| 3D zalda stol tanlab bron (`room3d`) | — | — | ✓ |
| Admin AI Orb (`adminAi`) | — | ✓ kuniga 30 savol, faqat bronlar va kelgan so‘rovlar | ✓ cheklovsiz, barcha ma’lumot |
| AI kamera + jonli stol xaritasi (`liveTables`) | — | — | ✓ |
| Mijozlar uchun ovozli 3D AI (`clientAi`) | — | — | ✓ |
| Kamera → Vision → stollar bandligi (`visionTables`) | — | — | ✓ |
| Analitika (`analytics`) | — | — | ✓ |

- Yangi restoran yaratilganda `trial_ends_at = hozir + 14 kun`. Trial davomida hamma imkoniyat (Premium) yoqiq.
- Trial tugagach `paid_until` kelajakda bo‘lsa, `plan` dagi tarif ishlaydi; aks holda holat `payment_required` va faqat Start imkoniyatlari qoladi (sayt ishlayveradi, egasiga to‘lov so‘raladi).
- Mantiq: `app/plans.ts` (`planState`, `requireFeature` — 402 `PLAN_UPGRADE_REQUIRED`). Middleware vazifasini har bir marshrutdagi `requireFeature(...)` bajaradi.
- Egasi kabinetda tarifni tanlaydi. **Onlayn to‘lov (Payme/Click) ulanmagan**: pul tushgach administrator “To‘lovni tasdiqlash” bilan `paid_until` ni N oyga uzaytiradi (`admin_audit` ga yoziladi). To‘langan davr ichida egasi tarifni o‘zi oshira olmaydi.
- Migratsiya `drizzle/0018_plans_trial.sql`: mavjud restoranlarga deploy paytidan boshlab 14 kun trial beriladi (hech kim imkoniyatini to‘satdan yo‘qotmaydi), demo restoranlar doim to‘langan.

## 2. AI tezligi

- `POST /api/ai/stream` — SSE: `delta` (matn kelishi bilan), `done` (tekshirilgan tavsiyalar/amallar; bandlik tekshiruvi javobni almashtirsa `replaced:true`), `error`.
- Edge Function `stream:true` rejimida OpenAI `stream:true` bilan ishlaydi; javob matni avval, keyin `⟦DATA⟧` va JSON. Eski (stream’siz) Edge Function deploy qilingan bo‘lsa, Worker JSON javobni bitta `delta` qilib qaytaradi.
- Ovozli rejim: birinchi gap tayyor bo‘lishi bilan uning TTS’i so‘raladi, javob gaplarga bo‘linib ketma-ket o‘qiladi (keyingisi oldindan tayyorlanadi). Ovoz uchun `max_completion_tokens` 500.
- Dinamik kontekst (`app/ai-catalog.ts`): har so‘rovda D1 dan o‘qiladi — yangi tasdiqlangan restoran, menyu va stollar soni darhol AI’ga ko‘rinadi. Savoldagi so‘zlar bo‘yicha 8 ta eng mos restoran va mos taomlar tanlanadi (joriy restoran doim birinchi), kontekst ≤ 52 KB.
- Restoran sahifasidagi mijoz AI faqat `clientAi` (Premium/trial) restoranlarda ishlaydi; umumiy sahifalardagi konsyerj avvalgidek.

## 3. Admin AI va Vision

- `GET /api/manage/events?since=` — yangi bronlar va jonli stol holati (Orb har 15 s da so‘raydi, ko‘rinmas tabda to‘xtaydi). Yangi bron: Orb pulsatsiya qiladi, matn va brauzer ovozi (speechSynthesis) bilan xabar beradi.
- `POST /api/manage/assistant` — egasining bugungi bronlari, 7 kunlik statistika, buyurtmalar, jonli stollar va tugagan taomlar asosida streaming javob (Edge Function `mode:'admin_chat'`). AI hech narsani o‘zgartirmaydi.
- `POST /api/manage/vision` — kamera kadri (JPEG/PNG/WebP base64, ≤ ~1.5 MB) → `gpt-4o-mini` vision (json_schema) → ishonch ≥ 0.55 bo‘lgan stollar `table_live_status` ga yoziladi. Kadr saqlanmaydi, odamlar tavsiflanmaydi. Kirish: egasining sessiyasi yoki `Authorization: Bearer rfcam_…` kamera kaliti (bazada faqat SHA-256 xeshi).
- `scripts/camera-agent.mjs` — restoran tarmog‘idagi kompyuterda RTSP/HTTP kameradan (ffmpeg) kadr olib yuboradi: `RF_CAMERA_KEY=… RF_RESTAURANT_ID=… RF_CAMERA_URL=rtsp://… node scripts/camera-agent.mjs`.
- `POST /api/tables {action:'live'}` — stol holatini qo‘lda belgilash (`liveTables`).

## 4. Frontend (React Three Fiber, `public/rf-3d.js`, faqat kerak bo‘lganda yuklanadi)

- **To‘liq ekranli 3D menyu** (`FullscreenMenu.tsx`): restoran sahifasidagi “3D menyuni ochish” tugmasi (Business+). Ochilishda fade/scale animatsiya, scroll bloklanadi, telefonda brauzer full-screen va `screen.orientation.lock('portrait')` (Android); gorizontal telefonda “vertikal holatga keltiring” ekrani (iOS lock’ni qo‘llamaydi). Start’da oddiy 2D ro‘yxat.
- **3D zal** (`Hall3D.tsx`): egasi joylashtirgan stollar, o‘rindiqlar, raqamlar; ranglar — bo‘sh / bron / hozir band (kamera yoki qo‘lda) / tanlangan. Sudrab aylantirish, g‘ildirak/pinch bilan zoom, bosish bilan tanlash. Start’da stollar ro‘yxati.
- **Avatar lip-sync** (`AssistantAvatar.tsx`): GLB robot R3F’da; TTS audio `AnalyserNode` orqali o‘lchanadi, og‘iz bo‘g‘imlari (`mouthClosKawai_056` ochiq “o”, `mouthClos_055` yopiq) ovoz balandligiga qarab almashadi, bosh biroz qimirlaydi. WebGL yoki yuklash xatosida eski `<model-viewer>` ishlaydi.
- **Admin Orb** (`AdminOrb.tsx`, `orb-voice.ts`): o‘ng pastki burchakda shader’li animatsion sfera, xabarlar / stollar / AI so‘rov tablari, tarif holati va to‘lov havolasi. Orb gapiradi: javoblar va yangi bron xabarlari OpenAI TTS (`/api/ai-voice`) bilan o‘qiladi, sfera ovoz balandligiga qarab kattalashadi; 🎤 tugmasi bilan ovozli savol (bir bosish — yozish, ikkinchisi — yuborish). Restoran egasi va admin uchun mijozlar robot tugmasi yashiriladi: ular Orb bilan ishlaydi, robot faqat mijozlar uchun.
- **Menyu kartalari**: miqdor va “Savatga qo‘shish” alohida to‘liq kenglikdagi qatorlarda (ilgari miqdor bloki karta chetidan chiqib ketardi).
- Animatsiyalar Tailwind/CSS transition bilan qilingan; Framer Motion qo‘shilmadi (bundle hajmini oshirmaslik uchun).

## Deploy tartibi

1. `pnpm install` → `pnpm build:3d` → `node scripts/build-locales.cjs` → `pnpm build`.
2. D1: `drizzle/0018_plans_trial.sql` ni bir marta qo‘llang (avval zaxira oling).
3. Sites/Worker secret: `OPENAI_API_KEY` (Vision uchun; ixtiyoriy `OPENAI_VISION_MODEL`). Yo‘q bo‘lsa Vision `503 VISION_NOT_CONFIGURED`.
4. Supabase: `supabase functions deploy restaurantfoods-ai` (streaming va admin rejimi shu faylda).
5. Sinov: `/rf-3d-demo.html` (noindex, namunaviy ma’lumot).

## Tekshiruv holati

- 37 ta `tests/*.test.cjs` (yangi `plans.test.cjs`: real SQLite bilan trial, to‘lov, 402 gate, live stollar, kamera kaliti, vision yozuvi, bron lentasi, SSE oqimi), `tests/database.py`, TypeScript, yangi kod lint’i va `pnpm build` o‘tdi.
- Headless Chromium’da: to‘liq ekranli menyu (desktop/mobil, Esc), landscape ogohlantirishi, 3D zalda tanlash (band stol tanlanmaydi), lip-sync og‘iz almashishi, Orb paneli tekshirildi.
- Haqiqiy OpenAI (streaming, vision aniqligi, TTS), real IP kamera, telefon GPU tezligi, Android orientation lock va to‘lov tizimi bu muhitda tekshirilmagan.

## Ikki alohida AI yordamchi

Kuryerlar uchun AI yo‘q: mijoz AI'si kuryer va restoran egalariga ko‘rinmaydi, API ham ularni rad etadi (`AI_NOT_FOR_COURIERS`, `AI_USE_ADMIN_ASSISTANT`).

| | Mijoz AI (3D avatar) | Restoran Admin AI (Orb) |
|---|---|---|
| Kimga | mijozlar | restoran egasi va administrator |
| Tarif | Premium yoki 14 kunlik trial (`clientAi`) | Business (kuniga 30 savol, faqat bronlar/so‘rovlar), Premium yoki trial — cheklovsiz (`adminAi`) |
| Qayerda | sayt bo‘ylab, Premium/trial restoranlar haqida | faqat `#/manage` kabinetida, o‘ng pastki burchak |
| Matn | `POST /api/ai/stream` (`/api/ai` — JSON) | `POST /api/manage/assistant` |
| Ovoz | `POST /api/ai-voice` | `POST /api/manage/voice` |
| Limit | kuniga 1 bepul savol (Toshkent vaqti) + shu kuni qilingan har bir haqiqiy bron/buyurtma uchun +1 (ko‘pi bilan +5); xato bo‘lsa savol qaytariladi | rate-limit |
| Qo‘shimcha | — | yangi bron va kamera o‘zgarishida ovozli signal + xabar; kamera har 5 daqiqada kadr yuboradi (`RF_INTERVAL=300`) |

Limit jadvali: `ai_quota (user_id, day, used)` — migratsiya `0020_ai_daily_quota.sql`.

## Smart Vision — kamera orqali stol bandligi (brauzerda)

- Sahifa: **Menyu → AI kamera** (`#/camera`), faqat restoran egasi va administrator uchun. faqat Premium (va 14 kunlik trial) tarifida ishlaydi (`liveTables`); Business/Start’da «Faqat Premium tarifda mavjud» chiqadi. Restoran tanlanmasa sinov rejimi.
- **Kamerani ulash** → brauzer ruxsat so‘raydi (`getUserMedia`). TensorFlow.js + coco-ssd (`public/rf-vision.js`, model `public/models/coco-ssd/`, ~20 MB, faqat shu sahifada yuklanadi) odamlarni **qurilmaning o‘zida** topadi. Video serverga yuborilmaydi.
- Ekrandagi zonalar (stollar) sichqoncha/barmoq bilan suriladi, o‘ng pastki burchakdan kattalashtiriladi; zona qaysi stolga tegishli ekani pastdagi ro‘yxatdan tanlanadi. Zonalar shu brauzerda saqlanadi.
- Har bir odam faqat bitta stolga — beli/oyog‘i turgan zonaga — tegishli bo‘ladi. Qimirlamay o‘tirgan odam (o‘tirgan shakli) 3 soniya tursa — **Band** (qizil); faqat turgan/yurgan odam bo‘lsa (ofitsiant, tozalash) 1,5 soniyadan so‘ng — **Tozalanmoqda** (sariq); hech kim bo‘lmasa 3 soniyadan so‘ng — **Bo‘sh**. Holat qachondan beri ekani (`since`) saqlanadi va mijozga «🔴 hozir band · 14:05 dan beri» bo‘lib ko‘rinadi. Holat `POST /api/manage/occupancy` orqali `table_live_status` ga (`source='camera'`) yoziladi: o‘zgarganda va har daqiqada. Xodim qo‘lda qo‘ygan belgi 20 daqiqa ustun turadi.
- Mijoz bron sahifasida bugungi va 2 soat ichidagi vaqt uchun kamera band deb belgilagan stollar «hozir band (AI kamera)» bo‘lib ko‘rinadi (15 soniyada yangilanadi).
- Bundle: `pnpm build:vision`.

## Bron qoidalari (kamera va bekor qilish)

- **Walk-in:** kamera (yoki xodim) stolni `occupied` deb belgilagan bo‘lsa (oxirgi 20 daqiqa ichida), boshlanishi hozirdan 2 soatgacha bo‘lgan bron `POST /api/bookings` da 409 bilan rad etiladi: «Bu stolga hozir mijoz o‘tirgan, boshqa stol yoki vaqt tanlang». Sariq (`cleaning`) bloklamaydi. Saytda shu stol uchun bron formasi o‘rniga ogohlantirish chiqadi.
- **Bekor qilish:** mijoz bronni boshlanishidan kamida 2 soat oldin bekor qila oladi (`PATCH /api/bookings`); kamroq qolsa 400. «Bronlarim»da tugma nofaol va sababi yoziladi. Bron formasida va tasdiqlash oynasida bu qoida ogohlantirish sifatida turadi.
- Qoidalar `app/booking-rules.ts` da; testlar: `tests/walk-in-booking.test.cjs`, `tests/admin-ai-plan.test.cjs`.

## Bir nechta kamera (Smart Vision)

- **AI kamera** sahifasida «Kamera qo‘shish»: shu kompyuter/telefondagi istalgan kamera (`enumerateDevices`) yoki IP-kamera oqimi (https: MJPEG, MP4/WebM, HLS — Safari’da tabiiy). RTSP brauzerda ochilmaydi: uni MJPEG/HLS ga aylantiruvchi shlyuz (masalan go2rtc) orqali https manzil bering; AI tasvirni o‘qishi uchun oqim CORS ruxsatini berishi kerak.
- Kameralar, nomlari va stol zonalari D1 `camera_feeds` jadvalida (`/api/manage/cameras`) va brauzerda saqlanadi; ko‘pi bilan 8 ta. Zonani surganingizda o‘zi saqlanadi.
- Brauzer kameraga bir marta ruxsat bergandan keyin sahifa ochilishi bilan saqlangan kameralarga o‘zi ulanadi (qayta so‘ramaydi). Ruxsatni brauzer saqlaydi — Safari ba’zan qayta so‘rashi mumkin.
- Bitta AI model barcha kameralarni navbat bilan tekshiradi; bitta stol bir nechta kamerada bo‘lsa, eng kuchli holat olinadi (Band > Tozalanmoqda > Bo‘sh).

## Chek, QR chipta, kelish (check-in), no-show va navbat

- **Chek:** bron tasdiqlangach va «Bronlarim» → «🧾 Chek»: restoran, sana/vaqt/stol, taomlar (soni × narxi), xizmat haqi (restoran sozlamasida «Xizmat haqi, %», 0–30) va jami summa, chek raqami, QR. «Chop etish» faqat chekni chiqaradi; «PDF» brauzerning o‘zida yasaladi (`public/receipt.js`). API: `GET /api/bookings/receipt?id=`.
- **QR chipta:** har faol bronga taxmin qilib bo‘lmaydigan kod (`bookings.pass_code`), QR ichida `RFB1:<kod>`. «Bronlarim» → «🎟 Chipta».
- **Kelish:** restoran kabineti → «📷 QR-kodni tekshirish» (kamera: BarcodeDetector yoki jsQR; yoki kodni qo‘lda kiritish). «Mijoz keldi» → `checked_in_at`, stol jonli xaritada «band» (xodim belgisi). API: `POST /api/manage/checkin`.
- **No-show:** bron boshlanganidan 15 daqiqa o‘tgach, kelmagan (QR bilan kirmagan) mijozni «Kelmay qoldi» deb belgilash; `accounts.no_show_count` oshadi va keyingi bronlarida xodimga «⚠️ Avval kelmagan: N» ko‘rinadi.
- **Navbat:** stol band (kamera/xodim) bo‘lsa mijoz «🔔 Bo‘shashi bilan xabar berish» bosadi. Stol bo‘shaganda navbatdagi birinchi mijozga 10 daqiqa ajratiladi (boshqalar o‘sha stolni 2 soat ichiga bron qila olmaydi), saytda sanab turuvchi banner va (ruxsat bo‘lsa) bildirishnoma chiqadi; vaqt o‘tsa keyingi mijozga o‘tadi. API: `/api/waitlist`.
- **Apple (iCloud):** `/api/auth/apple` (Supabase Apple provayderi). Yoqish uchun Apple Developer akkaunti, Supabase → Authentication → Providers → Apple sozlamasi va Cloudflare’da `AUTH_APPLE_ENABLED=true`.
