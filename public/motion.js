/*
 * Motion layer for the SPA (no dependencies, CSP-safe: no inline styles in markup, only
 * element.style / Web Animations from this file).
 *
 *   Scroll reveal   blocks and cards rise in once (opacity, translate3d, scale) with a
 *                   60–80 ms stagger per grid wave; IntersectionObserver only, no scroll handler.
 *   Genie / FLIP    RFMotion.open(el, origin) grows a window out of the pressed element
 *                   (getBoundingClientRect) with a bend like the macOS Dock; RFMotion.close(el)
 *                   shrinks it back into the same element. Backdrops blur in at the same time.
 *   Swipe to close  RFMotion.swipe(el, close) lets phones drag a sheet down to dismiss it.
 *   Page morph      tapping a restaurant card grows a copy of the card to full screen while
 *                   the restaurant page renders underneath.
 *
 * Everything is decorative: actions run immediately, reduced-motion users get none of it,
 * and content is never left hidden if an animation is skipped.
 */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const GENIE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const STAGGER = 70;
  const canAnimate = () => !reduced.matches && typeof Element.prototype.animate === 'function';

  /* ------------------------------------------------------------ scroll reveal */

  const content = document.getElementById('content');
  const REVEAL = [
    '.market-hero', '.market-promo', '.page-head', '.panel', '.restaurant-card', '.food-card', '.plan-card',
    '.service-tile', '.row', '.booking-meal-card', '.menu-3d-launch', '.table-detail', '.info-card', '.blog-card',
  ].join(',');
  const seen = new WeakSet();
  let observer = null;
  let wave = [];
  let waveFrame = 0;

  // Elements entering together form one wave; their order in the document sets the stagger.
  function flushWave() {
    waveFrame = 0;
    const batch = wave.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    wave = [];
    batch.forEach((el, i) => {
      el.style.setProperty('--rf-reveal-delay', Math.min(i, 8) * STAGGER + 'ms');
      el.classList.add('rf-in');
      const done = () => {
        el.classList.remove('rf-reveal', 'rf-in');
        el.style.removeProperty('--rf-reveal-delay');
      };
      el.addEventListener('transitionend', (e) => e.target === el && e.propertyName === 'opacity' && done(), { once: false });
      setTimeout(done, 900 + Math.min(i, 8) * STAGGER);
    });
  }

  function scan() {
    if (!content || !observer) return;
    for (const el of content.querySelectorAll(REVEAL)) {
      if (seen.has(el)) continue;
      seen.add(el);
      // Nested matches (a row inside a panel) ride along with their parent.
      if (el.parentElement?.closest(REVEAL)?.classList.contains('rf-reveal')) continue;
      el.classList.add('rf-reveal');
      observer.observe(el);
    }
  }

  function startReveal() {
    observer?.disconnect();
    observer = null;
    document.querySelectorAll('.rf-reveal').forEach((el) => el.classList.remove('rf-reveal', 'rf-in'));
    if (!content || !canAnimate() || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          wave.push(entry.target);
        }
        if (wave.length && !waveFrame) waveFrame = requestAnimationFrame(flushWave);
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    scan();
  }

  if (content) {
    let pending = 0;
    new MutationObserver(() => {
      if (!pending) pending = requestAnimationFrame(() => ((pending = 0), scan()));
    }).observe(content, { childList: true, subtree: true });
    startReveal();
    reduced.addEventListener('change', startReveal);
  }

  /* ---------------------------------------------------------- genie / FLIP */

  // Remember what was pressed last, so a window can grow out of it even when the opener
  // does not pass an origin explicitly.
  let lastPress = null;
  document.addEventListener(
    'pointerdown',
    (e) => {
      const el = e.target.closest?.('button,a[href],[role="button"],.food-card,.restaurant-card');
      if (el) lastPress = { el, at: performance.now() };
    },
    { capture: true, passive: true },
  );
  const recentOrigin = () => (lastPress && performance.now() - lastPress.at < 1500 && lastPress.el.isConnected ? lastPress.el : null);

  const origins = new WeakMap();

  function visibleRect(el) {
    if (!el?.isConnected) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return null;
    return r;
  }
  const radiusOf = (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;

  /** Keyframes from the origin rect to the element's resting rect, with a Dock-style bend. */
  function genieFrames(el, origin, originEl) {
    const to = el.getBoundingClientRect();
    if (!to.width || !to.height) return null;
    const sx = Math.max(origin.width / to.width, 0.02);
    const sy = Math.max(origin.height / to.height, 0.02);
    const dx = origin.left - to.left;
    const dy = origin.top - to.top;
    const rFrom = (originEl ? radiusOf(originEl) : 0) || 14;
    const rTo = radiusOf(el);
    // The narrow end trails behind towards the origin, like the macOS genie.
    const bend = Math.max(-8, Math.min(8, ((origin.left + origin.width / 2 - (to.left + to.width / 2)) / innerWidth) * 18));
    const mix = (a, b, t) => a + (b - a) * t;
    return [
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, borderRadius: `${rFrom / sx}px / ${rFrom / sy}px`, opacity: 0.35 },
      { transform: `translate(${mix(dx, 0, 0.55)}px, ${mix(dy, 0, 0.62)}px) scale(${mix(sx, 1, 0.38)}, ${mix(sy, 1, 0.78)}) skewX(${bend}deg)`, opacity: 1, offset: 0.42 },
      { transform: 'none', borderRadius: `${rTo}px`, opacity: 1 },
    ];
  }

  function animateBackdrop(el, backdrop, show, duration) {
    const frames = { opacity: show ? [0, 1] : [1, 0] };
    try {
      if (backdrop) backdrop.animate(frames, { duration, easing: 'ease-out', fill: show ? 'none' : 'forwards' });
      else if (el instanceof HTMLDialogElement && el.open) el.animate(frames, { duration, easing: 'ease-out', pseudoElement: '::backdrop', fill: show ? 'none' : 'forwards' });
    } catch {
      /* ::backdrop animation unsupported: it simply appears */
    }
  }

  /**
   * Grows `el` (already shown) out of `origin` (element or DOMRect). Options: backdrop
   * (element to fade together), duration.
   */
  function open(el, origin = recentOrigin(), options = {}) {
    if (!el) return Promise.resolve();
    const originEl = origin instanceof Element ? origin : null;
    origins.set(el, { el: originEl, rect: originEl ? null : origin, backdrop: options.backdrop || null });
    if (!canAnimate()) return Promise.resolve();
    const from = originEl ? visibleRect(originEl) : origin;
    const duration = options.duration || 560;
    animateBackdrop(el, options.backdrop, true, duration * 0.7);
    if (!from) return el.animate([{ opacity: 0, transform: 'scale(0.94)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: SPRING }).finished.catch(() => {});
    const frames = genieFrames(el, from, originEl);
    if (!frames) return Promise.resolve();
    el.style.transformOrigin = '0 0';
    const anim = el.animate(frames, { duration, easing: GENIE });
    return anim.finished.catch(() => {}).finally(() => el.style.removeProperty('transform-origin'));
  }

  /** Shrinks `el` back into the element it came from; resolves when it is safe to hide it. */
  function close(el, options = {}) {
    if (!el) return Promise.resolve();
    const saved = origins.get(el) || {};
    if (!canAnimate() || el.dataset.rfClosing) return Promise.resolve();
    el.dataset.rfClosing = '1';
    const target = saved.el ? visibleRect(saved.el) : saved.rect;
    const duration = options.duration || 420;
    animateBackdrop(el, saved.backdrop, false, duration);
    let anim = null;
    const frames = target && genieFrames(el, target, saved.el);
    if (frames) {
      // Same path in reverse: fades as it is drawn into the origin.
      frames[0].opacity = 0;
      frames[1].offset = 0.58;
      el.style.transformOrigin = '0 0';
      anim = el.animate(frames.reverse(), { duration, easing: GENIE, fill: 'forwards' });
    }
    anim ??= el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.94)' }], { duration: 260, easing: 'ease-in', fill: 'forwards' });
    return anim.finished
      .catch(() => {})
      .then(() => {
        // The caller hides the element in its own .then; clear fills on the next frame.
        requestAnimationFrame(() => {
          el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
          saved.backdrop?.getAnimations().forEach((a) => a.cancel());
          el.style.removeProperty('transform-origin');
          delete el.dataset.rfClosing;
        });
      });
  }

  /** Phones: drag the sheet down from its top area (or anywhere while scrolled to the top) to close it. */
  function swipe(el, onDismiss, handle = el) {
    if (!el || el.dataset.rfSwipe) return;
    el.dataset.rfSwipe = '1';
    let start = null;
    handle.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1 || reduced.matches) return;
        const scroller = e.target.closest('[data-rf-scroll]') || el;
        if (scroller.scrollTop > 0 || e.target.closest('input,textarea,select,canvas,[data-no-swipe]')) return;
        start = { y: e.touches[0].clientY, x: e.touches[0].clientX, t: performance.now(), dy: 0 };
      },
      { passive: true },
    );
    handle.addEventListener(
      'touchmove',
      (e) => {
        if (!start) return;
        const dy = e.touches[0].clientY - start.y;
        if (Math.abs(e.touches[0].clientX - start.x) > Math.abs(dy) && start.dy === 0) {
          start = null;
          return;
        }
        start.dy = Math.max(0, dy);
        el.style.transform = `translate3d(0, ${start.dy}px, 0) scale(${1 - Math.min(start.dy, 400) / 4000})`;
      },
      { passive: true },
    );
    const end = () => {
      if (!start) return;
      const { dy, t } = start;
      start = null;
      const fast = dy / Math.max(1, performance.now() - t) > 0.6;
      if (dy > 120 || (fast && dy > 40)) {
        el.style.removeProperty('transform');
        onDismiss();
      } else if (dy > 0) {
        el.animate([{ transform: el.style.transform }, { transform: 'none' }], { duration: 320, easing: SPRING });
        el.style.removeProperty('transform');
      }
    };
    handle.addEventListener('touchend', end, { passive: true });
    handle.addEventListener('touchcancel', end, { passive: true });
  }

  /* --------------------------------------------------- restaurant page morph */

  // The card grows to fill the screen while the restaurant page renders under it, then fades.
  document.addEventListener(
    'click',
    (e) => {
      const card = e.target.closest?.('.restaurant-card');
      if (!card || !canAnimate() || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = e.target.closest('a[href^="#/restaurant/"]') || (!e.target.closest('a,button,input,select') && card.querySelector('a[href^="#/restaurant/"]'));
      if (!link) return;
      const from = visibleRect(card);
      if (!from) return;
      const ghost = card.cloneNode(true);
      ghost.classList.remove('rf-reveal', 'rf-in', 'cursor-lit', 'market-reveal');
      ghost.classList.add('rf-morph-ghost');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      Object.assign(ghost.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' });
      document.body.append(ghost);
      const sx = innerWidth / from.width;
      const sy = innerHeight / from.height;
      const grow = ghost.animate(
        [
          { transform: 'none', borderRadius: radiusOf(card) + 'px', opacity: 1 },
          { transform: `translate(${-from.left * 0.6}px, ${-from.top * 0.7}px) scale(${1 + (sx - 1) * 0.45}, ${1 + (sy - 1) * 0.75})`, opacity: 1, offset: 0.45 },
          { transform: `translate(${-from.left}px, ${-from.top}px) scale(${sx}, ${sy})`, borderRadius: '0px', opacity: 1 },
        ],
        { duration: 520, easing: GENIE, fill: 'forwards' },
      );
      // The card's text would stretch with the scale, so it fades early and the surface grows on.
      for (const child of ghost.children) child.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
      const fade = () => ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'forwards' }).finished.finally(() => ghost.remove());
      grow.finished.then(fade, () => ghost.remove());
      setTimeout(() => ghost.isConnected && ghost.remove(), 2000);
    },
    { capture: true },
  );

  window.RFMotion = { open, close, swipe, origin: recentOrigin, reveal: scan };
})();
