"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { event } from "@/data/event";

type Existing = { status: "yes" | "no"; message?: string } | null;

export default function RsvpForm({
  slug,
  name,
  initial,
}: {
  slug: string;
  name: string;
  initial: Existing;
}) {
  const [status, setStatus] = useState<"yes" | "no" | null>(
    initial?.status ?? null
  );
  const [message, setMessage] = useState(initial?.message ?? "");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(Boolean(initial));
  const [error, setError] = useState("");

  async function submit() {
    if (!status) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, status, message }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Алдаа гарлаа");
      setDone(true);
    } catch (e: any) {
      setError(e.message || "Илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rsvp">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="done"
          >
            <Burst gold={status === "yes"} />
            <svg className="done-check" viewBox="0 0 80 80" aria-hidden>
              <motion.circle cx="40" cy="40" r="36" fill="none" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
              <motion.path d={status === "yes" ? "M25 41 l10 10 l20 -22" : "M28 40 h24"} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.7 }} />
            </svg>
            <p className="done-title">
              {status === "yes"
                ? "Таныг хүлээн авлаа — уулзацгаая."
                : "Хариуг тань хүлээн авлаа."}
            </p>
            <p className="done-line">
              {status === "yes"
                ? `${event.dateLabel}, ${event.timeLabel}. ${event.venue}.`
                : "Хүндэтгэн ойлгож байна. Таны амжилтыг хүсэн ерөөе."}
            </p>
            <button className="aslink" onClick={() => setDone(false)}>
              Хариугаа өөрчлөх
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="choices">
              <button
                className="choice"
                data-sel={status === "yes"}
                onClick={() => setStatus("yes")}
              >
                <span className="choice-ic">✓</span>
                <span className="choice-t">Оролцоно</span>
                <span className="choice-s">Үдэшлэгт хүрэлцэн ирнэ</span>
              </button>
              <button
                className="choice"
                data-sel={status === "no"}
                onClick={() => setStatus("no")}
              >
                <span className="choice-ic">✕</span>
                <span className="choice-t">Оролцож чадахгүй</span>
                <span className="choice-s">Энэ удаад боломжгүй</span>
              </button>
            </div>

            {error && <p className="err">{error}</p>}

            <button
              className="btn btn-gold btn-lg submit"
              disabled={!status || sending}
              onClick={submit}
            >
              {sending ? "Илгээж байна…" : "Хариугаа илгээх"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .rsvp {
          margin-top: 10px;
        }
        .choices {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 520px) {
          .choices {
            grid-template-columns: 1fr;
          }
        }
        .choice {
          font: inherit;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 26px 24px;
          min-height: 170px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--line);
          border-radius: 22px;
          color: var(--ink-2);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .choice:hover {
          border-color: rgba(246, 221, 143, 0.45);
          color: var(--ink);
          transform: translateY(-4px);
        }
        .choice-ic {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 1px solid var(--line);
          font-size: 16px;
          margin-bottom: auto;
          transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .choice-t {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-top: 26px;
        }
        .choice-s {
          font-size: 14px;
          color: var(--ink-3);
        }
        .choice[data-sel="true"] {
          border-color: var(--gold-bright);
          background: radial-gradient(circle at 20% 0%, rgba(246, 221, 143, 0.16), rgba(255, 255, 255, 0.03) 70%);
          box-shadow: 0 20px 60px rgba(233, 194, 95, 0.12), inset 0 0 0 1px var(--gold-bright);
        }
        .choice[data-sel="true"] .choice-ic {
          background: var(--gold-bright);
          border-color: var(--gold-bright);
          color: #2a2000;
        }
        .msg-label {
          display: block;
          margin: 24px 0 10px;
          font-size: 14px;
          color: var(--ink-3);
        }
        #msg {
          width: 100%;
          font: inherit;
          font-size: 16px;
          padding: 14px 16px;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 8px;
          color: var(--ink);
          resize: vertical;
        }
        #msg:focus {
          outline: none;
          border-color: var(--accent);
        }
        .err {
          color: #ff9d8a;
          font-size: 14px;
          margin-top: 12px;
        }
        .submit {
          margin-top: 20px;
          width: 100%;
        }
        .done {
          position: relative;
          padding: 10px 0;
          text-align: center;
        }
        .done-check {
          width: 84px;
          height: 84px;
          margin: 0 auto 18px;
          display: block;
          stroke: var(--gold-bright);
        }
        .done-title {
          font-size: clamp(24px, 3vw, 34px);
          letter-spacing: -0.02em;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .done-line {
          color: var(--ink-2);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 18px;
        }
        .aslink {
          font: inherit;
          font-size: 15px;
          background: none;
          border: 0;
          padding: 0;
          color: var(--accent);
          cursor: pointer;
          box-shadow: inset 0 -1px 0 0 rgba(70, 198, 242, 0.35);
        }
        .aslink:hover {
          box-shadow: inset 0 -1px 0 0 var(--accent);
        }
      `}</style>
    </div>
  );
}

/** Gold confetti burst behind the success check. */
function Burst({ gold }: { gold: boolean }) {
  const n = gold ? 26 : 0;
  return (
    <div className="burst" aria-hidden>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const r = 90 + (i % 3) * 40;
        return (
          <motion.i
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8, opacity: 0, scale: 0.4 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{
              position: "absolute",
              left: "50%",
              top: 42,
              width: i % 2 ? 6 : 4,
              height: i % 2 ? 6 : 10,
              borderRadius: 2,
              background: i % 3 ? "#f6dd8f" : "#46c6f2",
              rotate: (i * 37) % 180,
            }}
          />
        );
      })}
    </div>
  );
}
