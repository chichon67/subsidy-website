# Multilingual (DE/EN/ES) Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add German/English/Spanish routing and translation to praemienhilfe.ch's core funnel pages, using Astro's native i18n routing, without regressing forms, Google Ads (`AW-18005574565`), GA4 events, or SEO.

**Architecture:** Astro `i18n` config with `prefixDefaultLocale: true` and DE fallback for untranslated routes. Pages move under `src/pages/[locale]/`. Two translation stores: `src/i18n/ui.js` (flat UI-string dictionary) and locale-keyed content modules (`national.js`, `cantons.js`, `situations.js`). A non-prerendered root `/` does a one-time server-side redirect based on cookie/Accept-Language.

**Tech Stack:** Astro 7 (`astro:i18n`), React 19 islands, Tailwind 4, Netlify adapter.

## Correction Notice (post-Task-1)

Task 1's implementer discovered that this plan's original routing approach — combining Astro's native `i18n` config with a manually-authored `src/pages/[locale]/...` dynamic-route folder — is wrong: Astro's `i18n` integration already synthesizes locale-prefixed routes itself, so a hand-rolled `[locale]` catch-all collides with it (confirmed by real `[WARN] ... conflicts with higher priority route` build output) and forces an undocumented `getStaticPaths()` on every nested page.

**Corrected convention, superseding every `src/pages/[locale]/<name>.astro` reference below:** Astro's i18n routing wants one real physical file per locale, under literal locale-named folders — `src/pages/de/<name>.astro`, `src/pages/en/<name>.astro`, `src/pages/es/<name>.astro` — no dynamic segment, no `getStaticPaths`. To avoid tripling every page's logic (and the drift risk of three hand-maintained copies), each page's actual content lives in exactly one canonical file under `src/page-templates/<Name>.astro` (a plain, non-route Astro component — `src/page-templates/` is not under `src/pages/`, so Astro never treats it as a route), written exactly as this plan's later tasks describe (they already read `Astro.currentLocale` dynamically rather than hardcoding a locale, so their content is unchanged). Each of the three route files is then a 2-line delegation:

```astro
---
import Page from '../../page-templates/Home.astro';
---
<Page />
```

Wherever a task below says "Create/Modify: `src/pages/[locale]/<name>.astro`", read it as: "Create/Modify the canonical `src/page-templates/<Name>.astro`, and create three thin delegators at `src/pages/de/<name>.astro`, `src/pages/en/<name>.astro`, `src/pages/es/<name>.astro` (identical 2-line content, differing only in which locale folder they sit in)." `Astro.currentLocale` continues to work exactly as every later task already assumes — Astro derives it from the physical locale folder the matched route lives in, same as it would have from the (incorrect) `[locale]` param.

Task 1 must be redone under this corrected convention before any later task proceeds.

## Global Constraints

- Work happens in `/Users/marco/Documents/repos/subsidy-website/.claude/worktrees/basel-stadt-fixes/praemienhilfe.ch` (all paths below are relative to this directory).
- Do not change design/CSS/layout/spacing/fonts — only add locale plumbing and swap text content.
- Do not duplicate or remove the `AW-18005574565` tag or the GA4 snippet in `src/layouts/Base.astro`.
- Do not rename existing GA4 custom event names (`antrag_form_submit`, `antrag_conversion`, `funnel_conversion`, `funnel_step_1_complete`, `antrag_step_*`, `header_canton_menu_selected`, `canton_directory_selected`, `antrag_situation_selected`).
- Do not change HubSpot contact property names or `/api/submit.js` payload shape.
- `/danke` keeps the slug `danke` in every locale (`/de/danke`, `/en/danke`, `/es/danke`) — do not localize this slug.
- Canton pages other than `basel-stadt` and `basel-landschaft` stay German-only; do not create EN/ES content for them in this plan.
- After every task: run `npm run build` from `praemienhilfe.ch/` and confirm it exits 0 with no new warnings before committing.
- Terminology (from `main-instructions.md`): EN uses "health insurance premium reduction" / "premium subsidy" / "check eligibility" / "subsidy application"; ES uses "reducción de primas del seguro médico" / "subsidio para el seguro médico" / "comprobar si tiene derecho" / "solicitud de reducción de primas". Do not make legal/financial claims stronger than the German source.

---

### Task 1 (REDO): Astro i18n routing config + locale-folder page templates

**This replaces Task 1 as originally attempted.** A prior attempt used a manual `src/pages/[locale]/` dynamic-route folder combined with Astro's native `i18n` config — these conflict (confirmed by real build warnings: `[WARN] ... conflicts with higher priority route`) because Astro's `i18n` integration already synthesizes locale-prefixed routes from literal locale-named folders; a hand-rolled `[locale]` catch-all fights it. First, undo the prior attempt; then implement the corrected structure described in this plan's "Correction Notice" section (read that section first — it defines the `src/page-templates/` + thin-per-locale-route-file convention every later task relies on).

**Files:**
- Modify: `astro.config.mjs`
- Delete: `src/pages/[locale]/` (the entire folder from the prior attempt, all 9 files plus any `getStaticPaths` additions)
- Create: `src/page-templates/Home.astro`, `BaselStadt.astro`, `BaselLandschaft.astro`, `Faq.astro`, `SoFunktioniertEs.astro`, `Kontakt.astro`, `Antrag.astro`, `Danke.astro`, `Canton.astro` — each containing exactly the original page content (byte-for-byte, before any prior-attempt modification) that used to live at `src/pages/<name>.astro` before Task 1 was first attempted
- Create: `src/pages/de/index.astro`, `src/pages/en/index.astro`, `src/pages/es/index.astro` (each a 2-line delegator to `Home.astro`)
- Create: the same 3-per-page delegator pattern for `basel-stadt.astro`, `basel-landschaft.astro`, `faq.astro`, `so-funktioniert-es.astro`, `kontakt.astro`, `antrag.astro`, `danke.astro` (21 more delegator files, 3 per page × 7 pages)
- Create: `src/pages/de/[canton].astro`, `src/pages/en/[canton].astro`, `src/pages/es/[canton].astro` (delegators to `Canton.astro`, each with their own `getStaticPaths()` for canton slugs only — see Step 4)
- Modify: `src/pages/index.astro` (replaced by Task 2's root redirect — this task deletes it if the prior attempt left anything there; Task 2 creates the real content)

**Interfaces:**
- Produces: every in-scope route resolves at `/de/...`, `/en/...`, `/es/...` via real per-locale files, no dynamic `[locale]` segment anywhere. `Astro.currentLocale` is available in every page template exactly as it would be with the (incorrect) `[locale]` approach — Astro derives it from which locale folder physically contains the matched route. Every later task's references to `src/pages/[locale]/<name>.astro` mean: edit `src/page-templates/<Name>.astro`.
- Consumes: nothing from other tasks yet — this task only restructures files, no content translation.

- [ ] **Step 1: Undo the prior attempt**

```bash
git log --oneline -3
```
Find the commit from the prior Task 1 attempt (commit message `feat: move core pages under [locale] i18n routing`, hash `f742909` unless subsequent commits have landed — confirm by checking `git log --oneline` before assuming this hash is still current). Revert it:

```bash
git revert --no-edit f742909
```
If `f742909` is no longer the tip and the revert conflicts, resolve by restoring the pre-Task-1 file layout (9 files directly under `src/pages/`, original `astro.config.mjs` without the `i18n` block) rather than trying to hand-merge — the goal is simply to get back to the state before Task 1 first ran.

Run: `npm run build` — expect this to succeed exactly as it did before Task 1 was ever attempted (confirms the revert is clean).

- [ ] **Step 2: Add i18n config to `astro.config.mjs`** (same as the original attempt — this part was correct)

```js
// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [react()],

  i18n: {
    locales: ['de', 'en', 'es'],
    defaultLocale: 'de',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
    fallback: {
      en: 'de',
      es: 'de',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify(),
});
```

- [ ] **Step 3: Move each in-scope page's content into `src/page-templates/`, byte-for-byte**

```bash
mkdir -p src/page-templates
git mv src/pages/index.astro src/page-templates/Home.astro
git mv src/pages/basel-stadt.astro src/page-templates/BaselStadt.astro
git mv src/pages/basel-landschaft.astro src/page-templates/BaselLandschaft.astro
git mv src/pages/faq.astro src/page-templates/Faq.astro
git mv src/pages/so-funktioniert-es.astro src/page-templates/SoFunktioniertEs.astro
git mv src/pages/kontakt.astro src/page-templates/Kontakt.astro
git mv src/pages/antrag.astro src/page-templates/Antrag.astro
git mv src/pages/danke.astro src/page-templates/Danke.astro
git mv "src/pages/[canton].astro" src/page-templates/Canton.astro
```

Each moved file's relative imports (`../layouts/...`, `../components/...`, `../data/...`) need exactly one fewer `../` than they would under the old `src/pages/[locale]/` approach, but exactly the same count as their original `src/pages/<name>.astro` location (`src/page-templates/` and `src/pages/` sit at the same depth) — so, unlike the reverted attempt, **no import-path rewriting is needed at all** in this step. Verify with `grep -n "^import" src/page-templates/*.astro` that every import still starts with `../` (one level up), not `../../`.

- [ ] **Step 4: Create the thin per-locale delegator files**

For each of the 7 static pages (`Home`, `BaselStadt`, `BaselLandschaft`, `Faq`, `SoFunktioniertEs`, `Kontakt`, `Antrag`, `Danke` — 8 total, `Home` maps to `index.astro`), create 3 files, one per locale folder. Example for `Home.astro` → `index.astro`:

```astro
---
// src/pages/de/index.astro
import Page from '../../page-templates/Home.astro';
---
<Page />
```

Repeat identically (only the locale folder changes: `de`/`en`/`es`) for all 8 pages × 3 locales = 24 files:
`src/pages/{de,en,es}/index.astro` → `Home.astro`
`src/pages/{de,en,es}/basel-stadt.astro` → `BaselStadt.astro`
`src/pages/{de,en,es}/basel-landschaft.astro` → `BaselLandschaft.astro`
`src/pages/{de,en,es}/faq.astro` → `Faq.astro`
`src/pages/{de,en,es}/so-funktioniert-es.astro` → `SoFunktioniertEs.astro`
`src/pages/{de,en,es}/kontakt.astro` → `Kontakt.astro`
`src/pages/{de,en,es}/antrag.astro` → `Antrag.astro`
`src/pages/{de,en,es}/danke.astro` → `Danke.astro`

For the canton page, each locale's `[canton].astro` keeps its own `getStaticPaths()` (this dynamic segment is for the canton slug, not the locale — it doesn't conflict with anything, since there's exactly one physical file per locale and Astro already knows which locale folder it's in):

```astro
---
// src/pages/de/[canton].astro
import Page from '../../page-templates/Canton.astro';
import { deutschschweizCantons } from '../../data/deutschschweiz.js';

export function getStaticPaths() {
  return deutschschweizCantons
    .filter((c) => !c.active)
    .map((c) => ({ params: { canton: c.slug } }));
}
---
<Page />
```
(Repeat for `en`/`es` — identical content, only the locale folder differs. `Canton.astro`'s own internal logic, e.g. reading `Astro.params.canton`, is unchanged from the original `[canton].astro` file moved in Step 3.)

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: exits 0, **no** `[WARN] ... conflicts with higher priority route` lines anywhere in the output (grep the full log: `npm run build 2>&1 | grep -i "conflicts with"` should return nothing). Confirm the build's route listing includes `/de/`, `/en/`, `/es/` (bare, no `[locale]` anywhere), and every canton slug × 3 locales.

Run: `npm run dev`, then `curl -s http://localhost:4321/de/ -o /dev/null -w "%{http_code}\n"` and the same for `/en/`, `/es/`, `/de/basel-stadt`, `/en/uri` — all should return `200`. Stop the dev server after.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: restructure i18n routing as locale folders + page-templates (fixes route conflict)"
```

---

### Task 2: Root redirect + `pv_lang` cookie read

**Files:**
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks (this is a leaf route), but establishes the `pv_lang` cookie name (`'pv_lang'`) that Task 4's language switcher will also write.

- [ ] **Step 1: Write the root redirect route**

```astro
---
// src/pages/index.astro
// Bare root — not under [locale]. One-time server-side language detection
// and redirect. Never runs on /de/, /en/, /es/ directly, so it can't loop.
export const prerender = false;

const SUPPORTED = ['de', 'en', 'es'];

function localeFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)pv_lang=([a-z]{2})/);
  const value = match?.[1];
  return SUPPORTED.includes(value) ? value : null;
}

function localeFromAcceptLanguage(header) {
  if (!header) return 'de';
  const primary = header.split(',')[0]?.trim().slice(0, 2).toLowerCase();
  return SUPPORTED.includes(primary) ? primary : 'de';
}

const cookieHeader = Astro.request.headers.get('cookie');
const acceptLanguage = Astro.request.headers.get('accept-language');
const locale = localeFromCookie(cookieHeader) ?? localeFromAcceptLanguage(acceptLanguage);

return Astro.redirect(`/${locale}/`, 302);
---
```

- [ ] **Step 2: Verify build succeeds**

Run: `npm run build`
Expected: exits 0. Check the build log shows `/index.html` is NOT in the prerendered static routes list (it's on-demand now) — the `[locale]/index.html`, `[locale]/basel-stadt/index.html` etc. should appear instead, once per locale.

- [ ] **Step 3: Manual verification with dev server**

Run: `npm run dev` in one terminal, then in another:
```bash
curl -sI http://localhost:4321/ -H "Accept-Language: es-ES,es;q=0.9" | grep -i location
```
Expected: `location: /es/`
```bash
curl -sI http://localhost:4321/ -H "Cookie: pv_lang=en" -H "Accept-Language: de-CH" | grep -i location
```
Expected: `location: /en/` (cookie wins over header)
```bash
curl -sI http://localhost:4321/ -H "Accept-Language: fr-FR" | grep -i location
```
Expected: `location: /de/` (unsupported language falls back to German)

Stop the dev server after verifying.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add server-side language-detection redirect at root"
```

---

### Task 3: UI string dictionary + `useTranslations` helper

**Files:**
- Create: `src/i18n/ui.js`
- Create: `src/i18n/useTranslations.js`

**Interfaces:**
- Produces: `ui` object keyed `ui[locale][key]`; `useTranslations(locale)` returns a `t(key)` function that throws in dev if the key is missing in any of the three locales (catches drift early). Every later task that needs a UI string imports `useTranslations` and calls `t('some.key')`.
- Consumes: nothing.

- [ ] **Step 1: Write `src/i18n/ui.js`**

