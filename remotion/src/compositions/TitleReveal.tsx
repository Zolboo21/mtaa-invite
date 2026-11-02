import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HeroLoop } from "./HeroLoop";
import { C, FONT } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** "2006 → 2026" counter, a big masked "20", "ЖИЛ", then the anniversary logo. */
export const TitleReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height);
  const s = (sec: number) => Math.round(sec * fps);

  const year = Math.round(
    interpolate(frame, [s(0.3), s(2.2)], [2006, 2026], { ...clamp, easing: ease }),
  );
  const counterOut = interpolate(frame, [s(2.6), s(3.1)], [1, 0], clamp);

  const big = spring({ frame: frame - s(2.7), fps, config: { damping: 200 } });
  const word = spring({ frame: frame - s(3.1), fps, config: { damping: 200 } });
  const line = interpolate(frame, [s(3.3), s(4.3)], [0, 1], { ...clamp, easing: ease });
  const dept = interpolate(frame, [s(3.8), s(4.6)], [0, 1], { ...clamp, easing: ease });
  const logo = spring({ frame: frame - s(5.6), fps, config: { damping: 18, mass: 0.8 } });
  const textOut = interpolate(frame, [s(5.2), s(5.8)], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.ink }}>
      <HeroLoop />

      {/* counter */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: counterOut }}>
        <div style={{ fontSize: u * 0.06, letterSpacing: "0.3em", color: C.ink2, fontWeight: 500 }}>
          ОН
        </div>
        <div style={{ fontSize: u * 0.26, fontWeight: 300, color: C.goldBright, fontVariantNumeric: "tabular-nums" }}>
          {year}
        </div>
      </AbsoluteFill>

      {/* 20 ЖИЛ */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: textOut }}>
        <div style={{ overflow: "hidden", lineHeight: 0.9 }}>
          <div
            style={{
              fontSize: u * 0.5,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              translate: `0 ${(1 - big) * 100}%`,
              backgroundImage: `linear-gradient(180deg, ${C.goldBright}, ${C.gold} 60%, #b8862a)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            20
          </div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontSize: u * 0.09,
              fontWeight: 700,
              letterSpacing: "0.5em",
              marginRight: "-0.5em",
              translate: `0 ${(1 - word) * 110}%`,
            }}
          >
            ЖИЛ
          </div>
        </div>
        <div
          style={{
            width: u * 0.5 * line,
            height: 2,
            margin: `${u * 0.03}px 0`,
            background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
          }}
        />
        <div
          style={{
            fontSize: u * 0.03,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.ink2,
            opacity: dept,
            translate: `0 ${(1 - dept) * 20}px`,
            textAlign: "center",
            maxWidth: width * 0.85,
          }}
        >
          Мэдээллийн технологи, автоматжуулалтын алба
        </div>
      </AbsoluteFill>

      {/* logo */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img
          src={staticFile("images/logos/anniv-20.png")}
          style={{
            width: u * 0.55,
            opacity: Math.min(1, logo * 1.5),
            scale: String(0.7 + 0.3 * logo),
            filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.6))",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
