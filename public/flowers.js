/*
 * Flowers: the public catalog with the order dialog (delivery to a booked table or home, paid
 * from the bound card) and the florist cabinet (bouquet posts, incoming orders, earnings after the
 * platform's 3% commission). Rendered into a host element by ui/restaurant.js.
 */
(() => {
  'use strict';
  const COPY = {
    uz: { soldOut: 'Vaqtincha tugagan', stockOn: '🟢 Sotuvda', stockOff: '🔴 Vaqtincha tugadi', stockSaved: 'Holat yangilandi', rest: 'Restoran', tableNo: 'Stol', before15: 'Mijoz kelishidan 15 daqiqa oldin', pickup: 'Qayerdan olish (gul do‘koni)', dropoff: 'Qayerga yetkazish', call: 'Qo‘ng‘iroq qilish', onMap: 'Xaritada ko‘rish', calc: (p, cm, net) => `Narx: ${p} · Platforma komissiyasi (3%): ${cm} · Sizga tushadi: <b>${net}</b>`, empty: 'Hozircha gullar joylanmagan.', becomeFlorist: 'Gulchi bo‘lmoqchimisiz? Profil → “Hamkorlik uchun ariza” → Gulchi. Admin tasdiqlagach kabinet ochiladi.', order: 'Buyurtma berish', by: 'Gulchi', size: 'O‘lcham', kind: 'Turi', sum: 'so‘m', qty: 'SONI', delivery: 'YETKAZISH', toTable: 'Bron qilingan stolga', toHome: 'Uyga', booking: 'BRONINGIZ', noBookings: 'Faol broningiz yo‘q — avval stol bron qiling yoki uyga tanlang.', addressNote: 'UY, PODYEZD, MO‘LJAL (IXTIYORIY)', when: 'QACHON (IXTIYORIY)', phone: 'TELEFON', note: 'IZOH (IXTIYORIY)', total: 'Jami', pay: 'Karta orqali to‘lash', cardNeeded: 'To‘lov uchun bank kartasi ulanishi kerak.', bind: '💳 Kartani ulash', cardOff: 'Karta orqali to‘lov hali ulanmagan — buyurtma vaqtincha mavjud emas.', paid: 'To‘landi! Gulchi buyurtmani qabul qiladi.', login: 'Buyurtma uchun akkauntingizga kiring.', close: 'Yopish', myOrders: 'Mening gul buyurtmalarim', status: { pending_payment: 'To‘lov kutilmoqda', payment_failed: 'To‘lov o‘tmadi', paid: 'To‘langan', accepted: 'Tayyorlanmoqda', delivering: 'Yo‘lda', delivered: 'Yetkazildi', refunded: 'Bekor qilindi (pul qaytarildi)' }, cabinet: 'Gulchi kabineti', earned: 'Sizning daromadingiz', commission: 'Platforma komissiyasi', ordersCount: 'Buyurtmalar', rateNote: 'Har bir sotuvdan platformaga avtomatik 3% komissiya o‘tadi.', newPost: 'Yangi gul posti', editPost: 'Postni tahrirlash', title: 'NOMI', photo: 'RASM', price: 'NARXI (SO‘M)', desc: 'TAVSIF', active: 'Sotuvda', save: 'Saqlash', remove: 'Olib tashlash', edit: 'Tahrirlash', myPosts: 'Mening postlarim', noPosts: 'Hali post yo‘q.', incoming: 'Kelgan buyurtmalar', noOrders: 'Hali buyurtma yo‘q.', accept: 'Qabul qilish', go: 'Yo‘lga chiqdi', done: 'Yetkazildi', cancel: 'Bekor qilish (pulni qaytarish)', confirmCancel: 'Buyurtma bekor qilinib, pul mijoz kartasiga qaytarilsinmi?', courierTitle: 'Gul yetkazib berish', take: 'Olib ketaman', map: 'Xarita', saved: 'Saqlandi', uploadFail: 'Rasm yuklanmadi.', sizes: ['Kichik', 'O‘rtacha', 'Katta', 'Juda katta'], kinds: ['Atirgul', 'Lola', 'Xrizantema', 'Pion', 'Aralash buket', 'Savatdagi gullar', 'Boshqa'] },
    ru: { soldOut: 'Временно нет', stockOn: '🟢 В продаже', stockOff: '🔴 Временно нет', stockSaved: 'Статус обновлён', rest: 'Ресторан', tableNo: 'Стол', before15: 'За 15 минут до прихода гостя', pickup: 'Откуда забрать (цветочный магазин)', dropoff: 'Куда доставить', call: 'Позвонить', onMap: 'Открыть на карте', calc: (p, cm, net) => `Цена: ${p} · Комиссия платформы (3%): ${cm} · Вам: <b>${net}</b>`, empty: 'Цветов пока нет.', becomeFlorist: 'Хотите стать флористом? Профиль → «Заявка на партнёрство» → Флорист. Кабинет откроется после одобрения админом.', order: 'Заказать', by: 'Флорист', size: 'Размер', kind: 'Вид', sum: 'сум', qty: 'КОЛИЧЕСТВО', delivery: 'ДОСТАВКА', toTable: 'К забронированному столу', toHome: 'Домой', booking: 'ВАША БРОНЬ', noBookings: 'Нет активной брони — сначала забронируйте стол или выберите доставку домой.', addressNote: 'ДОМ, ПОДЪЕЗД, ОРИЕНТИР (НЕОБЯЗАТЕЛЬНО)', when: 'КОГДА (НЕОБЯЗАТЕЛЬНО)', phone: 'ТЕЛЕФОН', note: 'КОММЕНТАРИЙ (НЕОБЯЗАТЕЛЬНО)', total: 'Итого', pay: 'Оплатить картой', cardNeeded: 'Для оплаты нужно привязать банковскую карту.', bind: '💳 Привязать карту', cardOff: 'Оплата картой ещё не подключена — заказ временно недоступен.', paid: 'Оплачено! Флорист примет заказ.', login: 'Войдите, чтобы заказать.', close: 'Закрыть', myOrders: 'Мои заказы цветов', status: { pending_payment: 'Ожидает оплаты', payment_failed: 'Оплата не прошла', paid: 'Оплачен', accepted: 'Готовится', delivering: 'В пути', delivered: 'Доставлен', refunded: 'Отменён (деньги возвращены)' }, cabinet: 'Кабинет флориста', earned: 'Ваш доход', commission: 'Комиссия платформы', ordersCount: 'Заказы', rateNote: 'С каждой продажи платформа автоматически получает 3% комиссии.', newPost: 'Новый пост', editPost: 'Редактировать пост', title: 'НАЗВАНИЕ', photo: 'ФОТО', price: 'ЦЕНА (СУМ)', desc: 'ОПИСАНИЕ', active: 'В продаже', save: 'Сохранить', remove: 'Снять', edit: 'Изменить', myPosts: 'Мои посты', noPosts: 'Постов пока нет.', incoming: 'Входящие заказы', noOrders: 'Заказов пока нет.', accept: 'Принять', go: 'В пути', done: 'Доставлен', cancel: 'Отменить (вернуть деньги)', confirmCancel: 'Отменить заказ и вернуть деньги на карту клиента?', courierTitle: 'Доставка цветов', take: 'Забираю', map: 'Карта', saved: 'Сохранено', uploadFail: 'Фото не загружено.', sizes: ['Маленький', 'Средний', 'Большой', 'Очень большой'], kinds: ['Розы', 'Тюльпаны', 'Хризантемы', 'Пионы', 'Смешанный букет', 'Цветы в корзине', 'Другое'] },
    en: { soldOut: 'Temporarily out', stockOn: '🟢 On sale', stockOff: '🔴 Temporarily out', stockSaved: 'Status updated', rest: 'Restaurant', tableNo: 'Table', before15: '15 minutes before the guest arrives', pickup: 'Pick up from (flower shop)', dropoff: 'Deliver to', call: 'Call', onMap: 'Show on map', calc: (p, cm, net) => `Price: ${p} · Platform commission (3%): ${cm} · You get: <b>${net}</b>`, empty: 'No flowers yet.', becomeFlorist: 'Want to be a florist? Profile → “Partnership request” → Florist. The cabinet opens after admin approval.', order: 'Order', by: 'Florist', size: 'Size', kind: 'Kind', sum: 'UZS', qty: 'QUANTITY', delivery: 'DELIVERY', toTable: 'To my booked table', toHome: 'Home', booking: 'YOUR BOOKING', noBookings: 'No active booking — book a table first or choose home delivery.', addressNote: 'HOUSE, ENTRANCE, LANDMARK (OPTIONAL)', when: 'WHEN (OPTIONAL)', phone: 'PHONE', note: 'NOTE (OPTIONAL)', total: 'Total', pay: 'Pay by card', cardNeeded: 'Link a bank card to pay.', bind: '💳 Link card', cardOff: 'Card payments are not connected yet — ordering is unavailable for now.', paid: 'Paid! The florist will accept the order.', login: 'Sign in to order.', close: 'Close', myOrders: 'My flower orders', status: { pending_payment: 'Awaiting payment', payment_failed: 'Payment failed', paid: 'Paid', accepted: 'Being prepared', delivering: 'On the way', delivered: 'Delivered', refunded: 'Cancelled (refunded)' }, cabinet: 'Florist cabinet', earned: 'Your earnings', commission: 'Platform commission', ordersCount: 'Orders', rateNote: 'The platform automatically keeps a 3% commission on every sale.', newPost: 'New post', editPost: 'Edit post', title: 'TITLE', photo: 'PHOTO', price: 'PRICE (UZS)', desc: 'DESCRIPTION', active: 'On sale', save: 'Save', remove: 'Take down', edit: 'Edit', myPosts: 'My posts', noPosts: 'No posts yet.', incoming: 'Incoming orders', noOrders: 'No orders yet.', accept: 'Accept', go: 'On the way', done: 'Delivered', cancel: 'Cancel (refund)', confirmCancel: 'Cancel the order and refund the customer’s card?', courierTitle: 'Flower deliveries', take: 'I’ll take it', map: 'Map', saved: 'Saved', uploadFail: 'Photo upload failed.', sizes: ['Small', 'Medium', 'Large', 'Extra large'], kinds: ['Roses', 'Tulips', 'Chrysanthemums', 'Peonies', 'Mixed bouquet', 'Flower basket', 'Other'] },
  };
  const w = () => COPY[document.documentElement.lang] || COPY.uz;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const money = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ' + w().sum;
  const toast = (text) => (window.notify ? window.notify(text) : alert(text));
  async function api(path, method = 'GET', payload) {
    const res = await fetch(path, { method, credentials: 'same-origin', headers: payload ? { 'Content-Type': 'application/json' } : {}, body: payload ? JSON.stringify(payload) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
  }
  const picture = (f) => (f.image_url ? `<img src="${esc(f.image_url)}" alt="${esc(f.title)}" loading="lazy" referrerpolicy="no-referrer">` : '<span class="flower-placeholder" aria-hidden="true">💐</span>');

  function card(f) {
    const c = w();
    const out = f.in_stock === 0;
    return `<article class="flower-card panel ${out ? 'sold-out' : ''}">${out ? `<span class="sold-out-tag">⛔ ${esc(c.soldOut)}</span>` : ''}${picture(f)}<div class="flower-body"><h3>${esc(f.title)}</h3><p class="muted">${c.kind}: ${esc(f.kind)} · ${c.size}: ${esc(f.size)}</p>${f.description ? `<p>${esc(f.description)}</p>` : ''}<p class="muted">${c.by}: ${esc(f.florist_name)}</p><div class="flower-buy"><b>${money(f.price)}</b><button type="button" class="primary" data-order="${esc(f.id)}" ${out ? 'disabled' : ''}>${out ? esc(c.soldOut) : c.order}</button></div></div></article>`;
  }

  let liveTimer = 0;
  async function catalog(root, ctx) {
    const c = w();
    const data = await api('/api/flowers?view=catalog');
    if (!ctx.seq()) return;
    const mine = ctx.user ? await api('/api/flowers?view=mine').catch(() => ({ orders: [], bookings: [] })) : { orders: [], bookings: [] };
    if (!ctx.seq()) return;
    root.innerHTML = `${data.card ? '' : `<p class="notice">${c.cardOff}</p>`}${data.flowers.length ? `<div class="flower-grid">${data.flowers.map(card).join('')}</div>` : `<div class="panel"><p>${c.empty}</p><p class="muted">${c.becomeFlorist}</p></div>`}${mine.orders.length ? `<section class="panel"><h3>${c.myOrders}</h3>${mine.orders.map((o) => `<article class="row"><div><strong>${esc(o.title)} × ${o.quantity}</strong><p>${money(o.total)} · ${esc(o.address)}${o.deliver_at ? ' · ' + esc(o.deliver_at) : ''}</p>${typeof flowerTracker === 'function' && o.status !== 'pending_payment' && o.status !== 'payment_failed' ? flowerTracker(o.status, o.delivery_type === 'table') : `<span class="badge">${esc(c.status[o.status] || o.status)}</span>`}</div></article>`).join('')}</section>` : ''}`;
    // Live: the florist's / courier's step shows up here without reloading.
    clearInterval(liveTimer);
    if (mine.orders.length) {
      const key = (list) => list.map((o) => o.id + ':' + o.status).join(',');
      let known = key(mine.orders);
      liveTimer = setInterval(async () => {
        if (!document.body.contains(root) || !ctx.seq()) return clearInterval(liveTimer);
        if (document.hidden) return;
        try {
          const feed = (await api('/api/bookings/status')).flowers || [];
          const now = key(mine.orders.map((o) => feed.find((f) => f.id === o.id) || o));
          if (now !== known) ((known = now), clearInterval(liveTimer), catalog(root, ctx));
        } catch {}
      }, 8000);
    }
    root.querySelectorAll('[data-order]').forEach((b) => (b.onclick = () => (ctx.user ? orderDialog(data.flowers.find((f) => f.id === b.dataset.order), mine.bookings, ctx, data.card).then((ok) => ok && catalog(root, ctx)) : ((location.hash = '/login'), toast(c.login)))));
  }

  function orderDialog(f, bookings, ctx, cardOn) {
    const c = w();
    return new Promise((resolve) => {
      const d = document.createElement('dialog');
      d.className = 'rf-card-dialog flower-dialog';
      d.innerHTML = `<form class="form"><h3>💐 ${esc(f.title)}</h3><p class="muted">${esc(f.kind)} · ${esc(f.size)} · ${money(f.price)}</p><label>${c.qty}<input name="quantity" type="number" min="1" max="20" value="1" required></label><fieldset class="flower-delivery"><legend>${c.delivery}</legend><label class="check"><input type="radio" name="deliveryType" value="table" ${bookings.length ? 'checked' : 'disabled'}> ${c.toTable}</label><label class="check"><input type="radio" name="deliveryType" value="home" ${bookings.length ? '' : 'checked'}> ${c.toHome}</label></fieldset><div data-table ${bookings.length ? '' : 'hidden'}>${bookings.length ? `<label>${c.booking}<select name="bookingId">${bookings.map((b) => `<option value="${esc(b.id)}">${esc(b.restaurant_name)} · ${esc(b.date)} ${esc(String(b.slot).slice(0, 5))} · ${b.table_number}</option>`).join('')}</select></label>` : `<p class="muted">${c.noBookings}</p>`}</div><div data-home ${bookings.length ? 'hidden' : ''}><div class="map-picker-host" data-map></div><label>${c.addressNote}<input name="address" maxlength="300" value="${esc(ctx.user?.address || '')}"></label><label>${c.when}<input name="deliverAt" maxlength="40" placeholder="18:30"></label></div><label>${c.phone}<input name="phone" type="tel" pattern="\\+998[0-9]{9}" required placeholder="+998901234567" value="${esc(ctx.user?.contactPhone || '')}"></label><label>${c.note}<input name="note" maxlength="300"></label><p class="flower-total">${c.total}: <b data-total>${money(f.price)}</b></p><div data-card></div><div class="contact-phone-actions"><button class="primary" type="submit" ${cardOn ? '' : 'disabled'}>${c.pay}</button><button type="button" class="quiet" data-close>${c.close}</button></div><p class="form-message" role="status"></p></form>`;
      document.body.append(d);
      let done = false;
      d.addEventListener('close', () => {
        d.remove();
        resolve(done);
      });
      d.showModal();
      const form = d.querySelector('form'),
        say = (m) => (form.querySelector('.form-message').textContent = m);
      let lat = ctx.user?.addressLat ?? null,
        lng = ctx.user?.addressLng ?? null,
        mapped = false;
      const mountMap = () => {
        if (mapped || !window.RFMapPicker) return;
        mapped = true;
        window.RFMapPicker.mount(form.querySelector('[data-map]'), { lat: lat ?? undefined, lng: lng ?? undefined, onChange: (a, b) => ((lat = a), (lng = b)), onError: say });
      };
      const sync = () => {
        const home = form.elements.deliveryType.value === 'home';
        form.querySelector('[data-home]').hidden = !home;
        form.querySelector('[data-table]').hidden = home;
        if (home) mountMap();
      };
      form.querySelectorAll('[name=deliveryType]').forEach((r) => (r.onchange = sync));
      sync();
      form.elements.quantity.oninput = () => (form.querySelector('[data-total]').textContent = money(f.price * Math.max(1, Math.min(20, Number(form.elements.quantity.value) || 1))));
      d.querySelector('[data-close]').onclick = () => d.close();
      const cardBox = form.querySelector('[data-card]');
      const showCard = async () => {
        if (!cardOn || !window.RFCards) return;
        const s = await window.RFCards.status(true).catch(() => null);
        cardBox.innerHTML = s?.card ? `<p class="muted">💳 ${esc(s.card.masked)}</p>` : `<p class="notice">${c.cardNeeded}</p><button type="button" class="quiet" data-bind>${c.bind}</button>`;
        const bind = cardBox.querySelector('[data-bind]');
        if (bind) bind.onclick = async () => (await window.RFCards.open()) && showCard();
      };
      showCard();
      form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type=submit]');
        btn.disabled = true;
        say('');
        try {
          const v = Object.fromEntries(new FormData(form));
          const payload = { action: 'order', flowerId: f.id, quantity: Number(v.quantity), deliveryType: v.deliveryType, phone: v.phone.trim(), note: v.note };
          if (v.deliveryType === 'table') payload.bookingId = v.bookingId;
          else Object.assign(payload, { latitude: lat, longitude: lng, address: v.address, deliverAt: v.deliverAt });
          await api('/api/flowers', 'POST', payload);
          done = true;
          toast('💐 ' + c.paid);
          d.close();
        } catch (err) {
          say(err.message);
          btn.disabled = false;
        }
      };
    });
  }

  async function uploadPhoto(file) {
    const res = await fetch('/api/media?scope=flowers', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': file.type || 'image/jpeg' }, body: file });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || w().uploadFail);
    return data.url;
  }

  /** Table order: restaurant, table and the time the bouquet must be ready (15 min before the guest). */
  function tableBadge(o, c) {
    if (o.delivery_type !== 'table' || !o.restaurant_name) return '';
    const ready = String(o.deliver_at || '').slice(11, 16) || String(o.deliver_at || '');
    return `<div class="table-order-badge"><span>🍽️ ${esc(c.rest)}: ${esc(o.restaurant_name)}</span><span class="sep" aria-hidden="true">|</span><span>${esc(c.tableNo)} #${esc(o.table_number)}${o.merged_table ? '+' + esc(o.merged_table) : ''}</span><span class="sep" aria-hidden="true">|</span><span>⏰ ${esc(c.before15)}: <b>${esc(ready)}</b></span></div>`;
  }

  async function florist(root, ctx) {
    const c = w();
    const data = await api('/api/flowers?view=florist');
    if (!ctx.seq()) return;
    let editing = null;
    const next = { paid: [['accepted', c.accept], ['cancelled', c.cancel]], accepted: [['delivering', c.go], ['cancelled', c.cancel]], delivering: [['delivered', c.done]] };
    const formHtml = (f) => `<form class="form" data-post><h3>${f ? c.editPost : c.newPost}</h3><div class="two"><label>${c.title}<input name="title" minlength="2" maxlength="120" required value="${esc(f?.title || '')}"></label><label>${c.kind.toUpperCase()}<input name="kind" list="flowerKinds" minlength="2" maxlength="60" required value="${esc(f?.kind || '')}"></label></div><datalist id="flowerKinds">${c.kinds.map((k) => `<option value="${esc(k)}">`).join('')}</datalist><div class="two"><label>${c.size.toUpperCase()}<select name="size">${c.sizes.map((s) => `<option ${f?.size === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label><label>${c.price}<input name="price" type="number" min="1000" max="50000000" step="500" required value="${f?.price || ''}"></label></div><p class="commission-calc" data-calc aria-live="polite"></p><label>${c.photo}<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label>${f?.image_url ? `<img class="photo-preview" src="${esc(f.image_url)}" alt="">` : ''}<label>${c.desc}<textarea name="description" maxlength="1000">${esc(f?.description || '')}</textarea></label><label class="check"><input type="checkbox" name="active" ${f ? (f.active ? 'checked' : '') : 'checked'}> ${c.active}</label><div class="contact-phone-actions"><button class="primary">${c.save}</button>${f ? `<button type="button" class="quiet" data-new>${c.newPost}</button>` : ''}</div><p class="form-message" role="status"></p></form>`;
    root.classList.add('florist-root');
    const render = () => {
      const tot = data.totals || {};
      root.innerHTML = `<div class="metric-grid"><div class="metric"><small>${c.earned}</small><strong>${money(tot.earned)}</strong></div><div class="metric"><small>${c.commission} (3%)</small><strong>${money(tot.commission)}</strong></div><div class="metric"><small>${c.ordersCount}</small><strong>${tot.count || 0}</strong></div></div><p class="muted">${c.rateNote}</p><section class="panel">${formHtml(editing)}</section><section class="panel"><h3>${c.incoming}</h3>${data.orders.length ? data.orders.map((o) => `<article class="row"><div><strong>${esc(o.title)} × ${o.quantity}</strong><p>${money(o.total)} → ${c.earned.toLowerCase()}: <b>${money(o.florist_amount)}</b> (−${money(o.commission)})</p>${tableBadge(o, c)}<p>${o.delivery_type === 'table' ? '🍽 ' : '🏠 '}${esc(o.address)}${o.deliver_at ? ' · ' + esc(o.deliver_at) : ''}${o.lat != null ? ` · <a href="https://www.google.com/maps?q=${o.lat},${o.lng}" target="_blank" rel="noopener">${c.map}</a>` : ''}</p><p><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>${o.note ? ' · ' + esc(o.note) : ''}</p><span class="badge">${esc(c.status[o.status] || o.status)}</span>${o.courier_name ? ` <span class="badge">🛵 ${esc(o.courier_name)}</span>` : ''}</div><div class="row-actions">${(next[o.status] || []).map(([s, label]) => `<button type="button" class="${s === 'cancelled' ? 'quiet' : 'primary'}" data-st="${s}" data-id="${esc(o.id)}">${label}</button>`).join('')}</div></article>`).join('') : `<p>${c.noOrders}</p>`}</section><section class="panel"><h3>${c.myPosts}</h3>${data.flowers.length ? `<div class="flower-grid">${data.flowers.map((f) => `<article class="flower-card panel ${f.active ? '' : 'inactive'}">${picture(f)}<div class="flower-body"><h3>${esc(f.title)}</h3><p class="muted">${esc(f.kind)} · ${esc(f.size)}</p><b>${money(f.price)}</b><div class="row-actions"><button type="button" class="quiet" data-edit="${esc(f.id)}">${c.edit}</button><button type="button" class="${f.in_stock === 0 ? 'danger' : 'quiet'}" data-stock="${esc(f.id)}" data-on="${f.in_stock === 0 ? '1' : '0'}">${f.in_stock === 0 ? c.stockOff : c.stockOn}</button>${f.active ? `<button type="button" class="quiet" data-remove="${esc(f.id)}">${c.remove}</button>` : ''}</div></div></article>`).join('')}</div>` : `<p>${c.noPosts}</p>`}</section>`;
      const form = root.querySelector('[data-post]'),
        say = (m) => (form.querySelector('.form-message').textContent = m);
      // Live 3% commission calculator under the price.
      const calc = () => {
        const p = Math.max(0, Number(form.elements.price.value) || 0),
          cm = Math.round(p * 0.03);
        form.querySelector('[data-calc]').innerHTML = p ? c.calc(money(p), money(cm), money(p - cm)) : '';
      };
      form.elements.price.addEventListener('input', calc);
      calc();
      form.querySelector('[data-new]')?.addEventListener('click', () => ((editing = null), render()));
      form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button.primary');
        btn.disabled = true;
        try {
          const v = Object.fromEntries(new FormData(form)),
            file = form.elements.photo.files[0];
          const imageUrl = file ? await uploadPhoto(file) : editing?.image_url || '';
          await api('/api/flowers', 'POST', { action: 'save', id: editing?.id, title: v.title, kind: v.kind, size: v.size, price: Number(v.price), description: v.description, imageUrl, active: form.elements.active.checked });
          toast('✓ ' + c.saved);
          editing = null;
          await florist(root, ctx);
        } catch (err) {
          say(err.message);
          btn.disabled = false;
        }
      };
      root.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => ((editing = data.flowers.find((f) => f.id === b.dataset.edit)), render(), root.querySelector('[data-post]').scrollIntoView({ behavior: 'smooth' }))));
      root.querySelectorAll('[data-stock]').forEach((b) => (b.onclick = async () => {
        b.disabled = true;
        try {
          await api('/api/flowers', 'POST', { action: 'stock', id: b.dataset.stock, inStock: b.dataset.on === '1' });
          toast('✓ ' + c.stockSaved);
          await florist(root, ctx);
        } catch (e) {
          toast(e.message);
          b.disabled = false;
        }
      }));
      root.querySelectorAll('[data-remove]').forEach((b) => (b.onclick = async () => {
        b.disabled = true;
        await api('/api/flowers', 'POST', { action: 'remove', id: b.dataset.remove }).catch((e) => toast(e.message));
        florist(root, ctx);
      }));
      root.querySelectorAll('[data-st]').forEach((b) => (b.onclick = async () => {
        if (b.dataset.st === 'cancelled' && !confirm(c.confirmCancel)) return;
        b.disabled = true;
        try {
          await api('/api/flowers', 'POST', { action: 'status', id: b.dataset.id, status: b.dataset.st });
          florist(root, ctx);
        } catch (e) {
          toast(e.message);
          b.disabled = false;
        }
      }));
    };
    render();
  }

  /** Courier cabinet: paid flower orders the florist accepted — take one, then mark it delivered. */
  async function courier(host) {
    if (!host) return;
    const c = w();
    let data;
    try {
      data = await api('/api/flowers?view=courier');
    } catch (e) {
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.innerHTML = `<h2>💐 ${esc(c.courierTitle)}</h2>${data.orders.length ? data.orders.map((o) => `<article class="row"><div><strong>${esc(o.title)} × ${o.quantity}</strong><p>${o.delivery_type === 'table' ? '🍽 ' : '🏠 '}${esc(o.address)}${o.deliver_at ? ' · ' + esc(o.deliver_at) : ''}${o.lat != null ? ` · <a href="https://www.google.com/maps?q=${o.lat},${o.lng}" target="_blank" rel="noopener">${c.map}</a>` : ''}</p><p>${esc(o.florist_name)} · <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>${o.note ? ' · ' + esc(o.note) : ''}</p><span class="badge">${esc(c.status[o.status] || o.status)}</span></div><div class="row-actions">${o.courier_id ? `<button type="button" class="primary" data-c-done="${esc(o.id)}">${c.done}</button>` : `<button type="button" class="primary" data-c-take="${esc(o.id)}">${esc(c.take)}</button>`}</div></article>`).join('') : `<p>${c.noOrders}</p>`}`;
    const act = (attr, action) =>
      host.querySelectorAll('[' + attr + ']').forEach((b) => (b.onclick = async () => {
        b.disabled = true;
        try {
          await api('/api/flowers', 'POST', { action, id: b.getAttribute(attr) });
          courier(host);
        } catch (e) {
          toast(e.message);
          b.disabled = false;
        }
      }));
    act('data-c-take', 'courier_take');
    act('data-c-done', 'courier_done');
  }

  window.RFFlowers = { catalog, florist, courier };
})();
