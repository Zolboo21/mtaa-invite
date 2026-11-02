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
 * 9 s anniversary film played live in the invite with @remotion/player
 * (also registered in remotion/ Studio as "guest-film").
 * The guest's name is shown once, next to this card on the page, so the film
 * carries the anniversary itself: logo -> the team at the control centre -> date.
 */
export type GuestFilmProps = { dateLabel: string };

export const GUEST_FILM = { fps: 30, durationInFrames: 270, width: 1080, height: 1350 };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const GOLD = "#f6dd8f";
const FONT = "var(--font-sans, Montserrat), Montserrat, system-ui, sans-serif";
const DISPLAY = "var(--font-display, 'Inter Tight'), 'Inter Tight', Montserrat, system-ui, sans-serif";

export const GuestFilm: React.FC<GuestFilmProps> = ({ dateLabel }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const u = Math.min(width, height);

  // beat 1: logo (0–2.6s)
  const logoIn = spring({ frame: frame - s(0.3), fps, config: { damping: 200 } });
  const logoOut = interpolate(frame, [s(2.3), s(2.9)], [1, 0], { ...clamp, easing: ease });
  const sweep = interpolate(frame, [s(0.4), s(2.2)], [-0.4, 1.4], { ...clamp, easing: ease });

  // beat 2: team photo at the SCADA wall, slow push-in (2.4–6.6s)
  const photoIn = interpolate(frame, [s(2.4), s(3.4)], [0, 1], { ...clamp, easing: ease });
  const photoOut = interpolate(frame, [s(6.2), s(6.9)], [1, 0], clamp);
  const kb = interpolate(frame, [s(2.4), s(7)], [1.18, 1.02], clamp);
  const pan = interpolate(frame, [s(2.4), s(7)], [-4, 3], clamp);
  const cap = interpolate(frame, [s(3.4), s(4.2)], [0, 1], { ...clamp, easing: ease });

  // beat 3: 20 жил + date (6.6–9s)
  const endIn = spring({ frame: frame - s(6.6), fps, config: { damping: 18, mass: 0.7 } });
  const dateIn = interpolate(frame, [s(7.2), s(7.9)], [0, 1], { ...clamp, easing: ease });
  const fadeOut = interpolate(frame, [durationInFrames - s(0.5), durationInFrames], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: "#070c14", fontFamily: FONT, color: "#eef2f6", opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(56,189,248,0.22), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(233,194,95,0.16), transparent 70%), linear-gradient(180deg, #0b1624, #060a11)",
        }}
      />

      {/* rising sparks */}
      {Array.from({ length: 60 }, (_, i) => {
        const x = random(`x${i}`) * width;
        const sp = 0.4 + random(`s${i}`) * 0.8;
        const y = height * (1.1 - ((random(`y${i}`) + (frame / durationInFrames) * sp) % 1) * 1.2);
        const r = 1.5 + random(`r${i}`) * 4;
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
              opacity: (0.4 + 0.6 * Math.abs(Math.sin(frame / 12 + i))) * 0.7,
              boxShadow: `0 0 ${r * 4}px ${GOLD}`,
            }}
          />
        );
      })}

      {/* beat 1 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: logoOut }}>
        <Img
          src={staticFile("images/logos/anniv-20.png")}
          style={{
            width: u * 0.62,
            opacity: logoIn,
            scale: String(0.9 + 0.1 * logoIn),
            filter: "drop-shadow(0 30px 70px rgba(0,0,0,0.6))",
          }}
        />
        <AbsoluteFill
          style={{
            background: `linear-gradient(105deg, transparent ${sweep * 100 - 10}%, rgba(255,255,255,0.12) ${sweep * 100}%, transparent ${sweep * 100 + 10}%)`,
          }}
        />
      </AbsoluteFill>

      {/* beat 2 */}
      <AbsoluteFill style={{ opacity: photoIn * photoOut }}>
        <AbsoluteFill style={{ overflow: "hidden", clipPath: `inset(${(1 - photoIn) * 20}% 0 ${(1 - photoIn) * 20}% 0)` }}>
          <Img
            src={staticFile("images/mtaa/control-center-team.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "50% 40%",
              scale: String(kb),
              translate: `${pan}% 0`,
            }}
          />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,12,20,0.1) 40%, rgba(7,12,20,0.92))" }} />
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: width * 0.08,
            right: width * 0.08,
            bottom: height * 0.08,
            opacity: cap,
            translate: `0 ${(1 - cap) * 30}px`,
          }}
        >
          <div style={{ fontSize: u * 0.026, letterSpacing: "0.2em", color: "#38bdf8", textTransform: "uppercase" }}>
            Үйл ажиллагааны хяналтын төв
          </div>
          <div style={{ fontSize: u * 0.07, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: u * 0.015 }}>
            Хорин жил, нэг баг
          </div>
        </div>
      </AbsoluteFill>

      {/* beat 3 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: Math.min(1, endIn * 1.3) }}>
        <div
          style={{
            fontSize: u * 0.42,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            translate: `0 ${(1 - endIn) * 60}px`,
            backgroundImage: `linear-gradient(180deg, #ffffff 25%, ${GOLD})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          20
        </div>
        <div style={{ fontSize: u * 0.05, fontWeight: 700, letterSpacing: "0.4em", marginRight: "-0.4em", marginTop: u * 0.02 }}>
          ЖИЛИЙН ОЙ
        </div>
        <div
          style={{
            width: u * 0.4 * dateIn,
            height: 2,
            margin: `${u * 0.05}px 0 ${u * 0.035}px`,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          }}
        />
        <div style={{ opacity: dateIn, fontFamily: DISPLAY, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "lining-nums tabular-nums", fontSize: u * 0.06, color: GOLD }}>
          {dateLabel}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
