# Hafenkraft — Umzüge & Transporte

Concept portfolio site for a fictional, family-run moving company from Bremen.
Built to show what a crafted, conversion-focused small-business site can feel like.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · next/font · next/image

```bash
npm install
npm run dev              # http://localhost:3000
npm run build            # production build (what Vercel runs)
npm run estimator:check  # print sample moves to sanity-check pricing
npm run images:check     # verify every Unsplash photo id still resolves
```

Deploys to Vercel with zero configuration.

## Structure

```
app/                    layout (fonts, SEO, JSON-LD), page, OG image, robots, sitemap
components/sections/    Header, Hero, Services, Process, Coverage, Trust, FAQ/Contact, Footer
components/estimator/   Estimator (state + navigation), Steps, LiveLabel, QuoteStep, Waybill
components/ui/          Photo (graded image + fallback), motion helpers, waybill marks
lib/estimator/          typed pricing module — no React, no DOM
lib/i18n/               de.ts (primary) / en.ts dictionaries + provider
lib/images.ts           every photo in one place
lib/geo.ts              stylised Germany outline + projection for the map
```

## Estimator logic (`lib/estimator`)

- `rules.ts` — **all** mock pricing knobs: volume per room/m², truck sizes and
  rates, crew thresholds, stairs penalties, travel speed, fixed fees, date
  multipliers and range spread. Change numbers here, nothing else.
- `estimate.ts` — pure `estimate(input) → Estimate` plus helpers. Inputs are
  nullable; unanswered questions use defaults and widen the price range
  (`confidence` 0..1), so the range visibly tightens as the user answers.
- `places.ts` — mock geography (postcode-region centroids, EU cities).

To connect a real backend, keep `EstimateInput`/`Estimate` as the contract and
swap `estimate()` for an API call; the UI doesn't need to change.

## Notes

- Language: German is the default; EN is one tap away (stored in `localStorage`).
- Motion respects `prefers-reduced-motion` (no pinning, no draws, no count-ups).
- The quote form sends nothing — it's a demo. Phone/e-mail are fictional.
- Photos come from Unsplash. If one fails to load, a designed placeholder
  plate is shown instead of a broken image; replace ids in `lib/images.ts`.
- Footer credit placeholder: search for `[My Studio]` in `lib/i18n/`.