```js
// src/i18n/ui.js
// Flat UI-string dictionary: nav, buttons, form labels/placeholders,
// validation messages, footer labels, popup/disclaimer copy.
// Long structured page content (FAQ arrays, hero copy, canton info) lives
// in per-locale content modules instead — see src/data/national.js,
// src/data/cantons.js, src/data/situations.js.
export const ui = {
  de: {
    'nav.home': 'Prämienverbilligung',
    'nav.cantons': 'Kantone',
    'nav.cantons.subheading': 'Deutschschweiz',
    'nav.cantons.comingSoon': 'Demnächst',
    'nav.allCantons': 'Alle Kantone',
    'nav.howItWorks': 'So funktioniert es',
    'nav.faq': 'FAQ',
    'nav.contact': 'Kontakt',
    'nav.cta': 'Antrag prüfen',
    'nav.cta.checkClaim': 'Antrag prüfen →',
    'nav.menu.open': 'Menü öffnen',
    'nav.menu.close': 'Menü schliessen',
    'langSwitcher.label': 'Sprache',
    'footer.tagline': 'Hilfe bei der Prämienverbilligung in der Schweiz',
    'footer.independentNote': 'prämienhilfe.ch ist eine private Beratungsplattform, unabhängig von den kantonalen Behörden der Schweiz.',
    'footer.operatedBy': 'Betrieben von:',
    'footer.cantons': 'Kantone',
    'footer.info': 'Informationen',
    'footer.info.whatIs': 'Was ist Prämienverbilligung?',
    'footer.info.howItWorks': 'So funktioniert es',
    'footer.info.faq': 'FAQ',
    'footer.info.about': 'Über uns',
    'footer.info.contact': 'Kontakt',
    'footer.legal': 'Rechtliches',
    'footer.legal.impressum': 'Impressum',
    'footer.legal.privacy': 'Datenschutzbestimmungen',
    'footer.legal.terms': 'Nutzungsbedingungen',
    'footer.legal.legalNotices': 'Rechtliche Hinweise',
    'footer.copyright': (year) => `© ${year} prämienhilfe.ch — Ein Service von EVO Partners GmbH, Zürich. Alle Rechte vorbehalten. Diese Plattform ist kein offizielles Kantonsorgan.`,
    'stickyCta.title': 'Anspruch prüfen',
    'stickyCta.subtitle': 'Kostenlose Prüfung in 20 Min.',
    'stickyCta.button': 'Jetzt starten →',
    'mobileCta.button': 'Antrag prüfen lassen →',
    'form.email': 'E-Mail',
    'form.emailPlaceholder': 'name@beispiel.ch',
    'form.emailInvalid': 'Bitte eine gültige E-Mail-Adresse angeben.',
    'form.firstName': 'Vorname',
    'form.firstNameRequired': 'Bitte Vorname angeben.',
    'form.lastName': 'Nachname',
    'form.lastNameRequired': 'Bitte Nachname angeben.',
    'form.phoneRequired': 'Bitte Telefonnummer angeben.',
    'form.phoneInvalid': 'Bitte eine gültige Telefonnummer angeben.',
    'form.phonePlaceholder': '79 123 45 67',
    'form.consentRequired': 'Bitte akzeptieren Sie die Datenschutzbestimmungen.',
    'form.submitError': 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    'form.continue': 'Weiter →',
    'form.submit': 'Antrag einreichen →',
    'form.submitting': 'Wird gesendet…',
    'form.securedForm': 'Sicheres Formular',
    'form.step': (current, total) => `Schritt ${current} von ${total}`,
    'form.stage.identification': 'Identifikation',
    'form.stage.additional': 'Ergänzende Informationen',
    'form.stage.situation': 'Ihre Situation',
    'form.stage.done': 'Abgeschlossen',
    'form.cantonQuestion': 'In welchem Kanton wohnen Sie?',
    'form.cantonSelectLabel': 'Kanton wählen',
    'form.cantonSelectPlaceholder': 'Kanton auswählen…',
    'form.yourCanton': (canton) => `Ihr Kanton: ${canton}`,
    'form.situationQuestion': 'Was beschreibt Ihre Situation am besten?',
    'form.yourApplication': 'Ihr Antrag:',
    'form.changeSituationLabel': 'Situation ändern',
    'form.notSpecified': 'Nicht angegeben',
    'form.emailIntro': 'Zu Beginn benötigen wir Ihre E-Mail-Adresse',
    'form.privacyConsentPrefix': 'Mit dem Fortfahren akzeptieren Sie unsere',
    'form.privacyPolicyLink': 'Datenschutzrichtlinie',
    'form.privacyConsentSuffix': 'und die Verarbeitung Ihrer persönlichen Daten.',
    'form.householdQuestion': 'Wie viele Personen leben in Ihrem Haushalt?',
    'form.person': 'Person',
    'form.persons': 'Personen',
    'form.incomeQuestion': 'Wie hoch ist Ihr monatliches Haushaltseinkommen?',
    'form.income.under2000': "Unter CHF 2'000",
    'form.income.2000to4000': "CHF 2'000 – 4'000",
    'form.income.4000to6000': "CHF 4'000 – 6'000",
    'form.income.over6000': 'Über CHF 6\'000',
    'form.contactQuestion': 'Wie können wir Sie erreichen?',
    'form.consentPrefix': 'Ich akzeptiere die',
    'form.privacyTermsLink': 'Datenschutzbestimmungen',
    'form.consentSuffix': 'von EVO Partners GmbH und stimme der Verarbeitung meiner Daten zum Zweck der Beratung zu.',
    'exitPopup.title': 'Warten Sie — prüfen Sie zuerst Ihren Anspruch!',
    'exitPopup.body': "Viele Berechtigte wissen nicht, dass sie Anspruch auf bis zu CHF 3'000 pro Jahr haben. Die Prüfung dauert nur 20 Minuten.",
    'exitPopup.cta': 'Jetzt prüfen →',
    'exitPopup.decline': 'Nein danke, ich verzichte auf meine Verbilligung',
    'disclaimer.title': 'Wichtiger Hinweis',
    'disclaimer.body1': 'prämienhilfe.ch ist ein privater und unabhängiger Beratungsservice von EVO Partners GmbH — kein Kantonsamt und keine staatliche Behörde.',
    'disclaimer.body2': 'Unsere Hilfe bei der Prämienverbilligung ist für Sie kostenlos.',
    'disclaimer.cta': 'Verstanden — Weiter →',
    'danke.title': 'Vielen Dank | prämienhilfe.ch',
    'danke.description': 'Ihre Anfrage bei prämienhilfe.ch wurde erfolgreich übermittelt.',
    'danke.thanksNamed': (name) => `Vielen Dank, ${name}!`,
    'danke.thanksGeneric': 'Vielen Dank für Ihre Anfrage!',
    'danke.body': 'Ein Berater von uns meldet sich innerhalb von 24 Stunden bei Ihnen. Bei Fragen erreichen Sie uns unter',
    'danke.summary.situation': 'Situation:',
    'danke.summary.canton': 'Kanton:',
    'danke.summary.household': 'Haushalt:',
    'danke.summary.income': 'Einkommen:',
    'danke.summary.email': 'E-Mail:',
    'danke.confirmationNote': 'Sie erhalten in Kürze eine Bestätigung per E-Mail.',
    'danke.backHome': 'Zurück zur Startseite',
  },
  en: {
    'nav.home': 'Premium subsidy',
    'nav.cantons': 'Cantons',
    'nav.cantons.subheading': 'German-speaking Switzerland',
    'nav.cantons.comingSoon': 'Coming soon',
    'nav.allCantons': 'All cantons',
    'nav.howItWorks': 'How it works',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.cta': 'Check eligibility',
    'nav.cta.checkClaim': 'Check eligibility →',
    'nav.menu.open': 'Open menu',
    'nav.menu.close': 'Close menu',
    'langSwitcher.label': 'Language',
    'footer.tagline': 'Help with Swiss health insurance premium subsidies',
    'footer.independentNote': 'prämienhilfe.ch is a private advisory platform, independent of the Swiss cantonal authorities.',
    'footer.operatedBy': 'Operated by:',
    'footer.cantons': 'Cantons',
    'footer.info': 'Information',
    'footer.info.whatIs': 'What is the premium subsidy?',
    'footer.info.howItWorks': 'How it works',
    'footer.info.faq': 'FAQ',
    'footer.info.about': 'About us',
    'footer.info.contact': 'Contact',
    'footer.legal': 'Legal',
    'footer.legal.impressum': 'Legal notice',
    'footer.legal.privacy': 'Privacy policy',
    'footer.legal.terms': 'Terms of use',
    'footer.legal.legalNotices': 'Legal disclosures',
    'footer.copyright': (year) => `© ${year} prämienhilfe.ch — A service of EVO Partners GmbH, Zurich. All rights reserved. This platform is not an official cantonal body.`,
    'stickyCta.title': 'Check eligibility',
    'stickyCta.subtitle': 'Free check in 20 min.',
    'stickyCta.button': 'Start now →',
    'mobileCta.button': 'Check eligibility →',
    'form.email': 'Email',
    'form.emailPlaceholder': 'name@example.com',
    'form.emailInvalid': 'Please enter a valid email address.',
    'form.firstName': 'First name',
    'form.firstNameRequired': 'Please enter your first name.',
    'form.lastName': 'Last name',
    'form.lastNameRequired': 'Please enter your last name.',
    'form.phoneRequired': 'Please enter your phone number.',
    'form.phoneInvalid': 'Please enter a valid phone number.',
    'form.phonePlaceholder': '79 123 45 67',
    'form.consentRequired': 'Please accept the privacy policy.',
    'form.submitError': 'Something went wrong. Please try again.',
    'form.continue': 'Continue →',
    'form.submit': 'Submit application →',
    'form.submitting': 'Sending…',
    'form.securedForm': 'Secure form',
    'form.step': (current, total) => `Step ${current} of ${total}`,
    'form.stage.identification': 'Identification',
    'form.stage.additional': 'Additional information',
    'form.stage.situation': 'Your situation',
    'form.stage.done': 'Done',
    'form.cantonQuestion': 'Which canton do you live in?',
    'form.cantonSelectLabel': 'Select canton',
    'form.cantonSelectPlaceholder': 'Select a canton…',
    'form.yourCanton': (canton) => `Your canton: ${canton}`,
    'form.situationQuestion': 'Which best describes your situation?',
    'form.yourApplication': 'Your application:',
    'form.changeSituationLabel': 'Change situation',
    'form.notSpecified': 'Not specified',
    'form.emailIntro': "First, we'll need your email address",
    'form.privacyConsentPrefix': 'By continuing, you accept our',
    'form.privacyPolicyLink': 'privacy policy',
    'form.privacyConsentSuffix': 'and the processing of your personal data.',
    'form.householdQuestion': 'How many people live in your household?',
    'form.person': 'person',
    'form.persons': 'people',
    'form.incomeQuestion': 'What is your monthly household income?',
    'form.income.under2000': 'Under CHF 2,000',
    'form.income.2000to4000': 'CHF 2,000 – 4,000',
    'form.income.4000to6000': 'CHF 4,000 – 6,000',
    'form.income.over6000': 'Over CHF 6,000',
    'form.contactQuestion': 'How can we reach you?',
    'form.consentPrefix': 'I accept the',
    'form.privacyTermsLink': 'privacy policy',
    'form.consentSuffix': 'of EVO Partners GmbH and agree to the processing of my data for advisory purposes.',
    'exitPopup.title': 'Wait — check your eligibility first!',
    'exitPopup.body': 'Many eligible people don’t know they could receive up to CHF 3,000 per year. The check only takes 20 minutes.',
    'exitPopup.cta': 'Check now →',
    'exitPopup.decline': 'No thanks, I’ll skip my subsidy',
    'disclaimer.title': 'Important notice',
    'disclaimer.body1': 'prämienhilfe.ch is a private, independent advisory service run by EVO Partners GmbH — not a cantonal office or government authority.',
    'disclaimer.body2': 'Our help with the premium subsidy is free of charge for you.',
    'disclaimer.cta': 'Understood — Continue →',
    'danke.title': 'Thank you | prämienhilfe.ch',
    'danke.description': 'Your request to prämienhilfe.ch was submitted successfully.',
    'danke.thanksNamed': (name) => `Thank you, ${name}!`,
    'danke.thanksGeneric': 'Thank you for your request!',
    'danke.body': 'One of our advisors will contact you within 24 hours. If you have questions, reach us at',
    'danke.summary.situation': 'Situation:',
    'danke.summary.canton': 'Canton:',
    'danke.summary.household': 'Household:',
    'danke.summary.income': 'Income:',
    'danke.summary.email': 'Email:',
    'danke.confirmationNote': 'You will receive a confirmation by email shortly.',
    'danke.backHome': 'Back to homepage',
  },
  es: {
    'nav.home': 'Subsidio de primas',
    'nav.cantons': 'Cantones',
    'nav.cantons.subheading': 'Suiza alemana',
    'nav.cantons.comingSoon': 'Próximamente',
    'nav.allCantons': 'Todos los cantones',
    'nav.howItWorks': 'Cómo funciona',
    'nav.faq': 'Preguntas frecuentes',
    'nav.contact': 'Contacto',
    'nav.cta': 'Comprobar derecho',
    'nav.cta.checkClaim': 'Comprobar derecho →',
    'nav.menu.open': 'Abrir menú',
    'nav.menu.close': 'Cerrar menú',
    'langSwitcher.label': 'Idioma',
    'footer.tagline': 'Ayuda con la reducción de primas del seguro médico en Suiza',
    'footer.independentNote': 'prämienhilfe.ch es una plataforma de asesoría privada, independiente de las autoridades cantonales suizas.',
    'footer.operatedBy': 'Operado por:',
    'footer.cantons': 'Cantones',
    'footer.info': 'Información',
    'footer.info.whatIs': '¿Qué es la reducción de primas?',
    'footer.info.howItWorks': 'Cómo funciona',
    'footer.info.faq': 'Preguntas frecuentes',
    'footer.info.about': 'Sobre nosotros',
    'footer.info.contact': 'Contacto',
    'footer.legal': 'Aspectos legales',
    'footer.legal.impressum': 'Aviso legal',
    'footer.legal.privacy': 'Política de privacidad',
    'footer.legal.terms': 'Condiciones de uso',
    'footer.legal.legalNotices': 'Avisos legales',
    'footer.copyright': (year) => `© ${year} prämienhilfe.ch — Un servicio de EVO Partners GmbH, Zúrich. Todos los derechos reservados. Esta plataforma no es un organismo cantonal oficial.`,
    'stickyCta.title': 'Comprobar derecho',
    'stickyCta.subtitle': 'Comprobación gratuita en 20 min.',
    'stickyCta.button': 'Empezar ahora →',
    'mobileCta.button': 'Comprobar derecho →',
    'form.email': 'Correo electrónico',
    'form.emailPlaceholder': 'nombre@ejemplo.ch',
    'form.emailInvalid': 'Por favor, introduzca una dirección de correo electrónico válida.',
    'form.firstName': 'Nombre',
    'form.firstNameRequired': 'Por favor, indique su nombre.',
    'form.lastName': 'Apellido',
    'form.lastNameRequired': 'Por favor, indique su apellido.',
    'form.phoneRequired': 'Por favor, indique su número de teléfono.',
    'form.phoneInvalid': 'Por favor, introduzca un número de teléfono válido.',
    'form.phonePlaceholder': '79 123 45 67',
    'form.consentRequired': 'Por favor, acepte la política de privacidad.',
    'form.submitError': 'Algo salió mal. Por favor, inténtelo de nuevo.',
    'form.continue': 'Continuar →',
    'form.submit': 'Enviar solicitud →',
    'form.submitting': 'Enviando…',
    'form.securedForm': 'Formulario seguro',
    'form.step': (current, total) => `Paso ${current} de ${total}`,
    'form.stage.identification': 'Identificación',
    'form.stage.additional': 'Información adicional',
    'form.stage.situation': 'Su situación',
    'form.stage.done': 'Finalizado',
    'form.cantonQuestion': '¿En qué cantón vive?',
    'form.cantonSelectLabel': 'Seleccionar cantón',
    'form.cantonSelectPlaceholder': 'Seleccione un cantón…',
    'form.yourCanton': (canton) => `Su cantón: ${canton}`,
    'form.situationQuestion': '¿Qué describe mejor su situación?',
    'form.yourApplication': 'Su solicitud:',
    'form.changeSituationLabel': 'Cambiar situación',
    'form.notSpecified': 'No especificado',
    'form.emailIntro': 'Para empezar, necesitamos su dirección de correo electrónico',
    'form.privacyConsentPrefix': 'Al continuar, acepta nuestra',
    'form.privacyPolicyLink': 'política de privacidad',
    'form.privacyConsentSuffix': 'y el tratamiento de sus datos personales.',
    'form.householdQuestion': '¿Cuántas personas viven en su hogar?',
    'form.person': 'persona',
    'form.persons': 'personas',
    'form.incomeQuestion': '¿Cuál es el ingreso mensual de su hogar?',
    'form.income.under2000': 'Menos de CHF 2,000',
    'form.income.2000to4000': 'CHF 2,000 – 4,000',
    'form.income.4000to6000': 'CHF 4,000 – 6,000',
    'form.income.over6000': 'Más de CHF 6,000',
    'form.contactQuestion': '¿Cómo podemos contactarle?',
    'form.consentPrefix': 'Acepto la',
    'form.privacyTermsLink': 'política de privacidad',
    'form.consentSuffix': 'de EVO Partners GmbH y doy mi consentimiento para el tratamiento de mis datos con fines de asesoría.',
    'exitPopup.title': '¡Espere — compruebe primero su derecho!',
    'exitPopup.body': 'Muchas personas con derecho no saben que pueden recibir hasta CHF 3,000 al año. La comprobación solo dura 20 minutos.',
    'exitPopup.cta': 'Comprobar ahora →',
    'exitPopup.decline': 'No, gracias, renuncio a mi subsidio',
    'disclaimer.title': 'Aviso importante',
    'disclaimer.body1': 'prämienhilfe.ch es un servicio de asesoría privado e independiente de EVO Partners GmbH — no es una oficina cantonal ni una autoridad estatal.',
    'disclaimer.body2': 'Nuestra ayuda con la reducción de primas es gratuita para usted.',
    'disclaimer.cta': 'Entendido — Continuar →',
    'danke.title': 'Gracias | prämienhilfe.ch',
    'danke.description': 'Su solicitud a prämienhilfe.ch se envió correctamente.',
    'danke.thanksNamed': (name) => `¡Gracias, ${name}!`,
    'danke.thanksGeneric': '¡Gracias por su solicitud!',
    'danke.body': 'Uno de nuestros asesores se pondrá en contacto con usted en 24 horas. Si tiene preguntas, contáctenos al',
    'danke.summary.situation': 'Situación:',
    'danke.summary.canton': 'Cantón:',
    'danke.summary.household': 'Hogar:',
    'danke.summary.income': 'Ingreso:',
    'danke.summary.email': 'Correo electrónico:',
    'danke.confirmationNote': 'En breve recibirá una confirmación por correo electrónico.',
    'danke.backHome': 'Volver al inicio',
  },
};
```

- [ ] **Step 2: Write `src/i18n/useTranslations.js`**

```js
// src/i18n/useTranslations.js
import { ui } from './ui.js';

const LOCALES = Object.keys(ui);

export function useTranslations(locale) {
  const dict = ui[locale] ?? ui.de;
  return function t(key, ...args) {
    if (import.meta.env.DEV) {
      for (const l of LOCALES) {
        if (!(key in ui[l])) {
          throw new Error(`[i18n] missing key "${key}" in locale "${l}"`);
        }
      }
    }
    const value = dict[key];
    return typeof value === 'function' ? value(...args) : value;
  };
}
```

- [ ] **Step 3: Verify it loads without error**

Run: `npm run build`
Expected: exits 0 (this file isn't imported anywhere yet, so it can't break anything, but confirms no syntax errors).

- [ ] **Step 4: Commit**

```bash
git add src/i18n/ui.js src/i18n/useTranslations.js
git commit -m "feat: add i18n UI string dictionary and translation helper"
```

---

### Task 4: `Base.astro` locale wiring + hreflang/canonical + language switcher in Header/Footer

**Files:**
- Modify: `src/layouts/Base.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Create: `src/i18n/pageUrls.js`

**Interfaces:**
- Consumes: `useTranslations` from Task 3 (`src/i18n/useTranslations.js`), `ui` keys defined in Task 3.
- Produces: `Base.astro` now takes a `locale` prop (`'de' | 'en' | 'es'`) and a `translationKey` prop (a stable per-page identifier, e.g. `'home'`, `'basel-stadt'`, `'faq'` — used to look up sibling-locale URLs for hreflang). `getLocalizedUrls(translationKey, locale)` from `src/i18n/pageUrls.js` returns `{ de, en, es } | null` (null for German-only pages, which only get a `de` self-canonical + no alternates). Every later page-level task must pass `locale` and `translationKey` into `<Base>`.

- [ ] **Step 1: Write `src/i18n/pageUrls.js`**

```js
// src/i18n/pageUrls.js
// Maps a stable per-page key to its path under each locale, for hreflang.
// German-only pages (not in this map) get no EN/ES hreflang alternates.
const BASE = 'https://praemienhilfe.ch';

const PATHS = {
  home: { de: '/de/', en: '/en/', es: '/es/' },
  'basel-stadt': { de: '/de/basel-stadt', en: '/en/basel-stadt', es: '/es/basel-stadt' },
  'basel-landschaft': { de: '/de/basel-landschaft', en: '/en/basel-landschaft', es: '/es/basel-landschaft' },
  faq: { de: '/de/faq', en: '/en/faq', es: '/es/faq' },
  'so-funktioniert-es': { de: '/de/so-funktioniert-es', en: '/en/so-funktioniert-es', es: '/es/so-funktioniert-es' },
  kontakt: { de: '/de/kontakt', en: '/en/kontakt', es: '/es/kontakt' },
  antrag: { de: '/de/antrag', en: '/en/antrag', es: '/es/antrag' },
  danke: { de: '/de/danke', en: '/en/danke', es: '/es/danke' },
};

export function getLocalizedUrls(translationKey) {
  const entry = PATHS[translationKey];
  if (!entry) return null;
  return {
    de: `${BASE}${entry.de}`,
    en: `${BASE}${entry.en}`,
    es: `${BASE}${entry.es}`,
  };
}

export function canonicalFor(translationKey, locale, fallbackPath) {
  const entry = PATHS[translationKey];
  if (entry) return `${BASE}${entry[locale]}`;
  return `${BASE}${fallbackPath}`;
}
```

- [ ] **Step 2: Update `Base.astro` to accept `locale`/`translationKey`, emit hreflang, and use `ui` for the mobile sticky CTA**

Modify the `Props` interface and script section of `src/layouts/Base.astro`:

```astro
---
// src/layouts/Base.astro
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import DisclaimerModal from '../components/DisclaimerModal.jsx';
import ExitIntentPopup from '../components/ExitIntentPopup.jsx';
import StickyFunnelWidget from '../components/StickyFunnelWidget.jsx';
import { getLocalizedUrls } from '../i18n/pageUrls.js';
import { useTranslations } from '../i18n/useTranslations.js';
import '../styles/global.css';

