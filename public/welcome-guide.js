/*
 * Welcome guide: on a visitor's first visit the AI concierge (concierge-avatar.js) appears in the corner
 * with a short animation and explains the site in a few steps — restaurants and table booking, quick
 * filters, the 3D menu and preorders, flowers, the AI assistant, the Telegram bot — pointing at each part.
 *  - Shown once per browser ('rf-guide-v1'), only on the home / catalogue page, never over a deep link
 *    (Telegram "book this restaurant") or while the AI assistant is open. "Skip" and Esc close it for good.
 *  - Browsers do not let a page start sound by itself, so the concierge "speaks" in text first: the words
 *    are typed and the mouth follows the syllables. "🔊 Ovoz bilan" plays the real voice (/api/ai/tts, for
 *    signed-in visitors) and the mouth follows that sound through an AnalyserNode.
 *  - Uzbek, Russian and English, following the site's language. Nothing is sent anywhere except the
 *    voice request the visitor asks for. window.RFGuide.open() shows it again.
 */
(() => {
  'use strict';
  const KEY = 'rf-guide-v1';
  const COPY = {
    uz: {
      steps: [
        ['👋 Assalomu alaykum! Men RestaurantFoods konsyerjiman. Saytimizni 30 soniyada tanishtirib chiqaman.', null],
        ['🍽️ Bu yerda shahringiz restoranlari. Restoranni tanlang, 2D yoki 3D zal xaritasidan aniq stolni tanlab, bron qiling.', '.restaurant-card'],
        ['🔥 Tezkor filtrlar: hozir bo‘sh stollar, tug‘ilgan kunda 15% chegirma, oilaviy kabinalar — bir bosishda.', '.quick-chip'],
        ['📖 Restoran ichida 3D menyu kitobi bor: taomni oldindan buyurtma qiling — kelganingizda tayyor bo‘ladi.', null],
        ['💐 Yaqinlaringizni xursand qiling: guldastani to‘g‘ridan-to‘g‘ri stolingizga buyurtma qilish mumkin.', 'a[href="#/flowers"]'],
        ['✦ Savolingiz bo‘lsa, AI yordamchini bosing: restoran, taom va bo‘sh vaqt tanlashda ovoz bilan yordam beradi.', '.rf-ai-launch'],
        ['✈️ Telegram botimizda ham hammasi bor: bronlar, QR-chek va eslatmalar. Yoqimli ishtaha!', null],
      ],
      next: 'Keyingi ›',
      done: 'Boshlash ✓',
      skip: 'O‘tkazib yuborish',
      voice: '🔊 Ovoz bilan',
      voiceOff: '🔇 Ovozsiz',
      voiceLogin: 'Ovozli tanishtiruv uchun akkauntga kiring.',
      title: 'RestaurantFoods konsyerji',
      close: 'Yopish',
    },
    ru: {
      steps: [
        ['👋 Здравствуйте! Я консьерж RestaurantFoods. За 30 секунд покажу, как устроен сайт.', null],
        ['🍽️ Здесь рестораны вашего города. Выберите ресторан, точный стол на 2D- или 3D-схеме зала и забронируйте.', '.restaurant-card'],
        ['🔥 Быстрые фильтры: свободные столы прямо сейчас, скидка 15% в день рождения, семейные кабинки — в одно касание.', '.quick-chip'],
        ['📖 Внутри ресторана — 3D-книга меню: закажите блюда заранее, и они будут готовы к вашему приходу.', null],
        ['💐 Порадуйте близких: букет можно заказать прямо к вашему столу.', 'a[href="#/flowers"]'],
        ['✦ Есть вопросы — нажмите на AI-помощника: он голосом поможет выбрать ресторан, блюда и свободное время.', '.rf-ai-launch'],
        ['✈️ В нашем Telegram-боте тоже всё есть: брони, QR-чек и напоминания. Приятного аппетита!', null],
      ],
      next: 'Далее ›',
      done: 'Начать ✓',
      skip: 'Пропустить',
      voice: '🔊 Со звуком',
      voiceOff: '🔇 Без звука',
      voiceLogin: 'Чтобы слушать голосом, войдите в аккаунт.',
      title: 'Консьерж RestaurantFoods',
      close: 'Закрыть',
    },
    en: {
      steps: [
        ['👋 Hello! I’m the RestaurantFoods concierge. Let me show you around in 30 seconds.', null],
        ['🍽️ Here are the restaurants in your city. Pick one, choose the exact table on the 2D or 3D hall plan and book it.', '.restaurant-card'],
        ['🔥 Quick filters: tables free right now, 15% off on your birthday, family booths — in one tap.', '.quick-chip'],
        ['📖 Inside each restaurant there is a 3D menu book: order your dishes ahead and they’ll be ready when you arrive.', null],
        ['💐 Make someone happy: a bouquet can be ordered straight to your table.', 'a[href="#/flowers"]'],
        ['✦ Any questions? Tap the AI assistant: it helps you choose a restaurant, dishes and a free time by voice.', '.rf-ai-launch'],
        ['✈️ Our Telegram bot has it all too: bookings, QR receipts and reminders. Enjoy your meal!', null],
      ],
      next: 'Next ›',
      done: 'Let’s go ✓',
      skip: 'Skip',
      voice: '🔊 With voice',
      voiceOff: '🔇 Mute',
      voiceLogin: 'Sign in to hear the voice tour.',
      title: 'RestaurantFoods concierge',
      close: 'Close',
    },
  };
  const lang = () => {
    const l = window.RF_I18N?.lang || document.documentElement.lang;
    return COPY[l] ? l : 'uz';
  };
  const store = {
    get: () => {
      try {
        return localStorage.getItem(KEY);
      } catch {
        return '1';
      }
    },
    set: () => {
      try {
        localStorage.setItem(KEY, '1');
      } catch {}
    },
  };
  // Vowels open the mouth (a wide, o/u round, e/i small and wide); m, b, p close it.
  const VOWEL = { a: [0.85, 0.5], o: [0.6, 0.02], u: [0.45, 0.02], e: [0.55, 0.9], i: [0.4, 0.95], у: [0.45, 0.02], а: [0.85, 0.5], о: [0.6, 0.02], е: [0.55, 0.9], и: [0.4, 0.95], ы: [0.4, 0.8], я: [0.8, 0.6], ю: [0.45, 0.05], э: [0.55, 0.85], ё: [0.6, 0.1] };

  let box = null,
    avatar = null,
    step = 0,
    typing = 0,
    voiceOn = false,
    ctx = null,
    source = null,
    focused = null;

  const reduced = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function unfocus() {
    focused?.classList.remove('rf-guide-focus');
    focused = null;
  }
  function focus(selector) {
    unfocus();
    if (!selector) return;
    const el = [...document.querySelectorAll(selector)].find((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
    if (!el) return;
    focused = el;
    el.classList.add('rf-guide-focus');
    const r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight - 220) el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
  }
  function stopSound() {
    try {
      source?.stop();
    } catch {}
    source = null;
    avatar?.speak(null);
  }
  /** Types the words; the mouth follows the letters until the text is out. */
  function type(text, done) {
    clearInterval(typing);
    const out = box.querySelector('[data-text]');
    if (reduced()) {
      out.textContent = text;
      avatar?.level(null);
      return done?.();
    }
    let i = 0;
    out.textContent = '';
    avatar?.mode('speaking');
    typing = setInterval(() => {
      i++;
      out.textContent = text.slice(0, i);
      const ch = text[i - 1]?.toLowerCase() || ' ';
      if (!voiceOn || !source) {
        const v = VOWEL[ch];
        avatar?.level(v ? v[0] : /[mbpмбп\s.,!?—:]/.test(ch) ? 0 : 0.18, v ? v[1] : 0.5);
      }
      if (i >= text.length) {
        clearInterval(typing);
        if (!source) {
          avatar?.level(null);
          avatar?.mode('idle');
        }
        done?.();
      }
    }, 34);
  }
  /** The real voice for signed-in visitors; the mouth then follows the sound itself. */
  async function say(text) {
    stopSound();
    if (!voiceOn) return;
    try {
      const res = await fetch('/api/ai/tts', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.replace(/^\S+\s/, ''), lang: lang(), voice: 'nova' }) });
      if (res.status === 401) {
        voiceOn = false;
        renderVoice(COPY[lang()].voiceLogin);
        return;
      }
      if (!res.ok || !box) return;
      const { audio } = await res.json();
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx ||= new AC();
      await ctx.resume();
      const buffer = await ctx.decodeAudioData(Uint8Array.from(atob(audio), (c) => c.charCodeAt(0)).buffer);
      if (!box || !voiceOn) return;
      const node = ctx.createBufferSource(),
        analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      node.buffer = buffer;
      node.connect(analyser);
      node.connect(ctx.destination);
      avatar?.level(null);
      avatar?.mode('speaking');
      avatar?.speak(analyser);
      node.onended = () => {
        if (source !== node) return;
        source = null;
        avatar?.speak(null);
        avatar?.mode('idle');
      };
      source = node;
      node.start();
    } catch {
      /* the text stays on screen */
    }
  }
  function renderVoice(note) {
    const c = COPY[lang()],
      b = box.querySelector('[data-voice]');
    b.textContent = voiceOn ? c.voiceOff : c.voice;
    b.setAttribute('aria-pressed', String(voiceOn));
    const n = box.querySelector('[data-note]');
    n.textContent = note || '';
    n.hidden = !note;
  }
  function show(i) {
    const c = COPY[lang()],
      steps = c.steps;
    step = Math.max(0, Math.min(steps.length - 1, i));
    const [text, target] = steps[step];
    box.querySelector('[data-dots]').innerHTML = steps.map((_, n) => `<i class="${n === step ? 'on' : n < step ? 'seen' : ''}"></i>`).join('');
    box.querySelector('[data-next]').textContent = step === steps.length - 1 ? c.done : c.next;
    focus(target);
    if (step) avatar?.gesture();
    type(text);
    say(text);
  }
  function close() {
    store.set();
    clearInterval(typing);
    stopSound();
    unfocus();
    document.removeEventListener('keydown', onKey);
    if (!box) return;
    const el = box;
    box = null;
    const end = () => {
      avatar?.destroy();
      avatar = null;
      el.remove();
    };
    if (reduced()) end();
    else {
      el.classList.add('leaving');
      setTimeout(end, 320);
    }
  }
  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };
  function open() {
    if (box) return;
    const c = COPY[lang()];
    box = document.createElement('section');
    box.className = 'rf-guide';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', c.title);
    box.innerHTML = `<button type="button" class="rf-guide-x" data-close aria-label="${c.close}">✕</button><div class="rf-guide-hero" data-avatar></div><div class="rf-guide-body"><p class="rf-guide-name">${c.title}</p><p class="rf-guide-text" data-text aria-live="polite"></p><p class="rf-guide-note" data-note hidden></p><div class="rf-guide-dots" data-dots aria-hidden="true"></div><div class="rf-guide-actions"><button type="button" class="rf-guide-skip" data-skip>${c.skip}</button><button type="button" class="rf-guide-voice" data-voice aria-pressed="false">${c.voice}</button><button type="button" class="rf-guide-next" data-next>${c.next}</button></div></div>`;
    document.body.append(box);
    avatar = window.RFConcierge?.mount(box.querySelector('[data-avatar]')) || null;
    avatar?.mode('idle');
    box.querySelector('[data-close]').onclick = close;
    box.querySelector('[data-skip]').onclick = close;
    box.querySelector('[data-next]').onclick = () => (step >= COPY[lang()].steps.length - 1 ? close() : show(step + 1));
    box.querySelector('[data-voice]').onclick = () => {
      voiceOn = !voiceOn;
      renderVoice();
      if (voiceOn) say(COPY[lang()].steps[step][0]);
      else stopSound();
    };
    document.addEventListener('keydown', onKey);
    // Opening the AI assistant ends the tour (both talk).
    document.querySelector('.rf-ai-launch')?.addEventListener('click', close, { once: true });
    requestAnimationFrame(() => box?.classList.add('in'));
    // The greeting starts once the entrance animation has played.
    setTimeout(() => box && show(0), reduced() ? 0 : 450);
  }
  /** First visit on the home / catalogue page, not over a Telegram deep link or the open AI assistant. */
  function maybeOpen() {
    if (store.get()) return;
    if (/[?&](restaurant_id|action)=/.test(location.search)) return;
    if (!['', '#', '#/', '#/discover'].includes(location.hash)) return;
    if (document.querySelector('.rf-robot:not([hidden]), dialog[open]')) return;
    open();
  }
  window.RFGuide = { open, close };
  const start = () => setTimeout(maybeOpen, 1600);
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
})();
