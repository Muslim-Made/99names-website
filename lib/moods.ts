import { NAMES, Name, bySlug } from "./names";

/** "Who is it for?" — a feeling maps to a handful of names that answer it. */
export type Mood = { key: string; label: string; line: string; slugs: string[] };

export const MOODS: Mood[] = [
  { key: "grieving", label: "Grieving", line: "For someone carrying a loss.", slugs: ["as-sabur", "al-jabbar", "ar-rahim", "al-latif", "al-baqi"] },
  { key: "unwell", label: "Unwell", line: "For a body that's tired.", slugs: ["al-latif", "ar-rahim", "al-muhyi", "ar-rauf", "al-qawiyy"] },
  { key: "anxious", label: "Anxious", line: "For a chest that's tight.", slugs: ["as-salam", "al-mumin", "al-wakil", "al-hafiz", "al-basit"] },
  { key: "beginning", label: "Beginning something", line: "A new job, a move, a first day.", slugs: ["al-fattah", "al-khaliq", "al-badi", "ar-razzaq", "al-mubdi"] },
  { key: "baby", label: "A new baby", line: "For parents, and the small one.", slugs: ["al-khaliq", "al-musawwir", "al-wahhab", "ar-razzaq", "al-bari"] },
  { key: "marrying", label: "Getting married", line: "For two becoming a home.", slugs: ["al-wadud", "al-jami", "al-wahhab", "al-barr", "ar-rauf"] },
  { key: "exams", label: "Exams or a big week", line: "For the one who's studying late.", slugs: ["al-fattah", "al-alim", "al-hakim", "al-muizz", "ar-rafi"] },
  { key: "restart", label: "A fresh start", line: "For someone who thinks it's too late.", slugs: ["al-ghaffar", "at-tawwab", "al-afuww", "al-ghafur", "ar-rahman"] },
  { key: "lonely", label: "Lonely", line: "For the one who feels unseen.", slugs: ["al-wadud", "al-mujib", "as-sami", "al-basir", "al-waliyy"] },
  { key: "grateful", label: "Grateful", line: "Because something good happened.", slugs: ["ash-shakur", "al-hamid", "al-wahhab", "al-karim", "al-ghaniyy"] },
  { key: "away", label: "Far away", line: "For someone travelling, or missed.", slugs: ["al-hafiz", "al-wakil", "al-muhaymin", "ar-raqib", "al-wali"] },
  { key: "lost", label: "Looking for direction", line: "For a crossroads.", slugs: ["al-hadi", "an-nur", "ar-rashid", "al-haqq", "al-alim"] },
  { key: "small", label: "Feeling small", line: "For someone who's been made to feel less.", slugs: ["al-muizz", "ar-rafi", "al-karim", "al-aziz", "al-majid"] },
  { key: "because", label: "Just because", line: "No occasion. The best kind.", slugs: ["ar-rahman", "an-nur", "al-latif", "al-wadud", "as-sabur"] },
];

export const moodNames = (m: Mood): Name[] => m.slugs.map(bySlug).filter(Boolean) as Name[];
export const moodFor = (key: string) => MOODS.find(m => m.key === key);

/** Plain search across transliteration, meaning, Arabic and number. */
export function searchNames(q: string): Name[] {
  const s = q.trim().toLowerCase();
  if (!s) return NAMES;
  return NAMES.filter(n => n.tr.toLowerCase().includes(s) || n.en.toLowerCase().includes(s) || n.ar.includes(s) || String(n.n) === s || n.slug.includes(s.replace(/\s+/g, "-")));
}
