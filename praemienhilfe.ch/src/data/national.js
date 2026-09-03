// src/data/national.js
import { DEFAULT_LOCALE } from '../i18n/locales.js';

const national = {
  de: {
    heroCopy: {
      title: 'Prämienverbilligung beantragen — in jedem Kanton',
      paragraph:
        'Die Prämienverbilligung (IPV) steht Tausenden von Schweizer Einwohnerinnen und Einwohnern zu — doch viele beantragen sie nie. Wir helfen Ihnen, Ihren Anspruch zu prüfen und Ihren Antrag korrekt einzureichen. Kostenlos und unverbindlich.',
      proof: "Über 1'000 Dossiers bearbeitet seit 2020",
    },

    nationalStats: [
      { value: "1'000+", label: 'Dossiers pro Jahr' },
      { value: "CHF 500–3'000", label: 'Ersparnis/Jahr' },
      { value: '20 Minuten', label: 'Erstgespräch' },
      { value: 'FINMA', label: 'Registriert' },
    ],

    wasIst: {
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
    },

    whySection: {
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
    },

    howItWorksSteps: [
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
    ],

    werWirSind: {
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
    },

    nationalFaqs: [
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
    ],
  },

  en: {
    heroCopy: {
      title: 'Apply for a health insurance premium reduction — in every canton',
      paragraph:
        'The premium reduction (IPV) is available to thousands of Swiss residents — yet many never apply for it. We help you check your eligibility and submit your subsidy application correctly. Free of charge and with no obligation.',
      proof: 'Over 1,000 cases handled since 2020',
    },

    nationalStats: [
      { value: "1'000+", label: 'Cases per year' },
      { value: "CHF 500–3'000", label: 'Savings/year' },
      { value: '20 minutes', label: 'Initial consultation' },
      { value: 'FINMA', label: 'Registered' },
    ],

    wasIst: {
      // First paragraph is split around the phrase that becomes an inline link
      // to /so-funktioniert-es (instructions.md §INTERNAL LINKING FOR SEO).
      introBefore: 'The ',
      introLinkText: 'individual health insurance premium reduction',
      introAfter:
        ' (IPV) is a state support benefit for people and households with modest financial means. The Confederation and the cantons jointly share the cost of mandatory health insurance (KVG).',
      paragraphs: [
        'In Switzerland, over 2.4 million people are entitled to a premium reduction. Many of them never apply, however — out of lack of awareness, because of the administrative hurdles, or because they don\'t know whether they qualify.',
      ],
      bullets: [
        'Your taxable income and assets',
        'The number of people in your household',
        'The canton you live in',
        'Your current health insurance premium',
      ],
      boxTitle: 'Did you know?',
      boxText:
        'Over 2.4 million people in Switzerland are entitled to a premium reduction — yet many never apply for it.',
      boxStat: 'CHF 1.5 billion',
      boxStatLabel: 'is paid out in premium reductions every year',
    },

    whySection: {
      intro:
        'Over 2.4 million people in Switzerland are entitled to financial support for their health insurance premiums. A large share of them, however, never submit an application. The most common reasons:',
      reasons: [
        {
          title: 'Too complicated',
          text: 'Each canton has its own forms, deadlines and requirements. The process can look daunting at first glance.',
        },
        {
          title: 'Unsure about eligibility',
          text: 'Many people believe they don\'t qualify, even though they would be eligible. The income thresholds are more generous than often assumed.',
        },
        {
          title: 'Missed deadlines',
          text: 'Application deadlines vary from canton to canton and are often overlooked. A missed application means a full year of reduction lost.',
        },
        {
          title: 'No time',
          text: 'Gathering the documents and filling out the forms takes time that many people simply don\'t have.',
        },
      ],
      closing: 'This is exactly where we step in. We know the requirements of every canton and guide you through the entire process.',
    },

    howItWorksSteps: [
      {
        n: '1',
        title: 'Choose your canton and describe your situation',
        text: 'Select the canton you live in and briefly describe your personal situation — whether you\'re single, a family, a student or a retiree. It takes less than 2 minutes.',
      },
      {
        n: '2',
        title: 'Free assessment by our experts',
        text: 'We analyze your situation and check whether — and to what extent — you\'re entitled to a premium reduction. We know the exact criteria and deadlines for every canton.',
      },
      {
        n: '3',
        title: 'Compiling your file',
        text: 'We help you correctly compile all the necessary documents: tax return, insurance policy, payslips and other documents depending on the canton.',
      },
      {
        n: '4',
        title: 'Submitting your application',
        text: 'We submit the application together with you to the responsible cantonal office. You will then receive a decision from the canton within a few weeks.',
      },
    ],

    werWirSind: {
      paragraphs: [
        'praemienhilfe.ch is a service of EVO Partners GmbH, an independent, FINMA-registered insurance broker based in Switzerland.',
        'We are not a government authority or a cantonal office. We are a private advisory firm specializing in Swiss health insurance.',
        'Our services include:',
      ],
      bullets: [
        'Help with the premium reduction (IPV) — for all cantons',
        'Independent advice on health insurance (KVG and VVG)',
        'Optimizing your insurance coverage — same benefits, lower premiums',
      ],
      closing:
        'Our help with the premium reduction is completely free for you. As a FINMA-registered broker, we are compensated by our insurance partners when we recommend an optimization of your health insurance. There is no obligation whatsoever.',
      trustItems: [
        'FINMA-registered insurance broker',
        'Over 1,000 cases handled since 2020',
        'Independent of cantons and insurers',
        'No obligation for the client',
      ],
      rating: '4.8/5 customer rating',
    },

    nationalFaqs: [
      {
        q: 'Who is entitled to a premium reduction across Switzerland?',
        a: 'Anyone residing in Switzerland whose taxable income and assets fall below the threshold set by their canton. The thresholds vary considerably by canton and household size. Even people who believe they earn too much should have their eligibility checked. Over 2.4 million people are entitled nationwide.',
      },
      {
        q: 'Can I apply for multiple people at once?',
        a: 'Yes. An application applies per household and can include all insured members — partners, children and other household members. Children and young adults up to age 25 in initial training often qualify for a higher reduction.',
      },
      {
        q: 'Do I need to reapply every year?',
        a: 'In most cantons, yes — the premium reduction must be reapplied for annually. In some cantons the calculation is done automatically based on tax data. We\'ll tell you exactly how it works in your canton.',
      },
      {
        q: 'What does this service cost?',
        a: 'Our help with the premium reduction is completely free for you. We are a FINMA-registered insurance broker (EVO Partners GmbH) and are not compensated directly by you.',
      },
      {
        q: 'Are you an official cantonal office?',
        a: 'No. praemienhilfe.ch is a private, independent advisory platform. We are not a government body. You can also apply directly with the responsible cantonal office. We make this process easier for you and, at the same time, check whether your insurance coverage can be optimized.',
      },
      {
        q: 'What happens after the initial consultation?',
        a: 'You\'ll receive a summary of your situation along with clear recommendations. If you\'d like, we\'ll help you compile the file and submit it to the cantonal office. There is no obligation whatsoever.',
      },
    ],
  },

  es: {
    heroCopy: {
      title: 'Solicite la reducción de primas del seguro médico — en cualquier cantón',
      paragraph:
        'La reducción de primas (IPV) está disponible para miles de residentes en Suiza, pero muchos nunca la solicitan. Le ayudamos a comprobar si tiene derecho y a presentar correctamente su solicitud de reducción de primas. Gratuito y sin compromiso.',
      proof: 'Más de 1.000 expedientes tramitados desde 2020',
    },

    nationalStats: [
      { value: "1'000+", label: 'Expedientes al año' },
      { value: "CHF 500–3'000", label: 'Ahorro/año' },
      { value: '20 minutos', label: 'Primera consulta' },
      { value: 'FINMA', label: 'Registrado' },
    ],

    wasIst: {
      // First paragraph is split around the phrase that becomes an inline link
      // to /so-funktioniert-es (instructions.md §INTERNAL LINKING FOR SEO).
      introBefore: 'La ',
      introLinkText: 'reducción individual de primas del seguro médico',
      introAfter:
        ' (IPV) es una prestación estatal de apoyo para personas y hogares con recursos económicos modestos. La Confederación y los cantones se reparten conjuntamente los costos del seguro médico obligatorio (KVG).',
      paragraphs: [
        'En Suiza, más de 2,4 millones de personas tienen derecho a la reducción de primas. Sin embargo, muchas de ellas nunca la solicitan, ya sea por desconocimiento, por las trabas administrativas o porque no saben si cumplen los requisitos.',
      ],
      bullets: [
        'Su renta y patrimonio imponibles',
        'El número de personas de su hogar',
        'El cantón en el que reside',
        'La prima actual de su seguro médico',
      ],
      boxTitle: '¿Sabía que...?',
      boxText:
        'Más de 2,4 millones de personas en Suiza tienen derecho a la reducción de primas, pero muchas nunca la solicitan.',
      boxStat: 'CHF 1.500 mill.',
      boxStatLabel: 'se pagan cada año en concepto de reducción de primas',
    },

    whySection: {
      intro:
        'Más de 2,4 millones de personas en Suiza tienen derecho a una ayuda económica para las primas de su seguro médico. Sin embargo, una gran parte de ellas nunca presenta una solicitud. Los motivos más frecuentes:',
      reasons: [
        {
          title: 'Demasiado complicado',
          text: 'Cada cantón tiene sus propios formularios, plazos y requisitos. A primera vista, el trámite puede parecer laborioso.',
        },
        {
          title: 'Dudas sobre el derecho',
          text: 'Muchas personas creen que no tienen derecho cuando en realidad sí lo tienen. Los límites de renta son más generosos de lo que suele pensarse.',
        },
        {
          title: 'Plazos no respetados',
          text: 'Los plazos de solicitud varían según el cantón y a menudo pasan desapercibidos. Una solicitud fuera de plazo supone perder un año entero de reducción.',
        },
        {
          title: 'Falta de tiempo',
          text: 'Reunir la documentación y rellenar los formularios requiere un tiempo del que muchas personas no disponen.',
        },
      ],
      closing: 'Ahí es precisamente donde entramos nosotros. Conocemos los requisitos de cada cantón y le acompañamos durante todo el proceso.',
    },

    howItWorksSteps: [
      {
        n: '1',
        title: 'Elija su cantón e indique su situación',
        text: 'Seleccione su cantón de residencia y describa brevemente su situación personal: si vive solo/a, en familia, es estudiante o está jubilado/a. No le llevará más de 2 minutos.',
      },
      {
        n: '2',
        title: 'Evaluación gratuita por nuestros expertos',
        text: 'Analizamos su situación y comprobamos si tiene derecho a la reducción de primas y en qué cuantía. Conocemos los criterios exactos y los plazos de cada cantón.',
      },
      {
        n: '3',
        title: 'Preparación del expediente',
        text: 'Le ayudamos a reunir correctamente toda la documentación necesaria: declaración de impuestos, póliza del seguro, nóminas y otros documentos según el cantón.',
      },
      {
        n: '4',
        title: 'Presentación de la solicitud',
        text: 'Presentamos la solicitud junto con usted ante la oficina cantonal competente. Recibirá la resolución del cantón en pocas semanas.',
      },
    ],

    werWirSind: {
      paragraphs: [
        'praemienhilfe.ch es un servicio de EVO Partners GmbH, un corredor de seguros independiente, registrado en FINMA y con sede en Suiza.',
        'No somos una autoridad estatal ni una oficina cantonal. Somos una empresa de asesoría privada especializada en el seguro médico suizo.',
        'Nuestros servicios incluyen:',
      ],
      bullets: [
        'Ayuda con la reducción de primas (IPV) — para todos los cantones',
        'Asesoramiento independiente sobre el seguro médico (KVG y VVG)',
        'Optimización de su cobertura de seguro — mismas prestaciones, primas más bajas',
      ],
      closing:
        'Nuestra ayuda con la reducción de primas es completamente gratuita para usted. Como corredor registrado en FINMA, recibimos una compensación de nuestros socios aseguradores cuando recomendamos una optimización de su seguro médico. No existe ninguna obligación de aceptarla.',
      trustItems: [
        'Corredor de seguros registrado en FINMA',
        'Más de 1.000 expedientes tramitados desde 2020',
        'Independiente de cantones y aseguradoras',
        'Ninguna obligación para el cliente',
      ],
      rating: '4,8/5 valoración de clientes',
    },

    nationalFaqs: [
      {
        q: '¿Quién tiene derecho a la reducción de primas en toda Suiza?',
        a: 'Toda persona residente en Suiza cuya renta y patrimonio imponibles se sitúen por debajo del límite establecido por su cantón. Los límites varían considerablemente según el cantón y el tamaño del hogar. Incluso quienes creen ganar demasiado deberían comprobar si tienen derecho. Más de 2,4 millones de personas cumplen los requisitos en todo el país.',
      },
      {
        q: '¿Puedo solicitar la reducción para varias personas a la vez?',
        a: 'Sí. La solicitud se presenta por hogar y puede incluir a todas las personas aseguradas: pareja, hijos y demás miembros del hogar. Los niños y jóvenes de hasta 25 años en formación inicial suelen tener derecho a una reducción mayor.',
      },
      {
        q: '¿Tengo que volver a solicitarla cada año?',
        a: 'En la mayoría de los cantones, sí: la reducción de primas debe solicitarse de nuevo cada año. En algunos cantones el cálculo se realiza automáticamente a partir de los datos fiscales. Le informamos sobre la normativa exacta de su cantón.',
      },
      {
        q: '¿Cuánto cuesta este servicio?',
        a: 'Nuestra ayuda con la reducción de primas es completamente gratuita para usted. Somos un corredor de seguros registrado en FINMA (EVO Partners GmbH) y no recibimos ninguna compensación directa por su parte.',
      },
      {
        q: '¿Son ustedes una oficina cantonal oficial?',
        a: 'No. praemienhilfe.ch es una plataforma de asesoría privada e independiente. No somos un organismo estatal. También puede presentar la solicitud directamente ante la oficina cantonal competente. Nosotros le facilitamos este proceso y, al mismo tiempo, comprobamos si su cobertura de seguro puede optimizarse.',
      },
      {
        q: '¿Qué ocurre después de la primera consulta?',
        a: 'Recibirá un resumen de su situación junto con recomendaciones claras. Si lo desea, le acompañamos en la preparación del expediente y en su presentación ante la oficina cantonal. No existe ninguna obligación.',
      },
    ],
  },
};

export function getNational(lang) {
  return national[lang] || national[DEFAULT_LOCALE];
}

export default national;
