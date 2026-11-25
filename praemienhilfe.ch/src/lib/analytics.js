// GA4 lead events for praemien-hilfe.ch.
//
// The measurement ID is build-time config (PUBLIC_GA4_ID). Consent Mode v2
// stays denied until the existing HubSpot banner grants analytics. Events
// carry only the allowlisted fields below — never name, email, phone, or
// message text.

export const SITE = 'praemien';
export const PENDING_LEAD_KEY = 'phPendingGenerateLead';
export const LEAD_MAX_AGE_MS = 30 * 60 * 1000;

const LEAD_TYPES = ['contact', 'comparator', 'cashback', 'subsidy_application', 'callback'];
const LANGUAGES = ['de', 'en', 'es'];
const GENERATE_LEAD_KEYS = ['form_id', 'site', 'lead_type', 'page_path', 'language'];
const PII_QUERY = /email|e-mail|name|phone|tel|message|vorname|nachname|firstname|lastname/i;

export function normalizeGa4Id(value) {
  const id = String(value ?? '').trim();
  if (!/^G-[A-Z0-9]+$/.test(id)) return '';
  if (/^G-X+$/.test(id)) return '';
  return id;
}

function looksLikePii(value) {
  if (value.includes('@')) return true;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8;
}

export function buildGenerateLeadEvent(input) {
  if (!input || typeof input !== 'object') return null;
  const event = {};
  for (const key of GENERATE_LEAD_KEYS) {
    const value = input[key];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 200 || looksLikePii(trimmed)) return null;
    event[key] = trimmed;
  }
  if (event.site !== SITE) return null;
  if (!LEAD_TYPES.includes(event.lead_type)) return null;
  if (!LANGUAGES.includes(event.language)) return null;
  if (!event.page_path.startsWith('/') || event.page_path.includes('?')) return null;
  if (!/^[a-z0-9_-]{1,64}$/.test(event.form_id)) return null;
  return event;
}

// Click, validation failure, and a non-OK response never produce a lead.
// A confirmed success still waits for analytics consent and a real GA4 id.
export function decideGenerateLead({ phase, ok, consent, ga4Id, input }) {
  if (phase !== 'success' || ok !== true) return null;
  if (consent !== true || !normalizeGa4Id(ga4Id)) return null;
  return buildGenerateLeadEvent(input);
}

export function stashPendingGenerateLead(input, storage = typeof sessionStorage !== 'undefined' ? sessionStorage : null) {
  const event = buildGenerateLeadEvent({ ...input, site: SITE });
  if (!event || !storage) return false;
  storage.setItem(
    PENDING_LEAD_KEY,
    JSON.stringify({ ...event, stashedAt: Date.now() })
  );
  return true;
}

export function takePendingGenerateLead({ consent, ga4Id, now = Date.now() }, storage) {
  if (!storage) return { action: 'none' };
  const raw = storage.getItem(PENDING_LEAD_KEY);
  if (!raw) return { action: 'none' };
  let pending;
  try {
    pending = JSON.parse(raw);
  } catch {
    storage.removeItem(PENDING_LEAD_KEY);
    return { action: 'drop' };
  }
  if (!pending || typeof pending.stashedAt !== 'number' || now - pending.stashedAt > LEAD_MAX_AGE_MS) {
    storage.removeItem(PENDING_LEAD_KEY);
    return { action: 'drop' };
  }
  if (!normalizeGa4Id(ga4Id)) {
    storage.removeItem(PENDING_LEAD_KEY);
    return { action: 'drop' };
  }
  if (consent !== true) return { action: 'wait' };
  const event = buildGenerateLeadEvent(pending);
  storage.removeItem(PENDING_LEAD_KEY);
  if (!event) return { action: 'drop' };
  return { action: 'send', event };
}

