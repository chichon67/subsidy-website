# Basel-Stadt Landing Page Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/basel-stadt` into a standalone, non-redirecting, conversion-optimized landing page per `instructions.md`, and apply the header/footer/legal/popup fixes that are inherently shared (single Header/Footer/Base/DisclaimerModal components).

**Architecture:** Astro pages + React islands (Tailwind, Netlify adapter, no test runner configured). Verification per task is `npm run build` (zero errors) plus a manual check via `npm run dev`, since there is no unit-test framework in this repo — that is this project's equivalent of "run the test."

**Tech Stack:** Astro 7, React 19 islands (`client:load`/`client:idle`), Tailwind 4, Netlify adapter.

## Reality check vs. instructions.md (read this before executing)

The spec in `instructions.md` was written against an assumed codebase state that differs from what's actually on disk. Notable gaps, and the calls this plan makes to reconcile them:

1. **FIX 1 (routing) is already done.** `index.astro` is already the national homepage (`Hero variant="national"`, `CantonSelector`, no Basel-Stadt content). `basel-stadt.astro` already lives only at `/basel-stadt`. This plan only re-verifies it (Task 1) — no code change.
2. **FIX 7 (smooth scroll for `#` links) is already implemented** in `Base.astro:76-88`, site-wide. No change needed — re-verified in Task 4.
3. **FIX 4/6 "funnel Step 1" is not `Funnel.jsx`.** `Funnel.jsx` asks canton/income/household — it has no situations. The actual situation-based selector is `SituationSelector.astro` (backed by `src/data/situations.js`), and on Basel-Stadt today it **navigates away to `/antrag`** (a separate full-page funnel, `AntragFunnel.jsx`) — which directly violates the page's own "must not redirect users away" requirement. This plan replaces that redirect with a new embedded, in-page component (`SituationFunnel.jsx`, Task 5) used **only** on `/basel-stadt`, so FIX 6's "pre-select + auto-advance + scroll to `#funnel`, no navigation" behavior is actually achievable. `/antrag` and `AntragFunnel.jsx` are left untouched (not explicitly in scope, may serve other traffic/ads).
4. **`src/data/situations.js` is shared** with `/antrag` and `kontakt.astro` (via `SituationSelector.astro`). FIX 4's data change (drop emojis, merge Familie/Paar → 5 options) necessarily changes what those other pages show too, since there's one data source and duplicating it would violate DRY. `SituationSelector.astro` is updated to stop rendering the now-removed `icon` field (Task 2).
5. **FIX 8 "scroll trap"**: no `overflow:hidden`/`100vh`/scroll-snap was found anywhere in the codebase. The likely real cause of the reported symptom is that "FAQ" / "So funktioniert es" in the header currently navigate to **separate pages** (`/faq`, `/so-funktioniert-es`) instead of scrolling within the page — which is also what FIX 9 must fix anyway. Task 8 verifies the anchor-based nav (Task 3) resolves this; no separate CSS fix is needed.
6. **FIX 2/3/10/11 (top bar removal, sticky header, popup redesign, legal-link target=_blank) are all in components shared by every page** (`Header.astro`, `DisclaimerModal.jsx`, `Footer.astro`), not Basel-Stadt-specific markup. There is no per-page variant of these today. This plan applies them globally (unavoidable — there's one instance of each), while FIX 9's nav **content** restriction (no Kantone dropdown, no page links) is made conditional on `activePage === 'basel-stadt'` so other pages keep their existing nav.
7. **FIX 12 (Sàrl → GmbH):** a repo-wide grep already found zero occurrences of "Sàrl"/"Sarl". Task 12 just re-confirms this at the end.
8. **FINMA registration number and street address are not available** anywhere in the repo or given in the instructions — the Impressum/Datenschutz content keeps the literal `[ADRESSE]` / `[DEINE FINMA-NR HIER]` placeholders from `instructions.md` so the user can fill them in; this is not a plan gap.

## Global Constraints

- Tech stack must not change: Astro + React islands + Tailwind + Netlify. No new dependencies.
- Do not touch `src/pages/index.astro`.
- `/antrag` page and `AntragFunnel.jsx` are not to be modified (out of explicit scope; avoid regressing that separate funnel).
- Every task ends green on `npm run build` (zero errors) before moving to the next task.
- Colors: teal `#0087A0` / teal-dark `#005F73` / teal-light `#E8F4F8`, dark `#1A1A2A`, swiss-red `#CC0000`, swiss-green `#3D8B37`, amber `#F0A500` (all already defined in `tailwind.config.mjs` — reuse, don't hardcode new hexes where a token exists).
- "EVO Partners GmbH" everywhere (already correct repo-wide; Task 12 just re-checks).

---

### Task 1: Verify routing separation (FIX 1)

**Files:** none (verification only) — `src/pages/index.astro`, `src/pages/basel-stadt.astro`.

- [ ] **Step 1: Confirm no Basel-Stadt content on `/`**

Run: `grep -n "Basel-Stadt\|InfoSection\|cantons\[" src/pages/index.astro`
Expected: no matches (index.astro only imports national components: `Hero variant="national"`, `KantoneGrid`, `CantonSelector`, `WerWirSindSection`, national FAQ/data).

- [ ] **Step 2: Confirm basel-stadt.astro is the only file rendering `Hero canton={cantons['basel-stadt']}` with the Basel-Stadt-specific info sections**

Run: `grep -rn "cantons\['basel-stadt'\]" src/pages/`
Expected: `basel-stadt.astro`, `faq.astro`, `so-funktioniert-es.astro`, `kontakt.astro` (those three reuse Basel-Stadt as default canton content for generic legal/info pages — pre-existing behavior, out of scope, leave as is).

- [ ] **Step 3: Build and manually hit both routes**

Run: `npm run build && npm run preview` (or `npm run dev`), then load `/` and `/basel-stadt` in a browser.
Expected: `/` shows the national homepage (canton selector, no Basel-Stadt-specific stats/InfoSection); `/basel-stadt` shows the Basel-Stadt landing content. No code changes if this passes.

---

### Task 2: Update situation data — remove emojis, merge Familie/Paar (FIX 4 data layer)

**Files:**
- Modify: `src/data/situations.js`
- Modify: `src/components/SituationSelector.astro`

**Interfaces:**
- Produces: `situationList` — array of `{ slug: string, label: string }` (5 entries, no `icon` field). Consumed by `SituationSelector.astro`, the new `SituationFunnel.jsx` (Task 5), and `SituationFinalCTA.astro` (Task 7).

- [ ] **Step 1: Rewrite `src/data/situations.js`**

```js
// src/data/situations.js
export const SITUATIONS = {
  einzelperson: { label: 'Einzelperson' },
  'familie-paar': { label: 'Familie / Paar' },
  student: { label: 'Student / Auszubildende' },
  getrennt: { label: 'Getrennt / Geschieden' },
  rentner: { label: 'Rentner / Pensionierte' },
};

export const situationList = Object.entries(SITUATIONS).map(([slug, v]) => ({ slug, ...v }));
```

- [ ] **Step 2: Update `SituationSelector.astro` to stop rendering the removed `icon` field**

In `src/components/SituationSelector.astro`, replace:

```astro
          <span class="flex items-center gap-3.5">
            <span class="text-lg leading-none">{s.icon}</span>
            <span>{s.label}</span>
          </span>
```

with:

```astro
          <span>{s.label}</span>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: zero errors.

- [ ] **Step 4: Manual check**

Run `npm run dev`, load `/kontakt` (still uses `SituationSelector`), confirm 5 rows show with no emoji and "Familie / Paar" as one row.

- [ ] **Step 5: Commit**

```bash
git add src/data/situations.js src/components/SituationSelector.astro
git commit -m "feat: merge Familie/Paar situation and drop emojis from situation data"
```

---

### Task 3: Header — remove top bar, smart sticky header, Basel-Stadt-only nav (FIX 2, FIX 3, FIX 9)

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: `Astro.props.activePage` (existing prop, now also compared against `'basel-stadt'`).
- Produces: sets CSS custom property `--header-h` on `document.documentElement` (consumed by `global.css` in Task 4 for `scroll-margin-top`, and by `Base.astro`'s content wrapper padding).

- [ ] **Step 1: Replace the full contents of `src/components/Header.astro`**

```astro
---
// src/components/Header.astro
export interface Props {
  activePage?: 'home' | 'basel-stadt' | 'basel-landschaft' | 'ablauf' | 'faq' | 'kontakt';
}
const { activePage = 'home' } = Astro.props;
const isBaselLanding = activePage === 'basel-stadt';

const navLink = (key: string) =>
  activePage === key
    ? 'text-dark border-b-2 border-teal pb-1'
    : 'text-dark hover:text-teal pb-1 border-b-2 border-transparent';
---

<header class="fixed top-0 w-full z-50 bg-white border-b-2 border-teal transition-transform duration-300 translate-y-0">
  <div class="max-w-[1240px] mx-auto px-8 py-3.5 flex items-center justify-between gap-8">
    <a
      href="/"
      class="flex items-center gap-3 no-underline"
      {...isBaselLanding ? { target: '_blank', rel: 'noopener noreferrer' } : {}}
    >
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

    {isBaselLanding ? (
      <nav class="hidden [@media(min-width:980px)]:flex items-center gap-6 text-[14.5px] font-medium">
        <a href="#so-funktioniert-es" class="text-dark hover:text-teal pb-1 border-b-2 border-transparent">So funktioniert es</a>
        <a href="#faq" class="text-dark hover:text-teal pb-1 border-b-2 border-transparent">FAQ</a>
        <a href="#wer-wir-sind" class="text-dark hover:text-teal pb-1 border-b-2 border-transparent">Über uns</a>
        <a href="#funnel" class="px-4 py-2.5 bg-teal text-white rounded font-semibold hover:bg-teal-dark hover:text-white no-underline">Antrag prüfen →</a>
      </nav>
    ) : (
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
            <span class="block px-[18px] py-[11px] text-[14.5px] text-[#A9B4B9] cursor-default">Aargau</span>
          </div>
        </div>

        <a href="/so-funktioniert-es" class={navLink('ablauf')}>So funktioniert es</a>
        <a href="/faq" class={navLink('faq')}>FAQ</a>
        <a href="/kontakt" class={navLink('kontakt')}>Kontakt</a>
        <a href="/#pruefen" class="px-4 py-2.5 bg-teal text-white rounded font-semibold hover:bg-teal-dark hover:text-white no-underline">Antrag prüfen</a>
      </nav>
    )}

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
      {isBaselLanding ? (
        <div class="px-6 py-7 grid gap-1">
          <a href="#so-funktioniert-es" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">So funktioniert es</a>
          <a href="#faq" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">FAQ</a>
          <a href="#wer-wir-sind" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Über uns</a>
          <a href="#funnel" class="mt-[18px] text-center py-4 bg-teal text-white rounded-md text-[16.5px] font-bold no-underline">Antrag prüfen →</a>
        </div>
      ) : (
        <div class="px-6 py-7 grid gap-1">
          <a href="/" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Prämienverbilligung</a>
          <a href="/basel-stadt" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Basel-Stadt</a>
          <a href="/basel-landschaft" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Basel-Landschaft</a>
          <a href="/so-funktioniert-es" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">So funktioniert es</a>
          <a href="/faq" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">FAQ</a>
          <a href="/kontakt" class="py-3.5 px-0.5 text-[19px] font-semibold text-dark border-b border-[#EEF2F3] hover:text-teal no-underline">Kontakt</a>
          <a href="/#pruefen" class="mt-[18px] text-center py-4 bg-teal text-white rounded-md text-[16.5px] font-bold no-underline">Antrag prüfen lassen →</a>
        </div>
      )}
    </div>
  </div>
</header>

<script>
  function initHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    function setHeaderHeightVar() {
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    }
    setHeaderHeightVar();
    window.addEventListener('resize', setHeaderHeightVar);

    let lastScrollY = window.scrollY;
    window.addEventListener(
      'scroll',
      () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 10) {
          header.classList.remove('-translate-y-full');
          header.classList.add('translate-y-0');
        } else if (currentScrollY > lastScrollY) {
          header.classList.add('-translate-y-full');
          header.classList.remove('translate-y-0');
        } else {
          header.classList.remove('-translate-y-full');
          header.classList.add('translate-y-0');
        }
        lastScrollY = currentScrollY;
      },
      { passive: true }
    );
  }

  initHeader();
