/*
 * Installable apps (PWA): one per role, all on this site.
 *   client      RestaurantFoods          start: #/discover
 *   restaurant  RestaurantFoods Biznes   start: #/manage   (restaurant owners, administrators)
 *   courier     RestaurantFoods Kuryer   start: #/courier
 * The page's manifest follows the signed-in role, a slim "install the app" bar sits at the top
 * of the site (until installed or dismissed for a week), and right after the first sign-in the
 * matching app is offered once. Android/desktop Chrome use the native install prompt; iPhone
 * gets the Share → "Add to Home Screen" steps, since Safari has no install API.
 */
(() => {
  'use strict';
  const COPY = {
    uz: { bar: 'RestaurantFoods ilovasini o‘rnating — tezroq va to‘liq ekranda', install: 'Yuklab olish', close: 'Yopish', askTitle: 'Ilovani o‘rnating', askClient: 'Restoran tanlash, 3D menyu va bronlar telefoningizda bitta bosishda.', askRestaurant: 'Restoran kabineti alohida ilova: bronlar, menyu, jonli stollar va Admin AI.', askCourier: 'Kuryer ilovasi: buyurtmalar va xarita doim qo‘l ostida.', later: 'Keyinroq', iosTitle: 'iPhone’ga o‘rnatish', ios: ['Pastdagi «Ulashish» tugmasini bosing (⬆️ kvadrat).', '«Bosh ekranga qo‘shish» (Add to Home Screen) ni tanlang.', '«Qo‘shish» ni bosing.'], manual: 'Brauzer menyusidan (⋮) «Ilovani o‘rnatish» yoki «Bosh ekranga qo‘shish» ni tanlang.', ok: 'Tushunarli' },
    ru: { bar: 'Установите приложение RestaurantFoods — быстрее и на весь экран', install: 'Скачать', close: 'Закрыть', askTitle: 'Установите приложение', askClient: 'Выбор ресторана, 3D-меню и брони в одно касание.', askRestaurant: 'Кабинет ресторана отдельным приложением: брони, меню, живые столы и Admin AI.', askCourier: 'Приложение курьера: заказы и карта всегда под рукой.', later: 'Позже', iosTitle: 'Установка на iPhone', ios: ['Нажмите «Поделиться» внизу (квадрат со стрелкой).', 'Выберите «На экран «Домой»».', 'Нажмите «Добавить».'], manual: 'В меню браузера (⋮) выберите «Установить приложение» или «Добавить на главный экран».', ok: 'Понятно' },
    en: { bar: 'Install the RestaurantFoods app — faster and full screen', install: 'Download', close: 'Close', askTitle: 'Install the app', askClient: 'Restaurants, the 3D menu and bookings one tap away.', askRestaurant: 'Your restaurant dashboard as its own app: bookings, menu, live tables and Admin AI.', askCourier: 'The courier app: orders and the map always at hand.', later: 'Later', iosTitle: 'Install on iPhone', ios: ['Tap Share at the bottom (square with an arrow).', 'Choose “Add to Home Screen”.', 'Tap “Add”.'], manual: 'Open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.', ok: 'Got it' },
  };
  const words = () => COPY[document.documentElement.lang] || COPY.uz;
  const store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* private mode */
      }
    },
  };
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null;
  let app = 'client';

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    showBar();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    store.set('rf-app-installed', '1');
    document.querySelector('.rf-app-bar')?.remove();
  });

  function setManifest(role) {
    const next = role === 'restaurant_owner' || role === 'admin' ? 'restaurant' : role === 'courier' ? 'courier' : 'client';
    if (next === app && document.querySelector('link[rel=manifest]')) return;
    app = next;
    let link = document.querySelector('link[rel=manifest]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.append(link);
    }
    link.href = '/manifest-' + app + '.webmanifest?v=2';
  }

  function install() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.finally(() => (deferred = null));
      return;
    }
    const w = words();
    sheet(ios ? w.iosTitle : w.askTitle, ios ? '<ol>' + w.ios.map((s) => '<li>' + s + '</li>').join('') + '</ol>' : '<p>' + w.manual + '</p>', [[w.ok, null]]);
  }

  function sheet(title, html, actions) {
    document.querySelector('.rf-app-sheet')?.remove();
    const d = document.createElement('dialog');
    d.className = 'rf-app-sheet';
    d.innerHTML = '<img src="/app-icons/' + app + '-192.png?v=2" alt="" width="64" height="64"><h2></h2><div class="rf-app-sheet-body">' + html + '</div><div class="rf-app-sheet-actions"></div>';
    d.querySelector('h2').textContent = title;
    for (const [label, run] of actions) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = run ? 'primary' : 'quiet';
      b.textContent = label;
      b.onclick = () => {
        d.close();
        d.remove();
        run?.();
      };
      d.querySelector('.rf-app-sheet-actions').append(b);
    }
    document.body.append(d);
    d.showModal();
  }

  function showBar() {
    if (standalone() || store.get('rf-app-installed') || document.querySelector('.rf-app-bar')) return;
    const until = Number(store.get('rf-app-bar-hidden') || 0);
    if (until > Date.now()) return;
    // Only where installing is possible: the browser offered it, or an iPhone/iPad.
    if (!deferred && !ios) return;
    const w = words();
    const bar = document.createElement('div');
    bar.className = 'rf-app-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', w.install);
    bar.innerHTML = '<img src="/app-icons/' + app + '-192.png?v=2" alt="" width="36" height="36"><span></span><button type="button" class="primary" data-install></button><button type="button" class="icon" data-close>×</button>';
    bar.querySelector('span').textContent = w.bar;
    bar.querySelector('[data-install]').textContent = w.install;
    bar.querySelector('[data-close]').setAttribute('aria-label', w.close);
    bar.querySelector('[data-install]').onclick = install;
    bar.querySelector('[data-close]').onclick = () => {
      store.set('rf-app-bar-hidden', String(Date.now() + 7 * 86400000));
      bar.remove();
    };
    document.body.prepend(bar);
  }

  /** Called by the SPA with the signed-in user: picks the role's app and offers it once. */
  function signedIn(user) {
    setManifest(user?.role);
    if (!user?.id || standalone() || store.get('rf-app-installed')) return;
    // An electronic receipt opened from its QR code is shown alone (the offer waits for another page).
    if (/^#\/chek\//.test(location.hash)) return;
    const key = 'rf-app-asked-' + user.id;
    if (store.get(key)) return;
    store.set(key, '1');
    const w = words();
    const text = app === 'restaurant' ? w.askRestaurant : app === 'courier' ? w.askCourier : w.askClient;
    setTimeout(() => sheet(w.askTitle, '<p>' + text + '</p>', [[w.install, install], [w.later, null]]), 1200);
  }

  setManifest(null);
  if (ios) window.addEventListener('load', showBar);
  window.RFApp = { signedIn, install, setManifest };
})();
