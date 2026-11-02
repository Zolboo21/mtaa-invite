"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { photos } from "@/data/team";

/**
 * Horizontal photo strip: drifts sideways as the page scrolls, can also be
 * swiped / scrolled directly. Photos zoom slightly on hover.
 */
export default function TeamGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-18%"]);

  return (
    <div className="team" ref={ref}>
      <motion.div className="team-strip" style={{ x }}>
        {photos.map((p, i) => (
          <motion.figure
            key={p.src}
            className={i === 0 ? "wide" : undefined}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5% 0px" }}
            transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="imgw">
              <Image
                src={p.src}
                alt={p.caption}
                fill
                sizes="(max-width: 640px) 80vw, 560px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <figcaption>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              {p.caption}
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>

      <style jsx global>{`
        .team {
          margin-top: 8px;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .team::-webkit-scrollbar {
          display: none;
        }
        .team-strip {
          display: flex;
          gap: 20px;
          width: max-content;
          padding: 0 32px;
        }
        .team figure {
          margin: 0;
          width: clamp(240px, 32vw, 420px);
          flex-shrink: 0;
        }
        .team figure.wide {
          width: clamp(300px, 52vw, 720px);
        }
        .team .imgw {
          position: relative;
          width: 100%;
          height: clamp(220px, 30vw, 420px);
          border-radius: 12px;
          overflow: hidden;
          background: var(--paper-2);
        }
        .team .imgw img {
          transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s ease;
          filter: saturate(0.85);
        }
        .team figure:hover .imgw img {
          transform: scale(1.06);
          filter: saturate(1.05);
        }
        .team figcaption {
          margin-top: 12px;
          font-size: 14px;
          color: var(--ink-3);
          display: flex;
          gap: 12px;
        }
        .team figcaption .num {
          color: var(--cyan);
        }
        @media (max-width: 640px) {
          .team-strip {
            padding: 0 22px;
          }
          .team figure,
          .team figure.wide {
            width: 78vw;
          }
        }
      `}</style>
    </div>
  );
}
