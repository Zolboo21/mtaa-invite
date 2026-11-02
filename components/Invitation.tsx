"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import RsvpForm from "./RsvpForm";
import Timeline from "./Timeline";
import TeamGallery from "./TeamGallery";
import ScrubStory from "./ScrubStory";
import WaterHero from "./WaterHero";
import GuestBeat from "./GuestBeat";
import EventDetails from "./EventDetails";
import Directions from "./Directions";
import YearRibbon from "./YearRibbon";
import TeamHero from "./TeamHero";
import ScrollHint from "./ScrollHint";
import { Grain, Nav } from "./chrome";
import { Cursor, Label, Scramble, ScrollRuler, SmoothScroll } from "./fx";
import { Marquee, Reveal, SplitText, ease } from "./motion";
import { event } from "@/data/event";

type Guest = {
  slug: string;
  name: string;
  title?: string;
  note?: string;
  vip?: boolean;
};

type Existing = { status: "yes" | "no"; message?: string } | null;

const sections = [
  { id: "top", label: "Нүүр" },
  { id: "invite", label: "Урилга" },
  { id: "story", label: "Түүх" },
  { id: "detail", label: "Үдэшлэг" },
  { id: "work", label: "Ажил" },
  { id: "history", label: "Замнал" },
  { id: "team", label: "Хамт олон" },
  { id: "rsvp", label: "Хариу" },
];

