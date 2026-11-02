"use client";

import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { motion, useInView } from "framer-motion";
import { GuestFilm, GUEST_FILM } from "./film/GuestFilm";
import { Magnetic } from "./chrome";
import { Label } from "./fx";
import { SplitText, ease } from "./motion";
import { event } from "@/data/event";

type Guest = { slug: string; name: string; title?: string; note?: string; vip?: boolean };

/** Personal beat right after the hero: the guest's name (shown once, here) plus the anniversary film. */
export default function GuestBeat({ guest, line }: { guest: Guest; line: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const seen = useInView(ref, { margin: "-20% 0px" });
  // the film is client-only: its float-precise inline styles never match SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="beat" id="invite">
      <div className="beat-grid">
        <div className="beat-copy">
          <Label n="00">ХУВИЙН УРИЛГА</Label>
          {/^(эрхэм|хүндэт)/i.test(guest.name) ? null : (
            <p className="beat-hi">{guest.vip ? "Эрхэм хүндэт" : "Хүндэт"}</p>
          )}
          <FitName name={guest.name} />
          {guest.title ? <p className="beat-role">{guest.title}</p> : null}
          <motion.p
            className="beat-line"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease, delay: 0.4 }}
          >
            {line}
          </motion.p>
          <div className="beat-cta">
            <Magnetic>
              <a href="#rsvp" className="btn btn-gold btn-lg">
                Хариу өгөх
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#detail" className="btn btn-line-light btn-lg">
                Үдэшлэгийн мэдээлэл
              </a>
            </Magnetic>
          </div>
        </div>

        <motion.div
          ref={ref}
          className="beat-film"
          initial={{ clipPath: "inset(18% 18% 18% 18% round 40px)", opacity: 0.3 }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.4, ease }}
          onViewportEnter={() => player.current?.play()}
        >
          {mounted ? (
          <Player
            ref={player}
            component={GuestFilm}
            inputProps={{ dateLabel: "2026.12.04 · 18:00" }}
            durationInFrames={GUEST_FILM.durationInFrames}
            fps={GUEST_FILM.fps}
            compositionWidth={GUEST_FILM.width}
            compositionHeight={GUEST_FILM.height}
            style={{ width: "100%", height: "100%" }}
            autoPlay={seen}
            loop
            acknowledgeRemotionLicense
          />
          ) : null}
        </motion.div>
      </div>

      <style jsx global>{`
        .beat {
          position: relative;
          z-index: 1;
          padding: clamp(90px, 12vw, 160px) 0;
          background: radial-gradient(ellipse 60% 50% at 80% 40%, rgba(30, 167, 230, 0.08), transparent),
            var(--paper);
        }
        .beat-grid {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 clamp(22px, 4vw, 56px);
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: clamp(32px, 6vw, 96px);
          align-items: center;
        }
        .beat-hi {
          font-family: var(--font-sans);
          font-weight: 400;
          letter-spacing: 0.02em;
          font-size: clamp(18px, 1.8vw, 24px);
          color: var(--ink-3);
        }
        .beat-name {
          font-size: var(--fit, 96px);
          font-weight: 800;
          letter-spacing: -0.045em;
          line-height: 0.95;
          margin: 6px 0 14px;
        }
        .beat-name .split-c {
          background: linear-gradient(180deg, #fff 40%, var(--gold-bright) 140%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .beat-role {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--cyan);
          margin-bottom: 10px;
        }
        .beat-line {
          font-family: var(--font-hand), var(--font-sans);
          font-weight: 500;
          font-size: clamp(25px, 2.3vw, 33px);
          line-height: 1.32;
          color: #f3ead2;
          max-width: 560px;
          margin-top: 22px;
          white-space: pre-line;
          overflow-wrap: break-word;
        }
        .beat-cta {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 36px;
        }
        .beat-film {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border-radius: 28px;
          box-shadow: 0 50px 120px rgba(0, 0, 0, 0.55), 0 0 0 1px var(--line);
        }
        .beat-film-tag {
          position: absolute;
          left: 18px;
          top: 16px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.1em;
          color: rgba(238, 242, 246, 0.6);
          pointer-events: none;
        }
        @media (max-width: 860px) {
          .beat-grid {
            grid-template-columns: 1fr;
          }
          .beat-film {
            max-width: 460px;
            width: 100%;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}

/**
 * The name always fits its column: single-word names scale down to one line,
 * multi-word names may wrap between words (never inside a word).
 */
function FitName({ name }: { name: string }) {
  const box = useRef<HTMLHeadingElement>(null);
  const [size, setSize] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const avail = el.clientWidth;
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:800 100px ${getComputedStyle(el).fontFamily};letter-spacing:-0.045em`;
      document.body.appendChild(probe);
      // the longest word must fit on one line
      const widest = Math.max(...name.split(" ").map((w) => ((probe.textContent = w), probe.offsetWidth)));
      probe.textContent = name;
      const whole = probe.offsetWidth;
      probe.remove();
      const max = Math.min(124, Math.max(46, innerWidth * 0.16));
      const oneLine = (avail / whole) * 100 * 0.96;
      const byWord = (avail / widest) * 100 * 0.96;
      // prefer one line if it stays large; otherwise wrap between words
      setSize(Math.floor(Math.min(max, oneLine >= max * 0.7 ? oneLine : byWord)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [name]);

  return (
    <h2 className="beat-name" ref={box} style={{ ["--fit" as string]: size ? `${size}px` : undefined }}>
      <SplitText text={name} inView stagger={0.05} />
    </h2>
  );
}
