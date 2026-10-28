/*
 * Smart Vision camera page — several cameras per restaurant.
 *  - A camera is a device on this computer/phone (getUserMedia, found again by deviceId or its
 *    label) or an HTTPS stream (MJPEG picture, MP4/WebM, or HLS where the browser plays it).
 *  - Cameras, their names and table zones are saved in D1 (via opts.store) and in this browser;
 *    when the browser already allows the camera, the page reconnects to all of them by itself.
 *  - coco-ssd (TensorFlow.js, on the device; no frames leave it) checks one camera after another.
 *    Each person counts for one table only — the zone under their lower body. A table is
 *      Band (red)           someone sits there: still, with a seated shape, for 3 s;
 *      Tozalanmoqda (yellow) only standing / moving people there (a waiter), 1.5 s;
 *      Bo‘sh (green)        nobody there for 3 s.
 *    With several cameras on one table the strongest wins (Band > Tozalanmoqda > Bo‘sh).
 *  - Statuses are sent on every change plus a heartbeat each minute so they do not expire.
 *  - AI table finder: coco-ssd also sees "dining table". Over ~10 frames the boxes that keep showing up
 *    become table zones (a bit larger than the table, so the chairs around it count), numbered left to
 *    right, row by row. It runs by itself for a camera without zones and on "🤖 AI: stollarni topish".
 *  - Each zone is a green (Bo‘sh) / red (Band) box "Stol #X: …"; a tap on it shows the table's booking
 *    (who, when, time left) and open bill, from opts.info() which the page refreshes every 2 seconds.
 *   RFSmartVision.mount(host, { restaurantId, tables, lang, loadDetector, send, store, info }) → { destroy }
 */
