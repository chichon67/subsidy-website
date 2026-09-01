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
    officeNameFull: 'Amt für Sozialbeiträge Basel-Stadt',
    overviewCard: {
      bezueger: "ca. 30'000 Bezüger",
      frist: 'Frist: September – 31. Dezember 2026',
      zustaendig: 'Zuständig: ASB Basel-Stadt',
    },
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
        q: 'Wer sind wir?',
        a: "prämienhilfe.ch ist ein Service von EVO Partners GmbH, einem FINMA-registrierten unabhängigen Versicherungsbroker mit Sitz in der Schweiz. Wir sind seit 2020 tätig und haben bereits über 1'000 Dossiers für Prämienverbilligung bearbeitet. Neben der Prämienverbilligung beraten wir unsere Klienten auch zu ihrer gesamten Krankenversicherungssituation, um die beste Abdeckung zum besten Preis zu finden.",
      },
      {
        q: 'Sind Sie ein offizielles Kantonsamt?',
        a: 'Nein. prämienhilfe.ch ist eine private, unabhängige Beratungsplattform. Wir sind kein staatliches Organ. Die Prämienverbilligung kann auch direkt beim Amt für Sozialbeiträge (ASB) Basel-Stadt beantragt werden. Unser Service erleichtert Ihnen den Prozess und prüft gleichzeitig, ob Ihre Versicherungssituation insgesamt optimiert werden kann.',
      },
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
        a: 'Für Sie entstehen keine direkten Kosten. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners GmbH) und werden nicht direkt von Ihnen vergütet.',
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
    overviewCard: {
      bezueger: "ca. 20'000 Bezüger (unverifiziert)",
      frist: 'Frist: September – 31. Dezember 2026 (unverifiziert)',
      zustaendig: 'Zuständig: SVA Basel-Landschaft',
    },
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
        a: 'Für Sie entstehen keine direkten Kosten. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners GmbH) und werden nicht direkt von Ihnen vergütet.',
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
