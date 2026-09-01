// src/components/Funnel.jsx
import { useState, useEffect } from 'react';

const CANTON_OPTIONS = ['Basel-Stadt', 'Basel-Landschaft'];
const INCOME_OPTIONS = ["Unter CHF 2'000", "CHF 2'000 – 4'000", "CHF 4'000 – 6'000", 'Über CHF 6\'000'];
const HOUSEHOLD_OPTIONS = ['Nur ich', 'Ich + Partner/in', 'Familie mit Kindern'];

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

export default function Funnel({ defaultCanton }) {
  const [step, setStep] = useState(defaultCanton ? 2 : 1);
  const [answers, setAnswers] = useState({
    canton: defaultCanton || '',
    income: '',
    household: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [utmData, setUtmData] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
  });

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
    if (defaultCanton) {
      track('funnel_step_1_complete', { canton: defaultCanton });
    }
    // Only runs once on mount for canton-preset pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseCanton(value) {
    setAnswers((a) => ({ ...a, canton: value }));
    track('funnel_step_1_complete', { canton: value });
    setStep(2);
  }

  function chooseIncome(value) {
    setAnswers((a) => ({ ...a, income: value }));
    track('funnel_step_2_complete', { income: value });
    setStep(3);
  }

  function chooseHousehold(value) {
    setAnswers((a) => ({ ...a, household: value }));
    track('funnel_step_3_complete', { household: value });
    setStep(4);
  }

  function updateField(key) {
    return (e) => setAnswers((a) => ({ ...a, [key]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!answers.firstName.trim()) errs.firstName = 'Bitte Vorname angeben.';
    if (!answers.lastName.trim()) errs.lastName = 'Bitte Nachname angeben.';
    const phone = answers.phone.replace(/\s/g, '');
    if (!phone) errs.phone = 'Bitte Telefonnummer angeben.';
    else if (!/^(\+41|0041|0)\d{6,}$/.test(phone)) errs.phone = 'Bitte eine gültige Schweizer Telefonnummer angeben.';
    if (!answers.email.trim()) errs.email = 'Bitte E-Mail angeben.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim())) errs.email = 'Bitte eine gültige E-Mail-Adresse angeben.';
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    track('funnel_form_submit', { canton: answers.canton });
    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, ...utmData }),
      });
      if (!res.ok) throw new Error('submit failed');
      track('funnel_conversion', { canton: answers.canton });
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder rufen Sie uns unter +41 76 779 0449 an.' });
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setAnswers({ canton: '', income: '', household: '', firstName: '', lastName: '', phone: '', email: '' });
    setErrors({});
    setSubmitted(false);
    setStep(1);
  }

  const stepNo = Math.min(step, 4);

  return (
    <div className="mt-8 bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`inline-block w-[9px] h-[9px] rounded-full transition-colors ${
                i <= stepNo ? 'bg-teal border border-teal' : 'bg-white border border-[#C3D5DA]'
              }`}
            />
          ))}
        </div>
        <div className="text-xs font-medium tracking-wider uppercase text-[#6B7A80]">Schritt {stepNo} von 4</div>
      </div>

      {!submitted && step === 1 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">In welchem Kanton wohnen Sie?</div>
          <div className="grid gap-2.5">
            {CANTON_OPTIONS.map((opt) => (
              <button key={opt} type="button" onClick={() => chooseCanton(opt)} className={rowClass(answers.canton === opt)}>
                <span className="flex items-center gap-3.5">
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0087A0" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                    <path d="M3 21h18" />
                    <path d="M5 21V10l7-5 7 5v11" />
                    <path d="M9 21v-6h6v6" />
                  </svg>
                  <span>{opt}</span>
                </span>
                <span className="text-teal font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && step === 2 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie hoch ist Ihr monatliches Haushaltseinkommen?</div>
          <div className="grid gap-2.5">
            {INCOME_OPTIONS.map((opt) => (
              <button key={opt} type="button" onClick={() => chooseIncome(opt)} className={rowClass(answers.income === opt)}>
                <span>{opt}</span>
                <span className="text-teal font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && step === 3 && (
        <div>
          <div className="text-xl font-bold mt-[18px] mb-4 tracking-tight">Wie viele Personen versichern Sie?</div>
          <div className="grid gap-2.5">
            {HOUSEHOLD_OPTIONS.map((opt) => (
              <button key={opt} type="button" onClick={() => chooseHousehold(opt)} className={rowClass(answers.household === opt)}>
                <span>{opt}</span>
                <span className="text-teal font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!submitted && step === 4 && (
        <div>
          <div className="text-lg font-bold mt-[18px] mb-1 tracking-tight text-[#2E6B29]">✓ Gute Nachricht — Sie könnten Anspruch haben!</div>
          <div className="text-xl font-bold mt-3 mb-4 tracking-tight">Ihre Kontaktangaben</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <input
                type="text"
                placeholder="Vorname"
                value={answers.firstName}
                onChange={updateField('firstName')}
                className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
              />
              {errors.firstName && <div className="text-swiss-red text-xs mt-1">{errors.firstName}</div>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Nachname"
                value={answers.lastName}
                onChange={updateField('lastName')}
                className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
              />
              {errors.lastName && <div className="text-swiss-red text-xs mt-1">{errors.lastName}</div>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Telefon"
                value={answers.phone}
                onChange={updateField('phone')}
                className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
              />
              {errors.phone && <div className="text-swiss-red text-xs mt-1">{errors.phone}</div>}
            </div>
            <div>
              <input
                type="email"
                placeholder="E-Mail"
                value={answers.email}
                onChange={updateField('email')}
                className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
              />
              {errors.email && <div className="text-swiss-red text-xs mt-1">{errors.email}</div>}
            </div>
          </div>
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

      {!submitted && step > 1 && step < 5 && (
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
