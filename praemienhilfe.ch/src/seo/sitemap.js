import { listIndexableEntries } from '../i18n/pageUrls.js';

const LANGS = ['de', 'en', 'es'];

function urlEntry(loc, alternates) {
  const links = LANGS.map(
    (lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${alternates[lang]}" />`
  )
    .concat(`<xhtml:link rel="alternate" hreflang="x-default" href="${alternates.de}" />`)
    .join('');
  return `<url><loc>${loc}</loc>${links}</url>`;
}

// Indexable pages only: de, en and es. French pages are not built, so they
// are omitted here and from hreflang. / and /danke are noindex and omitted.
export function buildSitemapXml() {
  const body = listIndexableEntries()
    .flatMap((entry) => LANGS.map((lang) => urlEntry(entry[lang], entry)))
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}
