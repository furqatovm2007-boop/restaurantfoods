/*
 * POS cash desk for restaurants (route #/pos) and the public electronic receipt (#/chek/:id/:key).
 *   - Kassa: the phone's back camera reads a barcode (html5-qrcode, loaded only here) — one beep and the
 *     product is on the receipt with its price; the same code again (or +) adds one more. Totals are live.
 *   - Ombor: goods and dishes with barcode (scanned or generated EAN-13), name, price and stock.
 *   - To‘lov: cash (with change), card terminal, or Payme / Click: a QR code with the amount for the
 *     customer's phone; the sale is paid by the provider's callback and the page sees it by polling.
 *   - Sotuvlar: today's totals, the last sales, receipts and refunds.
 * Without a camera (HTTP on a local IP, no permission, old browser) the reason is shown, and a photo of the
 * barcode (capture="environment") or typing the code still works. Prices always come from the server.
 */
(() => {
  'use strict';
  const COPY = {
    uz: {
      hid: '⌨️ USB / Bluetooth skaner tayyor', hidHit: '⌨️ Skaner o‘qidi', paper: 'Chek qog‘ozi', autoPrint: 'To‘lovdan keyin avtomatik chop etish', notFiscal: 'Fiskal chek emas — elektron chek', thanks: 'Xaridingiz uchun rahmat!', cashier: 'Kassir', tabs: { till: '🧾 Kassa', stock: '📦 Ombor', sales: '📊 Sotuvlar' }, restaurant: 'Restoran', scanOn: '📷 Skanerni yoqish', scanOff: '⏹ Skanerni o‘chirish', scanHint: 'Shtrix-kodni ramka ichiga tuting — bitta o‘qishda chekka qo‘shiladi.',
      manual: 'Shtrix-kod yoki nom', add: 'Qo‘shish', photo: '🖼 Rasmdan o‘qish', empty: 'Chek bo‘sh. Mahsulotni skanerlang yoki ro‘yxatdan tanlang.', total: 'Jami', pay: '💳 To‘lov qilish', clear: 'Tozalash', notFound: 'Bu shtrix-kod bazada yo‘q', addToBase: 'Bazaga qo‘shish', stockLeft: 'qoldiq', noStock: 'Omborda qolmagan',
      httpsTitle: 'Kamera bu manzilda ochilmaydi', https: (o) => `Brauzer kamerani faqat xavfsiz (HTTPS) manzilda ochadi. Siz ${o} orqali kirdingiz. https://restaurantfoods.online orqali oching yoki hozircha rasmdan o‘qing / kodni qo‘lda kiriting.`,
      denied: 'Kameraga ruxsat berilmadi. Brauzer sozlamalarida (manzil yonidagi 🔒 belgisi) kameraga ruxsat bering yoki rasmdan o‘qing.', noCamera: 'Kamera topilmadi yoki band. Rasmdan o‘qing yoki kodni qo‘lda kiriting.', unsupported: 'Bu brauzer kamerani qo‘llamaydi. Rasmdan o‘qing yoki kodni qo‘lda kiriting.',
      photoFail: 'Rasmda shtrix-kod topilmadi. Yaqinroq va yorug‘roq suratga oling.',
      form: { title: 'Mahsulot / taom', edit: 'Tahrirlash', barcode: 'SHTRIX-KOD', gen: '🔄 Yaratish', scan: '📷', name: 'NOMI', price: 'BITTA DONA NARXI (SO‘M)', stock: 'OMBORDA (DONA)', save: 'Saqlash', cancel: 'Bekor qilish', new: '+ Yangi mahsulot', search: 'Qidirish…', none: 'Hali mahsulot kiritilmagan.', del: 'O‘chirish', confirmDel: 'Mahsulot o‘chirilsinmi?', readOnly: 'Bazani faqat menejer yoki restoran egasi o‘zgartiradi.', saved: 'Saqlandi', low: 'kam qoldi' },
      payTitle: 'To‘lov', cash: '💵 Naqd', card: '💳 Karta (terminal)', payme: 'Payme QR', click: 'Click QR', uzum: 'Uzum QR', off: 'ulanmagan', received: 'MIJOZ BERGAN SUMMA', change: 'Qaytim', confirm: 'Tasdiqlash', scanToPay: 'Mijoz telefon kamerasi bilan skanerlab to‘laydi', waiting: 'To‘lov kutilmoqda…', paidCash: 'Naqd bilan to‘landi', cancelSale: 'Bekor qilish',
      done: 'To‘lov qabul qilindi', receiptNo: 'Chek №', eReceipt: 'Elektron chek — mijoz telefoni bilan skanerlaydi', print: '🖨 Chop etish', next: 'Yangi chek', close: 'Yopish',
      today: 'Bugun', count: 'Sotuvlar', sum: 'Tushum', byCash: 'Naqd', byCard: 'Karta', online: 'Onlayn', refund: 'Qaytarish', confirmRefund: 'Sotuv qaytarilsinmi? Mahsulotlar omborga qaytadi.', open: 'Chek',
      status: { pending: 'Kutilmoqda', paid: 'To‘langan', cancelled: 'Bekor qilingan', refunded: 'Qaytarilgan' }, methods: { cash: 'Naqd', card: 'Karta', payme: 'Payme', click: 'Click' }, sumUnit: 'so‘m', noRestaurant: 'Kassa uchun restoran topilmadi.', receiptTitle: 'Elektron chek', gone: 'Chek topilmadi.',
    },
    ru: {
      hid: '⌨️ USB / Bluetooth сканер готов', hidHit: '⌨️ Сканер считал', paper: 'Бумага чека', autoPrint: 'Печатать чек сразу после оплаты', notFiscal: 'Не фискальный чек — электронный чек', thanks: 'Спасибо за покупку!', cashier: 'Кассир', tabs: { till: '🧾 Касса', stock: '📦 Склад', sales: '📊 Продажи' }, restaurant: 'Ресторан', scanOn: '📷 Включить сканер', scanOff: '⏹ Выключить сканер', scanHint: 'Наведите штрих-код в рамку — одно считывание добавляет товар в чек.',
      manual: 'Штрих-код или название', add: 'Добавить', photo: '🖼 Считать с фото', empty: 'Чек пуст. Отсканируйте товар или выберите из списка.', total: 'Итого', pay: '💳 Оплата', clear: 'Очистить', notFound: 'Этого штрих-кода нет в базе', addToBase: 'Добавить в базу', stockLeft: 'остаток', noStock: 'Нет на складе',
      httpsTitle: 'Камера не открывается по этому адресу', https: (o) => `Браузер открывает камеру только на защищённом (HTTPS) адресе. Вы зашли через ${o}. Откройте https://restaurantfoods.online или пока считайте с фото / введите код вручную.`,
      denied: 'Доступ к камере не разрешён. Разрешите камеру в настройках браузера (значок 🔒 у адреса) или считайте с фото.', noCamera: 'Камера не найдена или занята. Считайте с фото или введите код.', unsupported: 'Этот браузер не поддерживает камеру. Считайте с фото или введите код.',
      photoFail: 'На фото не найден штрих-код. Снимите ближе и при хорошем свете.',
      form: { title: 'Товар / блюдо', edit: 'Изменить', barcode: 'ШТРИХ-КОД', gen: '🔄 Создать', scan: '📷', name: 'НАЗВАНИЕ', price: 'ЦЕНА ЗА ШТУКУ (СУМ)', stock: 'НА СКЛАДЕ (ШТ)', save: 'Сохранить', cancel: 'Отмена', new: '+ Новый товар', search: 'Поиск…', none: 'Товаров пока нет.', del: 'Удалить', confirmDel: 'Удалить товар?', readOnly: 'Базу меняет только менеджер или владелец.', saved: 'Сохранено', low: 'мало' },
      payTitle: 'Оплата', cash: '💵 Наличные', card: '💳 Карта (терминал)', payme: 'Payme QR', click: 'Click QR', uzum: 'Uzum QR', off: 'не подключено', received: 'ПОЛУЧЕНО ОТ КЛИЕНТА', change: 'Сдача', confirm: 'Подтвердить', scanToPay: 'Клиент сканирует камерой телефона и оплачивает', waiting: 'Ожидаем оплату…', paidCash: 'Оплачено наличными', cancelSale: 'Отменить',
      done: 'Оплата принята', receiptNo: 'Чек №', eReceipt: 'Электронный чек — клиент сканирует телефоном', print: '🖨 Печать', next: 'Новый чек', close: 'Закрыть',
      today: 'Сегодня', count: 'Продаж', sum: 'Выручка', byCash: 'Наличные', byCard: 'Карта', online: 'Онлайн', refund: 'Возврат', confirmRefund: 'Оформить возврат? Товары вернутся на склад.', open: 'Чек',
      status: { pending: 'Ожидает', paid: 'Оплачен', cancelled: 'Отменён', refunded: 'Возврат' }, methods: { cash: 'Наличные', card: 'Карта', payme: 'Payme', click: 'Click' }, sumUnit: 'сум', noRestaurant: 'Нет ресторана для кассы.', receiptTitle: 'Электронный чек', gone: 'Чек не найден.',
    },
    en: {
      hid: '⌨️ USB / Bluetooth scanner ready', hidHit: '⌨️ Scanner read', paper: 'Receipt paper', autoPrint: 'Print the receipt right after payment', notFiscal: 'Not a fiscal receipt — electronic receipt', thanks: 'Thank you for your purchase!', cashier: 'Cashier', tabs: { till: '🧾 Till', stock: '📦 Stock', sales: '📊 Sales' }, restaurant: 'Restaurant', scanOn: '📷 Start scanner', scanOff: '⏹ Stop scanner', scanHint: 'Hold the barcode inside the frame — one read adds it to the receipt.',
      manual: 'Barcode or name', add: 'Add', photo: '🖼 Read from photo', empty: 'The receipt is empty. Scan a product or pick it from the list.', total: 'Total', pay: '💳 Take payment', clear: 'Clear', notFound: 'This barcode is not in the base', addToBase: 'Add to base', stockLeft: 'left', noStock: 'Out of stock',
      httpsTitle: 'The camera cannot open on this address', https: (o) => `Browsers open the camera only on a secure (HTTPS) address. You opened ${o}. Use https://restaurantfoods.online, or read from a photo / type the code for now.`,
      denied: 'Camera permission was denied. Allow the camera in the browser settings (🔒 next to the address) or read from a photo.', noCamera: 'No camera found or it is busy. Read from a photo or type the code.', unsupported: 'This browser has no camera support. Read from a photo or type the code.',
      photoFail: 'No barcode found in the photo. Take it closer and in good light.',
      form: { title: 'Product / dish', edit: 'Edit', barcode: 'BARCODE', gen: '🔄 Generate', scan: '📷', name: 'NAME', price: 'UNIT PRICE (UZS)', stock: 'IN STOCK (PCS)', save: 'Save', cancel: 'Cancel', new: '+ New product', search: 'Search…', none: 'No products yet.', del: 'Delete', confirmDel: 'Delete this product?', readOnly: 'Only a manager or the owner can change the base.', saved: 'Saved', low: 'low' },
      payTitle: 'Payment', cash: '💵 Cash', card: '💳 Card (terminal)', payme: 'Payme QR', click: 'Click QR', uzum: 'Uzum QR', off: 'not connected', received: 'CASH RECEIVED', change: 'Change', confirm: 'Confirm', scanToPay: 'The customer scans with the phone camera and pays', waiting: 'Waiting for payment…', paidCash: 'Paid in cash', cancelSale: 'Cancel',
      done: 'Payment received', receiptNo: 'Receipt #', eReceipt: 'Electronic receipt — the customer scans it with a phone', print: '🖨 Print', next: 'New receipt', close: 'Close',
      today: 'Today', count: 'Sales', sum: 'Revenue', byCash: 'Cash', byCard: 'Card', online: 'Online', refund: 'Refund', confirmRefund: 'Refund this sale? The products go back to stock.', open: 'Receipt',
      status: { pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled', refunded: 'Refunded' }, methods: { cash: 'Cash', card: 'Card', payme: 'Payme', click: 'Click' }, sumUnit: 'UZS', noRestaurant: 'No restaurant for the till.', receiptTitle: 'Electronic receipt', gone: 'Receipt not found.',
    },
  };
  const w = () => COPY[document.documentElement.lang] || COPY.uz;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const money = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ' + w().sumUnit;
  const toast = (m) => (window.notify ? window.notify(m) : alert(m));
  async function api(path, method = 'GET', data) {
    const res = await fetch(path, { method, credentials: 'same-origin', cache: 'no-store', headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(out.error || 'Error'), { status: res.status });
    return out;
  }
  const loadScript = (src, ready) => (ready() ? Promise.resolve() : new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = ok;
    s.onerror = () => fail(new Error('script'));
    document.head.append(s);
  }));
  const scannerLib = () => loadScript('/vendor/html5-qrcode-2.3.8.min.js', () => !!window.__Html5QrcodeLibrary__).then(() => window.__Html5QrcodeLibrary__);
  const qrLib = () => loadScript('/vendor/qrcode-2.0.4.js', () => !!window.qrcode);
  async function qrSvg(text, size = 220) {
    await qrLib();
    const qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount(), q = 3, cell = size / (n + q * 2);
    let path = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += 'M' + ((c + q) * cell).toFixed(2) + ' ' + ((r + q) * cell).toFixed(2) + 'h' + cell.toFixed(2) + 'v' + cell.toFixed(2) + 'h-' + cell.toFixed(2) + 'z';
    return `<svg class="pos-qr" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="QR"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
  }

  // ---- Sounds: a short high beep for a read, a low double tone for "not found" ----
  let audio = null;
  function beep(ok = true) {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const t = audio.currentTime;
      (ok ? [[1760, 0, 0.09]] : [[330, 0, 0.12], [262, 0.15, 0.16]]).forEach(([f, at, len]) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = ok ? 'square' : 'sawtooth';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + at);
        g.gain.exponentialRampToValueAtTime(0.18, t + at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + at + len);
        o.connect(g).connect(audio.destination);
        o.start(t + at);
        o.stop(t + at + len + 0.02);
      });
    } catch {}
    navigator.vibrate?.(ok ? 60 : [80, 60, 80]);
  }

  // ---- Camera scanner (back camera; playsinline + muted for iOS Safari / Android Chrome) ----
  function cameraProblem() {
    if (!window.isSecureContext) return { kind: 'https' };
    if (!navigator.mediaDevices?.getUserMedia) return { kind: 'unsupported' };
    return null;
  }
  async function startScanner(el, onCode) {
    const lib = await scannerLib();
    const F = lib.Html5QrcodeSupportedFormats;
    const formats = ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39', 'CODE_93', 'ITF', 'CODABAR', 'QR_CODE'].map((k) => F[k]).filter((v) => v !== undefined);
    const scanner = new lib.Html5Qrcode(el.id, { formatsToSupport: formats, useBarCodeDetectorIfSupported: true, verbose: false });
    const config = { fps: 12, disableFlip: true, qrbox: (vw, vh) => ({ width: Math.max(160, Math.floor(Math.min(vw * 0.86, 420))), height: Math.max(100, Math.floor(Math.min(vh * 0.45, 200))) }) };
    let last = '', lastAt = 0;
    const hit = (text) => {
      const now = Date.now();
      // The same code held in front of the camera counts once per 1.5 s.
      if (text === last && now - lastAt < 1500) return;
      last = text;
      lastAt = now;
      onCode(String(text).trim());
    };
    const tries = [{ facingMode: { exact: 'environment' } }, { facingMode: 'environment' }];
    let started = false, error = null;
    for (const camera of tries) {
      try {
        await scanner.start(camera, config, hit, () => {});
        started = true;
        break;
      } catch (e) {
        error = e;
        if (/NotAllowed|Permission/i.test(String(e?.name || e))) break;
      }
    }
    if (!started && !/NotAllowed|Permission/i.test(String(error?.name || error))) {
      // No "environment" camera reported (some desktops / old Androids): the last camera is usually the back one.
      const cams = await lib.Html5Qrcode.getCameras().catch(() => []);
      if (cams.length) {
        try {
          await scanner.start(cams[cams.length - 1].id, config, hit, () => {});
          started = true;
        } catch (e) {
          error = e;
        }
      }
    }
    if (!started) throw error || new Error('NotFoundError');
    const video = el.querySelector('video');
    if (video) {
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.muted = true;
      video.setAttribute('muted', '');
    }
    return { stop: () => scanner.stop().then(() => scanner.clear()).catch(() => {}) };
  }
  async function scanPhoto(file) {
    const lib = await scannerLib();
    const host = document.createElement('div');
    host.id = 'posPhotoScan' + Date.now();
    host.hidden = true;
    document.body.append(host);
    try {
      return String(await new lib.Html5Qrcode(host.id, { verbose: false }).scanFile(file, false)).trim();
    } finally {
      host.remove();
    }
  }
  const cameraMessage = (e) => {
    const c = w(), p = cameraProblem();
    if (p?.kind === 'https') return `<b>${esc(c.httpsTitle)}</b><br>${esc(c.https(location.origin))}`;
    if (p?.kind === 'unsupported') return esc(c.unsupported);
    if (/NotAllowed|Permission/i.test(String(e?.name || e))) return esc(c.denied);
    return esc(c.noCamera);
  };

  // ---- USB / Bluetooth (HID) barcode scanners ----
  // They type the code as very fast key presses ending with Enter (or Tab). A sequence of 4+ keys with
  // gaps under ~40 ms is a scan; people type far slower. Keys typed into another field (cash amount,
  // product form) are left alone; the Enter of a scan is swallowed so it never clicks a focused button.
  const hid = { handler: null, buf: '', times: [] };
  window.addEventListener(
    'keydown',
    (e) => {
      if (!hid.handler || e.ctrlKey || e.altKey || e.metaKey) return;
      if (document.querySelector('dialog[open]')) return;
      const t = e.target;
      if (t?.matches?.('input,textarea,select,[contenteditable=true]') && !t.matches('[data-manual],[name=barcode]')) return;
      const now = performance.now();
      if (hid.times.length && now - hid.times[hid.times.length - 1] > 80) ((hid.buf = ''), (hid.times = []));
      if (e.key === 'Enter' || e.key === 'Tab') {
        const gaps = hid.times.slice(1).map((v, i) => v - hid.times[i]);
        const fast = hid.buf.length >= 4 && gaps.length && gaps.reduce((a, b) => a + b, 0) / gaps.length < 40;
        const code = hid.buf;
        hid.buf = '';
        hid.times = [];
        if (!fast) return;
        e.preventDefault();
        e.stopPropagation();
        // A scan typed into the manual / barcode field: clear what the scanner typed there.
        if (t?.matches?.('[data-manual],[name=barcode]')) t.value = t.matches('[name=barcode]') ? code : '';
        hid.handler(code);
        return;
      }
      if (e.key.length === 1) {
        hid.buf += e.key;
        hid.times.push(now);
      }
    },
    true,
  );

  // ---- Thermal receipt (58 / 80 mm) printed from a hidden frame: only the receipt, monospace ----
  const pref = (k, d) => {
    try {
      return localStorage.getItem(k) ?? d;
    } catch {
      return d;
    }
  };
  const setPref = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };
  const paper = () => (pref('rf-pos-paper', '80') === '58' ? 58 : 80);
  async function printThermal(r) {
    const c = w(), mm = paper(), qr = await qrSvg(r.url, mm === 58 ? 140 : 180);
    const row = (a, b, cls = '') => `<div class="row ${cls}"><span>${a}</span><span>${b}</span></div>`;
    const date = new Date(r.date).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.no)}</title><style>@page{size:${mm}mm auto;margin:0}*{box-sizing:border-box}body{margin:0;padding:3mm 2.5mm;width:${mm}mm;font:${mm === 58 ? 11 : 12}px/1.35 "Courier New",ui-monospace,monospace;color:#000;background:#fff}h1{font-size:${mm === 58 ? 14 : 16}px;margin:0;text-align:center}.c{text-align:center}.row{display:flex;justify-content:space-between;gap:6px}.row span:last-child{white-space:nowrap;text-align:right}.name{font-weight:700;margin-top:3px;word-break:break-word}.hr{border-top:1px dashed #000;margin:5px 0}.t{font-size:${mm === 58 ? 15 : 17}px;font-weight:700}svg{display:block;margin:6px auto 2px;width:${mm === 58 ? 32 : 40}mm;height:auto}small{font-size:10px}</style></head><body><h1>${esc(r.restaurant)}</h1>${r.address ? `<div class="c"><small>${esc(r.address)}</small></div>` : ''}${r.phone ? `<div class="c"><small>${esc(r.phone)}</small></div>` : ''}<div class="hr"></div>${row(esc(c.receiptNo) + ' ' + esc(r.no), '')}${row(esc(date), '')}${r.cashier ? row(esc(c.cashier) + ': ' + esc(r.cashier), '') : ''}<div class="hr"></div>${r.items.map((i) => `<div class="name">${esc(i.name)}</div>${row(i.qty + ' × ' + esc(money(i.price)), esc(money(i.sum)))}`).join('')}<div class="hr"></div>${row(esc(c.total), esc(money(r.total)), 't')}${row(esc(c.methods[r.method] || r.method || ''), '')}${r.change ? row(esc(c.change), esc(money(r.change))) : ''}<div class="hr"></div>${qr}<div class="c"><small>${esc(c.notFiscal)}</small></div><div class="c" style="margin-top:4px">${esc(c.thanks)}</div></body></html>`;
    const f = document.createElement('iframe');
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    f.onload = () => {
      try {
        f.contentWindow.focus();
        f.contentWindow.print();
      } catch {
        window.print();
      }
      setTimeout(() => f.remove(), 60000);
    };
    f.srcdoc = html;
    document.body.append(f);
  }

  // ---- The page ----
  let active = null; // { stop } of the running camera
  const stopCamera = () => {
    active?.stop();
    active = null;
  };
  window.addEventListener('hashchange', stopCamera);
  document.addEventListener('visibilitychange', () => document.hidden && stopCamera());

  async function mount(root, restaurants) {
    const c = w();
    if (!restaurants.length) {
      root.innerHTML = `<div class="panel"><p>${esc(c.noRestaurant)}</p></div>`;
      return;
    }
    const saved = (() => {
      try {
        return localStorage.getItem('rf-pos-restaurant');
      } catch {
        return null;
      }
    })();
    let restaurantId = restaurants.some((r) => r.id === saved) ? saved : restaurants[0].id;
    let tab = 'till', data = { products: [], canEdit: false, online: [] }, cart = [], editing = null, filter = '';
    const cartKey = () => 'rf-pos-cart:' + restaurantId;
    const loadCart = () => {
      try {
        cart = JSON.parse(localStorage.getItem(cartKey()) || '[]').filter((l) => l && typeof l.productId === 'string' && l.qty > 0);
      } catch {
        cart = [];
      }
    };
    const saveCart = () => {
      try {
        localStorage.setItem(cartKey(), JSON.stringify(cart));
      } catch {}
    };
    const product = (id) => data.products.find((p) => p.id === id);
    const reload = async () => {
      data = await api('/api/pos?view=products&restaurantId=' + encodeURIComponent(restaurantId));
      // Lines whose product was deleted leave; prices come from the base.
      cart = cart.filter((l) => product(l.productId));
      saveCart();
    };
    const total = () => cart.reduce((n, l) => n + (product(l.productId)?.price || 0) * l.qty, 0);

    function addToCart(p, n = 1) {
      const line = cart.find((l) => l.productId === p.id);
      const want = (line?.qty || 0) + n;
      if (want > p.stock) {
        beep(false);
        toast(p.stock ? `${p.name}: ${c.stockLeft} ${p.stock}` : `${p.name}: ${c.noStock}`);
        return false;
      }
      if (line) line.qty = want;
      else cart.unshift({ productId: p.id, qty: n });
      saveCart();
      return true;
    }
    async function onCode(code) {
      if (!code) return;
      if (!document.body.contains(root)) return (hid.handler = null);
      const chip = root.querySelector('[data-hid]');
      if (chip) ((chip.textContent = c.hidHit + ': ' + code), chip.classList.add('hit'), setTimeout(() => chip.isConnected && (chip.classList.remove('hit'), (chip.textContent = c.hid)), 1500));
      let p = data.products.find((x) => x.barcode === code);
      if (!p) {
        try {
          p = (await api('/api/pos?view=lookup&restaurantId=' + encodeURIComponent(restaurantId) + '&barcode=' + encodeURIComponent(code))).product;
          if (p && !product(p.id)) data.products.push(p);
        } catch {
          p = null;
        }
      }
      if (!p) {
        beep(false);
        if (tab === 'stock') return fillBarcode(code);
        const note = root.querySelector('[data-scan-note]');
        if (note) note.innerHTML = `⚠️ ${esc(c.notFound)}: <b>${esc(code)}</b>${data.canEdit ? ` <button type="button" class="quiet" data-new-code="${esc(code)}">${esc(c.addToBase)}</button>` : ''}`;
        root.querySelector('[data-new-code]')?.addEventListener('click', (e) => {
          editing = { barcode: e.currentTarget.dataset.newCode };
          tab = 'stock';
          stopCamera();
          draw();
        });
        return;
      }
      if (tab === 'stock') {
        // A known code in the goods base opens that product for editing.
        beep(true);
        stopCamera();
        editing = { ...p };
        return draw();
      }
      if (addToCart(p)) {
        beep(true);
        drawCart(p.id);
      }
    }
    function fillBarcode(code) {
      const input = root.querySelector('[data-product-form] [name=barcode]');
      if (input) {
        input.value = code;
        beep(true);
        stopCamera();
        root.querySelector('[data-scan-box]')?.setAttribute('hidden', '');
      }
    }

    const scannerBlock = (hint) => {
      const problem = cameraProblem();
      return `<section class="pos-scanner">${problem ? `<p class="notice pos-camera-note">${cameraMessage()}</p>` : `<button type="button" class="primary pos-scan-toggle" data-scan>${esc(active ? c.scanOff : c.scanOn)}</button>`}<div class="pos-camera" id="posCamera" data-scan-box ${active ? '' : 'hidden'}></div><p class="muted pos-scan-hint">${esc(hint)}</p><p class="pos-hid" data-hid>${esc(c.hid)}</p><p class="pos-scan-note" data-scan-note role="status"></p><div class="pos-manual"><input type="search" inputmode="search" enterkeyhint="go" data-manual placeholder="${esc(c.manual)}" autocomplete="off" list="posProducts"><button type="button" class="quiet" data-manual-add>${esc(c.add)}</button><label class="quiet pos-photo">${esc(c.photo)}<input type="file" accept="image/*" capture="environment" data-photo data-native hidden></label></div><datalist id="posProducts">${data.products.map((p) => `<option value="${esc(p.barcode)}">${esc(p.name)} — ${esc(money(p.price))}</option>`).join('')}</datalist></section>`;
    };
    function bindScanner() {
      const toggle = root.querySelector('[data-scan]');
      if (toggle)
        toggle.onclick = async () => {
          if (active) {
            stopCamera();
            draw();
            return;
          }
          const box = root.querySelector('[data-scan-box]');
          box.hidden = false;
          toggle.disabled = true;
          try {
            active = await startScanner(box, onCode);
            toggle.textContent = c.scanOff;
          } catch (e) {
            box.hidden = true;
            root.querySelector('[data-scan-note]').innerHTML = cameraMessage(e);
          } finally {
            toggle.disabled = false;
          }
        };
      const manual = root.querySelector('[data-manual]');
      const submit = () => {
        const v = manual.value.trim();
        if (!v) return;
        // A typed name (not a code) picks the first product whose name contains it.
        const byName = data.products.find((p) => p.name.toLowerCase().includes(v.toLowerCase()));
        onCode(data.products.some((p) => p.barcode === v) || !byName ? v : byName.barcode);
        manual.value = '';
      };
      root.querySelector('[data-manual-add]').onclick = submit;
      manual.onkeydown = (e) => e.key === 'Enter' && (e.preventDefault(), submit());
      root.querySelector('[data-photo]').onchange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
          onCode(await scanPhoto(file));
        } catch {
          beep(false);
          root.querySelector('[data-scan-note]').textContent = c.photoFail;
        }
      };
    }

    // ---- Till ----
    function drawCart(flash) {
      const host = root.querySelector('[data-cart]');
      if (!host) return;
      host.innerHTML = cart.length
        ? `<ul class="pos-lines">${cart
            .map((l) => {
              const p = product(l.productId);
              return `<li class="pos-line ${flash === l.productId ? 'flash' : ''}"><div class="pos-line-name"><b>${esc(p.name)}</b><small>${esc(money(p.price))} · ${esc(p.barcode)}</small></div><div class="pos-qty"><button type="button" data-dec="${esc(p.id)}" aria-label="−">−</button><output>${l.qty}</output><button type="button" data-inc="${esc(p.id)}" aria-label="+">+</button></div><strong class="pos-line-sum">${esc(money(p.price * l.qty))}</strong></li>`;
            })
            .join('')}</ul>`
        : `<p class="muted pos-empty">${esc(c.empty)}</p>`;
      root.querySelector('[data-total]').textContent = money(total());
      root.querySelector('[data-pay]').disabled = !cart.length;
      root.querySelector('[data-clear]').disabled = !cart.length;
      host.querySelectorAll('[data-inc]').forEach((b) => (b.onclick = () => addToCart(product(b.dataset.inc)) && (beep(true), drawCart(b.dataset.inc))));
      host.querySelectorAll('[data-dec]').forEach((b) => (b.onclick = () => {
        const l = cart.find((x) => x.productId === b.dataset.dec);
        l.qty -= 1;
        if (l.qty < 1) cart = cart.filter((x) => x !== l);
        saveCart();
        drawCart();
      }));
    }
    function tillHtml() {
      const quick = data.products.filter((p) => p.stock > 0).slice(0, 12);
      return `<div class="pos-till"><div>${scannerBlock(c.scanHint)}${quick.length ? `<div class="pos-quick">${quick.map((p) => `<button type="button" class="quiet" data-quick="${esc(p.id)}"><b>${esc(p.name)}</b><small>${esc(money(p.price))}</small></button>`).join('')}</div>` : ''}</div><aside class="pos-receipt-panel"><div data-cart></div><div class="pos-total"><span>${esc(c.total)}</span><strong data-total>0</strong></div><div class="pos-print-prefs"><label class="check"><input type="checkbox" data-autoprint ${pref('rf-pos-autoprint', '0') === '1' ? 'checked' : ''}> ${esc(c.autoPrint)}</label><label>${esc(c.paper)}<select data-paper><option value="80" ${paper() === 80 ? 'selected' : ''}>80 mm</option><option value="58" ${paper() === 58 ? 'selected' : ''}>58 mm</option></select></label></div><div class="pos-actions"><button type="button" class="quiet" data-clear>${esc(c.clear)}</button><button type="button" class="primary" data-pay>${esc(c.pay)}</button></div></aside></div>`;
    }
    function bindTill() {
      bindScanner();
      drawCart();
      root.querySelectorAll('[data-quick]').forEach((b) => (b.onclick = () => addToCart(product(b.dataset.quick)) && (beep(true), drawCart(b.dataset.quick))));
      root.querySelector('[data-clear]').onclick = () => {
        cart = [];
        saveCart();
        drawCart();
      };
      root.querySelector('[data-pay]').onclick = () => payDialog();
      root.querySelector('[data-autoprint]').onchange = (e) => setPref('rf-pos-autoprint', e.target.checked ? '1' : '0');
      root.querySelector('[data-paper]').onchange = (e) => setPref('rf-pos-paper', e.target.value);
    }

    // ---- Payment ----
    function payDialog() {
      const sum = total();
      const d = document.createElement('dialog');
      d.className = 'pos-dialog';
      const online = (k) => data.online.includes(k);
      const option = (k, label, on = true) => `<button type="button" class="pos-method ${on ? '' : 'off'}" data-method="${k}" ${on ? '' : 'disabled'}><span>${esc(label)}</span>${on ? '' : `<small>${esc(c.off)}</small>`}</button>`;
      d.innerHTML = `<div class="pos-dialog-body"><header><h3>${esc(c.payTitle)}</h3><strong class="pos-due">${esc(money(sum))}</strong><button type="button" class="quiet pos-x" data-close aria-label="${esc(c.close)}">×</button></header><div class="pos-methods">${option('cash', c.cash)}${option('card', c.card)}${option('payme', c.payme, online('payme'))}${option('click', c.click, online('click'))}${option('uzum', c.uzum, false)}</div><div data-step></div></div>`;
      document.body.append(d);
      d.addEventListener('close', () => (clearInterval(poll), d.remove()));
      d.querySelector('[data-close]').onclick = () => d.close();
      d.showModal();
      let poll = 0;
      const step = d.querySelector('[data-step]');
      const items = () => cart.map((l) => ({ productId: l.productId, qty: l.qty }));
      const thermal = (sale) => ({ restaurant: data.restaurant?.name || '', no: sale.receiptNo, date: sale.paidAt || sale.createdAt, items: sale.items, total: sale.total, method: sale.provider || sale.method, change: sale.change, url: sale.receiptUrl, cashier: (typeof state !== 'undefined' && state.user?.name) || '' });
      const finished = async (sale) => {
        clearInterval(poll);
        cart = [];
        saveCart();
        beep(true);
        d.querySelector('.pos-methods').hidden = true;
        step.innerHTML = `<div class="pos-done pos-print"><div class="pos-done-mark">✓</div><h3>${esc(c.done)}</h3><p>${esc(c.receiptNo)} <b>${esc(sale.receiptNo)}</b> · ${esc(c.methods[sale.provider || sale.method] || '')}</p><p class="pos-due">${esc(money(sale.total))}</p>${sale.change ? `<p>${esc(c.change)}: <b>${esc(money(sale.change))}</b></p>` : ''}<ul class="pos-mini">${sale.items.map((i) => `<li><span>${esc(i.name)} × ${i.qty}</span><b>${esc(money(i.sum))}</b></li>`).join('')}</ul><div class="pos-qr-box">${await qrSvg(sale.receiptUrl, 180)}<small>${esc(c.eReceipt)}</small></div><div class="pos-actions no-print"><button type="button" class="quiet" data-print>${esc(c.print)}</button><button type="button" class="primary" data-next>${esc(c.next)}</button></div></div>`;
        step.querySelector('[data-print]').onclick = () => printThermal(thermal(sale));
        // One click: the receipt goes to the thermal printer as soon as the payment is in.
        if (pref('rf-pos-autoprint', '0') === '1') printThermal(thermal(sale));
        step.querySelector('[data-next]').onclick = () => d.close();
        // Only the receipt list is redrawn, so a running camera keeps scanning for the next customer.
        await reload().catch(() => {});
        if (tab === 'till') drawCart();
      };
      d.querySelectorAll('[data-method]').forEach((b) => (b.onclick = async () => {
        d.querySelectorAll('[data-method]').forEach((x) => x.classList.toggle('chosen', x === b));
        const m = b.dataset.method;
        if (m === 'cash') {
          step.innerHTML = `<form class="form pos-cash"><label>${esc(c.received)}<input name="received" type="number" inputmode="numeric" min="${sum}" step="100" value="${sum}" required></label><p class="pos-change">${esc(c.change)}: <b data-change>${esc(money(0))}</b></p><div class="pos-quick-cash">${[sum, Math.ceil(sum / 10000) * 10000, Math.ceil(sum / 50000) * 50000, Math.ceil(sum / 100000) * 100000].filter((v, i, a) => a.indexOf(v) === i).map((v) => `<button type="button" class="quiet" data-cash="${v}">${esc(money(v))}</button>`).join('')}</div><button class="primary">${esc(c.confirm)}</button></form>`;
          const f = step.querySelector('form'), input = f.elements.received;
          const upd = () => (step.querySelector('[data-change]').textContent = money(Math.max(0, (Number(input.value) || 0) - sum)));
          input.oninput = upd;
          step.querySelectorAll('[data-cash]').forEach((x) => (x.onclick = () => ((input.value = x.dataset.cash), upd())));
          upd();
          f.onsubmit = async (e) => {
            e.preventDefault();
            f.querySelector('button.primary').disabled = true;
            try {
              finished((await api('/api/pos', 'POST', { restaurantId, action: 'sale_create', method: 'cash', received: Math.round(Number(input.value)), items: items() })).sale);
            } catch (err) {
              toast(err.message);
              f.querySelector('button.primary').disabled = false;
            }
          };
          return;
        }
        if (m === 'card') {
          step.innerHTML = `<div class="pos-card-step"><p>${esc(c.card)} — <b>${esc(money(sum))}</b></p><button type="button" class="primary" data-ok>${esc(c.confirm)}</button></div>`;
          step.querySelector('[data-ok]').onclick = async (e) => {
            e.currentTarget.disabled = true;
            try {
              finished((await api('/api/pos', 'POST', { restaurantId, action: 'sale_create', method: 'card', items: items() })).sale);
            } catch (err) {
              toast(err.message);
              e.currentTarget.disabled = false;
            }
          };
          return;
        }
        // Payme / Click: a QR code with the amount; the provider's callback pays the sale.
        b.disabled = true;
        try {
          const r = await api('/api/pos', 'POST', { restaurantId, action: 'sale_create', method: m, items: items() });
          d.querySelectorAll('[data-method]').forEach((x) => (x.disabled = true));
          step.innerHTML = `<div class="pos-online"><div class="pos-qr-box">${await qrSvg(r.payUrl, 240)}<small>${esc(c.scanToPay)}</small></div><p class="pos-due">${esc(money(r.sale.total))}</p><p class="pos-wait" role="status"><span class="tg-spinner" aria-hidden="true"></span> ${esc(c.waiting)}</p><div class="pos-actions"><button type="button" class="quiet" data-cancel>${esc(c.cancelSale)}</button><button type="button" class="quiet" data-paid-cash>${esc(c.paidCash)}</button></div></div>`;
          const id = r.sale.id;
          poll = setInterval(async () => {
            try {
              const s = (await api('/api/pos?view=sale&restaurantId=' + encodeURIComponent(restaurantId) + '&id=' + encodeURIComponent(id))).sale;
              if (s.status === 'paid') finished(s);
              else if (s.status !== 'pending') (clearInterval(poll), (step.querySelector('.pos-wait').textContent = c.status[s.status] || s.status));
            } catch {}
          }, 3000);
          step.querySelector('[data-cancel]').onclick = async () => {
            try {
              await api('/api/pos', 'POST', { restaurantId, action: 'sale_cancel', id });
              d.close();
            } catch (err) {
              toast(err.message);
            }
          };
          step.querySelector('[data-paid-cash]').onclick = async () => {
            try {
              finished((await api('/api/pos', 'POST', { restaurantId, action: 'sale_pay', id, method: 'cash' })).sale);
            } catch (err) {
              toast(err.message);
            }
          };
        } catch (err) {
          toast(err.message);
          b.disabled = false;
        }
      }));
    }

    // ---- Stock (goods base) ----
    function stockHtml() {
      const f = c.form, e = editing;
      const list = data.products.filter((p) => !filter || p.name.toLowerCase().includes(filter) || p.barcode.includes(filter));
      const form = data.canEdit
        ? `<form class="form pos-product-form" data-product-form><h3>${esc(e?.id ? f.edit : f.title)}</h3><label>${esc(f.barcode)}<span class="pos-barcode-row"><input name="barcode" inputmode="numeric" autocomplete="off" maxlength="48" value="${esc(e?.barcode || '')}" placeholder="4780000000017"><button type="button" class="quiet" data-scan-barcode aria-label="${esc(c.scanOn)}">${f.scan}</button><button type="button" class="quiet" data-gen>${esc(f.gen)}</button></span></label><div class="pos-camera" id="posCamera" data-scan-box hidden></div><p class="pos-scan-note" data-scan-note role="status"></p><label>${esc(f.name)}<input name="name" required maxlength="120" value="${esc(e?.name || '')}"></label><div class="two"><label>${esc(f.price)}<input name="price" type="number" inputmode="numeric" min="0" step="100" required value="${e?.price ?? ''}"></label><label>${esc(f.stock)}<input name="stock" type="number" inputmode="numeric" min="0" step="1" required value="${e?.stock ?? ''}"></label></div><div class="pos-actions"><button class="primary">${esc(f.save)}</button>${e ? `<button type="button" class="quiet" data-cancel-edit>${esc(f.cancel)}</button>` : ''}</div></form>`
        : `<p class="notice">${esc(f.readOnly)}</p>`;
      return `<div class="pos-stock"><section class="panel">${form}</section><section class="panel"><input type="search" class="pos-search" data-filter placeholder="${esc(f.search)}" value="${esc(filter)}"><ul class="pos-products">${list.length ? list.map((p) => `<li class="pos-product ${p.stock <= 5 ? 'low' : ''}"><div><b>${esc(p.name)}</b><small>${esc(p.barcode)}</small></div><span class="pos-price">${esc(money(p.price))}</span><span class="badge ${p.stock <= 5 ? 'warn' : ''}">${p.stock} ${p.stock <= 5 ? '· ' + esc(f.low) : ''}</span>${data.canEdit ? `<div class="row-actions"><button type="button" class="quiet" data-edit="${esc(p.id)}">${esc(f.edit)}</button><button type="button" class="quiet" data-del="${esc(p.id)}">${esc(f.del)}</button></div>` : ''}</li>`).join('') : `<li class="muted">${esc(f.none)}</li>`}</ul></section></div>`;
    }
    function bindStock() {
      const f = c.form;
      const search = root.querySelector('[data-filter]');
      search.oninput = () => {
        filter = search.value.trim().toLowerCase();
        const pos = search.selectionStart;
        draw();
        const again = root.querySelector('[data-filter]');
        again.focus();
        again.setSelectionRange(pos, pos);
      };
      root.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => {
        editing = { ...product(b.dataset.edit) };
        draw();
        root.querySelector('[data-product-form]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
      root.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => {
        if (!confirm(f.confirmDel)) return;
        try {
          await api('/api/pos', 'POST', { restaurantId, action: 'product_delete', id: b.dataset.del });
          await reload();
          draw();
        } catch (e) {
          toast(e.message);
        }
      }));
      const form = root.querySelector('[data-product-form]');
      if (!form) return;
      form.querySelector('[data-cancel-edit]')?.addEventListener('click', () => ((editing = null), draw()));
      form.querySelector('[data-gen]').onclick = async (e) => {
        e.currentTarget.disabled = true;
        try {
          form.elements.barcode.value = (await api('/api/pos', 'POST', { restaurantId, action: 'barcode_new' })).barcode;
        } catch (err) {
          toast(err.message);
        } finally {
          e.currentTarget.disabled = false;
        }
      };
      form.querySelector('[data-scan-barcode]').onclick = async () => {
        const box = root.querySelector('[data-scan-box]');
        if (active) {
          stopCamera();
          box.hidden = true;
          return;
        }
        const problem = cameraProblem();
        if (problem) {
          root.querySelector('[data-scan-note]').innerHTML = cameraMessage();
          return;
        }
        box.hidden = false;
        try {
          active = await startScanner(box, onCode);
        } catch (err) {
          box.hidden = true;
          root.querySelector('[data-scan-note]').innerHTML = cameraMessage(err);
        }
      };
      form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button.primary');
        btn.disabled = true;
        try {
          const v = Object.fromEntries(new FormData(form));
          await api('/api/pos', 'POST', { restaurantId, action: 'product_save', id: editing?.id, barcode: v.barcode.trim(), name: v.name.trim(), price: Math.round(Number(v.price)), stock: Math.round(Number(v.stock)) });
          toast('✓ ' + f.saved);
          editing = null;
          stopCamera();
          await reload();
          draw();
        } catch (err) {
          toast(err.message);
          btn.disabled = false;
        }
      };
    }

    // ---- Sales ----
    async function drawSales() {
      const host = root.querySelector('[data-sales]');
      try {
        const s = await api('/api/pos?view=sales&restaurantId=' + encodeURIComponent(restaurantId));
        const t = s.today || {};
        host.innerHTML = `<div class="metric-grid"><div class="metric"><small>${esc(c.today)} · ${esc(c.sum)}</small><strong>${esc(money(t.total))}</strong></div><div class="metric"><small>${esc(c.count)}</small><strong>${t.count || 0}</strong></div><div class="metric"><small>${esc(c.byCash)}</small><strong>${esc(money(t.cash))}</strong></div><div class="metric"><small>${esc(c.byCard)} / ${esc(c.online)}</small><strong>${esc(money((t.card || 0) + (t.online || 0)))}</strong></div></div><ul class="pos-sales">${s.sales
          .map((x) => `<li class="pos-sale ${esc(x.status)}"><div><b>${esc(x.receiptNo)}</b><small>${esc(new Date(x.createdAt).toLocaleString(document.documentElement.lang === 'en' ? 'en-GB' : 'ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }))} · ${esc(c.methods[x.provider || x.method] || x.method)}</small><small>${x.items.map((i) => esc(i.name) + ' × ' + i.qty).join(', ')}</small></div><strong>${esc(money(x.total))}</strong><span class="badge ${x.status === 'paid' ? 'ok' : x.status === 'pending' ? '' : 'warn'}">${esc(c.status[x.status] || x.status)}</span><div class="row-actions"><a class="quiet" href="${esc(x.receiptUrl.replace(/^https?:\/\/[^/]+/, ''))}">${esc(c.open)}</a>${data.canEdit && x.status === 'paid' && ['cash', 'card'].includes(x.provider) ? `<button type="button" class="quiet" data-refund="${esc(x.id)}">${esc(c.refund)}</button>` : ''}</div></li>`)
          .join('')}</ul>`;
        host.querySelectorAll('[data-refund]').forEach((b) => (b.onclick = async () => {
          if (!confirm(c.confirmRefund)) return;
          try {
            await api('/api/pos', 'POST', { restaurantId, action: 'sale_refund', id: b.dataset.refund });
            await reload();
            drawSales();
          } catch (e) {
            toast(e.message);
          }
        }));
      } catch (e) {
        host.innerHTML = `<p class="notice">${esc(e.message)}</p>`;
      }
    }

    function draw() {
      // A full redraw replaces the camera box, so the camera stops first.
      stopCamera();
      if (!document.body.contains(root)) return;
      root.innerHTML = `<div class="pos-head">${restaurants.length > 1 ? `<label class="pos-restaurant">${esc(c.restaurant)}<select data-restaurant>${restaurants.map((r) => `<option value="${esc(r.id)}" ${r.id === restaurantId ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></label>` : `<p class="pos-restaurant-name">${esc(restaurants[0].name)}</p>`}<nav class="pos-tabs" role="tablist">${Object.entries(c.tabs).map(([k, label]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${tab === k}">${esc(label)}</button>`).join('')}</nav></div><div class="pos-body">${tab === 'till' ? tillHtml() : tab === 'stock' ? stockHtml() : '<div data-sales><p class="muted">…</p></div>'}</div>`;
      root.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => {
        if (b.dataset.tab === tab) return;
        stopCamera();
        tab = b.dataset.tab;
        draw();
      }));
      root.querySelector('[data-restaurant]')?.addEventListener('change', async (e) => {
        stopCamera();
        restaurantId = e.target.value;
        try {
          localStorage.setItem('rf-pos-restaurant', restaurantId);
        } catch {}
        loadCart();
        await reload().catch((err) => toast(err.message));
        draw();
      });
      if (tab === 'till') bindTill();
      else if (tab === 'stock') bindStock();
      else drawSales();
    }

    hid.handler = onCode;
    loadCart();
    try {
      await reload();
    } catch (e) {
      root.innerHTML = `<div class="panel"><p class="notice">${esc(e.message)}</p></div>`;
      return;
    }
    draw();
  }

  /** Public electronic receipt (#/chek/:id/:key), printable, with its own QR code. */
  async function receipt(root, id, key) {
    const c = w();
    try {
      const r = (await api('/api/pos/receipt?id=' + encodeURIComponent(id) + '&k=' + encodeURIComponent(key))).receipt;
      root.innerHTML = `<article class="pos-ereceipt pos-print"><div class="pos-ereceipt-head"><img src="/brand-transparent.png" alt="RestaurantFoods" width="150" height="47"><h2>${esc(r.restaurant)}</h2><p>${esc(r.address || '')}${r.phone ? ' · ' + esc(r.phone) : ''}</p></div><p class="pos-ereceipt-meta"><span>${esc(c.receiptNo)} <b>${esc(r.receiptNo || r.no)}</b></span><span>${esc(new Date(r.paidAt || r.createdAt).toLocaleString(document.documentElement.lang === 'en' ? 'en-GB' : 'ru-RU', { timeZone: 'Asia/Tashkent' }))}</span></p><ul class="pos-mini">${r.items.map((i) => `<li><span>${esc(i.name)}<small>${i.qty} × ${esc(money(i.price))}</small></span><b>${esc(money(i.sum))}</b></li>`).join('')}</ul><div class="pos-total"><span>${esc(c.total)}</span><strong>${esc(money(r.total))}</strong></div><p>${esc(c.methods[r.method] || r.method)} · <span class="badge ${r.status === 'paid' ? 'ok' : 'warn'}">${esc(c.status[r.status] || r.status)}</span>${r.change ? ` · ${esc(c.change)}: ${esc(money(r.change))}` : ''}</p><div class="pos-qr-box">${await qrSvg(location.href, 150)}</div><div class="pos-actions no-print"><button type="button" class="quiet" data-print>${esc(c.print)}</button></div></article>`;
      root.querySelector('[data-print]').onclick = () => printThermal({ restaurant: r.restaurant, address: r.address, phone: r.phone, no: r.no, date: r.paidAt || r.createdAt, items: r.items, total: r.total, method: r.method, change: r.change, url: location.href });
    } catch (e) {
      root.innerHTML = `<div class="panel"><p class="notice">${esc(c.gone)}</p></div>`;
    }
  }

  window.RFPos = { mount, receipt, stop: stopCamera };
})();
