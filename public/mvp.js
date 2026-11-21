/*
 * SIMPLE_MVP_MODE screens (public/mvp-mode.js turns the mode on; app/mvp.ts is the server side).
 * The 3-step flow:
 *  1. home(): one hero line, a search box and the restaurant grid with simple cards (photo, name,
 *     cuisine · place, "Joy band qilish"); the featured demo "Amanda Restaurant" comes first.
 *  2. restaurant(): one page — the interactive hall / table choice on top (bookingPlan from tables.js) and
 *     the digital menu below (photo, price, "+ Qo‘shish"): book only a table, or a table with dishes.
 *  3. checkout(): the booking form of the chosen table becomes Name, Phone (+998), Time and Guests →
 *     POST /api/bookings/quick → "Bron tasdiqlandi!" with the QR pass. No card, deposit, SMS code or
 *     penalty texts in this mode.
 * restaurant.js and tables.js call these only while window.SIMPLE_MVP_MODE is on; with it off nothing here
 * runs and the full screens are used. Uses the app's own helpers (page, api, esc, state, bookingPlan).
 */
(() => {
  'use strict';
  if (!window.SIMPLE_MVP_MODE) return;
  const COPY = {
    uz: {
      hero: 'Restoranni tanlang va stolingizni 30 soniyada band qiling',
      sub: 'Zal xaritasidan stol tanlang, xohlasangiz taomlarni oldindan belgilang — to‘lovsiz, kodsiz.',
      search: 'Restoran, oshxona yoki taom qidirish…',
      book: 'Joy band qilish',
      none: 'Hech narsa topilmadi. Boshqa so‘z bilan qidiring.',
      empty: 'Restoranlar hali qo‘shilmagan.',
      back: '← Restoranlar',
      hall: '1. Stolni tanlang',
      hallHint: 'Sana va vaqtni belgilang, so‘ng zal xaritasidan bo‘sh stolni bosing.',
      menu: '2. Menyu (ixtiyoriy)',
      menuHint: 'Faqat stol band qilishingiz mumkin yoki taomlarni oldindan tanlang — kelganingizda tayyor bo‘ladi.',
      add: '+ Qo‘shish',
      picked: 'Tanlangan taomlar',
      cartBar: 'Korzinka',
      pcs: 'ta',
      cartTitle: '🛒 Korzinka',
      cartEmpty: 'Korzinka bo‘sh',
      cartEmptyHint: 'Restoran menyusidan (oddiy yoki 3D) taom qo‘shing.',
      toRestaurants: 'Restoranlar',
      toMenu: '← Menyuga qaytish',
      cartSubtotal: 'Taomlar',
      cartTotal: 'Jami summa',
      cartPaid: 'To‘langan',
      cartLeft: 'Qolgan summa',
      cartDepositNote: 'Oldindan to‘lov (avans) stol tanlangandan keyin to‘lov bosqichida ko‘rsatiladi: to‘liq yoki qisman to‘lash mumkin, qolgani restoranda.',
      cartGo: 'Davom etish / Bron qilish',
      cartRemove: 'O‘chirish',
      cartOther: 'Korzinkada boshqa restoran taomlari bor. Ularni o‘chirib, shu restoran taomini qo‘shaymi?',
      cartUnavailable: 'Ayrim taomlar endi mavjud emas — ular korzinkadan olib tashlandi.',
      noMenu: 'Menyu hali kiritilmagan.',
      demo: 'DEMO: namuna restoran — bron jarayonini sinab ko‘rishingiz mumkin, lekin bron haqiqiy restoranga yuborilmaydi.',
      table: 'stol',
      seats: 'kishilik',
      name: 'Ismingiz',
      phone: 'Telefon raqam',
      phoneActive: 'Hozir ishlaydigan telefon raqamingiz (Agar Telegram raqamingiz o‘chgan bo‘lsa, ishlaydiganini yozing)',
      time: 'Vaqt',
      guests: 'Mehmonlar soni',
      confirm: 'Tasdiqlash',
      sending: 'Yuborilmoqda…',
      badPhone: 'Telefon raqamni to‘liq kiriting (mamlakat kodini chapdan tanlang).',
      badUzPhone: 'Raqamni +998 XX XXX XX XX ko‘rinishida kiriting.',
      badName: 'Ismingizni kiriting.',
      done: 'Bron tasdiqlandi!',
      doneDemo: 'DEMO bron ko‘rsatildi',
      doneText: 'Restoranga Telegram orqali darhol xabar yuborildi.',
      doneQueued: 'Bron saqlandi. Restoran tez orada tasdiqlaydi.',
      doneDemoText: 'Bu namuna restoran: bron saqlanmadi va hech kimga yuborilmadi. Haqiqiy restoranlarda xuddi shunday ishlaydi.',
      pass: 'QR chipta',
      close: 'Yopish',
      helpCenter: 'Yordam markazi',
      view3d: '3D ko‘rinish',
      book3d: 'Interaktiv 3D menyu',
      menuList: 'Oddiy menyu',
      menu3dBtn: '3D menyu',
      book3dSub: 'Varaqlab ko‘ring va taom qo‘shing',
      book3dFail: '3D menyuni ochib bo‘lmadi.',
      book3dWait: '3D menyu tayyorlanmoqda…',
      loading3d: '3D model yuklanmoqda…',
      hint3d: 'Barmoq bilan aylantiring, ikki barmoq bilan kattalashtiring.',
      fail3d: '3D model hozir ochilmadi — taom rasmi ko‘rsatildi.',
      tablesSel: (list, seats) => `Tanlangan stollar: ${list} (Jami: ${seats} o‘rin)`,
      addMore: 'Katta guruhmisiz? Zal rejasidan yana bo‘sh stolni tanlang — u ham shu bronga qo‘shiladi.',
      removeTable: 'Olib tashlash',
      logout: 'Chiqish',
      themeLight: 'Kunduzgi rejim',
      themeDark: 'Tungi rejim',
      payMinErr: (m) => `Minimal oldindan to‘lov summasi — ${m} so‘m`,
      payMaxErr: (m) => `Maksimal summa — ${m} so‘m (jami hisob)`,
      payTitle: '💳 Oldindan to‘lov (Card Transfer)',
      payWhy: 'Restoran oldindan to‘lovni so‘raydi (yoki taomlar oldindan buyurtma qilingan). Pulni quyidagi kartaga o‘tkazing va chek rasmini yuklang — tekshirilgach stolingiz tasdiqlanadi.',
      payAmount: 'O‘tkaziladigan summa',
      payCard: 'Karta raqami',
      payHolder: 'Karta egasi',
      payCopy: '📋 Kartani nusxalash (Copy)',
      clickPay: 'Click orqali to‘lash',
      retPaid: '✅ To‘lov qabul qilindi! Joyingiz muvaffaqiyatli band qilindi.',
      retWait: '⏳ To‘lov tekshirilmoqda — chek tasdiqlanishi bilan joyingiz band qilinadi',
      retUpload: 'Click chekini yuklash',
      retSent: 'Chek yuborilgan, tekshiruv natijasi shu yerda va Telegram’da chiqadi.',
      retOtherBrowser: 'Chekni yuklash uchun bron qilgan brauzeringizda “Bronlarim” sahifasini oching.',
      retCancelled: 'Bu bron bekor qilingan yoki to‘lov vaqti tugagan.',
      clickHint: 'Click ilovasi restoran nomi va summa bilan ochiladi. To‘lagach, chek skrinshotini pastga yuklang.',
      payCardOr: 'Yoki karta raqamiga o‘tkazing',
      payCopied: 'Nusxalandi ✓',
      payUntil: (t) => `Stol ${t} gacha ushlab turiladi — shu vaqtgacha to‘lang, aks holda bo‘shatiladi.`,
      payFile: '🧾 To‘lov chekini yuklang / Upload receipt screenshot',
      paySend: '📤 Chekni yuborish',
      paySending: 'Yuborilmoqda…',
      payNoFile: 'Avval chek rasmini tanlang.',
      paySent: '✅ Chek yuborildi! Tekshirilgach stolingiz tasdiqlanadi va restoranga xabar boradi.',
      payTgHint: 'Natijani Telegram’da olish uchun:',
      payUpload: '🧾 Chekni yuklash',
      payChoose: 'Qancha to‘laysiz?',
      payFull: 'To‘liq summa (100%)',
      payAdvance: 'Avans (depozit)',
      payCustom: 'Boshqa summa',
      payNow: 'Hozir o‘tkaziladi',
      payRest: 'Restoranda to‘lanadi',
      payRange: (a, b) => `${a} – ${b} so‘m oralig‘ida`,
      payBad: 'Summa ruxsat etilgan oraliqda emas.',
      bal: ['🧾 Jami hisob', '✅ Oldindan to‘langan', '💳 Restoranda qolgan to‘lov'],
      dep: { p2p_wait: '💳 To‘lov kutilmoqda', p2p_review: '🧾 Chek tekshirilmoqda', p2p_paid: '✅ Oldindan to‘langan', p2p_fake: '🚫 Chek rad etildi' },
      lateCancel: (p) => `Bron vaqtiga 1 soatdan kam qoldi. Bekor qilish uchun restoran admini bilan bog‘laning: ${p || 'restoran telefoni'}`,
      guestsShort: 'kishi',
      sum: 'so‘m',
      booking: 'Band qilinmoqda…',
      doneOk: 'Joyingiz muvaffaqiyatli band qilindi!',
      getPass: '✈️ Telegram’da chiptani olish',
      passHint: 'Bir bosishda botni oching — bron chiptasi va restoran tasdig‘i Telegram’ga keladi.',
      tabs: [['all', 'Barchasi'], ['national', 'Milliy taomlar'], ['europe', 'Yevropa'], ['fast', 'Fast-food']],
      tgBook: 'Telegram orqali band qilish',
      bookNow: 'Joyni band qilish',
      tgNote: 'Ism va telefon Telegram’dan olinadi — hech narsa yozish shart emas.',
      tgWait: 'Telegram’da “Start”, keyin “📱 Raqamni yuborish” tugmasini bosing. Shu sahifa o‘zi davom etadi.',
      tgOpen: 'Telegram’ni ochish',
      tgFail: 'Telegram orqali kirish tugamadi. Qayta urinib ko‘ring.',
      profBtn: '👤 Profil / Bronlarim',
      profTitle: 'Profilim',
      profName: 'Ism',
      profPhone: 'Telefon',
      tgLinked: '✈️ Telegram ulangan',
      tgNotLinked: '✈️ Telegram ulanmagan',
      tgConnect: '✈️ Telegram’ni ulash (1 bosish)',
      profGuest: 'Bron qilganingizdan keyin bronlaringiz shu yerda chiqadi — parol shart emas. Boshqa qurilmada ko‘rish uchun Telegram’ni ulang.',
      profSave: 'Saqlash',
      profSaved: 'Saqlandi ✓',
      bkTitle: 'Bronlarim',
      bkActive: 'Faol bronlar',
      bkPast: 'O‘tgan bronlar',
      bkNone: 'Hozircha bron yo‘q.',
      bkFind: '🪑 Restoran tanlash',
      bkCancel: 'Bekor qilish',
      bkCancelAsk: 'Bu bronni bekor qilasizmi?',
      bkDishes: 'Taomlar',
      st: { pending: '⏳ Tasdiq kutilmoqda', confirmed: '✅ Tasdiqlangan', cancelled: '✖️ Bekor qilingan', rejected: '❌ Joy band', completed: '✔️ Yakunlangan', no_show: '⚠️ Kelinmagan', seated: '🪑 Joyida' },
      close: 'Yopish',
      tgPhone: 'Telegram botda “📱 Raqamni yuborish” tugmasini bosing, so‘ng qayta urinib ko‘ring.',
      reserved: (t, n, time) => `${t}-stol ${n} uchun soat ${time} ga band qilindi`,
      tgSent: 'Bron tafsilotlari Telegram’ingizga yuborildi. Restoran tasdiqlaganda Telegram’da xabar olasiz.',
      tgQueued: 'Bron saqlandi. Restoran tasdiqlaganda Telegram’da xabar olasiz.',
    },
    ru: {
      hero: 'Выберите ресторан и забронируйте стол за 30 секунд',
      sub: 'Выберите стол на схеме зала и, если хотите, блюда заранее — без оплаты и кодов.',
      search: 'Ресторан, кухня или блюдо…',
      book: 'Забронировать стол',
      none: 'Ничего не найдено. Попробуйте другой запрос.',
      empty: 'Рестораны ещё не добавлены.',
      back: '← Рестораны',
      hall: '1. Выберите стол',
      hallHint: 'Укажите дату и время, затем нажмите свободный стол на схеме зала.',
      menu: '2. Меню (по желанию)',
      menuHint: 'Можно забронировать только стол или выбрать блюда заранее — они будут готовы к вашему приходу.',
      add: '+ Добавить',
      picked: 'Выбранные блюда',
      cartBar: 'Корзина',
      pcs: 'шт',
      cartTitle: '🛒 Корзина',
      cartEmpty: 'Корзина пуста',
      cartEmptyHint: 'Добавьте блюда из меню ресторана (обычного или 3D).',
      toRestaurants: 'Рестораны',
      toMenu: '← Назад к меню',
      cartSubtotal: 'Блюда',
      cartTotal: 'Итого',
      cartPaid: 'Оплачено',
      cartLeft: 'Осталось',
      cartDepositNote: 'Предоплата (аванс) будет показана на шаге оплаты после выбора стола: можно оплатить полностью или частично, остальное — в ресторане.',
      cartGo: 'Продолжить / Забронировать',
      cartRemove: 'Удалить',
      cartOther: 'В корзине блюда другого ресторана. Удалить их и добавить это блюдо?',
      cartUnavailable: 'Некоторые блюда больше недоступны — они удалены из корзины.',
      noMenu: 'Меню ещё не добавлено.',
      demo: 'DEMO: пример ресторана — бронирование можно попробовать, но бронь не отправляется в настоящий ресторан.',
      table: 'стол',
      seats: 'мест',
      name: 'Ваше имя',
      phone: 'Номер телефона',
      phoneActive: 'Ваш рабочий номер телефона (если номер в Telegram уже не работает, укажите действующий)',
      time: 'Время',
      guests: 'Гостей',
      confirm: 'Подтвердить',
      sending: 'Отправка…',
      badPhone: 'Введите номер полностью (код страны — слева).',
      badUzPhone: 'Введите номер в формате +998 XX XXX XX XX.',
      badName: 'Введите ваше имя.',
      done: 'Бронь подтверждена!',
      doneDemo: 'DEMO-бронь показана',
      doneText: 'Ресторан сразу получил уведомление в Telegram.',
      doneQueued: 'Бронь сохранена. Ресторан скоро подтвердит её.',
      doneDemoText: 'Это пример ресторана: бронь не сохранена и никуда не отправлена. В настоящих ресторанах всё работает так же.',
      pass: 'QR-пропуск',
      close: 'Закрыть',
      helpCenter: 'Центр помощи',
      view3d: '3D-просмотр',
      book3d: 'Интерактивное 3D-меню',
      menuList: 'Обычное меню',
      menu3dBtn: '3D-меню',
      book3dSub: 'Листайте и добавляйте блюда',
      book3dFail: 'Не удалось открыть 3D-меню.',
      book3dWait: 'Готовим 3D-меню…',
      loading3d: 'Загружаем 3D-модель…',
      hint3d: 'Вращайте пальцем, приближайте двумя пальцами.',
      fail3d: '3D-модель сейчас не открылась — показано фото блюда.',
      tablesSel: (list, seats) => `Выбранные столы: ${list} (Всего: ${seats} мест)`,
      addMore: 'Большая компания? Выберите на схеме зала ещё свободный стол — он добавится в эту бронь.',
      removeTable: 'Убрать',
      logout: 'Выйти',
      themeLight: 'Светлая тема',
      themeDark: 'Тёмная тема',
      payMinErr: (m) => `Минимальная предоплата — ${m} сум`,
      payMaxErr: (m) => `Максимум — ${m} сум (весь счёт)`,
      payTitle: '💳 Предоплата (перевод на карту)',
      payWhy: 'Ресторан просит предоплату (или заказаны блюда заранее). Переведите сумму на карту ниже и загрузите снимок чека — после проверки столик будет подтверждён.',
      payAmount: 'Сумма перевода',
      payCard: 'Номер карты',
      payHolder: 'Владелец карты',
      payCopy: '📋 Скопировать карту',
      clickPay: 'Оплатить через Click',
      retPaid: '✅ Оплата получена! Ваш стол забронирован.',
      retWait: '⏳ Оплата проверяется — стол будет закреплён, как только чек подтвердят',
      retUpload: 'Загрузить чек Click',
      retSent: 'Чек отправлен, результат появится здесь и в Telegram.',
      retOtherBrowser: 'Чтобы загрузить чек, откройте «Мои брони» в браузере, где делали бронь.',
      retCancelled: 'Эта бронь отменена или время оплаты истекло.',
      clickHint: 'Откроется приложение Click с рестораном и суммой. После оплаты загрузите снимок чека ниже.',
      payCardOr: 'Или переведите на карту',
      payCopied: 'Скопировано ✓',
      payUntil: (t) => `Столик держится до ${t} — оплатите до этого времени, иначе он освободится.`,
      payFile: '🧾 Загрузите чек оплаты / Upload receipt screenshot',
      paySend: '📤 Отправить чек',
      paySending: 'Отправляем…',
      payNoFile: 'Сначала выберите снимок чека.',
      paySent: '✅ Чек отправлен! После проверки столик подтвердят, а ресторан получит уведомление.',
      payTgHint: 'Чтобы получить ответ в Telegram:',
      payUpload: '🧾 Загрузить чек',
      payChoose: 'Сколько оплатите сейчас?',
      payFull: 'Полная сумма (100%)',
      payAdvance: 'Аванс (депозит)',
      payCustom: 'Другая сумма',
      payNow: 'Переводите сейчас',
      payRest: 'Оплатите в ресторане',
      payRange: (a, b) => `от ${a} до ${b} сум`,
      payBad: 'Сумма вне допустимого диапазона.',
      bal: ['🧾 Итого', '✅ Оплачено заранее', '💳 Оплатить в ресторане'],
      dep: { p2p_wait: '💳 Ждём оплату', p2p_review: '🧾 Чек проверяется', p2p_paid: '✅ Предоплата получена', p2p_fake: '🚫 Чек отклонён' },
      lateCancel: (p) => `До брони меньше 1 часа. Чтобы отменить, свяжитесь с администратором ресторана: ${p || 'телефон ресторана'}`,
      guestsShort: 'гост.',
      sum: 'сум',
      booking: 'Бронируем…',
      doneOk: 'Ваш столик успешно забронирован!',
      getPass: '✈️ Получить бронь в Telegram',
      passHint: 'Откройте бота в одно касание — бронь и подтверждение ресторана придут в Telegram.',
      tabs: [['all', 'Все'], ['national', 'Национальная кухня'], ['europe', 'Европейская'], ['fast', 'Фастфуд']],
      tgBook: 'Забронировать через Telegram',
      bookNow: 'Забронировать',
      tgNote: 'Имя и телефон берутся из Telegram — ничего вводить не нужно.',
      tgWait: 'В Telegram нажмите «Start», затем «📱 Отправить номер». Эта страница продолжит сама.',
      tgOpen: 'Открыть Telegram',
      tgFail: 'Вход через Telegram не завершён. Попробуйте ещё раз.',
      profBtn: '👤 Профиль / Брони',
      profTitle: 'Мой профиль',
      profName: 'Имя',
      profPhone: 'Телефон',
      tgLinked: '✈️ Telegram подключён',
      tgNotLinked: '✈️ Telegram не подключён',
      tgConnect: '✈️ Подключить Telegram (1 нажатие)',
      profGuest: 'После бронирования ваши брони появятся здесь — без пароля. Чтобы видеть их на другом устройстве, подключите Telegram.',
      profSave: 'Сохранить',
      profSaved: 'Сохранено ✓',
      bkTitle: 'Мои брони',
      bkActive: 'Активные брони',
      bkPast: 'Прошлые брони',
      bkNone: 'Пока нет броней.',
      bkFind: '🪑 Выбрать ресторан',
      bkCancel: 'Отменить',
      bkCancelAsk: 'Отменить эту бронь?',
      bkDishes: 'Блюда',
      st: { pending: '⏳ Ждёт подтверждения', confirmed: '✅ Подтверждена', cancelled: '✖️ Отменена', rejected: '❌ Мест нет', completed: '✔️ Завершена', no_show: '⚠️ Не пришли', seated: '🪑 На месте' },
      close: 'Закрыть',
      tgPhone: 'В боте Telegram нажмите «📱 Отправить номер» и попробуйте снова.',
      reserved: (t, n, time) => `Стол №${t} забронирован для ${n} на ${time}`,
      tgSent: 'Детали брони отправлены вам в Telegram. Когда ресторан подтвердит, придёт сообщение.',
      tgQueued: 'Бронь сохранена. Когда ресторан подтвердит, придёт сообщение в Telegram.',
    },
    en: {
      hero: 'Choose a restaurant and book your table in 30 seconds',
      sub: 'Pick a table on the hall plan and, if you like, your dishes in advance — no payment, no codes.',
      search: 'Search a restaurant, cuisine or dish…',
      book: 'Book a Table',
      none: 'Nothing found. Try another search.',
      empty: 'No restaurants yet.',
      back: '← Restaurants',
      hall: '1. Choose your table',
      hallHint: 'Set the date and time, then tap a free table on the hall plan.',
      menu: '2. Menu (optional)',
      menuHint: 'Book just a table, or pick dishes in advance — they will be ready when you arrive.',
      add: '+ Add',
      picked: 'Selected dishes',
      cartBar: 'Cart',
      pcs: 'pcs',
      cartTitle: '🛒 Cart',
      cartEmpty: 'Your cart is empty',
      cartEmptyHint: 'Add dishes from a restaurant menu (list or 3D).',
      toRestaurants: 'Restaurants',
      toMenu: '← Back to the menu',
      cartSubtotal: 'Dishes',
      cartTotal: 'Total',
      cartPaid: 'Paid',
      cartLeft: 'Remaining',
      cartDepositNote: 'The prepayment (advance) is shown at the payment step after you pick a table: pay in full or in part, the rest at the restaurant.',
      cartGo: 'Continue / Book a table',
      cartRemove: 'Remove',
      cartOther: 'Your cart has dishes from another restaurant. Remove them and add this dish?',
      cartUnavailable: 'Some dishes are no longer available — they were removed from the cart.',
      noMenu: 'The menu has not been added yet.',
      demo: 'DEMO: a sample restaurant — try the booking flow, but the booking is not sent to a real restaurant.',
      table: 'table',
      seats: 'seats',
      name: 'Full name',
      phone: 'Phone number',
      phoneActive: 'Your phone number that works now (if your Telegram number is switched off, enter a working one)',
      time: 'Time',
      guests: 'Guests',
      confirm: 'Confirm Booking',
      sending: 'Sending…',
      badPhone: 'Enter the full phone number (pick the country code on the left).',
      badUzPhone: 'Enter the number as +998 XX XXX XX XX.',
      badName: 'Enter your name.',
      done: 'Booking Confirmed!',
      doneDemo: 'DEMO booking shown',
      doneText: 'The restaurant was notified on Telegram right away.',
      doneQueued: 'Your booking is saved. The restaurant will confirm it shortly.',
      doneDemoText: 'This is a sample restaurant: the booking was not saved or sent. Real restaurants work exactly like this.',
      pass: 'QR pass',
      close: 'Close',
      helpCenter: 'Help center',
      view3d: '3D view',
      book3d: 'Interactive 3D menu',
      menuList: 'Simple menu',
      menu3dBtn: '3D menu',
      book3dSub: 'Flip through and add dishes',
      book3dFail: 'The 3D menu could not open.',
      book3dWait: 'Preparing the 3D menu…',
      loading3d: 'Loading the 3D model…',
      hint3d: 'Drag to spin, pinch to zoom.',
      fail3d: 'The 3D model could not open — showing the dish photo.',
      tablesSel: (list, seats) => `Selected tables: ${list} (Total: ${seats} seats)`,
      addMore: 'Large group? Pick another free table on the hall plan — it joins this booking.',
      removeTable: 'Remove',
      logout: 'Log out',
      themeLight: 'Light mode',
      themeDark: 'Dark mode',
      payMinErr: (m) => `Minimum prepayment — ${m} UZS`,
      payMaxErr: (m) => `Maximum — ${m} UZS (the whole bill)`,
      payTitle: '💳 Prepayment (card transfer)',
      payWhy: 'The restaurant asks for a prepayment (or dishes are pre-ordered). Transfer the amount to the card below and upload a screenshot of the receipt — your table is confirmed once it is checked.',
      payAmount: 'Amount to transfer',
      payCard: 'Card number',
      payHolder: 'Card holder',
      payCopy: '📋 Copy card number',
      clickPay: 'Pay via Click',
      retPaid: '✅ Payment received! Your table is booked.',
      retWait: '⏳ Payment is being checked — your table is booked as soon as the receipt is confirmed',
      retUpload: 'Upload the Click receipt',
      retSent: 'Receipt sent — the result appears here and in Telegram.',
      retOtherBrowser: 'To upload the receipt, open “My bookings” in the browser you booked with.',
      retCancelled: 'This booking was cancelled or the payment time ran out.',
      clickHint: 'The Click app opens with the restaurant and the amount. After paying, upload the receipt screenshot below.',
      payCardOr: 'Or transfer to the card',
      payCopied: 'Copied ✓',
      payUntil: (t) => `The table is held until ${t} — pay before then, or it is released.`,
      payFile: '🧾 Upload receipt screenshot',
      paySend: '📤 Send receipt',
      paySending: 'Sending…',
      payNoFile: 'Choose the receipt picture first.',
      paySent: '✅ Receipt sent! Once it is checked your table is confirmed and the restaurant is told.',
      payTgHint: 'To get the answer in Telegram:',
      payUpload: '🧾 Upload receipt',
      payChoose: 'How much will you pay now?',
      payFull: 'Full amount (100%)',
      payAdvance: 'Advance (deposit)',
      payCustom: 'Other amount',
      payNow: 'Transfer now',
      payRest: 'Pay at the restaurant',
      payRange: (a, b) => `between ${a} and ${b} UZS`,
      payBad: 'The amount is outside the allowed range.',
      bal: ['🧾 Total bill', '✅ Paid in advance', '💳 Left to pay at the restaurant'],
      dep: { p2p_wait: '💳 Payment awaited', p2p_review: '🧾 Receipt being checked', p2p_paid: '✅ Prepaid', p2p_fake: '🚫 Receipt rejected' },
      lateCancel: (p) => `Less than 1 hour to your booking. To cancel, contact the restaurant admin: ${p || 'the restaurant phone'}`,
      guestsShort: 'guests',
      sum: 'UZS',
      booking: 'Booking…',
      doneOk: 'Booking Confirmed!',
      getPass: '✈️ Get your pass in Telegram',
      passHint: 'Open the bot in one tap — your booking and the restaurant’s confirmation arrive in Telegram.',
      tabs: [['all', 'All'], ['national', 'National cuisine'], ['europe', 'European'], ['fast', 'Fast-food']],
      tgBook: 'Book with Telegram',
      bookNow: 'Book Now',
      tgNote: 'Your name and phone come from Telegram — nothing to type.',
      tgWait: 'In Telegram tap “Start”, then “📱 Share my number”. This page continues by itself.',
      tgOpen: 'Open Telegram',
      tgFail: 'Telegram sign-in did not finish. Please try again.',
      profBtn: '👤 Profile / Bookings',
      profTitle: 'My profile',
      profName: 'Name',
      profPhone: 'Phone',
      tgLinked: '✈️ Telegram connected',
      tgNotLinked: '✈️ Telegram not connected',
      tgConnect: '✈️ Connect Telegram (1 tap)',
      profGuest: 'After you book, your bookings show up here — no password needed. Connect Telegram to see them on another device.',
      profSave: 'Save',
      profSaved: 'Saved ✓',
      bkTitle: 'My bookings',
      bkActive: 'Active bookings',
      bkPast: 'Past bookings',
      bkNone: 'No bookings yet.',
      bkFind: '🪑 Choose a restaurant',
      bkCancel: 'Cancel',
      bkCancelAsk: 'Cancel this booking?',
      bkDishes: 'Dishes',
      st: { pending: '⏳ Waiting for confirmation', confirmed: '✅ Confirmed', cancelled: '✖️ Cancelled', rejected: '❌ No seats', completed: '✔️ Completed', no_show: '⚠️ No-show', seated: '🪑 Seated' },
      close: 'Close',
      tgPhone: 'In the Telegram bot tap “📱 Share my number”, then try again.',
      reserved: (t, n, time) => `Table #${t} reserved for ${n} at ${time}`,
      tgSent: 'The booking details were sent to your Telegram. You will get a message when the restaurant confirms.',
      tgQueued: 'Your booking is saved. You will get a Telegram message when the restaurant confirms.',
    },
  };
  // RF_I18N (i18n.js) is a top-level const, not a window property.
  const lang = () => (typeof RF_I18N !== 'undefined' ? RF_I18N.lang : document.documentElement.lang);
  const c = (k) => (COPY[lang()] || COPY.uz)[k];
  const h = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const money = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ' + c('sum');
  const isDemo = (r) => !!r.is_demo || String(r.id).startsWith('rf-demo-');
  const AMANDA = 'rf-demo-amanda';
  /*
   * 🛒 The one cart ("Korzinka"): the dishes picked on the list, in the 3D book and in the 3D dish viewer are the
   * same items, kept in localStorage "rf-cart" (the app's cart, one restaurant at a time — the shape readCart()
   * reads: { restaurantId, fulfillment, items: [{ id, quantity }] }), so nothing is lost when the guest switches
   * views, opens #/cart or reloads. Each item also keeps its name, price and photo for the floating bar.
   */
  const CART_KEY = 'rf-cart';
  const menus = new Map(); // restaurant id → its menu (the last one shown)
  function cartRead() {
    try {
      const x = JSON.parse(localStorage.getItem(CART_KEY) || 'null');
      if (x && typeof x.restaurantId === 'string' && Array.isArray(x.items)) return { restaurantId: x.restaurantId, fulfillment: x.fulfillment === 'delivery' ? 'delivery' : 'pickup', items: x.items.filter((i) => i && typeof i.id === 'string' && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 20).slice(0, 30) };
    } catch {}
    return null;
  }
  function cartWrite(cart) {
    const keep = cart?.items.length ? cart : null;
    try {
      keep ? localStorage.setItem(CART_KEY, JSON.stringify(keep)) : localStorage.removeItem(CART_KEY);
    } catch {}
    // The app's own copy (ui/restaurant.js readCart) follows.
    if (typeof state !== 'undefined' && state) state.cart = keep;
    cartBar();
  }
  // A Map of dish id → quantity for one restaurant; every change is written to the cart at once.
  class CartMap extends Map {
    constructor(rid, entries) {
      super(entries);
      this.rid = rid;
    }
    set(k, v) {
      super.set(k, v);
      if (this.rid) this.save();
      return this;
    }
    delete(k) {
      const had = super.delete(k);
      if (this.rid) this.save();
      return had;
    }
    save() {
      const old = cartRead(),
        menu = menus.get(this.rid) || [];
      const was = old?.restaurantId === this.rid ? new Map(old.items.map((i) => [i.id, i])) : new Map();
      const items = [...super.entries()].map(([id, quantity]) => {
        const m = menu.find((x) => x.id === id),
          o = was.get(id) || {};
        return { id, quantity, name: m?.name ?? o.name ?? '', price: Number(m?.price ?? o.price) || 0, image: m?.image_url ?? o.image ?? '' };
      });
      if (!items.length && old && old.restaurantId !== this.rid) return cartBar();
      cartWrite({ restaurantId: this.rid, fulfillment: old?.fulfillment || 'pickup', items });
    }
  }
  const picks = { delete: (rid) => (cartRead()?.restaurantId === rid ? cartWrite(null) : null) };
  const typed = { name: '', phone: '', guests: '' };
  try {
    Object.assign(typed, JSON.parse(localStorage.getItem('rf-mvp-contact') || '{}'));
  } catch {}

  // ---------- Step 1: home ----------
  function card(r) {
    const place = [r.cuisine, r.city || '', r.address].filter(Boolean).join(' · ');
    return `<article class="mvp-card${r.id === AMANDA ? ' featured' : ''}" data-restaurant-id="${h(r.id)}"><a class="mvp-card-photo" href="#/restaurant/${encodeURIComponent(r.id)}" tabindex="-1" aria-hidden="true">${r.image_url ? `<img src="${h(r.image_url)}" alt="" loading="lazy" decoding="async" width="640" height="400">` : `<span>${h(r.name[0] || '')}</span>`}${isDemo(r) ? '<span class="mvp-demo-tag">DEMO</span>' : ''}</a><div class="mvp-card-body"><h3>${h(r.name)}</h3><p>${h(place)}</p><a class="primary mvp-book" href="#/restaurant/${encodeURIComponent(r.id)}">${h(c('book'))} →</a></div></article>`;
  }
  const sorted = () => [...(state.catalog || [])].sort((a, b) => (a.id === AMANDA ? -1 : b.id === AMANDA ? 1 : isDemo(a) - isDemo(b)));
  function matches(r, q) {
    if (!q) return true;
    const hay = [r.name, r.cuisine, r.address, r.city, ...(state.menu || []).filter((m) => m.restaurant_id === r.id).map((m) => m.name)].join(' ').toLowerCase();
    return q
      .toLowerCase()
      .split(/\s+/)
      .every((w) => hay.includes(w));
  }
  // Basic category tabs: by the restaurant's cuisine and its dishes.
  const TAB_RX = { national: /milliy|o[‘'ʻ`]?zbek|uzbek|национ|узбек|osh|palov|shashlik/i, europe: /yevropa|europe|европ|ital|итал|pasta|pitsa|pizza|steyk|steak/i, fast: /fast|burger|lavash|hot.?dog|фаст|бургер|шаурм|donar|kfc/i };
  let tab = 'all';
  const inTab = (r) => tab === 'all' || TAB_RX[tab].test([r.cuisine, r.name, ...(state.menu || []).filter((m) => m.restaurant_id === r.id).map((m) => m.name + ' ' + m.category)].join(' '));
  const tabs = () => `<div class="mvp-tabs" role="tablist">${c('tabs').map(([k, v]) => `<button type="button" role="tab" data-tab="${k}" aria-pressed="${tab === k}">${h(v)}</button>`).join('')}</div>`;
  function grid(q) {
    const list = sorted().filter((r) => inTab(r) && matches(r, q));
    return list.length ? `<div class="mvp-grid">${list.map(card).join('')}</div>` : `<p class="mvp-empty">${h(state.catalog?.length ? c('none') : c('empty'))}</p>`;
  }
  function home() {
    let q = '';
    try {
      q = sessionStorage.getItem('rf-mvp-q') || '';
    } catch {}
    page(c('hero'), `<p class="mvp-sub">${h(c('sub'))}</p><label class="mvp-search"><span aria-hidden="true">🔍</span><input type="search" id="mvpSearch" value="${h(q)}" placeholder="${h(c('search'))}" aria-label="${h(c('search'))}" autocomplete="off" enterkeyhint="search"></label><div id="mvpTabs">${tabs()}</div><section id="mvpGrid">${grid(q)}</section>`);
    const input = document.getElementById('mvpSearch');
    input.oninput = () => {
      try {
        sessionStorage.setItem('rf-mvp-q', input.value);
      } catch {}
      document.getElementById('mvpGrid').innerHTML = grid(input.value.trim());
    };
    document.getElementById('mvpTabs').onclick = (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      tab = b.dataset.tab;
      document.getElementById('mvpTabs').innerHTML = tabs();
      document.getElementById('mvpGrid').innerHTML = grid(input.value.trim());
    };
  }

  // ---------- Step 2: one page — hall on top, menu below ----------
  const picked = (rid) => {
    const x = cartRead();
    return new CartMap(rid, x?.restaurantId === rid ? x.items.map((i) => [i.id, i.quantity]) : []);
  };
  const cartCount = (x = cartRead()) => (x?.items || []).reduce((n, i) => n + i.quantity, 0);
  const cartSum = (x = cartRead()) => (x?.items || []).reduce((n, i) => n + (Number(i.price) || 0) * i.quantity, 0);
  /*
   * The floating bar "🛒 Korzinka · 3 ta · 145 000 so‘m" above the bottom menu, while the cart has dishes (not on
   * the cart page itself); its round icon is where the dishes fly to (data-cart-target, RFCartFX).
   */
  function cartBar() {
    if (typeof document === 'undefined' || !document.body) return;
    let bar = document.getElementById('mvpCartBar');
    const x = cartRead(),
      n = cartCount(x),
      onCart = /^#\/cart\b/.test(location.hash);
    if (!bar) {
      if (!n) return;
      bar = document.createElement('a');
      bar.id = 'mvpCartBar';
      bar.className = 'mvp-cartbar';
      bar.href = '#/cart';
      document.body.append(bar);
    }
    bar.hidden = !n || onCart;
    if (!n) return;
    const label = `${c('cartBar')} · ${n} ${c('pcs')} · ${money(cartSum(x))}`;
    bar.setAttribute('aria-label', '🛒 ' + label);
    bar.innerHTML = `<span class="mvp-cartbar-ico" data-cart-target aria-hidden="true">🛒<b>${n}</b></span><span class="mvp-cartbar-text">${h(c('cartBar'))} · ${n} ${h(c('pcs'))} · <b>${h(money(cartSum(x)))}</b></span><span class="mvp-cartbar-go" aria-hidden="true">›</span>`;
  }
  /** The flight to the cart (RFCartFX): from the tapped "+" (with the dish photo), or back when one leaves. */
  function flyToCart(at, photo, back) {
    try {
      window.RFCartFX?.point?.(at, photo || '', back);
    } catch {}
  }
  const centre = (el) => {
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  };
  function dishCard(m, sel) {
    const q = sel.get(m.id) || 0;
    // Photo (or the food icon), with a "🧊 3D" button when the dish has a 3D model (menu.model_3d_url).
    const media = m.image_url ? `<img src="${h(m.image_url)}" alt="" loading="lazy" decoding="async" width="320" height="240">` : '<span class="mvp-dish-ph" aria-hidden="true">🍽</span>';
    return `<article class="mvp-dish${m.available ? '' : ' off'}" data-dish="${h(m.id)}"><div class="mvp-dish-media">${media}${m.model_3d_url ? `<button type="button" class="mvp-3d" data-3d="${h(m.id)}" aria-label="${h(c('view3d'))}: ${h(m.name)}">🧊 3D</button>` : ''}</div><div><h3>${h(m.name)}</h3><p class="mvp-price">${money(m.price)}</p>${q ? `<span class="mvp-qty"><button type="button" data-step="-1" aria-label="−">−</button><b>${q}</b><button type="button" data-step="1" aria-label="+">+</button></span>` : `<button type="button" class="mvp-add" data-step="1" ${m.available ? '' : 'disabled'}>${h(c('add'))}</button>`}</div></article>`;
  }
  function pickedSummary(r, menu) {
    const sel = picked(r.id),
      rows = [...sel].map(([id, q]) => ({ m: menu.find((x) => x.id === id), q })).filter((x) => x.m);
    if (!rows.length) return '';
    const total = rows.reduce((s, x) => s + x.m.price * x.q, 0);
    return `<p class="mvp-picked">🍽 ${h(c('picked'))}: ${rows.map((x) => h(x.m.name) + ' ×' + x.q).join(', ')} · <b>${money(total)}</b></p>`;
  }
  /*
   * The menu section: two buttons on top — "📋 Oddiy menyu" (opens / hides the dish list) and "📖 3D menyu" (the
   * full-screen 3D book). The list is not shown until asked for (no WebGL: the list is shown, no 3D button).
   */
  let menuListOpen = false;
  const menuInner = (r, menu, sel) => {
    const gl = webgl(),
      open = menuListOpen || !gl;
    const modes = menu.length ? `<div class="mvp-menu-modes" role="group" aria-label="${h(c('menu'))}"><button type="button" class="mvp-mode" data-menu-list aria-pressed="${open}" aria-expanded="${open}">📋 ${h(c('menuList'))}</button>${gl ? `<button type="button" class="mvp-mode mvp-mode-3d" data-book3d>📖 ${h(c('menu3dBtn'))}</button>` : ''}</div>` : '';
    return `<h2>${h(c('menu'))}</h2><p class="muted">${h(c('menuHint'))}</p>${modes}${menu.length ? `<div class="mvp-menu" ${open ? '' : 'hidden'}>${menu.map((m) => dishCard(m, sel)).join('')}</div>` : `<p>${h(c('noMenu'))}</p>`}<div data-mvp-picked>${pickedSummary(r, menu)}</div>`;
  };
  /*
   * One place that changes a dish's quantity: the card, the "Selected dishes" bar and the open checkout form follow
   * (the booking sends these dishes; the prepayment step then shows the bill, the advance and the rest).
   */
  function stepDish(r, menu, id, delta) {
    const sel = picked(r.id),
      m = menu.find((x) => x.id === id);
    if (!m?.available) return sel.get(id) || 0;
    menus.set(r.id, menu);
    const other = cartRead();
    if (delta > 0 && other && other.restaurantId !== r.id && other.items.length) {
      if (!confirm(c('cartOther'))) return sel.get(id) || 0;
      cartWrite(null);
    }
    const q = Math.max(0, Math.min(20, (sel.get(id) || 0) + delta));
    q ? sel.set(id, q) : sel.delete(id);
    const card = document.querySelector(`#mvpMenu [data-dish="${CSS.escape(id)}"]`);
    if (card) card.outerHTML = dishCard(m, sel);
    const bar = document.querySelector('#mvpMenu [data-mvp-picked]');
    if (bar) bar.innerHTML = pickedSummary(r, menu);
    document.querySelectorAll('[data-mvp-form-picked]').forEach((x) => (x.innerHTML = pickedSummary(r, menu)));
    return q;
  }
  /*
   * 🧊 3D: the dish's .glb in <model-viewer> (vendored, loaded only now; auto-rotate, drag to spin, pinch to zoom),
   * with the same − / + / Add controls. A model that cannot load leaves the photo and a short note.
   */
  // The 3D book's cart button: there is no cart page here — the book closes and the page shows the chosen dishes.
  // The book's 🛒 closes the book and opens the cart page (#/cart) — the same items as here.
  let glOk = null;
  const webgl = () => {
    if (glOk === null)
      try {
        const cv = document.createElement('canvas');
        glOk = !!(cv.getContext('webgl2') || cv.getContext('webgl'));
      } catch {
        glOk = false;
      }
    return glOk;
  };
  function openBook3d(r, menu, button) {
    if (button.getAttribute('aria-busy') === 'true' || typeof menuBookData !== 'function') return;
    button.setAttribute('aria-busy', 'true');
    // At once, before the 3D code starts: a full-screen "preparing" layer (its spinner runs on the compositor,
    // so it keeps turning while the phone is busy) — the first open no longer looks frozen.
    const wait = document.createElement('div');
    wait.className = 'mvp-book-wait';
    wait.setAttribute('role', 'status');
    wait.innerHTML = `<span class="mvp-book-spin" aria-hidden="true"></span><b>📖 ${h(c('book3dWait'))}</b>`;
    document.body.append(wait);
    const unwait = () => setTimeout(() => wait.remove(), 350);
    const done = () => document.documentElement.classList.remove('rf-book-open');
    window
      .RF3DLoad?.()
      .then((api) =>
        api.fullscreenMenu.open({
          data: menuBookData(r, menu),
          lang: document.documentElement.lang,
          cartQuantity: (id) => picked(r.id).get(id) || 0,
          onCartChange: (dish, delta, at) => {
            const before = picked(r.id).get(dish.id) || 0;
            const changed = stepDish(r, menu, dish.id, delta) !== before;
            if (changed) flyToCart(at, menu.find((x) => x.id === dish.id)?.image_url, delta < 0);
            return changed;
          },
          origin: button,
          onClose: () => (done(), button.focus()),
        }),
      )
      .then(() => (unwait(), setTimeout(() => document.documentElement.classList.add('rf-book-open'), 450)))
      .catch(() => (wait.remove(), done(), alert(c('book3dFail'))))
      .finally(() => button.removeAttribute('aria-busy'));
  }
  let viewerLoad = null;
  const loadViewer = () => (viewerLoad ??= import('/vendor/model-viewer-4.4.0.min.js'));
  async function open3d(r, menu, id) {
    const m = menu.find((x) => x.id === id);
    if (!m?.model_3d_url) return;
    let dlg = document.getElementById('mvp3d');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'mvp3d';
      dlg.className = 'mvp-done mvp-3d-dlg';
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg) dlg.close();
      });
      dlg.addEventListener('close', () => (dlg.innerHTML = ''));
      document.body.append(dlg);
    }
    const controls = () => {
      const q = picked(r.id).get(id) || 0;
      return q ? `<span class="mvp-qty"><button type="button" data-q="-1" aria-label="−">−</button><b>${q}</b><button type="button" data-q="1" aria-label="+">+</button></span>` : `<button type="button" class="mvp-add" data-q="1" ${m.available ? '' : 'disabled'}>${h(c('add'))}</button>`;
    };
    dlg.innerHTML = `<div class="mvp-3d-stage"><p class="mvp-3d-wait">⏳ ${h(c('loading3d'))}</p></div><h2>${h(m.name)}</h2><p class="mvp-price">${money(m.price)}</p><div class="mvp-3d-controls">${controls()}</div><p class="muted mvp-3d-hint">${h(c('hint3d'))}</p><button type="button" class="quiet" data-close>${h(c('close'))}</button>`;
    dlg.querySelector('[data-close]').onclick = () => dlg.close();
    dlg.querySelector('.mvp-3d-controls').onclick = (e) => {
      const b = e.target.closest('[data-q]');
      if (!b) return;
      stepDish(r, menu, id, Number(b.dataset.q));
      dlg.querySelector('.mvp-3d-controls').innerHTML = controls();
    };
    if (!dlg.open) dlg.showModal();
    const stage = dlg.querySelector('.mvp-3d-stage');
    try {
      await loadViewer();
      if (!dlg.open) return;
      const viewer = document.createElement('model-viewer');
      Object.assign(viewer, { src: m.model_3d_url, alt: m.name });
      for (const [k, v] of Object.entries({ 'camera-controls': '', 'auto-rotate': '', 'touch-action': 'pan-y', 'shadow-intensity': '1', 'interaction-prompt': 'auto', exposure: '1' })) viewer.setAttribute(k, v);
      if (m.image_url) viewer.setAttribute('poster', m.image_url);
      viewer.addEventListener('error', () => (stage.innerHTML = `${m.image_url ? `<img src="${h(m.image_url)}" alt="">` : '<span class="mvp-dish-ph" aria-hidden="true">🍽</span>'}<p class="muted">${h(c('fail3d'))}</p>`));
      viewer.addEventListener('load', () => stage.querySelector('.mvp-3d-wait')?.remove());
      stage.append(viewer);
    } catch {
      stage.innerHTML = `${m.image_url ? `<img src="${h(m.image_url)}" alt="">` : '<span class="mvp-dish-ph" aria-hidden="true">🍽</span>'}<p class="muted">${h(c('fail3d'))}</p>`;
    }
  }
  let shown = null; // the restaurant page on screen: { r, menu } (for relabel)
  let lastCheckout = null; // the open checkout: { form, ctx }
  async function restaurant(r, menu, seq) {
    shown = { r, menu };
    menus.set(r.id, menu);
    const sel = picked(r.id);
    const place = [r.cuisine, r.address].filter(Boolean).join(' · ');
    page(r.name, `<a class="link back" href="#/discover">${h(c('back'))}</a>${isDemo(r) ? `<p class="notice mvp-demo-note">${h(c('demo'))}</p>` : ''}<p class="mvp-place">${h(place)}</p><section class="panel mvp-step" id="mvpHall"><h2>${h(c('hall'))}</h2><p class="muted">${h(c('hallHint'))}</p><div class="booking-panel" id="bookingPlan"><p>…</p></div></section><section class="panel mvp-step" id="mvpMenu">${menuInner(r, menu, sel)}</section>`);
    const box = document.getElementById('mvpMenu');
    // The 3D menu's code is downloaded (not run) once the menu section is near the screen.
    if (webgl() && window.RF3DPrefetch && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        (window.requestIdleCallback || setTimeout)(() => window.RF3DPrefetch());
      }, { rootMargin: '600px' });
      io.observe(box);
    }
    box.addEventListener('click', (e) => {
      // 📖 The full-screen 3D menu book: − / + in the book change the same dishes as the cards here.
      const book = e.target.closest('[data-book3d]');
      if (book) return openBook3d(r, menu, book);
      const list = e.target.closest('[data-menu-list]');
      if (list) {
        menuListOpen = list.getAttribute('aria-pressed') !== 'true';
        list.setAttribute('aria-pressed', String(menuListOpen));
        list.setAttribute('aria-expanded', String(menuListOpen));
        box.querySelector('.mvp-menu')?.toggleAttribute('hidden', !menuListOpen);
        return;
      }
      const v = e.target.closest('[data-3d]');
      if (v) return open3d(r, menu, v.dataset['3d']);
      const b = e.target.closest('[data-step]');
      if (!b) return;
      const card = b.closest('[data-dish]'),
        img = card.querySelector('.mvp-dish-media img'),
        id = card.dataset.dish,
        step = Number(b.dataset.step),
        at = centre(img && step > 0 ? img : b),
        before = picked(r.id).get(id) || 0;
      if (stepDish(r, menu, id, step) !== before) flyToCart(at, img?.currentSrc || img?.src, step < 0);
    });
    // "Davom etish / Bron qilish" on the cart page: straight to the hall (the dishes are already picked).
    let toHall = false;
    try {
      toHall = sessionStorage.getItem('rf-cart-go') === r.id;
      sessionStorage.removeItem('rf-cart-go');
    } catch {}
    if (toHall) setTimeout(() => document.getElementById('mvpHall')?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
    cartBar();
    await bookingPlan(r.id, r, seq);
  }

  /*
   * #/cart — the cart as its own page (top bar and bottom menu stay): the dishes with − / + and remove, the sum,
   * the money lines the booking will carry (total / paid / remaining — the advance is chosen at the payment step),
   * and "Davom etish / Bron qilish" → the restaurant's hall with these dishes already in the booking.
   */
  async function cartPage(seq) {
    const x = cartRead();
    let r = null,
      menu = [];
    if (x && typeof loadCatalog === 'function') {
      await loadCatalog().catch(() => null);
      if (seq && typeof state !== 'undefined' && seq !== state.seq) return;
      r = state.catalog?.find((y) => y.id === x.restaurantId) || null;
      menu = (state.menu || []).filter((m) => m.restaurant_id === x.restaurantId);
    }
    const draw = (note) => {
      const cart = cartRead();
      if (!cart?.items.length || !r) {
        page(c('cartTitle'), `<section class="panel mvp-cart-empty"><p class="mvp-cart-big" aria-hidden="true">🛒</p><h2>${h(c('cartEmpty'))}</h2><p class="muted">${h(c('cartEmptyHint'))}</p><a class="primary" href="#/discover">${h(c('toRestaurants'))}</a></section>`);
        return cartBar();
      }
      const rows = cart.items.map((i) => ({ i, m: menu.find((y) => y.id === i.id) }));
      const total = rows.reduce((s, { i, m }) => s + (Number(m?.price ?? i.price) || 0) * i.quantity, 0);
      const line = ({ i, m }) => {
        const name = m?.name || i.name || '—',
          price = Number(m?.price ?? i.price) || 0,
          img = m?.image_url || i.image;
        return `<li class="mvp-cart-row" data-cart-id="${h(i.id)}">${img ? `<img src="${h(img)}" alt="" width="64" height="64" loading="lazy" decoding="async">` : '<span class="mvp-dish-ph" aria-hidden="true">🍽</span>'}<div class="mvp-cart-info"><b>${h(name)}</b><span class="muted">${money(price)} × ${i.quantity} = <b>${money(price * i.quantity)}</b></span></div><span class="mvp-qty"><button type="button" data-cart-step="-1" aria-label="− ${h(name)}">−</button><b>${i.quantity}</b><button type="button" data-cart-step="1" aria-label="+ ${h(name)}">+</button></span><button type="button" class="mvp-cart-del" data-cart-del aria-label="${h(c('cartRemove'))}: ${h(name)}" title="${h(c('cartRemove'))}">✕</button></li>`;
      };
      page(
        c('cartTitle'),
        `<a class="link back" href="#/restaurant/${encodeURIComponent(r.id)}">${h(c('toMenu'))}</a><section class="panel mvp-cart"><h2>${h(r.name)}</h2>${isDemo(r) ? `<p class="notice mvp-demo-note">${h(c('demo'))}</p>` : ''}${note ? `<p class="notice">${h(note)}</p>` : ''}<ul class="mvp-cart-list">${rows.map(line).join('')}</ul><dl class="mvp-cart-sum"><div><dt>${h(c('cartSubtotal'))}</dt><dd>${money(total)}</dd></div><div class="mvp-cart-total"><dt>${h(c('cartTotal'))}</dt><dd>${money(total)}</dd></div><div><dt>${h(c('cartPaid'))}</dt><dd>${money(0)}</dd></div><div><dt>${h(c('cartLeft'))}</dt><dd>${money(total)}</dd></div></dl><p class="muted mvp-cart-note">💳 ${h(c('cartDepositNote'))}</p><button type="button" class="primary mvp-cart-go" data-cart-go>${h(c('cartGo'))} →</button></section>`,
      );
      cartBar();
    };
    // Prices and names from the menu as it is now; dishes gone or switched off leave the cart.
    let note = '';
    if (x && r && menu.length) {
      const ok = x.items.filter((i) => menu.find((m) => m.id === i.id)?.available);
      if (ok.length !== x.items.length) {
        menus.set(r.id, menu);
        const keep = new CartMap(r.id, ok.map((i) => [i.id, i.quantity]));
        keep.save();
        note = c('cartUnavailable');
      }
    }
    if (r) menus.set(r.id, menu);
    draw(note);
    const root = document.getElementById('content');
    root.onclick = (e) => {
      const row = e.target.closest?.('[data-cart-id]');
      if (e.target.closest?.('[data-cart-go]')) {
        try {
          sessionStorage.setItem('rf-cart-go', r.id);
        } catch {}
        location.hash = '#/restaurant/' + encodeURIComponent(r.id);
        return;
      }
      if (!row || !r) return;
      const id = row.dataset.cartId,
        sel = picked(r.id),
        b = e.target.closest('[data-cart-step]');
      if (b) {
        const q = Math.max(0, Math.min(20, (sel.get(id) || 0) + Number(b.dataset.cartStep)));
        q ? sel.set(id, q) : sel.delete(id);
      } else if (e.target.closest('[data-cart-del]')) sel.delete(id);
      else return;
      draw('');
      document.querySelector(`[data-cart-id="${CSS.escape(id)}"] [data-cart-step="${b?.dataset.cartStep || 1}"]`)?.focus();
    };
  }
  window.addEventListener('hashchange', () => {
    // Leaving the cart page drops its click handler; the bar shows again everywhere else.
    if (!/^#\/cart\b/.test(location.hash)) {
      const root = document.getElementById('content');
      if (root) root.onclick = null;
    }
    cartBar();
  });
  window.addEventListener('storage', (e) => e.key === CART_KEY && cartBar());

  // ---------- Step 3: checkout — time and guests; who books comes from Telegram ----------
  const normPhone = (v) => {
    const d = String(v || '').replace(/\D/g, '');
    return d.length === 9 ? '+998' + d : d.length === 12 && d.startsWith('998') ? '+' + d : '';
  };
  const telegramMode = () => window.MVP_CHECKOUT !== 'guest';
  // Country flag + dial code and the local digits (public/phone-input.js); a plain field if that script is missing.
  // At checkout the label asks for the number that works now; it starts from the Telegram number when known.
  const phoneField = (label = c('phone'), value = typed.phone || me()?.telegram?.phone || me()?.contactPhone || '') =>
    window.RFPhone
      ? window.RFPhone.html(value, typed.country || 'uz', lang(), label)
      : `<label>${h(label)}<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" required value="${h(value)}"></label>`;
  const uzPhone = (v) => /^\+998\d{9}$/.test(v);
  const me = () => (typeof state !== 'undefined' ? state.user : null);
  const tgUser = () => {
    const u = me();
    return u && u.telegram?.linked ? u : null;
  };
  const refreshMe = async () => {
    try {
      state.user = (await api('/api/me')).user;
      if (typeof navigation === 'function') navigation();
      if (typeof mobileNavigation === 'function') mobileNavigation();
    } catch {}
    return tgUser();
  };
  /*
   * Telegram sign-in at checkout. Inside the Mini App the signed launch data signs in at once; on the web the
   * bot opens (one tap "Start", one tap "Share my number") and this page polls until the bot approves —
   * the same flow as the regular "Sign in with Telegram". The tab is opened in the click itself so phones
   * do not block it.
   */
  async function telegramSignIn(msg, tab) {
    if (window.RFTelegram?.active) {
      await window.RFTelegram.signIn?.();
      return refreshMe();
    }
    const start = await api('/api/auth/telegram-start', 'POST', {});
    if (tab && !tab.closed) tab.location.href = start.url;
    else window.open(start.url, '_blank', 'noopener');
    msg.innerHTML = `<span class="mvp-wait">${h(c('tgWait'))} <a href="${h(start.url)}" target="_blank" rel="noopener">${h(c('tgOpen'))}</a></span>`;
    const until = Date.now() + 10 * 60000;
    while (Date.now() < until) {
      await new Promise((r) => setTimeout(r, 2000));
      if (!document.body.contains(msg)) return null;
      if (document.visibilityState === 'hidden') continue;
      const r = await api('/api/auth/telegram-poll', 'POST', {}).catch((e) => ({ status: 'error', message: e.message }));
      if (r.status === 'approved') {
        msg.textContent = '';
        return refreshMe();
      }
      if (r.status === 'denied' || r.status === 'error') break;
    }
    msg.textContent = c('tgFail');
    return null;
  }
  function checkout(form, ctx) {
    lastCheckout = { form, ctx };
    const { restaurant: r, table: tb, menu } = ctx;
    const start = document.getElementById('planStart'),
      date = document.getElementById('planDate')?.value || '',
      end = document.getElementById('planEnd')?.value || '';
    const options = start ? [...start.options].map((o) => `<option value="${h(o.value)}" ${o.value === start.value ? 'selected' : ''}>${h(o.textContent)}</option>`).join('') : '';
    const max = ctx.maxGuests || tb.seats;
    // Several tables (ui/tables.js): all of them, the combined seats, a ✕ to take one out.
    const tables = ctx.tables?.length ? ctx.tables : [tb],
      many = tables.length > 1;
    const guests = Math.min(max, Number(typed.guests) || (many ? max : Math.min(2, max)));
    const tablesPill = many
      ? `<div class="mvp-tables"><b>🪑 ${h(c('tablesSel')(tables.map((x) => '#' + x.number).join(', '), max))}</b><div class="mvp-table-chips">${tables.map((x) => `<button type="button" class="mvp-chip" data-untable="${h(x.id)}" aria-label="${h(c('removeTable'))} #${x.number}">#${x.number} · ${x.seats} ✕</button>`).join('')}</div></div>`
      : '';
    const tg = telegramMode(),
      u = tgUser();
    const who = tg
      ? u
        ? `<p class="mvp-who">✈️ ${h(u.name || '')}</p>${phoneField(c('phoneActive'), typed.phone || u.telegram?.phone || u.contactPhone || '')}`
        : `<p class="mvp-who">✈️ ${h(c('tgNote'))}</p>`
      : `<label>${h(c('name'))}<input name="name" autocomplete="name" minlength="2" maxlength="60" required value="${h(typed.name || me()?.name || '')}"></label>${phoneField(c('phoneActive'))}`;
    const label = tg && u ? '✅ ' + c('bookNow') : '✈️ ' + c('tgBook');
    form.className = 'form mvp-checkout';
    form.noValidate = true;
    form.innerHTML = `${tablesPill}<p class="mvp-slot">${many ? '' : `🪑 <b>${tb.number}-${h(c('table'))}</b> · ${tb.seats} ${h(c('seats'))} · `}📅 ${h(date)} · 🕒 ${h(start?.value || '')}–${h(end)}</p><p class="mvp-add-hint">➕ ${h(c('addMore'))}</p>${who}<div class="mvp-row"><label>${h(c('time'))}<select name="slot">${options}</select></label><label>${h(c('guests'))}<input name="guests" type="number" inputmode="numeric" min="1" max="${max}" value="${guests}" required></label></div><div data-mvp-form-picked>${pickedSummary(r, menu)}</div><button class="primary mvp-confirm${tg && u ? '' : ' mvp-tg'}" type="button">${h(label)}</button><p class="form-message" role="status" data-mvp-msg></p>`;
    form.querySelectorAll('[data-untable]').forEach((b) => (b.onclick = () => ctx.onRemove?.(b.dataset.untable)));
    const remember = () => {
      if (form.elements.name) typed.name = form.elements.name.value;
      if (form.elements.phone) typed.phone = form.elements.phone.value || form.elements.phoneLocal?.value || '';
      const cc = form.querySelector('[data-rf-phone]')?.dataset.country;
      if (cc) typed.country = cc;
      typed.guests = form.elements.guests.value;
    };
    form.addEventListener('input', remember);
    if (window.RFPhone && form.querySelector('[data-rf-phone]')) window.RFPhone.bind(form, () => remember());
    form.elements.slot.onchange = () => {
      remember();
      if (!start) return;
      start.value = form.elements.slot.value;
      start.dispatchEvent(new Event('change'));
    };
    // Never a real form submit: the page must not reload and the chosen dishes must stay.
    form.onsubmit = (e) => {
      e.preventDefault();
      book(e);
    };
    form.querySelector('.mvp-confirm').onclick = (e) => {
      e.preventDefault();
      book(e);
    };
    // Enter in a field books too (the button is not a submit button, so the browser would not do it).
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input')) {
        e.preventDefault();
        book(e);
      }
    });
    let busy = false;
    const book = async () => {
      if (busy) return;
      remember();
      const msg = form.querySelector('[data-mvp-msg]'),
        btn = form.querySelector('.mvp-confirm');
      let name = '',
        phone = '';
      if (!tg) {
        // E.164 from the country selector ("+998993847384", "+15551234567").
        phone = form.querySelector('[data-rf-phone]') ? form.elements.phone.value : normPhone(form.elements.phone.value);
        name = form.elements.name.value.trim().replace(/\s+/g, ' ');
        if (name.length < 2) return (msg.textContent = c('badName'));
        if (!phone) return (msg.textContent = c('badPhone'));
      }
      // Telegram checkout: the working number typed over the Telegram one, Uzbek format only.
      let activePhone = '';
      if (tg && form.elements.phone) {
        activePhone = form.querySelector('[data-rf-phone]') ? form.elements.phone.value : normPhone(form.elements.phone.value);
        if (!uzPhone(activePhone)) return (msg.textContent = c('badUzPhone'));
      }
      // The Telegram tab opens inside the click (before any await) so the phone's browser allows it.
      const tab = tg && !tgUser() && !window.RFTelegram?.active ? window.open('', '_blank') : null;
      busy = true;
      btn.disabled = true;
      btn.innerHTML = `<span class="mvp-spin" aria-hidden="true"></span> ${h(c('booking'))}`;
      msg.textContent = '';
      const body = () => ({ restaurantId: r.id, tableNumber: tb.number, tableId: tb.id, ...(many ? { extraTables: tables.slice(1).map((x) => ({ number: x.number, id: x.id })) } : {}), date, slot: start?.value, endSlot: document.getElementById('planEnd')?.value, guests: Number(form.elements.guests.value), ...(tg ? (activePhone ? { phone: activePhone } : {}) : { name, phone }), preorderItems: [...picked(r.id)].map(([id, quantity]) => ({ id, quantity })) });
      try {
        if (tg && !tgUser() && !(await telegramSignIn(msg, tab))) return;
        let res;
        try {
          res = await api('/api/bookings/quick', 'POST', body());
        } catch (err) {
          // Signed in but no phone yet: inside the Mini App Telegram asks for it in one tap.
          if (err.status === 428 && window.RFTelegram?.active) {
            await window.RFTelegram.sharePhone?.();
            await refreshMe();
            res = await api('/api/bookings/quick', 'POST', body());
          } else if (err.status === 401 && tg) {
            if (!(await telegramSignIn(msg, null))) return;
            res = await api('/api/bookings/quick', 'POST', body());
          } else throw err;
        }
        if (!tg)
          try {
            localStorage.setItem('rf-mvp-contact', JSON.stringify({ name, phone }));
          } catch {}
        picks.delete(r.id);
        // The booking gave this browser a session (guest record): "👤 Profil / Bronlarim" now shows it.
        if (!tg && !me() && !res.demo) refreshMe().catch(() => null);
        // Prepayment to the central card: the payment step instead of the success screen.
        if (res.payment) payStep(res);
        else done(res);
        ctx.reload?.();
      } catch (err) {
        tab?.close();
        msg.textContent = err.status === 428 ? c('tgPhone') : err.message;
      } finally {
        busy = false;
        btn.disabled = false;
        btn.textContent = tg && tgUser() ? '✅ ' + c('bookNow') : '✈️ ' + c('tgBook');
      }
    };
  }

  // ---------- Success: a clear summary card (no QR to scan at the door) ----------
  /*
   * "💳 Oldindan to‘lov": the central card (copy button), the exact amount, the deadline and the receipt upload
   * (POST /api/bookings/p2p — the server refuses a picture used before). Opened after a booking that needs a
   * prepayment, and from the profile for a booking still waiting for it.
   */
  const fmtMoney = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const tashkentTime = (iso) => new Date(Date.parse(iso) + 5 * 3600000).toISOString().slice(11, 16);
  async function payStep(res) {
    let pay = res.payment;
    if (!pay)
      try {
        pay = await api('/api/bookings/p2p?id=' + encodeURIComponent(res.id));
      } catch (err) {
        return alert(err.message);
      }
    let dlg = document.getElementById('mvpPay');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'mvpPay';
      dlg.className = 'mvp-done mvp-pay';
      document.body.append(dlg);
    }
    // Full bill or an advance (fixed 100 000 / the minimum, or a custom amount between the minimum and the bill).
    const total = Number(pay.total ?? pay.amount) || 0,
      min = Math.min(total, Number(pay.minDeposit ?? total) || total);
    const advance = Math.min(total, Math.max(min, 100000));
    const choice =
      min < total
        ? `<fieldset class="mvp-pay-choice"><legend>${h(c('payChoose'))}</legend><label><input type="radio" name="payMode" value="full" checked> ${h(c('payFull'))} — <b>${h(fmtMoney(total))} so‘m</b></label>${advance < total ? `<label><input type="radio" name="payMode" value="advance"> ${h(c('payAdvance'))} — <b>${h(fmtMoney(advance))} so‘m</b></label>` : ''}<label><input type="radio" name="payMode" value="custom"> ${h(c('payCustom'))}</label><input type="number" inputmode="numeric" data-custom min="${min}" max="${total}" step="1000" placeholder="${h(c('payRange')(fmtMoney(min), fmtMoney(total)))}" hidden><p class="mvp-pay-err" data-custom-err role="alert" hidden></p></fieldset>`
        : '';
    dlg.innerHTML = `<h2>${h(c('payTitle'))}</h2>${res.restricted ? `<p class="mvp-pay-warn">${h(res.restricted)}</p>` : ''}<p class="mvp-pay-why">${h(c('payWhy'))}</p>${choice}<div class="mvp-pay-sum"><small>${h(c('payNow'))}</small><b data-now>${h(fmtMoney(total))} so‘m</b><small data-rest-line ${total > 0 ? '' : 'hidden'}>${h(c('payRest'))}: <b data-rest>0</b> so‘m</small></div>${pay.clickPayUrl ? `<a class="mvp-click-pay" data-click href="#" target="_blank" rel="noopener"></a><p class="muted mvp-click-hint">${h(c('clickHint'))}</p>` : ''}${pay.card ? `<div class="mvp-pay-card"><small>${h(pay.clickPayUrl ? c('payCardOr') : c('payCard'))}</small><b data-card>${h(pay.card)}</b><small>${h(c('payHolder'))}: <b>${h(pay.holder)}</b></small><button type="button" class="quiet mvp-pay-copy" data-copy>${h(c('payCopy'))}</button></div>` : ''}<p class="mvp-pay-until">⏳ ${h(c('payUntil')(tashkentTime(pay.until)))}</p><label class="mvp-pay-file">${h(c('payFile'))}<input type="file" accept="image/*" data-receipt></label><button type="button" class="primary mvp-pay-send" data-send>${h(c('paySend'))}</button><p class="form-message" role="status" data-pay-msg></p><button type="button" class="quiet" data-close>${h(c('close'))}</button>`;
    const msg = dlg.querySelector('[data-pay-msg]');
    const customBox = dlg.querySelector('[data-custom]');
    const chosen = () => {
      const mode = dlg.querySelector('[name=payMode]:checked')?.value || 'full';
      if (mode === 'advance') return advance;
      if (mode === 'custom') return Math.round(Number(customBox.value) || 0);
      return total;
    };
    const showSplit = () => {
      const now = chosen(),
        ok = now >= min && now <= total;
      // Custom amount: never below the minimum deposit or above the bill — red hint and the send button off.
      const custom = dlg.querySelector('[name=payMode]:checked')?.value === 'custom';
      const err = dlg.querySelector('[data-custom-err]');
      if (err) {
        const typedSome = custom && customBox.value !== '';
        err.hidden = !custom || ok || !typedSome;
        err.textContent = now > total ? c('payMaxErr')(fmtMoney(total)) : c('payMinErr')(fmtMoney(min));
      }
      const sendBtn = dlg.querySelector('[data-send]');
      if (sendBtn && !sendBtn.dataset.busy) sendBtn.disabled = !ok;
      dlg.querySelector('[data-now]').textContent = (ok ? fmtMoney(now) : '—') + ' so‘m';
      // 1 tap in Click: the restaurant's link + the chosen amount + this booking's id.
      const click = dlg.querySelector('[data-click]');
      if (click) {
        if (ok) {
          const u = new URL(pay.clickPayUrl);
          u.searchParams.set('amount', String(now));
          u.searchParams.set('transaction_param', String(res.id));
          // After paying, Click sends the guest back to this booking's status on our site.
          u.searchParams.set('return_url', location.origin + '/' + lang() + '/#/bookings?payment_return=1&booking_id=' + res.id);
          click.href = u.toString();
        }
        click.toggleAttribute('aria-disabled', !ok);
        click.textContent = `💳 ${c('clickPay')} (${ok ? fmtMoney(now) : '—'} so‘m)`;
      }
      dlg.querySelector('[data-rest]').textContent = ok ? fmtMoney(total - now) : '—';
    };
    dlg.querySelectorAll('[name=payMode]').forEach((r) =>
      r.addEventListener('change', () => {
        if (customBox) customBox.hidden = r.value !== 'custom' || !r.checked;
        if (r.value === 'custom' && r.checked) customBox.focus();
        showSplit();
      }),
    );
    customBox?.addEventListener('input', showSplit);
    dlg.querySelector('[data-click]')?.addEventListener('click', (e) => {
      if (e.currentTarget.hasAttribute('aria-disabled')) e.preventDefault();
    });
    showSplit();
    dlg.querySelector('[data-close]').onclick = () => dlg.close();
    const copyBtn = dlg.querySelector('[data-copy]');
    if (copyBtn) copyBtn.onclick = async (e) => {
      const btn = e.currentTarget,
        digits = String(pay.card).replace(/\s+/g, '');
      try {
        await navigator.clipboard.writeText(digits);
      } catch {
        const r = document.createRange();
        r.selectNodeContents(dlg.querySelector('[data-card]'));
        getSelection().removeAllRanges();
        getSelection().addRange(r);
        document.execCommand?.('copy');
      }
      btn.textContent = c('payCopied');
    };
    const send = dlg.querySelector('[data-send]');
    send.onclick = async () => {
      const file = dlg.querySelector('[data-receipt]').files?.[0];
      if (!file) return (msg.textContent = c('payNoFile'));
      const deposit = chosen();
      if (!(deposit >= min && deposit <= total)) return (msg.textContent = c('payBad'));
      send.disabled = true;
      send.dataset.busy = '1';
      send.innerHTML = `<span class="mvp-spin" aria-hidden="true"></span> ${h(c('paySending'))}`;
      msg.textContent = '';
      try {
        const r = await fetch('/api/bookings/p2p?id=' + encodeURIComponent(res.id) + '&deposit=' + deposit, { method: 'POST', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || data.message || 'Xatolik');
        dlg.querySelector('.mvp-pay-file').remove();
        send.remove();
        msg.innerHTML = `${h(c('paySent'))}${res.telegramLink ? `<br>${h(c('payTgHint'))} <a class="mvp-pass-link primary mvp-tg" href="${h(res.telegramLink)}" target="_blank" rel="noopener">${h(c('getPass'))}</a>` : ''}`;
      } catch (err) {
        msg.textContent = err.message;
        delete send.dataset.busy;
        send.disabled = false;
        send.textContent = c('paySend');
      }
    };
    if (!dlg.open) dlg.showModal();
  }
  function done(res) {
    const dlg = document.createElement('dialog');
    dlg.className = 'mvp-done';
    dlg.setAttribute('aria-labelledby', 'mvpDoneTitle');
    const first = String(res.name || '').split(/\s+/)[0] || res.name;
    dlg.innerHTML = `<div class="mvp-done-check" aria-hidden="true">✓</div><h2 id="mvpDoneTitle">${h(res.demo ? c('doneDemo') : c('doneOk'))}</h2><div class="mvp-ticket"><span class="mvp-ticket-table">🪑 ${res.tables?.length > 1 ? res.tables.map((n) => "#" + n).join(", ") : res.table}</span>${res.tables?.length > 1 ? `<small>${h(c("tablesSel")(res.tables.map((n) => "#" + n).join(", "), res.seatsTotal))}</small>` : ""}${res.tables?.length > 1 ? '' : `<span class="mvp-ticket-line">${h(c('reserved')(res.table, first, res.slot))}</span>`}<small>${h(res.restaurant)} · 📅 ${h(res.date)} · ${res.guests} ${h(c('guestsShort'))}</small></div>${res.preorderItems?.length ? `<p class="mvp-done-meals">🍽 ${res.preorderItems.map((i) => h(i.name) + ' ×' + i.quantity).join(', ')} · ${money(res.preorderTotal)}</p>` : ''}<p class="${res.demo ? 'notice' : 'muted'}">${h(res.demo ? c('doneDemoText') : telegramMode() ? (res.notified ? c('tgSent') : c('tgQueued')) : res.notified ? c('doneText') : c('doneQueued'))}</p>${res.telegramLink ? `<a class="primary mvp-tg mvp-pass-link" href="${h(res.telegramLink)}" target="_blank" rel="noopener">${h(c('getPass'))}</a><p class="muted mvp-pass-hint">${h(c('passHint'))}</p>` : ''}<button type="button" class="${res.telegramLink ? 'quiet' : 'primary'}" data-close>${h(c('close'))}</button>`;
    document.body.append(dlg);
    const close = () => {
      dlg.close();
      dlg.remove();
    };
    dlg.querySelector('[data-close]').onclick = close;
    dlg.addEventListener('cancel', close);
    dlg.showModal();
  }

  // ---------- UZ | RU | EN in the top bar (the concierge has the same switch) ----------
  const LANGS = ['uz', 'ru', 'en'];
  function syncLang() {
    const l = lang();
    const pl = document.querySelector('.mvp-prof-label');
    if (pl) pl.textContent = c('profBtn').replace(/^👤\s*/, '');
    document.querySelectorAll('.mvp-lang [data-site-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.siteLang === l)));
  }
  /*
   * "👤 Profil / Bronlarim" (top bar, always visible): name, phone and Telegram status, then active and past
   * bookings (restaurant, table, date/time, dishes, status, cancel). A guest who booked with name + phone has
   * a session of this browser (POST /api/bookings/quick), so it opens without a password. Not signed in: the
   * name and phone saved in this browser and one-tap "Connect Telegram".
   */
  const groupOf = (b) => {
    try {
      const g = b.group_tables ? JSON.parse(b.group_tables) : null;
      return g?.tables?.length > 1 ? g : null;
    } catch {
      return null;
    }
  };
  const fmtDishes = (raw) => {
    try {
      return (JSON.parse(raw || '[]') || []).map((d) => `${d.name} × ${d.quantity}`).join(', ');
    } catch {
      return '';
    }
  };
  const today = () => new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
  /*
   * Full pages (inside #content, with the top bar and the bottom bar): Profile = the info card, then Help center
   * and Log out; My reservations = the booking list. openProfile (the old dialog) is kept for other callers.
   */
  async function profilePage(seq) {
    page(c('profTitle'), `<section class="mvp-page"><div class="panel mvp-prof-card" data-prof><p class="muted">…</p></div><div class="mvp-prof-links"><a class="mvp-prof-help" href="#/help">❓ ${h(c('helpCenter'))}</a><button type="button" class="mvp-prof-logout" data-logout hidden>🚪 ${h(c('logout'))}</button></div></section>`);
    const root = document.querySelector('#content .mvp-page');
    const u = me() || (await refreshMe().catch(() => null), me());
    if (!root.isConnected || (seq && typeof state !== 'undefined' && seq !== state.seq)) return;
    const out = root.querySelector('[data-logout]');
    out.hidden = !u;
    out.onclick = () => document.getElementById('logout')?.click();
    renderProfile(root, u);
  }
  async function bookingsPage(seq) {
    page(c('bkTitle'), `<section class="mvp-page"><div data-pay-return></div><div data-bk><p class="muted">…</p></div></section>`);
    const root = document.querySelector('#content .mvp-page');
    const u = me() || (await refreshMe().catch(() => null), me());
    if (!root.isConnected || (seq && typeof state !== 'undefined' && seq !== state.seq)) return;
    renderBookings(root, u);
    paymentReturn(root, u);
  }
  /*
   * Back from the Click app (#/bookings?payment_return=1&booking_id=…): paid → a green confirmation; waiting for
   * the receipt check → a status card with a 1-tap receipt upload (on the browser that made the booking). The
   * state comes from GET /api/bookings/p2p?status=1 (works without the session — Click may open another browser).
   */
  async function paymentReturn(root, u) {
    const q = new URLSearchParams(location.hash.split('?')[1] || '');
    const id = q.get('booking_id') || '';
    const box = root.querySelector('[data-pay-return]');
    if (q.get('payment_return') !== '1' || !/^[0-9a-f-]{36}$/.test(id) || !box) return;
    let st = 'unknown';
    try {
      st = (await api('/api/bookings/p2p?status=1&id=' + encodeURIComponent(id))).state;
    } catch {}
    const mine = !!u;
    if (st === 'paid' || st === 'confirmed') box.innerHTML = `<div class="mvp-return ok" role="status"><b>${h(c('retPaid'))}</b></div>`;
    else if (st === 'wait' || st === 'review')
      box.innerHTML = `<div class="mvp-return wait" role="status"><b>${h(c('retWait'))}</b>${st === 'review' ? `<p>${h(c('retSent'))}</p>` : mine ? `<button type="button" class="primary" data-ret-upload>🧾 ${h(c('retUpload'))}</button>` : `<p>${h(c('retOtherBrowser'))}</p>`}</div>`;
    else if (st === 'cancelled') box.innerHTML = `<div class="mvp-return bad" role="status"><b>${h(c('retCancelled'))}</b></div>`;
    else return;
    box.querySelector('[data-ret-upload]')?.addEventListener('click', () => payStep({ id }));
    box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  async function openProfile() {
    let dlg = document.getElementById('mvpProfile');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'mvpProfile';
      dlg.className = 'mvp-profile';
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg) dlg.close();
      });
      document.body.append(dlg);
    }
    dlg.innerHTML = `<div class="mvp-profile-in"><div class="mvp-profile-head"><h2>${h(c('profTitle'))}</h2><button type="button" class="mvp-x" data-close aria-label="${h(c('close'))}">×</button></div><div data-prof><p class="muted">…</p></div><h3>${h(c('bkTitle'))}</h3><div data-bk><p class="muted">…</p></div><div class="mvp-prof-links"><a class="mvp-prof-help" href="#/help" data-close-help>❓ ${h(c('helpCenter'))}</a><button type="button" class="mvp-prof-logout" data-logout hidden>🚪 ${h(c('logout'))}</button></div></div>`;
    dlg.querySelector('[data-close]').onclick = () => dlg.close();
    dlg.querySelector('[data-close-help]').onclick = () => dlg.close();
    if (!dlg.open) dlg.showModal();
    const u = me() || (await refreshMe().catch(() => null), me());
    // Log out (the same as the old drawer button: ends the session, also a guest's browser session).
    const out = dlg.querySelector('[data-logout]');
    out.hidden = !u;
    out.onclick = () => {
      dlg.close();
      document.getElementById('logout')?.click();
    };
    renderProfile(dlg, u);
    renderBookings(dlg, u);
  }
  function renderProfile(dlg, u) {
    const box = dlg.querySelector('[data-prof]');
    if (u) {
      const linked = u.telegram?.linked;
      box.innerHTML = `<dl class="mvp-prof-dl"><dt>${h(c('profName'))}</dt><dd>${h(u.name || '—')}</dd><dt>${h(c('profPhone'))}</dt><dd>${h(u.contactPhone || '—')}</dd></dl><p class="mvp-tg-state ${linked ? 'on' : ''}">${h(c(linked ? 'tgLinked' : 'tgNotLinked'))}</p>${linked ? '' : `<button type="button" class="primary mvp-tg mvp-prof-tg" data-tg>${h(c('tgConnect'))}</button>`}<p class="form-message" data-prof-msg></p>`;
    } else {
      box.innerHTML = `<p class="muted mvp-prof-note">${h(c('profGuest'))}</p><form class="form mvp-prof-form" novalidate><label>${h(c('profName'))}<input name="name" autocomplete="name" maxlength="60" value="${h(typed.name || '')}"></label>${phoneField()}<button type="submit" class="quiet">${h(c('profSave'))}</button></form><button type="button" class="primary mvp-tg mvp-prof-tg" data-tg>${h(c('tgConnect'))}</button><p class="form-message" data-prof-msg></p>`;
      const f = box.querySelector('form');
      if (window.RFPhone) window.RFPhone.bind(f);
      f.onsubmit = (e) => {
        e.preventDefault();
        typed.name = f.elements.name.value.trim();
        typed.phone = f.elements.phone.value || f.elements.phoneLocal?.value || '';
        typed.country = f.querySelector('[data-rf-phone]')?.dataset.country || typed.country;
        try {
          localStorage.setItem('rf-mvp-contact', JSON.stringify({ name: typed.name, phone: typed.phone }));
        } catch {}
        box.querySelector('[data-prof-msg]').textContent = c('profSaved');
      };
    }
    const tgBtn = box.querySelector('[data-tg]');
    if (tgBtn)
      tgBtn.onclick = async () => {
        const msg = box.querySelector('[data-prof-msg]');
        // The Telegram tab opens inside the click so the phone's browser allows it.
        const tab = window.RFTelegram?.active ? null : window.open('', '_blank');
        tgBtn.disabled = true;
        try {
          if (await telegramSignIn(msg, tab)) (location.hash === '#/account' ? profilePage() : openProfile());
        } catch (err) {
          tab?.close();
          msg.textContent = err.message || c('tgFail');
        } finally {
          tgBtn.disabled = false;
        }
      };
  }
  async function renderBookings(dlg, u) {
    const box = dlg.querySelector('[data-bk]');
    let rows = [];
    if (u)
      try {
        rows = await api('/api/bookings');
      } catch {}
    const day = today();
    const active = rows.filter((b) => ['pending', 'confirmed', 'seated'].includes(b.status) && b.date >= day);
    const past = rows.filter((b) => !active.includes(b));
    const item = (b) => {
      const dishes = fmtDishes(b.preorder_items);
      // Self-cancel until 1 hour before the start; then only the restaurant (its phone is shown).
      const live = ['pending', 'confirmed'].includes(b.status) && b.date >= day;
      const startMs = Date.parse(b.date + 'T' + String(b.slot).slice(0, 5) + ':00+05:00');
      const canCancel = live && startMs - Date.now() > 3600000;
      const late = live && !canCancel ? `<p class="mvp-bk-late">${h(c('lateCancel')(b.restaurant_phone || ''))}</p>` : '';
      const dep = c('dep')[b.deposit_status];
      // Prepaid booking: total / paid in advance / left to pay at the restaurant.
      let balance = '';
      try {
        const ps = b.p2p_state ? JSON.parse(b.p2p_state) : null;
        if (ps) {
          const tot = Number(ps.total ?? ps.amount) || 0,
            paid = Number(ps.paid) || 0;
          balance = `<ul class="mvp-balance">${[tot, paid, Math.max(0, tot - paid)].map((v, i) => `<li>${h(c('bal')[i])}: <b>${h(fmtMoney(v))} UZS</b></li>`).join('')}</ul>`;
        }
      } catch {}
      const upload = b.status === 'pending' && b.deposit_status === 'p2p_wait' ? `<button type="button" class="primary mvp-bk-pay" data-pay="${h(b.id)}">${h(c('payUpload'))}</button>` : '';
      return `<li class="mvp-bk st-${h(b.status)}"><div class="mvp-bk-top"><b>${h(b.restaurant_name || '')}</b><span class="mvp-bk-st">${h(dep && b.status === 'pending' ? dep : c('st')[b.status] || b.status)}</span></div><div class="mvp-bk-line">🪑 ${h(groupOf(b) ? groupOf(b).tables.map((n) => '#' + n).join(', ') : String(b.table_number) + '-' + c('table'))} · 👥 ${h(String(b.guests))} · 📅 ${h(b.date)} · 🕒 ${h(b.slot)}${b.end_slot ? '–' + h(b.end_slot) : ''}</div>${dishes ? `<div class="mvp-bk-dish">🍽️ ${h(c('bkDishes'))}: ${h(dishes)}</div>` : ''}${balance}${upload}${late}${canCancel ? `<button type="button" class="quiet mvp-bk-cancel" data-cancel="${h(b.id)}">${h(c('bkCancel'))}</button>` : ''}<p class="form-message" data-bk-msg></p></li>`;
    };
    const list = (title, xs) => (xs.length ? `<h4>${h(title)}</h4><ul class="mvp-bk-list">${xs.map(item).join('')}</ul>` : '');
    box.innerHTML = rows.length ? list(c('bkActive'), active) + list(c('bkPast'), past.slice(0, 20)) : `<p class="muted">${h(c('bkNone'))}</p><a class="primary mvp-pass-link" href="#/discover" data-close-go>${h(c('bkFind'))}</a>`;
    box.querySelector('[data-close-go]')?.addEventListener('click', () => dlg.close?.());
    box.querySelectorAll('[data-pay]').forEach((btn) => (btn.onclick = () => (dlg.close?.(), payStep({ id: btn.dataset.pay }))));
    box.querySelectorAll('[data-cancel]').forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm(c('bkCancelAsk'))) return;
        btn.disabled = true;
        try {
          await api('/api/bookings', 'PATCH', { id: btn.dataset.cancel });
          renderBookings(dlg, u);
        } catch (err) {
          btn.disabled = false;
          btn.closest('li').querySelector('[data-bk-msg]').textContent = err.message;
        }
      };
    });
  }
  // ☀️ / 🌙 next to UZ | RU | EN: light / dark theme (ui/restaurant.js setTheme, saved in localStorage).
  function themeButton(bar) {
    let b = bar.querySelector('.mvp-theme');
    if (!b) {
      bar.insertAdjacentHTML('beforeend', '<button type="button" class="mvp-theme"></button>');
      b = bar.querySelector('.mvp-theme');
      b.onclick = () => window.rfSetTheme?.(document.body.dataset.theme === 'light' ? 'dark' : 'light');
      document.addEventListener('rf-theme', () => themeButton(bar));
    }
    const light = document.body.dataset.theme === 'light';
    b.textContent = light ? '🌙' : '☀️';
    b.setAttribute('aria-label', c(light ? 'themeDark' : 'themeLight'));
    b.title = c(light ? 'themeDark' : 'themeLight');
  }
  // Bottom bar: "My reservations" opens the booking list (works for guests too), "Profile" opens the drawer.
  document.addEventListener('click', (e) => {
    // Profile and My reservations are full pages now (#/account, #/bookings); only the old drawer card is redirected.
    const a = e.target.closest?.('#drawer a.drawer-profile');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (typeof closeDrawer === 'function') closeDrawer();
    location.hash = '#/account';
  });
  function profileButton(bar) {
    if (bar.querySelector('.mvp-prof-btn')) return;
    bar.insertAdjacentHTML('beforeend', `<button type="button" class="mvp-prof-btn" aria-haspopup="dialog"><span aria-hidden="true">👤</span><span class="mvp-prof-label">${h(c('profBtn').replace(/^👤\s*/, ''))}</span></button>`);
    bar.querySelector('.mvp-prof-btn').onclick = () => openProfile();
  }
  // ?open=profile (the bot's "👤 Mening profilim"): the profile opens once the page is ready.
  if (/[?&]open=profile\b/.test(location.search)) setTimeout(() => openProfile(), 1200);

  /*
   * Instant language switch on the restaurant page (applyLanguage): the hall plan is NOT rebuilt — its words are
   * translated in place (RF_I18N.retranslate) — while this page's own parts (headings, menu, the open checkout
   * form with what was typed) are drawn again in the new language. False when not on that page.
   */
  function relabel(from, to) {
    const plan = document.getElementById('bookingPlan');
    const menuBox = document.getElementById('mvpMenu');
    if (!shown || !plan?.isConnected || !menuBox) return false;
    const { r, menu } = shown;
    const back = document.querySelector('#content .link.back');
    if (back) back.textContent = c('back');
    const note = document.querySelector('.mvp-demo-note');
    if (note) note.textContent = c('demo');
    const hall = document.getElementById('mvpHall');
    if (hall) {
      hall.querySelector(':scope > h2').textContent = c('hall');
      hall.querySelector(':scope > p.muted').textContent = c('hallHint');
    }
    menuBox.innerHTML = menuInner(r, menu, picked(r.id));
    RF_I18N.retranslate(plan, from, to);
    if (lastCheckout?.form?.isConnected) checkout(lastCheckout.form, lastCheckout.ctx);
    return true;
  }

  function langBar() {
    const bar = document.getElementById('topbar');
    if (!bar) return;
    if (bar.querySelector('.mvp-lang')) return (themeButton(bar), syncLang());
    bar.insertAdjacentHTML('beforeend', `<div class="mvp-lang" role="group" aria-label="Til / Язык / Language">${LANGS.map((l) => `<button type="button" data-site-lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>`);
    bar.querySelector('.mvp-lang').onclick = async (e) => {
      const b = e.target.closest('[data-site-lang]');
      if (!b || b.dataset.siteLang === lang()) return;
      if (typeof applyLanguage === 'function') await applyLanguage(b.dataset.siteLang);
      else if (typeof RF_I18N !== 'undefined') RF_I18N.set(b.dataset.siteLang);
      syncLang();
    };
    // The round profile button is gone from the top bar: Profile lives in the bottom bar now (profileButton kept).
    themeButton(bar);
    syncLang();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', langBar, { once: true });
  else langBar();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cartBar, { once: true });
  else cartBar();

  window.RFMvp = { home, restaurant, checkout, card, normPhone, syncLang, relabel, profilePage, bookingsPage, openProfile, cartPage, cartBar };
})();
