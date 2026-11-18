"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useHour } from "./HourProvider";
import { hourNames, nameOfTheHour } from "./HourHome";
import { SWATCH } from "./HourDial";
import NameCard from "./NameCard";
import Ring from "./Ring";
import { NAMES, Name, arNum } from "@/lib/names";
import { HOUR_LABEL, hourForName, isDark } from "@/lib/hour";
import {
  Choice, Mastery, LEVELS, buildChoice, seeded, grade, loadMastery, saveMastery,
  countMastered, isMastered, levelDone, nextLevel,
} from "@/lib/learn";

const PROGRESS = "99names:progress";
const day = () => Math.floor(Date.now() / 86400000);

/** Mastery, read once the page is in the browser, and kept fresh when the hero question is answered. */
function useMastery(): Mastery | null {
  const [m, setM] = useState<Mastery | null>(null);
  useEffect(() => {
    const read = () => setM(loadMastery());
    read();
    addEventListener(PROGRESS, read);
    return () => removeEventListener(PROGRESS, read);
  }, []);
  return m;
}

/* ---------------- the hero: one real question ----------------
 * The first thing the site does is ask. The name belongs to the current hour;
 * a right answer already counts toward knowing it.
 */
export function HeroQuestion() {
  const { hour } = useHour();
  const [q, setQ] = useState<Choice | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [known, setKnown] = useState(0);
  const turn = useRef(0);

  // wait a beat for the hour to settle, then ask; never swap a question that has been answered
  useEffect(() => {
    if (picked !== null) return;
    const id = setTimeout(() => {
      const name = nameOfTheHour(hour);
      setQ(buildChoice(name, "ar2en", undefined, seeded(day() * 131 + name.n)));
    }, q ? 0 : 80);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour]);

  const pick = (o: Name) => {
    if (!q || picked !== null) return;
    setPicked(o.n);
    const m = loadMastery();
    grade(m, q.name, "ar2en", o.n === q.name.n, "check");
    saveMastery(m);
    setKnown(NAMES.filter(n => (m[n.n]?.c ?? 0) > 0).length);
    dispatchEvent(new Event(PROGRESS));
  };
  const another = () => {
    if (!q) return;
    const group = hourNames(hour).filter(n => n.n !== q.name.n);
    turn.current++;
    const name = group[(day() + turn.current * 7) % group.length];
    setPicked(null);
    setQ(buildChoice(name, "ar2en"));
  };

  const answered = picked !== null;
  const right = answered && q && picked === q.name.n;
  return (
    <div className={`hq ${q ? "ready" : ""}`} data-parallax="0.04">
      <div className="hq-top"><span>Do you know this one?</span><span>{q ? `No. ${q.name.n} of 99` : ""}</span></div>
      <div className="ar hq-ar">{q?.name.ar ?? " "}</div>
      <div className="hq-tr">{q?.name.tr ?? " "}</div>
      <div className="hq-opts">
        {(q?.opts ?? [null, null, null, null]).map((o, k) => o ? (
          <button key={o.n} disabled={answered} onClick={() => pick(o)}
            className={`opt ${answered ? (o.n === q!.name.n ? "ok" : o.n === picked ? "no" : "dim") : ""}`}>
            <span>{o.en}</span>
          </button>
        ) : <span key={k} className="opt ghost" />)}
      </div>
      <div className="hq-foot" aria-live="polite">
        {answered && q ? (
          <div className="hq-reveal rise">
            <p><b>{right ? "Yes." : `This one is ${q.name.en}.`}</b> {q.name.line}</p>
            <div className="actions-row">
              <Link href="/quiz" className="pill">{right ? (known > 1 ? `Keep going · ${known} begun` : "That's one. Keep going") : "Learn it in the quiz"}</Link>
              <button className="pill o" onClick={another}>Another</button>
            </div>
          </div>
        ) : <p className="note">Tap what you think it means. Nothing is timed.</p>}
      </div>
    </div>
  );
}

/** The hero's two buttons. The first one knows whether you have already begun. */
export function HeroActions() {
  const m = useMastery();
  const mine = m ? countMastered(m) : 0;
  const begun = !!m && Object.keys(m).length > 0;
  return (
    <div className="actions">
      <Link href="/quiz" className="pill big">{begun ? (mine ? `Continue · ${mine} of 99` : "Continue the quiz") : "Start the quiz"}</Link>
      <Link href="/names" className="pill o big">See all 99 names</Link>
    </div>
  );
}

