"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import StoryCanvas from "./StoryCanvas";
import { Scramble } from "./fx";
import { ease } from "./motion";

/**
 * Pinned story driven by scroll (myrefactory pattern), rendered live in WebGL
 * by StoryCanvas. The Remotion "flow-scrub" render is only a fallback for
 * reduced motion.
 */
const steps = [
  { at: 0, year: "1987", title: "Нэг дуслаас эхэлсэн", text: "Цалингийн тооцоог төвөөр бодуулж эхэлсэн тэр өдрөөс мэдээллийн технологийн суурь тавигдсан." },
  { at: 0.3, year: "2006", title: "Долгион болон тэлсэн", text: "5 хүнтэй Мэдээллийн технологи, автоматжуулалтын хэсэг байгуулагдаж, албаны түүх эхэлсэн." },
  { at: 0.5, year: "200+", title: "Ус ба өгөгдлийн нэг сүлжээ", text: "SCADA, телеметр, 2054 камер — хотын усан хангамж бүхэлдээ дижитал удирдлагатай боллоо." },
  { at: 0.76, year: "2026", title: "Хорин жилийн ой", text: "Хорин жилийг бүтээсэн хамт олноороо хамтдаа тэмдэглэе." },
];

export default function ScrubStory() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const [reduce, setReduce] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => setReduce(matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    progress.current = p;
    let s = 0;
    steps.forEach((st, i) => p >= st.at && (s = i));
    setStep(s);
  });

  const s = steps[step];
  return (
    <section className="scrub" ref={ref} id="story">
      <div className="scrub-pin">
        {reduce ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="scrub-fallback" src="/videos/flow-scrub.jpg" alt="" />
        ) : (
          <StoryCanvas progress={progress} />
        )}
        <div className="scrub-shade" />

        <div className="scrub-grid">
          <div className="scrub-copy">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease }}
              >
                <div className="scrub-year">
                  <Scramble text={s.year} duration={600} />
                </div>
                <h2 className="scrub-title">{s.title}</h2>
                <p className="scrub-text">{s.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="scrub-steps">
            {steps.map((st, i) => (
              <span key={st.year} data-on={i <= step}>
                {st.year}
              </span>
            ))}
            <motion.i style={{ width: bar }} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrub {
          position: relative;
          z-index: 1;
          height: 420vh;
          background: radial-gradient(ellipse 70% 60% at 60% 45%, #0f1f33, #070c14 70%);
        }
        .scrub-pin {
          position: sticky;
          top: 0;
          height: 100svh;
          overflow: hidden;
        }
        .story-canvas,
        .scrub-fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .story-canvas canvas {
          display: block;
        }
        .scrub-shade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(90deg, rgba(7, 12, 20, 0.88) 0%, rgba(7, 12, 20, 0.35) 38%, transparent 60%);
        }
        /* safe grid: content always sits inside the gutters */
        .scrub-grid {
          position: absolute;
          inset: 0;
          box-sizing: border-box;
          padding: clamp(96px, 14vh, 140px) clamp(20px, 5vw, 96px) clamp(28px, 5vh, 56px);
          display: grid;
          grid-template-rows: 1fr auto;
          pointer-events: none;
        }
        .scrub-copy {
          align-self: end;
          width: 100%;
          max-width: min(520px, 42vw);
          margin-bottom: clamp(24px, 4vh, 48px);
        }
        .scrub-year {
          font-family: var(--font-display);
          font-weight: 700;
          font-variant-numeric: lining-nums tabular-nums;
          letter-spacing: -0.03em;
          font-size: clamp(56px, 8vw, 132px);
          line-height: 0.9;
          color: var(--gold-bright);
          margin-bottom: 14px;
          white-space: nowrap;
        }
        .scrub-title {
          font-size: clamp(24px, 2.8vw, 42px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 12px;
        }
        .scrub-text {
          color: var(--ink-2);
          font-size: clamp(15px, 1.1vw, 17px);
          line-height: 1.65;
        }
        .scrub-steps {
          position: relative;
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--ink-3);
          border-top: 1px solid var(--line);
          padding-top: 12px;
        }
        .scrub-steps span[data-on="true"] {
          color: var(--cyan);
        }
        .scrub-steps i {
          position: absolute;
          top: -1px;
          left: 0;
          height: 1px;
          background: linear-gradient(90deg, #38bdf8, #7ed56f, var(--gold-bright));
        }
        @media (max-width: 760px) {
          .scrub-shade {
            background: linear-gradient(0deg, rgba(7, 12, 20, 0.95) 28%, rgba(7, 12, 20, 0.4) 55%, transparent 75%);
          }
          .scrub-copy {
            max-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
