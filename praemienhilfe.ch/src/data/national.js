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
