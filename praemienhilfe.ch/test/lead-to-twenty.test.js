import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import handler from '../netlify/functions/lead-to-twenty.ts';

const TWENTY = 'https://twenty.example.com';
const KEY = 'test-key-do-not-log';
const EMAIL = 'ada.example@example.com';

const ENV_KEYS = [
  'TWENTY_API_URL',
  'TWENTY_URL',
  'TWENTY_API_KEY',
  'TWENTY_ASSIGNEE_ID',
  'HUBSPOT_ACCESS_TOKEN',
  'DEPLOY_PRIME_URL',
  'URL',
  'TWENTY_FIELD_LEAD_SOURCE',
  'TWENTY_FIELD_UTM_SOURCE',
  'TWENTY_FIELD_UTM_MEDIUM',
  'TWENTY_FIELD_UTM_CAMPAIGN',
  'TWENTY_FIELD_UTM_TERM',
  'TWENTY_FIELD_UTM_CONTENT',
  'TWENTY_FIELD_REFERRER',
  'TWENTY_FIELD_LANDING_PAGE',
  'TWENTY_FIELD_CONSENT_GIVEN',
  'TWENTY_FIELD_CONSENT_AT',
  'LEAD_SOURCE_MAP',
];

function validBody(overrides = {}) {
  return {
    firstName: 'Ada',
    lastName: 'Example',
    email: EMAIL,
    phone: '+41791234567',
    canton: 'Basel-Stadt',
    situation: 'angestellt',
    household: '1 Person',
    children: '',
    premium: 'Unter CHF 300',
    burden: 'Spürbar',
    currentSubsidy: 'Nein',
    income: 'CHF 2\'000 – 4\'000',
    lang: 'de',
    consent: true,
    consentText: 'Example consent text for tests.',
    consentAt: '2026-01-15T10:00:00.000Z',
    leadSource: 'chatgpt.com',
    site: 'praemien-hilfe.ch',
    formId: 'antrag',
    pagePath: '/de/antrag',
    utm_source: 'chatgpt.com',
    utm_medium: 'referral',
    utm_campaign: 'example-campaign',
    utm_term: 'example-term',
    utm_content: 'example-content',
    referrer: 'https://chatgpt.com/',
    landingPage: 'https://praemien-hilfe.ch/de/',
    pageUrl: 'https://praemien-hilfe.ch/de/antrag',
    startedAt: Date.now() - 60_000,
    website: '',
    ...overrides,
  };
}

