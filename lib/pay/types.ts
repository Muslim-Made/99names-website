export type Currency = "NGN" | "USD";
export type CheckoutInput = { ref: string; amountMinor: number; currency: Currency; email: string; customerName?: string; metadata?: Record<string, unknown>; callbackUrl: string };
export type Verified = { ok: boolean; status: "success" | "failed" | "pending" | "abandoned" | "unknown"; amountMinor?: number; currency?: string; email?: string; raw?: unknown };
export type WebhookEvent = { ref: string; success: boolean; amountMinor?: number; currency?: string; metadata?: Record<string, unknown>; raw: unknown };
export interface PayProvider {
  name: "squad" | "paystack";
  createCheckout(c: CheckoutInput): Promise<{ url: string }>;
  verify(ref: string): Promise<Verified>;
  /** Returns null when the signature doesn't match. */
  parseWebhook(rawBody: string, headers: Headers): WebhookEvent | null;
}
