import type { Sent } from "./send";

/**
 * Orders. Storage is Upstash/Vercel KV over REST when configured
 * (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL + KV_REST_API_TOKEN),
 * otherwise an in-memory map — fine for local dev, not for production.
 * Every paid order is also emailed to ORDER_EMAIL through Resend when RESEND_API_KEY is set,
 * so nothing is lost even if the store is the in-memory one.
 */
export type Address = { name: string; line1: string; line2?: string; city: string; region?: string; postal?: string; country: string; phone?: string };
export type Order = {
  ref: string; sku: string; qty: number; amountMinor: number; currency: string; usd: number;
  email: string; customerName: string; provider: string;
  address?: Address; addressMode: "have" | "ask" | "none";
  sent?: Sent; nameSlug?: string;
  status: "pending" | "paid" | "failed"; createdAt: string; paidAt?: string;
};

const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const mem: Map<string, Order> = ((globalThis as unknown as { __orders?: Map<string, Order> }).__orders ??= new Map());

async function redis(cmd: unknown[]) {
  const r = await fetch(`${url()}`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd), cache: "no-store" });
  const j = await r.json();
  return j.result;
}

export async function saveOrder(o: Order) {
  if (url() && token()) { await redis(["SET", `order:${o.ref}`, JSON.stringify(o)]); await redis(["LPUSH", "orders", o.ref]); }
  else mem.set(o.ref, o);
  return o;
}
export async function getOrder(ref: string): Promise<Order | null> {
  if (url() && token()) { const v = await redis(["GET", `order:${ref}`]); return v ? JSON.parse(v) : null; }
  return mem.get(ref) || null;
}
export async function updateOrder(ref: string, patch: Partial<Order>) {
  const o = await getOrder(ref); if (!o) return null;
  const next = { ...o, ...patch }; await saveOrder(next); return next;
}
export const newRef = (sku: string) => `99n-${sku}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

/** Email the team (and, later, the customer). Quiet no-op when Resend isn't configured. */
export async function notify(subject: string, text: string, to = process.env.ORDER_EMAIL) {
  if (!process.env.RESEND_API_KEY || !to) { console.log(`[notify] ${subject}\n${text}`); return; }
  await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.ORDER_FROM || "99names <orders@99names.net>", to, subject, text }),
  }).catch(e => console.error("notify failed", e));
}

export function describe(o: Order) {
  const a = o.address;
  return [
    `Order ${o.ref} · ${o.status.toUpperCase()}`,
    `${o.qty} × ${o.sku} · $${o.usd} (charged ${o.currency} ${(o.amountMinor / 100).toLocaleString()}) via ${o.provider}`,
    `Customer: ${o.customerName} <${o.email}>`,
    o.nameSlug ? `Name: ${o.nameSlug}` : "",
    o.sent ? `Card for: ${o.sent.t}${o.sent.f ? ` from ${o.sent.f}` : ""}\nNote: ${o.sent.m || "(none)"}${o.sent.d ? `\nDeliver on: ${o.sent.d}` : ""}` : "",
    a ? `Post to:\n${a.name}\n${a.line1}${a.line2 ? `\n${a.line2}` : ""}\n${a.city}${a.region ? `, ${a.region}` : ""} ${a.postal || ""}\n${a.country}${a.phone ? `\n${a.phone}` : ""}` : o.addressMode === "ask" ? "Address: the recipient will add it from their link." : "Address: not needed.",
  ].filter(Boolean).join("\n");
}
