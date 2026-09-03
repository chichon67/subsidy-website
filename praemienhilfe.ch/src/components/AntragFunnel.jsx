// src/components/AntragFunnel.jsx
import { useState, useEffect } from 'react';
import { SITUATIONS, situationList } from '../data/situations.js';
import { deutschschweizCantons } from '../data/deutschschweiz.js';
import PhoneField, { isValidPhoneNumber } from './PhoneField.jsx';
import PrivacyPolicyModal from './PrivacyPolicyModal.jsx';
import { useTranslations } from '../i18n/useTranslations.js';

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

export default function AntragFunnel({ locale }) {
  const t = useTranslations(locale);
  const SITUATIONS_MAP = SITUATIONS(locale);
  const situations = situationList(locale);

  const INCOME_OPTIONS = [t('form.income.under2000'), t('form.income.2000to4000'), t('form.income.4000to6000'), t('form.income.over6000')];

  const STAGES = [
    { key: 'identifikation', label: t('form.stage.identification') },
    { key: 'ergaenzend', label: t('form.stage.additional') },
    { key: 'situation', label: t('form.stage.situation') },
    { key: 'abgeschlossen', label: t('form.stage.done') },
  ];

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
    const validSituation = SITUATIONS_MAP[s] ? s : '';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const situationLabel = situationSlug ? SITUATIONS_MAP[situationSlug].label : t('form.notSpecified');

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
      setErrors({ email: t('form.emailInvalid') });
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
    if (!firstName.trim()) errs.firstName = t('form.firstNameRequired');
    if (!lastName.trim()) errs.lastName = t('form.lastNameRequired');
    if (!phone) errs.phone = t('form.phoneRequired');
    else if (!isValidPhoneNumber(phone)) errs.phone = t('form.phoneInvalid');
    if (!consent) errs.consent = t('form.consentRequired');
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
          canton: cantonName || t('form.notSpecified'),
          situation: situationSlug,
          household: `${household} ${household === 1 ? t('form.person') : t('form.persons')}`,
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
          household: `${household} ${household === 1 ? t('form.person') : t('form.persons')}`,
          income,
          email,
        })
      );
      window.location.href = `/${locale}/danke`;
      return;
    } catch (err) {
      setErrors({ submit: t('form.submitError') });
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
              <span>{t('sidebar.finmaApproved')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-swiss-green">✓</span>
              <span>{t('sidebar.situationAnalysis')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber">★</span>
              <span>{t('sidebar.rating')}</span>
            </div>
            <div className="mt-1">{t('sidebar.dossiers')}</div>
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
              <span>{t('form.step', activeStage + 1, STAGES.length)}</span>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8EA] rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal mb-6">
              <span>🔒</span>
              <span>{t('form.securedForm')}</span>
            </div>

            {step === 'canton' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t('form.cantonQuestion')}</div>
                <select
                  value=""
                  onChange={(e) => e.target.value && chooseCanton(e.target.value)}
                  aria-label={t('form.cantonSelectLabel')}
                  className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                >
                  <option value="">{t('form.cantonSelectPlaceholder')}</option>
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
                    <span>{t('form.yourCanton', cantonName)}</span>
                  </div>
                )}
                <div className="text-xl font-bold mb-4 tracking-tight">{t('form.situationQuestion')}</div>
                <div className="grid gap-2.5">
                  {situations.map((s) => (
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
                  <span>{t('form.yourApplication')}</span>
                  <select
                    value={situationSlug}
                    onChange={(e) => changeSituation(e.target.value)}
                    aria-label={t('form.changeSituationLabel')}
                    className="bg-transparent text-teal-dark text-[12px] font-semibold uppercase tracking-wide border-0 outline-none underline cursor-pointer"
                  >
                    {!situationSlug && <option value="">{t('form.notSpecified')}</option>}
                    {situations.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {cantonName && <span className="normal-case font-normal">· {cantonName}</span>}
                </div>
                <div className="text-xl font-bold mt-4 mb-4 tracking-tight">{t('form.emailIntro')}</div>
                <input
                  type="email"
                  placeholder={t('form.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                />
                {errors.email && <div className="text-swiss-red text-xs mt-1">{errors.email}</div>}
                <p className="text-[12px] leading-relaxed text-[#8A979C] mt-3">
                  {t('form.privacyConsentPrefix')}{' '}
                  <button
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    className="text-teal underline font-medium cursor-pointer bg-transparent border-0 p-0"
                  >
                    {t('form.privacyPolicyLink')}
                  </button>{' '}
                  {t('form.privacyConsentSuffix')}
                </p>
                <button
                  type="button"
                  onClick={submitEmail}
                  disabled={!isValidEmail(email)}
                  className="mt-3.5 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('form.continue')}
                </button>
              </div>
            )}

            {step === 'household' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t('form.householdQuestion')}</div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setHousehold((h) => Math.max(1, h - 1))}
                    className="w-11 h-11 rounded-md border border-[#D6DFE2] text-xl font-bold text-dark hover:border-teal"
                  >
                    −
                  </button>
                  <div className="min-w-[130px] text-center text-lg font-semibold">
                    {household} {household === 1 ? t('form.person') : t('form.persons')}
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
                  {t('form.continue')}
                </button>
              </div>
            )}

            {step === 'income' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t('form.incomeQuestion')}</div>
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
                <div className="text-xl font-bold mb-4 tracking-tight">{t('form.contactQuestion')}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder={t('form.firstName')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                    />
                    {errors.firstName && <div className="text-swiss-red text-xs mt-1">{errors.firstName}</div>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={t('form.lastName')}
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
                    locale={locale}
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
                    {t('form.consentPrefix')}{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPrivacyOpen(true);
                      }}
                      className="text-teal underline font-medium cursor-pointer bg-transparent border-0 p-0"
                    >
                      {t('form.privacyTermsLink')}
                    </button>{' '}
                    {t('form.consentSuffix')}
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
                  {loading ? t('form.submitting') : t('form.submit')}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} locale={locale} />
    </div>
  );
}