export interface Props {
  title: string;
  description: string;
  canonical: string;
  locale: 'de' | 'en' | 'es';
  translationKey?: string;
  activePage?: 'home' | 'basel-stadt' | 'basel-landschaft' | 'ablauf' | 'faq' | 'kontakt';
  chrome?: boolean;
  schema?: Record<string, unknown>[];
  robots?: string;
}

const {
  title,
  description,
  canonical,
  locale,
  translationKey,
  activePage = 'home',
  chrome = true,
  schema = [],
  robots = 'index, follow',
} = Astro.props;
const t = useTranslations(locale);
const ga4Id = import.meta.env.PUBLIC_GA4_ID || 'G-XXXXXXXX';
const adsId = 'AW-18005574565';
const mobileCtaHref =
  activePage === 'basel-stadt' ? '#funnel' : activePage === 'basel-landschaft' || activePage === 'home' ? '#pruefen' : '/#pruefen';
const altUrls = translationKey ? getLocalizedUrls(translationKey) : null;
const ogLocale = { de: 'de_CH', en: 'en_US', es: 'es_ES' }[locale];
---

<!doctype html>
<html lang={`${locale}-CH`}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="robots" content={robots} />
    <link rel="canonical" href={canonical} />
    {altUrls && (
      <>
        <link rel="alternate" hreflang="de" href={altUrls.de} />
        <link rel="alternate" hreflang="en" href={altUrls.en} />
        <link rel="alternate" hreflang="es" href={altUrls.es} />
        <link rel="alternate" hreflang="x-default" href={altUrls.de} />
      </>
    )}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:locale" content={ogLocale} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
    <script define:vars={{ ga4Id, adsId }}>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id);
      gtag('config', adsId);
    </script>

    {schema.map((block) => <script type="application/ld+json" set:html={JSON.stringify(block)} />)}
  </head>
  <body>
    <div id="top"></div>
    {chrome && <Header activePage={activePage} locale={locale} />}
    {chrome ? (
      <div style="padding-top: var(--header-h, 76px)">
        <slot />
      </div>
    ) : (
      <slot />
    )}
    {chrome && <Footer activePage={activePage} locale={locale} />}

    {
      chrome && (
        <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 border-t border-[#E2E8EA]">
          <a
            href={mobileCtaHref}
            class="block text-center px-5 py-3.5 bg-teal text-white rounded-md text-base font-bold no-underline"
          >
            {t('mobileCta.button')}
          </a>
        </div>
      )
    }

    {chrome && <DisclaimerModal client:load locale={locale} />}
    {chrome && <ExitIntentPopup client:load locale={locale} />}
    {chrome && <StickyFunnelWidget client:idle activePage={activePage} locale={locale} />}

    <script>
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (this: Element, e) {
          const href = this.getAttribute('href');
          if (!href || href === '#') return;
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    </script>
  </body>
</html>
```

Note: the previous inline `gtag('config', ga4Id)`-only setup already existed; this step adds the Ads tag config call (`AW-18005574565`) alongside it in the same snippet, and both fire from a single shared `<script>` tag — Task 5's site-wide production commit history shows this was previously done directly in `Base.astro`; verify with `grep -n "AW-18005574565" src/layouts/Base.astro` before writing this step's diff, and if the Ads config call already exists in the file, keep the existing line instead of duplicating it.

- [ ] **Step 3: Add the language switcher and translated labels to `Header.astro`**

In `src/components/Header.astro`, add a `locale` prop, use `useTranslations`, and replace hardcoded nav text with `t(...)` calls. Add this switcher markup immediately after the "Antrag prüfen" link in the desktop `<nav>` (non-canton-landing branch), and a matching block in the mobile menu panel:

```astro
<div class="flex items-center gap-2.5 text-[13px] font-semibold text-[#8A979C] ml-1">
  {['de', 'en', 'es'].map((l) => (
    <a
      href={`/${l}/`}
      data-lang-switch={l}
      class={l === locale ? 'text-teal underline underline-offset-2' : 'hover:text-teal'}
      aria-current={l === locale ? 'true' : undefined}
    >
      {l.toUpperCase()}
    </a>
  ))}
</div>
```

Add this script at the bottom of `Header.astro` (inside the existing `<script>` block's `initHeader` function, or as a new small script) to make switcher links preserve the equivalent page and set the cookie:

```js
document.querySelectorAll('[data-lang-switch]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = link.getAttribute('data-lang-switch');
    document.cookie = `pv_lang=${target}; path=/; max-age=31536000; SameSite=Lax`;
    const current = window.location.pathname;
    const rest = current.replace(/^\/(de|en|es)(\/|$)/, '/');
    const candidate = `/${target}${rest === '/' ? '/' : rest}`;
    e.preventDefault();
    // Fall back to that locale's homepage if the equivalent path 404s under
    // Astro's DE-fallback (fallback only covers whole-route rewrites for
    // canton pages already known to Astro's routing table, not arbitrary
    // guesses) — a HEAD check keeps this simple and correct either way.
    fetch(candidate, { method: 'HEAD' })
      .then((res) => {
        window.location.href = res.ok ? candidate : `/${target}/`;
      })
      .catch(() => {
        window.location.href = `/${target}/`;
      });
  });
});
```

Replace these hardcoded strings in `Header.astro` with `t(...)` calls (add `const t = useTranslations(locale);` and `import { useTranslations } from '../i18n/useTranslations.js';` to the frontmatter, and add `locale: 'de' | 'en' | 'es';` to `Props`):
- `"Kantone"` → `t('nav.cantons')`
- `"Deutschschweiz"` (mega-menu heading) → `t('nav.cantons.subheading')`
- `"Demnächst"` → `t('nav.cantons.comingSoon')`
- `"Prämienverbilligung"` (home nav link) → `t('nav.home')`
- `"So funktioniert es"` → `t('nav.howItWorks')`
- `"FAQ"` → `t('nav.faq')`
- `"Kontakt"` → `t('nav.contact')`
- `"Antrag prüfen"` / `"Antrag prüfen lassen →"` / `"Antrag prüfen →"` → `t('nav.cta')` / `t('nav.cta.checkClaim')` as appropriate
- `"Menü öffnen"` / `"Menü schliessen"` (`aria-label`s) → `t('nav.menu.open')` / `t('nav.menu.close')`
- `"Alle Kantone"` (mobile menu) → `t('nav.allCantons')`

Canton names (`deutschschweizCantons[].name`) are proper nouns — leave untranslated in all three locales.

- [ ] **Step 4: Translate `Footer.astro` labels and add the switcher there too**

Add the same `locale` prop / `useTranslations` wiring. Replace:
- `"Kantone"` → `t('footer.cantons')`
- `"Informationen"` → `t('footer.info')`
- `"Was ist Prämienverbilligung?"` → `t('footer.info.whatIs')`
- `"So funktioniert es"` → `t('footer.info.howItWorks')`
- `"FAQ"` → `t('footer.info.faq')`
- `"Über uns"` → `t('footer.info.about')`
- `"Kontakt"` → `t('footer.info.contact')`
- `"Rechtliches"` → `t('footer.legal')`
- `"Impressum"` → `t('footer.legal.impressum')`
- `"Datenschutzbestimmungen"` → `t('footer.legal.privacy')`
- `"Nutzungsbedingungen"` → `t('footer.legal.terms')`
- `"Rechtliche Hinweise"` → `t('footer.legal.legalNotices')`
- `"Hilfe bei der Prämienverbilligung in der Schweiz"` → `t('footer.tagline')`
- `"prämienhilfe.ch ist eine private Beratungsplattform, unabhängig von den kantonalen Behörden der Schweiz."` → `t('footer.independentNote')`
- `"Betrieben von:"` → `t('footer.operatedBy')`
- The `© {year} ...` line → `t('footer.copyright', year)`

Note all internal anchor/page hrefs (`/basel-stadt`, `/#was-ist`, `/impressum`, etc.) must be prefixed with `/${locale}` — e.g. `href={`/${locale}/basel-stadt`}`, `href={isHome ? `#${id}` : `/${locale}/#${id}`}`. `/impressum` and `/datenschutz` are out of scope for translation (main-instructions.md's own legal-content caution applies) and stay bare (German-only, unprefixed) — link to them as `/impressum` and `/datenschutz` unchanged.

Add a small switcher (same markup as Step 3, reusing `t('langSwitcher.label')` as a visually-hidden label for accessibility: `<span class="sr-only">{t('langSwitcher.label')}</span>`) in the bottom bar next to the copyright line.

- [ ] **Step 5: Run build and commit**

Run: `npm run build`
Expected: fails — pages calling `<Base>` don't pass `locale`/`translationKey` yet, and `Header`/`Footer` now require `locale`. This is expected; confirm the failure is a missing-prop/type error in `[locale]/*.astro`, not a syntax error in the files touched this task.

```bash
git add src/layouts/Base.astro src/components/Header.astro src/components/Footer.astro src/i18n/pageUrls.js
git commit -m "feat: wire locale prop, hreflang, and language switcher through Base/Header/Footer"
```

---

### Task 5: Restructure `national.js` to per-locale content, translate home-page components

**Files:**
- Modify: `src/data/national.js`
- Modify: `src/components/Hero.astro`
- Modify: `src/components/WasIstSection.astro`
- Modify: `src/components/HowItWorks.astro`
- Modify: `src/components/ProblemSection.astro`
- Modify: `src/components/WerWirSindSection.astro`
- Modify: `src/components/FAQ.astro`
- Modify: `src/components/DeadlineSection.astro`
- Modify: `src/components/FinalCTA.astro`
- Modify: `src/components/TrustBar.astro`
- Modify: `src/components/CantonDirectory.astro`
- Modify: `src/pages/[locale]/index.astro`

**Interfaces:**
- Consumes: `useTranslations`/`ui` (Task 3), `locale`/`translationKey` `<Base>` props (Task 4).
- Produces: `national[locale]` object shape `{ heroCopy, nationalStats, wasIst, whySection, howItWorksSteps, werWirSind, nationalFaqs, deadlineSection }` — every canton/home component in this task takes a `locale` prop and reads through this shape. This shape is referenced again nowhere else (cantons.js in Task 6 is a separate, differently-shaped object).

- [ ] **Step 1: Restructure `src/data/national.js` into `{ de, en, es }`**

