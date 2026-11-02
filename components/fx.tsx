"use client";

/**
 * Effects learned from the inspiration sites (see inspiration/NOTES.md):
 *  SmoothScroll  — Lenis inertia scrolling (yaas-energy, myrefactory)
 *  Scramble      — letters scramble into place (myrefactory ScrambleText)
 *  Label         — "[ 01 — ШОШГО ]" mono kicker (myrefactory)
 *  ScrollRuler   — fixed left progress ruler with ticks (myrefactory)
 *  Cursor        — trailing ring cursor that grows over links
 */
import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";

/** The live Lenis instance (null with reduced motion), for programmatic scrolls. */
export let lenis: Lenis | null = null;

/** Smooth-scroll to a y position or element, through Lenis when it's running. */
export function scrollToTarget(target: number | string, opts: { duration?: number } = {}) {
  if (lenis) return lenis.scrollTo(target, { duration: opts.duration ?? 1.6 });
  const y = typeof target === "number" ? target : (document.querySelector(target)?.getBoundingClientRect().top ?? 0) + scrollY;
  window.scrollTo({ top: y, behavior: "smooth" });
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ duration: 1.15, anchors: { offset: 0 }, autoRaf: true });
    document.documentElement.style.scrollBehavior = "auto";
    return () => {
      lenis?.destroy();
      lenis = null;
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);
  return null;
}

const GLYPHS = "АБВГДЕЖЗИКЛМНОӨПРСТУҮФХЦЧШЭЮЯ0123456789#%/";

export function Scramble({
  text,
  className,
  duration = 900,
  start = true,
}: {
  text: string;
  className?: string;
  duration?: number;
  start?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-8% 0px" });
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!seen || !start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setOut(text);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const fixed = Math.floor(k * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        s += i < fixed || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, start, text, duration]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

export function Label({ n, children }: { n?: string; children: string }) {
  return (
    <p className="label-mono">
      <span className="lb">[</span>
      {n ? <span className="ln">{n} —</span> : null}
      <Scramble text={children} />
      <span className="lb">]</span>
    </p>
  );
}

export function ScrollRuler({ sections }: { sections: { id: string; label: string }[] }) {
  const { scrollYProgress } = useScroll();
  const y = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  const top = useTransform(y, (v) => `${v * 100}%`);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) setActive(sections.findIndex((s) => s.id === e.target.id));
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  return (
    <aside className="ruler" aria-hidden>
      <div className="ruler-ticks">
        {Array.from({ length: 41 }, (_, i) => (
          <span key={i} className={i % 5 === 0 ? "major" : undefined} />
        ))}
        <motion.span className="ruler-mark" style={{ top }} />
      </div>
      <div className="ruler-label">
        <span className="num">{String(Math.max(active, 0) + 1).padStart(2, "0")}</span>
        <span>/{String(sections.length).padStart(2, "0")}</span>
        <em>{sections[Math.max(active, 0)]?.label}</em>
      </div>
    </aside>
  );
}

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      ring.current?.classList.toggle("hot", !!t.closest("a,button,input,textarea,label,figure"));
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cur-ring" aria-hidden>
        <span />
      </div>
      <div ref={dot} className="cur-dot" aria-hidden />
    </>
  );
}
