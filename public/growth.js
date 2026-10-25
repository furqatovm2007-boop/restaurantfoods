/*
 * Business/Premium tools in the dashboard: peak-hour deposits, birthday promos, staff accounts,
 * the AI weekly report, service-timer settings and alerts, happy hours, VIP guest dossiers, the
 * staff panel (hostess / waiter / manager) and the public pricing page. ui/restaurant.js mounts
 * these into its pages; all data goes through /api/manage/growth.
 */
(() => {
  'use strict';
  const COPY = {
    uz: {
      newBooking: (b) => `📅 Yangi bron: ${b.table_number}${b.merged_table ? '+' + b.merged_table : ''}-stol · ${b.date} ${String(b.slot).slice(0, 5)} · ${b.guests} kishi`, soundOn: '🔔 Ovozli signal yoqilgan', soundOff: '🔕 Ovozli signal o‘chirilgan', live: 'Jonli kuzatuv',
      request: (n, k) => (k === 'bill' ? `🧾 ${n}-stol hisobni so‘ramoqda` : `🔔 ${n}-stol ofitsiantni chaqirmoqda`), 
      tools: 'Biznes vositalari', locked: 'Business va Premium tariflarida', lockedP: 'Faqat Premium tarifida', sum: 'so‘m', save: 'Saqlash', del: 'O‘chirish', add: 'Qo‘shish', saved: 'Saqlandi',
      peak: '⏰ Tig‘iz vaqt depoziti', peakHint: 'Belgilangan kun va soatlarga bron qilganda mijozdan majburiy depozit olinadi va chekda hisobga olinadi.', days: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'], orDate: 'yoki bayram sanasi', from: 'Boshlanish', to: 'Tugash', amount: 'Depozit (so‘m)', label: 'Nomi (masalan: Juma kechasi)', noRules: 'Hali qoida yo‘q.', payNote: 'Depozit Payme/Click yoki mijozning ulangan kartasi orqali olinadi.',
      bday: '🎂 Marketing / Tug‘ilgan kun sozlamalari', bdayHint: 'Tashrif buyurgan mijozlarga tug‘ilgan kunidan 3 kun oldin va bayram kuni Telegram orqali tabrik va shaxsiy promokod yuboriladi. Kod bilan bron qilinganda chekda alohida qator bo‘lib chiqadi.', bdayOn: 'Tug‘ilgan kun tabrigini yoqish', bdayKind: 'Sovg‘a turi', kinds: { percent: 'Foizli chegirma (umumiy hisobdan)', amount: 'Aniq summa bonus', gift: 'Maxsus sovg‘a' }, bdayPercent: 'Chegirma (%)', bdayAmount: 'Bonus summasi (so‘m)', bdayMin: 'Minimal buyurtma (so‘m, 0 — shartsiz)', bdayGift: 'Sovg‘a (masalan: bepul bayram torti)', adv: '💼 AI moliyaviy maslahatchi', advHint: 'Professional biznes-konsultant (GPT-6.1 Sol) tushum, jarimalar, top taomlar va xarajatlaringiz bo‘yicha savolingizga javob beradi. Business: kuniga 10 ta, Premium: 100 ta.', advAsk: 'Savol (masalan: Tushumni qanday oshiramiz?)', advSend: 'Maslahat olish',
      staff: '👥 Xodimlar', staffHint: 'Xodim avval saytda ro‘yxatdan o‘tsin, keyin emailini kiriting.', roles: { hostess: 'Hostess — bronlar va QR', waiter: 'Ofitsiant — + buyurtmalar, stollar', manager: 'Menejer — + moliya, hisobotlar' }, email: 'Xodim emaili', noStaff: 'Hali xodim yo‘q.',
      report: '📊 AI haftalik hisobot', reportHint: 'Eng ko‘p sotilgan taomlar, band soatlar va jarima tushumlari. Business: kuniga 1 ta, Premium: cheksiz.', make: 'Hisobot tayyorlash', top: 'Top taomlar', hours: 'Band soatlar', bookings: 'Bronlar', guests: 'Mehmonlar', noShows: 'Kelmaganlar', penalties: 'Jarima tushumi', revenue: 'Buyurtma tushumi', aiOff: 'AI xulosa hozir mavjud emas — raqamlar ma’lumotlar bazasidan.',
      timer: '⏱ AI ofitsiant taymeri', timerHint: 'Kamera mijoz o‘tirganini ko‘rgach taymer boshlanadi; belgilangan vaqtda ofitsiant yaqinlashmasa sizga va menejerga signal boradi.', minutes: 'Daqiqa (0 — o‘chiq)',
      happy: '🔥 Bo‘sh soatlarni to‘ldirish', happyHint: 'Zal belgilangan foizdan ko‘p bo‘sh bo‘lsa, saytda shu restoran uchun vaqtinchalik chegirma banneri yonadi.', happyOn: 'Avtomatik chegirmani yoqish', threshold: 'Zal bo‘shligi (%)', percent: 'Chegirma (%)', nowFree: 'Hozir zal bo‘sh', active: 'Chegirma hozir yoqilgan',
      vipNote: '⭐ VIP mijozlar avtomatik aniqlanadi (3 martadan ko‘p kelgan yoki ko‘p xarajat qilgan). Bron va QR ekranida dosye chiqadi.',
      viewNote: '👁 Stoldan ko‘rinish: “Qavatlar va stollar” bo‘limida har bir stolga panorama rasmini biriktiring.',
      alert: (n, m) => `⚠️ ${n}-stolda mijoz ${m} daqiqadan beri kutmoqda!`, served: 'Xizmat ko‘rsatildi',
      dossier: 'Mijoz dosyesi', visits: 'Tashriflar', spend: 'Jami xarajat', favTable: 'Sevimli stol', fav: 'Sevimli taomlar', last: 'Oxirgi tashrif', close: 'Yopish',
      staffPanel: 'Xodim paneli', role: 'Rolingiz', today: 'Bronlar (bugun va 7 kun)', orders: 'Buyurtmalar', finance: 'Moliya', confirm: 'Tasdiqlash', done: 'Yakunlandi', qr: '📷 QR-kodni tekshirish', none: 'Hozircha yo‘q.', status: { pending: 'Kutilmoqda', confirmed: 'Tasdiqlangan', completed: 'Yakunlangan', cancelled: 'Bekor', no_show: 'Kelmadi' },
      pricing: 'Tariflar', perMonth: 'so‘m / oy', popular: 'Eng mashhur', best: 'Eng kuchli', start: 'Boshlash', features: 'Imkoniyatlar', trial: '14 kun Premium bepul sinov — karta talab qilinmaydi.',
    },
    ru: {
      newBooking: (b) => `📅 Новая бронь: стол ${b.table_number}${b.merged_table ? '+' + b.merged_table : ''} · ${b.date} ${String(b.slot).slice(0, 5)} · гостей: ${b.guests}`, soundOn: '🔔 Звуковой сигнал включён', soundOff: '🔕 Звуковой сигнал выключен', live: 'Живое отслеживание',
      request: (n, k) => (k === 'bill' ? `🧾 Стол ${n} просит счёт` : `🔔 Стол ${n} зовёт официанта`), 
      tools: 'Бизнес-инструменты', locked: 'На тарифах Business и Premium', lockedP: 'Только на тарифе Premium', sum: 'сум', save: 'Сохранить', del: 'Удалить', add: 'Добавить', saved: 'Сохранено',
      peak: '⏰ Депозит в часы пик', peakHint: 'При брони на отмеченные дни и часы с клиента берётся обязательный депозит; он учитывается в чеке.', days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], orDate: 'или праздничная дата', from: 'Начало', to: 'Конец', amount: 'Депозит (сум)', label: 'Название (напр.: вечер пятницы)', noRules: 'Правил пока нет.', payNote: 'Депозит берётся через Payme/Click или с привязанной карты клиента.',
      bday: '🎂 Маркетинг / Настройки дня рождения', bdayHint: 'Гостям, которые у вас бывали, за 3 дня до дня рождения и в сам день в Telegram уходит поздравление с личным промокодом. При брони с кодом скидка видна в чеке отдельной строкой.', bdayOn: 'Включить поздравления', bdayKind: 'Тип подарка', kinds: { percent: 'Скидка в процентах (от суммы)', amount: 'Фиксированный бонус', gift: 'Особый подарок' }, bdayPercent: 'Скидка (%)', bdayAmount: 'Сумма бонуса (сум)', bdayMin: 'Минимальный заказ (сум, 0 — без условия)', bdayGift: 'Подарок (напр.: праздничный торт бесплатно)', adv: '💼 AI финансовый консультант', advHint: 'Профессиональный бизнес-консультант (GPT-6.1 Sol) ответит на вопрос о выручке, штрафах, топ-блюдах и расходах. Business: 10 в день, Premium: 100.', advAsk: 'Вопрос (напр.: как увеличить выручку?)', advSend: 'Получить совет',
      staff: '👥 Сотрудники', staffHint: 'Сотрудник сначала регистрируется на сайте, затем введите его email.', roles: { hostess: 'Хостес — брони и QR', waiter: 'Официант — + заказы, столы', manager: 'Менеджер — + финансы, отчёты' }, email: 'Email сотрудника', noStaff: 'Сотрудников пока нет.',
      report: '📊 AI-отчёт за неделю', reportHint: 'Самые продаваемые блюда, загруженные часы и доход от штрафов. Business: 1 в день, Premium: без ограничений.', make: 'Подготовить отчёт', top: 'Топ блюд', hours: 'Загруженные часы', bookings: 'Брони', guests: 'Гости', noShows: 'Неявки', penalties: 'Доход от штрафов', revenue: 'Доход от заказов', aiOff: 'AI-вывод сейчас недоступен — цифры из базы данных.',
      timer: '⏱ AI-таймер обслуживания', timerHint: 'Таймер стартует, когда камера видит севшего гостя; если официант не подошёл вовремя, вам и менеджеру приходит сигнал.', minutes: 'Минуты (0 — выкл.)',
      happy: '🔥 Заполнение пустых часов', happyHint: 'Если зал пуст больше заданного процента, на сайте загорается временный баннер со скидкой.', happyOn: 'Включить автоскидку', threshold: 'Свободно в зале (%)', percent: 'Скидка (%)', nowFree: 'Сейчас свободно', active: 'Скидка сейчас активна',
      vipNote: '⭐ VIP-гости определяются автоматически (больше 3 визитов или высокий чек). Досье видно в брони и при сканировании QR.',
      viewNote: '👁 Вид со стола: в разделе «Этажи и столы» прикрепите к каждому столу панораму.',
      alert: (n, m) => `⚠️ За столом ${n} гость ждёт уже ${m} мин!`, served: 'Обслужено',
      dossier: 'Досье гостя', visits: 'Визиты', spend: 'Сумма трат', favTable: 'Любимый стол', fav: 'Любимые блюда', last: 'Последний визит', close: 'Закрыть',
      staffPanel: 'Панель сотрудника', role: 'Ваша роль', today: 'Брони (сегодня и 7 дней)', orders: 'Заказы', finance: 'Финансы', confirm: 'Подтвердить', done: 'Завершено', qr: '📷 Проверить QR-код', none: 'Пока нет.', status: { pending: 'Ожидает', confirmed: 'Подтверждена', completed: 'Завершена', cancelled: 'Отменена', no_show: 'Не пришёл' },
      pricing: 'Тарифы', perMonth: 'сум / мес', popular: 'Популярный', best: 'Максимум', start: 'Начать', features: 'Возможности', trial: '14 дней Premium бесплатно — карта не нужна.',
    },
    en: {
      newBooking: (b) => `📅 New booking: table ${b.table_number}${b.merged_table ? '+' + b.merged_table : ''} · ${b.date} ${String(b.slot).slice(0, 5)} · ${b.guests} guests`, soundOn: '🔔 Sound alerts on', soundOff: '🔕 Sound alerts off', live: 'Live feed',
      request: (n, k) => (k === 'bill' ? `🧾 Table ${n} asks for the bill` : `🔔 Table ${n} is calling the waiter`), 
      tools: 'Business tools', locked: 'On Business and Premium', lockedP: 'Premium only', sum: 'UZS', save: 'Save', del: 'Delete', add: 'Add', saved: 'Saved',
      peak: '⏰ Peak-hour deposit', peakHint: 'Bookings on the marked days and hours require a deposit; it is counted on the receipt.', days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], orDate: 'or a holiday date', from: 'Start', to: 'End', amount: 'Deposit (UZS)', label: 'Name (e.g. Friday night)', noRules: 'No rules yet.', payNote: 'The deposit is taken via Payme/Click or the customer’s linked card.',
      bday: '🎂 Marketing / Birthday settings', bdayHint: 'Guests who have visited get a Telegram greeting with a personal promo code 3 days before their birthday and on the day. A booking with the code shows the discount as a separate receipt line.', bdayOn: 'Send birthday greetings', bdayKind: 'Gift type', kinds: { percent: 'Percent off the bill', amount: 'Fixed bonus amount', gift: 'Special gift' }, bdayPercent: 'Discount (%)', bdayAmount: 'Bonus amount (UZS)', bdayMin: 'Minimum order (UZS, 0 — none)', bdayGift: 'Gift (e.g. free birthday cake)', adv: '💼 AI finance advisor', advHint: 'A professional business consultant (GPT-6.1 Sol) answers questions about revenue, penalties, top dishes and costs. Business: 10 a day, Premium: 100.', advAsk: 'Question (e.g. how do we grow revenue?)', advSend: 'Get advice',
      staff: '👥 Staff', staffHint: 'The staff member signs up on the site first, then enter their email.', roles: { hostess: 'Hostess — bookings and QR', waiter: 'Waiter — + orders, tables', manager: 'Manager — + finance, reports' }, email: 'Staff email', noStaff: 'No staff yet.',
      report: '📊 AI weekly report', reportHint: 'Best-selling dishes, busy hours and penalty income. Business: 1 a day, Premium: unlimited.', make: 'Prepare report', top: 'Top dishes', hours: 'Busy hours', bookings: 'Bookings', guests: 'Guests', noShows: 'No-shows', penalties: 'Penalty income', revenue: 'Order revenue', aiOff: 'The AI summary is unavailable right now — numbers come from the database.',
      timer: '⏱ AI service timer', timerHint: 'The timer starts when the camera sees a guest sit down; if no waiter comes in time you and the manager get an alert.', minutes: 'Minutes (0 — off)',
      happy: '🔥 Fill empty hours', happyHint: 'When the hall is emptier than the set share, the site shows a temporary discount banner for this restaurant.', happyOn: 'Turn on the automatic discount', threshold: 'Hall free (%)', percent: 'Discount (%)', nowFree: 'Free now', active: 'Discount is on now',
      vipNote: '⭐ VIP guests are detected automatically (more than 3 visits or high spend). The dossier shows on bookings and QR check-in.',
      viewNote: '👁 Table view: attach a panorama to each table in “Floors and tables”.',
      alert: (n, m) => `⚠️ Table ${n}: the guest has been waiting for ${m} min!`, served: 'Served',
      dossier: 'Guest dossier', visits: 'Visits', spend: 'Total spend', favTable: 'Favourite table', fav: 'Favourite dishes', last: 'Last visit', close: 'Close',
      staffPanel: 'Staff panel', role: 'Your role', today: 'Bookings (today and 7 days)', orders: 'Orders', finance: 'Finance', confirm: 'Confirm', done: 'Completed', qr: '📷 Check QR code', none: 'Nothing yet.', status: { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show' },
      pricing: 'Pricing', perMonth: 'UZS / month', popular: 'Most popular', best: 'Everything', start: 'Get started', features: 'Features', trial: '14-day free Premium trial — no card needed.',
    },
  };
  const w = () => COPY[document.documentElement.lang] || COPY.uz;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const money = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ' + w().sum;
  const toast = (text) => (window.notify ? window.notify(text) : alert(text));
  async function api(path, method = 'GET', payload) {
    const res = await fetch(path, { method, credentials: 'same-origin', headers: payload ? { 'Content-Type': 'application/json' } : {}, body: payload ? JSON.stringify(payload) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error === 'PLAN_UPGRADE_REQUIRED' ? w().locked : data.error || 'Error');
    return data;
  }
  const G = '/api/manage/growth';
  const lock = (text) => `<p class="muted">🔒 ${esc(text)} · <a href="#/pricing">${esc(w().pricing)}</a></p>`;

  /** Owner / manager settings for one restaurant. */
  async function ownerPanel(host, restaurantId) {
    if (!host) return;
    const c = w();
    let d;
    try {
      d = await api(G + '?restaurantId=' + encodeURIComponent(restaurantId));
    } catch (e) {
      host.hidden = true;
      return;
    }
    const f = d.features;
    host.hidden = false;
    const dayBoxes = c.days.map((n, i) => `<label class="check day-pick"><input type="checkbox" name="day" value="${i}"> ${n}</label>`).join('');
    host.innerHTML = `<h3>🚀 ${c.tools}</h3>
<section class="growth-block"><h4>${c.peak}</h4>${f.peakDeposit ? `<p class="muted">${c.peakHint} ${c.payNote}</p>${d.peak.length ? `<ul class="growth-list">${d.peak.map((p) => `<li><span><b>${esc(p.label || '')}</b> ${p.date ? esc(p.date) : esc(p.days.split(',').filter(Boolean).map((x) => c.days[x]).join(', '))} · ${esc(p.start)}–${esc(p.end)} · <b>${money(p.amount)}</b></span><button type="button" class="quiet" data-peak-del="${esc(p.id)}">${c.del}</button></li>`).join('')}</ul>` : `<p>${c.noRules}</p>`}<form class="form" data-peak><div class="day-row">${dayBoxes}</div><label>${c.orDate}<input type="date" name="date"></label><div class="two"><label>${c.from}<input type="time" name="start" value="18:00" required></label><label>${c.to}<input type="time" name="end" value="23:00" required></label></div><div class="two"><label>${c.amount}<input type="number" name="amount" min="10000" step="10000" value="150000" required></label><label>${c.label}<input name="label" maxlength="60"></label></div><button class="primary">${c.add}</button></form>` : lock(c.locked)}</section>
<section class="growth-block" id="growthBday"><h4>${c.bday}</h4>${f.birthdayCrm ? `<p class="muted">${c.bdayHint}</p><form class="form" data-bday><label class="check"><input type="checkbox" name="birthdayEnabled" ${d.settings.birthdayEnabled ? 'checked' : ''}> ${c.bdayOn}</label><label>${c.bdayKind}<select name="birthdayKind">${Object.entries(c.kinds).map(([k, v]) => `<option value="${k}" ${d.settings.birthdayKind === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label><div data-kind="percent"><label>${c.bdayPercent}<select name="birthdayPercent">${[...new Set([10, 15, 20, d.settings.birthdayPercent])].sort((a, b) => a - b).map((p) => `<option value="${p}" ${p === d.settings.birthdayPercent ? 'selected' : ''}>${p}%</option>`).join('')}</select></label></div><div class="two" data-kind="amount"><label>${c.bdayAmount}<input type="number" name="birthdayAmount" min="10000" max="1000000" step="10000" value="${d.settings.birthdayAmount}"></label><label>${c.bdayMin}<input type="number" name="birthdayMinOrder" min="0" step="10000" value="${d.settings.birthdayMinOrder}"></label></div><div data-kind="gift"><label>${c.bdayGift}<input name="birthdayGift" maxlength="120" value="${esc(d.settings.birthdayGift)}"></label></div><button class="primary">${c.save}</button></form>` : lock(c.locked)}</section>
${d.level === 'owner' ? `<section class="growth-block" id="growthStaff"><h4>${c.staff}</h4>${f.staffAccounts ? `<p class="muted">${c.staffHint}</p>${d.staff.length ? `<ul class="growth-list">${d.staff.map((s) => `<li><span><b>${esc(s.name)}</b> ${esc(s.email)} · ${esc(c.roles[s.role] || s.role)}</span><button type="button" class="quiet" data-staff-del="${esc(s.user_id)}">${c.del}</button></li>`).join('')}</ul>` : `<p>${c.noStaff}</p>`}<form class="form" data-staff><div class="two"><label>${c.email}<input type="email" name="email" required></label><label>&nbsp;<select name="role">${Object.entries(c.roles).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></label></div><button class="primary">${c.add}</button></form>` : lock(c.locked)}</section>` : ''}
<section class="growth-block" id="growthReport"><h4>${c.report}</h4>${f.aiReports ? `<p class="muted">${c.reportHint}</p><button type="button" class="primary" data-report>${c.make}</button><div data-report-out></div>` : lock(c.locked)}</section>
<section class="growth-block"><h4>${c.adv}</h4>${f.aiReports ? `<p class="muted">${c.advHint}</p><form class="form" data-advisor><label>${c.advAsk}<textarea name="q" rows="2" minlength="3" maxlength="1200" required></textarea></label><button class="primary">${c.advSend}</button></form><div data-advisor-out class="advisor-out"></div>` : lock(c.locked)}</section>
<section class="growth-block"><h4>${c.timer}</h4>${f.serviceTimer ? `<p class="muted">${c.timerHint}</p><form class="form inline-form" data-timer><label>${c.minutes}<input type="number" name="serviceTimerMin" min="0" max="60" value="${d.settings.serviceTimerMin}"></label><button class="primary">${c.save}</button></form>` : lock(c.lockedP)}</section>
<section class="growth-block"><h4>${c.happy}</h4>${f.happyHours ? `<p class="muted">${c.happyHint}</p>${d.happy?.freePercent != null && d.settings.happyEnabled ? `<p>${c.nowFree}: <b>${d.happy.freePercent}%</b>${d.happy.active ? ` · <span class="badge ok">${c.active} −${d.happy.percent}%</span>` : ''}</p>` : ''}<form class="form" data-happy><label class="check"><input type="checkbox" name="happyEnabled" ${d.settings.happyEnabled ? 'checked' : ''}> ${c.happyOn}</label><div class="two"><label>${c.threshold}<input type="number" name="happyThreshold" min="30" max="95" value="${d.settings.happyThreshold}"></label><label>${c.percent}<input type="number" name="happyPercent" min="5" max="50" value="${d.settings.happyPercent}"></label></div><button class="primary">${c.save}</button></form>` : lock(c.lockedP)}</section>
<section class="growth-block"><p class="muted">${f.vipGuests ? c.vipNote : '🔒 ' + c.vipNote}</p><p class="muted">${f.tableView ? c.viewNote : '🔒 ' + c.viewNote}</p></section>`;
    const post = async (payload, btn) => {
      if (btn) btn.disabled = true;
      try {
        await api(G, 'POST', { restaurantId, ...payload });
        toast('✓ ' + c.saved);
        ownerPanel(host, restaurantId);
      } catch (e) {
        toast(e.message);
        if (btn) btn.disabled = false;
      }
    };
    const form = (sel, fn) => {
      const el = host.querySelector(sel);
      if (el) el.onsubmit = (e) => (e.preventDefault(), fn(el, el.querySelector('button.primary')));
    };
    form('[data-peak]', (el, btn) => post({ action: 'peak_save', days: [...el.querySelectorAll('[name=day]:checked')].map((x) => Number(x.value)), date: el.elements.date.value, start: el.elements.start.value, end: el.elements.end.value, amount: Number(el.elements.amount.value), label: el.elements.label.value }, btn));
    const bday = host.querySelector('[data-bday]');
    if (bday) {
      const show = () => bday.querySelectorAll('[data-kind]').forEach((x) => (x.hidden = x.dataset.kind !== bday.elements.birthdayKind.value));
      bday.elements.birthdayKind.onchange = show;
      show();
    }
    form('[data-bday]', (el, btn) => post({ action: 'settings', birthdayEnabled: el.elements.birthdayEnabled.checked, birthdayKind: el.elements.birthdayKind.value, birthdayPercent: Number(el.elements.birthdayPercent.value), birthdayAmount: Number(el.elements.birthdayAmount.value), birthdayMinOrder: Number(el.elements.birthdayMinOrder.value) || 0, birthdayGift: el.elements.birthdayGift.value.trim() }, btn));
    const adv = host.querySelector('[data-advisor]');
    if (adv) adv.onsubmit = (e) => (e.preventDefault(), advisor(restaurantId, adv, host.querySelector('[data-advisor-out]')));
    form('[data-staff]', (el, btn) => post({ action: 'staff_add', email: el.elements.email.value.trim(), role: el.elements.role.value }, btn));
    form('[data-timer]', (el, btn) => post({ action: 'settings', serviceTimerMin: Number(el.elements.serviceTimerMin.value) }, btn));
    form('[data-happy]', (el, btn) => post({ action: 'settings', happyEnabled: el.elements.happyEnabled.checked, happyThreshold: Number(el.elements.happyThreshold.value), happyPercent: Number(el.elements.happyPercent.value) }, btn));
    host.querySelectorAll('[data-peak-del]').forEach((b) => (b.onclick = () => post({ action: 'peak_delete', id: b.dataset.peakDel }, b)));
    host.querySelectorAll('[data-staff-del]').forEach((b) => (b.onclick = () => post({ action: 'staff_remove', userId: b.dataset.staffDel }, b)));
    const rep = host.querySelector('[data-report]');
    if (rep) rep.onclick = () => report(restaurantId, rep, host.querySelector('[data-report-out]'));
  }

  async function report(restaurantId, btn, out) {
    const c = w();
    btn.disabled = true;
    out.innerHTML = '<p class="muted">…</p>';
    try {
      const r = await api(G, 'POST', { action: 'report', restaurantId, lang: document.documentElement.lang || 'uz' });
      const s = r.stats;
      out.innerHTML = `<div class="metric-grid"><div class="metric"><small>${c.bookings}</small><strong>${s.bookings}</strong></div><div class="metric"><small>${c.guests}</small><strong>${s.guests}</strong></div><div class="metric"><small>${c.noShows}</small><strong>${s.noShows}</strong></div><div class="metric"><small>${c.penalties}</small><strong>${money(s.penaltyPaid)}</strong></div><div class="metric"><small>${c.revenue}</small><strong>${money(s.orderRevenue)}</strong></div></div><div class="two"><div><h5>${c.top}</h5><ol>${s.topDishes.map((x) => `<li>${esc(x.name)} — ${x.count}</li>`).join('') || '<li>—</li>'}</ol></div><div><h5>${c.hours}</h5><ol>${s.busyHours.map((x) => `<li>${esc(x.hour)} — ${x.count}</li>`).join('') || '<li>—</li>'}</ol></div></div>${r.ai ? `<div class="ai-report"><b>🤖 ${esc(r.model || 'AI')}</b><p>${esc(r.summary).replace(/\n/g, '<br>')}</p></div>` : `<p class="muted">${c.aiOff}</p>`}<p class="muted">${esc(s.from)} — ${esc(s.to)}</p>`;
    } catch (e) {
      out.innerHTML = `<p class="notice">${esc(e.message)}</p>`;
    } finally {
      btn.disabled = false;
    }
  }

  /** Business consultant chat (GPT-6.1 Sol on the server, internal engine as reserve); the last few turns are sent as context. */
  const advisorHistory = new Map();
  async function advisor(restaurantId, el, out) {
    const btn = el.querySelector('button.primary'), q = el.elements.q.value.trim();
    if (q.length < 3) return;
    const history = advisorHistory.get(restaurantId) || [];
    btn.disabled = true;
    const item = document.createElement('div');
    item.className = 'ai-report';
    item.innerHTML = `<p><b>❓</b> ${esc(q)}</p><p class="muted">…</p>`;
    out.prepend(item);
    try {
      const r = await api(G, 'POST', { action: 'advisor', restaurantId, question: q, history, lang: document.documentElement.lang || 'uz' });
      item.innerHTML = `<p><b>❓</b> ${esc(q)}</p><p><b>💼 ${esc(r.model || 'AI')}</b><br>${esc(r.answer).replace(/\n/g, '<br>')}</p>`;
      advisorHistory.set(restaurantId, [...history, { role: 'user', content: q }, { role: 'assistant', content: r.answer }].slice(-6));
      el.elements.q.value = '';
    } catch (e) {
      item.innerHTML = `<p class="notice">${esc(e.message)}</p>`;
    } finally {
      btn.disabled = false;
    }
  }

  // ---- Staff sound alerts (Web Audio, no audio file): a soft two-note chime for a new booking and a
  // brighter bell for a guest calling the waiter or asking for the bill. Browsers allow sound only after
  // the first tap on the page, so the context is created and resumed on that tap. ----
  let audio = null;
  const soundOn = () => {
    try {
      return localStorage.getItem('rf-staff-sound') !== 'off';
    } catch {
      return true;
    }
  };
  const audioCtx = () => {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch {
      audio = null;
    }
    return audio;
  };
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, () => soundOn() && audioCtx(), { once: true, capture: true }));
  function chime(kind) {
    if (!soundOn()) return;
    const ctx = audioCtx();
    if (!ctx || ctx.state !== 'running') return;
    const notes = kind === 'request' ? [1318.5, 1760, 1318.5, 1760] : [784, 1175];
    const step = kind === 'request' ? 0.16 : 0.22;
    const t0 = ctx.currentTime + 0.02;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator(),
        gain = ctx.createGain(),
        at = t0 + i * step;
      osc.type = kind === 'request' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.32, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + (kind === 'request' ? 0.5 : 0.9));
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 1);
    });
  }
  /** A bright pop-up at the top of the screen (several stack), gone after 9 s or on tap. */
  function flash(text, kind) {
    let stack = document.getElementById('rfStaffToasts');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'rfStaffToasts';
      stack.className = 'rf-staff-toasts';
      stack.setAttribute('aria-live', 'assertive');
      document.body.append(stack);
    }
    const el = document.createElement('div');
    el.className = 'rf-staff-toast ' + kind;
    el.setAttribute('role', 'alert');
    el.textContent = text;
    el.onclick = () => el.remove();
    stack.prepend(el);
    [...stack.children].slice(4).forEach((x) => x.remove());
    setTimeout(() => el.remove(), 9000);
  }
  const baseTitle = document.title;
  function badgeTitle(n) {
    document.title = n ? '(' + n + ') 🔔 ' + baseTitle : baseTitle;
  }

  /** "Guest waiting" banner (Premium service timer), refreshed every 30 s while the host is on screen. */
  const alertTimers = new WeakMap();
  const seenFeed = new Map(); // restaurantId -> Set of booking / request ids already announced
  function alerts(host, restaurantId) {
    if (!host) return;
    clearInterval(alertTimers.get(host));
    const c = w();
    const load = async () => {
      // Keeps polling in a background tab: staff hear the chime even when the panel is not in front.
      if (!document.body.contains(host)) return (clearInterval(alertTimers.get(host)), badgeTitle(0));
      try {
        const { alerts: list, requests = [], bookings = [], canResolve = true } = await api(G + '?view=alerts&restaurantId=' + encodeURIComponent(restaurantId));
        // First load only remembers what is already there; later ids ring and pop up once.
        const known = seenFeed.get(restaurantId),
          seen = known || new Set();
        if (known) {
          const freshRequests = requests.filter((q) => !seen.has(q.id)),
            freshBookings = bookings.filter((b) => !seen.has(b.id));
          freshBookings.forEach((b) => flash(c.newBooking(b), 'booking'));
          freshRequests.forEach((q) => flash(c.request(q.table_number, q.kind), 'request'));
          if (freshRequests.length) chime('request');
          else if (freshBookings.length) chime('booking');
        }
        requests.forEach((q) => seen.add(q.id));
        bookings.forEach((b) => seen.add(b.id));
        seenFeed.set(restaurantId, seen);
        badgeTitle(requests.length + list.length);
        const soundBtn = `<button type="button" class="quiet staff-sound" data-sound aria-pressed="${soundOn()}">${soundOn() ? c.soundOn : c.soundOff}</button>`;
        host.hidden = false;
        host.classList.add('staff-feed');
        host.classList.toggle('ringing', requests.length + list.length > 0);
        host.innerHTML = `<div class="staff-live"><span class="staff-live-dot" aria-hidden="true"></span>${esc(c.live)}${soundBtn}</div>` + requests.map((q) => `<div class="service-alert service-request" role="alert"><b>${esc(c.request(q.table_number, q.kind))}</b>${canResolve ? `<button type="button" class="primary" data-request="${esc(q.id)}">${c.done}</button>` : ''}</div>`).join('') + list.map((a) => `<div class="service-alert" role="alert"><b>${esc(c.alert(a.table_number, a.minutes))}</b>${canResolve ? `<button type="button" class="primary" data-served="${esc(a.id)}">${c.served}</button>` : ''}</div>`).join('');
        host.querySelector('[data-sound]').onclick = () => {
          const on = !soundOn();
          try {
            localStorage.setItem('rf-staff-sound', on ? 'on' : 'off');
          } catch {}
          if (on) (audioCtx(), setTimeout(() => chime('booking'), 60));
          load();
        };
        host.querySelectorAll('[data-request]').forEach((b) => (b.onclick = async () => {
          b.disabled = true;
          await api(G, 'POST', { action: 'request_resolve', restaurantId, id: b.dataset.request }).catch((e) => toast(e.message));
          load();
        }));
        host.querySelectorAll('[data-served]').forEach((b) => (b.onclick = async () => {
          b.disabled = true;
          await api(G, 'POST', { action: 'alert_resolve', restaurantId, id: b.dataset.served }).catch((e) => toast(e.message));
          load();
        }));
      } catch {
        host.hidden = true;
      }
    };
    load();
    alertTimers.set(host, setInterval(load, 15000));
  }

  function dossierHtml(g) {
    const c = w();
    return `<div class="guest-dossier ${g.vip ? 'vip' : ''}"><h4>${g.vip ? '⭐ VIP · ' : ''}${c.dossier}</h4><p>${esc(g.note)}</p><dl><div><dt>${c.visits}</dt><dd>${g.visits}</dd></div>${g.spend ? `<div><dt>${c.spend}</dt><dd>${money(g.spend)}</dd></div>` : ''}${g.favoriteTable ? `<div><dt>${c.favTable}</dt><dd>${g.favoriteTable}</dd></div>` : ''}${g.favorites.length ? `<div><dt>${c.fav}</dt><dd>${g.favorites.map((f) => esc(f.name)).join(', ')}</dd></div>` : ''}${g.lastVisit ? `<div><dt>${c.last}</dt><dd>${esc(g.lastVisit)}</dd></div>` : ''}</dl></div>`;
  }
  async function dossier(restaurantId, bookingId) {
    const c = w();
    try {
      const { guest } = await api(G + '?view=guest&restaurantId=' + encodeURIComponent(restaurantId) + '&bookingId=' + encodeURIComponent(bookingId));
      const d = document.createElement('dialog');
      d.className = 'rf-card-dialog';
      d.innerHTML = dossierHtml(guest) + `<form method="dialog"><button class="quiet">${c.close}</button></form>`;
      document.body.append(d);
      d.addEventListener('close', () => d.remove());
      d.showModal();
    } catch (e) {
      toast(e.message);
    }
  }

  /** Staff panel: what a hostess / waiter / manager may see and do for one restaurant. */
  async function staffPanel(root, memberships, ctx) {
    const c = w();
    let current = memberships[0]?.restaurantId;
    const render = async () => {
      const d = await api(G + '?view=staff&restaurantId=' + encodeURIComponent(current));
      if (!ctx.seq()) return;
      const canAct = d.level !== 'hostess';
      root.innerHTML = `${memberships.length > 1 ? `<label>${c.staffPanel}<select data-pick>${memberships.map((m) => `<option value="${esc(m.restaurantId)}" ${m.restaurantId === current ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>` : ''}<p>${esc(d.restaurant.name)} · ${c.role}: <b>${esc(c.roles[d.level] || d.level)}</b></p><div data-alerts hidden></div><div class="manage-tools"><button type="button" class="primary" data-qr>${c.qr}</button></div>${d.finance ? `<section class="panel"><h3>${c.finance}</h3><p>${c.penalties}: <b>${money(d.finance.paid)}</b></p></section>` : ''}<section class="panel"><h3>${c.today}</h3>${d.bookings.length ? d.bookings.map((b) => `<article class="row"><div><strong>${esc(b.date)} · ${esc(String(b.slot).slice(0, 5))} · ${b.table_number}${b.merged_table ? '+' + b.merged_table : ''}-stol · ${b.guests}</strong><p>${esc(b.customer || '')} ${b.vip ? '<span class="badge ok">⭐ VIP</span>' : ''} <a href="tel:${esc(b.phone)}">${esc(b.phone)}</a>${b.checked_in_at ? ' · ✓' : ''}${b.preorder_total ? ' · ' + money(b.preorder_total) : ''}</p><span class="badge">${esc(c.status[b.status] || b.status)}</span></div><div class="row-actions">${b.vip || d.features.vipGuests ? `<button type="button" class="quiet" data-dossier="${esc(b.id)}">${c.dossier}</button>` : ''}${canAct && b.status === 'pending' ? `<button type="button" class="primary" data-st="confirmed" data-id="${esc(b.id)}">${c.confirm}</button>` : ''}${canAct && b.status === 'confirmed' ? `<button type="button" class="quiet" data-st="completed" data-id="${esc(b.id)}">${c.done}</button>` : ''}</div></article>`).join('') : `<p>${c.none}</p>`}</section>${canAct ? `<section class="panel"><h3>${c.orders}</h3>${d.orders.length ? d.orders.map((o) => `<article class="row"><div><strong>${esc(String(o.created_at).slice(11, 16))} · ${esc(o.fulfillment)}</strong><p>${(() => { try { return JSON.parse(o.items).map((i) => esc(i.name) + ' × ' + i.quantity).join(', '); } catch { return ''; } })()}${o.total != null ? ' · ' + money(o.total) : ''}</p><span class="badge">${esc(c.status[o.status] || o.status)}</span></div></article>`).join('') : `<p>${c.none}</p>`}</section>` : ''}`;
      root.querySelector('[data-pick]')?.addEventListener('change', (e) => ((current = e.target.value), render()));
      root.querySelector('[data-qr]').onclick = () => window.RFCheckin?.open?.();
      alerts(root.querySelector('[data-alerts]'), current);
      root.querySelectorAll('[data-dossier]').forEach((b) => (b.onclick = () => dossier(current, b.dataset.dossier)));
      root.querySelectorAll('[data-st]').forEach((b) => (b.onclick = async () => {
        b.disabled = true;
        try {
          await api('/api/manage', 'POST', { action: 'status', kind: 'booking', id: b.dataset.id, status: b.dataset.st });
          render();
        } catch (e) {
          toast(e.message);
          b.disabled = false;
        }
      }));
    };
    await render();
  }

  /** Public pricing page. */
  function pricing(root, user) {
    const c = w();
    const L = {
      uz: [['Restoran sahifasi, menyu, onlayn bron', 1, 1, 1], ['Telegram bildirishnomalari, QR chipta va chek', 1, 1, 1], ['3D menyu (to‘liq ekran)', 0, 1, 1], ['Admin AI yordamchi', 0, '30/kun', '∞'], ['⏰ Tig‘iz vaqt depoziti', 0, 1, 1], ['🪑 Stollarni birlashtirish (katta kompaniyalar)', 0, 1, 1], ['🎂 Tug‘ilgan kun CRM + promokod', 0, 1, 1], ['👥 Xodimlar: Hostess, Ofitsiant, Menejer', 0, 1, 1], ['📊 AI haftalik analitika', 0, '1/kun', '∞'], ['📷 AI kamera va jonli stollar xaritasi', 0, 0, 1], ['🧊 3D zal va stoldan ko‘rinish (panorama)', 0, 0, 1], ['⏱ AI ofitsiant tezligi nazorati', 0, 0, 1], ['⭐ VIP mijoz dosyesi', 0, 0, 1], ['🔥 Bo‘sh soatlarni to‘ldirish (avto chegirma)', 0, 0, 1], ['📞 Call AI tasdiqlash qo‘ng‘irog‘i', 0, 0, 1], ['🤖 Mijozlar uchun ovozli 3D AI', 0, 0, 1]],
      ru: [['Страница ресторана, меню, онлайн-бронь', 1, 1, 1], ['Уведомления в Telegram, QR-билет и чек', 1, 1, 1], ['3D-меню (на весь экран)', 0, 1, 1], ['Admin AI-помощник', 0, '30/день', '∞'], ['⏰ Депозит в часы пик', 0, 1, 1], ['🪑 Объединение столов (большие компании)', 0, 1, 1], ['🎂 CRM дней рождения + промокод', 0, 1, 1], ['👥 Сотрудники: хостес, официант, менеджер', 0, 1, 1], ['📊 AI-аналитика за неделю', 0, '1/день', '∞'], ['📷 AI-камера и живая карта столов', 0, 0, 1], ['🧊 3D-зал и вид со стола (панорама)', 0, 0, 1], ['⏱ AI-контроль скорости обслуживания', 0, 0, 1], ['⭐ Досье VIP-гостя', 0, 0, 1], ['🔥 Заполнение пустых часов (автоскидка)', 0, 0, 1], ['📞 Call AI — звонок-подтверждение', 0, 0, 1], ['🤖 Голосовой 3D AI для гостей', 0, 0, 1]],
      en: [['Restaurant page, menu, online booking', 1, 1, 1], ['Telegram notifications, QR pass and receipt', 1, 1, 1], ['3D menu (full screen)', 0, 1, 1], ['Admin AI assistant', 0, '30/day', '∞'], ['⏰ Peak-hour deposit', 0, 1, 1], ['🪑 Table merging (large groups)', 0, 1, 1], ['🎂 Birthday CRM + promo code', 0, 1, 1], ['👥 Staff: hostess, waiter, manager', 0, 1, 1], ['📊 AI weekly analytics', 0, '1/day', '∞'], ['📷 AI camera and live table map', 0, 0, 1], ['🧊 3D hall and view from the table (panorama)', 0, 0, 1], ['⏱ AI service speed control', 0, 0, 1], ['⭐ VIP guest dossier', 0, 0, 1], ['🔥 Fill empty hours (auto discount)', 0, 0, 1], ['📞 Call AI confirmation call', 0, 0, 1], ['🤖 Voice 3D AI for guests', 0, 0, 1]],
    }[document.documentElement.lang] || [];
    const rows = L.length ? L : [];
    const plans = [
      { id: 'start', name: 'Start', price: 199000, col: 1, tag: '' },
      { id: 'business', name: 'Business', price: 399000, col: 2, tag: c.popular },
      { id: 'premium', name: 'Premium', price: 699000, col: 3, tag: c.best },
    ];
    const mark = (v) => (v === 1 ? '<span class="yes" aria-label="✓">✓</span>' : v === 0 ? '<span class="no" aria-label="—">—</span>' : `<span class="yes">${esc(v)}</span>`);
    const cta = user && ['restaurant_owner', 'admin'].includes(user.role) ? '#/manage' : user ? '#/account' : '#/login';
    root.innerHTML = `<div class="pricing"><p class="pricing-trial">🎁 ${c.trial}</p><div class="pricing-cards">${plans.map((p) => `<article class="price-card ${p.id}">${p.tag ? `<span class="price-tag">${esc(p.tag)}</span>` : ''}<h3>${p.name}</h3><p class="price"><b>${(p.price / 1000).toLocaleString('ru-RU')} 000</b> ${c.perMonth}</p><ul>${rows.filter((r) => r[p.col]).slice(0, 99).map((r) => `<li>${r[p.col] === 1 ? '✓' : '✓ ' + esc(r[p.col])} ${esc(r[0])}</li>`).join('')}</ul><a class="${p.id === 'business' ? 'primary' : 'quiet'}" href="${cta}">${c.start}</a></article>`).join('')}</div><div class="table-wrap"><table class="pricing-table"><thead><tr><th>${c.features}</th>${plans.map((p) => `<th>${p.name}<br><small>${(p.price / 1000).toLocaleString('ru-RU')}k</small></th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${mark(r[1])}</td><td>${mark(r[2])}</td><td>${mark(r[3])}</td></tr>`).join('')}</tbody></table></div></div>`;
  }

  /** View from a table (Premium): a wide photo / panorama the guest can drag around. */
  function panorama(url, title) {
    const d = document.createElement('dialog');
    d.className = 'rf-card-dialog panorama-dialog';
    d.innerHTML = `<h3>👁 ${esc(title)}</h3><div class="panorama" tabindex="0" aria-label="${esc(title)}"><img src="${esc(url)}" alt="${esc(title)}" draggable="false" referrerpolicy="no-referrer"></div><p class="muted">↔</p><form method="dialog"><button class="quiet">${w().close}</button></form>`;
    document.body.append(d);
    d.addEventListener('close', () => d.remove());
    d.showModal();
    const box = d.querySelector('.panorama');
    let startX = 0,
      startLeft = 0,
      dragging = false;
    box.addEventListener('pointerdown', (e) => ((dragging = true), (startX = e.clientX), (startLeft = box.scrollLeft), box.setPointerCapture(e.pointerId)));
    box.addEventListener('pointermove', (e) => dragging && (box.scrollLeft = startLeft - (e.clientX - startX)));
    box.addEventListener('pointerup', () => (dragging = false));
    // Start in the middle of the panorama.
    box.querySelector('img').addEventListener('load', () => (box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2));
  }

  window.RFGrowth = { chime, ownerPanel, alerts, dossier, dossierHtml, staffPanel, pricing, panorama };
})();
