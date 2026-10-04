import { NextResponse } from "next/server";
import { getOrder, updateOrder, notify, describe, type Address } from "@/lib/orders";
export const runtime = "nodejs";

const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** The recipient adds their own postal address from the card's link ("ask them for it"). */
export async function POST(req: Request) {
  let b: { ref?: string; address?: Address };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const o = await getOrder(str(b.ref));
  if (!o || o.sku !== "send") return NextResponse.json({ error: "We couldn't find that card" }, { status: 404 });
  if (o.address) return NextResponse.json({ ok: true, note: "already have it" });
  const a = b.address || ({} as Address);
  const address: Address = { name: str(a.name, 80), line1: str(a.line1, 120), line2: str(a.line2, 120) || undefined, city: str(a.city, 80), region: str(a.region, 80) || undefined, postal: str(a.postal, 20) || undefined, country: str(a.country, 60), phone: str(a.phone, 30) || undefined };
  if (!address.name || !address.line1 || !address.city || !address.country) return NextResponse.json({ error: "Please complete the address" }, { status: 400 });
  const next = (await updateOrder(o.ref, { address, addressMode: "have" }))!;
  await notify(`Address added · ${next.ref}`, describe(next));
  return NextResponse.json({ ok: true });
}