function request(body) {
  return new Request('https://praemien-hilfe.ch/.netlify/functions/lead-to-twenty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('lead-to-twenty', { concurrency: 1 }, () => {
  let calls;
  let logs;
  let originalFetch;
  let originalLog;
  let originalError;

  beforeEach(() => {
    for (const key of ENV_KEYS) delete process.env[key];
    process.env.TWENTY_API_URL = TWENTY;
    process.env.TWENTY_API_KEY = KEY;
    process.env.HUBSPOT_ACCESS_TOKEN = 'hubspot-test-token';
    calls = [];
    logs = [];
    originalFetch = globalThis.fetch;
    originalLog = console.log;
    originalError = console.error;
    console.log = (...args) => {
      logs.push(args.map(String).join(' '));
    };
    console.error = (...args) => {
      logs.push(args.map(String).join(' '));
    };
    globalThis.fetch = async (url, options = {}) => {
      const target = String(url);
      const body = options.body ? JSON.parse(options.body) : null;
      calls.push({ url: target, method: options.method || 'GET', body, headers: options.headers });
      if (target.includes('hubapi.com')) return jsonResponse({ id: 'hs-contact-1' });
      if (target.includes('/rest/people?') || target.includes('/rest/leads?')) {
        return jsonResponse({ data: { records: [] } });
      }
      if (options.method === 'PATCH' && target.includes('/rest/people/')) {
        return jsonResponse({ data: { updatePerson: { id: 'person-1' } } });
      }
      return jsonResponse({ data: { record: { id: 'record-1' } } });
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    console.log = originalLog;
    console.error = originalError;
  });

  test('writes the person, attribution fields and a plain-text note', async () => {
    const response = await handler(request(validBody()), { ip: '203.0.113.10' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });

    const people = calls.filter((call) => call.method === 'POST' && call.url === `${TWENTY}/rest/people`);
    assert.equal(people.length, 1);
    assert.equal(people[0].body.emails.primaryEmail, EMAIL);
    assert.equal(people[0].headers.Authorization, `Bearer ${KEY}`);

    assert.equal(people[0].body.leadSource, undefined);
    const patches = calls.filter((call) => call.method === 'PATCH' && call.url.startsWith(`${TWENTY}/rest/people/`));
    const text = patches.find((call) => call.body.utmSource);
    const select = patches.find((call) => call.body.leadSource);
    assert.ok(text);
    assert.ok(select);
    assert.equal(text.body.leadSource, undefined);
    assert.equal(text.body.utmSource, 'chatgpt.com');
    assert.equal(text.body.utmMedium, 'referral');
    assert.equal(text.body.utmCampaign, 'example-campaign');
    assert.equal(text.body.utmTerm, 'example-term');
    assert.equal(text.body.utmContent, 'example-content');
    assert.equal(text.body.referrer, 'https://chatgpt.com/');
    assert.equal(text.body.landingPage, 'https://praemien-hilfe.ch/de/');
    assert.equal(text.body.consentGiven, true);
    assert.equal(text.body.consentAt, '2026-01-15T10:00:00.000Z');
    assert.equal(select.body.leadSource, 'OTHER');
    assert.equal(Object.keys(select.body).length, 1);

    const note = calls.find((call) => call.method === 'POST' && call.url === `${TWENTY}/rest/notes`);
    assert.ok(note);
    const markdown = note.body.bodyV2.markdown;
    assert.match(markdown, /chatgpt\.com/);
    assert.match(markdown, /Auswahl: OTHER/);
    assert.match(markdown, /example-campaign/);
    assert.match(markdown, /Example consent text/);
    assert.match(markdown, /2026-01-15T10:00:00.000Z/);
    assert.match(markdown, /antrag/);
    assert.match(markdown, /\/de\/antrag/);

    const hubspot = calls.filter((call) => call.url.includes('hubapi.com'));
    assert.ok(hubspot.length >= 1);
    assert.equal(calls.some((call) => call.url.includes('crm.evo-partners.ch')), false);
    assert.equal(logs.some((line) => line.includes(EMAIL) || line.includes(KEY) || line.includes('Ada')), false);
  });

  test('uses configured Person field names', async () => {
    process.env.TWENTY_FIELD_LEAD_SOURCE = 'quelle';
    process.env.TWENTY_FIELD_UTM_SOURCE = 'kampagneQuelle';
    const response = await handler(request(validBody()), { ip: '203.0.113.11' });
    assert.equal(response.status, 200);
    const patches = calls.filter((call) => call.method === 'PATCH' && call.url.includes('/rest/people/'));
    const text = patches.find((call) => call.body.kampagneQuelle);
    const select = patches.find((call) => call.body.quelle);
    assert.equal(text.body.kampagneQuelle, 'chatgpt.com');
    assert.equal(text.body.leadSource, undefined);
    assert.equal(text.body.quelle, undefined);
    assert.equal(select.body.quelle, 'OTHER');
    assert.equal(select.body.leadSource, undefined);
  });

  test('still accepts the visitor when Twenty is down', async () => {
    globalThis.fetch = async (url, options = {}) => {
      const target = String(url);
      calls.push({ url: target, method: options.method || 'GET' });
      if (target.startsWith(TWENTY)) throw new Error('connect ECONNREFUSED');
      if (target.includes('hubapi.com')) return jsonResponse({ message: 'down' }, 503);
      throw new Error(`unexpected host ${target}`);
    };

    const response = await handler(request(validBody()), { ip: '203.0.113.12' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    const twentyCalls = calls.filter((call) => call.url.startsWith(TWENTY));
    assert.equal(twentyCalls.length, 1);
    assert.ok(calls.some((call) => call.url.includes('hubapi.com')));
  });

  test('still accepts the visitor when Twenty is not configured', async () => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_URL;
    delete process.env.TWENTY_API_KEY;
    delete process.env.HUBSPOT_ACCESS_TOKEN;
    const response = await handler(request(validBody({ leadSource: 'direct' })), { ip: '203.0.113.13' });
    assert.equal(response.status, 200);
    assert.equal(calls.some((call) => call.url.includes('twenty') || call.url.includes('crm.evo-partners.ch')), false);
  });

  test('falls back to TWENTY_URL when TWENTY_API_URL is unset', async () => {
    delete process.env.TWENTY_API_URL;
    process.env.TWENTY_URL = 'https://legacy-twenty.example.com/';
    const response = await handler(request(validBody({ leadSource: 'direct', utm_source: '' })), { ip: '203.0.113.17' });
    assert.equal(response.status, 200);
    assert.ok(calls.some((call) => call.url.startsWith('https://legacy-twenty.example.com/rest/people')));
  });

  test('rejects a missing lead source', async () => {
    const response = await handler(request(validBody({ leadSource: '  ' })), { ip: '203.0.113.14' });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.ok(body.fields.includes('leadSource'));
    assert.equal(calls.length, 0);
  });

  test('rejects a missing consent', async () => {
    const response = await handler(request(validBody({ consent: false })), { ip: '203.0.113.15' });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.ok(body.fields.includes('consent'));
    assert.equal(calls.length, 0);
  });

  test('keeps the note when custom fields are rejected', async () => {
    globalThis.fetch = async (url, options = {}) => {
      const target = String(url);
      const body = options.body ? JSON.parse(options.body) : null;
      calls.push({ url: target, method: options.method || 'GET', body });
      if (target.includes('hubapi.com')) return jsonResponse({ id: 'hs-contact-1' });
      if (options.method === 'PATCH') return jsonResponse({ message: 'unknown field' }, 400);
      if (target.includes('/rest/people?') || target.includes('/rest/leads?')) {
        return jsonResponse({ data: { records: [] } });
      }
      return jsonResponse({ data: { record: { id: 'record-1' } } });
    };

    const response = await handler(request(validBody()), { ip: '203.0.113.16' });
    assert.equal(response.status, 200);
    const selectPatches = calls.filter((call) => call.method === 'PATCH' && call.body && call.body.leadSource);
    assert.equal(selectPatches.length, 1);
    assert.equal(selectPatches[0].body.leadSource, 'OTHER');
    assert.equal(calls.filter((call) => call.method === 'POST' && call.url === `${TWENTY}/rest/people`)[0].body.leadSource, undefined);
    assert.ok(calls.some((call) => call.method === 'POST' && call.url === `${TWENTY}/rest/notes`));
  });

  test('sends WEBSITE for a direct visit and keeps the free-text source', async () => {
    const response = await handler(
      request(
        validBody({
          leadSource: 'direct',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
          referrer: '',
          gclid: '',
        })
      ),
      { ip: '203.0.113.18' }
    );
    assert.equal(response.status, 200);
    const select = calls.find((call) => call.method === 'PATCH' && call.body && call.body.leadSource);
    const text = calls.find((call) => call.method === 'PATCH' && call.body && call.body.utmSource);
    assert.equal(select.body.leadSource, 'WEBSITE');
    assert.match(text.body.utmSource, /^direct \| site=praemien-hilfe\.ch \| form=antrag \| page=\/de\/antrag/);
    assert.equal(text.body.referrer, text.body.utmSource);
    assert.equal(calls.some((call) => JSON.stringify(call.body || {}).includes('IMPORTED')), false);
  });
});
