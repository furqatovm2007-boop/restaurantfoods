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
 *   Page morph      every route change grows the new page out of the pressed button or card
 *                   (View Transitions API, clip-path from its rect) and, going back, shrinks
 *                   the page into the element it came from. Without the API a copy of the
 *                   pressed element grows to full screen instead.
 *   Press spring    every button, link and card dips to scale(0.95) and springs back.
 *   Dialogs         any <dialog>.showModal() grows from the pressed element; close() shrinks back.
 *
 * Everything is decorative: actions run immediately, reduced-motion users get none of it,
 * and content is never left hidden if an animation is skipped.
 */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const GENIE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const STAGGER = 60;
  const canAnimate = () => !reduced.matches && typeof Element.prototype.animate === 'function';

  /* ------------------------------------------------------------ scroll reveal */

  const content = document.getElementById('content');
  const REVEAL = [
    '.market-hero', '.market-promo', '.page-head', '.panel', '.restaurant-card', '.food-card', '.plan-card',
    '.service-tile', '.row', '.booking-meal-card', '.menu-3d-launch', '.table-detail', '.info-card', '.blog-card',
    '.card', '.empty', '.notice', 'details', '#content article',
  ].join(',');
  const seen = new WeakSet();
  let observer = null;
  let morphing = false;
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
      // During a page morph the first screen is part of the transition; only what is below it reveals.
      if (morphing && el.getBoundingClientRect().top < innerHeight) continue;
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
    origins.set(el, { el: originEl, rect: originEl ? null : origin, backdrop: options.backdrop || null, at: performance.now() });
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

  /* ------------------------------------------------------ press spring */

  const PRESSABLE = 'button,a[href],[role="button"],.restaurant-card,.food-card,.plan-card,.service-tile,summary';
  // :active gives the instant dip (CSS `scale`, which composes with any transform); on release
  // the element springs back with a small overshoot.
  document.addEventListener(
    'pointerup',
    (e) => {
      const el = e.target.closest?.(PRESSABLE);
      if (!el || !canAnimate() || el.matches(':disabled,[aria-disabled="true"]')) return;
      el.animate([{ scale: '0.95' }, { scale: '1.02', offset: 0.55 }, { scale: '1' }], { duration: 420, easing: SPRING });
    },
    { passive: true },
  );

  /* -------------------------------------------------- page transitions */

  const root = document.documentElement;
  const trail = [location.hash];
  // Where each route was opened from, so going back can shrink into the same element.
  const openedFrom = new Map();
  const insetOf = (r, radius) => `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${radius}px)`;
  const midInset = (r, t) => {
    // Genie: the window stretches vertically first and widens later.
    const v = 0.78, h = 0.38;
    return `inset(${r.top * (1 - v)}px ${(innerWidth - r.right) * (1 - h)}px ${(innerHeight - r.bottom) * (1 - v)}px ${r.left * (1 - h)}px round ${t}px)`;
  };
  const whenDone = (update) => Promise.race([Promise.resolve().then(update), new Promise((r) => setTimeout(r, 1200))]).catch(() => {}).then(() => scan());

  function findOrigin(saved) {
    if (saved?.href) {
      const el = [...document.querySelectorAll('a[href]')].find((a) => a.getAttribute('href') === saved.href);
      const rect = el && visibleRect(el.closest('.restaurant-card,.food-card,.plan-card,.service-tile') || el);
      if (rect) return { rect, radius: radiusOf(el) || 14 };
    }
    return saved?.rect ? saved : null;
  }

  /** Runs `update` (the SPA render) inside a morph from the pressed element, or back into it. */
  function navigate(update) {
    const hash = location.hash;
    const back = trail.length > 1 && trail[trail.length - 2] === hash;
    const leaving = trail[trail.length - 1];
    if (back) trail.pop();
    else trail.push(hash), trail.length > 40 && trail.shift();
    let from = null;
    if (!back) {
      const el = recentOrigin();
      const target = el && (el.closest('.restaurant-card,.food-card,.plan-card,.service-tile') || el);
      const rect = target && visibleRect(target);
      if (rect) {
        from = { rect, radius: radiusOf(target) || 14 };
        openedFrom.set(hash, { rect, radius: from.radius, href: el.closest('a[href]')?.getAttribute('href') || null });
      }
    }
    if (!canAnimate()) return update();
    if (!document.startViewTransition) return fallbackMorph(back ? null : from, update);
    root.classList.toggle('rf-vt-back', back);
    morphing = true;
    let vt;
    try {
      vt = document.startViewTransition(() => whenDone(update));
    } catch {
      morphing = false;
      return update();
    }
    vt.ready
      .then(() => {
        const opts = { duration: back ? 460 : 560, easing: GENIE, fill: 'both' };
        const full = 'inset(0px 0px 0px 0px round 0px)';
        if (back) {
          const into = findOrigin(openedFrom.get(leaving));
          openedFrom.delete(leaving);
          if (into) root.animate({ clipPath: [full, midInset(into.rect, into.radius), insetOf(into.rect, into.radius)], opacity: [1, 1, 0.2] }, { ...opts, pseudoElement: '::view-transition-old(root)' });
          else root.animate({ opacity: [1, 0], transform: ['none', 'translate3d(0, 30px, 0) scale(0.97)'] }, { ...opts, duration: 320, pseudoElement: '::view-transition-old(root)' });
          root.animate({ opacity: [0.6, 1], transform: ['scale(0.97)', 'none'] }, { ...opts, pseudoElement: '::view-transition-new(root)' });
        } else if (from) {
          root.animate({ clipPath: [insetOf(from.rect, from.radius), midInset(from.rect, from.radius), full] }, { ...opts, pseudoElement: '::view-transition-new(root)' });
          root.animate({ opacity: [1, 0.55], transform: ['none', 'scale(0.95)'] }, { ...opts, pseudoElement: '::view-transition-old(root)' });
        } else {
          root.animate({ opacity: [0, 1], transform: ['translate3d(0, 24px, 0)', 'none'] }, { ...opts, duration: 420, easing: SPRING, pseudoElement: '::view-transition-new(root)' });
          root.animate({ opacity: [1, 0] }, { ...opts, duration: 260, pseudoElement: '::view-transition-old(root)' });
        }
      })
      .catch(() => {});
    vt.finished.finally(() => {
      root.classList.remove('rf-vt-back');
      morphing = false;
    });
    return vt.updateCallbackDone;
  }

  // Browsers without View Transitions: a copy of the pressed element grows to full screen
  // while the new page renders underneath, then fades away.
  function fallbackMorph(from, update) {
    const source = from && recentOrigin();
    const result = update();
    if (!from || !source) return result;
    const card = source.closest('.restaurant-card,.food-card,.plan-card,.service-tile') || source;
    const ghost = card.cloneNode(true);
    ghost.classList.remove('rf-reveal', 'rf-in', 'cursor-lit', 'market-reveal');
    ghost.classList.add('rf-morph-ghost');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    const r = from.rect;
    Object.assign(ghost.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    document.body.append(ghost);
    const sx = innerWidth / r.width, sy = innerHeight / r.height;
    const grow = ghost.animate(
      [
        { transform: 'none', borderRadius: from.radius + 'px' },
        { transform: `translate(${-r.left * 0.6}px, ${-r.top * 0.7}px) scale(${1 + (sx - 1) * 0.45}, ${1 + (sy - 1) * 0.75})`, offset: 0.45 },
        { transform: `translate(${-r.left}px, ${-r.top}px) scale(${sx}, ${sy})`, borderRadius: '0px' },
      ],
      { duration: 520, easing: GENIE, fill: 'forwards' },
    );
    // The copy's text would stretch with the scale, so it fades first and the surface grows on.
    for (const child of ghost.children) child.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
    grow.finished.then(() => ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'forwards' }).finished, () => {}).finally(() => ghost.remove());
    setTimeout(() => ghost.isConnected && ghost.remove(), 2000);
    return result;
  }

  /* ------------------------------------------------------------ dialogs */

  // Any modal dialog grows out of the pressed element and shrinks back on close(). Openers
  // that call RFMotion.open themselves (with an explicit origin) are not animated twice.
  if (typeof HTMLDialogElement === 'function') {
    const showModal = HTMLDialogElement.prototype.showModal;
    const closeDialog = HTMLDialogElement.prototype.close;
    HTMLDialogElement.prototype.showModal = function (...args) {
      const result = showModal.apply(this, args);
      const at = performance.now();
      queueMicrotask(() => {
        if (this.open && !((origins.get(this)?.at ?? -1) >= at) && this.dataset.rfMotion !== 'off') open(this);
      });
      return result;
    };
    HTMLDialogElement.prototype.close = function (...args) {
      if (!this.open || this.dataset.rfClosing || !origins.has(this) || !canAnimate() || this.dataset.rfMotion === 'off') return closeDialog.apply(this, args);
      close(this).then(() => this.open && closeDialog.apply(this, args));
    };
  }

  window.RFMotion = { open, close, swipe, navigate, origin: recentOrigin, reveal: scan };
})();
