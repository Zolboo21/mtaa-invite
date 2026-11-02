"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { milestones } from "@/data/timeline";
import { event } from "@/data/event";

// Гол тэмдэглэлт жилүүд (бүрэн 20 үйл явдал mtaa.vercel.app дээр байгаа)
const keyYears = ["1987", "2005", "2006", "2008–2009", "2013", "2014", "2018–2019"];

const items = keyYears
  .map((y) => milestones.find((m) => m.year === y))
  .filter(Boolean) as typeof milestones;

/**
 * Sticky stacking cards (yaas-energy pattern): each milestone pins and the
 * next one slides over it; covered cards shrink and dim.
 */
export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div className="stack" ref={ref}>
      {items.map((m, i) => (
        <Card key={m.year} i={i} m={m} progress={scrollYProgress} />
      ))}

      <style jsx global>{`
        .stack {
          position: relative;
          margin-top: 10px;
        }
        .scard-wrap {
          position: sticky;
          height: 78vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .scard {
          position: relative;
          width: 100%;
          height: min(64vh, 520px);
          border-radius: 26px;
          padding: clamp(26px, 4vw, 52px);
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: clamp(20px, 4vw, 56px);
          align-items: end;
          overflow: hidden;
          transform-origin: top center;
          border: 1px solid var(--line);
          box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.35);
          background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .scard .idx {
          z-index: 2;
          position: absolute;
          top: clamp(22px, 3vw, 36px);
          left: clamp(26px, 4vw, 52px);
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.08em;
          color: rgba(238, 242, 246, 0.55);
        }
        .scard .tag {
          z-index: 2;
          position: absolute;
          top: clamp(18px, 3vw, 32px);
          right: clamp(22px, 4vw, 48px);
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: #2a2000;
          background: var(--gold-bright);
          border-radius: 99px;
          padding: 6px 12px;
        }
        .scard .yr {
          font-family: var(--font-display);
          font-weight: 700;
          font-variant-numeric: lining-nums tabular-nums;
          letter-spacing: -0.03em;
          font-size: clamp(56px, 8.5vw, 132px);
          line-height: 0.9;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .scard .yr-to {
          font-size: 0.55em;
          opacity: 0.75;
          margin-top: 0.08em;
        }
        .scard-img {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 48%;
          opacity: 0.55;
          mask-image: linear-gradient(90deg, transparent, #000 45%);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 45%);
        }
        .scard > div:last-child {
          position: relative;
          z-index: 1;
        }
        .scard .t {
          font-size: clamp(20px, 2.4vw, 30px);
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-bottom: 12px;
        }
        .scard .d {
          color: rgba(238, 242, 246, 0.75);
          font-size: 15.5px;
          line-height: 1.65;
        }
        @media (max-width: 760px) {
          .scard {
            grid-template-columns: 1fr;
            align-content: end;
            gap: 14px;
          }
          .scard .yr {
            font-size: clamp(56px, 18vw, 96px);
          }
        }
      `}</style>
    </div>
  );
}

// Department photos on their matching milestones (user-provided).
const photos: Record<string, string> = {
  "1987": "/images/mtaa/building-old.png",
  "2005": "/images/mtaa/scada-tasgan.png",
  "2006": "/images/mtaa/control-center-team.png",
  "2018–2019": "/images/mtaa/building-new.png",
};

/** "2008–2009" -> two lines so big years never overflow the card. */
function Year({ y }: { y: string }) {
  const [a, b] = y.split("–");
  return b ? (
    <>
      <span>{a}</span>
      <span className="yr-to">–&thinsp;{b}</span>
    </>
  ) : (
    <span>{y}</span>
  );
}

const palettes = [
  "linear-gradient(150deg, #10374d, #0d1a24)",
  "linear-gradient(150deg, #14304a, #101722)",
  "linear-gradient(150deg, #5a4314, #1d1608)",
  "linear-gradient(150deg, #0e3d48, #0b1a1f)",
  "linear-gradient(150deg, #1b2d4f, #0e1424)",
  "linear-gradient(150deg, #0d4058, #0a1820)",
  "linear-gradient(150deg, #22314a, #0f141e)",
];

function Card({
  i,
  m,
  progress,
}: {
  i: number;
  m: (typeof items)[number];
  progress: MotionValue<number>;
}) {
  const n = items.length;
  const founding = m.year === String(event.foundedYear);
  // shrink once the following cards start covering this one
  const scale = useTransform(progress, [i / n, 1], [1, 1 - (n - i) * 0.035]);
  const dim = useTransform(progress, [i / n, (i + 1) / n], [1, 0.55]);

  return (
    <div className="scard-wrap" style={{ top: `calc(12vh + ${i * 14}px)` }}>
      <motion.article
        className="scard"
        style={{ scale, filter: useTransform(dim, (d) => `brightness(${d})`), backgroundColor: "#0d1115" }}
      >
        <div style={{ position: "absolute", inset: 0, background: palettes[i % palettes.length], zIndex: -1 }} />
        <span className="idx">
          {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        {founding && <span className="tag">Албаны үүсэл</span>}
        {photos[m.year] ? (
          <motion.div
            className="scard-img"
            initial={{ clipPath: "inset(0 0 0 100%)" }}
            whileInView={{ clipPath: "inset(0 0 0 0%)" }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={photos[m.year]} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: "cover" }} />
          </motion.div>
        ) : null}
        <div className="yr" style={{ color: founding ? "var(--gold-bright)" : "#fff" }}>
          <Year y={m.year} />
        </div>
        <div>
          <h3 className="t">{m.title.replace(" ★", "")}</h3>
          <p className="d">{m.text}</p>
        </div>
      </motion.article>
    </div>
  );
}
