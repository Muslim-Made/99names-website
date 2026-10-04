import squad from "./squad";
import paystack from "./paystack";
import type { PayProvider, Currency } from "./types";
export type { PayProvider, Currency, CheckoutInput, Verified, WebhookEvent } from "./types";

/** PAY_PROVIDER=squad (default) | paystack. Both can be configured; this picks the one used for new checkouts. */
export function provider(name?: string): PayProvider {
  const n = (name || process.env.PAY_PROVIDER || "squad").toLowerCase();
  return n === "paystack" ? paystack : squad;
}
export const isConfigured = () => provider().name === "paystack" ? !!process.env.PAYSTACK_SECRET_KEY : !!process.env.SQUAD_SECRET_KEY;
/** What we charge in. Squad and Paystack both take NGN; USD needs enabling on the merchant profile. */
export const currency = (): Currency => (process.env.PAY_CURRENCY === "USD" ? "USD" : "NGN");
