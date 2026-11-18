/*
 * Phone number with a country selector (MVP checkout): the flag + dial code on the left, the local digits on the
 * right, spaced as the guest types ("99 384 73 84" for +998). A pasted full number ("+998993847384",
 * "00 44 7911 123456") loses its dial code and switches the country when it is another one on the list. The
 * booking gets the number as E.164 ("+998993847384"); app/phone-codes.ts checks the same list on the server.
 */
(function () {
  const COUNTRIES = [
    { id: 'uz', flag: '🇺🇿', dial: '998', len: [9], mask: 'XX XXX XX XX', name: { uz: 'O‘zbekiston', ru: 'Узбекистан', en: 'Uzbekistan' } },
    { id: 'ru', flag: '🇷🇺', dial: '7', len: [10], mask: 'XXX XXX XX XX', name: { uz: 'Rossiya / Qozog‘iston', ru: 'Россия / Казахстан', en: 'Russia / Kazakhstan' } },
    { id: 'us', flag: '🇺🇸', dial: '1', len: [10], mask: 'XXX XXX XXXX', name: { uz: 'AQSH / Kanada', ru: 'США / Канада', en: 'USA / Canada' } },
    { id: 'gb', flag: '🇬🇧', dial: '44', len: [10], mask: 'XXXX XXX XXX', name: { uz: 'Buyuk Britaniya', ru: 'Великобритания', en: 'UK' } },
    { id: 'tr', flag: '🇹🇷', dial: '90', len: [10], mask: 'XXX XXX XX XX', name: { uz: 'Turkiya', ru: 'Турция', en: 'Turkey' } },
    { id: 'ae', flag: '🇦🇪', dial: '971', len: [9], mask: 'XX XXX XXXX', name: { uz: 'BAA', ru: 'ОАЭ', en: 'UAE' } },
    { id: 'de', flag: '🇩🇪', dial: '49', len: [10, 11], mask: 'XXX XXXX XXXX', name: { uz: 'Germaniya', ru: 'Германия', en: 'Germany' } },
    { id: 'kr', flag: '🇰🇷', dial: '82', len: [9, 10], mask: 'XX XXXX XXXX', name: { uz: 'Janubiy Koreya', ru: 'Южная Корея', en: 'South Korea' } },
  ];
  const byId = (id) => COUNTRIES.find((c) => c.id === id) || COUNTRIES[0];
  const max = (c) => Math.max(...c.len);
  // Longest dial code first, so "+971…" is not read as "+9…".
  const byDial = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

  /*
   * Raw text → { country, digits } (local digits only, cut to the country's maximum). "+…" or "00…" is read as
   * a full international number; digits starting with the current dial code and longer than a local number lose
   * it too ("998993847384" in the +998 field); a trunk 0 (or Russia's 8) in front of a full local number goes.
   */
  function parse(raw, currentId) {
    const text = String(raw || '').trim();
    let country = byId(currentId),
      d = text.replace(/\D/g, '');
    const intl = text.startsWith('+') || d.startsWith('00');
    if (intl) {
      if (d.startsWith('00')) d = d.slice(2);
      const hit = byDial.find((c) => d.startsWith(c.dial) && d.length - c.dial.length <= max(c));
      if (hit) {
        country = hit;
        d = d.slice(hit.dial.length);
      } else return { country: country.id, digits: '', pending: true };
    } else if (d.length > max(country) && d.startsWith(country.dial)) d = d.slice(country.dial.length);
    if (d.length > max(country) && (d[0] === '0' || (country.dial === '7' && d[0] === '8'))) d = d.slice(1);
    else if (d[0] === '0' && country.dial !== '998') d = d.slice(1);
    return { country: country.id, digits: d.slice(0, max(country)) };
  }
  /** Local digits spaced by the country's mask: "993847384" → "99 384 73 84". */
  function format(digits, id) {
    const c = byId(id);
    let out = '',
      i = 0;
    for (const ch of c.mask) {
      if (i >= digits.length) break;
      if (ch === 'X') out += digits[i++];
      else out += ch;
    }
    return out + digits.slice(i);
  }
  /** E.164 ("+998993847384") or '' when the number is not complete for the country. */
  function e164(digits, id) {
    const c = byId(id),
      d = String(digits || '').replace(/\D/g, '');
    return c.len.includes(d.length) ? '+' + c.dial + d : '';
  }

  const api = { COUNTRIES, parse, format, e164, byId };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window === 'undefined') return;
  window.RFPhone = api;

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  /*
   * The input group's HTML. `value` may be a saved E.164 number (the profile's phone) — it opens on its country.
   * The hidden input "phone" always holds the E.164 value (empty until the number is complete).
   */
  api.html = (value, countryId, lang, label) => {
    const p = parse(value || '', countryId || 'uz'),
      c = byId(p.country),
      L = lang || 'uz';
    const list = COUNTRIES.map((x) => `<li role="option" tabindex="-1" data-country="${x.id}" aria-selected="${x.id === c.id}"><span class="rf-phone-flag">${x.flag}</span><span>${esc(x.name[L] || x.name.en)}</span><b>+${x.dial}</b></li>`).join('');
    return `<div class="rf-phone" data-rf-phone data-country="${c.id}"><label class="rf-phone-label" for="rfPhoneLocal">${esc(label)}</label><div class="rf-phone-group"><button type="button" class="rf-phone-cc" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(label)}: ${esc(c.name[L] || c.name.en)}"><span class="rf-phone-flag">${c.flag}</span><span data-dial>+${c.dial}</span><span class="rf-phone-caret" aria-hidden="true">▾</span></button><input class="rf-phone-local" id="rfPhoneLocal" name="phoneLocal" type="tel" inputmode="tel" autocomplete="tel-national" aria-label="${esc(label)}" placeholder="${esc(c.mask.replace(/X/g, '0'))}" value="${esc(format(p.digits, c.id))}" required></div><ul class="rf-phone-list" role="listbox" hidden>${list}</ul><input type="hidden" name="phone" value="${esc(e164(p.digits, c.id))}"></div>`;
  };
  /** Wires a group made by html(): typing, pasting, the country list. onChange(e164, country) after each change. */
  api.bind = (root, onChange) => {
    const box = root.querySelector('[data-rf-phone]') || root;
    if (!box || box.dataset.bound) return;
    box.dataset.bound = '1';
    const input = box.querySelector('.rf-phone-local'),
      hidden = box.querySelector('input[type=hidden]'),
      btn = box.querySelector('.rf-phone-cc'),
      list = box.querySelector('.rf-phone-list');
    const sync = (digits, keepCaret) => {
      const c = byId(box.dataset.country);
      const before = input.value,
        caret = input.selectionStart ?? before.length,
        nDigitsBeforeCaret = before.slice(0, caret).replace(/\D/g, '').length;
      input.value = format(digits, c.id);
      input.placeholder = c.mask.replace(/X/g, '0');
      hidden.value = e164(digits, c.id);
      if (keepCaret && document.activeElement === input) {
        // Keep the caret after the same digit, whatever spaces were added in front of it.
        let pos = 0,
          seen = 0;
        while (pos < input.value.length && seen < nDigitsBeforeCaret) if (/\d/.test(input.value[pos++])) seen++;
        try {
          input.setSelectionRange(pos, pos);
        } catch {}
      }
      onChange?.(hidden.value, c.id);
    };
    const setCountry = (id) => {
      const c = byId(id);
      box.dataset.country = c.id;
      btn.querySelector('.rf-phone-flag').textContent = c.flag;
      btn.querySelector('[data-dial]').textContent = '+' + c.dial;
      list.querySelectorAll('[data-country]').forEach((li) => li.setAttribute('aria-selected', String(li.dataset.country === c.id)));
    };
    input.addEventListener('input', () => {
      const p = parse(input.value, box.dataset.country);
      // "+4", "+97": a dial code being typed — leave the text until it names a country.
      if (p.pending) {
        hidden.value = '';
        return onChange?.('', box.dataset.country);
      }
      if (p.country !== box.dataset.country) setCountry(p.country);
      sync(p.digits, true);
    });
    input.addEventListener('paste', (e) => {
      const text = e.clipboardData?.getData('text');
      if (!text) return;
      e.preventDefault();
      // A full number replaces the field; a few digits go in at the caret.
      const full = /^\s*(\+|00)/.test(text) || text.replace(/\D/g, '').length > max(byId(box.dataset.country));
      const p = parse(full ? text : input.value.slice(0, input.selectionStart) + text + input.value.slice(input.selectionEnd), box.dataset.country);
      if (p.pending) return;
      if (p.country !== box.dataset.country) setCountry(p.country);
      sync(p.digits, false);
    });
    const close = (focusBtn) => {
      list.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus();
    };
    const open = () => {
      list.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      (list.querySelector('[aria-selected=true]') || list.firstElementChild)?.focus();
    };
    btn.addEventListener('click', () => (list.hidden ? open() : close(true)));
    const choose = (li) => {
      setCountry(li.dataset.country);
      close(false);
      sync(input.value.replace(/\D/g, '').slice(0, max(byId(li.dataset.country))), false);
      input.focus();
    };
    list.addEventListener('click', (e) => {
      const li = e.target.closest('[data-country]');
      if (li) choose(li);
    });
    list.addEventListener('keydown', (e) => {
      const items = [...list.querySelectorAll('[data-country]')],
        i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (items[i]) choose(items[i]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      } else if (e.key === 'Tab') close(false);
    });
    document.addEventListener('pointerdown', (e) => {
      if (!list.hidden && !box.contains(e.target)) close(false);
    });
  };
})();
