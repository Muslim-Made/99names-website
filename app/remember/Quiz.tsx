"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NAMES, Name, arNum } from "@/lib/names";
import { HOUR_LABEL, hourForName } from "@/lib/hour";
import { Mark } from "@/components/Rays";
import { SWATCH } from "@/components/HourDial";

/* ---------------- mastery model ----------------
 * Per-name, in localStorage. A name is mastered after 2 correct answers
 * in 2 different question formats. A miss sends it back to learning.
 */
type Fmt = "ar2en" | "en2ar" | "tr2en" | "en2tr";
type Rec = { c: number; f: Fmt[] };
type Mastery = Record<number, Rec>;

const KEY = "99names:mastery";

function loadMastery(): Mastery {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) || "null");
    if (m) return m;
    // migrate the old "known" list, one correct each
    const known: number[] = JSON.parse(localStorage.getItem("99names:known") || "[]");
    const out: Mastery = {};
    known.forEach(n => { out[n] = { c: 1, f: ["ar2en"] }; });
    return out;
  } catch { return {}; }
}
const saveMastery = (m: Mastery) => localStorage.setItem(KEY, JSON.stringify(m));
const isMastered = (r?: Rec) => !!r && r.c >= 2 && r.f.length >= 2;

/* ---------------- levels ---------------- */
const LEVELS = Array.from({ length: 9 }, (_, i) => NAMES.slice(i * 11, i * 11 + 11));
const levelDone = (m: Mastery, li: number) => LEVELS[li].filter(n => isMastered(m[n.n])).length;

/* ---------------- questions ---------------- */
function shuffle<T>(a: T[]) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

type Q = { name: Name; fmt: Fmt; opts: Name[] };
const PROMPT: Record<Fmt, string> = {
  ar2en: "What does this name mean?",
  tr2en: "What does this name mean?",
  en2ar: "Which is the Arabic?",
  en2tr: "Which name is this?",
};

function buildRound(pool: Name[], m: Mastery): Q[] {
  // every name once; the least-known first get the gentler recognition formats
  const qs = shuffle(pool).map(name => {
    const r = m[name.n];
    const fmt: Fmt = !r || r.c === 0
      ? (Math.random() < 0.5 ? "ar2en" : "tr2en")
      : shuffle<Fmt>(["en2ar", "en2tr", "ar2en"])[0];
    const distract = shuffle(pool.filter(n => n.n !== name.n)).slice(0, 3);
    return { name, fmt, opts: shuffle([name, ...distract]) };
  });
  return qs;
}

const optLabel = (n: Name, fmt: Fmt) => fmt === "en2ar" ? n.ar : fmt === "en2tr" ? n.tr : n.en;
const promptText = (q: Q) => q.fmt === "ar2en" ? q.name.ar : q.fmt === "tr2en" ? q.name.tr : q.name.en;

/* ---------------- component ---------------- */
/* cert level: 0–8 for a single level's certificate, null for the grand one */
type View = { kind: "path" } | { kind: "round"; level: number } | { kind: "cert"; level: number | null };

export default function Quiz() {
  const [m, setM] = useState<Mastery | null>(null);
  const [view, setView] = useState<View>({ kind: "path" });
  useEffect(() => { setM(loadMastery()); }, []);
  if (!m) return <div className="wrap quiz" />;

  const mastered = NAMES.filter(n => isMastered(m[n.n])).length;
  const update = (next: Mastery) => { setM({ ...next }); saveMastery(next); };
  const openCert = (level: number | null) => setView({ kind: "cert", level });

  if (view.kind === "round") return <Round level={view.level} m={m} update={update} exit={() => setView({ kind: "path" })} openCert={openCert} />;
  if (view.kind === "cert") return <Certificate level={view.level} mastered={mastered} back={() => setView({ kind: "path" })} />;
  return <Path m={m} mastered={mastered} start={l => setView({ kind: "round", level: l })} openCert={openCert} />;
}

