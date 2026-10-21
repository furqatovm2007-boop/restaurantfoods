import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'rf-book-sound';

/** Natural page-turn recording; shares the on/off preference with the legacy CSS book. */
export function usePageSound(src = '/book-page-turn-v2.wav?v=55') {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'off';
    } catch {
      return true;
    }
  });
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled || typeof Audio === 'undefined') return;
    audio.current ??= Object.assign(new Audio(src), { preload: 'auto', volume: 0.9 });
  }, [enabled, src]);

  const stop = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }, []);

  const play = useCallback(() => {
    const a = audio.current;
    if (!enabled || !a) return;
    try {
      a.currentTime = 0;
      void a.play()?.catch(() => {});
    } catch {
      /* autoplay or decoding refused – silence is fine */
    }
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled((on) => {
      try {
        localStorage.setItem(STORAGE_KEY, on ? 'off' : 'on');
      } catch {
        /* private mode */
      }
      if (on) stop();
      return !on;
    });
  }, [stop]);

  useEffect(() => {
    const hide = () => document.hidden && stop();
    document.addEventListener('visibilitychange', hide);
    return () => {
      document.removeEventListener('visibilitychange', hide);
      stop();
    };
  }, [stop]);

  return useMemo(() => ({ enabled, play, stop, toggle }), [enabled, play, stop, toggle]);
}
