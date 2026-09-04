// src/components/SituationFunnel.jsx
import { useEffect } from 'react';
import { getSituationList } from '../data/situations.js';
import { getDictionary, t, localePath } from '../i18n/index.js';

function track(name, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

function goToAntrag(lang, slug, canton, situations) {
  if (!situations[slug]) return;
  track('funnel_step_1_complete', { situation: slug, canton });
  const params = new URLSearchParams({ situation: slug });
  if (canton) params.set('canton', canton);
  window.location.href = `${localePath(lang, '/antrag')}?${params.toString()}`;
}

export default function SituationFunnel({ canton, lang = 'de', dict }) {
  const d = dict || getDictionary(lang);
  const situationList = getSituationList(lang);
  const SITUATIONS = Object.fromEntries(situationList.map(({ slug, ...rest }) => [slug, rest]));

  useEffect(() => {
    window.startFunnel = (slug) => goToAntrag(lang, slug, canton, SITUATIONS);
    return () => {
      delete window.startFunnel;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canton, lang]);

  return (
    <div
      id="funnel"
      className="mt-8 bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7"
    >
      <div className="text-xl font-bold mb-4 tracking-tight">{t(d, 'situationSelector.heading')}</div>
      <div className="grid gap-2.5">
        {situationList.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => goToAntrag(lang, s.slug, canton, SITUATIONS)}
            className="w-full flex items-center justify-between gap-4 text-left cursor-pointer rounded-md text-[15.5px] font-medium text-dark bg-white border border-[#D6DFE2] px-[18px] py-[15px] transition-colors hover:border-teal hover:bg-teal-light"
          >
            <span>{s.label}</span>
            <span className="text-teal font-bold">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
