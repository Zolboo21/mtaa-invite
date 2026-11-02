"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
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
        .scard-clip {
          position: absolute;
          top: clamp(40px, 6vw, 64px);
          right: clamp(20px, 4vw, 52px);
          width: min(44%, 470px);
          margin: 0;
          z-index: 1;
          filter: drop-shadow(0 24px 40px rgba(0, 0, 0, 0.55));
        }
        .scard-clip {
          cursor: zoom-in;
        }
        .scard-clip figcaption {
          margin-top: 10px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          color: rgba(238, 242, 246, 0.7);
          text-align: right;
        }
        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 1800;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(5, 8, 13, 0.88);
          backdrop-filter: blur(8px);
          cursor: zoom-out;
        }
        .lightbox img {
          max-width: min(1100px, 100%);
          max-height: 90vh;
          border-radius: 6px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
        }
        .lightbox-x {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 0;
          background: #fff;
          color: #0b1220;
          font-size: 18px;
          cursor: pointer;
        }
        @media (max-width: 760px) {
          .scard-clip {
            width: 78%;
            top: 48px;
          }
        }
        .scard-img.full {
          left: 0;
          width: 100%;
          opacity: 1;
          mask-image: none;
          -webkit-mask-image: none;
        }
        .scard-img.full::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(29, 22, 8, 0.92) 0%, rgba(29, 22, 8, 0.55) 45%, rgba(29, 22, 8, 0.82) 100%),
            linear-gradient(0deg, rgba(29, 22, 8, 0.9), transparent 55%);
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

// Newspaper clippings, shown as tilted paper rather than a faded background.
const clippings: Record<string, { src: string; alt: string; label: string }> = {
  "2008–2009": {
    src: "/images/mtaa/ubtimes-2009.png",
    alt: "Улаанбаатар Таймс: «Ус сувгийн станцууд бүрэн автомат боллоо»",
    label: "Улаанбаатар Таймс",
  },
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
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);
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
            className={`scard-img ${m.year === "2006" ? "full" : ""}`}
            initial={{ clipPath: "inset(0 0 0 100%)" }}
            whileInView={{ clipPath: "inset(0 0 0 0%)" }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={photos[m.year]} alt="" fill sizes="(max-width: 760px) 100vw, 1100px" style={{ objectFit: "cover", objectPosition: m.year === "2006" ? "50% 72%" : "50% 50%" }} />
          </motion.div>
        ) : null}
        {clippings[m.year] ? (
          <motion.figure
            className="scard-clip"
            role="button"
            tabIndex={0}
            aria-label={`${clippings[m.year].alt} — томруулж унших`}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: -2.5 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={clippings[m.year].src} alt={clippings[m.year].alt} width={1050} height={580} sizes="(max-width: 760px) 80vw, 460px" style={{ width: "100%", height: "auto", display: "block" }} />
            <figcaption>[ {clippings[m.year].label} ] · томруулах ⤢</figcaption>
          </motion.figure>
        ) : null}
        {open && createPortal(
        <AnimatePresence>
          {open && clippings[m.year] ? (
            <motion.div
              className="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <motion.img
                src={clippings[m.year].src}
                alt={clippings[m.year].alt}
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95 }}
              />
              <button type="button" className="lightbox-x" aria-label="Хаах">
                ✕
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
        )}
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
