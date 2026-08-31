# prämienhilfe.ch — Design Spec

**Status:** Approved (user chose to proceed directly using `instructions.md` as the base spec).

## Source of truth

- **Build instructions:** `/Users/marco/Documents/repos/subsidy-website/instructions.md` — tech stack, file structure, funnel behavior, API contract, SEO, deployment.
- **Visual/content prototype:** `/Users/marco/Downloads/Praemienhilfe Landing v4 (standalone).html` — a self-extracting "bundler" page. Its real source was decoded to `/tmp/page_source.html` (JSON string inside the `<script type="__bundler/template">` tag). That decoded source is the exact visual/content reference: every color hex, spacing value, and word of German copy for the Basel-Stadt version of the page.

## Extra design tokens (beyond the 4 named in instructions.md)

instructions.md specifies these Tailwind colors:
```
teal:  { DEFAULT: '#0087A0', dark: '#005F73', light: '#E8F4F8' }
amber: { DEFAULT: '#F0A500', light: '#FFF8E7' }
swiss: { red: '#CC0000', green: '#3D8B37' }
dark:  '#1A1A2A'
```

The prototype also uses these one-off grays/accents, applied via Tailwind arbitrary values (`text-[#3D4A50]` etc.) rather than extending the config further:
`#3D4A50` (body copy), `#6B7A80` (muted label), `#8A979C` (fine print), `#C7CFD3` (topbar muted), `#D6DFE2` (borders), `#E2E8EA` (borders), `#F5F7F8` (FAQ section bg), `#DFE6E8` (FAQ divider), `#9AA6AC` (footer muted), `#2E3442` (footer divider), `#6EC5D4` (footer heading accent), `#D8DEE1` (footer link), `#14141F` (footer legal bar bg), `#8A959B` (footer legal text), `#F0F7F0` (How-it-works section bg), `#2E6B29` (green heading/success text), `#A9B4B9` / `#C3D5DA` (disabled/inactive dots & dropdown items), `#3F7788` / `#D6EAF1` (photo placeholder stripe).

## Content extracted verbatim from the prototype (Basel-Stadt)

**Hero:**
- H1: "Haben Sie Anspruch auf Prämienverbilligung?"
- Sub: "Der Kanton gewährt Einwohnerinnen und Einwohnern in bescheidenen wirtschaftlichen Verhältnissen Beiträge zur Reduktion der Krankenkassenprämien. Wir helfen Ihnen, Ihren Anspruch zu prüfen und Ihren Antrag korrekt einzureichen."
- Proof card: "Ca. 30'000 Personen erhalten bereits Prämienverbilligung in BS"
- Photo placeholder: dashed-stripe circle, monospace caption "[Foto: Schweizer Familie] 1200 × 1200"

**Trust bar stats (amber, `#FFF8E7` bg, `#F0A500` left border):**
- 30'000+ / Bezüger in BS
- CHF 500–3'000 / Ersparnis pro Jahr
- 20 Minuten / Gespräch
- Seit 2020 / Erfahrung

**Info section (Basel-Stadt):**
- H2: "Prämienverbilligung im Kanton Basel-Stadt"
- Para 1: "Rund 30'000 Personen im Kanton Basel-Stadt erhalten bereits Prämienverbilligungen. Das Verfahren ist kurz und einfach — es lohnt sich zu prüfen, ob Sie Anspruch haben. Es genügt ein Antrag pro Haushalt."
- Para 2: "Anspruch haben Personen, deren Haushalts-Einkommen und Vermögen unterhalb der Leistungsgrenze liegt und die seit dem 1. Januar des laufenden Jahres im Kanton wohnen."
- Fact table (alternating `#F5F7F8`/`#FFFFFF` rows, left border `#0087A0` 4px):
  - Einkommensgrenze Einzelperson — CHF 49'375
  - Einkommensgrenze 4-Pers.-Haushalt — CHF 97'000
  - Bezüger im Kanton — ca. 30'000
  - Zuständige Stelle — ASB Basel-Stadt
  - Antragsfrist 2027 — September–31. Dezember 2026
- Closing para: "Haben sich Ihre persönlichen oder finanziellen Verhältnisse verändert? Auch bestehende Bezüger müssen Änderungen melden. Wir begleiten Sie durch den gesamten Prozess."

**How it works (bg `#F0F7F0`, heading color `#2E6B29`):**
- H2: "So funktioniert die Beantragung"
- 1 Anspruch prüfen — "In einem kurzen Gespräch von ca. 20 Minuten prüfen wir gemeinsam, ob und in welcher Höhe Sie Anspruch auf Prämienverbilligung haben."
- 2 Dossier zusammenstellen — "Wir helfen Ihnen, alle notwendigen Unterlagen korrekt zusammenzustellen: Steuererklärung, Versicherungspolice, Lohnabrechnungen."
- 3 Antrag einreichen — "Den Antrag reichen wir gemeinsam mit Ihnen beim Amt für Sozialbeiträge Basel-Stadt ein." *(canton-specific office name)*

**Problem section:**
- H2: "Warum beantragen viele Berechtigte keine Prämienverbilligung?"
- Body: "Obwohl Tausende von Personen Anspruch hätten, stellen viele keinen Antrag. Die häufigsten Gründe: Das Verfahren wirkt kompliziert, viele wissen nicht ob sie berechtigt sind, und die Fristen werden oft verpasst. Dabei ist der Prozess einfacher als erwartet — vorausgesetzt, man kennt die genauen Anforderungen und Fristen."
- Reasons (red dot bullets, `#CC0000`):
  - **Zu kompliziert** — Das Antragsverfahren wirkt aufwendig
  - **Unsicher** — Viele wissen nicht ob sie berechtigt sind
  - **Keine Zeit** — Fristen werden oft verpasst