/* ---------------- the path ---------------- */
function Path({ m, mastered, start, openCert }: { m: Mastery; mastered: number; start: (l: number) => void; openCert: (l: number | null) => void }) {
  // the recommended next level: first one not fully mastered
  const next = LEVELS.findIndex((_, i) => levelDone(m, i) < 11);
  const allDone = next === -1;
  return (
    <section className="wrap quiz path">
      <div className="eyebrow">Remember</div>
      <h2 style={{ margin: 0 }}>Ninety-nine, <em>by heart.</em></h2>
      <p className="lede" style={{ textAlign: "center", margin: "0 auto" }}>
        Nine gentle levels, eleven names each. A name is yours once you've answered it right twice, two different ways. No streaks, no timers — take two years if you like.
      </p>
      <div className="mcount"><strong>{mastered}</strong> of 99 names are yours</div>
      <div className="grid99">{NAMES.map(n => <i key={n.n} className={isMastered(m[n.n]) ? "on" : ""} title={n.tr} />)}</div>
      <div className="levels">
        {LEVELS.map((names, i) => {
          const done = levelDone(m, i);
          const pct = Math.round((done / 11) * 100);
          const h = hourForName(names[0].n);
          return (
            <div key={i} role="button" tabIndex={0} className={`lvl ${i === next ? "next" : ""} ${done === 11 ? "full" : ""}`}
              onClick={() => start(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(i); } }}>
              <span className="lvl-ring" style={{ background: `conic-gradient(currentColor ${pct}%, transparent 0)` }}>
                <span className="lvl-num">{arNum(i + 1)}</span>
              </span>
              <span className="lvl-meta">
                <b>Level {i + 1} · {HOUR_LABEL[h]}</b>
                <span>{names[0].tr} → {names[10].tr}</span>
                {done === 11
                  ? <button className="lvl-cert" onClick={e => { e.stopPropagation(); openCert(i); }}>Certificate earned — view</button>
                  : <span className="note">{done ? `${done} of 11 mastered` : "Not yet begun"}</span>}
              </span>
              {i === next && <span className="lvl-cue">Continue here</span>}
            </div>
          );
        })}
      </div>
      <button className={`pill ${allDone ? "" : "o"}`} onClick={() => openCert(null)} disabled={!allDone} style={allDone ? {} : { opacity: 0.55, cursor: "default" }}>
        {allDone ? "Your grand certificate" : `Grand certificate · unlocks at 99 of 99`}
      </button>
      {!allDone && <p className="note" style={{ margin: "0 auto" }}>Each finished level earns its own certificate along the way.</p>}
    </section>
  );
}

/* ---------------- a round ---------------- */
function Round({ level, m, update, exit, openCert }: { level: number; m: Mastery; update: (m: Mastery) => void; exit: () => void; openCert: (l: number | null) => void }) {
  const pool = LEVELS[level];
  const [qs] = useState(() => buildRound(pool, m));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const q = qs[i];

  const pick = (n: Name) => {
    if (picked !== null || !q) return;
    setPicked(n.n);
    const right = n.n === q.name.n;
    const rec: Rec = m[q.name.n] ?? { c: 0, f: [] };
    if (right) {
      setScore(s => s + 1);
      setStreak(s => { const v = s + 1; setBest(b => Math.max(b, v)); return v; });
      m[q.name.n] = { c: rec.c + 1, f: rec.f.includes(q.fmt) ? rec.f : [...rec.f, q.fmt] };
    } else {
      setStreak(0);
      m[q.name.n] = { c: 0, f: [] }; // back to learning, warmly
    }
    update(m);
  };
  const advance = () => { setPicked(null); setI(x => x + 1); };

  if (i >= qs.length) {
    const done = levelDone(m, level);
    return (
      <section className="wrap quiz">
        <div className="eyebrow">Level {level + 1} · done</div>
        <div className="result rise">
          <Mark size={56} />
          <h2 style={{ margin: 0 }}>{score} of {qs.length} <em>this round.</em></h2>
          <p className="lede" style={{ textAlign: "center" }}>
            {done === 11 ? "All eleven of these names are yours now. Alhamdulillah." : `${done} of these eleven are mastered. The rest will come back to you, gently.`}
            {best >= 5 ? ` A run of ${best} in a row.` : ""}
          </p>
          <div className="grid99" style={{ gridTemplateColumns: "repeat(11,1fr)", maxWidth: 340 }}>
            {pool.map(n => <i key={n.n} className={isMastered(m[n.n]) ? "on" : ""} title={n.tr} />)}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            {done === 11 && <button className="pill" onClick={() => openCert(level)}>Your Level {level + 1} certificate</button>}
            <button className={`pill ${done === 11 ? "o" : ""}`} onClick={exit}>Back to the path</button>
            <Link href="/names" className="pill o">All 99</Link>
          </div>
        </div>
      </section>
    );
  }

  const answered = picked !== null;
  const right = answered && picked === q.name.n;
  return (
    <section className="wrap quiz">
      <div className="qbar">
        <button className="qexit" onClick={exit} aria-label="Back to the path">←</button>
        <div className="qtrack"><span style={{ width: `${(i / qs.length) * 100}%` }} /></div>
        <div className="qstreak" data-on={streak >= 3}>{streak >= 3 ? `${streak} in a row` : `${i + 1} / ${qs.length}`}</div>
      </div>
      <div className={`qprompt ${q.fmt === "ar2en" ? "ar big" : q.fmt === "en2ar" || q.fmt === "en2tr" ? "endisp" : "trdisp"}`}>{promptText(q)}</div>
      <h2 style={{ margin: 0, fontSize: 30 }}>{PROMPT[q.fmt]}</h2>
      <div className={`opts ${q.fmt === "en2ar" ? "ar-opts" : ""}`}>
        {q.opts.map(o => (
          <button key={o.n}
            className={`opt ${answered ? (o.n === q.name.n ? "ok" : o.n === picked ? "no" : "dim") : ""} ${q.fmt === "en2ar" ? "ar" : ""}`}
            onClick={() => pick(o)}>
            {optLabel(o, q.fmt)}
          </button>
        ))}
      </div>
      {answered && (
        <div className="qfeed rise">
          <span className="ar qfeed-ar">{q.name.ar}</span>
          <p className="note" style={{ margin: "0 auto" }}>
            <strong>{q.name.tr}</strong> · {q.name.en}. {right ? q.name.line : "It will come back around — that's how remembering works."}
          </p>
          <button className="pill" onClick={advance}>Continue</button>
        </div>
      )}
    </section>
  );
}

