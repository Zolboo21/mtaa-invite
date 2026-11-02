"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Fade + rise when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "p" | "h2";
}) {
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </M>
  );
}

/** Kinetic headline: each word rises out of a mask, letters staggered. */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.035,
  inView = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  let i = 0;
  const trigger = inView
    ? { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-10% 0px" } }
    : { initial: "hidden", animate: "show" };
  return (
    <motion.span className={`split ${className ?? ""}`} aria-label={text} {...trigger}>
      {text.split(" ").map((word, w) => (
        <span className="split-w" key={w} aria-hidden>
          {Array.from(word).map((ch) => {
            const d = delay + i++ * stagger;
            return (
              <motion.span
                key={i}
                className="split-c"
                variants={{
                  hidden: { y: "110%", rotate: 6 },
                  show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease, delay: d } },
                }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </motion.span>
  );
}

/** Infinite ticker. Content is duplicated so the CSS loop is seamless. */
export function Marquee({
  items,
  reverse = false,
  speed = 40,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) {
  const row = (
    <div className="mq-row" aria-hidden>
      {items.map((t, k) => (
        <span key={k} className="mq-item">
          {t}
          <span className="mq-dot">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="mq" data-reverse={reverse} style={{ ["--mq-speed" as string]: `${speed}s` }}>
      <div className="mq-track">
        {row}
        {row}
      </div>
    </div>
  );
}

/** Counts up from 0 when scrolled into view; keeps any suffix like "+" or "%". */
export function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const m = value.match(/^(\d+)(.*)$/);
  const target = m ? Number(m[1]) : 0;
  const suffix = m ? m[2] : "";
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen || !m) return;
    if (reduce) return setN(target);
    const c = animate(0, target, { duration: 1.8, ease, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!m) return <span>{value}</span>;
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

/**
 * Muted autoplay looping background video (rendered with Remotion, see /remotion).
 * Picks the vertical cut on portrait screens.
 */
export function VideoBg({
  name,
  verticalName,
  className,
}: {
  name: string;
  verticalName?: string;
  className?: string;
}) {
  const [file, setFile] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 820px)");
    const pick = () => setFile(verticalName && mq.matches ? verticalName : name);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, [name, verticalName]);

  const poster = `/videos/${file ?? name}.jpg`;
  return (
    <div className={`vbg ${className ?? ""}`} aria-hidden>
      {file && !reduce ? (
        <video
          key={file}
          src={`/videos/${file}.mp4`}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" />
      )}
    </div>
  );
}
