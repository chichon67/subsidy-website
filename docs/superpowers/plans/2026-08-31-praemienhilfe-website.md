# prämienhilfe.ch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Astro + React + Tailwind marketing/lead-gen site for prämienhilfe.ch (Swiss health-insurance subsidy leads), replicating the approved prototype design exactly and wiring the 4-step funnel to a HubSpot-backed API route.

**Architecture:** Astro static site (zero JS by default) with a single React island (`Funnel.jsx`, `client:load`) for the interactive funnel. All other sections are static `.astro` components. One Astro API route (`src/pages/api/submit.js`) proxies form submissions to HubSpot's Forms API. Canton-specific copy/numbers live in one data module (`src/data/cantons.js`) consumed by both the canton pages and the home page.

**Tech Stack:** Astro (latest), React (island only), Tailwind CSS, Netlify adapter, no external form library, no animation library, Inter font via `@fontsource-variable/inter` or Google Fonts `<link>` (decided in Task 1).

## Global Constraints

- Preserve every design detail from the prototype exactly: colors, spacing, copy, wording (German, Swiss orthography — `ss` not `ß`). Source of truth for visuals/copy: `docs/superpowers/specs/2026-08-31-praemienhilfe-design.md` and the decoded prototype at `/tmp/page_source.html` (re-decode from `/Users/marco/Downloads/Praemienhilfe Landing v4 (standalone).html` if `/tmp/page_source.html` is gone — see Task 0 note).
- Tailwind custom colors (exact, from `instructions.md`):
  ```js
  colors: {
    teal: { DEFAULT: '#0087A0', dark: '#005F73', light: '#E8F4F8' },
    amber: { DEFAULT: '#F0A500', light: '#FFF8E7' },
    swiss: { red: '#CC0000', green: '#3D8B37' },
    dark: '#1A1A2A',
  }
  ```
  Every other one-off color from the prototype (grays, borders, footer tones) is applied via Tailwind arbitrary values (e.g. `text-[#3D4A50]`), not added to the config.
- Only `Funnel.jsx` ships JavaScript (`client:load`). Every other component is static Astro/HTML. The FAQ accordion uses native `<details>`/`<summary>` — zero JS.
- Nav real hrefs (per `instructions.md` ━━━ NAVIGATION ━━━, not the prototype's single-page anchors): `/`, `/basel-stadt`, `/basel-landschaft`, `/so-funktioniert-es`, `/faq`, `/kontakt`. The "Antrag prüfen" CTA and mobile sticky bar link to `/#pruefen` (home hero funnel anchor) from anywhere, or `#pruefen` when already on a page that has the funnel (home, basel-stadt, basel-landschaft).
- Basel-Landschaft income thresholds and application deadline are **unverified placeholders** (flagged inline in `src/data/cantons.js` with a comment) — call this out in the final summary to the user.
- Every page renders `<Header />` and `<Footer />` via `Base.astro`.
- Run `npm run build` at the end of every task that touches a `.astro`/`.jsx` file and confirm zero errors before committing.

---

### Task 0: Initialize git and scaffold the Astro project

**Files:**
- Create: whole `praemienhilfe/` Astro project tree (via CLI), at `/Users/marco/Documents/repos/subsidy-website/praemienhilfe/`
- Create: `/Users/marco/Documents/repos/subsidy-website/.gitignore` (repo root, if not created by scaffold)

**Interfaces:**
- Produces: a working Astro project with `astro`, `@astrojs/react`, `@astrojs/tailwind`, `@astrojs/netlify`, `react`, `react-dom`, `tailwindcss` installed and wired in `astro.config.mjs`.

- [ ] **Step 1: Init git at the repo root**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git init
git add instructions.md docs
git commit -m "docs: add build instructions and design/plan docs"
```

- [ ] **Step 2: Scaffold Astro**

```bash
cd /Users/marco/Documents/repos/subsidy-website
npm create astro@latest praemienhilfe -- --template minimal --no-install --no-git --typescript strict
cd praemienhilfe
npm install
```

- [ ] **Step 3: Add integrations**

```bash
npx astro add react --yes
npx astro add tailwind --yes
npx astro add netlify --yes
```

Confirm `astro.config.mjs` now imports and registers `react()`, `tailwind()`, and the `netlify()` adapter (with `output: 'server'` or default — since this site is otherwise fully static except one API route, set `output: 'hybrid'` if using Astro <4.something that requires it, or leave default `output: 'server'` with the Netlify adapter which handles static+API routes automatically in Astro 4+/5+; verify by checking the installed `astro --version` and the adapter's own README notes printed during `astro add netlify`).

- [ ] **Step 4: Verify the scaffold builds**

```bash
npm run build
```
Expected: build succeeds, `dist/` created, no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/marco/Documents/repos/subsidy-website
git add praemienhilfe
git commit -m "chore: scaffold Astro project with React, Tailwind, Netlify"
```

---

### Task 1: Tailwind config, global CSS, Inter font

**Files:**
- Modify: `praemienhilfe/tailwind.config.mjs`
- Create: `praemienhilfe/src/styles/global.css`

**Interfaces:**
- Produces: Tailwind classes `bg-teal`, `text-teal`, `bg-teal-dark`, `bg-teal-light`, `bg-amber`, `bg-amber-light`, `text-swiss-red`, `text-swiss-green`, `bg-dark`, `text-dark`, and `font-sans` (Inter) usable in every later task.

- [ ] **Step 1: Write `tailwind.config.mjs`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#0087A0', dark: '#005F73', light: '#E8F4F8' },
        amber: { DEFAULT: '#F0A500', light: '#FFF8E7' },
        swiss: { red: '#CC0000', green: '#3D8B37' },
        dark: '#1A1A2A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family: Inter, system-ui, sans-serif;
  color: #1a1a2a;
  background: #ffffff;
  -webkit-font-smoothing: antialiased;
}

a {
  color: #0087a0;
}

