# prämienhilfe.ch CRO/SEO Refactor — Design Spec

**Status:** Approved by user, with explicit exclusions (see "Excluded from scope").

## Source of truth

- Build instructions: `/Users/marco/Documents/repos/subsidy-website/instructions.md` (2026-09-01 version — CRO/SEO refactor of the deployed site)
- Existing codebase: `/Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch/` (Astro + React + Tailwind, deployed to Netlify)
- This is a REFACTOR of an existing, working, previously-reviewed site. Preserve everything not explicitly called out below.

## Excluded from scope (user-confirmed deviations from instructions.md)

instructions.md §4 and §14 ask for fabricated live-activity social proof: a randomly-cycling "🔴 LIVE N Personen ... haben heute einen Antrag eingereicht" counter, and a floating notification that explicitly "cycles through 3 fake names from Basel" claiming a named person "hat soeben ihren Antrag eingereicht." Both present invented events as real user activity. **Not implemented** — this is deceptive advertising (Swiss UWG / general consumer-protection risk), not a legitimate CRO technique. Replaced with the existing static, real, verified trust indicators (see §14 handling below).

Everything else in instructions.md is implemented as specified, including techniques that are aggressive-but-honest marketing (exit-intent popup with confirmshaming copy, a full-page "trapped" funnel with no nav chrome) — these don't fabricate facts, so they're implemented as requested, with one technical boundary noted below.

## User-confirmed facts

- "+1'000 Dossiers/Jahr", "4.8/5 Kundenbewertung", "FINMA-registriert" are real, verified business facts — published as-is, no placeholder flag needed (unlike the pre-existing Basel-Landschaft data placeholders, which are untouched by this refactor).
- Correct legal entity name is **"EVO Partners GmbH"** (not "Sàrl") — replace everywhere, including legal pages.
- `/basel-landschaft` is explicitly out of scope for this refactor. It keeps the existing `Funnel.jsx` (canton/income/household selector) untouched. Only `index.astro` and `basel-stadt.astro` move to the new situation-selector + `/antrag` flow.

## Architecture

### New React islands (client-side JS)

1. **`DisclaimerModal.jsx`** (`client:load`, mounted in `Base.astro`)
   - Blocking modal on first visit. Checks `localStorage.getItem('disclaimer_shown')` — a timestamp (ms). Shows if absent or older than 7 days (`7 * 24 * 60 * 60 * 1000`). On dismiss, writes `Date.now()` to that key.
   - Full content per instructions.md §1 (header, logo, title, body, 3-stat row, CTA, "direct to canton office" link).
   - Cannot be dismissed by clicking the overlay (only the CTA button dismisses it). Full-screen takeover on mobile (`fixed inset-0`), centered `max-w-lg` card on desktop.
   - **Suppressed on `/antrag`** (`Base` `chrome={false}` pages) — a mid-funnel legal interstitial would be bad UX for a committed user, and the `/antrag` page already carries its own "🔒 Sicheres Formular" trust framing.
   - The "Direkt zum offiziellen Kantonsamt (asb.bs.ch)" link uses `target="_blank" rel="noopener noreferrer"`.

