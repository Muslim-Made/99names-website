import { NAMES, Name } from "./names";

/**
 * A sent name is a small, self-contained token — no database needed for the
 * free link. Everything the recipient's page needs is inside the URL.
 */
export type Sent = {
  n: number;      // name number 1–99
  t: string;      // to
  f?: string;     // from
  m?: string;     // a short note (≤ 240 chars)
  d?: string;     // deliver-on date, ISO yyyy-mm-dd (optional, shown as "arrived with the morning light on …")
  p?: 1;          // 1 when the printed card was ordered
  r?: string;     // order reference, when paid
  a?: 1;          // 1 when we still need the recipient's postal address
};

export const NOTE_MAX = 240;

const enc = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = ""; bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const dec = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export function encodeSent(s: Sent): string {
  const clean: Sent = { n: s.n, t: s.t.trim().slice(0, 60) };
  if (s.f?.trim()) clean.f = s.f.trim().slice(0, 60);
  if (s.m?.trim()) clean.m = s.m.trim().slice(0, NOTE_MAX);
  if (s.d) clean.d = s.d;
  if (s.p) clean.p = 1;
  if (s.r) clean.r = s.r;
  if (s.a) clean.a = 1;
  return enc(JSON.stringify(clean));
}

export function decodeSent(token: string): (Sent & { name: Name }) | null {
  try {
    const s = JSON.parse(dec(token)) as Sent;
    const name = NAMES[s.n - 1];
    if (!name || typeof s.t !== "string") return null;
    return { ...s, name };
  } catch { return null; }
}

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://99names.net");
export const sentUrl = (s: Sent) => `${SITE}/for/${encodeSent(s)}`;

/** "Arrived with the morning light on 14 September." */
export function arrivalLine(d?: string) {
  if (!d) return null;
  const date = new Date(d + "T06:00:00");
  if (isNaN(date.getTime())) return null;
  return `Sent to arrive with the morning light on ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.`;
}
