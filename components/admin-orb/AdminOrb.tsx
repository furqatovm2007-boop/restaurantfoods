import { Canvas, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Color, type ShaderMaterial } from 'three';
import { postStream } from '../shared/sse-client';
import { chime, record, speak as speakAloud, unlockAudio, type Playback, type Recording } from './orb-voice';

/* ------------------------------------------------------------------ copy */

type Lang = 'uz' | 'ru' | 'en';
const COPY = {
  uz: { title: 'Admin AI', liveChange: '{r}: {t}-stol — {s} (AI kamera)', paid: 'depozit to‘langan', listen: 'Gapiring… tugatish uchun yana bosing', mic: 'Ovoz bilan so‘rash', micError: 'Mikrofon ishlamadi. Ruxsatni tekshiring.', speaking: 'Gapiryapman…', stop: 'To‘xtatish', alerts: 'Xabarlar', tables: 'Stollar', chat: 'AI so‘rov', none: 'Yangi bron yo‘q', newBooking: 'Yangi bron', guests: 'mehmon', table: 'stol', free: 'Bo‘sh', occupied: 'Band', reserved: 'Bron', unknown: 'Noma’lum', liveEmpty: 'Jonli holat hali yo‘q. Kamera yoki qo‘lda belgilash kerak.', ask: 'Masalan: bugun nechta bron bor?', send: 'Yuborish', voiceOn: 'Ovozli xabar yoqilgan', voiceOff: 'Ovozli xabar o‘chirilgan', close: 'Yopish', open: 'Admin AI yordamchini ochish', trial: 'Sinov muddati: {n} kun qoldi', active: 'Tarif faol: {n} kun', unlimited: 'Tarif faol (muddatsiz)', payment: 'To‘lov kerak — tarifni tanlang', error: 'AI hozir javob bera olmadi.', speakBooking: '{r}: yangi bron, {d} soat {s}, {g} kishi, {t}-stol.' },
  ru: { title: 'Admin AI', liveChange: '{r}: стол {t} — {s} (AI-камера)', paid: 'депозит оплачен', listen: 'Говорите… нажмите ещё раз, чтобы закончить', mic: 'Спросить голосом', micError: 'Микрофон не работает. Проверьте разрешение.', speaking: 'Говорю…', stop: 'Остановить', alerts: 'Уведомления', tables: 'Столы', chat: 'Вопрос AI', none: 'Новых броней нет', newBooking: 'Новая бронь', guests: 'гостей', table: 'стол', free: 'Свободен', occupied: 'Занят', reserved: 'Бронь', unknown: 'Неизвестно', liveEmpty: 'Живого статуса пока нет. Нужна камера или ручная отметка.', ask: 'Например: сколько броней сегодня?', send: 'Отправить', voiceOn: 'Голосовые уведомления включены', voiceOff: 'Голосовые уведомления выключены', close: 'Закрыть', open: 'Открыть Admin AI', trial: 'Пробный период: осталось {n} дн.', active: 'Тариф активен: {n} дн.', unlimited: 'Тариф активен (бессрочно)', payment: 'Нужна оплата — выберите тариф', error: 'AI сейчас не ответил.', speakBooking: '{r}: новая бронь, {d} в {s}, {g} гостей, стол {t}.' },
  en: { title: 'Admin AI', liveChange: '{r}: table {t} — {s} (AI camera)', paid: 'deposit paid', listen: 'Listening… tap again to finish', mic: 'Ask by voice', micError: 'The microphone is unavailable. Check the permission.', speaking: 'Speaking…', stop: 'Stop', alerts: 'Alerts', tables: 'Tables', chat: 'Ask AI', none: 'No new bookings', newBooking: 'New booking', guests: 'guests', table: 'table', free: 'Free', occupied: 'Occupied', reserved: 'Reserved', unknown: 'Unknown', liveEmpty: 'No live status yet. Connect a camera or mark tables manually.', ask: 'E.g. how many bookings today?', send: 'Send', voiceOn: 'Voice alerts on', voiceOff: 'Voice alerts off', close: 'Close', open: 'Open Admin AI assistant', trial: 'Trial: {n} days left', active: 'Plan active: {n} days', unlimited: 'Plan active (no end date)', payment: 'Payment needed — choose a plan', error: 'The AI could not answer right now.', speakBooking: '{r}: new booking, {d} at {s}, {g} guests, table {t}.' },
} satisfies Record<Lang, Record<string, string>>;
const fill = (s: string, values: Record<string, string | number>) => s.replace(/\{(\w)\}/g, (_, k) => String(values[k] ?? ''));

