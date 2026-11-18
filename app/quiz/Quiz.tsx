"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { NAMES, Name, arNum } from "@/lib/names";
import { HOUR_LABEL, hourForName, isDark } from "@/lib/hour";
import {
  Mastery, Step, Choice, Match, Meet, Ctx, PROMPT, LEVELS, CHECK_SIZE,
  loadMastery, saveMastery, isMastered, isLearning, countMastered, levelDone, nextLevel, levelOf,
  grade, markSeen, buildLesson, buildReview, buildCheck, dueNames, estimate, retryOf, optLabel, promptText, shuffle,
} from "@/lib/learn";
import { Mark } from "@/components/Rays";
import Ring from "@/components/Ring";
import NameCard from "@/components/NameCard";
import { SWATCH } from "@/components/HourDial";

type View =
  | { kind: "hub" }
  | { kind: "lesson"; level: number; run: number }
  | { kind: "review"; run: number }
  | { kind: "check"; run: number }
  | { kind: "cert"; level: number | null };

/** What a finished session hands back. */
type Outcome = { score: number; total: number; earned: Name[]; missed: Name[] };

const REVIEW_OPENS_AT = 3;

/* ---------------- a soft chime, off until asked for ---------------- */
let audio: AudioContext | null = null;
function chime(right: boolean) {
  try {
    audio ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t = audio.currentTime;
    (right ? [523.25, 783.99] : [311.13]).forEach((hz, i) => {
      const o = audio!.createOscillator(), g = audio!.createGain();
      o.type = "sine"; o.frequency.value = hz;
      g.gain.setValueAtTime(0, t + i * 0.09);
      g.gain.linearRampToValueAtTime(0.07, t + i * 0.09 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.7);
      o.connect(g).connect(audio!.destination);
      o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.75);
    });
  } catch { /* no audio: the quiz is fine without it */ }
}
function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-SA"; u.rate = 0.75;
  const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("ar"));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

