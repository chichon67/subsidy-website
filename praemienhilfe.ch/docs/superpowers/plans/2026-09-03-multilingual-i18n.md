# Multilingual (DE/EN/ES) Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. This repo has no automated test runner — "tests" in this plan mean `npm run build` succeeding plus manual verification in the browser (dev server / build preview), per the project's own QUALITY CHECKS list in the spec.

**Goal:** Convert praemienhilfe.ch from a German-only Astro site into a DE/EN/ES multilingual site with locale-prefixed URLs, without breaking existing Google Ads tracking (`AW-18005574565`), form submission (HubSpot), or the `/danke` conversion page.

**Architecture:** Full route-tree parity via a single `[lang]` dynamic segment. Every existing page under `src/pages/` moves to `src/pages/[lang]/<same-name>.astro` and is built 3× (de/en/es) via `getStaticPaths`. Because the route tree is byte-identical across locales, the language switcher is a pure pathname segment swap (no per-page mapping needed at runtime). Copy lives in two layers: a flat JSON dictionary per locale for UI chrome (nav, forms, buttons, validation), and locale-nested content objects for long-form marketing/FAQ/legal prose (extending the existing `src/data/*.js` shape rather than replacing it). `/danke` stays a single unprefixed URL (existing behavior preserved exactly) and renders localized content client-side from a stashed language value, per the spec's own fallback clause — this protects whatever Google Ads conversion configuration currently targets that URL, which could not be verified from the repo alone (see Task 1).

**Tech Stack:** Astro 7 (static output, `@astrojs/netlify` adapter), React 19 islands (`client:load`), Tailwind 4. No i18n library added — plain JS dictionaries + prop drilling, per the spec's performance constraints.

**Spec:** `/Users/marco/Documents/repos/subsidy-website/main-instructions.md`

## Global Constraints

