"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "./fx";
import { Reveal, SplitText, ease } from "./motion";
import { event } from "@/data/event";

function useCountdown(iso: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(iso).getTime() - (now ?? 0));
  return {
    ready: now !== null,
    d: Math.floor(diff / 864e5),
    h: Math.floor(diff / 36e5) % 24,
    m: Math.floor(diff / 6e4) % 60,
    s: Math.floor(diff / 1e3) % 60,
  };
}

/** Each digit rolls up when it changes. */
function Roll({ value }: { value: number }) {
  const str = String(value).padStart(2, "0");
  return (
    <span className="roll">
      {Array.from(str).map((ch, i) => (
        <span className="roll-slot" key={i}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={ch}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

export default function EventDetails() {
  const c = useCountdown(event.dateISO);
  const cells: [number, string][] = [
    [c.d, "өдөр"],
    [c.h, "цаг"],
    [c.m, "минут"],
    [c.s, "секунд"],
  ];

  return (
    <section id="detail" className="ev">
      <div className="ev-in">
        <Label n="01">ҮДЭШЛЭГ</Label>
        <h2 className="ev-h">
          <SplitText text="Үдэшлэгийн товч" inView stagger={0.025} />
        </h2>

        <div className="ev-hero">
          <Reveal className="ev-date">
            <span className="ev-dd">04</span>
            <span className="ev-sep">/</span>
            <span className="ev-mm">12</span>
            <div className="ev-date-meta">
              <span>2026 · Баасан гараг</span>
              <span className="ev-time">{event.timeLabel}</span>
            </div>
          </Reveal>

          <Reveal className="ev-count" delay={0.15}>
            <p className="ev-count-l">[ ҮДЭШЛЭГ ЭХЛЭХ ХҮРТЭЛ ]</p>
            <div className="ev-cells">
              {cells.map(([v, l]) => (
                <div className="ev-cell" key={l}>
                  <div className="ev-num">{c.ready ? <Roll value={v} /> : "--"}</div>
                  <div className="ev-unit">{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="ev-grid">
          <Reveal className="ev-card ev-venue">
            <p className="ev-k">Байршил</p>
            <p className="ev-v">{event.venue}</p>
            <p className="ev-addr">{event.address}</p>
          </Reveal>
          <Reveal className="ev-card" delay={0.08}>
            <p className="ev-k">Хувцаслалт</p>
            <p className="ev-v">{event.dress}</p>
          </Reveal>
          <Reveal className="ev-card" delay={0.16}>
            <p className="ev-k">Хариу өгөх</p>
            <p className="ev-v ev-v-sm">{event.rsvpDeadlineLabel}</p>
          </Reveal>

          <Reveal className="ev-card ev-prog" delay={0.1}>
            <p className="ev-k">Хөтөлбөр</p>
            <ol>
              {event.program.map((p, i) => (
                <motion.li
                  key={p.time}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease, delay: 0.1 + i * 0.07 }}
                >
                  <span className="ev-pt">{p.time}</span>
                  <span className="ev-pd" />
                  <span className="ev-pn">{p.title}</span>
                </motion.li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>

      <style jsx global>{`
        .ev {
          position: relative;
          z-index: 1;
          padding: clamp(90px, 12vw, 160px) 0;
          background: var(--paper);
        }
        .ev-in {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 clamp(22px, 4vw, 56px);
        }
        .ev-h {
          font-size: var(--fs-h2);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1;
          margin-bottom: clamp(36px, 5vw, 64px);
        }
        .ev-hero {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: clamp(28px, 5vw, 80px);
          align-items: end;
          padding-bottom: clamp(36px, 5vw, 60px);
          border-bottom: 1px solid var(--line);
        }
        .ev-date {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 0 16px;
          font-family: var(--font-display);
          font-weight: 700;
          font-variant-numeric: lining-nums tabular-nums;
          letter-spacing: -0.03em;
          line-height: 0.8;
        }
        .ev-dd,
        .ev-mm {
          font-size: clamp(84px, 12.5vw, 190px);
          color: var(--ink);
        }
        .ev-mm {
          color: var(--gold-bright);
        }
        .ev-sep {
          font-size: clamp(50px, 7vw, 110px);
          color: var(--ink-3);
        }
        .ev-date-meta {
          width: 100%;
          display: flex;
          gap: 18px;
          align-items: baseline;
          margin-top: 22px;
          font-family: var(--font-sans);
          font-style: normal;
          font-size: 15px;
          color: var(--ink-2);
          line-height: 1.4;
        }
        .ev-time {
          font-family: var(--font-display);
          font-weight: 700;
          font-variant-numeric: lining-nums tabular-nums;
          letter-spacing: -0.03em;
          font-size: 34px;
          color: var(--cyan);
        }
        .ev-count-l {
          font-family: var(--font-mono);
          font-size: 11.5px;
          letter-spacing: 0.1em;
          color: var(--ink-3);
          margin-bottom: 14px;
        }
        .ev-cells {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .ev-cell {
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 18px 10px 14px;
          text-align: center;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);
        }
        .ev-num {
          font-size: clamp(36px, 4.6vw, 64px);
          font-weight: 300;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .roll {
          display: inline-flex;
        }
        .roll-slot {
          display: inline-block;
          overflow: hidden;
          height: 1em;
          line-height: 1;
          width: 0.62em;
        }
        .roll-slot > span {
          display: block;
        }
        .ev-unit {
          margin-top: 8px;
          font-size: 12px;
          color: var(--ink-3);
          letter-spacing: 0.06em;
        }
        .ev-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: clamp(28px, 4vw, 48px);
        }
        .ev-card {
          border: 1px solid var(--line-2);
          border-radius: 20px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.025);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.4s ease;
        }
        .ev-card:hover {
          border-color: rgba(70, 198, 242, 0.35);
          background: rgba(70, 198, 242, 0.04);
          transform: translateY(-3px);
        }
        .ev-k {
          font-family: var(--font-mono);
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 14px;
        }
        .ev-v {
          font-size: clamp(22px, 2.4vw, 30px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }
        .ev-v-sm {
          font-size: 19px;
          font-weight: 600;
        }
        .ev-addr {
          margin-top: 10px;
          color: var(--ink-2);
          font-size: 14.5px;
          line-height: 1.55;
        }
        .ev-venue {
          grid-row: span 1;
        }
        .ev-prog {
          grid-column: 1 / -1;
        }
        .ev-prog ol {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0 32px;
        }
        .ev-prog li {
          display: flex;
          align-items: baseline;
          gap: 14px;
          padding: 16px 0;
          border-top: 1px solid var(--line-2);
        }
        .ev-pt {
          font-family: var(--font-display);
          font-weight: 700;
          font-variant-numeric: lining-nums tabular-nums;
          letter-spacing: -0.03em;
          font-size: 26px;
          color: var(--gold-bright);
          min-width: 70px;
        }
        .ev-pd {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          flex-shrink: 0;
          translate: 0 -4px;
        }
        .ev-pn {
          font-size: 15.5px;
          color: var(--ink);
        }
        @media (max-width: 900px) {
          .ev-hero {
            grid-template-columns: 1fr;
          }
          .ev-grid {
            grid-template-columns: 1fr;
          }
          .ev-prog ol {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 420px) {
          .ev-cells {
            gap: 6px;
          }
          .ev-cell {
            padding: 14px 4px 10px;
          }
        }
      `}</style>
    </section>
  );
}
