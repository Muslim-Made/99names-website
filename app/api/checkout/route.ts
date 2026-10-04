import { NextResponse } from "next/server";
import { bySku } from "@/lib/catalog";
import { provider, currency, isConfigured } from "@/lib/pay";
import { newRef, saveOrder, type Address, type Order } from "@/lib/orders";
import { NOTE_MAX, type Sent } from "@/lib/send";
import { NAMES, bySlug } from "@/lib/names";

export const runtime = "nodejs";

type Body = { sku: string; qty?: number; email: string; name: string; addressMode?: "have" | "ask" | "none"; address?: Address; sent?: Sent; nameSlug?: string };

const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let b: Body;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const product = bySku(str(b.sku));
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  if (product.status === "notify") return NextResponse.json({ error: "Not on sale yet" }, { status: 400 });
  const email = str(b.email); const name = str(b.name, 80);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Please check the email address" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Please add your name" }, { status: 400 });
  const qty = Math.min(20, Math.max(1, Math.floor(Number(b.qty) || 1)));

  const addressMode: Order["addressMode"] = product.needsAddress ? (b.addressMode === "ask" && product.sku === "send" ? "ask" : "have") : "none";
  let address: Address | undefined;
  if (addressMode === "have") {
    const a = b.address || ({} as Address);
    address = { name: str(a.name, 80), line1: str(a.line1, 120), line2: str(a.line2, 120) || undefined, city: str(a.city, 80), region: str(a.region, 80) || undefined, postal: str(a.postal, 20) || undefined, country: str(a.country, 60), phone: str(a.phone, 30) || undefined };
    if (!address.name || !address.line1 || !address.city || !address.country) return NextResponse.json({ error: "Please complete the address" }, { status: 400 });
  }

  let sent: Sent | undefined; let nameSlug: string | undefined;
  if (product.sku === "send") {
    const s = b.sent; const n = Number(s?.n);
    if (!s || !NAMES[n - 1] || !str(s.t, 60)) return NextResponse.json({ error: "Choose a name and who it's for" }, { status: 400 });
    sent = { n, t: str(s.t, 60), f: str(s.f, 60) || undefined, m: str(s.m, NOTE_MAX) || undefined, d: /^\d{4}-\d{2}-\d{2}$/.test(String(s.d || "")) ? s.d : undefined, p: 1, a: addressMode === "ask" ? 1 : undefined };
    nameSlug = NAMES[n - 1].slug;
  } else if (product.picksName) {
    nameSlug = bySlug(str(b.nameSlug))?.slug;
    if (!nameSlug) return NextResponse.json({ error: "Choose a name" }, { status: 400 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const cur = currency();
  const amountMinor = (cur === "USD" ? product.usd : product.ngn) * 100 * qty;
  const ref = newRef(product.sku);
  const order: Order = { ref, sku: product.sku, qty, amountMinor, currency: cur, usd: product.usd * qty, email, customerName: name, provider: provider().name, address, addressMode, sent, nameSlug, status: "pending", createdAt: new Date().toISOString() };
  if (sent) sent.r = ref;

  if (!isConfigured()) {
    // No keys yet: keep the order and send the buyer straight to the done page in "test" mode so the flow can be walked end-to-end.
    await saveOrder({ ...order, status: "pending" });
    return NextResponse.json({ url: `${site}/checkout/done?ref=${ref}&test=1`, ref, test: true });
  }
  try {
    const { url } = await provider().createCheckout({
      ref, amountMinor, currency: cur, email, customerName: name, callbackUrl: `${site}/checkout/done?ref=${ref}`,
      metadata: { sku: product.sku, qty, usd: order.usd, nameSlug, to: sent?.t, from: sent?.f, addressMode, custom_fields: [{ display_name: "Order", variable_name: "order", value: ref }] },
    });
    await saveOrder(order);
    return NextResponse.json({ url, ref });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "We couldn't start the payment. Please try again in a moment." }, { status: 502 });
  }
}
