import { useEffect, useState } from 'react';
import { STATUS_COLOR, tableStatus, tashkentNow, toMinutes, type MapBooking, type MapLive, type MapStatus, type MapTable } from './status';

/*
 * Live floor map for the restaurant dashboard. Each table is coloured by what is true now:
 *   red    occupied (AI camera or staff)
 *   yellow booked through the site for this moment, or marked reserved
 *   green  free
 * Staff can override a table by hand; "Auto" removes the override so camera and
 * bookings decide again. Data comes from /api/tables, refreshed every few seconds and
 * immediately when the admin orb reports a change (rf:live-change).
 */
type Lang = 'uz' | 'ru' | 'en';
const COPY = {
  uz: { title: 'Jonli stol xaritasi', free: 'Bo‘sh', occupied: 'Band', booked: 'Bron', auto: 'Avtomatik', floor: 'Qavat', seats: 'kishi', camera: 'AI kamera', manual: 'Qo‘lda', booking: 'Saytdan bron', next: 'Keyingi bron', none: 'Stollar hali joylashtirilmagan.', upgrade: 'Jonli holat Business va Premium tariflarida ishlaydi.', error: 'Holat saqlanmadi.', updated: 'Yangilandi', choose: 'Stolni tanlang va holatini belgilang.' },
  ru: { title: 'Живая карта столов', free: 'Свободен', occupied: 'Занят', booked: 'Бронь', auto: 'Авто', floor: 'Этаж', seats: 'мест', camera: 'AI-камера', manual: 'Вручную', booking: 'Бронь с сайта', next: 'Следующая бронь', none: 'Столы ещё не расставлены.', upgrade: 'Живой статус доступен на тарифах Business и Premium.', error: 'Статус не сохранён.', updated: 'Обновлено', choose: 'Выберите стол и задайте статус.' },
  en: { title: 'Live table map', free: 'Free', occupied: 'Occupied', booked: 'Booked', auto: 'Auto', floor: 'Floor', seats: 'seats', camera: 'AI camera', manual: 'Manual', booking: 'Site booking', next: 'Next booking', none: 'No tables placed yet.', upgrade: 'Live status is part of the Business and Premium plans.', error: 'Status was not saved.', updated: 'Updated', choose: 'Pick a table and set its status.' },
};

interface TablesResponse {
  features: { liveTables: boolean };
  live: MapLive[];
  tables: MapTable[];
  bookings: MapBooking[];
  floors: number;
  width: number | null;
  length: number | null;
}

export interface AdminTableMapProps {
  restaurantId: string;
  lang?: string;
  pollSeconds?: number;
}

