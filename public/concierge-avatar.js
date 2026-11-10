/*
 * The AI concierge: a vector character (SVG) in the site's dark-emerald and gold style, drawn and animated
 * here — no 3D model, no outside files. Same interface the voice assistant (ai-chat.js) used for the old
 * robot: RFRobotViewer.mount(host, {ready, error}) → {mode, speak, gesture, idle, pause, destroy}, plus
 * level(v, bright) for words shown without sound (the welcome guide, welcome-guide.js).
 *
 * Lip-sync: while the AI voice plays, ai-chat.js hands over the AnalyserNode connected to that very sound
 * (speak(analyser)); every animation frame reads getByteFrequencyData and turns it into a mouth shape:
 *  - loudness of the speech band (≈150–4000 Hz) → how far the mouth opens;
 *  - where the energy sits (spectral centroid: low → "o / u", high → "e / i / s") → round or wide;
 *  - five visemes: rest (closed smile), closed lips (m / b / p, short dips), small open (e / i), wide open (a)
 *    and round (o / u), blended smoothly. Opening is fast, closing faster, and the moment the sound stops
 *    (speak(null) or silence) the mouth shuts and returns to the smile — it never "chews" on its own.
 * Head and body: idle — blinks every 3–4 s, breathing, a slow head sway; listening — the head tilts, brows go
 * up, eyes open a little wider; thinking — eyes look up, the halo spins faster; speaking — small nods and a
 * hand gesture that follow the rhythm (energy onsets) of the voice. Reduced motion keeps only the mouth and
 * blinks. The loop stops while paused, destroyed or hidden.
 */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;

  const svgMarkup = (id) => `<svg class="rf-concierge" viewBox="0 0 200 260" role="img" aria-label="RestaurantFoods AI concierge" xmlns="${NS}">
  <defs>
    <radialGradient id="${id}-halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#34d399" stop-opacity=".28"/><stop offset=".62" stop-color="#10b981" stop-opacity=".08"/><stop offset="1" stop-color="#064e3b" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-ring" x1="0" x2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset=".5" stop-color="#34d399"/><stop offset="1" stop-color="#d4a017"/></linearGradient>
    <linearGradient id="${id}-suit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f5f4a"/><stop offset="1" stop-color="#06291f"/></linearGradient>
    <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7a1"/><stop offset=".5" stop-color="#d9a92c"/><stop offset="1" stop-color="#9a6b0c"/></linearGradient>
    <linearGradient id="${id}-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d3b3"/><stop offset="1" stop-color="#e2ae86"/></linearGradient>
    <linearGradient id="${id}-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b211c"/><stop offset="1" stop-color="#120c09"/></linearGradient>
    <clipPath id="${id}-mouth"><path data-mouth-clip d="M84 152 Q100 158 116 152 Q100 158 84 152Z"/></clipPath>
  </defs>
  <g class="rf-c-halo"><circle cx="100" cy="128" r="96" fill="url(#${id}-halo)"/><g data-ring><ellipse cx="100" cy="128" rx="88" ry="88" fill="none" stroke="url(#${id}-ring)" stroke-width="1.6" stroke-dasharray="3 9" opacity=".75"/><ellipse cx="100" cy="128" rx="78" ry="78" fill="none" stroke="url(#${id}-ring)" stroke-width=".8" stroke-dasharray="40 14 6 14" opacity=".55"/></g></g>
  <ellipse cx="100" cy="251" rx="62" ry="7" fill="#34d399" opacity=".18"/>
  <g data-body>
    <path d="M30 262 C32 214 58 196 100 194 C142 196 168 214 170 262Z" fill="url(#${id}-suit)"/>
    <path d="M84 196 L100 236 L116 196 Q100 202 84 196Z" fill="#f8fafc"/>
    <path d="M84 196 L72 212 L94 252 L100 236Z M116 196 L128 212 L106 252 L100 236Z" fill="#0b4a39" stroke="url(#${id}-gold)" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M91 203 L100 209 L109 203 L109 214 L100 209 L91 214Z" fill="url(#${id}-gold)"/>
    <circle cx="100" cy="209" r="2.2" fill="#9a6b0c"/>
    <g transform="translate(132 226)"><rect x="-9" y="-6" width="18" height="12" rx="3" fill="url(#${id}-gold)"/><text y="3.2" text-anchor="middle" font-size="7.5" font-weight="800" font-family="system-ui" fill="#06291f">RF</text></g>
    <path d="M40 234 Q36 250 38 262" stroke="#d9a92c" stroke-width="1.2" fill="none" opacity=".6"/><path d="M160 234 Q164 250 162 262" stroke="#d9a92c" stroke-width="1.2" fill="none" opacity=".6"/>
    <g data-hand transform="translate(150 236)"><path d="M0 0 C6 -14 10 -26 8 -38" stroke="url(#${id}-suit)" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M8 -38 L8 -42" stroke="#d9a92c" stroke-width="15" stroke-linecap="round"/><g transform="translate(8 -50)"><ellipse rx="8" ry="9" fill="url(#${id}-skin)"/><path d="M-6 -6 L-7 -14 M-2 -8 L-2 -17 M2 -8 L3 -16 M6 -5 L8 -12" stroke="url(#${id}-skin)" stroke-width="3.6" stroke-linecap="round"/></g></g>
  </g>
  <g data-head>
    <path d="M90 176 L90 194 Q100 200 110 194 L110 176Z" fill="#dba27a"/>
    <ellipse cx="62" cy="128" rx="7" ry="11" fill="#e8b892"/><ellipse cx="138" cy="128" rx="7" ry="11" fill="#e8b892"/>
    <path d="M62 116 C60 76 82 60 100 60 C118 60 140 76 138 116 C138 150 124 178 100 180 C76 178 62 150 62 116Z" fill="url(#${id}-skin)"/>
    <path d="M60 116 C54 74 78 52 104 54 C128 56 146 74 140 112 C136 96 128 84 118 80 C104 88 82 90 70 86 C64 94 62 104 60 116Z" fill="url(#${id}-hair)"/>
    <path d="M70 86 C84 90 104 88 118 80" stroke="#3b2c24" stroke-width="1.4" fill="none" opacity=".6"/>
    <g data-brows><path data-brow-l d="M74 106 Q84 100 94 105" stroke="#2b211c" stroke-width="3.4" stroke-linecap="round" fill="none"/><path data-brow-r d="M106 105 Q116 100 126 106" stroke="#2b211c" stroke-width="3.4" stroke-linecap="round" fill="none"/></g>
    <g data-eye="l" transform="translate(84 120)"><g data-lid><ellipse rx="9" ry="6.5" fill="#fff"/><g data-iris><circle r="4.6" fill="#0f766e"/><circle r="4.6" fill="none" stroke="#064e3b" stroke-width="1"/><circle r="2.2" fill="#03201a"/><circle cx="1.6" cy="-1.6" r="1.2" fill="#fff"/></g></g><path d="M-10 -1 Q0 -9 10 -1" stroke="#2b211c" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>
    <g data-eye="r" transform="translate(116 120)"><g data-lid><ellipse rx="9" ry="6.5" fill="#fff"/><g data-iris><circle r="4.6" fill="#0f766e"/><circle r="4.6" fill="none" stroke="#064e3b" stroke-width="1"/><circle r="2.2" fill="#03201a"/><circle cx="1.6" cy="-1.6" r="1.2" fill="#fff"/></g></g><path d="M-10 -1 Q0 -9 10 -1" stroke="#2b211c" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>
    <path d="M100 124 Q96 138 99 141 Q102 142 104 140" stroke="#c98f68" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="78" cy="144" rx="7" ry="4" fill="#f08a7a" opacity=".22"/><ellipse cx="122" cy="144" rx="7" ry="4" fill="#f08a7a" opacity=".22"/>
    <g data-mouth>
      <path data-mouth-in d="M84 152 Q100 158 116 152 Q100 158 84 152Z" fill="#4a1414"/>
      <g clip-path="url(#${id}-mouth)"><rect data-teeth x="84" y="140" width="32" height="6" rx="2" fill="#fbfbf7"/><ellipse data-tongue cx="100" cy="166" rx="10" ry="5" fill="#d9536a"/></g>
      <path data-lips d="M84 152 Q100 158 116 152" stroke="#b5544f" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
</svg>`;

  // Five visemes as [open 0–1, wide 0–1, round 0–1].
  const VISEMES = { rest: [0, 0, 0], closed: [0.02, 0.15, 0], small: [0.32, 0.9, 0], wide: [0.95, 0.65, 0], round: [0.55, 0, 1] };
  const lerp = (a, b, t) => a + (b - a) * t;

  function mount(host, callbacks = {}) {
    const id = 'rfc' + ++uid;
    host.innerHTML = svgMarkup(id);
    const svg = host.querySelector('svg');
    const $ = (s) => svg.querySelector(s);
    const head = $('[data-head]'),
      body = $('[data-body]'),
      hand = $('[data-hand]'),
      ring = $('[data-ring]'),
      brows = $('[data-brows]'),
      lids = [...svg.querySelectorAll('[data-lid]')],
      irises = [...svg.querySelectorAll('[data-iris]')],
      inner = $('[data-mouth-in]'),
      clip = $('[data-mouth-clip]'),
      lips = $('[data-lips]'),
      teeth = $('[data-teeth]'),
      tongue = $('[data-tongue]');
    let mode = 'idle',
      manual = null,
      analyser = null,
      bins = null,
      raf = 0,
      held = false,
      closed = false,
      t0 = performance.now(),
      nextBlink = t0 + 2500,
      blinkAt = -1,
      gestureAt = -1e9,
      lastLevel = 0,
      nod = 0;
    // The smoothed mouth: open / wide / round.
    const m = { open: 0, wide: 0, round: 0 };

    /** The mouth shape for open 0–1, wide 0–1, round 0–1 (centre 100,152). */
    function drawMouth() {
      const o = m.open,
        half = 15 + 4 * m.wide - 6.5 * m.round,
        gap = o * 15,
        cx = 100,
        cy = 152,
        smile = (1 - Math.min(1, o * 2.2)) * 5 * (1 - m.round),
        left = cx - half,
        right = cx + half;
      const top = cy - gap * 0.32,
        bottom = cy + gap * 0.68;
      // Round lips pull the corners in and make the opening an "o".
      const k = m.round * 0.9;
      const d = `M${left} ${cy} C${lerp(left, cx - half * 0.6, k)} ${top - 3 - gap * 0.1} ${lerp(right, cx + half * 0.6, k)} ${top - 3 - gap * 0.1} ${right} ${cy} C${lerp(right, cx + half * 0.7, k)} ${bottom + 4 + smile} ${lerp(left, cx - half * 0.7, k)} ${bottom + 4 + smile} ${left} ${cy}Z`;
      if (o < 0.03) {
        const rest = `M${left} ${cy} Q${cx} ${cy + 6 + smile * 0.4} ${right} ${cy}`;
        inner.setAttribute('d', rest + 'Z');
        clip.setAttribute('d', rest + 'Z');
        lips.setAttribute('d', rest);
        inner.setAttribute('opacity', '0');
      } else {
        inner.setAttribute('d', d);
        clip.setAttribute('d', d);
        lips.setAttribute('d', d);
        inner.setAttribute('opacity', '1');
      }
      teeth.setAttribute('y', String(top - 4));
      teeth.setAttribute('opacity', o > 0.12 ? String(Math.min(1, (o - 0.12) * 4) * (1 - m.round * 0.7)) : '0');
      tongue.setAttribute('cy', String(bottom + 3 - o * 4));
      tongue.setAttribute('opacity', o > 0.35 ? '1' : '0');
    }

    /** Speech band loudness (0–1) and brightness (0 low … 1 high) from the playing voice. */
    function measure() {
      if (!analyser) return null;
      bins ||= new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(bins);
      const hz = (analyser.context?.sampleRate || 48000) / 2 / bins.length;
      const lo = Math.max(1, Math.floor(150 / hz)),
        hi = Math.min(bins.length - 1, Math.ceil(4000 / hz));
      let sum = 0,
        weighted = 0,
        peak = 0;
      for (let i = lo; i <= hi; i++) {
        const v = bins[i] / 255;
        sum += v;
        weighted += v * i * hz;
        if (v > peak) peak = v;
      }
      // Loudness from the strongest formant and the overall band energy (byte data is already in dB).
      const n = hi - lo + 1,
        level = Math.min(1, Math.max(0, (0.55 * peak + 0.45 * Math.min(1, (sum / n) * 3) - 0.22) / 0.6));
      // Spectral centroid: ≈ 500–700 Hz for "o / u", ≈ 1000–1400 Hz for "a", 1700 Hz and up for "e / i / s".
      const centroid = sum ? weighted / sum : 0;
      return { level, bright: Math.max(0, Math.min(1, (centroid - 600) / 1300)) };
    }

    function target(a) {
      // Silence: the mouth shuts at once.
      if (!a || a.level < 0.04) return VISEMES.rest;
      if (a.level < 0.12) return VISEMES.closed;
      // Loudness opens; brightness decides wide (e / i / s) or round (o / u); in between, the open "a".
      if (a.bright > 0.8) return a.level > 0.55 ? mix(VISEMES.small, VISEMES.wide, 0.35) : VISEMES.small;
      if (a.bright < 0.12) return a.level > 0.3 ? VISEMES.round : mix(VISEMES.round, VISEMES.small, 0.4);
      return mix(VISEMES.small, VISEMES.wide, Math.min(1, a.level * 1.4));
    }
    const mix = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)];

    function frame(now) {
      raf = 0;
      if (closed || held) return;
      const t = (now - t0) / 1000,
        still = reducedMotion();
      // Mouth.
      const a = analyser ? measure() : manual;
      const [to, tw, tr] = target(a);
      const level = a ? a.level : 0;
      const opening = to > m.open;
      m.open = lerp(m.open, to * (0.55 + Math.min(1, level * 1.2) * 0.45), opening ? 0.65 : 0.8);
      m.wide = lerp(m.wide, tw, 0.4);
      m.round = lerp(m.round, tr, 0.4);
      if (to === 0 && m.open < 0.02) m.open = 0;
      drawMouth();
      // Rhythm: a fresh burst of energy is a stressed syllable → a small nod, sometimes a hand gesture.
      if (level - lastLevel > 0.22) {
        nod = Math.min(1, nod + 0.6);
        if (now - gestureAt > 1600 && level > 0.5) gestureAt = now;
      }
      lastLevel = lerp(lastLevel, level, 0.5);
      nod *= 0.88;
      // Eyes: blink every 3–4 s (both lids together), a double blink now and then.
      if (now > nextBlink) {
        blinkAt = now;
        nextBlink = now + 3000 + Math.random() * 1000 + (Math.random() < 0.15 ? -2700 : 0);
      }
      const b = blinkAt < 0 ? 1 : Math.min(1, Math.abs(now - blinkAt - 70) / 70);
      const wideEyes = mode === 'listening' ? 1.12 : 1;
      for (const lid of lids) lid.setAttribute('transform', `scale(1 ${Math.max(0.08, b) * wideEyes})`);
      const look = mode === 'thinking' ? [2.2, -2] : mode === 'listening' ? [-1, 0] : [Math.sin(t * 0.7) * 1.2, Math.sin(t * 0.43) * 0.6];
      for (const iris of irises) iris.setAttribute('transform', `translate(${look[0]} ${look[1]})`);
      brows.setAttribute('transform', `translate(0 ${mode === 'listening' ? -3.5 : mode === 'thinking' ? -1.5 : -level * 1.6})`);
      // Head and body.
      if (still) {
        head.setAttribute('transform', mode === 'listening' ? 'rotate(-5 100 176)' : '');
        body.removeAttribute('transform');
        hand.setAttribute('transform', 'translate(150 236)');
      } else {
        const breathe = Math.sin(t * 1.6) * 0.012;
        const tilt = mode === 'listening' ? -7 : mode === 'thinking' ? 4 : Math.sin(t * 0.5) * 2;
        const sway = mode === 'speaking' ? Math.sin(t * 2.3) * 1.5 : 0;
        head.setAttribute('transform', `translate(0 ${breathe * 60 + nod * 2.4}) rotate(${tilt + sway + nod * 2} 100 176)`);
        body.setAttribute('transform', `translate(100 262) scale(1 ${1 + breathe}) translate(-100 -262)`);
        const g = Math.max(0, 1 - (now - gestureAt) / 1100),
          wave = Math.sin(Math.min(1, (now - gestureAt) / 1100) * Math.PI);
        hand.setAttribute('transform', `translate(150 ${236 - wave * 6}) rotate(${-g * 18 * wave + (mode === 'speaking' ? Math.sin(t * 3.1) * 3 * level : 0)})`);
        ring.setAttribute('transform', `rotate(${(t * (mode === 'thinking' ? 60 : 12)) % 360} 100 128)`);
      }
      svg.dataset.mode = mode;
      raf = requestAnimationFrame(frame);
    }
    const run = () => {
      if (!raf && !closed && !held) raf = requestAnimationFrame(frame);
    };
    drawMouth();
    run();
    setTimeout(() => !closed && callbacks.ready?.(), 0);
    return {
      mode(name) {
        mode = ['listening', 'thinking', 'speaking'].includes(name) ? name : 'idle';
        if (mode !== 'speaking' && !analyser) m.open = Math.min(m.open, 0.1);
        held = false;
        run();
      },
      speak(node) {
        analyser = node || null;
        bins = null;
        if (!node) {
          // The voice stopped: close at once and return to the smile.
          m.open = 0;
          m.wide = 0;
          m.round = 0;
          drawMouth();
        }
        held = false;
        run();
      },
      /** Text without sound (the welcome guide types its words): the caller drives the mouth syllable by syllable. */
      level(v, bright = 0.5) {
        manual = v == null ? null : { level: Math.max(0, Math.min(1, v)), bright };
        if (manual == null) m.open = 0;
        held = false;
        run();
      },
      gesture() {
        gestureAt = performance.now();
        held = false;
        run();
      },
      idle() {
        mode = 'idle';
        held = false;
        run();
      },
      pause() {
        held = true;
        analyser = null;
        cancelAnimationFrame(raf);
        raf = 0;
        m.open = 0;
        drawMouth();
      },
      destroy() {
        closed = true;
        cancelAnimationFrame(raf);
        raf = 0;
        analyser = null;
        host.innerHTML = '';
      },
    };
  }
  window.RFRobotViewer = { mount };
  window.RFConcierge = { mount, VISEMES };
})();
