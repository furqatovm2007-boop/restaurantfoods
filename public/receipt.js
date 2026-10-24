/*
 * Booking receipt and QR pass.
 *   RFReceipt.open(bookingId)                  receipt: restaurant, date/time/table, dishes with
 *                                              quantity × price, service charge, total, receipt
 *                                              number and the QR pass; Print and PDF download
 *   RFReceipt.open(bookingId, { mode: 'pass' }) the QR pass alone, large, for the door
 * The QR holds "RFB1:<code>" (an unguessable code, see app/booking-pass.ts); staff scan it to check
 * the guest in. The PDF is drawn on a canvas and wrapped in a one-page PDF here, so nothing is sent
 * anywhere and no PDF library is needed.
 */
(() => {
  'use strict';
  const COPY = {
    uz: { gift: 'Sovg‘a', bonus: 'Tug‘ilgan kun bonusi', minOrder: 'buyurtma kamida', promo: 'Promokod', discount: 'Chegirma', due: 'Depozitdan keyin to‘lanadi', title: 'Bron cheki', pass: 'Bron chiptasi', show: 'Restoranga kelganda shu QR kodni ko‘rsating.', receiptNo: 'Chek №', date: 'Sana', time: 'Vaqt', table: 'Stol', guests: 'Mehmonlar', dish: 'Taom', qty: 'Soni', price: 'Narxi', sum: 'Summa', subtotal: 'Taomlar', fee: 'Xizmat haqi', total: 'Jami to‘lov', noItems: 'Oldindan taom tanlanmagan — faqat stol broni.', deposit: 'Depozit', paid: 'to‘langan', pending: 'kutilmoqda', print: 'Chekni chop etish', pdf: 'Chekni yuklab olish (PDF)', close: 'Yopish', payNote: 'To‘lov restoranda amalga oshiriladi.', status: { pending: 'Tasdiq kutilmoqda', confirmed: 'Tasdiqlangan', completed: 'Yakunlangan', cancelled: 'Bekor qilingan', no_show: 'Kelmagan' }, arrived: 'Mijoz keldi', error: 'Chekni ochib bo‘lmadi.', code: 'Kod', currency: 'so‘m', inactive: 'Bron faol emas — chipta yaroqsiz.' },
    ru: { gift: 'Подарок', bonus: 'Бонус ко дню рождения', minOrder: 'заказ от', promo: 'Промокод', discount: 'Скидка', due: 'К оплате после депозита', title: 'Чек бронирования', pass: 'Билет брони', show: 'Покажите этот QR-код в ресторане.', receiptNo: 'Чек №', date: 'Дата', time: 'Время', table: 'Стол', guests: 'Гостей', dish: 'Блюдо', qty: 'Кол-во', price: 'Цена', sum: 'Сумма', subtotal: 'Блюда', fee: 'Обслуживание', total: 'Итого к оплате', noItems: 'Блюда заранее не выбраны — бронь только стола.', deposit: 'Депозит', paid: 'оплачен', pending: 'ожидается', print: 'Распечатать чек', pdf: 'Скачать чек (PDF)', close: 'Закрыть', payNote: 'Оплата производится в ресторане.', status: { pending: 'Ждёт подтверждения', confirmed: 'Подтверждена', completed: 'Завершена', cancelled: 'Отменена', no_show: 'Не пришёл' }, arrived: 'Гость пришёл', error: 'Не удалось открыть чек.', code: 'Код', currency: 'сум', inactive: 'Бронь не активна — билет недействителен.' },
    en: { gift: 'Gift', bonus: 'Birthday bonus', minOrder: 'order from', promo: 'Promo code', discount: 'Discount', due: 'Due after deposit', title: 'Booking receipt', pass: 'Booking pass', show: 'Show this QR code at the restaurant.', receiptNo: 'Receipt #', date: 'Date', time: 'Time', table: 'Table', guests: 'Guests', dish: 'Dish', qty: 'Qty', price: 'Price', sum: 'Amount', subtotal: 'Dishes', fee: 'Service charge', total: 'Total to pay', noItems: 'No dishes pre-ordered — table booking only.', deposit: 'Deposit', paid: 'paid', pending: 'pending', print: 'Print receipt', pdf: 'Download receipt (PDF)', close: 'Close', payNote: 'Payment is made at the restaurant.', status: { pending: 'Awaiting confirmation', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show' }, arrived: 'Guest arrived', error: 'Could not open the receipt.', code: 'Code', currency: 'UZS', inactive: 'Booking is not active — the pass is not valid.' },
  };
  const words = () => COPY[document.documentElement.lang] || COPY.uz;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const money = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ' + words().currency;

  let qrLib = null;
  const loadQr = () => (qrLib ??= window.qrcode ? Promise.resolve() : new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = '/vendor/qrcode-2.0.4.js';
    s.onload = ok;
    s.onerror = () => ((qrLib = null), fail(new Error('QR')));
    document.head.append(s);
  }));
  function qrModules(text) {
    const qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    return qr;
  }
  const qrSvg = (text, size) => {
    const qr = qrModules(text), n = qr.getModuleCount(), q = 4, cell = size / (n + q * 2);
    let path = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += 'M' + ((c + q) * cell).toFixed(2) + ' ' + ((r + q) * cell).toFixed(2) + 'h' + cell.toFixed(2) + 'v' + cell.toFixed(2) + 'h-' + cell.toFixed(2) + 'z';
    return '<svg class="rf-qr" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="QR"><rect width="100%" height="100%" fill="#fff"/><path d="' + path + '" fill="#000"/></svg>';
  };

  async function fetchReceipt(id) {
    const res = await fetch('/api/bookings/receipt?id=' + encodeURIComponent(id), { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || words().error);
    return data;
  }

  /** "Discount (15%)" or "Birthday bonus (order from 300 000)", with the promo code. */
  function discountLabel(d, w) {
    const x = d.discount;
    const head = x.bonus ? w.bonus + (x.minOrder ? ' (' + w.minOrder + ' ' + money(x.minOrder) + ')' : '') : w.discount + ' (' + x.percent + '%)';
    return head + (x.code ? ' · ' + x.code : '');
  }
  function receiptHtml(d, w) {
    const status = w.status[d.booking.status] || d.booking.status;
    const rows = d.items.length
      ? '<table class="rf-rc-items"><thead><tr><th>' + esc(w.dish) + '</th><th>' + esc(w.qty) + '</th><th>' + esc(w.price) + '</th><th>' + esc(w.sum) + '</th></tr></thead><tbody>' + d.items.map((i) => '<tr><td>' + esc(i.name) + '</td><td>' + i.quantity + '</td><td>' + esc(money(i.price)) + '</td><td>' + esc(money(i.total)) + '</td></tr>').join('') + '</tbody></table>'
      : '<p class="rf-rc-muted">' + esc(w.noItems) + '</p>';
    return (
      '<div class="rf-receipt-paper">' +
      '<header class="rf-rc-head"><img src="/brand-transparent.png" alt="RestaurantFoods" width="150" height="47"><b>restaurantfoods.online</b></header>' +
      '<h2>' + esc(d.restaurant.name) + '</h2><p class="rf-rc-muted">' + esc(d.restaurant.address || '') + (d.restaurant.phone ? ' · ' + esc(d.restaurant.phone) : '') + '</p>' +
      '<div class="rf-rc-meta"><span>' + esc(w.receiptNo) + ' <b>' + esc(d.receiptNo) + '</b></span><span>' + esc(status) + (d.booking.checkedInAt ? ' · ' + esc(w.arrived) : '') + '</span></div>' +
      '<dl class="rf-rc-grid"><div><dt>' + esc(w.date) + '</dt><dd>' + esc(d.booking.date) + '</dd></div><div><dt>' + esc(w.time) + '</dt><dd>' + esc(String(d.booking.slot).slice(0, 5)) + '–' + esc(String(d.booking.endSlot || '').slice(0, 5)) + '</dd></div><div><dt>' + esc(w.table) + '</dt><dd>' + esc((d.booking.table + (d.booking.mergedTable ? "+" + d.booking.mergedTable : ""))) + '</dd></div><div><dt>' + esc(w.guests) + '</dt><dd>' + esc(d.booking.guests) + '</dd></div></dl>' +
      rows +
      '<dl class="rf-rc-totals"><div><dt>' + esc(w.subtotal) + '</dt><dd>' + esc(money(d.subtotal)) + '</dd></div>' + (d.discount ? '<div><dt>' + esc(discountLabel(d, w)) + '</dt><dd>' + (d.discount.applied === false ? '0' : '−' + esc(money(d.discount.amount))) + '</dd></div>' : '') + (d.gift ? '<div><dt>🎁 ' + esc(w.gift) + ': ' + esc(d.gift.text) + '</dt><dd>' + esc(money(0)) + '</dd></div>' : '') + (d.serviceFee ? '<div><dt>' + esc(w.fee) + ' (' + d.serviceFeePercent + '%)</dt><dd>' + esc(money(d.serviceFee)) + '</dd></div>' : '') + (d.deposit ? '<div><dt>' + esc(w.deposit) + (d.deposit.amount ? ' · ' + esc(money(d.deposit.amount)) : '') + '</dt><dd>' + esc(d.deposit.status === 'paid' ? w.paid : w.pending) + '</dd></div>' : '') + '<div class="rf-rc-total"><dt>' + esc(w.total) + '</dt><dd>' + esc(money(d.total)) + '</dd></div>' + (d.due != null && d.due !== d.total ? '<div><dt>' + esc(w.due) + '</dt><dd>' + esc(money(d.due)) + '</dd></div>' : '') + '</dl>' +
      '<p class="rf-rc-muted">' + esc(w.payNote) + '</p>' +
      (d.pass ? '<div class="rf-rc-pass">' + qrSvg(d.pass.payload, 168) + '<div><b>' + esc(w.pass) + '</b><p>' + esc(w.show) + '</p><code>' + esc(w.code) + ': ' + esc(d.pass.code.replace(/(.{4})/g, '$1 ').trim()) + '</code></div></div>' : '') +
      '</div>'
    );
  }
  function passHtml(d, w) {
    if (!d.pass) return '<div class="rf-receipt-paper"><p>' + esc(w.inactive) + '</p></div>';
    return (
      '<div class="rf-receipt-paper rf-pass-paper"><header class="rf-rc-head"><img src="/brand-transparent.png" alt="RestaurantFoods" width="150" height="47"></header><h2>' + esc(w.pass) + '</h2><p class="rf-rc-muted">' + esc(d.restaurant.name) + '</p>' +
      qrSvg(d.pass.payload, 260) +
      '<dl class="rf-rc-grid"><div><dt>' + esc(w.date) + '</dt><dd>' + esc(d.booking.date) + '</dd></div><div><dt>' + esc(w.time) + '</dt><dd>' + esc(String(d.booking.slot).slice(0, 5)) + '</dd></div><div><dt>' + esc(w.table) + '</dt><dd>' + esc((d.booking.table + (d.booking.mergedTable ? "+" + d.booking.mergedTable : ""))) + '</dd></div><div><dt>' + esc(w.guests) + '</dt><dd>' + esc(d.booking.guests) + '</dd></div></dl>' +
      '<p>' + esc(w.show) + '</p><code>' + esc(d.pass.code.replace(/(.{4})/g, '$1 ').trim()) + '</code><p class="rf-rc-muted">' + esc(w.receiptNo) + ' ' + esc(d.receiptNo) + '</p></div>'
    );
  }

  // ---- PDF: the receipt drawn on a canvas, embedded as a JPEG in a one-page PDF ----
  function drawReceipt(d, w) {
    const W = 600, pad = 36, scale = 2, lines = [];
    const add = (kind, a, b) => lines.push({ kind, a, b });
    add('brand', 'RestaurantFoods', 'restaurantfoods.online');
    add('title', d.restaurant.name);
    if (d.restaurant.address) add('muted', d.restaurant.address + (d.restaurant.phone ? ' · ' + d.restaurant.phone : ''));
    add('rule');
    add('pair', w.receiptNo + ' ' + d.receiptNo, w.status[d.booking.status] || d.booking.status);
    add('pair', w.date + ': ' + d.booking.date, w.time + ': ' + String(d.booking.slot).slice(0, 5) + '–' + String(d.booking.endSlot || '').slice(0, 5));
    add('pair', w.table + ': ' + (d.booking.table + (d.booking.mergedTable ? "+" + d.booking.mergedTable : "")), w.guests + ': ' + d.booking.guests);
    add('rule');
    if (d.items.length) for (const i of d.items) (add('item', i.name, money(i.total)), add('muted', i.quantity + ' × ' + money(i.price)));
    else add('muted', w.noItems);
    add('rule');
    add('pair', w.subtotal, money(d.subtotal));
    if (d.discount) add('pair', discountLabel(d, w), d.discount.applied === false ? '0' : '−' + money(d.discount.amount));
    if (d.gift) add('pair', w.gift + ': ' + d.gift.text.slice(0, 40), money(0));
    if (d.serviceFee) add('pair', w.fee + ' (' + d.serviceFeePercent + '%)', money(d.serviceFee));
    if (d.deposit) add('pair', w.deposit, d.deposit.status === 'paid' ? w.paid : w.pending);
    add('total', w.total, money(d.total));
    if (d.due != null && d.due !== d.total) add('pair', w.due, money(d.due));
    add('muted', w.payNote);
    if (d.pass) add('qr', d.pass.payload, w.code + ': ' + d.pass.code.replace(/(.{4})/g, '$1 ').trim());
    const heightOf = (l) => ({ brand: 56, title: 40, muted: 24, rule: 22, pair: 28, item: 26, total: 44, qr: 250 })[l.kind];
    const H = pad * 2 + lines.reduce((s, l) => s + heightOf(l), 0);
    const c = document.createElement('canvas');
    c.width = W * scale;
    c.height = H * scale;
    const x = c.getContext('2d');
    x.scale(scale, scale);
    x.fillStyle = '#fff';
    x.fillRect(0, 0, W, H);
    x.fillStyle = '#111';
    x.textBaseline = 'top';
    let y = pad;
    const font = (size, weight = 400) => (x.font = weight + ' ' + size + 'px system-ui, -apple-system, Segoe UI, Roboto, sans-serif');
    const right = (t, yy) => x.fillText(t, W - pad - x.measureText(t).width, yy);
    for (const l of lines) {
      if (l.kind === 'brand') (font(22, 800), (x.fillStyle = '#00a98c'), x.fillText(l.a, pad, y), font(13), (x.fillStyle = '#555'), x.fillText(l.b, pad, y + 28), (x.fillStyle = '#111'));
      else if (l.kind === 'title') (font(22, 700), x.fillText(l.a, pad, y + 6));
      else if (l.kind === 'muted') (font(13), (x.fillStyle = '#555'), x.fillText(l.a, pad, y + 4), (x.fillStyle = '#111'));
      else if (l.kind === 'rule') (x.setLineDash([4, 4]), x.beginPath(), x.moveTo(pad, y + 11), x.lineTo(W - pad, y + 11), (x.strokeStyle = '#999'), x.stroke(), x.setLineDash([]));
      else if (l.kind === 'pair') (font(15), x.fillText(l.a, pad, y + 4), right(l.b, y + 4));
      else if (l.kind === 'item') (font(15, 600), x.fillText(l.a.slice(0, 48), pad, y + 4), right(l.b, y + 4));
      else if (l.kind === 'total') (font(20, 800), x.fillText(l.a, pad, y + 10), right(l.b, y + 10));
      else if (l.kind === 'qr') {
        const qr = qrModules(l.a), n = qr.getModuleCount(), size = 200, cell = size / n, left = (W - size) / 2;
        for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (qr.isDark(r, k)) x.fillRect(left + k * cell, y + 10 + r * cell, Math.ceil(cell), Math.ceil(cell));
        font(14, 600);
        x.fillText(l.b, (W - x.measureText(l.b).width) / 2, y + 220);
      }
      y += heightOf(l);
    }
    return { canvas: c, width: W, height: H };
  }
  function pdfFromJpeg(bytes, pxW, pxH, ptW, ptH) {
    const enc = new TextEncoder(), parts = [], offsets = [];
    let length = 0;
    const push = (chunk) => {
      const b = typeof chunk === 'string' ? enc.encode(chunk) : chunk;
      parts.push(b);
      length += b.length;
    };
    const obj = (n, body) => (offsets[n] = length, push(n + ' 0 obj\n' + body + '\nendobj\n'));
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + ptW + ' ' + ptH + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    offsets[4] = length;
    push('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + pxW + ' /Height ' + pxH + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + bytes.length + ' >>\nstream\n');
    push(bytes);
    push('\nendstream\nendobj\n');
    const draw = 'q ' + ptW + ' 0 0 ' + ptH + ' 0 0 cm /Im0 Do Q';
    obj(5, '<< /Length ' + draw.length + ' >>\nstream\n' + draw + '\nendstream');
    const xref = length;
    push('xref\n0 6\n0000000000 65535 f \n' + [1, 2, 3, 4, 5].map((n) => String(offsets[n]).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }
  async function downloadPdf(d) {
    const w = words(), { canvas, width, height } = drawReceipt(d, w);
    const data = atob(canvas.toDataURL('image/jpeg', 0.92).split(',')[1]);
    const bytes = Uint8Array.from(data, (ch) => ch.charCodeAt(0));
    // 1 px of the 600 px layout = 0.5 pt, so the page is a narrow receipt strip (300 pt ≈ 106 mm wide).
    const blob = pdfFromJpeg(bytes, canvas.width, canvas.height, width / 2, Math.round(height / 2));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'restaurantfoods-chek-' + d.receiptNo + '.pdf';
    document.body.append(a);
    a.click();
    setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 1000);
  }
  function print(paper) {
    const root = document.createElement('div');
    root.className = 'rf-print-root';
    root.append(paper.cloneNode(true));
    document.body.append(root);
    document.documentElement.classList.add('rf-printing');
    const done = () => (document.documentElement.classList.remove('rf-printing'), root.remove(), window.removeEventListener('afterprint', done));
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 60000);
  }

  async function open(id, options = {}) {
    const w = words();
    document.querySelector('.rf-receipt-dialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.className = 'rf-receipt-dialog';
    dialog.innerHTML = '<div class="rf-receipt-body"><p class="rf-rc-muted">…</p></div><div class="rf-receipt-actions"></div>';
    document.body.append(dialog);
    dialog.showModal();
    dialog.addEventListener('close', () => dialog.remove());
    const actions = dialog.querySelector('.rf-receipt-actions'), body = dialog.querySelector('.rf-receipt-body');
    const button = (text, cls, run) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.textContent = text;
      b.onclick = run;
      actions.append(b);
      return b;
    };
    try {
      const [data] = await Promise.all([fetchReceipt(id), loadQr()]);
      body.innerHTML = options.mode === 'pass' ? passHtml(data, w) : receiptHtml(data, w);
      if (options.mode !== 'pass') {
        button('🖨 ' + w.print, 'quiet', () => print(body.querySelector('.rf-receipt-paper')));
        button('⬇ ' + w.pdf, 'primary', () => downloadPdf(data));
      }
    } catch (e) {
      body.innerHTML = '<p>' + esc(e.message || w.error) + '</p>';
    }
    button(w.close, 'quiet', () => dialog.close());
    return dialog;
  }

  window.RFReceipt = { open };
})();