**FAQ (bg `#F5F7F8`, max-width 900px):**
1. Wer hat Anspruch auf Prämienverbilligung? — "Anspruch haben Personen in bescheidenen wirtschaftlichen Verhältnissen mit Wohnsitz in der Schweiz. Im Kanton Basel-Stadt gilt: Einzelpersonen bis CHF 49'375, 4-Personen-Haushalte bis CHF 97'000 Jahreseinkommen."
2. Wie viel kann ich erhalten? — "Zwischen CHF 500 und CHF 3'000 pro Jahr, abhängig von Einkommen, Vermögen und Anzahl Personen. Kinder und junge Erwachsene bis 25 Jahre in Erstausbildung sind ebenfalls anspruchsberechtigt."
3. Was kostet mich dieser Service? — "Für Sie entstehen keine direkten Kosten. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners Sàrl) und werden nicht direkt von Ihnen vergütet."
4. Was ist der Unterschied zum direkten Kantonsantrag? — "Sie können den Antrag direkt beim Kantonsamt stellen. Wir helfen Ihnen vorab, Ihren Anspruch zu prüfen und das Dossier korrekt zusammenzustellen — ähnlich wie ein Treuhänder beim Steuerformular."
5. Wie lange dauert die Bearbeitung? — "Das Erstgespräch dauert ca. 20 Minuten. Der Entscheid durch das Kantonsamt erfolgt in der Regel innerhalb von 2–4 Wochen."

**Final CTA (bg `#0087A0`):**
- H2: "Jetzt Anspruch prüfen lassen"
- Sub: "Vereinbaren Sie ein Erstgespräch. Wir begleiten Sie von der Prüfung bis zur Einreichung."
- Buttons: "Antrag prüfen lassen →" (white), "+41 76 779 0449" (outline, phone icon)

**Footer:**
- Col 1: logo (white square variant) + ".ch" in `#6EC5D4`, "Hilfe bei der Prämienverbilligung in der Schweiz", divider, "prämienhilfe.ch ist eine private Beratungsplattform, unabhängig von den kantonalen Behörden der Schweiz.", "Betrieben von:\nEVO Partners Sàrl\nFINMA-registrierter Versicherungsbroker\nZürich, Schweiz"
- Col 2 "MEHR INFORMATIONEN": Prämienverbilligung, Kantone, So funktioniert es, FAQ
- Col 3 "KONTAKT": Antrag stellen, Rückruf anfordern, Kontaktformular, +41 76 779 0449, msegui@evo-partners.ch
- Col 4 "RECHTLICHES": Impressum, Datenschutzbestimmungen, Nutzungsbedingungen, Rechtliche Hinweise
- Legal bar (`#14141F`): "© 2026 prämienhilfe.ch — Ein Service von EVO Partners Sàrl, Zürich. Alle Rechte vorbehalten. Diese Plattform ist kein offizielles Kantonsorgan."

## Funnel interaction logic (from the prototype's component script)

- Row style toggles between selected (`bg #E8F4F8`, `2px solid #0087A0`, padding `14px 17px`) and unselected (`bg #FFFFFF`, `1px solid #D6DFE2`, padding `15px 18px`).
- Step dots: filled circle (`#0087A0` bg + border) when `i <= currentStep`, else white with `#C3D5DA` border.
- FAQ accordion: `+` icon rotates 45° (becomes ×) when open; body height 0 → auto, padding `0 2px 0` → `0 2px 22px`.
- Kantone nav dropdown: opens on mouse-enter of the wrapping `div`, closes on mouse-leave; caret rotates 180° when open. Basel-Stadt/Basel-Landschaft are enabled links; Zürich/Bern are greyed out, non-interactive, labelled "— in Vorbereitung".
- After step 4 submit, a 5th "done" state shows: "Vielen Dank — wir melden uns." (H, green `#2E6B29`) + "Wir prüfen Ihre Angaben und rufen Sie innerhalb von 24 Stunden für das Erstgespräch zurück. Bei Fragen erreichen Sie uns unter +41 76 779 0449." + "Neue Prüfung starten" reset button.
  - Note: instructions.md specifies slightly different done copy ("✓ Gute Nachricht...", "Vielen Dank! Wir melden uns innerhalb von 24 Stunden bei Ihnen."). **Decision: follow instructions.md's copy** since it is the authoritative build spec; the prototype's done-state copy is a minor variant. Implementation plan uses the instructions.md wording so the form matches the documented spec exactly, but the visual style (colors, layout, reset button) follows the prototype.

## Known gap: Basel-Landschaft data

instructions.md asks for "Different income thresholds (research and include)" for Basel-Landschaft. I do not have verified, current-year SVA Basel-Landschaft income thresholds. The plan will use clearly-flagged placeholder figures for the BL facts table and FAQ, and the final deliverable summary will call out that these **must be verified against the official SVA Basel-Landschaft source before launch**. This is a content-accuracy flag, not a code TODO.

## Scope confirmation

Single cohesive project (one marketing site, one funnel, one API route) — not decomposed into sub-project specs. Proceeding straight to the implementation plan per user's explicit choice ("Foncer directement").
