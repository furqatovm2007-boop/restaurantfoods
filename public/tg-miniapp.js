/*
 * Telegram Mini App: the site opened inside Telegram (the bot's "🍽️" button or menu button).
 * Telegram's own script is loaded only when the page really runs inside Telegram (launch data in the URL
 * hash, the bot's ?source=tg_miniapp link, or the saved launch params after a reload), so ordinary
 * visitors never contact telegram.org. Inside Telegram:
 *  - ready() + expand(), dark-emerald header and background (#0a0f0d), the dark theme by default;
 *  - the launch params are taken off the URL hash (the app routes by hash) and ?go=/path opens that page;
 *  - zero-click sign-in: the signed initData goes to /api/auth/telegram-webapp, which checks Telegram's
 *    signature on the server (initDataUnsafe is never trusted);
 *  - the phone with one tap: Telegram's requestContact; the bot receives the contact and saves it;
 *  - a light haptic tap when a table, a dish or a bouquet is chosen.
 * Outside Telegram every method is a harmless no-op.
 */
(function () {
  'use strict';
  const BG = '#0a0f0d';
  const api = { active: false, webApp: null, ready: Promise.resolve(false), haptic() {}, async signIn() { return false; }, async sharePhone() { return { status: 'unavailable' }; } };
  window.RFTelegram = api;
  // Deep link from the bot (or any link): ?restaurant_id=ID&action=book opens exactly that restaurant's
  // booking room — the restaurant is fixed by its id, never guessed from a name.
  (() => {
    const q = new URLSearchParams(location.search),
      rid = q.get('restaurant_id') || '';
    if (!/^[\w-]{1,64}$/.test(rid)) return;
    if (q.get('action') === 'book') {
      try {
        sessionStorage.setItem('rf-open-booking', rid);
      } catch {}
    }
    if (!/^#\//.test(location.hash) || /tgWebApp/.test(location.hash)) {
      const url = new URL(location.href);
      url.searchParams.delete('restaurant_id');
      url.searchParams.delete('action');
      url.searchParams.delete('go');
      // Inside Telegram the hash holds its launch params: keep them; setup() opens the page after reading them.
      history.replaceState(null, '', url.pathname + url.search + (/tgWebApp/.test(location.hash) ? location.hash : '#/restaurant/' + encodeURIComponent(rid)));
      api.goTo = '/restaurant/' + rid;
    }
  })();
  let saved = false;
  try {
    saved = !!sessionStorage.getItem('__telegram__initParams');
  } catch {}
  if (!/tgWebApp/.test(location.hash) && !/[?&]source=tg_miniapp\b/.test(location.search) && !saved) return;

  const post = async (path, data) => {
    const res = await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data || {}) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(out.error || out.message || 'Xatolik'), { status: res.status });
    return out;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function setup() {
    const tg = window.Telegram?.WebApp;
    // A Mini App opened from the keyboard button next to 📎 gets no signed launch data from Telegram: it is
    // still dressed as a Telegram app, but signs in the usual way (remembered device / Telegram login).
    if (!tg || (!tg.initData && (!tg.platform || tg.platform === 'unknown'))) return false;
    api.active = !!tg.initData;
    api.webApp = tg;
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.(BG);
      tg.setBackgroundColor?.(BG);
      tg.setBottomBarColor?.(BG);
      tg.disableVerticalSwipes?.();
    } catch {}
    document.documentElement.classList.add('rf-tg');
    try {
      if (!localStorage.getItem('rf-theme')) localStorage.setItem('rf-theme', 'dark');
    } catch {}
    // Telegram puts its launch params in the hash; the app routes by hash, so open the wanted page instead.
    if (!location.hash || location.hash === '#' || /tgWebApp/.test(location.hash)) {
      const go = api.goTo || new URLSearchParams(location.search).get('go') || '';
      const target = /^\/[\w\-/%.]{1,200}$/.test(go) ? go : '/discover';
      history.replaceState(null, '', location.pathname + location.search + '#' + target);
    }
    backButton(tg);
    return api.active;
  }

  /*
   * Telegram's own back button follows the steps: full-screen hall → booking room → restaurant → list.
   * It is shown everywhere except the restaurant list.
   */
  function backButton(tg) {
    const bb = tg.BackButton;
    if (!bb) return;
    let queued = 0;
    const sync = () => {
      queued = 0;
      const deep = !!document.querySelector('dialog[open]') || !!document.querySelector('.hp-full,.hall3d-full') || !/^#\/(discover)?$/.test(location.hash || '#/discover');
      try {
        deep ? bb.show() : bb.hide();
      } catch {}
    };
    const soon = () => queued || (queued = requestAnimationFrame(sync));
    bb.onClick(() => {
      if (window.RFHallPlan?.exitFull?.()) return soon();
      const exit3d = document.getElementById('exit3d');
      if (exit3d) return exit3d.click(), soon();
      if (document.querySelector('dialog#bookingRoom[open]')) return document.getElementById('exitBookingRoom')?.click(), soon();
      const open = document.querySelector('dialog[open]');
      if (open) return open.close(), soon();
      if (history.length > 1) history.back();
      else location.hash = '#/discover';
      soon();
    });
    window.addEventListener('hashchange', soon);
    new MutationObserver(soon).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
    sync();
  }

  api.ready = new Promise((done) => {
    const timer = setTimeout(() => done(false), 5000);
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.onload = () => {
      clearTimeout(timer);
      done(setup());
    };
    script.onerror = () => {
      clearTimeout(timer);
      done(false);
    };
    document.head.appendChild(script);
  });

  api.haptic = (style = 'light') => {
    try {
      api.webApp?.HapticFeedback?.impactOccurred(style);
    } catch {}
  };

  /** Zero-click sign-in with Telegram's signed launch data. True when a session was issued. */
  api.signIn = async () => {
    if (!api.active) return false;
    try {
      await post('/api/auth/telegram-webapp', { initData: api.webApp.initData });
      return true;
    } catch (e) {
      api.lastError = e.message;
      return false;
    }
  };

  /**
   * The phone in one tap: announce the request, open Telegram's "share contact" sheet, then wait for the bot
   * to save it. Resolves to { status: 'saved' | 'switched' | 'cancelled' | 'not_uz' | 'taken' | 'timeout' | ... }.
   */
  api.sharePhone = async () => {
    const tg = api.webApp;
    if (!api.active || typeof tg?.requestContact !== 'function') return { status: 'unavailable' };
    await post('/api/auth/telegram-contact-start');
    const shared = await new Promise((resolve) => {
      try {
        tg.requestContact((ok) => resolve(!!ok));
      } catch {
        resolve(false);
      }
    });
    if (!shared) return { status: 'cancelled' };
    for (let i = 0; i < 20; i++) {
      await sleep(i < 5 ? 600 : 1200);
      const s = await post('/api/auth/telegram-contact-status').catch(() => ({ status: 'waiting' }));
      if (s.status !== 'waiting') return s;
    }
    return { status: 'timeout' };
  };

  // Choosing a table, a dish or a bouquet: a light tap.
  const PICK = '[data-table],.hp-table,.quantity-stepper button,.booking-meal-stepper button,.menu-add-cart,[data-order],.flower-card button,.decor-choice input';
  document.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest(PICK)) api.haptic('light');
  }, true);
})();
