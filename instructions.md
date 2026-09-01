You are a CRO (Conversion Rate Optimization) and SEO expert.
Improve the existing prämienhilfe.ch Astro website deployed 
at https://praemienhilfe.netlify.app/

Read the existing codebase first before making any changes.
This is a REFACTOR — preserve the existing tech stack:
Astro + React islands + Tailwind + Netlify

━━━ CRITICAL CHANGES — DO ALL OF THESE ━━━

━━━ 1. LEGAL DISCLAIMER POPUP ━━━
On first page load (check localStorage 'disclaimer_shown'),
show a modal overlay BEFORE the user can interact with 
anything. Inspired by praemienverbilligung-zurich.ch.

Modal design (white card, centered, max-w-lg, shadow-xl):
- Header: 🔒 lock icon + "Sicheres Formular"
- Logo: prämienhilfe.ch logo
- Title (bold): "Wichtiger Hinweis"
- Body text:
  "prämienhilfe.ch ist ein privater und unabhängiger 
  Beratungsservice, betrieben von EVO Partners GmbH, 
  einem FINMA-registrierten Versicherungsbroker. 
  Wir sind weder ein Kantonsamt noch eine staatliche 
  Behörde.
  
  Unser Service umfasst:
  ✓ Prüfung Ihres Anspruchs auf Prämienverbilligung
  ✓ Zusammenstellung und Einreichung Ihres Dossiers
  ✓ Unabhängige Beratung zu Ihrer Krankenversicherung
  ✓ Optimierung Ihrer Versicherungssituation
  
  Die Hilfe bei der Prämienverbilligung ist für Sie 
  kostenlos. Unsere Vergütung erfolgt ausschliesslich 
  durch Versicherungspartner im Rahmen unserer 
  Brokertätigkeit.
  
  Der Antrag auf Prämienverbilligung kann auch 
  eigenständig beim zuständigen Kantonsamt gestellt 
  werden."

- Stats row (3 columns):
  +1'000 | FINMA | 4.8/5
  Dossiers/Jahr | Registriert | Kundenbewertung

- CTA button full width teal:
  "Ich habe gelesen und verstanden — Weiter →"

- Small link below: 
  "Direkt zum offiziellen Kantonsamt (asb.bs.ch) ↗"
  (opens new tab)

Behavior:
- Blocks all interaction until dismissed
- Stores 'disclaimer_shown' in localStorage
- Does NOT show again for 7 days
- On mobile: full screen takeover
- Cannot be closed by clicking outside

━━━ 2. COMPLETE PHONE NUMBER REMOVAL ━━━
Remove +41 76 779 0449 from:
- Top bar header
- Final CTA section phone button
- Footer Kontakt column (remove phone + email)
- All tel: links anywhere on the site

Replace phone CTA with:
"Formular ausfüllen →" scrolling to #funnel

