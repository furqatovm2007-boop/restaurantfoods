/*
 * Welcome guide: on a visitor's first visit the AI concierge (concierge-avatar.js) appears in the corner
 * with a short animation and explains the site, pointing at each part.
 *  - SIMPLE_MVP_MODE: three steps that match the simple flow (choose a restaurant → pick a table and, if
 *    wanted, dishes → book with Telegram), each spoken by the owner's recorded voice
 *    /audio/concierge/<uz|ru|en>-step<1|2|3>.mp3 in the site's language. "🔇 Mute" pauses and mutes it; a
 *    new step stops the previous recording. No browser speech synthesis is used.
 *  - Full mode: the longer tour (restaurants, filters, 3D menu, flowers, AI assistant, Telegram bot); the
 *    words are typed with the mouth following the syllables, "🔊 Ovoz bilan" asks the server voice.
 *  - Shown once per browser ('rf-guide-v1'), only on the home / catalogue page, never over a deep link
 *    (Telegram "book this restaurant") or while the AI assistant is open. "Skip" and Esc close it for good.
 *  - Uzbek, Russian and English, following the site's language. window.RFGuide.open() shows it again.
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
      // SIMPLE_MVP_MODE: three steps, each read by the recorded voice /audio/concierge/uz-stepN.mp3.
      mvp: {
        steps: [
          ['👋 Assalomu alaykum! Pastdagi ro‘yxatdan o‘zingizga yoqqan restoranni tanlab, ustiga bosing.', '.mvp-card'],
          ['🪑 Endi zaldagi bo‘sh stollardan birini tanlang. Pastroqdagi menyudan ovqatlarni ham belgilashingiz mumkin.', '.mvp-book'],
          ['✈️ Vaqtni belgilab, ko‘k Telegram tugmasini bosing — joyingiz darhol band bo‘ladi!', null],
        ],
        next: 'Keyingi ›',
        done: 'Boshladik ✓',
        skip: 'O‘tkazib yuborish',
        mute: '🔇 Ovozni o‘chirish',
        unmute: '🔊 Ovozni yoqish',
      },
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
      mvp: {
        steps: [
          ['👋 Здравствуйте! Выберите нужный ресторан из списка ниже и нажмите на него.', '.mvp-card'],
          ['🪑 Нажмите на любой свободный столик в зале. Чуть ниже можно сразу выбрать блюда из меню.', '.mvp-book'],
          ['✈️ Укажите время и нажмите синюю кнопку Telegram — столик сразу забронируется!', null],
        ],
        next: 'Далее ›',
        done: 'Поехали ✓',
        skip: 'Пропустить',
        mute: '🔇 Без звука',
        unmute: '🔊 Со звуком',
      },
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
      mvp: {
        steps: [
          ['👋 Hello! Scroll down, pick a restaurant you like, and tap on it.', '.mvp-card'],
          ['🪑 Tap on any free table in the hall. Scroll down to the menu if you want to pre-order food.', '.mvp-book'],
          ['✈️ Pick your time and tap the blue Telegram button — your table is booked instantly!', null],
        ],
        next: 'Next ›',
        done: 'Let’s go ✓',
        skip: 'Skip',
        mute: '🔇 Mute',
        unmute: '🔊 Unmute',
      },
      close: 'Close',
    },
  };
  const lang = () => {
    const l = (typeof RF_I18N !== 'undefined' ? RF_I18N.lang : window.RF_I18N?.lang) || document.documentElement.lang;
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
  // SIMPLE_MVP_MODE: the 3-step tour of the simple flow, with the recorded voice.
  const mvp = () => !!window.SIMPLE_MVP_MODE;
  const stepsOf = (c) => (mvp() ? c.mvp.steps : c.steps);
  const labels = (c) => (mvp() ? c.mvp : c);

  /*
   * The recorded voice (SIMPLE_MVP_MODE): /audio/concierge/<lang>-step<N>.mp3 through one HTML5 <audio>.
   * Each step stops the previous recording and plays its own; the mouth follows the sound (an AnalyserNode
   * on the audio element). "Mute" pauses and mutes it and is remembered on this device. A browser that does
   * not let a page start sound by itself, or a missing file, leaves the typed words (mouth by syllables) —
   * no robotic browser voice is ever used.
   */
  const MUTE_KEY = 'rf-guide-muted';
  let muted = (() => {
      try {
        return localStorage.getItem(MUTE_KEY) === '1';
      } catch {
        return false;
      }
    })(),
    player = null,
    playerAnalyser = null;
  const clipUrl = (n) => `/audio/concierge/${lang()}-step${n + 1}.mp3`;
  function stopClip() {
    if (player) {
      player.pause();
      player.currentTime = 0;
    }
    avatar?.speak(null);
  }
  async function playClip(n) {
    stopClip();
    if (muted) return;
    try {
      player ||= Object.assign(new Audio(), { preload: 'auto' });
      player.muted = false;
      player.src = clipUrl(n);
      player.onended = () => {
        avatar?.speak(null);
        avatar?.mode('idle');
      };
      // Lip-sync from the recording itself (same-origin file, so the analyser may read it).
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC && !playerAnalyser) {
        try {
          ctx ||= new AC();
          const src = ctx.createMediaElementSource(player);
          playerAnalyser = ctx.createAnalyser();
          playerAnalyser.fftSize = 512;
          src.connect(playerAnalyser);
          playerAnalyser.connect(ctx.destination);
        } catch {
          playerAnalyser = null;
        }
      }
      const playing = player.play();
      ctx?.resume().catch(() => {});
      await playing;
      if (!box || step !== n) return stopClip();
      clearInterval(typing);
      box.querySelector('[data-text]').textContent = stepsOf(COPY[lang()])[n][0];
      avatar?.level(null);
      avatar?.mode('speaking');
      if (playerAnalyser) avatar?.speak(playerAnalyser);
    } catch {
      // Autoplay blocked or no recording: the typed words carry the step; one tap on 🔊 plays it.
    }
  }
  function renderMute() {
    const b = box?.querySelector('[data-voice]');
    if (!b) return;
    const c = labels(COPY[lang()]);
    b.textContent = muted ? c.unmute : c.mute;
    b.setAttribute('aria-pressed', String(!muted));
  }
  function show(i) {
    const c = COPY[lang()],
      steps = stepsOf(c);
    step = Math.max(0, Math.min(steps.length - 1, i));
    const [text, target] = steps[step];
    box.querySelector('[data-dots]').innerHTML = steps.map((_, n) => `<i class="${n === step ? 'on' : n < step ? 'seen' : ''}"></i>`).join('');
    box.querySelector('[data-next]').textContent = step === steps.length - 1 ? labels(c).done : labels(c).next;
    focus(target);
    if (step) avatar?.gesture();
    type(text);
    if (mvp()) playClip(step);
    else say(text);
  }
  function close() {
    store.set();
    clearInterval(typing);
    stopSound();
    stopClip();
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
    const c = COPY[lang()],
      l = labels(c);
    box = document.createElement('section');
    box.className = 'rf-guide';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', c.title);
    const langBar = mvp() ? `<div class="rf-guide-lang" role="group" aria-label="Til / Язык / Language">${LANGS.map(([k]) => `<button type="button" data-lang="${k}" aria-pressed="${k === lang()}">${k.toUpperCase()}</button>`).join('')}</div>` : '';
    const picker = mvp() ? `<div class="rf-guide-pick" data-pick><p>Tilni tanlang / Выберите язык / Choose language:</p><div>${LANGS.map(([k, label]) => `<button type="button" data-pick-lang="${k}">${label}</button>`).join('')}</div></div>` : '';
    box.innerHTML = `<button type="button" class="rf-guide-x" data-close aria-label="${c.close}">✕</button>${langBar}<div class="rf-guide-hero" data-avatar></div><div class="rf-guide-body"><p class="rf-guide-name">${c.title}</p>${picker}<p class="rf-guide-text" data-text aria-live="polite"></p><p class="rf-guide-note" data-note hidden></p><div class="rf-guide-dots" data-dots aria-hidden="true"></div><div class="rf-guide-actions"><button type="button" class="rf-guide-skip" data-skip>${l.skip}</button><button type="button" class="rf-guide-voice" data-voice aria-pressed="false">${mvp() ? (muted ? l.unmute : l.mute) : c.voice}</button><button type="button" class="rf-guide-next" data-next>${l.next}</button></div></div>`;
    document.body.append(box);
    avatar = window.RFConcierge?.mount(box.querySelector('[data-avatar]')) || null;
    avatar?.mode('idle');
    box.querySelector('[data-close]').onclick = close;
    box.querySelector('[data-skip]').onclick = close;
    box.querySelector('[data-next]').onclick = () => (step >= stepsOf(COPY[lang()]).length - 1 ? close() : show(step + 1));
    box.querySelector('[data-voice]').onclick = () => {
      if (mvp()) {
        // Mute / unmute the recording; unmuting (a tap) also lets a blocked autoplay start.
        muted = !muted;
        try {
          localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
        } catch {}
        renderMute();
        if (muted) {
          if (player) player.muted = true;
          stopClip();
        } else playClip(step);
        return;
      }
      voiceOn = !voiceOn;
      renderVoice();
      if (voiceOn) say(stepsOf(COPY[lang()])[step][0]);
      else stopSound();
    };
    document.addEventListener('keydown', onKey);
    // Opening the AI assistant ends the tour (both talk).
    document.querySelector('.rf-ai-launch')?.addEventListener('click', close, { once: true });
    requestAnimationFrame(() => box?.classList.add('in'));
    if (mvp()) {
      // Step 0: a silent language choice (the avatar waves); the tap that picks the language starts the voice,
      // so no browser blocks it. The UZ | RU | EN corner switch changes the language mid-tour.
      step = -1;
      box.classList.add('picking');
      setTimeout(() => avatar?.gesture(), reduced() ? 0 : 500);
      box.querySelectorAll('[data-pick-lang]').forEach((b) => (b.onclick = () => startIn(b.dataset.pickLang)));
      box.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => (step < 0 ? startIn(b.dataset.lang) : switchTo(b.dataset.lang))));
      return;
    }
    // The greeting starts once the entrance animation has played.
    setTimeout(() => box && show(0), reduced() ? 0 : 450);
  }
  // ---------- language (SIMPLE_MVP_MODE) ----------
  const LANGS = [
    ['uz', '🇺🇿 O‘zbekcha'],
    ['ru', '🇷🇺 Русский'],
    ['en', '🇬🇧 English'],
  ];
  /** The whole site in this language (saved like the site's own switcher), then the widget's own words. */
  function setLang(l) {
    if (typeof RF_I18N !== 'undefined') {
      RF_I18N.set(l);
      RF_I18N.chosen = true;
    } else document.documentElement.lang = l;
    try {
      localStorage.setItem('rf-language', l);
    } catch {}
    // The page itself re-renders in the new language (and a signed-in profile keeps it) — after the voice
    // has started, so the tap still counts as the gesture that allows sound.
    setTimeout(async () => {
      if (typeof applyLanguage === 'function') await applyLanguage(l);
      window.RFMvp?.syncLang?.();
    }, 0);
    if (!box) return;
    const c = COPY[l],
      lb = labels(c);
    box.setAttribute('aria-label', c.title);
    box.querySelector('.rf-guide-name').textContent = c.title;
    box.querySelector('[data-skip]').textContent = lb.skip;
    box.querySelector('[data-close]').setAttribute('aria-label', c.close);
    renderMute();
    box.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  }
  function startIn(l) {
    setLang(l);
    box.classList.remove('picking');
    box.querySelector('[data-pick]')?.remove();
    show(0);
  }
  function switchTo(l) {
    // The current clip stops at once (pause + rewind); the new language's clip loads without blocking.
    stopClip();
    setLang(l);
    show(step);
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
  // After the page has settled (it must not compete with the first paint or the first taps).
  const start = () => setTimeout(() => (window.requestIdleCallback ? requestIdleCallback(maybeOpen, { timeout: 3000 }) : maybeOpen()), 2500);
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
})();
