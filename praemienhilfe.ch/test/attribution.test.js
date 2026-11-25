import assert from 'node:assert/strict';
import test from 'node:test';
import {
  deriveLeadSource,
  hiddenLeadFields,
  parseLeadSourceMap,
  personTextAttribution,
  rememberFirstTouch,
  selectLeadSource,
} from '../src/lib/attribution.js';

function memoryDom({ search = '', referrer = '', pathname = '/de/', origin = 'https://praemien-hilfe.ch', storage = new Map() } = {}) {
  return {
    sessionStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, value),
    },
    location: { search, origin, pathname },
    document: { referrer },
    storage,
  };
}

test('deriveLeadSource uses utm_source when it is present', () => {
  assert.equal(
    deriveLeadSource({ utmSource: 'newsletter', referrer: 'https://www.google.com/search?q=ipv' }),
    'newsletter'
  );
});

test('deriveLeadSource maps chatgpt.com and chat.openai.com to chatgpt.com', () => {
  assert.equal(deriveLeadSource({ utmSource: 'chatgpt.com', referrer: '' }), 'chatgpt.com');
  assert.equal(deriveLeadSource({ utmSource: 'ChatGPT.com', referrer: '' }), 'chatgpt.com');
  assert.equal(deriveLeadSource({ utmSource: 'chat.openai.com', referrer: '' }), 'chatgpt.com');
  assert.equal(deriveLeadSource({ utmSource: '', referrer: 'https://chatgpt.com/c/example' }), 'chatgpt.com');
  assert.equal(deriveLeadSource({ utmSource: '', referrer: 'https://www.chat.openai.com/path' }), 'chatgpt.com');
});

test('deriveLeadSource maps a search or social referrer and direct traffic', () => {
  assert.equal(deriveLeadSource({ utmSource: '', referrer: 'https://www.google.ch/search?q=praemie' }), 'google');
  assert.equal(deriveLeadSource({ utmSource: '', referrer: 'https://www.linkedin.com/feed/' }), 'linkedin');
  assert.equal(deriveLeadSource({ utmSource: '', referrer: '' }), 'direct');
  assert.equal(deriveLeadSource({ utmSource: '  ', referrer: '   ' }), 'direct');
});

test('rememberFirstTouch keeps the first landing of the session', () => {
  const storage = new Map();
  const first = rememberFirstTouch(
    memoryDom({
      storage,
      search: '?utm_source=chatgpt.com&utm_medium=ai&utm_campaign=spring&utm_term=ipv&utm_content=ad',
      referrer: 'https://chatgpt.com/c/example?q=secret',
      pathname: '/de/',
    })
  );

  assert.equal(first.leadSource, 'chatgpt.com');
  assert.equal(first.utm_source, 'chatgpt.com');
  assert.equal(first.utm_medium, 'ai');
  assert.equal(first.utm_campaign, 'spring');
  assert.equal(first.utm_term, 'ipv');
  assert.equal(first.utm_content, 'ad');
  assert.equal(first.landingPage, 'https://praemien-hilfe.ch/de/');
  assert.equal(first.referrer.includes('?'), false);

  const second = rememberFirstTouch(
    memoryDom({
      storage,
      search: '?utm_source=newsletter',
      referrer: 'https://www.google.com/',
      pathname: '/de/antrag',
    })
  );

  assert.equal(second.leadSource, 'chatgpt.com');
  assert.equal(second.utm_source, 'chatgpt.com');
  assert.equal(second.landingPage, 'https://praemien-hilfe.ch/de/');
  assert.equal(second.utm_medium, 'ai');
});

test('hiddenLeadFields fills source, UTM, site, form, path and language', () => {
  const stored = rememberFirstTouch(
    memoryDom({
      search: '?utm_source=chatgpt.com&utm_medium=referral&utm_campaign=example&utm_term=term&utm_content=content',
      referrer: 'https://chatgpt.com/',
      pathname: '/en/',
    })
  );

  const fields = hiddenLeadFields(stored, {
    site: 'praemien-hilfe.ch',
    formId: 'antrag',
    pagePath: '/en/antrag',
    lang: 'en',
  });

  assert.deepEqual(fields, {
    leadSource: 'chatgpt.com',
    site: 'praemien-hilfe.ch',
    formId: 'antrag',
    pagePath: '/en/antrag',
    lang: 'en',
    utm_source: 'chatgpt.com',
    utm_medium: 'referral',
    utm_campaign: 'example',
    utm_term: 'term',
    utm_content: 'content',
    referrer: 'https://chatgpt.com/',
    landingPage: 'https://praemien-hilfe.ch/en/',
    gclid: '',
    gbraid: '',
    wbraid: '',
    fbclid: '',
  });
});

