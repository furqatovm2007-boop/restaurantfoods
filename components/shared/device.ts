import { useEffect, useState } from 'react';

/*
 * Device hints for picking lighter 3D assets: slow or metered connections and low-memory
 * phones get the lite models and fewer effects.
 */
type Connection = { saveData?: boolean; effectiveType?: string };

export function lowEndDevice() {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { connection?: Connection; deviceMemory?: number };
  const c = nav.connection;
  if (c?.saveData || /(^|-)(2g|3g)$/.test(c?.effectiveType ?? '')) return true;
  return (nav.deviceMemory ?? 8) <= 2 || (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches && (nav.hardwareConcurrency ?? 8) <= 4);
}

/** Phones held sideways; the 3D menu and hall are laid out for portrait. */
export const landscapePhone = () => typeof matchMedia === 'function' && matchMedia('(orientation: landscape) and (max-height: 520px)').matches;

export function useLandscapePhone() {
  const [sideways, setSideways] = useState(landscapePhone);
  useEffect(() => {
    const update = () => setSideways(landscapePhone());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return sideways;
}

export const ROTATE_TEXT: Record<string, string> = { uz: 'Telefonni vertikal holatga keltiring', ru: 'Поверните телефон вертикально', en: 'Rotate your phone to portrait' };

const touchScreen = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

/**
 * Canvas pixel ratio: phones render at most 1.5x (a 3x screen at full density costs 4x the
 * fill rate for detail nobody sees on a 6" display); desktops up to 2x.
 */
export const canvasDpr = (): [number, number] => (touchScreen() || lowEndDevice() ? [1, 1.5] : [1, 2]);
export const shadowsAllowed = () => !touchScreen() && !lowEndDevice();

/**
 * True while the element is on screen and the tab is visible. Canvases switch their frame
 * loop off when it is false, so a 3D scene scrolled out of view or in a background tab
 * costs nothing.
 */
export function useOnScreen(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    let inView = true;
    const update = () => setVisible(inView && document.visibilityState !== 'hidden');
    const io = typeof IntersectionObserver === 'function' && el ? new IntersectionObserver(([entry]) => ((inView = entry.isIntersecting), update())) : null;
    if (io && el) io.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => {
      io?.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [ref]);
  return visible;
}

/** False while the tab is in the background. */
export function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}
