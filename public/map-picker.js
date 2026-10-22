/*
 * Map picker: the place is chosen only on the map, no coordinates to type. A tiny slippy map of
 * OpenStreetMap tiles with a pin fixed in the middle; drag (one finger), pinch or +/- to zoom, or
 * "My location" to jump to the GPS fix. Whatever sits under the pin is the chosen point.
 *   RFMapPicker.mount(host, { lat, lng, onChange(lat, lng) }) → { set(lat, lng), destroy() }
 * Without a starting point the map opens on Samarkand and reports nothing until the user moves it.
 *   RFMapPicker.track(host) → { update([{ kind: 'courier'|'home'|'restaurant', lat, lng, label }]) }
 * A read-only live map for order tracking: fits every marker, the courier glides between GPS fixes.
 */
(() => {
  'use strict';
  const TILE = 256, MIN_Z = 3, MAX_Z = 19, HOME = [39.6542, 66.9597];
  const COPY = {
    uz: { me: 'Mening joyim', hint: 'Xaritani suring — pin turgan joy tanlanadi', gps: 'Joylashuvni aniqlab bo‘lmadi. Xaritadan tanlang.', zin: 'Yaqinlashtirish', zout: 'Uzoqlashtirish' },
    ru: { me: 'Моё место', hint: 'Двигайте карту — выбрано место под меткой', gps: 'Не удалось определить место. Выберите на карте.', zin: 'Приблизить', zout: 'Отдалить' },
    en: { me: 'My location', hint: 'Drag the map — the place under the pin is chosen', gps: 'Could not get your location. Pick it on the map.', zin: 'Zoom in', zout: 'Zoom out' },
  };
  const words = () => COPY[document.documentElement.lang] || COPY.uz;
  const clampLat = (v) => Math.max(-85, Math.min(85, v));
  const wrapLng = (v) => ((((v + 180) % 360) + 360) % 360) - 180;
  // Web Mercator: degrees ⇄ world pixels at zoom z.
  const project = (lat, lng, z) => {
    const s = TILE * 2 ** z, r = (clampLat(lat) * Math.PI) / 180;
    return [((lng + 180) / 360) * s, ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * s];
  };
  const unproject = (x, y, z) => {
    const s = TILE * 2 ** z, n = Math.PI - (2 * Math.PI * y) / s;
    return [clampLat((180 / Math.PI) * Math.atan(Math.sinh(n))), wrapLng((x / s) * 360 - 180)];
  };

  /** Keeps the OpenStreetMap tiles under (lat, lng) at zoom z in a W×H box; returns the painter. */
  function tileLayer(layer) {
    const tiles = new Map();
    return (lat, lng, z, W, H) => {
      const [cx, cy] = project(lat, lng, z), n = 2 ** z;
      const x0 = Math.floor((cx - W / 2) / TILE), x1 = Math.floor((cx + W / 2) / TILE), y0 = Math.max(0, Math.floor((cy - H / 2) / TILE)), y1 = Math.min(n - 1, Math.floor((cy + H / 2) / TILE));
      const keep = new Set();
      for (let x = x0; x <= x1; x++)
        for (let y = y0; y <= y1; y++) {
          const key = z + '/' + x + '/' + y;
          keep.add(key);
          let img = tiles.get(key);
          if (!img) {
            img = new Image(TILE, TILE);
            img.alt = '';
            img.draggable = false;
            img.decoding = 'async';
            img.onerror = () => (img.style.visibility = 'hidden');
            // OpenStreetMap asks for a Referer; the site's own policy sends none cross-origin.
            img.referrerPolicy = 'strict-origin-when-cross-origin';
            img.src = 'https://tile.openstreetmap.org/' + z + '/' + (((x % n) + n) % n) + '/' + y + '.png';
            tiles.set(key, img);
            layer.append(img);
          }
          img.style.transform = 'translate3d(' + Math.round(x * TILE - cx + W / 2) + 'px,' + Math.round(y * TILE - cy + H / 2) + 'px,0)';
        }
      for (const [key, img] of tiles) if (!keep.has(key)) (img.remove(), tiles.delete(key));
    };
  }

  function track(host) {
    const ICON = { courier: '🛵', home: '🏠', restaurant: '🍽️' };
    host.classList.add('rf-map-picker', 'rf-map-track');
    host.innerHTML = '<div class="rf-map-tiles"></div><div class="rf-map-marks"></div><a class="rf-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>';
    const paint = tileLayer(host.querySelector('.rf-map-tiles')), layer = host.querySelector('.rf-map-marks'), marks = new Map();
    let list = [], frame = 0, lastZ = 0;
    function draw() {
      frame = 0;
      const W = host.clientWidth, H = host.clientHeight, pts = list.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));
      if (!W || !H || !pts.length) return;
      // Largest zoom (max 17) that keeps every marker 40px inside the edges.
      let z = 17, xs, ys;
      for (; z > MIN_Z; z--) {
        const p = pts.map((m) => project(m.lat, m.lng, z));
        xs = p.map((v) => v[0]);
        ys = p.map((v) => v[1]);
        if (Math.max(...xs) - Math.min(...xs) <= W - 80 && Math.max(...ys) - Math.min(...ys) <= H - 80) break;
      }
      const p = pts.map((m) => project(m.lat, m.lng, z));
      xs = p.map((v) => v[0]);
      ys = p.map((v) => v[1]);
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2, [lat, lng] = unproject(cx, cy, z);
      paint(lat, lng, z, W, H);
      // Same zoom: markers glide to their new place; a zoom change jumps.
      layer.classList.toggle('rf-map-jump', z !== lastZ);
      lastZ = z;
      const keep = new Set();
      pts.forEach((m, i) => {
        keep.add(m.kind);
        let el = marks.get(m.kind);
        if (!el) {
          el = document.createElement('div');
          el.className = 'rf-map-mark rf-map-' + m.kind;
          el.textContent = ICON[m.kind] || '📍';
          marks.set(m.kind, el);
          layer.append(el);
        }
        el.title = m.label || '';
        el.style.transform = 'translate3d(' + Math.round(p[i][0] - cx + W / 2) + 'px,' + Math.round(p[i][1] - cy + H / 2) + 'px,0)';
      });
      for (const [k, el] of marks) if (!keep.has(k)) (el.remove(), marks.delete(k));
    }
    const redraw = () => frame || (frame = requestAnimationFrame(draw));
    new ResizeObserver(redraw).observe(host);
    return { update: (next) => ((list = next || []), redraw()) };
  }

  function mount(host, opts = {}) {
    const w = words();
    const given = Number.isFinite(opts.lat) && Number.isFinite(opts.lng);
    let lat = given ? opts.lat : HOME[0], lng = given ? opts.lng : HOME[1], z = given ? 17 : 13, frame = 0;
    host.classList.add('rf-map-picker');
    host.innerHTML = '<div class="rf-map-tiles"></div><div class="rf-map-pin" aria-hidden="true"></div>' +
      '<div class="rf-map-zoom"><button type="button" data-z="1">+</button><button type="button" data-z="-1">−</button></div>' +
      '<button type="button" class="rf-map-me"></button><p class="rf-map-hint"></p>' +
      '<a class="rf-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>';
    host.querySelector('[data-z="1"]').setAttribute('aria-label', w.zin);
    host.querySelector('[data-z="-1"]').setAttribute('aria-label', w.zout);
    host.querySelector('.rf-map-me').textContent = '📍 ' + w.me;
    host.querySelector('.rf-map-hint').textContent = w.hint;

    const paint = tileLayer(host.querySelector('.rf-map-tiles'));
    function draw() {
      frame = 0;
      paint(lat, lng, z, host.clientWidth, host.clientHeight);
    }
    const redraw = () => frame || (frame = requestAnimationFrame(draw));
    const report = () => opts.onChange?.(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    const zoomTo = (next) => {
      next = Math.max(MIN_Z, Math.min(MAX_Z, Math.round(next)));
      if (next !== z) (z = next), redraw();
    };

    // One pointer pans, two pinch-zoom; the point is reported when the gesture ends.
    const pts = new Map();
    let pinch = 0, moved = false;
    host.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button,a')) return;
      host.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) pinch = Math.hypot(...[...pts.values()].reduce((a, b) => [a[0] - b[0], a[1] - b[1]]));
    });
    host.addEventListener('pointermove', (e) => {
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) {
        const d = Math.hypot(...[...pts.values()].reduce((a, b) => [a[0] - b[0], a[1] - b[1]]));
        if (pinch && Math.abs(Math.log2(d / pinch)) >= 0.6) (zoomTo(z + Math.sign(d - pinch)), (pinch = d), (moved = true));
        return;
      }
      const [cx, cy] = project(lat, lng, z);
      [lat, lng] = unproject(cx - (e.clientX - prev[0]), cy - (e.clientY - prev[1]), z);
      moved = true;
      redraw();
    });
    const up = (e) => {
      if (!pts.delete(e.pointerId)) return;
      if (pts.size < 2) pinch = 0;
      if (!pts.size && moved) (report(), (moved = false));
    };
    host.addEventListener('pointerup', up);
    host.addEventListener('pointercancel', up);
    host.addEventListener('wheel', (e) => (e.preventDefault(), zoomTo(z - Math.sign(e.deltaY))), { passive: false });
    host.querySelectorAll('[data-z]').forEach((b) => (b.onclick = () => zoomTo(z + Number(b.dataset.z))));
    const me = host.querySelector('.rf-map-me');
    me.onclick = () => {
      if (!navigator.geolocation) return opts.onError?.(w.gps);
      me.disabled = true;
      navigator.geolocation.getCurrentPosition(
        (p) => ((me.disabled = false), set(p.coords.latitude, p.coords.longitude), report()),
        () => ((me.disabled = false), opts.onError?.(w.gps)),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    };
    function set(a, b) {
      lat = clampLat(a);
      lng = wrapLng(b);
      z = Math.max(z, 17);
      redraw();
    }
    const resize = new ResizeObserver(redraw);
    resize.observe(host);
    draw();
    if (given) report();
    return { set, destroy: () => resize.disconnect() };
  }

  window.RFMapPicker = { mount, track };
})();
