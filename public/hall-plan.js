/*
 * 2D hall plan — a premium architectural top view (dark emerald & gold) for every restaurant without a
 * 3D hall, the owner's drag & drop constructor, and the 3D hall offer / switch.
 *
 *  RFHallPlan.render(host, opts)   guest view: real-looking tables (duo with armchairs and a candle, round
 *                                  and rectangular tables with chairs, VIP U-sofa booths), the hall's own
 *                                  ambience (entrance, stage, bar, plants, windows — only what the owner
 *                                  placed), zone filters, pinch / wheel / +− zoom and drag to pan, neon
 *                                  states (free, selected, held 5 min, busy until …) and a glass preview
 *                                  card with the table's photo, capacity, amenities and "✅ Shu stolni tanlash".
 *  RFHallPlan.editor(host, opts)   the owner places tables and ambience by dragging, sets seats, shape,
 *                                  zone and amenities, and saves everything in one request.
 *  RFHallPlan.hall3dPanel(host, r, user)  owner: the 3D hall offer (packages + request); admin: the switch
 *                                  "🟢 3D Zal Yoqilgan / ⚪ 2D Standart Sxema" and the model / configuration.
 *  RFHallPlan.upsell(host, restaurants)   the same offer on the pricing page.
 *  RFHallPlan.leads(host)          admin: 3D hall requests.
 * Coordinates are percents of the hall (x, y as stored on the tables), drawn in a 1000-unit wide SVG.
 */
