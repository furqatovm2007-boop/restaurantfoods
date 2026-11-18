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
      noMenu: 'Menyu hali kiritilmagan.',
      demo: 'DEMO: namuna restoran — bron jarayonini sinab ko‘rishingiz mumkin, lekin bron haqiqiy restoranga yuborilmaydi.',
      table: 'stol',
      seats: 'kishilik',
      name: 'Ismingiz',
      phone: 'Telefon raqam',
      time: 'Vaqt',
      guests: 'Mehmonlar soni',
      confirm: 'Tasdiqlash',
      sending: 'Yuborilmoqda…',
      badPhone: 'Telefon raqamni +998 va 9 ta raqam ko‘rinishida kiriting.',
      badName: 'Ismingizni kiriting.',
      done: 'Bron tasdiqlandi!',
      doneDemo: 'DEMO bron ko‘rsatildi',
      doneText: 'Restoranga Telegram orqali darhol xabar yuborildi.',
      doneQueued: 'Bron saqlandi. Restoran tez orada tasdiqlaydi.',
      doneDemoText: 'Bu namuna restoran: bron saqlanmadi va hech kimga yuborilmadi. Haqiqiy restoranlarda xuddi shunday ishlaydi.',
      pass: 'QR chipta',
      close: 'Yopish',
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
      noMenu: 'Меню ещё не добавлено.',
      demo: 'DEMO: пример ресторана — бронирование можно попробовать, но бронь не отправляется в настоящий ресторан.',
      table: 'стол',
      seats: 'мест',
      name: 'Ваше имя',
      phone: 'Номер телефона',
      time: 'Время',
      guests: 'Гостей',
      confirm: 'Подтвердить',
      sending: 'Отправка…',
      badPhone: 'Введите номер в формате +998 и 9 цифр.',
      badName: 'Введите ваше имя.',
      done: 'Бронь подтверждена!',
      doneDemo: 'DEMO-бронь показана',
      doneText: 'Ресторан сразу получил уведомление в Telegram.',
      doneQueued: 'Бронь сохранена. Ресторан скоро подтвердит её.',
      doneDemoText: 'Это пример ресторана: бронь не сохранена и никуда не отправлена. В настоящих ресторанах всё работает так же.',
      pass: 'QR-пропуск',
      close: 'Закрыть',
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
      noMenu: 'The menu has not been added yet.',
      demo: 'DEMO: a sample restaurant — try the booking flow, but the booking is not sent to a real restaurant.',
      table: 'table',
      seats: 'seats',
      name: 'Full name',
      phone: 'Phone number',
      time: 'Time',
      guests: 'Guests',
      confirm: 'Confirm Booking',
      sending: 'Sending…',
      badPhone: 'Enter the phone as +998 and 9 digits.',
      badName: 'Enter your name.',
      done: 'Booking Confirmed!',
      doneDemo: 'DEMO booking shown',
      doneText: 'The restaurant was notified on Telegram right away.',
      doneQueued: 'Your booking is saved. The restaurant will confirm it shortly.',
      doneDemoText: 'This is a sample restaurant: the booking was not saved or sent. Real restaurants work exactly like this.',
      pass: 'QR pass',
      close: 'Close',
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
  // Dishes picked per restaurant (dish id → quantity) and what the guest typed, kept while they move around.
  const picks = new Map();
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
  const picked = (id) => picks.get(id) || picks.set(id, new Map()).get(id);
  function dishCard(m, sel) {
    const q = sel.get(m.id) || 0;
    return `<article class="mvp-dish${m.available ? '' : ' off'}" data-dish="${h(m.id)}">${m.image_url ? `<img src="${h(m.image_url)}" alt="" loading="lazy" decoding="async" width="320" height="240">` : '<span class="mvp-dish-ph" aria-hidden="true">🍽</span>'}<div><h3>${h(m.name)}</h3><p class="mvp-price">${money(m.price)}</p>${q ? `<span class="mvp-qty"><button type="button" data-step="-1" aria-label="−">−</button><b>${q}</b><button type="button" data-step="1" aria-label="+">+</button></span>` : `<button type="button" class="mvp-add" data-step="1" ${m.available ? '' : 'disabled'}>${h(c('add'))}</button>`}</div></article>`;
  }
  function pickedSummary(r, menu) {
    const sel = picked(r.id),
      rows = [...sel].map(([id, q]) => ({ m: menu.find((x) => x.id === id), q })).filter((x) => x.m);
    if (!rows.length) return '';
    const total = rows.reduce((s, x) => s + x.m.price * x.q, 0);
    return `<p class="mvp-picked">🍽 ${h(c('picked'))}: ${rows.map((x) => h(x.m.name) + ' ×' + x.q).join(', ')} · <b>${money(total)}</b></p>`;
  }
  async function restaurant(r, menu, seq) {
    const sel = picked(r.id);
    const place = [r.cuisine, r.address].filter(Boolean).join(' · ');
    page(r.name, `<a class="link back" href="#/discover">${h(c('back'))}</a>${isDemo(r) ? `<p class="notice mvp-demo-note">${h(c('demo'))}</p>` : ''}<p class="mvp-place">${h(place)}</p><section class="panel mvp-step"><h2>${h(c('hall'))}</h2><p class="muted">${h(c('hallHint'))}</p><div class="booking-panel" id="bookingPlan"><p>…</p></div></section><section class="panel mvp-step" id="mvpMenu"><h2>${h(c('menu'))}</h2><p class="muted">${h(c('menuHint'))}</p>${menu.length ? `<div class="mvp-menu">${menu.map((m) => dishCard(m, sel)).join('')}</div>` : `<p>${h(c('noMenu'))}</p>`}<div data-mvp-picked>${pickedSummary(r, menu)}</div></section>`);
    const box = document.getElementById('mvpMenu');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (!b) return;
      const id = b.closest('[data-dish]').dataset.dish,
        m = menu.find((x) => x.id === id);
      if (!m?.available) return;
      const q = Math.max(0, Math.min(20, (sel.get(id) || 0) + Number(b.dataset.step)));
      q ? sel.set(id, q) : sel.delete(id);
      b.closest('[data-dish]').outerHTML = dishCard(m, sel);
      box.querySelector('[data-mvp-picked]').innerHTML = pickedSummary(r, menu);
      document.querySelectorAll('[data-mvp-form-picked]').forEach((x) => (x.innerHTML = pickedSummary(r, menu)));
    });
    await bookingPlan(r.id, r, seq);
  }

  // ---------- Step 3: checkout — time and guests; who books comes from Telegram ----------
  const normPhone = (v) => {
    const d = String(v || '').replace(/\D/g, '');
    return d.length === 9 ? '+998' + d : d.length === 12 && d.startsWith('998') ? '+' + d : '';
  };
  const telegramMode = () => window.MVP_CHECKOUT !== 'guest';
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
    const { restaurant: r, table: tb, menu } = ctx;
    const start = document.getElementById('planStart'),
      date = document.getElementById('planDate')?.value || '',
      end = document.getElementById('planEnd')?.value || '';
    const options = start ? [...start.options].map((o) => `<option value="${h(o.value)}" ${o.value === start.value ? 'selected' : ''}>${h(o.textContent)}</option>`).join('') : '';
    const max = ctx.maxGuests || tb.seats;
    const guests = Math.min(max, Number(typed.guests) || Math.min(2, max));
    const tg = telegramMode(),
      u = tgUser();
    const who = tg
      ? u
        ? `<p class="mvp-who">✈️ ${h(u.name || '')}${u.contactPhone ? ' · 📞 ' + h(u.contactPhone) : ''}</p>`
        : `<p class="mvp-who">✈️ ${h(c('tgNote'))}</p>`
      : `<label>${h(c('name'))}<input name="name" autocomplete="name" minlength="2" maxlength="60" required value="${h(typed.name || me()?.name || '')}"></label><label>${h(c('phone'))}<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" required value="${h(typed.phone || me()?.contactPhone || '')}"></label>`;
    const label = tg && u ? '✅ ' + c('bookNow') : '✈️ ' + c('tgBook');
    form.className = 'form mvp-checkout';
    form.noValidate = true;
    form.innerHTML = `<p class="mvp-slot">🪑 <b>${tb.number}-${h(c('table'))}</b> · ${tb.seats} ${h(c('seats'))} · 📅 ${h(date)} · 🕒 ${h(start?.value || '')}–${h(end)}</p>${who}<div class="mvp-row"><label>${h(c('time'))}<select name="slot">${options}</select></label><label>${h(c('guests'))}<input name="guests" type="number" inputmode="numeric" min="1" max="${max}" value="${guests}" required></label></div><div data-mvp-form-picked>${pickedSummary(r, menu)}</div><button class="primary mvp-confirm${tg && u ? '' : ' mvp-tg'}" type="button">${h(label)}</button><p class="form-message" role="status" data-mvp-msg></p>`;
    const remember = () => {
      if (form.elements.name) typed.name = form.elements.name.value;
      if (form.elements.phone) typed.phone = form.elements.phone.value;
      typed.guests = form.elements.guests.value;
    };
    form.addEventListener('input', remember);
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
        phone = normPhone(form.elements.phone.value);
        name = form.elements.name.value.trim().replace(/\s+/g, ' ');
        if (name.length < 2) return (msg.textContent = c('badName'));
        if (!phone) return (msg.textContent = c('badPhone'));
      }
      // The Telegram tab opens inside the click (before any await) so the phone's browser allows it.
      const tab = tg && !tgUser() && !window.RFTelegram?.active ? window.open('', '_blank') : null;
      busy = true;
      btn.disabled = true;
      btn.innerHTML = `<span class="mvp-spin" aria-hidden="true"></span> ${h(c('booking'))}`;
      msg.textContent = '';
      const body = () => ({ restaurantId: r.id, tableNumber: tb.number, tableId: tb.id, date, slot: start?.value, endSlot: document.getElementById('planEnd')?.value, guests: Number(form.elements.guests.value), ...(tg ? {} : { name, phone }), preorderItems: [...picked(r.id)].map(([id, quantity]) => ({ id, quantity })) });
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
        done(res);
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
  function done(res) {
    const dlg = document.createElement('dialog');
    dlg.className = 'mvp-done';
    dlg.setAttribute('aria-labelledby', 'mvpDoneTitle');
    const first = String(res.name || '').split(/\s+/)[0] || res.name;
    dlg.innerHTML = `<div class="mvp-done-check" aria-hidden="true">✓</div><h2 id="mvpDoneTitle">${h(res.demo ? c('doneDemo') : c('doneOk'))}</h2><div class="mvp-ticket"><span class="mvp-ticket-table">🪑 ${res.table}</span><span class="mvp-ticket-line">${h(c('reserved')(res.table, first, res.slot))}</span><small>${h(res.restaurant)} · 📅 ${h(res.date)} · ${res.guests} ${h(c('guestsShort'))}</small></div>${res.preorderItems?.length ? `<p class="mvp-done-meals">🍽 ${res.preorderItems.map((i) => h(i.name) + ' ×' + i.quantity).join(', ')} · ${money(res.preorderTotal)}</p>` : ''}<p class="${res.demo ? 'notice' : 'muted'}">${h(res.demo ? c('doneDemoText') : telegramMode() ? (res.notified ? c('tgSent') : c('tgQueued')) : res.notified ? c('doneText') : c('doneQueued'))}</p>${res.telegramLink ? `<a class="primary mvp-tg mvp-pass-link" href="${h(res.telegramLink)}" target="_blank" rel="noopener">${h(c('getPass'))}</a><p class="muted mvp-pass-hint">${h(c('passHint'))}</p>` : ''}<button type="button" class="${res.telegramLink ? 'quiet' : 'primary'}" data-close>${h(c('close'))}</button>`;
    document.body.append(dlg);
    const close = () => {
      dlg.close();
      dlg.remove();
    };
    dlg.querySelector('[data-close]').onclick = close;
    dlg.addEventListener('cancel', close);
    dlg.showModal();
  }

  window.RFMvp = { home, restaurant, checkout, card, normPhone };
})();
