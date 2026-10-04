import { NextResponse } from "next/server";
import squad from "@/lib/pay/squad";
import { getOrder, updateOrder, notify, describe } from "@/lib/orders";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  const ev = squad.parseWebhook(raw, req.headers);
  if (!ev) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const o = await getOrder(ev.ref);
  if (!o) return NextResponse.json({ ok: true, note: "unknown ref" });
  if (o.status === "paid") return NextResponse.json({ ok: true, note: "already paid" });
  if (ev.success) {
    // belt and braces: re-verify before fulfilling
    const v = await squad.verify(ev.ref);
    if (v.ok && (v.amountMinor == null || v.amountMinor >= o.amountMinor)) {
      const paid = (await updateOrder(o.ref, { status: "paid", paidAt: new Date().toISOString() }))!;
      await notify(`Paid · ${paid.sku} · ${paid.ref}`, describe(paid));
    }
  }
  return NextResponse.json({ ok: true });
}
