"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { milestones, trackLabels, type TrackKey } from "@/data/timeline";

// Track colours from the main MTAA site (Nuur.tsx TRACK_COLORS).
const TRACK: Record<TrackKey, string> = { auto: "#4caf50", it: "#6094ea", both: "#e07a50" };

/** Every milestone 1987→2019 as a horizontal ribbon that drifts with scroll and can be swiped. */
export default function YearRibbon() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-38%"]);

  return (
    <div className="yr-ribbon" ref={ref}>
      <div className="yr-legend">
        {(Object.keys(TRACK) as TrackKey[]).map((k) => (
          <span key={k}>
            <i style={{ background: TRACK[k] }} />
            {trackLabels[k]}
          </span>
        ))}
        <span className="yr-count">{milestones.length} тэмдэглэлт үйл явдал</span>
      </div>
      <div className="yr-scroll">
        <motion.ol style={{ x }}>
          {milestones.map((m) => (
            <li key={m.year + m.title} style={{ ["--t" as string]: TRACK[m.track] }}>
              <span className="yr-y">{m.year.replace("–", " – ")}</span>
              <span className="yr-dot" />
              <span className="yr-t">{m.title.replace(" ★", "")}</span>
              <span className="yr-d">{m.text}</span>
            </li>
          ))}
        </motion.ol>
      </div>

      <style jsx global>{`
        .yr-ribbon {
          margin-top: clamp(60px, 8vw, 110px);
        }
        .yr-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 22px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--ink-2);
          margin-bottom: 22px;
        }
        .yr-legend i {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .yr-count {
          margin-left: auto;
          color: var(--ink-3);
        }
        .yr-scroll {
          overflow-x: auto;
          scrollbar-width: none;
          margin: 0 calc(-1 * clamp(22px, 4vw, 56px));
          padding: 0 clamp(22px, 4vw, 56px);
        }
        .yr-scroll::-webkit-scrollbar {
          display: none;
        }
        .yr-ribbon ol {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          width: max-content;
          border-top: 1px solid var(--line);
        }
        .yr-ribbon li {
          position: relative;
          width: 230px;
          padding: 22px 22px 0 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .yr-dot {
          position: absolute;
          top: -5px;
          left: 0;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--t);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--t) 20%, transparent);
        }
        .yr-y {
          font-family: var(--font-display);
          font-weight: 700;
          font-variant-numeric: lining-nums tabular-nums;
          letter-spacing: -0.03em;
          font-size: 30px;
          line-height: 1;
          color: var(--ink);
          transition: color 0.3s ease;
        }
        .yr-ribbon li:hover .yr-y {
          color: var(--t);
        }
        .yr-t {
          font-size: 14.5px;
          font-weight: 700;
          line-height: 1.3;
        }
        .yr-d {
          font-size: 13px;
          line-height: 1.55;
          color: var(--ink-3);
        }
      `}</style>
    </div>
  );
}
