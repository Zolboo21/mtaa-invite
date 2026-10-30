'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function MusicToggle({
  src = '/audio/theme.mp3',
  volume = 0.35,
  autoStart = true,
  remember = false, // ⬅️ default: OFF (YouTube-like: always tries)
}: {
  src?: string;
  volume?: number;
  autoStart?: boolean;
  remember?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const a = new Audio(src);
    a.loop = true;
    a.preload = 'auto';
    a.volume = volume;
    audioRef.current = a;
    setReady(true);

    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, [src, volume]);

  // optional: restore preference only if remember=true
  useEffect(() => {
    if (!remember) return;
    try {
      const saved = localStorage.getItem('music:on');
      if (saved === 'true') setOn(true);
      if (saved === 'false') setOn(false);
    } catch {
      // ignore
    }
  }, [remember]);

  // autostart
  useEffect(() => {
    if (!ready || !autoStart) return;

    const a = audioRef.current;
    if (!a) return;

    const tryPlay = async () => {
      try {
        a.muted = false;
        await a.play();
        setOn(true);
        setBlocked(false);
      } catch {
        // muted fallback (often allowed)
        try {
          a.muted = true;
          await a.play();
          setOn(true);
          setBlocked(true); // playing but muted
        } catch {
          setOn(false);
          setBlocked(true);
        }
      }
    };

    void tryPlay();
  }, [ready, autoStart]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    if (on) {
      a.play().catch(() => setBlocked(true));
    } else {
      a.pause();
      a.currentTime = 0;
    }

    if (remember) {
      try {
        localStorage.setItem('music:on', String(on));
      } catch {
        // ignore
      }
    }
  }, [on, remember]);

  return (
    <button
      type="button"
      className="btn btn-solid"
      onClick={async () => {
        const a = audioRef.current;
        const next = !on;
        setOn(next);

        if (!a) return;

        if (next) {
          try {
            a.muted = false;
            await a.play();
            setBlocked(false);
          } catch {
            setBlocked(true);
          }
        }
      }}
    >
      {on ? (blocked ? 'Music: Muted' : 'Music: On') : 'Music: Off'}
    </button>
  );
}