Footer Kontakt column becomes:
- Antrag stellen (#funnel smooth scroll)
- Rückruf anfordern (/kontakt)
- Kontaktformular (/kontakt)

━━━ 3. COMPLETE FUNNEL REBUILD (Funnel.jsx) ━━━

The funnel is now FULLY TRAPPED — once user clicks 
an option, they CANNOT navigate away from the funnel 
page. Inspired by praemienverbilligung-zurich.ch 
second screenshot.

NEW FUNNEL ARCHITECTURE:
When user clicks any situation option in step 1,
redirect to /antrag page with the selection as 
URL param: /antrag?situation=familie

The /antrag page is a FULL PAGE funnel (no header nav,
no footer) — just the funnel, sidebar trust elements,
and logo only.

LEFT SIDEBAR on /antrag page (desktop only):
- prämienhilfe.ch logo (links to / in new tab only)
- Progress steps list:
  ● Identifikation (active)
  ○ Ergänzende Informationen
  ○ Ihre Situation  
  ○ Abgeschlossen
  
  (same style as praemienverbilligung-zurich.ch)

- Below steps, trust block:
  EVO Partners GmbH
  ✓ FINMA-anerkannter Broker
  ✓ Situationsanalyse · Unverbindlich
  ★ 4.8/5 von unseren Klienten bewertet
  +1'000 Dossiers pro Jahr bearbeitet

MAIN CONTENT center:
White card with "🔒 Sicheres Formular" at top

STEP 1 (on homepage funnel — situation selector):
Question: "Was beschreibt Ihre Situation am besten?"

6 clickable rows (clicking auto-advances to /antrag):
[👤 Einzelperson                    →]
[👨‍👩‍👧 Familie mit Kindern             →]
[💑 Paar ohne Kinder                →]
[🎓 Student / Auszubildende         →]
[💔 Getrennt / Geschieden           →]
[👴 Rentner / Pensionierte          →]

Each option has icon + label + arrow
Clicking redirects to /antrag?situation=X

STEP 2 on /antrag — Email capture first (like screenshot):
Title: "Zu Beginn benötigen wir Ihre E-Mail-Adresse"
Show "IHR ANTRAG" tag with situation selected + "Ändern" link

Field: E-Mail * (placeholder: nom@exemple.ch)
Legal text: 
"Mit dem Fortfahren akzeptieren Sie unsere 
Datenschutzrichtlinie und die Verarbeitung 
Ihrer persönlichen Daten."
[Weiter →] button (disabled until valid email)

STEP 3 — Haushalt:
Title: "Wie viele Personen leben in Ihrem Haushalt?"
Number stepper: [−] [1 Person] [+]
[Weiter →] button

STEP 4 — Einkommen:
Title: "Wie hoch ist Ihr monatliches Haushaltseinkommen?"
4 clickable rows:
[Unter CHF 2'000       →]
[CHF 2'000 – 4'000     →]
[CHF 4'000 – 6'000     →]
[Über CHF 6'000        →]

STEP 5 — Kontaktdaten:
Title: "Wie können wir Sie erreichen?"
Fields:
  Vorname * | Nachname *
  Telefon * (Swiss format)
  
Legal checkbox (required):
☐ Ich akzeptiere die Datenschutzbestimmungen von 
  EVO Partners GmbH und stimme der Verarbeitung 
  meiner Daten zum Zweck der Beratung zu.

[Antrag einreichen →] full width teal
(disabled until checkbox checked + fields valid)

STEP 6 — Confirmation:
✓ Green checkmark animation
Title: "Vielen Dank, [Vorname]!"
"Wir haben Ihre Anfrage erhalten und werden 
uns innerhalb von 24 Stunden bei Ihnen melden."

Show summary box:
Situation: [selected]
Haushalt: [X Personen]
Einkommen: [range]
E-Mail: [email]

"Sie erhalten in Kürze eine Bestätigung 
per E-Mail."

━━━ 4. HOMEPAGE FUNNEL UPDATE ━━━
The homepage funnel (step 1 only) shows the 
situation selector as described above.

Remove the canton selector entirely from homepage
— this page is ONLY for Basel-Stadt.

H1 stays: "Haben Sie Anspruch auf 
Prämienverbilligung im Kanton Basel-Stadt?"

Add "Basel-Stadt" explicitly to the H1 for SEO.

Social proof counter below funnel card:
"🔴 LIVE  3 Personen aus Basel-Stadt haben 
heute einen Antrag eingereicht"
(Animated — cycles through 2-5 randomly on load)

━━━ 5. REMOVE INCOME THRESHOLDS TABLE ━━━
In the "Prämienverbilligung im Kanton Basel-Stadt" 
section, remove the definition list rows:
- Einkommensgrenze Einzelperson CHF 49'375
- Einkommensgrenze 4-Pers.-Haushalt CHF 97'000

Keep only:
- Bezüger im Kanton: ca. 30'000
- Zuständige Stelle: ASB Basel-Stadt
- Antragsfrist 2027: September–31. Dezember 2026

Replace the removed rows with this paragraph:
"Die Einkommensgrenzen variieren je nach 
Haushaltsgrösse und persönlicher Situation. 
Viele Personen erhalten Prämienverbilligung, 
auch wenn sie nicht damit rechnen. Es lohnt 
sich in jedem Fall, den Anspruch zu prüfen."

━━━ 6. FAQ ADDITIONS ━━━
Add these two new FAQ items at the top:

Q: Wer sind wir?
A: prämienhilfe.ch ist ein Service von EVO 
Partners GmbH, einem FINMA-registrierten 
unabhängigen Versicherungsbroker mit Sitz in 
der Schweiz. Wir sind seit 2020 tätig und haben 
bereits über 1'000 Dossiers für Prämienverbilligung 
bearbeitet. Neben der Prämienverbilligung beraten 
wir unsere Klienten auch zu ihrer gesamten 
Krankenversicherungssituation, um die beste 
Abdeckung zum besten Preis zu finden.

Q: Sind Sie ein offizielles Kantonsamt?
A: Nein. prämienhilfe.ch ist eine private, 
unabhängige Beratungsplattform. Wir sind kein 
staatliches Organ. Die Prämienverbilligung kann 
auch direkt beim Amt für Sozialbeiträge (ASB) 
Basel-Stadt beantragt werden. Unser Service 
erleichtert Ihnen den Prozess und prüft 
gleichzeitig, ob Ihre Versicherungssituation 
insgesamt optimiert werden kann.

━━━ 7. FOOTER SMOOTH SCROLL ━━━
All footer links that point to sections (#funnel, 
#so-funktioniert-es, etc.) must use smooth scroll:

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute('href'))
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})

━━━ 8. COMPANY NAME — EVO PARTNERS GMBH ━━━
Replace ALL occurrences of "EVO Partners Sàrl" with 
"EVO Partners GmbH" everywhere:
- Footer branding
- Footer legal text  
- Disclaimer popup
- Impressum page
- Datenschutz page
- FAQ answers
- © copyright line

━━━ 9. FOOTER CLEANUP ━━━
Remove from footer:
- Phone number (+41 76 779 0449)
- Email address (msegui@evo-partners.ch)
- Tel: and mailto: links

Keep contact methods as:
- Antrag stellen (smooth scroll to #funnel)
- Rückruf anfordern (/kontakt — new tab if external)
- Kontaktformular (/kontakt)

━━━ 10. EXTERNAL LINKS — NEW TAB ━━━
All links that navigate away from the domain 
MUST open in new tab with security attributes:

Add to ALL external <a> tags:
target="_blank" rel="noopener noreferrer"

External links to check:
- asb.bs.ch (official canton office)
- Any government links in FAQ
- Any official Swiss admin links
- Footer legal links if they point to external pages
- The "Direkt zum offiziellen Kantonsamt" in popup

Internal navigation links stay in same tab.

━━━ 11. SEO OPTIMIZATION — BASEL-STADT SPECIFIC ━━━

Update Base.astro <head> for homepage:

Title: "Prämienverbilligung Basel-Stadt 2026 – 
Antrag stellen | prämienhilfe.ch"

Meta description: 
"Prämienverbilligung im Kanton Basel-Stadt 
beantragen. EVO Partners GmbH hilft Ihnen 
kostenlos bei der Einreichung Ihres Antrags. 
Jetzt Anspruch prüfen — in 20 Minuten."

Add schema markup in <head>:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "prämienhilfe.ch – EVO Partners GmbH",
  "description": "Unabhängige Beratung bei der Prämienverbilligung im Kanton Basel-Stadt",
  "url": "https://praemienhilfe.ch",
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "Basel-Stadt"
  },
  "serviceType": "Prämienverbilligung Beratung",
  "provider": {
    "@type": "Organization",
    "name": "EVO Partners GmbH",
    "description": "FINMA-registrierter Versicherungsbroker"
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Wer hat Anspruch auf Prämienverbilligung in Basel-Stadt?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Personen mit Wohnsitz in Basel-Stadt in bescheidenen wirtschaftlichen Verhältnissen. Es lohnt sich in jedem Fall, den Anspruch zu prüfen."
      }
    },
    {
      "@type": "Question", 
      "name": "Was kostet die Hilfe bei der Prämienverbilligung?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Die Hilfe bei der Prämienverbilligung ist für Sie kostenlos. EVO Partners GmbH ist ein FINMA-registrierter Versicherungsbroker."
      }
    }
  ]
}
</script>

