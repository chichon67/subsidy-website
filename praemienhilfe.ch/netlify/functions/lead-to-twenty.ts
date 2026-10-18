// netlify/functions/lead-to-twenty.ts
// Lead intake for the /antrag funnel → Twenty CRM, then HubSpot.
//
// Twenty (TWENTY_CRM_CONTEXT.md §5): find/create person → create lead (or, for
// a same-day repeat by the same email, reuse it) → note with all raw answers →
// CALL task. HubSpot: the unchanged contact + note write from src/lib/hubspot.js.
//
// The two writes are independent: a failure in one never skips the other. The
// browser gets 200 (thank-you page + Google Ads conversion) if at least one
// succeeded. Whenever Twenty fails, the full submission also goes to the
// Netlify Forms "lead-fallback" form so it can be re-entered in Twenty.
//
// nLPD: never log request bodies, CRM responses, emails, phones or names.
// Logs carry only the failing step and HTTP status.
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { sendLeadToHubSpot, hubspotErrorStep } from '../../src/lib/hubspot.js';

const MAX_BODY_BYTES = 20_000;
const MAX_FIELD_LENGTH = 500;
const REQUEST_TIMEOUT_MS = 5_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX = 5;
const MIN_FILL_TIME_MS = 3_000;
const ORIGIN_CAMPAIGN = 'IPV_2026';
const PIPELINE = 'PRAEMIENVERBILLIGUNG';
const TIME_ZONE = 'Europe/Zurich';
const BUSINESS_START_MIN = 8 * 60;
const BUSINESS_END_MIN = 18 * 60;

const CANTON_CODES: Record<string, string> = {
  aargau: 'AG', 'appenzell ausserrhoden': 'AR', 'appenzell innerrhoden': 'AI',
  'basel-landschaft': 'BL', 'basel-stadt': 'BS', bern: 'BE', freiburg: 'FR', fribourg: 'FR',
  genf: 'GE', geneve: 'GE', glarus: 'GL', graubunden: 'GR', jura: 'JU', luzern: 'LU',
  neuenburg: 'NE', neuchatel: 'NE', nidwalden: 'NW', obwalden: 'OW', schaffhausen: 'SH',
  schwyz: 'SZ', solothurn: 'SO', 'st. gallen': 'SG', thurgau: 'TG', tessin: 'TI', ticino: 'TI',
  uri: 'UR', wallis: 'VS', valais: 'VS', waadt: 'VD', vaud: 'VD', zug: 'ZG', zurich: 'ZH',
};

// Twenty's preferredLanguage has no ES option — Spanish-speaking visitors are
// handled in English.
const LANGUAGE_CODES: Record<string, string> = { de: 'DE', en: 'EN', es: 'EN', fr: 'FR', it: 'IT' };

const SOCIAL_SOURCES = new Set(['facebook', 'fb', 'instagram', 'ig', 'meta']);

const TEXT_FIELDS = [
  'firstName', 'lastName', 'email', 'phone', 'canton', 'situation', 'household', 'children',
  'premium', 'burden', 'currentSubsidy', 'income', 'lang', 'consentText', 'consentAt',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'pageUrl', 'landingPage', 'referrer',
] as const;

type TextField = (typeof TEXT_FIELDS)[number];
type Submission = Record<TextField, string> & { consent: boolean };

type TwentyRecord = Record<string, any> & { id: string };

interface Env {
  url: string;
  apiKey: string;
  assigneeId: string;
}

class TwentyError extends Error {
  constructor(readonly step: string, readonly status: number) {
    super(`${step} failed (HTTP ${status})`);
  }
}

// ---------------------------------------------------------------- spam guard

// Best effort only: each warm function instance keeps its own counter.
const recentByIp = new Map<string, number[]>();

function isRateLimited(ip: string, now: number): boolean {
  const recent = (recentByIp.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  recentByIp.set(ip, recent);
  if (recentByIp.size > 5_000) recentByIp.clear();
  return recent.length > RATE_LIMIT_MAX;
}

function looksLikeBot(body: Record<string, unknown>, now: number): boolean {
  if (typeof body.website === 'string' && body.website.trim() !== '') return true;
  const startedAt = Number(body.startedAt);
  return Number.isFinite(startedAt) && startedAt > 0 && now - startedAt < MIN_FILL_TIME_MS;
}

// ---------------------------------------------------------------- validation

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : '';
}

function parseSubmission(body: Record<string, unknown>): { data: Submission; missing: string[] } {
  const data = Object.fromEntries(TEXT_FIELDS.map((k) => [k, str(body[k])])) as unknown as Submission;
  data.email = data.email.toLowerCase();
  data.consent = body.consent === true;

  const missing: string[] = [];
  if (!data.firstName) missing.push('firstName');
  if (!data.lastName) missing.push('lastName');
  // Quotes, commas and parentheses would break Twenty's REST filter syntax.
  if (!/^[^\s@"',()]+@[^\s@"',()]+\.[^\s@"',()]+$/.test(data.email)) missing.push('email');
  if (!parsePhoneNumberFromString(data.phone)?.isValid()) missing.push('phone');
  if (!data.canton) missing.push('canton');
  if (!data.consent) missing.push('consent');
  return { data, missing };
}

