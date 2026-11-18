"use client";
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { NAMES } from "@/lib/names";
import { HOURS, HOUR_LABEL, Hour, hourForName } from "@/lib/hour";
import NameCard from "./NameCard";
import { Rays } from "./Rays";
import { SWATCH } from "./HourDial";

/* ---------------- the wheel ----------------
 * The ninety-nine sit on one great wheel. The name in focus is at the top of the arc;
 * its neighbours lean away on either side, lower down, the way the sun crosses a sky.
 * Drag it, swipe it, scroll sideways, use the arrow keys, or tap a neighbour.
 *
 * Smoothness: nothing here re-renders while it moves. One requestAnimationFrame loop
 * writes transform and opacity straight to the nine cards that are in the DOM, so the
 * browser only has to composite, at whatever rate the screen refreshes.
 */
const N = NAMES.length;
const HALF = 4; // cards kept in the DOM on each side of the one in focus
const mod = (k: number) => ((k % N) + N) % N;

export type WheelHandle = { goTo: (index: number) => void; step: (dir: number) => void };
type Props = {
  start: number;                       // 0–98
  onFocus?: (index: number) => void;   // another name reached the top of the arc
  onSettle?: (index: number) => void;  // the wheel rested on a name
  onOpen?: (index: number) => void;    // the name in focus was tapped
  label?: string;
};

