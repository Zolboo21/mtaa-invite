import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

/**
 * Seamless loop: flowing water bands, data pulses travelling along pipelines,
 * a faint telemetry grid and rising golden sparks. Every periodic motion uses
 * an integer number of cycles over the composition, so frame N === frame 0.
 */
const TAU = Math.PI * 2;

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames; // 0..1 over the loop
  const vertical = height > width;
  const u = Math.min(width, height);

  // ---------- water bands ----------
  const bands = Array.from({ length: 7 }, (_, i) => {
    const base = height * (0.45 + i * 0.075);
    const amp = u * (0.03 + 0.012 * i);
    const k = (TAU / width) * (1.2 + i * 0.35);
    const cycles = (i % 3) + 1;
    const dir = i % 2 === 0 ? 1 : -1;
    const steps = 48;
    let d = `M 0 ${height}`;
    for (let s = 0; s <= steps; s++) {
      const x = (s / steps) * width;
      const y =
        base +
        amp * Math.sin(k * x + dir * TAU * cycles * t + i) +
        amp * 0.4 * Math.sin(k * 2.3 * x - TAU * t + i * 2);
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += ` L ${width} ${height} Z`;
    return { d, opacity: 0.05 + i * 0.018 };
  });

  // ---------- pipelines with data pulses ----------
  const pipes = Array.from({ length: vertical ? 6 : 5 }, (_, i) => {
    const y0 = height * (0.12 + i * (vertical ? 0.13 : 0.16));
    const bend = u * 0.12 * (i % 2 === 0 ? 1 : -1);
    return {
      d: `M ${-width * 0.05} ${y0} C ${width * 0.3} ${y0 + bend}, ${width * 0.65} ${y0 - bend}, ${width * 1.05} ${y0 + bend * 0.4}`,
      p0: [-width * 0.05, y0],
      p1: [width * 0.3, y0 + bend],
      p2: [width * 0.65, y0 - bend],
      p3: [width * 1.05, y0 + bend * 0.4],
      speed: 1 + (i % 2),
    };
  });
  const bez = (p: typeof pipes[number], s: number) => {
    const m = 1 - s;
    const a = m * m * m, b = 3 * m * m * s, c = 3 * m * s * s, e = s * s * s;
    return [
      a * p.p0[0] + b * p.p1[0] + c * p.p2[0] + e * p.p3[0],
      a * p.p0[1] + b * p.p1[1] + c * p.p2[1] + e * p.p3[1],
    ];
  };

  // ---------- sparks ----------
  const sparks = Array.from({ length: vertical ? 70 : 90 }, (_, i) => {
    const x0 = random(`sx${i}`) * width;
    const ph = random(`sp${i}`);
    const cyc = 1 + Math.floor(random(`sc${i}`) * 2);
    const y = height * (1.05 - ((ph + t * cyc) % 1) * 1.1);
    const x = x0 + Math.sin(TAU * (t * cyc + ph)) * u * 0.02;
    const tw = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(TAU * (t * 6 + ph * 4)), 2);
    const r = u * (0.0018 + random(`sr${i}`) * 0.004);
    return { x, y, r, o: tw * 0.9 };
  });

  // slow breathing glow
  const gx = width * (0.5 + 0.18 * Math.sin(TAU * t));
  const gy = height * (0.42 + 0.08 * Math.cos(TAU * t));

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg2} 0%, ${C.bg} 70%)` }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="glow" cx={gx} cy={gy} r={u * 0.75} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.blue} stopOpacity={0.28} />
            <stop offset="1" stopColor={C.blue} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.cyan} />
            <stop offset="1" stopColor={C.blue} />
          </linearGradient>
          <filter id="blur"><feGaussianBlur stdDeviation={u * 0.004} /></filter>
        </defs>

        <rect width={width} height={height} fill="url(#glow)" />

        {/* telemetry grid */}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={(i / 12) * width} x2={(i / 12) * width} y1={0} y2={height}
            stroke={C.ink} strokeOpacity={0.035} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} y1={(i / 8) * height} y2={(i / 8) * height} x1={0} x2={width}
            stroke={C.ink} strokeOpacity={0.035} />
        ))}

        {/* pipelines + pulses */}
        {pipes.map((p, i) => (
          <g key={`p${i}`}>
            <path d={p.d} fill="none" stroke={C.cyan} strokeOpacity={0.12} strokeWidth={u * 0.0016} />
            {Array.from({ length: 4 }, (_, j) => {
              const s = (j / 4 + t * p.speed + random(`po${i}`)) % 1;
              const [x, y] = bez(p, s);
              return (
                <g key={j}>
                  <circle cx={x} cy={y} r={u * 0.012} fill={C.cyan} opacity={0.18} filter="url(#blur)" />
                  <circle cx={x} cy={y} r={u * 0.0035} fill={C.ink} opacity={0.9} />
                </g>
              );
            })}
          </g>
        ))}

        {/* water */}
        {bands.map((b, i) => (
          <path key={`b${i}`} d={b.d} fill="url(#water)" opacity={b.opacity} />
        ))}

        {/* sparks */}
        {sparks.map((s, i) => (
          <g key={`s${i}`}>
            <circle cx={s.x} cy={s.y} r={s.r * 3} fill={C.gold} opacity={s.o * 0.15} />
            <circle cx={s.x} cy={s.y} r={s.r} fill={C.goldBright} opacity={s.o} />
          </g>
        ))}
      </svg>
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
