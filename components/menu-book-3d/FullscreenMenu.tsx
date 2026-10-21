import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuBook3D, type MenuBook3DHandle, type MenuBook3DProps } from './MenuBook3D';

export interface FullscreenMenuProps extends Omit<MenuBook3DProps, 'fill' | 'ref' | 'initiallyOpen'> {
  onClose: () => void;
  /** Turn to this dish once the book is open. */
  revealDishId?: string;
}

const ENTER_MS = 320;

/** Phones held sideways: the book is designed for portrait, so ask to rotate. */
const landscapePhone = () => typeof matchMedia === 'function' && matchMedia('(orientation: landscape) and (max-height: 520px)').matches;

type LockableOrientation = ScreenOrientation & { lock?: (o: 'portrait') => Promise<void> };

/**
 * Full-screen overlay around the 3D menu book. It fades/scales in, locks page scroll,
 * on phones enters browser full screen and tries to lock portrait orientation (Android;
 * iOS ignores both, so a rotate hint covers landscape), and opens the cover by itself.
 */
export function FullscreenMenu({ onClose, revealDishId, lang, ...book }: FullscreenMenuProps) {
  const [shown, setShown] = useState(false);
  const [sideways, setSideways] = useState(landscapePhone);
  const handle = useRef<MenuBook3DHandle>(null);
  const dialog = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setShown(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    window.setTimeout(onClose, ENTER_MS);
  }, [onClose]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    const opener = window.setTimeout(() => (revealDishId ? handle.current?.reveal(revealDishId) : handle.current?.open()), ENTER_MS + 150);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.current?.focus();

    const coarse = matchMedia('(pointer: coarse)').matches;
    if (coarse && dialog.current?.requestFullscreen)
      dialog.current
        .requestFullscreen({ navigationUI: 'hide' })
        .then(() => (screen.orientation as LockableOrientation | undefined)?.lock?.('portrait'))
        .catch(() => {});

    const orientation = () => setSideways(landscapePhone());
    window.addEventListener('resize', orientation);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !e.defaultPrevented && close();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(opener);
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener('resize', orientation);
      window.removeEventListener('keydown', onKey);
      previousFocus?.focus?.();
    };
  }, [close, revealDishId]);

  const rotate = { uz: 'Telefonni vertikal holatga keltiring', ru: 'Поверните телефон вертикально', en: 'Rotate your phone to portrait' }[lang === 'ru' || lang === 'en' ? lang : 'uz'];
  const closeLabel = { uz: 'Yopish', ru: 'Закрыть', en: 'Close' }[lang === 'ru' || lang === 'en' ? lang : 'uz'];

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={book.data.restaurantName}
      tabIndex={-1}
      className={`rf:fixed rf:inset-0 rf:z-[2147483000] rf:flex rf:flex-col rf:bg-night/95 rf:backdrop-blur-md rf:outline-none rf:transition-opacity rf:duration-300 rf:ease-out ${shown ? 'rf:opacity-100' : 'rf:opacity-0'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        type="button"
        onClick={close}
        aria-label={closeLabel}
        className="rf:absolute rf:top-3 rf:right-3 rf:z-10 rf:grid rf:size-11 rf:place-items-center rf:rounded-full rf:border rf:border-line rf:bg-panel/90 rf:text-xl rf:text-text rf:transition rf:hover:border-teal rf:hover:text-teal rf:focus-visible:outline-2 rf:focus-visible:outline-blue"
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        ×
      </button>
      <div className={`rf:min-h-0 rf:flex-1 rf:transition rf:duration-300 rf:ease-out ${shown ? 'rf:translate-y-0 rf:scale-100' : 'rf:translate-y-6 rf:scale-[0.97]'}`}>
        <MenuBook3D {...book} lang={lang} ref={handle} fill />
      </div>
      {sideways && (
        <div className="rf:absolute rf:inset-0 rf:z-20 rf:grid rf:place-items-center rf:bg-night rf:p-6 rf:text-center" role="alert">
          <div>
            <div className="rf:mx-auto rf:mb-4 rf:h-16 rf:w-10 rf:animate-pulse rf:rounded-lg rf:border-2 rf:border-teal" aria-hidden="true" />
            <p className="rf:m-0 rf:text-base rf:text-text">{rotate}</p>
          </div>
        </div>
      )}
    </div>
  );
}
