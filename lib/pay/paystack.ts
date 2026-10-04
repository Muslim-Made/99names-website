import { createHmac, timingSafeEqual } from "crypto";
import type { PayProvider, CheckoutInput, Verified, WebhookEvent } from "./types";

/** Paystack. Set PAYSTACK_SECRET_KEY (sk_test_… or sk_live_…). */
const secret = () => process.env.PAYSTACK_SECRET_KEY || "";
const BASE = "https://api.paystack.co";

const paystack: PayProvider = {
  name: "paystack",
  async createCheckout(c: CheckoutInput) {
    if (!secret()) throw new Error("PAYSTACK_SECRET_KEY is not set");
    const res = await fetch(`${BASE}/transaction/initialize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: c.amountMinor, email: c.email, currency: c.currency, reference: c.ref, callback_url: c.callbackUrl, metadata: { ...c.metadata, customer_name: c.customerName } }),
    });
    const j = await res.json().catch(() => ({}));
    const url = j?.data?.authorization_url;
    if (!res.ok || !url) throw new Error(`Paystack initialize failed: ${res.status} ${j?.message || ""}`.trim());
    return { url };
  },
  async verify(ref: string): Promise<Verified> {
    const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(ref)}`, { headers: { Authorization: `Bearer ${secret()}` }, cache: "no-store" });
    const j = await res.json().catch(() => ({}));
    const d = j?.data;
    if (!res.ok || !d) return { ok: false, status: "unknown", raw: j };
    const s = String(d.status || "").toLowerCase();
    const status: Verified["status"] = s === "success" ? "success" : s === "failed" ? "failed" : s === "abandoned" ? "abandoned" : s === "ongoing" || s === "pending" ? "pending" : "unknown";
    return { ok: status === "success", status, amountMinor: d.amount, currency: d.currency, email: d.customer?.email, raw: d };
  },
  parseWebhook(rawBody: string, headers: Headers): WebhookEvent | null {
    const sig = headers.get("x-paystack-signature") || "";
    if (!secret() || !sig) return null;
    const h = createHmac("sha512", secret()).update(rawBody).digest("hex");
    const a = Buffer.from(h), b = Buffer.from(sig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    let body: { event?: string; data?: Record<string, unknown> };
    try { body = JSON.parse(rawBody); } catch { return null; }
    const d = body.data || {};
    return { ref: String(d.reference || ""), success: body.event === "charge.success", amountMinor: d.amount as number | undefined, currency: d.currency as string | undefined, metadata: d.metadata as Record<string, unknown> | undefined, raw: body };
  },
};
export default paystack;
