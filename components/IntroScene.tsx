"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Hero-гийн бараан "усан тайз":
 *  - charcoal дэвсгэр + нам гүм хөх усны гэрэл (caustic шейдер)
 *  - дээш хөвөгч, анивчдаг АЛТАН очнууд (салют/баярын мэдрэмж)
 */
export default function IntroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x24272d, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.autoClear = false;
    const size = () => ({ w: mount.clientWidth, h: mount.clientHeight });
    let { w, h } = size();
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // ---------- water caustic (ortho fullscreen quad) ----------
    const bgScene = new THREE.Scene();
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bgUniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(w, h) },
    };
    const bgMat = new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0);}`,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float u_time; uniform vec2 u_res;
        float caustic(vec2 uv,float t){
          vec2 q=uv;
          q+=0.55*vec2(sin(q.y*1.3+t), cos(q.x*1.1-t*0.8));
          q+=0.35*vec2(sin(q.y*2.1-t*0.7), cos(q.x*1.9+t*0.6));
          float a=pow(0.5+0.5*sin(q.x*2.4+q.y*1.7),6.0);
          float b=pow(0.5+0.5*sin(q.x*1.3-q.y*2.6+1.7),6.0);
          return a+b;
        }
        void main(){
          float aspect=u_res.x/u_res.y;
          vec2 uv=vUv; vec2 p=(uv-0.5)*vec2(aspect,1.0)*3.2;
          float t=u_time*0.045;
          vec3 c1=vec3(0.098,0.110,0.129), c2=vec3(0.150,0.165,0.192);
          float grad=smoothstep(0.0,1.0,(uv.y*0.7+uv.x*0.2));
          vec3 base=mix(c1,c2,grad);
          float c=caustic(p,t);
          vec2 drift=vec2(sin(u_time*0.05)*0.35, cos(u_time*0.037)*0.25);
          float pool=smoothstep(1.4,0.0,length((uv-0.5-drift)*vec2(aspect,1.0)));
          vec3 col=base + vec3(0.10,0.55,0.82)*c*0.075 + vec3(0.27,0.78,0.95)*pool*0.06;
          gl_FragColor=vec4(col,1.0);
        }
      `,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
    bgScene.add(quad);

    // ---------- golden floating sparks ----------
    const pScene = new THREE.Scene();
    const pCam = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    pCam.position.z = 10;

    const N = reduce ? 50 : 170;
    const RANGE_Y = 14;
    const pos = new Float32Array(N * 3);
    const phase = new Float32Array(N);
    const scale = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * RANGE_Y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      phase[i] = Math.random();
      scale[i] = 0.7 + Math.random() * 2.1;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    pGeo.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { u_time: { value: 0 }, u_h: { value: RANGE_Y } },
      vertexShader: /* glsl */ `
        attribute float aPhase; attribute float aScale;
        uniform float u_time; uniform float u_h;
        varying float vTw;
        void main(){
          vec3 p = position;
          p.y = mod(p.y + u_time*0.4 + aPhase*u_h, u_h) - u_h*0.5;
          p.x += sin(u_time*0.3 + aPhase*6.2831)*0.5;
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          float tw = 0.35 + 0.65*pow(0.5+0.5*sin(u_time*2.2 + aPhase*25.0), 2.0);
          vTw = tw;
          gl_PointSize = aScale * tw * (230.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying float vTw;
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          float r = length(d);
          float core = smoothstep(0.5, 0.0, r);
          core = pow(core, 1.6);
          vec3 gold = vec3(1.0, 0.85, 0.48);
          gl_FragColor = vec4(gold, core * vTw * 1.25);
        }
      `,
    });
    const sparks = new THREE.Points(pGeo, pMat);
    pScene.add(sparks);

    function resize() {
      const s = size(); w = s.w; h = s.h;
      renderer.setSize(w, h);
      bgUniforms.u_res.value.set(w, h);
      pCam.aspect = w / h;
      pCam.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0, running = true;
    function render() {
      const t = clock.getElapsedTime();
      bgUniforms.u_time.value = t;
      (pMat.uniforms.u_time as any).value = t;
      renderer.clear();
      renderer.render(bgScene, bgCam);
      renderer.render(pScene, pCam);
    }
    function tick() {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      render();
    }
    if (reduce) { render(); } else tick();

    function onVis() {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running && !reduce) { running = true; tick(); }
    }
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      bgMat.dispose(); quad.geometry.dispose();
      pMat.dispose(); pGeo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