export function flushPendingGenerateLead(win = typeof window !== 'undefined' ? window : undefined) {
  if (!win?.sessionStorage) return () => {};
  const storage = win.sessionStorage;
  let settled = false;
  const attempt = () => {
    if (settled) return true;
    const decision = takePendingGenerateLead(
      {
        consent: win.__PH_ANALYTICS_CONSENT === 'granted',
        ga4Id: win.__PH_GA4_ID,
        now: Date.now(),
      },
      storage
    );
    if (decision.action === 'wait') return false;
    settled = true;
    if (decision.action === 'send' && typeof win.gtag === 'function') {
      win.gtag('event', 'generate_lead', decision.event);
    }
    return true;
  };
  if (!attempt()) {
    const onConsent = () => {
      if (attempt()) win.removeEventListener('ph-analytics-consent', onConsent);
    };
    win.addEventListener('ph-analytics-consent', onConsent);
    return () => win.removeEventListener('ph-analytics-consent', onConsent);
  }
  return () => {};
}

function isCalHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/\.$/, '');
  return host === 'cal.com' || host.endsWith('.cal.com');
}

export function isCalLink(raw) {
  try {
    return isCalHost(new URL(raw, 'https://praemien-hilfe.ch').hostname);
  } catch {
    return false;
  }
}

export function safeCalUrl(raw) {
  try {
    const url = new URL(raw, 'https://praemien-hilfe.ch');
    if (!isCalHost(url.hostname)) return '';
    if (url.username || url.password) return '';
    for (const key of [...url.searchParams.keys()]) {
      if (PII_QUERY.test(key)) url.searchParams.delete(key);
    }
    url.hash = '';
    return url.toString().slice(0, 500);
  } catch {
    return '';
  }
}

export function pageNameFromPath(pathname) {
  const parts = String(pathname || '').split('/').filter(Boolean);
  if (parts.length === 0) return 'home';
  if (parts.length === 1 && LANGUAGES.includes(parts[0])) return 'home';
  return parts[parts.length - 1];
}

export function ctaLocation({ pathname, sectionId, explicit }) {
  const raw = String(explicit || '').trim();
  if (/^[a-z0-9_-]{1,80}$/.test(raw)) return raw;
  const page = pageNameFromPath(pathname).replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'page';
  const section = String(sectionId || '').trim().replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  const value = section ? `praemien-${page}-${section}` : `praemien-${page}`;
  return value.slice(0, 80);
}

export function calClickEvent(rawUrl, { consent, ga4Id, pathname, sectionId, explicit } = {}) {
  if (consent !== true || !normalizeGa4Id(ga4Id)) return null;
  const linkUrl = safeCalUrl(rawUrl);
  if (!linkUrl) return null;
  return {
    site: SITE,
    cta_location: ctaLocation({ pathname, sectionId, explicit }),
    link_url: linkUrl,
  };
}

// Optional Cal embed callback. praemien-hilfe.ch has no embed today; the
// helper stays consent-gated so a future bookingSuccessfulV2 hook cannot
// send a booking without analytics consent or a measurement ID.
export function bookCallCompleteEvent({ consent, ga4Id } = {}) {
  if (consent !== true || !normalizeGa4Id(ga4Id)) return null;
  return { site: SITE };
}

function calUrlFromClick(event) {
  const target = event?.target;
  if (!target || typeof target.closest !== 'function') return null;
  const node = target.closest('a[href], [data-cal-link]');
  if (!node) return null;
  const calLink = node.getAttribute?.('data-cal-link');
  if (calLink) return `https://cal.com/${String(calLink).replace(/^\/+/, '')}`;
  return node.href || node.getAttribute?.('href') || '';
}

export function installCalLinkTracking(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc?.documentElement || doc.documentElement.dataset.phCalTracking === '1') return;
  doc.documentElement.dataset.phCalTracking = '1';
  doc.addEventListener('click', (event) => {
    const rawUrl = calUrlFromClick(event);
    if (!rawUrl || !isCalLink(rawUrl)) return;
    const node = event.target.closest('a[href], [data-cal-link]');
    const section = node?.closest?.('section[id]')?.id || '';
    const params = calClickEvent(rawUrl, {
      consent: doc.defaultView?.__PH_ANALYTICS_CONSENT === 'granted',
      ga4Id: doc.defaultView?.__PH_GA4_ID,
      pathname: doc.defaultView?.location?.pathname || '',
      sectionId: section,
      explicit: node?.getAttribute?.('data-cta-location') || '',
    });
    if (!params) return;
    const gtag = doc.defaultView?.gtag;
    if (typeof gtag === 'function') gtag('event', 'book_call_click', params);
  });
}
