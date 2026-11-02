"use client";

import { useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { motion, useInView } from "framer-motion";
import { GuestFilm, GUEST_FILM } from "./film/GuestFilm";
import { Magnetic } from "./chrome";
import { Label } from "./fx";
import { SplitText, ease } from "./motion";
import { event } from "@/data/event";

type Guest = { slug: string; name: string; title?: string; note?: string; vip?: boolean };

/** Personal beat right after the hero: the guest's name, big, plus their own Remotion film. */
export default function GuestBeat({ guest, line }: { guest: Guest; line: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const seen = useInView(ref, { margin: "-20% 0px" });

  return (
    <section className="beat" id="invite">
      <div className="beat-grid">
        <div className="beat-copy">
          <Label n="00">ХУВИЙН УРИЛГА</Label>
          <p className="beat-hi">{guest.vip ? "Эрхэм хүндэт" : "Хүндэт"}</p>
          <h2 className="beat-name">
            <SplitText text={guest.name} inView stagger={0.05} />
          </h2>
          {guest.title ? <p className="beat-role">{guest.title}</p> : null}
          <motion.p
            className="beat-line"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease, delay: 0.4 }}
          >
            {line}
          </motion.p>
          <div className="beat-cta">
            <Magnetic>
              <a href="#rsvp" className="btn btn-gold btn-lg">
                Хариу өгөх
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#detail" className="btn btn-line-light btn-lg">
                Үдэшлэгийн мэдээлэл
              </a>
            </Magnetic>
          </div>
        </div>

        <motion.div
          ref={ref}
          className="beat-film"
          initial={{ clipPath: "inset(18% 18% 18% 18% round 40px)", opacity: 0.3 }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.4, ease }}
          onViewportEnter={() => player.current?.play()}
        >
          <Player
            ref={player}
            component={GuestFilm}
            inputProps={{ name: guest.name, vip: guest.vip, dateLabel: "2026.12.04 · 18:00" }}
            durationInFrames={GUEST_FILM.durationInFrames}
            fps={GUEST_FILM.fps}
            compositionWidth={GUEST_FILM.width}
            compositionHeight={GUEST_FILM.height}
            style={{ width: "100%", height: "100%" }}
            autoPlay={seen}
            loop
            acknowledgeRemotionLicense
          />
          <span className="beat-film-tag">[ ТАНД ЗОРИУЛСАН КИНО · {event.years} ЖИЛ ]</span>
        </motion.div>
      </div>

      <style jsx global>{`
        .beat {
          position: relative;
          z-index: 1;
          padding: clamp(90px, 12vw, 160px) 0;
          background: radial-gradient(ellipse 60% 50% at 80% 40%, rgba(30, 167, 230, 0.08), transparent),
            var(--paper);
        }
        .beat-grid {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 clamp(22px, 4vw, 56px);
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: clamp(32px, 6vw, 96px);
          align-items: center;
        }
        .beat-hi {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(22px, 2.6vw, 32px);
          color: var(--ink-2);
        }
        .beat-name {
          font-size: clamp(46px, 7.2vw, 124px);
          overflow-wrap: anywhere;
          font-weight: 800;
          letter-spacing: -0.045em;
          line-height: 0.95;
          margin: 6px 0 14px;
        }
        .beat-name .split-c {
          background: linear-gradient(180deg, #fff 40%, var(--gold-bright) 140%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .beat-role {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--cyan);
          margin-bottom: 10px;
        }
        .beat-line {
          font-size: var(--fs-lead);
          line-height: 1.6;
          color: var(--ink-2);
          max-width: 520px;
          margin-top: 18px;
        }
        .beat-cta {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 36px;
        }
        .beat-film {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border-radius: 28px;
          box-shadow: 0 50px 120px rgba(0, 0, 0, 0.55), 0 0 0 1px var(--line);
        }
        .beat-film-tag {
          position: absolute;
          left: 18px;
          top: 16px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.1em;
          color: rgba(238, 242, 246, 0.6);
          pointer-events: none;
        }
        @media (max-width: 860px) {
          .beat-grid {
            grid-template-columns: 1fr;
          }
          .beat-film {
            max-width: 460px;
            width: 100%;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
