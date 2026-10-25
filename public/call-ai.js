/*
 * Call AI — free live web call. On /call-ai/:id (opened from the Telegram button) the screen rings
 * like an incoming phone call; "Answer" plays the AI's question (server voice, or the browser's own
 * speech synthesis), listens with SpeechRecognition (or records and sends the audio for
 * transcription) and records Yes / No through /api/call-ai. Tap buttons always work too.
 * On the main site, signed-in customers with an open call get the same ringing overlay.
 */
(() => {
  'use strict';
  const COPY = {
    uz: { incoming: 'Kiruvchi qo‘ng‘iroq', caller: 'RestaurantFoods AI', accept: 'Ko‘tarish', decline: 'Rad etish', speaking: 'AI gapirmoqda…', listening: 'Tinglayapman… “Ha, boraman” yoki “Yo‘q” deng', yes: '✅ Ha, albatta boraman', no: '❌ Bora olmayman', again: 'Kechirasiz, tushunmadim. “Ha” yoki “Yo‘q” deng yoki tugmani bosing.', ended: 'Qo‘ng‘iroq tugadi', declined: 'Qo‘ng‘iroq rad etildi. Javobni tugma bilan berishingiz mumkin:', confirmed: 'Bron tasdiqlandi', call: 'Restoranga qo‘ng‘iroq', gone: 'Havola eskirgan yoki qo‘ng‘iroq topilmadi.', inactive: 'Bu bron faol emas.', mic: 'Mikrofonga ruxsat bering yoki tugmani bosing.', table: 'stol', you: 'Siz' },
    ru: { incoming: 'Входящий звонок', caller: 'RestaurantFoods AI', accept: 'Ответить', decline: 'Отклонить', speaking: 'AI говорит…', listening: 'Слушаю… скажите «Да, приду» или «Нет»', yes: '✅ Да, обязательно приду', no: '❌ Не смогу', again: 'Извините, не понял. Скажите «Да» или «Нет» или нажмите кнопку.', ended: 'Звонок завершён', declined: 'Звонок отклонён. Ответить можно кнопкой:', confirmed: 'Бронь подтверждена', call: 'Позвонить в ресторан', gone: 'Ссылка устарела или звонок не найден.', inactive: 'Эта бронь неактивна.', mic: 'Разрешите микрофон или нажмите кнопку.', table: 'стол', you: 'Вы' },
    en: { incoming: 'Incoming call', caller: 'RestaurantFoods AI', accept: 'Answer', decline: 'Decline', speaking: 'AI is speaking…', listening: 'Listening… say “Yes, I’m coming” or “No”', yes: '✅ Yes, I’m coming', no: '❌ I can’t come', again: 'Sorry, I didn’t catch that. Say “Yes” or “No” or tap a button.', ended: 'Call ended', declined: 'Call declined. You can still answer with a button:', confirmed: 'Booking confirmed', call: 'Call the restaurant', gone: 'The link has expired or the call was not found.', inactive: 'This booking is not active.', mic: 'Allow the microphone or tap a button.', table: 'table', you: 'You' },
  };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const SPEECH_LANG = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };

  async function api(method, payload, query = '') {
    const res = await fetch('/api/call-ai' + query, { method, credentials: 'same-origin', headers: payload ? { 'Content-Type': 'application/json' } : {}, body: payload ? JSON.stringify(payload) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Error');
    return data;
  }

  /** Two-tone phone ring through Web Audio (starts once the browser allows sound) + vibration. */
  function ringer() {
    let ctx = null,
      timer = 0;
    const beep = () => {
      try {
        ctx ||= new (window.AudioContext || window.webkitAudioContext)();
        const t = ctx.currentTime;
        for (const [f, at] of [[440, 0], [480, 0], [440, 0.45], [480, 0.45]]) {
          const o = ctx.createOscillator(),
            g = ctx.createGain();
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t + at);
          g.gain.exponentialRampToValueAtTime(0.08, t + at + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.38);
          o.connect(g).connect(ctx.destination);
          o.start(t + at);
          o.stop(t + at + 0.4);
        }
      } catch {}
      navigator.vibrate?.([400, 200, 400]);
    };
    return {
      start() {
        beep();
        timer = setInterval(beep, 2500);
      },
      stop() {
        clearInterval(timer);
        navigator.vibrate?.(0);
        ctx?.close?.().catch(() => {});
        ctx = null;
      },
    };
  }

  // Sound on/off for the AI voice (🔊 / 🔇), remembered on this device; the text is always on screen.
  const muted = () => {
    try {
      return localStorage.getItem('rf-call-muted') === '1';
    } catch {
      return false;
    }
  };
  let playing = null;
  /** Plays the natural server voice (OGG/Opus, or MP3 where OGG is not supported). In Uzbek the browser's
   *  robotic synthesis is never used: without the server voice the question is read from the screen. */
  async function say(call, text, which, k) {
    if (muted()) return;
    let audio = null,
      mime = 'audio/ogg';
    try {
      const canOgg = !!document.createElement('audio').canPlayType?.('audio/ogg; codecs=opus');
      const r = await api('POST', { action: 'speech', id: call.id, k, say: which, ...(canOgg ? {} : { format: 'mp3' }) });
      audio = r.audio;
      mime = r.mimeType || mime;
    } catch {}
    if (audio && !muted()) {
      const el = new Audio('data:' + mime + ';base64,' + audio);
      playing = el;
      await new Promise((done) => {
        el.onended = el.onerror = el.onpause = done;
        el.play().catch(done);
      });
      playing = null;
      return;
    }
    if (call.lang === 'uz' || !('speechSynthesis' in window) || muted()) return;
    await new Promise((done) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = SPEECH_LANG[call.lang] || 'ru-RU';
      const voice = speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith(call.lang));
      if (voice) u.voice = voice;
      u.onend = u.onerror = done;
      speechSynthesis.speak(u);
      setTimeout(done, 12000);
    });
  }
  function soundButton() {
    return `<button type="button" class="rf-call-sound" data-sound aria-pressed="${!muted()}" aria-label="${muted() ? 'Ovozni yoqish' : 'Ovozni o‘chirish'}">${muted() ? '🔇' : '🔊'}</button>`;
  }
  function bindSound(root) {
    const b = root.querySelector('[data-sound]');
    if (!b) return;
    b.onclick = () => {
      const off = !muted();
      try {
        localStorage.setItem('rf-call-muted', off ? '1' : '0');
      } catch {}
      if (off) {
        playing?.pause();
        window.speechSynthesis?.cancel?.();
      }
      b.textContent = off ? '🔇' : '🔊';
      b.setAttribute('aria-pressed', String(!off));
      b.setAttribute('aria-label', off ? 'Ovozni yoqish' : 'Ovozni o‘chirish');
    };
  }

  /** One spoken answer: SpeechRecognition, else a 5 s recording sent for transcription. */
  async function listen(call, k) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      return new Promise((done) => {
        const r = new SR();
        r.lang = SPEECH_LANG[call.lang] || 'uz-UZ';
        r.interimResults = false;
        r.maxAlternatives = 3;
        let heard = '';
        r.onresult = (e) => (heard = [...e.results].map((x) => [...x].map((a) => a.transcript).join(' ')).join(' '));
        r.onerror = r.onend = () => done(heard);
        try {
          r.start();
          setTimeout(() => r.stop(), 8000);
        } catch {
          done('');
        }
      });
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return '';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ['audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
      const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined),
        parts = [];
      rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
      const stopped = new Promise((ok) => (rec.onstop = ok));
      rec.start();
      setTimeout(() => rec.state !== 'inactive' && rec.stop(), 5000);
      await stopped;
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(parts, { type: (rec.mimeType || type || 'audio/webm').split(';')[0] });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let bin = '';
      for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
      const data = btoa(bin);
      return (await api('POST', { action: 'transcribe', id: call.id, k, audio: { mimeType: blob.type, data } })).transcript || '';
    } catch {
      return '';
    }
  }

  /** The full call screen inside `root`. */
  async function mountCall(root, id, k) {
    let call;
    try {
      call = (await api('GET', null, '?id=' + encodeURIComponent(id) + (k ? '&k=' + encodeURIComponent(k) : ''))).call;
    } catch (e) {
      root.innerHTML = `<div class="rf-call-card"><p>${esc(COPY.uz.gone)}</p><p class="rf-call-muted">${esc(e.message)}</p><a class="rf-call-link" href="/">RestaurantFoods</a></div>`;
      return;
    }
    const c = COPY[call.lang] || COPY.uz;
    document.documentElement.lang = call.lang;
    const info = `${esc(call.restaurant)} · ${call.table}-${esc(c.table)} · ${esc(call.date)} ${esc(call.slot)}`;
    if (!call.active) {
      root.innerHTML = `<div class="rf-call-card"><h1>${esc(c.caller)}</h1><p>${info}</p><p>${esc(c.inactive)}</p></div>`;
      return;
    }
    const ring = ringer();
    let busy = false;
    const answerButtons = `<div class="rf-call-answers"><button type="button" class="rf-call-yes" data-v="yes">${esc(c.yes)}</button><button type="button" class="rf-call-no" data-v="no">${esc(c.no)}</button></div>`;
    const finish = (message, verdict) => {
      root.innerHTML = `<div class="rf-call-card ${verdict === 'yes' ? 'ok' : 'warn'}"><div class="rf-call-avatar small" aria-hidden="true">${verdict === 'yes' ? '✓' : '!'}</div><h1>${esc(verdict === 'yes' ? c.confirmed : c.ended)}</h1><p>${esc(message)}</p><p class="rf-call-muted">${info}</p>${verdict === 'no' && call.restaurantPhone ? `<a class="rf-call-link" href="tel:${esc(call.restaurantPhone)}">📞 ${esc(c.call)}: ${esc(call.restaurantPhone)}</a>` : ''}</div>`;
    };
    const send = async (payload) => {
      if (busy) return null;
      busy = true;
      try {
        return await api('POST', { action: 'answer', id: call.id, k, ...payload });
      } finally {
        busy = false;
      }
    };
    const bindAnswers = () =>
      root.querySelectorAll('[data-v]').forEach((b) => (b.onclick = async () => {
        window.speechSynthesis?.cancel?.();
        const r = await send({ verdict: b.dataset.v }).catch((e) => ({ error: e.message }));
        if (r?.understood) finish(r.message, r.verdict);
      }));
    const live = async () => {
      ring.stop();
      root.innerHTML = `<div class="rf-call-card live">${soundButton()}<div class="rf-call-avatar" aria-hidden="true">AI</div><h1>${esc(c.caller)}</h1><p class="rf-call-muted">${info}</p><p class="rf-call-state" data-state>${esc(c.speaking)}</p><p class="rf-call-line">${esc(call.question)}</p><div class="rf-call-heard" data-heard></div>${answerButtons}<button type="button" class="rf-call-hang" data-hang aria-label="${esc(c.decline)}">✆</button></div>`;
      bindAnswers();
      bindSound(root);
      let active = true;
      root.querySelector('[data-hang]').onclick = () => {
        active = false;
        playing?.pause();
        window.speechSynthesis?.cancel?.();
        root.innerHTML = `<div class="rf-call-card"><h1>${esc(c.ended)}</h1><p>${esc(c.declined)}</p>${answerButtons}</div>`;
        bindAnswers();
      };
      const state = (t) => root.querySelector('[data-state]') && (root.querySelector('[data-state]').textContent = t);
      await say(call, call.question, 'question', k);
      for (let attempt = 0; attempt < 2 && active; attempt++) {
        state(c.listening);
        const heard = await listen(call, k);
        if (!active || !root.querySelector('[data-state]')) return;
        if (heard) root.querySelector('[data-heard]').textContent = c.you + ': “' + heard + '”';
        const r = heard ? await send({ text: heard }).catch(() => null) : null;
        if (r?.understood) {
          state(c.speaking);
          await say(call, r.message, r.verdict === 'yes' ? 'thanks' : 'sorry', k);
          finish(r.message, r.verdict);
          return;
        }
        state(c.speaking);
        await say(call, heard ? c.again : c.mic, 'question', k).catch(() => {});
      }
      state(c.mic);
    };
    root.innerHTML = `<div class="rf-call-card ringing"><p class="rf-call-muted">${esc(c.incoming)}</p><div class="rf-call-avatar pulse" aria-hidden="true">AI</div><h1>${esc(c.caller)}</h1><p>${info}</p><div class="rf-call-actions"><button type="button" class="rf-call-decline" data-decline><span aria-hidden="true">✆</span>${esc(c.decline)}</button><button type="button" class="rf-call-accept" data-accept><span aria-hidden="true">✆</span>${esc(c.accept)}</button></div></div>`;
    ring.start();
    root.querySelector('[data-accept]').onclick = live;
    root.querySelector('[data-decline]').onclick = () => {
      ring.stop();
      root.innerHTML = `<div class="rf-call-card"><h1>${esc(c.ended)}</h1><p>${esc(c.declined)}</p><p class="rf-call-muted">${info}</p>${answerButtons}</div>`;
      bindAnswers();
    };
  }

  /** On the main site: ring when the signed-in customer has an open Call AI call. */
  let watching = 0;
  function watch() {
    if (watching) return;
    const seen = new Set();
    try {
      JSON.parse(sessionStorage.getItem('rf-call-seen') || '[]').forEach((x) => seen.add(x));
    } catch {}
    const check = async () => {
      if (document.visibilityState === 'hidden' || document.querySelector('.rf-call-overlay')) return;
      let calls = [];
      try {
        calls = (await api('GET', null, '?open=1')).calls || [];
      } catch {
        return;
      }
      const call = calls.find((x) => !seen.has(x.id));
      if (!call) return;
      seen.add(call.id);
      try {
        sessionStorage.setItem('rf-call-seen', JSON.stringify([...seen]));
      } catch {}
      const c = COPY[document.documentElement.lang] || COPY.uz;
      const ov = document.createElement('div');
      ov.className = 'rf-call-overlay';
      ov.setAttribute('role', 'alertdialog');
      ov.innerHTML = `<div class="rf-call-card ringing"><p class="rf-call-muted">${esc(c.incoming)}</p><div class="rf-call-avatar pulse" aria-hidden="true">AI</div><h1>${esc(c.caller)}</h1><p>${esc(call.restaurant)} · ${call.table}-${esc(c.table)} · ${esc(call.slot)}</p><div class="rf-call-actions"><button type="button" class="rf-call-decline" data-decline><span aria-hidden="true">✆</span>${esc(c.decline)}</button><button type="button" class="rf-call-accept" data-accept><span aria-hidden="true">✆</span>${esc(c.accept)}</button></div></div>`;
      document.body.append(ov);
      const ring = ringer();
      ring.start();
      ov.querySelector('[data-decline]').onclick = () => (ring.stop(), ov.remove());
      ov.querySelector('[data-accept]').onclick = () => {
        ring.stop();
        location.href = '/call-ai/' + encodeURIComponent(call.id);
      };
    };
    check();
    watching = setInterval(check, 60000);
  }

  window.RFCallAI = { mountCall, watch };
  if (document.body?.classList.contains('rf-call-page')) {
    const id = decodeURIComponent(location.pathname.split('/')[2] || '');
    mountCall(document.getElementById('rfCall'), id, new URLSearchParams(location.search).get('k'));
  }
})();