(function () {
  'use strict';
  const tr = (s) => (typeof t === 'function' ? t(s) : s);
  const E = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const call = (...a) => (typeof api === 'function' ? api(...a) : Promise.reject(new Error('API')));
  const toast = (m) => (typeof notify === 'function' ? notify(m) : console.log(m));
  const sum = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';
  const W = 1000;
  const ZONES = [
    ['all', '✨', 'Barcha stollar'],
    ['main', '🏛️', 'Asosiy zal'],
    ['terrace', '🌿', 'Terassa'],
    ['vip', '👑', 'VIP Kabinalar'],
    ['window', '🪟', 'Deraza oldi'],
  ];
  const ZONE_NAME = { main: 'Asosiy zal', terrace: 'Terassa', vip: 'VIP kabina', window: 'Deraza oldi' };
  const TAGS = { window: '🪟 Deraza oldi', sofa: '🛋️ Yumshoq divan', charger: '🔌 Quvvatlagich bor', quiet: '🤫 Tinch burchak' };
  const SCENE = { entrance: ['🚪', 'Asosiy kirish'], stage: ['🎶', 'Jonli musiqa / Sahna'], bar: ['🍸', 'Bar'], plant: ['🌿', 'O‘simlik'], window: ['🪟', 'Deraza tomon'] };
  const KIND_NAME = { '': 'Avtomatik (sig‘imga qarab)', round: 'Yumaloq', rect: 'To‘rtburchak', vip: 'VIP Divan' };

  const heightOf = (d) => {
    const w = Number(d.width) || 0,
      l = Number(d.length) || 0;
    return w && l ? Math.round(Math.max(520, Math.min(1100, (W * l) / w))) : 640;
  };
  const metaOf = (d, tb) => (d.meta || {})[String(tb.number)] || { zone: 'main', kind: '', tags: [] };
  const kindOf = (tb, m) => (m.kind === 'vip' || m.zone === 'vip' ? 'vip' : m.kind ? m.kind : (Number(tb.seats) || 2) <= 2 ? 'duo' : tb.shape === 'round' ? 'round' : 'rect');
  const inZone = (m, zone) => zone === 'all' || m.zone === zone || (zone === 'window' && (m.tags || []).includes('window'));
  const capacity = (n) => (n <= 2 ? '1–2' : Math.max(1, n - 2) + '–' + n);

  // ---------- drawing ----------
  const defs = `<defs>
    <pattern id="hpFloor" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#0b1f1a"/><path d="M0 22h44M22 0v44" stroke="rgba(234,179,8,.05)" stroke-width="1"/><path d="M0 0l44 44" stroke="rgba(16,185,129,.04)" stroke-width="1"/></pattern>
    <linearGradient id="hpWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b3a22"/><stop offset=".5" stop-color="#7a5232"/><stop offset="1" stop-color="#4a2f1b"/></linearGradient>
    <radialGradient id="hpMarble" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#3a4a46"/><stop offset=".6" stop-color="#1d2a27"/><stop offset="1" stop-color="#121a18"/></radialGradient>
    <linearGradient id="hpVelvet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14532d"/><stop offset="1" stop-color="#0b3320"/></linearGradient>
    <linearGradient id="hpGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(56,189,248,.15)"/><stop offset=".5" stop-color="rgba(45,212,191,.75)"/><stop offset="1" stop-color="rgba(56,189,248,.15)"/></linearGradient>
    <radialGradient id="hpCandle"><stop offset="0" stop-color="rgba(250,204,21,.9)"/><stop offset="1" stop-color="rgba(250,204,21,0)"/></radialGradient>
  </defs>`;
  const chair = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-11" y="-6" width="22" height="14" rx="5" class="hp-seat"/><path d="M-11 -5 Q0 -15 11 -5" class="hp-back"/></g>`;
  function drawTable(kind, seats) {
    const n = Math.max(1, Math.min(30, Number(seats) || 2));
    if (kind === 'duo')
      return {
        r: 50,
        svg: `<path d="M-30 -20 a20 20 0 0 0 0 40 h8 v-40z" class="hp-arm"/><path d="M30 -20 a20 20 0 0 1 0 40 h-8 v-40z" class="hp-arm"/><rect x="-21" y="-21" width="42" height="42" rx="10" class="hp-top hp-wood"/><circle cx="-9" cy="6" r="6" class="hp-plate"/><circle cx="9" cy="6" r="6" class="hp-plate"/><circle cx="0" cy="-8" r="11" fill="url(#hpCandle)"/><circle cx="0" cy="-8" r="3" class="hp-candle"/>`,
      };
    if (kind === 'round') {
      const R = Math.max(28, Math.min(58, 18 + n * 5));
      let out = '';
      for (let i = 0; i < n; i++) {
        const a = (360 * i) / n;
        out += `<g transform="rotate(${a})">${chair(0, -(R + 13), 0)}</g>`;
      }
      return { r: R + 26, svg: out + `<circle r="${R}" class="hp-top hp-marble"/><circle r="${R - 7}" class="hp-inlay"/>` };
    }
    if (kind === 'vip') {
      const w = 130 + n * 8,
        d = 100,
        hw = w / 2,
        hd = d / 2;
      return {
        r: Math.max(hw, hd) + 24,
        svg: `<rect x="${-hw - 14}" y="${-hd - 14}" width="${w + 28}" height="${d + 28}" rx="16" class="hp-vip-frame"/><path d="M${-hw} ${-hd} h${w} v${d} h-20 v${-(d - 20)} h${-(w - 40)} v${d - 20} h-20z" class="hp-sofa"/><rect x="${-hw * 0.5}" y="${-hd * 0.35}" width="${w * 0.5}" height="${d * 0.55}" rx="10" class="hp-top hp-marble"/><text y="${-hd - 22}" class="hp-vip-label" text-anchor="middle">👑 VIP</text>`,
      };
    }
    // Rectangular: chairs along both long sides, one at each end from 6 seats.
    const ends = n >= 6 ? 2 : 0,
      top = Math.ceil((n - ends) / 2),
      bottom = n - ends - top,
      w = Math.max(64, Math.max(top, bottom) * 32 + 18),
      h = 52;
    let out = '';
    for (let i = 0; i < top; i++) out += chair(-w / 2 + ((i + 0.5) * w) / top, -h / 2 - 13, 0);
    for (let i = 0; i < bottom; i++) out += chair(-w / 2 + ((i + 0.5) * w) / bottom, h / 2 + 13, 180);
    if (ends) out += chair(-w / 2 - 13, 0, -90) + chair(w / 2 + 13, 0, 90);
    return { r: Math.max(w / 2, h / 2) + 28, svg: out + `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" class="hp-top ${n >= 6 ? 'hp-marble' : 'hp-wood'}"/>` };
  }
  function drawScene(items, H) {
    return items
      .map((s) => {
        const x = (s.x / 100) * W,
          y = (s.y / 100) * H,
          [icon, label] = SCENE[s.type] || ['•', ''];
        const shape = {
          entrance: `<path d="M-34 0 h68" class="hp-wall-gap"/><path d="M-30 0 A30 30 0 0 1 0 -30 L0 0" class="hp-door"/>`,
          stage: `<rect x="-95" y="-36" width="190" height="72" rx="16" class="hp-stage"/>`,
          bar: `<rect x="-115" y="-18" width="230" height="36" rx="12" class="hp-bar"/>${[-80, -40, 0, 40, 80].map((sx) => `<circle cx="${sx}" cy="34" r="9" class="hp-stool"/>`).join('')}`,
          plant: `<circle r="20" class="hp-pot"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="7" ry="15" transform="rotate(${a}) translate(0 -12)" class="hp-leaf"/>`).join('')}`,
          window: `<rect x="-110" y="-5" width="220" height="10" rx="5" fill="url(#hpGlass)" class="hp-window"/><rect x="-110" y="5" width="220" height="40" fill="url(#hpGlass)" opacity=".12"/>`,
        }[s.type];
        return `<g class="hp-scene" data-sid="${E(s.id)}" transform="translate(${x} ${y})">${shape}<text y="${s.type === 'window' ? -14 : s.type === 'bar' ? -26 : s.type === 'plant' ? 38 : 4}" text-anchor="middle" class="hp-scene-label">${icon} ${E(tr(label))}</text></g>`;
      })
      .join('');
  }
  function drawTables(d, tables, H, o) {
    return tables
      .map((tb) => {
        const m = metaOf(d, tb),
          kind = kindOf(tb, m),
          shape = drawTable(kind, tb.seats),
          st = o.statusOf ? o.statusOf(tb) : { state: 'free' },
          selected = o.selectedId === tb.id,
          dim = !inZone(m, o.zone || 'all'),
          x = (Number(tb.x) / 100) * W,
          y = (Number(tb.y) / 100) * H;
        const cls = ['hp-t', 'hp-' + (selected ? 'selected' : st.state), dim ? 'hp-dim' : '', tb.active === 0 || tb.active === false ? 'hp-off' : ''].join(' ');
        const badge = selected
          ? `<g class="hp-badge hp-badge-gold" transform="translate(0 ${-shape.r - 6})"><rect x="-46" y="-14" width="92" height="24" rx="12"/><text y="3" text-anchor="middle">✓ ${E(tr('Tanlandi'))}</text></g>`
          : st.state === 'held'
            ? `<g class="hp-badge hp-badge-amber" transform="translate(0 ${-shape.r - 6})"><rect x="-70" y="-14" width="140" height="24" rx="12"/><text y="3" text-anchor="middle">⏳ ${E(tr('Band qilinmoqda'))}</text></g>`
            : st.state === 'busy'
              ? `<g class="hp-badge hp-badge-red" transform="translate(0 ${shape.r - 4})"><rect x="-62" y="-12" width="124" height="22" rx="11"/><text y="4" text-anchor="middle">🔒 ${E(st.until || tr('Band'))}</text></g>`
              : '';
        const label = `${tb.number}-stol, ${tb.seats} kishilik, ${tr(ZONE_NAME[m.zone] || 'Asosiy zal')}, ${st.state === 'busy' ? tr('band') + ' ' + (st.until || '') : st.state === 'held' ? tr('band qilinmoqda') : tr('bo‘sh')}`;
        return `<g class="${cls}" data-tid="${E(tb.id)}" transform="translate(${x} ${y})" tabindex="${dim ? -1 : 0}" role="button" aria-label="${E(label)}" aria-pressed="${selected}"><g class="hp-body">${selected ? `<circle r="${shape.r}" class="hp-ring"/>` : ''}<circle r="${shape.r - 8}" class="hp-halo"/>${shape.svg}<g class="hp-num"><circle r="15"/><text y="5" text-anchor="middle">${E(tb.number)}</text></g><text y="${kind === 'vip' ? 34 : 30}" text-anchor="middle" class="hp-cap">${E(tb.seats)} ${E(tr('kishi'))}</text></g>${badge}</g>`;
      })
      .join('');
  }
  const floorRect = (H) => `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="22" fill="url(#hpFloor)" class="hp-floor"/><rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="16" class="hp-inner-wall"/>`;

  // ---------- zoom & pan (viewBox), shared by the guest view and the editor ----------
  function zoomable(svg, H, isDragging) {
    let v = { x: 0, y: 0, w: W, h: H };
    const apply = () => svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    const clamp = () => {
      v.w = Math.max(W / 4, Math.min(W, v.w));
      v.h = (v.w * H) / W;
      v.x = Math.max(0, Math.min(W - v.w, v.x));
      v.y = Math.max(0, Math.min(H - v.h, v.y));
    };
    const zoom = (k, cx = v.x + v.w / 2, cy = v.y + v.h / 2) => {
      const w = v.w / k;
      v = { x: cx - ((cx - v.x) * w) / v.w, y: cy - ((cy - v.y) * w) / v.w, w, h: (w * H) / W };
      clamp();
      apply();
    };
    const toSvg = (e) => {
      const r = svg.getBoundingClientRect();
      return { x: v.x + ((e.clientX - r.left) / r.width) * v.w, y: v.y + ((e.clientY - r.top) / r.height) * v.h };
    };
    const pts = new Map();
    let start = null,
      moved = false,
      pinch = 0;
    svg.addEventListener('pointerdown', (e) => {
      if (isDragging?.()) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        start = { x: e.clientX, y: e.clientY, v: { ...v } };
        moved = false;
      }
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    });
    svg.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId) || isDragging?.()) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()],
          dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) zoom(dist / pinch, ...Object.values(toSvg({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 })));
        pinch = dist;
        moved = true;
        return;
      }
      if (!start || v.w >= W) return;
      const r = svg.getBoundingClientRect(),
        dx = e.clientX - start.x,
        dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      if (!moved) return;
      v = { ...v, x: start.v.x - (dx / r.width) * v.w, y: start.v.y - (dy / r.height) * v.h };
      clamp();
      apply();
    });
    const up = (e) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
      if (!pts.size) start = null;
    };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
    svg.addEventListener(
      'wheel',
      (e) => {
        if (!e.ctrlKey && !e.metaKey && v.w >= W && e.deltaY > 0) return;
        e.preventDefault();
        const p = toSvg(e);
        zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y);
      },
      { passive: false },
    );
    // A drag that panned the plan is not a tap on a table.
    svg.addEventListener('click', (e) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    }, true);
    apply();
    return { zoom, fit: () => ((v = { x: 0, y: 0, w: W, h: H }), apply()), toSvg, get view() { return v; }, restore(prev) { if (prev) { v = { ...prev }; clamp(); apply(); } } };
  }

  // ---------- full screen ----------
  let fullHost = null;
  const lock = (on) => document.documentElement.classList.toggle('hp-lock', !!on);
  /** Leaves the full-screen plan (✕, Escape, Telegram's back button). True when it was open. */
  function exitFull() {
    if (!fullHost) return false;
    const { host, o } = fullHost;
    fullHost = null;
    lock(false);
    if (host.isConnected && host._hp) {
      host._hp.full = false;
      host._hp.view = null;
      render(host, o);
    }
    return true;
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullHost && !e.defaultPrevented) {
      e.preventDefault();
      exitFull();
    }
  });

  // ---------- guest view ----------
  function render(host, o) {
    const d = o.d,
      H = heightOf(d),
      keep = host._hp || (host._hp = { zone: 'all', view: null, preview: null });
    const tables = o.tables;
    const zonesHere = new Set(tables.map((tb) => metaOf(d, tb).zone));
    const anyWindow = tables.some((tb) => (metaOf(d, tb).tags || []).includes('window'));
    const chips = ZONES.filter(([z]) => z === 'all' || zonesHere.has(z) || (z === 'window' && anyWindow));
    if (!chips.some(([z]) => z === keep.zone)) keep.zone = 'all';
    const scene = (d.scene || []).filter((s) => s.floor === o.floor);
    lock(keep.full);
    const fullbar = keep.full ? `<div class="hp2d-fullbar">${o.logo ? `<img src="${E(o.logo)}" alt="" referrerpolicy="no-referrer">` : '<span aria-hidden="true">🏛️</span>'}<b>${E(o.title || tr('Restoran'))} — ${E(tr('Zal xaritasi'))}</b><button type="button" class="hp2d-exit" data-full>✕ ${E(tr('Kichraytirish'))}</button></div>` : '';
    host.innerHTML = `<div class="hp2d${keep.full ? ' hp-full' : ''}" ${keep.full ? `role="dialog" aria-modal="true" aria-label="${E((o.title || '') + ' — ' + tr('Zal xaritasi'))}"` : ''}>${fullbar}${chips.length > 1 ? `<div class="hp2d-filters" role="group" aria-label="${E(tr('Zonalar'))}">${chips.map(([z, i, n]) => `<button type="button" data-zone="${z}" aria-pressed="${keep.zone === z}">${i} ${E(tr(n))}</button>`).join('')}</div>` : ''}
      <div class="hp2d-stage">${keep.full ? '' : `<button type="button" class="hp2d-fullbtn" data-full>⛶ ${E(tr('To‘liq ekran'))}</button>`}<div class="hp2d-tools"><button type="button" data-zoom="in" aria-label="${E(tr('Yaqinlashtirish'))}">+</button><button type="button" data-zoom="out" aria-label="${E(tr('Uzoqlashtirish'))}">−</button><button type="button" data-zoom="fit" aria-label="${E(tr('Butun zal'))}">⤢</button></div>
      <svg class="hp2d-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${E(o.floor + '-' + tr('qavat zal sxemasi'))}">${defs}${floorRect(H)}${drawScene(scene, H)}${drawTables(d, tables, H, { ...o, zone: keep.zone })}</svg>
      <p class="hp2d-legend"><span class="lg free"></span>${E(tr('Bo‘sh'))}<span class="lg selected"></span>${E(tr('Tanlangan'))}<span class="lg held"></span>${E(tr('Band qilinmoqda'))}<span class="lg busy"></span>${E(tr('Band'))}</p></div>
      <div class="hp2d-preview" data-preview hidden></div></div>`;
    const svg = host.querySelector('svg'),
      z = zoomable(svg, H);
    z.restore(keep.view);
    const remember = () => (keep.view = { ...z.view });
    // Full screen: the plan covers the whole screen (fixed, above everything) with the restaurant's name,
    // zones, zoom and ✕; a chosen table's card opens at the bottom without leaving it.
    host.querySelectorAll('[data-full]').forEach(
      (b) =>
        (b.onclick = () => {
          keep.full = !keep.full;
          keep.view = null;
          render(host, o);
        }),
    );
    if (keep.full) {
      fullHost = { host, o };
      host.querySelector('.hp2d-exit')?.focus({ preventScroll: true });
    } else if (fullHost?.host === host) fullHost = null;
    host.querySelectorAll('[data-zoom]').forEach((b) => (b.onclick = () => (b.dataset.zoom === 'fit' ? z.fit() : z.zoom(b.dataset.zoom === 'in' ? 1.4 : 1 / 1.4), remember())));
    svg.addEventListener('pointerup', remember);
    svg.addEventListener('wheel', remember);
    host.querySelectorAll('[data-zone]').forEach(
      (b) =>
        (b.onclick = () => {
          keep.zone = b.dataset.zone;
          remember();
          render(host, o);
        }),
    );
    const open = (g) => {
      const tb = tables.find((x) => x.id === g.dataset.tid);
      if (!tb || g.classList.contains('hp-dim')) return;
      window.RFTelegram?.haptic?.('light');
      keep.preview = tb.id;
      preview(host.querySelector('[data-preview]'), d, tb, o);
    };
    svg.addEventListener('click', (e) => {
      const g = e.target.closest?.('[data-tid]');
      if (g) open(g);
    });
    svg.addEventListener('keydown', (e) => {
      const g = e.target.closest?.('[data-tid]');
      if (g && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        open(g);
      }
    });
    if (keep.preview && tables.some((x) => x.id === keep.preview)) preview(host.querySelector('[data-preview]'), d, tables.find((x) => x.id === keep.preview), o, true);
  }
  function preview(box, d, tb, o, quiet) {
    const m = metaOf(d, tb),
      st = o.statusOf ? o.statusOf(tb) : { state: 'free' },
      zone = ZONES.find(([z]) => z === m.zone) || ZONES[1];
    const status = st.state === 'busy' ? `<p class="hp2d-status busy">🔒 ${E(tr('Tanlangan vaqtda band'))}${st.until ? ': ' + E(st.until) : ''}</p>` : st.state === 'held' ? `<p class="hp2d-status held">⏳ ${E(tr('Boshqa mijoz 5 daqiqaga ushlab turibdi'))}</p>` : `<p class="hp2d-status free">● ${E(tr('Tanlangan vaqtda bo‘sh'))}${st.later ? ' · ' + E(tr('boshqa vaqtda bron')) + ': ' + E(st.later) : ''}</p>`;
    const blocked = st.state === 'busy' || st.state === 'held';
    box.hidden = false;
    box.innerHTML = `<article class="hp2d-card"><div class="hp2d-photo">${tb.image_url ? `<img src="${E(tb.image_url)}" alt="${E(tb.number + '-stol')}" loading="lazy" referrerpolicy="no-referrer">` : `<span>📷 ${E(tr('Stol rasmi hali qo‘shilmagan'))}</span>`}</div><div class="hp2d-card-body"><button type="button" class="hp2d-x" data-close aria-label="${E(tr('Yopish'))}">✕</button><h4>${E(tr('Stol'))} #${E(tb.number)} • ${capacity(Number(tb.seats) || 2)} ${E(tr('kishilik'))}</h4><p class="hp2d-zone">${zone[1]} ${E(tr(ZONE_NAME[m.zone] || 'Asosiy zal'))} · ${E(tb.floor)}-${E(tr('qavat'))}</p>${(m.tags || []).length ? `<div class="hp2d-tags">${m.tags.map((x) => `<span>${E(tr(TAGS[x]))}</span>`).join('')}</div>` : ''}${status}${tb.atmosphere ? `<p class="hp2d-note">${E(tb.atmosphere)}</p>` : ''}<button type="button" class="hp2d-choose" data-choose ${blocked ? 'disabled' : ''}>✅ ${E(tr(o.full || box.closest('.hp-full') ? 'Shu stolni bron qilish' : 'Shu stolni tanlash'))}</button></div></article>`;
    box.querySelector('[data-close]').onclick = () => {
      box.hidden = true;
      box.innerHTML = '';
      const keep = box.closest('.hp2d')?.parentElement?._hp;
      if (keep) keep.preview = null;
    };
    box.querySelector('[data-choose]').onclick = () => {
      const keep = box.closest('.hp2d')?.parentElement?._hp;
      if (keep?.full) {
        keep.full = false;
        lock(false);
        fullHost = null;
      }
      o.onChoose?.(tb);
    };
    if (!quiet) box.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }

  // ---------- owner constructor ----------
  function editor(host, o) {
    const d = o.d,
      H = heightOf(d);
    const tables = d.tables.map((tb) => ({ ...tb, ...metaOf(d, tb) }));
    let scene = (d.scene || []).map((s) => ({ ...s })),
      floor = 1,
      sel = null,
      dragging = null,
      dirty = false,
      busy = false,
      full = false,
      z = null,
      view = null;
    const meta = () => Object.fromEntries(tables.map((tb) => [String(tb.number), { zone: tb.zone, kind: tb.kind, tags: tb.tags || [] }]));
    const draw = () => {
      // The drawing reads kinds / zones from d.meta: keep it in step with the local edits.
      d.meta = meta();
      const list = tables.filter((tb) => tb.floor === floor),
        items = scene.filter((s) => s.floor === floor);
      const st = tables.find((x) => sel?.t === 'table' && x.id === sel.id),
        si = scene.find((x) => sel?.t === 'item' && x.id === sel.id);
      lock(full);
      host.innerHTML = `<div class="hp-editor${full ? ' hp-full' : ''}"><div class="hp-ed-head"><button type="button" class="quiet" data-back>← ${E(tr('Orqaga'))}</button><h2>🧭 ${E(tr('2D Zal konstruktori'))}</h2><button type="button" class="quiet" data-ed-full>${full ? '✕ ' + E(tr('Kichraytirish')) : '⛶ ' + E(tr('To‘liq ekran'))}</button><button type="button" class="primary" data-save ${busy ? 'disabled' : ''}>${busy ? E(tr('Saqlanmoqda…')) : '💾 ' + E(tr('Saqlash'))}${dirty ? ' •' : ''}</button></div>
        <p class="muted">${E(tr('Stollarni va zal elementlarini barmoq yoki sichqoncha bilan suring. Stolni bosib shakli, sig‘imi, zonasi va qulayliklarini belgilang.'))}</p>
        ${d.floors > 1 ? `<div class="floor-tabs">${Array.from({ length: d.floors }, (_, i) => `<button type="button" data-ed-floor="${i + 1}" aria-pressed="${floor === i + 1}">${i + 1}-${E(tr('qavat'))}</button>`).join('')}</div>` : ''}
        <div class="hp-palette">${Object.entries(SCENE).map(([k, [i, n]]) => `<button type="button" data-add="${k}">${i} ${E(tr(n))}</button>`).join('')}</div>
        <div class="hp-ed-grid"><div class="hp2d-stage"><div class="hp2d-tools"><button type="button" data-zoom="in">+</button><button type="button" data-zoom="out">−</button><button type="button" data-zoom="fit">⤢</button></div><svg class="hp2d-svg hp-edit" viewBox="0 0 ${W} ${H}">${defs}${floorRect(H)}${drawScene(items, H)}${drawTables(d, list.map((tb) => ({ ...tb })), H, { selectedId: st?.id, statusOf: () => ({ state: 'free' }) }).replace(/data-tid/g, 'data-edit-tid data-tid')}</svg></div>
        <div class="hp-ed-side">${st ? tableForm(st) : si ? `<h3>${SCENE[si.type][0]} ${E(tr(SCENE[si.type][1]))}</h3><p class="muted">${E(tr('Rejada surib joylashtiring.'))}</p><button type="button" class="quiet danger" data-del-item>🗑 ${E(tr('Olib tashlash'))}</button>` : `<p class="muted">${E(tr('Stol yoki elementni tanlang.'))}</p><p class="muted">${list.length} ${E(tr('ta stol'))} · ${items.length} ${E(tr('ta element'))}</p>`}</div></div></div>`;
      const svg = host.querySelector('svg');
      z = zoomable(svg, H, () => !!dragging);
      z.restore(view);
      host.querySelectorAll('[data-zoom]').forEach((b) => (b.onclick = () => (b.dataset.zoom === 'fit' ? z.fit() : z.zoom(b.dataset.zoom === 'in' ? 1.4 : 1 / 1.4), (view = { ...z.view }))));
      host.querySelector('[data-back]').onclick = () => {
        if (dirty && !confirm(tr('Saqlanmagan o‘zgarishlar bekor qilinadi. Davom etasizmi?'))) return;
        lock(false);
        o.onBack?.();
      };
      host.querySelector('[data-save]').onclick = save;
      host.querySelector('[data-ed-full]').onclick = () => {
        full = !full;
        view = null;
        draw();
      };
      host.querySelectorAll('[data-ed-floor]').forEach((b) => (b.onclick = () => ((floor = Number(b.dataset.edFloor)), (sel = null), draw())));
      host.querySelectorAll('[data-add]').forEach(
        (b) =>
          (b.onclick = () => {
            if (scene.length >= 40) return toast(tr('Zal elementlari 40 tadan oshmasin.'));
            const id = 's' + Date.now().toString(36);
            scene.push({ id, type: b.dataset.add, floor, x: 50, y: b.dataset.add === 'entrance' ? 95 : b.dataset.add === 'window' ? 5 : 50 });
            sel = { t: 'item', id };
            dirty = true;
            draw();
          }),
      );
      host.querySelector('[data-del-item]')?.addEventListener('click', () => {
        scene = scene.filter((s) => s.id !== sel.id);
        sel = null;
        dirty = true;
        draw();
      });
      if (st) bindForm(st);
      // Drag & drop: tables and ambience items follow the finger; a short tap selects.
      svg.addEventListener('pointerdown', (e) => {
        const g = e.target.closest?.('[data-tid],[data-sid]');
        if (!g) return;
        e.preventDefault();
        const obj = g.dataset.tid ? tables.find((x) => x.id === g.dataset.tid) : scene.find((x) => x.id === g.dataset.sid);
        if (!obj) return;
        dragging = { g, obj, start: z.toSvg(e), x: obj.x, y: obj.y, moved: false, kind: g.dataset.tid ? 'table' : 'item' };
        svg.setPointerCapture?.(e.pointerId);
      });
      svg.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const p = z.toSvg(e),
          dx = ((p.x - dragging.start.x) / W) * 100,
          dy = ((p.y - dragging.start.y) / H) * 100;
        if (Math.abs(dx) + Math.abs(dy) > 0.6) dragging.moved = true;
        if (!dragging.moved) return;
        const lo = dragging.kind === 'table' ? 4 : 2,
          hi = dragging.kind === 'table' ? 96 : 98;
        dragging.obj.x = Math.round(Math.max(lo, Math.min(hi, dragging.x + dx)));
        dragging.obj.y = Math.round(Math.max(lo, Math.min(hi, dragging.y + dy)));
        dragging.g.setAttribute('transform', `translate(${(dragging.obj.x / 100) * W} ${(dragging.obj.y / 100) * H})`);
      });
      const end = () => {
        if (!dragging) return;
        const { obj, moved, kind } = dragging;
        dragging = null;
        view = { ...z.view };
        if (moved) dirty = true;
        sel = { t: kind, id: obj.id };
        draw();
      };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
    };
    const tableForm = (tb) => `<form class="form hp-ed-form" data-ed-form><h3>${E(tb.number)}-${E(tr('stol'))}</h3><label>${E(tr('SIG‘IMI (KISHI)'))}<input name="seats" type="number" min="1" max="30" value="${E(tb.seats)}"></label><label>${E(tr('STOL SHAKLI'))}<select name="kind">${Object.entries(KIND_NAME).map(([k, n]) => `<option value="${k}" ${tb.kind === k ? 'selected' : ''}>${E(tr(n))}</option>`).join('')}</select></label><label>${E(tr('JOYLASHUV'))}<select name="zone">${Object.entries(ZONE_NAME).map(([k, n]) => `<option value="${k}" ${tb.zone === k ? 'selected' : ''}>${E(tr(n))}</option>`).join('')}</select></label><fieldset class="hp-ed-tags"><legend>${E(tr('Qulayliklar'))}</legend>${Object.entries(TAGS).map(([k, n]) => `<label class="check"><input type="checkbox" name="tag" value="${k}" ${(tb.tags || []).includes(k) ? 'checked' : ''}> ${E(tr(n))}</label>`).join('')}</fieldset><p class="muted">${E(tr('Rasm va tavsifni “Rasm va tavsif” bo‘limida qo‘shasiz.'))}</p></form>`;
    const bindForm = (tb) => {
      const f = host.querySelector('[data-ed-form]');
      f.onchange = () => {
        tb.seats = Math.max(1, Math.min(30, Number(f.elements.seats.value) || tb.seats));
        tb.kind = f.elements.kind.value;
        tb.zone = f.elements.zone.value;
        tb.tags = [...f.querySelectorAll('[name=tag]:checked')].map((c) => c.value);
        dirty = true;
        draw();
      };
      f.onsubmit = (e) => e.preventDefault();
    };
    const save = async () => {
      if (busy) return;
      busy = true;
      draw();
      try {
        await call('/api/tables', 'POST', { action: 'arrange', restaurantId: o.restaurantId, tables: tables.map((tb) => ({ id: tb.id, x: tb.x, y: tb.y, seats: Number(tb.seats), kind: tb.kind, zone: tb.zone, tags: tb.tags || [] })), scene });
        dirty = false;
        toast('✅ ' + tr('Zal xaritasi saqlandi.'));
        o.onSaved?.();
      } catch (e) {
        toast(e.message);
      } finally {
        busy = false;
        if (host.querySelector('.hp-editor')) draw();
      }
    };
    draw();
    host.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  // ---------- 3D hall: offer (owner), switch (admin), requests (admin) ----------
  const PKG_ORDER = ['small', 'standard', 'premium'];
  function offerHtml(packages, lead, restaurants) {
    return `<div class="hall3d-offer"><p class="eyebrow">✨ VIP</p><h3>✨ ${E(tr('Restoraningiz uchun Maxsus 3D Zal Xaritasini Yaratib Beramiz!'))}</h3><p>${E(tr('Mijozlar restoraningiz ichini 3D ko‘rinishda aylanib stol tanlasa, bronlar soni 45% ga oshadi. Mutaxassislarimiz zalingizni o‘lchab, maxsus 3D modelini yaratib tizimga ulab berishadi.'))}</p>
      ${lead ? `<p class="hall3d-sent">✅ ${E(tr('Arizangiz qabul qilindi — mutaxassisimiz siz bilan bog‘lanadi.'))} (${E(tr(packages[lead.package]?.label || ''))})</p>` : `<form class="hall3d-form" data-hall3d-form>${restaurants && restaurants.length > 1 ? `<label>${E(tr('RESTORAN'))}<select name="restaurantId">${restaurants.map((r) => `<option value="${E(r.id)}">${E(r.name)}</option>`).join('')}</select></label>` : ''}<div class="hall3d-packages" role="radiogroup">${PKG_ORDER.map((k, i) => `<label class="hall3d-pkg"><input type="radio" name="package" value="${k}" ${i === 1 ? 'checked' : ''}><span><b>${E(tr(packages[k].label))}</b><strong>${sum(packages[k].price)}</strong><small>${E(tr('bir martalik'))}</small></span></label>`).join('')}</div><label>${E(tr('TELEFON (IXTIYORIY)'))}<input name="phone" type="tel" placeholder="+998901234567" pattern="\\+998[0-9]{9}"></label><label>${E(tr('IZOH (IXTIYORIY)'))}<input name="note" maxlength="500" placeholder="${E(tr('Zal maydoni, qavatlar soni, qulay vaqt…'))}"></label><button type="submit" class="hall3d-cta">🚀 ${E(tr('3D Zal uchun ariza qoldirish'))}</button></form>`}</div>`;
  }
  function bindOffer(host, restaurantId, packages) {
    const f = host.querySelector('[data-hall3d-form]');
    if (!f) return;
    f.onsubmit = async (e) => {
      e.preventDefault();
      const b = f.querySelector('button[type=submit]');
      b.disabled = true;
      try {
        const res = await call('/api/hall3d', 'POST', { action: 'lead', restaurantId: f.elements.restaurantId?.value || restaurantId, package: f.elements.package.value, phone: f.elements.phone.value.trim(), note: f.elements.note.value.trim() });
        toast('✅ ' + tr('Arizangiz qabul qilindi — mutaxassisimiz siz bilan bog‘lanadi.'));
        host.innerHTML = offerHtml(packages, res.lead);
      } catch (err) {
        toast(err.message);
        b.disabled = false;
      }
    };
  }
  async function hall3dPanel(host, r, user) {
    if (!host || !r || r.is_demo || String(r.id).startsWith('rf-demo-')) return host && (host.hidden = true);
    let s;
    try {
      s = await call('/api/hall3d?restaurantId=' + encodeURIComponent(r.id));
    } catch {
      host.hidden = true;
      return;
    }
    host.hidden = false;
    if (user?.role === 'admin') {
      host.innerHTML = `<h3>🧊 ${E(tr('3D Zal (VIP xizmat)'))}</h3>${s.lead ? `<p class="notice">📩 ${E(tr('Ochiq ariza'))}: ${E(tr(s.packages[s.lead.package]?.label || ''))} · ${sum(s.lead.price)} · ${E(s.lead.phone || '—')}${s.lead.note ? ' · ' + E(s.lead.note) : ''}</p>` : ''}<form class="form hall3d-admin" data-hall3d-admin><label class="switch-row"><input type="checkbox" name="enabled" ${s.hall3d.enabled ? 'checked' : ''}><span class="hall3d-switch" data-on="🟢 ${E(tr('3D Zal Yoqilgan'))}" data-off="⚪ ${E(tr('2D Standart Sxema'))}"></span></label><label>${E(tr('3D MODEL / KONFIGURATSIYA (https havola yoki izoh)'))}<textarea name="config" maxlength="2000" rows="3" placeholder="https://…/hall.glb">${E(s.hall3d.config || '')}</textarea></label><button class="primary" type="submit">${E(tr('Saqlash'))}</button></form>`;
      const f = host.querySelector('[data-hall3d-admin]');
      f.onsubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await call('/api/hall3d', 'POST', { action: 'set', restaurantId: r.id, enabled: f.elements.enabled.checked, config: f.elements.config.value });
          toast(res.hall3d.enabled ? '🟢 ' + tr('3D Zal Yoqilgan') : '⚪ ' + tr('2D Standart Sxema'));
        } catch (err) {
          toast(err.message);
        }
      };
      return;
    }
    if (s.hall3d.enabled) {
      host.innerHTML = `<p class="hall3d-on">✨ ${E(tr('3D zal ulangan — mijozlar zalingizni 3D ko‘rinishda ko‘rib stol tanlamoqda.'))}</p>`;
      return;
    }
    host.innerHTML = offerHtml(s.packages, s.lead);
    bindOffer(host, r.id, s.packages);
  }
  async function upsell(host, restaurants) {
    if (!host) return;
    host.hidden = true;
    const own = (restaurants || []).filter((r) => !r.is_demo && !String(r.id).startsWith('rf-demo-') && r.status !== 'deleted');
    if (!own.length) return;
    let s;
    try {
      s = await call('/api/hall3d?restaurantId=' + encodeURIComponent(own[0].id));
    } catch {
      return;
    }
    if (own.length === 1 && s.hall3d.enabled) return;
    host.hidden = false;
    host.innerHTML = offerHtml(s.packages, own.length === 1 ? s.lead : null, own);
    bindOffer(host, own[0].id, s.packages);
  }
  async function leads(host) {
    if (!host) return;
    let s;
    try {
      s = await call('/api/hall3d');
    } catch (e) {
      host.innerHTML = `<h3>🧊 ${E(tr('3D zal arizalari'))}</h3><p class="form-message">${E(e.message)}</p>`;
      return;
    }
    const draw = () => {
      host.innerHTML = `<h3>🧊 ${E(tr('3D zal arizalari'))}</h3>${s.leads.length ? `<ul class="hall3d-leads">${s.leads.map((l) => `<li class="${l.status}"><div><b>${E(l.restaurantName)}</b> · ${E(tr(s.packages[l.package]?.label || l.package))} · <strong>${sum(l.price)}</strong><br><small>${E(new Date(l.createdAt).toLocaleString())} · 📱 ${E(l.phone || '—')}${l.note ? ' · 📝 ' + E(l.note) : ''}</small></div><button type="button" class="quiet" data-mark="${E(l.id)}" data-status="${l.status === 'new' ? 'done' : 'new'}">${l.status === 'new' ? '✅ ' + E(tr('Bajarildi')) : '↩ ' + E(tr('Qayta ochish'))}</button></li>`).join('')}</ul><p class="muted">${E(tr('3D zalni yoqish: Restoranlarni boshqarish → restoran → “3D Zal (VIP xizmat)”.'))}</p>` : `<p class="muted">${E(tr('Hozircha ariza yo‘q.'))}</p>`}`;
      host.querySelectorAll('[data-mark]').forEach(
        (b) =>
          (b.onclick = async () => {
            try {
              const res = await call('/api/hall3d', 'POST', { action: 'mark', id: b.dataset.mark, status: b.dataset.status });
              s.leads = s.leads.map((l) => (l.id === res.lead.id ? res.lead : l));
              draw();
            } catch (e) {
              toast(e.message);
            }
          }),
      );
    };
    draw();
  }

  window.RFHallPlan = { render, editor, hall3dPanel, upsell, leads, capacity, kindOf, metaOf, exitFull, card: preview, isFull: () => !!fullHost || !!document.querySelector('.hp-full') };
})();
