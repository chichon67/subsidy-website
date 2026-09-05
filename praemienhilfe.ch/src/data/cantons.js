// src/data/cantons.js
import { DEFAULT_LOCALE } from '../i18n/locales.js';

const PHONE = '+41 76 779 0449';
const EMAIL = 'office@evo-partners.ch';

const closingParagraphs = {
  de: "Haben sich Ihre persönlichen oder finanziellen Verhältnisse verändert? Auch bestehende Bezüger müssen Änderungen melden. Wir begleiten Sie durch den gesamten Prozess.",
  en: 'Have your personal or financial circumstances changed? Even existing recipients must report changes. We\'ll guide you through the entire process.',
  es: '¿Han cambiado sus circunstancias personales o económicas? Incluso quienes ya reciben la reducción deben comunicar los cambios. Le acompañamos durante todo el proceso.',
};

const reasonsByLang = {
  de: [
    { title: 'Zu kompliziert', text: 'Das Antragsverfahren wirkt aufwendig' },
    { title: 'Unsicher', text: 'Viele wissen nicht ob sie berechtigt sind' },
    { title: 'Keine Zeit', text: 'Fristen werden oft verpasst' },
  ],
  en: [
    { title: 'Too complicated', text: 'The application process can look daunting' },
    { title: 'Unsure', text: 'Many don\'t know whether they qualify' },
    { title: 'No time', text: 'Deadlines are often missed' },
  ],
  es: [
    { title: 'Demasiado complicado', text: 'El trámite de solicitud puede parecer laborioso' },
    { title: 'Dudas', text: 'Muchas personas no saben si tienen derecho' },
    { title: 'Falta de tiempo', text: 'Los plazos a menudo se pasan por alto' },
  ],
};

