"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Real-time scene for the pinned story (replaces the scrubbed video).
 * progress 0..1 (from scroll) drives: droplet falls -> ripples spread on a tilted
 * water plane -> ripples break into a 3D data network -> nodes gather into a gold "20".
 * Crisp round points with additive glow, distance-faded lines, depth of field
 * and mouse parallax. Rendered at devicePixelRatio (max 2).
 */
const BRAND = {
  cyan: new THREE.Color("#38bdf8"),
  blue: new THREE.Color("#6094ea"),
  green: new THREE.Color("#7ed56f"),
  gold: new THREE.Color("#f6dd8f"),
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function sampleTwenty(count: number, font: string) {
  const W = 600, H = 300;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `800 280px ${font}`;
  g.fillText("20", W / 2, H / 2 + 10);
  const d = g.getImageData(0, 0, W, H).data;
  const pts: [number, number][] = [];
  for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) if (d[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
  // even subsample to `count`
  const out: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const [x, y] = pts[Math.floor((i / count) * pts.length)] ?? [W / 2, H / 2];
    out.push([(x - W / 2) / 46, -(y - H / 2) / 46]); // ~13 x 6.5 world units
  }
  return out;
}

export default function StoryCanvas({ progress }: { progress: React.MutableRefObject<number> }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    const dpr = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    el.appendChild(renderer.domElement);
    let w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0, 16);
    const world = new THREE.Group();
    scene.add(world);

    // ---------- nodes ----------
    const N = 1400;
    const twenty = sampleTwenty(N, getComputedStyle(document.body).fontFamily);
    const ring = new Float32Array(N * 3);
    const net = new Float32Array(N * 3);
    const tgt = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const tint = new Float32Array(N * 3);
    const palette = [BRAND.cyan, BRAND.blue, BRAND.green, BRAND.cyan];
    for (let i = 0; i < N; i++) {
      const k = i % 7; // ring index
      const a = (i / N) * Math.PI * 2 * 7 + Math.random() * 0.15;
      const r = 1.1 + k * 1.05;
      ring.set([Math.cos(a) * r, 0, Math.sin(a) * r], i * 3);
      // network: points spread in a thick disc with height
      const na = Math.random() * Math.PI * 2, nr = Math.sqrt(Math.random()) * 8.2;
      net.set([Math.cos(na) * nr, (Math.random() - 0.5) * 3.2, Math.sin(na) * nr * 0.9], i * 3);
      tgt.set([twenty[i][0], twenty[i][1], (Math.random() - 0.5) * 0.25], i * 3);
      seed[i] = Math.random();
      const col = palette[i % palette.length];
      tint.set([col.r, col.g, col.b], i * 3);
    }
    const pos = new Float32Array(N * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aTint", new THREE.BufferAttribute(tint, 3));

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_dpr: { value: dpr },
        u_gold: { value: 0 },
        u_show: { value: 0 },
        u_focus: { value: 16 },
        u_time: { value: 0 },
        u_h: { value: h },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed; attribute vec3 aTint;
        uniform float u_dpr, u_gold, u_show, u_focus, u_time, u_h;
        varying vec3 vCol; varying float vA; varying float vSoft;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          float dist = -mv.z;
          float dof = clamp(abs(dist - u_focus) / 7.0, 0.0, 1.0);   // depth of field
          float base = mix(0.085, 0.13, aSeed) * (1.0 + u_gold*0.6);
          float px = base * u_h / dist * 0.9;                        // perspective size
          gl_PointSize = (px * (1.0 + dof*1.6) + 1.2) * u_dpr;
          vSoft = dof;
          vA = u_show * mix(1.0, 0.35, dof) * (0.75 + 0.25*sin(u_time*2.0 + aSeed*40.0));
          vCol = mix(aTint, vec3(1.0,0.86,0.52), u_gold);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec3 vCol; varying float vA; varying float vSoft;
        void main(){
          float r = length(gl_PointCoord - 0.5) * 2.0;
          if (r > 1.0) discard;
          float core = smoothstep(mix(0.42, 0.05, vSoft), 0.0, r);   // crisp disc, blurred when out of focus
          float glow = pow(1.0 - r, 2.2) * 0.45;
          vec3 c = vCol * (core + glow) + vec3(1.0) * core * 0.35;
          gl_FragColor = vec4(c, (core + glow) * vA);
        }`,
    });
    world.add(new THREE.Points(geo, pMat));

    // ---------- links (precomputed pairs in network layout) ----------
    const pairs: number[] = [];
    for (let i = 0; i < N; i++) {
      let best = -1, bd = 1e9, best2 = -1, bd2 = 1e9;
      for (let t = 0; t < 160; t++) {
        const j = Math.floor(Math.random() * N);
        if (j === i) continue;
        const dx = net[i * 3] - net[j * 3], dy = net[i * 3 + 1] - net[j * 3 + 1], dz = net[i * 3 + 2] - net[j * 3 + 2];
        const dd = dx * dx + dy * dy + dz * dz;
        if (dd < bd) { best2 = best; bd2 = bd; best = j; bd = dd; } else if (dd < bd2) { best2 = j; bd2 = dd; }
      }
      // only short links so the web reads as structure, not noise
      if (i % 2 === 0 && best >= 0 && bd < 1.4) pairs.push(i, best);
      if (i % 4 === 0 && best2 >= 0 && bd2 < 1.8) pairs.push(i, best2);
    }
    const L = pairs.length / 2;
    const lPos = new Float32Array(L * 6);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    const lMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { u_a: { value: 0 }, u_col: { value: BRAND.cyan.clone() } },
      vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `precision highp float; uniform float u_a; uniform vec3 u_col; varying float vD;
        void main(){ float f = smoothstep(26.0, 10.0, vD); gl_FragColor = vec4(u_col, u_a * f); }`,
    });
    world.add(new THREE.LineSegments(lGeo, lMat));

    // ---------- ripple rings ----------
    const rings: THREE.LineLoop[] = [];
    for (let k = 0; k < 7; k++) {
      const g = new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 128 }, (_, i) => {
          const a = (i / 128) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
        }),
      );
      const m = new THREE.LineBasicMaterial({ color: BRAND.cyan, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const loop = new THREE.LineLoop(g, m);
      world.add(loop);
      rings.push(loop);
    }

    // ---------- droplet ----------
    const dropGeo = new THREE.BufferGeometry();
    dropGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
    dropGeo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array([0.9]), 1));
    dropGeo.setAttribute("aTint", new THREE.BufferAttribute(new Float32Array([0.6, 0.9, 1]), 3));
    const dropMat = pMat.clone();
    dropMat.uniforms.u_show.value = 1;
    const drop = new THREE.Points(dropGeo, dropMat);
    world.add(drop);

    // ---------- interaction ----------
    const mouse = new THREE.Vector2(), mouseS = new THREE.Vector2();
    const onMove = (e: PointerEvent) => mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
    addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      w = el.clientWidth; h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      // keep the "20" fully in frame on narrow (portrait) screens
      camera.position.z = w / h < 0.8 ? 26 : w / h < 1.2 ? 20 : 16;
      camera.updateProjectionMatrix();
      pMat.uniforms.u_h.value = h;
      dropMat.uniforms.u_h.value = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const clock = new THREE.Clock();
    let sp = 0, raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      sp += (progress.current - sp) * 0.12;
      const p = sp;

      const fall = smooth(0.0, 0.14, p);
      const ripple = smooth(0.12, 0.36, p);
      const toNet = smooth(0.36, 0.56, p);
      const gather = smooth(0.6, 0.84, p);
      const gold = smooth(0.78, 0.92, p);

      // camera: tilted view of the water, then straight on for the "20"
      world.rotation.x = THREE.MathUtils.lerp(0.95, 0.0, gather) + mouseS.y * 0.12;
      world.rotation.y = (1 - gather) * (t * 0.05 + p * 1.2) + mouseS.x * 0.25;
      mouseS.lerp(mouse, 0.05);
      camera.position.x = mouseS.x * 1.2;
      camera.position.y = -mouseS.y * 0.8;
      camera.lookAt(0, 0, 0);

      for (let i = 0; i < N; i++) {
        const o = i * 3;
        const k = i % 7;
        const rr = Math.max(0, ripple * 1.15 - k * 0.06);
        const wave = Math.sin(t * 1.6 - k * 0.9) * 0.18 * (1 - toNet);
        const rx = ring[o] * rr, ry = wave, rz = ring[o + 2] * rr;
        const nx = net[o] + Math.sin(t * 0.4 + seed[i] * 9) * 0.15;
        const ny = net[o + 1] + Math.cos(t * 0.5 + seed[i] * 7) * 0.15;
        const nz = net[o + 2];
        const ax = rx + (nx - rx) * toNet, ay = ry + (ny - ry) * toNet, az = rz + (nz - rz) * toNet;
        const g = Math.min(1, Math.max(0, gather * 1.25 - seed[i] * 0.25));
        const ge = g * g * (3 - 2 * g);
        pos[o] = ax + (tgt[o] - ax) * ge;
        pos[o + 1] = ay + (tgt[o + 1] - ay) * ge + Math.sin(t * 2 + seed[i] * 30) * 0.02 * gold;
        pos[o + 2] = az + (tgt[o + 2] - az) * ge;
      }
      geo.attributes.position.needsUpdate = true;

      for (let l = 0; l < L; l++) {
        const a = pairs[l * 2] * 3, b = pairs[l * 2 + 1] * 3;
        lPos[l * 6] = pos[a]; lPos[l * 6 + 1] = pos[a + 1]; lPos[l * 6 + 2] = pos[a + 2];
        lPos[l * 6 + 3] = pos[b]; lPos[l * 6 + 4] = pos[b + 1]; lPos[l * 6 + 5] = pos[b + 2];
      }
      lGeo.attributes.position.needsUpdate = true;
      lMat.uniforms.u_a.value = 0.22 * smooth(0.7, 1, toNet) * (1 - smooth(0.6, 0.7, p));

      rings.forEach((r, k) => {
        const rr = Math.max(0.001, ripple * 1.15 - k * 0.06) * (1.1 + k * 1.05);
        r.scale.setScalar(rr);
        (r.material as THREE.LineBasicMaterial).opacity = ripple > 0 ? 0.35 * (1 - k * 0.1) * (1 - toNet) : 0;
      });

      const dp = drop.geometry.attributes.position as THREE.BufferAttribute;
      dp.setXYZ(0, 0, THREE.MathUtils.lerp(7, 0, fall), 0);
      dp.needsUpdate = true;
      dropMat.uniforms.u_show.value = 1 - smooth(0.13, 0.17, p);
      dropMat.uniforms.u_time.value = t;

      pMat.uniforms.u_show.value = smooth(0.12, 0.2, p);
      pMat.uniforms.u_gold.value = gold;
      pMat.uniforms.u_time.value = t;
      pMat.uniforms.u_focus.value = camera.position.length();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onMove);
      geo.dispose(); pMat.dispose(); lGeo.dispose(); lMat.dispose(); dropGeo.dispose(); dropMat.dispose();
      rings.forEach((r) => { r.geometry.dispose(); (r.material as THREE.Material).dispose(); });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  return <div ref={mount} className="story-canvas" aria-hidden />;
}
