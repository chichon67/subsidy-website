// src/data/genericCanton.js
// Content builder for cantons that don't yet have canton-specific verified
// figures (income thresholds, deadlines, office names). Reuses the same
// Swiss-wide facts already shown on the national homepage instead of
// inventing per-canton numbers — see basel-landschaft's "(unverifiziert)"
// entries in cantons.js for the alternative once real figures are sourced
// for a given canton.
import { national } from './national.js';

const { nationalStats, nationalFaqs } = national.de;

export function buildGenericCantonData(name) {
  return {
    name,
    heroProof: `Kostenlose Prüfung Ihres Anspruchs auf Prämienverbilligung im Kanton ${name}`,
    stats: nationalStats,
    infoHeading: `Prämienverbilligung im Kanton ${name}`,
    infoParagraphs: [
      `Die individuelle Prämienverbilligung (IPV) ist eine staatliche Unterstützungsleistung für Personen und Haushalte in bescheidenen wirtschaftlichen Verhältnissen — auch im Kanton ${name}. Bund und Kanton beteiligen sich gemeinsam an den Kosten der obligatorischen Krankenversicherung (KVG).`,
      `Auch im Kanton ${name} stellen viele Berechtigte nie einen Antrag — aus Unwissenheit, wegen administrativer Hürden oder weil sie nicht wissen, ob sie berechtigt sind. Es lohnt sich in jedem Fall, den Anspruch prüfen zu lassen.`,
      'Anspruch haben Personen, deren Haushaltseinkommen und -vermögen unterhalb der kantonal festgelegten Grenze liegt. Die genauen Einkommensgrenzen variieren je nach Kanton und Haushaltsgrösse — wir prüfen sie kostenlos mit Ihnen im Erstgespräch.',
    ],
    facts: [
      { k: 'Kanton', v: name },
      { k: 'Zuständige Stelle', v: 'Kantonale Ausgleichskasse / Sozialversicherungsamt' },
      { k: 'Antragsfrist', v: 'Kantonal unterschiedlich — wir informieren Sie im Gespräch' },
    ],
    closingParagraph:
      'Haben sich Ihre persönlichen oder finanziellen Verhältnisse verändert? Auch bestehende Bezüger müssen Änderungen melden. Wir begleiten Sie durch den gesamten Prozess.',
    steps: [
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
    faqs: nationalFaqs,
  };
}
