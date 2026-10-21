import { Canvas } from '@react-three/fiber';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { BookScene } from './BookScene';
import { resolveLabels } from './labels';
import { buildBook, pagesAtSpread, spreadForPage } from './layout';
import { ImageCache } from './page-canvas';
import { usePageSound } from './use-page-sound';
import type { BookLabels, BookPage, HotspotAction, MenuBookData, MenuDish } from './types';

export interface MenuBook3DProps {
  data: MenuBookData;
  lang?: string;
  labels?: Partial<BookLabels>;
  /** Called by the explicit "Add to cart" control only. Return false when the cart rejected it. */
  onAddToCart?: (dish: MenuDish, quantity: number) => boolean | void;
  soundSrc?: string;
  /** Open straight to the contents instead of showing the closed cover. */
  initiallyOpen?: boolean;
  ref?: Ref<MenuBook3DHandle>;
  className?: string;
  /** Fill the parent height (full-screen overlay) instead of using a fixed responsive height. */
  fill?: boolean;
}

/** Imperative controls for hosts such as the AI assistant. */
export interface MenuBook3DHandle {
  /** Turns to the page listing the dish. Returns false when it is not in this menu. */
  reveal: (dishId: string) => boolean;
  open: () => void;
  close: () => void;
}

const MAX_QTY = 20;
const NARROW_BREAKPOINT = 640;

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return reduced;
}

const isReadable = (page: BookPage | null) =>
  !!page && page.content.kind !== 'endpaper' && page.content.kind !== 'cover' && page.content.kind !== 'back-cover';

