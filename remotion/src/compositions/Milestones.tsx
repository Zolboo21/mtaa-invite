import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { milestones } from "../../../data/timeline";
import { HeroLoop } from "./HeroLoop";
import { C, FONT } from "../theme";

// Same key years as components/Timeline.tsx on the site.
export const KEY_YEARS = ["1987", "2005", "2006", "2008–2009", "2013", "2014", "2018–2019"];
export const MILESTONE_SECONDS = 1.8;

const items = KEY_YEARS.map((y) => milestones.find((m) => m.year === y)!).filter(Boolean);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const Card: React.FC<{ year: string; title: string; text: string }> = ({ year, title, text }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height);
  const len = Math.round(MILESTONE_SECONDS * fps);
  const inP = interpolate(frame, [0, Math.round(0.5 * fps)], [0, 1], { ...clamp, easing: ease });
  const outP = interpolate(frame, [len - Math.round(0.35 * fps), len], [0, 1], { ...clamp, easing: ease });
  const vertical = height > width;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: `0 ${width * 0.08}px`,
        opacity: 1 - outP,
        translate: `${-outP * u * 0.06}px 0`,
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontSize: u * (vertical ? 0.2 : 0.24),
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: year === "2006" ? C.goldBright : C.ink,
            translate: `0 ${(1 - inP) * 100}%`,
          }}
        >
          {year}
        </div>
      </div>
      <div
        style={{
          marginTop: u * 0.025,
          fontSize: u * 0.05,
          fontWeight: 700,
          color: C.cyan,
          opacity: inP,
          translate: `${(1 - inP) * 40}px 0`,
          maxWidth: width * 0.8,
        }}
      >
        {title.replace(" ★", "")}
      </div>
      <div
        style={{
          marginTop: u * 0.015,
          fontSize: u * 0.026,
          lineHeight: 1.5,
          color: C.ink2,
          maxWidth: Math.min(width * 0.84, u * 1.3),
          opacity: interpolate(frame, [Math.round(0.2 * fps), Math.round(0.7 * fps)], [0, 1], clamp),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Milestones: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const len = Math.round(MILESTONE_SECONDS * fps);
  const u = Math.min(width, height);
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.ink }}>
      <HeroLoop />
      <AbsoluteFill style={{ background: "rgba(10,13,17,0.45)" }} />
      {items.map((m, i) => (
        <Sequence key={m.year} from={i * len} durationInFrames={len} premountFor={fps}>
          <Card year={m.year} title={m.title} text={m.text} />
        </Sequence>
      ))}

      {/* timeline rail */}
      <div
        style={{
          position: "absolute",
          left: width * 0.08,
          right: width * 0.08,
          bottom: height * 0.1,
          height: 2,
          background: "rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ width: `${progress * 100}%`, height: "100%", background: C.cyan }} />
        {items.map((m, i) => {
          const at = i / items.length;
          const active = progress >= at;
          return (
            <div
              key={m.year}
              style={{
                position: "absolute",
                left: `${at * 100}%`,
                top: -u * 0.008,
                width: u * 0.018,
                height: u * 0.018,
                marginLeft: -u * 0.009,
                borderRadius: "50%",
                background: active ? C.cyan : C.bg,
                border: `2px solid ${active ? C.cyan : "rgba(255,255,255,0.3)"}`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const milestonesDuration = (fps: number) => items.length * Math.round(MILESTONE_SECONDS * fps);
