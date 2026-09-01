// src/components/SituationFunnel.jsx
import { useEffect, useState } from 'react';
import { situationList, SITUATIONS } from '../data/situations.js';

const INCOME_OPTIONS = ["Unter CHF 2'000", "CHF 2'000 – 4'000", "CHF 4'000 – 6'000", "Über CHF 6'000"];
const TOTAL_STEPS = 5;

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

export default function SituationFunnel() {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState('');
  const [email, setEmail] = useState('');
  const [household, setHousehold] = useState(1);
  const [income, setIncome] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [utmData, setUtmData] = useState({ utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmData({
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
    });
  }, []);

  useEffect(() => {
    window.startFunnel = (slug) => {
      if (SITUATIONS[slug]) {
        setSituation(slug);
        track('funnel_step_1_complete', { situation: slug });
        setStep(2);
      }
      const target = document.querySelector('#funnel');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    return () => {
      delete window.startFunnel;
    };
  }, []);

  function chooseSituation(slug) {
    setSituation(slug);
    track('funnel_step_1_complete', { situation: slug });
    setStep(2);
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
    track('funnel_step_2_complete', { email_provided: true });
    setStep(3);
  }

  function submitHousehold() {
    track('funnel_step_3_complete', { household });
    setStep(4);
  }

  function chooseIncome(value) {
    setIncome(value);
    track('funnel_step_4_complete', { income: value });
    setStep(5);
  }

  function validateContact() {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'Bitte Vorname angeben.';
    if (!lastName.trim()) errs.lastName = 'Bitte Nachname angeben.';
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone) errs.phone = 'Bitte Telefonnummer angeben.';
    else if (!/^(\+41|0041|0)\d{6,}$/.test(cleanPhone)) errs.phone = 'Bitte eine gültige Schweizer Telefonnummer angeben.';
    if (!consent) errs.consent = 'Bitte akzeptieren Sie die Datenschutzbestimmungen.';
    return errs;
  }

  async function handleSubmit() {
    const errs = validateContact();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    track('funnel_form_submit', { situation });
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
          canton: 'Basel-Stadt',
          situation,
          household: `${household} ${household === 1 ? 'Person' : 'Personen'}`,
          income,
          ...utmData,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      track('funnel_conversion', { situation });
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder rufen Sie uns unter +41 76 779 0449 an.' });
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep(1);
    setSituation('');
    setEmail('');
    setHousehold(1);
    setIncome('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setConsent(false);
    setErrors({});
    setSubmitted(false);
  }

  return (
    <div
      id="funnel"
      className="mt-8 bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7"
    >
      {!submitted && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`inline-block w-[9px] h-[9px] rounded-full transition-colors ${
                  i <= step ? 'bg-teal border border-teal' : 'bg-white border border-[#C3D5DA]'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-medium tracking-wider uppercase text-[#6B7A80]">
            Schritt {step} von {TOTAL_STEPS}
          </div>
        </div>
      )}

      {!submitted && step === 1 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Was beschreibt Ihre Situation am besten?</div>
          <div className="grid gap-2.5">
            {situationList.map((s) => (
              <button key={s.slug} type="button" onClick={() => chooseSituation(s.slug)} className={rowClass(situation === s.slug)}>
                <span>{s.label}</span>
                <span className="text-teal font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && step === 2 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie lautet Ihre E-Mail-Adresse?</div>
          <input
            type="email"
            placeholder="nom@exemple.ch"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
          />
          {errors.email && <div className="text-swiss-red text-xs mt-1">{errors.email}</div>}
          <button
            type="button"
            onClick={submitEmail}
            className="mt-3.5 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark"
          >
            Weiter →
          </button>
        </div>
      )}

      {!submitted && step === 3 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie viele Personen leben in Ihrem Haushalt?</div>
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

      {!submitted && step === 4 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie hoch ist Ihr monatliches Haushaltseinkommen?</div>
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

      {!submitted && step === 5 && (
        <div>
          <div className="text-lg font-bold mt-[18px] mb-1 tracking-tight text-[#2E6B29]">
            Gute Nachricht — Sie könnten Anspruch haben!
          </div>
          <div className="text-xl font-bold mt-3 mb-4 tracking-tight">Ihre Kontaktangaben</div>
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
            <input
              type="tel"
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
            />
            {errors.phone && <div className="text-swiss-red text-xs mt-1">{errors.phone}</div>}
          </div>
          <label className="flex items-start gap-2.5 mt-4 text-[13px] leading-relaxed text-[#3D4A50] cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-teal flex-shrink-0"
            />
            <span>
              Ich akzeptiere die Datenschutzbestimmungen von EVO Partners GmbH und stimme der Verarbeitung meiner
              Daten zum Zweck der Beratung zu.
            </span>
          </label>
          {errors.consent && <div className="text-swiss-red text-xs mt-1">{errors.consent}</div>}
          {errors.submit && <div className="text-swiss-red text-sm mt-3">{errors.submit}</div>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-3.5 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer tracking-tight hover:bg-teal-dark disabled:opacity-60"
          >
            {loading ? 'Wird gesendet…' : 'Antrag prüfen lassen →'}
          </button>
          <div className="mt-2.5 text-xs text-[#8A979C] text-center">Keine Verpflichtung. Diskret.</div>
        </div>
      )}

      {submitted && (
        <div className="pt-4 pb-1">
          <div className="text-xl font-bold tracking-tight text-[#2E6B29]">Vielen Dank!</div>
          <p className="text-[15px] leading-relaxed text-[#3D4A50] mt-2.5">
            Wir melden uns innerhalb von 24 Stunden bei Ihnen. Bei Fragen erreichen Sie uns unter +41 76 779 0449.
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-4 px-4.5 py-2.5 bg-white text-teal border border-teal rounded-md text-sm font-semibold cursor-pointer hover:bg-teal-light"
          >
            Neue Prüfung starten
          </button>
        </div>
      )}

      {!submitted && step > 1 && (
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="mt-4.5 bg-transparent border-0 p-0 text-[#6B7A80] text-[13.5px] font-medium cursor-pointer hover:text-teal"
        >
          ← Zurück
        </button>
      )}
    </div>
  );
}