const cantonsData = {
  'basel-stadt': {
    de: {
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
      closingParagraph: closingParagraphs.de,
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
      reasons: reasonsByLang.de,
      faqs: [
        {
          q: 'Wer sind wir?',
          a: "praemien-hilfe.ch ist ein Service von EVO Partners GmbH, einem FINMA-registrierten unabhängigen Versicherungsbroker mit Sitz in der Schweiz. Wir sind seit 2020 tätig und haben bereits über 1'000 Dossiers für Prämienverbilligung bearbeitet. Neben der Prämienverbilligung beraten wir unsere Klienten auch zu ihrer gesamten Krankenversicherungssituation, um die beste Abdeckung zum besten Preis zu finden.",
        },
        {
          q: 'Sind Sie ein offizielles Kantonsamt?',
          a: 'Nein. praemien-hilfe.ch ist eine private, unabhängige Beratungsplattform. Wir sind kein staatliches Organ. Die Prämienverbilligung kann auch direkt beim Amt für Sozialbeiträge (ASB) Basel-Stadt beantragt werden. Unser Service erleichtert Ihnen den Prozess und prüft gleichzeitig, ob Ihre Versicherungssituation insgesamt optimiert werden kann.',
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

    en: {
      slug: 'basel-stadt',
      name: 'Basel-Stadt',
      shortCode: 'BS',
      phone: PHONE,
      email: EMAIL,
      heroProof: 'Around 30,000 people already receive a premium reduction in BS',
      stats: [
        { value: "30'000+", label: 'Recipients in BS' },
        { value: "CHF 500–3'000", label: 'Savings per year' },
        { value: '20 minutes', label: 'Consultation' },
        { value: 'Since 2020', label: 'Experience' },
      ],
      infoHeading: 'Premium reduction in the canton of Basel-Stadt',
      infoParagraphs: [
        'The premium reduction (also known as IPV — individual premium reduction) in the canton of Basel-Stadt is administered by the Office for Social Contributions (ASB). Around 30,000 residents of the canton of Basel-Stadt already receive this financial support toward their health insurance premiums.',
        'Around 30,000 people in the canton of Basel-Stadt already receive a premium reduction. The process is short and simple — it\'s worth checking whether you qualify. A single application per household is enough.',
        'Eligible are people whose household income and assets fall below the benefit threshold and who have lived in the canton since January 1 of the current year.',
        'Income thresholds vary depending on household size and personal circumstances. Many people receive a premium reduction even when they don\'t expect to. It\'s always worth checking your eligibility.',
      ],
      facts: [
        { k: 'Recipients in the canton', v: "approx. 30'000" },
        { k: 'Responsible office', v: 'ASB Basel-Stadt' },
        { k: 'Application deadline 2027', v: 'September–December 31, 2026' },
      ],
      officeNameFull: 'Office for Social Contributions Basel-Stadt',
      overviewCard: {
        bezueger: 'approx. 30,000 recipients',
        frist: 'Deadline: September – December 31, 2026',
        zustaendig: 'Responsible: ASB Basel-Stadt',
      },
      closingParagraph: closingParagraphs.en,
      steps: [
        {
          n: '1',
          title: 'Check eligibility',
          text: 'In a brief consultation of about 20 minutes, we\'ll check together whether — and to what extent — you\'re entitled to a premium reduction.',
        },
        {
          n: '2',
          title: 'Compiling your file',
          text: 'We help you correctly compile all the necessary documents: tax return, insurance policy, payslips.',
        },
        {
          n: '3',
          title: 'Submitting your application',
          text: 'We submit the application together with you to the Office for Social Contributions Basel-Stadt.',
        },
      ],
      reasons: reasonsByLang.en,
      faqs: [
        {
          q: 'Who are we?',
          a: 'praemien-hilfe.ch is a service of EVO Partners GmbH, a FINMA-registered independent insurance broker based in Switzerland. We\'ve been active since 2020 and have already handled over 1,000 premium reduction cases. Besides the premium reduction, we also advise our clients on their overall health insurance situation, to find the best coverage at the best price.',
        },
        {
          q: 'Are you an official cantonal office?',
          a: 'No. praemien-hilfe.ch is a private, independent advisory platform. We are not a government body. The premium reduction can also be applied for directly with the Office for Social Contributions (ASB) Basel-Stadt. Our service makes this process easier for you and, at the same time, checks whether your overall insurance coverage can be optimized.',
        },
        {
          q: 'Who is entitled to a premium reduction?',
          a: "People with modest financial means residing in Switzerland are eligible. In the canton of Basel-Stadt: single people up to CHF 49,375, 4-person households up to CHF 97,000 in annual income.",
        },
        {
          q: 'How much can I receive?',
          a: 'Between CHF 500 and CHF 3,000 per year, depending on income, assets and household size. Children and young adults up to age 25 in initial training also qualify.',
        },
        {
          q: 'What does this service cost?',
          a: 'You incur no direct costs. We are a FINMA-registered insurance broker (EVO Partners GmbH) and are not compensated directly by you.',
        },
        {
          q: 'What\'s the difference compared to applying directly with the canton?',
          a: 'You can apply directly with the cantonal office. We help you check your eligibility beforehand and correctly compile the file — similar to a fiduciary helping with a tax return.',
        },
        {
          q: 'How long does processing take?',
          a: 'The initial consultation takes about 20 minutes. The decision from the cantonal office is usually issued within 2–4 weeks.',
        },
      ],
    },

    es: {
      slug: 'basel-stadt',
      name: 'Basel-Stadt',
      shortCode: 'BS',
      phone: PHONE,
      email: EMAIL,
      heroProof: 'Cerca de 30.000 personas ya reciben la reducción de primas en BS',
      stats: [
        { value: "30'000+", label: 'Beneficiarios en BS' },
        { value: "CHF 500–3'000", label: 'Ahorro al año' },
        { value: '20 minutos', label: 'Consulta' },
        { value: 'Desde 2020', label: 'Experiencia' },
      ],
      infoHeading: 'Reducción de primas en el cantón de Basel-Stadt',
      infoParagraphs: [
        'La reducción de primas (también llamada IPV, reducción individual de primas) en el cantón de Basel-Stadt está gestionada por la Oficina de Prestaciones Sociales (ASB). Cerca de 30.000 residentes del cantón de Basel-Stadt ya reciben esta ayuda económica para reducir su prima del seguro médico.',
        'Cerca de 30.000 personas en el cantón de Basel-Stadt ya reciben la reducción de primas. El trámite es breve y sencillo: merece la pena comprobar si tiene derecho. Basta con una solicitud por hogar.',
        'Tienen derecho las personas cuyos ingresos y patrimonio del hogar se sitúan por debajo del límite de la prestación y que residen en el cantón desde el 1 de enero del año en curso.',
        'Los límites de renta varían según el tamaño del hogar y la situación personal. Muchas personas reciben la reducción de primas aunque no lo esperen. En cualquier caso, merece la pena comprobar si tiene derecho.',
      ],
      facts: [
        { k: 'Beneficiarios en el cantón', v: "aprox. 30'000" },
        { k: 'Oficina competente', v: 'ASB Basel-Stadt' },
        { k: 'Plazo de solicitud 2027', v: 'Septiembre–31 de diciembre de 2026' },
      ],
      officeNameFull: 'Oficina de Prestaciones Sociales de Basel-Stadt',
      overviewCard: {
        bezueger: 'aprox. 30.000 beneficiarios',
        frist: 'Plazo: septiembre – 31 de diciembre de 2026',
        zustaendig: 'Competente: ASB Basel-Stadt',
      },
      closingParagraph: closingParagraphs.es,
      steps: [
        {
          n: '1',
          title: 'Comprobar el derecho',
          text: 'En una breve consulta de unos 20 minutos, comprobamos juntos si tiene derecho a la reducción de primas y en qué cuantía.',
        },
        {
          n: '2',
          title: 'Preparación del expediente',
          text: 'Le ayudamos a reunir correctamente toda la documentación necesaria: declaración de impuestos, póliza del seguro, nóminas.',
        },
        {
          n: '3',
          title: 'Presentación de la solicitud',
          text: 'Presentamos la solicitud junto con usted ante la Oficina de Prestaciones Sociales de Basel-Stadt.',
        },
      ],
      reasons: reasonsByLang.es,
      faqs: [
        {
          q: '¿Quiénes somos?',
          a: 'praemien-hilfe.ch es un servicio de EVO Partners GmbH, un corredor de seguros independiente registrado en FINMA y con sede en Suiza. Operamos desde 2020 y ya hemos tramitado más de 1.000 expedientes de reducción de primas. Además de la reducción de primas, asesoramos a nuestros clientes sobre toda su situación de seguro médico, para encontrar la mejor cobertura al mejor precio.',
        },
        {
          q: '¿Son ustedes una oficina cantonal oficial?',
          a: 'No. praemien-hilfe.ch es una plataforma de asesoría privada e independiente. No somos un organismo estatal. La reducción de primas también puede solicitarse directamente ante la Oficina de Prestaciones Sociales (ASB) de Basel-Stadt. Nuestro servicio le facilita este proceso y, al mismo tiempo, comprueba si su cobertura de seguro en general puede optimizarse.',
        },
        {
          q: '¿Quién tiene derecho a la reducción de primas?',
          a: "Tienen derecho las personas con recursos económicos modestos residentes en Suiza. En el cantón de Basel-Stadt: personas solas hasta CHF 49.375, hogares de 4 personas hasta CHF 97.000 de renta anual.",
        },
        {
          q: '¿Cuánto puedo recibir?',
          a: 'Entre CHF 500 y CHF 3.000 al año, según los ingresos, el patrimonio y el número de personas. Los niños y jóvenes de hasta 25 años en formación inicial también tienen derecho.',
        },
        {
          q: '¿Cuánto cuesta este servicio?',
          a: 'Usted no asume ningún coste directo. Somos un corredor de seguros registrado en FINMA (EVO Partners GmbH) y no recibimos ninguna compensación directa por su parte.',
        },
        {
          q: '¿Cuál es la diferencia con solicitarlo directamente al cantón?',
          a: 'Puede presentar la solicitud directamente ante la oficina cantonal. Nosotros le ayudamos previamente a comprobar su derecho y a preparar correctamente el expediente, de forma similar a un gestor con la declaración de impuestos.',
        },
        {
          q: '¿Cuánto dura la tramitación?',
          a: 'La primera consulta dura unos 20 minutos. La resolución de la oficina cantonal suele llegar en un plazo de 2 a 4 semanas.',
        },
      ],
    },
  },

  'basel-landschaft': {
    de: {
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
      closingParagraph: closingParagraphs.de,
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
      reasons: reasonsByLang.de,
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

    en: {
      slug: 'basel-landschaft',
      name: 'Basel-Landschaft',
      shortCode: 'BL',
      phone: PHONE,
      email: EMAIL,
      heroProof: 'Around 20,000 people already receive a premium reduction in BL',
      stats: [
        { value: "20'000+", label: 'Recipients in BL' },
        { value: "CHF 500–3'000", label: 'Savings per year' },
        { value: '20 minutes', label: 'Consultation' },
        { value: 'Since 2020', label: 'Experience' },
      ],
      infoHeading: 'Premium reduction in the canton of Basel-Landschaft',
      infoParagraphs: [
        'In the canton of Basel-Landschaft, too, thousands of people receive a premium reduction. The process is short and simple — it\'s worth checking whether you qualify. A single application per household is enough.',
        'Eligible are people whose household income and assets fall below the benefit threshold and who have lived in the canton since January 1 of the current year.',
      ],
      // NOTE: income thresholds, beneficiary count and deadline below are
      // UNVERIFIED PLACEHOLDERS, carried over from the German source — see
      // the note there. Confirm against the official SVA Basel-Landschaft
      // site before launch and replace these.
      facts: [
        { k: 'Income threshold, single person', v: 'CHF 45,000 (unverified)' },
        { k: 'Income threshold, 4-person household', v: 'CHF 90,000 (unverified)' },
        { k: 'Recipients in the canton', v: 'approx. 20,000 (unverified)' },
        { k: 'Responsible office', v: 'SVA Basel-Landschaft' },
        { k: 'Application deadline 2027', v: 'September–December 31, 2026 (unverified)' },
      ],
      officeNameFull: 'SVA Basel-Landschaft',
      overviewCard: {
        bezueger: 'approx. 20,000 recipients (unverified)',
        frist: 'Deadline: September – December 31, 2026 (unverified)',
        zustaendig: 'Responsible: SVA Basel-Landschaft',
      },
      closingParagraph: closingParagraphs.en,
      steps: [
        {
          n: '1',
          title: 'Check eligibility',
          text: 'In a brief consultation of about 20 minutes, we\'ll check together whether — and to what extent — you\'re entitled to a premium reduction.',
        },
        {
          n: '2',
          title: 'Compiling your file',
          text: 'We help you correctly compile all the necessary documents: tax return, insurance policy, payslips.',
        },
        {
          n: '3',
          title: 'Submitting your application',
          text: 'We submit the application together with you to SVA Basel-Landschaft.',
        },
      ],
      reasons: reasonsByLang.en,
      faqs: [
        {
          q: 'Who is entitled to a premium reduction?',
          a: 'People with modest financial means residing in Switzerland are eligible. We\'ll check the exact income thresholds for the canton of Basel-Landschaft together with you during the initial consultation.',
        },
        {
          q: 'How much can I receive?',
          a: 'Between CHF 500 and CHF 3,000 per year, depending on income, assets and household size. Children and young adults up to age 25 in initial training also qualify.',
        },
        {
          q: 'What does this service cost?',
          a: 'You incur no direct costs. We are a FINMA-registered insurance broker (EVO Partners GmbH) and are not compensated directly by you.',
        },
        {
          q: 'What\'s the difference compared to applying directly with the canton?',
          a: 'You can apply directly with SVA Basel-Landschaft. We help you check your eligibility beforehand and correctly compile the file — similar to a fiduciary helping with a tax return.',
        },
        {
          q: 'How long does processing take?',
          a: 'The initial consultation takes about 20 minutes. The decision from the cantonal office is usually issued within 2–4 weeks.',
        },
      ],
    },

    es: {
      slug: 'basel-landschaft',
      name: 'Basel-Landschaft',
      shortCode: 'BL',
      phone: PHONE,
      email: EMAIL,
      heroProof: 'Cerca de 20.000 personas ya reciben la reducción de primas en BL',
      stats: [
        { value: "20'000+", label: 'Beneficiarios en BL' },
        { value: "CHF 500–3'000", label: 'Ahorro al año' },
        { value: '20 minutos', label: 'Consulta' },
        { value: 'Desde 2020', label: 'Experiencia' },
      ],
      infoHeading: 'Reducción de primas en el cantón de Basel-Landschaft',
      infoParagraphs: [
        'También en el cantón de Basel-Landschaft miles de personas reciben la reducción de primas. El trámite es breve y sencillo: merece la pena comprobar si tiene derecho. Basta con una solicitud por hogar.',
        'Tienen derecho las personas cuyos ingresos y patrimonio del hogar se sitúan por debajo del límite de la prestación y que residen en el cantón desde el 1 de enero del año en curso.',
      ],
      // NOTE: income thresholds, beneficiary count and deadline below are
      // UNVERIFIED PLACEHOLDERS, carried over from the German source — see
      // the note there. Confirm against the official SVA Basel-Landschaft
      // site before launch and replace these.
      facts: [
        { k: 'Límite de renta, persona sola', v: 'CHF 45.000 (sin verificar)' },
        { k: 'Límite de renta, hogar de 4 personas', v: 'CHF 90.000 (sin verificar)' },
        { k: 'Beneficiarios en el cantón', v: 'aprox. 20.000 (sin verificar)' },
        { k: 'Oficina competente', v: 'SVA Basel-Landschaft' },
        { k: 'Plazo de solicitud 2027', v: 'Septiembre–31 de diciembre de 2026 (sin verificar)' },
      ],
      officeNameFull: 'SVA Basel-Landschaft',
      overviewCard: {
        bezueger: 'aprox. 20.000 beneficiarios (sin verificar)',
        frist: 'Plazo: septiembre – 31 de diciembre de 2026 (sin verificar)',
        zustaendig: 'Competente: SVA Basel-Landschaft',
      },
      closingParagraph: closingParagraphs.es,
      steps: [
        {
          n: '1',
          title: 'Comprobar el derecho',
          text: 'En una breve consulta de unos 20 minutos, comprobamos juntos si tiene derecho a la reducción de primas y en qué cuantía.',
        },
        {
          n: '2',
          title: 'Preparación del expediente',
          text: 'Le ayudamos a reunir correctamente toda la documentación necesaria: declaración de impuestos, póliza del seguro, nóminas.',
        },
        {
          n: '3',
          title: 'Presentación de la solicitud',
          text: 'Presentamos la solicitud junto con usted ante la SVA Basel-Landschaft.',
        },
      ],
      reasons: reasonsByLang.es,
      faqs: [
        {
          q: '¿Quién tiene derecho a la reducción de primas?',
          a: 'Tienen derecho las personas con recursos económicos modestos residentes en Suiza. Comprobamos junto con usted los límites de renta exactos del cantón de Basel-Landschaft durante la primera consulta.',
        },
        {
          q: '¿Cuánto puedo recibir?',
          a: 'Entre CHF 500 y CHF 3.000 al año, según los ingresos, el patrimonio y el número de personas. Los niños y jóvenes de hasta 25 años en formación inicial también tienen derecho.',
        },
        {
          q: '¿Cuánto cuesta este servicio?',
          a: 'Usted no asume ningún coste directo. Somos un corredor de seguros registrado en FINMA (EVO Partners GmbH) y no recibimos ninguna compensación directa por su parte.',
        },
        {
          q: '¿Cuál es la diferencia con solicitarlo directamente al cantón?',
          a: 'Puede presentar la solicitud directamente ante la SVA Basel-Landschaft. Nosotros le ayudamos previamente a comprobar su derecho y a preparar correctamente el expediente, de forma similar a un gestor con la declaración de impuestos.',
        },
        {
          q: '¿Cuánto dura la tramitación?',
          a: 'La primera consulta dura unos 20 minutos. La resolución de la oficina cantonal suele llegar en un plazo de 2 a 4 semanas.',
        },
      ],
    },
  },
};

export function getCanton(slug, lang) {
  const entry = cantonsData[slug];
  if (!entry) return undefined;
  return entry[lang] || entry[DEFAULT_LOCALE];
}

export function getCantonSlugs() {
  return Object.keys(cantonsData);
}