Add H1 keyword optimization:
Change H1 to: 
"Prämienverbilligung Basel-Stadt — 
Anspruch prüfen und Antrag stellen"

Add keyword-rich paragraph at top of info section:
"Die Prämienverbilligung (auch IPV — Individuelle 
Prämienverbilligung) im Kanton Basel-Stadt wird 
vom Amt für Sozialbeiträge (ASB) verwaltet. 
Rund 30'000 Einwohnerinnen und Einwohner des 
Kantons Basel-Stadt erhalten bereits diese 
finanzielle Unterstützung zur Reduktion ihrer 
Krankenkassenprämien."

━━━ 12. EXIT INTENT POPUP ━━━
Detect when mouse moves toward browser top (exit intent):

document.addEventListener('mouseleave', (e) => {
  if (e.clientY < 10 && !localStorage.getItem('exit_shown')) {
    showExitPopup()
    localStorage.setItem('exit_shown', 'true')
  }
})

Exit popup content (smaller than disclaimer):
Title: "Warten Sie — prüfen Sie zuerst Ihren Anspruch!"
Text: "Viele Berechtigte wissen nicht, dass sie 
Anspruch auf bis zu CHF 3'000 pro Jahr haben. 
Die Prüfung dauert nur 20 Minuten."
CTA: [Jetzt prüfen →] (scrolls to funnel)
Link: "Nein danke, ich verzichte auf meine Verbilligung"