- Never remove, duplicate, or alter the single `gtag.js` loader / `gtag('config', ...)` block in `src/layouts/Base.astro` — one GA4 config, one Ads config, unchanged.
- Google Ads conversion must still fire only after a fully successful form submission (`AntragFunnel.jsx`'s existing `track('antrag_conversion', ...)` + redirect to `/danke`) — do not add earlier-firing conversion events.
- `/danke` stays a single unprefixed URL for all three locales (decision below, Task 1) — do not move it under `/[lang]/`.
- `src/pages/api/submit.js` request/response contract is unchanged; only additive, schema-safe fields may be sent to HubSpot (free-text note body only, never a new key in `contactProps` — the code comments warn an unrecognized HubSpot contact property fails the entire request).
- Old unprefixed content URLs (`/basel-stadt`, `/faq`, `/kontakt`, `/antrag`, `/so-funktioniert-es`, `/impressum`, `/datenschutz`, every canton slug) get 301 redirects to their `/de/...` equivalents (user decision).
- Work happens on a new branch (`i18n/multilingual`), not directly on `main` (user decision).
- No redesign: same fonts/colors/spacing/components; only what's needed for language support.
- Do not invent FINMA registrations, licenses, guarantees, or canton partnerships in translation. Where a legal phrase is ambiguous, keep the German original and flag it — do not guess a translation.
- Root `/` must redirect fast with no visible flash, never redirect a user who explicitly visits `/de/`, `/en/`, or `/es/`, and never loop.

---

## Task 0: Branch setup

**Files:** none (git only)

- [x] Create and switch to branch `i18n/multilingual` from current `main`.
- [x] Confirm `git status` is clean before starting (stash/commit anything stray first — `git status` currently shows a deleted `../instructions.md` one level up, outside this repo; leave it alone, it's outside `praemienhilfe.ch/`).

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
git checkout -b i18n/multilingual
```

---

## Task 1: i18n core — locale list, dictionary loader, path helpers

**Files:**
- Create: `src/i18n/locales.js`
- Create: `src/i18n/dictionaries/de.json`
- Create: `src/i18n/dictionaries/en.json`
- Create: `src/i18n/dictionaries/es.json`
- Create: `src/i18n/index.js`
- Modify: `src/i18n/pageUrls.js` (add `impressum`/`datenschutz` keys, drop `danke` from the hreflang-relevant set — it's a single unprefixed noindex URL, not a per-locale page)

**Interfaces:**
- Produces: `LOCALES = ['de','en','es']`, `DEFAULT_LOCALE = 'de'` (from `src/i18n/locales.js`)
- Produces: `getDictionary(lang)` → parsed JSON dict object, `t(dict, 'a.b.c')` → dot-path string lookup with a thrown error in dev if the key is missing (fail loud, don't silently render `undefined`) (from `src/i18n/index.js`)
- Produces: `localePath(lang, path)` → `` `/${lang}${path}` `` (from `src/i18n/index.js`), used by Header/Footer for internal links
- Produces: `htmlLang(lang)` → `{de:'de-CH', en:'en-CH', es:'es-CH'}[lang]` (from `src/i18n/index.js`)
- Consumes: nothing new

**Decisions locked in this task (do not re-litigate in later tasks):**
- `/danke` remains a single unprefixed URL for every locale. Reasoning: `AntragFunnel.jsx` and `danke.astro` both carry explicit comments that `/danke` exists specifically to be a stable Google Ads conversion-tracking destination, and the survey could not confirm from the repo alone whether the Ads conversion action is configured as a URL-based destination (in which case a locale-prefixed URL like `/en/thank-you` would silently stop counting conversions) or an imported GA4 event. The spec explicitly authorizes this fallback: *"If the existing architecture makes localized thank-you URLs risky for Google Ads conversion tracking, keep /danke as the final technical thank-you URL for all languages, but display the thank-you content in the language selected by the user."* Language on `/danke` is resolved client-side (Task 8).
- Old bare URLs 301-redirect to `/de/...` (Task 10, `netlify.toml`).

**Steps:**

- [x] **Step 1: Write `src/i18n/locales.js`**

```js
// src/i18n/locales.js
export const LOCALES = ['de', 'en', 'es'];
export const DEFAULT_LOCALE = 'de';

const HTML_LANG = { de: 'de-CH', en: 'en-CH', es: 'es-CH' };
export function htmlLang(lang) {
  return HTML_LANG[lang] || HTML_LANG[DEFAULT_LOCALE];
}
```

- [x] **Step 2: Write the three dictionary JSON files**

Structure (same keys in all three files, values translated). This is the UI-chrome layer only — nav, header, footer, mobile menu, the full `AntragFunnel`/`SituationFunnel` string set from the survey (stage labels, step questions, placeholders, validation messages, buttons), language switcher labels, and generic CTA/meta fallback strings. Long-form marketing/FAQ/legal prose does NOT go here — that's Task 2.

```json
{
  "nav": { "home": "Prämienverbilligung", "cantons": "Kantone", "howItWorks": "So funktioniert es", "faq": "FAQ", "contact": "Kontakt", "checkEligibility": "Anspruch prüfen", "checkEligibilityShort": "Antrag prüfen", "allCantons": "Alle Kantone" },
  "langSwitcher": { "de": "DE", "en": "EN", "es": "ES", "ariaLabel": "Sprache wählen" },
  "footer": {
    "tagline": "Hilfe bei der Prämienverbilligung in der Schweiz",
    "cantonsHeading": "Kantone",
    "infoHeading": "Informationen",
    "legalHeading": "Rechtliches",
    "impressum": "Impressum",
    "datenschutz": "Datenschutz",
    "operatedBy": "Betrieben von"
  },
  "mobileCta": { "default": "Anspruch prüfen →", "canton": "Anspruch {canton} prüfen →" },
  "form": {
    "stages": { "identification": "Identifikation", "additional": "Ergänzende Informationen", "situation": "Ihre Situation", "done": "Abgeschlossen" },
    "stepOf": "Schritt {n} von {total}",
    "secureForm": "🔒 Sicheres Formular",
    "sidebar": { "finma": "FINMA-anerkannter Broker", "analysis": "Situationsanalyse · Unverbindlich", "rating": "4.8/5 von unseren Klienten bewertet", "volume": "+1'000 Dossiers pro Jahr bearbeitet" },
    "canton": { "question": "In welchem Kanton wohnen Sie?", "placeholder": "Kanton auswählen…", "ariaLabel": "Kanton wählen" },
    "situation": { "yourCanton": "Ihr Kanton: {canton}", "question": "Was beschreibt Ihre Situation am besten?" },
    "email": { "summaryTitle": "Ihr Antrag:", "notProvided": "Nicht angegeben", "prompt": "Zu Beginn benötigen wir Ihre E-Mail-Adresse", "placeholder": "name@beispiel.ch", "consent": "Mit dem Fortfahren akzeptieren Sie unsere Datenschutzrichtlinie und die Verarbeitung Ihrer persönlichen Daten.", "continue": "Weiter →", "invalid": "Bitte eine gültige E-Mail-Adresse angeben." },
    "household": { "question": "Wie viele Personen leben in Ihrem Haushalt?", "personSingular": "Person", "personPlural": "Personen", "continue": "Weiter →" },
    "income": { "question": "Wie hoch ist Ihr monatliches Haushaltseinkommen?", "under2000": "Unter CHF 2'000", "2000to4000": "CHF 2'000 – 4'000", "4000to6000": "CHF 4'000 – 6'000", "over6000": "Über CHF 6'000" },
    "contact": { "question": "Wie können wir Sie erreichen?", "firstName": "Vorname", "lastName": "Nachname", "consent": "Ich akzeptiere die Datenschutzbestimmungen von EVO Partners GmbH und stimme der Verarbeitung meiner Daten zum Zweck der Beratung zu.", "submit": "Antrag einreichen →", "submitting": "Wird gesendet…" },
    "errors": { "firstName": "Bitte Vorname angeben.", "lastName": "Bitte Nachname angeben.", "phone": "Bitte Telefonnummer angeben.", "phoneInvalid": "Bitte eine gültige Telefonnummer angeben.", "consent": "Bitte akzeptieren Sie die Datenschutzbestimmungen.", "submitFailed": "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut." }
  },
  "situationSelector": { "heading": "Was beschreibt Ihre Situation am besten?" },
  "widgets": {
    "sticky": { "default": "Anspruch prüfen", "canton": "Anspruch {canton} prüfen", "sub": "Kostenlose Prüfung in 20 Min.", "cta": "Jetzt starten →" },
    "exitIntent": { "heading": "Warten Sie — prüfen Sie zuerst Ihren Anspruch!", "cta": "Jetzt prüfen →", "decline": "Nein danke, ich verzichte auf meine Verbilligung" },
    "disclaimer": { "heading": "Wichtiger Hinweis", "cta": "Verstanden — Weiter →" }
  },
  "thankYou": {
    "titleWithName": "Vielen Dank, {firstName}!",
    "titleGeneric": "Vielen Dank für Ihre Anfrage!",
    "labels": { "situation": "Situation:", "canton": "Kanton:", "household": "Haushalt:", "income": "Einkommen:", "email": "E-Mail:" },
    "confirmationNote": "Sie erhalten in Kürze eine Bestätigung per E-Mail.",
    "backHome": "Zurück zur Startseite"
  }
}
```

(`en.json`/`es.json`: same keys, natural — not literal — translations, using the terminology from the spec: EN "health insurance premium reduction / premium subsidy / Swiss health insurance / check eligibility / subsidy application"; ES "reducción de primas del seguro médico / subsidio para el seguro médico / seguro médico en Suiza / comprobar si tiene derecho / solicitud de reducción de primas". Keep interpolation placeholders — `{n}`, `{total}`, `{canton}`, `{firstName}` — identical across all three files; `t()` does simple `{key}` substitution, add that to `src/i18n/index.js` alongside the dot-path getter.)

- [x] **Step 3: Write `src/i18n/index.js`**

```js
// src/i18n/index.js
import de from './dictionaries/de.json';
import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import { LOCALES, DEFAULT_LOCALE, htmlLang } from './locales.js';

const DICTS = { de, en, es };

export { LOCALES, DEFAULT_LOCALE, htmlLang };

export function getDictionary(lang) {
  return DICTS[lang] || DICTS[DEFAULT_LOCALE];
}

export function t(dict, path, vars) {
  const value = path.split('.').reduce((obj, key) => obj?.[key], dict);
  if (typeof value !== 'string') {
    throw new Error(`[i18n] missing translation key "${path}"`);
  }
  if (!vars) return value;
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), value);
}

