import { createHmac, timingSafeEqual } from "crypto";
import type { PayProvider, CheckoutInput, Verified, WebhookEvent } from "./types";

/**
 * Squad (GTCO / HabariPay). Hosted checkout.
 *   Sandbox keys: https://sandbox.squadco.com  → base https://sandbox-api-d.squadco.com
 *   Live keys:    https://dashboard.squadco.com → base https://api-d.squadco.com
 * Set SQUAD_SECRET_KEY (sandbox_sk_… or sk_…). Base URL is chosen from the key prefix
 * unless SQUAD_BASE_URL is set explicitly.
 */
const secret = () => process.env.SQUAD_SECRET_KEY || "";
const base = () => process.env.SQUAD_BASE_URL || (secret().startsWith("sandbox") ? "https://sandbox-api-d.squadco.com" : "https://api-d.squadco.com");

const squad: PayProvider = {
  name: "squad",
  async createCheckout(c: CheckoutInput) {
    if (!secret()) throw new Error("SQUAD_SECRET_KEY is not set");
    const res = await fetch(`${base()}/transaction/initiate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: c.amountMinor, email: c.email, currency: c.currency, initiate_type: "inline",
        transaction_ref: c.ref, callback_url: c.callbackUrl, customer_name: c.customerName,
        metadata: c.metadata, payment_channels: ["card", "bank", "ussd", "transfer"],
      }),
    });
    const j = await res.json().catch(() => ({}));
    const url = j?.data?.checkout_url;
    if (!res.ok || !url) throw new Error(`Squad initiate failed: ${res.status} ${j?.message || ""}`.trim());
    return { url };
  },
  async verify(ref: string): Promise<Verified> {
    const res = await fetch(`${base()}/transaction/verify/${encodeURIComponent(ref)}`, { headers: { Authorization: `Bearer ${secret()}` }, cache: "no-store" });
    const j = await res.json().catch(() => ({}));
    const d = j?.data;
    if (!res.ok || !d) return { ok: false, status: "unknown", raw: j };
    const s = String(d.transaction_status || "").toLowerCase();
    const status: Verified["status"] = s === "success" ? "success" : s === "failed" ? "failed" : s === "abandoned" ? "abandoned" : s === "pending" ? "pending" : "unknown";
    return { ok: status === "success", status, amountMinor: d.transaction_amount, currency: d.transaction_currency_id || d.currency, email: d.email, raw: d };
  },
  parseWebhook(rawBody: string, headers: Headers): WebhookEvent | null {
    const sig = headers.get("x-squad-encrypted-body") || headers.get("x-squad-signature") || "";
    if (!secret() || !sig) return null;
    const ok = (payload: string) => {
      const h = createHmac("sha512", secret()).update(payload).digest("hex").toUpperCase();
      const a = Buffer.from(h), b = Buffer.from(sig.toUpperCase());
      return a.length === b.length && timingSafeEqual(a, b);
    };
    let body: { Event?: string; TransactionRef?: string; Body?: Record<string, unknown> };
    try { body = JSON.parse(rawBody); } catch { return null; }
    if (!ok(rawBody) && !ok(JSON.stringify(body))) return null;
    const b = body.Body || {};
    return {
      ref: String(body.TransactionRef || b.transaction_ref || ""),
      success: body.Event === "charge_successful" && String(b.transaction_status || "").toLowerCase() === "success",
      amountMinor: b.amount as number | undefined, currency: b.currency as string | undefined,
      metadata: (b.meta as Record<string, unknown>) || undefined, raw: body,
    };
  },
};
export default squad;
