import type { CSSProperties, ReactNode } from "react";

const f = (n: number) => n.toFixed(2);

/**
 * The mark as a progress meter: ninety-nine rays, one per name. A name you know draws its ray
 * in full; the rest wait as faint stubs. At 99 of 99 you have drawn the whole mark.
 *  - `lit`    which name numbers (1–99) are drawn
 *  - `fresh`  name numbers drawn just now: they grow in, one after another
 *  - `soft`   name numbers still being learned: a half ray
 */
export default function Ring({ lit, fresh = [], soft = [], children, className = "", style, pace = 0.18 }:
  { lit: number[] | Set<number>; fresh?: number[]; soft?: number[]; children?: ReactNode; className?: string; style?: CSSProperties; pace?: number }) {
  const on = lit instanceof Set ? lit : new Set(lit);
  const lines = [];
  for (let i = 0; i < 99; i++) {
    const n = i + 1;
    const a = (i / 99) * Math.PI * 2 - Math.PI / 2;
    const state = on.has(n) ? "on" : soft.includes(n) ? "soft" : "";
    const r2 = state === "on" ? 192 : state === "soft" ? 160 : 140;
    const fi = fresh.indexOf(n);
    lines.push(
      <line key={n} className={`${state} ${fi >= 0 ? "fresh" : ""}`} pathLength={1}
        style={fi >= 0 ? { animationDelay: `${(0.25 + fi * pace).toFixed(2)}s` } : undefined}
        x1={f(200 + Math.cos(a) * 124)} y1={f(200 + Math.sin(a) * 124)}
        x2={f(200 + Math.cos(a) * r2)} y2={f(200 + Math.sin(a) * r2)} />
    );
  }
  return (
    <div className={`ring ${className}`} style={style}>
      <svg viewBox="0 0 400 400" aria-hidden="true"><g strokeLinecap="round">{lines}</g></svg>
      {children && <div className="ring-mid">{children}</div>}
    </div>
  );
}
