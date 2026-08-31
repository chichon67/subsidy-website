You are building prämienhilfe.ch — a Swiss health insurance 
subsidy (Prämienverbilligung) lead generation website.

You have been given an HTML prototype file from Claude Design. 
Your job is to convert it into a production-ready Astro website 
with React islands, preserving every design detail exactly as 
built in the prototype.

━━━ TECH STACK ━━━
- Framework: Astro (latest)
- UI components: React (for interactive islands only)
- Styling: Tailwind CSS
- Deployment: Netlify
- Forms: React state (no external form library)
- Animations: None (keep it fast and clean)
- Fonts: Inter from Google Fonts

━━━ PROJECT SETUP ━━━
Initialize with:
npm create astro@latest praemienhilfe -- --template minimal
cd praemienhilfe
npx astro add react tailwind netlify

File structure to create:
praemienhilfe/
├── src/
│   ├── layouts/
│   │   └── Base.astro          ← shared HTML shell, head, fonts
│   ├── pages/
│   │   ├── index.astro         ← home page (Basel-Stadt default)
│   │   ├── basel-stadt.astro   ← canton page BS
│   │   ├── basel-landschaft.astro ← canton page BL
│   │   ├── so-funktioniert-es.astro
│   │   ├── faq.astro
│   │   ├── kontakt.astro
│   │   ├── impressum.astro
│   │   └── datenschutz.astro
│   ├── components/
│   │   ├── Header.astro        ← logo + navigation
│   │   ├── Footer.astro        ← 4-col footer + legal
│   │   ├── Hero.astro          ← hero section with funnel slot
│   │   ├── Funnel.jsx          ← React island (4-step funnel)
│   │   ├── TrustBar.astro      ← amber stats bar
│   │   ├── InfoSection.astro   ← text-heavy canton info
│   │   ├── HowItWorks.astro    ← numbered steps
│   │   ├── ProblemSection.astro
│   │   ├── FAQ.astro           ← static accordion (CSS only)
│   │   └── FinalCTA.astro      ← teal CTA section
│   └── styles/
│       └── global.css          ← Inter font import + base styles
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
└── vercel.json

━━━ DESIGN IMPLEMENTATION ━━━
Extract EVERY design detail from the HTML prototype:
- All colors exactly as in the prototype
- All font sizes, weights, spacing
- The logo (recreate as inline SVG in Header.astro)
- The decorative circle + arc in the hero
- The striped circle photo placeholder
- Amber trust bar with left borders
- All text content word for word
- The proof card floating on the circle
- Every section background color
- The teal bottom border on header
- The thin top bar with phone number

━━━ FUNNEL COMPONENT (Funnel.jsx) ━━━
This is the most critical component. Build it as a 
React island with client:load directive.

State management:
const [step, setStep] = useState(1)
const [answers, setAnswers] = useState({
  canton: '',
  income: '',
  household: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: ''
})
const [submitted, setSubmitted] = useState(false)
const [loading, setLoading] = useState(false)

Step 1 — Canton selection:
Question: "In welchem Kanton wohnen Sie?"
Options as clickable rows (auto-advance on click):
- Basel-Stadt
- Basel-Landschaft

Step 2 — Income:
Question: "Wie hoch ist Ihr monatliches Haushaltseinkommen?"
Options (auto-advance on click):
- Unter CHF 2'000
- CHF 2'000 – 4'000
- CHF 4'000 – 6'000
- Über CHF 6'000

Step 3 — Household:
Question: "Wie viele Personen versichern Sie?"
Options (auto-advance on click):
- Nur ich
- Ich + Partner/in
- Familie mit Kindern

Step 4 — Contact form:
Show success header: "✓ Gute Nachricht — Sie könnten 
Anspruch haben!"
Fields:
- Vorname (required)
- Nachname (required)  
- Telefon (required, Swiss format +41)
- E-Mail (required, email format)
Submit button: "Antrag prüfen lassen →"
Below button: "Keine Verpflichtung. Diskret."

On submit:
1. Set loading = true
2. POST to /api/submit with all answers + UTM params
3. On success: setSubmitted(true)
4. Show thank you message:
   "Vielen Dank! Wir melden uns innerhalb von 
   24 Stunden bei Ihnen."

Progress indicator:
4 dots at top, filled dot = current step
"Schritt X von 4" label
Back button on steps 2, 3, 4

Auto-advance behavior:
Steps 1, 2, 3: clicking an option immediately 
advances to next step (no confirm button needed)
Step 4: manual submit only

Validation on step 4:
- All fields required
- Phone: must start with +41 or 07
- Email: must contain @ and .
- Show inline error messages in red

━━━ API ROUTE (src/pages/api/submit.js) ━━━
Create an Astro API endpoint:

export const POST = async ({ request }) => {
  const data = await request.json()
  
  // 1. Send to HubSpot
  const hubspotPayload = {
    fields: [
      { name: 'firstname', value: data.firstName },
      { name: 'lastname', value: data.lastName },
      { name: 'phone', value: data.phone },
      { name: 'email', value: data.email },
      { name: 'canton', value: data.canton },
      { name: 'income_range', value: data.income },
      { name: 'household_type', value: data.household },
      { name: 'lead_source', value: 'praemienhilfe.ch' },
    ],
    context: {
      hutk: data.hutk,
      pageUri: 'praemienhilfe.ch',
      pageName: 'Prämienverbilligung Landing'
    }
  }
  
  // HubSpot Form API call
  // Replace PORTAL_ID and FORM_ID with env variables
  const hsResponse = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_ID}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hubspotPayload)
    }
  )
  
  if (!hsResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed' }), { 
      status: 500 
    })
  }
  
  return new Response(JSON.stringify({ success: true }), { 
    status: 200 
  })
}

