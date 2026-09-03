// src/i18n/pageUrls.js
// Maps a stable per-page key to its path under each locale, for hreflang.
// German-only pages (not in this map) get no EN/ES hreflang alternates.
const BASE = 'https://praemienhilfe.ch';

const PATHS = {
  home: { de: '/de/', en: '/en/', es: '/es/' },
  'basel-stadt': { de: '/de/basel-stadt', en: '/en/basel-stadt', es: '/es/basel-stadt' },
  'basel-landschaft': { de: '/de/basel-landschaft', en: '/en/basel-landschaft', es: '/es/basel-landschaft' },
  faq: { de: '/de/faq', en: '/en/faq', es: '/es/faq' },
  'so-funktioniert-es': { de: '/de/so-funktioniert-es', en: '/en/so-funktioniert-es', es: '/es/so-funktioniert-es' },
  kontakt: { de: '/de/kontakt', en: '/en/kontakt', es: '/es/kontakt' },
  antrag: { de: '/de/antrag', en: '/en/antrag', es: '/es/antrag' },
  danke: { de: '/de/danke', en: '/en/danke', es: '/es/danke' },
};

export function getLocalizedUrls(translationKey) {
  const entry = PATHS[translationKey];
  if (!entry) return null;
  return {
    de: `${BASE}${entry.de}`,
    en: `${BASE}${entry.en}`,
    es: `${BASE}${entry.es}`,
  };
}

export function canonicalFor(translationKey, locale, fallbackPath) {
  const entry = PATHS[translationKey];
  if (entry) return `${BASE}${entry[locale]}`;
  return `${BASE}${fallbackPath}`;
}
