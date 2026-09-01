You are improving the existing prämienhilfe.ch Astro website.
Read the full codebase first before making any changes.
This is a NEW PAGE creation — src/pages/index.astro becomes 
the true national homepage. The existing Basel-Stadt content 
moves to src/pages/basel-stadt.astro (already exists — just 
make sure it's intact).

Tech stack: Astro + React islands + Tailwind + Netlify
Preserve all existing components and styles.

━━━ GOAL ━━━
Replace the current homepage (which is a Basel-Stadt page) 
with a true national homepage covering all Swiss cantons.
The Basel-Stadt page stays at /basel-stadt unchanged.

━━━ SEO — index.astro head ━━━
title: "Prämienverbilligung Schweiz 2026 – 
Antrag stellen | prämienhilfe.ch"

description: "Prämienverbilligung in der ganzen Schweiz 
beantragen. EVO Partners GmbH hilft Ihnen kostenlos bei 
der Einreichung Ihres Antrags — egal in welchem Kanton."

canonical: https://praemienhilfe.ch/

Schema markup — add to <head>:
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "prämienhilfe.ch",
  "url": "https://praemienhilfe.ch",
  "description": "Unabhängige Hilfe bei der Prämienverbilligung in der ganzen Schweiz",
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
      "name": "Wer hat Anspruch auf Prämienverbilligung in der Schweiz?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Jede Person mit Wohnsitz in der Schweiz, deren steuerbares Einkommen unterhalb der kantonal festgelegten Grenze liegt. Über 2.4 Millionen Personen in der Schweiz sind berechtigt."
      }
    },
    {
      "@type": "Question",
      "name": "Was kostet die Hilfe bei der Prämienverbilligung?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Der Service ist vollständig kostenlos. EVO Partners GmbH ist ein FINMA-registrierter Versicherungsbroker."
      }
    },
    {
      "@type": "Question",
      "name": "Muss ich jedes Jahr einen neuen Antrag stellen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In den meisten Kantonen ja. Die Prämienverbilligung wird jährlich neu beantragt. Wir informieren Sie über die genaue Regelung in Ihrem Kanton."
      }
    }
  ]
}
</script>

━━━ SECTION 1 — HERO ━━━
Layout: 2 columns (55% left, 45% right)
Same visual style as current site (SVA Aargau aesthetic)

Left column:
  H1 (48px bold dark):
  "Prämienverbilligung beantragen —
  in jedem Kanton"

  Paragraph (16px gray):
  "Die Prämienverbilligung (IPV) steht Tausenden 
  von Schweizer Einwohnerinnen und Einwohnern zu 
  — doch viele beantragen sie nie. Wir helfen 
  Ihnen, Ihren Anspruch zu prüfen und Ihren 
  Antrag korrekt einzureichen. Kostenlos und 
  unverbindlich."

  CANTON SELECTOR CARD (white, rounded-2xl, 
  shadow, 4px teal top border):
  
  Label: "SCHRITT 1 VON 1"
  Question (bold 18px): 
  "In welchem Kanton wohnen Sie?"
  
  Active cantons (clickable, navigate to canton page):
  ┌─────────────────────────────────────┐
  │ 🏛 Basel-Stadt              →       │
  ├─────────────────────────────────────┤
  │ 🏛 Basel-Landschaft         →       │
  └─────────────────────────────────────┘
  
  Coming soon cantons (grayed out, not clickable,
  show "Demnächst" badge on right):
  ┌─────────────────────────────────────┐
  │ 🏛 Zürich        [Demnächst]        │
  ├─────────────────────────────────────┤
  │ 🏛 Bern          [Demnächst]        │
  ├─────────────────────────────────────┤
  │ 🏛 Aargau        [Demnächst]        │
  ├─────────────────────────────────────┤
  │ 🏛 Luzern        [Demnächst]        │
  ├─────────────────────────────────────┤
  │ 🏛 Solothurn     [Demnächst]        │
  ├─────────────────────────────────────┤
  │ 🏛 Genf          [Demnächst]        │
  └─────────────────────────────────────┘

  Active canton rows: teal hover bg, cursor pointer
  Clicking Basel-Stadt → navigate to /basel-stadt
  Clicking Basel-Landschaft → navigate to /basel-landschaft
  Coming soon rows: opacity-40, cursor not-allowed

Right column:
  Same decorative circle + arc as existing site
  
  Floating proof card (bottom-left of circle):
  "✓ Über 1'000 Dossiers erfolgreich bearbeitet"

