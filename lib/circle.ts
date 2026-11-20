/**
 * Circles: a few people learning alongside each other. Each member shares a display name they typed
 * and one number (how many names they know), plus the last name they learned. Nothing else.
 * No accounts: a circle is its code, and a member is a random id only their own phone holds.
 * Storage is Upstash / Vercel KV over REST when configured, like orders; otherwise memory (dev only).
 */
export type Member = { id: string; name: string; count: number; last?: number; at?: string; joined: string };
export type Circle = { code: string; created: string; members: Member[] };
export type PublicMember = Omit<Member, "id"> & { key: string };

export const MAX_MEMBERS = 5;
const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
export const persistent = () => !!(url() && token());
const mem: Map<string, Circle> = ((globalThis as unknown as { __circles?: Map<string, Circle> }).__circles ??= new Map());

async function redis(cmd: unknown[]) {
  const r = await fetch(`${url()}`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd), cache: "no-store" });
  return (await r.json()).result;
}
const key = (code: string) => `circle:${code}`;
export async function load(code: string): Promise<Circle | null> {
  if (persistent()) { const raw = await redis(["GET", key(code)]); return raw ? JSON.parse(raw) : null; }
  return mem.get(code) ?? null;
}
export async function save(c: Circle) {
  // a circle nobody has touched for a year is let go
  if (persistent()) await redis(["SET", key(c.code), JSON.stringify(c), "EX", 60 * 60 * 24 * 365]);
  else mem.set(c.code, c);
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
const pick = (n: number) => { const b = new Uint8Array(n); crypto.getRandomValues(b); return Array.from(b, x => ALPHABET[x % ALPHABET.length]).join(""); };
export const newCode = () => `${pick(4)}-${pick(4)}`;
export const newId = () => { const b = new Uint8Array(16); crypto.getRandomValues(b); return Array.from(b, x => x.toString(16).padStart(2, "0")).join(""); };
export const normCode = (s: unknown) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^(.{4})(.{4})$/, "$1-$2");
export const validCode = (s: string) => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(s);

export const cleanName = (s: unknown) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 24);
export const cleanCount = (n: unknown) => Math.max(0, Math.min(99, Math.round(Number(n) || 0)));
export const cleanLast = (n: unknown) => { const v = Math.round(Number(n)); return v >= 1 && v <= 99 ? v : undefined; };

/** What other members may see: never the id, which is the only thing that lets a phone edit its own row. */
export const publicView = (c: Circle, me?: string): { code: string; members: (PublicMember & { me?: true })[] } => ({
  code: c.code,
  members: c.members.map((m, i) => ({ key: String(i), name: m.name, count: m.count, last: m.last, at: m.at, joined: m.joined, ...(m.id === me ? { me: true as const } : {}) })),
});