// ---------------------------------------------------------------- mapping

function cantonCode(name: string): string | undefined {
  const key = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return CANTON_CODES[key] || (/^[A-Z]{2}$/.test(name) ? name : undefined);
}

function leadSource(d: Submission): string {
  const utmSource = d.utm_source.toLowerCase();
  if (d.gclid || d.gbraid || d.wbraid || utmSource === 'google') return 'GOOGLE_ADS';
  if (d.fbclid || SOCIAL_SOURCES.has(utmSource)) return 'SOCIAL_MEDIA';
  return 'WEBSITE';
}

function twentyPhone(e164: string) {
  const parsed = parsePhoneNumberFromString(e164)!;
  return {
    primaryPhoneNumber: String(parsed.nationalNumber),
    primaryPhoneCallingCode: `+${parsed.countryCallingCode}`,
    primaryPhoneCountryCode: parsed.country || '',
  };
}

function lastNineDigits(value: string): string {
  return value.replace(/\D/g, '').slice(-9);
}

// ---------------------------------------------------------------- time helpers

function zurichParts(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, Number(p.value)])
  );
  return { year: parts.year, month: parts.month, day: parts.day, hour: parts.hour, minute: parts.minute, second: parts.second };
}

// Convert a Zurich wall-clock time to a UTC Date.
function zurichToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const p = zurichParts(new Date(guess));
  const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - guess;
  return new Date(guess - offset);
}

function startOfZurichDay(now: Date): Date {
  const p = zurichParts(now);
  return zurichToUtc(p.year, p.month, p.day, 0, 0);
}

// now + 1 business hour (Mon–Fri 08:00–18:00 Zurich; public holidays ignored).
function dueInOneBusinessHour(now: Date): Date {
  const p = zurichParts(now);
  const weekday = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
  const isWorkday = weekday >= 1 && weekday <= 5;
  const minuteOfDay = p.hour * 60 + p.minute;
  let needed = 60;

  if (isWorkday && minuteOfDay >= BUSINESS_START_MIN && minuteOfDay < BUSINESS_END_MIN) {
    const available = BUSINESS_END_MIN - minuteOfDay;
    if (available >= needed) return new Date(now.getTime() + needed * 60_000);
    needed -= available;
  } else if (isWorkday && minuteOfDay < BUSINESS_START_MIN) {
    return zurichToUtc(p.year, p.month, p.day, 8, needed);
  }

  let offsetDays = 1;
  for (;;) {
    const next = new Date(Date.UTC(p.year, p.month - 1, p.day + offsetDays));
    const day = next.getUTCDay();
    if (day >= 1 && day <= 5) {
      return zurichToUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 8, needed);
    }
    offsetDays += 1;
  }
}

// ---------------------------------------------------------------- Twenty REST