/* ---------------- certificates ----------------
 * One per finished level, each a little richer than the last: its hour's sky
 * as a ribbon, one more medallion lit. The grand one, at 99 of 99, wears gold.
 */
function Certificate({ level, mastered, back }: { level: number | null; mastered: number; back: () => void }) {
  const grand = level === null;
  const names = grand ? NAMES : LEVELS[level];
  const h = hourForName(names[0].n);
  const lit = grand ? 9 : level + 1;
  const [who, setWho] = useState("");
  useEffect(() => { setWho(localStorage.getItem("99names:certname") || ""); }, []);
  const save = (v: string) => { setWho(v); localStorage.setItem("99names:certname", v); };
  const date = useMemo(() => new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }), []);
  const share = async () => {
    const text = grand
      ? `I've learned all 99 Names of Allah, by heart. 99names.net/remember`
      : `I've learned the ${HOUR_LABEL[h]} names of Allah, by heart — level ${level + 1} of 9. 99names.net/remember`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch { } }
    await navigator.clipboard.writeText(text);
  };
  return (
    <section className="wrap quiz">
      <div className="eyebrow">{grand ? "Remember · complete" : `Level ${level + 1} of 9 · complete`}</div>
      <div className={`cert rise ${grand ? "grand" : ""}`}>
        {!grand && <div className="cert-ribbon" style={{ background: SWATCH[h] }} aria-hidden="true" />}
        <Mark size={64} />
        <div className="cert-medals" aria-label={`${lit} of 9 levels complete`}>
          {Array.from({ length: 9 }, (_, i) => <i key={i} className={i < lit ? "on" : ""} />)}
        </div>
        <div className="cert-rule" />
        <p className="cert-small">This certifies that</p>
        <input className="cert-name" value={who} onChange={e => save(e.target.value)} placeholder="your name" aria-label="Your name" />
        {grand ? (
          <>
            <p className="cert-small">has learned all ninety-nine</p>
            <h2 style={{ margin: "4px 0" }}>Names of <em>Allah</em></h2>
            <p className="ar cert-ar">الأسماء الحسنى</p>
            <p className="cert-small">99 of 99, by heart · {date}</p>
          </>
        ) : (
          <>
            <p className="cert-small">has learned the eleven</p>
            <h2 style={{ margin: "4px 0" }}>{HOUR_LABEL[h]} <em>names.</em></h2>
            <p className="ar cert-ar">{names[0].ar} ← {names[10].ar}</p>
            <p className="cert-small">{names[0].tr} to {names[10].tr} · {date}</p>
          </>
        )}
        <div className="cert-rule" />
        <p className="note" style={{ textAlign: "center" }}>
          {grand
            ? <>&ldquo;And to Allah belong the best names, so invoke Him by them.&rdquo; — 7:180</>
            : lit === 9
              ? <>Nine of nine. The grand certificate is waiting on the path.</>
              : <>{9 - lit} more {9 - lit === 1 ? "level" : "levels"} to the grand certificate.</>}
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="pill" onClick={() => window.print()}>Print or save</button>
        <button className="pill o" onClick={share}>Share</button>
        <button className="pill o" onClick={back}>Back to the path</button>
      </div>
    </section>
  );
}