/* ---------------- how it works: a scene that holds still while the steps pass ---------------- */
const STEPS = [
  { h: "Meet a name", p: "Each name arrives as a card: the Arabic, how to say it, what it means, and one line to carry through the day. Four at a time, never more." },
  { h: "Answer, gently", p: "Six kinds of question, from reading the Arabic to matching a name with its meaning. Miss one and it simply comes back around. Nothing is timed." },
  { h: "Draw a ray", p: "Our mark has ninety-nine rays, one for each name. Every name you know draws one. Finish a level and there is a certificate with your name on it." },
];
const DEMO = NAMES[2]; // Al-Malik
const DEMO_OPTS = [NAMES[4], NAMES[2], NAMES[10], NAMES[17]];
const DEMO_LIT = Array.from({ length: 37 }, (_, i) => i + 1);

function Visual({ k, live }: { k: number; live: boolean }) {
  if (k === 0) return <div className="how-card"><NameCard name={NAMES[0]} href={false} big /></div>;
  if (k === 1) return (
    <div className="how-q" aria-hidden="true">
      <div className="ar how-q-ar">{DEMO.ar}</div>
      <div className="how-q-ask">What does this name mean?</div>
      <div className="how-q-opts">{DEMO_OPTS.map(o => <span key={o.n} className={`opt ${o.n === DEMO.n ? "ok" : "dim"}`}>{o.en}</span>)}</div>
    </div>
  );
  return live
    ? <Ring lit={DEMO_LIT} fresh={DEMO_LIT} pace={0.045} className="how-ring"><b>37</b><span>of 99</span></Ring>
    : <Ring lit={[]} className="how-ring"><b>0</b><span>of 99</span></Ring>;
}

export function HowScene() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.k));
    }, { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className="how">
      <div className="how-stage" aria-hidden="true">
        {STEPS.map((_, k) => <div key={k} className={`how-vis ${k === active ? "on" : ""}`}><Visual k={k} live={k === active} /></div>)}
        <div className="how-dots">{STEPS.map((_, k) => <i key={k} className={k === active ? "on" : ""} />)}</div>
      </div>
      <div className="how-steps">
        {STEPS.map((s, k) => (
          <div key={k} data-k={k} ref={el => { refs.current[k] = el; }} className={`how-step ${k === active ? "on" : ""}`}>
            <span className="how-n">{arNum(k + 1)}</span>
            <h3>{s.h}</h3>
            <p>{s.p}</p>
            <div className="how-inline"><Visual k={k} live={k === active} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- nine levels, dawn to night ---------------- */
export function LevelRail() {
  const m = useMastery();
  const rail = useRef<HTMLDivElement>(null);
  const next = m ? nextLevel(m) : 0;
  const slide = (dir: number) => rail.current?.scrollBy({ left: dir * Math.min(rail.current.clientWidth * 0.8, 640), behavior: "smooth" });
  return (
    <div className="rail-wrap">
      <div className="rail-nav">
        <button onClick={() => slide(-1)} aria-label="Earlier levels">←</button>
        <button onClick={() => slide(1)} aria-label="Later levels">→</button>
      </div>
      <div className="rail" ref={rail}>
        {LEVELS.map((names, i) => {
          const h = hourForName(names[0].n);
          const done = m ? levelDone(m, i) : 0;
          return (
            <Link key={i} href={`/quiz?level=${i + 1}`} className={`lcard ${i === next ? "next" : ""}`}
              style={{ background: SWATCH[h], color: isDark(h) ? "#F4EEE4" : "#2A2622" }}>
              <div className="lcard-top"><span>Level {i + 1}</span><span>{HOUR_LABEL[h]}</span></div>
              <div className="lcard-mid">
                <span className="lcard-num">{arNum(i + 1)}</span>
                <span className="ar lcard-ar">{names[0].ar}</span>
                <span className="lcard-range">{names[0].tr} → {names[10].tr}</span>
              </div>
              <div className="lcard-foot">
                <span className="lcard-dots">{names.map(n => <i key={n.n} className={m && isMastered(m[n.n]) ? "on" : ""} />)}</span>
                <span>{done === 11 ? "Done" : done ? `${done} of 11` : i === next ? "Begin" : "Open"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
