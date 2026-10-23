/*
 * Smart waitlist on the customer side. A button on an occupied table ([data-waitlist]) joins the
 * queue; while the customer waits, the page checks every 20 s. When the camera (or staff) frees
 * the table the customer holds it for 10 minutes: a banner with a countdown and a "Book now"
 * button appears, plus a system notification if the browser allows them.
 */
(() => {
  'use strict';
  const COPY = {
    uz: { joined: 'Navbatga yozildingiz', place: 'o‘rin', ready: 'stol bo‘shadi!', hold: 'Sizga ajratilgan vaqt', book: 'Hozir bron qilish', leave: 'Navbatdan chiqish', table: 'Stol', login: 'Navbatga yozilish uchun akkauntingizga kiring.' },
    ru: { joined: 'Вы в очереди', place: 'место', ready: 'стол освободился!', hold: 'Стол закреплён за вами', book: 'Забронировать сейчас', leave: 'Выйти из очереди', table: 'Стол', login: 'Войдите, чтобы встать в очередь.' },
    en: { joined: 'You are in the queue', place: 'place', ready: 'table is free!', hold: 'Held for you', book: 'Book now', leave: 'Leave the queue', table: 'Table', login: 'Sign in to join the queue.' },
  };
  const words = () => COPY[document.documentElement.lang] || COPY.uz;
  const FLAG = 'rf-waitlist-active';
  const flag = (on) => {
    try {
      on === undefined ? null : on ? localStorage.setItem(FLAG, '1') : localStorage.removeItem(FLAG);
      return localStorage.getItem(FLAG) === '1';
    } catch {
      return false;
    }
  };
  const toast = (text) => (window.notify ? window.notify(text) : alert(text));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const told = new Set();
  let timer = 0, tick = 0;

  async function call(method, payload) {
    const res = await fetch('/api/waitlist', { method, credentials: 'same-origin', headers: payload ? { 'Content-Type': 'application/json' } : {}, body: payload ? JSON.stringify(payload) : undefined });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error(words().login);
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
  }

  async function join(restaurantId, tableNumber, guests) {
    const w = words();
    const r = await call('POST', { restaurantId, tableNumber: Number(tableNumber), guests: Number(guests) || 2 });
    flag(true);
    toast('🔔 ' + w.joined + (r.position ? ' · ' + r.position + '-' + w.place : ''));
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
    start();
    return r;
  }

  function banner(entry) {
    const w = words();
    let el = document.querySelector('.rf-waitlist-banner');
    if (!entry) return el?.remove();
    if (!el) {
      el = document.createElement('div');
      el.className = 'rf-waitlist-banner';
      el.setAttribute('role', 'alert');
      document.body.append(el);
    }
    const left = Math.max(0, Date.parse(entry.hold_until) - Date.now()), mm = Math.floor(left / 60000), ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
    el.innerHTML = '<b>🔔 ' + esc(entry.restaurant_name) + ': ' + esc(w.table) + ' ' + esc(entry.table_number) + ' — ' + esc(w.ready) + '</b><span>' + esc(w.hold) + ': ' + mm + ':' + ss + '</span><a class="primary" href="#/restaurant/' + encodeURIComponent(entry.restaurant_id) + '">' + esc(w.book) + '</a><button type="button" class="quiet" data-leave="' + esc(entry.id) + '">' + esc(w.leave) + '</button>';
    el.querySelector('[data-leave]').onclick = async () => {
      await call('POST', { action: 'leave', id: entry.id }).catch(() => {});
      el.remove();
      poll();
    };
    if (!told.has(entry.id)) {
      told.add(entry.id);
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('RestaurantFoods', { body: entry.restaurant_name + ': ' + w.table + ' ' + entry.table_number + ' — ' + w.ready, tag: 'rf-waitlist-' + entry.id });
        } catch {
          /* some mobile browsers only allow notifications from a service worker */
        }
      }
    }
  }

  async function poll() {
    if (document.visibilityState === 'hidden') return;
    try {
      const { entries } = await call('GET');
      if (!entries.length) return stop();
      const held = entries.find((e) => e.status === 'notified' && Date.parse(e.hold_until) > Date.now());
      banner(held || null);
      clearInterval(tick);
      if (held) tick = setInterval(() => banner(held), 1000);
    } catch {
      /* signed out or offline: try again later */
    }
  }
  function start() {
    if (timer) return;
    poll();
    timer = setInterval(poll, 20000);
  }
  function stop() {
    flag(false);
    clearInterval(timer);
    clearInterval(tick);
    timer = tick = 0;
    banner(null);
  }

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest?.('[data-waitlist]');
    if (!btn) return;
    btn.disabled = true;
    try {
      await join(btn.dataset.restaurant, btn.dataset.waitlist, btn.dataset.guests);
      btn.textContent = '✓ ' + words().joined;
    } catch (err) {
      toast(err.message);
      btn.disabled = false;
    }
  });
  document.addEventListener('visibilitychange', () => timer && poll());
  if (flag()) start();
  window.RFWaitlist = { join, poll };
})();