```js
// src/data/national.js
export const national = {
  de: {
    heroCopy: {
      title: 'Prämienverbilligung beantragen — in jedem Kanton',
      paragraph:
        'Die Prämienverbilligung (IPV) steht Tausenden von Schweizer Einwohnerinnen und Einwohnern zu — doch viele beantragen sie nie. Wir helfen Ihnen, Ihren Anspruch zu prüfen und Ihren Antrag korrekt einzureichen. Kostenlos und unverbindlich.',
      proof: "Über 1'000 Dossiers erfolgreich bearbeitet",
    },
    nationalStats: [
      { value: "1'000+", label: 'Dossiers pro Jahr' },
      { value: "CHF 500–3'000", label: 'Ersparnis/Jahr' },
      { value: '20 Minuten', label: 'Erstgespräch' },
      { value: 'FINMA', label: 'Registriert' },
    ],
    wasIst: {
      introBefore: 'Die ',
      introLinkText: 'individuelle Prämienverbilligung',
      introAfter:
        ' (IPV) ist eine staatliche Unterstützungsleistung für Personen und Haushalte in bescheidenen wirtschaftlichen Verhältnissen. Der Bund und die Kantone beteiligen sich gemeinsam an den Kosten der obligatorischen Krankenversicherung (KVG).',
      paragraphs: [
        'In der Schweiz haben über 2.4 Millionen Personen Anspruch auf Prämienverbilligung. Viele davon stellen jedoch keinen Antrag — aus Unwissenheit, wegen der administrativen Hürden oder weil sie nicht wissen, ob sie berechtigt sind.',
      ],
      bullets: [
        'Ihr steuerbares Einkommen und Vermögen',
        'Die Anzahl Personen in Ihrem Haushalt',
        'Der Kanton, in dem Sie wohnen',
        'Ihre aktuelle Krankenkassenprämie',
      ],
      boxTitle: 'Wussten Sie?',
      boxText: 'Über 2.4 Millionen Personen in der Schweiz haben Anspruch auf Prämienverbilligung — viele beantragen sie jedoch nie.',
      boxStat: 'CHF 1.5 Mrd.',
      boxStatLabel: 'werden jährlich als Prämienverbilligung ausbezahlt',
    },
    whySection: {
      heading: 'Warum verzichten viele Berechtigte auf ihre Prämienverbilligung?',
      intro: 'Über 2.4 Millionen Schweizerinnen und Schweizer haben Anspruch auf finanzielle Unterstützung bei den Krankenkassenprämien. Ein grosser Teil davon stellt jedoch nie einen Antrag. Die häufigsten Gründe:',
      reasons: [
        { title: 'Zu kompliziert', text: 'Jeder Kanton hat eigene Formulare, Fristen und Anforderungen. Das Verfahren wirkt auf den ersten Blick aufwendig.' },
        { title: 'Unsicher über den Anspruch', text: 'Viele Personen glauben, sie hätten keinen Anspruch, obwohl sie berechtigt wären. Die Einkommensgrenzen sind grosszügiger als oft angenommen.' },
        { title: 'Fristen verpasst', text: 'Die Anmeldefristen variieren je nach Kanton und werden oft übersehen. Ein verpasster Antrag bedeutet ein verlorenes Jahr Verbilligung.' },
        { title: 'Keine Zeit', text: 'Das Zusammenstellen der Unterlagen und das Ausfüllen der Formulare kostet Zeit, die viele nicht haben.' },
      ],
      closing: 'Genau hier setzen wir an. Wir kennen die Anforderungen jedes Kantons und begleiten Sie durch den gesamten Prozess.',
    },
    howItWorksSteps: [
      { n: '1', title: 'Kanton wählen und Situation angeben', text: 'Wählen Sie Ihren Wohnkanton und beschreiben Sie kurz Ihre persönliche Situation — ob Einzelperson, Familie, Student oder Rentner. Das dauert weniger als 2 Minuten.' },
      { n: '2', title: 'Kostenlose Prüfung durch unsere Experten', text: 'Wir analysieren Ihre Situation und prüfen, ob und in welcher Höhe Sie Anspruch auf Prämienverbilligung haben. Wir kennen die genauen Kriterien und Fristen jedes Kantons.' },
      { n: '3', title: 'Dossier zusammenstellen', text: 'Wir helfen Ihnen, alle notwendigen Unterlagen korrekt zusammenzustellen: Steuererklärung, Versicherungspolice, Lohnabrechnungen und weitere Dokumente je nach Kanton.' },
      { n: '4', title: 'Antrag einreichen', text: 'Den Antrag reichen wir gemeinsam mit Ihnen beim zuständigen Kantonsamt ein. Sie erhalten danach innerhalb weniger Wochen einen Entscheid vom Kanton.' },
    ],
    werWirSind: {
      heading: 'Wer steckt hinter prämienhilfe.ch?',
      paragraphs: [
        'prämienhilfe.ch ist ein Service von EVO Partners GmbH, einem unabhängigen, FINMA-registrierten Versicherungsbroker mit Sitz in der Schweiz.',
        'Wir sind keine staatliche Behörde und kein Kantonsamt. Wir sind ein privates Beratungsunternehmen, das sich auf die Schweizer Krankenversicherung spezialisiert hat.',
        'Unser Angebot umfasst:',
      ],
      bullets: [
        'Hilfe bei der Prämienverbilligung (IPV) — für alle Kantone',
        'Unabhängige Beratung zur Krankenversicherung (KVG und VVG)',
        'Optimierung Ihrer Versicherungssituation — gleiche Leistungen, tiefere Prämien',
      ],
      closing: 'Die Hilfe bei der Prämienverbilligung ist für Sie vollständig kostenlos. Als FINMA-registrierter Broker werden wir durch unsere Versicherungspartner vergütet, wenn wir eine Optimierung Ihrer Krankenversicherung empfehlen. Es besteht keinerlei Verpflichtung dazu.',
      trustItems: [
        'FINMA-registrierter Versicherungsbroker',
        "Über 1'000 Dossiers bearbeitet seit 2020",
        'Unabhängig von Kantonen und Versicherern',
        'Keinerlei Verpflichtung für den Klienten',
      ],
      rating: '4.8/5 Kundenbewertung',
    },
    nationalFaqs: [
      { q: 'Wer hat schweizweit Anspruch auf Prämienverbilligung?', a: 'Jede Person mit Wohnsitz in der Schweiz, deren steuerbares Einkommen und Vermögen unterhalb der kantonal festgelegten Grenze liegt. Die Grenzen variieren je nach Kanton und Haushaltsgrösse erheblich. Auch Personen, die glauben, zu viel zu verdienen, sollten ihren Anspruch prüfen lassen. Über 2.4 Millionen Personen sind schweizweit berechtigt.' },
      { q: 'Kann ich für mehrere Personen einen Antrag stellen?', a: 'Ja. Ein Antrag gilt pro Haushalt und kann alle versicherten Personen einschliessen — Partner, Kinder und weitere Haushaltsangehörige. Kinder und Jugendliche bis 25 Jahre in Erstausbildung haben häufig erhöhten Anspruch.' },
      { q: 'Muss ich jedes Jahr einen neuen Antrag stellen?', a: 'In den meisten Kantonen ja — die Prämienverbilligung wird jährlich neu beantragt. In einigen Kantonen erfolgt eine automatische Berechnung aufgrund der Steuerdaten. Wir informieren Sie über die genaue Regelung in Ihrem Kanton.' },
      { q: 'Was kostet mich dieser Service?', a: 'Die Hilfe bei der Prämienverbilligung ist für Sie vollständig kostenlos. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners GmbH) und werden nicht direkt von Ihnen vergütet.' },
      { q: 'Sind Sie ein offizielles Kantonsamt?', a: 'Nein. prämienhilfe.ch ist eine private, unabhängige Beratungsplattform. Wir sind kein staatliches Organ. Den Antrag können Sie auch direkt beim zuständigen Kantonsamt stellen. Wir erleichtern Ihnen diesen Prozess und prüfen gleichzeitig, ob Ihre Versicherungssituation optimiert werden kann.' },
      { q: 'Was passiert nach dem Erstgespräch?', a: 'Sie erhalten eine Zusammenfassung Ihrer Situation sowie klare Handlungsempfehlungen. Wenn Sie möchten, begleiten wir Sie bei der Zusammenstellung des Dossiers und der Einreichung beim Kantonsamt. Es besteht keinerlei Verpflichtung.' },
    ],
    deadlineSection: {
      heading: 'Verpassen Sie nicht Ihre Antragsfrist',
      warning: '⚠️ Die Anmeldefristen variieren je nach Kanton und werden oft nur einmal jährlich angeboten.',
      body: 'Jeder Kanton legt seine eigene Frist fest, und ein verpasster Antrag bedeutet meist ein verlorenes Jahr Verbilligung. Wir kennen die genauen Fristen für Ihren Wohnkanton und sagen Ihnen im kostenlosen Erstgespräch, bis wann Sie handeln sollten.',
      closing: 'Wer die Frist verpasst, verliert die Verbilligung für das laufende Jahr — das können mehrere hundert bis mehrere tausend Franken sein.',
    },
    howItWorksHeading: 'So funktioniert unsere Hilfe',
    finalCta: {
      heading: 'Jetzt Anspruch prüfen lassen',
      text: 'Wählen Sie Ihre Situation und prüfen Sie in 20 Minuten, ob Sie Anspruch auf Prämienverbilligung haben. Kostenlos und unverbindlich.',
      buttonLabel: 'Anspruch prüfen →',
      disclaimer: 'prämienhilfe.ch ist ein privater Beratungsservice von EVO Partners GmbH, FINMA-registrierter Versicherungsbroker. Kein offizielles Kantonsorgan.',
    },
  },
  en: {
    heroCopy: {
      title: 'Apply for your health insurance premium subsidy — in any canton',
      paragraph:
        'The individual premium subsidy is available to thousands of Swiss residents — yet many never apply for it. We help you check your eligibility and submit your application correctly. Free of charge and with no obligation.',
      proof: 'Over 1,000 applications successfully handled',
    },
    nationalStats: [
      { value: '1,000+', label: 'Applications per year' },
      { value: 'CHF 500–3,000', label: 'Savings per year' },
      { value: '20 minutes', label: 'Initial consultation' },
      { value: 'FINMA', label: 'Registered' },
    ],
    wasIst: {
      introBefore: 'The ',
      introLinkText: 'individual premium subsidy',
      introAfter:
        ' is a government support payment for people and households with modest financial means. The federal government and the cantons jointly cover part of the cost of mandatory health insurance.',
      paragraphs: [
        'Over 2.4 million people in Switzerland are eligible for the premium subsidy. Many of them never apply — out of not knowing about it, because of administrative hurdles, or because they don’t know whether they qualify.',
      ],
      bullets: [
        'Your taxable income and assets',
        'The number of people in your household',
        'The canton you live in',
        'Your current health insurance premium',
      ],
      boxTitle: 'Did you know?',
      boxText: 'Over 2.4 million people in Switzerland are eligible for the premium subsidy — yet many never apply for it.',
      boxStat: 'CHF 1.5 billion',
      boxStatLabel: 'is paid out as premium subsidies every year',
    },
    whySection: {
      heading: 'Why do so many eligible people never claim their premium subsidy?',
      intro: 'Over 2.4 million people in Switzerland are eligible for financial support with their health insurance premiums. Yet a large share of them never apply. The most common reasons:',
      reasons: [
        { title: 'Too complicated', text: 'Each canton has its own forms, deadlines, and requirements. The process looks daunting at first glance.' },
        { title: 'Unsure about eligibility', text: 'Many people believe they don’t qualify, even though they would. The income thresholds are more generous than often assumed.' },
        { title: 'Missed deadlines', text: 'Application deadlines vary by canton and are often overlooked. A missed application means a lost year of subsidy.' },
        { title: 'No time', text: 'Gathering the documents and filling out the forms takes time that many people don’t have.' },
      ],
      closing: 'This is exactly where we come in. We know the requirements of every canton and guide you through the entire process.',
    },
    howItWorksSteps: [
      { n: '1', title: 'Choose your canton and describe your situation', text: 'Select the canton you live in and briefly describe your personal situation — whether you’re single, a family, a student, or a retiree. It takes less than 2 minutes.' },
      { n: '2', title: 'Free assessment by our experts', text: 'We analyze your situation and check whether — and how much — you’re entitled to in premium subsidy. We know the exact criteria and deadlines for every canton.' },
      { n: '3', title: 'We put your file together', text: 'We help you correctly assemble all the required documents: tax return, insurance policy, payslips, and other documents depending on your canton.' },
      { n: '4', title: 'We submit your application', text: 'We submit the application together with you to the responsible cantonal office. You’ll receive a decision from the canton within a few weeks.' },
    ],
    werWirSind: {
      heading: 'Who is behind prämienhilfe.ch?',
      paragraphs: [
        'prämienhilfe.ch is a service of EVO Partners GmbH, an independent, FINMA-registered insurance broker based in Switzerland.',
        'We are not a government authority or a cantonal office. We are a private advisory firm specializing in Swiss health insurance.',
        'Our services include:',
      ],
      bullets: [
        'Help with the premium subsidy — for every canton',
        'Independent advice on health insurance (mandatory and supplementary)',
        'Optimizing your insurance coverage — same benefits, lower premiums',
      ],
      closing: 'Our help with the premium subsidy is completely free for you. As a FINMA-registered broker, we are compensated by our insurance partners when we recommend an optimization of your health insurance. There is no obligation whatsoever to accept it.',
      trustItems: [
        'FINMA-registered insurance broker',
        'Over 1,000 applications handled since 2020',
        'Independent of cantons and insurers',
        'No obligation whatsoever for clients',
      ],
      rating: '4.8/5 client rating',
    },
    nationalFaqs: [
      { q: 'Who is eligible for the premium subsidy in Switzerland?', a: 'Anyone resident in Switzerland whose taxable income and assets fall below the threshold set by their canton. Thresholds vary considerably by canton and household size. Even people who think they earn too much should have their eligibility checked. Over 2.4 million people across Switzerland qualify.' },
      { q: 'Can I apply for multiple people at once?', a: 'Yes. One application covers the whole household and can include everyone insured — partner, children, and other household members. Children and young adults up to age 25 in initial education often qualify for a higher subsidy.' },
      { q: 'Do I need to reapply every year?', a: 'In most cantons, yes — the premium subsidy is reassessed and reapplied for annually. Some cantons calculate it automatically based on tax data. We’ll tell you the exact rule for your canton.' },
      { q: 'What does this service cost?', a: 'Our help with the premium subsidy is completely free for you. We are a FINMA-registered insurance broker (EVO Partners GmbH) and are not paid directly by you.' },
      { q: 'Are you an official cantonal office?', a: 'No. prämienhilfe.ch is a private, independent advisory platform. We are not a government body. You can also apply directly with your cantonal office. Our service makes the process easier for you and, at the same time, checks whether your overall insurance situation can be optimized.' },
      { q: 'What happens after the initial consultation?', a: 'You’ll receive a summary of your situation and clear next-step recommendations. If you’d like, we’ll help you assemble your file and submit it to the cantonal office. There is no obligation whatsoever.' },
    ],
    deadlineSection: {
      heading: 'Don’t miss your application deadline',
      warning: '⚠️ Application deadlines vary by canton and are often only open once a year.',
      body: 'Each canton sets its own deadline, and missing it usually means losing a year’s worth of subsidy. We know the exact deadlines for your canton of residence and will tell you during the free initial consultation how soon you need to act.',
      closing: 'If you miss the deadline, you lose the subsidy for the current year — that can be several hundred to several thousand francs.',
    },
    howItWorksHeading: 'How our help works',
    finalCta: {
      heading: 'Check your eligibility now',
      text: 'Select your situation and find out in 20 minutes whether you’re entitled to a premium subsidy. Free of charge and with no obligation.',
      buttonLabel: 'Check eligibility →',
      disclaimer: 'prämienhilfe.ch is a private advisory service run by EVO Partners GmbH, a FINMA-registered insurance broker. Not an official cantonal body.',
    },
  },
  es: {
    heroCopy: {
      title: 'Solicite su reducción de primas del seguro médico — en cualquier cantón',
      paragraph:
        'La reducción individual de primas está disponible para miles de residentes en Suiza — pero muchos nunca la solicitan. Le ayudamos a comprobar si tiene derecho y a presentar su solicitud correctamente. Gratuito y sin compromiso.',
      proof: 'Más de 1,000 expedientes gestionados con éxito',
    },
    nationalStats: [
      { value: '1,000+', label: 'Expedientes al año' },
      { value: 'CHF 500–3,000', label: 'Ahorro anual' },
      { value: '20 minutos', label: 'Primera consulta' },
      { value: 'FINMA', label: 'Registrado' },
    ],
    wasIst: {
      introBefore: 'La ',
      introLinkText: 'reducción individual de primas',
      introAfter:
        ' es una prestación estatal de apoyo para personas y hogares con recursos económicos modestos. La Confederación y los cantones contribuyen conjuntamente a los costes del seguro médico obligatorio.',
      paragraphs: [
        'En Suiza, más de 2.4 millones de personas tienen derecho a la reducción de primas. Sin embargo, muchas nunca la solicitan — por desconocimiento, por las trabas administrativas o porque no saben si tienen derecho.',
      ],
      bullets: [
        'Sus ingresos y patrimonio imponibles',
        'El número de personas en su hogar',
        'El cantón en el que vive',
        'Su prima actual del seguro médico',
      ],
      boxTitle: '¿Sabía que...?',
      boxText: 'Más de 2.4 millones de personas en Suiza tienen derecho a la reducción de primas — pero muchas nunca la solicitan.',
      boxStat: 'CHF 1,500 millones',
      boxStatLabel: 'se pagan cada año en concepto de reducción de primas',
    },
    whySection: {
      heading: '¿Por qué muchas personas con derecho nunca solicitan su reducción de primas?',
      intro: 'Más de 2.4 millones de personas en Suiza tienen derecho a apoyo financiero para sus primas del seguro médico. Sin embargo, una gran parte nunca presenta una solicitud. Los motivos más frecuentes:',
      reasons: [
        { title: 'Demasiado complicado', text: 'Cada cantón tiene sus propios formularios, plazos y requisitos. El procedimiento parece complejo a primera vista.' },
        { title: 'Inseguridad sobre el derecho', text: 'Muchas personas creen que no tienen derecho, aunque sí lo tendrían. Los límites de ingresos son más generosos de lo que se suele pensar.' },
        { title: 'Plazos no cumplidos', text: 'Los plazos de solicitud varían según el cantón y a menudo se pasan por alto. Una solicitud fuera de plazo significa perder un año de reducción.' },
        { title: 'Falta de tiempo', text: 'Reunir los documentos y rellenar los formularios requiere un tiempo que muchas personas no tienen.' },
      ],
      closing: 'Aquí es exactamente donde entramos nosotros. Conocemos los requisitos de cada cantón y le acompañamos durante todo el proceso.',
    },
    howItWorksSteps: [
      { n: '1', title: 'Elija su cantón e indique su situación', text: 'Seleccione su cantón de residencia y describa brevemente su situación personal — ya sea soltero/a, familia, estudiante o jubilado/a. Tarda menos de 2 minutos.' },
      { n: '2', title: 'Evaluación gratuita por nuestros expertos', text: 'Analizamos su situación y comprobamos si tiene derecho a la reducción de primas y en qué cuantía. Conocemos los criterios y plazos exactos de cada cantón.' },
      { n: '3', title: 'Preparamos su expediente', text: 'Le ayudamos a reunir correctamente todos los documentos necesarios: declaración de impuestos, póliza de seguro, nóminas y otros documentos según el cantón.' },
      { n: '4', title: 'Presentamos la solicitud', text: 'Presentamos la solicitud junto con usted ante la oficina cantonal competente. En pocas semanas recibirá una resolución del cantón.' },
    ],
    werWirSind: {
      heading: '¿Quién está detrás de prämienhilfe.ch?',
      paragraphs: [
        'prämienhilfe.ch es un servicio de EVO Partners GmbH, un corredor de seguros independiente registrado ante FINMA con sede en Suiza.',
        'No somos una autoridad estatal ni una oficina cantonal. Somos una empresa de asesoría privada especializada en el seguro médico suizo.',
        'Nuestros servicios incluyen:',
      ],
      bullets: [
        'Ayuda con la reducción de primas — para todos los cantones',
        'Asesoría independiente sobre el seguro médico (obligatorio y complementario)',
        'Optimización de su cobertura de seguro — mismas prestaciones, primas más bajas',
      ],
      closing: 'Nuestra ayuda con la reducción de primas es totalmente gratuita para usted. Como corredor registrado ante FINMA, recibimos una compensación de nuestros socios aseguradores cuando recomendamos una optimización de su seguro médico. No existe ninguna obligación de aceptarla.',
      trustItems: [
        'Corredor de seguros registrado ante FINMA',
        'Más de 1,000 expedientes gestionados desde 2020',
        'Independiente de cantones y aseguradoras',
        'Ninguna obligación para el cliente',
      ],
      rating: '4.8/5 valoración de clientes',
    },
    nationalFaqs: [
      { q: '¿Quién tiene derecho a la reducción de primas en toda Suiza?', a: 'Toda persona residente en Suiza cuyos ingresos y patrimonio imponibles se sitúen por debajo del límite establecido por su cantón. Los límites varían considerablemente según el cantón y el tamaño del hogar. Incluso quienes creen ganar demasiado deberían comprobar su derecho. Más de 2.4 millones de personas tienen derecho en toda Suiza.' },
      { q: '¿Puedo solicitarlo para varias personas a la vez?', a: 'Sí. Una solicitud cubre todo el hogar y puede incluir a todas las personas aseguradas — pareja, hijos y demás miembros del hogar. Los niños y jóvenes hasta 25 años en formación inicial suelen tener derecho a un importe mayor.' },
      { q: '¿Debo volver a solicitarlo cada año?', a: 'En la mayoría de los cantones, sí — la reducción de primas se solicita de nuevo cada año. En algunos cantones se calcula automáticamente a partir de los datos fiscales. Le informaremos sobre la normativa exacta de su cantón.' },
      { q: '¿Cuánto cuesta este servicio?', a: 'Nuestra ayuda con la reducción de primas es totalmente gratuita para usted. Somos un corredor de seguros registrado ante FINMA (EVO Partners GmbH) y no recibimos pago directo suyo.' },
      { q: '¿Son una oficina cantonal oficial?', a: 'No. prämienhilfe.ch es una plataforma de asesoría privada e independiente. No somos un organismo estatal. También puede presentar la solicitud directamente ante su oficina cantonal. Nuestro servicio le facilita el proceso y, al mismo tiempo, comprueba si su situación de seguros en general puede optimizarse.' },
      { q: '¿Qué ocurre después de la primera consulta?', a: 'Recibirá un resumen de su situación junto con recomendaciones claras. Si lo desea, le ayudamos a preparar el expediente y a presentarlo ante la oficina cantonal. No existe ninguna obligación.' },
    ],
    deadlineSection: {
      heading: 'No deje pasar su plazo de solicitud',
      warning: '⚠️ Los plazos de solicitud varían según el cantón y a menudo solo se abren una vez al año.',
      body: 'Cada cantón fija su propio plazo, y no cumplirlo suele significar perder un año entero de reducción. Conocemos los plazos exactos de su cantón de residencia y le indicaremos en la consulta inicial gratuita hasta cuándo debe actuar.',
      closing: 'Quien no cumple el plazo pierde la reducción del año en curso — lo que puede suponer desde varios cientos hasta varios miles de francos.',
    },
    howItWorksHeading: 'Cómo funciona nuestra ayuda',
    finalCta: {
      heading: 'Compruebe su derecho ahora',
      text: 'Seleccione su situación y compruebe en 20 minutos si tiene derecho a la reducción de primas. Gratuito y sin compromiso.',
      buttonLabel: 'Comprobar derecho →',
      disclaimer: 'prämienhilfe.ch es un servicio de asesoría privado de EVO Partners GmbH, corredor de seguros registrado ante FINMA. No es un organismo cantonal oficial.',
    },
  },
};
```

- [ ] **Step 2: Update `Hero.astro` to take `locale`, index into `national[locale].heroCopy`**

Add `locale: 'de' | 'en' | 'es';` to `Props`, `import { national } from '../data/national.js';` stays but change usage from `heroCopy` (bare import) to `national[locale].heroCopy`. Pass `locale` down to `<SituationSelector locale={locale} />` and `<SituationFunnel locale={locale} />` (translated in Task 7) and `<Funnel locale={locale} />`.

- [ ] **Step 3: Update `WasIstSection.astro`, `WerWirSindSection.astro`, `FAQ.astro`, `DeadlineSection.astro`, `TrustBar.astro`, `CantonDirectory.astro`**

Each takes a `locale` prop. `WasIstSection`/`WerWirSindSection`/`DeadlineSection` read `national[locale].wasIst` / `.werWirSind` / `.deadlineSection` respectively instead of the old bare named imports, and render the now-included `heading` field instead of a hardcoded `<h2>` string. `FAQ.astro`'s `canton` prop shape is unchanged (still `{ faqs }`) — the caller (`[locale]/index.astro`) passes `canton={{ faqs: national[locale].nationalFaqs }}`. `TrustBar.astro`'s `canton` prop shape is unchanged (`{ stats }`) — caller passes `canton={{ stats: national[locale].nationalStats }}`.

`CantonDirectory.astro` heading/paragraph ("Prämienhilfe nach Kanton entdecken" / "Wählen Sie Ihren Kanton...") move into `ui.js` as `cantonDirectory.heading` / `cantonDirectory.intro` (add these three keys — DE/EN/ES — to Task 3's `ui.js` dictionary before this step) since they're short UI-adjacent strings, not long-form content. Canton names inside the directory stay untranslated (proper nouns). The `Demnächst`-equivalent isn't shown here (that's the Header mega-menu only) so no change needed beyond the heading/intro and a `locale` prop threaded into hrefs (`/${locale}/${c.slug}` for active cantons).

- [ ] **Step 4: Update `HowItWorks.astro`, `ProblemSection.astro`, `FinalCTA.astro` default-prop fallbacks**

These three already accept `heading`/`steps`/`intro`/`reasons`/`closing`/`text`/`buttons` as props with German hardcoded defaults. Leave the components themselves unchanged (they're presentational, prop-driven) — instead, every call site in `[locale]/index.astro` (Task 5's Step 5) and other pages (Tasks 6/9/10) must pass explicit locale-appropriate values instead of relying on defaults. Do not translate the default parameter values in these three files — an untranslated default that's never actually reached (because every call site now passes explicit props) is not a defect, but leaving them reachable in German is a trap for a future untranslated call site, so also change each default fallback to read from `ui.js`/`national.js` via a `locale` prop these three components now also accept, exactly as `HowItWorks` already does for its `heading` param — e.g. `ProblemSection`'s default `heading` becomes `t('problemSection.heading')` computed from a `locale` prop, using new `ui.js` keys `problemSection.heading` / `problemSection.intro` added in this step (append to all three locale blocks in Task 3's `ui.js`, matching the German source already in `ProblemSection.astro`'s current defaults, translated to EN/ES following the same terminology as `whySection` above).

- [ ] **Step 5: Update `src/pages/[locale]/index.astro`**

