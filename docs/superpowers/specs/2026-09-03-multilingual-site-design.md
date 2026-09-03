# Multilingual (DE/EN/ES) Site — Design

Source request: `main-instructions.md` (repo root). Site: praemienhilfe.ch, Astro 7 + React islands + Tailwind 4, Netlify adapter.

## Scope

Full DE/EN/ES translation and routing for:
- Home (`/`)
- `/basel-stadt`
- `/basel-landschaft`
- `/faq`
- `/so-funktioniert-es`
- `/kontakt`
- `/antrag`
- `/danke`

All other canton pages (generated today by `src/pages/[canton].astro`, one per remaining Swiss canton) stay **German-only**. They remain reachable at their existing German paths under every locale via Astro's i18n fallback — no forced redirect, no interstitial. Extending them to EN/ES is an explicit, separate future task.

## Routing

Astro's built-in `i18n` integration, configured in `astro.config.mjs`:

```js
i18n: {
  locales: ['de', 'en', 'es'],
  defaultLocale: 'de',
  routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  fallback: { en: 'de', es: 'de' },
}
```

- `prefixDefaultLocale: true` — German lives at `/de/...`, not bare `/`, per the instructions' explicit URL scheme.
- `fallback: { en: 'de', es: 'de' }` — any route that has no EN/ES page (all the untranslated canton pages) is rewritten (not redirected) to serve the German content, so the URL the user is on doesn't change and there's no forced bounce.
- All in-scope pages move under `src/pages/[locale]/...` (e.g. `src/pages/[locale]/index.astro`, `.../basel-stadt.astro`, `.../antrag.astro`, `.../danke.astro`). The generic `src/pages/[canton].astro` also moves under `[locale]` so every canton URL keeps working through fallback.

## Root `/` redirect

`src/pages/index.astro` (bare root, outside `[locale]`) becomes a non-prerendered route (`export const prerender = false`):

1. Read `pv_lang` cookie if present → use it.
2. Else parse `Accept-Language` header: `de*→de`, `es*→es`, `en*→en`, anything else → `de`.
3. Issue an HTTP 302 to `/de/`, `/en/`, or `/es/`.

No client-side JS, no flash, works with JS disabled. Never redirects to itself, so no loop risk. Direct visits to `/de/`, `/en/`, `/es/` are never intercepted — detection code only exists on the bare-root route.

## Content architecture

Two kinds of translatable text, two structures:

**UI strings** (nav labels, buttons, form field labels/placeholders, validation messages, footer labels, popup/disclaimer copy) → `src/i18n/ui.js`:

```js
export const ui = {
  de: { 'nav.faq': 'FAQ', 'form.email': 'E-Mail', ... },
  en: { 'nav.faq': 'FAQ', 'form.email': 'Email', ... },
  es: { 'nav.faq': 'Preguntas frecuentes', 'form.email': 'Correo electrónico', ... },
};
```

A `useTranslations(locale)` helper returns a `t(key)` lookup function, usable from `.astro` frontmatter (`Astro.currentLocale`) and passed as a prop into React islands.

**Long structured content** (hero copy, FAQ Q&As, "why people don't apply" reasons, Basel-Stadt/-Landschaft canton info) → existing data modules restructured to carry all three languages under the same key shape:

```js
// src/data/national.js
export const national = {
  de: { heroCopy: {...}, nationalFaqs: [...], ... },
  en: { heroCopy: {...}, nationalFaqs: [...], ... },
  es: { heroCopy: {...}, nationalFaqs: [...], ... },
};
```

Same for `src/data/cantons.js` (Basel-Stadt/-Landschaft only — other cantons' `genericCanton.js`-driven content is untouched/German-only). Consuming components take `locale` (from `Astro.currentLocale` or a prop) and index `national[locale]`, `cantons['basel-stadt'][locale]`, etc. Keeping the same key shape per language makes a missing translation an obvious missing key rather than silent drift.

## Language switcher

- `DE | EN | ES` text links in `Header.astro` desktop nav (next to "Antrag prüfen") and in the mobile menu panel.
- Active language shown bold/underlined.
- Clicking a link: sets `pv_lang` cookie (1 year, `SameSite=Lax`), then navigates to the equivalent page in the target locale via `getRelativeLocaleUrl`, falling back to that locale's homepage if the current page has no counterpart (e.g. switching to EN while on an untranslated canton page under fallback goes to `/en/`, not a 404).

## Forms, tracking, conversion (must not regress)

- `AntragFunnel.jsx` / `api/submit.js`: same fields, same HubSpot endpoint, same custom GA4 event names (`antrag_form_submit`, `antrag_conversion`, `funnel_conversion`, `funnel_step_1_complete`, etc.) fire identically in every locale. Only visible labels/placeholders/validation strings change, driven by `ui`.
- `AW-18005574565` Google Ads tag and the GA4 (`PUBLIC_GA4_ID`) snippet stay in `Base.astro`, loaded once per page load regardless of locale — not duplicated, not per-locale-conditional.
- `/danke` keeps the same route slug (`danke`) in every locale — `/de/danke`, `/en/danke`, `/es/danke` — rather than localizing the slug itself (the instructions' own suggested example, `/en/thank-you`, `/es/gracias`, is offered as one option; keeping one stable slug across locales is simpler and lower-risk for the Ads conversion action, which the instructions explicitly prioritize protecting). The page's headline/body text is still translated via `ui`/`DankeSummary.jsx` locale prop.

## SEO

- Every in-scope page: locale-specific `<title>` and `<meta description>`, self-referencing canonical, full hreflang set (`de`, `en`, `es`, `x-default`) computed from a shared per-page list of locale URLs. `x-default` points to the `/de/` version.
- German-only canton pages: hreflang `de` + `x-default` only — no fabricated `en`/`es` alternates for pages that don't exist.
- New `src/pages/sitemap.xml.ts` (no sitemap exists today) generated at build time, listing every prerendered route with its hreflang alternates.
- No `noindex` on any translated page.

## Explicitly out of scope

- Redesign, CSS, layout, spacing, fonts, component visual structure.
- The 24 German-only canton pages' content (translation is a later, separate task).
- HubSpot contact property names / API payload shape.
- Existing GA4 custom event names.

## Verification checklist (from `main-instructions.md`, mapped to this design)

1–3. `/de/`, `/en/`, `/es/` all render — via `[locale]` routing.
4. Browser-language detection — root redirect, `Accept-Language` parsing.
5. Saved preference — `pv_lang` cookie read before `Accept-Language`.
6–7. Manual switch (desktop + mobile) — header/menu switcher links.
8. Equivalent-page retention on switch — `getRelativeLocaleUrl` + homepage fallback.
9–10. Forms submit and reach conversion state in every locale — `AntragFunnel.jsx` unchanged logic, translated strings only.
11–12. Ads tag fires once, not duplicated — single tag in `Base.astro`.
13. Existing GA4 events unchanged — event names untouched.
14–17. SEO titles/descriptions/hreflang/canonical per page — per-page metadata + shared hreflang helper.
17. Sitemap includes translated pages — new `sitemap.xml.ts`.
18. No redirect loop — root only redirects, prefixed routes never redirect.
19. Unsupported browser languages → German — default branch in `Accept-Language` parsing.
20. No regression to existing German functionality — same components, same data, added locale dimension.
