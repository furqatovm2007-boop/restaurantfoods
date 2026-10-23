/*
 * Smart Vision camera page: the device camera (getUserMedia) is shown with table zones drawn on
 * a canvas. coco-ssd (TensorFlow.js, on the device) finds people and each person is given to at
 * most one table — the zone under their lower body. A table is
 *   Band (red)          someone sits there: the person is still and has a seated shape, 3 s;
 *   Tozalanmoqda (yellow) only standing / moving people there (a waiter serving or cleaning), 1.5 s;
 *   Bo‘sh (green)        nobody there for 3 s.
 * Only these statuses are sent (on change, plus a heartbeat each minute so they do not expire).
 * Zones are dragged to move and resized from the corner handle; they are saved per restaurant
 * in this browser.
 *   RFSmartVision.mount(host, { restaurantId, tables, lang, loadDetector, send }) → { destroy }
 */
(() => {
  'use strict';
  const HOLD_MS = { occupied: 3000, cleaning: 1500, free: 3000 };
  const HEARTBEAT_MS = 60000, DETECT_EVERY_MS = 250, HANDLE = 18;
  // A person whose centre moved more than this (fraction of the frame) in the last 1.5 s is walking.
  const MOVE_WINDOW_MS = 1500, MOVE_LIMIT = 0.05;
  // Height/width (in pixels) under this looks seated; a standing adult is usually 2.2 or more.
  const SEATED_RATIO = 2.0;
  const COLOR = { free: '#22c55e', occupied: '#ef4444', cleaning: '#facc15' };
  const COPY = {
    uz: { start: 'Kamerani ulash', stop: 'To‘xtatish', add: 'Zona qo‘shish', reset: 'Qayta joylash', table: 'Stol', free: 'Bo‘sh', occupied: 'Band', cleaning: 'Tozalanmoqda', loading: 'AI model yuklanmoqda (bir marta, ~20 MB)…', ready: 'AI ishlayapti', denied: 'Kameraga ruxsat berilmadi. Brauzer sozlamalarida ruxsat bering.', nocam: 'Bu qurilmada kamera topilmadi yoki brauzer qo‘llamaydi.', seated: 'O‘tirgan', standing: 'Turgan', test: 'Sinov rejimi: holat bazaga yuborilmaydi.', sent: 'saqlandi', fail: 'Yuborib bo‘lmadi', hint: 'Zonani suring, o‘ng pastki burchagidan kattalashtiring. Qizil — mijoz o‘tiribdi, sariq — ofitsiant/tozalash, yashil — bo‘sh.', remove: 'Zonani o‘chirish', since: 'dan beri', off: 'Kamera o‘chiq' },
    ru: { start: 'Подключить камеру', stop: 'Остановить', add: 'Добавить зону', reset: 'Расставить заново', table: 'Стол', free: 'Свободен', occupied: 'Занят', cleaning: 'Уборка', loading: 'Загружается AI-модель (один раз, ~20 МБ)…', ready: 'AI работает', denied: 'Нет доступа к камере. Разрешите его в настройках браузера.', nocam: 'Камера не найдена или браузер её не поддерживает.', seated: 'Сидит', standing: 'Стоит', test: 'Тестовый режим: статусы не отправляются в базу.', sent: 'сохранено', fail: 'Не удалось отправить', hint: 'Перетаскивайте зону, размер — за правый нижний угол. Красный — гость сидит, жёлтый — официант/уборка, зелёный — свободен.', remove: 'Удалить зону', since: 'с', off: 'Камера выключена' },
    en: { start: 'Connect camera', stop: 'Stop', add: 'Add zone', reset: 'Reset zones', table: 'Table', free: 'Free', occupied: 'Occupied', cleaning: 'Cleaning', loading: 'Loading the AI model (once, ~20 MB)…', ready: 'AI running', denied: 'Camera access was denied. Allow it in the browser settings.', nocam: 'No camera found or the browser does not support it.', seated: 'Seated', standing: 'Standing', test: 'Test mode: statuses are not saved.', sent: 'saved', fail: 'Could not save', hint: 'Drag a zone; resize from its bottom-right corner. Red — guest seated, yellow — staff/cleaning, green — free.', remove: 'Remove zone', since: 'since', off: 'Camera off' },
  };

  const store = {
    get(k) {
      try {
        return JSON.parse(localStorage.getItem(k) || 'null');
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {
        /* private mode */
      }
    },
  };
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /** Zones are fractions of the frame, so they survive resolution and window changes. */
  const defaults = (tables) => tables.slice(0, 3).map((n, i) => ({ table: n, x: 0.05 + i * 0.32, y: 0.4, w: 0.27, h: 0.45 }));

  const inside = (z, x, y) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
  /** Share of the person's box that lies in the zone. */
  function cover(z, b) {
    const ix = Math.max(0, Math.min(z.x + z.w, b.x + b.w) - Math.max(z.x, b.x));
    const iy = Math.max(0, Math.min(z.y + z.h, b.y + b.h) - Math.max(z.y, b.y));
    return (ix * iy) / Math.max(1e-6, b.w * b.h);
  }
  /**
   * The one zone a person belongs to: the zone under their lower body (where a seated person
   * meets the chair), otherwise the zone holding most of their box if that is at least 35 %.
   */
  function zoneOf(zones, b) {
    const ax = b.x + b.w / 2, ay = b.y + b.h * 0.75;
    let best = -1, score = 0;
    zones.forEach((z, i) => {
      const s = inside(z, ax, ay) ? 2 + cover(z, b) : cover(z, b) >= 0.35 ? cover(z, b) : 0;
      if (s > score) (score = s), (best = i);
    });
    return best;
  }
  /** Seated: still, and not tall-and-narrow like a standing adult (ratio in screen pixels). */
  const seated = (p, aspect) => !p.moving && (p.h / p.w) * aspect < SEATED_RATIO;
  /** What the camera sees at a table this instant. */
  function rawStatus(people, zones, zoneIndexes, aspect) {
    const here = people.filter((p) => zoneIndexes.includes(p.zone));
    if (here.some((p) => seated(p, aspect))) return 'occupied';
    return here.length ? 'cleaning' : 'free';
  }

  function mount(host, opts) {
    const w = COPY[opts.lang] || COPY.uz;
    const key = 'rf-vision-zones:' + (opts.restaurantId || 'test');
    let zones = (store.get(key) || []).filter((z) => opts.tables.includes(z.table));
    if (!zones.length) zones = defaults(opts.tables);
    // Per table: shown status, since when, and the status it is waiting to switch to.
    const state = new Map();
    let stream = null, detector = null, people = [], tracks = [], running = false, lastDetect = 0, lastBeat = 0, frame = 0, drag = null, alive = true;

    host.innerHTML =
      '<div class="sv-bar"><button type="button" class="primary sv-start" data-sv="start"></button><button type="button" class="quiet" data-sv="add"></button><button type="button" class="quiet" data-sv="reset"></button><span class="sv-status" role="status"><i></i><span></span></span></div>' +
      '<p class="muted sv-hint"></p><div class="sv-stage"><video playsinline muted></video><canvas></canvas><div class="sv-legend"></div></div><div class="sv-tables"></div>';
    const $ = (s) => host.querySelector(s);
    const video = $('video'), canvas = $('canvas'), ctx = canvas.getContext('2d'), status = $('.sv-status');
    const label = (btn, icon, text) => (btn.innerHTML = '<span aria-hidden="true">' + icon + '</span> ' + esc(text));
    label($('[data-sv=start]'), '📷', w.start);
    label($('[data-sv=add]'), '＋', w.add);
    label($('[data-sv=reset]'), '↺', w.reset);
    $('.sv-hint').textContent = w.hint + (opts.send ? '' : ' ' + w.test);
    $('.sv-legend').innerHTML = ['free', 'cleaning', 'occupied'].map((s) => '<span><i style="background:' + COLOR[s] + '"></i>' + esc(w[s]) + '</span>').join('');
    const say = (text, tone = 'idle') => {
      status.dataset.tone = tone;
      status.lastChild.textContent = text;
    };
    say(w.off);

    const tableState = (n) => {
      if (!state.has(n)) state.set(n, { status: 'free', since: Date.now(), target: null, pendingFrom: 0, confidence: 0 });
      return state.get(n);
    };
    const save = () => store.set(key, zones);
    const clock = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    function renderList() {
      $('.sv-tables').innerHTML = zones
        .map((z, i) => {
          const s = tableState(z.table);
          return (
            '<div class="sv-card" style="--sv:' + COLOR[s.status] + '"><div class="sv-card-top"><label class="sv-select"><span class="sr-only">' + esc(w.table) + '</span><select data-zone="' + i + '">' +
            opts.tables.map((n) => '<option value="' + n + '"' + (n === z.table ? ' selected' : '') + '>' + esc(w.table) + ' ' + n + '</option>').join('') +
            '</select></label><button type="button" class="sv-remove" data-remove="' + i + '" aria-label="' + esc(w.remove) + '" title="' + esc(w.remove) + '">✕</button></div>' +
            '<div class="sv-card-state"><i></i><b>' + esc(w[s.status]) + '</b><small>' + (opts.lang === 'uz' ? clock(s.since) + ' ' + w.since : w.since + ' ' + clock(s.since)) + '</small></div></div>'
          );
        })
        .join('');
      host.querySelectorAll('[data-zone]').forEach((el) => (el.onchange = () => ((zones[+el.dataset.zone].table = Number(el.value)), save(), renderList())));
      host.querySelectorAll('[data-remove]').forEach((el) => (el.onclick = () => (zones.splice(+el.dataset.remove, 1), save(), renderList())));
    }

    async function send(force) {
      if (!opts.send) return;
      const rows = [...new Set(zones.map((z) => z.table))].map((n) => {
        const s = tableState(n);
        return { number: n, status: s.status, confidence: Number((s.confidence || 0.6).toFixed(2)) };
      });
      if (!rows.length) return;
      lastBeat = Date.now();
      try {
        await opts.send(rows);
        if (force) say(w.ready + ' · ' + w.sent + ' ' + clock(Date.now()), 'ok');
      } catch (e) {
        say(w.fail + ': ' + (e && e.message ? e.message : ''), 'error');
      }
    }

    // Follows each person between detections so standing still can be told from walking.
    function track(found, now) {
      const next = [];
      for (const p of found) {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        let best = null, dist = 0.12;
        for (const t of tracks) {
          const d = Math.hypot(t.cx - cx, t.cy - cy);
          if (d < dist && !next.includes(t)) (best = t), (dist = d);
        }
        const t = best || { hist: [] };
        t.cx = cx;
        t.cy = cy;
        t.hist = t.hist.filter((h) => now - h.t <= MOVE_WINDOW_MS).concat({ t: now, cx, cy });
        next.push(t);
        p.moving = t.hist.some((h) => Math.hypot(h.cx - cx, h.cy - cy) > MOVE_LIMIT);
      }
      tracks = next;
      return found;
    }

    // Hold rule: a table changes only after the camera has seen the new state for its hold time.
    function decide(now) {
      const aspect = (video.videoHeight || 9) / (video.videoWidth || 16);
      for (const p of people) p.zone = zoneOf(zones, p);
      let changed = false;
      for (const n of new Set(zones.map((z) => z.table))) {
        const idx = zones.map((z, i) => (z.table === n ? i : -1)).filter((i) => i >= 0);
        const seen = rawStatus(people, zones, idx, aspect), s = tableState(n);
        if (seen === s.status) (s.target = null), (s.pendingFrom = 0);
        else if (s.target !== seen) (s.target = seen), (s.pendingFrom = now);
        else if (now - s.pendingFrom >= HOLD_MS[seen]) {
          s.status = seen;
          s.since = Date.now();
          s.target = null;
          s.pendingFrom = 0;
          const here = people.filter((p) => idx.includes(p.zone));
          s.confidence = here.length ? Math.max(...here.map((p) => p.score)) : 0.7;
          changed = true;
        }
      }
      if (changed) (renderList(), send(true));
      else if (running && now - lastBeat > HEARTBEAT_MS) send(false);
    }

    function draw(now) {
      const W = canvas.width, H = canvas.height, aspect = H / W;
      ctx.clearRect(0, 0, W, H);
      ctx.font = '600 16px system-ui, sans-serif';
      for (const p of people) {
        const sit = seated(p, aspect);
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = sit ? '#fca5a5' : '#fde68a';
        ctx.strokeRect(p.x * W, p.y * H, p.w * W, p.h * H);
        ctx.setLineDash([]);
        const text = (sit ? w.seated : w.standing) + ' ' + Math.round(p.score * 100) + '%';
        const tw = ctx.measureText(text).width + 12, tx = p.x * W, ty = Math.max(0, p.y * H - 24);
        ctx.fillStyle = 'rgba(8,21,33,.8)';
        ctx.fillRect(tx, ty, tw, 22);
        ctx.fillStyle = sit ? '#fca5a5' : '#fde68a';
        ctx.fillText(text, tx + 6, ty + 16);
      }
      for (const z of zones) {
        const s = tableState(z.table), x = z.x * W, y = z.y * H, zw = z.w * W, zh = z.h * H, color = COLOR[s.status];
        ctx.fillStyle = color + '26';
        ctx.fillRect(x, y, zw, zh);
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, zw, zh);
        // Pending switch: a bar in the coming colour fills over the hold time.
        if (s.target) {
          ctx.fillStyle = COLOR[s.target];
          ctx.fillRect(x, y + zh - 7, zw * Math.min(1, (now - s.pendingFrom) / HOLD_MS[s.target]), 7);
        }
        const text = w.table + ' ' + z.table + ' · ' + w[s.status], tw = ctx.measureText(text).width + 16;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, Math.min(zw, tw), 26);
        ctx.fillStyle = s.status === 'cleaning' ? '#1f2937' : '#fff';
        ctx.fillText(text, x + 8, y + 18);
        ctx.fillStyle = color;
        ctx.fillRect(x + zw - HANDLE, y + zh - HANDLE, HANDLE, HANDLE);
      }
    }

    async function loop(now) {
      frame = 0;
      if (!alive) return;
      if (!host.isConnected) return destroy();
      if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      if (running && detector && now - lastDetect >= DETECT_EVERY_MS && video.readyState >= 2) {
        lastDetect = now;
        try {
          const W = video.videoWidth, H = video.videoHeight;
          people = track((await detector.detect(video)).map((p) => ({ x: p.bbox[0] / W, y: p.bbox[1] / H, w: p.bbox[2] / W, h: p.bbox[3] / H, score: p.score })), performance.now());
        } catch {
          people = [];
        }
        decide(performance.now());
      }
      draw(performance.now());
      frame = requestAnimationFrame(loop);
    }

    async function start() {
      const btn = $('[data-sv=start]');
      if (running) return stop();
      if (!navigator.mediaDevices?.getUserMedia) return say(w.nocam, 'error');
      btn.disabled = true;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }, audio: false });
      } catch (e) {
        btn.disabled = false;
        return say(e && e.name === 'NotAllowedError' ? w.denied : w.nocam, 'error');
      }
      video.srcObject = stream;
      await video.play().catch(() => {});
      running = true;
      label(btn, '⏹', w.stop);
      btn.classList.add('is-live');
      btn.disabled = false;
      if (!detector) {
        say(w.loading, 'busy');
        try {
          detector = await opts.loadDetector();
        } catch (e) {
          return say((e && e.message) || 'AI', 'error');
        }
      }
      say(w.ready + ' (' + detector.backend + ')', 'ok');
      send(false);
    }

    function stop() {
      running = false;
      people = [];
      tracks = [];
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
      const btn = $('[data-sv=start]');
      label(btn, '📷', w.start);
      btn.classList.remove('is-live');
      say(w.off);
    }

    // Dragging zones: inside moves, the corner square resizes.
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, r };
    };
    canvas.addEventListener('pointerdown', (e) => {
      const p = point(e), hx = HANDLE / p.r.width, hy = HANDLE / p.r.height;
      for (let i = zones.length - 1; i >= 0; i--) {
        const z = zones[i];
        const corner = p.x >= z.x + z.w - hx * 2 && p.x <= z.x + z.w + hx && p.y >= z.y + z.h - hy * 2 && p.y <= z.y + z.h + hy;
        if (corner || inside(z, p.x, p.y)) {
          drag = { i, mode: corner ? 'size' : 'move', dx: p.x - z.x, dy: p.y - z.y };
          canvas.setPointerCapture(e.pointerId);
          e.preventDefault();
          return;
        }
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const p = point(e), z = zones[drag.i];
      if (drag.mode === 'move') {
        z.x = Math.min(1 - z.w, Math.max(0, p.x - drag.dx));
        z.y = Math.min(1 - z.h, Math.max(0, p.y - drag.dy));
      } else {
        z.w = Math.min(1 - z.x, Math.max(0.06, p.x - z.x));
        z.h = Math.min(1 - z.y, Math.max(0.06, p.y - z.y));
      }
    });
    const drop = () => {
      if (drag) (save(), (drag = null));
    };
    canvas.addEventListener('pointerup', drop);
    canvas.addEventListener('pointercancel', drop);

    $('[data-sv=start]').onclick = start;
    $('[data-sv=add]').onclick = () => {
      const used = new Set(zones.map((z) => z.table)), n = opts.tables.find((t) => !used.has(t)) ?? opts.tables[0];
      if (n === undefined) return;
      zones.push({ table: n, x: 0.35, y: 0.3, w: 0.25, h: 0.35 });
      save();
      renderList();
    };
    $('[data-sv=reset]').onclick = () => ((zones = defaults(opts.tables)), save(), renderList());

    canvas.width = 1280;
    canvas.height = 720;
    renderList();
    frame = requestAnimationFrame(loop);

    function destroy() {
      alive = false;
      cancelAnimationFrame(frame);
      stop();
    }
    return { destroy };
  }

  window.RFSmartVision = { mount, zoneOf, seated, rawStatus };
})();
