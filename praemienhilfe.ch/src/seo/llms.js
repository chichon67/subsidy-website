import { getCanton } from '../data/cantons.js';
import { deutschschweizCantons } from '../data/deutschschweiz.js';
import { getNational } from '../data/national.js';
import { listIndexableEntries } from '../i18n/pageUrls.js';

const SITE = 'https://praemien-hilfe.ch';

function link(path, label) {
  return `- [${label}](${SITE}${path})`;
}

function faqBlock(faqs) {
  return faqs.map((faq) => `### ${faq.q}\n\n${faq.a}`).join('\n\n');
}

function stepsBlock(steps) {
  return steps.map((step) => `${step.n}. **${step.title}.** ${step.text}`).join('\n');
}

export function buildLlmsTxt() {
  const cantons = deutschschweizCantons
    .map((canton) => link(`/de/${canton.slug}`, canton.name))
    .join('\n');

  return `# praemien-hilfe.ch

> praemien-hilfe.ch ist ein Service von EVO Partners GmbH, einem unabhängigen, FINMA-registrierten Versicherungsbroker mit Sitz in Zürich, Schweiz. Die Seite hilft Personen mit Wohnsitz in der Schweiz, ihren Anspruch auf Prämienverbilligung (individuelle Prämienverbilligung, IPV) zu prüfen und den Antrag einzureichen. Die Hilfe bei der Prämienverbilligung ist vollständig kostenlos und unverbindlich. praemien-hilfe.ch ist eine private Beratungsplattform und kein offizielles Kantonsorgan.

Betrieben von EVO Partners GmbH, c/o ExpertFid & Audit AG, Strehlgasse 2, 8001 Zürich. E-Mail: office@evo-partners.ch. FINMA-Registernummer: F01552602. Website des Betreibers: https://evo-partners.ch

Die Seiten gibt es auf Deutsch, Englisch und Spanisch. Eine französische Fassung ist nicht veröffentlicht.

## Seiten

${link('/de/', 'Startseite')}: Prämienverbilligung in der ganzen Schweiz beantragen. EVO Partners GmbH hilft bei der Einreichung des Antrags, unabhängig vom Kanton.
${link('/de/so-funktioniert-es', 'So funktioniert es')}: Von der Prüfung bis zur Einreichung. Anspruch prüfen, Dossier zusammenstellen, Antrag einreichen.
${link('/de/faq', 'Häufige Fragen')}: Antworten zu Anspruch, Kosten des Services und Ablauf.
${link('/de/kontakt', 'Kontakt')}: Kontakt für eine kostenlose Prüfung des Anspruchs auf Prämienverbilligung.
${link('/de/antrag', 'Antrag')}: Formular, um die persönliche Situation anzugeben und eine Prüfung anzufragen.
${link('/de/basel-stadt', 'Basel-Stadt')}: Prämienverbilligung im Kanton Basel-Stadt. Zuständige Stelle laut Seite: Amt für Sozialbeiträge (ASB) Basel-Stadt.
${link('/de/basel-landschaft', 'Basel-Landschaft')}: Prämienverbilligung im Kanton Basel-Landschaft. Zuständige Stelle laut Seite: SVA Basel-Landschaft.
${link('/de/impressum', 'Impressum')}: Angaben zum Betreiber EVO Partners GmbH.
${link('/de/datenschutz', 'Datenschutzbestimmungen')}: Welche Daten erhoben werden, wie sie verwendet und wie sie geschützt werden.

## Kantone

Für die Deutschschweiz gibt es eine Seite pro Kanton. Basel-Stadt und Basel-Landschaft haben eigene Seiten. Die übrigen Kantonsseiten beschreiben die Prämienverbilligung mit schweizweiten Angaben. Kantonsspezifische Einkommensgrenzen stehen dort nicht.

${cantons}

## Weitere Sprachen

${link('/en/', 'English')}: dieselben Seiten auf Englisch.
${link('/es/', 'Español')}: dieselben Seiten auf Spanisch.

## Volltext

${link('/llms-full.txt', 'llms-full.txt')}: ausführliche deutsche Beschreibung der Seiten, übernommen aus den sichtbaren Texten.
`;
}