```astro
---
// src/pages/[locale]/index.astro
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
import TrustBar from '../../components/TrustBar.astro';
import WasIstSection from '../../components/WasIstSection.astro';
import CantonDirectory from '../../components/CantonDirectory.astro';
import HowItWorks from '../../components/HowItWorks.astro';
import ProblemSection from '../../components/ProblemSection.astro';
import WerWirSindSection from '../../components/WerWirSindSection.astro';
import FAQ from '../../components/FAQ.astro';
import DeadlineSection from '../../components/DeadlineSection.astro';
import FinalCTA from '../../components/FinalCTA.astro';
import { national } from '../../data/national.js';

const locale = Astro.currentLocale ?? 'de';
const content = national[locale];

const titleByLocale = {
  de: 'Prämienverbilligung Schweiz 2026 – Antrag stellen | prämienhilfe.ch',
  en: 'Swiss Health Insurance Premium Subsidy 2026 – Apply Now | prämienhilfe.ch',
  es: 'Reducción de primas del seguro médico Suiza 2026 – Solicitar | prämienhilfe.ch',
};
const descriptionByLocale = {
  de: 'Prämienverbilligung in der ganzen Schweiz beantragen. EVO Partners GmbH hilft Ihnen kostenlos bei der Einreichung Ihres Antrags — egal in welchem Kanton.',
  en: 'Apply for your health insurance premium subsidy anywhere in Switzerland. EVO Partners GmbH helps you submit your application for free — no matter which canton.',
  es: 'Solicite la reducción de primas del seguro médico en toda Suiza. EVO Partners GmbH le ayuda gratis a presentar su solicitud — sin importar el cantón.',
};

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'prämienhilfe.ch',
    url: 'https://praemienhilfe.ch',
    description: 'Unabhängige Hilfe bei der Prämienverbilligung in der ganzen Schweiz',
    provider: {
      '@type': 'Organization',
      name: 'EVO Partners GmbH',
      description: 'FINMA-registrierter Versicherungsbroker',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.nationalFaqs.slice(0, 3).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
];
---

<Base
  title={titleByLocale[locale]}
  description={descriptionByLocale[locale]}
  canonical={`https://praemienhilfe.ch/${locale}/`}
  locale={locale}
  translationKey="home"
  activePage="home"
  schema={schema}
>
  <Hero variant="national" locale={locale} />
  <TrustBar canton={{ stats: content.nationalStats }} />
  <WasIstSection locale={locale} />
  <CantonDirectory locale={locale} />
  <HowItWorks steps={content.howItWorksSteps} heading={content.howItWorksHeading} id="so-funktioniert-es" />
  <ProblemSection
    heading={content.whySection.heading}
    intro={content.whySection.intro}
    reasons={content.whySection.reasons}
    closing={content.whySection.closing}
  />
  <WerWirSindSection locale={locale} />
  <FAQ canton={{ faqs: content.nationalFaqs }} />
  <DeadlineSection locale={locale} />
  <FinalCTA
    heading={content.finalCta.heading}
    text={content.finalCta.text}
    buttons={[{ label: content.finalCta.buttonLabel, href: '#pruefen' }]}
    disclaimer={content.finalCta.disclaimer}
  />
</Base>
```

`howItWorksSteps`, `howItWorksHeading`, and `finalCta` are added to each locale's block in Step 1 above (alongside `deadlineSection`).

- [ ] **Step 6: Build and manual spot-check**

Run: `npm run build`
Expected: exits 0.

Run: `npm run dev`, then open `/de/`, `/en/`, `/es/` in a browser and confirm the hero title, trust bar stats, "Was ist"/"What is"/"Qué es" heading, FAQ questions, and deadline section text are each in the correct language, and clicking through to `/en/basel-stadt` doesn't 404 (still German content there until Task 6 — confirmed by fallback).

- [ ] **Step 7: Commit**

```bash
git add src/data/national.js src/components/Hero.astro src/components/WasIstSection.astro \
  src/components/HowItWorks.astro src/components/ProblemSection.astro src/components/WerWirSindSection.astro \
  src/components/FAQ.astro src/components/DeadlineSection.astro src/components/FinalCTA.astro \
  src/components/TrustBar.astro src/components/CantonDirectory.astro src/pages/\[locale\]/index.astro
git commit -m "feat: translate homepage content and components to DE/EN/ES"
```

---

### Task 6: Restructure `cantons.js` (Basel-Stadt/-Landschaft only) to per-locale content

**Files:**
- Modify: `src/data/cantons.js`
- Modify: `src/components/InfoSection.astro`
- Modify: `src/pages/[locale]/basel-stadt.astro`
- Modify: `src/pages/[locale]/basel-landschaft.astro`

**Interfaces:**
- Consumes: `useTranslations`/`ui` (Task 3), `<Base>` `locale`/`translationKey` props (Task 4).
- Produces: `cantons['basel-stadt'][locale]` / `cantons['basel-landschaft'][locale]`, same key shape as the current single-locale objects (`name`, `shortCode`, `heroProof`, `stats`, `infoHeading`, `infoParagraphs`, `facts`, `officeNameFull`, `overviewCard`, `closingParagraph`, `steps`, `reasons`, `faqs`). `phone`/`email` stay locale-independent (moved outside the per-locale block, unchanged). `name`/`shortCode`/`officeNameFull` (proper nouns / official German office names) are intentionally identical across all three locales — do not invent translated office names.

- [ ] **Step 1: Restructure `src/data/cantons.js`**

```js
// src/data/cantons.js
const PHONE = '+41 76 779 0449';
const EMAIL = 'office@evo-partners.ch';

const reasonsByLocale = {
  de: [
    { title: 'Zu kompliziert', text: 'Das Antragsverfahren wirkt aufwendig' },
    { title: 'Unsicher', text: 'Viele wissen nicht ob sie berechtigt sind' },
    { title: 'Keine Zeit', text: 'Fristen werden oft verpasst' },
  ],
  en: [
    { title: 'Too complicated', text: 'The application process looks daunting' },
    { title: 'Unsure', text: 'Many don’t know whether they qualify' },
    { title: 'No time', text: 'Deadlines are often missed' },
  ],
  es: [
    { title: 'Demasiado complicado', text: 'El proceso de solicitud parece complejo' },
    { title: 'Inseguridad', text: 'Muchos no saben si tienen derecho' },
    { title: 'Falta de tiempo', text: 'Los plazos suelen pasarse por alto' },
  ],
};

const closingParagraphByLocale = {
  de: 'Haben sich Ihre persönlichen oder finanziellen Verhältnisse verändert? Auch bestehende Bezüger müssen Änderungen melden. Wir begleiten Sie durch den gesamten Prozess.',
  en: 'Has your personal or financial situation changed? Even existing recipients must report changes. We’ll guide you through the entire process.',
  es: '¿Ha cambiado su situación personal o financiera? Incluso quienes ya reciben la reducción deben notificar los cambios. Le acompañamos durante todo el proceso.',
};

const stepsByLocale = {
  de: (office) => [
    { n: '1', title: 'Anspruch prüfen', text: 'In einem kurzen Gespräch von ca. 20 Minuten prüfen wir gemeinsam, ob und in welcher Höhe Sie Anspruch auf Prämienverbilligung haben.' },
    { n: '2', title: 'Dossier zusammenstellen', text: 'Wir helfen Ihnen, alle notwendigen Unterlagen korrekt zusammenzustellen: Steuererklärung, Versicherungspolice, Lohnabrechnungen.' },
    { n: '3', title: 'Antrag einreichen', text: `Den Antrag reichen wir gemeinsam mit Ihnen bei ${office} ein.` },
  ],
  en: (office) => [
    { n: '1', title: 'Check your eligibility', text: 'In a short, roughly 20-minute conversation, we’ll check together whether — and how much — you’re entitled to in premium subsidy.' },
    { n: '2', title: 'Assemble your file', text: 'We help you correctly gather all the required documents: tax return, insurance policy, payslips.' },
    { n: '3', title: 'Submit your application', text: `We submit the application together with you to ${office}.` },
  ],
  es: (office) => [
    { n: '1', title: 'Comprobar su derecho', text: 'En una breve conversación de unos 20 minutos, comprobamos juntos si tiene derecho a la reducción de primas y en qué cuantía.' },
    { n: '2', title: 'Preparar el expediente', text: 'Le ayudamos a reunir correctamente todos los documentos necesarios: declaración de impuestos, póliza de seguro, nóminas.' },
    { n: '3', title: 'Presentar la solicitud', text: `Presentamos la solicitud junto con usted ante ${office}.` },
  ],
};

