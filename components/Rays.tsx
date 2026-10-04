const f = (n: number) => n.toFixed(2);
/** The 99-ray mark. One ray per name. */
export function Rays({ r1 = 120, r2 = 190, w = 1, className, style, color = "currentColor" }:
  { r1?: number; r2?: number; w?: number; className?: string; style?: React.CSSProperties; color?: string }) {
  const lines = [];
  for (let i = 0; i < 99; i++) {
    const a = (i / 99) * Math.PI * 2 - Math.PI / 2;
    lines.push(<line key={i} x1={f(200 + Math.cos(a) * r1)} y1={f(200 + Math.sin(a) * r1)} x2={f(200 + Math.cos(a) * r2)} y2={f(200 + Math.sin(a) * r2)} />);
  }
  return (
    <svg viewBox="0 0 400 400" className={className} style={style} aria-hidden="true">
      <g stroke={color} strokeWidth={w} strokeLinecap="round">{lines}</g>
    </svg>
  );
}

/** The mark: a ring of ninety-nine rays with nothing at its centre. `numeral` is kept for old call sites and defaults off. */
export function Mark({ size = 28, color = "currentColor", numeral = false }: { size?: number; color?: string; numeral?: boolean }) {
  const lines = [];
  for (let i = 0; i < 99; i++) {
    const a = (i / 99) * Math.PI * 2 - Math.PI / 2;
    lines.push(<line key={i} x1={f(50 + Math.cos(a) * 28)} y1={f(50 + Math.sin(a) * 28)} x2={f(50 + Math.cos(a) * 48)} y2={f(50 + Math.sin(a) * 48)} />);
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <g stroke={color} strokeWidth="1.6" strokeLinecap="round">{lines}</g>
      {numeral && (
        <text x="50" y="51.5" textAnchor="middle" dominantBaseline="central" fill={color}
          style={{ fontFamily: "var(--disp), Georgia, serif", fontSize: 27, fontWeight: 400, letterSpacing: "-0.04em" }}>99</text>
      )}
    </svg>
  );
}
