import assert from 'node:assert/strict';
import test from 'node:test';
import { getCanton } from '../src/data/cantons.js';
import { getNational } from '../src/data/national.js';
import { listIndexableEntries } from '../src/i18n/pageUrls.js';
import { buildLlmsFullTxt, buildLlmsTxt } from '../src/seo/llms.js';
import { AI_CRAWLERS, buildRobotsTxt } from '../src/seo/robots.js';
import { breadcrumbSchema, faqSchema, organizationSchema, websiteSchema } from '../src/seo/schema.js';
import { buildSitemapXml } from '../src/seo/sitemap.js';

const SITEMAP = 'https://praemien-hilfe.ch/sitemap.xml';

test('robots.txt allows the named AI crawlers and points at the absolute sitemap', () => {
  const body = buildRobotsTxt();
  for (const agent of AI_CRAWLERS) {
    assert.match(body, new RegExp(`User-agent: ${agent}\\nAllow: /`));
  }
  assert.match(body, /User-agent: \*\nAllow: \//);
  assert.match(body, new RegExp(`Sitemap: ${SITEMAP.replaceAll('.', '\\.')}`));
  assert.equal(body.includes('ß'), false);
});

test('sitemap lists every indexable de/en/es URL and no French URLs', () => {
  const xml = buildSitemapXml();
  const entries = listIndexableEntries();
  assert.ok(entries.length >= 20);

  for (const entry of entries) {
    for (const lang of ['de', 'en', 'es']) {
      assert.equal(xml.includes(`<loc>${entry[lang]}</loc>`), true, entry[lang]);
      assert.match(
        xml,
        new RegExp(`<loc>${entry[lang].replaceAll('/', '\\/')}<\\/loc><xhtml:link rel="alternate" hreflang="de"`)
      );
    }
    assert.match(xml, new RegExp(`hreflang="de" href="${entry.de.replaceAll('/', '\\/')}"`));
    assert.match(xml, new RegExp(`hreflang="en" href="${entry.en.replaceAll('/', '\\/')}"`));
    assert.match(xml, new RegExp(`hreflang="es" href="${entry.es.replaceAll('/', '\\/')}"`));
    assert.match(xml, new RegExp(`hreflang="x-default" href="${entry.de.replaceAll('/', '\\/')}"`));
  }

  assert.equal(xml.includes('/fr'), false);
  assert.equal(xml.includes('hreflang="fr"'), false);
  assert.equal(xml.includes('/danke'), false);
  assert.equal((xml.match(/<loc>/g) || []).length, entries.length * 3);
});

test('llms files are German, cite real pages, and do not invent a French site or savings promise', () => {
  const brief = buildLlmsTxt();
  const full = buildLlmsFullTxt();

  for (const body of [brief, full]) {
    assert.match(body, /^# praemien-hilfe\.ch/);
    assert.match(body, /EVO Partners GmbH/);
    assert.match(body, /FINMA/);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\//);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\/basel-stadt/);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\/basel-landschaft/);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\/faq/);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\/so-funktioniert-es/);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\/kontakt/);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\/antrag/);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\/impressum/);
    assert.match(body, /https:\/\/praemien-hilfe\.ch\/de\/datenschutz/);
    assert.equal(body.includes('ß'), false);
    assert.equal(body.includes('/fr/'), false);
    assert.equal(body.includes('https://praemien-hilfe.ch/fr'), false);
    assert.equal(/garantiert/i.test(body), false);
    assert.equal(body.includes('45\'000'), false);
    assert.equal(body.includes('90\'000'), false);
    assert.equal(body.includes('unverifiziert'), false);
  }

  const national = getNational('de');
  assert.match(full, new RegExp(escapeRegExp(national.nationalFaqs[0].q)));
  assert.match(full, new RegExp(escapeRegExp(national.nationalFaqs[0].a)));
  const baselStadt = getCanton('basel-stadt', 'de');
  assert.match(full, new RegExp(escapeRegExp(baselStadt.faqs[0].q)));
  assert.match(full, new RegExp(escapeRegExp(baselStadt.faqs[0].a)));
});

test('JSON-LD matches visible operator facts, website, breadcrumbs and every FAQ', () => {
  const org = organizationSchema();
  assert.equal(org['@type'], 'Organization');
  assert.equal(org.name, 'EVO Partners GmbH');
  assert.equal(org.email, 'office@evo-partners.ch');
  assert.equal(org.address.addressLocality, 'Zürich');
  assert.equal(org.address.postalCode, '8001');
  assert.equal(org.identifier.value, 'F01552602');

  const site = websiteSchema('Prämienverbilligung in der ganzen Schweiz beantragen.');
  assert.equal(site['@type'], 'WebSite');
  assert.equal(site.name, 'praemien-hilfe.ch');
  assert.equal(site.url, 'https://praemien-hilfe.ch');
  assert.equal(site.publisher['@id'], org['@id']);

  const crumbs = breadcrumbSchema([
    { name: 'Prämienverbilligung', url: 'https://praemien-hilfe.ch/de/' },
    { name: 'Häufige Fragen', url: 'https://praemien-hilfe.ch/de/faq' },
  ]);
  assert.equal(crumbs.itemListElement.length, 2);
  assert.equal(crumbs.itemListElement[1].name, 'Häufige Fragen');
  assert.equal(crumbs.itemListElement[1].position, 2);

  const faqs = getNational('de').nationalFaqs;
  const faq = faqSchema(faqs);
  assert.equal(faq.mainEntity.length, faqs.length);
  assert.deepEqual(
    faq.mainEntity.map((q) => ({ q: q.name, a: q.acceptedAnswer.text })),
    faqs.map((item) => ({ q: item.q, a: item.a }))
  );
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
