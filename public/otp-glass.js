'use strict';
/*
 * Glassy OTP window: any `<input name="code" data-rf-otp>` becomes a dark glass panel with six digit boxes
 * (auto-advance, Backspace back, paste of the whole code, SMS autofill on the first box), a resend countdown
 * and a gold "verify" button. The original input stays in the form as a hidden field, so the form's own
 * submit handler keeps reading `form.elements.code.value`.
 *
 *   data-rf-otp-sub="…"        subtitle (already translated)
 *   data-rf-otp-title="…"      title (default "Verification code")
 *   data-rf-otp-resend="sel"   button that resends the code (looked up in the form, then the page); hidden,
 *                              the panel's countdown clicks it. Without it there is no countdown row.
 *   data-rf-otp-until="ms"     when resending becomes possible (default: 60 s from now)
 *   data-rf-otp-nobutton       no own button (the form has other fields and its own submit button)
 *
 * RF_OTP.run(form, fn) plays the 1.6 s check: the six boxes form a circle (0–0.4 s), orbit 360° (0.4–1.1 s,
 * longer while the server answers), merge into one centre cell (1.1–1.5 s) and turn emerald with a drawn
 * check; after 0.8 s more fn's result is returned and the caller signs in / redraws. A rejected fn shakes
 * the boxes red, puts them back in a row, clears them and rethrows for the caller's message.
 * RF_OTP.start(el) restarts the countdown and focuses the first box (after a code was just sent).
 */