</script>
```

Note the top bar (`<div class="bg-dark text-white">…Ein unabhängiger Beratungsservice…</div>`) from the original file is simply gone — the header now starts directly with the `<header>` element.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: zero errors.

- [ ] **Step 3: Manual check**

`npm run dev`. On `/`, confirm the top bar is gone, header is fixed, hides on scroll-down and reappears on scroll-up. On `/basel-stadt`, confirm nav shows only "So funktioniert es / FAQ / Über uns / Antrag prüfen →" (no Kantone dropdown, no Kontakt), and clicking the logo opens `/` in a new tab.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: remove header top bar, add smart sticky header, restrict basel-stadt nav"
```

---

### Task 4: Content padding for fixed header + scroll-margin for anchors (support for FIX 3, verify FIX 7)

**Files:**
- Modify: `src/layouts/Base.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add a default `--header-h` fallback and global `scroll-margin-top` in `src/styles/global.css`**

Insert after the existing `a:hover` block:

```css
:root {
  --header-h: 76px;
}

[id] {
  scroll-margin-top: var(--header-h);
}
```

- [ ] **Step 2: Wrap `<slot />` in `Base.astro` with top padding matching the fixed header's height**

In `src/layouts/Base.astro`, replace:

```astro
    {chrome && <Header activePage={activePage} />}
    <slot />
    {chrome && <Footer />}
