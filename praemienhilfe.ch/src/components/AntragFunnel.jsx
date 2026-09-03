// src/components/AntragFunnel.jsx
import { useState, useEffect } from 'react';
import { SITUATIONS, situationList } from '../data/situations.js';
import { deutschschweizCantons } from '../data/deutschschweiz.js';
import PhoneField, { isValidPhoneNumber } from './PhoneField.jsx';
import PrivacyPolicyModal from './PrivacyPolicyModal.jsx';

const INCOME_OPTIONS = ["Unter CHF 2'000", "CHF 2'000 – 4'000", "CHF 4'000 – 6'000", "Über CHF 6'000"];

const STAGES = [
  { key: 'identifikation', label: 'Identifikation' },
  { key: 'ergaenzend', label: 'Ergänzende Informationen' },
  { key: 'situation', label: 'Ihre Situation' },
  { key: 'abgeschlossen', label: 'Abgeschlossen' },
];

function stageIndexForStep(step) {
  if (step === 'canton' || step === 'situation' || step === 'email') return 0;
  if (step === 'household' || step === 'income') return 1;
  if (step === 'contact') return 2;
  return 3;
}

function track(name, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

function rowClass(selected) {
  return [
    'w-full flex items-center justify-between gap-4 text-left cursor-pointer rounded-md text-[15.5px] font-medium text-dark transition-colors',
    selected ? 'bg-teal-light border-2 border-teal px-[17px] py-[14px]' : 'bg-white border border-[#D6DFE2] px-[18px] py-[15px]',
  ].join(' ');
}

export default function AntragFunnel() {
  const [situationSlug, setSituationSlug] = useState('');
  const [cantonName, setCantonName] = useState('');
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [household, setHousehold] = useState(1);
  const [income, setIncome] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState();
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [utmData, setUtmData] = useState({ utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('situation') || '';
    const c = params.get('canton') || '';
    const validSituation = SITUATIONS[s] ? s : '';
    setSituationSlug(validSituation);
    setCantonName(c);
    if (!c) setStep('canton');
    else if (!validSituation) setStep('situation');
    setUtmData({
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
    });
  }, []);

  const situationLabel = situationSlug ? SITUATIONS[situationSlug].label : 'Nicht angegeben';

  function chooseCanton(name) {
    setCantonName(name);
    track('antrag_step_canton_complete', { canton: name });
    const url = new URL(window.location.href);
    url.searchParams.set('canton', name);
    window.history.replaceState({}, '', url);
    setStep(situationSlug ? 'email' : 'situation');
  }

  function chooseSituation(slug) {
    setSituationSlug(slug);
    track('antrag_step_situation_complete', { situation: slug });
    const url = new URL(window.location.href);
    url.searchParams.set('situation', slug);
    window.history.replaceState({}, '', url);
    setStep('email');
  }

  function changeSituation(slug) {
    setSituationSlug(slug);
    track('antrag_situation_changed', { situation: slug });
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set('situation', slug);
    else url.searchParams.delete('situation');
    window.history.replaceState({}, '', url);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function submitEmail() {
    if (!isValidEmail(email)) {
      setErrors({ email: 'Bitte eine gültige E-Mail-Adresse angeben.' });
      return;
    }
    setErrors({});
    track('antrag_step_email_complete', { situation: situationSlug });
    setStep('household');
  }

  function submitHousehold() {
    track('antrag_step_household_complete', { household });
    setStep('income');
  }

  function chooseIncome(value) {
    setIncome(value);
    track('antrag_step_income_complete', { income: value });
    setStep('contact');
  }

  function validateContact() {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'Bitte Vorname angeben.';
    if (!lastName.trim()) errs.lastName = 'Bitte Nachname angeben.';
    if (!phone) errs.phone = 'Bitte Telefonnummer angeben.';
    else if (!isValidPhoneNumber(phone)) errs.phone = 'Bitte eine gültige Telefonnummer angeben.';
    if (!consent) errs.consent = 'Bitte akzeptieren Sie die Datenschutzbestimmungen.';
    return errs;
  }

  const contactReady = firstName.trim() && lastName.trim() && phone && isValidPhoneNumber(phone) && consent;

  async function submitContact() {
    const errs = validateContact();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    track('antrag_form_submit', { situation: situationSlug });
    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          canton: cantonName || 'Nicht angegeben',
          situation: situationSlug,
          household: `${household} ${household === 1 ? 'Person' : 'Personen'}`,
          income,
          ...utmData,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      track('antrag_conversion', { situation: situationSlug });
      // Stash a summary for the /danke page to read (sessionStorage instead
      // of query params so names/emails don't end up in the URL, browser
      // history, or referrer headers), then navigate there — a dedicated URL
      // (rather than an inline "done" step) so it can be used as a Google
      // Ads conversion-tracking destination.
      sessionStorage.setItem(
        'antragSummary',
        JSON.stringify({
          firstName,
          situationLabel,
          cantonName,
          household: `${household} ${household === 1 ? 'Person' : 'Personen'}`,
          income,
          email,
        })
      );
      window.location.href = '/danke';
      return;
    } catch (err) {
      setErrors({ submit: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.' });
    } finally {
      setLoading(false);
    }
  }

  const activeStage = stageIndexForStep(step);

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:flex-shrink-0 bg-white border-r border-[#E2E8EA] p-8">
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 no-underline">
          <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#0087A0"></rect>
            <rect x="14" y="14" width="24" height="24" rx="6" fill="#F0A500"></rect>
            <rect x="14" y="14" width="12" height="12" fill="#005F73"></rect>
          </svg>
          <span className="text-[17px] font-bold text-dark">
            prämienhilfe<span className="text-teal">.ch</span>
          </span>
        </a>

        <div className="mt-10 pt-6 border-t border-[#E2E8EA]">
          <div className="text-[13px] font-semibold text-dark">EVO Partners GmbH</div>
          <div className="mt-2.5 grid gap-1.5 text-[12.5px] text-[#6B7A80]">
            <div className="flex items-center gap-1.5">
              <span className="text-swiss-green">✓</span>
              <span>FINMA-anerkannter Broker</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-swiss-green">✓</span>
              <span>Situationsanalyse · Unverbindlich</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber">★</span>
              <span>4.8/5 von unseren Klienten bewertet</span>
            </div>
            <div className="mt-1">+1'000 Dossiers pro Jahr bearbeitet</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-start px-5 py-10 md:py-16">
        <div className="w-full max-w-[520px]">
          <div className="mb-6">
            <div className="flex items-center gap-1.5">
              {STAGES.map((s, i) => (
                <div
                  key={s.key}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${i <= activeStage ? 'bg-teal' : 'bg-[#DCE4E6]'}`}
                />
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[12.5px] font-medium text-[#6B7A80]">
              <span className="font-semibold text-dark">{STAGES[activeStage].label}</span>
              <span>
                Schritt {activeStage + 1} von {STAGES.length}
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8EA] rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal mb-6">
              <span>🔒</span>
              <span>Sicheres Formular</span>
            </div>

            {step === 'canton' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">In welchem Kanton wohnen Sie?</div>
                <select
                  value=""
                  onChange={(e) => e.target.value && chooseCanton(e.target.value)}
                  aria-label="Kanton wählen"
                  className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                >
                  <option value="">Kanton auswählen…</option>
                  {deutschschweizCantons.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step === 'situation' && (
              <div>
                {cantonName && (
                  <div className="inline-flex items-center gap-2 bg-teal-light text-teal-dark text-[12px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4">
                    <span>Ihr Kanton: {cantonName}</span>
                  </div>
                )}
                <div className="text-xl font-bold mb-4 tracking-tight">Was beschreibt Ihre Situation am besten?</div>
                <div className="grid gap-2.5">
                  {situationList.map((s) => (
                    <button key={s.slug} type="button" onClick={() => chooseSituation(s.slug)} className={rowClass(situationSlug === s.slug)}>
                      <span>{s.label}</span>
                      <span className="text-teal font-bold">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'email' && (
              <div>
                <div className="inline-flex items-center gap-2 bg-teal-light text-teal-dark text-[12px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full">
                  <span>Ihr Antrag:</span>
                  <select
                    value={situationSlug}
                    onChange={(e) => changeSituation(e.target.value)}
                    aria-label="Situation ändern"
                    className="bg-transparent text-teal-dark text-[12px] font-semibold uppercase tracking-wide border-0 outline-none underline cursor-pointer"
                  >
                    {!situationSlug && <option value="">Nicht angegeben</option>}
                    {situationList.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {cantonName && <span className="normal-case font-normal">· {cantonName}</span>}
                </div>
                <div className="text-xl font-bold mt-4 mb-4 tracking-tight">Zu Beginn benötigen wir Ihre E-Mail-Adresse</div>
                <input
                  type="email"
                  placeholder="nom@exemple.ch"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                />
                {errors.email && <div className="text-swiss-red text-xs mt-1">{errors.email}</div>}
                <p className="text-[12px] leading-relaxed text-[#8A979C] mt-3">
                  Mit dem Fortfahren akzeptieren Sie unsere{' '}
                  <button
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    className="text-teal underline font-medium cursor-pointer bg-transparent border-0 p-0"
                  >
                    Datenschutzrichtlinie
                  </button>{' '}
                  und die Verarbeitung Ihrer persönlichen Daten.
                </p>
                <button
                  type="button"
                  onClick={submitEmail}
                  disabled={!isValidEmail(email)}
                  className="mt-3.5 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Weiter →
                </button>
              </div>
            )}

            {step === 'household' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">Wie viele Personen leben in Ihrem Haushalt?</div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setHousehold((h) => Math.max(1, h - 1))}
                    className="w-11 h-11 rounded-md border border-[#D6DFE2] text-xl font-bold text-dark hover:border-teal"
                  >
                    −
                  </button>
                  <div className="min-w-[130px] text-center text-lg font-semibold">
                    {household} {household === 1 ? 'Person' : 'Personen'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setHousehold((h) => h + 1)}
                    className="w-11 h-11 rounded-md border border-[#D6DFE2] text-xl font-bold text-dark hover:border-teal"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={submitHousehold}
                  className="mt-6 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark"
                >
                  Weiter →
                </button>
              </div>
            )}

            {step === 'income' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">Wie hoch ist Ihr monatliches Haushaltseinkommen?</div>
                <div className="grid gap-2.5">
                  {INCOME_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => chooseIncome(opt)} className={rowClass(income === opt)}>
                      <span>{opt}</span>
                      <span className="text-teal font-bold">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'contact' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">Wie können wir Sie erreichen?</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Vorname"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                    />
                    {errors.firstName && <div className="text-swiss-red text-xs mt-1">{errors.firstName}</div>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Nachname"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                    />
                    {errors.lastName && <div className="text-swiss-red text-xs mt-1">{errors.lastName}</div>}
                  </div>
                </div>
                <div className="mt-2.5">
                  <PhoneField
                    value={phone}
                    onChange={setPhone}
                    error={errors.phone}
                  />
                </div>
                <label className="flex items-start gap-2.5 mt-4 text-[13px] leading-relaxed text-[#3D4A50] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-teal flex-shrink-0"
                  />
                  <span>
                    Ich akzeptiere die{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPrivacyOpen(true);
                      }}
                      className="text-teal underline font-medium cursor-pointer bg-transparent border-0 p-0"
                    >
                      Datenschutzbestimmungen
                    </button>{' '}
                    von EVO Partners GmbH und stimme der Verarbeitung meiner Daten zum Zweck der Beratung zu.
                  </span>
                </label>
                {errors.consent && <div className="text-swiss-red text-xs mt-1">{errors.consent}</div>}
                {errors.submit && <div className="text-swiss-red text-sm mt-3">{errors.submit}</div>}
                <button
                  type="button"
                  onClick={submitContact}
                  disabled={!contactReady || loading}
                  className="mt-4 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird gesendet…' : 'Antrag einreichen →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}
