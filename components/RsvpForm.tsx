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
                Оролцоно
              </button>
              <button
                className="choice"
                data-sel={status === "no"}
                onClick={() => setStatus("no")}
              >
                Оролцож чадахгүй
              </button>
            </div>

            {error && <p className="err">{error}</p>}

            <button
              className="btn btn-solid submit"
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
          font-size: 16px;
          font-weight: 500;
          padding: 20px;
          background: transparent;
          border: 1px solid var(--line);
          border-radius: 8px;
          color: var(--ink-2);
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease,
            background 0.2s ease;
        }
        .choice:hover {
          border-color: var(--ink-2);
          color: var(--ink);
        }
        .choice[data-sel="true"] {
          border-color: var(--ink);
          color: var(--ink);
          background: color-mix(in srgb, var(--accent) 8%, transparent);
          box-shadow: inset 0 0 0 1px var(--ink);
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
          color: #b4432f;
          font-size: 14px;
          margin-top: 12px;
        }
        .submit {
          margin-top: 20px;
          width: 100%;
        }
        .done {
          padding: 10px 0;
        }
        .done-title {
          font-size: 20px;
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
          box-shadow: inset 0 -1px 0 0 rgba(12, 111, 106, 0.35);
        }
        .aslink:hover {
          box-shadow: inset 0 -1px 0 0 var(--accent);
        }
      `}</style>
    </div>
  );
}
