"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import RsvpForm from "./RsvpForm";
import Timeline from "./Timeline";
import TeamGallery from "./TeamGallery";
import ScrubStory from "./ScrubStory";
import { Cursor, Label, Scramble, ScrollRuler, SmoothScroll } from "./fx";
import { Counter, Marquee, Reveal, SplitText, VideoBg, ease } from "./motion";
import { event } from "@/data/event";
import { stats } from "@/data/team";

type Guest = {
  slug: string;
  name: string;
  title?: string;
  note?: string;
  vip?: boolean;
};

type Existing = { status: "yes" | "no"; message?: string } | null;

const sections = [
  { id: "top", label: "Урилга" },
  { id: "story", label: "Түүх" },
  { id: "detail", label: "Үдэшлэг" },
  { id: "rsvp", label: "Хариу" },
  { id: "history", label: "Замнал" },
  { id: "team", label: "Хамт олон" },
];

const ticker = [
  `${event.deptShort}`,
  `${event.years} жил`,
  `${event.foundedYear} — ${event.anniversaryYear}`,
  "Ус",
  "Дата",
  "Автоматжуулалт",
  "SCADA",
  "Хамт олон",
];

export default function Invitation({
  guest,
  initial,
}: {
  guest: Guest;
  initial: Existing;
}) {
  const invitationLine =
    guest.note ||
    `${event.org}-ын ${event.dept} үүсэн байгуулагдсаны ${event.years} жилийн ойн хүндэтгэлийн үдэшлэгт Таныг хүрэлцэн ирэхийг урьж байна.`;

  // hero: content drifts up and fades as you scroll away, video slowly zooms
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroP, [0, 1], ["0%", "-18%"]);
  const heroFade = useTransform(heroP, [0, 0.7], [1, 0]);
  const heroZoom = useTransform(heroP, [0, 1], [1, 1.15]);
  const giantY = useTransform(heroP, [0, 1], ["0%", "40%"]);

  // film band: framed video grows to full bleed while scrolling through
  const filmRef = useRef<HTMLElement>(null);
  const { scrollYProgress: filmP } = useScroll({ target: filmRef, offset: ["start end", "center center"] });
  const filmScale = useTransform(filmP, [0, 1], [0.82, 1]);
  const filmRadius = useTransform(filmP, [0, 1], [28, 0]);

  return (
    <>
      <SmoothScroll />
      <Cursor />
      <ScrollRuler sections={sections} />

      {/* ===================== HERO (video stage) ===================== */}
      <section id="top" className="hero" ref={heroRef}>
        <motion.div className="hero-media" style={{ scale: heroZoom }}>
          <VideoBg name="hero-loop" verticalName="hero-loop-vertical" />
        </motion.div>
        <div className="hero-shade" />

        <div className="hero-meta wrap-wide">
          <div>
            <span>[ Огноо ]</span>
            <Scramble text="2026.12.04 · 18:00" />
          </div>
          <div>
            <span>[ Байршил ]</span>
            <Scramble text={event.venue} />
          </div>
          <div>
            <span>[ Он ]</span>
            <Scramble text={`${event.foundedYear} — ${event.anniversaryYear}`} />
          </div>
        </div>

        <motion.div className="wrap hero-in" style={{ y: heroY, opacity: heroFade }}>
          <motion.div
            className="anniv"
            initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease, delay: 0.3 }}
          >
            <Image
              src="/images/logos/anniv-20.png"
              alt="МТАА 20 жилийн ойн лого"
              width={1068}
              height={989}
              priority
              sizes="(max-width: 640px) 40vw, 200px"
            />
          </motion.div>

          <motion.p
            className="dept"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.3 }}
          >
            {event.dept}
          </motion.p>

          <motion.div
            className="invite"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.55 }}
          >
            <p className="greet">
              {guest.vip ? "Эрхэм хүндэт" : "Хүндэт"} <span className="text-gold">{guest.name}</span>
            </p>
            {guest.title ? <p className="role">{guest.title}</p> : null}
            <p className="line">{invitationLine}</p>
          </motion.div>

          <motion.div
            className="cta"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.8 }}
          >
            <a href="#rsvp" className="btn btn-gold btn-glow">
              Нэгдэх эсэх
            </a>
            <a href="#detail" className="btn btn-line-light">
              Арга хэмжээний мэдээлэл
            </a>
          </motion.div>
        </motion.div>

        <motion.h1 className="hero-giant" style={{ y: giantY }} aria-label={event.heroTitle}>
          <SplitText text="20 ЖИЛ" delay={0.5} stagger={0.07} />
        </motion.h1>

        <motion.a
          href="#story"
          className="scroll-cue"
          aria-label="Доош гүйлгэх"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
        >
          <span />
        </motion.a>
      </section>

      <Marquee items={ticker} />

      {/* ===================== STATS ===================== */}
      <section className="band stats-band">
        <div className="wrap stats">
          {stats.map((s, i) => (
            <Reveal key={s.label} className="stat" delay={i * 0.08}>
              <div className="num stat-v">
                <Counter value={s.value} />
              </div>
              <div className="stat-l">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <ScrubStory />

      {/* ===================== DETAIL ===================== */}
      <section id="detail" className="band">
        <div className="wrap">
          <Label n="01">ҮДЭШЛЭГ</Label>
          <h2 className="h2">
            <SplitText text="Үдэшлэгийн товч" inView stagger={0.025} />
          </h2>
          <div className="detail">
            <dl className="facts">
              {[
                ["Огноо", event.dateLabel],
                ["Цаг", event.timeLabel],
                ["Байршил", null],
                ["Хувцаслалт", event.dress],
                ["Хариу өгөх", event.rsvpDeadlineLabel],
              ].map(([k, v], i) => (
                <Reveal key={k} className="fact" delay={i * 0.06} y={18}>
                  <dt>{k}</dt>
                  <dd>
                    {v ?? (
                      <>
                        {event.venue}
                        {event.address ? <span className="muted"> — {event.address}</span> : null}
                      </>
                    )}
                  </dd>
                </Reveal>
              ))}
            </dl>

            <Reveal className="program" delay={0.15}>
              <h3 className="h3">Хөтөлбөр</h3>
              <ul>
                {event.program.map((p) => (
                  <li key={p.time}>
                    <span className="num ptime">{p.time}</span>
                    <span className="ptitle">{p.title}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== FILM (Remotion "20 жил") ===================== */}
      <section className="film" ref={filmRef}>
        <motion.div className="film-frame" style={{ scale: filmScale, borderRadius: filmRadius }}>
          <VideoBg name="title-20" />
        </motion.div>
      </section>

      {/* ===================== RSVP ===================== */}
      <section id="rsvp" className="band seam">
        <div className="wrap wrap-narrow">
          <Label n="02">ХАРИУ</Label>
          <h2 className="h2">
            <SplitText text="Хүрэлцэн ирэх эсэх" inView stagger={0.025} />
          </h2>
          <Reveal>
            <p className="lead">Энэ урилга зөвхөн Танд зориулагдсан.</p>
            <RsvpForm slug={guest.slug} name={guest.name} initial={initial} />
          </Reveal>
        </div>
      </section>

      {/* ===================== HISTORY ===================== */}
      <section id="history" className="band">
        <div className="wrap">
          <Label n="03">ЗАМНАЛ</Label>
          <h2 className="h2">
            <SplitText text="Хорь жилийн замнал" inView stagger={0.025} />
          </h2>
          <Reveal>
            <p className="lead">
              1987 онд тавигдсан суурь өнөөдөр Улаанбаатар хотын усан хангамжийг
              бүрэн дижитал удирдлагатай болгосон. Гол тэмдэглэлт жилүүд:
            </p>
          </Reveal>
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

      <Marquee items={ticker.slice().reverse()} reverse speed={50} />

      {/* ===================== TEAM ===================== */}
      <section id="team" className="band alt">
        <div className="wrap">
          <Label n="04">ХАМТ ОЛОН</Label>
          <h2 className="h2">
            <SplitText text="Хамт олон" inView stagger={0.03} />
          </h2>
          <Reveal>
            <p className="lead">
              Хорин жилийн замналыг бүтээсэн {event.deptShort}-ны мэргэшсэн баг —
              өнөөдөр 53 хүний бүрэлдэхүүнтэйгээр 200 гаруй цэгийн автоматжуулалтыг
              хариуцан ажиллаж байна.
            </p>
          </Reveal>
        </div>
        <TeamGallery />
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="foot">
        <div className="foot-giant" aria-hidden>
          <SplitText text={event.deptShort} inView stagger={0.08} />
        </div>
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
        /* ---------- hero (video stage) ---------- */
        .hero {
          position: relative;
          z-index: 1;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 96px 0 110px;
          background: var(--hero-bg);
          color: var(--hero-ink);
          overflow: hidden;
        }
        .hero-media {
          position: absolute;
          inset: 0;
        }
        .hero-shade {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 45%, rgba(16, 20, 25, 0.15), rgba(16, 20, 25, 0.75) 80%),
            linear-gradient(180deg, transparent 60%, var(--paper));
        }
        .hero-in {
          position: relative;
          z-index: 1;
          max-width: 980px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .years {
          display: flex;
          align-items: center;
          gap: 18px;
          width: min(360px, 70%);
          margin-bottom: 10px;
        }
        .yr {
          font-size: 16px;
          letter-spacing: 0.14em;
          color: var(--gold-bright);
        }
        .yr-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(243, 210, 122, 0.6), transparent);
          transform-origin: center;
        }
        .anniv {
          width: clamp(150px, 22vw, 230px);
          margin: 8px 0 6px;
        }
        .anniv img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 18px 50px rgba(0, 0, 0, 0.5));
        }
        .hero-title {
          font-size: clamp(44px, 10vw, 128px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 0.95;
          justify-content: center;
          display: flex;
          margin: 8px 0 18px;
          text-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
        }
        .hero-title .split-c {
          background: linear-gradient(180deg, #fff 35%, var(--gold-bright) 130%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .dept {
          font-size: clamp(12px, 1.8vw, 15px);
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--hero-ink-2);
          max-width: 560px;
          line-height: 1.5;
          margin-bottom: 26px;
        }
        .invite {
          max-width: 560px;
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
        .btn-glow {
          box-shadow: 0 0 0 0 rgba(246, 221, 143, 0.5);
          animation: glow 2.6s ease-out infinite;
        }
        .btn-glow:hover {
          transform: translateY(-2px);
        }
        @keyframes glow {
          0% { box-shadow: 0 0 0 0 rgba(246, 221, 143, 0.45); }
          70% { box-shadow: 0 0 0 16px rgba(246, 221, 143, 0); }
          100% { box-shadow: 0 0 0 0 rgba(246, 221, 143, 0); }
        }
        .scroll-cue {
          position: absolute;
          left: 50%;
          bottom: 28px;
          translate: -50% 0;
          width: 26px;
          height: 42px;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          border-radius: 14px;
          z-index: 2;
        }
        .scroll-cue span {
          position: absolute;
          left: 50%;
          top: 8px;
          width: 4px;
          height: 8px;
          margin-left: -2px;
          border-radius: 2px;
          background: var(--gold-bright);
          animation: cue 1.8s ease-in-out infinite;
        }
        @keyframes cue {
          0% { opacity: 0; transform: translateY(0); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(14px); }
        }

        /* ---------- stats ---------- */
        .stats-band {
          border-top: 0;
          padding: clamp(56px, 8vw, 96px) 0;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 760px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 40px;
          }
        }
        .stat-v {
          font-size: clamp(44px, 7vw, 84px);
          font-weight: 300;
          line-height: 1;
          letter-spacing: -0.03em;
          background: linear-gradient(180deg, var(--ink), var(--cyan));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .stat-l {
          margin-top: 10px;
          color: var(--ink-2);
          font-size: 14px;
          max-width: 180px;
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
          font-size: clamp(32px, 6vw, 64px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
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
          margin: -10px 0 34px;
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
          transition: background 0.3s ease, padding 0.3s ease;
        }
        .fact:hover {
          background: linear-gradient(90deg, rgba(70, 198, 242, 0.06), transparent);
          padding-left: 10px;
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
          transition: transform 0.3s ease;
        }
        .program li:hover {
          transform: translateX(6px);
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

        /* ---------- film ---------- */
        .film {
          position: relative;
          z-index: 1;
          padding: 0 0 clamp(40px, 6vw, 80px);
        }
        .film-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 100svh;
          overflow: hidden;
          margin: 0 auto;
        }

        /* ---------- history reel ---------- */
        .reel {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 40px;
          border: 1px solid var(--line);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
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
          font-size: clamp(96px, 16vw, 200px);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.05em;
          background: linear-gradient(180deg, var(--gold-bright), var(--gold) 60%, #a77a26);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
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
          align-self: flex-end;
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
