import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  LEAD_MAX_AGE_MS,
  PENDING_LEAD_KEY,
  bookCallCompleteEvent,
  buildGenerateLeadEvent,
  calClickEvent,
  decideGenerateLead,
  flushPendingGenerateLead,
  installCalLinkTracking,
  isCalLink,
  normalizeGa4Id,
  safeCalUrl,
  stashPendingGenerateLead,
  takePendingGenerateLead,
} from '../src/lib/analytics.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

const leadInput = {
  form_id: 'antrag',
  site: 'praemien',
  lead_type: 'subsidy_application',
  page_path: '/de/antrag',
  language: 'de',
};

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
    data,
  };
}

test('GA4 id is empty for blank, placeholder, and non-measurement values', () => {
  assert.equal(normalizeGa4Id(''), '');
  assert.equal(normalizeGa4Id(undefined), '');
  assert.equal(normalizeGa4Id('  '), '');
  assert.equal(normalizeGa4Id('G-XXXXXXXX'), '');
  assert.equal(normalizeGa4Id('GTM-KPB3KQXN'), '');
  assert.equal(normalizeGa4Id('AW-18005574565'), '');
  assert.equal(normalizeGa4Id('G-ABC1234'), 'G-ABC1234');
});

test('generate_lead is only produced for a successful submit with consent and an id', () => {
  const ready = { consent: true, ga4Id: 'G-ABC1234', input: leadInput };
  assert.equal(decideGenerateLead({ phase: 'click', ok: false, ...ready }), null);
  assert.equal(decideGenerateLead({ phase: 'click', ok: true, ...ready }), null);
  assert.equal(decideGenerateLead({ phase: 'success', ok: false, ...ready }), null);
  assert.equal(decideGenerateLead({ phase: 'success', ok: true, ...ready, consent: false }), null);
  assert.equal(decideGenerateLead({ phase: 'success', ok: true, ...ready, consent: undefined }), null);
  assert.equal(decideGenerateLead({ phase: 'success', ok: true, ...ready, ga4Id: '' }), null);
  assert.deepEqual(decideGenerateLead({ phase: 'success', ok: true, ...ready }), leadInput);
});

test('generate_lead params are allowlisted and reject personal data', () => {
  const stored = memoryStorage();
  assert.equal(
    stashPendingGenerateLead(
      {
        ...leadInput,
        email: 'person@example.com',
        firstName: 'Ada',
        phone: '+41760000000',
        message: 'call me',
      },
      stored
    ),
    true
  );
  const saved = JSON.parse(stored.getItem(PENDING_LEAD_KEY));
  assert.deepEqual(Object.keys(saved).sort(), ['form_id', 'language', 'lead_type', 'page_path', 'site', 'stashedAt']);
  assert.equal(JSON.stringify(saved).includes('person@example.com'), false);
  assert.equal(JSON.stringify(saved).includes('Ada'), false);
  assert.equal(buildGenerateLeadEvent({ ...leadInput, page_path: '/de/antrag?email=a@b.ch' }), null);
  assert.equal(buildGenerateLeadEvent({ ...leadInput, page_path: '/de/antrag', language: 'person@example.com' }), null);
  assert.equal(buildGenerateLeadEvent({ ...leadInput, lead_type: 'newsletter' }), null);
});

test('a pending lead is sent once consent and the measurement id are both present', () => {
  const storage = memoryStorage();
  stashPendingGenerateLead(leadInput, storage);
  assert.equal(takePendingGenerateLead({ consent: false, ga4Id: 'G-ABC1234' }, storage).action, 'wait');
  assert.ok(storage.getItem(PENDING_LEAD_KEY));
  assert.equal(takePendingGenerateLead({ consent: true, ga4Id: '' }, storage).action, 'drop');
  assert.equal(storage.getItem(PENDING_LEAD_KEY), null);

  stashPendingGenerateLead(leadInput, storage);
  const sent = takePendingGenerateLead({ consent: true, ga4Id: 'G-ABC1234' }, storage);
  assert.equal(sent.action, 'send');
  assert.deepEqual(sent.event, leadInput);
  assert.equal(storage.getItem(PENDING_LEAD_KEY), null);
  assert.equal(takePendingGenerateLead({ consent: true, ga4Id: 'G-ABC1234' }, storage).action, 'none');
});