2. **`ExitIntentPopup.jsx`** (`client:load`, mounted in `Base.astro`)
   - `document.addEventListener('mouseleave', ...)`, fires once per session when `e.clientY < 10` and `localStorage.getItem('exit_shown')` is unset. Sets `exit_shown` on fire (session-permanent, per instructions — no 7-day expiry specified for this one).
   - Content per instructions.md §12. CTA scrolls to `#pruefen` (same anchor Hero already uses) rather than a generic "funnel" id.
   - **Suppressed on `/antrag`** and suppressed while the `DisclaimerModal` is still showing (don't stack two modals).

3. **`StickyFunnelWidget.jsx`** (`client:idle`, mounted in `Base.astro`)
   - Fixed `bottom-6 right-6`, `w-72`, white card, shown only on `lg+` viewports, only after the user scrolls past the `#pruefen` hero section (`IntersectionObserver` on that section — hidden while hero is in view, shown once it scrolls out).
   - CTA links to `/#pruefen`.
   - **Suppressed on `/antrag`** (no chrome) and only rendered when `Base` is given `chrome={true}` (default).

4. **`AntragFunnel.jsx`** (`client:load`, mounted only on `src/pages/antrag.astro`)
   - Full rebuild, replaces the old step-1-through-4 `Funnel.jsx` flow for this page only. Reads `?situation=` from `window.location.search` on mount (`useEffect`), falls back to a generic label if missing/invalid.
   - 5 data-collecting steps + 1 confirmation state, mapped to the 4 sidebar breadcrumb stages as follows (instructions.md's stage list has 4 labels but the form has 5 data steps — this mapping keeps the breadcrumb meaningful without inventing new labels):
     - **Identifikation** → Step A: Email capture
     - **Ergänzende Informationen** → Step B: Haushaltsgrösse, Step C: Einkommen (both map to this one breadcrumb stage — it stays "active" across both)
     - **Ihre Situation** → Step D: Kontaktdaten (Vorname/Nachname/Telefon + legal checkbox)
     - **Abgeschlossen** → Step E: Confirmation
   - Same validation conventions as the existing `Funnel.jsx` (required fields, Swiss phone regex `/^(\+41|0041|0)\d{6,}$/` reused from the fixed version, basic email regex).
   - Submits to the existing `/api/submit` endpoint (unchanged contract), with `situation` added to the payload alongside `household`, `income`, `email`, `firstName`, `lastName`, `phone`. The API route itself needs no change (it forwards whatever fields are present to HubSpot's custom-property list) — this refactor adds one field-name mapping (`situation`) to the HubSpot payload builder in `api/submit.js`.
   - Legal checkbox required before submit (instructions.md §…, step 5).
   - Confirmation state shows a summary box (situation, household, income, email) and a green checkmark.
   - GA4 events: reuse the existing naming convention loosely — `antrag_email_submitted`, `antrag_household_submitted`, `antrag_income_submitted`, `antrag_contact_submitted`, `antrag_conversion` — guarded the same way as the existing `Funnel.jsx` (`window.gtag` existence check). This isn't explicitly requested in instructions.md but is a direct, minimal extension of the existing GA4 pattern into the new funnel, needed for the CRO goal of the refactor to be measurable at all.

### New/changed static (zero-JS) pieces

- **`SituationSelector.astro`** — replaces the old step-1 canton picker on the homepage/basel-stadt hero. 6 plain `<a href={`/antrag?situation=${slug}`}>` rows (icon + label + arrow), styled to match the existing funnel-card row look (`Funnel.jsx`'s `rowClass` styling, ported to static Tailwind classes). No client JS needed — it's pure navigation.
  - Slugs: `einzelperson`, `familie`, `paar`, `student`, `getrennt`, `rentner`.
- **`Base.astro`** gains a `chrome?: boolean` prop (default `true`). When `false`: no `<Header>`, no `<Footer>`, no mobile sticky CTA bar, and the three new interactive islands (disclaimer/exit-intent/sticky-widget) are not rendered. `/antrag.astro` is the only page passing `chrome={false}`. This is a prop addition, not a new layout file — keeps SEO/GA4 head logic in one place (DRY, matches the existing codebase's established pattern of one shared layout).
- The desktop-only left sidebar on `/antrag` (logo, 4-stage progress list, trust block) renders **inside `AntragFunnel.jsx`** rather than as a separate static component — its progress list must react live to client-side funnel step state, so splitting it into its own file would just mean passing that state back out through props for no isolation benefit. The logo link (`href="/"`, `target="_blank"`) and trust block are static JSX within the same file.

### Data/content changes

- **`src/data/cantons.js`**: remove the `PHONE` export's usage from anywhere it renders as a clickable contact method (keep the constant only if still referenced internally, otherwise delete it); the FAQ answer mentioning "EVO Partners Sàrl" → "EVO Partners GmbH" (both canton entries, since `basel-landschaft`'s FAQ also references the company name and instructions.md §8 says "everywhere").
- **`FAQ.astro` consumers**: home/basel-stadt FAQ list gets 2 new items prepended (instructions.md §6). Since FAQ content lives in `cantons.js` per-canton, add the two new Q&As to the front of `basel-stadt`'s `faqs` array only (not `basel-landschaft`, which is out of scope) — and to the standalone `/faq` page's data source (also `cantons['basel-stadt']`, so this is the same array — one edit covers both).
- **`InfoSection.astro` / `basel-stadt` facts**: remove the two income-threshold rows from `cantons['basel-stadt'].facts`, keep the other three, and add the new paragraph ("Die Einkommensgrenzen variieren...") to `infoParagraphs`.
- **Footer/Header/FinalCTA/Impressum**: remove phone (`tel:` links, visible number) everywhere; remove email from Footer and Impressum; **keep** email on Datenschutz only (legal contact requirement for data-subject rights — not explicitly requested for removal, and removing it would leave the privacy policy without any contact channel, which is itself a compliance problem). Replace FinalCTA's phone button with "Formular ausfüllen →" scrolling to `#pruefen`.
- **Footer Kontakt column**: becomes exactly 3 links — "Antrag stellen" (smooth scroll `#pruefen`), "Rückruf anfordern" (→ `/kontakt`), "Kontaktformular" (→ `/kontakt`).
- **Smooth scroll**: the plain-JS snippet from instructions.md §7 is added as an inline `<script>` in `Base.astro` (applies site-wide to all `href="#..."` anchors — this is a tiny, unconditional DOM-ready listener, not a React island, matching the "minimal JS" spirit as closely as this requirement allows).
- **SEO**: `Base.astro` gets an optional `schema?: object[]` prop — an array of JSON-LD objects rendered as `<script type="application/ld+json">` tags. `index.astro` and `basel-stadt.astro` pass the two schema blocks from instructions.md §11 (LocalBusiness + FAQPage, company name updated to GmbH). H1 changes on both pages to "Prämienverbilligung Basel-Stadt — Anspruch prüfen und Antrag stellen". New keyword paragraph added at the top of `InfoSection`'s content for `basel-stadt`.
- **External links**: audit and add `target="_blank" rel="noopener noreferrer"` to every link pointing off-domain (asb.bs.ch in disclaimer + FAQ if present, any other canton/government links). Internal links unchanged (same tab).
- **`netlify.toml`**: add the `[[headers]]` cache-control block for `/_astro/*` from instructions.md §15, appended after the existing `[build]` block. The previously-fixed absence of a catch-all `[[redirects]]` block stays absent (do not reintroduce it — that was a production-breaking bug fixed in the prior review cycle).
- **Images**: add explicit `width`/`height` and `loading="lazy"` to any `<img>` tags that don't already have them (the existing `Hero.astro` photo already uses Astro's `<Image>` with explicit dimensions and `loading="eager"` — intentionally not lazy, it's above the fold — leave as-is). Preconnect to Google Fonts already exists in `global.css`'s `@import`; add explicit `<link rel="preconnect">` tags to `Base.astro`'s `<head>` per instructions.md §15 for a small head-start over the CSS `@import` alone.

## Pages

- **`index.astro`** / **`basel-stadt.astro`**: near-identical to each other already (as before) — both get `SituationSelector` in place of the old canton-picker step 1, updated H1, schema markup, updated `InfoSection` content (income thresholds removed, new paragraph added), all phone/email removals, `Base` unchanged `chrome={true}`.
- **`src/pages/antrag.astro`** (new): `Base` with `chrome={false}`, minimal title/description, renders only `<AntragFunnel client:load />`. Reads nothing server-side from the query string (client-only, per the island's own `useEffect`).
- **`faq.astro`**: 2 new Q&As prepended (already covered by the `cantons.js` data change above, since this page reads from the same array).
- **`impressum.astro`**: GmbH rename, phone+email removed.
- **`datenschutz.astro`**: GmbH rename, email kept, add one paragraph describing that the `/antrag` funnel collects email first and other personal data in subsequent steps for the stated consulting purpose.
- **`Header.astro`**: remove the topbar phone link (keep the topbar itself, left-hand "Ein unabhängiger Beratungsservice" text stays — instructions.md §2 only calls out removing the phone from the topbar, not the whole bar).

## Testing/verification approach

No unit test suite in this project (consistent with the original build). Verification is `npm run build` + browser smoke tests, same convention as the original implementation: click through the disclaimer, dismiss it, confirm it doesn't reappear on reload, trigger exit-intent, walk the full `/antrag` funnel from a situation link through to confirmation, confirm `/basel-landschaft` is untouched and its old funnel still works, confirm all `tel:`/`mailto:` removals, confirm external links open in new tabs, confirm smooth scroll on footer anchors, confirm `npm run build` is clean and no console errors.

## Scope confirmation

Single cohesive refactor of one existing site — not decomposed into sub-project specs, consistent with how the original build was executed. Proceeding to the implementation plan.
