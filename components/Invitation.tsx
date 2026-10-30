"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import IntroScene from "./IntroScene";
import RsvpForm from "./RsvpForm";
import Timeline from "./Timeline";
import TeamGallery from "./TeamGallery";
import { event } from "@/data/event";

type Guest = {
  slug: string;
  name: string;
  title?: string;
  note?: string;
  vip?: boolean;
};

type Existing = { status: "yes" | "no"; message?: string } | null;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Invitation({
  guest,
  initial,
}: {
  guest: Guest;
  initial: Existing;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  // one orchestrated load sequence (hero only)
  const stage = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
  };
  const fade = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease } },
  };

  const invitationLine =
    guest.note ||
    `${event.org}-ын ${event.dept} үүсэн байгуулагдсаны ${event.years} жилийн ойн хүндэтгэлийн үдэшлэгт Таныг хүрэлцэн ирэхийг урьж байна.`;

  return (
    <>
      {/* ===================== HERO (dark stage) ===================== */}
      <section id="top" className="hero">
        <IntroScene />
        <motion.div
          className="wrap hero-in"
          variants={stage}
          initial="hidden"
          animate={ready ? "show" : "hidden"}
        >
          <motion.div className="years" variants={fade}>
            <span className="num yr">{event.foundedYear}</span>
            <motion.span
              className="yr-line"
              initial={{ scaleX: 0 }}
              animate={ready ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.3, ease, delay: 0.5 }}
            />
            <span className="num yr">{event.anniversaryYear}</span>
          </motion.div>

          <motion.div className="anniv" variants={fade}>
            <Image
              src="/images/logos/anniv-20.png"
              alt="МТАА 20 жилийн ойн лого"
              width={1068}
              height={989}
              priority
              sizes="(max-width: 640px) 70vw, 420px"
            />
          </motion.div>

          <motion.p className="dept" variants={fade}>
            {event.dept}
          </motion.p>

          <motion.div className="hero-rule" variants={fade} />

          <motion.div className="invite" variants={fade}>
            <p className="greet">
              {guest.vip ? "Эрхэм хүндэт" : "Хүндэт"} <a className="text-gold">{guest.name}</a>

            </p>
            {guest.title ? <p className="role">{guest.title}</p> : null}
            <p className="line">{invitationLine}</p>
          </motion.div>

          <motion.div className="cta" variants={fade}>
            <a href="#rsvp" className="btn btn-gold">
              Нэгдэх эсэх
            </a>
            <a href="#detail" className="btn btn-line-light">
              Арга хэмжээний мэдээлэл
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ===================== DETAIL ===================== */}
      <section id="detail" className="band">
        <div className="wrap">
          <h2 className="h2">Үдэшлэгийн товч</h2>
          <div className="detail">
            <dl className="facts">
              <div className="fact">
                <dt>Огноо</dt>
                <dd>{event.dateLabel}</dd>
              </div>
              <div className="fact">
                <dt>Цаг</dt>
                <dd>{event.timeLabel}</dd>
              </div>
              <div className="fact">
                <dt>Байршил</dt>
                <dd>
                  {event.venue}
                  {event.address ? (
                    <span className="muted"> — {event.address}</span>
                  ) : null}
                </dd>
              </div>
              <div className="fact">
                <dt>Хувцаслалт</dt>
                <dd>{event.dress}</dd>
              </div>
              <div className="fact">
                <dt>Хариу өгөх</dt>
                <dd>{event.rsvpDeadlineLabel}</dd>
              </div>
            </dl>

            <div className="program">
              <h3 className="h3">Хөтөлбөр</h3>
              <ul>
                {event.program.map((p) => (
                  <li key={p.time}>
                    <span className="num ptime">{p.time}</span>
                    <span className="ptitle">{p.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== RSVP ===================== */}
      <section id="rsvp" className="band alt">
        <div className="wrap wrap-narrow">
          <h2 className="h2">Хүрэлцэн ирэх эсэх</h2>
          <p className="lead">
            Энэ урилга зөвхөн Танд зориулагдсан.
          </p>
          <RsvpForm slug={guest.slug} name={guest.name} initial={initial} />
        </div>
      </section>

      {/* ===================== HISTORY ===================== */}
      <section id="history" className="band">
        <div className="wrap">
          <h2 className="h2">Хорь жилийн замнал</h2>
          <p className="lead">
            1987 онд тавигдсан суурь өнөөдөр Улаанбаатар хотын усан хангамжийг
            бүрэн дижитал удирдлагатай болгосон. Гол тэмдэглэлт жилүүд:
          </p>
          <Timeline />
          <p className="more">
            <a
              className="link-underline"
              href="https://mtaa.vercel.app"
              target="_blank"
              rel="noreferrer"
            >
              Бүрэн түүхэн замналыг үзэх
            </a>
          </p>
        </div>
      </section>

      {/* ===================== TEAM ===================== */}
      <section id="team" className="band alt">
        <div className="wrap">
          <h2 className="h2">Хамт олон</h2>
          <p className="lead">
            Хорин жилийн замналыг бүтээсэн {event.deptShort}-ны мэргэшсэн баг —
            өнөөдөр 53 хүний бүрэлдэхүүнтэйгээр 200 гаруй цэгийн автоматжуулалтыг
            хариуцан ажиллаж байна.
          </p>
          <TeamGallery />
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="foot">
        <div className="wrap foot-in">
          <div>
            <div className="num foot20">{event.years}</div>
            <p className="foot-dept">{event.dept}</p>
            <p className="muted">
              {event.org}, {event.foundedYear}–{event.anniversaryYear}
            </p>
          </div>
          <div className="foot-contact">
            <p>{event.contactName}</p>
            <p className="muted">{event.contactPhone}</p>
            <p className="muted">{event.contactEmail}</p>
          </div>
        </div>
        <div className="wrap">
          <hr className="rule" />
          <div className="foot-bottom">
            <div className="foot-logos">
              <span className="logo-chip">
                <Image src="/images/logos/usug.webp" alt="Ус Сувгийн Удирдах Газар" width={40} height={40} />
              </span>
              <span className="logo-chip">
                <Image src="/images/logos/mtaa.jpg" alt="МТАА" width={40} height={40} />
              </span>
            </div>
            <p className="foot-fine">Энэ урилга {guest.name}-д зориулагдав.</p>



          </div>
        </div>
      </footer>

      <style jsx global>{`
        /* ---------- hero (dark stage) ---------- */
        .hero {
          position: relative;
          z-index: 1;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 96px 0 80px;
          background: var(--hero-bg);
          color: var(--hero-ink);
          overflow: hidden;
        }
        .hero-in {
          position: relative;
          z-index: 1;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .years {
          display: flex;
          align-items: center;
          gap: 18px;
          width: min(360px, 70%);
          margin-bottom: 6px;
          color: var(--hero-ink-2);
        }
        .yr {
          font-size: 16px;
          letter-spacing: 0.14em;
          color: var(--gold-bright);
        }
        .yr-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(243,210,122,0.5), transparent);
          transform-origin: center;
        }
        .anniv {
          width: clamp(240px, 42vw, 400px);
          margin: 6px 0 4px;
        }
        .anniv img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 18px 50px rgba(0, 0, 0, 0.5));
        }
        .dept {
          font-size: clamp(13px, 2vw, 16px);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--hero-ink-2);
          max-width: 560px;
          line-height: 1.5;
        }
        .hero-rule {
          width: 54px;
          height: 2px;
          margin: 28px 0 24px;
          background: linear-gradient(90deg, transparent, var(--gold-bright), transparent);
        }
        .invite {
          max-width: 540px;
        }
        .greet {
          font-size: clamp(19px, 3vw, 24px);
          font-weight: 700;
          margin-bottom: 4px;
          color: #fff;
        }
        .role {
          font-size: 13.5px;
          color: var(--cyan);
          font-weight: 600;
          letter-spacing: 0.04em;
          margin-bottom: 14px;
        }
        .line {
          color: var(--hero-ink-2);
          font-size: 16px;
          line-height: 1.7;
        }
        .cta {
          margin-top: 34px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* ---------- bands ---------- */
        .band {
          position: relative;
          z-index: 1;
          padding: clamp(70px, 10vw, 120px) 0;
          border-top: 1px solid var(--line-2);
        }
        .band.alt {
          background: color-mix(in srgb, var(--paper-2) 75%, transparent);
        }
        .wrap-narrow {
          max-width: 680px;
        }
        .h2 {
          font-size: clamp(25px, 4vw, 36px);
          font-weight: 500;
          letter-spacing: -0.02em;
          margin-bottom: 34px;
        }
        .h3 {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 18px;
          color: var(--ink);
        }
        .lead {
          color: var(--ink-2);
          font-size: 17px;
          line-height: 1.7;
          max-width: 620px;
          margin: -16px 0 34px;
        }
        .muted {
          color: var(--ink-3);
        }

        /* ---------- detail ---------- */
        .detail {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 56px;
        }
        @media (max-width: 760px) {
          .detail {
            grid-template-columns: 1fr;
            gap: 44px;
          }
        }
        .facts {
          margin: 0;
        }
        .fact {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid var(--line-2);
        }
        .fact:last-child {
          border-bottom: 1px solid var(--line-2);
        }
        .fact dt {
          color: var(--ink-3);
          font-size: 14px;
          padding-top: 2px;
        }
        .fact dd {
          margin: 0;
          font-size: 17px;
          font-weight: 500;
          line-height: 1.45;
        }
        .program ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .program li {
          display: flex;
          gap: 18px;
          align-items: baseline;
          padding: 13px 0;
          border-top: 1px solid var(--line-2);
        }
        .program li:first-child {
          border-top: 0;
        }
        .ptime {
          color: var(--accent);
          font-size: 17px;
          min-width: 52px;
        }
        .ptitle {
          font-size: 16px;
          color: var(--ink);
        }

        .more {
          margin-top: 36px;
          font-size: 16px;
        }

        /* ---------- footer ---------- */
        .foot {
          position: relative;
          z-index: 1;
          padding: 80px 0 48px;
          border-top: 1px solid var(--line);
        }
        .foot-in {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .foot20 {
          font-size: 68px;
          font-weight: 300;
          line-height: 1;
          color: var(--ink);
        }
        .foot-dept {
          margin-top: 14px;
          font-weight: 600;
          font-size: 17px;
          max-width: 420px;
        }
        .foot-contact {
          text-align: right;
          font-size: 15px;
          line-height: 1.7;
        }
        @media (max-width: 620px) {
          .foot-contact {
            text-align: left;
          }
        }
        .foot-bottom {
          margin-top: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .foot-logos {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-chip {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid var(--line-2);
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .logo-chip img {
          display: block;
          width: 40px;
          height: 40px;
          object-fit: contain;
        }
        .foot-fine {
          color: var(--ink-3);
          font-size: 14px;
        }
      `}</style>
    </>
  );
}