Environment variables needed (.env):
HUBSPOT_PORTAL_ID=your_portal_id
HUBSPOT_FORM_ID=your_form_id

━━━ UTM TRACKING ━━━
In Funnel.jsx, capture UTM params on mount:

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  setUtmData({
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
  })
}, [])

Include utmData in the API POST payload so HubSpot 
receives the full attribution data.

━━━ NAVIGATION ━━━
Header.astro — full navigation:

Top bar (dark bg, white text, small):
Left: "Ein unabhängiger Beratungsservice"
Right: "+41 76 779 0449" (tel: link)

Main nav:
Logo left
Nav items right:
- Prämienverbilligung (href="/")
- Kantone (dropdown):
    Basel-Stadt (/basel-stadt)
    Basel-Landschaft (/basel-landschaft)
    ── coming soon ──
    Zürich (disabled, grayed)
    Bern (disabled, grayed)
- So funktioniert es (/so-funktioniert-es)
- FAQ (/faq)
- Kontakt (/kontakt)

Mobile: hamburger toggle, CSS-only drawer
Active state: teal underline on current page

━━━ CANTON PAGES ━━━
Each canton page extends Base.astro and includes:
- Same Hero with funnel (pre-select the canton 
  in step 1 automatically)
- Canton-specific info section with correct data
- All other sections identical to home

For basel-stadt.astro, pass prop:
<Funnel client:load defaultCanton="Basel-Stadt" />

For basel-landschaft.astro:
<Funnel client:load defaultCanton="Basel-Landschaft" />

Basel-Landschaft specific data:
- Zuständige Stelle: SVA Basel-Landschaft
- Different income thresholds (research and include)
- Different contact info

━━━ GOOGLE ANALYTICS 4 ━━━
Add to Base.astro <head>:
<!-- Replace G-XXXXXXXX with actual GA4 ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>

Track these events in Funnel.jsx:
- funnel_step_1_complete (canton selected)
- funnel_step_2_complete (income selected)
- funnel_step_3_complete (household selected)
- funnel_form_submit (form submitted)
- funnel_conversion (API success)

gtag('event', 'funnel_step_1_complete', {
  'canton': selectedCanton
})

━━━ SEO ━━━
Each page passes SEO props to Base.astro:

Base.astro accepts:
- title (string)
- description (string)
- canonical (string)

Home page:
title: "Prämienverbilligung beantragen | prämienhilfe.ch"
description: "Prüfen Sie Ihren Anspruch auf 
Prämienverbilligung kostenlos. Hilfe bei der 
Beantragung im Kanton Basel-Stadt und Basel-Landschaft."

Basel-Stadt page:
title: "Prämienverbilligung Basel-Stadt | prämienhilfe.ch"
description: "Prämienverbilligung im Kanton Basel-Stadt 
beantragen. Einkommensgrenze Einzelperson CHF 49'375. 
Kostenlose Hilfe beim Antrag."

Add to Base.astro <head>:
<meta name="robots" content="index, follow">
<link rel="canonical" href={canonical}>
<meta property="og:title" content={title}>
<meta property="og:description" content={description}>
<meta property="og:url" content={canonical}>
<meta property="og:locale" content="de_CH">

━━━ PERFORMANCE ━━━
- All images use lazy loading
- Inter font with display:swap
- No unused CSS (Tailwind purge active)
- Astro static pages = near-instant load
- Only Funnel.jsx loads JavaScript (client:load)
- Everything else is zero-JS static HTML

━━━ NETLIFY DEPLOYMENT ━━━
netlify.toml:
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

.env.example file:
HUBSPOT_PORTAL_ID=
HUBSPOT_FORM_ID=

━━━ MOBILE STICKY CTA ━━━
Add to Base.astro, visible only on mobile (md:hidden):
Fixed bottom bar:
[Antrag prüfen lassen →] full width teal button
Links to #funnel anchor on page

━━━ CRITICAL INSTRUCTIONS ━━━
1. Start by reading the entire HTML prototype file 
   provided — extract every color, font, spacing, 
   and content detail exactly
2. Do NOT redesign anything — replicate the prototype 
   precisely in Astro/React
3. The Funnel.jsx is the most important component — 
   get the UX exactly right
4. Test the API route with a console.log before 
   connecting HubSpot
5. Use Tailwind custom colors in tailwind.config.mjs:
   colors: {
     teal: { DEFAULT: '#0087A0', dark: '#005F73', light: '#E8F4F8' },
     amber: { DEFAULT: '#F0A500', light: '#FFF8E7' },
     swiss: { red: '#CC0000', green: '#3D8B37' },
     dark: '#1A1A2A'
   }
6. Every page must have the Header and Footer
7. The dropdown in nav must work on mobile too
8. Run npm run build before finishing — fix any 
   build errors

━━━ DELIVERABLES ━━━
When done, confirm:
✅ Astro project builds without errors
✅ All pages created and linked
✅ Funnel works through all 4 steps
✅ Form submits to API route
✅ UTM params captured
✅ GA4 events fire on each step
✅ Mobile responsive and sticky CTA works
✅ vercel.json configured for deployment
✅ .env.example created
✅ README.md with setup instructions