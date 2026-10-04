# 99names.net — Light, by name.

Next.js site for the 99 Names of Allah. Direction 03 "Noor": the page tints itself to the current prayer time.

## Run
    npm install
    npm run dev        # http://localhost:3000

## Deploy
Live: **https://99names-site.vercel.app** (Vercel project `99names-site`)

    npx vercel deploy --prod --yes

Note: a separate, pre-existing Vercel project called `99names` belongs to something else and is
deliberately NOT used by this site. The brand book is its own project, `99names-brand`.

## Where things live
- `lib/names.ts` — all 99 names (Arabic, transliteration, meaning, root, one-line reflection). Edit copy here.
- `lib/hour.ts` — prayer-time → hour palette logic (adhan, Muslim World League). Clock fallback if no location.
- `components/HourProvider.tsx` — sets `data-hour` on `<html>`; footer buttons override it (stored in localStorage).
- `app/globals.css` — palettes per hour live at the top.
- `app/shop/page.tsx` — the notify form posts to Formspree; replace `REPLACE_ME` with your form id.
- `components/Listen.tsx` — placeholder recitation via the browser's Arabic voice; swap for real audio files when recorded.

Logo assets: `../brand/logo/` (SVG + PNG).

## Payments & orders

Send-a-Name (`/send`) and the shop (`/shop`, `/checkout`) charge through a hosted checkout.
Copy `.env.example` to `.env.local` and fill in:

- `PAY_PROVIDER` — `squad` (default) or `paystack`; `PAY_CURRENCY` — `NGN` (default) or `USD`.
- `SQUAD_SECRET_KEY` (sandbox keys from sandbox.squadco.com, live from dashboard.squadco.com). The base URL is picked from the key prefix.
- `UPSTASH_REDIS_REST_URL` / `_TOKEN` (or Vercel KV) so orders persist. Without them orders live in memory (dev only).
- `RESEND_API_KEY` + `ORDER_EMAIL` so every paid order and every recipient address lands in the team inbox.

Webhooks: point Squad at `/api/webhooks/squad` and Paystack at `/api/webhooks/paystack`. Both verify the HMAC-SHA512 signature, re-verify the transaction with the provider, and only then mark the order paid.

With no keys set the checkout runs in **test mode**: the order is created and the buyer lands on `/checkout/done?…&test=1` so the whole flow can be walked end to end.

Free links need no backend: `/for/<token>` carries the name, the recipient, the note and an optional delivery date in the URL (`lib/send.ts`).