const ticker = [
  `${event.deptShort}`,
  `${event.years} жил`,
  `${event.foundedYear} — ${event.anniversaryYear}`,
  "Ус",
  "Өгөгдөл",
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
  const invitationLine = guest.note || event.invitationText;

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const copyY = useTransform(heroP, [0, 1], ["0%", "60%"]);
  const copyFade = useTransform(heroP, [0, 0.5], [1, 0]);

  return (
    <>
      <SmoothScroll />
      <Cursor />
      <Grain />
      <Nav />
      <ScrollRuler sections={sections} />

      {/* ===================== HERO: live water + particle "20" ===================== */}
      <section id="top" className="hero" ref={heroRef}>
        <WaterHero />
        <h1 className="sr-only">
          {event.deptShort} — {event.heroTitle}
        </h1>

        <motion.div className="hero-copy" style={{ y: copyY, opacity: copyFade }}>
          <h2 className="hero-word">
            <SplitText text="ЖИЛИЙН ОЙ" delay={0.6} stagger={0.05} />
          </h2>
          <motion.p
            className="hero-dept"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.3 }}
          >
            <span className="wordmark">
              Мэдээллийн технологи, <span className="g1">автоматжуулалтын</span> <span className="g2">алба</span>
            </span>
          </motion.p>
        </motion.div>

        <ScrollHint target="#invite" />

        <motion.div
          className="hero-foot"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 1.6 }}
          style={{ opacity: copyFade }}
        >
          <div>
            <span className="hf-k">[ Он ]</span>
            <Scramble text={`${event.foundedYear} — ${event.anniversaryYear}`} />
          </div>
          <span />
          <div className="hf-r">
            <span className="hf-k">[ Үдэшлэг ]</span>
            <Scramble text={`2026.12.04 · ${event.venue}`} />
          </div>
        </motion.div>
      </section>

      <GuestBeat guest={guest} line={invitationLine} />

      <Marquee items={ticker} speed={60} />

      <ScrubStory />

      <EventDetails />

      <Directions />

      {/* ===================== HISTORY ===================== */}
      <section id="history" className="band">
        <div className="wrap-xl">
          <Label n="02">ЗАМНАЛ</Label>
          <h2 className="h2">
            <SplitText text="Хорь жилийн замнал" inView stagger={0.025} />
          </h2>
          <Reveal>
            <p className="lead">
              1987 онд тавигдсан суурь өнөөдөр Улаанбаатар хотын усан хангамжийг
              бүрэн дижитал удирдлагатай болгосон.
            </p>
          </Reveal>
          <Timeline />
          <YearRibbon />
          <p className="more">
            <a className="link-underline" href="https://mtaa.vercel.app" target="_blank" rel="noreferrer">
              Бүрэн түүхэн замналыг үзэх →
            </a>
          </p>
        </div>
      </section>

      {/* ===================== TEAM ===================== */}
      <section id="team" className="team-sec">
        <div className="wrap-xl team-head">
          <Label n="03">ХАМТ ОЛОН</Label>
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
        <TeamHero />
        <TeamGallery />
      </section>

      {/* ===================== RSVP: final scene ===================== */}
      <section id="rsvp" className="band seam finale">
        <div className="finale-glow" aria-hidden />
        <div className="wrap wrap-narrow">
          <Label n="04">ХАРИУ</Label>
          <h2 className="h2">
            <SplitText text="Хүрэлцэн ирэх үү?" inView stagger={0.03} />
          </h2>
          <Reveal>
            <p className="lead">
              Энэ урилга зөвхөн {guest.name}-д зориулагдсан. {event.rsvpDeadlineLabel} хариу өгнө үү.
            </p>
            <RsvpForm slug={guest.slug} name={guest.name} initial={initial} />
          </Reveal>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="foot">
        <div className="foot-giant" aria-hidden>
          <SplitText text={event.deptShort} inView stagger={0.08} />
        </div>
        <div className="wrap-xl foot-in">
          <div>
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
        <div className="wrap-xl">
          <hr className="rule" />
          <div className="foot-bottom">
            <div className="foot-logos">
              <span className="logo-chip">
                <Image src="/images/logos/usug.webp" alt="Ус Сувгийн Удирдах Газар" width={40} height={40} />
              </span>
              <span className="logo-chip">
                <Image src="/images/mtaa/mtan.png" alt="МТАН" width={40} height={40} />
              </span>
            </div>
            <p className="foot-fine">Энэ урилга {guest.name}-д зориулагдав.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        /* ---------- hero ---------- */
        .hero {
          position: relative;
          z-index: 1;
          height: 100svh;
          min-height: 560px;
          background: #070c14;
          color: var(--hero-ink);
          overflow: hidden;
        }
        .water-hero {
          position: absolute;
          inset: 0;
        }
        .water-hero canvas {
          display: block;
        }
        .hero .vbg {
          position: absolute;
          inset: 0;
        }
        .hero-copy {
          position: absolute;
          left: 0;
          right: 0;
          top: 65%;
          text-align: center;
          pointer-events: none;
        }
        .hero-word {
          font-size: clamp(30px, 5vw, 72px);
          font-weight: 800;
          letter-spacing: 0.18em;
          margin-right: -0.18em;
          line-height: 1;
          justify-content: center;
          display: flex;
        }
        .hero-word .split {
          column-gap: 0.5em;
        }
        .hero-dept {
          margin-top: 14px;
          font-family: var(--font-mono);
          font-size: clamp(10.5px, 1vw, 12.5px);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-2);
          padding: 0 20px;
        }
        .hero-foot {
          position: absolute;
          left: clamp(22px, 4vw, 56px);
          right: clamp(22px, 4vw, 56px);
          bottom: 26px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--ink);
        }
        .hero-foot > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hero-foot .hf-r {
          text-align: right;
        }
        .hf-k {
          color: var(--ink-3);
          letter-spacing: 0.08em;
        }
        .scroll-cue {
          position: relative;
          display: block;
          width: 26px;
          height: 42px;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          border-radius: 14px;
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
        @media (max-width: 640px) {
          .hero-copy {
            top: 56%;
          }
          .hero-foot {
            font-size: 10.5px;
          }
        }

        /* ---------- shared ---------- */
        .band {
          position: relative;
          z-index: 1;
          padding: clamp(90px, 12vw, 160px) 0;
        }
        .wrap-xl {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 clamp(22px, 4vw, 56px);
        }
        .wrap-narrow {
          max-width: 760px;
        }
        .h2 {
          font-size: var(--fs-h2);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1;
          margin-bottom: 28px;
        }
        .lead {
          color: var(--ink-2);
          font-size: var(--fs-lead);
          line-height: 1.65;
          max-width: 600px;
          margin: 0 0 clamp(36px, 5vw, 56px);
        }
        .muted {
          color: var(--ink-3);
        }
        .more {
          margin-top: 40px;
          font-size: 16px;
        }
        .team-sec {
          position: relative;
          z-index: 1;
          padding-top: clamp(90px, 12vw, 160px);
          background: #070c14;
        }

        /* ---------- finale ---------- */
        .finale {
          overflow: hidden;
        }
        .finale-glow {
          position: absolute;
          left: 50%;
          top: 0;
          width: 1100px;
          height: 700px;
          translate: -50% -40%;
          background: radial-gradient(ellipse, rgba(246, 221, 143, 0.14), transparent 65%);
          pointer-events: none;
        }

        /* ---------- footer ---------- */
        .foot {
          position: relative;
          z-index: 1;
          padding: 40px 0 48px;
          background: #070c14;
        }
        .foot-in {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .foot-dept {
          font-weight: 600;
          font-size: 17px;
          max-width: 420px;
          margin-bottom: 6px;
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
          gap: 12px;
        }
        .logo-chip {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #fff;
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .logo-chip img {
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
