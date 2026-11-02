"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Label } from "./fx";
import { SplitText, ease } from "./motion";

/**
 * "What we do" — the department's directions (from the main MTAA site,
 * github.com/WSnSA/MTAA pages/Chiglel). Photos are the department's own.
 */
const items = [
  {
    n: "01",
    title: "Автоматжуулалт · SCADA",
    text: "Худаг, насос станц, усан сангуудыг хүний оролцоогүй алсаас удирдах SCADA, PLC, телеметрийн систем.",
    stat: "200+",
    statL: "цэг салбар",
    color: "#7ed56f",
    img: "/images/mtaa/scada-city.png",
  },
  {
    n: "02",
    title: "Камерын нэгдсэн хяналт",
    text: "Үйлдвэрлэлийг удирдах төвд нэгтгэгдсэн, шилэн кабелийн бие даасан сүлжээтэй хяналтын систем.",
    stat: "650",
    statL: "камер",
    color: "#38bdf8",
    img: "/images/mtaa/camera-wall.jpg",
  },
  {
    n: "03",
    title: "Программ хангамж",
    text: "Автоматжуулалтын болон байгууллагын үйл ажиллагааны программуудыг өөрсдөө хөгжүүлж, ашиглалтад хариуцна.",
    stat: "79",
    statL: "программ",
    color: "#6094ea",
    img: "/images/mtaa/erp-portal.png",
    pos: "0% 0%",
    frame: true,
  },
  {
    n: "04",
    title: "Сүлжээ ба дата төв",
    text: "Серверийн өрөө, domain сүлжээ, GPRS-ээр холбогдсон 81 цэг салбар, мэдээллийн аюулгүй байдал.",
    stat: "81",
    statL: "GPRS цэг",
    color: "#06b6d4",
    img: "/images/mtaa/server-room.png",
    pos: "30% 40%",
  },
  {
    n: "05",
    title: "Хяналтын төв",
    text: "24/7 диспетчерийн хяналт — ханан дэлгэцээр хотын усан хангамжийг бодит цагт ажиглана.",
    stat: "24/7",
    statL: "хяналт",
    color: "#f6dd8f",
    img: "/images/mtaa/control-room.png",
    pos: "50% 28%",
  },
  {
    n: "06",
    title: "Ухаалаг ус түгээх",
    text: "Картаар ус олгодог 130 гаруй ухаалаг ус түгээх байр, зөөврийн усны 60 гаруй машины хяналт.",
    stat: "130+",
    statL: "ус түгээх байр",
    color: "#4caf50",
    img: "/images/mtaa/water-kiosk.png",
  },
];

export default function Directions() {
  return (
    <section id="work" className="dir">
      <div className="wrap-xl">
        <Label n="—">БИДНИЙ АЖИЛ</Label>
        <h2 className="h2">
          <SplitText text="Ус ба өгөгдөл — нэг баг" inView stagger={0.022} />
        </h2>

        <div className="dir-grid">
          {items.map((it, i) => (
            <motion.article
              key={it.n}
              className={`dir-card ${it.img ? "has-img" : ""}`}
              style={{ ["--c" as string]: it.color }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.9, ease, delay: (i % 3) * 0.08 }}
            >
              {it.img ? (
                <motion.div
                  className="dir-img"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 1.2, ease, delay: 0.2 }}
                >
                  {it.frame ? (
                    <div className="dir-browser">
                      <div className="dir-browser-bar">
                        <i />
                        <i />
                        <i />
                        <span>erp.usug.mn</span>
                      </div>
                      <div className="dir-browser-view">
                        <Image src={it.img} alt="УСУГ-ын дотоод ERP систем" fill sizes="(max-width: 860px) 100vw, 420px" style={{ objectFit: "cover", objectPosition: it.pos }} />
                      </div>
                    </div>
                  ) : (
                    <Image src={it.img} alt={it.title} fill sizes="(max-width: 860px) 100vw, 420px" style={{ objectFit: "cover", objectPosition: it.pos ?? "50% 50%" }} />
                  )}
                </motion.div>
              ) : null}
              <div className="dir-body">
                <div className="dir-top">
                  <span className="dir-n">{it.n}</span>
                  <span className="dir-stat">
                    <b>{it.stat}</b> {it.statL}
                  </span>
                </div>
                <h3 className="dir-t">{it.title}</h3>
                <p className="dir-d">{it.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .dir {
          position: relative;
          z-index: 1;
          padding: clamp(90px, 12vw, 160px) 0;
          background: var(--paper);
        }
        .dir-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .dir-card {
          position: relative;
          border-radius: 22px;
          border: 1px solid var(--line-2);
          background: rgba(255, 255, 255, 0.025);
          overflow: hidden;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          transition: border-color 0.4s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), background 0.4s ease;
        }
        .dir-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 0% 0%, var(--c), transparent 55%);
          opacity: 0.08;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .dir-card:hover {
          border-color: color-mix(in srgb, var(--c) 50%, transparent);
          transform: translateY(-5px);
        }
        .dir-card:hover::before {
          opacity: 0.2;
        }
        .dir-img {
          position: relative;
          height: clamp(170px, 16vw, 230px);
          flex-shrink: 0;
        }
        .dir-browser {
          position: absolute;
          left: 9%;
          right: -14%;
          top: 14%;
          bottom: -18%;
          border-radius: 10px;
          overflow: hidden;
          background: #e8eef5;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
          transform: perspective(900px) rotateY(-14deg) rotateX(6deg);
          transform-origin: left center;
          transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .dir-card:hover .dir-browser {
          transform: perspective(900px) rotateY(-6deg) rotateX(3deg);
        }
        .dir-browser-bar {
          height: 22px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px;
          background: #d5dde7;
        }
        .dir-browser-bar i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9aa8b8;
        }
        .dir-browser-bar span {
          margin-left: 8px;
          font-family: var(--font-mono);
          font-size: 9.5px;
          color: #5b6b7d;
        }
        .dir-browser-view {
          position: absolute;
          inset: 22px 0 0 0;
        }
        .dir-card:has(.dir-browser) .dir-img {
          background: radial-gradient(circle at 30% 30%, rgba(96, 148, 234, 0.35), transparent 70%);
          overflow: hidden;
        }
        .dir-img img {
          transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .dir-card:hover .dir-img img {
          transform: scale(1.05);
        }
        .dir-body {
          position: relative;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }
        .dir-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 14px;
        }
        .dir-n {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--c);
        }
        .dir-stat {
          font-size: 13px;
          color: var(--ink-3);
        }
        .dir-stat b {
          font-family: var(--font-display);
          font-weight: 700;
          font-variant-numeric: lining-nums tabular-nums;
          letter-spacing: -0.03em;
          font-weight: 400;
          font-size: 30px;
          color: var(--ink);
          margin-right: 4px;
        }
        .dir-t {
          font-size: clamp(19px, 1.7vw, 23px);
          font-weight: 700;
          letter-spacing: -0.015em;
        }
        .dir-d {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--ink-2);
        }
        @media (max-width: 960px) {
          .dir-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 620px) {
          .dir-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
