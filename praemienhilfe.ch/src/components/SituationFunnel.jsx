// src/components/SituationFunnel.jsx
import { useEffect } from 'react';
import { situationList, SITUATIONS } from '../data/situations.js';

function track(name, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

function goToAntrag(slug) {
  if (!SITUATIONS[slug]) return;
  track('funnel_step_1_complete', { situation: slug });
  window.location.href = `/antrag?situation=${slug}`;
}

export default function SituationFunnel() {
  useEffect(() => {
    window.startFunnel = (slug) => goToAntrag(slug);
    return () => {
      delete window.startFunnel;
    };
  }, []);

  return (
    <div
      id="funnel"
      className="mt-8 bg-white border border-[#E2E8EA] border-t-4 border-t-teal rounded-[10px] shadow-[0_3px_16px_rgba(26,26,42,0.07)] px-7 pt-6 pb-7"
    >
      <div className="text-xl font-bold mb-4 tracking-tight">Was beschreibt Ihre Situation am besten?</div>
      <div className="grid gap-2.5">
        {situationList.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => goToAntrag(s.slug)}
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