export function AdminTableMap({ restaurantId, lang: rawLang = 'uz', pollSeconds = 10 }: AdminTableMapProps) {
  const lang: Lang = rawLang === 'ru' || rawLang === 'en' ? rawLang : 'uz';
  const t = COPY[lang];
  const [data, setData] = useState<TablesResponse | null>(null);
  const [floor, setFloor] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [clock, setClock] = useState(() => tashkentNow());

  // Bumped after a manual change so the effect reloads at once.
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      const now = tashkentNow();
      try {
        const res = await fetch(`/api/tables?restaurantId=${encodeURIComponent(restaurantId)}&edit=1&date=${now.date}`, { headers: { Accept: 'application/json' } });
        if (!res.ok || !alive) return;
        setData((await res.json()) as TablesResponse);
        setClock(now);
      } catch {
        /* offline: next tick */
      }
    };
    load();
    const timer = window.setInterval(load, Math.max(5, pollSeconds) * 1000);
    const onChange = (e: Event) => {
      const id = (e as CustomEvent<{ restaurantId?: string }>).detail?.restaurantId;
      if (!id || id === restaurantId) load();
    };
    window.addEventListener('rf:live-change', onChange);
    document.addEventListener('visibilitychange', load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('rf:live-change', onChange);
      document.removeEventListener('visibilitychange', load);
    };
  }, [pollSeconds, restaurantId, reload]);

  const set = async (number: number, status: 'free' | 'occupied' | 'reserved' | 'clear') => {
    setMessage('');
    try {
      const res = await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ restaurantId, action: 'live', tableNumber: number, status }) });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error || t.error);
      setReload((n) => n + 1);
    } catch (e) {
      setMessage((e as Error).message || t.error);
    }
  };

  if (!data) return null;
  if (!data.features.liveTables) return <p className="rf:m-0 rf:text-sm rf:text-text/70">{t.upgrade}</p>;
  const tables = data.tables.filter((x) => x.active);
  if (!tables.length) return <p className="rf:m-0 rf:text-sm rf:text-text/70">{t.none}</p>;

  const onFloor = tables.filter((x) => x.floor === floor);
  const ratio = data.width && data.length ? Math.min(1.6, Math.max(0.45, data.length / data.width)) : 0.62;
  const H = Math.round(100 * ratio);
  const statusOf = (n: number) => tableStatus(n, data.live, data.bookings, clock.minutes);
  const counts = tables.reduce<Record<MapStatus, number>>((c, x) => (c[statusOf(x.number).status]++, c), { free: 0, occupied: 0, booked: 0 });
  const chosen = selected !== null ? tables.find((x) => x.number === selected) : undefined;
  const chosenState = chosen ? statusOf(chosen.number) : null;
  const nextBooking = chosen ? data.bookings.filter((b) => b.table_number === chosen.number && toMinutes(b.slot) > clock.minutes).sort((a, b) => toMinutes(a.slot) - toMinutes(b.slot))[0] : undefined;
  const sourceName = { manual: t.manual, camera: t.camera, booking: t.booking };
  const button = 'rf:rounded-lg rf:border rf:border-line rf:bg-night/60 rf:px-3 rf:py-1.5 rf:text-xs rf:font-medium rf:text-text rf:transition rf:hover:border-teal';

  return (
    <div className="rf:grid rf:gap-3">
      <div className="rf:flex rf:flex-wrap rf:items-center rf:gap-3 rf:text-xs">
        {(['free', 'booked', 'occupied'] as MapStatus[]).map((s) => (
          <span key={s} className="rf:inline-flex rf:items-center rf:gap-1.5">
            <i className="rf:inline-block rf:size-3 rf:rounded-full" style={{ background: STATUS_COLOR[s], boxShadow: `0 0 8px ${STATUS_COLOR[s]}` }} />
            {t[s]}: <b>{counts[s]}</b>
          </span>
        ))}
        <span className="rf:ml-auto rf:text-text/60">
          {t.updated} {String(Math.floor(clock.minutes / 60)).padStart(2, '0')}:{String(clock.minutes % 60).padStart(2, '0')}
        </span>
      </div>
      {data.floors > 1 && (
        <div className="rf:flex rf:gap-2" role="tablist">
          {Array.from({ length: data.floors }, (_, i) => i + 1).map((f) => (
            <button key={f} type="button" role="tab" aria-selected={floor === f} onClick={() => setFloor(f)} className={`${button} ${floor === f ? 'rf:border-teal rf:text-teal' : ''}`}>
              {t.floor} {f}
            </button>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 100 ${H}`} className="rf:w-full rf:rounded-xl rf:border rf:border-line rf:bg-night" role="group" aria-label={t.title}>
        <defs>
          <pattern id="rf-map-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5 0H0V5" fill="none" stroke="#294654" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect x="1" y="1" width="98" height={H - 2} rx="2" fill="url(#rf-map-grid)" stroke="#294654" strokeWidth="0.4" />
        {onFloor.map((x) => {
          const s = statusOf(x.number).status,
            color = STATUS_COLOR[s],
            cx = x.x,
            cy = (x.y / 100) * H,
            size = 4 + Math.min(x.seats, 12) * 0.45,
            active = selected === x.number;
          return (
            <g
              key={x.number}
              role="button"
              tabIndex={0}
              aria-label={`${x.number} · ${t[s]}`}
              aria-pressed={active}
              onClick={() => setSelected(x.number)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelected(x.number))}
              className="rf:cursor-pointer rf:outline-none"
            >
              {x.shape === 'round' ? (
                <circle cx={cx} cy={cy} r={size / 2} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={active ? 0.9 : 0.5} style={{ filter: `drop-shadow(0 0 1.5px ${color})` }} />
              ) : (
                <rect x={cx - size * 0.65} y={cy - size * 0.4} width={size * 1.3} height={size * 0.8} rx="0.8" fill={color} fillOpacity={0.22} stroke={color} strokeWidth={active ? 0.9 : 0.5} style={{ filter: `drop-shadow(0 0 1.5px ${color})` }} />
              )}
              <text x={cx} y={cy + 1.1} textAnchor="middle" fontSize="3" fontWeight="700" fill="#f8fafc">
                {x.number}
              </text>
            </g>
          );
        })}
      </svg>
      {chosen && chosenState ? (
        <div className="rf:grid rf:gap-2 rf:rounded-xl rf:border rf:border-line rf:bg-panel rf:p-3 rf:text-sm">
          <div className="rf:flex rf:flex-wrap rf:items-center rf:gap-2">
            <b>
              {chosen.number}-stol · {chosen.seats} {t.seats}
            </b>
            <span className="rf:rounded-full rf:px-2 rf:py-0.5 rf:text-xs rf:font-semibold rf:text-night" style={{ background: STATUS_COLOR[chosenState.status] }}>
              {t[chosenState.status]}
            </span>
            {chosenState.source && <span className="rf:text-xs rf:text-text/60">{sourceName[chosenState.source]}</span>}
            {nextBooking && (
              <span className="rf:text-xs rf:text-text/60">
                · {t.next}: {nextBooking.slot}–{nextBooking.end_slot.slice(0, 5)}
              </span>
            )}
          </div>
          <div className="rf:flex rf:flex-wrap rf:gap-2">
            <button type="button" className={button} onClick={() => set(chosen.number, 'free')} style={{ borderColor: STATUS_COLOR.free }}>
              {t.free}
            </button>
            <button type="button" className={button} onClick={() => set(chosen.number, 'occupied')} style={{ borderColor: STATUS_COLOR.occupied }}>
              {t.occupied}
            </button>
            <button type="button" className={button} onClick={() => set(chosen.number, 'reserved')} style={{ borderColor: STATUS_COLOR.booked }}>
              {t.booked}
            </button>
            <button type="button" className={button} onClick={() => set(chosen.number, 'clear')}>
              {t.auto}
            </button>
          </div>
          {message && (
            <p className="rf:m-0 rf:text-xs rf:text-red-300" role="alert">
              {message}
            </p>
          )}
        </div>
      ) : (
        <p className="rf:m-0 rf:text-xs rf:text-text/60">{t.choose}</p>
      )}
    </div>
  );
}

export default AdminTableMap;
