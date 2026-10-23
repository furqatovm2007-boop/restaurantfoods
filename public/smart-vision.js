/*
 * Smart Vision camera page: the device camera (getUserMedia) is shown with table zones drawn on
 * a canvas. coco-ssd (TensorFlow.js, on the device) finds people; when a person overlaps a zone
 * for 3 seconds the table turns "Band", and 3 seconds after they leave it turns "Bo‘sh" again.
 * Only those statuses are sent (on change, plus a heartbeat each minute so they do not expire).
 * Zones are dragged to move and resized from the corner handle; they are saved per restaurant
 * in this browser.
 *   RFSmartVision.mount(host, { restaurantId, tables, lang, loadDetector, send }) → { destroy }
 */
(() => {
  'use strict';
  const HOLD_MS = 3000, HEARTBEAT_MS = 60000, DETECT_EVERY_MS = 250, HANDLE = 18;
  const COPY = {
    uz: { start: 'Kamerani ulash', stop: 'To‘xtatish', add: '+ Zona qo‘shish', reset: 'Zonalarni qayta joylash', table: 'Stol', free: 'Bo‘sh', busy: 'Band', loading: 'AI model yuklanmoqda (bir marta, ~20 MB)…', ready: 'AI ishlayapti', denied: 'Kameraga ruxsat berilmadi. Brauzer sozlamalarida ruxsat bering.', nocam: 'Bu qurilmada kamera topilmadi yoki brauzer qo‘llamaydi.', people: 'Odam', test: 'Sinov rejimi: holat bazaga yuborilmaydi.', sent: 'Bazaga yuborildi', fail: 'Yuborib bo‘lmadi', hint: 'Zonani sichqoncha yoki barmoq bilan suring, o‘ng pastki burchagidan kattalashtiring.', remove: 'O‘chirish', camera: 'Kamera' },
    ru: { start: 'Подключить камеру', stop: 'Остановить', add: '+ Добавить зону', reset: 'Расставить зоны заново', table: 'Стол', free: 'Свободен', busy: 'Занят', loading: 'Загружается AI-модель (один раз, ~20 МБ)…', ready: 'AI работает', denied: 'Нет доступа к камере. Разрешите его в настройках браузера.', nocam: 'Камера не найдена или браузер её не поддерживает.', people: 'Человек', test: 'Тестовый режим: статусы не отправляются в базу.', sent: 'Отправлено в базу', fail: 'Не удалось отправить', hint: 'Перетаскивайте зону мышью или пальцем, размер — за правый нижний угол.', remove: 'Удалить', camera: 'Камера' },
    en: { start: 'Connect camera', stop: 'Stop', add: '+ Add zone', reset: 'Reset zones', table: 'Table', free: 'Free', busy: 'Occupied', loading: 'Loading the AI model (once, ~20 MB)…', ready: 'AI running', denied: 'Camera access was denied. Allow it in the browser settings.', nocam: 'No camera found or the browser does not support it.', people: 'Person', test: 'Test mode: statuses are not saved.', sent: 'Saved', fail: 'Could not save', hint: 'Drag a zone with the mouse or a finger; resize from its bottom-right corner.', remove: 'Remove', camera: 'Camera' },
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

  /** Zones are fractions of the frame, so they survive resolution and window changes. */
  const defaults = (tables) => tables.slice(0, 3).map((n, i) => ({ table: n, x: 0.05 + i * 0.32, y: 0.4, w: 0.27, h: 0.45 }));

  /** A person counts at a table when their box overlaps the zone by a fifth of the smaller box, or their centre is inside. */
  function overlaps(zone, box) {
    const ix = Math.max(0, Math.min(zone.x + zone.w, box.x + box.w) - Math.max(zone.x, box.x));
    const iy = Math.max(0, Math.min(zone.y + zone.h, box.y + box.h) - Math.max(zone.y, box.y));
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    return (ix * iy) / Math.min(zone.w * zone.h, box.w * box.h) >= 0.2 || (cx > zone.x && cx < zone.x + zone.w && cy > zone.y && cy < zone.y + zone.h);
  }

  function mount(host, opts) {
    const w = COPY[opts.lang] || COPY.uz;
    const key = 'rf-vision-zones:' + (opts.restaurantId || 'test');
    let zones = (store.get(key) || []).filter((z) => opts.tables.includes(z.table));
    if (!zones.length) zones = defaults(opts.tables);
    // Per table: shown status, and since when the camera has seen the opposite.
    const state = new Map();
    let stream = null, detector = null, people = [], running = false, lastDetect = 0, lastBeat = 0, frame = 0, drag = null, alive = true;

    host.innerHTML =
      '<div class="sv-bar"><button type="button" class="primary" data-sv="start"></button><button type="button" class="quiet" data-sv="add"></button><button type="button" class="quiet" data-sv="reset"></button><span class="sv-status" role="status"></span></div>' +
      '<p class="muted sv-hint"></p><div class="sv-stage"><video playsinline muted></video><canvas></canvas></div><div class="sv-tables"></div>';
    const $ = (s) => host.querySelector(s);
    const video = $('video'), canvas = $('canvas'), ctx = canvas.getContext('2d'), status = $('.sv-status');
    $('[data-sv=start]').textContent = w.start;
    $('[data-sv=add]').textContent = w.add;
    $('[data-sv=reset]').textContent = w.reset;
    $('.sv-hint').textContent = w.hint + (opts.send ? '' : ' ' + w.test);
    const say = (text) => (status.textContent = text);

    const tableState = (n) => {
      if (!state.has(n)) state.set(n, { busy: false, since: 0, confidence: 0 });
      return state.get(n);
    };
    const save = () => store.set(key, zones);

    function renderList() {
      $('.sv-tables').innerHTML = zones
        .map((z, i) => {
          const s = tableState(z.table);
          return '<div class="sv-row ' + (s.busy ? 'is-busy' : 'is-free') + '"><select data-zone="' + i + '">' + opts.tables.map((n) => '<option value="' + n + '"' + (n === z.table ? ' selected' : '') + '>' + w.table + ' ' + n + '</option>').join('') + '</select><b>' + (s.busy ? '🔴 ' + w.busy : '🟢 ' + w.free) + '</b><button type="button" class="quiet" data-remove="' + i + '">' + w.remove + '</button></div>';
        })
        .join('');
      host.querySelectorAll('[data-zone]').forEach((el) => (el.onchange = () => ((zones[+el.dataset.zone].table = Number(el.value)), save(), renderList())));
      host.querySelectorAll('[data-remove]').forEach((el) => (el.onclick = () => (zones.splice(+el.dataset.remove, 1), save(), renderList())));
    }

    async function send(force) {
      if (!opts.send) return;
      const rows = [...new Set(zones.map((z) => z.table))].map((n) => {
        const s = tableState(n);
        return { number: n, status: s.busy ? 'occupied' : 'free', confidence: Number((s.confidence || 0.6).toFixed(2)) };
      });
      if (!rows.length) return;
      lastBeat = Date.now();
      try {
        await opts.send(rows);
        if (force) say(w.ready + ' · ' + w.sent + ' ' + new Date().toLocaleTimeString());
      } catch (e) {
        say(w.fail + ': ' + (e && e.message ? e.message : ''));
      }
    }

    // The 3-second rule: a table flips only after the camera has seen the other state that long.
    function decide(now) {
      let changed = false;
      for (const n of new Set(zones.map((z) => z.table))) {
        const hits = people.filter((p) => zones.some((z) => z.table === n && overlaps(z, p)));
        const seen = hits.length > 0, s = tableState(n);
        if (seen === s.busy) s.since = 0;
        else if (!s.since) s.since = now;
        else if (now - s.since >= HOLD_MS) {
          s.busy = seen;
          s.since = 0;
          s.confidence = seen ? Math.max(...hits.map((p) => p.score)) : 0.7;
          changed = true;
        }
      }
      if (changed) (renderList(), send(true));
      else if (running && now - lastBeat > HEARTBEAT_MS) send(false);
    }

    function draw(now) {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 2;
      ctx.font = '600 15px system-ui, sans-serif';
      for (const p of people) {
        ctx.strokeStyle = '#ffd23f';
        ctx.strokeRect(p.x * W, p.y * H, p.w * W, p.h * H);
        ctx.fillStyle = '#ffd23f';
        ctx.fillText(w.people + ' ' + Math.round(p.score * 100) + '%', p.x * W + 4, Math.max(16, p.y * H - 6));
      }
      for (const z of zones) {
        const s = tableState(z.table), x = z.x * W, y = z.y * H, zw = z.w * W, zh = z.h * H;
        const color = s.busy ? '#ff4d4f' : '#2ecc71';
        ctx.fillStyle = color + '22';
        ctx.fillRect(x, y, zw, zh);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, zw, zh);
        // Pending flip: a bar fills over the 3 seconds.
        if (s.since) {
          ctx.fillStyle = s.busy ? '#2ecc71' : '#ff4d4f';
          ctx.fillRect(x, y + zh - 6, zw * Math.min(1, (now - s.since) / HOLD_MS), 6);
        }
        ctx.fillStyle = color;
        ctx.fillRect(x, y, Math.min(zw, 150), 24);
        ctx.fillStyle = '#fff';
        ctx.fillText(w.table + ' ' + z.table + ' · ' + (s.busy ? w.busy : w.free), x + 6, y + 17);
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
          people = (await detector.detect(video)).map((p) => ({ x: p.bbox[0] / W, y: p.bbox[1] / H, w: p.bbox[2] / W, h: p.bbox[3] / H, score: p.score }));
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
      if (!navigator.mediaDevices?.getUserMedia) return say(w.nocam);
      btn.disabled = true;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }, audio: false });
      } catch (e) {
        btn.disabled = false;
        return say(e && e.name === 'NotAllowedError' ? w.denied : w.nocam);
      }
      video.srcObject = stream;
      await video.play().catch(() => {});
      running = true;
      btn.textContent = w.stop;
      btn.disabled = false;
      if (!detector) {
        say(w.loading);
        try {
          detector = await opts.loadDetector();
        } catch (e) {
          return say((e && e.message) || 'AI');
        }
      }
      say(w.ready + ' (' + detector.backend + ')');
      send(false);
    }

    function stop() {
      running = false;
      people = [];
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
      $('[data-sv=start]').textContent = w.start;
      say(w.camera + ' ⏸');
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
        const corner = p.x >= z.x + z.w - hx * 1.5 && p.x <= z.x + z.w + hx * 0.5 && p.y >= z.y + z.h - hy * 1.5 && p.y <= z.y + z.h + hy * 0.5;
        if (corner || (p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h)) {
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
      if (!running) draw(performance.now());
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

  window.RFSmartVision = { mount, overlaps };
})();
