// src/data/genericCanton.js
// Content builder for cantons that don't yet have canton-specific verified
// figures (income thresholds, deadlines, office names). Reuses the same
// Swiss-wide facts already shown on the national homepage instead of
// inventing per-canton numbers — see basel-landschaft's "(unverifiziert)"
// entries in cantons.js for the alternative once real figures are sourced
// for a given canton.
import { getNational } from './national.js';
import { DEFAULT_LOCALE } from '../i18n/locales.js';

const templates = {
  de: {
    heroProof: (name) => `Kostenlose Prüfung Ihres Anspruchs auf Prämienverbilligung im Kanton ${name}`,
    infoHeading: (name) => `Prämienverbilligung im Kanton ${name}`,
    infoParagraphs: (name) => [
      `Die individuelle Prämienverbilligung (IPV) ist eine staatliche Unterstützungsleistung für Personen und Haushalte in bescheidenen wirtschaftlichen Verhältnissen — auch im Kanton ${name}. Bund und Kanton beteiligen sich gemeinsam an den Kosten der obligatorischen Krankenversicherung (KVG).`,
      `Auch im Kanton ${name} stellen viele Berechtigte nie einen Antrag — aus Unwissenheit, wegen administrativer Hürden oder weil sie nicht wissen, ob sie berechtigt sind. Es lohnt sich in jedem Fall, den Anspruch prüfen zu lassen.`,
      'Anspruch haben Personen, deren Haushaltseinkommen und -vermögen unterhalb der kantonal festgelegten Grenze liegt. Die genauen Einkommensgrenzen variieren je nach Kanton und Haushaltsgrösse — wir prüfen sie kostenlos mit Ihnen im Erstgespräch.',
    ],
    facts: (name) => [
      { k: 'Kanton', v: name },
      { k: 'Zuständige Stelle', v: 'Kantonale Ausgleichskasse / Sozialversicherungsamt' },
      { k: 'Antragsfrist', v: 'Kantonal unterschiedlich — wir informieren Sie im Gespräch' },
    ],
    closingParagraph:
      'Haben sich Ihre persönlichen oder finanziellen Verhältnisse verändert? Auch bestehende Bezüger müssen Änderungen melden. Wir begleiten Sie durch den gesamten Prozess.',
    steps: (name) => [
      {
        n: '1',
        title: 'Anspruch prüfen',
        text: 'In einem kurzen, kostenlosen Gespräch von ca. 20 Minuten prüfen wir gemeinsam, ob und in welcher Höhe Sie Anspruch auf Prämienverbilligung haben.',
      },
      {
        n: '2',
        title: 'Dossier zusammenstellen',
        text: 'Wir helfen Ihnen, alle notwendigen Unterlagen korrekt zusammenzustellen: Steuererklärung, Versicherungspolice, Lohnabrechnungen.',
      },
      {
        n: '3',
        title: 'Antrag einreichen',
        text: `Den Antrag reichen wir gemeinsam mit Ihnen bei der zuständigen Stelle im Kanton ${name} ein.`,
      },
    ],
  },

  en: {
    heroProof: (name) => `Free check of your eligibility for a premium reduction in the canton of ${name}`,
    infoHeading: (name) => `Premium reduction in the canton of ${name}`,
    infoParagraphs: (name) => [
      `The individual health insurance premium reduction (IPV) is a state support benefit for people and households with modest financial means — including in the canton of ${name}. The Confederation and the canton jointly share the cost of mandatory health insurance (KVG).`,
      `In the canton of ${name}, too, many eligible people never apply — out of lack of awareness, because of administrative hurdles, or because they don't know whether they qualify. It's always worth having your eligibility checked.`,
      "Eligible are people whose household income and assets fall below the threshold set by their canton. The exact income thresholds vary by canton and household size — we'll check them with you free of charge during the initial consultation.",
    ],
    facts: (name) => [
      { k: 'Canton', v: name },
      { k: 'Responsible office', v: 'Cantonal compensation office / social insurance office' },
      { k: 'Application deadline', v: "Varies by canton — we'll let you know during the consultation" },
    ],
    closingParagraph:
      "Have your personal or financial circumstances changed? Even existing recipients must report changes. We'll guide you through the entire process.",
    steps: (name) => [
      {
        n: '1',
        title: 'Check eligibility',
        text: "In a brief, free consultation of about 20 minutes, we'll check together whether — and to what extent — you're entitled to a premium reduction.",
      },
      {
        n: '2',
        title: 'Compiling your file',
        text: 'We help you correctly compile all the necessary documents: tax return, insurance policy, payslips.',
      },
      {
        n: '3',
        title: 'Submitting your application',
        text: `We submit the application together with you to the responsible office in the canton of ${name}.`,
      },
    ],
  },

  es: {
    heroProof: (name) => `Comprobación gratuita de su derecho a la reducción de primas en el cantón de ${name}`,
    infoHeading: (name) => `Reducción de primas en el cantón de ${name}`,
    infoParagraphs: (name) => [
      `La reducción individual de primas del seguro médico (IPV) es una prestación estatal de apoyo para personas y hogares con recursos económicos modestos, también en el cantón de ${name}. La Confederación y el cantón se reparten conjuntamente los costos del seguro médico obligatorio (KVG).`,
      `También en el cantón de ${name}, muchas personas con derecho nunca presentan una solicitud, ya sea por desconocimiento, por las trabas administrativas o porque no saben si cumplen los requisitos. En cualquier caso, merece la pena comprobar si tiene derecho.`,
      'Tienen derecho las personas cuyos ingresos y patrimonio del hogar se sitúan por debajo del límite establecido por el cantón. Los límites de renta exactos varían según el cantón y el tamaño del hogar — los comprobamos con usted de forma gratuita durante la primera consulta.',
    ],
    facts: (name) => [
      { k: 'Cantón', v: name },
      { k: 'Oficina competente', v: 'Caja de compensación cantonal / oficina de seguros sociales' },
      { k: 'Plazo de solicitud', v: 'Varía según el cantón — se lo indicamos durante la consulta' },
    ],
    closingParagraph:
      '¿Han cambiado sus circunstancias personales o económicas? Incluso quienes ya reciben la reducción deben comunicar los cambios. Le acompañamos durante todo el proceso.',
    steps: (name) => [
      {
        n: '1',
        title: 'Comprobar el derecho',
        text: 'En una breve consulta gratuita de unos 20 minutos, comprobamos juntos si tiene derecho a la reducción de primas y en qué cuantía.',
      },
      {
        n: '2',
        title: 'Preparación del expediente',
        text: 'Le ayudamos a reunir correctamente toda la documentación necesaria: declaración de impuestos, póliza del seguro, nóminas.',
      },
      {
        n: '3',
        title: 'Presentación de la solicitud',
        text: `Presentamos la solicitud junto con usted ante la oficina competente del cantón de ${name}.`,
      },
    ],
  },
};

export function buildGenericCantonData(name, lang) {
  const t = templates[lang] || templates[DEFAULT_LOCALE];
  const national = getNational(lang);
  return {
    name,
    heroProof: t.heroProof(name),
    stats: national.nationalStats,
    infoHeading: t.infoHeading(name),
    infoParagraphs: t.infoParagraphs(name),
    facts: t.facts(name),
    closingParagraph: t.closingParagraph,
    steps: t.steps(name),
    faqs: national.nationalFaqs,
  };
}
