// src/i18n/pageUrls.js
// Maps a stable per-page key to its path under each locale, for hreflang.
// German-only pages (not in this map) get no EN/ES hreflang alternates.
import { deutschschweizCantons } from '../data/deutschschweiz.js';

const BASE = 'https://praemien-hilfe.ch';

const PATHS = {
  home: { de: '/de/', en: '/en/', es: '/es/' },
  'basel-stadt': { de: '/de/basel-stadt', en: '/en/basel-stadt', es: '/es/basel-stadt' },
  'basel-landschaft': { de: '/de/basel-landschaft', en: '/en/basel-landschaft', es: '/es/basel-landschaft' },
  faq: { de: '/de/faq', en: '/en/faq', es: '/es/faq' },
  'so-funktioniert-es': { de: '/de/so-funktioniert-es', en: '/en/so-funktioniert-es', es: '/es/so-funktioniert-es' },
  kontakt: { de: '/de/kontakt', en: '/en/kontakt', es: '/es/kontakt' },
  antrag: { de: '/de/antrag', en: '/en/antrag', es: '/es/antrag' },
  impressum: { de: '/de/impressum', en: '/en/impressum', es: '/es/impressum' },
  datenschutz: { de: '/de/datenschutz', en: '/en/datenschutz', es: '/es/datenschutz' },
};

// The generic canton landing pages (src/pages/[lang]/[canton].astro) are
// rendered for every Deutschschweiz canton without a bespoke page, in all
// three locales (see that file's getStaticPaths). Register each slug here
// too so those pages get correct <link rel="alternate" hreflang> tags via
// canonicalFor/getLocalizedUrls, matching what sitemap.xml.ts already emits
// for these same URLs.
for (const c of deutschschweizCantons) {
  if (c.active) continue; // basel-stadt/basel-landschaft have bespoke entries above
  PATHS[c.slug] = { de: `/de/${c.slug}`, en: `/en/${c.slug}`, es: `/es/${c.slug}` };
}

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