test('hiddenLeadFields uses direct when the session has no campaign or referrer', () => {
  const stored = rememberFirstTouch(memoryDom({ search: '', referrer: '', pathname: '/es/antrag' }));
  const fields = hiddenLeadFields(stored, {
    site: 'praemien-hilfe.ch',
    formId: 'antrag',
    pagePath: '/es/antrag',
    lang: 'es',
  });

  assert.equal(fields.leadSource, 'direct');
  assert.equal(fields.utm_source, '');
  assert.equal(fields.referrer, '');
  assert.equal(fields.lang, 'es');
  assert.equal(fields.formId, 'antrag');
});

test('person text fields keep a real UTM and referrer, and fill the gaps with source plus page context', () => {
  const filled = personTextAttribution({
    derived: 'chatgpt.com',
    utmSource: 'chatgpt.com',
    referrer: 'https://chatgpt.com/',
    site: 'praemien-hilfe.ch',
    formId: 'antrag',
    pagePath: '/de/antrag',
  });
  assert.equal(filled.utmSource, 'chatgpt.com');
  assert.equal(filled.referrer, 'https://chatgpt.com/');

  const gaps = personTextAttribution({
    derived: 'direct',
    utmSource: '',
    referrer: '',
    site: 'praemien-hilfe.ch',
    formId: 'antrag',
    pagePath: '/de/antrag',
  });
  assert.equal(gaps.utmSource, 'direct | site=praemien-hilfe.ch | form=antrag | page=/de/antrag');
  assert.equal(gaps.referrer, gaps.utmSource);
});

test('selectLeadSource covers every Twenty option branch and never sends IMPORTED', () => {
  const cases = [
    [{ gclid: 'example-gclid' }, 'GOOGLE_ADS'],
    [{ utmSource: 'google', utmMedium: 'cpc' }, 'GOOGLE_ADS'],
    [{ utmSource: 'google', utmMedium: 'ppc' }, 'GOOGLE_ADS'],
    [{ utmSource: 'Google', utmMedium: 'paid' }, 'GOOGLE_ADS'],
    [{ utmSource: 'instagram' }, 'SOCIAL_MEDIA'],
    [{ utmSource: 'linkedin' }, 'SOCIAL_MEDIA'],
    [{ utmSource: 'facebook' }, 'SOCIAL_MEDIA'],
    [{ utmSource: 'tiktok' }, 'SOCIAL_MEDIA'],
    [{ utmSource: 'x' }, 'SOCIAL_MEDIA'],
    [{ utmSource: 'twitter' }, 'SOCIAL_MEDIA'],
    [{ referrer: 'https://www.linkedin.com/feed/' }, 'SOCIAL_MEDIA'],
    [{ referrer: 'https://l.facebook.com/l.php' }, 'SOCIAL_MEDIA'],
    [{ referrer: 'https://www.instagram.com/' }, 'SOCIAL_MEDIA'],
    [{ referrer: 'https://www.tiktok.com/@example' }, 'SOCIAL_MEDIA'],
    [{ referrer: 'https://x.com/example' }, 'SOCIAL_MEDIA'],
    [{ referrer: 'https://twitter.com/example' }, 'SOCIAL_MEDIA'],
    [{ utmSource: 'chatgpt-ads' }, 'OTHER'],
    [{ utmSource: 'chatgpt.com' }, 'OTHER'],
    [{ utmSource: 'chat.openai.com' }, 'OTHER'],
    [{ referrer: 'https://chatgpt.com/c/example' }, 'OTHER'],
    [{ referrer: 'https://www.chat.openai.com/path' }, 'OTHER'],
    [{}, 'WEBSITE'],
    [{ referrer: 'https://www.google.ch/search?q=praemie' }, 'WEBSITE'],
    [{ utmSource: 'google', utmMedium: 'organic' }, 'WEBSITE'],
    [{ referrer: 'https://praemien-hilfe.ch/de/', site: 'praemien-hilfe.ch' }, 'WEBSITE'],
    [{ utmSource: 'newsletter' }, 'OTHER'],
    [{ referrer: 'https://news.example.com/story' }, 'OTHER'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(selectLeadSource(input), expected, JSON.stringify(input));
    assert.notEqual(selectLeadSource(input), 'IMPORTED');
  }

  const overridden = selectLeadSource(
    { utmSource: 'chatgpt.com' },
    parseLeadSourceMap('{"chatgpt.com":"EVENT","direct":"IMPORTED"}')
  );
  assert.equal(overridden, 'EVENT');
  assert.equal(selectLeadSource({}, parseLeadSourceMap('{"direct":"IMPORTED"}')), 'WEBSITE');
  assert.equal(selectLeadSource({ utmSource: 'chatgpt.com' }, parseLeadSourceMap('{')), 'OTHER');
  assert.equal(selectLeadSource({ utmSource: 'chatgpt-ads', gclid: 'click' }), 'GOOGLE_ADS');
});
