// src/components/DankeSummary.jsx
// Reads the summary AntragFunnel stashed in sessionStorage right before
// redirecting to /danke. Falls back to a generic message if someone lands
// here without submitting (direct visit, refresh after the value is
// cleared, bookmarked link, etc).
//
// /danke is a single unprefixed page with no [lang] route param (Task 1
// decision, kept for Google Ads conversion-tracking destination-URL
// stability), so the language to render in can't be resolved server-side.
// AntragFunnel stashes it in sessionStorage ('antragLang') right alongside
// the summary; this component reads that, falling back to 'de' if it's
// missing or invalid (e.g. a bookmarked/direct /danke visit).
import { useEffect, useState } from 'react';
import { getDictionary, t } from '../i18n/index.js';

export default function DankeSummary() {
  const [summary, setSummary] = useState(null);
  const [lang, setLang] = useState('de');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('antragSummary');
    if (raw) {
      try {
        setSummary(JSON.parse(raw));
      } catch {
        setSummary(null);
      }
      sessionStorage.removeItem('antragSummary');
    }

    const storedLang = sessionStorage.getItem('antragLang');
    if (storedLang === 'de' || storedLang === 'en' || storedLang === 'es') {
      setLang(storedLang);
    }
    sessionStorage.removeItem('antragLang');

    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const d = getDictionary(lang);

  return (
    <div className="w-full max-w-[480px] bg-white border border-[#E2E8EA] rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-8 pb-7 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-swiss-green/10 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D8B37" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M4 13l5 5L20 7"></path>
        </svg>
      </div>
      <div className="text-xl font-bold mt-4 tracking-tight text-[#2E6B29]">
        {summary?.firstName ? t(d, 'thankYou.titleWithName', { firstName: summary.firstName }) : t(d, 'thankYou.titleGeneric')}
      </div>
      <p className="text-[15px] leading-relaxed text-[#3D4A50] mt-2.5">
        {t(d, 'thankYou.paragraphPrefix')}{' '}
        <a href="tel:+41767790449" className="text-teal font-semibold no-underline">
          +41 76 779 0449
        </a>
        .
      </p>

      {summary && (
        <div className="mt-5 bg-[#F5F7F8] rounded-md px-4 py-3.5 grid gap-1.5 text-[13.5px] text-left">
          {summary.situationLabel && (
            <div className="flex justify-between">
              <span className="text-[#6B7A80]">{t(d, 'thankYou.labels.situation')}</span>
              <span className="font-semibold text-dark">{summary.situationLabel}</span>
            </div>
          )}
          {summary.cantonName && (
            <div className="flex justify-between">
              <span className="text-[#6B7A80]">{t(d, 'thankYou.labels.canton')}</span>
              <span className="font-semibold text-dark">{summary.cantonName}</span>
            </div>
          )}
          {summary.household && (
            <div className="flex justify-between">
              <span className="text-[#6B7A80]">{t(d, 'thankYou.labels.household')}</span>
              <span className="font-semibold text-dark">{summary.household}</span>
            </div>
          )}
          {summary.income && (
            <div className="flex justify-between">
              <span className="text-[#6B7A80]">{t(d, 'thankYou.labels.income')}</span>
              <span className="font-semibold text-dark">{summary.income}</span>
            </div>
          )}
          {summary.email && (
            <div className="flex justify-between">
              <span className="text-[#6B7A80]">{t(d, 'thankYou.labels.email')}</span>
              <span className="font-semibold text-dark">{summary.email}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-[13px] text-[#8A979C] mt-4">{t(d, 'thankYou.confirmationNote')}</p>

      <a
        href="/"
        className="mt-6 inline-block px-5 py-3 bg-teal text-white rounded-md text-[15px] font-bold no-underline hover:bg-teal-dark"
      >
        {t(d, 'thankYou.backHome')}
      </a>
    </div>
  );
}
