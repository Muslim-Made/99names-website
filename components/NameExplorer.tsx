"use client";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAMES, Name } from "@/lib/names";
import { HOURS, HOUR_LABEL, hourForName } from "@/lib/hour";
import { Mastery, isMastered, isLearning, levelOf, loadMastery } from "@/lib/learn";
import NameWheel, { DayBar, WheelHandle } from "./NameWheel";
import NameCard from "./NameCard";
import Listen from "./Listen";
import { SWATCH } from "./HourDial";
import { useHour } from "./HourProvider";
import { nameOfTheHour } from "./HourHome";

const typing = (e: KeyboardEvent) => /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? "");

/** Left and right arrow keys turn the wheel from anywhere on the page. */
function useArrows(wheel: React.RefObject<WheelHandle | null>) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      if (e.key === "ArrowRight") wheel.current?.step(1);
      else if (e.key === "ArrowLeft") wheel.current?.step(-1);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [wheel]);
}
function useMastery(): Mastery {
  const [m, setM] = useState<Mastery>({});
  useEffect(() => { setM(loadMastery()); }, []);
  return m;
}
const ya = (n: Name) => n.tr.replace(/^(Al|Ar|As|Ash|At|Az|Ad|An)-/i, "");

/* ===================== one name: /names/[slug] =====================
 * The page is the wheel with this name at the top. Turn it and the page follows:
 * the words below change, and so does the address, so any name can be shared as it stands.
 */
export default function NameExplorer({ start, banner }: { start: number; banner?: ReactNode }) {
  const wheel = useRef<WheelHandle>(null);
  const [focus, setFocus] = useState(start);
  const [shown, setShown] = useState(start);
  const m = useMastery();
  useArrows(wheel);

  const settle = (i: number) => {
    setShown(i);
    const n = NAMES[i];
    const path = `/names/${n.slug}`;
    if (location.pathname !== path) {
      history.replaceState(null, "", path);
      document.title = `${n.tr} — ${n.en} · 99names`;
    }
  };

  const n = NAMES[shown];
  const hour = hourForName(n.n);
  const level = levelOf(n.n) + 1;
  const rec = m[n.n];
  return (
    <div className="namepage">
      <NameWheel ref={wheel} start={start} onFocus={setFocus} onSettle={settle} label="The ninety-nine names. This page follows the name at the top." />
      <div className="wrap"><DayBar index={focus} onPick={i => wheel.current?.goTo(i)} onStep={d => wheel.current?.step(d)} /></div>

      <article className="wrap nd rise" key={shown} aria-live="polite">
        {shown === start && banner}
        <h1 className="nd-h1">{n.tr} <em>{n.en}</em></h1>
        <p className="lede nd-lede">{n.meaning}</p>
        <div className="nd-actions">
          <Listen text={n.ar} />
          <Link href={`/send?name=${n.slug}`} className="pill o">Send this name</Link>
          <Link href={`/quiz?level=${level}`} className="pill o">Learn it in the quiz</Link>
        </div>

        <div className="nd-grid">
          {n.verse && (
            <section className="card nd-verse">
              <b>In the Qur&rsquo;an</b>
              <p className="nasta nd-verse-ar">{n.verse}</p>
              <p className="nd-verse-en">{n.verseEn}</p>
              <span className="note">Qur&rsquo;an {n.ref}</span>
            </section>
          )}
          <section className={`card nd-line ${n.verse ? "" : "wide"}`}>
            <b>A line to carry</b>
            <p>{n.line}</p>
          </section>
          <section className="card nd-root">
            <b>Root</b>
            <span className="ar">{n.root}</span>
            <span className="note">The three letters this name grows from.</span>
          </section>
          <section className="card nd-say">
            <b>Say it</b>
            <p><em>Yā {ya(n)}</em></p>
            <span className="note">Once, slowly, after a prayer.</span>
          </section>
          <Link href={`/quiz?level=${level}`} className="card nd-quiz">
            <b>By heart</b>
            <p>{isMastered(rec) ? "This name is yours." : isLearning(rec) ? "You are learning this one." : "Not yet one of yours."}</p>
            <span className="note">No. {n.n} of 99 belongs to the {HOUR_LABEL[hour]} names, level {level} of the quiz. {isMastered(rec) ? "Practise the level" : "Learn it with its ten neighbours"} →</span>
          </Link>
        </div>
        <p className="nd-foot"><Link href="/names">All ninety-nine</Link><span>99names.net/names/{n.slug}</span></p>
      </article>
    </div>
  );
}

