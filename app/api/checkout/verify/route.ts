import { NextResponse } from "next/server";
import { provider, isConfigured } from "@/lib/pay";
import { getOrder, updateOrder, notify, describe } from "@/lib/orders";
import { encodeSent } from "@/lib/send";

export const runtime = "nodejs";

/** Called by the done page. Verifies with the provider (never trusts the redirect) and returns a safe view of the order. */
export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get("ref") || "";
  let o = await getOrder(ref);
  if (!o) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (o.status !== "paid") {
    if (!isConfigured()) {
      // test mode: treat as paid so the whole flow can be exercised before keys exist
      o = (await updateOrder(ref, { status: "paid", paidAt: new Date().toISOString() }))!;
    } else {
      const v = await provider(o.provider).verify(ref);
      if (v.ok && (v.amountMinor == null || v.amountMinor >= o.amountMinor)) {
        o = (await updateOrder(ref, { status: "paid", paidAt: new Date().toISOString() }))!;
        await notify(`Paid · ${o.sku} · ${o.ref}`, describe(o));
      } else if (v.status === "failed" || v.status === "abandoned") {
        o = (await updateOrder(ref, { status: "failed" }))!;
      }
    }
  }
  return NextResponse.json({
    ref: o.ref, status: o.status, sku: o.sku, qty: o.qty, usd: o.usd, email: o.email, addressMode: o.addressMode, hasAddress: !!o.address, nameSlug: o.nameSlug,
    token: o.sent ? encodeSent(o.sent) : undefined, to: o.sent?.t,
  });
}