export const cantons = {
  'basel-stadt': {
    slug: 'basel-stadt',
    name: 'Basel-Stadt',
    shortCode: 'BS',
    phone: PHONE,
    email: EMAIL,
    officeNameFull: 'Amt für Sozialbeiträge Basel-Stadt',
    de: {
      heroProof: "Ca. 30'000 Personen erhalten bereits Prämienverbilligung in BS",
      stats: [
        { value: "30'000+", label: 'Bezüger in BS' },
        { value: "CHF 500–3'000", label: 'Ersparnis pro Jahr' },
        { value: '20 Minuten', label: 'Gespräch' },
        { value: 'Seit 2020', label: 'Erfahrung' },
      ],
      infoHeading: 'Prämienverbilligung im Kanton Basel-Stadt',
      infoParagraphs: [
        "Die Prämienverbilligung (auch IPV — Individuelle Prämienverbilligung) im Kanton Basel-Stadt wird vom Amt für Sozialbeiträge (ASB) verwaltet. Rund 30'000 Einwohnerinnen und Einwohner des Kantons Basel-Stadt erhalten bereits diese finanzielle Unterstützung zur Reduktion ihrer Krankenkassenprämien.",
        "Rund 30'000 Personen im Kanton Basel-Stadt erhalten bereits Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt.",
        'Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen.',
        'Die Einkommensgrenzen variieren je nach Haushaltsgrösse und persönlicher Situation. Viele Personen erhalten Prämienverbilligung, auch wenn sie nicht damit rechnen. Es lohnt sich in jedem Fall, den Anspruch zu prüfen.',
      ],
      facts: [
        { k: 'Bezüger im Kanton', v: "ca. 30'000" },
        { k: 'Zuständige Stelle', v: 'ASB Basel-Stadt' },
        { k: 'Antragsfrist 2027', v: 'September–31. Dezember 2026' },
      ],
      overviewCard: {
        bezueger: "ca. 30'000 Bezüger",
        frist: 'Frist: September – 31. Dezember 2026',
        zustaendig: 'Zuständig: ASB Basel-Stadt',
      },
      closingParagraph: closingParagraphByLocale.de,
      steps: stepsByLocale.de('dem Amt für Sozialbeiträge Basel-Stadt'),
      reasons: reasonsByLocale.de,
      faqs: [
        { q: 'Wer sind wir?', a: "prämienhilfe.ch ist ein Service von EVO Partners GmbH, einem FINMA-registrierten unabhängigen Versicherungsbroker mit Sitz in der Schweiz. Wir sind seit 2020 tätig und haben bereits über 1'000 Dossiers für Prämienverbilligung bearbeitet. Neben der Prämienverbilligung beraten wir unsere Klienten auch zu ihrer gesamten Krankenversicherungssituation, um die beste Abdeckung zum besten Preis zu finden." },
        { q: 'Sind Sie ein offizielles Kantonsamt?', a: 'Nein. prämienhilfe.ch ist eine private, unabhängige Beratungsplattform. Wir sind kein staatliches Organ. Die Prämienverbilligung kann auch direkt beim Amt für Sozialbeiträge (ASB) Basel-Stadt beantragt werden. Unser Service erleichtert Ihnen den Prozess und prüft gleichzeitig, ob Ihre Versicherungssituation insgesamt optimiert werden kann.' },
        { q: 'Wer hat Anspruch auf Prämienverbilligung?', a: "Anspruch haben Personen in bescheidenen wirtschaftlichen Verhältnissen mit Wohnsitz in der Schweiz. Im Kanton Basel-Stadt gilt: Einzelpersonen bis CHF 49'375, 4-Personen-Haushalte bis CHF 97'000 Jahreseinkommen." },
        { q: 'Wie viel kann ich erhalten?', a: "Zwischen CHF 500 und CHF 3'000 pro Jahr, abhängig von Einkommen, Vermögen und Anzahl Personen. Kinder und junge Erwachsene bis 25 Jahre in Erstausbildung sind ebenfalls anspruchsberechtigt." },
        { q: 'Was kostet mich dieser Service?', a: 'Für Sie entstehen keine direkten Kosten. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners GmbH) und werden nicht direkt von Ihnen vergütet.' },
        { q: 'Was ist der Unterschied zum direkten Kantonsantrag?', a: 'Sie können den Antrag direkt beim Kantonsamt stellen. Wir helfen Ihnen vorab, Ihren Anspruch zu prüfen und das Dossier korrekt zusammenzustellen — ähnlich wie ein Treuhänder beim Steuerformular.' },
        { q: 'Wie lange dauert die Bearbeitung?', a: 'Das Erstgespräch dauert ca. 20 Minuten. Der Entscheid durch das Kantonsamt erfolgt in der Regel innerhalb von 2–4 Wochen.' },
      ],
    },
    en: {
      heroProof: 'About 30,000 people already receive the premium subsidy in Basel-Stadt',
      stats: [
        { value: '30,000+', label: 'Recipients in BS' },
        { value: 'CHF 500–3,000', label: 'Savings per year' },
        { value: '20 minutes', label: 'Consultation' },
        { value: 'Since 2020', label: 'Experience' },
      ],
      infoHeading: 'Premium subsidy in the canton of Basel-Stadt',
      infoParagraphs: [
        "The premium subsidy in the canton of Basel-Stadt is administered by the Amt für Sozialbeiträge (ASB). Around 30,000 residents of the canton of Basel-Stadt already receive this financial support toward their health insurance premiums.",
        'Around 30,000 people in the canton of Basel-Stadt already receive the premium subsidy. The process is short and simple — it’s worth checking whether you qualify. One application per household is enough.',
        'You’re eligible if your household income and assets are below the applicable threshold and you’ve lived in the canton since January 1st of the current year.',
        'Income thresholds vary depending on household size and personal situation. Many people receive the premium subsidy even when they don’t expect to. It’s always worth checking your eligibility.',
      ],
      facts: [
        { k: 'Recipients in the canton', v: 'approx. 30,000' },
        { k: 'Responsible office', v: 'ASB Basel-Stadt' },
        { k: 'Application deadline 2027', v: 'September – December 31, 2026' },
      ],
      overviewCard: {
        bezueger: 'approx. 30,000 recipients',
        frist: 'Deadline: September – December 31, 2026',
        zustaendig: 'Responsible: ASB Basel-Stadt',
      },
      closingParagraph: closingParagraphByLocale.en,
      steps: stepsByLocale.en('the Amt für Sozialbeiträge Basel-Stadt'),
      reasons: reasonsByLocale.en,
      faqs: [
        { q: 'Who are we?', a: 'prämienhilfe.ch is a service of EVO Partners GmbH, a FINMA-registered independent insurance broker based in Switzerland. We’ve been active since 2020 and have already handled over 1,000 premium subsidy applications. Besides the premium subsidy, we also advise clients on their overall health insurance situation, to find the best coverage at the best price.' },
        { q: 'Are you an official cantonal office?', a: 'No. prämienhilfe.ch is a private, independent advisory platform. We are not a government body. The premium subsidy can also be applied for directly with the Amt für Sozialbeiträge (ASB) Basel-Stadt. Our service makes the process easier for you and, at the same time, checks whether your overall insurance situation can be optimized.' },
        { q: 'Who is eligible for the premium subsidy?', a: 'People with modest financial means residing in Switzerland are eligible. In the canton of Basel-Stadt: single people up to CHF 49,375, 4-person households up to CHF 97,000 in annual income.' },
        { q: 'How much can I receive?', a: 'Between CHF 500 and CHF 3,000 per year, depending on income, assets, and household size. Children and young adults up to age 25 in initial education are also eligible.' },
        { q: 'What does this service cost?', a: 'You incur no direct costs. We are a FINMA-registered insurance broker (EVO Partners GmbH) and are not paid directly by you.' },
        { q: 'What’s the difference to applying directly with the canton?', a: 'You can apply directly with the cantonal office. We help you beforehand to check your eligibility and correctly assemble your file — similar to how a fiduciary helps with a tax return.' },
        { q: 'How long does processing take?', a: 'The initial consultation takes about 20 minutes. The cantonal office typically issues a decision within 2–4 weeks.' },
      ],
    },
    es: {
      heroProof: 'Cerca de 30,000 personas ya reciben la reducción de primas en Basel-Stadt',
      stats: [
        { value: '30,000+', label: 'Beneficiarios en BS' },
        { value: 'CHF 500–3,000', label: 'Ahorro anual' },
        { value: '20 minutos', label: 'Consulta' },
        { value: 'Desde 2020', label: 'Experiencia' },
      ],
      infoHeading: 'Reducción de primas en el cantón de Basilea-Ciudad',
      infoParagraphs: [
        'La reducción de primas (también IPV) en el cantón de Basilea-Ciudad es administrada por el Amt für Sozialbeiträge (ASB). Alrededor de 30,000 residentes del cantón de Basilea-Ciudad ya reciben esta ayuda económica para reducir sus primas del seguro médico.',
        'Alrededor de 30,000 personas en el cantón de Basilea-Ciudad ya reciben la reducción de primas. El trámite es breve y sencillo — vale la pena comprobar si tiene derecho. Basta con una solicitud por hogar.',
        'Tienen derecho las personas cuyos ingresos y patrimonio del hogar estén por debajo del límite establecido y que residan en el cantón desde el 1 de enero del año en curso.',
        'Los límites de ingresos varían según el tamaño del hogar y la situación personal. Muchas personas reciben la reducción de primas incluso sin esperarlo. En cualquier caso, vale la pena comprobar su derecho.',
      ],
      facts: [
        { k: 'Beneficiarios en el cantón', v: 'aprox. 30,000' },
        { k: 'Oficina competente', v: 'ASB Basilea-Ciudad' },
        { k: 'Plazo de solicitud 2027', v: 'Septiembre – 31 de diciembre de 2026' },
      ],
      overviewCard: {
        bezueger: 'aprox. 30,000 beneficiarios',
        frist: 'Plazo: septiembre – 31 de diciembre de 2026',
        zustaendig: 'Competente: ASB Basilea-Ciudad',
      },
      closingParagraph: closingParagraphByLocale.es,
      steps: stepsByLocale.es('el Amt für Sozialbeiträge Basel-Stadt'),
      reasons: reasonsByLocale.es,
      faqs: [
        { q: '¿Quiénes somos?', a: 'prämienhilfe.ch es un servicio de EVO Partners GmbH, un corredor de seguros independiente registrado ante FINMA con sede en Suiza. Operamos desde 2020 y ya hemos gestionado más de 1,000 expedientes de reducción de primas. Además de la reducción de primas, asesoramos a nuestros clientes sobre su situación global de seguro médico, para encontrar la mejor cobertura al mejor precio.' },
        { q: '¿Son una oficina cantonal oficial?', a: 'No. prämienhilfe.ch es una plataforma de asesoría privada e independiente. No somos un organismo estatal. La reducción de primas también puede solicitarse directamente ante el Amt für Sozialbeiträge (ASB) de Basilea-Ciudad. Nuestro servicio le facilita el proceso y, al mismo tiempo, comprueba si su situación de seguros en general puede optimizarse.' },
        { q: '¿Quién tiene derecho a la reducción de primas?', a: 'Tienen derecho las personas con recursos económicos modestos residentes en Suiza. En el cantón de Basilea-Ciudad: personas solteras hasta CHF 49,375, hogares de 4 personas hasta CHF 97,000 de ingresos anuales.' },
        { q: '¿Cuánto puedo recibir?', a: 'Entre CHF 500 y CHF 3,000 al año, según los ingresos, el patrimonio y el número de personas. Los niños y jóvenes adultos hasta 25 años en formación inicial también tienen derecho.' },
        { q: '¿Cuánto cuesta este servicio?', a: 'No le supone ningún coste directo. Somos un corredor de seguros registrado ante FINMA (EVO Partners GmbH) y no recibimos pago directo suyo.' },
        { q: '¿Cuál es la diferencia con solicitarlo directamente al cantón?', a: 'Puede presentar la solicitud directamente ante la oficina cantonal. Nosotros le ayudamos previamente a comprobar su derecho y a preparar correctamente el expediente — de forma similar a como un fiduciario ayuda con la declaración de impuestos.' },
        { q: '¿Cuánto dura la tramitación?', a: 'La primera consulta dura unos 20 minutos. La oficina cantonal suele emitir una resolución en un plazo de 2 a 4 semanas.' },
      ],
    },
  },

  'basel-landschaft': {
    slug: 'basel-landschaft',
    name: 'Basel-Landschaft',
    shortCode: 'BL',
    phone: PHONE,
    email: EMAIL,
    officeNameFull: 'SVA Basel-Landschaft',
    de: {
      heroProof: "Ca. 20'000 Personen erhalten bereits Prämienverbilligung in BL",
      stats: [
        { value: "20'000+", label: 'Bezüger in BL' },
        { value: "CHF 500–3'000", label: 'Ersparnis pro Jahr' },
        { value: '20 Minuten', label: 'Gespräch' },
        { value: 'Seit 2020', label: 'Erfahrung' },
      ],
      infoHeading: 'Prämienverbilligung im Kanton Basel-Landschaft',
      infoParagraphs: [
        'Auch im Kanton Basel-Landschaft erhalten tausende Personen Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt.',
        'Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen.',
      ],
      facts: [
        { k: 'Einkommensgrenze Einzelperson', v: "CHF 45'000 (unverifiziert)" },
        { k: 'Einkommensgrenze 4-Pers.-Haushalt', v: "CHF 90'000 (unverifiziert)" },
        { k: 'Bezüger im Kanton', v: "ca. 20'000 (unverifiziert)" },
        { k: 'Zuständige Stelle', v: 'SVA Basel-Landschaft' },
        { k: 'Antragsfrist 2027', v: 'September–31. Dezember 2026 (unverifiziert)' },
      ],
      overviewCard: {
        bezueger: "ca. 20'000 Bezüger (unverifiziert)",
        frist: 'Frist: September – 31. Dezember 2026 (unverifiziert)',
        zustaendig: 'Zuständig: SVA Basel-Landschaft',
      },
      closingParagraph: closingParagraphByLocale.de,
      steps: stepsByLocale.de('der SVA Basel-Landschaft'),
      reasons: reasonsByLocale.de,
      faqs: [
        { q: 'Wer hat Anspruch auf Prämienverbilligung?', a: 'Anspruch haben Personen in bescheidenen wirtschaftlichen Verhältnissen mit Wohnsitz in der Schweiz. Die genauen Einkommensgrenzen für den Kanton Basel-Landschaft prüfen wir gemeinsam mit Ihnen im Erstgespräch.' },
        { q: 'Wie viel kann ich erhalten?', a: "Zwischen CHF 500 und CHF 3'000 pro Jahr, abhängig von Einkommen, Vermögen und Anzahl Personen. Kinder und junge Erwachsene bis 25 Jahre in Erstausbildung sind ebenfalls anspruchsberechtigt." },
        { q: 'Was kostet mich dieser Service?', a: 'Für Sie entstehen keine direkten Kosten. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners GmbH) und werden nicht direkt von Ihnen vergütet.' },
        { q: 'Was ist der Unterschied zum direkten Kantonsantrag?', a: 'Sie können den Antrag direkt bei der SVA Basel-Landschaft stellen. Wir helfen Ihnen vorab, Ihren Anspruch zu prüfen und das Dossier korrekt zusammenzustellen — ähnlich wie ein Treuhänder beim Steuerformular.' },
        { q: 'Wie lange dauert die Bearbeitung?', a: 'Das Erstgespräch dauert ca. 20 Minuten. Der Entscheid durch das Kantonsamt erfolgt in der Regel innerhalb von 2–4 Wochen.' },
      ],
    },
    en: {
      heroProof: 'About 20,000 people already receive the premium subsidy in Basel-Landschaft',
      stats: [
        { value: '20,000+', label: 'Recipients in BL' },
        { value: 'CHF 500–3,000', label: 'Savings per year' },
        { value: '20 minutes', label: 'Consultation' },
        { value: 'Since 2020', label: 'Experience' },
      ],
      infoHeading: 'Premium subsidy in the canton of Basel-Landschaft',
      infoParagraphs: [
        'Thousands of people in the canton of Basel-Landschaft also receive the premium subsidy. The process is short and simple — it’s worth checking whether you qualify. One application per household is enough.',
        'You’re eligible if your household income and assets are below the applicable threshold and you’ve lived in the canton since January 1st of the current year.',
      ],
      facts: [
        { k: 'Income threshold, single person', v: 'CHF 45,000 (unverified)' },
        { k: 'Income threshold, 4-person household', v: 'CHF 90,000 (unverified)' },
        { k: 'Recipients in the canton', v: 'approx. 20,000 (unverified)' },
        { k: 'Responsible office', v: 'SVA Basel-Landschaft' },
        { k: 'Application deadline 2027', v: 'September – December 31, 2026 (unverified)' },
      ],
      overviewCard: {
        bezueger: 'approx. 20,000 recipients (unverified)',
        frist: 'Deadline: September – December 31, 2026 (unverified)',
        zustaendig: 'Responsible: SVA Basel-Landschaft',
      },
      closingParagraph: closingParagraphByLocale.en,
      steps: stepsByLocale.en('SVA Basel-Landschaft'),
      reasons: reasonsByLocale.en,
      faqs: [
        { q: 'Who is eligible for the premium subsidy?', a: 'People with modest financial means residing in Switzerland are eligible. We’ll check the exact income thresholds for the canton of Basel-Landschaft together with you in the initial consultation.' },
        { q: 'How much can I receive?', a: 'Between CHF 500 and CHF 3,000 per year, depending on income, assets, and household size. Children and young adults up to age 25 in initial education are also eligible.' },
        { q: 'What does this service cost?', a: 'You incur no direct costs. We are a FINMA-registered insurance broker (EVO Partners GmbH) and are not paid directly by you.' },
        { q: 'What’s the difference to applying directly with the canton?', a: 'You can apply directly with SVA Basel-Landschaft. We help you beforehand to check your eligibility and correctly assemble your file — similar to how a fiduciary helps with a tax return.' },
        { q: 'How long does processing take?', a: 'The initial consultation takes about 20 minutes. The cantonal office typically issues a decision within 2–4 weeks.' },
      ],
    },
    es: {
      heroProof: 'Cerca de 20,000 personas ya reciben la reducción de primas en Basel-Landschaft',
      stats: [
        { value: '20,000+', label: 'Beneficiarios en BL' },
        { value: 'CHF 500–3,000', label: 'Ahorro anual' },
        { value: '20 minutos', label: 'Consulta' },
        { value: 'Desde 2020', label: 'Experiencia' },
      ],
      infoHeading: 'Reducción de primas en el cantón de Basilea-Campo',
      infoParagraphs: [
        'También en el cantón de Basilea-Campo miles de personas reciben la reducción de primas. El trámite es breve y sencillo — vale la pena comprobar si tiene derecho. Basta con una solicitud por hogar.',
        'Tienen derecho las personas cuyos ingresos y patrimonio del hogar estén por debajo del límite establecido y que residan en el cantón desde el 1 de enero del año en curso.',
      ],
      facts: [
        { k: 'Límite de ingresos, persona sola', v: 'CHF 45,000 (sin verificar)' },
        { k: 'Límite de ingresos, hogar de 4 personas', v: 'CHF 90,000 (sin verificar)' },
        { k: 'Beneficiarios en el cantón', v: 'aprox. 20,000 (sin verificar)' },
        { k: 'Oficina competente', v: 'SVA Basel-Landschaft' },
        { k: 'Plazo de solicitud 2027', v: 'Septiembre – 31 de diciembre de 2026 (sin verificar)' },
      ],
      overviewCard: {
        bezueger: 'aprox. 20,000 beneficiarios (sin verificar)',
        frist: 'Plazo: septiembre – 31 de diciembre de 2026 (sin verificar)',
        zustaendig: 'Competente: SVA Basel-Landschaft',
      },
      closingParagraph: closingParagraphByLocale.es,
      steps: stepsByLocale.es('la SVA Basel-Landschaft'),
      reasons: reasonsByLocale.es,
      faqs: [
        { q: '¿Quién tiene derecho a la reducción de primas?', a: 'Tienen derecho las personas con recursos económicos modestos residentes en Suiza. Comprobaremos junto con usted los límites de ingresos exactos para el cantón de Basilea-Campo en la primera consulta.' },
        { q: '¿Cuánto puedo recibir?', a: 'Entre CHF 500 y CHF 3,000 al año, según los ingresos, el patrimonio y el número de personas. Los niños y jóvenes adultos hasta 25 años en formación inicial también tienen derecho.' },
        { q: '¿Cuánto cuesta este servicio?', a: 'No le supone ningún coste directo. Somos un corredor de seguros registrado ante FINMA (EVO Partners GmbH) y no recibimos pago directo suyo.' },
        { q: '¿Cuál es la diferencia con solicitarlo directamente al cantón?', a: 'Puede presentar la solicitud directamente ante la SVA Basel-Landschaft. Nosotros le ayudamos previamente a comprobar su derecho y a preparar correctamente el expediente — de forma similar a como un fiduciario ayuda con la declaración de impuestos.' },
        { q: '¿Cuánto dura la tramitación?', a: 'La primera consulta dura unos 20 minutos. La oficina cantonal suele emitir una resolución en un plazo de 2 a 4 semanas.' },
      ],
    },
  },
};

export const cantonList = Object.values(cantons);
```

Note: the unverified Basel-Landschaft figures (income thresholds, beneficiary count, deadline) are carried over unchanged in meaning across all three locales, each still marked "(unverifiziert)"/"(unverified)"/"(sin verificar)" — do not resolve or remove these markers as part of translation; that's a separate, pre-existing data-accuracy issue out of scope for this plan.

- [ ] **Step 2: Update `InfoSection.astro` call sites**

`InfoSection.astro` itself is unchanged (already prop-driven via `canton.infoHeading` etc.). Its callers (`[locale]/basel-stadt.astro`, `[locale]/basel-landschaft.astro`) now pass `canton={{ ...cantons['basel-stadt'], ...cantons['basel-stadt'][locale] }}` (spread the locale-specific fields on top of the locale-independent ones) instead of `cantons['basel-stadt']` directly.

- [ ] **Step 3: Update `[locale]/basel-stadt.astro`**

```astro
---
// src/pages/[locale]/basel-stadt.astro
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
import TrustBar from '../../components/TrustBar.astro';
import InfoSection from '../../components/InfoSection.astro';
import HowItWorks from '../../components/HowItWorks.astro';
import ProblemSection from '../../components/ProblemSection.astro';
import WerWirSindSection from '../../components/WerWirSindSection.astro';
import FAQ from '../../components/FAQ.astro';
import SituationFinalCTA from '../../components/SituationFinalCTA.astro';
import { cantons } from '../../data/cantons.js';

const locale = Astro.currentLocale ?? 'de';
const base = cantons['basel-stadt'];
const canton = { ...base, ...base[locale] };

const titleByLocale = {
  de: 'Prämienverbilligung Basel-Stadt | prämienhilfe.ch',
  en: 'Premium Subsidy Basel-Stadt | prämienhilfe.ch',
  es: 'Reducción de primas Basilea-Ciudad | prämienhilfe.ch',
};
const descriptionByLocale = {
  de: 'Prämienverbilligung im Kanton Basel-Stadt beantragen. EVO Partners GmbH hilft Ihnen kostenlos bei der Einreichung Ihres Antrags. Jetzt Anspruch prüfen — in 20 Minuten.',
  en: 'Apply for the premium subsidy in the canton of Basel-Stadt. EVO Partners GmbH helps you submit your application for free. Check your eligibility now — in 20 minutes.',
  es: 'Solicite la reducción de primas en el cantón de Basilea-Ciudad. EVO Partners GmbH le ayuda gratis a presentar su solicitud. Compruebe su derecho ahora — en 20 minutos.',
};
---

<Base
  title={titleByLocale[locale]}
  description={descriptionByLocale[locale]}
  canonical={`https://praemienhilfe.ch/${locale}/basel-stadt`}
  locale={locale}
  translationKey="basel-stadt"
  activePage="basel-stadt"
  schema={[
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'prämienhilfe.ch – EVO Partners GmbH',
      description: 'Unabhängige Beratung bei der Prämienverbilligung im Kanton Basel-Stadt',
      url: 'https://praemienhilfe.ch',
      areaServed: { '@type': 'AdministrativeArea', name: 'Basel-Stadt' },
      serviceType: 'Prämienverbilligung Beratung',
      provider: {
        '@type': 'Organization',
        name: 'EVO Partners GmbH',
        description: 'FINMA-registrierter Versicherungsbroker',
      },
    },
  ]}
>
  <Hero canton={canton} defaultCanton="Basel-Stadt" embeddedFunnel={true} locale={locale} />
  <TrustBar canton={canton} />
  <InfoSection canton={canton} />
  <HowItWorks steps={canton.steps} id="so-funktioniert-es" />
  <ProblemSection reasons={canton.reasons} locale={locale} />
  <WerWirSindSection locale={locale} />
  <FAQ canton={canton} />
  <SituationFinalCTA locale={locale} />
</Base>
```

`ProblemSection` on this page keeps using its own translated `heading`/`intro` defaults added in Task 5 Step 4 (`problemSection.heading`/`problemSection.intro` from `ui.js`, resolved internally via the `locale` prop) — only `reasons` is overridden here, with the per-canton reasons list.

The Basel-Stadt FAQPage schema block (present in the original file, omitted from the snippet above for brevity) stays German-only per-locale — duplicate it three times with the `name`/`acceptedAnswer.text` values in the page's own locale (`canton.faqs[0]` and a second short one already existing in the original — pull both strings from `canton.faqs` at render time instead of hardcoding a second German copy: `mainEntity: canton.faqs.slice(0, 2).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))`, added as a second schema array entry alongside `LocalBusiness`).

- [ ] **Step 4: Update `[locale]/basel-landschaft.astro`** the same way

Same pattern as Step 3: `locale = Astro.currentLocale`, `canton = { ...cantons['basel-landschaft'], ...cantons['basel-landschaft'][locale] }`, `translationKey="basel-landschaft"`, per-locale `title`/`description` (EN: `"Premium Subsidy Basel-Landschaft | prämienhilfe.ch"` / `"Apply for the premium subsidy in the canton of Basel-Landschaft. Free help with assessment and application through SVA Basel-Landschaft."`; ES: `"Reducción de primas Basilea-Campo | prämienhilfe.ch"` / `"Solicite la reducción de primas en el cantón de Basilea-Campo. Ayuda gratuita para la evaluación y la solicitud a través de la SVA Basel-Landschaft."`), `<Hero canton={canton} defaultCanton="Basel-Landschaft" useSituationFunnel={false} locale={locale} />`, and `<FinalCTA locale={locale} buttons={[{ label: t('form.submit'), href: '#pruefen' }, ...]}>` using the page's own `useTranslations(locale)` instance for the two button labels (import `useTranslations` in this file's frontmatter).

- [ ] **Step 5: Build, spot-check, commit**

Run: `npm run build` — expect 0 errors.
Manually check `/de/basel-stadt`, `/en/basel-stadt`, `/es/basel-stadt`, and the same three for `/basel-landschaft`, confirming canton-specific stats/FAQ/info text is in the right language and the office name (`Amt für Sozialbeiträge Basel-Stadt` / `SVA Basel-Landschaft`) stays untranslated in all three.

```bash
git add src/data/cantons.js src/components/InfoSection.astro \
  src/pages/\[locale\]/basel-stadt.astro src/pages/\[locale\]/basel-landschaft.astro
git commit -m "feat: translate Basel-Stadt and Basel-Landschaft canton pages to DE/EN/ES"
```

---

### Task 7: Translate `situations.js` and situation-picker components

**Files:**
- Modify: `src/data/situations.js`
- Modify: `src/components/SituationSelector.astro`
- Modify: `src/components/SituationFunnel.jsx`
- Modify: `src/components/SituationFinalCTA.astro`
- Modify: `src/components/Funnel.jsx`

**Interfaces:**
- Consumes: `useTranslations`/`ui` (Task 3).
- Produces: `SITUATIONS(locale)` — changed from a bare object export to a function taking `locale`, returning the same `{ slug: { label } }` shape (labels in the requested locale). `situationList(locale)` becomes a function too. Every consumer (`AntragFunnel.jsx` in Task 8, `SituationSelector.astro`, `SituationFunnel.jsx`, `SituationFinalCTA.astro`) is updated in this task or Task 8 to call these as functions instead of importing bare values.

- [ ] **Step 1: Restructure `src/data/situations.js`**

```js
// src/data/situations.js
const LABELS = {
  de: {
    einzelperson: 'Einzelperson',
    'familie-paar': 'Familie / Paar',
    student: 'Student / Auszubildende',
    getrennt: 'Getrennt / Geschieden',
    rentner: 'Rentner / Pensionierte',
  },
  en: {
    einzelperson: 'Single person',
    'familie-paar': 'Family / Couple',
    student: 'Student / Apprentice',
    getrennt: 'Separated / Divorced',
    rentner: 'Retiree / Pensioner',
  },
  es: {
    einzelperson: 'Persona sola',
    'familie-paar': 'Familia / Pareja',
    student: 'Estudiante / Aprendiz',
    getrennt: 'Separado(a) / Divorciado(a)',
    rentner: 'Jubilado(a) / Pensionista',
  },
};

export function SITUATIONS(locale) {
  const labels = LABELS[locale] ?? LABELS.de;
  return Object.fromEntries(Object.keys(LABELS.de).map((slug) => [slug, { label: labels[slug] }]));
}

