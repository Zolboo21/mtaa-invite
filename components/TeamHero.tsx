"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

/** Full-bleed reveal of the whole team: the window opens and the photo drifts as you scroll. */
export default function TeamHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const inset = useTransform(scrollYProgress, [0, 0.45], [14, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.45], [36, 0]);
  const clipPath = useTransform([inset, radius] as const, ([i, r]: number[]) => `inset(${i}% ${i}% ${i}% ${i}% round ${r}px)`);
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const capY = useTransform(scrollYProgress, [0.2, 0.6], [40, 0]);
  const capO = useTransform(scrollYProgress, [0.25, 0.55], [0, 1]);

  return (
    <div className="th" ref={ref}>
      <motion.div className="th-frame" style={{ clipPath }}>
        <motion.div className="th-img" style={{ y }}>
          <Image
            src="/images/team/6.jpg"
            alt="МТАА-ны нэгдсэн хамт олон"
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "50% 40%" }}
          />
        </motion.div>
        <div className="th-shade" />
        <motion.div className="th-cap" style={{ y: capY, opacity: capO }}>
          <span>[ МТАА — НЭГДСЭН ХАМТ ОЛОН ]</span>
          <p>Хорин жил, нэг баг.</p>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        .th {
          position: relative;
          height: 120vh;
          margin-top: clamp(20px, 4vw, 48px);
        }
        .th-frame {
          position: sticky;
          top: 0;
          height: 100svh;
          overflow: hidden;
        }
        .th-img {
          position: absolute;
          inset: -10% 0;
        }
        .th-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(7, 12, 20, 0.15) 50%, rgba(7, 12, 20, 0.9));
        }
        .th-cap {
          position: absolute;
          left: clamp(20px, 5vw, 80px);
          right: clamp(20px, 5vw, 80px);
          bottom: clamp(28px, 7vh, 72px);
        }
        .th-cap span {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.1em;
          color: var(--cyan);
        }
        .th-cap p {
          margin-top: 10px;
          font-family: var(--font-display);
          font-size: clamp(36px, 6vw, 96px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
