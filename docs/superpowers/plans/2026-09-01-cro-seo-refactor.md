# prämienhilfe.ch CRO/SEO Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the deployed prämienhilfe.ch Astro site for CRO/SEO per `instructions.md` (2026-09-01 version): a blocking legal disclaimer, a "trapped" full-page `/antrag` funnel driven by a new situation selector, exit-intent + sticky-widget conversion nudges, company-name/contact-info cleanup, SEO schema/meta work, and Netlify cache headers — while explicitly excluding the fabricated fake-activity social-proof widgets (see Global Constraints).

**Architecture:** Existing static-Astro-plus-one-React-island model is extended to several small, single-purpose React islands (disclaimer modal, exit-intent popup, sticky widget, and a new full funnel for `/antrag`), each mounted conditionally from `Base.astro` via a new `chrome` prop. `/basel-landschaft` is explicitly untouched and keeps the original `Funnel.jsx`.

**Tech Stack:** Astro 7 + `@astrojs/react` + `@astrojs/netlify`, Tailwind v4 (via `@tailwindcss/vite`, config loaded through `@config` in `global.css` — see prior plan's Global Constraints for why this matters), React 19. No new dependencies needed.

## Global Constraints

- Working directory for all file paths below: `/Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch/` (paths given relative to this).
- **Excluded from this plan, by explicit user decision:** instructions.md §4's random "🔴 LIVE N Personen..." counter and §14's "cycles through 3 fake names" floating notification. Both fabricate user activity and are not implemented. No task below builds them.
- Company legal name: **"EVO Partners GmbH"** (user-confirmed correct) replaces "EVO Partners Sàrl" everywhere it appears in source.
- Business stats "+1'000 Dossiers/Jahr", "4.8/5 Kundenbewertung", "FINMA-registriert" are user-confirmed real facts — publish as literal text, no placeholder flagging needed.
- `/basel-landschaft` (`src/pages/basel-landschaft.astro`) and the existing `src/components/Funnel.jsx` are **out of scope** — do not modify either file in this plan.
- Phone number `+41 76 779 0449` and all `tel:` links are removed from: Header topbar, FinalCTA, Footer, Impressum. Email `msegui@evo-partners.ch` and all `mailto:` links removed from Footer and Impressum, but **kept** on Datenschutz (legal contact requirement for data-subject rights under Swiss revDSG — not requested for removal, and removing it would leave the privacy policy without any contact channel).
- Every new interactive element that reads/writes `localStorage` must guard with `typeof window !== 'undefined'` or run only inside `useEffect` (Astro islands can render on the server first).
- Run `npm run build` after every task that touches a `.astro`/`.jsx`/`.js` file and confirm zero errors before committing.
- Tailwind custom colors (unchanged from the existing config): `teal` `#0087A0`/dark `#005F73`/light `#E8F4F8`, `amber` `#F0A500`/light `#FFF8E7`, `swiss.red` `#CC0000`, `swiss.green` `#3D8B37`, `dark` `#1A1A2A`.

---

### Task 1: Content data updates — `cantons.js` (GmbH rename, facts trim, new FAQs, new paragraph)

**Files:**
- Modify: `src/data/cantons.js`

**Interfaces:**
- Produces: updated `cantons['basel-stadt']` shape consumed by `InfoSection.astro`, `FAQ.astro` (Task already-existing consumers, unchanged interface — only content values change).

- [ ] **Step 1: Replace "EVO Partners Sàrl" with "EVO Partners GmbH" in both cantons' FAQ answers**

In `cantons['basel-stadt'].faqs` and `cantons['basel-landschaft'].faqs`, find the FAQ answer containing `'FINMA-registrierter Versicherungsbroker (EVO Partners Sàrl)'` (appears in both canton entries, identical text) and change `Sàrl` to `GmbH` in both occurrences:

```js
a: 'Für Sie entstehen keine direkten Kosten. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners GmbH) und werden nicht direkt von Ihnen vergütet.',
```

(Yes, this touches `basel-landschaft`'s FAQ too — the company-name rename applies "everywhere" per instructions.md §8, unlike the funnel/UI rebuild which is Basel-Stadt-only. Renaming a text string is not a UI/funnel change and doesn't touch the excluded scope.)

- [ ] **Step 2: Trim `basel-stadt.facts` — remove the two income-threshold rows**

Change:
```js
    facts: [
      { k: 'Einkommensgrenze Einzelperson', v: "CHF 49'375" },
      { k: 'Einkommensgrenze 4-Pers.-Haushalt', v: "CHF 97'000" },
      { k: 'Bezüger im Kanton', v: "ca. 30'000" },
      { k: 'Zuständige Stelle', v: 'ASB Basel-Stadt' },
      { k: 'Antragsfrist 2027', v: 'September–31. Dezember 2026' },
    ],
```
to:
```js
    facts: [
      { k: 'Bezüger im Kanton', v: "ca. 30'000" },
      { k: 'Zuständige Stelle', v: 'ASB Basel-Stadt' },
      { k: 'Antragsfrist 2027', v: 'September–31. Dezember 2026' },
    ],
```

- [ ] **Step 3: Add the replacement paragraph to `basel-stadt.infoParagraphs`**

Change:
```js
    infoParagraphs: [
      "Rund 30'000 Personen im Kanton Basel-Stadt erhalten bereits Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt.",
      'Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen.',
    ],
```
to:
```js
    infoParagraphs: [
      "Rund 30'000 Personen im Kanton Basel-Stadt erhalten bereits Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt.",
      'Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen.',
      'Die Einkommensgrenzen variieren je nach Haushaltsgrösse und persönlicher Situation. Viele Personen erhalten Prämienverbilligung, auch wenn sie nicht damit rechnen. Es lohnt sich in jedem Fall, den Anspruch zu prüfen.',
    ],
```

(`InfoSection.astro` already maps every entry in `infoParagraphs` to a `<p>` — no component change needed, this is a pure data addition.)

- [ ] **Step 4: Prepend the two new FAQ items to `basel-stadt.faqs` only**

Change the start of `cantons['basel-stadt'].faqs` from:
```js
    faqs: [
      {
        q: 'Wer hat Anspruch auf Prämienverbilligung?',
```
to:
```js
    faqs: [
      {
        q: 'Wer sind wir?',
        a: "prämienhilfe.ch ist ein Service von EVO Partners GmbH, einem FINMA-registrierten unabhängigen Versicherungsbroker mit Sitz in der Schweiz. Wir sind seit 2020 tätig und haben bereits über 1'000 Dossiers für Prämienverbilligung bearbeitet. Neben der Prämienverbilligung beraten wir unsere Klienten auch zu ihrer gesamten Krankenversicherungssituation, um die beste Abdeckung zum besten Preis zu finden.",
      },
      {
        q: 'Sind Sie ein offizielles Kantonsamt?',
        a: 'Nein. prämienhilfe.ch ist eine private, unabhängige Beratungsplattform. Wir sind kein staatliches Organ. Die Prämienverbilligung kann auch direkt beim Amt für Sozialbeiträge (ASB) Basel-Stadt beantragt werden. Unser Service erleichtert Ihnen den Prozess und prüft gleichzeitig, ob Ihre Versicherungssituation insgesamt optimiert werden kann.',
      },
      {
        q: 'Wer hat Anspruch auf Prämienverbilligung?',
```
(Leave the rest of the `basel-stadt.faqs` array — and all of `basel-landschaft.faqs` — unchanged, other than the Step 1 GmbH rename.)

Do **not** touch `basel-landschaft`'s `facts`, `infoParagraphs`, or `faqs` array structure beyond the Step 1 rename — that canton page is out of scope.

- [ ] **Step 5: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
node -e "
const { cantons } = await import('./src/data/cantons.js');
const bs = cantons['basel-stadt'];
console.log('facts count (expect 3):', bs.facts.length);
console.log('faqs count (expect 7):', bs.faqs.length);
console.log('first faq:', bs.faqs[0].q);
console.log('GmbH present:', bs.faqs.some(f => f.a.includes('EVO Partners GmbH')));
console.log('Sàrl gone:', !JSON.stringify(cantons).includes('Sàrl'));
"
npm run build
```
Expected: `facts count (expect 3): 3`, `faqs count (expect 7): 7`, `first faq: Wer sind wir?`, `GmbH present: true`, `Sàrl gone: true`, build succeeds.

- [ ] **Step 6: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/data/cantons.js
git commit -m "feat: update canton content — GmbH rename, trim income facts, add who-we-are FAQs"
```

---

### Task 2: Phone/email removal + GmbH rename — Header, Footer, FinalCTA, Impressum

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/FinalCTA.astro`
- Modify: `src/pages/impressum.astro`

**Interfaces:**
- No prop/interface changes — these are content-only edits to existing static components.

- [ ] **Step 1: Header.astro — remove topbar phone link**

Change:
```astro
<div class="bg-dark text-white">
  <div class="max-w-[1240px] mx-auto px-8 py-2 flex items-center justify-between gap-4 text-xs">
    <div class="text-[#C7CFD3]">Ein unabhängiger Beratungsservice</div>
    <a href="tel:+41767790449" class="hidden md:inline text-white font-medium">+41 76 779 0449</a>
  </div>
</div>
```
to:
```astro
<div class="bg-dark text-white">
  <div class="max-w-[1240px] mx-auto px-8 py-2 flex items-center justify-center gap-4 text-xs">
    <div class="text-[#C7CFD3]">Ein unabhängiger Beratungsservice</div>
  </div>
</div>
```
(Changed `justify-between` to `justify-center` since there's now only one item — keeps the bar visually balanced instead of pinned left with dead space.)

- [ ] **Step 2: FinalCTA.astro — replace phone button with a scroll-to-form CTA**

Change:
```astro
        <a
          href="tel:+41767790449"
          class="flex items-center justify-center gap-2.5 px-5 py-[17px] bg-transparent text-white border border-white/60 rounded-md text-[16.5px] font-semibold no-underline hover:bg-white/10"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z"></path>
          </svg>
          <span>+41 76 779 0449</span>
        </a>
```
to:
```astro
        <a
          href="#pruefen"
          class="flex items-center justify-center gap-2.5 px-5 py-[17px] bg-transparent text-white border border-white/60 rounded-md text-[16.5px] font-semibold no-underline hover:bg-white/10"
        >
          Formular ausfüllen →
        </a>
```

- [ ] **Step 3: Footer.astro — remove phone/email from Kontakt column, simplify to 3 links; remove phone/email from company blurb line already absent (only appears in Kontakt column and legal bar); rename Sàrl→GmbH**

Change:
```astro
        <div>
          <div class="text-xs font-semibold tracking-wide uppercase text-[#6EC5D4]">Kontakt</div>
          <div class="grid gap-2.5 mt-4 text-sm">
            <a href="/#pruefen" class="text-[#D8DEE1] hover:text-white">Antrag stellen</a>
            <a href="/kontakt" class="text-[#D8DEE1] hover:text-white">Rückruf anfordern</a>
            <a href="/kontakt" class="text-[#D8DEE1] hover:text-white">Kontaktformular</a>
            <a href="tel:+41767790449" class="text-[#D8DEE1] hover:text-white">+41 76 779 0449</a>
            <a href="mailto:msegui@evo-partners.ch" class="text-[#D8DEE1] hover:text-white">msegui@evo-partners.ch</a>
          </div>
        </div>
```
to:
```astro
        <div>
          <div class="text-xs font-semibold tracking-wide uppercase text-[#6EC5D4]">Kontakt</div>
          <div class="grid gap-2.5 mt-4 text-sm">
            <a href="#pruefen" class="text-[#D8DEE1] hover:text-white">Antrag stellen</a>
            <a href="/kontakt" class="text-[#D8DEE1] hover:text-white">Rückruf anfordern</a>
            <a href="/kontakt" class="text-[#D8DEE1] hover:text-white">Kontaktformular</a>
          </div>
        </div>
```

Then, still in `Footer.astro`, rename the two "Sàrl" occurrences to "GmbH":
```astro
        <p class="text-[13px] leading-relaxed text-[#9AA6AC] mt-4">Betrieben von:<br>EVO Partners GmbH<br>FINMA-registrierter Versicherungsbroker<br>Zürich, Schweiz</p>
```
and:
```astro
      © {year} prämienhilfe.ch — Ein Service von EVO Partners GmbH, Zürich. Alle Rechte vorbehalten. Diese Plattform ist kein offizielles Kantonsorgan.
```

- [ ] **Step 4: Impressum.astro — remove Kontakt block's phone/email, rename Sàrl→GmbH**

Change:
```astro
  description="Impressum und rechtliche Hinweise zu prämienhilfe.ch, einem Service von EVO Partners Sàrl."
```
to:
```astro
  description="Impressum und rechtliche Hinweise zu prämienhilfe.ch, einem Service von EVO Partners GmbH."
```

Change:
```astro
        <div>
          <div class="font-semibold text-dark">Betreiberin</div>
          <p class="mt-1">EVO Partners Sàrl<br />FINMA-registrierter Versicherungsbroker<br />Zürich, Schweiz</p>
        </div>
        <div>
          <div class="font-semibold text-dark">Kontakt</div>
          <p class="mt-1">
            Telefon: <a href="tel:+41767790449" class="text-teal">+41 76 779 0449</a><br />
            E-Mail: <a href="mailto:msegui@evo-partners.ch" class="text-teal">msegui@evo-partners.ch</a>
          </p>
        </div>
```
to:
```astro
        <div>
          <div class="font-semibold text-dark">Betreiberin</div>
          <p class="mt-1">EVO Partners GmbH<br />FINMA-registrierter Versicherungsbroker<br />Zürich, Schweiz</p>
        </div>
```
(The entire "Kontakt" block is removed, not just its links — instructions.md's Impressum section says "Remove phone and email," and with both gone there's no remaining content for that block.)

- [ ] **Step 5: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
grep -rn "767790449\|msegui@evo-partners\|Sàrl" src/components/Header.astro src/components/Footer.astro src/components/FinalCTA.astro src/pages/impressum.astro
```
Expected: no output (all four files clean of phone/email/Sàrl).

```bash
npm run build
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/components/Header.astro praemienhilfe.ch/src/components/Footer.astro praemienhilfe.ch/src/components/FinalCTA.astro praemienhilfe.ch/src/pages/impressum.astro
git commit -m "feat: remove phone/email from header, footer, final CTA, impressum; rename Sàrl to GmbH"
```

---

### Task 3: Datenschutz — GmbH rename, keep email, add /antrag data-collection note

**Files:**
- Modify: `src/pages/datenschutz.astro`

- [ ] **Step 1: Rename Sàrl → GmbH (email stays, per Global Constraints)**

Change:
```astro
          <p class="mt-1">
            EVO Partners Sàrl, Zürich, Schweiz (<a href="mailto:msegui@evo-partners.ch" class="text-teal">msegui@evo-partners.ch</a>)
          </p>
```
to:
```astro
          <p class="mt-1">
            EVO Partners GmbH, Zürich, Schweiz (<a href="mailto:msegui@evo-partners.ch" class="text-teal">msegui@evo-partners.ch</a>)
          </p>
```

- [ ] **Step 2: Add a paragraph describing the `/antrag` funnel's staged data collection**

Change the "Welche Daten wir erheben" block from:
```astro
        <div>
          <div class="font-semibold text-dark">Welche Daten wir erheben</div>
          <p class="mt-1">
            Wenn Sie unser Formular ausfüllen, erheben wir Vorname, Nachname, Telefonnummer, E-Mail-Adresse sowie Ihre
            Angaben zu Kanton, Haushaltseinkommen und Haushaltsgrösse. Zusätzlich erfassen wir technische
            Marketing-Attributionsdaten (UTM-Parameter) zur Nachverfolgung, über welchen Kanal Sie zu uns gefunden
            haben.
          </p>
        </div>
```
to:
```astro
        <div>
          <div class="font-semibold text-dark">Welche Daten wir erheben</div>
          <p class="mt-1">
            Wenn Sie unser Formular ausfüllen, erheben wir Vorname, Nachname, Telefonnummer, E-Mail-Adresse sowie Ihre
            Angaben zu Kanton, Haushaltseinkommen und Haushaltsgrösse. Zusätzlich erfassen wir technische
            Marketing-Attributionsdaten (UTM-Parameter) zur Nachverfolgung, über welchen Kanal Sie zu uns gefunden
            haben.
          </p>
          <p class="mt-3">
            Im Antragsformular unter /antrag erfassen wir Ihre Angaben schrittweise: zunächst Ihre E-Mail-Adresse,
            danach Haushaltsgrösse und Einkommensbereich, und zuletzt Ihre Kontaktdaten (Vorname, Nachname,
            Telefonnummer). Die Angabe Ihrer Kontaktdaten setzt Ihre ausdrückliche Einwilligung per Checkbox voraus.
          </p>
        </div>
```

- [ ] **Step 3: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
grep -n "Sàrl" src/pages/datenschutz.astro
grep -n "msegui@evo-partners.ch" src/pages/datenschutz.astro
npm run build
```
Expected: first grep has no output (Sàrl gone), second grep shows 2 matches (email intentionally kept), build succeeds.

- [ ] **Step 4: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/pages/datenschutz.astro
git commit -m "feat: update Datenschutz — GmbH rename, document /antrag data collection stages"
```

---

### Task 4: `Base.astro` — `chrome` prop, `schema` prop, preconnect links, smooth-scroll script

**Files:**
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Produces: `Base` now accepts `chrome?: boolean` (default `true`) and `schema?: object[]` (default `[]`, optional array of JSON-LD objects). When `chrome` is `false`, `Header`, `Footer`, the mobile sticky CTA bar, and the three new islands (Tasks 5–7) are not rendered.
- Consumes (added in this task, but the islands themselves are built in Tasks 5–7 — write the imports now and they'll resolve once those files exist; if executing tasks out of order, this task must run after Tasks 5–7, or the build will fail on missing imports — **recommended order: do this task last among Tasks 4–8**, or stub the three imports and fill them in as those tasks land). To keep task-by-task buildability, this task's Step 1 below defers the three new island imports to Task 8, and only adds `chrome`/`schema`/preconnect/smooth-scroll here. Task 8 adds the island mounts.

- [ ] **Step 1: Add `chrome` and `schema` props, preconnect links, smooth-scroll script; make Header/Footer/sticky-CTA conditional on `chrome`**

Replace the full file content of `src/layouts/Base.astro` with:

```astro
---
// src/layouts/Base.astro
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

export interface Props {
  title: string;
  description: string;
  canonical: string;
  activePage?: 'home' | 'basel-stadt' | 'basel-landschaft' | 'ablauf' | 'faq' | 'kontakt';
  chrome?: boolean;
  schema?: Record<string, unknown>[];
}

const { title, description, canonical, activePage = 'home', chrome = true, schema = [] } = Astro.props;
const ga4Id = import.meta.env.PUBLIC_GA4_ID || 'G-XXXXXXXX';
---

<!doctype html>
<html lang="de-CH">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:locale" content="de_CH" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
    <script define:vars={{ ga4Id }}>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id);
    </script>

    {schema.map((block) => <script type="application/ld+json" set:html={JSON.stringify(block)} />)}
  </head>
  <body>
    <div id="top"></div>
    {chrome && <Header activePage={activePage} />}
    <slot />
    {chrome && <Footer />}

    {
      chrome && (
        <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 border-t border-[#E2E8EA]">
          <a
            href="/#pruefen"
            class="block text-center px-5 py-3.5 bg-teal text-white rounded-md text-base font-bold no-underline"
          >
            Antrag prüfen lassen →
          </a>
        </div>
      )
    }

    <script>
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
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

Note on the `set:html={JSON.stringify(block)}` use for JSON-LD: this is Astro's documented, safe pattern for injecting a `<script type="application/ld+json">` body — the content is machine-generated JSON from our own `schema` prop (never raw user input), so this is not an XSS risk; Astro's default auto-escaping is what we're deliberately opting out of here, for this one well-understood, low-risk case.

- [ ] **Step 2: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npx astro check
npm run build
```
Expected: no errors referencing `Base.astro` (pre-existing errors elsewhere unrelated to this file are not your concern). Every existing page still builds since `chrome` defaults to `true` and `schema` defaults to `[]` — no caller needs updating yet.

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/layouts/Base.astro
git commit -m "feat: add chrome/schema props, preconnect links, smooth-scroll script to Base layout"
```

---

### Task 5: `DisclaimerModal.jsx` + shared `disclaimer.js` helper

**Files:**
- Create: `src/lib/disclaimer.js`
- Create: `src/components/DisclaimerModal.jsx`

**Interfaces:**
- Produces: `isDisclaimerDue(): boolean` and `markDisclaimerShown(): void` from `src/lib/disclaimer.js` (consumed by this task's `DisclaimerModal.jsx` and by Task 6's `ExitIntentPopup.jsx`).
- Produces: default-exported `DisclaimerModal()` React component, no props, mounted in Task 8.

- [ ] **Step 1: Write the shared localStorage helper**

```js
// src/lib/disclaimer.js
const KEY = 'disclaimer_shown';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function isDisclaimerDue() {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(KEY);
  if (!stored) return true;
  const ts = Number(stored);
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > SEVEN_DAYS_MS;
}

export function markDisclaimerShown() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, String(Date.now()));
}
```

- [ ] **Step 2: Write the modal component**

```jsx
// src/components/DisclaimerModal.jsx
import { useState, useEffect } from 'react';
import { isDisclaimerDue, markDisclaimerShown } from '../lib/disclaimer.js';