━━━ SECTION 2 — TRUST BAR ━━━
Same amber (#FFF8E7) background as existing site
4 stats with amber left border:

1'000+              CHF 500–3'000      20 Minuten       FINMA
Dossiers pro Jahr   Ersparnis/Jahr     Erstgespräch     Registriert

━━━ SECTION 3 — WAS IST PRÄMIENVERBILLIGUNG? ━━━
White background

H2: "Was ist die Prämienverbilligung?"

2-column layout (text left, key facts right):

Left — flowing text:
"Die individuelle Prämienverbilligung (IPV) ist 
eine staatliche Unterstützungsleistung für 
Personen und Haushalte in bescheidenen 
wirtschaftlichen Verhältnissen. Der Bund und 
die Kantone beteiligen sich gemeinsam an den 
Kosten der obligatorischen Krankenversicherung 
(KVG).

In der Schweiz haben über 2.4 Millionen Personen 
Anspruch auf Prämienverbilligung. Viele davon 
stellen jedoch keinen Antrag — aus Unwissenheit, 
wegen der administrativen Hürden oder weil sie 
nicht wissen, ob sie berechtigt sind."

Below — bullet list (red dot, same style as existing):
● Ihr steuerbares Einkommen und Vermögen
● Die Anzahl Personen in Ihrem Haushalt
● Der Kanton, in dem Sie wohnen
● Ihre aktuelle Krankenkassenprämie

Right — info box (teal left border 4px, light bg):
Title: "Wussten Sie?"
"Über 2.4 Millionen Personen in der Schweiz 
haben Anspruch auf Prämienverbilligung — 
viele beantragen sie jedoch nie."

Stat: CHF 1.5 Mrd.
"werden jährlich als Prämienverbilligung 
ausbezahlt"

━━━ SECTION 4 — KANTONE CARDS ━━━
Light gray (#F5F7F8) background

H2: "Wählen Sie Ihren Kanton"

Paragraph:
"Jeder Kanton hat eigene Einkommensgrenzen, 
Fristen und zuständige Stellen. Wählen Sie 
Ihren Kanton für alle relevanten Informationen 
und die direkte Antragstellung."

Grid (2 cols desktop, 1 col mobile):

ACTIVE CARD — Basel-Stadt:
┌──────────────────────────────┐
│ 🏛️ Basel-Stadt               │
│ ─────────────────────────── │
│ ca. 30'000 Bezüger           │
│ Frist: Sept.–Dez. 2026       │
│ Zuständig: ASB Basel-Stadt   │
│                              │
│ [Antrag stellen →]           │
└──────────────────────────────┘
teal border, clickable → /basel-stadt

ACTIVE CARD — Basel-Landschaft:
┌──────────────────────────────┐
│ 🏛️ Basel-Landschaft          │
│ ─────────────────────────── │
│ ca. 25'000 Bezüger           │
│ Frist: Sept.–Dez. 2026       │
│ Zuständig: SVA Basel-Land    │
│                              │
│ [Antrag stellen →]           │
└──────────────────────────────┘
teal border, clickable → /basel-landschaft

COMING SOON CARDS (4 cards, grayed out):
Zürich | Bern | Aargau | Luzern
Each shows: "Demnächst verfügbar"
Badge: gray, opacity-50, no click action

━━━ SECTION 5 — SO FUNKTIONIERT ES ━━━
Light green (#F0F7F0) background
Same numbered style as existing site

H2 (green): "So funktioniert unsere Hilfe"

4 numbered steps as flowing text:

① Kanton wählen und Situation angeben
"Wählen Sie Ihren Wohnkanton und beschreiben 
Sie kurz Ihre persönliche Situation — ob 
Einzelperson, Familie, Student oder Rentner. 
Das dauert weniger als 2 Minuten."

② Kostenlose Prüfung durch unsere Experten
"Wir analysieren Ihre Situation und prüfen, 
ob und in welcher Höhe Sie Anspruch auf 
Prämienverbilligung haben. Wir kennen die 
genauen Kriterien und Fristen jedes Kantons."

③ Dossier zusammenstellen
"Wir helfen Ihnen, alle notwendigen Unterlagen 
korrekt zusammenzustellen: Steuererklärung, 
Versicherungspolice, Lohnabrechnungen und 
weitere Dokumente je nach Kanton."

④ Antrag einreichen
"Den Antrag reichen wir gemeinsam mit Ihnen 
beim zuständigen Kantonsamt ein. Sie erhalten 
danach innerhalb weniger Wochen einen Entscheid 
vom Kanton."

━━━ SECTION 6 — WARUM KEINEN ANTRAG? ━━━
White background

H2: "Warum verzichten viele Berechtigte auf 
ihre Prämienverbilligung?"

Flowing text (NOT cards):
"Über 2.4 Millionen Schweizerinnen und 
Schweizer haben Anspruch auf finanzielle 
Unterstützung bei den Krankenkassenprämien. 
Ein grosser Teil davon stellt jedoch nie 
einen Antrag. Die häufigsten Gründe:"

4 bullet points (red dot):
● Zu kompliziert — Jeder Kanton hat eigene 
  Formulare, Fristen und Anforderungen. 
  Das Verfahren wirkt auf den ersten Blick 
  aufwendig.

● Unsicher über den Anspruch — Viele Personen 
  glauben, sie hätten keinen Anspruch, obwohl 
  sie berechtigt wären. Die Einkommensgrenzen 
  sind grosszügiger als oft angenommen.

● Fristen verpasst — Die Anmeldefristen 
  variieren je nach Kanton und werden oft 
  übersehen. Ein verpasster Antrag bedeutet 
  ein verlorenes Jahr Verbilligung.

● Keine Zeit — Das Zusammenstellen der 
  Unterlagen und das Ausfüllen der Formulare 
  kostet Zeit, die viele nicht haben.

Closing sentence:
"Genau hier setzen wir an. Wir kennen die 
Anforderungen jedes Kantons und begleiten 
Sie durch den gesamten Prozess."

━━━ SECTION 7 — WER WIR SIND ━━━
Light teal (#E8F4F8) background

H2: "Wer steckt hinter prämienhilfe.ch?"

2-column layout:

Left — text:
"prämienhilfe.ch ist ein Service von EVO 
Partners GmbH, einem unabhängigen, FINMA-
registrierten Versicherungsbroker mit Sitz 
in der Schweiz.

Wir sind keine staatliche Behörde und kein 
Kantonsamt. Wir sind ein privates Beratungs-
unternehmen, das sich auf die Schweizer 
Krankenversicherung spezialisiert hat.

Unser Angebot umfasst:"

Bullets:
● Hilfe bei der Prämienverbilligung (IPV) 
  — für alle Kantone
● Unabhängige Beratung zur Krankenversicherung 
  (KVG und VVG)
● Optimierung Ihrer Versicherungssituation 
  — gleiche Leistungen, tiefere Prämien

"Die Hilfe bei der Prämienverbilligung ist 
für Sie vollständig kostenlos. Als FINMA-
registrierter Broker werden wir durch unsere 
Versicherungspartner vergütet, wenn wir eine 
Optimierung Ihrer Krankenversicherung empfehlen. 
Es besteht keinerlei Verpflichtung dazu."

Right — trust block (white card, teal border):
✓ FINMA-registrierter Versicherungsbroker
✓ Über 1'000 Dossiers bearbeitet seit 2020
✓ Unabhängig von Kantonen und Versicherern
✓ Keinerlei Verpflichtung für den Klienten
★★★★★ 4.8/5 Kundenbewertung

━━━ SECTION 8 — FAQ ━━━
Light gray (#F5F7F8) background

H2: "Häufige Fragen"

Accordion (same CSS-only style as existing site):

Q: Wer hat schweizweit Anspruch auf 
Prämienverbilligung?
A: Jede Person mit Wohnsitz in der Schweiz, 
deren steuerbares Einkommen und Vermögen 
unterhalb der kantonal festgelegten Grenze 
liegt. Die Grenzen variieren je nach Kanton 
und Haushaltsgrösse erheblich. Auch Personen, 
die glauben, zu viel zu verdienen, sollten 
ihren Anspruch prüfen lassen. Über 2.4 
Millionen Personen sind schweizweit berechtigt.

Q: Kann ich für mehrere Personen einen 
Antrag stellen?
A: Ja. Ein Antrag gilt pro Haushalt und kann 
alle versicherten Personen einschliessen — 
Partner, Kinder und weitere Haushaltsangehörige. 
Kinder und Jugendliche bis 25 Jahre in 
Erstausbildung haben häufig erhöhten Anspruch.

Q: Muss ich jedes Jahr einen neuen Antrag 
stellen?
A: In den meisten Kantonen ja — die 
Prämienverbilligung wird jährlich neu beantragt. 
In einigen Kantonen erfolgt eine automatische 
Berechnung aufgrund der Steuerdaten. Wir 
informieren Sie über die genaue Regelung 
in Ihrem Kanton.

Q: Was kostet mich dieser Service?
A: Die Hilfe bei der Prämienverbilligung ist 
für Sie vollständig kostenlos. Wir sind ein 
FINMA-registrierter Versicherungsbroker 
(EVO Partners GmbH) und werden nicht direkt 
von Ihnen vergütet.

Q: Sind Sie ein offizielles Kantonsamt?
A: Nein. prämienhilfe.ch ist eine private, 
unabhängige Beratungsplattform. Wir sind kein 
staatliches Organ. Den Antrag können Sie auch 
direkt beim zuständigen Kantonsamt stellen. 
Wir erleichtern Ihnen diesen Prozess und 
prüfen gleichzeitig, ob Ihre Versicherungs-
situation optimiert werden kann.

Q: Was passiert nach dem Erstgespräch?
A: Sie erhalten eine Zusammenfassung Ihrer 
Situation sowie klare Handlungsempfehlungen. 
Wenn Sie möchten, begleiten wir Sie bei der 
Zusammenstellung des Dossiers und der 
Einreichung beim Kantonsamt. Es besteht 
keinerlei Verpflichtung.

━━━ SECTION 9 — DEADLINE URGENCY ━━━
White background, teal left border box

H2: "Verpassen Sie nicht die Antragsfrist"

Warning box (amber bg #FFF8E7, amber border):
"⚠️ Die Antragsfristen für 2027 laufen bald ab."

Definition list (alternating rows):
Kanton              Antragsfrist
Basel-Stadt         September – 31. Dezember 2026
Basel-Landschaft    September – 31. Dezember 2026
Zürich              Oktober – 31. Dezember 2026
Bern                Oktober – 31. Dezember 2026

Closing text (red, bold):
"Wer die Frist verpasst, verliert die 
Verbilligung für das gesamte Jahr — 
das können CHF 500 bis CHF 3'000 sein."

━━━ SECTION 10 — FINAL CTA ━━━
Teal (#0087A0) background, white text

H2 white: "Jetzt Anspruch prüfen lassen"

Text white:
"Wählen Sie Ihren Kanton und prüfen Sie 
in 20 Minuten, ob Sie Anspruch auf 
Prämienverbilligung haben. Kostenlos 
und unverbindlich."

Two buttons:
[Kanton wählen →] white bg, teal text
(smooth scrolls to #kanton-selector in hero)

Small disclaimer below buttons:
"prämienhilfe.ch ist ein privater 
Beratungsservice von EVO Partners GmbH, 
FINMA-registrierter Versicherungsbroker. 
Kein offizielles Kantonsorgan."

━━━ FOOTER ━━━
Same as existing site BUT update:

Col 2 rename to "Kantone":
- Basel-Stadt (/basel-stadt)
- Basel-Landschaft (/basel-landschaft)
- Zürich (grayed, coming soon)
- Bern (grayed, coming soon)
- Aargau (grayed, coming soon)

Col 3 "Informationen":
- Was ist Prämienverbilligung? 
  (smooth scroll to #was-ist)
- So funktioniert es 
  (smooth scroll to #so-funktioniert-es)
- FAQ (smooth scroll to #faq)
- Über uns (smooth scroll to #wer-wir-sind)
- Kontakt (/kontakt)

Replace all "EVO Partners Sàrl" → "EVO Partners GmbH"
Remove phone and email from footer
Keep: Impressum | Datenschutz | Nutzungsbedingungen

━━━ NAVIGATION UPDATE ━━━
Update header nav Kantone dropdown:
- Basel-Stadt (/basel-stadt) — active
- Basel-Landschaft (/basel-landschaft) — active
- ── Demnächst ──
- Zürich — grayed out, disabled
- Bern — grayed out, disabled
- Aargau — grayed out, disabled

━━━ ANCHOR IDs — add to sections ━━━
Hero canton selector:  id="kanton-selector"
Section 3:            id="was-ist"
Section 5:            id="so-funktioniert-es"
Section 7:            id="wer-wir-sind"
Section 8:            id="faq"

All smooth scroll links use:
document.querySelector(href).scrollIntoView({
  behavior: 'smooth', block: 'start'
})

━━━ INTERNAL LINKING FOR SEO ━━━
Add in section 4 canton cards, below each active card:
Basel-Stadt card footer:
"Mehr erfahren → 
Prämienverbilligung Basel-Stadt"
(links to /basel-stadt)

Add contextual links in section 3 text:
"individuelle Prämienverbilligung" 
→ links to /so-funktioniert-es

━━━ MOBILE ━━━
- Canton selector: full width, stacked rows
- Section 3: single column
- Section 4: canton cards single column
- Section 7: single column (trust block below text)
- Sticky bottom CTA: 
  [Kanton wählen →] full width teal
  (scrolls to #kanton-selector)
- Coming soon cantons: hide after 4th one on mobile

━━━ PERFORMANCE ━━━
- No new React islands needed on this page
- Pure Astro static HTML (zero JS except smooth scroll)
- Lazy load all images
- Reuse existing Tailwind classes
- No new dependencies

━━━ DELIVERABLES CHECKLIST ━━━
Before finishing verify:
✅ src/pages/index.astro is the new national homepage
✅ /basel-stadt and /basel-landschaft untouched
✅ Canton selector in hero — active 2, coming soon 6
✅ Clicking active canton navigates to correct page
✅ All 10 sections present with correct content
✅ Anchor IDs on all sections
✅ Footer smooth scroll links working
✅ All "Sàrl" replaced with "GmbH"
✅ No phone/email in footer
✅ Schema markup in <head>
✅ SEO title and description updated
✅ Mobile sticky CTA works
✅ npm run build passes with zero errors
✅ README updated with new page structure