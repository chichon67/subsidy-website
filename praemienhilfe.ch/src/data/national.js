// src/data/national.js
export const national = {
  de: {
    heroCopy: {
      title: 'Prämienverbilligung beantragen — in jedem Kanton',
      paragraph:
        'Die Prämienverbilligung (IPV) steht Tausenden von Schweizer Einwohnerinnen und Einwohnern zu — doch viele beantragen sie nie. Wir helfen Ihnen, Ihren Anspruch zu prüfen und Ihren Antrag korrekt einzureichen. Kostenlos und unverbindlich.',
      proof: "Über 1'000 Dossiers erfolgreich bearbeitet",
    },
    nationalStats: [
      { value: "1'000+", label: 'Dossiers pro Jahr' },
      { value: "CHF 500–3'000", label: 'Ersparnis/Jahr' },
      { value: '20 Minuten', label: 'Erstgespräch' },
      { value: 'FINMA', label: 'Registriert' },
    ],
    wasIst: {
      heading: 'Was ist die Prämienverbilligung?',
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
      boxText: 'Über 2.4 Millionen Personen in der Schweiz haben Anspruch auf Prämienverbilligung — viele beantragen sie jedoch nie.',
      boxStat: 'CHF 1.5 Mrd.',
      boxStatLabel: 'werden jährlich als Prämienverbilligung ausbezahlt',
    },
    whySection: {
      heading: 'Warum verzichten viele Berechtigte auf ihre Prämienverbilligung?',
      intro: 'Über 2.4 Millionen Schweizerinnen und Schweizer haben Anspruch auf finanzielle Unterstützung bei den Krankenkassenprämien. Ein grosser Teil davon stellt jedoch nie einen Antrag. Die häufigsten Gründe:',
      reasons: [
        { title: 'Zu kompliziert', text: 'Jeder Kanton hat eigene Formulare, Fristen und Anforderungen. Das Verfahren wirkt auf den ersten Blick aufwendig.' },
        { title: 'Unsicher über den Anspruch', text: 'Viele Personen glauben, sie hätten keinen Anspruch, obwohl sie berechtigt wären. Die Einkommensgrenzen sind grosszügiger als oft angenommen.' },
        { title: 'Fristen verpasst', text: 'Die Anmeldefristen variieren je nach Kanton und werden oft übersehen. Ein verpasster Antrag bedeutet ein verlorenes Jahr Verbilligung.' },
        { title: 'Keine Zeit', text: 'Das Zusammenstellen der Unterlagen und das Ausfüllen der Formulare kostet Zeit, die viele nicht haben.' },
      ],
      closing: 'Genau hier setzen wir an. Wir kennen die Anforderungen jedes Kantons und begleiten Sie durch den gesamten Prozess.',
    },
    howItWorksSteps: [
      { n: '1', title: 'Kanton wählen und Situation angeben', text: 'Wählen Sie Ihren Wohnkanton und beschreiben Sie kurz Ihre persönliche Situation — ob Einzelperson, Familie, Student oder Rentner. Das dauert weniger als 2 Minuten.' },
      { n: '2', title: 'Kostenlose Prüfung durch unsere Experten', text: 'Wir analysieren Ihre Situation und prüfen, ob und in welcher Höhe Sie Anspruch auf Prämienverbilligung haben. Wir kennen die genauen Kriterien und Fristen jedes Kantons.' },
      { n: '3', title: 'Dossier zusammenstellen', text: 'Wir helfen Ihnen, alle notwendigen Unterlagen korrekt zusammenzustellen: Steuererklärung, Versicherungspolice, Lohnabrechnungen und weitere Dokumente je nach Kanton.' },
      { n: '4', title: 'Antrag einreichen', text: 'Den Antrag reichen wir gemeinsam mit Ihnen beim zuständigen Kantonsamt ein. Sie erhalten danach innerhalb weniger Wochen einen Entscheid vom Kanton.' },
    ],
    werWirSind: {
      heading: 'Wer steckt hinter prämienhilfe.ch?',
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
      closing: 'Die Hilfe bei der Prämienverbilligung ist für Sie vollständig kostenlos. Als FINMA-registrierter Broker werden wir durch unsere Versicherungspartner vergütet, wenn wir eine Optimierung Ihrer Krankenversicherung empfehlen. Es besteht keinerlei Verpflichtung dazu.',
      trustItems: [
        'FINMA-registrierter Versicherungsbroker',
        "Über 1'000 Dossiers bearbeitet seit 2020",
        'Unabhängig von Kantonen und Versicherern',
        'Keinerlei Verpflichtung für den Klienten',
      ],
      rating: '4.8/5 Kundenbewertung',
    },
    nationalFaqs: [
      { q: 'Wer hat schweizweit Anspruch auf Prämienverbilligung?', a: 'Jede Person mit Wohnsitz in der Schweiz, deren steuerbares Einkommen und Vermögen unterhalb der kantonal festgelegten Grenze liegt. Die Grenzen variieren je nach Kanton und Haushaltsgrösse erheblich. Auch Personen, die glauben, zu viel zu verdienen, sollten ihren Anspruch prüfen lassen. Über 2.4 Millionen Personen sind schweizweit berechtigt.' },
      { q: 'Kann ich für mehrere Personen einen Antrag stellen?', a: 'Ja. Ein Antrag gilt pro Haushalt und kann alle versicherten Personen einschliessen — Partner, Kinder und weitere Haushaltsangehörige. Kinder und Jugendliche bis 25 Jahre in Erstausbildung haben häufig erhöhten Anspruch.' },
      { q: 'Muss ich jedes Jahr einen neuen Antrag stellen?', a: 'In den meisten Kantonen ja — die Prämienverbilligung wird jährlich neu beantragt. In einigen Kantonen erfolgt eine automatische Berechnung aufgrund der Steuerdaten. Wir informieren Sie über die genaue Regelung in Ihrem Kanton.' },
      { q: 'Was kostet mich dieser Service?', a: 'Die Hilfe bei der Prämienverbilligung ist für Sie vollständig kostenlos. Wir sind ein FINMA-registrierter Versicherungsbroker (EVO Partners GmbH) und werden nicht direkt von Ihnen vergütet.' },
      { q: 'Sind Sie ein offizielles Kantonsamt?', a: 'Nein. prämienhilfe.ch ist eine private, unabhängige Beratungsplattform. Wir sind kein staatliches Organ. Den Antrag können Sie auch direkt beim zuständigen Kantonsamt stellen. Wir erleichtern Ihnen diesen Prozess und prüfen gleichzeitig, ob Ihre Versicherungssituation optimiert werden kann.' },
      { q: 'Was passiert nach dem Erstgespräch?', a: 'Sie erhalten eine Zusammenfassung Ihrer Situation sowie klare Handlungsempfehlungen. Wenn Sie möchten, begleiten wir Sie bei der Zusammenstellung des Dossiers und der Einreichung beim Kantonsamt. Es besteht keinerlei Verpflichtung.' },
    ],
    deadlineSection: {
      heading: 'Verpassen Sie nicht Ihre Antragsfrist',
      warning: '⚠️ Die Anmeldefristen variieren je nach Kanton und werden oft nur einmal jährlich angeboten.',
      body: 'Jeder Kanton legt seine eigene Frist fest, und ein verpasster Antrag bedeutet meist ein verlorenes Jahr Verbilligung. Wir kennen die genauen Fristen für Ihren Wohnkanton und sagen Ihnen im kostenlosen Erstgespräch, bis wann Sie handeln sollten.',
      closing: 'Wer die Frist verpasst, verliert die Verbilligung für das laufende Jahr — das können mehrere hundert bis mehrere tausend Franken sein.',
    },
    howItWorksHeading: 'So funktioniert unsere Hilfe',
    finalCta: {
      heading: 'Jetzt Anspruch prüfen lassen',
      text: 'Wählen Sie Ihre Situation und prüfen Sie in 20 Minuten, ob Sie Anspruch auf Prämienverbilligung haben. Kostenlos und unverbindlich.',
      buttonLabel: 'Anspruch prüfen →',
      disclaimer: 'prämienhilfe.ch ist ein privater Beratungsservice von EVO Partners GmbH, FINMA-registrierter Versicherungsbroker. Kein offizielles Kantonsorgan.',
    },
  },
  en: {
    heroCopy: {
      title: 'Apply for your health insurance premium subsidy — in any canton',
      paragraph:
        'The individual premium subsidy is available to thousands of Swiss residents — yet many never apply for it. We help you check your eligibility and submit your application correctly. Free of charge and with no obligation.',
      proof: 'Over 1,000 applications successfully handled',
    },
    nationalStats: [
      { value: '1,000+', label: 'Applications per year' },
      { value: 'CHF 500–3,000', label: 'Savings per year' },
      { value: '20 minutes', label: 'Initial consultation' },
      { value: 'FINMA', label: 'Registered' },
    ],
    wasIst: {
      heading: 'What is the premium subsidy?',
      introBefore: 'The ',
      introLinkText: 'individual premium subsidy',
      introAfter:
        ' is a government support payment for people and households with modest financial means. The federal government and the cantons jointly cover part of the cost of mandatory health insurance.',
      paragraphs: [
        'Over 2.4 million people in Switzerland are eligible for the premium subsidy. Many of them never apply — out of not knowing about it, because of administrative hurdles, or because they don’t know whether they qualify.',
      ],
      bullets: [
        'Your taxable income and assets',
        'The number of people in your household',
        'The canton you live in',
        'Your current health insurance premium',
      ],
      boxTitle: 'Did you know?',
      boxText: 'Over 2.4 million people in Switzerland are eligible for the premium subsidy — yet many never apply for it.',
      boxStat: 'CHF 1.5 billion',
      boxStatLabel: 'is paid out as premium subsidies every year',
    },
    whySection: {
      heading: 'Why do so many eligible people never claim their premium subsidy?',
      intro: 'Over 2.4 million people in Switzerland are eligible for financial support with their health insurance premiums. Yet a large share of them never apply. The most common reasons:',
      reasons: [
        { title: 'Too complicated', text: 'Each canton has its own forms, deadlines, and requirements. The process looks daunting at first glance.' },
        { title: 'Unsure about eligibility', text: 'Many people believe they don’t qualify, even though they would. The income thresholds are more generous than often assumed.' },
        { title: 'Missed deadlines', text: 'Application deadlines vary by canton and are often overlooked. A missed application means a lost year of subsidy.' },
        { title: 'No time', text: 'Gathering the documents and filling out the forms takes time that many people don’t have.' },
      ],
      closing: 'This is exactly where we come in. We know the requirements of every canton and guide you through the entire process.',
    },
    howItWorksSteps: [
      { n: '1', title: 'Choose your canton and describe your situation', text: 'Select the canton you live in and briefly describe your personal situation — whether you’re single, a family, a student, or a retiree. It takes less than 2 minutes.' },
      { n: '2', title: 'Free assessment by our experts', text: 'We analyze your situation and check whether — and how much — you’re entitled to in premium subsidy. We know the exact criteria and deadlines for every canton.' },
      { n: '3', title: 'We put your file together', text: 'We help you correctly assemble all the required documents: tax return, insurance policy, payslips, and other documents depending on your canton.' },
      { n: '4', title: 'We submit your application', text: 'We submit the application together with you to the responsible cantonal office. You’ll receive a decision from the canton within a few weeks.' },
    ],
    werWirSind: {
      heading: 'Who is behind prämienhilfe.ch?',
      paragraphs: [
        'prämienhilfe.ch is a service of EVO Partners GmbH, an independent, FINMA-registered insurance broker based in Switzerland.',
        'We are not a government authority or a cantonal office. We are a private advisory firm specializing in Swiss health insurance.',
        'Our services include:',
      ],
      bullets: [
        'Help with the premium subsidy — for every canton',
        'Independent advice on health insurance (mandatory and supplementary)',
        'Optimizing your insurance coverage — same benefits, lower premiums',
      ],
      closing: 'Our help with the premium subsidy is completely free for you. As a FINMA-registered broker, we are compensated by our insurance partners when we recommend an optimization of your health insurance. There is no obligation whatsoever to accept it.',
      trustItems: [
        'FINMA-registered insurance broker',
        'Over 1,000 applications handled since 2020',
        'Independent of cantons and insurers',
        'No obligation whatsoever for clients',
      ],
      rating: '4.8/5 client rating',
    },
    nationalFaqs: [
      { q: 'Who is eligible for the premium subsidy in Switzerland?', a: 'Anyone resident in Switzerland whose taxable income and assets fall below the threshold set by their canton. Thresholds vary considerably by canton and household size. Even people who think they earn too much should have their eligibility checked. Over 2.4 million people across Switzerland qualify.' },
      { q: 'Can I apply for multiple people at once?', a: 'Yes. One application covers the whole household and can include everyone insured — partner, children, and other household members. Children and young adults up to age 25 in initial education often qualify for a higher subsidy.' },
      { q: 'Do I need to reapply every year?', a: 'In most cantons, yes — the premium subsidy is reassessed and reapplied for annually. Some cantons calculate it automatically based on tax data. We’ll tell you the exact rule for your canton.' },
      { q: 'What does this service cost?', a: 'Our help with the premium subsidy is completely free for you. We are a FINMA-registered insurance broker (EVO Partners GmbH) and are not paid directly by you.' },
      { q: 'Are you an official cantonal office?', a: 'No. prämienhilfe.ch is a private, independent advisory platform. We are not a government body. You can also apply directly with your cantonal office. Our service makes the process easier for you and, at the same time, checks whether your overall insurance situation can be optimized.' },
      { q: 'What happens after the initial consultation?', a: 'You’ll receive a summary of your situation and clear next-step recommendations. If you’d like, we’ll help you assemble your file and submit it to the cantonal office. There is no obligation whatsoever.' },
    ],
    deadlineSection: {
      heading: 'Don’t miss your application deadline',
      warning: '⚠️ Application deadlines vary by canton and are often only open once a year.',
      body: 'Each canton sets its own deadline, and missing it usually means losing a year’s worth of subsidy. We know the exact deadlines for your canton of residence and will tell you during the free initial consultation how soon you need to act.',
      closing: 'If you miss the deadline, you lose the subsidy for the current year — that can be several hundred to several thousand francs.',
    },
    howItWorksHeading: 'How our help works',
    finalCta: {
      heading: 'Check your eligibility now',
      text: 'Select your situation and find out in 20 minutes whether you’re entitled to a premium subsidy. Free of charge and with no obligation.',
      buttonLabel: 'Check eligibility →',
      disclaimer: 'prämienhilfe.ch is a private advisory service run by EVO Partners GmbH, a FINMA-registered insurance broker. Not an official cantonal body.',
    },
  },
  es: {
    heroCopy: {
      title: 'Solicite su reducción de primas del seguro médico — en cualquier cantón',
      paragraph:
        'La reducción individual de primas está disponible para miles de residentes en Suiza — pero muchos nunca la solicitan. Le ayudamos a comprobar si tiene derecho y a presentar su solicitud correctamente. Gratuito y sin compromiso.',
      proof: 'Más de 1,000 expedientes gestionados con éxito',
    },
    nationalStats: [
      { value: '1,000+', label: 'Expedientes al año' },
      { value: 'CHF 500–3,000', label: 'Ahorro anual' },
      { value: '20 minutos', label: 'Primera consulta' },
      { value: 'FINMA', label: 'Registrado' },
    ],
    wasIst: {
      heading: '¿Qué es la reducción de primas?',
      introBefore: 'La ',
      introLinkText: 'reducción individual de primas',
      introAfter:
        ' es una prestación estatal de apoyo para personas y hogares con recursos económicos modestos. La Confederación y los cantones contribuyen conjuntamente a los costes del seguro médico obligatorio.',
      paragraphs: [
        'En Suiza, más de 2.4 millones de personas tienen derecho a la reducción de primas. Sin embargo, muchas nunca la solicitan — por desconocimiento, por las trabas administrativas o porque no saben si tienen derecho.',
      ],
      bullets: [
        'Sus ingresos y patrimonio imponibles',
        'El número de personas en su hogar',
        'El cantón en el que vive',
        'Su prima actual del seguro médico',
      ],
      boxTitle: '¿Sabía que...?',
      boxText: 'Más de 2.4 millones de personas en Suiza tienen derecho a la reducción de primas — pero muchas nunca la solicitan.',
      boxStat: 'CHF 1,500 millones',
      boxStatLabel: 'se pagan cada año en concepto de reducción de primas',
    },
    whySection: {
      heading: '¿Por qué muchas personas con derecho nunca solicitan su reducción de primas?',
      intro: 'Más de 2.4 millones de personas en Suiza tienen derecho a apoyo financiero para sus primas del seguro médico. Sin embargo, una gran parte nunca presenta una solicitud. Los motivos más frecuentes:',
      reasons: [
        { title: 'Demasiado complicado', text: 'Cada cantón tiene sus propios formularios, plazos y requisitos. El procedimiento parece complejo a primera vista.' },
        { title: 'Inseguridad sobre el derecho', text: 'Muchas personas creen que no tienen derecho, aunque sí lo tendrían. Los límites de ingresos son más generosos de lo que se suele pensar.' },
        { title: 'Plazos no cumplidos', text: 'Los plazos de solicitud varían según el cantón y a menudo se pasan por alto. Una solicitud fuera de plazo significa perder un año de reducción.' },
        { title: 'Falta de tiempo', text: 'Reunir los documentos y rellenar los formularios requiere un tiempo que muchas personas no tienen.' },
      ],
      closing: 'Aquí es exactamente donde entramos nosotros. Conocemos los requisitos de cada cantón y le acompañamos durante todo el proceso.',
    },
    howItWorksSteps: [
      { n: '1', title: 'Elija su cantón e indique su situación', text: 'Seleccione su cantón de residencia y describa brevemente su situación personal — ya sea soltero/a, familia, estudiante o jubilado/a. Tarda menos de 2 minutos.' },
      { n: '2', title: 'Evaluación gratuita por nuestros expertos', text: 'Analizamos su situación y comprobamos si tiene derecho a la reducción de primas y en qué cuantía. Conocemos los criterios y plazos exactos de cada cantón.' },
      { n: '3', title: 'Preparamos su expediente', text: 'Le ayudamos a reunir correctamente todos los documentos necesarios: declaración de impuestos, póliza de seguro, nóminas y otros documentos según el cantón.' },
      { n: '4', title: 'Presentamos la solicitud', text: 'Presentamos la solicitud junto con usted ante la oficina cantonal competente. En pocas semanas recibirá una resolución del cantón.' },
    ],
    werWirSind: {
      heading: '¿Quién está detrás de prämienhilfe.ch?',
      paragraphs: [
        'prämienhilfe.ch es un servicio de EVO Partners GmbH, un corredor de seguros independiente registrado ante FINMA con sede en Suiza.',
        'No somos una autoridad estatal ni una oficina cantonal. Somos una empresa de asesoría privada especializada en el seguro médico suizo.',
        'Nuestros servicios incluyen:',
      ],
      bullets: [
        'Ayuda con la reducción de primas — para todos los cantones',
        'Asesoría independiente sobre el seguro médico (obligatorio y complementario)',
        'Optimización de su cobertura de seguro — mismas prestaciones, primas más bajas',
      ],
      closing: 'Nuestra ayuda con la reducción de primas es totalmente gratuita para usted. Como corredor registrado ante FINMA, recibimos una compensación de nuestros socios aseguradores cuando recomendamos una optimización de su seguro médico. No existe ninguna obligación de aceptarla.',
      trustItems: [
        'Corredor de seguros registrado ante FINMA',
        'Más de 1,000 expedientes gestionados desde 2020',
        'Independiente de cantones y aseguradoras',
        'Ninguna obligación para el cliente',
      ],
      rating: '4.8/5 valoración de clientes',
    },
    nationalFaqs: [
      { q: '¿Quién tiene derecho a la reducción de primas en toda Suiza?', a: 'Toda persona residente en Suiza cuyos ingresos y patrimonio imponibles se sitúen por debajo del límite establecido por su cantón. Los límites varían considerablemente según el cantón y el tamaño del hogar. Incluso quienes creen ganar demasiado deberían comprobar su derecho. Más de 2.4 millones de personas tienen derecho en toda Suiza.' },
      { q: '¿Puedo solicitarlo para varias personas a la vez?', a: 'Sí. Una solicitud cubre todo el hogar y puede incluir a todas las personas aseguradas — pareja, hijos y demás miembros del hogar. Los niños y jóvenes hasta 25 años en formación inicial suelen tener derecho a un importe mayor.' },
      { q: '¿Debo volver a solicitarlo cada año?', a: 'En la mayoría de los cantones, sí — la reducción de primas se solicita de nuevo cada año. En algunos cantones se calcula automáticamente a partir de los datos fiscales. Le informaremos sobre la normativa exacta de su cantón.' },
      { q: '¿Cuánto cuesta este servicio?', a: 'Nuestra ayuda con la reducción de primas es totalmente gratuita para usted. Somos un corredor de seguros registrado ante FINMA (EVO Partners GmbH) y no recibimos pago directo suyo.' },
      { q: '¿Son una oficina cantonal oficial?', a: 'No. prämienhilfe.ch es una plataforma de asesoría privada e independiente. No somos un organismo estatal. También puede presentar la solicitud directamente ante su oficina cantonal. Nuestro servicio le facilita el proceso y, al mismo tiempo, comprueba si su situación de seguros en general puede optimizarse.' },
      { q: '¿Qué ocurre después de la primera consulta?', a: 'Recibirá un resumen de su situación junto con recomendaciones claras. Si lo desea, le ayudamos a preparar el expediente y a presentarlo ante la oficina cantonal. No existe ninguna obligación.' },
    ],
    deadlineSection: {
      heading: 'No deje pasar su plazo de solicitud',
      warning: '⚠️ Los plazos de solicitud varían según el cantón y a menudo solo se abren una vez al año.',
      body: 'Cada cantón fija su propio plazo, y no cumplirlo suele significar perder un año entero de reducción. Conocemos los plazos exactos de su cantón de residencia y le indicaremos en la consulta inicial gratuita hasta cuándo debe actuar.',
      closing: 'Quien no cumple el plazo pierde la reducción del año en curso — lo que puede suponer desde varios cientos hasta varios miles de francos.',
    },
    howItWorksHeading: 'Cómo funciona nuestra ayuda',
    finalCta: {
      heading: 'Compruebe su derecho ahora',
      text: 'Seleccione su situación y compruebe en 20 minutos si tiene derecho a la reducción de primas. Gratuito y sin compromiso.',
      buttonLabel: 'Comprobar derecho →',
      disclaimer: 'prämienhilfe.ch es un servicio de asesoría privado de EVO Partners GmbH, corredor de seguros registrado ante FINMA. No es un organismo cantonal oficial.',
    },
  },
};
