import { NAMES, Name } from "./names";

/* ---------------- the learning model ----------------
 * Everything lives in the browser (localStorage), keyed by name number.
 *  - A name is "mastered" after 2 correct answers in 2 different formats.
 *  - A miss on a name still being learned sends it back to the start, warmly.
 *  - A mastered name comes back for review on a widening interval (1, 3, 7, 14, 30, 60 days).
 *    A miss in review only drops it to "learning": one more right answer brings it home.
 */
export type ChoiceFmt = "ar2en" | "tr2en" | "en2ar" | "en2tr" | "mean2name";
export type Fmt = ChoiceFmt | "match";
export type Rec = { c: number; f: Fmt[]; s?: number; d?: number; seen?: 1 };
export type Mastery = Record<number, Rec>;
export type Ctx = "lesson" | "review" | "check";

export const KEY = "99names:mastery";
const INTERVALS = [1, 3, 7, 14, 30, 60];
export const today = () => Math.floor(Date.now() / 86400000);

export function loadMastery(): Mastery {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) || "null");
    if (m && typeof m === "object") return m;
    // migrate the very first "known" list, one correct each
    const known: number[] = JSON.parse(localStorage.getItem("99names:known") || "[]");
    const out: Mastery = {};
    known.forEach(n => { out[n] = { c: 1, f: ["ar2en"] }; });
    return out;
  } catch { return {}; }
}
export function saveMastery(m: Mastery) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* private mode: progress lasts for this visit */ }
}

export const isMastered = (r?: Rec) => !!r && r.c >= 2 && r.f.length >= 2;
export const isLearning = (r?: Rec) => !!r && !isMastered(r) && (r.c > 0 || !!r.seen);
export const countMastered = (m: Mastery) => NAMES.reduce((t, n) => t + (isMastered(m[n.n]) ? 1 : 0), 0);

/* nine levels of eleven, in the traditional order */
export const LEVELS: Name[][] = Array.from({ length: 9 }, (_, i) => NAMES.slice(i * 11, i * 11 + 11));
export const levelOf = (n: number) => Math.floor((n - 1) / 11);
export const levelDone = (m: Mastery, li: number) => LEVELS[li].filter(n => isMastered(m[n.n])).length;
/** The first level with something left to learn, or -1 when all ninety-nine are known. */
export const nextLevel = (m: Mastery) => LEVELS.findIndex((_, i) => levelDone(m, i) < 11);

/** Record one answer. Returns what changed, so the screen can celebrate a newly mastered name. */
export function grade(m: Mastery, name: Name, fmt: Fmt, right: boolean, ctx: Ctx): { newlyMastered: boolean } {
  const rec: Rec = m[name.n] ?? { c: 0, f: [] };
  const was = isMastered(rec);
  if (right) {
    const next: Rec = { ...rec, c: rec.c + 1, f: rec.f.includes(fmt) ? rec.f : [...rec.f, fmt], seen: 1 };
    if (isMastered(next)) {
      next.s = Math.min((was ? rec.s ?? 0 : -1) + 1, INTERVALS.length - 1);
      next.d = today() + INTERVALS[next.s];
    }
    m[name.n] = next;
    return { newlyMastered: !was && isMastered(next) };
  }
  if (was) m[name.n] = { c: 1, f: rec.f.slice(0, 1), s: 0, seen: 1 };
  else if (ctx === "check") m[name.n] = { ...rec, seen: 1 };
  else m[name.n] = { c: 0, f: [], seen: 1 };
  return { newlyMastered: false };
}
export function markSeen(m: Mastery, name: Name) {
  m[name.n] = { ...(m[name.n] ?? { c: 0, f: [] }), seen: 1 };
}

