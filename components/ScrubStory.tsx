"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Scramble } from "./fx";
import { ease } from "./motion";

/**
 * Pinned section whose video is scrubbed by scroll (myrefactory pattern).
 * The video (remotion "flow-scrub") is encoded all-intra so seeking is instant.
 */
const steps = [
  { at: 0, year: "1987", title: "Нэг дуслаас эхэлсэн", text: "Цалингийн тооцоог төвөөр бодуулж эхэлсэн тэр өдрөөс мэдээллийн технологийн суурь тавигдсан." },
  { at: 0.28, year: "2006", title: "Долгион болон тэлсэн", text: "5 хүнтэй Мэдээллийн технологи, автоматжуулалтын хэсэг байгуулагдаж, албаны түүх эхэлсэн." },
  { at: 0.52, year: "200+", title: "Ус ба өгөгдлийн нэг сүлжээ", text: "SCADA, телеметр, 650 камер — хотын усан хангамж бүхэлдээ дижитал удирдлагатай боллоо." },
  { at: 0.78, year: "2026", title: "Хорин жилийн ой", text: "Хорин жилийг бүтээсэн хамт олноороо хамтдаа тэмдэглэе." },
];

export default function ScrubStory() {
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState("flow-scrub");
  const [step, setStep] = useState(0);
  const target = useRef(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    if (matchMedia("(orientation: portrait) and (max-width: 820px)").matches) setFile("flow-scrub-vertical");
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    target.current = p;
    let s = 0;
    steps.forEach((st, i) => p >= st.at && (s = i));
    setStep(s);
  });

  // ease currentTime toward the scroll target every frame for a smooth scrub
  useEffect(() => {
    let raf = 0;
    let cur = 0;
    const loop = () => {
      const v = video.current;
      if (v && v.duration) {
        cur += (target.current - cur) * 0.18;
        const t = Math.min(v.duration - 0.04, cur * v.duration);
        if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const s = steps[step];
  return (
    <section className="scrub" ref={ref} id="story">
      <div className="scrub-pin">
        <video
          ref={video}
          key={file}
          src={`/videos/${file}.mp4`}
          poster={`/videos/${file}.jpg`}
          muted
          playsInline
          preload="auto"
          className="scrub-video"
        />
        <div className="scrub-shade" />
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

      <style jsx global>{`
        .scrub {
          position: relative;
          z-index: 1;
          height: 420vh;
          background: #0d1115;
        }
        .scrub-pin {
          position: sticky;
          top: 0;
          height: 100svh;
          overflow: hidden;
        }
        .scrub-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .scrub-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(13, 17, 21, 0.85), transparent 55%);
        }
        .scrub-copy {
          position: absolute;
          left: clamp(22px, 7vw, 110px);
          bottom: clamp(110px, 16vh, 170px);
          max-width: 520px;
        }
        .scrub-year {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(64px, 11vw, 150px);
          line-height: 0.9;
          color: var(--gold-bright);
          margin-bottom: 14px;
        }
        .scrub-title {
          font-size: clamp(26px, 3.6vw, 44px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .scrub-text {
          color: var(--ink-2);
          font-size: 16px;
          line-height: 1.65;
        }
        .scrub-steps {
          position: absolute;
          left: clamp(22px, 7vw, 110px);
          right: clamp(22px, 7vw, 110px);
          bottom: 48px;
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
          background: var(--cyan);
        }
        @media (max-width: 760px) {
          .scrub-shade {
            background: linear-gradient(0deg, rgba(13, 17, 21, 0.92) 30%, transparent 75%);
          }
        }
      `}</style>
    </section>
  );
}
