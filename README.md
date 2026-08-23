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