export function localePath(lang, path) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${clean}`;
}
```

- [x] **Step 4: Update `src/i18n/pageUrls.js`** — add `impressum` and `datenschutz` entries to `PATHS` (same shape as existing entries), remove `danke` from `PATHS` (it no longer has per-locale paths — it's one URL). Grep for `getLocalizedUrls('danke')` / `canonicalFor('danke', ...)` usage afterward and update the one call site (`danke.astro`, Task 8) to use a plain literal canonical instead.

- [x] **Step 5: Verify** — `node -e "import('./src/i18n/index.js').then(m => console.log(m.t(m.getDictionary('de'), 'form.stepOf', {n:1,total:6})))"` prints `Schritt 1 von 6`. Repeat for `en`/`es` dicts to confirm they parse and have matching key sets (a quick script diffing `Object.keys` recursively across the three JSON files catches missing keys — write and run it ad hoc, no need to keep it).

- [x] **Step 6: Commit**

```bash
git add src/i18n
git commit -m "feat(i18n): add locale dictionaries and path helpers"
```

---

## Task 2: Locale-aware content data

**Files:**
- Modify: `src/data/national.js` — wrap existing exports in a `{ de: {...current content}, en: {...}, es: {...} }` shape behind a `getNational(lang)` accessor; keep the current German values as the `de` branch verbatim (no content drift).
- Modify: `src/data/cantons.js` — same pattern nested one level deeper: `{ 'basel-stadt': { de: {...current}, en: {...}, es: {...} }, 'basel-landschaft': { de: {...}, en: {...}, es: {...} } }` behind `getCanton(slug, lang)`.
- Modify: `src/data/genericCanton.js` — `buildGenericCantonData(name, lang)` (add `lang` param, add EN/ES sentence templates alongside the existing German ones; same interpolation of `${name}`).
- Modify: `src/data/situations.js` — wrap the 5 short labels per locale behind `getSituationLabel(slug, lang)` / `getSituationList(lang)`.
- Leave unchanged: `src/data/deutschschweiz.js` (pure structural: slugs, SVG paths, `active` flags — no prose, no locale needed).

**Interfaces:**
- Consumes: nothing new
- Produces: `getNational(lang)`, `getCanton(slug, lang)`, `buildGenericCantonData(name, lang)`, `getSituationLabel(slug, lang)`, `getSituationList(lang)` — all four become the only way callers read this content going forward (Task 5/6 update every `.astro`/`.jsx` caller from the old direct-import style to these accessors).

**Steps:**

- [x] **Step 1:** For each of the 4 data files, move the current (German) values verbatim into a `de` branch, then write natural (not literal) EN and ES translations for the `en`/`es` branches, using the spec's terminology guidance. Do **not** touch `impressum.astro` / `datenschutz.astro` prose here — that's Task 7, handled separately because it's legal text with its own review flag.
- [x] **Step 2:** Add the accessor function to each file, falling back to the `de` branch if a requested `lang` key is missing (defensive default — should never trigger once Step 1 is complete, but keeps a partial translation from crashing a build).
- [x] **Step 3: Verify** — `npm run build` after this task will still fail (nothing imports these accessors yet, and old direct-named exports like `nationalStats` are gone) — that's expected; Task 5/6 fix the call sites. Instead verify in isolation: a throwaway `node -e` import confirming `getNational('en').nationalFaqs.length === getNational('de').nationalFaqs.length` etc. for each file, so translation coverage is structurally complete before wiring it into pages.
- [x] **Step 4: Commit**

```bash
git add src/data
git commit -m "feat(i18n): make content data locale-aware (de/en/es)"
```

---

## Task 3: Route tree — move every page under `src/pages/[lang]/`

**Files:**
- Move + modify: `src/pages/index.astro` → `src/pages/[lang]/index.astro`
- Move + modify: `src/pages/faq.astro` → `src/pages/[lang]/faq.astro`
- Move + modify: `src/pages/kontakt.astro` → `src/pages/[lang]/kontakt.astro`
- Move + modify: `src/pages/so-funktioniert-es.astro` → `src/pages/[lang]/so-funktioniert-es.astro`
- Move + modify: `src/pages/antrag.astro` → `src/pages/[lang]/antrag.astro`
- Move + modify: `src/pages/impressum.astro` → `src/pages/[lang]/impressum.astro`
- Move + modify: `src/pages/datenschutz.astro` → `src/pages/[lang]/datenschutz.astro`
- Move + modify: `src/pages/basel-stadt.astro` → `src/pages/[lang]/basel-stadt.astro`
- Move + modify: `src/pages/basel-landschaft.astro` → `src/pages/[lang]/basel-landschaft.astro`
- Move + modify: `src/pages/[canton].astro` → `src/pages/[lang]/[canton].astro`
- Leave in place, gutted: `src/pages/index.astro` (Task 9 — becomes the root detector, not a copy of the homepage)
- Leave in place, unchanged: `src/pages/danke.astro`, `src/pages/api/submit.js`

**Interfaces:**
- Consumes: `LOCALES` from `src/i18n/locales.js` (Task 1)
- Produces: every content page reachable at `/de/...`, `/en/...`, `/es/...`

**Steps:**

- [x] **Step 1:** For each moved file, add/adjust `getStaticPaths`. Static pages (index, faq, kontakt, so-funktioniert-es, antrag, impressum, datenschutz, basel-stadt, basel-landschaft):

```js
import { LOCALES } from '../../i18n/locales.js';
export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}
const { lang } = Astro.params;
```

For `[lang]/[canton].astro`, cross the locale list with the existing canton list (same filter logic the current `[canton].astro` already uses to exclude `basel-stadt`/`basel-landschaft`, which have their own bespoke files):

```js
export function getStaticPaths() {
  return LOCALES.flatMap((lang) =>
    deutschschweizCantons
      .filter((c) => c.slug !== 'basel-stadt' && c.slug !== 'basel-landschaft')
      .map((c) => ({ params: { lang, canton: c.slug } }))
  );
}
```

- [x] **Step 2:** In each moved page, replace hardcoded German strings with `t(dict, 'key')` calls (`const dict = getDictionary(lang)`) and hardcoded content imports with the locale-aware accessors from Task 2 (`getNational(lang)`, `getCanton(slug, lang)`, etc.). Update every internal `href` (`/kontakt`, `/faq`, `/antrag`, `/basel-stadt`, `/${c.slug}`, `/impressum`, `/datenschutz`, `/`) to go through `localePath(lang, ...)`. In-page anchors (`#pruefen`, `#funnel`, `#faq`, `#so-funktioniert-es`, `#wer-wir-sind`) stay unprefixed — they're same-page fragments, locale-agnostic.
- [x] **Step 3:** Update every `<Base ... canonical={...} />` call to build the canonical from `canonicalFor(pageKey, lang, Astro.url.pathname)` (Task 1's updated `pageUrls.js`) instead of a hardcoded `https://praemienhilfe.ch/...` string.
- [x] **Step 4: Verify** — `npm run dev`, visit `/de/`, `/en/`, `/es/`, `/de/basel-stadt`, `/en/basel-stadt`, `/de/faq`, `/de/aargau` (or whichever canton slug is `active`), confirm each renders with locale-appropriate copy and every nav link points at a `/lang/...` URL that also resolves. This is QUALITY CHECKS items 1–3 from the spec.
- [x] **Step 5: Commit**

```bash
git add src/pages
git commit -m "feat(i18n): move all content pages under /[lang]/ route tree"
```

---

## Task 4: Base layout — hreflang, canonical, `<html lang>`, language-aware chrome

**Files:**
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Consumes: `htmlLang(lang)`, `getDictionary(lang)` (Task 1), `getLocalizedUrls(pageKey)` (Task 1's updated `pageUrls.js`)
- Produces: `Props` gains `lang: 'de'|'en'|'es'` and `pageKey?: string` (for hreflang lookup — pages without a `pageUrls` entry, i.e. generic canton pages, skip the hreflang block); Header/Footer receive `lang` as a prop.

**Steps:**

- [x] **Step 1:** Add `lang` and `pageKey` to `Props`. Set `<html lang={htmlLang(lang)}>` (was hardcoded `de-CH`).
- [x] **Step 2:** After the existing `<link rel="canonical">`, add the hreflang block when `pageKey` resolves in `pageUrls.js`:

```astro
{alternates && (
  <>
    <link rel="alternate" hreflang="de" href={alternates.de} />
    <link rel="alternate" hreflang="en" href={alternates.en} />
    <link rel="alternate" hreflang="es" href={alternates.es} />
    <link rel="alternate" hreflang="x-default" href={alternates.de} />
  </>
)}
```

where `const alternates = pageKey ? getLocalizedUrls(pageKey) : null;`. Update `og:locale` to `{de:'de_CH', en:'en_CH', es:'es_CH'}[lang]` (informal but consistent Swiss-context tags, matching `htmlLang`).
- [x] **Step 3:** Do **not** touch the gtag script block (lines currently ~50–63) — same single loader, same two `gtag('config', ...)` calls, regardless of `lang`. This is the highest-risk part of the file; leave it byte-identical.
- [x] **Step 4:** Pass `lang` through to `<Header activePage={activePage} lang={lang} />` and `<Footer activePage={activePage} lang={lang} />` (Task 5). Update `mobileCtaLabel` to use `t(dict, 'mobileCta.canton', {canton: cantonName})` / `t(dict, 'mobileCta.default')`.
- [x] **Step 5: Verify** — view source on `/en/basel-stadt`, confirm `<html lang="en-CH">`, a `<link rel="canonical">` pointing at the `/en/` URL, and 4 `hreflang` alternates (de/en/es/x-default) all pointing at absolute `https://praemienhilfe.ch/...` URLs. This is QUALITY CHECKS items 14–16.
- [x] **Step 6: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat(i18n): locale-aware Base layout (hreflang, canonical, html lang)"
```

---

## Task 5: Header, Footer, language switcher

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Create: `src/components/LanguageSwitcher.astro`

**Interfaces:**
- Consumes: `t`, `getDictionary`, `LOCALES` (Task 1)
- Produces: `<LanguageSwitcher lang={lang} />` — self-contained, reads `Astro.url.pathname` and `Astro.url.search`, no props needed beyond current `lang` (used by both Header desktop nav and the mobile menu panel)

**Steps:**

- [x] **Step 1:** `LanguageSwitcher.astro` — because every locale has an identical route tree (Task 3), the switcher only needs to swap the first path segment and keep everything after it, plus preserve query string (important for `/antrag?situation=...&canton=...`):

```astro
---
import { LOCALES } from '../i18n/locales.js';
import { getDictionary, t } from '../i18n/index.js';
const { lang } = Astro.props;
const dict = getDictionary(lang);
const rest = Astro.url.pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
function hrefFor(target) {
  return `/${target}${rest === '/' ? '/' : rest}${Astro.url.search}`;
}
---
<nav aria-label={t(dict, 'langSwitcher.ariaLabel')} class="flex items-center gap-1 text-[13px] font-medium">
  {LOCALES.map((l, i) => (
    <>
      <a href={hrefFor(l)} class={l === lang ? 'text-teal font-bold' : 'text-dark hover:text-teal'} aria-current={l === lang ? 'true' : undefined}>{t(dict, `langSwitcher.${l}`)}</a>
      {i < LOCALES.length - 1 && <span class="text-[#D6DFE2]" aria-hidden="true">|</span>}
    </>
  ))}
</nav>
```

- [x] **Step 2:** `Header.astro` — add `lang` to `Props`, thread `t(dict, ...)` through every hardcoded nav string (`Prämienverbilligung`, `Kantone`, `So funktioniert es`, `FAQ`, `Kontakt`, `Antrag prüfen`, `Über uns` stays as-is unless added to dict, mobile menu labels, `aria-label="Menü öffnen"`). Rewrite every internal `href` through `localePath(lang, ...)`: `/` → `localePath(lang, '/')`, `/kontakt` → `localePath(lang, '/kontakt')`, `/${c.slug}` → `localePath(lang, `/${c.slug}`)`, and the `sectionHref`/`pruefenHref` home-anchor logic's `/#id` branch → `` `${localePath(lang,'/')}#${id}` ``. Insert `<LanguageSwitcher lang={lang} />` into the desktop nav (both the canton-landing and default nav branches) and into the mobile menu panel.
- [x] **Step 3:** `Footer.astro` — same treatment: `lang` prop, `t(dict, ...)` for all copy (tagline, disclaimer, column headings, link labels, copyright), `localePath(lang, ...)` for all internal hrefs including the dynamic canton list and the `homeAnchor` helper.
- [x] **Step 4: Verify** — on `/en/`, confirm nav reads in English, the canton mega-menu links go to `/en/<slug>`, clicking `ES` in the switcher from `/en/basel-stadt` lands on `/es/basel-stadt` (not the ES homepage), and from `/en/antrag?situation=umzug` lands on `/es/antrag?situation=umzug` (query preserved). This is QUALITY CHECKS items 4–8.
- [x] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/components/LanguageSwitcher.astro
git commit -m "feat(i18n): translate header/footer, add language switcher"
```

---

## Task 6: Section components (Hero, FAQ, HowItWorks, etc.)

**Files:**
- Modify: `src/components/Hero.astro`, `ProblemSection.astro`, `FinalCTA.astro`, `DeadlineSection.astro`, `FAQ.astro`, `HowItWorks.astro`, `WasIstSection.astro`, `SituationSelector.astro`, `SituationFinalCTA.astro`, `CantonDirectory.astro`, `WerWirSindSection.astro`, `InfoSection.astro`, `TrustBar.astro`

**Interfaces:**
- Consumes: `t`, `getDictionary` (Task 1); resolved content objects from Task 2's accessors, passed down as props from the `[lang]/*.astro` pages (Task 3) — these components should NOT import data files directly anymore where they currently do.

**Steps:**

- [x] **Step 1:** For components with hardcoded German **default prop values** (`ProblemSection.astro`, `FinalCTA.astro`, `DeadlineSection.astro`, `HowItWorks.astro` heading, `FAQ.astro` heading, `WasIstSection.astro` heading, `SituationSelector.astro` heading, `SituationFinalCTA.astro`): remove the hardcoded defaults, make the relevant props required, and have every call site (the `[lang]/*.astro` pages from Task 3) pass `t(dict, '...')` explicitly. This is the main mechanical pass — no new dict keys needed beyond what Task 1's `en.json`/`de.json`/`es.json` already define for these strings (add any missed ones to all three dictionary files at this point, keeping them in sync).
- [x] **Step 2:** `TrustBar.astro`, `InfoSection.astro`, `WerWirSindSection.astro` are already fully data/prop-driven (per the survey) — just confirm nothing inside them still imports `national.js` directly with the old export names; if it does, switch to receiving the resolved slice as a prop from the parent page.
- [x] **Step 3:** `WasIstSection.astro`'s hardcoded `/so-funktioniert-es` href → accept `lang` prop, use `localePath(lang, '/so-funktioniert-es')`. `SituationSelector.astro`'s `/antrag?situation=${s.slug}` href → `` `${localePath(lang,'/antrag')}?situation=${s.slug}` ``. `CantonDirectory.astro`'s `/${c.slug}` → `localePath(lang, `/${c.slug}`)`.
- [x] **Step 4: Verify** — `npm run build` should now succeed end-to-end (this is the first task where the full build is expected to pass, since Tasks 3–6 together close every remaining hardcoded-string/href gap the survey found in `.astro` components). Fix any Astro type/prop errors the build surfaces.
- [x] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat(i18n): translate section components, locale-prefix internal hrefs"
```

---

## Task 7: Legal pages (Impressum, Datenschutz) — translate with manual-review flags

**Files:**
- Modify: `src/pages/[lang]/impressum.astro`
- Modify: `src/pages/[lang]/datenschutz.astro`
- Modify: `src/components/PrivacyPolicyModal.jsx`

**Steps:**

- [x] **Step 1:** Translate the Impressum and Datenschutz prose into EN/ES, preserving every factual element unchanged (company name, FINMA wording, contact details, `mailto:office@evo-partners.ch`, `https://evo-partners.ch`, `https://www.finma.ch/de/` links stay as literal URLs regardless of locale — do not invent localized FINMA URLs). For any sentence that makes a specific legal/regulatory claim and where a confidently natural EN/ES phrasing isn't clear-cut, keep the German sentence verbatim inline and wrap it in an HTML comment `<!-- MANUAL REVIEW: legal phrase kept in German, verify translation before removing this comment --><span lang="de">...</span>` rather than guessing — per the spec's explicit instruction not to invent translations for ambiguous legal phrases. Track every such instance; they go in the final report to the user (deliverable, not a plan step).
- [x] **Step 2:** `PrivacyPolicyModal.jsx` duplicates part of the Datenschutz text — add a `lang` prop (passed from wherever it's mounted, likely via `Base.astro` → `AntragFunnel`/global chrome) and mirror the same translated content, same manual-review-flag treatment for any ambiguous sentence. The "Vollständige Datenschutzerklärung öffnen →" link → `localePath(lang, '/datenschutz')`.
- [x] **Step 3: Verify** — visit `/en/impressum`, `/es/impressum`, `/en/datenschutz`, `/es/datenschutz`, confirm the `mailto:`/`finma.ch`/`evo-partners.ch` links are byte-identical to the German page (only surrounding prose translated).
- [x] **Step 4: Commit**

```bash
git add src/pages/[lang]/impressum.astro src/pages/[lang]/datenschutz.astro src/components/PrivacyPolicyModal.jsx
git commit -m "feat(i18n): translate legal pages, flag ambiguous phrases for manual review"
```

---

## Task 8: Funnel components — `AntragFunnel.jsx`, `SituationFunnel.jsx`, `DankeSummary.jsx`, `danke.astro`, widgets/modals

**Files:**
- Modify: `src/components/AntragFunnel.jsx`
- Modify: `src/components/SituationFunnel.jsx`
- Modify: `src/components/Funnel.jsx`
- Modify: `src/components/DankeSummary.jsx`
- Modify: `src/pages/danke.astro`
- Modify: `src/components/StickyFunnelWidget.jsx`
- Modify: `src/components/ExitIntentPopup.jsx`
- Modify: `src/components/DisclaimerModal.jsx`

**Interfaces:**
- Consumes: `getDictionary(lang)` — resolved on the Astro page and passed in as a plain-object prop (`dict={getDictionary(lang)}`) to each React island, since these are `client:load`/`client:idle` components and can't import the Astro-side loader logic; `t(dict, key, vars)` is a plain JS function, safe to import directly into `.jsx` files (`src/i18n/index.js` has no Astro-specific code).
- Produces: nothing new consumed elsewhere, but **critical**: `AntragFunnel.jsx`'s redirect changes from `window.location.href = '/danke'` to something that (a) still lands on the unprefixed `/danke` URL (Task 1 decision) and (b) lets `/danke` know which language to render in.

**Steps:**

- [x] **Step 1:** Every page that mounts a React funnel/widget island (`[lang]/index.astro`, `[lang]/antrag.astro`, `[lang]/basel-stadt.astro`, `[lang]/basel-landschaft.astro`, `[lang]/[canton].astro`, and wherever `StickyFunnelWidget`/`ExitIntentPopup`/`DisclaimerModal` mount via `Base.astro`) now passes `lang={lang}` and `dict={getDictionary(lang)}` as props.
- [x] **Step 2:** In `AntragFunnel.jsx`, replace all ~40 hardcoded German literals (catalogued in full in the survey: stage labels, sidebar trust copy, all 6 step questions/placeholders/buttons, all 6 validation messages) with `t(dict, '...', vars)` calls against the new `form.*` dictionary keys from Task 1. Keep the step machine, query-param handling (`canton`, `situation`, UTM passthrough), and `POST /api/submit` payload shape completely unchanged — only string sourcing changes.
- [x] **Step 3:** Where `AntragFunnel.jsx` currently does `window.location.href = '/antrag?...'`-style internal navigation (self-referential, e.g. re-entering the funnel), prefix with `` `/${lang}/antrag?...` `` via `localePath`. Where `SituationFunnel.jsx` builds `` `/antrag?${params}` `` (and its `window.startFunnel` global used by `SituationFinalCTA.astro`), same change: `` `${localePath(lang, '/antrag')}?${params}` ``.
- [x] **Step 4:** The `/danke` redirect itself: **stays exactly `/danke`, unprefixed** (Task 1 decision — do not change this line's destination). Immediately before that redirect, alongside the existing `sessionStorage.setItem('antragSummary', ...)` call, add `sessionStorage.setItem('antragLang', lang)`.
- [x] **Step 5:** `danke.astro` — this page has no `[lang]` param (it's outside the route tree, per Task 1). It can't know the language at build/request time, so resolve it client-side: `DankeSummary.jsx` (already a `client:load` island reading `sessionStorage.antragSummary`) also reads `sessionStorage.antragLang`, falls back to `localStorage`'s saved language preference (Task 9's storage key) if absent, falls back to `'de'` if neither exists (e.g., a bookmarked/direct `/danke` visit), and renders `getDictionary(that lang)` content — `t(dict,'thankYou.titleWithName', {firstName})` etc. `danke.astro` itself stays mostly as-is (still `chrome={false}`, still `robots="noindex, nofollow"`, still a single canonical `https://praemienhilfe.ch/danke` — no hreflang block, matches Task 1's removal of `danke` from `pageUrls.js`); only its `<html lang>` is unknowable server-side, so leave it as a neutral default (`de-CH`) or drop the attribute — cosmetic, not SEO-relevant on a noindexed page.
- [x] **Step 6:** `StickyFunnelWidget.jsx`, `ExitIntentPopup.jsx`, `DisclaimerModal.jsx` — same `dict`/`lang` prop pattern, swap their hardcoded strings for `t(dict, 'widgets....')`. `StickyFunnelWidget`'s href logic (`#funnel` / `#pruefen` / `/antrag`) → the `/antrag` branch becomes `localePath(lang, '/antrag')`; anchors stay unprefixed.
- [x] **Step 7: Verify** — full funnel walkthrough on `/en/antrag`: fill every step in English, confirm validation messages appear in English, submit successfully (HubSpot sandbox/test data — check `POST /api/submit` in Network tab returns 200), confirm redirect lands on `/danke` (not `/en/danke`), confirm `/danke` renders the English thank-you content, confirm `window.dataLayer` received the `antrag_conversion` event via the console (`read_console_messages` or manual `dataLayer` inspection). This is QUALITY CHECKS items 9–13, the highest-stakes checks in the whole task.
- [x] **Step 8: Commit**

```bash
git add src/components src/pages/danke.astro
git commit -m "feat(i18n): translate funnel/widgets, preserve /danke conversion URL across locales"
```

---

## Task 9: Root `/` — language detection and redirect

**Files:**
- Rewrite: `src/pages/index.astro` (now the root detector, replacing its old role as the German homepage — that content now lives at `src/pages/[lang]/index.astro` from Task 3)

**Steps:**

- [x] **Step 1:** Define the storage key once, as a comment-documented literal shared between this file and `LanguageSwitcher.astro`'s implicit behavior — the switcher doesn't need to write storage (it's a plain link), but this page's script and any future "remember my choice" affordance should use the same key. Use `praemienhilfe_lang` as the `localStorage` key.
- [x] **Step 2:** Content:

```astro
---
export const prerender = true;
---
<!doctype html>
<html lang="de-CH">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="https://praemienhilfe.ch/de/" />
    <title>prämienhilfe.ch</title>
    <script is:inline>
      (function () {
        var SUPPORTED = ['de', 'en', 'es'];
        try {
          var stored = localStorage.getItem('praemienhilfe_lang');
          var lang = SUPPORTED.includes(stored) ? stored : null;
          if (!lang) {
            var nav = ((navigator.language || 'de').slice(0, 2)).toLowerCase();
            lang = SUPPORTED.includes(nav) ? nav : 'de';
          }
          location.replace('/' + lang + '/' + location.search + location.hash);
        } catch (e) {
          location.replace('/de/');
        }
      })();
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=/de/" /></noscript>
  </head>
  <body></body>
</html>
```

- [x] **Step 3:** `LanguageSwitcher.astro` (Task 5) additionally writes `localStorage.setItem('praemienhilfe_lang', lang)` on click, so a manual pick sticks on the next root visit — add a tiny inline `onclick` handler or a `<script>` block scoped to the switcher's links (`document.querySelectorAll('[data-lang-link]').forEach(a => a.addEventListener('click', () => localStorage.setItem('praemienhilfe_lang', a.dataset.langLink)))`; add the `data-lang-link={l}` attribute to each switcher `<a>`).
- [x] **Step 4: Verify** — clear localStorage, set browser language to `es-ES` in devtools, visit `/`, confirm landing on `/es/` with no visible flash (inspect: is the redirect synchronous before first paint — Network tab should show the `/` request immediately followed by `/es/`, no intermediate rendered frame). Visit `/de/` directly with browser language `es` — confirm it stays on `/de/`, does NOT redirect (manual-URL rule). Click `EN` in the switcher, reload root `/` — confirm it now lands on `/en/` (stored preference overrides browser language). This is QUALITY CHECKS items 4, 5, 6, 18, 19.
- [x] **Step 5: Commit**

```bash
git add src/pages/index.astro src/components/LanguageSwitcher.astro
git commit -m "feat(i18n): root-domain language detection and redirect"
```

---

## Task 10: SEO — sitemap, old-URL 301 redirects

**Files:**
- Modify: `src/pages/sitemap.xml.ts`
- Modify: `netlify.toml`

**Steps:**

- [x] **Step 1:** `sitemap.xml.ts` — extend `TRANSLATED_KEYS` to include `'impressum'`, `'datenschutz'` (now real per-locale pages, Task 3/7). Remove the current ad-hoc `germanOnlyCantonUrls`/`genericCantonUrls` logic (which emitted single unprefixed `/de/${slug}` entries even for cantons with no en/es content) and replace with: for every canton in `deutschschweizCantons` not already covered by `basel-stadt`/`basel-landschaft`, emit all three locale URLs with full hreflang alternates (they're now real pages per Task 3/6's generic-canton translation). Do not list `/danke` (noindexed, unchanged) or root `/` (noindexed detector, unchanged).
- [x] **Step 2:** `netlify.toml` — add 301 redirects from every old unprefixed content URL to its `/de/...` equivalent. Static list (mirrors current `src/pages/*.astro` before Task 3's move) plus one dynamic canton rule:

```toml
[[redirects]]
  from = "/basel-stadt"
  to = "/de/basel-stadt"
  status = 301

[[redirects]]
  from = "/basel-landschaft"
  to = "/de/basel-landschaft"
  status = 301

[[redirects]]
  from = "/faq"
  to = "/de/faq"
  status = 301

[[redirects]]
  from = "/kontakt"
  to = "/de/kontakt"
  status = 301

[[redirects]]
  from = "/so-funktioniert-es"
  to = "/de/so-funktioniert-es"
  status = 301

[[redirects]]
  from = "/antrag"
  to = "/de/antrag"
  status = 301

[[redirects]]
  from = "/impressum"
  to = "/de/impressum"
  status = 301

[[redirects]]
  from = "/datenschutz"
  to = "/de/datenschutz"
  status = 301

[[redirects]]
  from = "/:canton"
  to = "/de/:canton"
  status = 301
```

Order matters in `netlify.toml`: the explicit named redirects must come **before** the catch-all `/:canton` rule, or Netlify will match `/faq` against `/:canton` first and redirect it to `/de/faq` anyway (harmless here since it's the same destination) — but list them in this order regardless, for clarity and to avoid the catch-all swallowing `/danke` or `/sitemap.xml` (Netlify redirect matching is first-match-wins in file order; since `danke` and `sitemap.xml` aren't in the explicit list, the `/:canton` catch-all WOULD wrongly rewrite them to `/de/danke` and `/de/sitemap.xml`). Add explicit **exclusions** before the catch-all instead of relying on ordering alone:

```toml
[[redirects]]
  from = "/danke"
  to = "/danke"
  status = 200

[[redirects]]
  from = "/sitemap.xml"
  to = "/sitemap.xml"
  status = 200
```
(placed immediately before the `/:canton` catch-all so they short-circuit it.)

- [x] **Step 3: Verify** — `netlify build` locally or `netlify dev` if available (else defer to Netlify's deploy preview) to confirm `/basel-stadt` → 301 → `/de/basel-stadt`, `/danke` stays a 200 (not rewritten), `/aargau` (or whichever canton) → 301 → `/de/aargau`. Fetch `/sitemap.xml` and confirm every URL in it 200s (spot-check a handful across all 3 locales) and none of them 404. This is QUALITY CHECKS item 17 plus the redirect requirement from the user's own decision.
- [x] **Step 4: Commit**

```bash
git add src/pages/sitemap.xml.ts netlify.toml
git commit -m "feat(seo): extend sitemap to full de/en/es tree, 301-redirect legacy unprefixed URLs"
```

---

## Task 11: Full QUALITY CHECKS pass and manual-review report

**Files:** none (verification only)

- [x] **Step 1:** Run `npm run build` clean, `npm run preview`, and manually walk every item in the spec's QUALITY CHECKS list (1–20) against the preview build, in a browser — not just skimming code. Use Chrome devtools/Network tab to confirm: the single `gtag/js` request (no duplicate), the `gtag('config', 'AW-18005574565', ...)` call still present in the initial dataLayer push, exactly one `antrag_conversion` `dataLayer.push` per full funnel completion (not per step), no `antrag_conversion` firing on page load or on individual step buttons.
- [x] **Step 2:** Compile the final list of "manual review" legal phrases flagged in Task 7 (grep `MANUAL REVIEW` across `src/`) into the end-of-task report handed back to the user — this is a deliverable, not a code change.
- [x] **Step 3: Commit** (only if Step 1 surfaced fixes)

---

## Post-plan deliverables (for the final report to the user, not plan steps)

- Files changed (full diff summary)
- Routing structure (`/[lang]/...` tree, `/danke` exception, root detector)
- Translation architecture (`src/i18n/dictionaries/*.json` for UI chrome, locale-nested `src/data/*.js` for long-form content)
- How browser-language detection works (Task 9)
- How manual language preference is stored (`localStorage['praemienhilfe_lang']`)
- Confirmation `AW-18005574565` untouched (Base.astro diff should show zero changes to the gtag script block)
- Confirmation form/conversion tracking preserved (`/danke` URL unchanged, `antrag_conversion` event unchanged)
- Full list of `MANUAL REVIEW` flagged legal phrases (Task 7/11)
- Exact test/build/deploy commands (`npm run dev`, `npm run build`, `npm run preview`, Netlify deploy flow)