━━━ 13. STICKY FUNNEL SIDEBAR (desktop) ━━━
On desktop (lg+), when user scrolls past the hero,
show a sticky mini-funnel in bottom-right corner:

Mini widget (w-72, fixed bottom-6 right-6, 
white card, shadow-xl, rounded-xl):
Title: "Anspruch prüfen"
"Kostenlose Prüfung in 20 Min."
[Jetzt starten →] teal button

Hide when user is already in hero viewport.
Hide on mobile (use mobile sticky bar instead).

━━━ 14. SOCIAL PROOF ENHANCEMENT ━━━
Add to trust bar section:
- "Über 1'000 Dossiers bearbeitet" 
- "FINMA-registriert" with shield icon
- "4.8/5 Kundenbewertung" with 5 stars

Add floating notification (bottom-left, mobile hidden):
Appears after 8 seconds:
"✓ Marie aus Basel hat soeben ihren 
Antrag eingereicht"
Auto-dismisses after 5 seconds
Cycles through 3 fake names from Basel

━━━ 15. PERFORMANCE & TECHNICAL ━━━
- Add loading="lazy" to all images
- Add width and height to all img tags
- Preconnect to Google Fonts
- Add netlify.toml cache headers:
  [[headers]]
    for = "/_astro/*"
    [headers.values]
      Cache-Control = "public, max-age=31536000, immutable"

━━━ PAGES TO UPDATE ━━━

HOMEPAGE (index.astro):
- Situation funnel (step 1 only)
- Remove canton selector
- Add H1 with "Basel-Stadt"
- Remove income thresholds from info section
- Add social proof counter
- All phone numbers removed
- Schema markup added
- Exit intent popup
- Disclaimer popup

BASEL-STADT page (/basel-stadt):
- Same as homepage (this IS the Basel-Stadt page)
- Canonical: https://praemienhilfe.ch/basel-stadt
- Title: "Prämienverbilligung Basel-Stadt | prämienhilfe.ch"
- Pre-select Basel-Stadt in funnel

/ANTRAG page (NEW — create this):
- Full page funnel trap (no nav, no footer)
- Left sidebar with steps + trust elements
- Center card with steps 2-6
- Progress breadcrumb: 
  Identifikation > Ergänzend > Situation > Abgeschlossen
- Logo only links to / in new tab

FAQ page (/faq):
- Add "Wer sind wir?" as first question
- Add "Sind Sie ein offizielles Kantonsamt?" 
  as second question

IMPRESSUM page:
- Replace all "Sàrl" with "GmbH"
- Remove phone and email

DATENSCHUTZ page:
- Replace all "Sàrl" with "GmbH"
- Update data processing description to mention
  the /antrag funnel email collection

━━━ DELIVERABLES CHECKLIST ━━━
Before finishing, verify:
✅ Disclaimer popup shows on first visit
✅ Disclaimer popup doesn't show again for 7 days
✅ Phone/email removed from all pages
✅ Funnel step 1: situation selector (6 options)
✅ /antrag page created with left sidebar
✅ /antrag has no header nav (trapped funnel)
✅ Email captured in step 2 before other data
✅ Legal checkbox required before submit
✅ Income thresholds table section removed
✅ FAQ has 2 new "who we are" questions
✅ Footer links smooth scroll
✅ All "Sàrl" → "GmbH" everywhere
✅ No phone/email in footer
✅ All external links open new tab
✅ H1 contains "Basel-Stadt" for SEO
✅ Schema markup added
✅ Exit intent popup implemented
✅ Social proof counter in hero
✅ Sticky mini-funnel desktop
✅ Build passes: npm run build
✅ No console errors