(() => {
  'use strict';
  const HOLD_MS = { occupied: 3000, cleaning: 1500, free: 3000 };
  const HEARTBEAT_MS = 60000, DETECT_EVERY_MS = 250, HANDLE = 18, SAVE_DELAY_MS = 800;
  const MOVE_WINDOW_MS = 1500, MOVE_LIMIT = 0.05, SEATED_RATIO = 2.0;
  const COLOR = { free: '#10b981', occupied: '#ef4444', cleaning: '#facc15' };
  const SCAN_FRAMES = 10, SCAN_GAP_MS = 220;
  const RANK = { free: 0, cleaning: 1, occupied: 2 };
  const COPY = {
    uz: { start: 'Kameralarni ulash', stop: 'To‘xtatish', addCam: 'Kamera qo‘shish', addZone: 'Zona', table: 'Stol', free: 'Bo‘sh', occupied: 'Band', cleaning: 'Tozalanmoqda', loading: 'AI model yuklanmoqda (bir marta, ~20 MB)…', ready: 'AI ishlayapti', denied: 'Kameraga ruxsat berilmadi. Brauzer sozlamalarida ruxsat bering.', nocam: 'Kamera topilmadi yoki brauzer qo‘llamaydi.', seated: 'O‘tirgan', standing: 'Turgan', test: 'Sinov rejimi: holat bazaga yuborilmaydi, kameralar faqat shu brauzerda saqlanadi.', sent: 'saqlandi', fail: 'Yuborib bo‘lmadi', hint: 'Zonani suring, o‘ng pastki burchagidan kattalashtiring. Qizil — mijoz o‘tiribdi, sariq — ofitsiant/tozalash, yashil — bo‘sh.', remove: 'O‘chirish', since: 'dan beri', off: 'Kameralar o‘chiq', name: 'Nomi', namePh: '1-Kamera: Asosiy zal', type: 'Turi', device: 'Shu qurilma kamerasi', stream: 'IP-kamera oqimi (https)', pick: 'Kamera', url: 'Oqim manzili', urlPh: 'https://…/stream.mjpg yoki .m3u8 / .mp4', save: 'Saqlash', cancel: 'Bekor', allow: 'Kameralar ro‘yxati uchun ruxsat berish', reconnect: 'Saqlangan kameralar avtomatik ulandi', askOnce: '«Kameralarni ulash» ni bosing — brauzer bir marta ruxsat so‘raydi, keyin avtomatik ulanadi.', empty: 'Hali kamera yo‘q. «Kamera qo‘shish» ni bosing.', cors: 'Oqimga ulanib bo‘ldi, lekin u CORS ruxsatisiz — AI tasvirni o‘qiy olmaydi.', streamFail: 'Oqimni ochib bo‘lmadi. MJPEG, MP4 yoki HLS (https) manzil bering; RTSP uchun shlyuz kerak.', other: 'Saqlangan kamera topilmadi — boshqa kamera ishlatildi.', confirmRemove: 'Kamera o‘chirilsinmi?', running: 'ishlayapti', paused: 'to‘xtagan', ai: '🤖 AI: stollarni topish', scanning: 'AI stollarni qidirmoqda…', found: 'AI {n} ta stol topdi va ramka qo‘ydi', noTables: 'AI stol topmadi — kamerani zalga qarating yoki zonani qo‘lda qo‘shing.', needStart: 'Avval kamerani ulang.', tableNo: 'Stol #', bookedBy: 'Bron qilgan', guests: 'Mehmonlar', startsIn: 'Bron boshlanishiga', endsIn: 'Bron tugashiga', left: 'qoldi', minutes: 'daq', hours: 'soat', noBooking: 'Bugun bu stolga bron yo‘q', bill: 'Ochiq hisob', camera: 'Kamera', close: 'Yopish', arrived: 'Mijoz keldi', pending: 'tasdiq kutilmoqda', grid1: '▣ 1x1 (Bitta katta ekran)', grid2: '⊞ 2x2 (4 ta kamera)', grid3: '∷ 3x3 (9 ta kamera)', maximize: 'Katta qilish', back: '⬅️ Barcha kameralarga qaytish (Grid)', prev: 'Oldingi kamera', next: 'Keyingi kamera', layout: 'Ekran rejimi' },
    ru: { start: 'Подключить камеры', stop: 'Остановить', addCam: 'Добавить камеру', addZone: 'Зона', table: 'Стол', free: 'Свободен', occupied: 'Занят', cleaning: 'Уборка', loading: 'Загружается AI-модель (один раз, ~20 МБ)…', ready: 'AI работает', denied: 'Нет доступа к камере. Разрешите его в настройках браузера.', nocam: 'Камера не найдена или браузер её не поддерживает.', seated: 'Сидит', standing: 'Стоит', test: 'Тестовый режим: статусы не отправляются, камеры хранятся только в этом браузере.', sent: 'сохранено', fail: 'Не удалось отправить', hint: 'Перетаскивайте зону, размер — за правый нижний угол. Красный — гость сидит, жёлтый — официант/уборка, зелёный — свободен.', remove: 'Удалить', since: 'с', off: 'Камеры выключены', name: 'Название', namePh: 'Камера 1: Основной зал', type: 'Тип', device: 'Камера этого устройства', stream: 'Поток IP-камеры (https)', pick: 'Камера', url: 'Адрес потока', urlPh: 'https://…/stream.mjpg или .m3u8 / .mp4', save: 'Сохранить', cancel: 'Отмена', allow: 'Разрешить доступ к списку камер', reconnect: 'Сохранённые камеры подключены автоматически', askOnce: 'Нажмите «Подключить камеры» — браузер спросит разрешение один раз, дальше подключение автоматическое.', empty: 'Камер пока нет. Нажмите «Добавить камеру».', cors: 'Поток открыт, но без CORS — AI не может читать изображение.', streamFail: 'Не удалось открыть поток. Укажите MJPEG, MP4 или HLS (https); для RTSP нужен шлюз.', other: 'Сохранённая камера не найдена — использована другая.', confirmRemove: 'Удалить камеру?', running: 'работает', paused: 'остановлена', ai: '🤖 AI: найти столы', scanning: 'AI ищет столы…', found: 'AI нашёл столов: {n} и поставил рамки', noTables: 'AI не нашёл столов — направьте камеру на зал или добавьте зону вручную.', needStart: 'Сначала подключите камеру.', tableNo: 'Стол #', bookedBy: 'Бронь', guests: 'Гостей', startsIn: 'До начала брони', endsIn: 'До конца брони', left: '', minutes: 'мин', hours: 'ч', noBooking: 'На сегодня броней на этот стол нет', bill: 'Открытый счёт', camera: 'Камера', close: 'Закрыть', arrived: 'Гость пришёл', pending: 'ждёт подтверждения', grid1: '▣ 1x1 (один большой экран)', grid2: '⊞ 2x2 (4 камеры)', grid3: '∷ 3x3 (9 камер)', maximize: 'Развернуть', back: '⬅️ Ко всем камерам (сетка)', prev: 'Предыдущая камера', next: 'Следующая камера', layout: 'Режим экрана' },
    en: { start: 'Connect cameras', stop: 'Stop', addCam: 'Add camera', addZone: 'Zone', table: 'Table', free: 'Free', occupied: 'Occupied', cleaning: 'Cleaning', loading: 'Loading the AI model (once, ~20 MB)…', ready: 'AI running', denied: 'Camera access was denied. Allow it in the browser settings.', nocam: 'No camera found or the browser does not support it.', seated: 'Seated', standing: 'Standing', test: 'Test mode: statuses are not saved; cameras are kept in this browser only.', sent: 'saved', fail: 'Could not save', hint: 'Drag a zone; resize from its bottom-right corner. Red — guest seated, yellow — staff/cleaning, green — free.', remove: 'Remove', since: 'since', off: 'Cameras off', name: 'Name', namePh: 'Camera 1: Main hall', type: 'Type', device: 'Camera on this device', stream: 'IP camera stream (https)', pick: 'Camera', url: 'Stream URL', urlPh: 'https://…/stream.mjpg or .m3u8 / .mp4', save: 'Save', cancel: 'Cancel', allow: 'Allow access to the camera list', reconnect: 'Saved cameras reconnected automatically', askOnce: 'Press “Connect cameras” — the browser asks once, then it reconnects by itself.', empty: 'No cameras yet. Press “Add camera”.', cors: 'The stream opened but has no CORS — the AI cannot read the picture.', streamFail: 'Could not open the stream. Use MJPEG, MP4 or HLS (https); RTSP needs a gateway.', other: 'The saved camera was not found — another one is used.', confirmRemove: 'Remove this camera?', running: 'running', paused: 'stopped', ai: '🤖 AI: find tables', scanning: 'AI is looking for tables…', found: 'AI found {n} tables and boxed them', noTables: 'AI found no tables — point the camera at the hall or add a zone by hand.', needStart: 'Connect the camera first.', tableNo: 'Table #', bookedBy: 'Booked by', guests: 'Guests', startsIn: 'Starts in', endsIn: 'Ends in', left: '', minutes: 'min', hours: 'h', noBooking: 'No booking for this table today', bill: 'Open bill', camera: 'Camera', close: 'Close', arrived: 'Guest arrived', pending: 'awaiting confirmation', grid1: '▣ 1x1 (one big screen)', grid2: '⊞ 2x2 (4 cameras)', grid3: '∷ 3x3 (9 cameras)', maximize: 'Maximize', back: '⬅️ Back to all cameras (grid)', prev: 'Previous camera', next: 'Next camera', layout: 'Screen layout' },
  };

  const local = {
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
  /** Three starter zones on the tables no other camera covers yet (all tables once every one is covered). */
const defaults = (tables, taken = []) => {
  const fresh = tables.filter((n) => !taken.includes(n));
  return (fresh.length ? fresh : tables).slice(0, 3).map((n, i) => ({ table: n, x: 0.05 + i * 0.32, y: 0.4, w: 0.27, h: 0.45 }));
};
  const videoUrl = (url) => /\.(mp4|webm|m3u8)(\?|#|$)/i.test(url);

  // ---- Pure rules (unit-tested) ----
  const inside = (z, x, y) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
  function cover(z, b) {
    const ix = Math.max(0, Math.min(z.x + z.w, b.x + b.w) - Math.max(z.x, b.x));
    const iy = Math.max(0, Math.min(z.y + z.h, b.y + b.h) - Math.max(z.y, b.y));
    return (ix * iy) / Math.max(1e-6, b.w * b.h);
  }
  /** The one zone a person belongs to: under their lower body, else the zone holding ≥35 % of their box. */
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
  function rawStatus(people, zones, zoneIndexes, aspect) {
    const here = people.filter((p) => zoneIndexes.includes(p.zone));
    if (here.some((p) => seated(p, aspect))) return 'occupied';
    return here.length ? 'cleaning' : 'free';
  }
  const iou = (a, b) => {
    const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)), iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const i = ix * iy;
    return i / Math.max(1e-6, a.w * a.h + b.w * b.h - i);
  };
  /**
   * AI table finder: table boxes from several frames (normalised 0–1) → stable zones. A box counts when it
   * shows up in at least 40 % of the frames; it is grown by 25 % on each side for the chairs around it.
   * Zones are numbered row by row, left to right, with the tables no other camera covers taken first.
   */
  function tableZones(frames, tables, taken = []) {
    const clusters = [];
    frames.forEach((boxes, f) => {
      for (const b of boxes) {
        let best = null, score = 0.3;
        for (const c of clusters) {
          const v = iou(c.avg, b);
          if (v > score && c.last !== f) (best = c), (score = v);
        }
        if (!best) clusters.push((best = { boxes: [], avg: b, last: -1 }));
        best.boxes.push(b);
        best.last = f;
        const n = best.boxes.length, mean = (k) => best.boxes.reduce((s, x) => s + x[k], 0) / n;
        best.avg = { x: mean('x'), y: mean('y'), w: mean('w'), h: mean('h') };
      }
    });
    const need = Math.max(2, Math.ceil(frames.length * 0.4));
    const found = clusters.filter((c) => c.boxes.length >= need).map((c) => {
      const a = c.avg, gx = a.w * 0.25, gy = a.h * 0.25, x = Math.max(0, a.x - gx), y = Math.max(0, a.y - gy);
      return { x, y, w: Math.max(0.06, Math.min(1 - x, a.w + gx * 2)), h: Math.max(0.06, Math.min(1 - y, a.h + gy * 2)) };
    });
    // Row by row: tables whose centres are within a quarter of the frame height share a row.
    found.sort((a, b) => Math.round((a.y + a.h / 2) * 4) - Math.round((b.y + b.h / 2) * 4) || a.x + a.w / 2 - (b.x + b.w / 2));
    const order = [...tables.filter((n) => !taken.includes(n)), ...tables.filter((n) => taken.includes(n))];
    return found.slice(0, order.length).map((z, i) => ({ table: order[i], x: +z.x.toFixed(4), y: +z.y.toFixed(4), w: +z.w.toFixed(4), h: +z.h.toFixed(4), ai: true }));
  }
  /** Minutes until / since an "HH:MM" slot today in Tashkent. */
  const tashkentMinutes = (now = Date.now()) => { const d = new Date(now + 5 * 3600000); return d.getUTCHours() * 60 + d.getUTCMinutes(); };
  const slotMinutes = (v) => Number(String(v).slice(0, 2)) * 60 + Number(String(v).slice(3, 5));
  /** Several cameras on one table: the strongest reading wins. */
  const strongest = (list) => list.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), 'free');

  function mount(host, opts) {
    const w = COPY[opts.lang] || COPY.uz;
    const cacheKey = 'rf-vision-cams:' + (opts.restaurantId || 'test');
    const tableState = new Map();
    let cams = [], detector = null, running = false, lastBeat = 0, frame = 0, alive = true, turn = 0, lastDetect = 0;

    host.innerHTML =
      '<div class="sv-bar"><button type="button" class="primary sv-start" data-sv="start"></button><button type="button" class="quiet" data-sv="add"></button><span class="sv-status" role="status"><i></i><span></span></span></div>' +
      '<p class="muted sv-hint"></p><form class="sv-add form" hidden></form><div class="sv-grid-bar" role="group"><button type="button" data-grid="1"></button><button type="button" data-grid="2"></button><button type="button" data-grid="3"></button><span class="sv-pager" hidden><button type="button" data-page="-1">‹</button><b></b><button type="button" data-page="1">›</button></span></div><div class="sv-cams"></div><h3 class="sv-tables-title"></h3><div class="sv-tables"></div>';
    const $ = (s) => host.querySelector(s);
    const status = $('.sv-status');
    const label = (btn, icon, text) => (btn.innerHTML = '<span aria-hidden="true">' + icon + '</span> ' + esc(text));
    label($('[data-sv=start]'), '📷', w.start);
    label($('[data-sv=add]'), '＋', w.addCam);
    $('.sv-hint').textContent = w.hint + (opts.send ? '' : ' ' + w.test);
    $('.sv-tables-title').textContent = w.table + ' · ' + w.free + ' / ' + w.cleaning + ' / ' + w.occupied;
    const say = (text, tone = 'idle') => {
      status.dataset.tone = tone;
      status.lastChild.textContent = text;
    };
    say(w.off);
    const clock = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const stateOf = (n) => {
      if (!tableState.has(n)) tableState.set(n, { status: 'free', since: Date.now(), target: null, pendingFrom: 0, confidence: 0 });
      return tableState.get(n);
    };

    // ---- Persistence: D1 through opts.store, plus this browser for a fast start / test mode ----
    const plain = (c) => ({ id: c.id, name: c.name, kind: c.kind, deviceId: c.deviceId || '', deviceLabel: c.deviceLabel || '', streamUrl: c.streamUrl || '', zones: c.zones, sort: c.sort || 0 });
    const cacheAll = () => local.set(cacheKey, cams.map(plain));
    async function persist(cam) {
      cacheAll();
      if (!opts.store) return;
      try {
        const res = await opts.store.save(plain(cam));
        if (res?.id && !cam.id) (cam.id = res.id), cacheAll();
      } catch (e) {
        say(w.fail + ': ' + (e?.message || ''), 'error');
      }
    }
    const persistSoon = (cam) => {
      clearTimeout(cam.saveTimer);
      cam.saveTimer = setTimeout(() => persist(cam), SAVE_DELAY_MS);
    };

    // ---- Camera cards ----
    function addCard(cam) {
      const card = document.createElement('section');
      card.className = 'sv-cam';
      card.innerHTML =
        '<header><b></b><small class="sv-cam-state"></small><button type="button" class="quiet sv-ai"></button><button type="button" class="quiet sv-zone-add"></button><button type="button" class="sv-max" aria-label="' + esc(w.maximize) + '" title="' + esc(w.maximize) + '">⛶</button><button type="button" class="sv-remove" aria-label="' + esc(w.remove) + '" title="' + esc(w.remove) + '">✕</button></header>' +
        '<div class="sv-stage"><div class="sv-media"></div><canvas width="1280" height="720"></canvas><div class="sv-max-bar"><button type="button" class="sv-back">' + esc(w.back) + '</button><span class="sv-max-stats" aria-live="polite"></span></div><div class="sv-pop" role="dialog" hidden></div></div><p class="sv-cam-error" hidden></p><div class="sv-zones"></div>';
      card.querySelector('b').textContent = cam.name;
      label(card.querySelector('.sv-zone-add'), '＋', w.addZone);
      card.querySelector('.sv-ai').textContent = w.ai;
      card.querySelector('.sv-ai').onclick = () => autoDetect(cam, true);
      cam.card = card;
      cam.canvas = card.querySelector('canvas');
      cam.ctx = cam.canvas.getContext('2d');
      cam.people = [];
      cam.tracks = [];
      card.querySelector('.sv-zone-add').onclick = () => {
        const used = new Set(cam.zones.map((z) => z.table)), n = opts.tables.find((t) => !used.has(t)) ?? opts.tables[0];
        if (n === undefined) return;
        cam.zones.push({ table: n, x: 0.35, y: 0.3, w: 0.25, h: 0.35 });
        renderZones(cam);
        persistSoon(cam);
      };
      card.querySelector('.sv-remove').onclick = async () => {
        if (!confirm(w.confirmRemove)) return;
        stopCam(cam);
        cams = cams.filter((c) => c !== cam);
        card.remove();
        cacheAll();
        if (opts.store && cam.id) await opts.store.remove(cam.id).catch(() => {});
        renderTables();
      };
      bindDrag(cam);
      card.querySelector('.sv-max').onclick = () => maximize(cam);
      card.querySelector('.sv-back').onclick = restore;
      // A double tap / double click on the picture opens this camera alone, full screen.
      card.querySelector('.sv-stage').addEventListener('dblclick', (e) => {
        if (e.target.closest('.sv-pop,.sv-max-bar')) return;
        cam.card.classList.contains('is-max') ? restore() : maximize(cam);
      });
      $('.sv-cams').append(card);
      renderZones(cam);
      camLabel(cam);
    }
    function camLabel(cam, error) {
      const s = cam.card.querySelector('.sv-cam-state'), e = cam.card.querySelector('.sv-cam-error');
      s.textContent = cam.media ? '● ' + w.running : '○ ' + w.paused;
      s.dataset.on = cam.media ? '1' : '';
      e.hidden = !error;
      e.textContent = error || '';
    }
    function renderZones(cam) {
      const box = cam.card.querySelector('.sv-zones');
      box.innerHTML = cam.zones
        .map((z, i) => '<span class="sv-chip' + (z.ai ? ' is-ai' : '') + '"><select data-zone="' + i + '" aria-label="' + esc(w.table) + '">' + opts.tables.map((n) => '<option value="' + n + '"' + (n === z.table ? ' selected' : '') + '>' + esc(w.table) + ' ' + n + '</option>').join('') + '</select><button type="button" data-remove="' + i + '" aria-label="' + esc(w.remove) + '">✕</button></span>')
        .join('');
      box.querySelectorAll('[data-zone]').forEach((el) => (el.onchange = () => ((cam.zones[+el.dataset.zone].table = Number(el.value)), persistSoon(cam), renderTables())));
      box.querySelectorAll('[data-remove]').forEach((el) => (el.onclick = () => (cam.zones.splice(+el.dataset.remove, 1), renderZones(cam), persistSoon(cam), renderTables())));
      renderTables();
    }
    function renderTables() {
      const covered = [...new Set(cams.flatMap((c) => c.zones.map((z) => z.table)))].sort((a, b) => a - b);
      $('.sv-tables').innerHTML = covered.length
        ? covered.map((n) => { const s = stateOf(n); return '<div class="sv-card" style="--sv:' + COLOR[s.status] + '"><div class="sv-card-state"><i></i><b>' + esc(w.table) + ' ' + n + ' · ' + esc(w[s.status]) + '</b><small>' + (opts.lang === 'uz' ? clock(s.since) + ' ' + w.since : w.since + ' ' + clock(s.since)) + '</small></div></div>'; }).join('')
        : '<p class="muted">' + esc(w.empty) + '</p>';
    }

    // ---- Starting and stopping cameras ----
    async function startDevice(cam) {
      const tryOpen = (deviceId) => navigator.mediaDevices.getUserMedia({ video: { ...(deviceId ? { deviceId: { exact: deviceId } } : {}), width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      let stream = null, note = '';
      try {
        stream = await tryOpen(cam.deviceId);
      } catch (e) {
        if (e?.name === 'NotAllowedError') throw e;
        // deviceIds can change (another browser profile, cleared site data): find it by label.
        const list = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
        const same = list.find((d) => d.label && d.label === cam.deviceLabel);
        stream = await tryOpen(same?.deviceId);
        if (!same) note = w.other;
      }
      const track = stream.getVideoTracks()[0], settings = track?.getSettings?.() || {};
      if (settings.deviceId && (settings.deviceId !== cam.deviceId || (track.label && track.label !== cam.deviceLabel))) {
        cam.deviceId = settings.deviceId;
        cam.deviceLabel = track.label || cam.deviceLabel;
        persist(cam);
      }
      const video = document.createElement('video');
      Object.assign(video, { muted: true, playsInline: true, autoplay: true });
      video.srcObject = stream;
      await video.play().catch(() => {});
      return { el: video, stream, note };
    }
    function startStream(cam) {
      return new Promise((resolve, reject) => {
        const isVideo = videoUrl(cam.streamUrl), el = document.createElement(isVideo ? 'video' : 'img');
        el.crossOrigin = 'anonymous';
        el.referrerPolicy = 'no-referrer';
        if (isVideo) Object.assign(el, { muted: true, playsInline: true, autoplay: true, loop: true });
        const done = () => resolve({ el, stream: null, note: '' });
        el.addEventListener(isVideo ? 'loadeddata' : 'load', done, { once: true });
        el.addEventListener('error', () => reject(new Error('STREAM')), { once: true });
        el.src = cam.streamUrl;
        if (isVideo) el.play?.().catch(() => {});
        setTimeout(() => reject(new Error('STREAM')), 15000);
      });
    }
    async function startCam(cam) {
      if (cam.media) return true;
      try {
        const m = cam.kind === 'stream' ? await startStream(cam) : await startDevice(cam);
        cam.media = m;
        const box = cam.card.querySelector('.sv-media');
        box.innerHTML = '';
        box.append(m.el);
        camLabel(cam, m.note);
        return true;
      } catch (e) {
        camLabel(cam, e?.name === 'NotAllowedError' ? w.denied : cam.kind === 'stream' ? w.streamFail : w.nocam);
        return false;
      }
    }
    function stopCam(cam) {
      cam.media?.stream?.getTracks().forEach((t) => t.stop());
      if (cam.media?.el) (cam.media.el.removeAttribute('src'), (cam.media.el.srcObject = null), cam.media.el.remove());
      cam.media = null;
      cam.people = [];
      cam.tracks = [];
      if (cam.card) camLabel(cam);
    }
    // ---- AI table finder ----
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    async function autoDetect(cam, manual) {
      if (cam.scanning) return;
      if (!cam.media || !detector?.detectAll) return manual && say(w.needStart, 'error');
      cam.scanning = true;
      cam.found = [];
      say(w.scanning, 'busy');
      const frames = [];
      try {
        for (let i = 0; i < SCAN_FRAMES && cam.media && alive; i++) {
          const src = frameOf(cam);
          if (src) {
            const { tables } = await detector.detectAll(src.source);
            frames.push(tables.map((t) => ({ x: t.bbox[0] / src.W, y: t.bbox[1] / src.H, w: t.bbox[2] / src.W, h: t.bbox[3] / src.H, score: t.score })));
            cam.found = frames[frames.length - 1];
          }
          await sleep(SCAN_GAP_MS);
        }
      } catch {
        /* a CORS stream cannot be read: handled by detectOne's message */
      }
      cam.scanning = false;
      cam.found = [];
      const taken = cams.filter((c) => c !== cam).flatMap((c) => c.zones.map((z) => z.table));
      const zones = tableZones(frames, opts.tables, taken);
      if (zones.length) {
        cam.zones = zones;
        say(w.found.replace('{n}', zones.length), 'ok');
      } else {
        if (!cam.zones.length) cam.zones = defaults(opts.tables, taken);
        say(w.noTables, manual ? 'error' : 'idle');
      }
      renderZones(cam);
      persistSoon(cam);
      send(true);
    }

    async function startAll(auto) {
      if (!cams.length) return say(w.empty);
      running = true;
      label($('[data-sv=start]'), '⏹', w.stop);
      $('[data-sv=start]').classList.add('is-live');
      const results = [];
      for (const cam of cams) results.push(await startCam(cam));
      if (!results.some(Boolean)) {
        const firstError = cams.map((c) => c.card.querySelector('.sv-cam-error').textContent).find(Boolean);
        return stopAll(firstError || w.nocam);
      }
      if (!detector) {
        say(w.loading, 'busy');
        try {
          detector = await opts.loadDetector();
        } catch (e) {
          return say(e?.message || 'AI', 'error');
        }
      }
      say((auto ? w.reconnect + ' · ' : '') + w.ready + ' (' + detector.backend + ')', 'ok');
      send(false);
      // A camera without zones: the AI finds the tables by itself.
      for (const cam of cams) if (cam.media && !cam.zones.length) await autoDetect(cam, false);
    }
    function stopAll(message) {
      running = false;
      cams.forEach(stopCam);
      label($('[data-sv=start]'), '📷', w.start);
      $('[data-sv=start]').classList.remove('is-live');
      say(message || w.off, message ? 'error' : 'idle');
    }

    // ---- Detection: one camera per tick, round-robin; then merge per table ----
    function track(cam, found, now) {
      const next = [];
      for (const p of found) {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        let best = null, dist = 0.12;
        for (const t of cam.tracks) {
          const d = Math.hypot(t.cx - cx, t.cy - cy);
          if (d < dist && !next.includes(t)) (best = t), (dist = d);
        }
        const t = best || { hist: [] };
        Object.assign(t, { cx, cy });
        t.hist = t.hist.filter((h) => now - h.t <= MOVE_WINDOW_MS).concat({ t: now, cx, cy });
        next.push(t);
        p.moving = t.hist.some((h) => Math.hypot(h.cx - cx, h.cy - cy) > MOVE_LIMIT);
      }
      cam.tracks = next;
      return found;
    }
    const size = (el) => (el.tagName === 'VIDEO' ? [el.videoWidth, el.videoHeight] : [el.naturalWidth, el.naturalHeight]);
    function frameOf(cam) {
      const el = cam.media?.el;
      if (!el) return null;
      const [W, H] = size(el);
      if (!W || !H) return null;
      let source = el;
      if (el.tagName === 'IMG') {
        cam.grab ??= document.createElement('canvas');
        Object.assign(cam.grab, { width: W, height: H });
        cam.grab.getContext('2d').drawImage(el, 0, 0, W, H);
        source = cam.grab;
      }
      return { source, W, H };
    }
    async function detectOne(cam) {
      if (cam.scanning) return;
      const f = frameOf(cam);
      if (!f) return;
      const { source, W, H } = f;
      try {
        cam.people = track(cam, (await detector.detect(source)).map((p) => ({ x: p.bbox[0] / W, y: p.bbox[1] / H, w: p.bbox[2] / W, h: p.bbox[3] / H, score: p.score })), performance.now());
        cam.aspect = H / W;
        if (cam.corsError) (cam.corsError = false), camLabel(cam);
      } catch (e) {
        cam.people = [];
        if (e?.name === 'SecurityError' && !cam.corsError) (cam.corsError = true), camLabel(cam, w.cors);
      }
    }
    function decide(now) {
      const live = cams.filter((c) => c.media);
      for (const cam of live) for (const p of cam.people) p.zone = zoneOf(cam.zones, p);
      let changed = false;
      for (const n of new Set(live.flatMap((c) => c.zones.map((z) => z.table)))) {
        const readings = [], hereAll = [];
        for (const cam of live) {
          const idx = cam.zones.map((z, i) => (z.table === n ? i : -1)).filter((i) => i >= 0);
          if (!idx.length) continue;
          readings.push(rawStatus(cam.people, cam.zones, idx, cam.aspect || 9 / 16));
          hereAll.push(...cam.people.filter((p) => idx.includes(p.zone)));
        }
        const seen = strongest(readings), s = stateOf(n);
        if (seen === s.status) (s.target = null), (s.pendingFrom = 0);
        else if (s.target !== seen) (s.target = seen), (s.pendingFrom = now);
        else if (now - s.pendingFrom >= HOLD_MS[seen]) {
          Object.assign(s, { status: seen, since: Date.now(), target: null, pendingFrom: 0, confidence: hereAll.length ? Math.max(...hereAll.map((p) => p.score)) : 0.7 });
          changed = true;
        }
      }
      if (changed) (renderTables(), send(true));
      else if (running && now - lastBeat > HEARTBEAT_MS) send(false);
    }
    async function send(force) {
      if (!opts.send) return;
      const covered = new Set(cams.filter((c) => c.media).flatMap((c) => c.zones.map((z) => z.table)));
      const rows = [...covered].map((n) => ({ number: n, status: stateOf(n).status, confidence: Number((stateOf(n).confidence || 0.6).toFixed(2)) }));
      if (!rows.length) return;
      lastBeat = performance.now();
      try {
        await opts.send(rows);
        if (force) say(w.ready + ' · ' + w.sent + ' ' + clock(Date.now()), 'ok');
      } catch (e) {
        say(w.fail + ': ' + (e?.message || ''), 'error');
      }
    }

    // ---- Drawing and zone dragging ----
    function draw(cam, now) {
      const c = cam.canvas, ctx = cam.ctx, el = cam.media?.el;
      if (el) {
        const [W, H] = size(el);
        if (W && H && (c.width !== W || c.height !== H)) Object.assign(c, { width: W, height: H });
      }
      const W = c.width, H = c.height, aspect = H / W, k = W / (c.clientWidth || W);
      ctx.clearRect(0, 0, W, H);
      ctx.font = '600 ' + Math.round(13 * k) + 'px system-ui, sans-serif';
      for (const p of cam.people) {
        const sit = seated(p, aspect);
        ctx.setLineDash([6 * k, 5 * k]);
        ctx.lineWidth = 1.5 * k;
        ctx.strokeStyle = sit ? '#fca5a5' : '#fde68a';
        ctx.strokeRect(p.x * W, p.y * H, p.w * W, p.h * H);
        ctx.setLineDash([]);
        const text = (sit ? w.seated : w.standing) + ' ' + Math.round(p.score * 100) + '%', tw = ctx.measureText(text).width + 10 * k, tx = p.x * W, ty = Math.max(0, p.y * H - 20 * k);
        ctx.fillStyle = 'rgba(8,21,33,.8)';
        ctx.fillRect(tx, ty, tw, 18 * k);
        ctx.fillStyle = sit ? '#fca5a5' : '#fde68a';
        ctx.fillText(text, tx + 5 * k, ty + 13 * k);
      }
      // While the AI scans: the tables it sees in this frame, dashed blue.
      for (const t of cam.found || []) {
        ctx.setLineDash([10 * k, 6 * k]);
        ctx.lineWidth = 2 * k;
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(t.x * W, t.y * H, t.w * W, t.h * H);
        ctx.setLineDash([]);
      }
      // Table boxes: border 2px green (Bo‘sh) / red (Band) / yellow (Tozalanmoqda) over a see-through fill.
      for (const z of cam.zones) {
        const s = stateOf(z.table), x = z.x * W, y = z.y * H, zw = z.w * W, zh = z.h * H, color = COLOR[s.status];
        ctx.fillStyle = color + '2e';
        ctx.fillRect(x, y, zw, zh);
        ctx.lineWidth = 2 * k;
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, zw, zh);
        if (cam.selected === z.table) {
          ctx.lineWidth = 4 * k;
          ctx.strokeRect(x - 3 * k, y - 3 * k, zw + 6 * k, zh + 6 * k);
        }
        if (s.target) {
          ctx.fillStyle = COLOR[s.target];
          ctx.fillRect(x, y + zh - 5 * k, zw * Math.min(1, (now - s.pendingFrom) / HOLD_MS[s.target]), 5 * k);
        }
        const text = w.tableNo + z.table + ': ' + w[s.status] + (z.ai ? ' · AI' : ''), tw = ctx.measureText(text).width + 14 * k;
        // The label may be wider than a small box; it stays inside the picture.
        const lx = Math.min(x, Math.max(0, W - tw)), ly = y >= 24 * k ? y - 22 * k : y;
        ctx.fillStyle = color;
        ctx.fillRect(lx, ly, tw, 22 * k);
        ctx.fillStyle = s.status === 'cleaning' ? '#1f2937' : '#fff';
        ctx.fillText(text, lx + 7 * k, ly + 15.5 * k);
        ctx.fillStyle = color;
        ctx.fillRect(x + zw - HANDLE * k, y + zh - HANDLE * k, HANDLE * k, HANDLE * k);
      }
    }

    // ---- Tap on a box: the table's booking, time left and open bill ----
    function duration(m) {
      const h = Math.floor(m / 60), r = m % 60;
      return (h ? h + ' ' + w.hours + ' ' : '') + r + ' ' + w.minutes;
    }
    function infoHtml(n) {
      const s = stateOf(n), data = opts.info?.() || null, t = data?.tables?.find((x) => x.number === n), b = t?.booking, now = tashkentMinutes();
      let html = '<header><b>' + esc(w.tableNo + n) + '</b><button type="button" data-pop-close aria-label="' + esc(w.close) + '">✕</button></header>';
      html += '<p class="sv-pop-state" style="--sv:' + COLOR[s.status] + '"><i></i>' + esc(w.camera) + ': <b>' + esc(w[s.status]) + '</b> · ' + esc(opts.lang === 'uz' ? clock(s.since) + ' ' + w.since : w.since + ' ' + clock(s.since)) + '</p>';
      if (b) {
        const start = slotMinutes(b.slot), end = slotMinutes(b.endSlot);
        const left = now < start ? w.startsIn + ': <b>' + esc(duration(start - now)) + '</b> ' + esc(w.left) : w.endsIn + ': <b>' + esc(duration(Math.max(0, end - now))) + '</b> ' + esc(w.left);
        html += '<dl><div><dt>' + esc(w.bookedBy) + '</dt><dd>' + esc(b.name || '—') + (b.phone ? '<br><a href="tel:' + esc(b.phone) + '">' + esc(b.phone) + '</a>' : '') + '</dd></div><div><dt>🕒</dt><dd>' + esc(b.slot + '–' + b.endSlot) + ' · ' + esc(w.guests) + ': ' + esc(b.guests) + (b.status === 'pending' ? ' · ' + esc(w.pending) : '') + (b.checkedIn ? ' · ✅ ' + esc(w.arrived) : '') + '</dd></div></dl><p class="sv-pop-left">⏳ ' + left + '</p>';
      } else html += '<p class="muted">' + esc(data ? w.noBooking : '…') + '</p>';
      if (t?.order) html += '<p class="sv-pop-bill">🧾 ' + esc(w.bill) + ': <b>' + esc(Math.round(t.order.total).toLocaleString('ru-RU')) + '</b> so‘m</p>';
      return html;
    }
    function showInfo(cam, n, px, py) {
      const pop = cam.card.querySelector('.sv-pop');
      cam.selected = n;
      pop.hidden = false;
      pop.dataset.table = n;
      pop.innerHTML = infoHtml(n);
      // Next to the tap, kept inside the picture.
      const stage = cam.card.querySelector('.sv-stage').getBoundingClientRect();
      pop.style.left = Math.max(6, Math.min(stage.width - pop.offsetWidth - 6, px - stage.left + 10)) + 'px';
      pop.style.top = Math.max(6, Math.min(stage.height - pop.offsetHeight - 6, py - stage.top + 10)) + 'px';
      pop.querySelector('[data-pop-close]').onclick = () => hideInfo(cam);
    }
    function hideInfo(cam) {
      const pop = cam.card.querySelector('.sv-pop');
      pop.hidden = true;
      cam.selected = null;
    }
    // Open boxes follow the latest data (the page refreshes bookings every 2 s).
    const infoTimer = setInterval(() => {
      for (const cam of cams) {
        const pop = cam.card?.querySelector('.sv-pop');
        if (pop && !pop.hidden) {
          pop.innerHTML = infoHtml(Number(pop.dataset.table));
          pop.querySelector('[data-pop-close]').onclick = () => hideInfo(cam);
        }
      }
    }, 2000);
    function bindDrag(cam) {
      let drag = null, tap = null;
      const point = (e) => {
        const r = cam.canvas.getBoundingClientRect();
        return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, r };
      };
      cam.canvas.addEventListener('pointerdown', (e) => {
        const p = point(e), hx = HANDLE / p.r.width, hy = HANDLE / p.r.height;
        tap = { x: e.clientX, y: e.clientY, at: Date.now() };
        // Overlapping boxes: a resize corner wins, then the smallest box under the finger.
        let hit = -1, corner = false;
        cam.zones.forEach((z, i) => {
          const c = p.x >= z.x + z.w - hx * 2 && p.x <= z.x + z.w + hx && p.y >= z.y + z.h - hy * 2 && p.y <= z.y + z.h + hy;
          if (!c && !inside(z, p.x, p.y)) return;
          if (hit < 0 || (c && !corner) || (c === corner && z.w * z.h < cam.zones[hit].w * cam.zones[hit].h)) (hit = i), (corner = c);
        });
        if (hit >= 0) {
          const z = cam.zones[hit];
          drag = { i: hit, mode: corner ? 'size' : 'move', dx: p.x - z.x, dy: p.y - z.y, moved: false, corner };
          cam.canvas.setPointerCapture(e.pointerId);
          e.preventDefault();
        }
      });
      cam.canvas.addEventListener('pointermove', (e) => {
        if (!drag) return;
        if (Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 6) return;
        drag.moved = true;
        const p = point(e), z = cam.zones[drag.i];
        if (drag.mode === 'move') {
          z.x = Math.min(1 - z.w, Math.max(0, p.x - drag.dx));
          z.y = Math.min(1 - z.h, Math.max(0, p.y - drag.dy));
        } else {
          z.w = Math.min(1 - z.x, Math.max(0.06, p.x - z.x));
          z.h = Math.min(1 - z.y, Math.max(0.06, p.y - z.y));
        }
      });
      const drop = (e) => {
        // A tap (no drag) on a box opens its info; a tap on empty picture closes it.
        if (e?.type === 'pointerup' && (!drag || !drag.moved) && Date.now() - (tap?.at || 0) < 600) {
          if (drag && !drag.corner) showInfo(cam, cam.zones[drag.i].table, e.clientX, e.clientY);
          else if (!drag) hideInfo(cam);
        } else if (drag?.moved) persistSoon(cam);
        drag = null;
      };
      cam.canvas.addEventListener('pointerup', drop);
      cam.canvas.addEventListener('pointercancel', drop);
    }

    async function loop(now) {
      frame = 0;
      if (!alive) return;
      if (!host.isConnected) return destroy();
      const live = cams.filter((c) => c.media);
      if (running && detector && live.length && now - lastDetect >= DETECT_EVERY_MS) {
        lastDetect = now;
        await detectOne(live[turn++ % live.length]);
        decide(performance.now());
      }
      for (const cam of cams) if (cam.card) draw(cam, performance.now());
      frame = requestAnimationFrame(loop);
    }

    // ---- Adding a camera ----
    async function deviceOptions() {
      const list = (await navigator.mediaDevices?.enumerateDevices?.().catch(() => [])) || [];
      return list.filter((d) => d.kind === 'videoinput');
    }
    async function openAddForm() {
      const form = $('.sv-add');
      const devices = await deviceOptions(), labelled = devices.some((d) => d.label);
      form.hidden = false;
      form.innerHTML =
        '<div class="two"><label>' + esc(w.name) + '<input name="name" required maxlength="60" placeholder="' + esc(w.namePh) + '" value="' + esc((opts.lang === 'ru' ? 'Камера ' : opts.lang === 'en' ? 'Camera ' : '') + (cams.length + 1) + (opts.lang === 'uz' ? '-Kamera' : '')) + '"></label>' +
        '<label>' + esc(w.type) + '<select name="kind"><option value="device">' + esc(w.device) + '</option><option value="stream">' + esc(w.stream) + '</option></select></label></div>' +
        '<label data-for="device">' + esc(w.pick) + '<select name="deviceId">' + (devices.length ? devices.map((d, i) => '<option value="' + esc(d.deviceId) + '" data-label="' + esc(d.label) + '">' + esc(d.label || w.pick + ' ' + (i + 1)) + '</option>').join('') : '<option value="">' + esc(w.nocam) + '</option>') + '</select></label>' +
        (labelled || !devices.length ? '' : '<button type="button" class="quiet" data-allow>' + esc(w.allow) + '</button>') +
        '<label data-for="stream" hidden>' + esc(w.url) + '<input name="streamUrl" type="url" inputmode="url" placeholder="' + esc(w.urlPh) + '"></label>' +
        '<div class="row-actions"><button class="primary">' + esc(w.save) + '</button><button type="button" class="quiet" data-cancel>' + esc(w.cancel) + '</button></div>';
      const kind = form.elements.kind;
      kind.onchange = () => {
        form.querySelector('[data-for=device]').hidden = kind.value !== 'device';
        form.querySelector('[data-for=stream]').hidden = kind.value !== 'stream';
        form.elements.streamUrl.required = kind.value === 'stream';
      };
      form.querySelector('[data-cancel]').onclick = () => (form.hidden = true);
      const allow = form.querySelector('[data-allow]');
      if (allow)
        allow.onclick = async () => {
          try {
            (await navigator.mediaDevices.getUserMedia({ video: true })).getTracks().forEach((t) => t.stop());
          } catch {
            /* the select stays unnamed */
          }
          openAddForm();
        };
      form.onsubmit = async (e) => {
        e.preventDefault();
        const opt = form.elements.deviceId.selectedOptions[0];
        const cam = { name: form.elements.name.value.trim(), kind: kind.value, deviceId: kind.value === 'device' ? form.elements.deviceId.value : '', deviceLabel: kind.value === 'device' ? opt?.dataset.label || '' : '', streamUrl: kind.value === 'stream' ? form.elements.streamUrl.value.trim() : '', zones: [], sort: cams.length };
        if (cam.kind === 'stream' && !/^https:\/\//i.test(cam.streamUrl)) return say(w.streamFail, 'error');
        form.hidden = true;
        cams.push(cam);
        addCard(cam);
        await persist(cam);
        // The AI boxes the tables as soon as the camera runs (no zones yet).
        if (running && (await startCam(cam)) && detector) autoDetect(cam, false);
      };
    }

    // ---- CCTV wall: 1x1 (one camera at a time, ‹ › to switch), 2x2, 3x3; any camera can go full screen ----
    let grid = Number(local.get('rf-vision-grid')) || 2,
      page = 0,
      maxCam = null,
      statsTimer = 0;
    const wall = $('.sv-cams');
    [1, 2, 3].forEach((n) => (host.querySelector('[data-grid="' + n + '"]').textContent = w['grid' + n]));
    host.querySelector('.sv-grid-bar').setAttribute('aria-label', w.layout);
    function layout() {
      wall.dataset.grid = String(grid);
      host.querySelectorAll('[data-grid]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.grid) === grid)));
      const pager = host.querySelector('.sv-pager');
      pager.hidden = grid !== 1 || cams.length < 2;
      page = Math.max(0, Math.min(cams.length - 1, page));
      cams.forEach((c, i) => c.card && (c.card.hidden = grid === 1 && i !== page && !c.card.classList.contains('is-max')));
      pager.querySelector('b').textContent = cams.length ? page + 1 + ' / ' + cams.length : '';
    }
    host.querySelectorAll('[data-grid]').forEach(
      (b) =>
        (b.onclick = () => {
          grid = Number(b.dataset.grid);
          local.set('rf-vision-grid', grid);
          layout();
        }),
    );
    host.querySelectorAll('[data-page]').forEach((b) => (b.onclick = () => ((page = (page + Number(b.dataset.page) + cams.length) % Math.max(1, cams.length)), layout())));
    function stats(cam) {
      const tables = [...new Set(cam.zones.map((z) => z.table))],
        count = (st) => tables.filter((n) => stateOf(n).status === st).length;
      return '🟢 ' + w.free + ': ' + count('free') + ' | 🔴 ' + w.occupied + ': ' + count('occupied') + (count('cleaning') ? ' | 🟡 ' + w.cleaning + ': ' + count('cleaning') : '');
    }
    function maximize(cam) {
      if (maxCam) restore();
      maxCam = cam;
      wall.classList.add('has-max');
      cam.card.hidden = false;
      cam.card.classList.add('is-max');
      document.documentElement.classList.add('sv-lock');
      const tick = () => (cam.card.querySelector('.sv-max-stats').textContent = stats(cam));
      tick();
      statsTimer = setInterval(tick, 1000);
      cam.card.querySelector('.sv-back').focus({ preventScroll: true });
    }
    function restore() {
      if (!maxCam) return;
      maxCam.card.classList.remove('is-max');
      wall.classList.remove('has-max');
      document.documentElement.classList.remove('sv-lock');
      clearInterval(statsTimer);
      maxCam = null;
      layout();
    }
    const onKey = (e) => e.key === 'Escape' && restore();
    document.addEventListener('keydown', onKey);
    const observer = new MutationObserver(layout);
    observer.observe(wall, { childList: true });

    $('[data-sv=start]').onclick = () => (running ? stopAll() : startAll(false));
    $('[data-sv=add]').onclick = openAddForm;

    // ---- Load saved cameras, then reconnect without asking when the browser already allows it ----
    (async () => {
      let saved = local.get(cacheKey) || [];
      if (opts.store) {
        try {
          saved = await opts.store.list();
        } catch {
          /* offline: the browser copy is used */
        }
      }
      if (!alive) return;
      cams = saved.map((c) => ({ ...c, zones: (c.zones || []).filter((z) => opts.tables.includes(z.table)) }));
      cacheAll();
      cams.forEach(addCard);
      if (cams.length < 2) grid = Math.min(grid, 1) || 1;
      layout();
      renderTables();
      frame = requestAnimationFrame(loop);
      if (!cams.length) return say(w.empty);
      const needsPermission = cams.some((c) => c.kind === 'device');
      let granted = !needsPermission;
      if (needsPermission) {
        try {
          granted = (await navigator.permissions?.query({ name: 'camera' }))?.state === 'granted';
        } catch {
          granted = false;
        }
      }
      if (granted) startAll(true);
      else say(w.askOnce);
    })();

    function destroy() {
      alive = false;
      restore();
      observer.disconnect();
      document.removeEventListener('keydown', onKey);
      clearInterval(infoTimer);
      cancelAnimationFrame(frame);
      cams.forEach((c) => (clearTimeout(c.saveTimer), stopCam(c)));
    }
    return { destroy };
  }

  window.RFSmartVision = { mount, zoneOf, seated, rawStatus, strongest, tableZones };
})();
