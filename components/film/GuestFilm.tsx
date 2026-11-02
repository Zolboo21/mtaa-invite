import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Personal 9 s film rendered live in the page with @remotion/player
 * (also registered in remotion/ Studio as "guest-film" for editing).
 * Every guest sees their own name animate in.
 */
export type GuestFilmProps = { name: string; vip?: boolean; dateLabel: string };

export const GUEST_FILM = { fps: 30, durationInFrames: 270, width: 1080, height: 1350 };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const GOLD = "#f6dd8f";
const FONT = "var(--font-sans, Montserrat), Montserrat, system-ui, sans-serif";
const SERIF = "var(--font-serif, 'Playfair Display'), 'Playfair Display', Georgia, serif";

export const GuestFilm: React.FC<GuestFilmProps> = ({ name, vip, dateLabel }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const u = Math.min(width, height);

  // light sweep + slow push-in for depth
  const push = interpolate(frame, [0, durationInFrames], [1.08, 1], clamp);
  const sweep = interpolate(frame, [s(0.2), s(2.4)], [-0.4, 1.4], { ...clamp, easing: ease });
  const logo = spring({ frame: frame - s(0.4), fps, config: { damping: 200 } });
  const kicker = interpolate(frame, [s(1.6), s(2.3)], [0, 1], { ...clamp, easing: ease });
  const letters = Array.from(name);
  const nameStart = s(2.2);
  const lineP = interpolate(frame, [s(4.2), s(5.4)], [0, 1], { ...clamp, easing: ease });
  const tail = interpolate(frame, [s(5.2), s(6.2)], [0, 1], { ...clamp, easing: ease });
  const fadeOut = interpolate(frame, [durationInFrames - s(0.6), durationInFrames], [1, 0], clamp);
  const nameSize = Math.min(u * 0.15, (width * 0.86) / Math.max(4, letters.length * 0.62));

  return (
    <AbsoluteFill style={{ background: "#070c14", fontFamily: FONT, color: "#eef2f6", opacity: fadeOut }}>
      <AbsoluteFill style={{ scale: String(push) }}>
        {/* deep water gradient + caustic glows */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(30,167,230,0.28), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(233,194,95,0.18), transparent 70%), linear-gradient(180deg, #0b1624, #060a11)",
          }}
        />
        {/* rising sparks */}
        {Array.from({ length: 70 }, (_, i) => {
          const x = random(`x${i}`) * width;
          const sp = 0.4 + random(`s${i}`) * 0.8;
          const y = height * (1.1 - ((random(`y${i}`) + (frame / durationInFrames) * sp) % 1) * 1.2);
          const r = 1.5 + random(`r${i}`) * 4;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / 12 + i));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: r,
                height: r,
                borderRadius: "50%",
                background: GOLD,
                opacity: tw * 0.8,
                boxShadow: `0 0 ${r * 4}px ${GOLD}`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* light sweep */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sweep * 100 - 12}%, rgba(255,255,255,0.10) ${sweep * 100}%, transparent ${sweep * 100 + 12}%)`,
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", padding: `${height * 0.1}px ${width * 0.07}px`, textAlign: "center" }}>
        <Img
          src={staticFile("images/logos/anniv-20.png")}
          style={{
            width: u * 0.34,
            opacity: logo,
            translate: `0 ${(1 - logo) * 40}px`,
            filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.6))",
          }}
        />
        <div
          style={{
            marginTop: u * 0.07,
            fontSize: u * 0.032,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#9fb0c0",
            opacity: kicker,
          }}
        >
          {vip ? "Эрхэм хүндэт" : "Хүндэт"}
        </div>
        <div style={{ marginTop: u * 0.02, display: "flex", justifyContent: "center", flexWrap: "nowrap" }}>
          {letters.map((ch, i) => {
            const p = spring({ frame: frame - nameStart - i * 2, fps, config: { damping: 14, mass: 0.6 } });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontSize: nameSize,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  whiteSpace: "pre",
                  opacity: Math.min(1, p * 1.4),
                  translate: `0 ${(1 - p) * nameSize * 0.6}px`,
                  filter: `blur(${(1 - Math.min(1, p)) * 10}px)`,
                  backgroundImage: `linear-gradient(180deg, #ffffff 30%, ${GOLD})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div
          style={{
            width: u * 0.5 * lineP,
            height: 2,
            margin: `${u * 0.045}px 0`,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          }}
        />
        <div style={{ opacity: tail, translate: `0 ${(1 - tail) * 24}px`, fontSize: u * 0.038, lineHeight: 1.4, maxWidth: width * 0.8 }}>
          Таныг <b style={{ color: GOLD }}>20 жилийн ойн</b> хүндэтгэлийн үдэшлэгт урьж байна
        </div>
        <div
          style={{
            position: "absolute",
            bottom: height * 0.08,
            left: 0,
            right: 0,
            opacity: tail,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: u * 0.06,
            color: GOLD,
          }}
        >
          {dateLabel}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
