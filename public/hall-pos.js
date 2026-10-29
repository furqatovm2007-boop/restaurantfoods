/*
 * Zal kassasi (route #/pos, first tab): tables of the restaurant with their status — Bo‘sh (green), Band /
 * aktiv zakaz (orange), Bron qilingan (blue) — and the booking's customer (name, phone, time, Telegram).
 * A table opens its order workspace: the restaurant's real menu by category with search, dishes added by
 * tap, quantities, comments ("Muzsiz", "Piyozsiz"), the service charge (0 / 10 / 15 %), "Zakazni saqlash"
 * (the bill stays on the table) and "Hisobni yopish va Chek chiqarish": the bill is closed, the table is free,
 * an 80 mm receipt with a QR code prints at once and the booked customer gets it by Telegram / SMS.
 * No barcode scanning here: dishes are chosen by hand. All texts are in Uzbek.
 */
(() => {
  'use strict';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const money = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' so‘m';
  const toast = (m) => (window.notify ? window.notify(m) : alert(m));
  const PAY = { cash: 'Naqd', card: 'Karta' };
  async function api(path, method = 'GET', data) {
    const res = await fetch(path, { method, credentials: 'same-origin', cache: 'no-store', headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(out.error || 'Xatolik yuz berdi.'), { status: res.status });
    return out;
  }
  const qrLib = () => (window.qrcode ? Promise.resolve() : new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = '/vendor/qrcode-2.0.4.js';
    s.onload = ok;
    s.onerror = fail;
    document.head.append(s);
  }));
  async function qrSvg(text, size) {
    await qrLib();
    const qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount(), q = 2, cell = size / (n + q * 2);
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += 'M' + ((c + q) * cell).toFixed(2) + ' ' + ((r + q) * cell).toFixed(2) + 'h' + cell.toFixed(2) + 'v' + cell.toFixed(2) + 'h-' + cell.toFixed(2) + 'z';
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="QR-kod"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  }
  const label = (t) => (t.vip ? 'VIP ' : 'Stol ') + t.number;
  const when = (iso) => new Date(iso).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const since = (iso) => {
    const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
    return m < 60 ? m + ' daq' : Math.floor(m / 60) + ' soat ' + (m % 60) + ' daq';
  };

  // ---- 80 mm thermal receipt: the HTML (shared by the modal preview and the print frame) ----
  async function receiptHtml(r, o) {
    const qr = await qrSvg(o.receiptUrl, 170);
    const rows = o.items.map((i) => `<tr><td>${esc(i.name)}${i.comment ? `<br><small>(${esc(i.comment)})</small>` : ''}</td><td class="n">${i.qty}</td><td class="n">${esc(money(i.price).replace(' so‘m', ''))}</td><td class="n">${esc(money(i.price * i.qty).replace(' so‘m', ''))}</td></tr>`).join('');
    return `<div class="hr-receipt"><h1>${esc(r.name)}</h1>${r.address ? `<p class="c">${esc(r.address)}</p>` : ''}${r.phone ? `<p class="c">${esc(r.phone)}</p>` : ''}<div class="dash"></div><p><b>Chek №:</b> ${esc(o.receiptNo || '')}</p><p><b>Stol raqami:</b> ${o.table}</p><p><b>Ofitsiant:</b> ${esc(o.waiter || '—')}</p>${o.customer?.name ? `<p><b>Mijoz ismi:</b> ${esc(o.customer.name)}</p>` : ''}<p><b>Sana va vaqt:</b> ${esc(when(o.closedAt || o.openedAt))}</p><div class="dash"></div><table><thead><tr><th>Taom nomi</th><th class="n">Soni</th><th class="n">Narxi</th><th class="n">Jami</th></tr></thead><tbody>${rows}</tbody></table><div class="dash"></div><p class="row"><span>Taomlar summasi:</span><span>${esc(money(o.subtotal))}</span></p><p class="row"><span>Xizmat haqi (${o.servicePercent}%):</span><span>${esc(money(o.service))}</span></p><p class="row big"><span>Umumiy summa:</span><span>${esc(money(o.total))}</span></p><p class="row"><span>To‘lov turi:</span><span>${esc(PAY[o.payment] || o.payment || '')}</span></p><div class="dash"></div><div class="qr">${qr}</div><p class="c"><small>Chekni tekshirish uchun QR-kodni skanerlang</small></p><p class="c"><small>Fiskal chek emas — elektron chek</small></p><p class="c thanks">Xaridingiz uchun rahmat!</p></div>`;
  }
  const RECEIPT_CSS = `.hr-receipt{width:76mm;margin:0 auto;padding:2mm;font:12px/1.35 "Courier New",ui-monospace,monospace;color:#000;background:#fff}.hr-receipt h1{font-size:16px;margin:0 0 2px;text-align:center}.hr-receipt p{margin:1px 0}.hr-receipt .c{text-align:center}.hr-receipt .dash{border-top:1px dashed #000;margin:5px 0}.hr-receipt table{width:100%;border-collapse:collapse}.hr-receipt th,.hr-receipt td{text-align:left;padding:1px 0;vertical-align:top;font-size:11px}.hr-receipt .n{text-align:right;white-space:nowrap;padding-left:4px}.hr-receipt .row{display:flex;justify-content:space-between;gap:6px}.hr-receipt .big{font-size:15px;font-weight:700}.hr-receipt .qr svg{display:block;width:40mm;height:auto;margin:4px auto}.hr-receipt .thanks{margin-top:4px;font-weight:700}`;
  const receiptDoc = (inner) => `<!doctype html><html lang="uz"><head><meta charset="utf-8"><title>Chek</title><style>body{margin:0;background:#fff}${RECEIPT_CSS}</style></head><body>${inner}</body></html>`;
  function printFrame(inner) {
    const f = document.createElement('iframe');
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    f.onload = () => {
      // Receipt paper: 80 mm wide and exactly as long as the receipt (no A4 / Letter sheet).
      try {
        const doc = f.contentDocument, style = doc.createElement('style');
        style.textContent = 'html,body{width:80mm}';
        doc.head.append(style);
        const height = Math.ceil((doc.documentElement.scrollHeight * 25.4) / 96) + 4;
        style.textContent += '@page{size:80mm ' + height + 'mm;margin:0}';
      } catch {}
      try {
        f.contentWindow.focus();
        f.contentWindow.print();
      } catch {
        window.print();
      }
      setTimeout(() => f.remove(), 60000);
    };
    f.srcdoc = receiptDoc(inner);
    document.body.append(f);
  }

  // ---- The page ----
  let timer = 0,
    tick = 0;
  window.addEventListener('hashchange', () => (clearInterval(timer), clearInterval(tick)));

  async function mount(root, restaurants) {
    clearInterval(timer);
    clearInterval(tick);
    // This mount owns `root` until another one replaces it (switching to the shop till, another page).
    const token = {};
    root.__hall = token;
    const alive = () => root.__hall === token && document.body.contains(root);
    if (!restaurants.length) {
      root.innerHTML = '<div class="panel"><p>Kassa uchun restoran topilmadi.</p></div>';
      return;
    }
    let restaurantId = (() => {
      try {
        const s = localStorage.getItem('rf-pos-restaurant');
        return restaurants.some((r) => r.id === s) ? s : restaurants[0].id;
      } catch {
        return restaurants[0].id;
      }
    })();
    let data = null,
      ws = null; // the open workspace: { table, lines, percent, version, orderId, dirty, category, search, payment }

    let queue = [];
    const load = async () => {
      data = await api('/api/table-orders?restaurantId=' + encodeURIComponent(restaurantId));
      // Live queue: guests waiting in the hall (hostess and up). Without access the block just stays empty.
      queue = await api('/api/manage/queue?restaurantId=' + encodeURIComponent(restaurantId))
        .then((r) => r.queue || [])
        .catch(() => []);
    };
    const waited = (iso) => Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
    /** The smallest free table that seats the party, for the "fits" hint. */
    const fitFor = (guests) => data.tables.filter((t) => t.status === 'free' && t.seats >= guests).sort((a, b) => a.seats - b.seats)[0] || null;
    function queueBlock() {
      const free = data.tables.filter((t) => t.status === 'free');
      return `<section class="panel hp-queue"><h3>👥 Jonli navbat <span class="muted">${queue.length ? queue.length + ' ta guruh kutmoqda' : 'hozir hech kim kutmayapti'}</span></h3>${queue.length ? `<ol class="hp-queue-list">${queue.map((e, i) => { const fit = fitFor(e.guests); return `<li><span class="hp-q-main"><b>#${i + 1} ${esc(e.name)}</b> · ${e.guests} kishi${e.phone ? ` · <a href="tel:${esc(e.phone)}">${esc(e.phone)}</a>` : ''}<small>⏱ ${waited(e.createdAt)} daqiqa kutmoqda${fit ? ` · mos stol: <b>${esc(label(fit))}</b>` : ' · mos bo‘sh stol yo‘q'}</small></span><span class="hp-q-actions"><select data-seat-table="${esc(e.id)}" aria-label="Stol tanlash"><option value="">Stol…</option>${free.map((t) => `<option value="${t.number}" ${fit && fit.number === t.number ? 'selected' : ''}>${esc(label(t))} · ${t.seats} o‘rin</option>`).join('')}</select><button type="button" class="primary" data-seat="${esc(e.id)}" ${free.length ? '' : 'disabled'}>🪑 O‘tqazish</button><button type="button" class="quiet" data-unqueue="${esc(e.id)}" aria-label="Navbatdan chiqarish">✕</button></span></li>`; }).join('')}</ol>` : ''}<form class="hp-queue-form" data-queue-form><input name="name" required maxlength="40" placeholder="Ism yoki belgi"><input name="guests" type="number" min="1" max="30" value="2" required aria-label="Kishi soni"><input name="phone" type="tel" inputmode="tel" placeholder="+998… (ixtiyoriy)"><button class="quiet">＋ Navbatga qo‘shish</button></form></section>`;
    }
    function bindQueue() {
      const post = async (payload) => {
        queue = (await api('/api/manage/queue', 'POST', { restaurantId, ...payload })).queue || [];
      };
      const form = root.querySelector('[data-queue-form]');
      if (form)
        form.onsubmit = async (e) => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(form));
          try {
            await post({ action: 'add', name: f.name, guests: Number(f.guests), phone: f.phone || '' });
            drawGrid();
          } catch (err) {
            toast(err.message);
          }
        };
      root.querySelectorAll('[data-unqueue]').forEach(
        (b) =>
          (b.onclick = async () => {
            try {
              await post({ action: 'remove', id: b.dataset.unqueue });
              drawGrid();
            } catch (err) {
              toast(err.message);
            }
          }),
      );
      root.querySelectorAll('[data-seat]').forEach(
        (b) =>
          (b.onclick = async () => {
            const n = Number(root.querySelector(`[data-seat-table="${CSS.escape(b.dataset.seat)}"]`)?.value);
            if (!n) return toast('Avval bo‘sh stolni tanlang.');
            try {
              // The party leaves the queue and the table's bill opens for the waiter right away.
              await post({ action: 'seat', id: b.dataset.seat });
              openTable(n);
            } catch (err) {
              toast(err.message);
            }
          }),
      );
    }
    const table = (n) => data.tables.find((t) => t.number === n);

    // ---- Online guests at the door: grace timer, release to walk-ins, coffee bonus ----
    /** The booking's start in Tashkent time (UTC+5), as a timestamp. */
    const startAt = (slot) => Date.parse(new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10) + 'T' + slot + ':00+05:00');
    const CALL = { confirmed: '📞 Call AI: kelishini tasdiqladi', declined: '📞 Call AI: kelmaydi', no_answer: '📞 Call AI: javob bermadi', unreachable: '📞 Call AI: bog‘lanib bo‘lmadi', calling: '📞 Call AI qo‘ng‘iroq qilmoqda…' };
    /** Today's online bookings that have started (or start within 15 minutes) and whose guest has not arrived yet. */
    function arrivals() {
      const seen = new Set();
      return data.tables.filter((t) => {
        const b = t.booking;
        if (!b || b.checkedIn || t.status === 'busy' || b.startsIn > 15 || seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });
    }
    const left = (b) => startAt(b.slot) + (data.graceMinutes || 10) * 60000 - Date.now();
    const mmss = (ms) => {
      const s = Math.max(0, Math.ceil(ms / 1000));
      return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    };
    function graceBlock() {
      const list = arrivals();
      if (!list.length) return '';
      return `<section class="panel hp-grace"><h3>⏱️ Onlayn bron mehmonlari <span class="muted">${data.graceMinutes || 10} daqiqa kutiladi, keyin stol jonli mehmonga beriladi</span></h3><ul class="hp-grace-list">${list
        .map((t) => {
          const b = t.booking,
            ms = left(b),
            started = startAt(b.slot) <= Date.now();
          return `<li data-grace="${esc(b.id)}" data-slot="${esc(b.slot)}"><span class="hp-q-main"><b>${esc(label(t))} · ${esc(b.name || 'Mehmon')}</b> · ${b.guests} kishi · 🕒 ${esc(b.slot)}${b.phone ? ` · <a href="tel:${esc(b.phone)}">${esc(b.phone)}</a>` : ''}<small>${CALL[b.callStatus] ? `<span class="hp-call ${b.callStatus === 'confirmed' ? 'ok' : ''}">${CALL[b.callStatus]}</span> ` : ''}<span class="hp-grace-left ${ms <= 0 ? 'over' : ''}" data-left>${ms <= 0 ? '⌛ Kutish vaqti tugadi' : started ? `⏱️ ${mmss(ms)} kutish vaqti` : `⏱️ Bron ${esc(b.slot)} da boshlanadi`}</span></small></span><span class="hp-q-actions">${b.telegram ? `<button type="button" class="quiet" data-coffee="${esc(b.id)}">☕ 5 daqiqa kutish + Kofe bonusi yuborish</button>` : ''}<button type="button" class="primary" data-release="${esc(b.id)}" ${ms > 0 ? 'disabled' : ''}>🔓 Stolni jonli mehmonga bo‘shatish</button></span></li>`;
        })
        .join('')}</ul></section>`;
    }
    function bindGrace() {
      const send = (payload) => api('/api/manage/grace', 'POST', { restaurantId, ...payload });
      root.querySelectorAll('[data-release]').forEach(
        (b) =>
          (b.onclick = async () => {
            b.disabled = true;
            try {
              await send({ action: 'release', bookingId: b.dataset.release }).catch(async (err) => {
                // The guest confirmed through Call AI: release only on a second, explicit confirmation.
                if (err.status !== 428 || !confirm(err.message)) throw err;
                return send({ action: 'release', bookingId: b.dataset.release, force: true });
              });
              toast('Stol bo‘shatildi — jonli mehmonni o‘tqazishingiz mumkin.');
              await refresh();
            } catch (err) {
              b.disabled = false;
              toast(err.message);
            }
          }),
      );
      root.querySelectorAll('[data-coffee]').forEach(
        (b) =>
          (b.onclick = async () => {
            b.disabled = true;
            try {
              const r = await send({ action: 'coffee', bookingId: b.dataset.coffee });
              toast('☕ Mehmonga Telegram orqali yuborildi. Kupon: ' + r.code);
            } catch (err) {
              b.disabled = false;
              toast(err.message);
            }
          }),
      );
      clearInterval(tick);
      if (!root.querySelector('[data-grace]')) return;
      // The countdown ticks every second; the release button turns on when the grace period is over.
      tick = setInterval(() => {
        if (!alive() || ws) return clearInterval(tick);
        root.querySelectorAll('[data-grace]').forEach((li) => {
          const b = arrivals().find((t) => t.booking.id === li.dataset.grace)?.booking;
          if (!b) return;
          const ms = left(b),
            el = li.querySelector('[data-left]'),
            btn = li.querySelector('[data-release]');
          if (startAt(b.slot) > Date.now()) return;
          el.textContent = ms <= 0 ? '⌛ Kutish vaqti tugadi' : `⏱️ ${mmss(ms)} kutish vaqti`;
          el.classList.toggle('over', ms <= 0);
          if (ms <= 0 && btn.disabled) btn.disabled = false;
        });
      }, 1000);
    }

    // ---- Table grid ----
    function customerCard(c, b) {
      if (!c && !b) return '';
      const name = c?.name || b?.name || '';
      const phone = c?.phone || b?.phone || '';
      return `<div class="hp-customer">${name ? `<span>👤 ${esc(name)}</span>` : ''}${phone ? `<span>📞 <a href="tel:${esc(phone)}">${esc(phone)}</a></span>` : ''}${b ? `<span>🕒 ${esc(b.slot)}–${esc(b.endSlot)} · ${b.guests} kishi</span><span>${b.telegram ? '✈️ Telegram ulangan' : '✈️ Telegram ulanmagan'}</span>` : ''}</div>`;
    }
    function drawGrid() {
      const counts = { free: 0, busy: 0, reserved: 0 };
      data.tables.forEach((t) => counts[t.status]++);
      root.innerHTML = `<div class="hp-head">${restaurants.length > 1 ? `<label class="hp-restaurant">Restoran<select data-restaurant>${restaurants.map((r) => `<option value="${esc(r.id)}" ${r.id === restaurantId ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></label>` : `<p class="hp-name">${esc(data.restaurant.name)}</p>`}<div class="hp-legend"><span class="hp-dot free"></span>Bo‘sh <b>${counts.free}</b><span class="hp-dot busy"></span>Band <b>${counts.busy}</b><span class="hp-dot reserved"></span>Bron qilingan <b>${counts.reserved}</b></div></div>${graceBlock()}${queueBlock()}${
        data.tables.length
          ? `<div class="hp-grid">${data.tables
              .map((t) => {
                const o = t.order,
                  b = t.booking;
                const status = t.status === 'busy' ? 'Band · aktiv zakaz' : t.status === 'reserved' ? 'Bron qilingan' : 'Bo‘sh';
                return `<button type="button" class="hp-table ${t.status}" data-table="${t.number}"><span class="hp-table-top"><b>${esc(label(t))}</b><small>${t.seats} o‘rin</small></span><span class="hp-status">${status}</span>${t.walkin ? '<span class="hp-walkin-tag">🚶 Faqat jonli</span>' : ''}${o ? `<span class="hp-bill">🧾 ${o.items.reduce((n, i) => n + i.qty, 0)} ta taom · <b>${esc(money(o.total))}</b></span><span class="hp-since">⏱ ${esc(since(o.openedAt))} · ${esc(o.waiter || '')}</span>` : ''}${customerCard(o?.customer, t.status === 'free' && b && !b.soon ? null : b)}${t.status === 'free' && b && !b.soon ? `<span class="hp-next">Keyingi bron: ${esc(b.slot)}</span>` : ''}</button>`;
              })
              .join('')}</div>`
          : '<div class="panel"><p>Restoranda hali stollar kiritilmagan. Kabinet → “Qavatlar va stollar” bo‘limida qo‘shing.</p></div>'
      }`;
      root.querySelector('[data-restaurant]')?.addEventListener('change', async (e) => {
        restaurantId = e.target.value;
        try {
          localStorage.setItem('rf-pos-restaurant', restaurantId);
        } catch {}
        await refresh();
      });
      root.querySelectorAll('[data-table]').forEach((b) => (b.onclick = () => openTable(Number(b.dataset.table))));
      bindQueue();
      bindGrace();
    }
    async function refresh() {
      try {
        await load();
        if (!alive()) return;
        if (!ws) drawGrid();
      } catch (e) {
        root.innerHTML = `<div class="panel"><p class="notice">${esc(e.message)}</p></div>`;
      }
    }

    // ---- Order workspace ----
    function openTable(n) {
      const t = table(n),
        o = t.order;
      ws = { table: n, lines: o ? o.items.map((i) => ({ ...i })) : [], percent: o ? o.servicePercent : data.restaurant.serviceFee, version: o?.version || null, orderId: o?.id || null, dirty: false, category: 'Barchasi', search: '', payment: 'cash' };
      drawWorkspace();
      window.scrollTo({ top: 0 });
    }
    const sums = () => {
      const subtotal = ws.lines.reduce((n, l) => n + l.price * l.qty, 0),
        service = Math.round((subtotal * ws.percent) / 100);
      return { subtotal, service, total: subtotal + service };
    };
    function drawWorkspace() {
      const t = table(ws.table);
      const cats = ['Barchasi', ...new Set(data.menu.map((m) => m.category || 'Boshqalar'))];
      root.innerHTML = `<div class="hp-ws"><div class="hp-ws-head"><button type="button" class="quiet" data-back>← Stollar</button><h2>${esc(label(t))} <small class="hp-badge ${t.status}">${t.status === 'busy' ? 'Band' : t.status === 'reserved' ? 'Bron qilingan' : 'Bo‘sh'}</small></h2></div>${customerCard(t.order?.customer, t.booking && (t.booking.soon || t.status !== 'free') ? t.booking : null)}<div class="hp-ws-body"><section class="hp-menu"><div class="hp-cats">${cats.map((c) => `<button type="button" data-cat="${esc(c)}" aria-pressed="${ws.category === c}">${esc(c)}</button>`).join('')}</div><input type="search" class="hp-search" data-search placeholder="Taom qidirish..." value="${esc(ws.search)}" autocomplete="off"><div class="hp-dishes" data-dishes></div></section><aside class="hp-order"><h3>Zakaz</h3><div data-lines></div><div class="hp-service"><span>Xizmat haqi</span><div class="hp-seg">${[0, 10, 15].map((p) => `<button type="button" data-pct="${p}" aria-pressed="${ws.percent === p}">${p}%</button>`).join('')}</div></div><dl class="hp-sums" data-sums></dl><p class="hp-dirty" data-dirty hidden>● Saqlanmagan o‘zgarishlar bor</p><button type="button" class="primary hp-save" data-save>💾 Zakazni saqlash</button><div class="hp-pay"><span>To‘lov turi</span><div class="hp-seg">${Object.entries(PAY).map(([k, v]) => `<button type="button" data-pay="${k}" aria-pressed="${ws.payment === k}">${v}</button>`).join('')}</div></div><button type="button" class="hp-close" data-close>🧾 Hisobni yopish va Chek chiqarish</button>${ws.orderId ? `<button type="button" class="link hp-cancel" data-cancel>Zakazni bekor qilish</button>` : ''}</aside></div><a class="hp-jump" href="#" data-jump hidden></a></div>`;
      root.querySelector('[data-back]').onclick = () => {
        if (ws.dirty && !confirm('Saqlanmagan o‘zgarishlar yo‘qoladi. Stollarga qaytasizmi?')) return;
        ws = null;
        refresh();
      };
      root.querySelectorAll('[data-cat]').forEach((b) => (b.onclick = () => {
        ws.category = b.dataset.cat;
        root.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        drawDishes();
      }));
      root.querySelector('[data-search]').oninput = (e) => {
        ws.search = e.target.value.trim().toLowerCase();
        drawDishes();
      };
      root.querySelectorAll('[data-pct]').forEach((b) => (b.onclick = () => {
        ws.percent = Number(b.dataset.pct);
        root.querySelectorAll('[data-pct]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        changed();
      }));
      root.querySelectorAll('[data-pay]').forEach((b) => (b.onclick = () => {
        ws.payment = b.dataset.pay;
        root.querySelectorAll('[data-pay]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      }));
      root.querySelector('[data-save]').onclick = () => save(true).catch(() => {});
      root.querySelector('[data-close]').onclick = closeBill;
      root.querySelector('[data-cancel]')?.addEventListener('click', cancelBill);
      root.querySelector('[data-jump]').onclick = (e) => (e.preventDefault(), root.querySelector('.hp-order').scrollIntoView({ behavior: 'smooth' }));
      drawDishes();
      drawLines();
    }
    function drawDishes() {
      // A search looks through the whole menu, whatever category is open.
      const list = data.menu.filter((m) => (ws.search ? m.name.toLowerCase().includes(ws.search) : ws.category === 'Barchasi' || (m.category || 'Boshqalar') === ws.category));
      const host = root.querySelector('[data-dishes]');
      host.innerHTML = list.length
        ? list.map((m) => `<button type="button" class="hp-dish" data-dish="${esc(m.id)}">${m.image_url ? `<img src="${esc(m.image_url)}" alt="" loading="lazy" width="96" height="72">` : '<span class="hp-dish-ico" aria-hidden="true">🍽</span>'}<b>${esc(m.name)}</b><span>${esc(money(m.price))}</span></button>`).join('')
        : `<p class="muted">${data.menu.length ? 'Taom topilmadi.' : 'Menyu hali kiritilmagan. Kabinet → “Menyu” bo‘limida taom qo‘shing.'}</p>`;
      host.querySelectorAll('[data-dish]').forEach((b) => (b.onclick = () => {
        const m = data.menu.find((x) => x.id === b.dataset.dish);
        const line = ws.lines.find((l) => l.menuId === m.id && !l.comment);
        if (line) line.qty = Math.min(99, line.qty + 1);
        else ws.lines.push({ menuId: m.id, name: m.name, price: m.price, qty: 1, comment: '' });
        b.classList.remove('added');
        void b.offsetWidth;
        b.classList.add('added');
        changed();
      }));
    }
    function drawLines() {
      const host = root.querySelector('[data-lines]');
      host.innerHTML = ws.lines.length
        ? `<ul class="hp-lines">${ws.lines
            .map((l, i) => `<li><div class="hp-line-top"><b>${esc(l.name)}</b><button type="button" class="hp-x" data-del="${i}" aria-label="O‘chirish">×</button></div><div class="hp-line-mid"><div class="hp-qty"><button type="button" data-dec="${i}" aria-label="Kamaytirish">−</button><output>${l.qty}</output><button type="button" data-inc="${i}" aria-label="Ko‘paytirish">+</button></div><span>${esc(money(l.price))}</span><strong>${esc(money(l.price * l.qty))}</strong></div><input class="hp-comment" data-comment="${i}" maxlength="80" placeholder="💬 Izoh: Muzsiz, Piyozsiz…" value="${esc(l.comment)}"></li>`)
            .join('')}</ul>`
        : '<p class="muted hp-empty">Zakaz bo‘sh. Chapdagi menyudan taom tanlang.</p>';
      host.querySelectorAll('[data-inc]').forEach((b) => (b.onclick = () => ((ws.lines[b.dataset.inc].qty = Math.min(99, ws.lines[b.dataset.inc].qty + 1)), changed())));
      host.querySelectorAll('[data-dec]').forEach((b) => (b.onclick = () => {
        const l = ws.lines[b.dataset.dec];
        l.qty -= 1;
        if (l.qty < 1) ws.lines.splice(Number(b.dataset.dec), 1);
        changed();
      }));
      host.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => (ws.lines.splice(Number(b.dataset.del), 1), changed())));
      host.querySelectorAll('[data-comment]').forEach((input) => (input.oninput = () => {
        ws.lines[input.dataset.comment].comment = input.value.slice(0, 80);
        ws.dirty = true;
        root.querySelector('[data-dirty]').hidden = false;
      }));
      const s = sums();
      root.querySelector('[data-sums]').innerHTML = `<div><dt>Taomlar summasi</dt><dd>${esc(money(s.subtotal))}</dd></div><div><dt>Xizmat haqi (${ws.percent}%)</dt><dd>${esc(money(s.service))}</dd></div><div class="hp-total"><dt>Jami to‘lov</dt><dd>${esc(money(s.total))}</dd></div>`;
      root.querySelector('[data-dirty]').hidden = !ws.dirty;
      root.querySelector('[data-close]').disabled = !ws.lines.length;
      const jump = root.querySelector('[data-jump]'),
        count = ws.lines.reduce((n, l) => n + l.qty, 0);
      jump.hidden = !count;
      jump.textContent = `🧾 Zakaz: ${count} ta · ${money(s.total)}`;
    }
    function changed() {
      ws.dirty = true;
      drawLines();
    }
    async function save(showToast) {
      const btn = root.querySelector('[data-save]');
      btn.disabled = true;
      try {
        const r = await api('/api/table-orders', 'POST', { restaurantId, action: 'save', table: ws.table, servicePercent: ws.percent, items: ws.lines.map((l) => ({ menuId: l.menuId, qty: l.qty, comment: l.comment })), version: ws.version });
        ws.orderId = r.order.id;
        ws.version = r.order.version;
        ws.lines = r.order.items.map((i) => ({ ...i }));
        ws.dirty = false;
        await load();
        if (showToast) toast(`✓ Zakaz saqlandi — ${label(table(ws.table))} band.`);
        drawWorkspace();
        return r.order;
      } catch (e) {
        toast(e.message);
        if (e.status === 409) {
          await load().catch(() => {});
        }
        throw e;
      } finally {
        if (btn.isConnected) btn.disabled = false;
      }
    }
    async function closeBill() {
      const btn = root.querySelector('[data-close]');
      btn.disabled = true;
      try {
        // Unsaved dishes are saved first, so the receipt always matches the bill (save shows its own error).
        if (ws.dirty || !ws.orderId) {
          try {
            await save(false);
          } catch {
            return;
          }
        }
        const r = await api('/api/table-orders', 'POST', { restaurantId, action: 'close', orderId: ws.orderId, payment: ws.payment, version: ws.version });
        const order = r.order;
        const inner = await receiptHtml(data.restaurant, order);
        showReceipt(inner);
        printFrame(inner);
        ws = null;
        await refresh();
        // The booked customer gets the receipt by Telegram / SMS.
        if (order.customer) {
          try {
            const n = await api('/api/notify-customer', 'POST', { orderId: order.id });
            const channels = [n.telegram === 'sent' && 'Telegram', n.sms === 'sent' && 'SMS'].filter(Boolean);
            toast(channels.length ? `Chek chop etildi va mijozga ${channels.join('/')} orqali yuborildi!` : 'Chek chop etildi. Mijozga yuborib bo‘lmadi (Telegram ulanmagan yoki SMS xizmati sozlanmagan).');
          } catch (e) {
            toast('Chek chop etildi. Xabar yuborilmadi: ' + e.message);
          }
        } else toast('Chek chop etildi.');
      } catch (e) {
        toast(e.message);
        if (btn.isConnected) btn.disabled = false;
      }
    }
    async function cancelBill() {
      if (!confirm('Zakaz bekor qilinsinmi? Stol bo‘shaydi.')) return;
      try {
        await api('/api/table-orders', 'POST', { restaurantId, action: 'cancel', orderId: ws.orderId });
        toast('Zakaz bekor qilindi.');
        ws = null;
        await refresh();
      } catch (e) {
        toast(e.message);
      }
    }
    function showReceipt(inner) {
      const d = document.createElement('dialog');
      d.className = 'hp-receipt-dialog';
      // The preview is the printed page itself (its own frame), so the site's styles never change it.
      d.innerHTML = `<iframe class="hp-receipt-frame" title="Chek"></iframe><div class="hp-receipt-actions"><button type="button" class="quiet" data-reprint>🖨 Qayta chop etish</button><button type="button" class="primary" data-ok>Yopish</button></div>`;
      document.body.append(d);
      d.addEventListener('close', () => d.remove());
      d.querySelector('[data-ok]').onclick = () => d.close();
      d.querySelector('[data-reprint]').onclick = () => printFrame(inner);
      const frame = d.querySelector('iframe');
      frame.onload = () => (frame.style.height = frame.contentDocument.documentElement.scrollHeight + 'px');
      frame.srcdoc = receiptDoc(inner);
      d.showModal();
    }

    root.innerHTML = '<p class="muted">Yuklanmoqda…</p>';
    await refresh();
    // Other waiters' changes and new bookings appear without reloading (only on the table grid).
    timer = setInterval(() => {
      if (!alive()) return clearInterval(timer);
      if (!ws && document.visibilityState === 'visible') refresh();
    }, 20000);
  }

  const stop = (root) => {
    clearInterval(timer);
    clearInterval(tick);
    if (root) root.__hall = null;
  };
  window.RFHall = { mount, stop, receiptHtml, RECEIPT_CSS };
})();