export function situationList(locale) {
  const situations = SITUATIONS(locale);
  return Object.entries(situations).map(([slug, v]) => ({ slug, ...v }));
}
```

- [ ] **Step 2: Update `SituationSelector.astro`**

Add a `locale` prop, `import { situationList } from '../data/situations.js';` call becomes `situationList(locale)`, and the `href` becomes `/${locale}/antrag?situation=${s.slug}`.

- [ ] **Step 3: Update `SituationFunnel.jsx`**

Add a `locale` prop (passed from `Hero.astro`). `SITUATIONS`/`situationList` imports become `SITUATIONS(locale)`/`situationList(locale)` calls inside the component body. `goToAntrag` navigates to `/${locale}/antrag?situation=${slug}` instead of `/antrag?situation=${slug}`. The heading `"Was beschreibt Ihre Situation am besten?"` becomes `t('form.situationQuestion')` via `import { useTranslations } from '../i18n/useTranslations.js';` and `const t = useTranslations(locale);`.

- [ ] **Step 4: Update `SituationFinalCTA.astro`**

Add a `locale` prop, `situationList` import becomes `situationList(locale)` call. Translate the two hardcoded strings using new `ui.js` keys (add to Task 3's dictionary, all three locales):
- `"Haben Sie Ihren Anspruch noch nicht geprüft?"` → `situationFinalCta.heading`: DE as-is / EN `"Haven’t checked your eligibility yet?"` / ES `"¿Aún no ha comprobado su derecho?"`
- `"Starten Sie jetzt — es dauert weniger als 20 Minuten. Wählen Sie Ihre Situation:"` → `situationFinalCta.text`: DE as-is / EN `"Get started now — it takes less than 20 minutes. Choose your situation:"` / ES `"Empiece ahora — tarda menos de 20 minutos. Elija su situación:"`
- `"Kein offizielles Kantonsamt. Ein Service von EVO Partners GmbH, FINMA-registrierter Broker."` → `situationFinalCta.disclaimer`: DE as-is / EN `"Not an official cantonal office. A service of EVO Partners GmbH, a FINMA-registered broker."` / ES `"No es una oficina cantonal oficial. Un servicio de EVO Partners GmbH, corredor registrado ante FINMA."`

The inline `<script>` at the bottom navigates to `/${slug}` via `window.startFunnel` or a direct URL — update the fallback URL to `/${locale}/antrag?situation=${slug}`, reading `locale` from a `data-locale` attribute set on the `<section>` (Astro scripts can't close over frontmatter variables directly): add `data-locale={locale}` to the `<section>` tag and read it in the script via `document.currentScript.closest('section').dataset.locale` — simpler: give the section an `id="situation-final-cta"` and read `document.getElementById('situation-final-cta').dataset.locale`.

- [ ] **Step 5: Update `Funnel.jsx`** (the Basel-Landschaft non-situation funnel)

Add a `locale` prop. This component wasn't fully read in this plan's research — before editing, run `grep -n "Weiter\|Kanton\|E-Mail\|Telefon\|Vorname\|Nachname\|Anspruch\|track(" src/components/Funnel.jsx` to enumerate every hardcoded German string, then apply the same `t('...')` substitution pattern as Task 8 Step 2 uses for `AntragFunnel.jsx`, reusing existing `ui.js` keys where the string matches one already added (e.g. `form.firstName`, `form.continue`) and adding new `ui.js` keys only for strings genuinely unique to `Funnel.jsx`.

- [ ] **Step 6: Build, spot-check, commit**

Run: `npm run build` — expect 0 errors.
In dev, confirm `/en/antrag?situation=student` and `/es/antrag?situation=student` render the situation label translated, and the Basel-Landschaft funnel at `/en/basel-landschaft` shows translated field labels.

```bash
git add src/data/situations.js src/components/SituationSelector.astro src/components/SituationFunnel.jsx \
  src/components/SituationFinalCTA.astro src/components/Funnel.jsx
git commit -m "feat: translate situation picker and Basel-Landschaft funnel"
```

---

### Task 8: Translate `AntragFunnel.jsx` and `PhoneField.jsx`

**Files:**
- Modify: `src/components/AntragFunnel.jsx`
- Modify: `src/components/PhoneField.jsx`
- Modify: `src/pages/[locale]/antrag.astro`

**Interfaces:**
- Consumes: `useTranslations`/`ui` (Task 3), `SITUATIONS(locale)`/`situationList(locale)` (Task 7).
- Produces: `AntragFunnel` takes a `locale` prop, threaded in from `[locale]/antrag.astro`. No changes to submitted field names, GA4 event names, or the `/api/submit.js` payload shape — only visible copy changes.

- [ ] **Step 1: Add `locale` prop and `useTranslations` to `AntragFunnel.jsx`**

At the top of the component: `export default function AntragFunnel({ locale }) { const t = useTranslations(locale); ... }`, with `import { useTranslations } from '../i18n/useTranslations.js';` added to the imports. Replace the bare `SITUATIONS`/`situationList` imports with calls: `const SITUATIONS_MAP = SITUATIONS(locale);` and `const situations = situationList(locale);` near the top of the function body, then replace every reference to the old `SITUATIONS[...]`/`situationList` identifiers with `SITUATIONS_MAP[...]`/`situations`.

- [ ] **Step 2: Replace hardcoded strings with `t(...)` calls**

```js
const INCOME_OPTIONS = [t('form.income.under2000'), t('form.income.2000to4000'), t('form.income.4000to6000'), t('form.income.over6000')];

const STAGES = [
  { key: 'identifikation', label: t('form.stage.identification') },
  { key: 'ergaenzend', label: t('form.stage.additional') },
  { key: 'situation', label: t('form.stage.situation') },
  { key: 'abgeschlossen', label: t('form.stage.done') },
];
```
Move both of these constant declarations from module scope into the component body (they now depend on `t`, which depends on the `locale` prop).

Replace remaining strings 1:1 (exact old string → new expression):
- `'Nicht angegeben'` (situationLabel fallback) → `t('form.notSpecified')`
- `'Bitte eine gültige E-Mail-Adresse angeben.'` → `t('form.emailInvalid')`
- `'Bitte Vorname angeben.'` → `t('form.firstNameRequired')`
- `'Bitte Nachname angeben.'` → `t('form.lastNameRequired')`
- `'Bitte Telefonnummer angeben.'` → `t('form.phoneRequired')`
- `'Bitte eine gültige Telefonnummer angeben.'` → `t('form.phoneInvalid')`
- `'Bitte akzeptieren Sie die Datenschutzbestimmungen.'` → `t('form.consentRequired')`
- `'Nicht angegeben'` (canton fallback in `submitContact`'s payload `canton: cantonName || 'Nicht angegeben'`) → `t('form.notSpecified')`
- `` `${household} ${household === 1 ? 'Person' : 'Personen'}` `` (both occurrences — payload and stashed summary) → `` `${household} ${household === 1 ? t('form.person') : t('form.persons')}` ``
- `'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.'` → `t('form.submitError')`
- `'FINMA-anerkannter Broker'` — add new `ui.js` key `sidebar.finmaApproved`: DE as-is / EN `'FINMA-approved broker'` / ES `'Corredor aprobado por FINMA'`
- `'Situationsanalyse · Unverbindlich'` — add `sidebar.situationAnalysis`: DE as-is / EN `'Situation analysis · No obligation'` / ES `'Análisis de situación · Sin compromiso'`
- `'4.8/5 von unseren Klienten bewertet'` — add `sidebar.rating`: DE as-is / EN `'4.8/5 rated by our clients'` / ES `'4.8/5 valorado por nuestros clientes'`
- `"+1'000 Dossiers pro Jahr bearbeitet"` — add `sidebar.dossiers`: DE as-is / EN `'Over 1,000 applications handled per year'` / ES `'Más de 1,000 expedientes gestionados al año'`
- `` `Schritt ${activeStage + 1} von ${STAGES.length}` `` → `t('form.step', activeStage + 1, STAGES.length)`
- `'Sicheres Formular'` → `t('form.securedForm')`
- `'In welchem Kanton wohnen Sie?'` → `t('form.cantonQuestion')`
- `'Kanton wählen'` (aria-label) → `t('form.cantonSelectLabel')`
- `'Kanton auswählen…'` → `t('form.cantonSelectPlaceholder')`
- `` `Ihr Kanton: ${cantonName}` `` → `t('form.yourCanton', cantonName)`
- `'Was beschreibt Ihre Situation am besten?'` → `t('form.situationQuestion')`
- `'Ihr Antrag:'` → `t('form.yourApplication')`
- `'Situation ändern'` (aria-label) → `t('form.changeSituationLabel')`
- `'Zu Beginn benötigen wir Ihre E-Mail-Adresse'` → `t('form.emailIntro')`
- `'nom@exemple.ch'` (email placeholder — this was already non-German/inconsistent in the source) → `t('form.emailPlaceholder')`
- `'Mit dem Fortfahren akzeptieren Sie unsere'` → `t('form.privacyConsentPrefix')`
- `'Datenschutzrichtlinie'` (button text, email step) → `t('form.privacyPolicyLink')`
- `'und die Verarbeitung Ihrer persönlichen Daten.'` → `t('form.privacyConsentSuffix')`
- `'Weiter →'` (both occurrences) → `t('form.continue')`
- `'Wie viele Personen leben in Ihrem Haushalt?'` → `t('form.householdQuestion')`
- `` `${household} ${household === 1 ? 'Person' : 'Personen'}` `` (display, not payload) → same substitution as above
- `'Wie hoch ist Ihr monatliches Haushaltseinkommen?'` → `t('form.incomeQuestion')`
- `'Wie können wir Sie erreichen?'` → `t('form.contactQuestion')`
- `'Vorname'` (placeholder) → `t('form.firstName')`
- `'Nachname'` (placeholder) → `t('form.lastName')`
- `'Ich akzeptiere die'` → `t('form.consentPrefix')`
- `'Datenschutzbestimmungen'` (button text, contact step) → `t('form.privacyTermsLink')`
- `'von EVO Partners GmbH und stimme der Verarbeitung meiner Daten zum Zweck der Beratung zu.'` → `t('form.consentSuffix')`
- `'Wird gesendet…'` → `t('form.submitting')`
- `'Antrag einreichen →'` → `t('form.submit')`

`PrivacyPolicyModal` is opened from this component — pass `locale` through: `<PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} locale={locale} />` (translated in Task 11).

- [ ] **Step 3: Add the four new `ui.js` sidebar keys from Step 2**

Add `sidebar.finmaApproved`, `sidebar.situationAnalysis`, `sidebar.rating`, `sidebar.dossiers` to all three locale blocks in `src/i18n/ui.js` (Task 3), using the DE/EN/ES values listed in Step 2 above.

- [ ] **Step 4: Update `PhoneField.jsx`**

Add a `locale` prop. `react-phone-number-input` ships locale files at `react-phone-number-input/locale/{de,en,es}.json` — replace the hardcoded `import de from 'react-phone-number-input/locale/de.json';` with dynamic selection:

```js
import de from 'react-phone-number-input/locale/de.json';
import en from 'react-phone-number-input/locale/en.json';
import es from 'react-phone-number-input/locale/es.json';

const LABELS_BY_LOCALE = { de, en, es };

export default function PhoneField({ value, onChange, error, locale = 'de' }) {
  return (
    <div>
      <PhoneInput
        international={false}
        defaultCountry={DEFAULT_COUNTRY}
        countryOptionsOrder={COUNTRY_ORDER}
        labels={LABELS_BY_LOCALE[locale] ?? de}
        value={value}
        onChange={onChange}
        placeholder="79 123 45 67"
        className="phone-field"
        numberInputProps={{ className: 'phone-field-input' }}
      />
      {error && <div className="text-swiss-red text-xs mt-1">{error}</div>}
    </div>
  );
}
```

Before this step, run `ls node_modules/react-phone-number-input/locale/ | grep -E "^(de|en|es)\.json$"` to confirm all three locale files ship with the installed version — if `es.json` is missing, fall back to `en.json` for Spanish (`LABELS_BY_LOCALE = { de, en, es: en }`) and note this as a follow-up rather than blocking the task.

In `AntragFunnel.jsx`, pass `<PhoneField value={phone} onChange={setPhone} error={errors.phone} locale={locale} />`.

- [ ] **Step 5: Update `[locale]/antrag.astro`**

```astro
---
// src/pages/[locale]/antrag.astro
import Base from '../../layouts/Base.astro';
import AntragFunnel from '../../components/AntragFunnel.jsx';

const locale = Astro.currentLocale ?? 'de';

const titleByLocale = {
  de: 'Antrag stellen | prämienhilfe.ch',
  en: 'Apply now | prämienhilfe.ch',
  es: 'Solicitar ahora | prämienhilfe.ch',
};
const descriptionByLocale = {
  de: 'Stellen Sie Ihren Antrag auf Prämienverbilligung in wenigen Minuten.',
  en: 'Submit your premium subsidy application in just a few minutes.',
  es: 'Presente su solicitud de reducción de primas en pocos minutos.',
};
---

<Base
  title={titleByLocale[locale]}
  description={descriptionByLocale[locale]}
  canonical={`https://praemienhilfe.ch/${locale}/antrag`}
  locale={locale}
  translationKey="antrag"
  robots="noindex, follow"
  chrome={false}
>
  <AntragFunnel client:load locale={locale} />
</Base>
```

(`robots="noindex, follow"` matches this being a mid-funnel form page, not a page that should rank in search — confirm against the original `antrag.astro`, read in full during this task, for whether it already had `chrome={false}`/`noindex` set; preserve whatever the original had if it differs from this snippet, since this plan's earlier research pass did not capture this file's exact original content.)

- [ ] **Step 6: Build, manual full-funnel walkthrough, commit**

Run: `npm run build` — expect 0 errors.
In dev, complete the full `/en/antrag` flow end to end (choose canton → situation → email → household → income → contact → submit) and confirm every screen is in English, the submit succeeds (check Network tab for a 200 from `/api/submit`), and it redirects to `/en/danke` (the locale-prefixed thank-you page — `/de/danke`, `/en/danke`, `/es/danke` all share the slug `danke` per this plan's Global Constraints). As part of Step 2, grep `AntragFunnel.jsx` for the literal string `'/danke'` and change `window.location.href = '/danke'` to `` window.location.href = `/${locale}/danke`; ``.

```bash
git add src/components/AntragFunnel.jsx src/components/PhoneField.jsx src/pages/\[locale\]/antrag.astro
git commit -m "feat: translate application funnel and phone field to DE/EN/ES"
```

---

### Task 9: Translate `DankeSummary.jsx` and `[locale]/danke.astro`

**Files:**
- Modify: `src/components/DankeSummary.jsx`
- Modify: `src/pages/[locale]/danke.astro`

**Interfaces:**
- Consumes: `useTranslations`/`ui` (Task 3).
- Produces: nothing consumed elsewhere (leaf page).

- [ ] **Step 1: Update `DankeSummary.jsx`**

Add a `locale` prop, `const t = useTranslations(locale);`. Replace:
- `` summary?.firstName ? `Vielen Dank, ${summary.firstName}!` : 'Vielen Dank für Ihre Anfrage!' `` → `` summary?.firstName ? t('danke.thanksNamed', summary.firstName) : t('danke.thanksGeneric') ``
- `'Ein Berater von uns meldet sich innerhalb von 24 Stunden bei Ihnen. Bei Fragen erreichen Sie uns unter'` → `t('danke.body')`
- `'Situation:'` → `t('danke.summary.situation')`
- `'Kanton:'` → `t('danke.summary.canton')`
- `'Haushalt:'` → `t('danke.summary.household')`
- `'Einkommen:'` → `t('danke.summary.income')`
- `'E-Mail:'` → `t('danke.summary.email')`
- `'Sie erhalten in Kürze eine Bestätigung per E-Mail.'` → `t('danke.confirmationNote')`
- `'Zurück zur Startseite'` → `t('danke.backHome')`
- The `href="/"` on the "back home" link → `` href={`/${locale}/`} ``

The phone number link (`tel:+41767790449`, displayed as `+41 76 779 0449`) stays unchanged in every locale — it's contact data, not translatable text.

- [ ] **Step 2: Update `[locale]/danke.astro`**

```astro
---
// src/pages/[locale]/danke.astro
import Base from '../../layouts/Base.astro';
import DankeSummary from '../../components/DankeSummary.jsx';
import { useTranslations } from '../../i18n/useTranslations.js';

const locale = Astro.currentLocale ?? 'de';
const t = useTranslations(locale);
---

<Base
  title={t('danke.title')}
  description={t('danke.description')}
  canonical={`https://praemienhilfe.ch/${locale}/danke`}
  locale={locale}
  translationKey="danke"
  robots="noindex, nofollow"
  chrome={false}
>
  <div class="min-h-screen bg-[#F5F7F8] flex items-center justify-center px-5 py-16">
    <DankeSummary client:load locale={locale} />
  </div>
</Base>
```

- [ ] **Step 3: Build, spot-check, commit**

Run: `npm run build` — expect 0 errors. In dev, submit the funnel at `/es/antrag` and confirm `/es/danke` shows the Spanish thank-you copy with the submitted values.

```bash
git add src/components/DankeSummary.jsx src/pages/\[locale\]/danke.astro
git commit -m "feat: translate thank-you page to DE/EN/ES"
```

---

### Task 10: Translate `kontakt.astro`, `so-funktioniert-es.astro`, `faq.astro`

**Files:**
- Modify: `src/pages/[locale]/kontakt.astro`
- Modify: `src/pages/[locale]/so-funktioniert-es.astro`
- Modify: `src/pages/[locale]/faq.astro`

**Interfaces:**
- Consumes: `national[locale]` (Task 5), `cantons['basel-stadt'][locale]` (Task 6), `useTranslations`/`ui` (Task 3).
- Produces: nothing consumed elsewhere (leaf pages).

- [ ] **Step 1: Update `[locale]/kontakt.astro`**

```astro
---
// src/pages/[locale]/kontakt.astro
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
import { cantons } from '../../data/cantons.js';

const locale = Astro.currentLocale ?? 'de';
const base = cantons['basel-stadt'];
const canton = { ...base, ...base[locale] };

const titleByLocale = {
  de: 'Kontakt | prämienhilfe.ch',
  en: 'Contact | prämienhilfe.ch',
  es: 'Contacto | prämienhilfe.ch',
};
const descriptionByLocale = {
  de: 'Kontaktieren Sie uns für eine kostenlose Prüfung Ihres Anspruchs auf Prämienverbilligung.',
  en: 'Contact us for a free assessment of your eligibility for the premium subsidy.',
  es: 'Contáctenos para una evaluación gratuita de su derecho a la reducción de primas.',
};
---

<Base
  title={titleByLocale[locale]}
  description={descriptionByLocale[locale]}
  canonical={`https://praemienhilfe.ch/${locale}/kontakt`}
  locale={locale}
  translationKey="kontakt"
  activePage="kontakt"