/* ---------------- the page ---------------- */
export default function Quiz() {
  const [m, setM] = useState<Mastery | null>(null);
  const [view, setView] = useState<View>({ kind: "hub" });

  useEffect(() => {
    const loaded = loadMastery();
    setM(loaded);
    // deep links from the homepage: /quiz?level=3, /quiz?mode=check, /quiz?mode=review
    const q = new URLSearchParams(location.search);
    const lv = Number(q.get("level"));
    if (q.get("mode") === "check") setView({ kind: "check", run: 0 });
    else if (q.get("mode") === "review" && countMastered(loaded) >= REVIEW_OPENS_AT) setView({ kind: "review", run: 0 });
    else if (lv >= 1 && lv <= 9) setView({ kind: "lesson", level: lv - 1, run: 0 });
    if (location.search) history.replaceState(null, "", location.pathname);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const commit = useCallback((next: Mastery) => { setM({ ...next }); saveMastery(next); }, []);
  if (!m) return <div className="wrap quiz" />;

  const hub = () => setView({ kind: "hub" });
  const openCert = (level: number | null) => setView({ kind: "cert", level });
  const startLesson = (level: number) => setView(v => ({ kind: "lesson", level, run: v.kind === "lesson" ? v.run + 1 : 0 }));

  if (view.kind === "lesson") return <Lesson key={`${view.level}-${view.run}`} level={view.level} m={m} commit={commit} exit={hub} next={startLesson} openCert={openCert} />;
  if (view.kind === "review") return <Review key={view.run} m={m} commit={commit} exit={hub} again={() => setView({ kind: "review", run: view.run + 1 })} />;
  if (view.kind === "check") return <Check key={view.run} m={m} commit={commit} exit={hub} start={startLesson} again={() => setView({ kind: "check", run: view.run + 1 })} />;
  if (view.kind === "cert") return <Certificate level={view.level} back={hub} />;
  return <Hub m={m} start={startLesson} review={() => setView({ kind: "review", run: 0 })} check={() => setView({ kind: "check", run: 0 })} openCert={openCert} />;
}

/* ---------------- the hub ---------------- */
const NODE_X = (i: number) => (i % 2 ? 76 : 24);
const ROW = 132;

function Hub({ m, start, review, check, openCert }: { m: Mastery; start: (l: number) => void; review: () => void; check: () => void; openCert: (l: number | null) => void }) {
  const mastered = countMastered(m);
  const lit = NAMES.filter(n => isMastered(m[n.n])).map(n => n.n);
  const soft = NAMES.filter(n => isLearning(m[n.n])).map(n => n.n);
  const next = nextLevel(m);
  const allDone = next === -1;
  const due = dueNames(m).length;
  // has the level you are on been touched yet?
  const started = !allDone && LEVELS[next].some(n => isMastered(m[n.n]) || isLearning(m[n.n]));
  const upNext = allDone ? [] : LEVELS[next].filter(n => !isMastered(m[n.n])).slice(0, 2);

  return (
    <div className="quizhub">
      <section className="wrap qhero">
        <div className="qhero-text">
          <h1 className="qhero-h1">Ninety-nine names, <em>by heart.</em></h1>
          <p className="lede">Meet four names, answer a few gentle questions, and watch the mark draw itself: one ray for every name you know. Nothing is timed. Your progress stays on this device.</p>
          <div className="actions-row">
            <button className="pill" onClick={() => start(allDone ? 0 : next)}>
              {allDone ? "Practise any level" : started ? `Continue level ${next + 1}` : next === 0 ? "Start with Ar-Rahman" : `Start level ${next + 1}`}
            </button>
            <button className="pill o" onClick={check}>How many do I know?</button>
          </div>
        </div>
        <Ring lit={lit} soft={soft} className="qhero-ring">
          <b>{mastered}</b>
          <span>of 99 are yours</span>
        </Ring>
      </section>

      <section className="wrap modes">
        <button className="mode" onClick={() => start(allDone ? 0 : next)}>
          <span className="mode-k">Learn</span>
          <b>{allDone ? "All nine levels done" : `Level ${next + 1} · ${HOUR_LABEL[hourForName(LEVELS[next][0].n)]}`}</b>
          <span className="note">{allDone ? "Every level is open for practice, as often as you like." : `Next up: ${upNext.map(n => n.tr).join(" and ")}. About three minutes.`}</span>
          <i className="mode-go" aria-hidden="true">→</i>
        </button>
        <button className="mode" onClick={review} disabled={mastered < REVIEW_OPENS_AT}>
          <span className="mode-k">Daily five</span>
          <b>{mastered < REVIEW_OPENS_AT ? "Keep what you know" : due ? `${due} ${due === 1 ? "name is" : "names are"} due today` : "Five names, to keep them"}</b>
          <span className="note">{mastered < REVIEW_OPENS_AT ? "Opens once three names are yours. Then five of them come back each day, so they stay." : "Five names you already know, asked a new way. A minute, no more."}</span>
          <i className="mode-go" aria-hidden="true">→</i>
        </button>
        <button className="mode" onClick={check}>
          <span className="mode-k">The check</span>
          <b>How many do you know?</b>
          <span className="note">Twenty names from across the ninety-nine. Find your number, and the level to begin at.</span>
          <i className="mode-go" aria-hidden="true">→</i>
        </button>
      </section>

      <section className="wrap pathsec">
        <h2>Nine levels, <em>dawn to night.</em></h2>
        <p className="lede">Eleven names each, in the traditional order. Every level is open, so begin wherever you like.</p>
        <div className="lpath" style={{ height: ROW * 9 }}>
          <svg className="lpath-line" viewBox={`0 0 100 ${ROW * 9}`} preserveAspectRatio="none" aria-hidden="true">
            {LEVELS.slice(0, 8).map((_, i) => {
              const y0 = ROW * i + ROW / 2, y1 = y0 + ROW, x0 = NODE_X(i), x1 = NODE_X(i + 1);
              return <path key={i} className={levelDone(m, i) === 11 ? "done" : ""} vectorEffect="non-scaling-stroke"
                d={`M${x0},${y0} C${x0},${y0 + ROW * 0.55} ${x1},${y1 - ROW * 0.55} ${x1},${y1}`} />;
            })}
          </svg>
          {LEVELS.map((names, i) => {
            const done = levelDone(m, i);
            const h = hourForName(names[0].n);
            const side = i % 2 ? "l" : "r";
            return (
              <div key={i} className={`lnode side-${side} ${i === next ? "next" : ""} ${done === 11 ? "full" : ""}`}
                style={{ top: ROW * i + ROW / 2, left: `${NODE_X(i)}%` }}>
                <button className="lnode-btn" onClick={() => start(i)} aria-label={`Level ${i + 1}, ${HOUR_LABEL[h]}: ${names[0].tr} to ${names[10].tr}. ${done} of 11 known.`}
                  style={{ background: `conic-gradient(var(--fg) ${(done / 11) * 100}%, var(--line) 0)` }}>
                  <span className="lnode-disc" style={{ background: SWATCH[h], color: isDark(h) ? "#F4EEE4" : "#2A2622" }}>{arNum(i + 1)}</span>
                </button>
                <div className="lnode-meta">
                  <b>Level {i + 1} · {HOUR_LABEL[h]}</b>
                  <span>{names[0].tr} → {names[10].tr}</span>
                  {done === 11
                    ? <button className="lvl-cert" onClick={() => openCert(i)}>Certificate earned · view</button>
                    : <span className="note">{i === next ? (started ? `Continue here · ${done} of 11 known` : "Begin here") : done ? `${done} of 11 known` : "Not yet begun"}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="wrap yours">
        <h2>Your <em>ninety-nine.</em></h2>
        <p className="lede">One dot for each name, a row for each level. Tap any dot to read that name.</p>
        <div className="grid99 wide">
          {NAMES.map(n => (
            <Link key={n.n} href={`/names/${n.slug}`} title={`${n.n}. ${n.tr} · ${n.en}`} aria-label={`${n.tr}, ${n.en}`}
              className={isMastered(m[n.n]) ? "on" : isLearning(m[n.n]) ? "half" : ""} />
          ))}
        </div>
        <div className="legend"><span><i className="on" /> Yours</span><span><i className="half" /> Learning</span><span><i /> Still to meet</span></div>
        <button className={`pill ${allDone ? "" : "o"}`} onClick={() => openCert(null)} disabled={!allDone}>
          {allDone ? "Your grand certificate" : "Grand certificate · opens at 99 of 99"}
        </button>
      </section>
    </div>
  );
}

/* ---------------- a session: any run of steps ---------------- */
function Session({ steps: initial, ctx, m, commit, exit, done, label }: {
  steps: Step[]; ctx: Ctx; m: Mastery; commit: (m: Mastery) => void; exit: () => void; done: (o: Outcome) => void; label: string;
}) {
  const [steps, setSteps] = useState(initial);
  const [i, setI] = useState(0);
  const [sfx, setSfx] = useState(false);
  const out = useRef<Outcome>({ score: 0, total: 0, earned: [], missed: [] });
  const retried = useRef<Record<number, number>>({});
  useEffect(() => { try { setSfx(localStorage.getItem("99names:sfx") === "on"); } catch { } }, []);
  const toggleSfx = () => setSfx(s => { try { localStorage.setItem("99names:sfx", s ? "off" : "on"); } catch { } if (!s) chime(true); return !s; });

  const record = (name: Name, fmt: Parameters<typeof grade>[2], right: boolean, first: boolean) => {
    const { newlyMastered } = grade(m, name, fmt, right, ctx);
    const o = out.current;
    if (first) { o.total++; if (right) o.score++; }
    if (newlyMastered && !o.earned.includes(name)) o.earned.push(name);
    if (!right && !o.missed.includes(name)) o.missed.push(name);
    return newlyMastered;
  };
  const answer = (q: Choice, right: boolean) => {
    const newly = record(q.name, q.fmt, right, !q.retry);
    if (sfx) chime(right);
    if (!right) {
      navigator.vibrate?.(40);
      const tries = retried.current[q.name.n] ?? 0;
      if (ctx !== "check" && tries < 2) { retried.current[q.name.n] = tries + 1; setSteps(s => [...s, retryOf(q)]); }
    }
    commit(m);
    return newly;
  };
  const matched = (names: Name[], missed: Set<number>) => {
    names.forEach(n => record(n, "match", !missed.has(n.n), true));
    if (sfx) chime(true);
    commit(m);
  };
  const met = (name: Name) => { markSeen(m, name); commit(m); };
  const advance = () => { if (i + 1 >= steps.length) done(out.current); else setI(i + 1); };

  const step = steps[i];
  return (
    <section className="wrap quiz session">
      <div className="qbar">
        <button className="qexit" onClick={exit} aria-label="Leave and go back to the path">✕</button>
        <div className="qtrack" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={i}><span style={{ width: `${(i / steps.length) * 100}%` }} /></div>
        <div className="qcount">{label} · {i + 1} / {steps.length}</div>
        <button className={`qsfx ${sfx ? "on" : ""}`} onClick={toggleSfx} aria-pressed={sfx} title={sfx ? "Sound is on" : "Sound is off"}>
          <span className="amb-bars" aria-hidden="true"><i /><i /><i /><i /></span><span className="qsfx-l">Sound</span>
        </button>
      </div>
      <div className="qstage rise" key={i}>
        {step.kind === "meet" && <MeetStep s={step} onDone={() => { met(step.name); advance(); }} />}
        {step.kind === "choice" && <ChoiceStep q={step} onAnswer={r => answer(step, r)} onNext={advance} ctx={ctx} />}
        {step.kind === "match" && <MatchStep s={step} onDone={missed => { matched(step.names, missed); advance(); }} />}
      </div>
    </section>
  );
}

/* ---------------- meeting a name: a card you turn over ---------------- */
function MeetStep({ s, onDone }: { s: Meet; onDone: () => void }) {
  const [turned, setTurned] = useState(false);
  const n = s.name;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (turned) onDone(); else setTurned(true); }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });
  return (
    <div className="meet">
      <p className="qkind">A new name · No. {n.n}</p>
      <div className={`flip ${turned ? "turned" : ""}`} role="button" tabIndex={0} aria-label={turned ? "Turn the card back" : "Turn the card over to read what it means"} onClick={() => setTurned(t => !t)}>
        <div className="flip-in">
          <div className="flip-face"><NameCard name={n} href={false} big /></div>
          <div className="flip-face flip-back">
            <span className="ar flip-ar">{n.ar}</span>
            <b>{n.en}</b>
            <p>{n.meaning}</p>
            <em>{n.line}</em>
            <span className="flip-root">Root <span className="ar">{n.root}</span></span>
          </div>
        </div>
      </div>
      <h2 className="meet-h">{n.tr}</h2>
      <p className="note meet-note">{turned ? "Say it once, slowly. Then carry on." : "This is how it is written. Turn the card to read what it means."}</p>
      <div className="actions-row">
        <button className="pill o" onClick={() => speak(n.ar)}>▶ Hear it</button>
        {turned
          ? <button className="pill" onClick={onDone}>I&rsquo;ve met this one</button>
          : <button className="pill" onClick={() => setTurned(true)}>Turn it over</button>}
      </div>
    </div>
  );
}

/* ---------------- one question, four answers ---------------- */
const YES = ["Yes.", "That's it.", "You know this one.", "Exactly."];

function ChoiceStep({ q, onAnswer, onNext, ctx }: { q: Choice; onAnswer: (right: boolean) => boolean; onNext: () => void; ctx: Ctx }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [newly, setNewly] = useState(false);
  const yes = useMemo(() => YES[Math.floor(Math.random() * YES.length)], []);
  const answered = picked !== null;
  const right = answered && picked === q.name.n;

  const pick = (n: Name) => {
    if (answered) return;
    setPicked(n.n);
    setNewly(onAnswer(n.n === q.name.n));
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const k = Number(e.key);
      if (!answered && k >= 1 && k <= q.opts.length) pick(q.opts[k - 1]);
      else if (answered && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onNext(); }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });

  const cls = q.fmt === "ar2en" ? "ar big" : q.fmt === "tr2en" ? "trdisp" : q.fmt === "mean2name" ? "meandisp" : "endisp";
  return (
    <>
      {(q.review || q.retry) && <p className="qkind">{q.retry ? "Once more, a different way" : "One you already know"}</p>}
      <div className={`qprompt ${cls}`}>{promptText(q)}</div>
      {q.both && <div className="qprompt-tr">{q.name.tr}</div>}
      <h2 className="qask">{PROMPT[q.fmt]}</h2>
      <div className={`opts ${q.fmt === "en2ar" ? "ar-opts" : ""}`}>
        {q.opts.map((o, k) => (
          <button key={o.n} disabled={answered}
            className={`opt ${answered ? (o.n === q.name.n ? "ok" : o.n === picked ? "no" : "dim") : ""} ${q.fmt === "en2ar" ? "ar" : ""}`}
            onClick={() => pick(o)}>
            <kbd aria-hidden="true">{k + 1}</kbd>
            <span>{optLabel(o, q.fmt)}</span>
          </button>
        ))}
      </div>
      <div className="qfeed-slot" aria-live="polite">
        {answered && (
          <div className={`qfeed rise ${right ? "yes" : "notyet"}`}>
            <span className="ar qfeed-ar">{q.name.ar}</span>
            <div className="qfeed-text">
              <b>{right ? (newly ? "This name is yours now." : yes) : `This one is ${q.name.tr}.`}</b>
              <p className="note"><strong>{q.name.tr}</strong> · {q.name.en}. {right ? q.name.line : ctx === "check" ? "Now you have met it." : "It will come back around. That is how remembering works."}</p>
            </div>
            <div className="qfeed-act">
              <button className="qhear" onClick={() => speak(q.name.ar)} aria-label={`Hear ${q.name.tr}`}>▶</button>
              <button className="pill" onClick={onNext} autoFocus>Continue</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- matching: four names, four meanings ---------------- */
function MatchStep({ s, onDone }: { s: Match; onDone: (missed: Set<number>) => void }) {
  const [left] = useState(() => shuffle(s.names));
  const [rightCol] = useState(() => shuffle(s.names));
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const [paired, setPaired] = useState<number[]>([]);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const missed = useRef(new Set<number>());

  const tryPair = (l: number | null, r: number | null) => {
    if (l === null || r === null) return;
    if (l === r) { setPaired(p => [...p, l]); setA(null); setB(null); return; }
    missed.current.add(l);
    navigator.vibrate?.(40);
    setWrong([l, r]);
    setTimeout(() => { setWrong(null); setA(null); setB(null); }, 520);
  };
  const all = paired.length === s.names.length;
  useEffect(() => {
    if (!all) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDone(missed.current); } };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });
  const state = (n: number, sel: number | null, side: 0 | 1) =>
    paired.includes(n) ? "ok" : wrong?.[side] === n ? "no" : sel === n ? "sel" : "";

  return (
    <div className="match">
      <h2 className="qask">Match each name to its meaning.</h2>
      <p className="note">Tap a name, then tap what it means.</p>
      <div className="match-cols">
        <div className="match-col">
          {left.map(n => (
            <button key={n.n} className={`mtile ${state(n.n, a, 0)}`} disabled={paired.includes(n.n) || !!wrong}
              onClick={() => { setA(n.n); tryPair(n.n, b); }}>
              <span className="ar">{n.ar}</span><small>{n.tr}</small>
            </button>
          ))}
        </div>
        <div className="match-col">
          {rightCol.map(n => (
            <button key={n.n} className={`mtile en ${state(n.n, b, 1)}`} disabled={paired.includes(n.n) || !!wrong}
              onClick={() => { setB(n.n); tryPair(a, n.n); }}>
              <span>{n.en}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="qfeed-slot" aria-live="polite">
        {all && (
          <div className="qfeed rise yes">
            <div className="qfeed-text">
              <b>{missed.current.size ? "All four, in the end." : "All four, first time."}</b>
              <p className="note">{missed.current.size ? "The ones that slipped will come back around." : "These are settling in."}</p>
            </div>
            <div className="qfeed-act"><button className="pill" onClick={() => onDone(missed.current)} autoFocus>Continue</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- a lesson in a level ---------------- */
function Lesson({ level, m, commit, exit, next, openCert }: { level: number; m: Mastery; commit: (m: Mastery) => void; exit: () => void; next: (l: number) => void; openCert: (l: number | null) => void }) {
  const [plan] = useState(() => buildLesson(level, m));
  const [before] = useState(() => NAMES.filter(n => isMastered(m[n.n])).map(n => n.n));
  const [out, setOut] = useState<Outcome | null>(null);
  if (!out) return <Session steps={plan.steps} ctx="lesson" m={m} commit={commit} exit={exit} done={setOut} label={`Level ${level + 1}`} />;

  const lit = NAMES.filter(n => isMastered(m[n.n])).map(n => n.n);
  const fresh = lit.filter(n => !before.includes(n));
  const done = levelDone(m, level);
  const full = done === 11;
  const onward = nextLevel(m);
  return (
    <section className="wrap quiz">
      <div className="result rise">
        <Ring lit={lit} fresh={fresh} soft={NAMES.filter(n => isLearning(m[n.n])).map(n => n.n)} className="result-ring">
          <b>{lit.length}</b><span>of 99</span>
        </Ring>
        <h2>
          {plan.practice ? <>{out.score} of {out.total}, <em>kept warm.</em></>
            : fresh.length ? <>{fresh.length === 1 ? "One more name is" : `${fresh.length} more names are`} <em>yours.</em></>
              : <>A good round. <em>They&rsquo;re settling in.</em></>}
        </h2>
        <p className="lede">
          {full ? `All eleven names of level ${level + 1} are yours now. Alhamdulillah.`
            : fresh.length ? `${fresh.length === 1 ? "A ray has" : `${fresh.length} rays have`} joined the mark. ${done} of the eleven in this level are known.`
              : "Nothing is lost. The names you missed will be the first ones waiting next time."}
        </p>
        {!plan.practice && (
          <div className="earned">
            {plan.focus.map(n => (
              <Link key={n.n} href={`/names/${n.slug}`} className={`echip ${isMastered(m[n.n]) ? "on" : ""}`}>
                <span className="ar">{n.ar}</span><span><b>{n.tr}</b>{n.en}</span><i>{isMastered(m[n.n]) ? "Yours" : "Learning"}</i>
              </Link>
            ))}
          </div>
        )}
        <div className="actions-row">
          {full && <button className="pill" onClick={() => openCert(level)}>Your level {level + 1} certificate</button>}
          {!full && <button className="pill" onClick={() => next(level)}>Next lesson</button>}
          {full && onward !== -1 && <button className="pill o" onClick={() => next(onward)}>On to level {onward + 1}</button>}
          {full && onward === -1 && <button className="pill o" onClick={() => openCert(null)}>The grand certificate</button>}
          <button className="pill o" onClick={exit}>Back to the path</button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- the daily five ---------------- */
function Review({ m, commit, exit, again }: { m: Mastery; commit: (m: Mastery) => void; exit: () => void; again: () => void }) {
  const [steps] = useState(() => buildReview(m));
  const [out, setOut] = useState<Outcome | null>(null);
  if (!out) return <Session steps={steps} ctx="review" m={m} commit={commit} exit={exit} done={setOut} label="Daily five" />;
  const lit = NAMES.filter(n => isMastered(m[n.n])).map(n => n.n);
  return (
    <section className="wrap quiz">
      <div className="result rise">
        <Ring lit={lit} className="result-ring"><b>{out.score}</b><span>of {out.total}</span></Ring>
        <h2>{out.score === out.total ? <>All {out.total}, <em>still yours.</em></> : <>{out.score} of {out.total}, <em>and that&rsquo;s fine.</em></>}</h2>
        <p className="lede">
          {out.missed.length
            ? `${out.missed.map(n => n.tr).join(", ")} will come back sooner. Names you know well come back less and less often.`
            : "Names you know well come back less and less often. That is all there is to keeping them."}
        </p>
        <div className="actions-row">
          <button className="pill" onClick={exit}>Back to the path</button>
          <button className="pill o" onClick={again}>Five more</button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- the check: how many do you know? ---------------- */
function Check({ m, commit, exit, start, again }: { m: Mastery; commit: (m: Mastery) => void; exit: () => void; start: (l: number) => void; again: () => void }) {
  const [steps] = useState(buildCheck);
  const [out, setOut] = useState<Outcome | null>(null);
  const [copied, setCopied] = useState(false);
  if (!out) return <Session steps={steps} ctx="check" m={m} commit={commit} exit={exit} done={setOut} label="The check" />;

  const about = estimate(out.score);
  // begin where it first got hard
  const begin = out.missed.length ? Math.min(...out.missed.map(n => levelOf(n.n))) : 0;
  const share = async () => {
    const text = `I know about ${about} of the 99 Names of Allah. How many do you know? 99names.net/quiz`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch { } }
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { }
  };
  // draw roughly that many rays, spread around the ring, for the picture of it
  const picture = Array.from({ length: about }, (_, k) => Math.round((k * 99) / Math.max(about, 1)) + 1);
  return (
    <section className="wrap quiz">
      <div className="result rise">
        <Ring lit={picture} fresh={picture} pace={0.03} className="result-ring"><b>{about}</b><span>of 99, about</span></Ring>
        <h2>You knew {out.score} of {CHECK_SIZE}. <em>That&rsquo;s about {about} of the ninety-nine.</em></h2>
        <p className="lede">
          {out.score === CHECK_SIZE ? "Every one of them. The levels will go quickly: begin at the first and collect your certificates."
            : out.score >= 14 ? `You carry a great many already. Level ${begin + 1} is where the first one slipped, so that is a good place to begin.`
              : out.score >= 6 ? `A real beginning. Level ${begin + 1} is where the first one slipped. Start there, four names at a time.`
                : "Then there is so much ahead of you. Begin at Ar-Rahman, four names at a time. Slower is fine."}
        </p>
        <div className="actions-row">
          <button className="pill" onClick={() => start(begin)}>Begin at level {begin + 1}</button>
          <button className="pill o" onClick={share}>{copied ? "Copied" : "Share my number"}</button>
          <button className="pill o" onClick={again}>Try twenty more</button>
          <button className="pill o" onClick={exit}>The path</button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- certificates ----------------
 * One per finished level, each a little richer than the last: its hour's sky
 * as a ribbon, one more medallion lit. The grand one, at 99 of 99, wears gold.
 */
function Certificate({ level, back }: { level: number | null; back: () => void }) {
  const grand = level === null;
  const names = grand ? NAMES : LEVELS[level];
  const h = hourForName(names[0].n);
  const lit = grand ? 9 : level + 1;
  const [who, setWho] = useState("");
  useEffect(() => { try { setWho(localStorage.getItem("99names:certname") || ""); } catch { } }, []);
  const save = (v: string) => { setWho(v); try { localStorage.setItem("99names:certname", v); } catch { } };
  const date = useMemo(() => new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }), []);
  const share = async () => {
    const text = grand
      ? `I've learned all 99 Names of Allah, by heart. 99names.net/quiz`
      : `I've learned the ${HOUR_LABEL[h]} names of Allah, by heart: level ${level + 1} of 9. 99names.net/quiz`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch { } }
    try { await navigator.clipboard.writeText(text); } catch { }
  };
  return (
    <section className="wrap quiz">
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
            ? <>&ldquo;And to Allah belong the best names, so invoke Him by them.&rdquo; Al-A&rsquo;raf 7:180</>
            : lit === 9
              ? <>Nine of nine. The grand certificate is waiting on the path.</>
              : <>{9 - lit} more {9 - lit === 1 ? "level" : "levels"} to the grand certificate.</>}
        </p>
      </div>
      <div className="actions-row" style={{ justifyContent: "center" }}>
        <button className="pill" onClick={() => window.print()}>Print or save</button>
        <button className="pill o" onClick={share}>Share</button>
        <button className="pill o" onClick={back}>Back to the path</button>
      </div>
    </section>
  );
}