export function buildLlmsFullTxt() {
  const national = getNational('de');
  const baselStadt = getCanton('basel-stadt', 'de');
  const baselLandschaft = getCanton('basel-landschaft', 'de');
  const was = national.wasIst;
  const who = national.werWirSind;
  const otherCantons = deutschschweizCantons
    .filter((canton) => !canton.active)
    .map((canton) => link(`/de/${canton.slug}`, canton.name))
    .join('\n');
  const translated = listIndexableEntries()
    .filter((entry) =>
      ['home', 'basel-stadt', 'basel-landschaft', 'faq', 'so-funktioniert-es', 'kontakt', 'antrag', 'impressum', 'datenschutz'].includes(
        entry.key
      )
    )
    .map((entry) => `- ${entry.key}: ${entry.de} · ${entry.en} · ${entry.es}`)
    .join('\n');

  return `# praemien-hilfe.ch

> praemien-hilfe.ch ist ein Service von EVO Partners GmbH, einem unabhängigen, FINMA-registrierten Versicherungsbroker mit Sitz in Zürich, Schweiz. Die Seite hilft Personen mit Wohnsitz in der Schweiz, ihren Anspruch auf Prämienverbilligung (individuelle Prämienverbilligung, IPV) zu prüfen und den Antrag einzureichen. Die Hilfe bei der Prämienverbilligung ist vollständig kostenlos und unverbindlich. praemien-hilfe.ch ist eine private Beratungsplattform und kein offizielles Kantonsorgan.

Dieser Text fasst die deutschen Seiten zusammen. Er übernimmt Formulierungen, die auf der Website stehen, und ergänzt keine Zahlen. Eine französische Fassung der Website ist nicht veröffentlicht.

## Betreiber

Angaben gemäss Impressum:

- Firmenname: EVO Partners GmbH
- Rechtsform: Gesellschaft mit beschränkter Haftung (GmbH)
- Sitz: Zürich, Schweiz
- Adresse: c/o ExpertFid & Audit AG, Strehlgasse 2, 8001 Zürich
- E-Mail: office@evo-partners.ch
- Website: https://evo-partners.ch
- Geschäftsführer: Marc-Antoine Segui
- FINMA-Registernummer: F01552602
- FINMA-Register: https://www.finma.ch/de/

EVO Partners GmbH ist als unabhängiger Versicherungsvermittler bei der FINMA (Eidgenössische Finanzmarktaufsicht) registriert.

Im Footer steht: «Betrieben von EVO Partners GmbH, FINMA-registrierter Versicherungsbroker, Zürich, Schweiz.» Der Copyright-Hinweis lautet: «Ein Service von EVO Partners GmbH, Zürich.» Die Plattform ist kein offizielles Kantonsorgan.

## Startseite

${SITE}/de/

Überschrift: ${national.heroCopy.title}

${national.heroCopy.paragraph}

${was.introBefore}${was.introLinkText}${was.introAfter}

${was.paragraphs.join('\n\n')}

Der Anspruch hängt laut Seite ab von:

${was.bullets.map((item) => `- ${item}`).join('\n')}

${was.boxTitle} ${was.boxText} ${was.boxStat} ${was.boxStatLabel}

### So funktioniert unsere Hilfe

${stepsBlock(national.howItWorksSteps)}

### Warum viele Berechtigte keinen Antrag stellen

${national.whySection.intro}

${national.whySection.reasons.map((reason) => `- **${reason.title}.** ${reason.text}`).join('\n')}

${national.whySection.closing}

### Wer steckt hinter praemien-hilfe.ch?

${who.paragraphs.join('\n\n')}

${who.bullets.map((item) => `- ${item}`).join('\n')}

${who.closing}

${who.trustItems.map((item) => `- ${item}`).join('\n')}

${who.rating}

### Häufige Fragen auf der Startseite

${faqBlock(national.nationalFaqs)}

## So funktioniert es

${SITE}/de/so-funktioniert-es

Überschrift: So funktioniert die Beantragung

Von der Prüfung bis zur Einreichung — wir begleiten Sie durch den gesamten Prozess der Prämienverbilligung.

Die Seite zeigt diese drei Schritte:

${stepsBlock(baselStadt.steps)}

## Häufige Fragen

${SITE}/de/faq

Die Seite zeigt die Fragen der Seite Basel-Stadt.

${faqBlock(baselStadt.faqs)}

## Kontakt

${SITE}/de/kontakt

Kontaktieren Sie uns für eine kostenlose Prüfung Ihres Anspruchs auf Prämienverbilligung.

E-Mail laut Impressum: office@evo-partners.ch

## Antrag

${SITE}/de/antrag

Stellen Sie Ihren Antrag auf Prämienverbilligung im Kanton Basel-Stadt — schnell und unverbindlich.

Das Formular auf der Seite sammelt Kanton, Situation und Kontaktdaten. Der Hinweis im Formular lautet: Dies ist keine offizielle kantonale Einreichung. Wir prüfen Ihre Angaben und unterstützen Sie bei den nächsten Schritten. Wir melden uns innerhalb von 24 Stunden – kostenlos und unverbindlich.

## Basel-Stadt

${SITE}/de/basel-stadt

${baselStadt.infoHeading}

${baselStadt.infoParagraphs.join('\n\n')}

Zuständige Stelle: ${baselStadt.officeNameFull}

${stepsBlock(baselStadt.steps)}

${faqBlock(baselStadt.faqs)}

## Basel-Landschaft

${SITE}/de/basel-landschaft

${baselLandschaft.infoHeading}

${baselLandschaft.infoParagraphs.join('\n\n')}

Zuständige Stelle laut Seite: ${baselLandschaft.officeNameFull}

${stepsBlock(baselLandschaft.steps)}

${faqBlock(baselLandschaft.faqs)}

## Weitere Kantone der Deutschschweiz

Diese Seiten beschreiben die Prämienverbilligung mit denselben schweizweiten Angaben wie die Startseite. Sie nennen keine kantonsspezifischen Einkommensgrenzen. Die genauen Grenzen werden laut Seite im kostenlosen Erstgespräch geprüft. Zuständige Stelle laut diesen Seiten: kantonale Ausgleichskasse oder Sozialversicherungsamt. Die Antragsfrist ist kantonal unterschiedlich.

${otherCantons}

Die häufigen Fragen auf diesen Seiten sind dieselben wie auf der Startseite.

## Impressum

${SITE}/de/impressum

praemien-hilfe.ch ist eine private, unabhängige Beratungsplattform und kein offizielles Organ der Kantone oder des Bundes. Der Antrag auf Prämienverbilligung kann auch eigenständig beim zuständigen Kantonsamt gestellt werden.

Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir keine Gewähr.

## Datenschutz

${SITE}/de/datenschutz

Datenschutzbestimmungen von praemien-hilfe.ch: welche Daten wir erheben, wie wir sie verwenden und wie wir sie schützen. Verantwortliche Stelle: EVO Partners GmbH. Der vollständige Text steht auf der Seite.

## Sprachen

Deutsch ist die Hauptsprache. Dieselben Seiten gibt es auch auf Englisch und Spanisch. Französisch ist nicht veröffentlicht.

${translated}
`;
}
