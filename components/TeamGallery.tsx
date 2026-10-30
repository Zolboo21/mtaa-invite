"use client";

import Image from "next/image";
import { photos } from "@/data/team";

const feature = photos[0];
const rest = photos.slice(1, 3);

export default function TeamGallery() {
  return (
    <div className="team">
      <figure className="feat">
        <div className="imgw wide">
          <Image
            src={feature.src}
            alt={feature.caption}
            fill
            sizes="(max-width: 1000px) 100vw, 1000px"
            style={{ objectFit: "cover" }}
            priority={false}
          />
        </div>
        <figcaption>{feature.caption}</figcaption>
      </figure>

      <div className="pair">
        {rest.map((p) => (
          <figure key={p.src}>
            <div className="imgw">
              <Image
                src={p.src}
                alt={p.caption}
                fill
                sizes="(max-width: 1000px) 100vw, 500px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <figcaption>{p.caption}</figcaption>
          </figure>
        ))}
      </div>

      <style jsx global>{`
        .team {
          margin-top: 8px;
        }
        .team figure {
          margin: 0;
        }
        .team .imgw {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 2;
          border-radius: 8px;
          overflow: hidden;
          background: var(--paper-2);
        }
        .team .imgw.wide {
          aspect-ratio: 21 / 9;
        }
        .team figcaption {
          margin-top: 12px;
          font-size: 14px;
          color: var(--ink-3);
        }
        .team .pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 28px;
        }
        @media (max-width: 620px) {
          .team .imgw.wide {
            aspect-ratio: 3 / 2;
          }
          .team .pair {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