```

with:

```astro
    {chrome && <Header activePage={activePage} />}
    {chrome ? (
      <div style="padding-top: var(--header-h, 76px)">
        <slot />
      </div>
    ) : (
      <slot />
    )}
    {chrome && <Footer />}
```

- [ ] **Step 3: Verify the existing smooth-scroll script (FIX 7) is unchanged**

Run: `grep -n "scrollIntoView" src/layouts/Base.astro`
Expected: still present at the bottom of the file (lines ~76-88) — confirms FIX 7 requires no new code.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: zero errors.

- [ ] **Step 5: Manual check**

`npm run dev`, load `/`, confirm hero content is not hidden under the fixed header on initial load, and clicking a footer `#`-anchor link scrolls smoothly and lands with the section heading fully visible below the header (not clipped).

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Base.astro src/styles/global.css
git commit -m "feat: reserve space for fixed header and add scroll-margin to anchor targets"
```

---

### Task 5: Build the embedded situation funnel (FIX 4 UI + FIX 6 logic)

**Files:**
- Create: `src/components/SituationFunnel.jsx`

**Interfaces:**
- Consumes: `situationList`, `SITUATIONS` from `src/data/situations.js` (Task 2).
- Produces: a global `window.startFunnel(situationSlug: string)` function (set on mount, removed on unmount) that pre-selects the situation, advances to step 2, and smooth-scrolls to `#funnel`. Consumed by `SituationFinalCTA.astro` (Task 7).
- Renders a root `<div id="funnel">` — the scroll target.