(() => {
  const COPY = {
    uz: { title: 'Tasdiqlash kodi', sub: '6 xonali kodni kiriting', go: 'Tasdiqlash va davom etish →', checking: '6 xonali kod tekshirilmoqda...', okTitle: 'Muvaffaqiyatli tasdiqlandi!', okSub: '6 xonali xavfsizlik kodingiz tasdiqlandi', ok: 'Tasdiqlandi va himoyalandi', noCode: 'Kod kelmadimi?', resend: 'Qayta yuborish', digit: 'Raqam' },
    ru: { title: 'Код подтверждения', sub: 'Введите 6-значный код', go: 'Подтвердить и продолжить →', checking: 'Проверяем 6-значный код...', okTitle: 'Успешно подтверждено!', okSub: 'Ваш 6-значный код безопасности подтверждён', ok: 'Подтверждено и защищено', noCode: 'Не пришёл код?', resend: 'Отправить снова', digit: 'Цифра' },
    en: { title: 'Verification code', sub: 'Enter the 6-digit code', go: 'Verify and continue →', checking: 'Checking the 6-digit code...', okTitle: 'Verified successfully!', okSub: 'Your 6-digit security code is confirmed', ok: 'Verified and protected', noCode: 'Didn’t get the code?', resend: 'Resend', digit: 'Digit' },
  };
  const copy = () => COPY[window.RF_I18N?.lang] || COPY.uz;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const still = () => matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const KEY = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="15" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 12.2 19.5 3.7M16.6 6.6l2.3 2.3M14.4 8.8l1.9 1.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const SHIELD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6 4.5 5.4v5.8c0 4.7 3.1 8.6 7.5 10.2 4.4-1.6 7.5-5.5 7.5-10.2V5.4Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="m8.4 12.2 2.5 2.5 4.8-5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const panels = new WeakMap();

  function mount(input) {
    if (input.dataset.rfOtpMounted) return;
    input.dataset.rfOtpMounted = '1';
    const c = copy(), form = input.form, old = input.closest('label') || input;
    const host = document.createElement('div');
    host.className = 'rf-otp-host';
    if (old !== input) {
      if (old.id) host.id = old.id;
      host.hidden = old.hidden;
    }
    const resendSel = input.dataset.rfOtpResend, button = !('rfOtpNobutton' in input.dataset);
    host.innerHTML = `<div class="rf-otp" role="group" aria-label="${esc(input.dataset.rfOtpTitle || c.title)}"><i class="rf-otp-streak" aria-hidden="true"></i><i class="rf-otp-streak b" aria-hidden="true"></i><i class="rf-otp-corner tl" aria-hidden="true"></i><i class="rf-otp-corner tr" aria-hidden="true"></i><i class="rf-otp-corner bl" aria-hidden="true"></i><i class="rf-otp-corner br" aria-hidden="true"></i>
<div class="rf-otp-badge"><span class="rf-otp-key">${KEY}</span><span class="rf-otp-shield">${SHIELD}</span></div>
<h3 class="rf-otp-title">${esc(input.dataset.rfOtpTitle || c.title)}</h3><p class="rf-otp-sub">${esc(input.dataset.rfOtpSub || c.sub)}</p>
<div class="rf-otp-stage"><div class="rf-otp-ring">${Array.from({ length: 6 }, (_, i) => `<input class="rf-otp-box" data-otp-box="${i}" aria-label="${esc(c.digit)} ${i + 1}" inputmode="numeric" pattern="[0-9]*" autocomplete="${i ? 'off' : 'one-time-code'}" maxlength="${i ? 1 : 6}">`).join('')}</div><div class="rf-otp-core" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M11 21.5 17.5 28 30 14"/></svg></div></div>
${resendSel ? '<p class="rf-otp-timer" aria-live="polite"></p>' : ''}${button ? `<button type="submit" class="rf-otp-go"><span class="rf-otp-spin" aria-hidden="true"></span><span class="rf-otp-label">${esc(c.go)}</span></button>` : ''}<p class="rf-otp-status" role="status"></p></div>`;
    old.replaceWith(host);
    input.type = 'hidden';
    input.removeAttribute('required');
    host.append(input);
    if (form) form.classList.add('rf-otp-form');
    const panel = host.querySelector('.rf-otp'), boxes = [...host.querySelectorAll('[data-otp-box]')];
    const p = { host, panel, boxes, input, form, busy: false, until: Number(input.dataset.rfOtpUntil) || 0, timer: 0 };
    panels.set(panel, p);
    input.focus = () => boxes[0].focus();
    const sync = () => {
      input.value = boxes.map((b) => b.value).join('');
      panel.classList.remove('is-error');
      if (input.value.length === 6 && !p.busy && form && form.checkValidity()) {
        const go = host.querySelector('.rf-otp-go');
        form.requestSubmit ? form.requestSubmit(go || undefined) : form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    };
    const fill = (from, digits) => {
      digits.slice(0, 6 - from).split('').forEach((d, j) => (boxes[from + j].value = d));
      boxes[Math.min(5, from + digits.length)].focus();
      sync();
    };
    boxes.forEach((box, i) => {
      box.oninput = () => {
        const digits = box.value.replace(/\D/g, '');
        if (digits.length > 1) return fill(i, digits);
        box.value = digits;
        if (digits && i < 5) boxes[i + 1].focus();
        sync();
      };
      box.onkeydown = (e) => {
        if (e.key === 'Backspace' && !box.value && i > 0) {
          boxes[i - 1].value = '';
          boxes[i - 1].focus();
          sync();
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
        else if (e.key === 'ArrowRight' && i < 5) boxes[i + 1].focus();
      };
      box.onpaste = (e) => {
        const digits = (e.clipboardData?.getData('text') || '').replace(/\D/g, '');
        if (!digits) return;
        e.preventDefault();
        boxes.forEach((b) => (b.value = ''));
        fill(0, digits);
      };
      box.onfocus = () => box.select();
    });
    if (input.value) fill(0, input.value.replace(/\D/g, ''));
    if (resendSel) {
      const target = () => form?.querySelector(resendSel) || document.querySelector(resendSel);
      const hideTarget = () => {
        const t = target();
        if (t && t.closest('.rf-otp-host') !== host) t.classList.add('rf-otp-proxied');
      };
      hideTarget();
      setTimeout(hideTarget);
      const line = host.querySelector('.rf-otp-timer');
      const tick = () => {
        if (!document.body.contains(host)) return clearInterval(p.timer);
        const left = Math.max(0, Math.ceil((p.until - Date.now()) / 1000)), cc = copy();
        if (left) line.textContent = `${cc.noCode} ${cc.resend}: ${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
        else if (!line.querySelector('button')) {
          line.innerHTML = `${esc(cc.noCode)} <button type="button" class="rf-otp-resend">${esc(cc.resend)}</button>`;
          line.querySelector('button').onclick = () => {
            target()?.click();
            p.until = Date.now() + 60000;
            tick();
          };
        }
      };
      p.tick = tick;
      if (!p.until || p.until < Date.now()) p.until = Date.now() + 60000;
      tick();
      p.timer = setInterval(tick, 1000);
    }
  }

  const panelOf = (el) => {
    const panel = el?.classList?.contains('rf-otp') ? el : el?.querySelector?.('.rf-otp');
    return panel ? panels.get(panel) : null;
  };

  function setButton(p, state) {
    const go = p.host.querySelector('.rf-otp-go'), c = copy();
    if (!go) return;
    go.disabled = state !== 'idle';
    go.querySelector('.rf-otp-label').textContent = state === 'checking' ? c.checking : state === 'ok' ? '🛡️ ' + c.ok : c.go;
  }

  /** Lays the boxes on a circle (or pulls them to the centre) by giving each its own offset. */
  function place(p, mode) {
    const ring = p.panel.querySelector('.rf-otp-ring'), half = ring.clientWidth / 2;
    const r = Math.min(78, Math.max(58, half * 0.46));
    p.boxes.forEach((b, i) => {
      const cx = b.offsetLeft + b.offsetWidth / 2 - half, a = ((-90 + i * 60) * Math.PI) / 180;
      b.style.setProperty('--tx', (mode === 'circle' ? r * Math.cos(a) - cx : mode === 'center' ? -cx : 0).toFixed(1) + 'px');
      b.style.setProperty('--ty', (mode === 'circle' ? r * Math.sin(a) : 0).toFixed(1) + 'px');
    });
  }

  async function run(el, fn) {
    const p = panelOf(el);
    if (!p || p.busy) return fn();
    p.busy = true;
    const { panel } = p, quick = still(), t0 = Date.now();
    let result, error, done = false;
    const pending = Promise.resolve()
      .then(fn)
      .then((r) => (result = r), (e) => (error = e || new Error('')))
      .finally(() => (done = true));
    panel.classList.remove('is-error', 'is-ok');
    setButton(p, 'checking');
    p.boxes.forEach((b) => (b.readOnly = true));
    if (!quick) {
      // 1. Formation (0 – 0.4 s)
      panel.classList.add('is-forming');
      place(p, 'circle');
      await wait(400);
      // 2. Orbit: whole turns of 0.7 s until the answer is in (at least one turn → 1.1 s).
      panel.classList.add('is-orbit');
      const orbitStart = Date.now();
      await wait(700);
      if (!done) await pending;
      const spun = Date.now() - orbitStart;
      await wait(Math.ceil(spun / 700) * 700 - spun);
      panel.classList.remove('is-orbit');
    } else await pending;
    if (error) {
      p.boxes.forEach((b) => {
        b.readOnly = false;
        b.value = '';
      });
      p.input.value = '';
      place(p, 'row');
      panel.classList.remove('is-forming');
      panel.classList.add('is-error');
      setButton(p, 'idle');
      p.busy = false;
      setTimeout(() => p.boxes[0].focus(), quick ? 0 : 420);
      throw error;
    }
    // 3. Merge into the centre cell (1.1 – 1.5 s), then the emerald success state.
    if (!quick) {
      panel.classList.add('is-merge');
      place(p, 'center');
      await wait(Math.max(400, 1500 - (Date.now() - t0)));
    }
    const c = copy();
    panel.classList.add('is-ok');
    panel.querySelector('.rf-otp-title').textContent = c.okTitle;
    panel.querySelector('.rf-otp-sub').textContent = c.okSub;
    panel.querySelector('.rf-otp-status').textContent = c.okTitle;
    const timer = panel.querySelector('.rf-otp-timer');
    if (timer) timer.hidden = true;
    clearInterval(p.timer);
    setButton(p, 'ok');
    await wait(800);
    return result;
  }

  function start(el) {
    const p = panelOf(el);
    if (!p) return;
    p.until = Date.now() + 60000;
    p.tick?.();
    p.boxes[0].focus();
  }

  const scan = (root) => root.querySelectorAll?.('input[data-rf-otp]:not([data-rf-otp-mounted])').forEach(mount);
  window.RF_OTP = { run, start, mount, scan: () => scan(document) };
  const boot = () => {
    scan(document);
    new MutationObserver((list) => {
      for (const m of list) for (const n of m.addedNodes) if (n.nodeType === 1) n.matches?.('input[data-rf-otp]') ? mount(n) : scan(n);
    }).observe(document.body, { childList: true, subtree: true });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
