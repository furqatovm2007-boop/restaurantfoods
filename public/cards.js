/*
 * Bank card binding (Payme Subscribe API) and the penalty rules shown before booking or cancelling.
 * The card number and Payme's SMS code go from this page straight to Payme (public cash-register
 * id only); our server receives just the resulting token and re-checks it with Payme.
 */
(() => {
  'use strict';
  const COPY = {
    uz: { title: 'Bank kartasini ulash', number: 'KARTA RAQAMI', expire: 'AMAL QILISH MUDDATI (OO/YY)', agree: 'Jarima qoidalari bilan tanishdim va kartamdan avtomatik yechilishiga roziman.', next: 'Davom etish', sms: 'SMS KOD', smsSent: 'Payme karta egasining telefoniga SMS kod yubordi', verify: 'Tasdiqlash', cancel: 'Bekor qilish', done: 'Karta ulandi', rules: 'Bekor qilish va kelmaslik qoidalari', free: '2 soat va undan oldin — bepul', noShow: 'Kelmaslik', left: 'qolganda', min: 'daq.', sum: 'so‘m', bound: 'Ulangan karta', remove: 'Kartani o‘chirish', bind: 'Kartani ulash', off: 'Karta to‘lovi hali ulanmagan.', needAgree: 'Qoidalarga rozilik belgisini qo‘ying.', badCard: 'Karta raqami yoki muddati noto‘g‘ri.', cancelTitle: 'Bronni bekor qilish', penaltyNow: 'Hozir bekor qilsangiz kartangizdan yechiladi:', freeNow: 'Hozir bekor qilish bepul.', confirm: 'Ha, bekor qilish', keep: 'Bronni saqlash', charged: 'Jarima yechildi', failed: 'Jarimani yechib bo‘lmadi — restoran qarzdorlik sifatida ko‘radi' },
    ru: { title: 'Привязать банковскую карту', number: 'НОМЕР КАРТЫ', expire: 'СРОК ДЕЙСТВИЯ (ММ/ГГ)', agree: 'Я ознакомлен с правилами штрафов и согласен на автоматическое списание с карты.', next: 'Продолжить', sms: 'SMS-КОД', smsSent: 'Payme отправил SMS-код на телефон владельца карты', verify: 'Подтвердить', cancel: 'Отмена', done: 'Карта привязана', rules: 'Правила отмены и неявки', free: 'За 2 часа и раньше — бесплатно', noShow: 'Неявка', left: 'до начала', min: 'мин.', sum: 'сум', bound: 'Привязанная карта', remove: 'Удалить карту', bind: 'Привязать карту', off: 'Оплата картой ещё не подключена.', needAgree: 'Отметьте согласие с правилами.', badCard: 'Неверный номер или срок карты.', cancelTitle: 'Отмена брони', penaltyNow: 'При отмене сейчас с карты будет списано:', freeNow: 'Сейчас отмена бесплатна.', confirm: 'Да, отменить', keep: 'Оставить бронь', charged: 'Штраф списан', failed: 'Штраф не удалось списать — ресторан видит его как долг' },
    en: { title: 'Link a bank card', number: 'CARD NUMBER', expire: 'EXPIRY (MM/YY)', agree: 'I have read the penalty rules and agree to automatic charges to my card.', next: 'Continue', sms: 'SMS CODE', smsSent: 'Payme sent an SMS code to the card holder’s phone', verify: 'Confirm', cancel: 'Cancel', done: 'Card linked', rules: 'Cancellation and no-show rules', free: '2 hours or more before — free', noShow: 'No-show', left: 'before', min: 'min', sum: 'UZS', bound: 'Linked card', remove: 'Remove card', bind: 'Link card', off: 'Card payments are not connected yet.', needAgree: 'Tick the consent box.', badCard: 'Wrong card number or expiry.', cancelTitle: 'Cancel booking', penaltyNow: 'Cancelling now charges your card:', freeNow: 'Cancelling now is free.', confirm: 'Yes, cancel', keep: 'Keep booking', charged: 'Penalty charged', failed: 'The penalty could not be charged — the restaurant sees it as a debt' },
  };
  const w = () => COPY[document.documentElement.lang] || COPY.uz;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const money = (n) => Number(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ' + w().sum;
  const toast = (text) => (window.notify ? window.notify(text) : alert(text));

  async function api(method, payload) {
    const res = await fetch('/api/cards', { method, credentials: 'same-origin', headers: payload ? { 'Content-Type': 'application/json' } : {}, body: payload ? JSON.stringify(payload) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
  }
  let cached = null;
  const status = async (fresh) => (!fresh && cached) || (cached = await api('GET'));

  /** Red block with the tiers, used on the booking form, the card dialog and the cancel dialog. */
  function rulesHtml(rules) {
    const c = w();
    const rows = (rules?.tiers || []).map((t, i, all) => {
      const upper = i ? all[i - 1].above : (rules.freeMinutes || 120);
      return `<li>${t.above ? `${t.above + 1}–${upper}` : `≤ ${upper}`} ${c.min} ${c.left} — <b>${money(t.amount)}</b></li>`;
    });
    return `<div class="penalty-rules" role="note"><b>⚠️ ${c.rules}</b><ul><li>${c.free}</li>${rows.join('')}<li>${c.noShow} — <b>${money(rules?.noShow || 150000)}</b></li></ul></div>`;
  }

  async function payme(endpoint, merchantId, method, params) {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'X-Auth': merchantId, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: Date.now(), method, params }) });
    const data = await res.json().catch(() => ({}));
    if (data.error || !data.result) {
      const m = data.error?.message;
      throw new Error((typeof m === 'string' ? m : m?.[document.documentElement.lang] || m?.uz || m?.ru) || 'Payme');
    }
    return data.result;
  }

  function dialog(html) {
    const d = document.createElement('dialog');
    d.className = 'rf-card-dialog';
    d.innerHTML = html;
    document.body.append(d);
    d.addEventListener('close', () => d.remove());
    d.showModal();
    return d;
  }

  /** Card binding: number + expiry + consent → Payme SMS code → saved token. Resolves to the card or null. */
  async function open() {
    const s = await status(true);
    const c = w();
    if (!s.enabled) {
      toast(c.off);
      return null;
    }
    return new Promise((resolve) => {
      const d = dialog(`<form method="dialog" class="form" data-step="card"><h3>💳 ${c.title}</h3>${rulesHtml(s.rules)}<label>${c.number}<input name="number" inputmode="numeric" autocomplete="cc-number" maxlength="19" placeholder="8600 0000 0000 0000" required></label><label>${c.expire}<input name="expire" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="03/29" required></label><label class="check penalty-agree"><input type="checkbox" name="agree"> ${c.agree}</label><div class="contact-phone-actions"><button class="primary" value="next">${c.next}</button><button type="button" class="quiet" data-close>${c.cancel}</button></div><p class="form-message" role="status"></p></form>`);
      const f = d.querySelector('form'),
        say = (m) => (f.querySelector('.form-message').textContent = m);
      let token = null,
        result = null;
      d.addEventListener('close', () => resolve(result));
      d.querySelector('[data-close]').onclick = () => d.close();
      f.elements.number.oninput = (e) => (e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '));
      f.elements.expire.oninput = (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 4);
        e.target.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
      };
      f.onsubmit = async (e) => {
        e.preventDefault();
        const btn = f.querySelector('button.primary');
        btn.disabled = true;
        say('');
        try {
          if (!token) {
            const number = f.elements.number.value.replace(/\D/g, ''),
              exp = f.elements.expire.value.replace(/\D/g, '');
            if (!/^\d{16}$/.test(number) || !/^(0[1-9]|1[0-2])\d{2}$/.test(exp)) throw new Error(c.badCard);
            if (!f.elements.agree.checked) throw new Error(c.needAgree);
            const created = await payme(s.endpoint, s.merchantId, 'cards.create', { card: { number, expire: exp }, save: true });
            token = created.card.token;
            const sent = await payme(s.endpoint, s.merchantId, 'cards.get_verify_code', { token });
            // The card number leaves the page; only the SMS step remains.
            f.elements.number.value = f.elements.expire.value = '';
            f.querySelectorAll('label:not(.penalty-agree)').forEach((l) => (l.hidden = true));
            f.querySelector('.penalty-agree').hidden = true;
            f.insertAdjacentHTML('afterbegin', `<p class="notice">${c.smsSent}${sent.phone ? ': ' + esc(sent.phone) : ''}</p>`);
            f.querySelector('.contact-phone-actions').insertAdjacentHTML('beforebegin', `<label>${c.sms}<input name="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required></label>`);
            btn.textContent = c.verify;
            f.elements.code.focus();
            return;
          }
          await payme(s.endpoint, s.merchantId, 'cards.verify', { token, code: f.elements.code.value.trim() });
          const saved = await api('POST', { action: 'save', token, acceptRules: true });
          cached = null;
          result = saved.card;
          toast('✅ ' + c.done + ': ' + saved.card.masked);
          d.close();
        } catch (err) {
          say(err.message);
        } finally {
          btn.disabled = false;
        }
      };
    });
  }

  /** Profile section: the bound card or a "Link card" button. */
  async function mountProfile(host) {
    if (!host) return;
    let s;
    try {
      s = await status(true);
    } catch {
      return;
    }
    if (!s.enabled) return (host.hidden = true);
    const c = w();
    host.hidden = false;
    host.innerHTML = `<h3>💳 ${c.bound}</h3>${s.card ? `<p><b>${esc(s.card.masked)}</b> · ${esc(s.card.expire)}</p><button type="button" class="quiet" data-card-remove>${c.remove}</button>` : `<button type="button" class="primary" data-card-bind>${c.bind}</button>`}${rulesHtml(s.rules)}`;
    host.querySelector('[data-card-bind]')?.addEventListener('click', async () => (await open()) && mountProfile(host));
    host.querySelector('[data-card-remove]')?.addEventListener('click', async (e) => {
      e.target.disabled = true;
      try {
        await api('POST', { action: 'remove' });
        cached = null;
        mountProfile(host);
      } catch (err) {
        toast(err.message);
        e.target.disabled = false;
      }
    });
  }

  /** Cancel with the penalty shown first. Resolves true when cancelled. */
  async function cancelBooking(id) {
    const c = w();
    const call = async (payload) => {
      const res = await fetch('/api/bookings', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error');
      return data;
    };
    const { penalty } = await call({ id, preview: true });
    const rules = penalty ? (await status().catch(() => null))?.rules : null;
    const ok = await new Promise((resolve) => {
      const d = dialog(`<form method="dialog" class="form"><h3>${c.cancelTitle}</h3>${penalty ? `<p class="penalty-now">${c.penaltyNow} <b>${money(penalty)}</b></p>${rules ? rulesHtml(rules) : ''}` : `<p>${c.freeNow}</p>`}<div class="contact-phone-actions"><button class="${penalty ? 'danger' : 'primary'}" value="yes">${c.confirm}</button><button class="quiet" value="no">${c.keep}</button></div></form>`);
      d.addEventListener('close', () => resolve(d.returnValue === 'yes'));
    });
    if (!ok) return false;
    const r = await call({ id, acceptPenalty: !!penalty });
    if (r.penalty) toast(r.penalty.status === 'paid' ? '💳 ' + c.charged + ': ' + money(r.penalty.amount) : '⚠️ ' + c.failed);
    return true;
  }

  window.RFCards = { status, open, mountProfile, rulesHtml, cancelBooking, reset: () => (cached = null) };
})();