export default function DisclaimerModal() {
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const due = isDisclaimerDue();
    setVisible(due);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  function dismiss() {
    markDisclaimerShown();
    setVisible(false);
  }

  if (!checked || !visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-dark/60 flex items-center justify-center p-4 md:p-6">
      <div className="w-full h-full md:h-auto md:max-w-lg bg-white rounded-none md:rounded-xl shadow-xl overflow-y-auto flex flex-col">
        <div className="px-7 pt-7 pb-2 flex items-center gap-2.5 text-sm font-semibold text-teal">
          <span>🔒</span>
          <span>Sicheres Formular</span>
        </div>

        <div className="px-7 pt-3 flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#0087A0"></rect>
            <rect x="14" y="14" width="24" height="24" rx="6" fill="#F0A500"></rect>
            <rect x="14" y="14" width="12" height="12" fill="#005F73"></rect>
          </svg>
          <span className="text-[17px] font-bold text-dark">
            prämienhilfe<span className="text-teal">.ch</span>
          </span>
        </div>

        <div className="px-7 pt-5">
          <div className="text-xl font-bold text-dark tracking-tight">Wichtiger Hinweis</div>
          <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-3">
            prämienhilfe.ch ist ein privater und unabhängiger Beratungsservice, betrieben von EVO Partners GmbH, einem
            FINMA-registrierten Versicherungsbroker. Wir sind weder ein Kantonsamt noch eine staatliche Behörde.
          </p>
          <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-3 font-semibold">Unser Service umfasst:</p>
          <ul className="mt-2 grid gap-1.5 text-[14.5px] leading-relaxed text-[#3D4A50]">
            <li className="flex items-start gap-2">
              <span className="text-swiss-green font-bold">✓</span>
              <span>Prüfung Ihres Anspruchs auf Prämienverbilligung</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-swiss-green font-bold">✓</span>
              <span>Zusammenstellung und Einreichung Ihres Dossiers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-swiss-green font-bold">✓</span>
              <span>Unabhängige Beratung zu Ihrer Krankenversicherung</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-swiss-green font-bold">✓</span>
              <span>Optimierung Ihrer Versicherungssituation</span>
            </li>
          </ul>
          <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-3">
            Die Hilfe bei der Prämienverbilligung ist für Sie kostenlos. Unsere Vergütung erfolgt ausschliesslich
            durch Versicherungspartner im Rahmen unserer Brokertätigkeit.
          </p>
          <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-3">
            Der Antrag auf Prämienverbilligung kann auch eigenständig beim zuständigen Kantonsamt gestellt werden.
          </p>
        </div>

        <div className="px-7 mt-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-dark">+1'000</div>
            <div className="text-[11px] text-[#6B7A80] mt-0.5">Dossiers/Jahr</div>
          </div>
          <div>
            <div className="text-lg font-bold text-dark">FINMA</div>
            <div className="text-[11px] text-[#6B7A80] mt-0.5">Registriert</div>
          </div>
          <div>
            <div className="text-lg font-bold text-dark">4.8/5</div>
            <div className="text-[11px] text-[#6B7A80] mt-0.5">Kundenbewertung</div>
          </div>
        </div>

        <div className="px-7 pt-6 pb-4">
          <button
            type="button"
            onClick={dismiss}
            className="w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16px] font-bold cursor-pointer hover:bg-teal-dark"
          >
            Ich habe gelesen und verstanden — Weiter →
          </button>
          <div className="text-center mt-3">
            <a
              href="https://asb.bs.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12.5px] text-[#6B7A80] hover:text-teal"
            >
              Direkt zum offiziellen Kantonsamt (asb.bs.ch) ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Note: there's intentionally no overlay `onClick` handler — clicking the dark backdrop does nothing, matching "Cannot be closed by clicking outside."

- [ ] **Step 2: Manual verification (this component has no page to mount on yet — Task 8 wires it in). Do a syntax sanity pass now:**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
node --experimental-vm-modules -e "1" 2>/dev/null; echo "skip: full verification happens in Task 8 once mounted on a real page"
npx astro check
```
Expected: `astro check` reports no errors referencing these two new files (they aren't imported anywhere yet, so this mostly confirms no syntax errors astro's checker can see from the file alone; the authoritative check is Task 8's live browser walkthrough).

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/lib/disclaimer.js praemienhilfe.ch/src/components/DisclaimerModal.jsx
git commit -m "feat: add DisclaimerModal island and shared disclaimer localStorage helper"
```

---

### Task 6: `ExitIntentPopup.jsx`

**Files:**
- Create: `src/components/ExitIntentPopup.jsx`

**Interfaces:**
- Consumes: `isDisclaimerDue` from `src/lib/disclaimer.js` (Task 5).
- Produces: default-exported `ExitIntentPopup()` React component, no props, mounted in Task 8.

- [ ] **Step 1: Write the component**

```jsx
// src/components/ExitIntentPopup.jsx
import { useState, useEffect, useRef } from 'react';
import { isDisclaimerDue } from '../lib/disclaimer.js';

const KEY = 'exit_shown';

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const armedRef = useRef(false);

  useEffect(() => {
    function handleMouseLeave(e) {
      if (!armedRef.current) return;
      if (e.clientY >= 10) return;
      if (typeof window === 'undefined') return;
      if (window.localStorage.getItem(KEY)) return;
      if (isDisclaimerDue()) return;
      window.localStorage.setItem(KEY, 'true');
      setVisible(true);
    }

    // Arm after a tick so the disclaimer (if any) has a chance to render first
    // and so a mouseleave firing during initial page load doesn't trigger this.
    const armTimer = setTimeout(() => {
      armedRef.current = true;
    }, 1500);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  function goToFunnel() {
    setVisible(false);
    const target = document.querySelector('#pruefen');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-dark/50 flex items-center justify-center p-4"
      onClick={() => setVisible(false)}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl px-6 pt-6 pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-bold text-dark tracking-tight">
          Warten Sie — prüfen Sie zuerst Ihren Anspruch!
        </div>
        <p className="text-[14px] leading-relaxed text-[#3D4A50] mt-2.5">
          Viele Berechtigte wissen nicht, dass sie Anspruch auf bis zu CHF 3'000 pro Jahr haben. Die Prüfung dauert
          nur 20 Minuten.
        </p>
        <button
          type="button"
          onClick={goToFunnel}
          className="mt-4 w-full px-5 py-3.5 bg-teal text-white border-0 rounded-md text-[15px] font-bold cursor-pointer hover:bg-teal-dark"
        >
          Jetzt prüfen →
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="mt-3 w-full text-center text-[12.5px] text-[#8A979C] bg-transparent border-0 cursor-pointer hover:text-[#6B7A80]"
        >
          Nein danke, ich verzichte auf meine Verbilligung
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Sanity check**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npx astro check
```
Expected: no errors referencing this file.

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/components/ExitIntentPopup.jsx
git commit -m "feat: add ExitIntentPopup island"
```

---

### Task 7: `StickyFunnelWidget.jsx`

**Files:**
- Create: `src/components/StickyFunnelWidget.jsx`

**Interfaces:**
- Produces: default-exported `StickyFunnelWidget()` React component, no props, mounted in Task 8.

- [ ] **Step 1: Write the component**

```jsx
// src/components/StickyFunnelWidget.jsx
import { useState, useEffect } from 'react';

export default function StickyFunnelWidget() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('#pruefen');
    if (!hero) {
      setPastHero(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPastHero(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!pastHero) return null;

  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-30 w-72 bg-white rounded-xl shadow-xl border border-[#E2E8EA] px-5 pt-4 pb-4">
      <div className="text-[15px] font-bold text-dark tracking-tight">Anspruch prüfen</div>
      <div className="text-[13px] text-[#6B7A80] mt-1">Kostenlose Prüfung in 20 Min.</div>
      <a
        href="/#pruefen"
        className="mt-3 block text-center px-4 py-2.5 bg-teal text-white rounded-md text-[14px] font-semibold no-underline hover:bg-teal-dark"
      >
        Jetzt starten →
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Sanity check**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npx astro check
```

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/components/StickyFunnelWidget.jsx
git commit -m "feat: add StickyFunnelWidget island"
```

---

### Task 8: Wire the 3 new islands into `Base.astro`

**Files:**
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Consumes: `DisclaimerModal` (Task 5), `ExitIntentPopup` (Task 6), `StickyFunnelWidget` (Task 7).

- [ ] **Step 1: Import and mount the three islands, conditional on `chrome`**

In `src/layouts/Base.astro`, add these three imports near the top of the frontmatter (after the existing `Header`/`Footer` imports):

```astro
import DisclaimerModal from '../components/DisclaimerModal.jsx';
import ExitIntentPopup from '../components/ExitIntentPopup.jsx';
import StickyFunnelWidget from '../components/StickyFunnelWidget.jsx';
```

Then, inside `<body>`, right after the mobile-sticky-CTA conditional block (still inside the `chrome &&` gating, but as separate sibling blocks so each island mounts independently), add:

```astro
    {chrome && <DisclaimerModal client:load />}
    {chrome && <ExitIntentPopup client:load />}
    {chrome && <StickyFunnelWidget client:idle />}
```

Place these three lines immediately before the closing `<script>` (smooth-scroll) tag added in Task 4, so the final `<body>` structure is: `<div id="top">`, conditional `Header`, `<slot />`, conditional `Footer`, conditional mobile-sticky-CTA div, the three conditional islands, then the smooth-scroll `<script>`.

- [ ] **Step 2: Build and browser-verify on the existing homepage (still `chrome=true` by default)**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: zero errors.

Then start `npm run dev` and use the browser automation tools to visit `/`:
- Confirm the disclaimer modal appears immediately, blocking the page (verify the background doesn't scroll while it's open).
- Click "Ich habe gelesen und verstanden — Weiter →" — modal disappears.
- Reload the page — modal does NOT reappear (localStorage gate working).
- Open a fresh Incognito-style check isn't available via the extension, so instead: run `localStorage.removeItem('disclaimer_shown')` via the browser tools' JS execution (if available) or clear site data, reload, confirm modal reappears — this proves the localStorage key is the actual gate, not some other caching effect.
- Scroll down past the hero `#pruefen` section — confirm the `StickyFunnelWidget` appears bottom-right (desktop viewport only; note if the viewport tool can't get narrow enough to double check it's hidden on mobile, as prior tasks noted this browser-tool limitation — state that clearly rather than skipping the check).
- For exit-intent: since real mouse-leave-the-window events are hard to simulate via automation, dispatch a synthetic `mouseleave` event with `clientY: 0` on `document` via the browser tools' JS execution capability, after waiting >1.5s for the arm timer; confirm the exit popup appears. If the browser tool can't dispatch synthetic events, state that clearly and note it as unverified-by-browser (the code path was still reviewed).

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/layouts/Base.astro
git commit -m "feat: mount DisclaimerModal, ExitIntentPopup, StickyFunnelWidget in Base layout"
```

---

### Task 9: Shared `situations.js` data + `SituationSelector.astro` + `Hero.astro` fork

**Files:**
- Create: `src/data/situations.js`
- Create: `src/components/SituationSelector.astro`
- Modify: `src/components/Hero.astro`

**Interfaces:**
- Produces: `SITUATIONS` (object keyed by slug: `{ icon, label }`) and `situationList` (array of `{ slug, icon, label }`) from `src/data/situations.js` — consumed by `SituationSelector.astro` here and by `AntragFunnel.jsx` in Task 10.
- Produces: `Hero` gains a `useSituationFunnel?: boolean` prop (default `true`). When `true`, renders `SituationSelector` instead of `<Funnel client:load defaultCanton={defaultCanton} />`, and shows the new SEO-optimized H1. When `false` (only `basel-landschaft.astro` will pass this), behavior is byte-identical to the current `Hero.astro` — same old H1, same `<Funnel>` island.

- [ ] **Step 1: Write the shared situations data**

```js
// src/data/situations.js
export const SITUATIONS = {
  einzelperson: { icon: '👤', label: 'Einzelperson' },
  familie: { icon: '👨‍👩‍👧', label: 'Familie mit Kindern' },
  paar: { icon: '💑', label: 'Paar ohne Kinder' },
  student: { icon: '🎓', label: 'Student / Auszubildende' },
  getrennt: { icon: '💔', label: 'Getrennt / Geschieden' },
  rentner: { icon: '👴', label: 'Rentner / Pensionierte' },
};

export const situationList = Object.entries(SITUATIONS).map(([slug, v]) => ({ slug, ...v }));
```

- [ ] **Step 2: Write `SituationSelector.astro`**

```astro
---
// src/components/SituationSelector.astro
import { situationList } from '../data/situations.js';
---

<div class="mt-8 bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7">
  <div class="text-xl font-bold mb-4 tracking-tight">Was beschreibt Ihre Situation am besten?</div>
  <div class="grid gap-2.5">
    {
      situationList.map((s) => (
        <a
          href={`/antrag?situation=${s.slug}`}
          onclick={`if (window.gtag) window.gtag('event', 'antrag_situation_selected', { situation: '${s.slug}' })`}
          class="w-full flex items-center justify-between gap-4 text-left rounded-md text-[15.5px] font-medium text-dark bg-white border border-[#D6DFE2] px-[18px] py-[15px] no-underline transition-colors hover:border-teal hover:bg-teal-light"
        >
          <span class="flex items-center gap-3.5">
            <span class="text-lg leading-none">{s.icon}</span>
            <span>{s.label}</span>
          </span>
          <span class="text-teal font-bold">→</span>
        </a>
      ))
    }
  </div>
</div>
```

- [ ] **Step 3: Fork `Hero.astro` behind `useSituationFunnel`**

Replace the frontmatter and the funnel-mount line in `src/components/Hero.astro`. Change:
```astro
---
// src/components/Hero.astro
import { Image } from 'astro:assets';
import Funnel from './Funnel.jsx';
import heroPhoto from '../assets/hero-photo.jpg';

export interface Props {
  canton: { name: string; heroProof: string };
  defaultCanton?: string;
}
const { canton, defaultCanton } = Astro.props;
---
```
to:
```astro
---
// src/components/Hero.astro
import { Image } from 'astro:assets';
import Funnel from './Funnel.jsx';
import SituationSelector from './SituationSelector.astro';
import heroPhoto from '../assets/hero-photo.jpg';

export interface Props {
  canton: { name: string; heroProof: string };
  defaultCanton?: string;
  useSituationFunnel?: boolean;
}
const { canton, defaultCanton, useSituationFunnel = true } = Astro.props;
---
```

Change the H1:
```astro
        <h1 class="text-[32px] md:text-[48px] leading-[1.08] font-bold tracking-tight m-0">
          Haben Sie Anspruch auf Prämienverbilligung?
        </h1>
```
to:
```astro
        <h1 class="text-[32px] md:text-[48px] leading-[1.08] font-bold tracking-tight m-0">
          {useSituationFunnel ? 'Prämienverbilligung Basel-Stadt — Anspruch prüfen und Antrag stellen' : 'Haben Sie Anspruch auf Prämienverbilligung?'}
        </h1>
```

Change the funnel mount:
```astro
        <Funnel client:load defaultCanton={defaultCanton} />
```
to:
```astro
        {useSituationFunnel ? <SituationSelector /> : <Funnel client:load defaultCanton={defaultCanton} />}
```

- [ ] **Step 4: Verify `basel-landschaft.astro` is unaffected**

`basel-landschaft.astro` currently calls `<Hero canton={canton} defaultCanton="Basel-Landschaft" />` with no `useSituationFunnel` prop, so it gets the new default `true` — **this would incorrectly switch it to the situation selector**, violating the "leave basel-landschaft untouched" constraint. Fix this by explicitly passing `useSituationFunnel={false}` in `src/pages/basel-landschaft.astro`:

Change:
```astro
  <Hero canton={canton} defaultCanton="Basel-Landschaft" />
```
to:
```astro
  <Hero canton={canton} defaultCanton="Basel-Landschaft" useSituationFunnel={false} />
```

- [ ] **Step 5: Build and verify**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: zero errors.

Start `npm run dev`, use browser tools to check:
- `/` and `/basel-stadt`: new H1 text, `SituationSelector` renders 6 rows with icons, no old canton-picker funnel visible.
- `/basel-landschaft`: unchanged — old H1 ("Haben Sie Anspruch auf Prämienverbilligung?"), old `Funnel` island starting at step 2 with Basel-Landschaft pre-selected, exactly as before this refactor.
- `/kontakt`: also gets the new `SituationSelector` (it uses `Hero` with the same default) — confirm this renders sensibly (this is an intentional, reasonable extrapolation beyond instructions.md's explicit checklist, since `Hero` is shared code — note this in your task report).
- Click one situation row (e.g. "Familie mit Kindern") — confirm the browser navigates to `/antrag?situation=familie` (this will 404 or show a blank/broken page until Task 12 creates `antrag.astro` — that's expected at this point in the plan; just confirm the URL and query param are correct).

- [ ] **Step 6: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/data/situations.js praemienhilfe.ch/src/components/SituationSelector.astro praemienhilfe.ch/src/components/Hero.astro praemienhilfe.ch/src/pages/basel-landschaft.astro
git commit -m "feat: add situation selector, fork Hero to keep basel-landschaft on the old funnel"
```

---

### Task 10: `api/submit.js` — add `situation` field to the HubSpot payload

**Files:**
- Modify: `src/pages/api/submit.js`

**Interfaces:**
- No change to the route's request/response contract (still `firstName`/`lastName`/`phone`/`email`/`canton` required, 400/500/200 responses unchanged). Just accepts and forwards one additional optional field.

- [ ] **Step 1: Add `situation` to the HubSpot fields array**

Change:
```js
  const hubspotPayload = {
    fields: [
      { name: 'firstname', value: data.firstName },
      { name: 'lastname', value: data.lastName },
      { name: 'phone', value: data.phone },
      { name: 'email', value: data.email },
      { name: 'canton', value: data.canton },
      { name: 'income_range', value: data.income || '' },
      { name: 'household_type', value: data.household || '' },
      { name: 'lead_source', value: 'praemienhilfe.ch' },
      { name: 'utm_source', value: data.utm_source || '' },
      { name: 'utm_medium', value: data.utm_medium || '' },
      { name: 'utm_campaign', value: data.utm_campaign || '' },
      { name: 'utm_content', value: data.utm_content || '' },
    ],
```
to:
```js
  const hubspotPayload = {
    fields: [
      { name: 'firstname', value: data.firstName },
      { name: 'lastname', value: data.lastName },
      { name: 'phone', value: data.phone },
      { name: 'email', value: data.email },
      { name: 'canton', value: data.canton },
      { name: 'income_range', value: data.income || '' },
      { name: 'household_type', value: data.household || '' },
      { name: 'situation', value: data.situation || '' },
      { name: 'lead_source', value: 'praemienhilfe.ch' },
      { name: 'utm_source', value: data.utm_source || '' },
      { name: 'utm_medium', value: data.utm_medium || '' },
      { name: 'utm_campaign', value: data.utm_campaign || '' },
      { name: 'utm_content', value: data.utm_content || '' },
    ],
```

- [ ] **Step 2: Verify with curl (mirrors the original endpoint test pattern)**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run dev &
sleep 3
curl -s -X POST http://localhost:4321/api/submit \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","phone":"+41791234567","email":"test@example.com","canton":"Basel-Stadt","situation":"familie","income":"CHF 2000 – 4000","household":"3 Personen"}'
kill %1
```
Expected: `{"error":"Failed"}` with HTTP 500 (since `HUBSPOT_PORTAL_ID`/`FORM_ID` are empty in dev — this confirms the route parses and attempts the request without crashing, same as the original endpoint's verification).

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/pages/api/submit.js
git commit -m "feat: forward situation field to HubSpot in /api/submit"
```

---

### Task 11: `AntragFunnel.jsx` (the full-page trapped funnel)

**Files:**
- Create: `src/components/AntragFunnel.jsx`

**Interfaces:**
- Consumes: `SITUATIONS` from `src/data/situations.js` (Task 9); posts to `/api/submit` (Task 10's updated contract).
- Produces: default-exported `AntragFunnel()` React component, no props (reads `?situation=` from the URL itself), mounted in Task 12's `antrag.astro`.

- [ ] **Step 1: Write the component**

```jsx
// src/components/AntragFunnel.jsx
import { useState, useEffect } from 'react';
import { SITUATIONS } from '../data/situations.js';

const INCOME_OPTIONS = ["Unter CHF 2'000", "CHF 2'000 – 4'000", "CHF 4'000 – 6'000", "Über CHF 6'000"];

const STAGES = [
  { key: 'identifikation', label: 'Identifikation' },
  { key: 'ergaenzend', label: 'Ergänzende Informationen' },
  { key: 'situation', label: 'Ihre Situation' },
  { key: 'abgeschlossen', label: 'Abgeschlossen' },
];

function stageIndexForStep(step) {
  if (step === 'email') return 0;
  if (step === 'household' || step === 'income') return 1;
  if (step === 'contact') return 2;
  return 3;
}

function track(name, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

function rowClass(selected) {
  return [
    'w-full flex items-center justify-between gap-4 text-left cursor-pointer rounded-md text-[15.5px] font-medium text-dark transition-colors',
    selected ? 'bg-teal-light border-2 border-teal px-[17px] py-[14px]' : 'bg-white border border-[#D6DFE2] px-[18px] py-[15px]',
  ].join(' ');
}

export default function AntragFunnel() {
  const [situationSlug, setSituationSlug] = useState('');
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [household, setHousehold] = useState(1);
  const [income, setIncome] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [utmData, setUtmData] = useState({ utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('situation') || '';
    setSituationSlug(SITUATIONS[s] ? s : '');
    setUtmData({
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
    });
  }, []);

  const situationLabel = situationSlug ? SITUATIONS[situationSlug].label : 'Nicht angegeben';

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function submitEmail() {
    if (!isValidEmail(email)) {
      setErrors({ email: 'Bitte eine gültige E-Mail-Adresse angeben.' });
      return;
    }
    setErrors({});
    track('antrag_step_email_complete', { situation: situationSlug });
    setStep('household');
  }

  function submitHousehold() {
    track('antrag_step_household_complete', { household });
    setStep('income');
  }

  function chooseIncome(value) {
    setIncome(value);
    track('antrag_step_income_complete', { income: value });
    setStep('contact');
  }

  function validateContact() {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'Bitte Vorname angeben.';
    if (!lastName.trim()) errs.lastName = 'Bitte Nachname angeben.';
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone) errs.phone = 'Bitte Telefonnummer angeben.';
    else if (!/^(\+41|0041|0)\d{6,}$/.test(cleanPhone)) errs.phone = 'Bitte eine gültige Schweizer Telefonnummer angeben.';
    if (!consent) errs.consent = 'Bitte akzeptieren Sie die Datenschutzbestimmungen.';
    return errs;
  }

  const contactReady = firstName.trim() && lastName.trim() && /^(\+41|0041|0)\d{6,}$/.test(phone.replace(/\s/g, '')) && consent;

  async function submitContact() {
    const errs = validateContact();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    track('antrag_form_submit', { situation: situationSlug });
    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          canton: 'Basel-Stadt',
          situation: situationSlug,
          household: `${household} ${household === 1 ? 'Person' : 'Personen'}`,
          income,
          ...utmData,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      track('antrag_conversion', { situation: situationSlug });
      setStep('done');
    } catch (err) {
      setErrors({ submit: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.' });
    } finally {
      setLoading(false);
    }
  }

  const activeStage = stageIndexForStep(step);

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:flex-shrink-0 bg-white border-r border-[#E2E8EA] p-8">
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 no-underline">
          <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#0087A0"></rect>
            <rect x="14" y="14" width="24" height="24" rx="6" fill="#F0A500"></rect>
            <rect x="14" y="14" width="12" height="12" fill="#005F73"></rect>
          </svg>
          <span className="text-[17px] font-bold text-dark">
            prämienhilfe<span className="text-teal">.ch</span>
          </span>
        </a>

        <div className="mt-10 grid gap-3.5">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  i < activeStage ? 'bg-teal' : i === activeStage ? 'bg-teal ring-4 ring-teal-light' : 'bg-white border border-[#C3D5DA]'
                }`}
              />
              <span className={`text-[14px] ${i === activeStage ? 'font-semibold text-dark' : 'text-[#6B7A80]'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[#E2E8EA]">
          <div className="text-[13px] font-semibold text-dark">EVO Partners GmbH</div>
          <div className="mt-2.5 grid gap-1.5 text-[12.5px] text-[#6B7A80]">
            <div className="flex items-center gap-1.5">
              <span className="text-swiss-green">✓</span>
              <span>FINMA-anerkannter Broker</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-swiss-green">✓</span>
              <span>Situationsanalyse · Unverbindlich</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber">★</span>
              <span>4.8/5 von unseren Klienten bewertet</span>
            </div>
            <div className="mt-1">+1'000 Dossiers pro Jahr bearbeitet</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex items-start justify-center px-5 py-10 md:py-16">
        <div className="w-full max-w-[520px]">
          <div className="bg-white border border-[#E2E8EA] rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal mb-6">
              <span>🔒</span>
              <span>Sicheres Formular</span>
            </div>

            {step === 'email' && (
              <div>
                <div className="inline-flex items-center gap-2 bg-teal-light text-teal-dark text-[12px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full">
                  <span>Ihr Antrag: {situationLabel}</span>
                  <a href="/#pruefen" className="underline font-normal normal-case">
                    Ändern
                  </a>
                </div>
                <div className="text-xl font-bold mt-4 mb-4 tracking-tight">Zu Beginn benötigen wir Ihre E-Mail-Adresse</div>
                <input
                  type="email"
                  placeholder="nom@exemple.ch"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                />
                {errors.email && <div className="text-swiss-red text-xs mt-1">{errors.email}</div>}
                <p className="text-[12px] leading-relaxed text-[#8A979C] mt-3">
                  Mit dem Fortfahren akzeptieren Sie unsere Datenschutzrichtlinie und die Verarbeitung Ihrer
                  persönlichen Daten.
                </p>
                <button
                  type="button"
                  onClick={submitEmail}
                  disabled={!isValidEmail(email)}
                  className="mt-3.5 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Weiter →
                </button>
              </div>
            )}

            {step === 'household' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">Wie viele Personen leben in Ihrem Haushalt?</div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setHousehold((h) => Math.max(1, h - 1))}
                    className="w-11 h-11 rounded-md border border-[#D6DFE2] text-xl font-bold text-dark hover:border-teal"
                  >
                    −
                  </button>
                  <div className="min-w-[130px] text-center text-lg font-semibold">
                    {household} {household === 1 ? 'Person' : 'Personen'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setHousehold((h) => h + 1)}
                    className="w-11 h-11 rounded-md border border-[#D6DFE2] text-xl font-bold text-dark hover:border-teal"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={submitHousehold}
                  className="mt-6 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark"
                >
                  Weiter →
                </button>
              </div>
            )}

            {step === 'income' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">Wie hoch ist Ihr monatliches Haushaltseinkommen?</div>
                <div className="grid gap-2.5">
                  {INCOME_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => chooseIncome(opt)} className={rowClass(income === opt)}>
                      <span>{opt}</span>
                      <span className="text-teal font-bold">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'contact' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">Wie können wir Sie erreichen?</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Vorname"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                    />
                    {errors.firstName && <div className="text-swiss-red text-xs mt-1">{errors.firstName}</div>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Nachname"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                    />
                    {errors.lastName && <div className="text-swiss-red text-xs mt-1">{errors.lastName}</div>}
                  </div>
                </div>
                <div className="mt-2.5">
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                  />
                  {errors.phone && <div className="text-swiss-red text-xs mt-1">{errors.phone}</div>}
                </div>
                <label className="flex items-start gap-2.5 mt-4 text-[13px] leading-relaxed text-[#3D4A50] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-teal flex-shrink-0"
                  />
                  <span>
                    Ich akzeptiere die Datenschutzbestimmungen von EVO Partners GmbH und stimme der Verarbeitung meiner
                    Daten zum Zweck der Beratung zu.
                  </span>
                </label>
                {errors.consent && <div className="text-swiss-red text-xs mt-1">{errors.consent}</div>}
                {errors.submit && <div className="text-swiss-red text-sm mt-3">{errors.submit}</div>}
                <button
                  type="button"
                  onClick={submitContact}
                  disabled={!contactReady || loading}
                  className="mt-4 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird gesendet…' : 'Antrag einreichen →'}
                </button>
              </div>
            )}

            {step === 'done' && (
              <div>
                <div className="w-12 h-12 rounded-full bg-swiss-green/10 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D8B37" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 13l5 5L20 7"></path>
                  </svg>
                </div>
                <div className="text-xl font-bold mt-4 tracking-tight text-[#2E6B29]">Vielen Dank, {firstName}!</div>
                <p className="text-[15px] leading-relaxed text-[#3D4A50] mt-2.5">
                  Wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.
                </p>
                <div className="mt-5 bg-[#F5F7F8] rounded-md px-4 py-3.5 grid gap-1.5 text-[13.5px]">
                  <div className="flex justify-between">
                    <span className="text-[#6B7A80]">Situation:</span>
                    <span className="font-semibold text-dark">{situationLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7A80]">Haushalt:</span>
                    <span className="font-semibold text-dark">
                      {household} {household === 1 ? 'Person' : 'Personen'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7A80]">Einkommen:</span>
                    <span className="font-semibold text-dark">{income}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7A80]">E-Mail:</span>
                    <span className="font-semibold text-dark">{email}</span>
                  </div>
                </div>
                <p className="text-[13px] text-[#8A979C] mt-4">Sie erhalten in Kürze eine Bestätigung per E-Mail.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Sanity check**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npx astro check
```
Expected: no errors referencing this file (full live verification happens in Task 12 once mounted on a real page).

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/components/AntragFunnel.jsx
git commit -m "feat: add AntragFunnel — full-page 5-step funnel with sidebar progress and trust block"
```

---

### Task 12: `src/pages/antrag.astro` (new page)

**Files:**
- Create: `src/pages/antrag.astro`

**Interfaces:**
- Consumes: `Base` with `chrome={false}` (Task 4/8), `AntragFunnel` (Task 11).

- [ ] **Step 1: Write the page**

```astro
---
// src/pages/antrag.astro
import Base from '../layouts/Base.astro';
import AntragFunnel from '../components/AntragFunnel.jsx';
---

<Base
  title="Antrag stellen | prämienhilfe.ch"
  description="Stellen Sie Ihren Antrag auf Prämienverbilligung im Kanton Basel-Stadt — schnell und unverbindlich."
  canonical="https://praemienhilfe.ch/antrag"
  chrome={false}
>
  <AntragFunnel client:load />
</Base>
```

- [ ] **Step 2: Build and full end-to-end browser walkthrough**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: zero errors, `dist/antrag/index.html` present.

Start `npm run dev`, use browser tools:
- Navigate to `/antrag?situation=familie` directly. Confirm: no header/footer/mobile-sticky-CTA/disclaimer-modal/exit-popup/sticky-widget render (bare page). Left sidebar (desktop viewport) shows logo, 4 stages with "Identifikation" active, trust block with the real stats. Main card shows "🔒 Sicheres Formular" and the email step with the "Ihr Antrag: Familie mit Kindern" tag.
- Type an invalid email, confirm "Weiter →" stays disabled; type a valid email, confirm it enables; click it — advances to household step, sidebar moves to "Ergänzende Informationen".
- Use +/− steppers, confirm the count and pluralization ("1 Person" vs "2 Personen") update correctly; click Weiter → advances to income step (sidebar stays on "Ergänzende Informationen").
- Click an income row — advances to contact step, sidebar moves to "Ihre Situation".
- Try submitting with empty fields / unchecked consent — confirm the button stays disabled. Fill valid Vorname/Nachname, an invalid phone (e.g. `12345`) — button should stay disabled (regex fails `contactReady`); fix to a valid Swiss number, check the consent box — button enables. Click it.
- Confirm it reaches the "done" state (even though the actual HubSpot call will fail server-side with no real API key — same graceful-failure behavior as the original `Funnel.jsx`; if `errors.submit` shows instead of reaching `done`, that's expected in this dev environment and is NOT a bug — note this clearly, don't treat a missing HubSpot key as a defect).
- Confirm the confirmation summary box shows the correct situation/household/income/email values.
- Test the "Ändern" link on the email step — confirm it navigates to `/#pruefen`.
- Visit `/antrag` with no `?situation=` param — confirm it doesn't crash and shows a sensible fallback ("Nicht angegeben" or similar) rather than blank/undefined text.

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/pages/antrag.astro
git commit -m "feat: add /antrag full-page funnel route"
```

---

### Task 13: SEO — schema markup, H1/meta on index & basel-stadt

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/basel-stadt.astro`

**Interfaces:**
- Consumes: `Base`'s new `schema` prop (Task 4).

- [ ] **Step 1: Update `index.astro`**

Change the `<Base ...>` opening tag and its title/description from:
```astro
<Base
  title="Prämienverbilligung beantragen | prämienhilfe.ch"
  description="Prüfen Sie Ihren Anspruch auf Prämienverbilligung kostenlos. Hilfe bei der Beantragung im Kanton Basel-Stadt und Basel-Landschaft."
  canonical="https://praemienhilfe.ch/"
  activePage="home"
>
```
to:
```astro
<Base
  title="Prämienverbilligung Basel-Stadt 2026 – Antrag stellen | prämienhilfe.ch"
  description="Prämienverbilligung im Kanton Basel-Stadt beantragen. EVO Partners GmbH hilft Ihnen kostenlos bei der Einreichung Ihres Antrags. Jetzt Anspruch prüfen — in 20 Minuten."
  canonical="https://praemienhilfe.ch/"
  activePage="home"
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
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Wer hat Anspruch auf Prämienverbilligung in Basel-Stadt?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Personen mit Wohnsitz in Basel-Stadt in bescheidenen wirtschaftlichen Verhältnissen. Es lohnt sich in jedem Fall, den Anspruch zu prüfen.',
          },
        },
        {
          '@type': 'Question',
          name: 'Was kostet die Hilfe bei der Prämienverbilligung?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Die Hilfe bei der Prämienverbilligung ist für Sie kostenlos. EVO Partners GmbH ist ein FINMA-registrierter Versicherungsbroker.',
          },
        },
      ],
    },
  ]}
>
```

- [ ] **Step 2: Add the keyword-rich paragraph to the top of the info section content**

Still in `index.astro`, this content lives in `cantons['basel-stadt'].infoParagraphs` (shared data), so add it as the FIRST entry in Task 1's already-edited array — **go back to `src/data/cantons.js` now** and change:
```js
    infoParagraphs: [
      "Rund 30'000 Personen im Kanton Basel-Stadt erhalten bereits Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt.",
      'Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen.',
      'Die Einkommensgrenzen variieren je nach Haushaltsgrösse und persönlicher Situation. Viele Personen erhalten Prämienverbilligung, auch wenn sie nicht damit rechnen. Es lohnt sich in jedem Fall, den Anspruch zu prüfen.',
    ],
```
to:
```js
    infoParagraphs: [
      "Die Prämienverbilligung (auch IPV — Individuelle Prämienverbilligung) im Kanton Basel-Stadt wird vom Amt für Sozialbeiträge (ASB) verwaltet. Rund 30'000 Einwohnerinnen und Einwohner des Kantons Basel-Stadt erhalten bereits diese finanzielle Unterstützung zur Reduktion ihrer Krankenkassenprämien.",
      "Rund 30'000 Personen im Kanton Basel-Stadt erhalten bereits Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt.",
      'Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen.',
      'Die Einkommensgrenzen variieren je nach Haushaltsgrösse und persönlicher Situation. Viele Personen erhalten Prämienverbilligung, auch wenn sie nicht damit rechnen. Es lohnt sich in jedem Fall, den Anspruch zu prüfen.',
    ],
```
(Both the first and second paragraphs now make a similar "rund 30'000" point — this near-duplication is a direct consequence of instructions.md §11 asking for a specific new opening paragraph while §5's earlier paragraph already existed with overlapping content. Leave both as instructed; do not silently merge or cut either — if this reads as repetitive once live, that's worth flagging back to the user, but the instructions for both paragraphs are explicit and specific enough that guessing which to trim isn't this task's call.)

- [ ] **Step 3: Update `basel-stadt.astro`** — same `Base` prop changes as `index.astro` (title stays as-is per instructions.md's PAGES TO UPDATE section, which only specifies `index.astro`'s title changing — `basel-stadt.astro` keeps its existing distinct title "Prämienverbilligung Basel-Stadt | prämienhilfe.ch"), but gains the same `schema` array:

Change:
```astro
<Base
  title="Prämienverbilligung Basel-Stadt | prämienhilfe.ch"
  description="Prämienverbilligung im Kanton Basel-Stadt beantragen. Einkommensgrenze Einzelperson CHF 49'375. Kostenlose Hilfe beim Antrag."
  canonical="https://praemienhilfe.ch/basel-stadt"
  activePage="basel-stadt"
>
```
to:
```astro
<Base
  title="Prämienverbilligung Basel-Stadt | prämienhilfe.ch"
  description="Prämienverbilligung im Kanton Basel-Stadt beantragen. EVO Partners GmbH hilft Ihnen kostenlos bei der Einreichung Ihres Antrags. Jetzt Anspruch prüfen — in 20 Minuten."
  canonical="https://praemienhilfe.ch/basel-stadt"
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
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Wer hat Anspruch auf Prämienverbilligung in Basel-Stadt?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Personen mit Wohnsitz in Basel-Stadt in bescheidenen wirtschaftlichen Verhältnissen. Es lohnt sich in jedem Fall, den Anspruch zu prüfen.',
          },
        },
        {
          '@type': 'Question',
          name: 'Was kostet die Hilfe bei der Prämienverbilligung?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Die Hilfe bei der Prämienverbilligung ist für Sie kostenlos. EVO Partners GmbH ist ein FINMA-registrierter Versicherungsbroker.',
          },
        },
      ],
    },
  ]}
>
```

- [ ] **Step 4: Build and verify schema renders**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
grep -c "application/ld+json" dist/index.html
grep -c "application/ld+json" dist/basel-stadt/index.html
```
Expected: both `2` (LocalBusiness + FAQPage blocks each). Also spot check `dist/index.html` contains `"EVO Partners GmbH"` inside the JSON-LD.

- [ ] **Step 5: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/src/pages/index.astro praemienhilfe.ch/src/pages/basel-stadt.astro praemienhilfe.ch/src/data/cantons.js
git commit -m "feat: add LocalBusiness/FAQPage schema markup and keyword paragraph to home/basel-stadt"
```

---

### Task 14: `netlify.toml` cache headers

**Files:**
- Modify: `netlify.toml`

- [ ] **Step 1: Append the cache-control header block**

Change:
```toml
[build]
  command = "npm run build"
  publish = "dist"
```
to:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

Do **not** add any `[[redirects]]` block — the prior review cycle found and fixed a production bug where a catch-all redirect broke `/api/submit` by intercepting it ahead of the Netlify adapter's own SSR function routing. That fix must stay in place.

- [ ] **Step 2: Verify**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
cat netlify.toml
npm run build
```
Expected: valid TOML, build succeeds (this file doesn't affect `astro build` directly, but confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe.ch/netlify.toml
git commit -m "feat: add immutable cache headers for hashed Astro build assets"
```

---

### Task 15: Final full-refactor verification

**Files:** none (verification only).

- [ ] **Step 1: Full production build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
rm -rf node_modules/.vite
npm run build
```
Expected: zero errors, `dist/` contains all prior pages plus `dist/antrag/index.html`.

- [ ] **Step 2: Comprehensive browser walkthrough**

Start `npm run dev`, use browser tools to verify, in order:

1. **Disclaimer:** fresh visit to `/` shows the modal blocking interaction; dismiss it; reload — stays dismissed; confirm the "Direkt zum offiziellen Kantonsamt" link has `target="_blank"` (check the DOM attribute, don't necessarily open it).
2. **Situation → antrag flow:** from `/`, click a situation row, confirm URL is `/antrag?situation=<slug>`, walk the full funnel to the "done" state (per Task 12's detailed steps), confirm no header/footer/disclaimer/exit-popup/sticky-widget appear anywhere on `/antrag`.
3. **basel-landschaft untouched:** visit `/basel-landschaft`, confirm old H1, old 4-step canton/income/household/contact funnel, starts at step 2 with Basel-Landschaft pre-selected — identical to pre-refactor behavior.
4. **Phone/email removal:** `grep -rn "767790449\|msegui@evo-partners" src/` from the project root should show zero matches outside `src/pages/datenschutz.astro` (email only) — run this grep for real and paste the output in your report.
5. **GmbH rename:** `grep -rn "Sàrl" src/` should show zero matches anywhere.
6. **Footer smooth scroll:** from a page with `#pruefen` in view lower on the page (e.g. scroll up first), click a footer link pointing to `#pruefen` and confirm it scrolls smoothly rather than jumping instantly.
7. **FAQ:** visit `/faq`, confirm "Wer sind wir?" is the first question and "Sind Sie ein offizielles Kantonsamt?" is the second.
8. **Income thresholds removed:** visit `/` or `/basel-stadt`, confirm the info section no longer shows "Einkommensgrenze Einzelperson"/"Einkommensgrenze 4-Pers.-Haushalt" rows, and does show the new paragraph about varying income limits.
9. **Console:** watch for JS errors throughout steps 1–8; report anything unexpected.

- [ ] **Step 3: Do NOT fix anything found here yourself if it implicates an earlier task's already-committed file** — report it with specifics (page, expected vs actual, suspected file) so the controller can decide whether to dispatch a fix. Fix it directly only if the bug is clearly confined to files this task owns (none — this task has no files of its own).

- [ ] **Step 4: Write findings summary**

Summarize: build status, all 9 walkthrough checks (pass/fail with specifics), the two grep outputs (phone/email, Sàrl), and an overall verdict on whether the refactor is ready to ship.

---

## Self-Review Notes

- **Spec coverage:** every instructions.md section (1–15) is covered by a task above, except §4/§14's fabricated live-activity counters, which are the user-confirmed exclusion documented in Global Constraints and the design spec.
- **Placeholder scan:** no TBD/TODO markers. The one deliberately-left "near-duplicate paragraph" in Task 13 Step 2 is flagged inline with reasoning, not silently resolved by guessing — that's a content-editorial judgment call for the user, not an implementation placeholder.
- **Type/interface consistency:** `Base`'s new `chrome`/`schema` props are defined once in Task 4 and consumed identically in Task 8 (islands) and Task 12 (`antrag.astro`, `chrome={false}`); `Hero`'s new `useSituationFunnel` prop is defined in Task 9 and its one non-default consumer (`basel-landschaft.astro`, `false`) is updated in the same task so the codebase is never left in a broken intermediate state between tasks. `SITUATIONS`/`situationList` shape (`{slug, icon, label}`) defined once in Task 9, consumed identically by `SituationSelector.astro` (Task 9) and `AntragFunnel.jsx` (Task 11). The Swiss phone regex `/^(\+41|0041|0)\d{6,}$/` is reused verbatim from the already-fixed `Funnel.jsx` rather than reinvented, keeping validation behavior consistent across both funnels site-wide.