test('a stale pending lead is dropped and never sent', () => {
  const storage = memoryStorage();
  storage.setItem(
    PENDING_LEAD_KEY,
    JSON.stringify({ ...leadInput, stashedAt: Date.now() - LEAD_MAX_AGE_MS - 1000 })
  );
  const decision = takePendingGenerateLead({ consent: true, ga4Id: 'G-ABC1234' }, storage);
  assert.equal(decision.action, 'drop');
  assert.equal(storage.getItem(PENDING_LEAD_KEY), null);
});

test('flush fires generate_lead only after the consent flag is granted', () => {
  const storage = memoryStorage();
  stashPendingGenerateLead(leadInput, storage);
  const calls = [];
  const listeners = {};
  const win = {
    sessionStorage: storage,
    __PH_GA4_ID: 'G-ABC1234',
    __PH_ANALYTICS_CONSENT: 'denied',
    gtag: (type, name, params) => calls.push({ type, name, params }),
    addEventListener: (name, fn) => {
      listeners[name] = fn;
    },
    removeEventListener: (name) => {
      delete listeners[name];
    },
  };
  flushPendingGenerateLead(win);
  assert.deepEqual(calls, []);
  assert.ok(storage.getItem(PENDING_LEAD_KEY));

  win.__PH_ANALYTICS_CONSENT = 'granted';
  listeners['ph-analytics-consent']();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'generate_lead');
  assert.deepEqual(calls[0].params, leadInput);
  assert.equal(calls[0].params.email, undefined);
  assert.equal(storage.getItem(PENDING_LEAD_KEY), null);
});

test('flush does not fire when the measurement id is empty', () => {
  const storage = memoryStorage();
  stashPendingGenerateLead(leadInput, storage);
  const calls = [];
  const win = {
    sessionStorage: storage,
    __PH_GA4_ID: '',
    __PH_ANALYTICS_CONSENT: 'granted',
    gtag: (...args) => calls.push(args),
    addEventListener() {},
    removeEventListener() {},
  };
  flushPendingGenerateLead(win);
  assert.deepEqual(calls, []);
  assert.equal(storage.getItem(PENDING_LEAD_KEY), null);
});

test('cal.com clicks are tracked only with consent, and personal query params are removed', () => {
  assert.equal(isCalLink('https://cal.com/evo/intro'), true);
  assert.equal(isCalLink('https://app.cal.com/evo/intro'), true);
  assert.equal(isCalLink('https://praemien-hilfe.ch/de/antrag'), false);
  assert.equal(isCalLink('/de/antrag'), false);

  const clean = safeCalUrl('https://cal.com/evo/intro?email=a@b.ch&name=Ada&utm_source=site');
  assert.equal(clean.includes('email'), false);
  assert.equal(clean.includes('Ada'), false);
  assert.match(clean, /^https:\/\/cal\.com\/evo\/intro\?utm_source=site$/);

  const blocked = { consent: false, ga4Id: 'G-ABC1234', pathname: '/de/', explicit: 'praemien-home' };
  assert.equal(calClickEvent('https://cal.com/evo/intro', blocked), null);
  assert.equal(calClickEvent('https://cal.com/evo/intro', { ...blocked, consent: true, ga4Id: '' }), null);
  assert.deepEqual(
    calClickEvent('https://cal.com/evo/intro?email=a@b.ch', {
      consent: true,
      ga4Id: 'G-ABC1234',
      pathname: '/de/',
      sectionId: 'pruefen',
    }),
    {
      site: 'praemien',
      cta_location: 'praemien-home-pruefen',
      link_url: 'https://cal.com/evo/intro',
    }
  );
  assert.equal(bookCallCompleteEvent({ consent: false, ga4Id: 'G-ABC1234' }), null);
  assert.deepEqual(bookCallCompleteEvent({ consent: true, ga4Id: 'G-ABC1234' }), { site: 'praemien' });
});