export function MenuBook3D({ data, lang, labels: labelOverrides, onAddToCart, soundSrc, initiallyOpen = false, className = '', fill = false, ref }: MenuBook3DProps) {
  const labels = useMemo(() => resolveLabels(lang, labelOverrides), [lang, labelOverrides]);
  const { pages, sheets, toc } = useMemo(() => buildBook(data), [data]);
  const dishes = useMemo(() => new Map(data.chapters.flatMap((c) => c.dishes.map((d) => [d.id, d] as const))), [data]);
  const folioOf = useCallback((page: number) => pages[page]?.folio ?? null, [pages]);

  const [container, width] = useElementWidth<HTMLDivElement>();
  const narrow = width > 0 && width < NARROW_BREAKPOINT;
  const reducedMotion = useReducedMotion();
  const sound = usePageSound(soundSrc);

  const [spread, setSpread] = useState(initiallyOpen ? 1 : 0);
  const [focus, setFocus] = useState<'left' | 'right'>('right');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [flashed, setFlashed] = useState<ReadonlySet<string>>(() => new Set());
  const [assetsVersion, setAssetsVersion] = useState(0);
  const images = useMemo(() => new ImageCache(), []);
  const last = sheets.length;
  const open = spread > 0 && spread < last;
  const { left, right } = pagesAtSpread(spread, sheets);

  // Repaint once the book font and dish photos are ready.
  useEffect(() => {
    let alive = true;
    const bump = () => alive && setAssetsVersion((v) => v + 1);
    const unsubscribe = images.subscribe(bump);
    document.fonts?.load("400 32px RFBook").then(() => document.fonts.load("italic 32px RFBook")).then(bump, () => {});
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [images]);

  /** Moves to a spread and decides which half a phone should look at. */
  const turnTo = useCallback(
    (target: number, preferred?: 'left' | 'right') => {
      const next = Math.max(0, Math.min(last, target));
      if (next === spread) return;
      const view = pagesAtSpread(next, sheets);
      setFocus(preferred && (preferred === 'left' ? isReadable(view.left) : isReadable(view.right)) ? preferred : isReadable(view.left) && next > spread ? 'left' : 'right');
      setSpread(next);
      sound.play();
    },
    [last, spread, sheets, sound],
  );

  const goToPage = useCallback((page: number) => turnTo(spreadForPage(page), page % 2 === 0 ? 'right' : 'left'), [turnTo]);

  const next = useCallback(() => {
    if (narrow && open && focus === 'left' && isReadable(right)) return setFocus('right');
    turnTo(spread + 1);
  }, [narrow, open, focus, right, spread, turnTo]);

  const prev = useCallback(() => {
    if (narrow && open && focus === 'right' && isReadable(left)) return setFocus('left');
    turnTo(spread - 1, 'right');
  }, [narrow, open, focus, left, spread, turnTo]);

  const close = useCallback(() => {
    sound.stop();
    if (spread !== 0) {
      setSpread(0);
      sound.play();
    }
  }, [spread, sound]);

  const changeQty = useCallback((id: string, delta: number) => {
    setQuantities((q) => ({ ...q, [id]: Math.max(1, Math.min(MAX_QTY, (q[id] ?? 1) + delta)) }));
  }, []);

  const flashTimers = useRef(new Map<string, number>());
  useEffect(() => () => flashTimers.current.forEach((t) => clearTimeout(t)), []);
  const add = useCallback(
    (id: string) => {
      const dish = dishes.get(id);
      if (!dish?.available) return;
      if (onAddToCart?.(dish, quantities[id] ?? 1) === false) return;
      setFlashed((s) => new Set(s).add(id));
      clearTimeout(flashTimers.current.get(id));
      flashTimers.current.set(
        id,
        window.setTimeout(() => setFlashed((s) => {
          const copy = new Set(s);
          copy.delete(id);
          return copy;
        }), 1400),
      );
    },
    [dishes, onAddToCart, quantities],
  );

  useImperativeHandle(
    ref,
    () => ({
      reveal(dishId) {
        const page = pages.find((p) => p.content.kind === 'dishes' && p.content.dishes.some((d) => d.id === dishId));
        if (page) goToPage(page.index);
        return !!page;
      },
      open: () => turnTo(1, 'right'),
      close,
    }),
    [pages, goToPage, turnTo, close],
  );

  const onAction = useCallback(
    (action: HotspotAction) => {
      if (action.type === 'open') turnTo(spread === last ? last - 1 : 1, 'right');
      else if (action.type === 'goto') goToPage(action.page);
      else if (action.type === 'qty') changeQty(action.dishId, action.delta);
      else add(action.dishId);
    },
    [turnTo, spread, last, goToPage, changeQty, add],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey || (e.target as HTMLElement).closest('button,input,select,textarea,a')) return;
    const keys: Record<string, () => void> = {
      ArrowRight: next,
      PageDown: next,
      ArrowLeft: prev,
      PageUp: prev,
      Home: () => turnTo(1, 'right'),
      End: () => turnTo(last - 1),
      Escape: close,
    };
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const visible = (narrow && open ? [focus === 'left' ? left : right] : [left, right]).filter(isReadable) as BookPage[];
  const folios = visible.map((p) => p.folio).filter((f): f is number => f !== null);
  const totalFolios = pages.filter((p) => p.folio !== null).length;
  const status = !open ? labels.hint : folios.length ? `${labels.page} ${folios.join('–')} ${labels.of} ${totalFolios}` : '';
  const activeChapter = visible.flatMap((p) => (p.content.kind === 'dishes' ? [p.content.chapter.key] : []))[0];
  const visibleDishes = visible.flatMap((p) => (p.content.kind === 'dishes' ? p.content.dishes : []));

  const chip =
    'rf:shrink-0 rf:rounded-full rf:border rf:px-3.5 rf:py-1.5 rf:text-xs rf:font-medium rf:transition rf:focus-visible:outline-2 rf:focus-visible:outline-offset-2 rf:focus-visible:outline-blue';
  const control =
    'rf:inline-flex rf:min-h-11 rf:items-center rf:justify-center rf:gap-2 rf:rounded-xl rf:border rf:border-line rf:bg-panel/80 rf:px-4 rf:text-sm rf:text-text rf:backdrop-blur rf:transition rf:hover:border-teal/60 rf:hover:text-teal rf:disabled:pointer-events-none rf:disabled:opacity-35 rf:focus-visible:outline-2 rf:focus-visible:outline-offset-2 rf:focus-visible:outline-blue';

  return (
    <section
      className={`rf:relative rf:w-full rf:select-none rf:overflow-hidden rf:bg-[radial-gradient(ellipse_at_50%_0%,#153242_0%,#081521_70%)] rf:text-text ${fill ? 'rf:flex rf:h-full rf:flex-col' : 'rf:rounded-3xl rf:border rf:border-line'} ${className}`}
      aria-roledescription="3D menu book"
      aria-label={`${data.restaurantName} — ${labels.menu}`}
    >
      <nav className={`rf:flex rf:items-center rf:gap-2 rf:overflow-x-auto rf:px-4 rf:pt-4 rf:pb-1 rf:[scrollbar-width:none] ${fill ? 'rf:pr-16' : ''}`} aria-label={labels.contents}>
        <button type="button" className={`${chip} ${spread === 1 ? 'rf:border-teal rf:bg-teal rf:text-night' : 'rf:border-line rf:bg-transparent rf:text-text/80 rf:hover:border-teal/60'}`} onClick={() => turnTo(1, 'right')}>
          {labels.contents}
        </button>
        {toc.map((entry) => (
          <button
            key={entry.chapterKey}
            type="button"
            aria-pressed={activeChapter === entry.chapterKey}
            className={`${chip} ${activeChapter === entry.chapterKey ? 'rf:border-gold rf:bg-gold rf:text-night' : 'rf:border-line rf:bg-transparent rf:text-text/80 rf:hover:border-gold/60'}`}
            onClick={() => goToPage(entry.page)}
          >
            {entry.title} <span className="rf:opacity-60">{entry.count}</span>
          </button>
        ))}
      </nav>

      <div
        ref={container}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={`rf:relative rf:w-full rf:touch-pan-y ${fill ? 'rf:min-h-0 rf:flex-1' : 'rf:h-[min(78vh,calc(100vw*1.45))] rf:sm:h-[min(78vh,620px)] rf:lg:h-[min(76vh,680px)]'} rf:outline-none rf:focus-visible:ring-2 rf:focus-visible:ring-inset rf:focus-visible:ring-blue/40`}
      >
        {width > 0 && (
          <Canvas
            flat
            shadows="percentage"
            dpr={[1, 2]}
            frameloop="demand"
            camera={{ fov: 32, position: [0, 0, 4], near: 0.1, far: 20 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            aria-hidden="true"
          >
            <BookScene
              sheets={sheets}
              spread={spread}
              narrow={narrow}
              focus={focus}
              reducedMotion={reducedMotion}
              restaurantName={data.restaurantName}
              labels={labels}
              quantities={quantities}
              flashed={flashed}
              images={images}
              assetsVersion={assetsVersion}
              folioOf={folioOf}
              onSpreadChange={(s) => turnTo(s, s < spread ? 'right' : undefined)}
              onAction={onAction}
            />
          </Canvas>
        )}
      </div>

      <div className="rf:flex rf:flex-wrap rf:items-center rf:justify-between rf:gap-2 rf:px-4 rf:pt-1 rf:pb-4">
        <button type="button" className={control} onClick={prev} disabled={spread === 0} aria-label={labels.prev}>
          <span aria-hidden="true">←</span>
          <span className="rf:hidden rf:sm:inline">{labels.prev}</span>
        </button>
        <p className="rf:order-first rf:m-0 rf:w-full rf:text-center rf:text-xs rf:tracking-wide rf:text-text/70 rf:sm:order-none rf:sm:w-auto" role="status" aria-live="polite">
          {status}
        </p>
        <div className="rf:flex rf:gap-2">
          <button type="button" className={control} onClick={sound.toggle} aria-pressed={sound.enabled} title={sound.enabled ? labels.soundOn : labels.soundOff}>
            <span aria-hidden="true">{sound.enabled ? '♫' : '♩'}</span>
            <span className="rf:sr-only">{sound.enabled ? labels.soundOn : labels.soundOff}</span>
          </button>
          {spread !== 0 && (
            <button type="button" className={control} onClick={close}>
              {labels.close}
            </button>
          )}
        </div>
        <button type="button" className={control} onClick={spread === 0 ? () => turnTo(1, 'right') : next} disabled={spread === last} aria-label={spread === 0 ? labels.open : labels.next}>
          <span className="rf:hidden rf:sm:inline">{spread === 0 ? labels.open : labels.next}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* Screen-reader mirror of the pages in view; the WebGL canvas itself is decorative. */}
      <div className="rf:sr-only">
        {visibleDishes.map((dish) => (
          <article key={dish.id} aria-label={dish.name}>
            <h4>{dish.name}</h4>
            <p>{dish.price}</p>
            {dish.description && <p>{dish.description}</p>}
            {dish.available ? (
              <>
                <button type="button" onClick={() => changeQty(dish.id, -1)}>−</button>
                <span>{quantities[dish.id] ?? 1}</span>
                <button type="button" onClick={() => changeQty(dish.id, 1)}>+</button>
                <button type="button" onClick={() => add(dish.id)}>{labels.add}</button>
              </>
            ) : (
              <p>{labels.unavailable}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default MenuBook3D;
