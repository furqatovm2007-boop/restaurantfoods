# 3D menyu kitobi (React Three Fiber)

Restoran sahifasidagi menyu WebGL kitob sifatida ko‘rsatiladi. WebGL yo‘q yoki bundle yuklanmasa, mavjud CSS kitob (`public/menu-book.js`) o‘zgarishsiz ishlaydi.

## Tuzilishi — `components/menu-book-3d/`

| Fayl | Vazifasi |
| --- | --- |
| `MenuBook3D.tsx` | Asosiy komponent: holat (spread, fokus, miqdorlar), Tailwind overlay (mundarija chiplari, tugmalar, status), klaviatura, ekran o‘quvchi uchun yashirin ro‘yxat, `ref` orqali `reveal/open/close`. |
| `BookScene.tsx` | R3F sahna: varaqlar, yorug‘lik/soya, kamera, sudrab varaqlash, hotspot bosish, tekstura keshi. `frameloop="demand"` — o‘qish paytida render to‘xtaydi. |
| `page-bend.ts` | Varaq egilishi: umurtqa burchagi `progress·π`, varaq bo‘ylab burchak o‘zgaradi (yoy), pastki burchak biroz oldinda. Har qatorda integratsiya qilinadi. |
| `page-canvas.ts` | Sahifalarni 2D canvasga chizish (muqova, forzats, mundarija, taomlar, yakun) va bosiladigan hududlar. |
| `layout.ts` | Menyuni jismoniy kitobga joylash: muqova → forzats → mundarija → bo‘limlar (sahifada 2 taom) → yakun → orqa muqova. Sahifalar soni doim juft. |
| `theme.ts`, `labels.ts` | RestaurantFoods palitrasi va UZ/RU/EN matnlar. |
| `use-page-sound.ts` | `book-page-turn-v2.wav`, `rf-book-sound` sozlamasi eski kitob bilan umumiy. |
| `island.tsx`, `menu-book-3d.css` | Vanilla SPA uchun `window.RF3D` (menuBook, fullscreenMenu, hall, avatar, orb); Tailwind `rf:` prefiksi bilan, preflight’siz. |

Saytga ulanish: `ui/restaurant.js` → `bindMenuBook3D(r, menu)`. Bundle faqat menyuli restoran sahifasida yuklanadi. “Savatga qo‘shish” mavjud `[data-menu-add]` tugmasi orqali o‘tadi, shuning uchun savat tekshiruvlari, boshqa restoran tasdig‘i va uchish effekti o‘zgarmaydi. `+`/`−` faqat tanlangan miqdorni o‘zgartiradi.

## Boshqaruv

- Muqovani bosish yoki “Menyuni ochish” — kitob ochiladi.
- Varaqni chetidan ushlab sudrash (sichqoncha/sensor); yarmidan o‘tsa yoki tez silkitilsa varaqlanadi, aks holda qaytib tushadi.
- Mundarija qatori yoki yuqoridagi chiplar — kerakli bo‘limga bir necha varaq ketma-ket o‘tadi.
- `←/→`, `PageUp/PageDown`, `Home/End`, `Esc`.
- Telefonda (< 640px) bitta sahifa ko‘rinadi: kamera chap/o‘ng sahifaga suriladi, sudrash masofasi 2 barobar kuchaytirilgan.
- `prefers-reduced-motion` — animatsiyasiz almashadi.

## Build

```sh
pnpm install
pnpm build:3d          # public/rf-3d.js + public/rf-3d.css (menyu, zal, avatar, Orb)
node scripts/build-locales.cjs
node tests/menu-book-3d.test.cjs
```

Bog‘liqliklar: `three`, `@react-three/fiber`, `@types/three` (dev). React 19 allaqachon bor.

## Tekshiruv holati

- TypeScript, ESLint (komponent), barcha `tests/*.test.cjs`, `pnpm build` o‘tdi.
- Headless Chromium (SwiftShader) da: ochish, sudrab varaqlash (desktop va 390px mobil), mundarijadan o‘tish, chiplar, `+` va savatga qo‘shish, `reveal`, yopish tekshirildi.
- Real telefon GPU’sidagi FPS, ovoz va sensorli sudrash hissi qurilmada alohida tekshirilishi kerak.
- Tashqi domendagi taom rasmlari CORS ruxsat bermasa, sahifada rasm o‘rniga likopcha belgisi chiziladi.
