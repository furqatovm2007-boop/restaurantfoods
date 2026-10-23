/*
 * Door check-in for restaurant staff: scan the guest's QR booking pass with the camera (the
 * browser's BarcodeDetector where available, otherwise jsQR, loaded only here) or type the code.
 * The booking is shown first; "Mijoz keldi" marks it arrived and the table "occupied" (Seated).
 *   RFCheckin.open()  — also opened by any #openCheckin button.
 */
(() => {
  'use strict';
  const COPY = {
    uz: { title: 'QR-kodni tekshirish', hint: 'Mijozning bron chiptasidagi QR kodni kameraga tuting.', manual: 'Yoki kodni kiriting', check: 'Tekshirish', arrived: 'Mijoz keldi', again: 'Yana skanerlash', close: 'Yopish', table: 'Stol', guests: 'kishi', ok: 'Mijoz keldi — stol band (Seated).', noCamera: 'Kamera ochilmadi. Kodni qo‘lda kiriting.', notOurs: 'Bu QR kod RestaurantFoods broni emas.', noShows: 'Avval kelmagan' },
    ru: { title: 'Проверить QR-код', hint: 'Наведите камеру на QR-код билета гостя.', manual: 'Или введите код', check: 'Проверить', arrived: 'Гость пришёл', again: 'Сканировать снова', close: 'Закрыть', table: 'Стол', guests: 'гостей', ok: 'Гость пришёл — стол занят (Seated).', noCamera: 'Камера не открылась. Введите код вручную.', notOurs: 'Этот QR-код не является бронью RestaurantFoods.', noShows: 'Ранее не приходил' },
    en: { title: 'Check QR code', hint: 'Point the camera at the guest’s booking pass.', manual: 'Or type the code', check: 'Check', arrived: 'Guest arrived', again: 'Scan again', close: 'Close', table: 'Table', guests: 'guests', ok: 'Guest arrived — table occupied (Seated).', noCamera: 'The camera did not open. Type the code instead.', notOurs: 'This QR code is not a RestaurantFoods booking.', noShows: 'Previous no-shows' },
  };
  const words = () => COPY[document.documentElement.lang] || COPY.uz;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  let jsqr = null;
  const loadJsQr = () => (jsqr ??= window.jsQR ? Promise.resolve() : new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = '/vendor/jsqr-1.4.0.js';
    s.onload = ok;
    s.onerror = () => ((jsqr = null), fail(new Error('jsQR')));
    document.head.append(s);
  }));

  async function post(payload) {
    const res = await fetch('/api/manage/checkin', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
  }

  async function open() {
    const w = words();
    document.querySelector('.rf-checkin-dialog')?.close();
    const dialog = document.createElement('dialog');
    dialog.className = 'rf-checkin-dialog';
    dialog.innerHTML =
      '<h2>📷 ' + esc(w.title) + '</h2><p class="muted">' + esc(w.hint) + '</p><div class="rf-scan"><video playsinline muted></video><span class="rf-scan-frame" aria-hidden="true"></span></div>' +
      '<form class="rf-scan-manual"><label>' + esc(w.manual) + '<input name="code" autocomplete="off" autocapitalize="characters" placeholder="XXXX XXXX XXXX XXXX"></label><button class="quiet">' + esc(w.check) + '</button></form>' +
      '<div class="rf-scan-result" aria-live="polite"></div><div class="row-actions"><button type="button" class="quiet" data-close>' + esc(w.close) + '</button></div>';
    document.body.append(dialog);
    dialog.showModal();
    const video = dialog.querySelector('video'), result = dialog.querySelector('.rf-scan-result');
    let stream = null, timer = 0, busy = false, alive = true;
    const stop = () => {
      clearInterval(timer);
      timer = 0;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
    };
    dialog.addEventListener('close', () => ((alive = false), stop(), dialog.remove()));
    dialog.querySelector('[data-close]').onclick = () => dialog.close();

    async function show(code) {
      if (busy) return;
      busy = true;
      try {
        const { booking } = await post({ code });
        stop();
        result.innerHTML =
          '<div class="rf-scan-card"><b>' + esc(booking.restaurant) + '</b><p>' + esc(booking.date) + ' · ' + esc(String(booking.slot).slice(0, 5)) + '–' + esc(String(booking.endSlot || '').slice(0, 5)) + ' · ' + esc(w.table) + ' ' + esc(booking.table) + (booking.mergedTable ? '+' + esc(booking.mergedTable) : '') + ' · ' + esc(booking.guests) + ' ' + esc(w.guests) + '</p><p>' + esc(booking.customer || '') + ' · ' + esc(booking.receiptNo) + (booking.noShowCount ? ' · ⚠️ ' + esc(w.noShows) + ': ' + booking.noShowCount : '') + '</p>' +
          booking.warnings.map((m) => '<p class="notice">' + esc(m) + '</p>').join('') +
          // Premium: VIP guest dossier (visits, favourite dishes and table).
          (booking.guest && window.RFGrowth ? window.RFGrowth.dossierHtml(booking.guest) : '') +
          '<div class="row-actions"><button type="button" class="primary" data-arrived>✓ ' + esc(w.arrived) + '</button><button type="button" class="quiet" data-again>' + esc(w.again) + '</button></div></div>';
        result.querySelector('[data-arrived]').onclick = async (e) => {
          e.currentTarget.disabled = true;
          try {
            await post({ code, confirm: true });
            result.querySelector('.rf-scan-card').insertAdjacentHTML('beforeend', '<p class="rf-scan-ok">✅ ' + esc(w.ok) + '</p>');
          } catch (err) {
            result.insertAdjacentHTML('beforeend', '<p class="notice">' + esc(err.message) + '</p>');
            e.currentTarget.disabled = false;
          }
        };
        result.querySelector('[data-again]').onclick = () => ((result.innerHTML = ''), startCamera());
      } catch (err) {
        result.innerHTML = '<p class="notice">' + esc(err.message) + '</p>';
      } finally {
        busy = false;
      }
    }

    function found(text) {
      if (!text) return;
      if (!/^RFB1:/i.test(text)) return void (result.innerHTML = '<p class="notice">' + esc(w.notOurs) + '</p>');
      show(text);
    }

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch {
        result.innerHTML = '<p class="notice">' + esc(w.noCamera) + '</p>';
        return;
      }
      if (!alive) return stop();
      video.srcObject = stream;
      await video.play().catch(() => {});
      let detector = null;
      if ('BarcodeDetector' in window) {
        try {
          if ((await window.BarcodeDetector.getSupportedFormats()).includes('qr_code')) detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        } catch {
          detector = null;
        }
      }
      if (!detector) await loadJsQr().catch(() => {});
      const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
      timer = setInterval(async () => {
        if (busy || !video.videoWidth) return;
        try {
          if (detector) {
            const codes = await detector.detect(video);
            if (codes[0]) found(codes[0].rawValue);
          } else if (window.jsQR) {
            const scale = Math.min(1, 640 / video.videoWidth);
            canvas.width = Math.round(video.videoWidth * scale);
            canvas.height = Math.round(video.videoHeight * scale);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height), code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
            if (code) found(code.data);
          }
        } catch {
          /* next frame */
        }
      }, 250);
    }
    dialog.querySelector('.rf-scan-manual').onsubmit = (e) => {
      e.preventDefault();
      const code = e.currentTarget.elements.code.value.trim();
      if (code) show(/^RFB1:/i.test(code) ? code : 'RFB1:' + code);
    };
    startCamera();
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest?.('#openCheckin')) open();
  });
  window.RFCheckin = { open };
})();