async function twenty(env: Env, step: string, method: string, path: string, body?: unknown): Promise<any> {
  let res: Response;
  try {
    res = await fetch(`${env.url}/rest/${path}`, {
      method,
      headers: { Authorization: `Bearer ${env.apiKey}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new TwentyError(step, 0);
  }
  if (!res.ok) throw new TwentyError(step, res.status);
  return res.json();
}

// Twenty wraps payloads as { data: { <operationName>: … } } — take the single value.
function unwrap(json: any): any {
  return Object.values(json?.data ?? {})[0];
}

// ilike without wildcards = case-insensitive equality; escape LIKE metacharacters.
function likeLiteral(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

async function findMany(env: Env, step: string, objects: string, filter: string, limit = 5): Promise<TwentyRecord[]> {
  const qs = new URLSearchParams({ filter, limit: String(limit) });
  return unwrap(await twenty(env, step, 'GET', `${objects}?${qs}`)) || [];
}

async function createOne(env: Env, step: string, objects: string, body: unknown): Promise<TwentyRecord> {
  return unwrap(await twenty(env, step, 'POST', objects, body));
}

async function findPerson(env: Env, d: Submission): Promise<TwentyRecord | undefined> {
  const byEmail = await findMany(env, 'find person by email', 'people', `emails.primaryEmail[ilike]:"${likeLiteral(d.email)}"`);
  const emailMatch = byEmail.find((p) => (p.emails?.primaryEmail || '').toLowerCase() === d.email);
  if (emailMatch) return emailMatch;

  const digits = lastNineDigits(d.phone);
  const byPhone = await findMany(env, 'find person by phone', 'people', `phones.primaryPhoneNumber[like]:"%${digits}"`);
  return byPhone.find((p) => lastNineDigits(p.phones?.primaryPhoneNumber || '') === digits);
}

async function upsertPerson(env: Env, d: Submission, now: Date): Promise<TwentyRecord> {
  const intake: Record<string, unknown> = {
    inquiryDate: now.toISOString(),
    originCampaign: ORIGIN_CAMPAIGN,
  };
  const canton = cantonCode(d.canton);
  if (canton) intake.canton = canton;
  const language = LANGUAGE_CODES[d.lang];
  if (language) intake.preferredLanguage = language;

  const existing = await findPerson(env, d);
  if (!existing) {
    return createOne(env, 'create person', 'people', {
      ...intake,
      name: { firstName: d.firstName, lastName: d.lastName },
      emails: { primaryEmail: d.email, additionalEmails: null },
      phones: { ...twentyPhone(d.phone), additionalPhones: null },
    });
  }

  // Never overwrite contact data a setter may have curated: fill blanks, and
  // keep a differing email/phone as an additional one.
  const update: Record<string, unknown> = { ...intake };
  if (!existing.name?.firstName && !existing.name?.lastName) {
    update.name = { firstName: d.firstName, lastName: d.lastName };
  }

  const emails = existing.emails || {};
  const knownEmails = [emails.primaryEmail, ...(emails.additionalEmails || [])].map((e: string) => (e || '').toLowerCase());
  if (!emails.primaryEmail) {
    update.emails = { ...emails, primaryEmail: d.email };
  } else if (!knownEmails.includes(d.email)) {
    update.emails = { ...emails, additionalEmails: [...(emails.additionalEmails || []), d.email] };
  }

  const phones = existing.phones || {};
  const digits = lastNineDigits(d.phone);
  const knownPhones = [phones.primaryPhoneNumber, ...(phones.additionalPhones || []).map((p: any) => p.number)].map((n: string) =>
    lastNineDigits(n || '')
  );
  if (!phones.primaryPhoneNumber) {
    update.phones = { ...phones, ...twentyPhone(d.phone) };
  } else if (!knownPhones.includes(digits) && (phones.additionalPhones || []).length === 0) {
    // Twenty allows max 2 numbers per person.
    const p = twentyPhone(d.phone);
    update.phones = {
      ...phones,
      additionalPhones: [{ number: p.primaryPhoneNumber, callingCode: p.primaryPhoneCallingCode, countryCode: p.primaryPhoneCountryCode }],
    };
  }

  const updated = unwrap(await twenty(env, 'update person', 'PATCH', `people/${existing.id}`, update));
  return updated || existing;
}

async function findSameDayLead(env: Env, d: Submission, now: Date): Promise<TwentyRecord | undefined> {
  const filter = `and(email.primaryEmail[ilike]:"${likeLiteral(d.email)}",createdAt[gte]:"${startOfZurichDay(now).toISOString()}")`;
  const leads = await findMany(env, 'find same-day lead', 'leads', filter);
  return leads.find((l) => (l.email?.primaryEmail || '').toLowerCase() === d.email);
}

function noteMarkdown(d: Submission, now: Date, duplicate: boolean): string {
  const v = (value: string) => value || '—';
  return [
    duplicate ? '**Erneute Anfrage am selben Tag** — kein neuer Lead angelegt.\n' : '',
    '### Antworten',
    `- Kanton: ${v(d.canton)}`,
    `- Situation: ${v(d.situation)}`,
    `- Haushalt: ${v(d.household)}`,
    `- Kinder: ${v(d.children)}`,
    `- Prämie/Monat: ${v(d.premium)}`,
    `- Belastung: ${v(d.burden)}`,
    `- Aktuelle Prämienverbilligung: ${v(d.currentSubsidy)}`,
    `- Einkommen: ${v(d.income)}`,
    `- Sprache Formular: ${v(d.lang)}`,
    '',
    '### Herkunft',
    `- utm_source: ${v(d.utm_source)}`,
    `- utm_medium: ${v(d.utm_medium)}`,
    `- utm_campaign: ${v(d.utm_campaign)}`,
    `- utm_content: ${v(d.utm_content)}`,
    `- utm_term: ${v(d.utm_term)}`,
    `- gclid: ${v(d.gclid || d.gbraid || d.wbraid)}`,
    `- fbclid: ${v(d.fbclid)}`,
    `- Formularseite: ${v(d.pageUrl)}`,
    `- Einstiegsseite: ${v(d.landingPage)}`,
    `- Referrer: ${v(d.referrer)}`,
    '',
    '### Einwilligung',
    `- Text: „${v(d.consentText)}"`,
    `- Angehakt (Browser): ${v(d.consentAt)}`,
    `- Empfangen (Server): ${now.toISOString()}`,
  ]
    .filter((line, i) => i > 0 || line)
    .join('\n');
}

async function linkTargets(env: Env, kind: 'note' | 'task', id: string, personId: string, leadId: string) {
  const objects = kind === 'note' ? 'noteTargets' : 'taskTargets';
  const key = kind === 'note' ? 'noteId' : 'taskId';
  await Promise.all([
    createOne(env, `link ${kind} to person`, objects, { [key]: id, targetPersonId: personId }),
    createOne(env, `link ${kind} to lead`, objects, { [key]: id, targetLeadId: leadId }),
  ]);
}

async function sendToTwenty(env: Env, d: Submission, now: Date) {
  const person = await upsertPerson(env, d, now);
  const fullName = `${d.firstName} ${d.lastName}`;

  const existingLead = await findSameDayLead(env, d, now);
  const lead =
    existingLead ||
    (await createOne(env, 'create lead', 'leads', {
      name: fullName,
      firstName: d.firstName,
      lastName: d.lastName,
      email: { primaryEmail: d.email, additionalEmails: null },
      phone: { ...twentyPhone(d.phone), additionalPhones: null },
      primaryContactId: person.id,
      status: 'NEW',
      pipeline: PIPELINE,
      source: leadSource(d),
    }));

  const note = await createOne(env, 'create note', 'notes', {
    title: existingLead ? `🔁 Erneute Web-Anfrage – ${fullName}` : `🌐 Web-Anfrage praemien-hilfe.ch – ${fullName}`,
    bodyV2: { markdown: noteMarkdown(d, now, Boolean(existingLead)) },
  });
  await linkTargets(env, 'note', note.id, person.id, lead.id);

  if (existingLead) return;

  const task = await createOne(env, 'create task', 'tasks', {
    title: `Call new lead – ${fullName}`,
    taskType: 'CALL',
    status: 'TODO',
    dueAt: dueInOneBusinessHour(now).toISOString(),
    ...(env.assigneeId ? { assigneeId: env.assigneeId } : {}),
  });
  await linkTargets(env, 'task', task.id, person.id, lead.id);
}

// ---------------------------------------------------------------- fallback

// Posts the full submission to the static Netlify Forms form defined in
// public/__forms.html. Netlify only registers that form on deploys with form
// detection enabled, so this is a no-op under `netlify dev`.
async function sendToFallback(d: Submission, now: Date, reason: string): Promise<boolean> {
  const siteUrl = process.env.DEPLOY_PRIME_URL || process.env.URL;
  if (!siteUrl) return false;
  const form = new URLSearchParams({
    'form-name': 'lead-fallback',
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
    phone: d.phone,
    canton: d.canton,
    reason,
    receivedAt: now.toISOString(),
    payload: JSON.stringify(d, null, 2),
  });
  try {
    const res = await fetch(`${siteUrl}/__forms.html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- handler

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export default async (req: Request, context: { ip?: string }) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'Payload too large' });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const now = new Date();
  // Silently accept bot submissions so they don't learn they were filtered.
  if (looksLikeBot(body, now.getTime())) return json(200, { ok: true });
  if (isRateLimited(context.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown', now.getTime())) {
    return json(429, { error: 'Too many requests' });
  }

  const { data, missing } = parseSubmission(body);
  if (missing.length > 0) return json(400, { error: 'Invalid fields', fields: missing });

  const twentyOk = await writeTwenty(data, now);
  const hubspotOk = await writeHubSpot(data);
  if (twentyOk || hubspotOk) return json(200, { ok: true });
  return json(502, { error: 'Lead could not be saved' });
};

async function writeTwenty(data: Submission, now: Date): Promise<boolean> {
  const env: Env = {
    url: (process.env.TWENTY_URL || '').replace(/\/+$/, ''),
    apiKey: process.env.TWENTY_API_KEY || '',
    assigneeId: process.env.TWENTY_ASSIGNEE_ID || '',
  };
  try {
    if (!env.url || !env.apiKey) throw new TwentyError('configuration (TWENTY_URL / TWENTY_API_KEY missing)', 0);
    await sendToTwenty(env, data, now);
    return true;
  } catch (err) {
    const reason = err instanceof TwentyError ? err.message : 'unexpected error';
    const saved = await sendToFallback(data, now, reason);
    console.error(`[lead-to-twenty] twenty: ${reason}; fallback ${saved ? 'stored' : 'FAILED'}`);
    return false;
  }
}

async function writeHubSpot(data: Submission): Promise<boolean> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  try {
    if (!token) throw new Error('HUBSPOT_ACCESS_TOKEN is not set');
    await sendLeadToHubSpot(token, data);
    return true;
  } catch (err) {
    console.error(`[lead-to-twenty] hubspot: ${hubspotErrorStep(err)}`);
    return false;
  }
}
