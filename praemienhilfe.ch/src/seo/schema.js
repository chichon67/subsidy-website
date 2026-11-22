export const SITE_URL = 'https://praemien-hilfe.ch';
export const ORG_ID = `${SITE_URL}/#organization`;

const HOME_NAME = {
  de: 'Prämienverbilligung',
  en: 'Premium Reduction',
  es: 'Reducción de primas',
};

// Names match the visible heading or the page title already shown in the UI.
const PAGE_NAME = {
  de: {
    faq: 'Häufige Fragen',
    'so-funktioniert-es': 'So funktioniert die Beantragung',
    kontakt: 'Kontakt',
    antrag: 'Antrag stellen',
    impressum: 'Impressum',
    datenschutz: 'Datenschutzbestimmungen',
  },
  en: {
    faq: 'Frequently Asked Questions',
    'so-funktioniert-es': 'How applying works',
    kontakt: 'Contact',
    antrag: 'Submit your application',
    impressum: 'Legal Notice',
    datenschutz: 'Privacy Policy',
  },
  es: {
    faq: 'Preguntas frecuentes',
    'so-funktioniert-es': 'Así funciona la solicitud',
    kontakt: 'Contacto',
    antrag: 'Presentar la solicitud',
    impressum: 'Aviso legal',
    datenschutz: 'Política de privacidad',
  },
};

// Facts already printed in the Impressum and the footer ("Betrieben von").
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'EVO Partners GmbH',
    legalName: 'EVO Partners GmbH',
    url: 'https://evo-partners.ch',
    email: 'office@evo-partners.ch',
    description:
      'Unabhängiger Versicherungsvermittler, bei der FINMA registriert. praemien-hilfe.ch ist ein Service von EVO Partners GmbH.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'c/o ExpertFid & Audit AG, Strehlgasse 2',
      postalCode: '8001',
      addressLocality: 'Zürich',
      addressCountry: 'CH',
    },
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'FINMA',
      value: 'F01552602',
    },
  };
}

export function websiteSchema(description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'praemien-hilfe.ch',
    url: SITE_URL,
    description,
    inLanguage: ['de-CH', 'en-CH', 'es-CH'],
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}

export function crumbsFor({ lang, canonical, pageKey, cantonName }) {
  if (!lang || !canonical || !HOME_NAME[lang]) return [];
  const homeUrl = `${SITE_URL}/${lang}/`;
  const home = { name: HOME_NAME[lang], url: homeUrl };
  if (canonical === homeUrl) return [home];
  const currentName = cantonName || PAGE_NAME[lang]?.[pageKey];
  if (!currentName) return [];
  return [home, { name: currentName, url: canonical }];
}
