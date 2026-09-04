// src/pages/sitemap.xml.ts
import { deutschschweizCantons } from '../data/deutschschweiz.js';
import { getLocalizedUrls } from '../i18n/pageUrls.js';

export const prerender = true;

const BASE = 'https://praemienhilfe.ch';
const TRANSLATED_KEYS = [
  'home',
  'basel-stadt',
  'basel-landschaft',
  'faq',
  'so-funktioniert-es',
  'kontakt',
  'impressum',
  'datenschutz',
];

function urlEntry(loc: string, alternates?: { de: string; en: string; es: string }) {
  const links = alternates
    ? Object.entries(alternates)
        .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`)
        .concat(`<xhtml:link rel="alternate" hreflang="x-default" href="${alternates.de}" />`)
        .join('')
    : '';
  return `<url><loc>${loc}</loc>${links}</url>`;
}

export async function GET() {
  const translatedUrls = TRANSLATED_KEYS.map((key) => {
    const alt = getLocalizedUrls(key)!;
    return [urlEntry(alt.de, alt), urlEntry(alt.en, alt), urlEntry(alt.es, alt)].join('');
  }).join('');

  const genericCantonUrls = deutschschweizCantons
    .filter((c) => !c.active)
    .map((c) => {
      const alt = {
        de: `${BASE}/de/${c.slug}`,
        en: `${BASE}/en/${c.slug}`,
        es: `${BASE}/es/${c.slug}`,
      };
      return [urlEntry(alt.de, alt), urlEntry(alt.en, alt), urlEntry(alt.es, alt)].join('');
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${translatedUrls}${genericCantonUrls}
</urlset>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
