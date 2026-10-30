'use client';

import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  volume?: number;
  enabled?: boolean;
  loop?: boolean;
};

export default function AutoMusic({ src, volume = 0.35, enabled = true, loop = true }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const a = new Audio(src);
    a.loop = loop;
    a.preload = 'auto';
    a.volume = volume;
    audioRef.current = a;

    const start = async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      try {
        a.muted = false;
        await a.play();
      } catch {
        // Fallback: try muted autoplay (may succeed) then user gesture later can unmute via your own UI if needed
        try {
          a.muted = true;
          await a.play();
        } catch {
          // give up silently
        }
      }

      // remove listeners after first attempt
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      window.removeEventListener('touchstart', start);
      window.removeEventListener('wheel', start);
    };

    // Try immediately (works only in permissive browsers)
    void start();

    // Otherwise, unlock on first user interaction anywhere (no dedicated button needed)
    window.addEventListener('pointerdown', start, { passive: true });
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('keydown', start);
    window.addEventListener('wheel', start, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      window.removeEventListener('touchstart', start);
      window.removeEventListener('wheel', start);

      a.pause();
      audioRef.current = null;
    };
  }, [src, volume, enabled, loop]);

  return null;
}