test('the cal click listener does not fire without consent and does not navigate-track other links', () => {
  const calls = [];
  const doc = fakeDocument({
    gtag: (type, name, params) => calls.push({ type, name, params }),
    __PH_ANALYTICS_CONSENT: 'denied',
    __PH_GA4_ID: 'G-ABC1234',
    pathname: '/de/',
  });
  installCalLinkTracking(doc);
  doc.dispatchClick({ href: 'https://cal.com/evo/intro', cta: 'praemien-home' });
  doc.defaultView.__PH_ANALYTICS_CONSENT = 'granted';
  doc.dispatchClick({ href: 'https://praemien-hilfe.ch/de/antrag' });
  doc.dispatchClick({ href: 'https://cal.com/evo/intro?phone=41760000000', cta: 'praemien-home' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'book_call_click');
  assert.equal(calls[0].params.cta_location, 'praemien-home');
  assert.equal(calls[0].params.link_url.includes('phone'), false);
  assert.equal(calls[0].params.link_url.includes('4176'), false);
});

test('the antrag success path stashes a lead only after a confirmed response', () => {
  const funnel = read('src/components/AntragFunnel.jsx');
  const click = funnel.indexOf("track('antrag_form_submit'");
  const fetchAt = funnel.indexOf("fetch('/.netlify/functions/lead-to-twenty'");
  const ok = funnel.indexOf("if (!res.ok) throw new Error('submit failed')");
  const stash = funnel.indexOf('stashPendingGenerateLead(');
  assert.ok(click !== -1 && click < fetchAt);
  assert.ok(ok !== -1 && ok < stash);
  assert.equal(funnel.includes('generate_lead'), false);
  assert.equal(funnel.includes("track('antrag_conversion'"), true);

  const thankYou = read('src/components/DankeSummary.jsx');
  assert.match(thankYou, /flushPendingGenerateLead\(/);
  assert.equal(thankYou.includes('generate_lead'), false);
});

test('the layout keeps Consent Mode denied, the Ads tag, and GTM, and omits GA4 when the id is empty', () => {
  const layout = read('src/layouts/Base.astro');
  for (const key of ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization']) {
    assert.match(layout, new RegExp(`${key}: 'denied'`));
  }
  assert.match(layout, /normalizeGa4Id\(import\.meta\.env\.PUBLIC_GA4_ID\)/);
  assert.match(layout, /if \(ga4Id\) gtag\('config', ga4Id\)/);
  assert.match(layout, /window\.__PH_GA4_ID = ga4Id/);
  assert.match(layout, /window\.__PH_ANALYTICS_CONSENT = analytics \? 'granted' : 'denied'/);
  assert.match(layout, /GTM-KPB3KQXN/);
  assert.match(layout, /AW-18005574565/);
  assert.match(layout, /installCalLinkTracking\(/);
  assert.equal(layout.includes('G-WCNB8PMS29'), false);
  assert.equal(/G-[A-Z0-9]{4,}/.test(layout), false);
  assert.equal(layout.includes("gtag('event', 'form_submit'"), false);
});

test('visitor-facing source has no cal.com link yet', () => {
  const files = [
    'src/layouts/Base.astro',
    'src/components/AntragFunnel.jsx',
    'src/components/Header.astro',
    'src/components/Footer.astro',
    'src/components/Hero.astro',
    'src/pages/[lang]/kontakt.astro',
  ];
  for (const file of files) {
    assert.equal(read(file).includes('cal.com'), false, file);
  }
});

function fakeDocument({ gtag, __PH_ANALYTICS_CONSENT, __PH_GA4_ID, pathname }) {
  const listeners = [];
  const doc = {
    documentElement: { dataset: {} },
    defaultView: {
      gtag,
      __PH_ANALYTICS_CONSENT,
      __PH_GA4_ID,
      location: { pathname },
    },
    addEventListener: (type, fn) => listeners.push(fn),
    dispatchClick({ href, cta, calLink }) {
      const node = {
        href,
        attributes: {},
        getAttribute: (name) => (name === 'data-cta-location' ? cta || '' : name === 'data-cal-link' ? calLink || null : href),
        closest: () => null,
      };
      const event = {
        target: {
          closest: (selector) => (selector.includes('data-cal-link') || selector.includes('a[href]') ? node : null),
        },
      };
      for (const fn of listeners) fn(event);
    },
  };
  return doc;
}