a:hover {
  color: #005f73;
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
npm run build
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add praemienhilfe/tailwind.config.mjs praemienhilfe/src/styles/global.css
git commit -m "feat: configure Tailwind theme and global styles with Inter font"
```

---

### Task 2: Canton data module

**Files:**
- Create: `praemienhilfe/src/data/cantons.js`

**Interfaces:**
- Produces: `export const cantons` — an object keyed by `'basel-stadt'` and `'basel-landschaft'`, each shaped:
  ```js
  {
    slug, name, shortCode, phone, email,
    heroProof, stats: [{value,label}] (4),
    infoHeading, infoParagraphs: [string, string],
    facts: [{k,v}] (5),
    officeNameFull, closingParagraph,
    steps: [{n,title,text}] (3),
    faqs: [{q,a}] (5),
  }
  ```
  Later tasks (`Hero.astro`, `TrustBar.astro`, `InfoSection.astro`, `HowItWorks.astro`, `FAQ.astro`, canton pages) import `cantons['basel-stadt']` / `cantons['basel-landschaft']`.

- [ ] **Step 1: Write the data file**

```js
// src/data/cantons.js
const PHONE = '+41 76 779 0449';
const EMAIL = 'msegui@evo-partners.ch';

const closingParagraph =
  "Haben sich Ihre persönlichen oder finanziellen Verhältnisse verändert? Auch bestehende Bezüger müssen Änderungen melden. Wir begleiten Sie durch den gesamten Prozess.";

const reasons = [
  { title: 'Zu kompliziert', text: 'Das Antragsverfahren wirkt aufwendig' },
  { title: 'Unsicher', text: 'Viele wissen nicht ob sie berechtigt sind' },
  { title: 'Keine Zeit', text: 'Fristen werden oft verpasst' },
];

export const cantons = {
  'basel-stadt': {
    slug: 'basel-stadt',
    name: 'Basel-Stadt',
    shortCode: 'BS',
    phone: PHONE,
    email: EMAIL,
    heroProof: "Ca. 30'000 Personen erhalten bereits Prämienverbilligung in BS",
    stats: [
      { value: "30'000+", label: 'Bezüger in BS' },
      { value: "CHF 500–3'000", label: 'Ersparnis pro Jahr' },
      { value: '20 Minuten', label: 'Gespräch' },
      { value: 'Seit 2020', label: 'Erfahrung' },
    ],
    infoHeading: 'Prämienverbilligung im Kanton Basel-Stadt',
    infoParagraphs: [
      "Rund 30'000 Personen im Kanton Basel-Stadt erhalten bereits Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt.",
      'Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen.',
    ],
    facts: [
      { k: 'Einkommensgrenze Einzelperson', v: "CHF 49'375" },
      { k: 'Einkommensgrenze 4-Pers.-Haushalt', v: "CHF 97'000" },
      { k: 'Bezüger im Kanton', v: "ca. 30'000" },
      { k: 'Zuständige Stelle', v: 'ASB Basel-Stadt' },
      { k: 'Antragsfrist 2027', v: 'September–31. Dezember 2026' },
    ],
    officeNameFull: 'Amt für Sozialbeiträge Basel-Stadt',
    closingParagraph,
    steps: [
      {
        n: '1',
        title: 'Anspruch prüfen',
        text: 'In einem kurzen Gespräch von ca. 20 Minuten prüfen wir gemeinsam, ob und in welcher Höhe Sie Anspruch auf Prämienverbilligung haben.',
      },
      {
        n: '2',
        title: 'Dossier zusammenstellen',
        text: 'Wir helfen Ihnen, alle notwendigen Unterlagen korrekt zusammenzustellen: Steuererklärung, Versicherungspolice, Lohnabrechnungen.',
      },
      {
        n: '3',
        title: 'Antrag einreichen',
        text: 'Den Antrag reichen wir gemeinsam mit Ihnen beim Amt für Sozialbeiträge Basel-Stadt ein.',
      },
    ],
    reasons,
    faqs: [
      {
        q: 'Wer hat Anspruch auf Prämienverbilligung?',
        a: "Anspruch haben Personen in bescheidenen wirtschaftlichen Verhältnissen mit Wohnsitz in der Schweiz. Im Kanton Basel-Stadt gilt: Einzelpersonen bis CHF 49'375, 4-Personen-Haushalte bis CHF 97'000 Jahreseinkommen.",
      },
      {
        q: 'Wie viel kann ich erhalten?',
        a: "Zwischen CHF 500 und CHF 3'000 pro Jahr, abhängig von Einkommen, Vermögen und Anzahl Personen. Kinder und junge Erwachsene bis 25 Jahre in Erstausbildung sind ebenfalls anspruchsberechtigt.",
      },
      {
        q: 'Was kostet mich dieser Service?',
        a: 'Für Sie entstehen keine direkten Kosten. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners Sàrl) und werden nicht direkt von Ihnen vergütet.',
      },
      {
        q: 'Was ist der Unterschied zum direkten Kantonsantrag?',
        a: 'Sie können den Antrag direkt beim Kantonsamt stellen. Wir helfen Ihnen vorab, Ihren Anspruch zu prüfen und das Dossier korrekt zusammenzustellen — ähnlich wie ein Treuhänder beim Steuerformular.',
      },
      {
        q: 'Wie lange dauert die Bearbeitung?',
        a: 'Das Erstgespräch dauert ca. 20 Minuten. Der Entscheid durch das Kantonsamt erfolgt in der Regel innerhalb von 2–4 Wochen.',
      },
    ],
  },

  'basel-landschaft': {
    slug: 'basel-landschaft',
    name: 'Basel-Landschaft',
    shortCode: 'BL',
    phone: PHONE,
    email: EMAIL,
    heroProof: "Ca. 20'000 Personen erhalten bereits Prämienverbilligung in BL",
    stats: [
      { value: "20'000+", label: 'Bezüger in BL' },
      { value: "CHF 500–3'000", label: 'Ersparnis pro Jahr' },
      { value: '20 Minuten', label: 'Gespräch' },
      { value: 'Seit 2020', label: 'Erfahrung' },
    ],
    infoHeading: 'Prämienverbilligung im Kanton Basel-Landschaft',
    infoParagraphs: [
      "Auch im Kanton Basel-Landschaft erhalten tausende Personen Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt.",
      'Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen.',
    ],
    // NOTE: income thresholds, beneficiary count and deadline below are
    // UNVERIFIED PLACEHOLDERS. instructions.md asked to "research and
    // include" real SVA Basel-Landschaft figures; no verified current-year
    // source was available while building this. Confirm against the
    // official SVA Basel-Landschaft site before launch and replace these.
    facts: [
      { k: 'Einkommensgrenze Einzelperson', v: "CHF 45'000 (unverifiziert)" },
      { k: 'Einkommensgrenze 4-Pers.-Haushalt', v: "CHF 90'000 (unverifiziert)" },
      { k: 'Bezüger im Kanton', v: "ca. 20'000 (unverifiziert)" },
      { k: 'Zuständige Stelle', v: 'SVA Basel-Landschaft' },
      { k: 'Antragsfrist 2027', v: 'September–31. Dezember 2026 (unverifiziert)' },
    ],
    officeNameFull: 'SVA Basel-Landschaft',
    closingParagraph,
    steps: [
      {
        n: '1',
        title: 'Anspruch prüfen',
        text: 'In einem kurzen Gespräch von ca. 20 Minuten prüfen wir gemeinsam, ob und in welcher Höhe Sie Anspruch auf Prämienverbilligung haben.',
      },
      {
        n: '2',
        title: 'Dossier zusammenstellen',
        text: 'Wir helfen Ihnen, alle notwendigen Unterlagen korrekt zusammenzustellen: Steuererklärung, Versicherungspolice, Lohnabrechnungen.',
      },
      {
        n: '3',
        title: 'Antrag einreichen',
        text: 'Den Antrag reichen wir gemeinsam mit Ihnen bei der SVA Basel-Landschaft ein.',
      },
    ],
    reasons,
    faqs: [
      {
        q: 'Wer hat Anspruch auf Prämienverbilligung?',
        a: 'Anspruch haben Personen in bescheidenen wirtschaftlichen Verhältnissen mit Wohnsitz in der Schweiz. Die genauen Einkommensgrenzen für den Kanton Basel-Landschaft prüfen wir gemeinsam mit Ihnen im Erstgespräch.',
      },
      {
        q: 'Wie viel kann ich erhalten?',
        a: "Zwischen CHF 500 und CHF 3'000 pro Jahr, abhängig von Einkommen, Vermögen und Anzahl Personen. Kinder und junge Erwachsene bis 25 Jahre in Erstausbildung sind ebenfalls anspruchsberechtigt.",
      },
      {
        q: 'Was kostet mich dieser Service?',
        a: 'Für Sie entstehen keine direkten Kosten. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners Sàrl) und werden nicht direkt von Ihnen vergütet.',
      },
      {
        q: 'Was ist der Unterschied zum direkten Kantonsantrag?',
        a: 'Sie können den Antrag direkt bei der SVA Basel-Landschaft stellen. Wir helfen Ihnen vorab, Ihren Anspruch zu prüfen und das Dossier korrekt zusammenzustellen — ähnlich wie ein Treuhänder beim Steuerformular.',
      },
      {
        q: 'Wie lange dauert die Bearbeitung?',
        a: 'Das Erstgespräch dauert ca. 20 Minuten. Der Entscheid durch das Kantonsamt erfolgt in der Regel innerhalb von 2–4 Wochen.',
      },
    ],
  },
};

export const cantonList = Object.values(cantons);
```

- [ ] **Step 2: Verify it's valid JS (Astro will fail to build otherwise, but check now)**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
node -e "const {cantons} = await import('./src/data/cantons.js'); console.log(Object.keys(cantons))"
```
Expected: `[ 'basel-stadt', 'basel-landschaft' ]`

- [ ] **Step 3: Commit**

```bash
git add praemienhilfe/src/data/cantons.js
git commit -m "feat: add canton content data module"
```

---

### Task 3: Header.astro

**Files:**
- Create: `praemienhilfe/src/components/Header.astro`

**Interfaces:**
- Consumes: nothing from other components.
- Produces: `Header` Astro component accepting prop `activePage: 'home' | 'basel-stadt' | 'basel-landschaft' | 'ablauf' | 'faq' | 'kontakt'` (default `'home'`), used by `Base.astro`.

- [ ] **Step 1: Write the component**

```astro
---
// src/components/Header.astro
export interface Props {
  activePage?: 'home' | 'basel-stadt' | 'basel-landschaft' | 'ablauf' | 'faq' | 'kontakt';
}
const { activePage = 'home' } = Astro.props;

const navLink = (key: string) =>
  activePage === key
    ? 'text-dark border-b-2 border-teal pb-1'
    : 'text-dark hover:text-teal pb-1 border-b-2 border-transparent';
---

<div class="bg-dark text-white">
  <div class="max-w-[1240px] mx-auto px-8 py-2 flex items-center justify-between gap-4 text-xs">
    <div class="text-[#C7CFD3]">Ein unabhängiger Beratungsservice</div>
    <a href="tel:+41767790449" class="hidden md:inline text-white font-medium">+41 76 779 0449</a>
  </div>
</div>

<header class="border-b-2 border-teal bg-white relative z-30">
  <div class="max-w-[1240px] mx-auto px-8 py-3.5 flex items-center justify-between gap-8">
    <a href="/" class="flex items-center gap-3 no-underline">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="2" y="2" width="24" height="24" rx="6" fill="#0087A0"></rect>
        <rect x="14" y="14" width="24" height="24" rx="6" fill="#F0A500"></rect>
        <rect x="14" y="14" width="12" height="12" fill="#005F73"></rect>
      </svg>
      <span class="block leading-tight">
        <span class="block text-[19px] font-bold text-dark tracking-tight">prämienhilfe</span>
        <span class="block text-[15px] font-medium text-teal tracking-wide">.ch</span>
      </span>
    </a>

    <nav class="hidden [@media(min-width:980px)]:flex items-center gap-6 text-[14.5px] font-medium">
      <a href="/" class={navLink('home')}>Prämienverbilligung</a>

      <div class="relative group">
        <button type="button" class="flex items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer text-[14.5px] font-medium text-dark group-hover:text-teal">
          <span>Kantone</span>
          <span class="text-[11px] text-teal transition-transform duration-150 group-hover:rotate-180">▾</span>
        </button>
        <div class="absolute top-full left-[-14px] mt-3 min-w-[230px] bg-white border border-[#E2E8EA] border-t-[3px] border-t-teal rounded shadow-[0_8px_24px_rgba(26,26,42,0.12)] py-1.5 hidden group-hover:block">
          <a href="/basel-stadt" class="block px-[18px] py-[11px] text-[14.5px] text-dark hover:bg-teal-light">Basel-Stadt</a>
          <a href="/basel-landschaft" class="block px-[18px] py-[11px] text-[14.5px] text-dark hover:bg-teal-light">Basel-Landschaft</a>
          <div class="px-[18px] py-1 text-[11px] text-[#A9B4B9]">— coming soon —</div>
          <span class="block px-[18px] py-[11px] text-[14.5px] text-[#A9B4B9] cursor-default">Zürich</span>
          <span class="block px-[18px] py-[11px] text-[14.5px] text-[#A9B4B9] cursor-default">Bern</span>
        </div>
      </div>

      <a href="/so-funktioniert-es" class={navLink('ablauf')}>So funktioniert es</a>
      <a href="/faq" class={navLink('faq')}>FAQ</a>
      <a href="/kontakt" class={navLink('kontakt')}>Kontakt</a>
      <a href="/#pruefen" class="px-4 py-2.5 bg-teal text-white rounded font-semibold hover:bg-teal-dark hover:text-white no-underline">Antrag prüfen</a>
    </nav>

    <input type="checkbox" id="mobile-menu-toggle" class="hidden peer" />
    <label
      for="mobile-menu-toggle"
      class="[@media(min-width:980px)]:hidden flex items-center justify-center w-[42px] h-[42px] bg-white border border-[#D6DFE2] rounded cursor-pointer"
      aria-label="Menü öffnen"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A2A" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path>
      </svg>
    </label>

    <div class="fixed inset-0 z-[60] bg-white overflow-y-auto hidden peer-checked:block">
      <div class="flex items-center justify-between px-6 py-[18px] border-b border-[#E2E8EA]">
        <div class="flex items-center gap-[11px]">
          <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#0087A0"></rect>
            <rect x="14" y="14" width="24" height="24" rx="6" fill="#F0A500"></rect>
            <rect x="14" y="14" width="12" height="12" fill="#005F73"></rect>
          </svg>
          <span class="text-[17px] font-bold">prämienhilfe<span class="text-teal">.ch</span></span>
        </div>
        <label for="mobile-menu-toggle" class="w-10 h-10 flex items-center justify-center border border-[#D6DFE2] rounded cursor-pointer text-xl text-dark" aria-label="Menü schliessen">×</label>
      </div>
      <div class="px-6 py-7 grid gap-1">
        <a href="/" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Prämienverbilligung</a>
        <a href="/basel-stadt" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Basel-Stadt</a>
        <a href="/basel-landschaft" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Basel-Landschaft</a>
        <a href="/so-funktioniert-es" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">So funktioniert es</a>
        <a href="/faq" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">FAQ</a>
        <a href="/kontakt" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Kontakt</a>
        <a href="/#pruefen" class="mt-[18px] text-center py-4 bg-teal text-white rounded-md text-[16.5px] font-bold no-underline">Antrag prüfen lassen →</a>
      </div>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
npm run build
```
Expected: fails only because no page imports `Header` yet is fine — instead, do a quick syntax check:
```bash
npx astro check
```
Expected: no errors in `Header.astro` (errors about unused component in other files are expected at this stage and will be resolved by Task 12+).

- [ ] **Step 3: Commit**

```bash
git add praemienhilfe/src/components/Header.astro
git commit -m "feat: add Header component with desktop dropdown and mobile drawer"
```

---

### Task 4: Footer.astro

**Files:**
- Create: `praemienhilfe/src/components/Footer.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/Footer.astro
const year = new Date().getFullYear();
---

<footer class="bg-dark text-white pb-24 md:pb-0">
  <div class="max-w-[1240px] mx-auto px-8 pt-14 pb-10">
    <div class="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 md:gap-11">
      <div>
        <div class="flex items-center gap-3">
          <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#FFFFFF"></rect>
            <rect x="14" y="14" width="24" height="24" rx="6" fill="#F0A500"></rect>
            <rect x="14" y="14" width="12" height="12" fill="#C7CFD3"></rect>
          </svg>
          <span class="block leading-tight">
            <span class="block text-lg font-bold text-white tracking-tight">prämienhilfe</span>
            <span class="block text-sm font-medium text-[#6EC5D4]">.ch</span>
          </span>
        </div>
        <div class="text-[13.5px] text-[#9AA6AC] mt-3.5 leading-relaxed">Hilfe bei der Prämienverbilligung in der Schweiz</div>
        <div class="h-px bg-[#2E3442] my-5"></div>
        <p class="text-[13px] leading-relaxed text-[#9AA6AC] m-0">prämienhilfe.ch ist eine private Beratungsplattform, unabhängig von den kantonalen Behörden der Schweiz.</p>
        <p class="text-[13px] leading-relaxed text-[#9AA6AC] mt-4">Betrieben von:<br>EVO Partners Sàrl<br>FINMA-registrierter Versicherungsbroker<br>Zürich, Schweiz</p>
      </div>

      <div>
        <div class="text-xs font-semibold tracking-wide uppercase text-[#6EC5D4]">Mehr Informationen</div>
        <div class="grid gap-2.5 mt-4 text-sm">
          <a href="/" class="text-[#D8DEE1] hover:text-white">Prämienverbilligung</a>
          <a href="/basel-stadt" class="text-[#D8DEE1] hover:text-white">Kantone</a>
          <a href="/so-funktioniert-es" class="text-[#D8DEE1] hover:text-white">So funktioniert es</a>
          <a href="/faq" class="text-[#D8DEE1] hover:text-white">FAQ</a>
        </div>
      </div>

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

      <div>
        <div class="text-xs font-semibold tracking-wide uppercase text-[#6EC5D4]">Rechtliches</div>
        <div class="grid gap-2.5 mt-4 text-sm">
          <a href="/impressum" class="text-[#D8DEE1] hover:text-white">Impressum</a>
          <a href="/datenschutz" class="text-[#D8DEE1] hover:text-white">Datenschutzbestimmungen</a>
          <a href="/impressum" class="text-[#D8DEE1] hover:text-white">Nutzungsbedingungen</a>
          <a href="/impressum" class="text-[#D8DEE1] hover:text-white">Rechtliche Hinweise</a>
        </div>
      </div>
    </div>
  </div>
  <div class="bg-[#14141F]">
    <div class="max-w-[1240px] mx-auto px-8 py-4 text-xs text-[#8A959B] leading-relaxed">
      © {year} prämienhilfe.ch — Ein Service von EVO Partners Sàrl, Zürich. Alle Rechte vorbehalten. Diese Plattform ist kein offizielles Kantonsorgan.
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add praemienhilfe/src/components/Footer.astro
git commit -m "feat: add Footer component"
```

---

### Task 5: Funnel.jsx (React island)

**Files:**
- Create: `praemienhilfe/src/components/Funnel.jsx`

**Interfaces:**
- Produces: default-exported React component `Funnel({ defaultCanton })`. Rendered from `.astro` files as `<Funnel client:load defaultCanton="Basel-Stadt" />` (prop optional).
- Consumes: `POST /api/submit` (built in Task 6) — sends JSON body `{ canton, income, household, firstName, lastName, phone, email, utm_source, utm_medium, utm_campaign, utm_content }`, expects `{ success: true }` on 200 or non-2xx on failure.
- Fires `window.gtag('event', name, params)` when `window.gtag` exists (added globally in Task 7's `Base.astro`); no-ops otherwise (safe in dev/build where GA4 script isn't loaded).

- [ ] **Step 1: Write the component**

```jsx
// src/components/Funnel.jsx
import { useState, useEffect } from 'react';

const CANTON_OPTIONS = ['Basel-Stadt', 'Basel-Landschaft'];
const INCOME_OPTIONS = ["Unter CHF 2'000", "CHF 2'000 – 4'000", "CHF 4'000 – 6'000", 'Über CHF 6\'000'];
const HOUSEHOLD_OPTIONS = ['Nur ich', 'Ich + Partner/in', 'Familie mit Kindern'];

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

export default function Funnel({ defaultCanton }) {
  const [step, setStep] = useState(defaultCanton ? 2 : 1);
  const [answers, setAnswers] = useState({
    canton: defaultCanton || '',
    income: '',
    household: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [utmData, setUtmData] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmData({
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
    });
  }, []);

  useEffect(() => {
    if (defaultCanton) {
      track('funnel_step_1_complete', { canton: defaultCanton });
    }
    // Only runs once on mount for canton-preset pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseCanton(value) {
    setAnswers((a) => ({ ...a, canton: value }));
    track('funnel_step_1_complete', { canton: value });
    setStep(2);
  }

  function chooseIncome(value) {
    setAnswers((a) => ({ ...a, income: value }));
    track('funnel_step_2_complete', { income: value });
    setStep(3);
  }

  function chooseHousehold(value) {
    setAnswers((a) => ({ ...a, household: value }));
    track('funnel_step_3_complete', { household: value });
    setStep(4);
  }

  function updateField(key) {
    return (e) => setAnswers((a) => ({ ...a, [key]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!answers.firstName.trim()) errs.firstName = 'Bitte Vorname angeben.';
    if (!answers.lastName.trim()) errs.lastName = 'Bitte Nachname angeben.';
    const phone = answers.phone.replace(/\s/g, '');
    if (!phone) errs.phone = 'Bitte Telefonnummer angeben.';
    else if (!/^(\+41|07)/.test(phone)) errs.phone = 'Bitte eine gültige Schweizer Nummer angeben (+41 oder 07...).';
    if (!answers.email.trim()) errs.email = 'Bitte E-Mail angeben.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim())) errs.email = 'Bitte eine gültige E-Mail-Adresse angeben.';
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    track('funnel_form_submit', { canton: answers.canton });
    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, ...utmData }),
      });
      if (!res.ok) throw new Error('submit failed');
      track('funnel_conversion', { canton: answers.canton });
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder rufen Sie uns unter +41 76 779 0449 an.' });
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setAnswers({ canton: '', income: '', household: '', firstName: '', lastName: '', phone: '', email: '' });
    setErrors({});
    setSubmitted(false);
    setStep(1);
  }

  const stepNo = Math.min(step, 4);

  return (
    <div className="mt-8 bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`inline-block w-[9px] h-[9px] rounded-full transition-colors ${
                i <= stepNo ? 'bg-teal border border-teal' : 'bg-white border border-[#C3D5DA]'
              }`}
            />
          ))}
        </div>
        <div className="text-xs font-medium tracking-wider uppercase text-[#6B7A80]">Schritt {stepNo} von 4</div>
      </div>

      {!submitted && step === 1 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">In welchem Kanton wohnen Sie?</div>
          <div className="grid gap-2.5">
            {CANTON_OPTIONS.map((opt) => (
              <button key={opt} type="button" onClick={() => chooseCanton(opt)} className={rowClass(answers.canton === opt)}>
                <span className="flex items-center gap-3.5">
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0087A0" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                    <path d="M3 21h18" />
                    <path d="M5 21V10l7-5 7 5v11" />
                    <path d="M9 21v-6h6v6" />
                  </svg>
                  <span>{opt}</span>
                </span>
                <span className="text-teal font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && step === 2 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie hoch ist Ihr monatliches Haushaltseinkommen?</div>
          <div className="grid gap-2.5">
            {INCOME_OPTIONS.map((opt) => (
              <button key={opt} type="button" onClick={() => chooseIncome(opt)} className={rowClass(answers.income === opt)}>
                <span>{opt}</span>
                <span className="text-teal font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && step === 3 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie viele Personen versichern Sie?</div>
          <div className="grid gap-2.5">
            {HOUSEHOLD_OPTIONS.map((opt) => (
              <button key={opt} type="button" onClick={() => chooseHousehold(opt)} className={rowClass(answers.household === opt)}>
                <span>{opt}</span>
                <span className="text-teal font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && step === 4 && (
        <div>
          <div className="text-lg font-bold mt-[18px] mb-1 tracking-tight text-[#2E6B29]">✓ Gute Nachricht — Sie könnten Anspruch haben!</div>
          <div className="text-xl font-bold mt-3 mb-4 tracking-tight">Ihre Kontaktangaben</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <input
                type="text"
                placeholder="Vorname"
                value={answers.firstName}
                onChange={updateField('firstName')}
                className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
              />
              {errors.firstName && <div className="text-swiss-red text-xs mt-1">{errors.firstName}</div>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Nachname"
                value={answers.lastName}
                onChange={updateField('lastName')}
                className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
              />
              {errors.lastName && <div className="text-swiss-red text-xs mt-1">{errors.lastName}</div>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Telefon"
                value={answers.phone}
                onChange={updateField('phone')}
                className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
              />
              {errors.phone && <div className="text-swiss-red text-xs mt-1">{errors.phone}</div>}
            </div>
            <div>
              <input
                type="email"
                placeholder="E-Mail"
                value={answers.email}
                onChange={updateField('email')}
                className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
              />
              {errors.email && <div className="text-swiss-red text-xs mt-1">{errors.email}</div>}
            </div>
          </div>
          {errors.submit && <div className="text-swiss-red text-sm mt-3">{errors.submit}</div>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-3.5 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer tracking-tight hover:bg-teal-dark disabled:opacity-60"
          >
            {loading ? 'Wird gesendet…' : 'Antrag prüfen lassen →'}
          </button>
          <div className="mt-2.5 text-xs text-[#8A979C] text-center">Keine Verpflichtung. Diskret.</div>
        </div>
      )}

      {submitted && (
        <div className="pt-4 pb-1">
          <div className="text-xl font-bold tracking-tight text-[#2E6B29]">Vielen Dank!</div>
          <p className="text-[15px] leading-relaxed text-[#3D4A50] mt-2.5">
            Wir melden uns innerhalb von 24 Stunden bei Ihnen. Bei Fragen erreichen Sie uns unter +41 76 779 0449.
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-4 px-4.5 py-2.5 bg-white text-teal border border-teal rounded-md text-sm font-semibold cursor-pointer hover:bg-teal-light"
          >
            Neue Prüfung starten
          </button>
        </div>
      )}

      {!submitted && step > 1 && step < 5 && (
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="mt-4.5 bg-transparent border-0 p-0 text-[#6B7A80] text-[13.5px] font-medium cursor-pointer hover:text-teal"
        >
          ← Zurück
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify component compiles (Astro's React integration lints JSX at build time via consuming pages, so full verification happens once a page uses it in Task 8-11). For now, sanity-check syntax:**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
npx eslint src/components/Funnel.jsx --no-eslintrc --parser-options=ecmaVersion:2022,sourceType:module,ecmaFeatures:{jsx:true} 2>/dev/null || node --check <(npx babel src/components/Funnel.jsx --presets @babel/preset-react 2>/dev/null) 2>/dev/null || echo "skip: no linter configured, will verify via astro build in Task 8"
```
This is a best-effort sanity check; the authoritative check is `npm run build` after Task 8 wires this into a real page.

- [ ] **Step 3: Commit**

```bash
git add praemienhilfe/src/components/Funnel.jsx
git commit -m "feat: add Funnel React island with 4-step flow, validation, UTM capture, GA4 events"
```

---

### Task 6: API route `src/pages/api/submit.js`

**Files:**
- Create: `praemienhilfe/src/pages/api/submit.js`
- Create: `praemienhilfe/.env.example`

**Interfaces:**
- Consumes: `POST` JSON body from `Funnel.jsx`: `{ canton, income, household, firstName, lastName, phone, email, utm_source, utm_medium, utm_campaign, utm_content }`.
- Produces: `200 { success: true }` on success, `400 { error }` on missing required fields, `500 { error }` on HubSpot failure.
- Reads env vars `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID` via `import.meta.env`.

- [ ] **Step 1: Write the API route**

```js
// src/pages/api/submit.js
export const prerender = false;

export async function POST({ request }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const required = ['firstName', 'lastName', 'phone', 'email', 'canton'];
  const missing = required.filter((key) => !data[key]);
  if (missing.length > 0) {
    return new Response(JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const portalId = import.meta.env.HUBSPOT_PORTAL_ID;
  const formId = import.meta.env.HUBSPOT_FORM_ID;

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
    context: {
      pageUri: 'praemienhilfe.ch',
      pageName: 'Prämienverbilligung Landing',
    },
  };

  try {
    const hsResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hubspotPayload),
      }
    );

    if (!hsResponse.ok) {
      const detail = await hsResponse.text();
      console.error('[api/submit] HubSpot rejected submission:', hsResponse.status, detail);
      return new Response(JSON.stringify({ error: 'Failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('[api/submit] HubSpot request failed:', err);
    return new Response(JSON.stringify({ error: 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

- [ ] **Step 2: Write `.env.example`**

```
HUBSPOT_PORTAL_ID=
HUBSPOT_FORM_ID=
PUBLIC_GA4_ID=
```

- [ ] **Step 3: Create a local `.env` for dev testing (not committed) and test the route with a curl request against `npm run dev`**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
cp .env.example .env
npm run dev &
sleep 3
curl -s -X POST http://localhost:4321/api/submit \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","phone":"+41791234567","email":"test@example.com","canton":"Basel-Stadt","income":"CHF 2000 – 4000","household":"Nur ich"}'
kill %1
```
Expected: JSON response with `{"error":"Failed"}` and status 500 (since `HUBSPOT_PORTAL_ID`/`HUBSPOT_FORM_ID` are empty in `.env` — this confirms the route runs, parses the body, and correctly attempts + fails the HubSpot call rather than crashing). Confirm no server crash/500 HTML error page — must be the JSON error response.

- [ ] **Step 4: Confirm `.env` is gitignored**

```bash
cat praemienhilfe/.gitignore | grep -E '^\.env$|^\.env\*'
```
Expected: a line ignoring `.env` (the `astro add` scaffold's default `.gitignore` includes this — if missing, append `.env` to `praemienhilfe/.gitignore`).

- [ ] **Step 5: Commit**

```bash
git add praemienhilfe/src/pages/api/submit.js praemienhilfe/.env.example praemienhilfe/.gitignore
git commit -m "feat: add /api/submit HubSpot proxy endpoint"
```

---

### Task 7: Base.astro layout (SEO, GA4, fonts, mobile sticky CTA)

**Files:**
- Create: `praemienhilfe/src/layouts/Base.astro`

**Interfaces:**
- Consumes: `Header`, `Footer` (Tasks 3, 4).
- Produces: `Base` layout accepting props `title: string`, `description: string`, `canonical: string`, `activePage?: string`, and a default `<slot />` for page body content. Used by every page in Tasks 8–15.

- [ ] **Step 1: Write the layout**

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
}

const { title, description, canonical, activePage = 'home' } = Astro.props;
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
  </head>
  <body>
    <div id="top"></div>
    <Header activePage={activePage} />
    <slot />
    <Footer />

    <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 border-t border-[#E2E8EA]">
      <a
        href="/#pruefen"
        class="block text-center px-5 py-3.5 bg-teal text-white rounded-md text-base font-bold no-underline"
      >
        Antrag prüfen lassen →
      </a>
    </div>
  </body>
</html>
```

- [ ] **Step 2: Verify build (still no pages consume it — do a quick `astro check`)**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
npx astro check
```
Expected: no errors referencing `Base.astro`.

- [ ] **Step 3: Commit**

```bash
git add praemienhilfe/src/layouts/Base.astro
git commit -m "feat: add Base layout with SEO meta, GA4, mobile sticky CTA"
```

---

### Task 8: Section components — Hero, TrustBar, InfoSection, HowItWorks, ProblemSection, FAQ, FinalCTA

**Files:**
- Create: `praemienhilfe/src/components/Hero.astro`
- Create: `praemienhilfe/src/components/TrustBar.astro`
- Create: `praemienhilfe/src/components/InfoSection.astro`
- Create: `praemienhilfe/src/components/HowItWorks.astro`
- Create: `praemienhilfe/src/components/ProblemSection.astro`
- Create: `praemienhilfe/src/components/FAQ.astro`
- Create: `praemienhilfe/src/components/FinalCTA.astro`

**Interfaces:**
- Consumes: `Funnel.jsx` (Hero only), canton data shape from Task 2 (`{name, shortCode, heroProof, stats, infoHeading, infoParagraphs, facts, closingParagraph, steps, reasons, faqs}`).
- Produces: components consumed by every page in Tasks 9–15, each taking a `canton` prop with that shape (except `ProblemSection` and `FinalCTA`, which are canton-agnostic and take no props).

- [ ] **Step 1: Write `Hero.astro`**

```astro
---
// src/components/Hero.astro
import Funnel from './Funnel.jsx';

export interface Props {
  canton: { name: string; heroProof: string };
  defaultCanton?: string;
}
const { canton, defaultCanton } = Astro.props;
---

<section id="pruefen" class="bg-white">
  <div class="max-w-[1240px] mx-auto px-8 pt-[58px] pb-[72px]">
    <div class="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-14 items-start">
      <div>
        <h1 class="text-[32px] md:text-[48px] leading-[1.08] font-bold tracking-tight m-0">
          Haben Sie Anspruch auf Prämienverbilligung?
        </h1>
        <p class="text-base leading-[1.68] text-[#3D4A50] mt-5 max-w-[34em]">
          Der Kanton gewährt Einwohnerinnen und Einwohnern in bescheidenen wirtschaftlichen Verhältnissen Beiträge zur
          Reduktion der Krankenkassenprämien. Wir helfen Ihnen, Ihren Anspruch zu prüfen und Ihren Antrag korrekt
          einzureichen.
        </p>

        <Funnel client:load defaultCanton={defaultCanton} />
      </div>

      <div class="hidden md:block relative pt-1.5">
        <svg viewBox="0 0 600 600" class="absolute -top-6 -left-11 w-[122%] h-auto" aria-hidden="true">
          <path d="M20 470 A 340 340 0 0 1 470 40" fill="none" stroke="#0087A0" stroke-width="1.3" opacity="0.4"></path>
          <path d="M74 560 A 330 330 0 0 1 560 120" fill="none" stroke="#E8F4F8" stroke-width="26"></path>
        </svg>
        <div
          class="relative w-full max-w-[470px] ml-auto aspect-square rounded-full overflow-hidden flex items-center justify-center"
          style="background: repeating-linear-gradient(135deg, #E8F4F8 0 11px, #D6EAF1 11px 22px);"
        >
          <div class="font-mono text-[12.5px] text-[#3F7788] text-center tracking-wide leading-[1.7] px-10">
            [Foto: Schweizer Familie]<br />1200 × 1200
          </div>
        </div>
        <div class="relative -mt-[52px] -ml-2.5 inline-flex items-start gap-2.5 bg-white border border-[#E2E8EA] rounded-lg shadow-[0_4px_16px_rgba(26,26,42,0.1)] px-[17px] py-3.5 max-w-[330px]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3D8B37" stroke-width="2.4" stroke-linecap="round" class="flex-shrink-0 mt-0.5" aria-hidden="true">
            <path d="M4 13l5 5L20 7"></path>
          </svg>
          <div class="text-[13.5px] leading-snug text-dark">{canton.heroProof}</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Write `TrustBar.astro`**

```astro
---
// src/components/TrustBar.astro
export interface Props {
  canton: { stats: { value: string; label: string }[] };
}
const { canton } = Astro.props;
---

<section class="bg-amber-light">
  <div class="max-w-[1240px] mx-auto px-8 py-9">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-9">
      {
        canton.stats.map((s) => (
          <div class="border-l-[3px] border-amber pl-[18px]">
            <div class="text-2xl font-bold tracking-tight">{s.value}</div>
            <div class="text-[13.5px] text-[#7A6836] mt-1.5 leading-snug">{s.label}</div>
          </div>
        ))
      }
    </div>
  </div>
</section>
```

- [ ] **Step 3: Write `InfoSection.astro`**

```astro
---
// src/components/InfoSection.astro
export interface Props {
  canton: {
    infoHeading: string;
    infoParagraphs: string[];
    facts: { k: string; v: string }[];
    closingParagraph: string;
  };
}
const { canton } = Astro.props;
---

<section id="info" class="bg-white">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 max-w-[26em] leading-tight">
      {canton.infoHeading}
    </h2>
    <div class="max-w-[44em] mt-[22px]">
      {canton.infoParagraphs.map((p) => <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-[18px] first:mt-0">{p}</p>)}
    </div>

    <div id="kantone" class="max-w-[46em] mt-[34px] border-l-4 border-teal">
      {
        canton.facts.map((f, i) => (
          <div
            class="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-1 md:gap-5 px-[18px] py-[13px]"
            style={{ background: i % 2 === 0 ? '#F5F7F8' : '#FFFFFF' }}
          >
            <div class="text-[14.5px] text-[#6B7A80]">{f.k}</div>
            <div class="text-[15.5px] font-semibold">{f.v}</div>
          </div>
        ))
      }
    </div>

    <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-8 max-w-[44em]">{canton.closingParagraph}</p>
  </div>
</section>
```

- [ ] **Step 4: Write `HowItWorks.astro`**

```astro
---
// src/components/HowItWorks.astro
export interface Props {
  canton: { steps: { n: string; title: string; text: string }[] };
}
const { canton } = Astro.props;
---

<section id="ablauf" style="background: #F0F7F0">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 text-[#2E6B29]">So funktioniert die Beantragung</h2>
    <div class="max-w-[48em] mt-[34px] grid gap-8">
      {
        canton.steps.map((st) => (
          <div class="grid grid-cols-1 md:grid-cols-[44px_1fr] gap-3 md:gap-[22px] items-start">
            <div class="w-11 h-11 rounded-full border-2 border-swiss-green text-swiss-green flex items-center justify-center text-[17px] font-bold">
              {st.n}
            </div>
            <div>
              <div class="text-[19px] font-bold tracking-tight">{st.title}</div>
              <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-2.5">{st.text}</p>
            </div>
          </div>
        ))
      }
    </div>
  </div>
</section>
```

- [ ] **Step 5: Write `ProblemSection.astro`**

```astro
---
// src/components/ProblemSection.astro
const reasons = [
  { title: 'Zu kompliziert', text: 'Das Antragsverfahren wirkt aufwendig' },
  { title: 'Unsicher', text: 'Viele wissen nicht ob sie berechtigt sind' },
  { title: 'Keine Zeit', text: 'Fristen werden oft verpasst' },
];
---

<section class="bg-white">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 max-w-[26em] leading-tight">
      Warum beantragen viele Berechtigte keine Prämienverbilligung?
    </h2>
    <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-[22px] max-w-[44em]">
      Obwohl Tausende von Personen Anspruch hätten, stellen viele keinen Antrag. Die häufigsten Gründe: Das Verfahren
      wirkt kompliziert, viele wissen nicht ob sie berechtigt sind, und die Fristen werden oft verpasst. Dabei ist der
      Prozess einfacher als erwartet — vorausgesetzt, man kennt die genauen Anforderungen und Fristen.
    </p>
    <div class="mt-7 grid gap-3.5 max-w-[44em]">
      {
        reasons.map((r) => (
          <div class="flex items-baseline gap-3.5 text-base leading-relaxed">
            <span class="w-2 h-2 rounded-full bg-swiss-red flex-shrink-0 -translate-y-px" />
            <span>
              <strong class="font-bold">{r.title}</strong> — <span class="text-[#3D4A50]">{r.text}</span>
            </span>
          </div>
        ))
      }
    </div>
  </div>
</section>
```

- [ ] **Step 6: Write `FAQ.astro` (zero-JS `<details>` accordion)**

```astro
---
// src/components/FAQ.astro
export interface Props {
  canton: { faqs: { q: string; a: string }[] };
}
const { canton } = Astro.props;
---

<section id="faq" class="bg-[#F5F7F8]">
  <div class="max-w-[900px] mx-auto px-8 py-16">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0">Häufige Fragen</h2>
    <div class="mt-[30px] border-t border-[#DFE6E8]">
      {
        canton.faqs.map((f) => (
          <details class="group border-b border-[#DFE6E8] [&_summary::-webkit-details-marker]:hidden">
            <summary class="flex items-center justify-between gap-5 py-5 px-0.5 cursor-pointer text-[17px] font-semibold text-dark tracking-tight list-none hover:text-teal">
              <span>{f.q}</span>
              <span class="text-[22px] font-normal text-teal leading-none transition-transform duration-150 group-open:rotate-45">+</span>
            </summary>
            <div class="text-base leading-[1.7] text-[#3D4A50] max-w-[52em] px-0.5 pb-[22px]">{f.a}</div>
          </details>
        ))
      }
    </div>
  </div>
</section>
```

- [ ] **Step 7: Write `FinalCTA.astro`**

```astro
---
// src/components/FinalCTA.astro
---

<section id="kontakt" class="bg-teal text-white">
  <div class="max-w-[1240px] mx-auto px-8 py-16">
    <div class="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-11 items-center">
      <div>
        <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 text-white">Jetzt Anspruch prüfen lassen</h2>
        <p class="text-[16.5px] leading-relaxed mt-3.5 text-[#DDF0F4] max-w-[34em]">
          Vereinbaren Sie ein Erstgespräch. Wir begleiten Sie von der Prüfung bis zur Einreichung.
        </p>
      </div>
      <div class="flex flex-col gap-2.5">
        <a href="/#pruefen" class="block text-center px-5 py-[17px] bg-white text-teal-dark rounded-md text-[16.5px] font-bold no-underline hover:bg-teal-light">
          Antrag prüfen lassen →
        </a>
        <a
          href="tel:+41767790449"
          class="flex items-center justify-center gap-2.5 px-5 py-[17px] bg-transparent text-white border border-white/60 rounded-md text-[16.5px] font-semibold no-underline hover:bg-white/10"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z"></path>
          </svg>
          <span>+41 76 779 0449</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 8: Commit**

```bash
git add praemienhilfe/src/components/Hero.astro praemienhilfe/src/components/TrustBar.astro praemienhilfe/src/components/InfoSection.astro praemienhilfe/src/components/HowItWorks.astro praemienhilfe/src/components/ProblemSection.astro praemienhilfe/src/components/FAQ.astro praemienhilfe/src/components/FinalCTA.astro
git commit -m "feat: add section components (Hero, TrustBar, InfoSection, HowItWorks, ProblemSection, FAQ, FinalCTA)"
```

---

### Task 9: Home page (`index.astro`) and canton pages

**Files:**
- Create: `praemienhilfe/src/pages/index.astro`
- Create: `praemienhilfe/src/pages/basel-stadt.astro`
- Create: `praemienhilfe/src/pages/basel-landschaft.astro`

**Interfaces:**
- Consumes: `Base` (Task 7), all section components (Task 8), `cantons` data (Task 2).

- [ ] **Step 1: Write `index.astro` (Basel-Stadt content by default, funnel starts blank at step 1 so the visitor picks their canton)**

```astro
---
// src/pages/index.astro
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import TrustBar from '../components/TrustBar.astro';
import InfoSection from '../components/InfoSection.astro';
import HowItWorks from '../components/HowItWorks.astro';
import ProblemSection from '../components/ProblemSection.astro';
import FAQ from '../components/FAQ.astro';
import FinalCTA from '../components/FinalCTA.astro';
import { cantons } from '../data/cantons.js';

const canton = cantons['basel-stadt'];
---

<Base
  title="Prämienverbilligung beantragen | prämienhilfe.ch"
  description="Prüfen Sie Ihren Anspruch auf Prämienverbilligung kostenlos. Hilfe bei der Beantragung im Kanton Basel-Stadt und Basel-Landschaft."
  canonical="https://praemienhilfe.ch/"
  activePage="home"
>
  <Hero canton={canton} />
  <TrustBar canton={canton} />
  <InfoSection canton={canton} />
  <HowItWorks canton={canton} />
  <ProblemSection />
  <FAQ canton={canton} />
  <FinalCTA />
</Base>
```

- [ ] **Step 2: Write `basel-stadt.astro`**

```astro
---
// src/pages/basel-stadt.astro
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import TrustBar from '../components/TrustBar.astro';
import InfoSection from '../components/InfoSection.astro';
import HowItWorks from '../components/HowItWorks.astro';
import ProblemSection from '../components/ProblemSection.astro';
import FAQ from '../components/FAQ.astro';
import FinalCTA from '../components/FinalCTA.astro';
import { cantons } from '../data/cantons.js';

const canton = cantons['basel-stadt'];
---

<Base
  title="Prämienverbilligung Basel-Stadt | prämienhilfe.ch"
  description="Prämienverbilligung im Kanton Basel-Stadt beantragen. Einkommensgrenze Einzelperson CHF 49'375. Kostenlose Hilfe beim Antrag."
  canonical="https://praemienhilfe.ch/basel-stadt"
  activePage="basel-stadt"
>
  <Hero canton={canton} defaultCanton="Basel-Stadt" />
  <TrustBar canton={canton} />
  <InfoSection canton={canton} />
  <HowItWorks canton={canton} />
  <ProblemSection />
  <FAQ canton={canton} />
  <FinalCTA />
</Base>
```

- [ ] **Step 3: Write `basel-landschaft.astro`**

```astro
---
// src/pages/basel-landschaft.astro
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import TrustBar from '../components/TrustBar.astro';
import InfoSection from '../components/InfoSection.astro';
import HowItWorks from '../components/HowItWorks.astro';
import ProblemSection from '../components/ProblemSection.astro';
import FAQ from '../components/FAQ.astro';
import FinalCTA from '../components/FinalCTA.astro';
import { cantons } from '../data/cantons.js';

const canton = cantons['basel-landschaft'];
---

<Base
  title="Prämienverbilligung Basel-Landschaft | prämienhilfe.ch"
  description="Prämienverbilligung im Kanton Basel-Landschaft beantragen. Kostenlose Hilfe bei Prüfung und Antrag durch die SVA Basel-Landschaft."
  canonical="https://praemienhilfe.ch/basel-landschaft"
  activePage="basel-landschaft"
>
  <Hero canton={canton} defaultCanton="Basel-Landschaft" />
  <TrustBar canton={canton} />
  <InfoSection canton={canton} />
  <HowItWorks canton={canton} />
  <ProblemSection />
  <FAQ canton={canton} />
  <FinalCTA />
</Base>
```

- [ ] **Step 4: Build and fix any errors**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
npm run build
```
Expected: build succeeds with 0 errors. If Tailwind arbitrary classes like `pl-[18px]` or JSX prop-drilling report type errors, fix by adjusting the `Props` interfaces to match actual usage (e.g. widen `canton` prop types) — do not silence with `any` casts beyond what's needed to unblock the build.

- [ ] **Step 5: Commit**

```bash
git add praemienhilfe/src/pages/index.astro praemienhilfe/src/pages/basel-stadt.astro praemienhilfe/src/pages/basel-landschaft.astro
git commit -m "feat: add home page and canton landing pages"
```

---

### Task 10: Secondary pages — so-funktioniert-es, faq, kontakt

**Files:**
- Create: `praemienhilfe/src/pages/so-funktioniert-es.astro`
- Create: `praemienhilfe/src/pages/faq.astro`
- Create: `praemienhilfe/src/pages/kontakt.astro`

**Interfaces:**
- Consumes: `Base`, `HowItWorks`, `FAQ`, `FinalCTA`, `cantons` data. `kontakt.astro` also renders `Hero` (it needs the funnel — that's the main conversion path for a "Kontakt" page) but without the amber trust bar / info section clutter.

- [ ] **Step 1: Write `so-funktioniert-es.astro`**

```astro
---
// src/pages/so-funktioniert-es.astro
import Base from '../layouts/Base.astro';
import HowItWorks from '../components/HowItWorks.astro';
import FinalCTA from '../components/FinalCTA.astro';
import { cantons } from '../data/cantons.js';

const canton = cantons['basel-stadt'];
---

<Base
  title="So funktioniert es | prämienhilfe.ch"
  description="So funktioniert die Beantragung der Prämienverbilligung: Anspruch prüfen, Dossier zusammenstellen, Antrag einreichen."
  canonical="https://praemienhilfe.ch/so-funktioniert-es"
  activePage="ablauf"
>
  <div class="bg-white">
    <div class="max-w-[1240px] mx-auto px-8 pt-16 pb-4">
      <h1 class="text-[32px] md:text-[40px] font-bold tracking-tight m-0">So funktioniert die Beantragung</h1>
      <p class="text-base leading-relaxed text-[#3D4A50] mt-5 max-w-[34em]">
        Von der Prüfung bis zur Einreichung — wir begleiten Sie durch den gesamten Prozess der Prämienverbilligung.
      </p>
    </div>
  </div>
  <HowItWorks canton={canton} />
  <FinalCTA />
</Base>
```

- [ ] **Step 2: Write `faq.astro`**

```astro
---
// src/pages/faq.astro
import Base from '../layouts/Base.astro';
import FAQ from '../components/FAQ.astro';
import FinalCTA from '../components/FinalCTA.astro';
import { cantons } from '../data/cantons.js';

const canton = cantons['basel-stadt'];
---

<Base
  title="Häufige Fragen | prämienhilfe.ch"
  description="Antworten auf häufige Fragen zur Prämienverbilligung: Anspruch, Höhe, Kosten, Bearbeitungsdauer."
  canonical="https://praemienhilfe.ch/faq"
  activePage="faq"
>
  <FAQ canton={canton} />
  <FinalCTA />
</Base>
```

- [ ] **Step 3: Write `kontakt.astro`**

```astro
---
// src/pages/kontakt.astro
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import { cantons } from '../data/cantons.js';

const canton = cantons['basel-stadt'];
---

<Base
  title="Kontakt | prämienhilfe.ch"
  description="Kontaktieren Sie uns für eine kostenlose Prüfung Ihres Anspruchs auf Prämienverbilligung."
  canonical="https://praemienhilfe.ch/kontakt"
  activePage="kontakt"
>
  <Hero canton={canton} />
</Base>
```

- [ ] **Step 4: Build and verify**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
npm run build
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add praemienhilfe/src/pages/so-funktioniert-es.astro praemienhilfe/src/pages/faq.astro praemienhilfe/src/pages/kontakt.astro
git commit -m "feat: add so-funktioniert-es, faq, kontakt pages"
```

---

### Task 11: Legal pages — Impressum, Datenschutz

**Files:**
- Create: `praemienhilfe/src/pages/impressum.astro`
- Create: `praemienhilfe/src/pages/datenschutz.astro`

- [ ] **Step 1: Write `impressum.astro`**

```astro
---
// src/pages/impressum.astro
import Base from '../layouts/Base.astro';
---

<Base
  title="Impressum | prämienhilfe.ch"
  description="Impressum und rechtliche Hinweise zu prämienhilfe.ch, einem Service von EVO Partners Sàrl."
  canonical="https://praemienhilfe.ch/impressum"
>
  <div class="bg-white">
    <div class="max-w-[900px] mx-auto px-8 py-16">
      <h1 class="text-[32px] font-bold tracking-tight m-0">Impressum</h1>
      <div class="mt-8 grid gap-6 text-[16px] leading-relaxed text-[#3D4A50]">
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
        <div>
          <div class="font-semibold text-dark">Haftungsausschluss</div>
          <p class="mt-1">
            prämienhilfe.ch ist eine private Beratungsplattform und unabhängig von den kantonalen Behörden der
            Schweiz. Diese Plattform ist kein offizielles Kantonsorgan. Alle Angaben ohne Gewähr.
          </p>
        </div>
      </div>
    </div>
  </div>
</Base>
```

- [ ] **Step 2: Write `datenschutz.astro`**

```astro
---
// src/pages/datenschutz.astro
import Base from '../layouts/Base.astro';
---

<Base
  title="Datenschutzbestimmungen | prämienhilfe.ch"
  description="Datenschutzbestimmungen von prämienhilfe.ch: welche Daten wir erheben, wie wir sie verwenden und wie wir sie schützen."
  canonical="https://praemienhilfe.ch/datenschutz"
>
  <div class="bg-white">
    <div class="max-w-[900px] mx-auto px-8 py-16">
      <h1 class="text-[32px] font-bold tracking-tight m-0">Datenschutzbestimmungen</h1>
      <div class="mt-8 grid gap-6 text-[16px] leading-relaxed text-[#3D4A50]">
        <div>
          <div class="font-semibold text-dark">Verantwortliche Stelle</div>
          <p class="mt-1">
            EVO Partners Sàrl, Zürich, Schweiz (<a href="mailto:msegui@evo-partners.ch" class="text-teal">msegui@evo-partners.ch</a>)
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Welche Daten wir erheben</div>
          <p class="mt-1">
            Wenn Sie unser Formular ausfüllen, erheben wir Vorname, Nachname, Telefonnummer, E-Mail-Adresse sowie Ihre
            Angaben zu Kanton, Haushaltseinkommen und Haushaltsgrösse. Zusätzlich erfassen wir technische
            Marketing-Attributionsdaten (UTM-Parameter) zur Nachverfolgung, über welchen Kanal Sie zu uns gefunden
            haben.
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Wie wir Ihre Daten verwenden</div>
          <p class="mt-1">
            Ihre Angaben werden ausschliesslich zur Kontaktaufnahme und Beratung im Rahmen der Prüfung Ihres
            Anspruchs auf Prämienverbilligung verwendet und an unser CRM-System (HubSpot) übermittelt. Wir geben Ihre
            Daten nicht an Dritte weiter, ausser dies ist zur Erbringung unserer Beratungsleistung notwendig oder
            gesetzlich vorgeschrieben.
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Ihre Rechte</div>
          <p class="mt-1">
            Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung Ihrer bei uns gespeicherten Daten.
            Kontaktieren Sie uns dazu unter <a href="mailto:msegui@evo-partners.ch" class="text-teal">msegui@evo-partners.ch</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</Base>
```

- [ ] **Step 3: Build and verify**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
npm run build
```
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add praemienhilfe/src/pages/impressum.astro praemienhilfe/src/pages/datenschutz.astro
git commit -m "feat: add Impressum and Datenschutz pages"
```

---

### Task 12: Favicon, netlify.toml, README

**Files:**
- Create: `praemienhilfe/public/favicon.svg`
- Create: `praemienhilfe/netlify.toml`
- Create: `praemienhilfe/README.md`

- [ ] **Step 1: Write the favicon (reuses the header logo mark)**

```svg
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect x="2" y="2" width="24" height="24" rx="6" fill="#0087A0"/>
  <rect x="14" y="14" width="24" height="24" rx="6" fill="#F0A500"/>
  <rect x="14" y="14" width="12" height="12" fill="#005F73"/>
</svg>
```

- [ ] **Step 2: Write `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Note: since `src/pages/api/submit.js` sets `export const prerender = false`, the Astro Netlify adapter automatically deploys it as a Netlify Function and routes `/api/submit` to it ahead of the catch-all redirect above — no extra `netlify.toml` redirect rule is needed for the API route with `@astrojs/netlify`.

- [ ] **Step 3: Write `README.md`**

```markdown
# prämienhilfe.ch

Swiss health-insurance subsidy (Prämienverbilligung) lead-generation site for Basel-Stadt and Basel-Landschaft. Built with Astro, a single React island for the funnel, and Tailwind CSS.

## Setup

\`\`\`bash
npm install
cp .env.example .env
# fill in HUBSPOT_PORTAL_ID, HUBSPOT_FORM_ID, PUBLIC_GA4_ID
npm run dev
\`\`\`

## Environment variables

| Variable | Purpose |
|---|---|
| `HUBSPOT_PORTAL_ID` | HubSpot portal ID for the Forms API submission target |
| `HUBSPOT_FORM_ID` | HubSpot form ID for the Forms API submission target |
| `PUBLIC_GA4_ID` | GA4 measurement ID (e.g. `G-XXXXXXXX`); exposed client-side |

## Build

\`\`\`bash
npm run build
\`\`\`

## Deploy

Connected to Netlify via `netlify.toml` (`npm run build` → `dist/`). Set the environment variables above in the Netlify site dashboard before deploying.

## Known content gap

The Basel-Landschaft income thresholds, beneficiary count, and application deadline in `src/data/cantons.js` are **unverified placeholders** — confirm against the official SVA Basel-Landschaft source and update before launch.
```

- [ ] **Step 4: Commit**

```bash
git add praemienhilfe/public/favicon.svg praemienhilfe/netlify.toml praemienhilfe/README.md
git commit -m "chore: add favicon, netlify config, README"
```

---

### Task 13: Final full-site verification

**Files:** none (verification only).

- [ ] **Step 1: Full production build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe
npm run build
```
Expected: 0 errors, `dist/` contains `index.html`, `basel-stadt/index.html`, `basel-landschaft/index.html`, `so-funktioniert-es/index.html`, `faq/index.html`, `kontakt/index.html`, `impressum/index.html`, `datenschutz/index.html`, and the `api/submit` function bundled by the Netlify adapter.

- [ ] **Step 2: Start dev server and smoke-test in a real browser**

```bash
npm run dev
```
Then, using the browser automation tools: open `http://localhost:4321/`, verify the header/hero/funnel render with correct colors and copy, click through all 4 funnel steps to the thank-you state, resize to a mobile viewport and confirm the hamburger drawer opens/closes and the sticky bottom CTA appears, open the FAQ accordion, and visit `/basel-landschaft` to confirm `defaultCanton` pre-selects Basel-Landschaft and starts the funnel at step 2 ("Schritt 2 von 4").

- [ ] **Step 3: Report results to the user**

Summarize: build status, funnel walkthrough result, mobile check result, and re-flag the Basel-Landschaft placeholder-data caveat from Task 2/12.

- [ ] **Step 4: Final commit (only if Step 2 revealed fixes)**

```bash
git add -A
git commit -m "fix: address issues found during full-site smoke test"
```
(Skip this commit if no fixes were needed.)

---

## Self-Review Notes

- **Spec coverage:** every file in `instructions.md`'s file tree is created (Tasks 0–12); funnel state machine, validation, UTM capture, GA4 events, HubSpot API proxy, SEO props, mobile sticky CTA, Netlify config, `.env.example`, and README are each covered by a specific task. `vercel.json` from instructions.md's deliverables checklist is superseded by `netlify.toml` per the stated deployment target (Netlify) — intentional deviation, called out here rather than silently dropped.
- **Placeholder scan:** the only intentional placeholders are the Basel-Landschaft figures (explicitly flagged as unverified real-world data, not implementation TODOs) and the GA4 ID default `G-XXXXXXXX` (explicitly designed to be overridden via `PUBLIC_GA4_ID`, matching instructions.md's own literal example value).
- **Type/name consistency:** `cantons[slug]` shape defined once in Task 2 and consumed identically (`canton.stats`, `canton.facts`, `canton.faqs`, `canton.steps`, `canton.infoParagraphs`, `canton.closingParagraph`, `canton.heroProof`) by every component in Task 8 and every page in Tasks 9–10. `Funnel` prop is `defaultCanton` everywhere it's used (Hero.astro passthrough, canton pages).