/* ------------------------------------------------------------- orb mesh */

const vertex = /* glsl */ `
uniform float uTime; uniform float uPulse;
varying vec3 vNormal; varying vec3 vView; varying float vWave;
void main() {
  float wave = sin(position.x * 3.1 + uTime * 1.3) * sin(position.y * 2.7 + uTime * 1.1) * sin(position.z * 3.4 + uTime * 0.9);
  vec3 p = position + normal * (wave * (0.07 + uPulse * 0.12) + uPulse * 0.06);
  vWave = wave;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const fragment = /* glsl */ `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uPulse;
varying vec3 vNormal; varying vec3 vView; varying float vWave;
void main() {
  float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
  vec3 base = mix(uA, uB, vWave * 0.5 + 0.5);
  vec3 color = mix(base, uC, fresnel * (0.6 + uPulse));
  gl_FragColor = vec4(color + fresnel * 0.35, 1.0);
}`;

function OrbMesh({ signal, calm, level }: { signal: number; calm: boolean; level: React.RefObject<(() => number) | null> }) {
  const material = useRef<ShaderMaterial>(null);
  const pulse = useRef(0);
  // Each new booking bumps `signal`; the orb swells and settles over ~1.5 s.
  useEffect(() => {
    if (signal) pulse.current = 1;
  }, [signal]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPulse: { value: 0 }, uA: { value: new Color('#00c9a7') }, uB: { value: new Color('#00a8ff') }, uC: { value: new Color('#e0c791') } }), []);
  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value += calm ? 0 : delta;
    pulse.current = Math.max(0, pulse.current - delta * 0.6);
    // While the orb talks or listens, it swells with the audio loudness.
    const voice = level.current?.() ?? 0;
    m.uniforms.uPulse.value += (Math.max(pulse.current, voice * 0.9) - m.uniforms.uPulse.value) * Math.min(1, delta * 14);
    state.scene.rotation.y += calm ? 0 : delta * 0.25;
  });
  return (
    <mesh>
      <icosahedronGeometry args={[1, 24]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- data */

interface PlanInfo {
  status: 'trial' | 'active' | 'payment_required';
  daysLeft: number;
  features: Record<string, boolean>;
}
interface Booking {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  deposit_status?: string;
  date: string;
  slot: string;
  table_number: number;
  guests: number;
  created_at: string;
}
interface EventsResponse {
  now: string;
  enabled: boolean;
  restaurants: { id: string; name: string; plan: PlanInfo }[];
  bookings: Booking[];
  live: { restaurant_id: string; status: string; n: number }[];
  tables?: { restaurant_id: string; table_number: number; status: string; source: string }[];
}
interface Toast {
  id: number;
  kind: 'booking' | 'live';
  text: string;
}

export interface AdminOrbProps {
  lang?: string;
  pollSeconds?: number;
  /** Where the plan / payment link points. */
  manageHref?: string;
}

const VOICE_KEY = 'rf-orb-voice';

/**
 * Admin AI widget pinned to the bottom-right corner: an animated orb that pulses and
 * speaks when a new booking arrives, shows live table counts and streams answers about
 * the restaurant from /api/manage/assistant.
 */
export function AdminOrb({ lang: rawLang = 'uz', pollSeconds = 15, manageHref = '#/manage' }: AdminOrbProps) {
  const lang: Lang = rawLang === 'ru' || rawLang === 'en' ? rawLang : 'uz';
  const t = COPY[lang];
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'alerts' | 'tables' | 'chat'>('alerts');
  const [feed, setFeed] = useState<EventsResponse | null>(null);
  const [alerts, setAlerts] = useState<Booking[]>([]);
  const [unread, setUnread] = useState(0);
  const [voice, setVoice] = useState(() => {
    try {
      return localStorage.getItem(VOICE_KEY) !== 'off';
    } catch {
      return true;
    }
  });
  const [restaurantId, setRestaurantId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const history = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [signal, setSignal] = useState(0);
  const since = useRef<string | null>(null);
  // Last seen status per restaurant:table; null until the first poll seeds it.
  const known = useRef<Map<string, string> | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const [calm] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const level = useRef<(() => number) | null>(null);
  const playback = useRef<Playback | null>(null);
  const recording = useRef<Recording | null>(null);
  const [talking, setTalking] = useState(false);
  const [listening, setListening] = useState(false);

  const stopTalking = useCallback(() => {
    playback.current?.stop();
    playback.current = null;
    level.current = null;
    setTalking(false);
  }, []);

  /** Says `text` with OpenAI TTS (browser speech as fallback); the orb follows the audio level. */
  const speak = useCallback(
    async (text: string) => {
      if (!voice || !text.trim()) return;
      stopTalking();
      let mine: Playback | null = null;
      try {
        mine = await speakAloud(text, lang);
        playback.current = mine;
        level.current = mine.level;
        setTalking(true);
        await mine.done;
      } catch {
        /* voice is optional; the text is already on screen */
      } finally {
        if (mine && playback.current === mine) stopTalking();
      }
    },
    [voice, lang, stopTalking],
  );

  // Poll the booking feed while the tab is visible.
  useEffect(() => {
    let timer = 0;
    let alive = true;
    const poll = async () => {
      if (document.hidden) return;
      try {
        const url = '/api/manage/events' + (since.current ? '?since=' + encodeURIComponent(since.current) : '');
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok || !alive) return;
        const data = (await res.json()) as EventsResponse;
        since.current = data.now;
        setFeed(data);
        const names = new Map(data.restaurants.map((r) => [r.id, r.name]));
        const statusWord: Record<string, string> = { free: t.free, occupied: t.occupied, reserved: t.reserved };
        const fresh: Toast[] = data.bookings.map((b) => ({ id: ++toastId.current, kind: 'booking', text: `${t.newBooking}: ${b.restaurant_name} · ${b.table_number}-${t.table} · ${b.date} ${b.slot} · ${b.guests} ${t.guests}${b.deposit_status === 'paid' ? ' · ' + t.paid : ''}` }));
        const seen = new Map((data.tables ?? []).map((row) => [row.restaurant_id + ':' + row.table_number, row.status]));
        const changed = (data.tables ?? []).filter((row) => row.source === 'vision' && known.current && known.current.get(row.restaurant_id + ':' + row.table_number) !== row.status && statusWord[row.status]);
        known.current = seen;
        for (const row of changed) fresh.push({ id: ++toastId.current, kind: 'live', text: fill(t.liveChange, { r: names.get(row.restaurant_id) ?? '', t: row.table_number, s: statusWord[row.status] }) });
        if (fresh.length) {
          setToasts((list) => [...list, ...fresh].slice(-4));
          const ids = new Set(fresh.map((f) => f.id));
          window.setTimeout(() => setToasts((list) => list.filter((x) => !ids.has(x.id))), 7000);
          if (voice) chime(data.bookings.length ? 'booking' : 'live');
          // Lets the live table map refresh without waiting for its own poll.
          for (const id of new Set([...data.bookings.map((b) => b.restaurant_id), ...changed.map((c) => c.restaurant_id)])) window.dispatchEvent(new CustomEvent('rf:live-change', { detail: { restaurantId: id } }));
        }
        if (data.bookings.length) {
          setAlerts((list) => [...data.bookings.slice().reverse(), ...list].slice(0, 30));
          setUnread((n) => n + data.bookings.length);
          setSignal((n) => n + 1);
          speak(data.bookings.slice(-3).map((b) => fill(t.speakBooking, { r: b.restaurant_name, d: b.date, s: b.slot, g: b.guests, t: b.table_number })).join(' '));
        }
      } catch {
        /* offline: try again on the next tick */
      }
    };
    poll();
    timer = window.setInterval(poll, Math.max(5, pollSeconds) * 1000);
    const wake = () => !document.hidden && poll();
    document.addEventListener('visibilitychange', wake);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [pollSeconds, speak, t, voice]);

  const enabledRestaurants = feed?.restaurants.filter((r) => r.plan.features.adminAi) ?? [];
  const current = restaurantId || enabledRestaurants[0]?.id || '';

  const ask = async (spoken?: string) => {
    const message = (spoken ?? question).trim();
    if (!message || !current || busy) return;
    abort.current?.abort();
    abort.current = new AbortController();
    setBusy(true);
    setAnswer('');
    setQuestion('');
    try {
      const result = await postStream('/api/manage/assistant', { restaurantId: current, message, lang, voice: spoken !== undefined, history: history.current.slice(-8) }, (_, full) => setAnswer(full), abort.current.signal);
      history.current.push({ role: 'user', content: message }, { role: 'assistant', content: result.reply.slice(0, 1600) });
      setAnswer(result.reply);
      speak(result.reply);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setAnswer(t.error);
    } finally {
      setBusy(false);
    }
  };

  /** Push-to-talk: first tap records, second tap transcribes and asks. */
  const toggleMic = async () => {
    unlockAudio();
    stopTalking();
    if (recording.current) {
      const rec = recording.current;
      recording.current = null;
      level.current = null;
      setListening(false);
      setBusy(true);
      try {
        const text = await rec.finish();
        setBusy(false);
        if (text) {
          setQuestion(text);
          await ask(text);
        }
      } catch {
        setBusy(false);
        setAnswer(t.micError);
      }
      return;
    }
    try {
      const rec = await record(lang);
      recording.current = rec;
      level.current = rec.level;
      setListening(true);
      setAnswer('');
    } catch {
      setAnswer(t.micError);
    }
  };

  useEffect(
    () => () => {
      abort.current?.abort();
      recording.current?.cancel();
      playback.current?.stop();
    },
    [],
  );

  if (!feed?.enabled) return null;

  const toggleVoice = () => {
    setVoice((v) => {
      try {
        localStorage.setItem(VOICE_KEY, v ? 'off' : 'on');
      } catch {
        /* private mode */
      }
      if (v) window.speechSynthesis?.cancel();
      return !v;
    });
  };

  // Demo restaurants are paid far into the future; a day count in the tens of thousands means nothing.
  const planLine = (p: PlanInfo) => (p.status === 'trial' ? fill(t.trial, { n: p.daysLeft }) : p.status === 'active' ? (p.daysLeft > 3650 ? t.unlimited : fill(t.active, { n: p.daysLeft })) : t.payment);
  const tabClass = (active: boolean) => `rf:flex-1 rf:rounded-lg rf:px-2 rf:py-1.5 rf:text-xs rf:font-medium rf:transition ${active ? 'rf:bg-teal rf:text-night' : 'rf:bg-transparent rf:text-text/75 rf:hover:text-teal'}`;
  const statusName: Record<string, string> = { free: t.free, occupied: t.occupied, reserved: t.reserved, unknown: t.unknown };

  return (
    <>
    <ol className="rf:pointer-events-none rf:fixed rf:top-[calc(12px+env(safe-area-inset-top))] rf:right-3 rf:z-[2147482500] rf:m-0 rf:grid rf:w-[min(340px,calc(100vw-24px))] rf:list-none rf:gap-2 rf:p-0" aria-live="assertive">
      {toasts.map((toast) => (
        <li
          key={toast.id}
          className="rf-orb-toast rf:pointer-events-auto rf:flex rf:items-start rf:gap-2 rf:rounded-xl rf:border rf:bg-panel/95 rf:px-3 rf:py-2.5 rf:text-sm rf:text-text rf:shadow-2xl rf:backdrop-blur"
          style={{ borderColor: toast.kind === 'booking' ? '#facc15' : '#00c9a7', boxShadow: `0 0 18px ${toast.kind === 'booking' ? 'rgba(250,204,21,.35)' : 'rgba(0,201,167,.35)'}` }}
        >
          <span aria-hidden="true">{toast.kind === 'booking' ? '📌' : '📷'}</span>
          <span className="rf:flex-1">{toast.text}</span>
          <button type="button" aria-label={t.close} onClick={() => setToasts((list) => list.filter((x) => x.id !== toast.id))} className="rf:border-0 rf:bg-transparent rf:p-0 rf:text-text/60 rf:hover:text-text">
            ×
          </button>
        </li>
      ))}
    </ol>
    <div className="rf:fixed rf:right-4 rf:bottom-[calc(16px+env(safe-area-inset-bottom))] rf:z-[2147482000] rf:flex rf:flex-col rf:items-end rf:gap-3 rf:max-sm:bottom-[calc(84px+env(safe-area-inset-bottom))]">
      <section
        aria-label={t.title}
        className={`rf:w-[min(360px,calc(100vw-32px))] rf:origin-bottom-right rf:overflow-hidden rf:rounded-2xl rf:border rf:border-line rf:bg-panel/95 rf:text-text rf:shadow-2xl rf:backdrop-blur rf:transition rf:duration-300 ${open ? 'rf:scale-100 rf:opacity-100' : 'rf:pointer-events-none rf:scale-90 rf:opacity-0'}`}
        inert={!open}
        aria-hidden={!open}
      >
        <header className="rf:flex rf:items-center rf:gap-2 rf:border-b rf:border-line rf:px-4 rf:py-3">
          <strong className="rf:flex-1 rf:text-sm">{t.title}</strong>
          <button type="button" onClick={toggleVoice} aria-pressed={voice} title={voice ? t.voiceOn : t.voiceOff} className="rf:rounded-lg rf:border rf:border-line rf:bg-transparent rf:px-2 rf:py-1 rf:text-xs rf:text-text">
            {voice ? '🔔' : '🔕'}
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="rf:rounded-lg rf:border rf:border-line rf:bg-transparent rf:px-2 rf:py-1 rf:text-xs rf:text-text">
            ×
          </button>
        </header>
        {enabledRestaurants.length > 1 && (
          <select value={current} onChange={(e) => setRestaurantId(e.target.value)} className="rf:mx-4 rf:mt-3 rf:w-[calc(100%-32px)] rf:rounded-lg rf:border rf:border-line rf:bg-night rf:px-2 rf:py-1.5 rf:text-xs rf:text-text">
            {enabledRestaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
        <ul className="rf:m-0 rf:list-none rf:space-y-1 rf:px-4 rf:pt-3 rf:pb-0 rf:text-[11px]">
          {feed.restaurants.map((r) => (
            <li key={r.id} className={r.plan.status === 'payment_required' ? 'rf:text-[#f0a35e]' : 'rf:text-text/65'}>
              {r.name}: {r.plan.status === 'payment_required' ? <a href={manageHref} className="rf:text-gold rf:underline">{planLine(r.plan)}</a> : planLine(r.plan)}
            </li>
          ))}
        </ul>
        <nav className="rf:mx-4 rf:mt-3 rf:flex rf:gap-1 rf:rounded-xl rf:bg-night/70 rf:p-1">
          <button type="button" className={tabClass(tab === 'alerts')} onClick={() => setTab('alerts')}>
            {t.alerts} {unread > 0 && `(${unread})`}
          </button>
          <button type="button" className={tabClass(tab === 'tables')} onClick={() => setTab('tables')}>
            {t.tables}
          </button>
          <button type="button" className={tabClass(tab === 'chat')} onClick={() => setTab('chat')}>
            {t.chat}
          </button>
        </nav>
        <div className="rf:max-h-[46vh] rf:overflow-y-auto rf:p-4">
          {tab === 'alerts' &&
            (alerts.length ? (
              <ol className="rf:m-0 rf:list-none rf:space-y-2 rf:p-0" aria-live="polite">
                {alerts.map((b) => (
                  <li key={b.id} className="rf:rounded-xl rf:border rf:border-line rf:bg-night/60 rf:p-3 rf:text-xs">
                    <b className="rf:text-gold">{t.newBooking}</b> · {b.restaurant_name}
                    <br />
                    {b.date} {b.slot} · {b.guests} {t.guests} · {b.table_number}-{t.table}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rf:m-0 rf:text-xs rf:text-text/60">{t.none}</p>
            ))}
          {tab === 'tables' &&
            (feed.live.length ? (
              <ul className="rf:m-0 rf:list-none rf:space-y-2 rf:p-0 rf:text-xs">
                {enabledRestaurants.map((r) => {
                  const rows = feed.live.filter((l) => l.restaurant_id === r.id);
                  return (
                    <li key={r.id}>
                      <b>{r.name}</b>
                      <div className="rf:mt-1 rf:flex rf:flex-wrap rf:gap-1.5">
                        {rows.map((l) => (
                          <span key={l.status} className="rf:rounded-full rf:bg-night/70 rf:px-2 rf:py-0.5">
                            {statusName[l.status] ?? l.status}: {l.n}
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rf:m-0 rf:text-xs rf:text-text/60">{t.liveEmpty}</p>
            ))}
          {tab === 'chat' && (
            <form
              className="rf:space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                unlockAudio();
                ask();
              }}
            >
              <div className="rf:min-h-16 rf:whitespace-pre-wrap rf:rounded-xl rf:bg-night/60 rf:p-3 rf:text-xs rf:leading-relaxed" aria-live="polite">
                {listening ? t.listen : answer || (busy ? '…' : '')}
              </div>
              {talking && (
                <button type="button" onClick={stopTalking} className="rf:rounded-lg rf:border rf:border-line rf:bg-transparent rf:px-2 rf:py-1 rf:text-[11px] rf:text-text/80">
                  ■ {t.stop} · {t.speaking}
                </button>
              )}
              <div className="rf:flex rf:gap-2">
                <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={1400} placeholder={t.ask} className="rf:min-w-0 rf:flex-1 rf:rounded-lg rf:border rf:border-line rf:bg-night rf:px-3 rf:py-2 rf:text-xs rf:text-text" />
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={busy && !listening}
                  aria-pressed={listening}
                  aria-label={t.mic}
                  title={t.mic}
                  className={`rf:grid rf:size-9 rf:shrink-0 rf:place-items-center rf:rounded-lg rf:border rf:text-sm rf:transition ${listening ? 'rf:animate-pulse rf:border-[#e0697a] rf:bg-[#e0697a] rf:text-white' : 'rf:border-line rf:bg-transparent rf:text-text'} rf:disabled:opacity-40`}
                >
                  🎤
                </button>
                <button type="submit" disabled={busy || !question.trim()} className="rf:rounded-lg rf:border-0 rf:bg-teal rf:px-3 rf:text-xs rf:font-semibold rf:text-night rf:disabled:opacity-40">
                  {t.send}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
      <button
        type="button"
        onClick={() => {
          unlockAudio();
          if (!open) setTab(unread ? 'alerts' : 'chat');
          setOpen((o) => !o);
          setUnread(0);
        }}
        aria-label={t.open}
        aria-expanded={open}
        className="rf:relative rf:size-[72px] rf:cursor-pointer rf:rounded-full rf:border-0 rf:bg-transparent rf:p-0 rf:shadow-[0_10px_40px_rgba(0,201,167,0.35)] rf:transition rf:hover:scale-105 rf:focus-visible:outline-2 rf:focus-visible:outline-offset-4 rf:focus-visible:outline-blue"
      >
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3.1], fov: 45 }} gl={{ alpha: true, antialias: true }} frameloop={calm ? 'demand' : 'always'} style={{ pointerEvents: 'none' }}>
          <OrbMesh signal={signal} calm={calm} level={level} />
        </Canvas>
        {unread > 0 && (
          <span className="rf:absolute rf:-top-1 rf:-right-1 rf:grid rf:h-6 rf:min-w-6 rf:place-items-center rf:rounded-full rf:bg-[#e0697a] rf:px-1.5 rf:text-xs rf:font-bold rf:text-white">{unread}</span>
        )}
      </button>
    </div>
    </>
  );
}

export default AdminOrb;
