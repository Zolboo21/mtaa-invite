"use client";

/**
 * Page chrome: floating pill nav with music toggle (yaas-energy style),
 * magnetic buttons, and a film-grain overlay.
 */
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { getAudio, onAudioChange } from "@/lib/audio";
import { event } from "@/data/event";

export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  return (
    <motion.span
      ref={ref}
      className={`magnetic ${className ?? ""}`}
      style={{ x, y, display: "inline-block" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

function MusicButton() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const a = getAudio();
    setOn(!!a && !a.paused);
    return onAudioChange(setOn);
  }, []);
  return (
    <button
      type="button"
      className="nav-music"
      data-on={on}
      aria-label={on ? "Хөгжим зогсоох" : "Хөгжим тоглуулах"}
      onClick={() => {
        const a = getAudio();
        if (!a) return;
        if (a.paused) a.play().catch(() => {});
        else a.pause();
      }}
    >
      <span className="bars" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <span className="nav-music-l">{on ? "Хөгжим" : "Дуугүй"}</span>
    </button>
  );
}

const links = [
  ["#story", "Түүх"],
  ["#detail", "Үдэшлэг"],
  ["#work", "Ажил"],
  ["#history", "Замнал"],
  ["#team", "Хамт олон"],
];

export function Nav() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = scrollY;
    const on = () => {
      const y = scrollY;
      setHidden(y > last && y > 300);
      last = y;
    };
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <motion.header
      className="nav"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -90 : 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href="#top" className="nav-logo" aria-label="Эхлэл">
        <img src="/images/logos/anniv-20.png" alt="" width={34} height={31} />
        <span>
          {event.deptShort} <em>{event.years}</em>
        </span>
      </a>
      <nav className="nav-links">
        {links.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-right">
        <MusicButton />
        <a href="#rsvp" className="nav-cta">
          Хариу өгөх
        </a>
      </div>
    </motion.header>
  );
}

export function Grain() {
  return <div className="grain" aria-hidden />;
}
