"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  audioSrc?: string;
  volume?: number;
  children: React.ReactNode;
};

export default function IntroGate({
  audioSrc = "/music/music.mp3",
  volume = 0.35,
  children,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(true);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const a = new Audio(audioSrc);
    a.loop = true;
    a.preload = "auto";
    a.volume = volume;
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, [audioSrc, volume]);

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
      setTimeout(() => setOpen(false), 650);
    }
  }

  return (
    <>
      {children}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "rgba(10,12,16,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            opacity: closing ? 0 : 1,
            transition: "opacity 0.6s ease",
          }}
        >
          <div
            style={{
              width: "min(440px, 100%)",
              textAlign: "center",
              background: "linear-gradient(180deg, rgba(36,39,45,0.92), rgba(20,22,27,0.94))",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "40px 32px 34px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
              color: "#eef2f6",
              transform: closing ? "translateY(8px) scale(0.98)" : "none",
              transition: "transform 0.6s ease",
            }}
          >
            <img
              src="/images/logos/anniv-20.png"
              alt="МТАА 20 жил"
              width={132}
              style={{ width: 132, height: "auto", display: "block", margin: "0 auto 18px" }}
            />
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>
              Тавтай морил
            </h1>
            <p style={{ margin: "0 0 26px", fontSize: 14.5, lineHeight: 1.6, color: "#a7b4c1" }}>
              Доорх товчийг дармагц урилга нээгдэж, баярын хөгжим эхэлнэ.
            </p>
            <button type="button" className="btn btn-gold" onClick={handleEnter} style={{ minWidth: 190 }}>
              Урилга нээх
            </button>
            {error && (
              <p style={{ marginTop: 16, fontSize: 12.5, color: "#ffb4a8" }}>{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
