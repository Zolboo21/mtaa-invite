"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { VideoBg } from "./motion";

/**
 * Live hero stage (replaces the pre-rendered loop when WebGL is available):
 *  - full-screen water caustics shader; the mouse drops ripples into it
 *  - ~4k gold particles that fly in and assemble a giant "20",
 *    get pushed away by the cursor and scatter back into the water on scroll
 * Falls back to the Remotion hero video for reduced motion / no WebGL.
 */
export default function WaterHero() {
  const mount = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setFallback(true);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      return setFallback(true);
    }
    const dpr = Math.min(devicePixelRatio, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.autoClear = false;
    el.appendChild(renderer.domElement);
    let w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h);

    // ---------- water ----------
    const RIPPLES = 10;
    const ripples = Array.from({ length: RIPPLES }, () => new THREE.Vector3(0, 0, -100));
    let rippleIdx = 0;
    const water = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_res: { value: new THREE.Vector2(w, h) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_scroll: { value: 0 },
        u_ripples: { value: ripples },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float u_time, u_scroll; uniform vec2 u_res, u_mouse;
        uniform vec3 u_ripples[${RIPPLES}];
        float caustic(vec2 q, float t){
          q += 0.55*vec2(sin(q.y*1.3+t), cos(q.x*1.1-t*0.8));
          q += 0.35*vec2(sin(q.y*2.1-t*0.7), cos(q.x*1.9+t*0.6));
          return pow(0.5+0.5*sin(q.x*2.4+q.y*1.7),7.0)+pow(0.5+0.5*sin(q.x*1.3-q.y*2.6+1.7),7.0);
        }
        void main(){
          float aspect = u_res.x/u_res.y;
          vec2 uv = vUv;
          vec2 asp = vec2(aspect,1.0);
          // ripples bend the surface
          vec2 off = vec2(0.0); float ring = 0.0;
          for(int i=0;i<${RIPPLES};i++){
            vec3 r = u_ripples[i];
            float age = u_time - r.z;
            if(age < 0.0 || age > 4.0) continue;
            vec2 d = (uv - r.xy)*asp; float dist = length(d);
            float wave = sin(dist*38.0 - age*7.0) * exp(-age*1.1) * exp(-dist*5.0);
            off += normalize(d+1e-4) * wave * 0.012;
            ring += max(wave,0.0);
          }
          uv += off;
          vec2 p = (uv-0.5)*asp*3.0 + vec2(0.0, u_scroll*1.5);
          float t = u_time*0.06;
          vec3 deep = vec3(0.027,0.047,0.078), mid = vec3(0.043,0.105,0.16);
          vec3 col = mix(deep, mid, smoothstep(0.0,1.0, vUv.y*0.8 + 0.1));
          float c = caustic(p, t) + 0.6*caustic(p*1.7+3.1, t*1.3);
          col += vec3(0.12,0.55,0.85)*c*0.07;
          // light pool follows the mouse
          float m = smoothstep(0.55,0.0,length((vUv-u_mouse)*asp));
          col += vec3(0.27,0.78,0.95)*m*0.10 + vec3(0.96,0.83,0.5)*m*m*0.05;
          col += vec3(0.5,0.85,1.0)*ring*0.10;
          // vignette + scroll darkening
          col *= 1.0 - 0.55*pow(length((vUv-0.5)*vec2(1.1,1.3)),2.0);
          col *= 1.0 - u_scroll*0.5;
          gl_FragColor = vec4(col,1.0);
        }`,
      depthTest: false,
    });
    const bgScene = new THREE.Scene();
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), water));
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ---------- particles that form "20" ----------
    const sampleTargets = () => {
      const cw = Math.round(w), ch = Math.round(h);
      const c = document.createElement("canvas");
      c.width = cw; c.height = ch;
      const g = c.getContext("2d")!;
      const size = Math.min(cw * (cw < ch ? 0.82 : 0.5), ch * 0.64);
      g.fillStyle = "#fff";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `800 ${size}px ${getComputedStyle(document.body).fontFamily}`;
      g.fillText("20", cw / 2, ch * (cw < ch ? 0.4 : 0.42));
      const data = g.getImageData(0, 0, cw, ch).data;
      const step = Math.max(3, Math.round(Math.sqrt((cw * ch) / 90000) * 1.55));
      const pts: number[] = [];
      for (let y = 0; y < ch; y += step)
        for (let x = 0; x < cw; x += step)
          if (data[(y * cw + x) * 4 + 3] > 128) pts.push(x - cw / 2, ch / 2 - y);
      return pts;
    };

    let targets = sampleTargets();
    const N = Math.min(11000, targets.length / 2);
    const geo = new THREE.BufferGeometry();
    const target = new Float32Array(N * 3);
    const start = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const fillTargets = () => {
      for (let i = 0; i < N; i++) {
        const j = (i * 2) % targets.length;
        target[i * 3] = targets[j] ?? 0;
        target[i * 3 + 1] = targets[j + 1] ?? 0;
        target[i * 3 + 2] = 0;
      }
    };
    fillTargets();
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.max(w, h) * (0.6 + Math.random() * 0.6);
      start[i * 3] = Math.cos(a) * r;
      start[i * 3 + 1] = Math.sin(a) * r * 0.6 - h * 0.6;
      start[i * 3 + 2] = 0;
      seed[i] = Math.random();
    }
    geo.setAttribute("position", new THREE.BufferAttribute(target, 3));
    geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 },
        u_form: { value: 0 },
        u_scroll: { value: 0 },
        u_mouse: { value: new THREE.Vector2(9999, 9999) },
        u_dpr: { value: dpr },
        u_h: { value: h },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aStart; attribute float aSeed;
        uniform float u_time, u_form, u_scroll, u_dpr, u_h; uniform vec2 u_mouse;
        varying float vA; varying float vGold;
        void main(){
          float k = clamp((u_form - aSeed*0.35)/0.65, 0.0, 1.0);
          k = k<0.5 ? 4.0*k*k*k : 1.0-pow(-2.0*k+2.0,3.0)/2.0;
          vec3 p = mix(aStart, position, k);
          // breathe like water
          p.x += sin(u_time*0.9 + aSeed*30.0 + position.y*0.01)*2.5;
          p.y += cos(u_time*0.7 + aSeed*20.0 + position.x*0.01)*2.5;
          // cursor pushes particles away
          vec2 d = p.xy - u_mouse; float dist = length(d);
          float push = smoothstep(150.0, 0.0, dist);
          p.xy += normalize(d+1e-3) * push * 70.0;
          // scroll sinks them into the water
          p.y -= u_scroll * u_h * (0.6 + aSeed*1.2);
          p.x += sin(aSeed*40.0)*u_scroll*220.0;
          vA = (0.45 + 0.75*pow(0.5+0.5*sin(u_time*2.0+aSeed*50.0),2.0)) * (1.0 - u_scroll*0.9);
          vGold = step(0.18, aSeed);
          gl_PointSize = (2.0 + aSeed*3.0 + push*3.0) * u_dpr;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
        }`,
      fragmentShader: /* glsl */ `
        precision highp float; varying float vA; varying float vGold;
        void main(){
          float r = length(gl_PointCoord-0.5);
          float a = smoothstep(0.5,0.0,r);
          vec3 col = mix(vec3(0.45,0.85,1.0), vec3(1.0,0.86,0.52), vGold);
          gl_FragColor = vec4(col, a*vA);
        }`,
    });
    const pScene = new THREE.Scene();
    pScene.add(new THREE.Points(geo, pMat));
    const pCam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -10, 10);

    // ---------- interaction ----------
    const clock = new THREE.Clock();
    let lastRipple = 0;
    const mouseUv = new THREE.Vector2(0.5, 0.5);
    const mouseTarget = new THREE.Vector2(0.5, 0.5);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      mouseTarget.set(x, y);
      (pMat.uniforms.u_mouse.value as THREE.Vector2).set(e.clientX - r.left - w / 2, h / 2 - (e.clientY - r.top));
      const t = clock.getElapsedTime();
      if (t - lastRipple > 0.09) {
        ripples[rippleIdx].set(x, y, t);
        rippleIdx = (rippleIdx + 1) % RIPPLES;
        lastRipple = t;
      }
    };
    const onLeave = () => (pMat.uniforms.u_mouse.value as THREE.Vector2).set(9999, 9999);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let formStart = -1;
    const begin = () => formStart < 0 && (formStart = clock.getElapsedTime());
    addEventListener("gate:open", begin);
    const fallbackStart = setTimeout(() => !document.querySelector(".gate") && begin(), 600);

    const resize = () => {
      w = el.clientWidth; h = el.clientHeight;
      renderer.setSize(w, h);
      water.uniforms.u_res.value.set(w, h);
      pCam.left = -w / 2; pCam.right = w / 2; pCam.top = h / 2; pCam.bottom = -h / 2;
      pCam.updateProjectionMatrix();
      pMat.uniforms.u_h.value = h;
      targets = sampleTargets();
      fillTargets();
      geo.attributes.position.needsUpdate = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    // re-sample once the web font has loaded so "20" uses Montserrat
    document.fonts?.ready.then(resize);

    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      mouseUv.lerp(mouseTarget, 0.06);
      const sc = Math.min(1, scrollY / (h || 1));
      water.uniforms.u_time.value = t;
      water.uniforms.u_mouse.value.copy(mouseUv);
      water.uniforms.u_scroll.value = sc;
      pMat.uniforms.u_time.value = t;
      pMat.uniforms.u_scroll.value = sc;
      pMat.uniforms.u_form.value = formStart < 0 ? 0 : Math.min(1, (t - formStart) / 2.6);
      renderer.clear();
      renderer.render(bgScene, bgCam);
      renderer.render(pScene, pCam);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallbackStart);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      removeEventListener("gate:open", begin);
      water.dispose(); pMat.dispose(); geo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  if (fallback) return <VideoBg name="hero-loop" verticalName="hero-loop-vertical" />;
  return <div ref={mount} className="water-hero" aria-hidden />;
}
