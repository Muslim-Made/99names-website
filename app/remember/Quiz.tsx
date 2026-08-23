"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NAMES, Name } from "@/lib/names";
import { Mark } from "@/components/Rays";

function shuffle<T>(a: T[]) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
type Q = { name: Name; opts: Name[] };

export default function Quiz() {
  const [qs, setQs] = useState<Q[] | null>(null);
  const [i, setI] = useState(0); const [picked, setPicked] = useState<number | null>(null); const [score, setScore] = useState(0);
  const [known, setKnown] = useState<number[]>([]);
  useEffect(() => {
    const k = JSON.parse(localStorage.getItem("99names:known") || "[]"); setKnown(k);
    setQs(shuffle(NAMES).slice(0, 10).map(name => ({ name, opts: shuffle([name, ...shuffle(NAMES.filter(n => n.n !== name.n)).slice(0, 3)]) })));
  }, []);
  const q = qs?.[i];
  const pick = (n: Name) => {
    if (picked !== null || !q) return;
    setPicked(n.n);
    if (n.n === q.name.n) { setScore(s => s + 1); const k = Array.from(new Set([...known, n.n])); setKnown(k); localStorage.setItem("99names:known", JSON.stringify(k)); }
    setTimeout(() => { setPicked(null); setI(x => x + 1); }, 1100);
  };
  const share = async () => {
    const text = `I know ${known.length} of the 99 Names of Allah. 99names.net/remember`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch {} }
    await navigator.clipboard.writeText(text); alert("Copied to clipboard.");
  };
  if (!qs) return <div className="wrap quiz"><div className="eyebrow">Remember</div></div>;
  if (i >= qs.length) return (
    <section className="wrap quiz">
      <div className="eyebrow">Remember · done</div>
      <div className="result">
        <Mark size={56} />
        <h2 style={{ margin: 0 }}>{score} of 10 <em>today.</em></h2>
        <p className="lede" style={{ textAlign: "center" }}>You've met <strong>{known.length}</strong> of the 99 names so far.</p>
        <div className="grid99">{NAMES.map(n => <i key={n.n} className={known.includes(n.n) ? "on" : ""} />)}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          <button className="pill" onClick={share}>Share</button>
          <button className="pill o" onClick={() => { setI(0); setScore(0); setQs(shuffle(NAMES).slice(0, 10).map(name => ({ name, opts: shuffle([name, ...shuffle(NAMES.filter(n => n.n !== name.n)).slice(0, 3)]) }))); }}>Again</button>
          <Link href="/names" className="pill o">All 99</Link>
        </div>
      </div>
    </section>
  );
  return (
    <section className="wrap quiz">
      <div className="eyebrow">Remember · {i + 1} of 10</div>
      <div className="ar">{q!.name.ar}</div>
      <h2 style={{ margin: 0, fontSize: 36 }}>Which name <em>is this?</em></h2>
      <div className="opts">
        {q!.opts.map(o => <button key={o.n} className={`opt ${picked !== null ? (o.n === q!.name.n ? "ok" : o.n === picked ? "no" : "") : ""}`} onClick={() => pick(o)}>{o.en}</button>)}
      </div>
      {picked !== null && <p className="note" style={{ margin: "0 auto" }}>{q!.name.tr} · {q!.name.en}. {q!.name.line}</p>}
    </section>
  );
}