/* ===================== all ninety-nine: /names ===================== */
export function NamesBrowse() {
  const wheel = useRef<WheelHandle>(null);
  const router = useRouter();
  const { hour } = useHour();
  const [focus, setFocus] = useState(0);
  const [shown, setShown] = useState(0);
  const arrived = useRef(false);
  useArrows(wheel);

  // arrive on the name you last looked at, or on a name of the hour it is now
  useEffect(() => {
    if (arrived.current) return;
    const id = setTimeout(() => {
      arrived.current = true;
      let to = nameOfTheHour(hour).n - 1;
      try { const saved = sessionStorage.getItem("99names:wheel"); if (saved !== null) to = Number(saved); } catch { }
      if (to > 0 && to < NAMES.length) wheel.current?.goTo(to);
    }, 260);
    return () => clearTimeout(id);
  }, [hour]);
  const settle = (i: number) => { setShown(i); try { sessionStorage.setItem("99names:wheel", String(i)); } catch { } };
  const open = (i: number) => router.push(`/names/${NAMES[i].slug}`);

  const n = NAMES[shown];
  return (
    <>
      <header className="wrap names-head">
        <h1>Ninety-nine, <em>dawn to night.</em></h1>
        <p className="lede">Drag the cards, swipe, or use the arrow keys. They run in the traditional order, from Ar-Rahman at Fajr to As-Sabur at Isha.</p>
      </header>
      <NameWheel ref={wheel} start={0} onFocus={setFocus} onSettle={settle} onOpen={open} />
      <div className="wrap"><DayBar index={focus} onPick={i => wheel.current?.goTo(i)} onStep={d => wheel.current?.step(d)} /></div>
      <div className="wrap wheel-info rise" key={shown} aria-live="polite">
        <h2>{n.tr} <em>{n.en}</em></h2>
        <p className="wheel-line">{n.line}</p>
        <div className="nd-actions">
          <Link href={`/names/${n.slug}`} className="pill">Read this name</Link>
          <Listen text={n.ar} />
        </div>
      </div>
      <NamesIndex jump={i => { wheel.current?.goTo(i); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    </>
  );
}

/* the whole list, an hour at a time, with a search that reads Arabic, the name and its meaning */
const strip = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ًͯ-ٰٟـ'’`-]/g, "").replace(/ٱ/g, "ا");

function NamesIndex({ jump }: { jump: (index: number) => void }) {
  const m = useMastery();
  const [q, setQ] = useState("");
  const needle = strip(q.trim());
  const hits = useMemo(() => needle ? NAMES.filter(n => strip(`${n.tr} ${n.en} ${n.meaning} ${n.ar} ${n.n}`).includes(needle)) : null, [needle]);
  const mine = (n: Name) => isMastered(m[n.n]) ? "mine" : "";
  return (
    <section className="nidx">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <h2>All of them, <em>hour by hour.</em></h2>
            <p className="lede">Each name wears the sky of the hour it belongs to. A small ray marks the ones you already know.</p>
          </div>
          <input className="search nidx-search" type="search" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search: mercy, Al-Malik, الرحيم" aria-label="Search the ninety-nine names" />
        </div>

        {hits ? (
          <>
            <p className="note nidx-count">{hits.length ? `${hits.length} ${hits.length === 1 ? "name" : "names"}` : "No name matches that yet. Try part of the meaning, like “light” or “forgiv”."}</p>
            <div className="strip nidx-grid">{hits.map(n => <div key={n.n} className={`nidx-cell ${mine(n)}`}><NameCard name={n} rays={false} /></div>)}</div>
          </>
        ) : HOURS.map(h => {
          const group = NAMES.filter(n => hourForName(n.n) === h);
          const known = group.filter(n => isMastered(m[n.n])).length;
          return (
            <div className="nidx-group" key={h}>
              <div className="nidx-head">
                <button className="nidx-hour" onClick={() => jump(group[0].n - 1)} title={`Turn the wheel to the ${HOUR_LABEL[h]} names`}>
                  <span className="hd-swatch" style={{ background: SWATCH[h] }} aria-hidden="true" />
                  <b>{HOUR_LABEL[h]}</b>
                </button>
                <span>No. {group[0].n} to {group[group.length - 1].n}</span>
                <span className="nidx-known">{known ? `${known} of ${group.length} are yours` : `${group.length} names`}</span>
              </div>
              <div className="strip nidx-grid">{group.map(n => <div key={n.n} className={`nidx-cell ${mine(n)}`}><NameCard name={n} rays={false} /></div>)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
