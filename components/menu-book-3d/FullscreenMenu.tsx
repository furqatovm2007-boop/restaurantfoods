import { useCallback, useEffect, useRef, useState } from 'react';
import { ROTATE_TEXT, useLandscapePhone } from '../shared/device';
import { MenuBook3D, type MenuBook3DHandle, type MenuBook3DProps } from './MenuBook3D';

export interface FullscreenMenuProps extends Omit<MenuBook3DProps, 'fill' | 'ref' | 'initiallyOpen'> {
  onClose: () => void;
  /** Turn to this dish once the book is open. */
  revealDishId?: string;
  /** Element the overlay grows out of and shrinks back into (window.RFMotion genie). */
  origin?: Element | null;
}

declare global {
  interface Window {
    /** Motion layer from public/motion.js, when loaded. */
    RFMotion?: { open: (el: Element, origin?: Element | null) => Promise<void>; close: (el: Element) => Promise<void> };
  }
}

const ENTER_MS = 320;

type LockableOrientation = ScreenOrientation & { lock?: (o: 'portrait') => Promise<void> };

/**
 * Full-screen overlay around the 3D menu book. It fades/scales in, locks page scroll,
 * on phones enters browser full screen and tries to lock portrait orientation (Android;
 * iOS ignores both, so a rotate hint covers landscape), and opens the cover by itself.
 */
export function FullscreenMenu({ onClose, revealDishId, origin, lang, ...book }: FullscreenMenuProps) {
  const [shown, setShown] = useState(false);
  // Phones held sideways: the book is designed for portrait, so ask to rotate.
  const sideways = useLandscapePhone();
  const handle = useRef<MenuBook3DHandle>(null);
  const dialog = useRef<HTMLDivElement>(null);

  // With an origin and the motion layer the window genies out of / back into it; otherwise it fades.
  const genie = !!(origin && window.RFMotion);
  const closing = useRef(false);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    if (genie && dialog.current) {
      window.RFMotion!.close(dialog.current).then(onClose);
      return;
    }
    setShown(false);
    window.setTimeout(onClose, ENTER_MS);
  }, [onClose, genie]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    if (genie && dialog.current) window.RFMotion!.open(dialog.current, origin);
    const opener = window.setTimeout(() => (revealDishId ? handle.current?.reveal(revealDishId) : handle.current?.open()), ENTER_MS + 150);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    // The page underneath is covered: pause its CSS animations so phones spend every frame on the book.
    document.documentElement.classList.add('rf-3d-open');
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.current?.focus();

    const coarse = matchMedia('(pointer: coarse)').matches;
    if (coarse && dialog.current?.requestFullscreen)
      dialog.current
        .requestFullscreen({ navigationUI: 'hide' })
        .then(() => (screen.orientation as LockableOrientation | undefined)?.lock?.('portrait'))
        .catch(() => {});

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !e.defaultPrevented && close();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(opener);
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.classList.remove('rf-3d-open');
      window.removeEventListener('keydown', onKey);
      previousFocus?.focus?.();
    };
  }, [close, revealDishId, genie, origin]);

  const rotate = ROTATE_TEXT[lang === 'ru' || lang === 'en' ? lang : 'uz'];
  const closeLabel = { uz: 'Yopish', ru: 'Закрыть', en: 'Close' }[lang === 'ru' || lang === 'en' ? lang : 'uz'];

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={book.data.restaurantName}
      tabIndex={-1}
      className={`rf:fixed rf:inset-0 rf:z-[2147483000] rf:flex rf:flex-col rf:bg-night/95 rf:backdrop-blur-md rf:outline-none rf:transition-opacity rf:duration-300 rf:ease-out ${shown || genie ? 'rf:opacity-100' : 'rf:opacity-0'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        type="button"
        onClick={close}
        aria-label={closeLabel}
        className="rf:absolute rf:top-3 rf:right-3 rf:z-30 rf:grid rf:size-12 rf:cursor-pointer rf:place-items-center rf:rounded-full rf:border-2 rf:border-teal rf:bg-night/90 rf:text-text rf:shadow-[0_0_0_4px_rgba(8,21,33,0.6),0_0_18px_rgba(0,201,167,0.55)] rf:transition rf:hover:scale-105 rf:hover:bg-teal rf:hover:text-night rf:focus-visible:outline-2 rf:focus-visible:outline-offset-2 rf:focus-visible:outline-blue"
        style={{ marginTop: 'env(safe-area-inset-top)', marginRight: 'env(safe-area-inset-right)' }}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className={`rf:min-h-0 rf:flex-1 rf:transition rf:duration-300 rf:ease-out ${shown || genie ? 'rf:translate-y-0 rf:scale-100' : 'rf:translate-y-6 rf:scale-[0.97]'}`}>
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
