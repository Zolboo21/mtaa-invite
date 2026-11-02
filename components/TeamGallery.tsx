"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue, useScroll, useTransform } from "framer-motion";
import { photos } from "@/data/team";

/**
 * 3D curved carousel (yaas-energy pattern): photos sit on a cylinder that
 * turns slowly on its own, faster with scroll, and can be dragged.
 */
export default function TeamGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(640);
  const spin = useMotionValue(0);
  const drag = useRef<{ x: number; base: number } | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scrollTurn = useTransform(scrollYProgress, [0, 1], [40, -80]);
  const rotateY = useTransform([spin, scrollTurn] as const, ([a, b]: number[]) => a + b);

  useEffect(() => {
    const set = () => setRadius(innerWidth < 640 ? 300 : innerWidth < 1000 ? 460 : 640);
    set();
    addEventListener("resize", set);
    return () => removeEventListener("resize", set);
  }, []);

  useAnimationFrame((_, dt) => {
    if (!drag.current) spin.set(spin.get() - dt * 0.004);
  });

  const n = photos.length;
  const step = 360 / n;

  return (
    <div
      className="ring-stage"
      ref={ref}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, base: spin.get() };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current) spin.set(drag.current.base + (e.clientX - drag.current.x) * 0.2);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <motion.div className="ring" style={{ rotateY }}>
        {photos.map((p, i) => (
          <figure
            key={p.src}
            className="ring-card"
            style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }}
          >
            <div className="imgw">
              <Image src={p.src} alt={p.caption} fill sizes="420px" style={{ objectFit: "cover" }} draggable={false} />
            </div>
            <figcaption>
              <span>{String(i + 1).padStart(2, "0")}</span> {p.caption}
            </figcaption>
          </figure>
        ))}
      </motion.div>
      <p className="ring-hint">[ ЧИРЖ ЭРГҮҮЛНЭ ҮҮ ]</p>

      <style jsx global>{`
        .ring-stage {
          position: relative;
          height: clamp(380px, 52vw, 620px);
          perspective: 1800px;
          perspective-origin: 50% 40%;
          overflow: hidden;
          cursor: grab;
          touch-action: pan-y;
          user-select: none;
          margin-top: 10px;
        }
        .ring-stage:active {
          cursor: grabbing;
        }
        .ring {
          position: absolute;
          left: 50%;
          top: 46%;
          width: 0;
          height: 0;
          transform-style: preserve-3d;
        }
        .ring-card {
          position: absolute;
          margin: 0;
          width: clamp(200px, 26vw, 360px);
          left: calc(clamp(200px, 26vw, 360px) / -2);
          top: calc(clamp(150px, 19vw, 260px) / -2);
          backface-visibility: hidden;
        }
        .ring-card .imgw {
          position: relative;
          width: 100%;
          height: clamp(150px, 19vw, 260px);
          border-radius: 18px;
          overflow: hidden;
          background: var(--paper-2);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }
        .ring-card figcaption {
          margin-top: 10px;
          font-size: 13px;
          color: var(--ink-2);
          text-align: center;
        }
        .ring-card figcaption span {
          font-family: var(--font-mono);
          color: var(--cyan);
        }
        .ring-hint {
          position: absolute;
          bottom: 8px;
          width: 100%;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 11.5px;
          letter-spacing: 0.1em;
          color: var(--ink-3);
        }
      `}</style>
    </div>
  );
}
