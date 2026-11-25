// First-party form attribution. Kept in sessionStorage for the current tab
// session and sent only when a visitor submits a form. No cookies.

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const CLICK_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid'];
const ALL_KEYS = [...UTM_KEYS, ...CLICK_KEYS];
const STORAGE_KEY = 'leadAttribution';
const MAX_LEN = 500;

export const ATTRIBUTION_STORAGE_KEY = STORAGE_KEY;

function clip(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_LEN) : '';
}

export function canonicalLeadSource(value) {
  const trimmed = clip(value);
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    lower === 'chatgpt.com' ||
    lower === 'www.chatgpt.com' ||
    lower === 'chat.openai.com' ||
    lower === 'www.chat.openai.com'
  ) {
    return 'chatgpt.com';
  }
  return trimmed;
}

function hostname(referrer) {
  const raw = clip(referrer);
  if (!raw) return '';
  try {
    return new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isGoogleHost(host) {
  return host === 'google.com' || host.endsWith('.google.com') || /(^|\.)google\.[a-z.]+$/.test(host);
}

function isLinkedinHost(host) {
  return host === 'linkedin.com' || host.endsWith('.linkedin.com') || host === 'lnkd.in';
}

export function deriveLeadSource({ utmSource = '', referrer = '' } = {}) {
  const fromUtm = canonicalLeadSource(utmSource);
  if (fromUtm) return fromUtm;
  const host = hostname(referrer);
  if (!host) return 'direct';
  if (host === 'chatgpt.com' || host === 'chat.openai.com') return 'chatgpt.com';
  if (isGoogleHost(host)) return 'google';
  if (isLinkedinHost(host)) return 'linkedin';
  return host;
}

function referrerWithoutQuery(referrer) {
  const raw = clip(referrer);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`.slice(0, MAX_LEN);
  } catch {
    return raw.split('?')[0];
  }
}

function blankRecord() {
  return {
    ...Object.fromEntries(ALL_KEYS.map((key) => [key, ''])),
    referrer: '',
    landingPage: '',
    leadSource: 'direct',
  };
}

function withLeadSource(record) {
  const base = { ...blankRecord(), ...record };
  for (const key of [...ALL_KEYS, 'referrer', 'landingPage']) {
    base[key] = clip(typeof base[key] === 'string' ? base[key] : '');
  }
  base.leadSource =
    canonicalLeadSource(typeof base.leadSource === 'string' ? base.leadSource : '') ||
    deriveLeadSource({ utmSource: base.utm_source, referrer: base.referrer });
  return base;
}

export function captureAttribution({ search = '', referrer = '', pageUrl = '', stored = null } = {}) {
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) return withLeadSource(stored);
  const params = new URLSearchParams(typeof search === 'string' ? search : '');
  const record = blankRecord();
  for (const key of ALL_KEYS) {
    const value = params.get(key);
    if (value) record[key] = clip(value);
  }
  record.referrer = referrerWithoutQuery(referrer);
  record.landingPage = clip(String(pageUrl || '').split('?')[0]);
  record.leadSource = deriveLeadSource({ utmSource: record.utm_source, referrer: record.referrer });
  return record;
}

function readStored(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function rememberFirstTouch(dom) {
  const target = dom || (typeof window !== 'undefined' ? window : null);
  if (!target?.sessionStorage || !target.location) return null;
  const stored = readStored(target.sessionStorage);
  if (stored) return withLeadSource(stored);
  const fresh = captureAttribution({
    search: target.location.search || '',
    referrer: target.document?.referrer || '',
    pageUrl: `${target.location.origin || ''}${target.location.pathname || '/'}`,
  });
  target.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

// Twenty Person.leadSource / Lead.source options. Forms never send IMPORTED.
export const LEAD_SOURCE_OPTIONS = [
  'GOOGLE_ADS',
  'SOCIAL_MEDIA',
  'REFERRAL',
  'PARTNER',
  'WEBSITE',
  'EVENT',
  'COLD_OUTREACH',
  'OTHER',
];

const PAID_MEDIUMS = new Set(['cpc', 'ppc', 'paid']);
const SOCIAL_UTM = new Set(['instagram', 'linkedin', 'facebook', 'tiktok', 'x', 'twitter']);
const SOCIAL_HOSTS = ['instagram.com', 'linkedin.com', 'lnkd.in', 'facebook.com', 'fb.com', 'tiktok.com', 'x.com', 'twitter.com', 't.co'];
const OWN_HOSTS = ['praemien-hilfe.ch', 'praemienhilfe.ch', 'xn--prmienhilfe-m8a.ch'];

function referrerHost(referrer) {
  const raw = clip(referrer);
  if (!raw) return '';
  try {
    return new URL(raw).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function hostIs(host, names) {
  return names.some((name) => host === name || host.endsWith(`.${name}`));
}

function isOrganicHost(host) {
  if (!host) return false;
  if (hostIs(host, ['bing.com', 'duckduckgo.com', 'ecosia.org', 'startpage.com', 'qwant.com', 'search.brave.com'])) return true;
  return /(^|\.)google\.[a-z.]+$/.test(host) || /(^|\.)yahoo\.[a-z.]+$/.test(host);
}

function isOwnHost(host, site) {
  const names = [...OWN_HOSTS];
  const siteHost = clip(site).toLowerCase().replace(/^www\./, '').split('/')[0];
  if (siteHost) names.push(siteHost);
  return hostIs(host, names);
}

export function parseLeadSourceMap(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const map = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof key !== 'string' || typeof value !== 'string') continue;
      const name = key.trim().toLowerCase();
      const option = value.trim();
      if (!name || option === 'IMPORTED' || !/^[A-Z][A-Z0-9_]{0,40}$/.test(option)) continue;
      map[name] = option;
    }
    return map;
  } catch {
    return {};
  }
}

function ruleLeadSource({ utmSource, utmMedium, utmCampaign, utmTerm, utmContent, referrer, gclid, site }) {
  const utm = clip(utmSource).toLowerCase();
  const medium = clip(utmMedium).toLowerCase();
  const host = referrerHost(referrer);
  const hasUtm = Boolean(utm || clip(utmMedium) || clip(utmCampaign) || clip(utmTerm) || clip(utmContent));
  const chatgpt = utm === 'chatgpt.com' || utm === 'chat.openai.com' || host === 'chatgpt.com' || host === 'chat.openai.com';

  if (clip(gclid) || (utm === 'google' && PAID_MEDIUMS.has(medium))) return 'GOOGLE_ADS';
  if (SOCIAL_UTM.has(utm) || hostIs(host, SOCIAL_HOSTS)) return 'SOCIAL_MEDIA';
  if (utm === 'chatgpt-ads' || chatgpt) return 'OTHER';
  if (!hasUtm && (!host || isOrganicHost(host) || isOwnHost(host, site))) return 'WEBSITE';
  if (utm === 'google' && (medium === 'organic' || medium === 'seo')) return 'WEBSITE';
  return 'OTHER';
}

function overrideKey({ utmSource, referrer, gclid }) {
  const utm = clip(utmSource).toLowerCase();
  if (utm) return utm;
  if (clip(gclid)) return 'gclid';
  const host = referrerHost(referrer);
  if (host === 'chatgpt.com' || host === 'chat.openai.com') return 'chatgpt.com';
  if (!host) return 'direct';
  return host;
}

// Always returns a SELECT value. LEAD_SOURCE_MAP may replace the rule for one
// source token. IMPORTED is never returned.
export function selectLeadSource(input = {}, overrides = {}) {
  const ruled = ruleLeadSource(input);
  const custom = overrides[overrideKey(input)];
  const chosen = custom || ruled;
  if (!chosen || chosen === 'IMPORTED') return ruled === 'IMPORTED' ? 'OTHER' : ruled;
  return chosen;
}

// Free-text home for the derived source plus site, form and page.
// A real utm_source or referrer is kept. An empty one receives the text.
export function personTextAttribution({ derived = '', utmSource = '', referrer = '', site = '', formId = '', pagePath = '' } = {}) {
  const detail = [clip(derived), clip(site) && `site=${clip(site)}`, clip(formId) && `form=${clip(formId)}`, clip(pagePath) && `page=${clip(pagePath)}`]
    .filter(Boolean)
    .join(' | ')
    .slice(0, MAX_LEN);
  return {
    utmSource: clip(utmSource) || detail,
    referrer: clip(referrer) || detail,
  };
}

export function hiddenLeadFields(attribution, context = {}) {
  const source = withLeadSource(attribution || {});
  return {
    leadSource: source.leadSource,
    site: clip(context.site),
    formId: clip(context.formId),
    pagePath: clip(context.pagePath),
    lang: clip(context.lang),
    utm_source: source.utm_source,
    utm_medium: source.utm_medium,
    utm_campaign: source.utm_campaign,
    utm_term: source.utm_term,
    utm_content: source.utm_content,
    referrer: source.referrer,
    landingPage: source.landingPage,
    gclid: source.gclid,
    gbraid: source.gbraid,
    wbraid: source.wbraid,
    fbclid: source.fbclid,
  };
}