>
  <Hero canton={canton} locale={locale} />
</Base>
```

- [ ] **Step 2: Update `[locale]/so-funktioniert-es.astro`**

```astro
---
// src/pages/[locale]/so-funktioniert-es.astro
import Base from '../../layouts/Base.astro';
import HowItWorks from '../../components/HowItWorks.astro';
import FinalCTA from '../../components/FinalCTA.astro';
import { cantons } from '../../data/cantons.js';
import { national } from '../../data/national.js';

const locale = Astro.currentLocale ?? 'de';
const base = cantons['basel-stadt'];
const canton = { ...base, ...base[locale] };
const content = national[locale];

const titleByLocale = {
  de: 'So funktioniert es | prämienhilfe.ch',
  en: 'How it works | prämienhilfe.ch',
  es: 'Cómo funciona | prämienhilfe.ch',
};
const descriptionByLocale = {
  de: 'So funktioniert die Beantragung der Prämienverbilligung: Anspruch prüfen, Dossier zusammenstellen, Antrag einreichen.',
  en: 'How applying for the premium subsidy works: check eligibility, assemble your file, submit your application.',
  es: 'Cómo funciona la solicitud de la reducción de primas: comprobar el derecho, preparar el expediente, presentar la solicitud.',
};
const heroByLocale = {
  de: { h1: 'So funktioniert die Beantragung', p: 'Von der Prüfung bis zur Einreichung — wir begleiten Sie durch den gesamten Prozess der Prämienverbilligung.' },
  en: { h1: 'How applying works', p: 'From assessment to submission — we guide you through the entire premium subsidy process.' },
  es: { h1: 'Cómo funciona la solicitud', p: 'Desde la evaluación hasta la presentación — le acompañamos durante todo el proceso de la reducción de primas.' },
};
---

<Base
  title={titleByLocale[locale]}
  description={descriptionByLocale[locale]}
  canonical={`https://praemienhilfe.ch/${locale}/so-funktioniert-es`}
  locale={locale}
  translationKey="so-funktioniert-es"
  activePage="ablauf"
>
  <div class="bg-white">
    <div class="max-w-[1240px] mx-auto px-8 pt-16 pb-4">
      <h1 class="text-[32px] md:text-[40px] font-bold tracking-tight m-0">{heroByLocale[locale].h1}</h1>
      <p class="text-base leading-relaxed text-[#3D4A50] mt-5 max-w-[34em]">{heroByLocale[locale].p}</p>
    </div>
  </div>
  <HowItWorks steps={canton.steps} />
  <FinalCTA
    heading={content.finalCta.heading}
    text={content.finalCta.text}
    buttons={[{ label: content.finalCta.buttonLabel, href: '#pruefen' }]}
    disclaimer={content.finalCta.disclaimer}
  />
</Base>
```

- [ ] **Step 3: Update `[locale]/faq.astro`**

```astro
---
// src/pages/[locale]/faq.astro
import Base from '../../layouts/Base.astro';
import FAQ from '../../components/FAQ.astro';
import FinalCTA from '../../components/FinalCTA.astro';
import { cantons } from '../../data/cantons.js';
import { national } from '../../data/national.js';

const locale = Astro.currentLocale ?? 'de';
const base = cantons['basel-stadt'];
const canton = { ...base, ...base[locale] };
const content = national[locale];

const titleByLocale = {
  de: 'Häufige Fragen | prämienhilfe.ch',
  en: 'Frequently Asked Questions | prämienhilfe.ch',
  es: 'Preguntas frecuentes | prämienhilfe.ch',
};
const descriptionByLocale = {
  de: 'Antworten auf häufige Fragen zur Prämienverbilligung: Anspruch, Höhe, Kosten, Bearbeitungsdauer.',
  en: 'Answers to frequently asked questions about the premium subsidy: eligibility, amount, cost, processing time.',
  es: 'Respuestas a las preguntas frecuentes sobre la reducción de primas: derecho, importe, coste, tiempo de tramitación.',
};
---

<Base
  title={titleByLocale[locale]}
  description={descriptionByLocale[locale]}
  canonical={`https://praemienhilfe.ch/${locale}/faq`}
  locale={locale}
  translationKey="faq"
  activePage="faq"
>
  <FAQ canton={canton} />
  <FinalCTA
    heading={content.finalCta.heading}
    text={content.finalCta.text}
    buttons={[{ label: content.finalCta.buttonLabel, href: '#pruefen' }]}
    disclaimer={content.finalCta.disclaimer}
  />
</Base>
```

- [ ] **Step 4: Build, spot-check, commit**

Run: `npm run build` — expect 0 errors. In dev, check `/en/kontakt`, `/en/so-funktioniert-es`, `/en/faq` and their `/es/` equivalents render translated headings/body text with no leftover German.

```bash
git add src/pages/\[locale\]/kontakt.astro src/pages/\[locale\]/so-funktioniert-es.astro src/pages/\[locale\]/faq.astro
git commit -m "feat: translate kontakt, so-funktioniert-es, and faq pages to DE/EN/ES"
```

---

### Task 11: Translate popups/modals (`ExitIntentPopup`, `DisclaimerModal`, `PrivacyPolicyModal`) and `StickyFunnelWidget`

**Files:**
- Modify: `src/components/ExitIntentPopup.jsx`
- Modify: `src/components/DisclaimerModal.jsx`
- Modify: `src/components/PrivacyPolicyModal.jsx`
- Modify: `src/components/StickyFunnelWidget.jsx`

**Interfaces:**
- Consumes: `useTranslations`/`ui` (Task 3).
- Produces: nothing consumed elsewhere (these are all leaf UI islands rendered from `Base.astro`, already updated in Task 4 to pass `locale` into each).

- [ ] **Step 1: Update `ExitIntentPopup.jsx`**

Add `{ locale }` prop, `const t = useTranslations(locale);`. Replace:
- `'Warten Sie — prüfen Sie zuerst Ihren Anspruch!'` → `t('exitPopup.title')`
- `"Viele Berechtigte wissen nicht, dass sie Anspruch auf bis zu CHF 3'000 pro Jahr haben. Die Prüfung dauert nur 20 Minuten."` → `t('exitPopup.body')`
- `'Jetzt prüfen →'` → `t('exitPopup.cta')`
- `'Nein danke, ich verzichte auf meine Verbilligung'` → `t('exitPopup.decline')`

- [ ] **Step 2: Update `DisclaimerModal.jsx`**

Add `{ locale }` prop, `const t = useTranslations(locale);`. Replace:
- `'Wichtiger Hinweis'` → `t('disclaimer.title')`
- `'prämienhilfe.ch ist ein privater und unabhängiger Beratungsservice von EVO Partners GmbH — kein Kantonsamt und keine staatliche Behörde.'` → `t('disclaimer.body1')`
- `'Unsere Hilfe bei der Prämienverbilligung ist für Sie kostenlos.'` → `t('disclaimer.body2')`
- `'Verstanden — Weiter →'` → `t('disclaimer.cta')`

- [ ] **Step 3: Update `StickyFunnelWidget.jsx`**

Add `{ locale }` to the existing `{ activePage }` prop destructure, `const t = useTranslations(locale);`. Replace:
- `'Anspruch prüfen'` → `t('stickyCta.title')`
- `'Kostenlose Prüfung in 20 Min.'` → `t('stickyCta.subtitle')`
- `'Jetzt starten →'` → `t('stickyCta.button')`

The `href` logic (currently `activePage === 'basel-stadt' ? '#funnel' : ...`) needs a `/${locale}` prefix on the two `/#pruefen`-style non-anchor-only branches — the existing ternary's non-home branches (`'/#pruefen'`) become `` `/${locale}/#pruefen` ``.

- [ ] **Step 4: Translate `PrivacyPolicyModal.jsx`**

This is legal/compliance content — per `main-instructions.md`'s own instruction ("Do not modify legal company information... If a legal phrase is ambiguous, keep the original German version and mark it for manual review rather than inventing a translation"), translate the structural labels (section headings, list items) using the pattern below, but flag the whole component for a human legal reviewer before shipping EN/ES, since it describes data-processing purposes and rights under Swiss law.

Add `{ open, onClose, locale }` prop, `const t = useTranslations(locale);` is not sufficient here since none of these strings are UI-generic — add a new content block to `src/data/national.js` instead (it's page-scoped long-form content, matching this task's pattern from Task 5): `privacyModal: { title, responsibleParty: { heading, address }, purpose: { heading, intro, items }, sharing: { heading, body }, retention: { heading, body }, rights: { heading, intro, items, contact }, cookies: { heading, body }, finma: { heading, number }, fullPolicyLink }` with DE values taken verbatim from the current component (read `src/components/PrivacyPolicyModal.jsx` in full during this task — already captured in this plan's research), and EN/ES translations of each string following the same "translate wording only, do not alter substance" rule, keeping the address, email, and FINMA registration number (`F01552602`) identical across all three locales. Mark this sub-step's output with a code comment `// TRANSLATED FROM GERMAN LEGAL SOURCE — HAS NOT BEEN REVIEWED BY LEGAL COUNSEL` at the top of the new `privacyModal` block, and tell the user this explicitly in this task's completion report.

- [ ] **Step 5: Build, spot-check, commit**

Run: `npm run build` — expect 0 errors. In dev, trigger the exit-intent popup (move mouse to top of viewport) and the disclaimer modal (first visit, clear `localStorage`/cookies) on `/en/` and `/es/` and confirm translated copy.

```bash
git add src/components/ExitIntentPopup.jsx src/components/DisclaimerModal.jsx \
  src/components/PrivacyPolicyModal.jsx src/components/StickyFunnelWidget.jsx src/data/national.js
git commit -m "feat: translate popups, disclaimer, and privacy modal to DE/EN/ES"
```

---

### Task 12: Sitemap with hreflang alternates

**Files:**
- Create: `src/pages/sitemap.xml.ts`

**Interfaces:**
- Consumes: `getLocalizedUrls` (Task 4, `src/i18n/pageUrls.js`), `deutschschweizCantons` (`src/data/deutschschweiz.js`, unchanged).
- Produces: nothing consumed elsewhere (leaf route).

- [ ] **Step 1: Write `src/pages/sitemap.xml.ts`**

```ts
// src/pages/sitemap.xml.ts
import { getLocalizedUrls } from '../i18n/pageUrls.js';
import { deutschschweizCantons } from '../data/deutschschweiz.js';

export const prerender = true;

const BASE = 'https://praemienhilfe.ch';
const TRANSLATED_KEYS = ['home', 'basel-stadt', 'basel-landschaft', 'faq', 'so-funktioniert-es', 'kontakt'];

function urlEntry(loc: string, alternates?: { de: string; en: string; es: string }) {
  const links = alternates
    ? Object.entries(alternates)
        .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`)
        .concat(`<xhtml:link rel="alternate" hreflang="x-default" href="${alternates.de}" />`)
        .join('')
    : '';
  return `<url><loc>${loc}</loc>${links}</url>`;
}

export async function GET() {
  const translatedUrls = TRANSLATED_KEYS.map((key) => {
    const alt = getLocalizedUrls(key)!;
    return [urlEntry(alt.de, alt), urlEntry(alt.en, alt), urlEntry(alt.es, alt)].join('');
  }).join('');

  const germanOnlyCantonUrls = deutschschweizCantons
    .filter((c) => c.active)
    .map((c) => urlEntry(`${BASE}/de/${c.slug}`))
    .join('');

  const genericCantonUrls = deutschschweizCantons
    .filter((c) => !c.active)
    .map((c) => urlEntry(`${BASE}/de/${c.slug}`))
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${translatedUrls}${germanOnlyCantonUrls}${genericCantonUrls}
</urlset>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
```

Note: `basel-stadt` and `basel-landschaft` are already `active: true` in `deutschschweizCantons` (see `src/data/deutschschweiz.js`), so `germanOnlyCantonUrls`/`genericCantonUrls` naturally excludes them from being double-listed under the German-only branch — they're covered by `translatedUrls` instead. Verify this with `grep -n "active: true" src/data/deutschschweiz.js` before finalizing (should show exactly `basel-landschaft` and `basel-stadt`).

- [ ] **Step 2: Build and verify**

Run: `npm run build` — expect 0 errors, and confirm `dist/sitemap.xml/index.html` (or `dist/sitemap.xml`, depending on Astro's endpoint output naming) exists and is well-formed XML: `xmllint --noout dist/client/sitemap.xml 2>/dev/null || xmllint --noout dist/sitemap.xml`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/sitemap.xml.ts
git commit -m "feat: add sitemap.xml with hreflang alternates for translated pages"
```

---

### Task 13: Full checklist verification against `main-instructions.md`

**Files:** none created/modified — verification only, fix-forward if issues are found.

**Interfaces:** none.

- [ ] **Step 1: Run the build one final time**

Run: `npm run build`
Expected: exits 0, no warnings about missing translation keys (the `useTranslations` dev-mode check from Task 3 only runs in `import.meta.env.DEV`, so also run `npm run dev` briefly and click through every in-scope page in all three locales to trigger that check at runtime).

- [ ] **Step 2: Walk through `main-instructions.md`'s 20-item QUALITY CHECKS list**

For each item, perform the check and note pass/fail:
1. `/de/` works — visit in browser.
2. `/en/` works — visit in browser.
3. `/es/` works — visit in browser.
4. Browser-language detection works — `curl -sI http://localhost:4321/ -H "Accept-Language: es"` (no cookie) → expect redirect to `/es/`.
5. Saved preference works — set `pv_lang=en` cookie via browser devtools, visit `/`, expect redirect to `/en/` even with a non-English `Accept-Language` header.
6. Manual language switch (desktop) works — click `EN`/`ES`/`DE` links in header nav on a desktop viewport.
7. Manual language switch (mobile) works — same, in the mobile menu panel at a narrow viewport.
8. Switching language retains equivalent page — from `/de/basel-stadt`, click `EN`, expect landing on `/en/basel-stadt`, not `/en/`.
9. Forms submit successfully in every language — repeat Task 8 Step 6's full-funnel walkthrough for `/de/antrag`, `/en/antrag`, `/es/antrag`.
10. Final successful lead reaches conversion success state — confirm `/{locale}/danke` renders after each of the three submissions in Step 9.
11. `AW-18005574565` still fires — open browser devtools Network tab, filter `google`, confirm a request to `googleads.g.doubleclick.net` or similar fires on page load in each locale.
12. Ads tag not duplicated — `grep -c "AW-18005574565" src/layouts/Base.astro` → expect `1`.
13. Existing GA4 events still work — trigger `antrag_form_submit` (submit the form) and check the GA4 DebugView or Network tab `collect` requests show the same event name as before this plan.
14. SEO titles/descriptions exist per language — view page source on each in-scope page × 3 locales, confirm `<title>`/`<meta description>` are present and in the correct language.
15. hreflang is correct — view page source, confirm 4 `<link rel="alternate" hreflang="...">` tags (de/en/es/x-default) on every in-scope page, absent on German-only canton pages.
16. canonical tags are correct — confirm `<link rel="canonical">` on each page self-references its own locale's URL.
17. Sitemap includes translated pages — `curl http://localhost:4321/sitemap.xml | grep -c "hreflang"` → expect a positive count.
18. No redirect loop exists — `curl -sIL http://localhost:4321/` and confirm exactly one redirect (root → `/{locale}/`), not a chain.
19. Unsupported browser languages fall back to German — `curl -sI http://localhost:4321/ -H "Accept-Language: fr-FR"` → expect `location: /de/`.
20. Existing German functionality hasn't regressed — spot-check `/de/` and `/de/basel-stadt` against the pre-plan production site (`main` branch before this plan's first commit) for any visual/copy difference beyond what this plan intentionally changed (the language switcher itself).

- [ ] **Step 3: Report results to the user**

Summarize, per the format `main-instructions.md` itself requests at the end:
- files changed (full list, from `git log --stat` across this plan's commits)
- routing structure (the `[locale]` prefix scheme, fallback behavior, root redirect)
- translation architecture (`src/i18n/ui.js` flat dictionary + per-locale content modules in `src/data/`)
- how browser-language detection works (root redirect route, `Accept-Language` header parsing)
- how manual language preference is stored (`pv_lang` cookie, 1-year expiry)
- confirmation that `AW-18005574565` was preserved (single occurrence, unchanged)
- confirmation that form conversion tracking was preserved (same GA4 event names, same HubSpot payload)
- any text/legal translations that need manual review (flag `PrivacyPolicyModal`'s EN/ES content from Task 11 Step 4 explicitly — it has not been reviewed by legal counsel)
- exact commands to test/build/deploy: `npm run dev` (local), `npm run build && npm run preview` (production build preview), and however this repo currently deploys to Netlify (check `netlify.toml` or the Netlify dashboard's connected-branch settings — not established in this plan's research, verify before reporting).

- [ ] **Step 4: No commit for this task** — it's verification-only. If Step 2 surfaces any failing checklist item, fix it as a small follow-up commit before considering the plan complete, scoped to just that fix.

## Self-Review Notes

- **Spec coverage:** All 8 in-scope pages (home, basel-stadt, basel-landschaft, faq, so-funktioniert-es, kontakt, antrag, danke) have a dedicated task. Routing (Task 1–2), UI strings (Task 3), switcher (Task 4), home content (Task 5), canton content (Task 6), situation picker + funnels (Task 7–8), thank-you (Task 9), remaining pages (Task 10), popups/legal (Task 11), sitemap (Task 12), full checklist (Task 13) — every section of the design doc and every item in `main-instructions.md`'s QUALITY CHECKS list maps to a task or a Task 13 verification step.
- **Known gap flagged, not silently dropped:** `PrivacyPolicyModal` translations (Task 11 Step 4) are explicitly marked as needing legal review before launch — consistent with `main-instructions.md`'s own instruction to flag rather than invent ambiguous legal translations.
- **Deviation flagged, not silently dropped:** `/danke` keeps one slug across locales instead of the instructions' example `/en/thank-you`/`/es/gracias` — documented in the design spec and repeated in Task 8's Global Constraints.
- **Type/name consistency check:** `SITUATIONS`/`situationList` change from bare exports to functions in Task 7 — every later consumer (Task 8's `AntragFunnel.jsx`) is written against the function form, not the old bare-object form. `national[locale]` and `cantons[slug][locale]` shapes are defined once (Tasks 5 and 6 respectively) and referenced identically in Tasks 9 and 10 (`so-funktioniert-es.astro`, `faq.astro`, `kontakt.astro`) — field names (`finalCta.heading`, `finalCta.buttonLabel`, etc.) match between definition and use.
- **Antrag.astro original-content caveat:** Task 8 Step 5 flags that `src/pages/antrag.astro`'s exact original `robots`/`chrome` props weren't captured verbatim during this plan's research pass — the implementer must read the moved file (post-Task-1) before overwriting it, and preserve any settings not explicitly called out as changing.

