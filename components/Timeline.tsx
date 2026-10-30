"use client";

import { milestones } from "@/data/timeline";
import { event } from "@/data/event";

// Гол тэмдэглэлт жилүүд (бүрэн 20 үйл явдал mtaa.vercel.app дээр байгаа)
const keyYears = ["1987", "2005", "2006", "2008–2009", "2013", "2014", "2018–2019"];

const items = keyYears
  .map((y) => milestones.find((m) => m.year === y))
  .filter(Boolean) as typeof milestones;

export default function Timeline() {
  return (
    <div className="tl">
      {items.map((m) => {
        const founding = m.year === String(event.foundedYear);
        return (
          <div className="row" key={m.year} data-founding={founding}>
            <div className="num yr">{m.year}</div>
            <div className="body">
              <h3 className="t">
                {m.title.replace(" ★", "")}
                {founding && <span className="tag">Албаны үүсэл</span>}
              </h3>
              <p className="d">{m.text}</p>
            </div>
          </div>
        );
      })}

      <style jsx global>{`
        .tl {
          margin-top: 6px;
        }
        .tl .row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 28px;
          padding: 26px 0;
          border-top: 1px solid var(--line-2);
          align-items: start;
        }
        .tl .row:first-child {
          border-top: 1px solid var(--line);
        }
        .tl .yr {
          font-size: 24px;
          color: var(--ink);
          padding-top: 2px;
        }
        .tl .row[data-founding="true"] .yr {
          color: var(--accent);
        }
        .tl .t {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .tl .tag {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
          border-radius: 4px;
          padding: 2px 8px;
        }
        .tl .d {
          color: var(--ink-2);
          font-size: 15.5px;
          line-height: 1.65;
          max-width: 640px;
        }
        @media (max-width: 620px) {
          .tl .row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
