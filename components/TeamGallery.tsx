"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { photos } from "@/data/team";

/**
 * 3D fly-through (vadimcarazan pattern): the section pins and scrolling moves
 * the camera forward through photos placed at increasing depth. The photo
 * nearest the camera names itself in the corner with a big italic counter.
 */
const GAP = 900; // depth between photos (px)
const slots = [
  [-0.26, -0.06],
  [0.24, 0.08],
  [-0.2, 0.12],
  [0.27, -0.1],
  [-0.08, -0.14],
  [0.2, 0.1],
  [-0.25, 0.02],
];

export default function TeamGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const travel = useTransform(p, [0, 1], [0, (photos.length - 0.2) * GAP]);
  const [active, setActive] = useState(0);

  useMotionValueEvent(travel, "change", (v) => {
    setActive(Math.min(photos.length - 1, Math.max(0, Math.round(v / GAP - 0.25))));
  });

  return (
    <div className="fly" ref={ref} style={{ height: `${photos.length * 70 + 60}vh` }}>
      <div className="fly-pin">
        <div className="fly-stars" aria-hidden />
        <div className="fly-space">
          {photos.map((ph, i) => (
            <FlyCard key={ph.src} i={i} travel={travel} src={ph.src} alt={ph.caption} />
          ))}
        </div>

        <div className="fly-meta">
          <motion.div key={active} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <span className="fly-n">{String(active + 1).padStart(3, "0")}</span>
            <span className="fly-c">{photos[active].caption}</span>
          </motion.div>
        </div>
        <div className="fly-count">
          {active + 1} / {photos.length} зураг
        </div>
      </div>

      <style jsx global>{`
        .fly {
          position: relative;
        }
        .fly-pin {
          position: sticky;
          top: 0;
          height: 100svh;
          overflow: hidden;
          perspective: 900px;
          perspective-origin: 50% 50%;
        }
        .fly-stars {
          position: absolute;
          inset: -10%;
          background-image: radial-gradient(1.5px 1.5px at 20% 30%, rgba(246, 221, 143, 0.5), transparent),
            radial-gradient(1px 1px at 70% 60%, rgba(70, 198, 242, 0.5), transparent),
            radial-gradient(1.5px 1.5px at 40% 80%, rgba(255, 255, 255, 0.35), transparent),
            radial-gradient(1px 1px at 85% 20%, rgba(246, 221, 143, 0.4), transparent),
            radial-gradient(1px 1px at 10% 70%, rgba(70, 198, 242, 0.4), transparent);
          background-size: 260px 260px;
          opacity: 0.7;
        }
        .fly-space {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
        }
        .fly-card {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(240px, 34vw, 520px);
          aspect-ratio: 3 / 2;
          margin-left: calc(clamp(240px, 34vw, 520px) / -2);
          margin-top: calc(clamp(240px, 34vw, 520px) / -3);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
          will-change: transform, opacity;
        }
        .fly-meta {
          position: absolute;
          left: clamp(22px, 5vw, 72px);
          bottom: clamp(28px, 6vh, 64px);
          z-index: 2;
        }
        .fly-meta > div {
          display: flex;
          align-items: baseline;
          gap: 18px;
        }
        .fly-n {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(56px, 8vw, 110px);
          line-height: 0.9;
          color: var(--gold-bright);
        }
        .fly-c {
          font-size: clamp(16px, 1.6vw, 21px);
          font-weight: 600;
          max-width: 260px;
        }
        .fly-count {
          position: absolute;
          right: clamp(22px, 5vw, 72px);
          bottom: clamp(36px, 6vh, 70px);
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--ink-3);
          z-index: 2;
        }
        @media (max-width: 640px) {
          .fly-card {
            width: 78vw;
            margin-left: -39vw;
            margin-top: -26vw;
          }
        }
      `}</style>
    </div>
  );
}

function FlyCard({ i, travel, src, alt }: { i: number; travel: MotionValue<number>; src: string; alt: string }) {
  const [sx, sy] = slots[i % slots.length];
  const z = useTransform(travel, (t) => -i * GAP + t - 200);
  const transform = useTransform(
    z,
    (zz) => `translate3d(${sx * 100}vw, ${sy * 100}vh, ${zz}px) rotateY(${sx * -18}deg)`,
  );
  // fade in from the far distance, fade out as it passes the camera
  const opacity = useTransform(z, [-GAP * 3.2, -GAP * 1.6, 200, 600], [0, 1, 1, 0]);
  return (
    <motion.figure className="fly-card" style={{ transform, opacity }}>
      <Image src={src} alt={alt} fill sizes="(max-width: 640px) 80vw, 520px" style={{ objectFit: "cover" }} />
    </motion.figure>
  );
}
