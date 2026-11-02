"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAudio } from "@/lib/audio";

type Props = {
  audioSrc?: string;
  volume?: number;
  children: React.ReactNode;
};

/**
 * Preloader (yaas-energy pattern): giant type + 0→100% counter while the
 * hero video buffers, then the "open invitation" button that starts music.
 */
export default function IntroGate({
  audioSrc = "/music/music.mp3",
  volume = 0.35,
  children,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(true);
  const [closing, setClosing] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    audioRef.current = getAudio(audioSrc, volume);
    return () => audioRef.current?.pause();
  }, [audioSrc, volume]);

  // counter: eases toward 90% on a timer, finishes once the page + hero video are ready
  useEffect(() => {
    const t0 = performance.now();
    let doneAt = 0;
    const finish = () => (doneAt ||= performance.now());
    const vid = () => document.querySelector<HTMLVideoElement>(".hero video");
    const check = setInterval(() => {
      const v = vid();
      if (document.readyState === "complete" && (!v || v.readyState >= 3)) finish();
    }, 150);
    const fallback = setTimeout(finish, 4500);
    // time-based so it also completes in throttled background tabs
    const tick = setInterval(() => {
      const now = performance.now();
      const base = 90 * (1 - Math.exp(-(now - t0) / 1100));
      const end = doneAt ? Math.min(1, (now - doneAt) / 600) : 0;
      const p = Math.round(base + (100 - base) * end);
      setPct(p);
      if (p >= 100) clearInterval(tick);
    }, 30);
    return () => {
      clearInterval(tick);
      clearInterval(check);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  async function handleEnter() {
    setError(null);
    const a = audioRef.current;
    try {
      if (a) {
        a.muted = false;
        await a.play();
      }
    } catch {
      setError("Дуу эхлүүлэх боломжгүй байна. Browser-ийн autoplay тохиргоог шалгана уу.");
    } finally {
      setClosing(true);
      window.dispatchEvent(new Event("gate:open"));
      setTimeout(() => setOpen(false), 1100);
    }
  }

  const ready = pct >= 100;
  return (
    <>
      {children}

      {open && (
        <div role="dialog" aria-modal="true" className={`gate ${closing ? "out" : ""} ${ready ? "ready" : ""}`}>
          <div className="gate-word" aria-hidden>
            <span>МТАА</span>
          </div>

          <div className="gate-center">
            <img src="/images/logos/anniv-20.png" alt="МТАА 20 жил" width={132} className="gate-logo" />
            <p className="gate-hello">Тавтай морил</p>
            <button type="button" className="btn btn-gold gate-btn" onClick={handleEnter} disabled={!ready}>
              Урилга нээх
            </button>
            {error && <p className="gate-err">{error}</p>}
          </div>

          <div className="gate-foot">
            <span>[ УРИЛГА АЧААЛЖ БАЙНА ]</span>
            <span className="gate-pct">{pct}%</span>
          </div>
          <div className="gate-bar" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      )}

      <style jsx global>{`
        .gate {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: radial-gradient(ellipse at 50% 60%, #1b2733, #0b0e12 70%);
          color: #eef2f6;
          display: grid;
          place-items: center;
          overflow: hidden;
          clip-path: inset(0 0 0 0);
          transition: clip-path 1.05s cubic-bezier(0.77, 0, 0.18, 1);
        }
        .gate.out {
          clip-path: inset(0 0 100% 0);
        }
        .gate-word {
          position: absolute;
          inset: auto 0 6vh 0;
          text-align: center;
          font-weight: 800;
          font-size: 31vw;
          line-height: 0.8;
          letter-spacing: -0.06em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(238, 242, 246, 0.12);
          pointer-events: none;
          overflow: hidden;
        }
        .gate-word span {
          display: inline-block;
          background: linear-gradient(90deg, rgba(70, 198, 242, 0.25), rgba(246, 221, 143, 0.25));
          -webkit-background-clip: text;
          background-clip: text;
          animation: gate-rise 1.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes gate-rise {
          from { transform: translateY(60%); }
          to { transform: translateY(0); }
        }
        .gate-center {
          position: relative;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-top: -10vh;
        }
        .gate-logo {
          width: 132px;
          height: auto;
          filter: drop-shadow(0 18px 50px rgba(0, 0, 0, 0.5));
        }
        .gate-hello {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 30px;
        }
        .gate-btn {
          min-width: 200px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s ease, transform 0.6s ease, filter 0.2s ease;
        }
        .gate:not(.ready) .gate-btn {
          opacity: 0;
        }
        .gate.ready .gate-btn {
          opacity: 1;
          transform: none;
        }
        .gate-err {
          font-size: 12.5px;
          color: #ffb4a8;
        }
        .gate-foot {
          position: absolute;
          left: 32px;
          right: 32px;
          bottom: 26px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-family: var(--font-mono);
          font-size: 11.5px;
          letter-spacing: 0.08em;
          color: #8193a3;
        }
        .gate-pct {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 56px;
          line-height: 1;
          color: #f6dd8f;
          letter-spacing: 0;
        }
        .gate-bar {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          background: linear-gradient(90deg, #46c6f2, #f6dd8f);
          transform-origin: left;
        }
      `}</style>
    </>
  );
}
