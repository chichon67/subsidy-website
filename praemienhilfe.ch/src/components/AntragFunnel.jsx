// src/components/AntragFunnel.jsx
import { useState, useEffect } from 'react';
import { getSituationList } from '../data/situations.js';
import { deutschschweizCantons } from '../data/deutschschweiz.js';
import PhoneField, { isValidPhoneNumber } from './PhoneField.jsx';
import { getDictionary, t, localePath } from '../i18n/index.js';
import { hiddenLeadFields, rememberFirstTouch } from '../lib/attribution.js';
import { stashPendingGenerateLead } from '../lib/analytics.js';

function stageIndexForStep(step) {
  if (step === 'canton' || step === 'situation' || step === 'household' || step === 'children') return 0;
  if (step === 'premium' || step === 'burden' || step === 'current' || step === 'income') return 1;
  if (step === 'analysis') return 2;
  return 3;
}

// Flow: canton → situation → household → children (if >1 person) → premium →
// burden → current → income → analysis → contact. Contact details (incl.
// email) are only asked once the visitor has invested in the flow.

function track(name, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

const FORM_ID = 'antrag';

function rowClass(selected) {
  return [
    'w-full flex items-center justify-between gap-4 text-left cursor-pointer rounded-md text-[15.5px] font-medium text-dark transition-colors',
    selected ? 'bg-teal-light border-2 border-teal px-[17px] py-[14px]' : 'bg-white border border-[#D6DFE2] px-[18px] py-[15px]',
  ].join(' ');
}

export default function AntragFunnel({ lang = 'de', dict } = {}) {
  const d = dict || getDictionary(lang);
  const situationList = getSituationList(lang);
  const SITUATIONS = Object.fromEntries(situationList.map(({ slug, ...rest }) => [slug, rest]));
  const INCOME_OPTIONS = [
    t(d, 'form.income.under2000'),
    t(d, 'form.income.2000to4000'),
    t(d, 'form.income.4000to6000'),
    t(d, 'form.income.over6000'),
  ];
  const optionList = (group, keys) => keys.map((k) => t(d, `form.${group}.${k}`));
  const CHILDREN_OPTIONS = optionList('children', ['under18', 'inEducation', 'both', 'none']);
  const PREMIUM_OPTIONS = optionList('premium', ['under300', '300to600', '600to1000', 'over1000', 'unknown']);
  const BURDEN_OPTIONS = optionList('burden', ['high', 'medium', 'low']);
  const CURRENT_OPTIONS = optionList('current', ['never', 'unsure', 'pending', 'rejected', 'unknown']);
  const STAGES = [
    { key: 'situation', label: t(d, 'form.stages.situation') },
    { key: 'kosten', label: t(d, 'form.stages.costs') },
    { key: 'auswertung', label: t(d, 'form.stages.analysis') },
    { key: 'kontakt', label: t(d, 'form.stages.contact') },
  ];

  const [situationSlug, setSituationSlug] = useState('');
  const [cantonName, setCantonName] = useState('');
  // First screen for /antrag with no query string. Server HTML includes the
  // canton list; the effect below still jumps ahead when canton/situation
  // are already in the URL.
  const [step, setStep] = useState('canton');
  const [history, setHistory] = useState([]);
  const [email, setEmail] = useState('');
  const [household, setHousehold] = useState(1);
  const [children, setChildren] = useState('');
  const [premium, setPremium] = useState('');
  const [burden, setBurden] = useState('');
  const [currentSubsidy, setCurrentSubsidy] = useState('');
  const [income, setIncome] = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState();
  const [consent, setConsent] = useState(false);
  const [consentAt, setConsentAt] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — stays empty for humans
  const [startedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [attribution, setAttribution] = useState({});
  const [pageContext, setPageContext] = useState({ site: '', pagePath: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('situation') || '';
    const c = params.get('canton') || '';
    const validSituation = SITUATIONS[s] ? s : '';
    setSituationSlug(validSituation);
    setCantonName(c);
    if (!c) setStep('canton');
    else if (!validSituation) setStep('situation');
    else setStep('household');
    setAttribution(rememberFirstTouch() || {});
    setPageContext({ site: window.location.hostname, pagePath: window.location.pathname });
  }, []);

  const hidden = hiddenLeadFields(attribution, {
    site: pageContext.site,
    formId: FORM_ID,
    pagePath: pageContext.pagePath,
    lang,
  });

  const situationLabel = situationSlug ? SITUATIONS[situationSlug].label : t(d, 'form.email.notProvided');
  const householdLabel = `${household} ${household === 1 ? t(d, 'form.household.personSingular') : t(d, 'form.household.personPlural')}`;

  function goTo(next) {
    setHistory((h) => [...h, step]);
    setErrors({});
    setStep(next);
  }

  function goBack() {
    if (history.length === 0) return;
    setErrors({});
    setStep(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }

  // Short "assessing" pause before the profile summary — makes the
  // answers feel evaluated rather than just collected.
  useEffect(() => {
    if (step !== 'analysis') return;
    setAnalysing(true);
    const timer = setTimeout(() => setAnalysing(false), 1400);
    return () => clearTimeout(timer);
  }, [step]);

  function chooseCanton(name) {
    setCantonName(name);
    track('antrag_step_canton_complete', { canton: name });
    const url = new URL(window.location.href);
    url.searchParams.set('canton', name);
    window.history.replaceState({}, '', url);
    goTo(situationSlug ? 'household' : 'situation');
  }

  function chooseSituation(slug) {
    setSituationSlug(slug);
    track('antrag_step_situation_complete', { situation: slug });
    const url = new URL(window.location.href);
    url.searchParams.set('situation', slug);
    window.history.replaceState({}, '', url);
    goTo('household');
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function submitHousehold() {
    track('antrag_step_household_complete', { household });
    if (household > 1) {
      goTo('children');
    } else {
      setChildren('');
      goTo('premium');
    }
  }

  function chooseOption(setter, eventName, nextStep) {
    return (value) => {
      setter(value);
      track(eventName, { value });
      goTo(nextStep);
    };
  }

  const chooseChildren = chooseOption(setChildren, 'antrag_step_children_complete', 'premium');
  const choosePremium = chooseOption(setPremium, 'antrag_step_premium_complete', 'burden');
  const chooseBurden = chooseOption(setBurden, 'antrag_step_burden_complete', 'current');
  const chooseCurrent = chooseOption(setCurrentSubsidy, 'antrag_step_current_complete', 'income');
  const chooseIncome = chooseOption(setIncome, 'antrag_step_income_complete', 'analysis');

  function submitAnalysis() {
    track('antrag_step_analysis_complete', { situation: situationSlug });
    goTo('contact');
  }

  function validateContact() {
    const errs = {};
    if (!firstName.trim()) errs.firstName = t(d, 'form.errors.firstName');
    if (!lastName.trim()) errs.lastName = t(d, 'form.errors.lastName');
    if (!isValidEmail(email)) errs.email = t(d, 'form.email.invalid');
    if (!phone) errs.phone = t(d, 'form.errors.phone');
    else if (!isValidPhoneNumber(phone)) errs.phone = t(d, 'form.errors.phoneInvalid');
    if (!consent) errs.consent = t(d, 'form.errors.consent');
    return errs;
  }

  const contactReady = firstName.trim() && lastName.trim() && isValidEmail(email) && phone && isValidPhoneNumber(phone) && consent;

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
      const res = await fetch('/.netlify/functions/lead-to-twenty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          canton: cantonName || t(d, 'form.email.notProvided'),
          situation: situationSlug,
          household: householdLabel,
          children,
          premium,
          burden,
          currentSubsidy,
          income,
          lang,
          consent,
          consentText: t(d, 'form.contact.consent'),
          consentAt,
          pageUrl: window.location.origin + window.location.pathname,
          website,
          startedAt,
          ...hidden,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      track('antrag_conversion', { situation: situationSlug });
      // Stash only after the POST succeeds. The thank-you page sends the GA4
      // lead hit, so the redirect below cannot drop it. The click above stays
      // the existing Ads event.
      stashPendingGenerateLead({
        form_id: 'antrag',
        lead_type: 'subsidy_application',
        page_path: window.location.pathname,
        language: lang,
      });
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
          household: householdLabel,
          income,
          email,
        })
      );
      // Task 8: stash which language the funnel was completed in, so the
      // unprefixed /danke page (which has no [lang] route param) can render
      // its thank-you content in the right language.
      sessionStorage.setItem('antragLang', lang);
      window.location.href = '/danke';
      return;
    } catch (err) {
      setErrors({ submit: t(d, 'form.errors.submitFailed') });
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
              <span>{t(d, 'form.sidebar.finma')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-swiss-green">✓</span>
              <span>{t(d, 'form.sidebar.analysis')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber">★</span>
              <span>{t(d, 'form.sidebar.rating')}</span>
            </div>
            <div className="mt-1">{t(d, 'form.sidebar.volume')}</div>
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
              <span>{t(d, 'form.stepOf', { n: activeStage + 1, total: STAGES.length })}</span>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8EA] rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold mb-6">
              <span className="text-teal">{t(d, 'form.secureForm')}</span>
              {history.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={goBack}
                  className="text-[#6B7A80] hover:text-dark bg-transparent border-0 p-0 cursor-pointer font-medium"
                >
                  {t(d, 'form.back')}
                </button>
              )}
            </div>

            {step === 'canton' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'form.canton.question')}</div>
                <select
                  value=""
                  onChange={(e) => e.target.value && chooseCanton(e.target.value)}
                  aria-label={t(d, 'form.canton.ariaLabel')}
                  className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                >
                  <option value="">{t(d, 'form.canton.placeholder')}</option>
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
                    <span>{t(d, 'form.situation.yourCanton', { canton: cantonName })}</span>
                  </div>
                )}
                <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'form.situation.question')}</div>
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

            {step === 'household' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'form.household.question')}</div>
                <p className="text-[13.5px] leading-relaxed text-[#6B7A80] -mt-2 mb-4">{t(d, 'form.household.hint')}</p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setHousehold((h) => Math.max(1, h - 1))}
                    className="w-11 h-11 rounded-md border border-[#D6DFE2] text-xl font-bold text-dark hover:border-teal"
                  >
                    −
                  </button>
                  <div className="min-w-[130px] text-center text-lg font-semibold">
                    {household} {household === 1 ? t(d, 'form.household.personSingular') : t(d, 'form.household.personPlural')}
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
                  {t(d, 'form.household.continue')}
                </button>
              </div>
            )}

            {step === 'children' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'form.children.question')}</div>
                <p className="text-[13.5px] leading-relaxed text-[#6B7A80] -mt-2 mb-4">{t(d, 'form.children.hint')}</p>
                <div className="grid gap-2.5">
                  {CHILDREN_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => chooseChildren(opt)} className={rowClass(children === opt)}>
                      <span>{opt}</span>
                      <span className="text-teal font-bold">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'premium' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'form.premium.question')}</div>
                <p className="text-[13.5px] leading-relaxed text-[#6B7A80] -mt-2 mb-4">{t(d, 'form.premium.hint')}</p>
                <div className="grid gap-2.5">
                  {PREMIUM_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => choosePremium(opt)} className={rowClass(premium === opt)}>
                      <span>{opt}</span>
                      <span className="text-teal font-bold">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'burden' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'form.burden.question')}</div>
                <div className="grid gap-2.5">
                  {BURDEN_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => chooseBurden(opt)} className={rowClass(burden === opt)}>
                      <span>{opt}</span>
                      <span className="text-teal font-bold">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'current' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'form.current.question')}</div>
                <p className="text-[13.5px] leading-relaxed text-[#6B7A80] -mt-2 mb-4">{t(d, 'form.current.hint')}</p>
                <div className="grid gap-2.5">
                  {CURRENT_OPTIONS.map((opt) => (
                    <button key={opt} type="button" onClick={() => chooseCurrent(opt)} className={rowClass(currentSubsidy === opt)}>
                      <span>{opt}</span>
                      <span className="text-teal font-bold">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'income' && (
              <div>
                <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'form.income.question')}</div>
                <p className="text-[13.5px] leading-relaxed text-[#6B7A80] -mt-2 mb-4">{t(d, 'form.income.hint')}</p>
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

            {step === 'analysis' && (
              <div>
                {analysing ? (
                  <div className="flex flex-col items-center py-10">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-light border-t-teal animate-spin" />
                    <div className="mt-4 text-[15px] font-medium text-dark">{t(d, 'form.analysis.loading')}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-bold tracking-tight">{t(d, 'form.analysis.title')}</div>
                    <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-2">{t(d, 'form.analysis.intro')}</p>
                    <div className="mt-4 rounded-md border border-[#E2E8EA] bg-[#F5F7F8] px-4 py-3">
                      <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7A80] mb-2">{t(d, 'form.analysis.recap')}</div>
                      <dl className="grid gap-1.5 text-[14px]">
                        {[
                      { label: t(d, 'form.analysis.labels.canton'), value: cantonName },
                      { label: t(d, 'form.analysis.labels.situation'), value: situationLabel },
                      { label: t(d, 'form.analysis.labels.household'), value: householdLabel },
                      { label: t(d, 'form.analysis.labels.premium'), value: premium },
                      { label: t(d, 'form.analysis.labels.current'), value: currentSubsidy },
                      { label: t(d, 'form.analysis.labels.income'), value: income },
                        ]
                          .filter((row) => row.value)
                          .map((row) => (
                            <div key={row.label} className="flex justify-between gap-4">
                              <dt className="text-[#6B7A80]">{row.label}</dt>
                              <dd className="font-semibold text-dark text-right">{row.value}</dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                    <p className="text-[13.5px] leading-relaxed text-[#3D4A50] mt-4">
                      <span className="text-swiss-green font-bold">✓</span> {t(d, 'form.analysis.nextSteps')}
                    </p>
                    <button
                      type="button"
                      onClick={submitAnalysis}
                      className="mt-5 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark"
                    >
                      {t(d, 'form.analysis.cta')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 'contact' && (
              <div>
                {Object.entries(hidden).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))}
                <div className="text-xl font-bold tracking-tight">{t(d, 'form.contact.question')}</div>
                <p className="text-[13.5px] leading-relaxed text-[#6B7A80] mt-1.5 mb-4">{t(d, 'form.contact.subtitle')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder={t(d, 'form.contact.firstName')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                    />
                    {errors.firstName && <div className="text-swiss-red text-xs mt-1">{errors.firstName}</div>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={t(d, 'form.contact.lastName')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                    />
                    {errors.lastName && <div className="text-swiss-red text-xs mt-1">{errors.lastName}</div>}
                  </div>
                </div>
                <div className="mt-2.5">
                  <input
                    type="email"
                    autoComplete="email"
                    aria-label={t(d, 'form.contact.email')}
                    placeholder={t(d, 'form.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 text-[15px] border border-[#D6DFE2] rounded-md bg-white text-dark outline-none focus:border-teal"
                  />
                  {errors.email && <div className="text-swiss-red text-xs mt-1">{errors.email}</div>}
                </div>
                <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </label>
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
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setConsentAt(e.target.checked ? new Date().toISOString() : '');
                    }}
                    required
                    className="mt-0.5 w-4 h-4 accent-teal flex-shrink-0"
                  />
                  <span>
                    {t(d, 'form.contact.consentPrefix')}{' '}
                    <a
                      href={localePath(lang, '/datenschutz')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal underline font-medium"
                    >
                      {t(d, 'footer.datenschutz')}
                    </a>{' '}
                    {t(d, 'form.contact.consentSuffix')}
                  </span>
                </label>
                {errors.consent && <div className="text-swiss-red text-xs mt-1">{errors.consent}</div>}
                {errors.submit && <div className="text-swiss-red text-sm mt-3">{errors.submit}</div>}
                <p className="text-[12px] leading-snug text-[#6B7780] mt-3 mb-0">{t(d, 'form.contact.submitDisclaimer')}</p>
                <button
                  type="button"
                  onClick={submitContact}
                  disabled={!contactReady || loading}
                  className="mt-4 w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16.5px] font-bold cursor-pointer hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? t(d, 'form.contact.submitting') : t(d, 'form.contact.submit')}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
