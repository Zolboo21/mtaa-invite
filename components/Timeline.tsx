"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { milestones } from "@/data/timeline";
import { event } from "@/data/event";
import { ease } from "./motion";

// Гол тэмдэглэлт жилүүд (бүрэн 20 үйл явдал mtaa.vercel.app дээр байгаа)
const keyYears = ["1987", "2005", "2006", "2008–2009", "2013", "2014", "2018–2019"];

const items = keyYears
  .map((y) => milestones.find((m) => m.year === y))
  .filter(Boolean) as typeof milestones;

export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div className="tl" ref={ref}>
      <div className="tl-rail" aria-hidden>
        <motion.div className="tl-fill" style={{ scaleY: fill }} />
      </div>
      {items.map((m) => {
        const founding = m.year === String(event.foundedYear);
        return (
          <motion.div
            className="row"
            key={m.year}
            data-founding={founding}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease }}
          >
            <span className="tl-dot" aria-hidden />
            <div className="num yr">{m.year}</div>
            <div className="body">
              <h3 className="t">
                {m.title.replace(" ★", "")}
                {founding && <span className="tag">Албаны үүсэл</span>}
              </h3>
              <p className="d">{m.text}</p>
            </div>
          </motion.div>
        );
      })}

      <style jsx global>{`
        .tl {
          position: relative;
          margin-top: 6px;
          padding-left: 34px;
        }
        .tl-rail {
          position: absolute;
          left: 6px;
          top: 30px;
          bottom: 30px;
          width: 2px;
          background: var(--line);
        }
        .tl-fill {
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, var(--cyan), var(--gold));
          transform-origin: top;
        }
        .tl .row {
          position: relative;
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 28px;
          padding: 26px 0;
          border-top: 1px solid var(--line-2);
          align-items: start;
        }
        .tl .row:first-of-type {
          border-top: 1px solid var(--line);
        }
        .tl-dot {
          position: absolute;
          left: -34px;
          top: 34px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--paper);
          border: 2px solid var(--cyan);
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .tl .row:hover .tl-dot {
          transform: scale(1.4);
          background: var(--cyan);
        }
        .tl .yr {
          font-size: clamp(26px, 3.4vw, 38px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink);
          line-height: 1.1;
          transition: color 0.3s ease;
        }
        .tl .row:hover .yr {
          color: var(--cyan);
        }
        .tl .row[data-founding="true"] .yr {
          color: var(--gold-bright);
        }
        .tl .row[data-founding="true"] .tl-dot {
          border-color: var(--gold);
          background: var(--gold);
          box-shadow: 0 0 0 6px rgba(233, 194, 95, 0.18);
        }
        .tl .t {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .tl .tag {
          font-size: 12px;
          font-weight: 600;
          color: var(--gold-bright);
          border: 1px solid rgba(233, 194, 95, 0.4);
          border-radius: 4px;
          padding: 2px 8px;
        }
        .tl .d {
          color: var(--ink-2);
          font-size: 15.5px;
          line-height: 1.65;
          max-width: 640px;
        }
        @media (max-width: 620px) {
          .tl .row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .tl-dot {
            top: 34px;
          }
        }
      `}</style>
    </div>
  );
}
