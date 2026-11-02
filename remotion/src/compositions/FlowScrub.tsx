import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

/**
 * Made to be scrubbed by page scroll (site pins it and sets currentTime).
 * Story: a droplet falls -> ripples spread -> ripples become a data network
 * -> the network's nodes gather into a dot-matrix "20".
 */
const TAU = Math.PI * 2;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

const DIGITS: Record<string, string[]> = {
  "2": [".####.", "##..##", "....##", "...##.", "..##..", ".##...", "##....", "##....", "######"],
  "0": [".####.", "##..##", "##..##", "##..##", "##..##", "##..##", "##..##", "##..##", ".####."],
};

// target dots for "20", each bitmap pixel split into 2x2 dots, in grid units centred on 0,0
const TARGETS = (() => {
  const pts: [number, number][] = [];
  const cols = 6, rows = 9, gap = 2;
  ["2", "0"].forEach((d, di) => {
    DIGITS[d].forEach((row, r) =>
      Array.from(row).forEach((ch, c) => {
        if (ch !== "#") return;
        for (let sy = 0; sy < 2; sy++)
          for (let sx = 0; sx < 2; sx++)
            pts.push([(di * (cols + gap) + c) * 2 + sx, r * 2 + sy]);
      }),
    );
  });
  const w = (2 * cols + gap) * 2, h = rows * 2;
  return pts.map(([x, y]) => [x - w / 2 + 0.5, y - h / 2 + 0.5] as [number, number]);
})();

export const FlowScrub: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  const u = Math.min(width, height);
  const cx = width / 2, cy = height / 2;

  // phases
  const fall = interpolate(p, [0, 0.18], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const ripple = interpolate(p, [0.17, 0.45], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const net = interpolate(p, [0.38, 0.6], [0, 1], { ...clamp, easing: ease });
  const gather = interpolate(p, [0.6, 0.84], [0, 1], { ...clamp, easing: ease });
  const gold = interpolate(p, [0.8, 0.95], [0, 1], clamp);
  const spin = p * TAU * 0.35;

  const cell = u * 0.022;
  const nodes = TARGETS.map(([tx, ty], i) => {
    const ring = 1 + (i % 5);
    const a = (i / TARGETS.length) * TAU * 3.7 + random(`a${i}`) * 0.4 + spin * (ring % 2 ? 1 : -1);
    const r = ring * u * 0.085 * (0.3 + 0.7 * ripple) * (1 + 0.08 * Math.sin(p * TAU * 2 + i));
    const rx = cx + Math.cos(a) * r * 1.6;
    const ry = cy + Math.sin(a) * r * 0.55;
    const x = rx + (cx + tx * cell - rx) * gather;
    const y = ry + (cy + ty * cell - ry) * gather;
    return { x, y, ring };
  });

  const dropY = interpolate(fall, [0, 1], [-u * 0.1, cy]);
  const nodeColor = (k: number) => (k < 1 ? C.cyan : C.goldBright);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, ${C.bg2}, ${C.bg} 70%)` }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="g"><feGaussianBlur stdDeviation={u * 0.006} /></filter>
        </defs>

        {/* faint grid */}
        {Array.from({ length: 25 }, (_, i) => (
          <line key={`v${i}`} x1={(i / 24) * width} x2={(i / 24) * width} y1={0} y2={height} stroke={C.ink} strokeOpacity={0.03} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`h${i}`} y1={(i / 14) * height} y2={(i / 14) * height} x1={0} x2={width} stroke={C.ink} strokeOpacity={0.03} />
        ))}

        {/* falling droplet */}
        {fall < 1 && (
          <g opacity={1 - interpolate(p, [0.16, 0.19], [0, 1], clamp)}>
            <line x1={cx} x2={cx} y1={dropY - u * 0.12} y2={dropY} stroke={C.cyan} strokeOpacity={0.35} strokeWidth={2} />
            <circle cx={cx} cy={dropY} r={u * 0.012} fill={C.cyan} />
            <circle cx={cx} cy={dropY} r={u * 0.03} fill={C.cyan} opacity={0.3} filter="url(#g)" />
          </g>
        )}

        {/* ripples */}
        {Array.from({ length: 5 }, (_, k) => {
          const rp = Math.max(0, ripple - k * 0.08);
          const fade = (1 - net * 0.7) * (1 - gather);
          return (
            <ellipse
              key={`r${k}`}
              cx={cx}
              cy={cy}
              rx={(k + 1) * u * 0.085 * 1.6 * (0.3 + 0.7 * rp)}
              ry={(k + 1) * u * 0.085 * 0.55 * (0.3 + 0.7 * rp)}
              fill="none"
              stroke={C.cyan}
              strokeWidth={1.5}
              strokeOpacity={rp > 0 ? 0.5 * (1 - k * 0.12) * fade : 0}
            />
          );
        })}

        {/* network links */}
        {net > 0 &&
          nodes.map((n, i) => {
            const m = nodes[(i + 7) % nodes.length];
            const len = Math.hypot(m.x - n.x, m.y - n.y);
            if (len > u * 0.3 && gather < 0.5) return null;
            const o = net * (1 - gather) * 0.35;
            return o > 0.01 ? (
              <line key={`l${i}`} x1={n.x} y1={n.y} x2={cx + (m.x - cx) * 1} y2={m.y} stroke={C.cyan} strokeOpacity={o} strokeWidth={1} />
            ) : null;
          })}
        {net > 0 &&
          gather < 1 &&
          nodes
            .filter((_, i) => i % 9 === 0)
            .map((n, i) => (
              <line key={`hub${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={C.gold} strokeOpacity={net * (1 - gather) * 0.25} />
            ))}

        {/* nodes */}
        {ripple > 0 &&
          nodes.map((n, i) => {
            const appear = interpolate(ripple, [0.1 + (i % 5) * 0.08, 0.4 + (i % 5) * 0.08], [0, 1], clamp);
            const r = u * (0.004 + 0.003 * gather);
            const col = gold > 0 ? nodeColor(gold) : C.cyan;
            return (
              <g key={`n${i}`} opacity={appear}>
                <circle cx={n.x} cy={n.y} r={r * 3} fill={col} opacity={0.12 + gold * 0.15} />
                <circle cx={n.x} cy={n.y} r={r} fill={gold > 0.5 ? C.goldBright : C.ink} />
              </g>
            );
          })}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};