- [ ] **Step 1: Create `src/components/SituationFunnel.jsx`**

```jsx
// src/components/SituationFunnel.jsx
import { useEffect, useState } from 'react';
import { situationList, SITUATIONS } from '../data/situations.js';

const INCOME_OPTIONS = ["Unter CHF 2'000", "CHF 2'000 – 4'000", "CHF 4'000 – 6'000", "Über CHF 6'000"];
const TOTAL_STEPS = 5;

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

export default function SituationFunnel() {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState('');
  const [email, setEmail] = useState('');
  const [household, setHousehold] = useState(1);
  const [income, setIncome] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [utmData, setUtmData] = useState({ utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '' });

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
    window.startFunnel = (slug) => {
      if (SITUATIONS[slug]) {
        setSituation(slug);
        track('funnel_step_1_complete', { situation: slug });
        setStep(2);
      }
      const target = document.querySelector('#funnel');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    return () => {
      delete window.startFunnel;
    };
  }, []);

  function chooseSituation(slug) {
    setSituation(slug);
    track('funnel_step_1_complete', { situation: slug });
    setStep(2);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function submitEmail() {
    if (!isValidEmail(email)) {
      setErrors({ email: 'Bitte eine gültige E-Mail-Adresse angeben.' });
      return;
    }
    setErrors({});
    track('funnel_step_2_complete', { email_provided: true });
    setStep(3);
  }

  function submitHousehold() {
    track('funnel_step_3_complete', { household });
    setStep(4);
  }

  function chooseIncome(value) {
    setIncome(value);
    track('funnel_step_4_complete', { income: value });
    setStep(5);
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

  async function handleSubmit() {
    const errs = validateContact();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    track('funnel_form_submit', { situation });
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
          situation,
          household: `${household} ${household === 1 ? 'Person' : 'Personen'}`,
          income,
          ...utmData,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      track('funnel_conversion', { situation });
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder rufen Sie uns unter +41 76 779 0449 an.' });
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep(1);
    setSituation('');
    setEmail('');
    setHousehold(1);
    setIncome('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setConsent(false);
    setErrors({});
    setSubmitted(false);
  }

  return (
    <div
      id="funnel"
      className="mt-8 bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7"
    >
      {!submitted && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`inline-block w-[9px] h-[9px] rounded-full transition-colors ${
                  i <= step ? 'bg-teal border border-teal' : 'bg-white border border-[#C3D5DA]'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-medium tracking-wider uppercase text-[#6B7A80]">
            Schritt {step} von {TOTAL_STEPS}
          </div>
        </div>
      )}

      {!submitted && step === 1 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Was beschreibt Ihre Situation am besten?</div>
          <div className="grid gap-2.5">
            {situationList.map((s) => (
              <button key={s.slug} type="button" onClick={() => chooseSituation(s.slug)} className={rowClass(situation === s.slug)}>
                <span>{s.label}</span>
                <span className="text-teal font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && step === 2 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie lautet Ihre E-Mail-Adresse?</div>
          <input
            type="email"
            placeholder="nom@exemple.ch"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
          />
          {errors.email && <div className="text-swiss-red text-xs mt-1">{errors.email}</div>}
          <button
            type="button"
            onClick={submitEmail}
            className="mt-3.5 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark"
          >
            Weiter →
          </button>
        </div>
      )}

      {!submitted && step === 3 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie viele Personen leben in Ihrem Haushalt?</div>
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

      {!submitted && step === 4 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie hoch ist Ihr monatliches Haushaltseinkommen?</div>
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

      {!submitted && step === 5 && (
        <div>
          <div className="text-lg font-bold mt-[18px] mb-1 tracking-tight text-[#2E6B29]">
            Gute Nachricht — Sie könnten Anspruch haben!
          </div>
          <div className="text-xl font-bold mt-3 mb-4 tracking-tight">Ihre Kontaktangaben</div>
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

      {!submitted && step > 1 && (
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

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: zero errors (this component isn't wired into any page yet, so build just checks it's syntactically/type valid).

- [ ] **Step 3: Commit**

```bash
git add src/components/SituationFunnel.jsx
git commit -m "feat: add embeddable in-page situation funnel component"
```

---

### Task 6: Wire the embedded funnel into Hero and basel-stadt.astro

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/pages/basel-stadt.astro`

**Interfaces:**
- Consumes: `SituationFunnel` (Task 5).
- Produces: `Hero` prop `embeddedFunnel?: boolean` (default `false`) — other callers (`kontakt.astro`, `basel-landschaft.astro`, `index.astro`) don't pass it, so their behavior is unchanged.

- [ ] **Step 1: Add the `embeddedFunnel` prop to `Hero.astro` and import `SituationFunnel`**

In `src/components/Hero.astro`, change the imports block:

```astro
import Funnel from './Funnel.jsx';
import SituationFunnel from './SituationFunnel.jsx';
import SituationSelector from './SituationSelector.astro';
import CantonSelector from './CantonSelector.astro';
```

Change the `Props` interface and destructuring:

```astro
export interface Props {
  canton?: { name: string; heroProof: string };
  defaultCanton?: string;
  useSituationFunnel?: boolean;
  variant?: 'canton' | 'national';
  embeddedFunnel?: boolean;
}
const { canton, defaultCanton, useSituationFunnel = true, variant = 'canton', embeddedFunnel = false } = Astro.props;
```

Change the selector-rendering line:

```astro
        {isNational ? <CantonSelector /> : embeddedFunnel ? <SituationFunnel client:load /> : useSituationFunnel ? <SituationSelector /> : <Funnel client:load defaultCanton={defaultCanton} />}
```

- [ ] **Step 2: Use it from `basel-stadt.astro`, and add the two new anchor sections**

In `src/pages/basel-stadt.astro`, update the imports and body:

```astro
---
// src/pages/basel-stadt.astro
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import TrustBar from '../components/TrustBar.astro';
import InfoSection from '../components/InfoSection.astro';
import HowItWorks from '../components/HowItWorks.astro';
import ProblemSection from '../components/ProblemSection.astro';
import WerWirSindSection from '../components/WerWirSindSection.astro';
import FAQ from '../components/FAQ.astro';
import SituationFinalCTA from '../components/SituationFinalCTA.astro';
import { cantons } from '../data/cantons.js';

const canton = cantons['basel-stadt'];
---

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
  <Hero canton={canton} defaultCanton="Basel-Stadt" embeddedFunnel={true} />
  <TrustBar canton={canton} />
  <InfoSection canton={canton} />
  <HowItWorks steps={canton.steps} id="so-funktioniert-es" />
  <ProblemSection />
  <WerWirSindSection />
  <FAQ canton={canton} />
  <SituationFinalCTA />
</Base>
```

(`SituationFinalCTA` is created in Task 7 — this task's build will fail until that file exists, so do Steps 1-2 here, then proceed straight into Task 7 before building/committing either.)

- [ ] **Step 3: Build** (after Task 7's file exists)

Run: `npm run build`
Expected: zero errors.

- [ ] **Step 4: Manual check**

`npm run dev`, load `/basel-stadt`. Confirm the hero shows the 5-row, no-emoji situation selector (step 1 of 5) instead of a link that navigates to `/antrag`. Click a situation and confirm it advances to the email step in place (no navigation, URL stays `/basel-stadt`).

- [ ] **Step 5: Commit** (combine with Task 7's commit since they're interdependent — see Task 7 Step 4)

---

### Task 7: New final CTA with situation selector (FIX 5, FIX 6 CTA)

**Files:**
- Create: `src/components/SituationFinalCTA.astro`

**Interfaces:**
- Consumes: `situationList` from `src/data/situations.js`; `window.startFunnel` (set by `SituationFunnel.jsx`, Task 5).

- [ ] **Step 1: Create `src/components/SituationFinalCTA.astro`**

```astro
---
// src/components/SituationFinalCTA.astro
import { situationList } from '../data/situations.js';
---

<section class="bg-teal text-white">
  <div class="max-w-[720px] mx-auto px-8 py-16">
    <h2 class="text-[25px] md:text-[32px] font-bold tracking-tight m-0 text-white">
      Haben Sie Ihren Anspruch noch nicht geprüft?
    </h2>
    <p class="text-base leading-relaxed mt-3.5 text-white max-w-[34em]">
      Starten Sie jetzt — es dauert weniger als 20 Minuten. Wählen Sie Ihre Situation:
    </p>

    <div class="mt-7 grid gap-2.5">
      {
        situationList.map((s) => (
          <button
            type="button"
            data-situation={s.slug}
            class="situation-cta-row w-full flex items-center justify-between gap-4 text-left cursor-pointer rounded-md text-[15.5px] font-medium text-teal-dark bg-white border border-white px-[18px] py-[15px] transition-colors hover:bg-teal-light"
          >
            <span>{s.label}</span>
            <span class="text-teal font-bold">→</span>
          </button>
        ))
      }
    </div>

    <p class="text-xs leading-relaxed text-white/85 mt-5">
      Kein offizielles Kantonsamt. Ein Service von EVO Partners GmbH, FINMA-registrierter Broker.
    </p>
  </div>
</section>

<script>
  document.querySelectorAll('.situation-cta-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-situation');
      if (typeof window.startFunnel === 'function') {
        window.startFunnel(slug);
      }
    });
  });
</script>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: zero errors. This also resolves Task 6's dangling import.

- [ ] **Step 3: Manual check**

`npm run dev`, load `/basel-stadt`, scroll to the bottom CTA (teal background, 5 rows). Click "Rentner / Pensionierte" and confirm the page smooth-scrolls to the top funnel card, which now shows step 2 (email) with the situation pre-selected — no old CTA with "Antrag prüfen lassen" + phone button remains anywhere on the page.

- [ ] **Step 4: Commit (Tasks 6 + 7 together, since Task 6 doesn't build standalone)**

```bash
git add src/components/Hero.astro src/pages/basel-stadt.astro src/components/SituationFinalCTA.astro
git commit -m "feat: embed situation funnel in basel-stadt hero and replace final CTA"
```

---

### Task 8: Wire `#wer-wir-sind` / `#so-funktioniert-es` / `#faq` anchors and confirm no scroll trap (FIX 8, FIX 9 support)

**Files:** none beyond what Task 6 already changed — this task is verification.

- [ ] **Step 1: Confirm section ids exist on `/basel-stadt`**

Run: `grep -n "id=\"so-funktioniert-es\"\|id=\"faq\"\|id=\"wer-wir-sind\"\|id=\"funnel\"" src/pages/basel-stadt.astro src/components/HowItWorks.astro src/components/FAQ.astro src/components/WerWirSindSection.astro src/components/SituationFunnel.jsx`
Expected: `HowItWorks.astro` renders `id={id}` (passed as `"so-funktioniert-es"` from Task 6's `basel-stadt.astro`), `FAQ.astro` has `id="faq"`, `WerWirSindSection.astro` has `id="wer-wir-sind"`, `SituationFunnel.jsx` has `id="funnel"`.

- [ ] **Step 2: Manual check for the scroll trap**

`npm run dev`, load `/basel-stadt`. Click "FAQ" in the header nav — page should smooth-scroll down to the FAQ section (not navigate to `/faq`). Then scroll the mouse wheel/trackpad upward — confirm the page freely scrolls back up to the hero with no resistance or jump. Repeat for "So funktioniert es" and "Über uns".

- [ ] **Step 3: No commit** (verification only; if Step 2 reveals an actual trap, fix here and commit — expected to pass given the codebase audit found no `overflow:hidden`/`100vh`/scroll-snap anywhere).

---

### Task 9: Redesign the disclaimer popup (FIX 10)

**Files:**
- Modify: `src/components/DisclaimerModal.jsx`

- [ ] **Step 1: Replace the full contents of `src/components/DisclaimerModal.jsx`**

```jsx
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

  function dismiss() {
    markDisclaimerShown();
    setVisible(false);
  }

  if (!checked || !visible) return null;

  return (
    <div className="fixed top-1/2 right-0 md:right-4 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-l-2xl md:rounded-2xl shadow-2xl px-6 pt-6 pb-6">
      <div className="text-[15px] font-bold text-dark tracking-tight">
        prämienhilfe<span className="text-teal">.ch</span>
      </div>

      <div className="text-base font-bold text-dark tracking-tight mt-4">Wichtiger Hinweis</div>
      <p className="text-sm leading-relaxed text-[#3D4A50] mt-2.5">
        prämienhilfe.ch ist ein privater und unabhängiger Beratungsservice von EVO Partners GmbH — kein Kantonsamt
        und keine staatliche Behörde.
      </p>
      <p className="text-sm leading-relaxed text-[#3D4A50] mt-2.5">
        Unsere Hilfe bei der Prämienverbilligung ist für Sie kostenlos.
      </p>

      <button
        type="button"
        onClick={dismiss}
        className="mt-5 w-full px-5 py-3.5 bg-teal text-white border-0 rounded-md text-[15px] font-bold cursor-pointer hover:bg-teal-dark"
      >
        Verstanden — Weiter →
      </button>
    </div>
  );
}
```

This drops: the dark overlay (root is no longer `fixed inset-0`, so nothing blocks page interaction), the body-scroll-lock `useEffect`, the stats row, the service bullet list, and the `asb.bs.ch` external link — matching the "REMOVE from popup" list exactly. The 7-day suppression logic (`isDisclaimerDue`/`markDisclaimerShown`, `SEVEN_DAYS_MS` in `src/lib/disclaimer.js`) is untouched and already correct — no change needed there.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: zero errors.

- [ ] **Step 3: Manual check**

Clear `localStorage`, `npm run dev`, load `/`. Confirm the popup appears pinned to the right edge, vertically centered, no dark overlay, and the page behind it is scrollable/clickable. Click "Verstanden — Weiter →" — popup closes. Reload — popup does not reappear. Manually run `localStorage.removeItem('disclaimer_shown')` in devtools and reload to confirm it reappears when due.

- [ ] **Step 4: Commit**

```bash
git add src/components/DisclaimerModal.jsx
git commit -m "feat: redesign disclaimer popup as minimal non-blocking right-side panel"
```

---

### Task 10: Legal links open in a new tab (FIX 11 links)

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Add `target="_blank" rel="noopener noreferrer"` to the four legal links**

In `src/components/Footer.astro`, replace:

```astro
          <a href="/impressum" class="text-[#D8DEE1] hover:text-white">Impressum</a>
          <a href="/datenschutz" class="text-[#D8DEE1] hover:text-white">Datenschutzbestimmungen</a>
          <a href="/impressum" class="text-[#D8DEE1] hover:text-white">Nutzungsbedingungen</a>
          <a href="/impressum" class="text-[#D8DEE1] hover:text-white">Rechtliche Hinweise</a>
```

with:

```astro
          <a href="/impressum" target="_blank" rel="noopener noreferrer" class="text-[#D8DEE1] hover:text-white">Impressum</a>
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" class="text-[#D8DEE1] hover:text-white">Datenschutzbestimmungen</a>
          <a href="/impressum" target="_blank" rel="noopener noreferrer" class="text-[#D8DEE1] hover:text-white">Nutzungsbedingungen</a>
          <a href="/impressum" target="_blank" rel="noopener noreferrer" class="text-[#D8DEE1] hover:text-white">Rechtliche Hinweise</a>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: zero errors.

- [ ] **Step 3: Manual check**

`npm run dev`, load `/basel-stadt`, scroll to footer, click "Impressum" — confirm it opens in a new tab and the original `/basel-stadt` tab is untouched.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro
git commit -m "fix: open legal page links in a new tab"
```

---

### Task 11: Rewrite Impressum and Datenschutz content (FIX 11 content)

**Files:**
- Modify: `src/pages/impressum.astro`
- Modify: `src/pages/datenschutz.astro`

- [ ] **Step 1: Replace `src/pages/impressum.astro` body**

```astro
---
// src/pages/impressum.astro
import Base from '../layouts/Base.astro';
---

<Base
  title="Impressum | prämienhilfe.ch"
  description="Impressum und rechtliche Hinweise zu prämienhilfe.ch, einem Service von EVO Partners GmbH."
  canonical="https://praemienhilfe.ch/impressum"
>
  <div class="bg-white">
    <div class="max-w-[900px] mx-auto px-8 py-16">
      <h1 class="text-[32px] font-bold tracking-tight m-0">Impressum</h1>
      <div class="mt-8 grid gap-6 text-[16px] leading-relaxed text-[#3D4A50]">
        <div>
          <div class="font-semibold text-dark">Angaben gemäss Art. 12 UWG</div>
          <p class="mt-1">
            Firmenname: EVO Partners GmbH<br />
            Rechtsform: Gesellschaft mit beschränkter Haftung (GmbH)<br />
            Sitz: Zürich, Schweiz<br />
            [ADRESSE — füge hier die genaue Adresse ein]
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Geschäftsführer</div>
          <p class="mt-1">Marc-Antoine Segui</p>
        </div>
        <div>
          <div class="font-semibold text-dark">Kontakt</div>
          <p class="mt-1">
            E-Mail: <a href="mailto:msegui@evo-partners.ch" class="text-teal">msegui@evo-partners.ch</a><br />
            Website: <a href="https://evo-partners.ch" target="_blank" rel="noopener noreferrer" class="text-teal">evo-partners.ch</a>
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Aufsichtsbehörde</div>
          <p class="mt-1">
            EVO Partners GmbH ist als unabhängiger Versicherungsvermittler bei der FINMA (Eidgenössische
            Finanzmarktaufsicht) registriert.
          </p>
          <p class="mt-1">
            FINMA-Registernummer: [DEINE FINMA-NR HIER]<br />
            FINMA-Register: <a href="https://www.finma.ch/de/" target="_blank" rel="noopener noreferrer" class="text-teal">https://www.finma.ch/de/</a>
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Haftungsausschluss</div>
          <p class="mt-1">
            Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
            und Aktualität der Inhalte übernehmen wir keine Gewähr.
          </p>
          <p class="mt-1">
            prämienhilfe.ch ist eine private, unabhängige Beratungsplattform und kein offizielles Organ der Kantone
            oder des Bundes. Der Antrag auf Prämienverbilligung kann auch eigenständig beim zuständigen Kantonsamt
            gestellt werden.
          </p>
        </div>
      </div>
    </div>
  </div>
</Base>
```

- [ ] **Step 2: Replace `src/pages/datenschutz.astro` body**

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
            EVO Partners GmbH<br />
            [ADRESSE]<br />
            <a href="mailto:msegui@evo-partners.ch" class="text-teal">msegui@evo-partners.ch</a>
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Zweck der Datenerhebung</div>
          <p class="mt-1">
            Wir erheben personenbezogene Daten (Name, Telefon, E-Mail, Situation) ausschliesslich zu folgenden
            Zwecken:
          </p>
          <ul class="mt-2 grid gap-1.5 list-disc pl-5">
            <li>Prüfung Ihres Anspruchs auf Prämienverbilligung</li>
            <li>Kontaktaufnahme durch EVO Partners GmbH oder akkreditierte FINMA-Partner für Beratungsleistungen im Bereich Krankenversicherung</li>
            <li>Zusammenstellung und Einreichung Ihres Dossiers beim zuständigen Kantonsamt</li>
          </ul>
        </div>
        <div>
          <div class="font-semibold text-dark">Datenweitergabe</div>
          <p class="mt-1">
            Ihre Daten können an akkreditierte FINMA-Partner weitergegeben werden, sofern dies zur Erbringung
            unserer Dienstleistungen erforderlich ist. Eine Weitergabe an Dritte zu Werbezwecken findet nicht
            statt.
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Speicherdauer</div>
          <p class="mt-1">
            Ihre Daten werden so lange gespeichert, wie es für die Erbringung unserer Dienstleistungen erforderlich
            ist, längstens jedoch 5 Jahre.
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Ihre Rechte</div>
          <p class="mt-1">Sie haben das Recht auf:</p>
          <ul class="mt-2 grid gap-1.5 list-disc pl-5">
            <li>Auskunft über Ihre gespeicherten Daten</li>
            <li>Berichtigung unrichtiger Daten</li>
            <li>Löschung Ihrer Daten</li>
            <li>Widerspruch gegen die Verarbeitung</li>
          </ul>
          <p class="mt-2">
            Anfragen richten Sie an: <a href="mailto:msegui@evo-partners.ch" class="text-teal">msegui@evo-partners.ch</a>
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">Cookies und Tracking</div>
          <p class="mt-1">
            Diese Website verwendet Google Analytics 4 zur Analyse des Nutzerverhaltens. Sie können der Verwendung
            jederzeit widersprechen.
          </p>
        </div>
        <div>
          <div class="font-semibold text-dark">FINMA-Registernummer</div>
          <p class="mt-1">[DEINE FINMA-NR HIER]</p>
        </div>
      </div>
    </div>
  </div>
</Base>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: zero errors.

- [ ] **Step 4: Manual check**

`npm run dev`, load `/impressum` and `/datenschutz`, confirm the new content renders and the `[ADRESSE]` / `[DEINE FINMA-NR HIER]` placeholders are visible (flag to the user that these need real values before launch).

- [ ] **Step 5: Commit**

```bash
git add src/pages/impressum.astro src/pages/datenschutz.astro
git commit -m "content: rewrite Impressum and Datenschutz with EVO Partners GmbH details"
```

---

### Task 12: Confirm "Sàrl" → "GmbH" globally (FIX 12)

**Files:** none (verification only).

- [ ] **Step 1: Repo-wide grep**

Run: `grep -rn "Sàrl\|Sarl" src/`
Expected: no matches (already confirmed during planning research — this is a final re-check after all edits above, in case any new content was pasted incorrectly).

- [ ] **Step 2: No commit needed if clean.**

---

### Task 13: Final build, deliverables checklist, mobile pass

**Files:** none (verification only).

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: zero errors, zero warnings about missing components.

- [ ] **Step 2: Walk the `instructions.md` deliverables checklist end-to-end**

`npm run dev`, then manually verify each of the 19 checklist items in `instructions.md` lines 379-399 against `/basel-stadt` (desktop) — routing, top bar gone, sticky header behavior, funnel (5 situations, no emoji, embedded not redirecting), old CTA gone / new CTA present and functional, anchor smooth-scroll, no scroll trap on FAQ/So funktioniert es, no Kantone dropdown, popup redesign, legal links new-tab, Impressum/Datenschutz content, no "Sàrl" anywhere.

- [ ] **Step 3: Mobile pass**

Resize the browser (or use devtools device emulation) to a mobile width. Confirm: the bottom sticky "Antrag prüfen lassen →" bar (from `Base.astro`) still works and doesn't overlap the fixed header; the mobile hamburger menu on `/basel-stadt` only shows the restricted nav; the funnel and popup are usable at mobile width.

- [ ] **Step 4: No commit** (this task is a final gate, not a code change — if any check fails, go back to the relevant task, fix, and re-commit there).

---

## Post-plan follow-ups for the user (not implementable without more input)

- `[ADRESSE]` (EVO Partners GmbH street address) and `[DEINE FINMA-NR HIER]` (FINMA registration number) are left as literal placeholders in Impressum/Datenschutz — need real values before launch.
- `/antrag` (`AntragFunnel.jsx`) was intentionally left untouched — confirm whether it should eventually be retired now that Basel-Stadt has its own embedded funnel, or whether it's still needed for other traffic sources.
