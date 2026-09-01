"use client";
import { useEffect, useRef } from "react";
import { useHour } from "./HourProvider";
import type { Hour } from "@/lib/hour";

/* Hour → (mote color, ray color, glow color) in linear-ish sRGB hex */
const PALETTE: Record<Hour, { mote: number; ray: number; deep: number }> = {
  fajr:    { mote: 0xf3c9a8, ray: 0x8fb0c8, deep: 0xd98c7c },
  morning: { mote: 0xe8a64b, ray: 0xcaa96a, deep: 0xf3e3c2 },
  dhuhr:   { mote: 0xe8a64b, ray: 0xd98c7c, deep: 0xf2cfc0 },
  asr:     { mote: 0xcaa96a, ray: 0x8fa88f, deep: 0xa9bfa6 },
  maghrib: { mote: 0xffc87a, ray: 0xe8a64b, deep: 0x6b5a7a },
  isha:    { mote: 0xaebcdf, ray: 0x8fb0c8, deep: 0x2a2f44 },
};

/**
 * The noor field: 99 motes of light drifting in depth, orbiting a
 * slowly-breathing ring of 99 rays. Rendered behind the hero, tinted
 * by the hour, eased by the mouse, and quiet about all of it.
 */
export default function NoorField() {
  const ref = useRef<HTMLDivElement>(null);
  const hourRef = useRef<Hour>("fajr");
  const { hour } = useHour();
  hourRef.current = hour;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dead = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      if (dead || !ref.current) return;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 11;

      // ---- 99 motes, one per name, on individual slow orbits ----
      const N = 99;
      const seeds = Array.from({ length: N }, (_, i) => ({
        r: 2.6 + Math.pow((i * 37) % N / N, 0.7) * 6.2,
        tilt: ((i * 53) % N / N - 0.5) * 1.9,
        phase: (i * 71) % N / N * Math.PI * 2,
        speed: 0.02 + ((i * 13) % N / N) * 0.05,
        size: 0.5 + ((i * 29) % N / N) * 1.6,
      }));
      const pos = new Float32Array(N * 3);
      const sizes = new Float32Array(N);
      seeds.forEach((s, i) => { sizes[i] = s.size; });
      const moteGeo = new THREE.BufferGeometry();
      moteGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      moteGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

      const moteMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(PALETTE.fajr.mote) }, uOpacity: { value: 0.9 } },
        vertexShader: `
          attribute float aSize; varying float vSize;
          void main(){ vSize=aSize; vec4 mv=modelViewMatrix*vec4(position,1.0);
            gl_PointSize=aSize*46.0/-mv.z; gl_Position=projectionMatrix*mv; }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uOpacity; varying float vSize;
          void main(){ float d=length(gl_PointCoord-vec2(.5));
            float a=smoothstep(.5,.0,d); a*=a*uOpacity;
            gl_FragColor=vec4(uColor,a); }`,
      });
      const motes = new THREE.Points(moteGeo, moteMat);
      scene.add(motes);

      // ---- the 99-ray ring, in 3D, breathing ----
      const rayGeo = new THREE.BufferGeometry();
      const rayPos = new Float32Array(N * 2 * 3);
      rayGeo.setAttribute("position", new THREE.BufferAttribute(rayPos, 3));
      const rayMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.34, color: PALETTE.fajr.ray });
      const rays = new THREE.LineSegments(rayGeo, rayMat);
      rays.rotation.x = 0.42;
      scene.add(rays);

      // ---- deep halo behind everything ----
      const haloMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(PALETTE.fajr.deep) } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uColor; varying vec2 vUv;
          void main(){ float d=length(vUv-vec2(.5)); gl_FragColor=vec4(uColor,smoothstep(.5,.05,d)*.16); }`,
      });
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), haloMat);
      halo.position.z = -4;
      scene.add(halo);

      const size = () => {
        const w = el.clientWidth, h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      // colors ease toward the current hour so the tint change feels like weather
      const cur = { mote: new THREE.Color(PALETTE.fajr.mote), ray: new THREE.Color(PALETTE.fajr.ray), deep: new THREE.Color(PALETTE.fajr.deep) };
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
        mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
      };
      addEventListener("pointermove", onMove, { passive: true });

      let scrollFade = 1;
      const onScroll = () => { scrollFade = Math.max(0, 1 - scrollY / (innerHeight * 0.9)); };
      addEventListener("scroll", onScroll, { passive: true });

      let raf = 0;
      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(el);

      const clock = new THREE.Clock();
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || scrollFade <= 0.01) { el.style.opacity = "0"; return; }
        el.style.opacity = String(scrollFade);
        const t = clock.getElapsedTime();

        const p = motes.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < N; i++) {
          const s = seeds[i];
          const a = s.phase + t * s.speed;
          const bob = Math.sin(t * 0.35 + s.phase * 3) * 0.35;
          p[i * 3] = Math.cos(a) * s.r;
          p[i * 3 + 1] = Math.sin(a) * s.r * Math.sin(s.tilt) + bob;
          p[i * 3 + 2] = Math.sin(a) * s.r * Math.cos(s.tilt) * 0.6 - 1.5;
        }
        motes.geometry.attributes.position.needsUpdate = true;

        // ring breath: 4s in, 4s out — same tempo as the .breath dot
        const breath = 1 + Math.sin((t / 8) * Math.PI * 2) * 0.06;
        const rp = rays.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2;
          const r1 = 3.1 * breath, r2 = (4.15 + Math.sin(t * 0.5 + i * 0.7) * 0.07) * breath;
          rp[i * 6] = Math.cos(a) * r1; rp[i * 6 + 1] = Math.sin(a) * r1; rp[i * 6 + 2] = 0;
          rp[i * 6 + 3] = Math.cos(a) * r2; rp[i * 6 + 4] = Math.sin(a) * r2; rp[i * 6 + 5] = 0;
        }
        rays.geometry.attributes.position.needsUpdate = true;
        rays.rotation.z = t * 0.02;
        rays.rotation.y = Math.sin(t * 0.05) * 0.22 + mouse.x * 0.12;

        mouse.x += (mouse.tx - mouse.x) * 0.03;
        mouse.y += (mouse.ty - mouse.y) * 0.03;
        camera.position.x = mouse.x * 0.7;
        camera.position.y = -mouse.y * 0.5;
        camera.lookAt(0, 0, 0);

        const want = PALETTE[hourRef.current];
        cur.mote.lerp(new THREE.Color(want.mote), 0.02);
        cur.ray.lerp(new THREE.Color(want.ray), 0.02);
        cur.deep.lerp(new THREE.Color(want.deep), 0.02);
        (moteMat.uniforms.uColor.value as InstanceType<typeof THREE.Color>).copy(cur.mote);
        rayMat.color.copy(cur.ray);
        (haloMat.uniforms.uColor.value as InstanceType<typeof THREE.Color>).copy(cur.deep);

        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        removeEventListener("pointermove", onMove);
        removeEventListener("scroll", onScroll);
        ro.disconnect(); io.disconnect();
        moteGeo.dispose(); rayGeo.dispose(); moteMat.dispose(); rayMat.dispose(); haloMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => { dead = true; cleanup?.(); };
  }, []);

  return <div ref={ref} className="noor-field" aria-hidden="true" />;
}