const NameWheel = forwardRef<WheelHandle, Props>(function NameWheel({ start, onFocus, onSettle, onOpen, label = "The ninety-nine names" }, ref) {
  const stage = useRef<HTMLDivElement>(null);
  const rays = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<number, HTMLElement>());
  const [base, setBase] = useState(start);
  const cb = useRef({ onFocus, onSettle, onOpen });
  useEffect(() => { cb.current = { onFocus, onSettle, onOpen }; });

  const st = useRef({
    pos: start, target: start, vel: 0, focus: start,
    drag: false, x0: 0, p0: 0, moved: 0, lastX: 0, lastT: 0, v: 0, downK: null as number | null,
    spacing: 320, step: 0.2, R: 1600, raf: 0, t: 0, reduced: false,
    snap: 0 as unknown as ReturnType<typeof setTimeout>, rest: 0 as unknown as ReturnType<typeof setTimeout>,
  });

  /* write the arc: the only code that runs every frame */
  const paint = () => {
    const s = st.current;
    cards.current.forEach((el, k) => {
      const d = k - s.pos, ad = Math.abs(d), a = d * s.step;
      const x = Math.sin(a) * s.R, y = (1 - Math.cos(a)) * s.R;
      const scale = 1 - Math.min(ad, 2.5) * 0.11;
      const op = ad <= 1.05 ? 1 : Math.max(0, 1 - (ad - 1.05) / 0.85);
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${(a * 57.2958).toFixed(3)}deg) scale(${scale.toFixed(4)})`;
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = String(10 - Math.round(ad));
    });
    if (rays.current) rays.current.style.transform = `rotate(${(-s.pos * (360 / N)).toFixed(3)}deg)`;
  };
  /* tell React only when a different name reaches the top */
  const sync = () => {
    const s = st.current, f = Math.round(s.pos);
    if (f === s.focus) return;
    s.focus = f;
    setBase(f);
    cb.current.onFocus?.(mod(f));
    clearTimeout(s.rest);
    s.rest = setTimeout(() => cb.current.onSettle?.(mod(st.current.focus)), 190);
  };
  const tick = (now: number) => {
    const s = st.current;
    const dt = Math.min(0.034, Math.max(0.001, (now - s.t) / 1000));
    s.t = now;
    if (!s.drag) {
      // a critically damped spring: quick, and it never overshoots
      const acc = -150 * (s.pos - s.target) - 24.5 * s.vel;
      s.vel += acc * dt;
      s.pos += s.vel * dt;
      if (Math.abs(s.pos - s.target) < 0.0008 && Math.abs(s.vel) < 0.004) { s.pos = s.target; s.vel = 0; }
    }
    paint();
    sync();
    s.raf = s.drag || s.pos !== s.target ? requestAnimationFrame(tick) : 0;
  };
  const run = () => {
    const s = st.current;
    if (s.reduced && !s.drag) { s.pos = s.target; s.vel = 0; paint(); sync(); return; }
    if (!s.raf) { s.t = performance.now(); s.raf = requestAnimationFrame(tick); }
  };

  const goTo = (index: number) => {
    const s = st.current;
    const k = index + N * Math.round((s.pos - index) / N); // the nearest way round
    if (Math.abs(k - s.pos) > 6) { s.pos = k - Math.sign(k - s.pos) * 5; s.vel = 0; sync(); }
    s.target = k;
    run();
  };
  const step = (dir: number) => { const s = st.current; s.target = Math.round(s.target) + dir; run(); };
  useImperativeHandle(ref, () => ({ goTo, step }));

  /* place a card the moment React adds it, before the browser paints */
  useLayoutEffect(paint);

  /* geometry follows the stage: card width comes from CSS, the arc from here */
  useEffect(() => {
    const el = stage.current!;
    const s = st.current;
    s.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure = () => {
      const w = el.clientWidth;
      const cw = cards.current.values().next().value?.offsetWidth || 260;
      const narrow = w < 720;
      s.spacing = cw * (narrow ? 0.9 : 1.16);
      s.step = narrow ? 0.17 : 0.2;
      s.R = s.spacing / Math.sin(s.step);
      paint();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // sideways scroll (a trackpad swipe, or shift + wheel) turns the wheel; up and down is left to the page
    const wheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      s.target += dx / s.spacing;
      clearTimeout(s.snap);
      s.snap = setTimeout(() => { s.target = Math.round(s.target); run(); }, 130);
      run();
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", wheel);
      cancelAnimationFrame(s.raf); s.raf = 0;
      clearTimeout(s.snap); clearTimeout(s.rest);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* dragging */
  const down = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = st.current;
    const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-k]");
    s.downK = hit ? Number(hit.dataset.k) : null;
    s.drag = true; s.x0 = e.clientX; s.p0 = s.pos; s.moved = 0;
    s.lastX = e.clientX; s.lastT = e.timeStamp; s.v = 0;
    clearTimeout(s.snap);
    run();
  };
  const move = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.drag) return;
    const dx = e.clientX - s.x0;
    if (s.moved < 6 && Math.abs(dx) >= 6) {
      // keep the drag even if the pointer leaves the wheel; some pointers cannot be captured, and that is fine
      try { stage.current?.setPointerCapture(e.pointerId); } catch { }
      stage.current?.classList.add("dragging");
    }
    s.moved = Math.max(s.moved, Math.abs(dx));
    s.pos = s.p0 - dx / s.spacing;
    s.target = s.pos;
    const dtm = e.timeStamp - s.lastT;
    if (dtm > 0) { s.v = s.v * 0.7 + (-(e.clientX - s.lastX) / s.spacing / (dtm / 1000)) * 0.3; s.lastX = e.clientX; s.lastT = e.timeStamp; }
  };
  const up = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.drag) return;
    s.drag = false;
    stage.current?.classList.remove("dragging");
    if (s.moved < 6) {
      // a tap: a neighbour comes to the top, the name in focus opens
      s.target = Math.round(s.pos);
      if (s.downK !== null && e.type === "pointerup") {
        if (s.downK === Math.round(s.pos)) cb.current.onOpen?.(mod(s.downK)); else s.target = s.downK;
      }
    } else {
      const v = e.timeStamp - s.lastT > 90 ? 0 : Math.max(-14, Math.min(14, s.v));
      s.vel = v;
      s.target = Math.round(s.pos + v * 0.22); // let a flick carry on a little
    }
    run();
  };

  const ks = Array.from({ length: HALF * 2 + 1 }, (_, i) => base - HALF + i);
  return (
    <div className="wheel" ref={stage} role="group" aria-roledescription="carousel" aria-label={label}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onKeyDown={e => { if (e.key === "ArrowRight") { e.preventDefault(); step(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); } }}>
      <div className="wheel-halo" aria-hidden="true" />
      <div className="wheel-rays" ref={rays} aria-hidden="true"><Rays r1={156} r2={198} w={0.7} /></div>
      {ks.map(k => {
        const name = NAMES[mod(k)];
        const here = k === base;
        return (
          <a key={k} data-k={k} data-d={k - base} href={`/names/${name.slug}`} className="wheel-card" draggable={false}
            ref={el => { if (el) cards.current.set(k, el); else cards.current.delete(k); }}
            tabIndex={here ? 0 : -1} aria-hidden={Math.abs(k - base) > 1 ? true : undefined} aria-current={here ? "true" : undefined}
            aria-label={`${name.n}. ${name.tr}, ${name.en}`}
            onClick={e => { e.preventDefault(); if (e.detail === 0) { if (here) onOpen?.(mod(k)); else { st.current.target = k; run(); } } }}>
            <NameCard name={name} href={false} big />
          </a>
        );
      })}
    </div>
  );
});
export default NameWheel;

/* ---------------- the day bar ----------------
 * Where you are among the ninety-nine, drawn as one day: six skies, dawn to night.
 * Tap or drag along it to travel.
 */
const SPAN: Record<Hour, number> = { fajr: 0, morning: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
NAMES.forEach(n => { SPAN[hourForName(n.n)]++; });

export function DayBar({ index, onPick, onStep }: { index: number; onPick: (index: number) => void; onStep: (dir: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const hour = hourForName(index + 1);
  const pick = (e: React.PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    onPick(Math.max(0, Math.min(N - 1, Math.floor(((e.clientX - r.left) / r.width) * N))));
  };
  return (
    <div className="daybar">
      <button className="daybar-arrow" onClick={() => onStep(-1)} aria-label="The name before">←</button>
      <div className="daybar-mid">
        <div className="daybar-track" ref={track} role="slider" tabIndex={0}
          aria-label="Travel through the ninety-nine names" aria-valuemin={1} aria-valuemax={N} aria-valuenow={index + 1}
          aria-valuetext={`${index + 1} of 99, ${NAMES[index].tr}, ${HOUR_LABEL[hour]}`}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
          onPointerMove={e => { if (e.buttons || e.pointerType === "touch") { if (e.currentTarget.hasPointerCapture(e.pointerId)) pick(e); } }}
          onKeyDown={e => { if (e.key === "ArrowRight") { e.preventDefault(); onStep(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); onStep(-1); } }}>
          {HOURS.map(h => <i key={h} style={{ flexGrow: SPAN[h], background: SWATCH[h] }} />)}
          <span className="daybar-thumb" style={{ left: `${((index + 0.5) / N) * 100}%` }} />
        </div>
        <div className="daybar-hours" aria-hidden="true">
          {HOURS.map(h => <span key={h} style={{ flexGrow: SPAN[h] }} className={h === hour ? "on" : ""}>{HOUR_LABEL[h]}</span>)}
        </div>
      </div>
      <button className="daybar-arrow" onClick={() => onStep(1)} aria-label="The name after">→</button>
      <div className="daybar-count" aria-hidden="true"><b>{index + 1}</b><span>of 99</span></div>
    </div>
  );
}
