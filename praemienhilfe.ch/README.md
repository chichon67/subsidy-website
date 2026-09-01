# prämienhilfe.ch

Swiss health-insurance subsidy (Prämienverbilligung) lead-generation site, with a national homepage plus dedicated funnels for Basel-Stadt and Basel-Landschaft. Built with Astro, a single React island for the funnel, and Tailwind CSS.

## Pages

- `/` — national homepage: canton selector (Basel-Stadt, Basel-Landschaft active; Zürich, Bern, Aargau, Luzern, Solothurn, Genf coming soon), 10 content sections
- `/basel-stadt` — Basel-Stadt canton page (situation-based funnel)
- `/basel-landschaft` — Basel-Landschaft canton page (canton+situation funnel)
- `/antrag` — full-page trapped funnel (no header/footer)
- `/so-funktioniert-es`, `/faq`, `/kontakt` — supporting pages
- `/impressum`, `/datenschutz` — legal pages
- `/api/submit` — server endpoint for funnel form submissions

## Setup

```bash
npm install
cp .env.example .env
# fill in HUBSPOT_PORTAL_ID, HUBSPOT_FORM_ID, PUBLIC_GA4_ID
npm run dev
```

## Environment variables

| Variable | Purpose |
|---|---|
| `HUBSPOT_PORTAL_ID` | HubSpot portal ID for the Forms API submission target |
| `HUBSPOT_FORM_ID` | HubSpot form ID for the Forms API submission target |
| `PUBLIC_GA4_ID` | GA4 measurement ID (e.g. `G-XXXXXXXX`); exposed client-side |

## Build

```bash
npm run build
```

## Deploy

Connected to Netlify via `netlify.toml` (`npm run build` → `dist/`). Set the environment variables above in the Netlify site dashboard before deploying.

## Known content gap

The Basel-Landschaft income thresholds, beneficiary count, and application deadline in `src/data/cantons.js` are **unverified placeholders** — confirm against the official SVA Basel-Landschaft source and update before launch.
