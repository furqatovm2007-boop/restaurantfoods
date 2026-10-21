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
