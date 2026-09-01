# National Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `src/pages/index.astro` into a true national homepage (canton selector, 10 content sections) per `instructions.md` (2026-09-01 "national homepage" brief), while `src/pages/basel-stadt.astro` and `src/pages/basel-landschaft.astro` keep serving their existing canton-specific content unchanged.

**Architecture:** New homepage-only content lives in a new data file (`src/data/national.js`) and five new single-purpose Astro components (`CantonSelector`, `WasIstSection`, `KantoneGrid`, `WerWirSindSection`, `DeadlineSection`). Two existing shared components (`HowItWorks.astro`, `ProblemSection.astro`) are generalized with props so the homepage can reuse them with different copy instead of duplicating markup. `Hero.astro` gains a `variant="national"` path. Shared chrome (`Header.astro`, `Footer.astro`) gets small content updates that apply site-wide, matching the brief's explicit "same as existing site BUT update columns 2/3" instruction.

**Tech Stack:** Astro 7 + Tailwind v4 (via `@tailwindcss/vite`, config through `@config` in `global.css`). No new dependencies, no new React islands (per brief §PERFORMANCE — pure Astro static HTML, plus the existing global smooth-scroll script in `Base.astro`).

## Global Constraints

- Working directory for all file paths below: `/Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch/` (paths given relative to this).
- `/basel-stadt` and `/basel-landschaft` pages must render **identically** to their current output after this plan — verify with `git diff` showing no changes to `src/pages/basel-stadt.astro`, `src/pages/basel-landschaft.astro`, or `src/data/cantons.js`'s existing keys after each task.
- Cross-page anchor convention already established in this codebase: links that target a same-page anchor from *other* pages are written as `/#id` (see `Header.astro`, `FinalCTA.astro`, `Footer.astro`, `Base.astro`'s mobile sticky bar, all pointing at `/#pruefen`, which is `Hero.astro`'s `id="pruefen"`). Follow the same pattern for the new Footer "Informationen" column: links to homepage-only sections are `/#was-ist`, `/#so-funktioniert-es`, `/#faq`, `/#wer-wir-sind` (leading `/` — they must work from every page, not just from `/`). Do NOT write bare `#id` for these.
- `Hero.astro` keeps `id="pruefen"` on its outer `<section>` for the national variant too (this is what `StickyFunnelWidget.jsx`'s `document.querySelector('#pruefen')` and every `/#pruefen` link across the site resolve to — removing it breaks those on the homepage). The canton-selector card *inside* that section additionally gets its own `id="kanton-selector"`, which is what the brief's own anchor list and the new Footer/FinalCTA links target from within the homepage.
- Company legal name is **"EVO Partners GmbH"** (already correct everywhere — confirmed via `grep -rn "Sàrl" src/` returning no matches; no rename work needed in this plan).
- No phone/email currently appears in `Footer.astro` (confirmed via grep) — no removal work needed there.
- Basel-Landschaft's `facts` beneficiary count (`ca. 20'000`) is already flagged `(unverifiziert)` in `src/data/cantons.js` from the prior refactor. The new Section 4 canton card must stay numerically consistent with that existing flagged figure rather than introduce a second, different unverified number (the brief's ASCII mockup shows an illustrative "ca. 25'000" for Basel-Landschaft) — Task 1 derives the new `overviewCard` fields from the existing `facts` array so both places agree.
- Tailwind custom colors (unchanged): `teal` `#0087A0`/dark `#005F73`/light `#E8F4F8`, `amber` `#F0A500`/light `#FFF8E7`, `swiss.red` `#CC0000`, `swiss.green` `#3D8B37`, `dark` `#1A1A2A`. Section background colors from the brief that aren't Tailwind tokens are applied the same way the existing `HowItWorks.astro` does it — inline `style="background: #F0F7F0"` (light green) — and `bg-[#F5F7F8]` / `bg-[#E8F4F8]` / `bg-[#FFF8E7]` arbitrary-value classes (light gray / light teal / amber-light) exactly as `FAQ.astro` and `TrustBar.astro` already do.
- No test framework is configured (`package.json` has no `test` script). Verification is `cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch && npm run build` (must exit 0, zero errors) after every task that touches `.astro`/`.js` files, plus the manual checklist in Task 10.
- Every new/changed section that carries an anchor `id` from the brief's anchor list must have exactly that `id` string: `kanton-selector`, `was-ist`, `so-funktioniert-es`, `wer-wir-sind`, `faq`.

---

### Task 1: Data layer — `cantons.js` addition + new `national.js`

**Files:**
- Modify: `src/data/cantons.js`
- Create: `src/data/national.js`

**Interfaces:**
- Produces: `cantons['basel-stadt'].overviewCard` / `cantons['basel-landschaft'].overviewCard` — `{ bezueger: string, frist: string, zustaendig: string }`, consumed by Task 5's `KantoneGrid.astro`.
- Produces: `src/data/national.js` exports — `heroCopy`, `nationalStats`, `heroComingSoonCantons`, `gridComingSoonCantons`, `wasIst`, `whySection`, `howItWorksSteps`, `werWirSind`, `nationalFaqs`, `deadlines` — consumed by Tasks 2–9.

- [ ] **Step 1: Add `overviewCard` to both cantons in `cantons.js`**

In `src/data/cantons.js`, add an `overviewCard` field to `cantons['basel-stadt']` right after `officeNameFull:`:

```js
    officeNameFull: 'Amt für Sozialbeiträge Basel-Stadt',
    overviewCard: {
      bezueger: "ca. 30'000 Bezüger",
      frist: 'Frist: September – 31. Dezember 2026',
      zustaendig: 'Zuständig: ASB Basel-Stadt',
    },
    closingParagraph,
```

And to `cantons['basel-landschaft']`, right after its `officeNameFull:`:

```js
    officeNameFull: 'SVA Basel-Landschaft',
    overviewCard: {
      bezueger: "ca. 20'000 Bezüger (unverifiziert)",
      frist: 'Frist: September – 31. Dezember 2026 (unverifiziert)',
      zustaendig: 'Zuständig: SVA Basel-Landschaft',
    },
    closingParagraph,
```

(These values are read straight from the existing `facts` arrays for each canton — no new figures invented, per the Global Constraints note on Basel-Landschaft's unverified beneficiary count.)

- [ ] **Step 2: Create `src/data/national.js`**

```js
// src/data/national.js

export const heroCopy = {
  title: 'Prämienverbilligung beantragen — in jedem Kanton',
  paragraph:
    'Die Prämienverbilligung (IPV) steht Tausenden von Schweizer Einwohnerinnen und Einwohnern zu — doch viele beantragen sie nie. Wir helfen Ihnen, Ihren Anspruch zu prüfen und Ihren Antrag korrekt einzureichen. Kostenlos und unverbindlich.',
  proof: "Über 1'000 Dossiers erfolgreich bearbeitet",
};

export const nationalStats = [
  { value: "1'000+", label: 'Dossiers pro Jahr' },
  { value: "CHF 500–3'000", label: 'Ersparnis/Jahr' },
  { value: '20 Minuten', label: 'Erstgespräch' },
  { value: 'FINMA', label: 'Registriert' },
];

// Shown in the hero canton-selector card (6 grayed-out rows, per instructions.md §Section 1)
export const heroComingSoonCantons = ['Zürich', 'Bern', 'Aargau', 'Luzern', 'Solothurn', 'Genf'];

// Shown as grayed-out cards in the Section 4 grid (4 cards, per instructions.md §Section 4)
export const gridComingSoonCantons = ['Zürich', 'Bern', 'Aargau', 'Luzern'];

export const wasIst = {
  // First paragraph is split around the phrase that becomes an inline link
  // to /so-funktioniert-es (instructions.md §INTERNAL LINKING FOR SEO).
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
  boxText:
    'Über 2.4 Millionen Personen in der Schweiz haben Anspruch auf Prämienverbilligung — viele beantragen sie jedoch nie.',
  boxStat: 'CHF 1.5 Mrd.',
  boxStatLabel: 'werden jährlich als Prämienverbilligung ausbezahlt',
};

export const whySection = {
  intro:
    'Über 2.4 Millionen Schweizerinnen und Schweizer haben Anspruch auf finanzielle Unterstützung bei den Krankenkassenprämien. Ein grosser Teil davon stellt jedoch nie einen Antrag. Die häufigsten Gründe:',
  reasons: [
    {
      title: 'Zu kompliziert',
      text: 'Jeder Kanton hat eigene Formulare, Fristen und Anforderungen. Das Verfahren wirkt auf den ersten Blick aufwendig.',
    },
    {
      title: 'Unsicher über den Anspruch',
      text: 'Viele Personen glauben, sie hätten keinen Anspruch, obwohl sie berechtigt wären. Die Einkommensgrenzen sind grosszügiger als oft angenommen.',
    },
    {
      title: 'Fristen verpasst',
      text: 'Die Anmeldefristen variieren je nach Kanton und werden oft übersehen. Ein verpasster Antrag bedeutet ein verlorenes Jahr Verbilligung.',
    },
    {
      title: 'Keine Zeit',
      text: 'Das Zusammenstellen der Unterlagen und das Ausfüllen der Formulare kostet Zeit, die viele nicht haben.',
    },
  ],
  closing: 'Genau hier setzen wir an. Wir kennen die Anforderungen jedes Kantons und begleiten Sie durch den gesamten Prozess.',
};

export const howItWorksSteps = [
  {
    n: '1',
    title: 'Kanton wählen und Situation angeben',
    text: 'Wählen Sie Ihren Wohnkanton und beschreiben Sie kurz Ihre persönliche Situation — ob Einzelperson, Familie, Student oder Rentner. Das dauert weniger als 2 Minuten.',
  },
  {
    n: '2',
    title: 'Kostenlose Prüfung durch unsere Experten',
    text: 'Wir analysieren Ihre Situation und prüfen, ob und in welcher Höhe Sie Anspruch auf Prämienverbilligung haben. Wir kennen die genauen Kriterien und Fristen jedes Kantons.',
  },
  {
    n: '3',
    title: 'Dossier zusammenstellen',
    text: 'Wir helfen Ihnen, alle notwendigen Unterlagen korrekt zusammenzustellen: Steuererklärung, Versicherungspolice, Lohnabrechnungen und weitere Dokumente je nach Kanton.',
  },
  {
    n: '4',
    title: 'Antrag einreichen',
    text: 'Den Antrag reichen wir gemeinsam mit Ihnen beim zuständigen Kantonsamt ein. Sie erhalten danach innerhalb weniger Wochen einen Entscheid vom Kanton.',
  },
];

export const werWirSind = {
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
  closing:
    'Die Hilfe bei der Prämienverbilligung ist für Sie vollständig kostenlos. Als FINMA-registrierter Broker werden wir durch unsere Versicherungspartner vergütet, wenn wir eine Optimierung Ihrer Krankenversicherung empfehlen. Es besteht keinerlei Verpflichtung dazu.',
  trustItems: [
    'FINMA-registrierter Versicherungsbroker',
    "Über 1'000 Dossiers bearbeitet seit 2020",
    'Unabhängig von Kantonen und Versicherern',
    'Keinerlei Verpflichtung für den Klienten',
  ],
  rating: '4.8/5 Kundenbewertung',
};

export const nationalFaqs = [
  {
    q: 'Wer hat schweizweit Anspruch auf Prämienverbilligung?',
    a: 'Jede Person mit Wohnsitz in der Schweiz, deren steuerbares Einkommen und Vermögen unterhalb der kantonal festgelegten Grenze liegt. Die Grenzen variieren je nach Kanton und Haushaltsgrösse erheblich. Auch Personen, die glauben, zu viel zu verdienen, sollten ihren Anspruch prüfen lassen. Über 2.4 Millionen Personen sind schweizweit berechtigt.',
  },
  {
    q: 'Kann ich für mehrere Personen einen Antrag stellen?',
    a: 'Ja. Ein Antrag gilt pro Haushalt und kann alle versicherten Personen einschliessen — Partner, Kinder und weitere Haushaltsangehörige. Kinder und Jugendliche bis 25 Jahre in Erstausbildung haben häufig erhöhten Anspruch.',
  },
  {
    q: 'Muss ich jedes Jahr einen neuen Antrag stellen?',
    a: 'In den meisten Kantonen ja — die Prämienverbilligung wird jährlich neu beantragt. In einigen Kantonen erfolgt eine automatische Berechnung aufgrund der Steuerdaten. Wir informieren Sie über die genaue Regelung in Ihrem Kanton.',
  },
  {
    q: 'Was kostet mich dieser Service?',
    a: 'Die Hilfe bei der Prämienverbilligung ist für Sie vollständig kostenlos. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners GmbH) und werden nicht direkt von Ihnen vergütet.',
  },
  {
    q: 'Sind Sie ein offizielles Kantonsamt?',
    a: 'Nein. prämienhilfe.ch ist eine private, unabhängige Beratungsplattform. Wir sind kein staatliches Organ. Den Antrag können Sie auch direkt beim zuständigen Kantonsamt stellen. Wir erleichtern Ihnen diesen Prozess und prüfen gleichzeitig, ob Ihre Versicherungssituation optimiert werden kann.',
  },
  {
    q: 'Was passiert nach dem Erstgespräch?',
    a: 'Sie erhalten eine Zusammenfassung Ihrer Situation sowie klare Handlungsempfehlungen. Wenn Sie möchten, begleiten wir Sie bei der Zusammenstellung des Dossiers und der Einreichung beim Kantonsamt. Es besteht keinerlei Verpflichtung.',
  },
];

export const deadlines = [
  { canton: 'Basel-Stadt', frist: 'September – 31. Dezember 2026' },
  { canton: 'Basel-Landschaft', frist: 'September – 31. Dezember 2026' },
  { canton: 'Zürich', frist: 'Oktober – 31. Dezember 2026' },
  { canton: 'Bern', frist: 'Oktober – 31. Dezember 2026' },
];
```

- [ ] **Step 3: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
node -e "
import('./src/data/national.js').then(m => {
  console.log('nationalStats:', m.nationalStats.length);
  console.log('heroComingSoonCantons:', m.heroComingSoonCantons.length);
  console.log('gridComingSoonCantons:', m.gridComingSoonCantons.length);
  console.log('howItWorksSteps:', m.howItWorksSteps.length);
  console.log('nationalFaqs:', m.nationalFaqs.length);
  console.log('deadlines:', m.deadlines.length);
});
import('./src/data/cantons.js').then(m => {
  console.log('BS overviewCard:', m.cantons['basel-stadt'].overviewCard);
  console.log('BL overviewCard:', m.cantons['basel-landschaft'].overviewCard);
});
"
npm run build
```
Expected: counts `4, 6, 4, 4, 6, 4`, both `overviewCard` objects printed, build exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/data/cantons.js src/data/national.js
git commit -m "feat: add national-homepage content data"
```

---

### Task 2: `CantonSelector.astro` (hero canton-selector card)

**Files:**
- Create: `src/components/CantonSelector.astro`

**Interfaces:**
- Consumes: `cantonList` from `src/data/cantons.js` (`{ slug, name }`), `heroComingSoonCantons` from `src/data/national.js`.
- Produces: exports a component with no props, rendering a `<div id="kanton-selector">` — consumed by Task 3's `Hero.astro`.

- [ ] **Step 1: Write the component**

```astro
---
// src/components/CantonSelector.astro
import { cantonList } from '../data/cantons.js';
import { heroComingSoonCantons } from '../data/national.js';
---

<div id="kanton-selector" class="mt-8 bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7">
  <div class="text-xs font-semibold tracking-wide uppercase text-teal">Schritt 1 von 1</div>
  <div class="text-xl font-bold mt-1.5 mb-4 tracking-tight">In welchem Kanton wohnen Sie?</div>
  <div class="grid gap-2.5">
    {
      cantonList.map((c) => (
        <a
          href={`/${c.slug}`}
          onclick={`if (window.gtag) window.gtag('event', 'homepage_canton_selected', { canton: '${c.slug}' })`}
          class="w-full flex items-center justify-between gap-4 text-left rounded-md text-[15.5px] font-medium text-dark bg-white border border-[#D6DFE2] px-[18px] py-[15px] no-underline transition-colors hover:border-teal hover:bg-teal-light"
        >
          <span class="flex items-center gap-3.5">
            <span class="text-lg leading-none" aria-hidden="true">🏛</span>
            <span>{c.name}</span>
          </span>
          <span class="text-teal font-bold">→</span>
        </a>
      ))
    }
    {
      heroComingSoonCantons.map((name, i) => (
        <div
          class:list={[
            'w-full flex items-center justify-between gap-4 rounded-md text-[15.5px] font-medium text-[#A9B4B9] bg-white border border-[#EEF2F3] px-[18px] py-[15px] opacity-40 cursor-not-allowed',
            i >= 4 && 'hidden md:flex',
          ]}
        >
          <span class="flex items-center gap-3.5">
            <span class="text-lg leading-none" aria-hidden="true">🏛</span>
            <span>{name}</span>
          </span>
          <span class="text-[11px] font-semibold uppercase tracking-wide bg-[#F5F7F8] border border-[#E2E8EA] rounded px-2 py-1">Demnächst</span>
        </div>
      ))
    }
  </div>
</div>
```

(The `i >= 4 && 'hidden md:flex'` clause implements the brief's "Coming soon cantons: hide after 4th one on mobile" — rows 5 and 6 are hidden below the `md` breakpoint, visible at `md` and up.)

- [ ] **Step 2: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: exits 0, no errors referencing `CantonSelector.astro`.

- [ ] **Step 3: Commit**

```bash
git add src/components/CantonSelector.astro
git commit -m "feat: add CantonSelector component for national homepage hero"
```

---

### Task 3: `Hero.astro` — national variant

**Files:**
- Modify: `src/components/Hero.astro`

**Interfaces:**
- Consumes: `CantonSelector.astro` (Task 2), `heroCopy` from `src/data/national.js`.
- Produces: `Hero.astro` accepts a new optional `variant?: 'canton' | 'national'` prop (default `'canton'`, preserving all existing call sites unchanged).

- [ ] **Step 1: Add the `variant` prop and national copy branch**

Change the frontmatter:

```astro
---
// src/components/Hero.astro
import { Image } from 'astro:assets';
import Funnel from './Funnel.jsx';
import SituationSelector from './SituationSelector.astro';
import CantonSelector from './CantonSelector.astro';
import heroPhoto from '../assets/hero-photo.jpg';
import { heroCopy } from '../data/national.js';

export interface Props {
  canton?: { name: string; heroProof: string };
  defaultCanton?: string;
  useSituationFunnel?: boolean;
  variant?: 'canton' | 'national';
}
const { canton, defaultCanton, useSituationFunnel = true, variant = 'canton' } = Astro.props;
const isNational = variant === 'national';
---
```

(`canton` becomes optional since the national variant doesn't pass one.)

Change the H1 + paragraph + selector block:

```astro
      <div>
        <h1 class="text-[32px] md:text-[48px] leading-[1.08] font-bold tracking-tight m-0">
          {isNational ? heroCopy.title : useSituationFunnel ? 'Prämienverbilligung Basel-Stadt — Anspruch prüfen und Antrag stellen' : 'Haben Sie Anspruch auf Prämienverbilligung?'}
        </h1>
        <p class="text-base leading-[1.68] text-[#3D4A50] mt-5 max-w-[34em]">
          {isNational
            ? heroCopy.paragraph
            : 'Der Kanton gewährt Einwohnerinnen und Einwohnern in bescheidenen wirtschaftlichen Verhältnissen Beiträge zur Reduktion der Krankenkassenprämien. Wir helfen Ihnen, Ihren Anspruch zu prüfen und Ihren Antrag korrekt einzureichen.'}
        </p>

        {isNational ? <CantonSelector /> : useSituationFunnel ? <SituationSelector /> : <Funnel client:load defaultCanton={defaultCanton} />}
      </div>
```

Change the floating proof card to use `heroCopy.proof` for the national variant, `canton.heroProof` otherwise:

```astro
          <div class="text-[13.5px] leading-snug text-dark">{isNational ? heroCopy.proof : canton?.heroProof}</div>
```

- [ ] **Step 2: Verify existing canton pages are unaffected**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
git diff src/pages/basel-stadt.astro src/pages/basel-landschaft.astro src/pages/kontakt.astro
```
Expected: empty output (this task only touches `Hero.astro`; those pages don't pass `variant`, so `variant` defaults to `'canton'` and their output is unchanged).

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: add national variant to Hero component"
```

---

### Task 4: `WasIstSection.astro` (Section 3 — "Was ist die Prämienverbilligung?")

**Files:**
- Create: `src/components/WasIstSection.astro`

**Interfaces:**
- Consumes: `wasIst` from `src/data/national.js`.
- Produces: `<section id="was-ist">` — consumed by Task 9's `index.astro`.

- [ ] **Step 1: Write the component**

```astro
---
// src/components/WasIstSection.astro
import { wasIst } from '../data/national.js';
---

<section id="was-ist" class="bg-white">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 max-w-[26em] leading-tight">
      Was ist die Prämienverbilligung?
    </h2>
    <div class="mt-[34px] grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-11 items-start">
      <div>
        <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-0">
          {wasIst.introBefore}<a href="/so-funktioniert-es" class="text-teal hover:text-teal-dark">{wasIst.introLinkText}</a>{wasIst.introAfter}
        </p>
        {wasIst.paragraphs.map((p) => <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-[18px]">{p}</p>)}
        <div class="mt-7 grid gap-2.5">
          {
            wasIst.bullets.map((b) => (
              <div class="flex items-baseline gap-3.5 text-base leading-relaxed">
                <span class="w-2 h-2 rounded-full bg-swiss-red flex-shrink-0 -translate-y-px" />
                <span class="text-[#3D4A50]">{b}</span>
              </div>
            ))
          }
        </div>
      </div>
      <div class="bg-teal-light border-l-4 border-teal rounded-r-lg px-6 py-6">
        <div class="text-lg font-bold tracking-tight">{wasIst.boxTitle}</div>
        <p class="text-[15px] leading-relaxed text-[#3D4A50] mt-3">{wasIst.boxText}</p>
        <div class="mt-5 pt-5 border-t border-teal/20">
          <div class="text-2xl font-bold tracking-tight text-teal-dark">{wasIst.boxStat}</div>
          <div class="text-[13.5px] text-[#3D4A50] mt-1.5 leading-snug">{wasIst.boxStatLabel}</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/WasIstSection.astro
git commit -m "feat: add WasIstSection component"
```

---

### Task 5: `KantoneGrid.astro` (Section 4 — canton cards)

**Files:**
- Create: `src/components/KantoneGrid.astro`

**Interfaces:**
- Consumes: `cantonList` from `src/data/cantons.js` (uses `.slug`, `.name`, `.overviewCard` added in Task 1), `gridComingSoonCantons` from `src/data/national.js`.
- Produces: `<section id="kantone-grid">` — consumed by Task 9's `index.astro`. Internal links use `internalLinkLabel` per canton for the SEO cross-link required by the brief's §INTERNAL LINKING FOR SEO ("Mehr erfahren → Prämienverbilligung Basel-Stadt").

- [ ] **Step 1: Write the component**

```astro
---
// src/components/KantoneGrid.astro
import { cantonList } from '../data/cantons.js';
import { gridComingSoonCantons } from '../data/national.js';
---

<section id="kantone-grid" class="bg-[#F5F7F8]">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0">Wählen Sie Ihren Kanton</h2>
    <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-[18px] max-w-[44em]">
      Jeder Kanton hat eigene Einkommensgrenzen, Fristen und zuständige Stellen. Wählen Sie Ihren Kanton für alle
      relevanten Informationen und die direkte Antragstellung.
    </p>

    <div class="mt-9 grid grid-cols-1 md:grid-cols-2 gap-6">
      {
        cantonList.map((c) => (
          <div class="bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-6 pt-6 pb-6">
            <div class="text-lg font-bold tracking-tight flex items-center gap-2.5">
              <span aria-hidden="true">🏛️</span>
              <span>{c.name}</span>
            </div>
            <div class="h-px bg-[#E2E8EA] my-4" />
            <div class="grid gap-1.5 text-[14.5px] text-[#3D4A50]">
              <div>{c.overviewCard.bezueger}</div>
              <div>{c.overviewCard.frist}</div>
              <div>{c.overviewCard.zustaendig}</div>
            </div>
            <a
              href={`/${c.slug}`}
              class="mt-5 block text-center px-5 py-3 bg-teal text-white rounded-md text-[15px] font-bold no-underline hover:bg-teal-dark"
            >
              Antrag stellen →
            </a>
            <a href={`/${c.slug}`} class="mt-3 block text-[13.5px] text-teal hover:text-teal-dark no-underline">
              Mehr erfahren → Prämienverbilligung {c.name}
            </a>
          </div>
        ))
      }
      {
        gridComingSoonCantons.map((name) => (
          <div class="bg-white border border-[#EEF2F3] rounded-[10px] px-6 pt-6 pb-6 opacity-50">
            <div class="text-lg font-bold tracking-tight flex items-center gap-2.5 text-[#6B7A80]">
              <span aria-hidden="true">🏛️</span>
              <span>{name}</span>
            </div>
            <div class="h-px bg-[#EEF2F3] my-4" />
            <div class="text-[14.5px] text-[#A9B4B9]">Demnächst verfügbar</div>
          </div>
        ))
      }
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: exits 0. (This is also the first real exercise of Task 1's `overviewCard` fields — a typo there would surface as a build/render error here.)

- [ ] **Step 3: Commit**

```bash
git add src/components/KantoneGrid.astro
git commit -m "feat: add KantoneGrid component"
```

---

### Task 6: Generalize `HowItWorks.astro` and `ProblemSection.astro`

**Files:**
- Modify: `src/components/HowItWorks.astro`
- Modify: `src/components/ProblemSection.astro`
- Modify: `src/pages/basel-stadt.astro`
- Modify: `src/pages/basel-landschaft.astro`
- Modify: `src/pages/so-funktioniert-es.astro`

**Interfaces:**
- Produces: `HowItWorks.astro` Props change from `{ canton: { steps } }` to `{ steps, heading?, id? }` (heading defaults to `'So funktioniert die Beantragung'`, id defaults to `'ablauf'`).
- Produces: `ProblemSection.astro` Props change from none to `{ heading?, intro?, reasons?, closing? }`, all defaulting to the component's current hardcoded content (so `<ProblemSection />` with no props renders byte-identical output to today).

- [ ] **Step 1: Update `HowItWorks.astro`**

```astro
---
// src/components/HowItWorks.astro
export interface Props {
  steps: { n: string; title: string; text: string }[];
  heading?: string;
  id?: string;
}
const { steps, heading = 'So funktioniert die Beantragung', id = 'ablauf' } = Astro.props;
---

<section id={id} style="background: #F0F7F0">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 text-[#2E6B29]">{heading}</h2>
    <div class="max-w-[48em] mt-[34px] grid gap-8">
      {
        steps.map((st) => (
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

- [ ] **Step 2: Update `ProblemSection.astro`**

```astro
---
// src/components/ProblemSection.astro
export interface Props {
  heading?: string;
  intro?: string;
  reasons?: { title: string; text: string }[];
  closing?: string;
}
const {
  heading = 'Warum beantragen viele Berechtigte keine Prämienverbilligung?',
  intro = 'Obwohl Tausende von Personen Anspruch hätten, stellen viele keinen Antrag. Die häufigsten Gründe: Das Verfahren wirkt kompliziert, viele wissen nicht ob sie berechtigt sind, und die Fristen werden oft verpasst. Dabei ist der Prozess einfacher als erwartet — vorausgesetzt, man kennt die genauen Anforderungen und Fristen.',
  reasons = [
    { title: 'Zu kompliziert', text: 'Das Antragsverfahren wirkt aufwendig' },
    { title: 'Unsicher', text: 'Viele wissen nicht ob sie berechtigt sind' },
    { title: 'Keine Zeit', text: 'Fristen werden oft verpasst' },
  ],
  closing,
} = Astro.props;
---

<section class="bg-white">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 max-w-[26em] leading-tight">{heading}</h2>
    <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-[22px] max-w-[44em]">{intro}</p>
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
    {closing && <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-7 max-w-[44em]">{closing}</p>}
  </div>
</section>
```

- [ ] **Step 3: Update the three existing `HowItWorks` call sites to pass `steps` instead of `canton`**

In `src/pages/basel-stadt.astro`, `src/pages/basel-landschaft.astro`, and `src/pages/so-funktioniert-es.astro`, change:

```astro
  <HowItWorks canton={canton} />
```

to:

```astro
  <HowItWorks steps={canton.steps} />
```

(One occurrence per file; `ProblemSection` call sites — `<ProblemSection />` with no props — need no change, since Step 2's defaults reproduce today's output exactly.)

- [ ] **Step 4: Verify no visual regression on existing pages**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: exits 0.

```bash
git diff --stat src/pages/basel-stadt.astro src/pages/basel-landschaft.astro src/pages/so-funktioniert-es.astro
```
Expected: exactly 1 line changed per file (the `HowItWorks` call).

- [ ] **Step 5: Commit**

```bash
git add src/components/HowItWorks.astro src/components/ProblemSection.astro src/pages/basel-stadt.astro src/pages/basel-landschaft.astro src/pages/so-funktioniert-es.astro
git commit -m "refactor: generalize HowItWorks and ProblemSection with content props"
```

---

### Task 7: `WerWirSindSection.astro` (Section 7 — "Wer steckt hinter prämienhilfe.ch?")

**Files:**
- Create: `src/components/WerWirSindSection.astro`

**Interfaces:**
- Consumes: `werWirSind` from `src/data/national.js`.
- Produces: `<section id="wer-wir-sind">` — consumed by Task 9's `index.astro`.

- [ ] **Step 1: Write the component**

```astro
---
// src/components/WerWirSindSection.astro
import { werWirSind } from '../data/national.js';
---

<section id="wer-wir-sind" class="bg-teal-light">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 max-w-[26em] leading-tight">
      Wer steckt hinter prämienhilfe.ch?
    </h2>
    <div class="mt-[34px] grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-11 items-start">
      <div>
        {werWirSind.paragraphs.map((p) => <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-[18px] first:mt-0">{p}</p>)}
        <div class="mt-4 grid gap-2.5">
          {
            werWirSind.bullets.map((b) => (
              <div class="flex items-baseline gap-3.5 text-base leading-relaxed">
                <span class="w-2 h-2 rounded-full bg-swiss-red flex-shrink-0 -translate-y-px" />
                <span class="text-[#3D4A50]">{b}</span>
              </div>
            ))
          }
        </div>
        <p class="text-[16.5px] leading-[1.7] text-[#3D4A50] mt-7">{werWirSind.closing}</p>
      </div>
      <div class="bg-white border border-teal/30 rounded-lg px-6 py-6">
        <div class="grid gap-3">
          {
            werWirSind.trustItems.map((t) => (
              <div class="flex items-start gap-2.5 text-[14.5px] text-dark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3D8B37" stroke-width="2.6" stroke-linecap="round" class="flex-shrink-0 mt-0.5" aria-hidden="true">
                  <path d="M4 13l5 5L20 7" />
                </svg>
                <span>{t}</span>
              </div>
            ))
          }
        </div>
        <div class="h-px bg-[#E2E8EA] my-4" />
        <div class="text-amber text-[15px] tracking-wide" aria-hidden="true">★★★★★</div>
        <div class="text-[13.5px] text-[#3D4A50] mt-1">{werWirSind.rating}</div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/WerWirSindSection.astro
git commit -m "feat: add WerWirSindSection component"
```

---

### Task 8: `DeadlineSection.astro` (Section 9) + extend `FinalCTA.astro` (Section 10)

**Files:**
- Create: `src/components/DeadlineSection.astro`
- Modify: `src/components/FinalCTA.astro`

**Interfaces:**
- `DeadlineSection.astro` consumes `deadlines` from `src/data/national.js`, no props.
- `FinalCTA.astro` Props change from none to `{ heading?, text?, buttons?, disclaimer? }`, all defaulting to today's exact content (two `/#pruefen` buttons, no disclaimer) — every existing `<FinalCTA />` call site (`basel-stadt.astro`, `basel-landschaft.astro`, `faq.astro`, `so-funktioniert-es.astro`) needs no change.

- [ ] **Step 1: Write `DeadlineSection.astro`**

```astro
---
// src/components/DeadlineSection.astro
import { deadlines } from '../data/national.js';
---

<section class="bg-white">
  <div class="max-w-[1240px] mx-auto px-8 py-[52px] md:py-[74px]">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0">Verpassen Sie nicht die Antragsfrist</h2>

    <div class="mt-6 bg-[#FFF8E7] border border-amber/40 rounded-lg px-6 py-4 text-[15.5px] font-semibold text-[#7A6836] max-w-[44em]">
      ⚠️ Die Antragsfristen für 2027 laufen bald ab.
    </div>

    <div class="mt-7 max-w-[44em] border-l-4 border-teal">
      <div class="grid grid-cols-2 gap-1 px-[18px] py-[13px] bg-[#F5F7F8] text-[13.5px] font-semibold uppercase tracking-wide text-[#6B7A80]">
        <div>Kanton</div>
        <div>Antragsfrist</div>
      </div>
      {
        deadlines.map((d, i) => (
          <div
            class="grid grid-cols-2 gap-1 px-[18px] py-[13px]"
            style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F5F7F8' }}
          >
            <div class="text-[15.5px] font-semibold">{d.canton}</div>
            <div class="text-[15px] text-[#3D4A50]">{d.frist}</div>
          </div>
        ))
      }
    </div>

    <p class="text-[16.5px] leading-[1.7] mt-7 max-w-[44em] font-bold text-swiss-red">
      Wer die Frist verpasst, verliert die Verbilligung für das gesamte Jahr — das können CHF 500 bis CHF 3'000 sein.
    </p>
  </div>
</section>
```

- [ ] **Step 2: Extend `FinalCTA.astro` with configurable content**

```astro
---
// src/components/FinalCTA.astro
export interface Props {
  heading?: string;
  text?: string;
  buttons?: { label: string; href: string }[];
  disclaimer?: string;
}
const {
  heading = 'Jetzt Anspruch prüfen lassen',
  text = 'Vereinbaren Sie ein Erstgespräch. Wir begleiten Sie von der Prüfung bis zur Einreichung.',
  buttons = [
    { label: 'Antrag prüfen lassen →', href: '/#pruefen' },
    { label: 'Formular ausfüllen →', href: '/#pruefen' },
  ],
  disclaimer,
} = Astro.props;
---

<section id="kontakt" class="bg-teal text-white">
  <div class="max-w-[1240px] mx-auto px-8 py-16">
    <div class="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-11 items-center">
      <div>
        <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 text-white">{heading}</h2>
        <p class="text-[16.5px] leading-relaxed mt-3.5 text-[#DDF0F4] max-w-[34em]">{text}</p>
      </div>
      <div class="flex flex-col gap-2.5">
        {buttons.map((b, i) =>
          i === 0 ? (
            <a href={b.href} class="block text-center px-5 py-[17px] bg-white text-teal-dark rounded-md text-[16.5px] font-bold no-underline hover:bg-teal-light">
              {b.label}
            </a>
          ) : (
            <a href={b.href} class="flex items-center justify-center gap-2.5 px-5 py-[17px] bg-transparent text-white border border-white/60 rounded-md text-[16.5px] font-semibold no-underline hover:bg-white/10">
              {b.label}
            </a>
          )
        )}
        {disclaimer && <p class="text-[12.5px] leading-relaxed text-[#BFE4EB] mt-1">{disclaimer}</p>}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify no visual regression on existing pages, then build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
git diff --stat src/pages/basel-stadt.astro src/pages/basel-landschaft.astro src/pages/faq.astro src/pages/so-funktioniert-es.astro
```
Expected: empty (no page file changed in this task — all four `<FinalCTA />` call sites need zero edits since every new prop defaults to current content).

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/DeadlineSection.astro src/components/FinalCTA.astro
git commit -m "feat: add DeadlineSection and make FinalCTA content configurable"
```

---

### Task 9: Assemble the new `src/pages/index.astro`

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Hero.astro` (`variant="national"`, Task 3), `TrustBar.astro` (existing, passing `nationalStats`), `WasIstSection.astro` (Task 4), `KantoneGrid.astro` (Task 5), `HowItWorks.astro` (Task 6, with `heading`/`id`/`steps` overrides), `ProblemSection.astro` (Task 6, with overrides), `WerWirSindSection.astro` (Task 7), `FAQ.astro` (existing, passing `{ faqs: nationalFaqs }`), `DeadlineSection.astro` (Task 8), `FinalCTA.astro` (Task 8, with overrides).

- [ ] **Step 1: Note `TrustBar`'s and `FAQ`'s existing prop shape**

`TrustBar.astro` takes `canton: { stats }` — pass `canton={{ stats: nationalStats }}`. `FAQ.astro` takes `canton: { faqs }` — pass `canton={{ faqs: nationalFaqs }}`. Both already accept any object with the right shape; no component changes needed for these two.

- [ ] **Step 2: Replace `src/pages/index.astro`**

```astro
---
// src/pages/index.astro
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import TrustBar from '../components/TrustBar.astro';
import WasIstSection from '../components/WasIstSection.astro';
import KantoneGrid from '../components/KantoneGrid.astro';
import HowItWorks from '../components/HowItWorks.astro';
import ProblemSection from '../components/ProblemSection.astro';
import WerWirSindSection from '../components/WerWirSindSection.astro';
import FAQ from '../components/FAQ.astro';
import DeadlineSection from '../components/DeadlineSection.astro';
import FinalCTA from '../components/FinalCTA.astro';
import { nationalStats, whySection, howItWorksSteps, nationalFaqs } from '../data/national.js';

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
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Wer hat Anspruch auf Prämienverbilligung in der Schweiz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Jede Person mit Wohnsitz in der Schweiz, deren steuerbares Einkommen unterhalb der kantonal festgelegten Grenze liegt. Über 2.4 Millionen Personen in der Schweiz sind berechtigt.',
        },
      },
      {
        '@type': 'Question',
        name: 'Was kostet die Hilfe bei der Prämienverbilligung?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Der Service ist vollständig kostenlos. EVO Partners GmbH ist ein FINMA-registrierter Versicherungsbroker.',
        },
      },
      {
        '@type': 'Question',
        name: 'Muss ich jedes Jahr einen neuen Antrag stellen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In den meisten Kantonen ja. Die Prämienverbilligung wird jährlich neu beantragt. Wir informieren Sie über die genaue Regelung in Ihrem Kanton.',
        },
      },
    ],
  },
];
---

<Base
  title="Prämienverbilligung Schweiz 2026 – Antrag stellen | prämienhilfe.ch"
  description="Prämienverbilligung in der ganzen Schweiz beantragen. EVO Partners GmbH hilft Ihnen kostenlos bei der Einreichung Ihres Antrags — egal in welchem Kanton."
  canonical="https://praemienhilfe.ch/"
  activePage="home"
  schema={schema}
>
  <Hero variant="national" />
  <TrustBar canton={{ stats: nationalStats }} />
  <WasIstSection />
  <KantoneGrid />
  <HowItWorks steps={howItWorksSteps} heading="So funktioniert unsere Hilfe" id="so-funktioniert-es" />
  <ProblemSection
    heading="Warum verzichten viele Berechtigte auf ihre Prämienverbilligung?"
    intro={whySection.intro}
    reasons={whySection.reasons}
    closing={whySection.closing}
  />
  <WerWirSindSection />
  <FAQ canton={{ faqs: nationalFaqs }} />
  <DeadlineSection />
  <FinalCTA
    heading="Jetzt Anspruch prüfen lassen"
    text="Wählen Sie Ihren Kanton und prüfen Sie in 20 Minuten, ob Sie Anspruch auf Prämienverbilligung haben. Kostenlos und unverbindlich."
    buttons={[{ label: 'Kanton wählen →', href: '#kanton-selector' }]}
    disclaimer="prämienhilfe.ch ist ein privater Beratungsservice von EVO Partners GmbH, FINMA-registrierter Versicherungsbroker. Kein offizielles Kantonsorgan."
  />
</Base>
```

- [ ] **Step 3: Verify and build**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: exits 0, and the build output includes `index.html` with no errors.

```bash
npx astro preview &
sleep 2
curl -s http://localhost:4321/ | grep -o 'id="[a-z-]*"' | sort -u
kill %1
```
Expected: includes `id="kanton-selector"`, `id="was-ist"`, `id="kantone-grid"`, `id="so-funktioniert-es"`, `id="wer-wir-sind"`, `id="faq"`, `id="kontakt"`, `id="pruefen"`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: rebuild index.astro as the national homepage"
```

---

### Task 10: Header/Footer site-wide updates, README, final verification

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `README.md`

**Interfaces:** none (leaf task, no downstream consumers).

- [ ] **Step 1: Add Aargau to the Header desktop dropdown and mobile menu**

In `src/components/Header.astro`, desktop dropdown — change:

```astro
          <span class="block px-[18px] py-[11px] text-[14.5px] text-[#A9B4B9] cursor-default">Zürich</span>
          <span class="block px-[18px] py-[11px] text-[14.5px] text-[#A9B4B9] cursor-default">Bern</span>
```

to:

```astro
          <span class="block px-[18px] py-[11px] text-[14.5px] text-[#A9B4B9] cursor-default">Zürich</span>
          <span class="block px-[18px] py-[11px] text-[14.5px] text-[#A9B4B9] cursor-default">Bern</span>
          <span class="block px-[18px] py-[11px] text-[14.5px] text-[#A9B4B9] cursor-default">Aargau</span>
```

The mobile menu list currently only links `/`, `/basel-stadt`, `/basel-landschaft`, and page links — it has no "coming soon" cantons at all, so it needs no change (the desktop dropdown is the only place coming-soon cantons appear today).

- [ ] **Step 2: Restructure Footer columns 2 and 3**

In `src/components/Footer.astro`, replace the "Mehr Informationen" column:

```astro
      <div>
        <div class="text-xs font-semibold tracking-wide uppercase text-[#6EC5D4]">Mehr Informationen</div>
        <div class="grid gap-2.5 mt-4 text-sm">
          <a href="/" class="text-[#D8DEE1] hover:text-white">Prämienverbilligung</a>
          <a href="/basel-stadt" class="text-[#D8DEE1] hover:text-white">Kantone</a>
          <a href="/so-funktioniert-es" class="text-[#D8DEE1] hover:text-white">So funktioniert es</a>
          <a href="/faq" class="text-[#D8DEE1] hover:text-white">FAQ</a>
        </div>
      </div>
```

with:

```astro
      <div>
        <div class="text-xs font-semibold tracking-wide uppercase text-[#6EC5D4]">Kantone</div>
        <div class="grid gap-2.5 mt-4 text-sm">
          <a href="/basel-stadt" class="text-[#D8DEE1] hover:text-white">Basel-Stadt</a>
          <a href="/basel-landschaft" class="text-[#D8DEE1] hover:text-white">Basel-Landschaft</a>
          <span class="text-[#5C666B] cursor-default">Zürich (demnächst)</span>
          <span class="text-[#5C666B] cursor-default">Bern (demnächst)</span>
          <span class="text-[#5C666B] cursor-default">Aargau (demnächst)</span>
        </div>
      </div>
```

Replace the "Kontakt" column:

```astro
      <div>
        <div class="text-xs font-semibold tracking-wide uppercase text-[#6EC5D4]">Kontakt</div>
        <div class="grid gap-2.5 mt-4 text-sm">
          <a href="/#pruefen" class="text-[#D8DEE1] hover:text-white">Antrag stellen</a>
          <a href="/kontakt" class="text-[#D8DEE1] hover:text-white">Rückruf anfordern</a>
          <a href="/kontakt" class="text-[#D8DEE1] hover:text-white">Kontaktformular</a>
        </div>
      </div>
```

with:

```astro
      <div>
        <div class="text-xs font-semibold tracking-wide uppercase text-[#6EC5D4]">Informationen</div>
        <div class="grid gap-2.5 mt-4 text-sm">
          <a href="/#was-ist" class="text-[#D8DEE1] hover:text-white">Was ist Prämienverbilligung?</a>
          <a href="/#so-funktioniert-es" class="text-[#D8DEE1] hover:text-white">So funktioniert es</a>
          <a href="/#faq" class="text-[#D8DEE1] hover:text-white">FAQ</a>
          <a href="/#wer-wir-sind" class="text-[#D8DEE1] hover:text-white">Über uns</a>
          <a href="/kontakt" class="text-[#D8DEE1] hover:text-white">Kontakt</a>
        </div>
      </div>
```

(Column 1 "brand" and column 4 "Rechtliches" are unchanged — the brief says "same as existing site BUT update col 2 / col 3" only.)

- [ ] **Step 3: Update `README.md` with the new page structure**

Read the current `README.md` first (`cat README.md`), then add or update its page-listing section to include the new homepage role and every route, e.g.:

```markdown
## Pages

- `/` — national homepage: canton selector (Basel-Stadt, Basel-Landschaft active; more cantons coming soon), 10 content sections
- `/basel-stadt` — Basel-Stadt canton page (situation-based funnel)
- `/basel-landschaft` — Basel-Landschaft canton page (canton+situation funnel)
- `/antrag` — full-page trapped funnel (no header/footer)
- `/so-funktioniert-es`, `/faq`, `/kontakt` — supporting pages
- `/impressum`, `/datenschutz` — legal pages
```

Insert this section in a sensible place given the file's existing structure (after any existing "Pages" or "Structure" heading if one exists — replace it rather than duplicating; otherwise append near the top, after the project description).

- [ ] **Step 4: Full build and manual checklist walkthrough**

```bash
cd /Users/marco/Documents/repos/subsidy-website/praemienhilfe.ch
npm run build
```
Expected: exits 0, zero errors.

Walk the brief's `━━━ DELIVERABLES CHECKLIST ━━━` (instructions.md) item by item against the built output / source, confirming each ✅. In particular:
- `/basel-stadt` and `/basel-landschaft` are byte-identical to pre-Task-1 (`git diff main -- src/pages/basel-stadt.astro src/pages/basel-landschaft.astro` shows no hunks outside the one `HowItWorks` line from Task 6).
- Clicking each active canton row/card in dev preview navigates to the right URL.
- All anchor IDs from the Global Constraints list are present exactly once each in `index.astro`'s rendered output.
- Footer `/#...` links resolve correctly when clicked from a non-homepage page (e.g. from `/faq`, clicking "Was ist Prämienverbilligung?" lands on `/#was-ist` and scrolls there — verify via `Base.astro`'s existing smooth-scroll script, which only intercepts same-page `#` links; cross-page `/#id` links use native browser anchor-scroll-on-load, which works without any script change).

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro README.md
git commit -m "chore: update header/footer nav and README for national homepage"
```

- [ ] **Step 6: Log completion in the progress ledger**

```bash
mkdir -p /Users/marco/Documents/repos/subsidy-website/.superpowers/sdd
cat >> /Users/marco/Documents/repos/subsidy-website/.superpowers/sdd/progress.md <<'EOF'

# Progress Ledger — National Homepage
(reset for new brief; prior CRO/SEO refactor ledger entries above are historical)
EOF
```

(The controller appends `Task N: complete (...)` lines here after each task's review passes, per the subagent-driven-development skill's Durable Progress convention.)