/* ---------------- randomness ---------------- */
export type Rnd = () => number;
/** A small seeded generator, so the homepage question is the same on the server and in the browser. */
export function seeded(seed: number): Rnd {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(a: T[], rnd: Rnd = Math.random): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
const pick = <T,>(a: T[], rnd: Rnd = Math.random) => a[Math.floor(rnd() * a.length)];

/* ---------------- steps ---------------- */
export type Meet = { kind: "meet"; name: Name };
export type Choice = { kind: "choice"; name: Name; fmt: ChoiceFmt; opts: Name[]; both?: boolean; review?: boolean; retry?: boolean };
export type Match = { kind: "match"; names: Name[] };
export type Step = Meet | Choice | Match;

export const PROMPT: Record<ChoiceFmt, string> = {
  ar2en: "What does this name mean?",
  tr2en: "What does this name mean?",
  en2ar: "Which is the Arabic?",
  en2tr: "Which name is this?",
  mean2name: "Which name is this?",
};

/** Three wrong answers: near neighbours first (same level), never a name sharing the root or the English. */
function distractors(name: Name, pool: Name[], rnd: Rnd): Name[] {
  const ok = (n: Name) => n.n !== name.n && n.root !== name.root && n.en !== name.en;
  const near = shuffle(pool.filter(ok), rnd);
  const far = shuffle(NAMES.filter(n => ok(n) && !pool.includes(n)), rnd);
  const out: Name[] = [];
  for (const n of [...near, ...far]) {
    if (out.length === 3) break;
    if (!out.some(o => o.en === n.en)) out.push(n);
  }
  return out;
}
export function buildChoice(name: Name, fmt: ChoiceFmt, pool: Name[] = LEVELS[levelOf(name.n)], rnd: Rnd = Math.random, extra: Partial<Choice> = {}): Choice {
  return { kind: "choice", name, fmt, opts: shuffle([name, ...distractors(name, pool, rnd)], rnd), ...extra };
}

const RECOGNISE: ChoiceFmt[] = ["ar2en", "tr2en"];
const RECALL: ChoiceFmt[] = ["en2ar", "en2tr", "mean2name"];
const fresh = (fmts: ChoiceFmt[], rec?: Rec) => {
  const left = fmts.filter(f => !rec?.f.includes(f));
  return pick(left.length ? left : fmts);
};

/** How many names a lesson takes on at once. */
export const FOCUS = 4;

/**
 * One lesson in a level: meet up to four names, recognise each, match them all,
 * then recall each, with a couple of older names folded in so they stay warm.
 * A perfect lesson masters its names. When the level is already done, it becomes practice.
 */
export function buildLesson(level: number, m: Mastery): { steps: Step[]; focus: Name[]; practice: boolean } {
  const pool = LEVELS[level];
  const open = pool.filter(n => !isMastered(m[n.n]));
  if (!open.length) {
    const focus = shuffle(pool).slice(0, 6);
    const steps: Step[] = focus.slice(0, 3).map(n => buildChoice(n, pick(RECALL), pool));
    steps.push({ kind: "match", names: shuffle(pool).slice(0, 4) });
    focus.slice(3).forEach(n => steps.push(buildChoice(n, pick(RECALL), pool)));
    return { steps, focus, practice: true };
  }
  // finish what was started, then the new ones in order
  const focus = [...open.filter(n => isLearning(m[n.n])), ...open.filter(n => !isLearning(m[n.n]))].slice(0, FOCUS);
  const steps: Step[] = [];
  for (let i = 0; i < focus.length; i += 2) {
    const pair = focus.slice(i, i + 2);
    pair.forEach(n => { if (!(m[n.n]?.c)) steps.push({ kind: "meet", name: n }); });
    pair.forEach(n => steps.push(buildChoice(n, fresh(RECOGNISE, m[n.n]), pool)));
  }
  // matching wants at least four cards on the table
  const table = [...focus, ...shuffle(pool.filter(n => !focus.includes(n)))].slice(0, 4);
  steps.push({ kind: "match", names: table });
  // older names that are yours already, to keep them warm
  const older = NAMES.filter(n => n.n <= pool[10].n && !focus.includes(n) && isMastered(m[n.n]))
    .sort((a, b) => (m[a.n].d ?? 0) - (m[b.n].d ?? 0)).slice(0, 2);
  const tail: Step[] = shuffle(focus).map(n => buildChoice(n, fresh(RECALL, m[n.n]), pool));
  older.forEach((n, i) => tail.splice(1 + i * 2, 0, buildChoice(n, pick(RECALL), LEVELS[levelOf(n.n)], Math.random, { review: true })));
  return { steps: [...steps, ...tail], focus, practice: false };
}

/** Names that are due to be seen again today (or overdue). */
export const dueNames = (m: Mastery) => NAMES.filter(n => isMastered(m[n.n]) && (m[n.n].d ?? 0) <= today());

/** The daily five: the names most due for another look, one question each. */
export function buildReview(m: Mastery): Step[] {
  const mine = NAMES.filter(n => isMastered(m[n.n]));
  const due = shuffle(mine).sort((a, b) => (m[a.n].d ?? 0) - (m[b.n].d ?? 0)).slice(0, 5);
  return shuffle(due).map(n => buildChoice(n, pick<ChoiceFmt>([...RECOGNISE, ...RECALL]), LEVELS[levelOf(n.n)], Math.random, { review: true }));
}

export const CHECK_SIZE = 20;
/** "How many do you know?" Twenty names spread evenly across all nine levels. */
export function buildCheck(): Step[] {
  const picked: Name[] = [];
  LEVELS.forEach(l => picked.push(...shuffle(l).slice(0, 2)));
  picked.push(...shuffle(NAMES.filter(n => !picked.includes(n))).slice(0, CHECK_SIZE - picked.length));
  return shuffle(picked).map(n => buildChoice(n, "ar2en", LEVELS[levelOf(n.n)], Math.random, { both: true }));
}
export const estimate = (score: number) => Math.round((score / CHECK_SIZE) * 99);

/** The label an option wears, and the text a prompt shows, for each format. */
export const optLabel = (n: Name, fmt: ChoiceFmt) => fmt === "en2ar" ? n.ar : fmt === "en2tr" || fmt === "mean2name" ? n.tr : n.en;
export const promptText = (q: Choice) => q.fmt === "ar2en" ? q.name.ar : q.fmt === "tr2en" ? q.name.tr : q.fmt === "mean2name" ? q.name.meaning : q.name.en;

/** A missed name comes back once more before the lesson ends, asked a different way. */
export function retryOf(q: Choice): Choice {
  const family = RECOGNISE.includes(q.fmt) ? RECOGNISE : RECALL;
  const other = family.filter(f => f !== q.fmt);
  return buildChoice(q.name, pick(other), LEVELS[levelOf(q.name.n)], Math.random, { retry: true, review: q.review });
}
