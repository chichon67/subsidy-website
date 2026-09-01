// src/components/StickyFunnelWidget.jsx
import { useState, useEffect } from 'react';

export default function StickyFunnelWidget({ activePage }) {
  const [pastHero, setPastHero] = useState(false);
  const href = activePage === 'basel-stadt' ? '#funnel' : '/#pruefen';

  useEffect(() => {
    const hero = document.querySelector('#pruefen');
    if (!hero) {
      setPastHero(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPastHero(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!pastHero) return null;

  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-30 w-72 bg-white rounded-xl shadow-xl border border-[#E2E8EA] px-5 pt-4 pb-4">
      <div className="text-[15px] font-bold text-dark tracking-tight">Anspruch prüfen</div>
      <div className="text-[13px] text-[#6B7A80] mt-1">Kostenlose Prüfung in 20 Min.</div>
      <a
        href={href}
        className="mt-3 block text-center px-4 py-2.5 bg-teal text-white rounded-md text-[14px] font-semibold no-underline hover:bg-teal-dark"
      >
        Jetzt starten →
      </a>
    </div>
  );
}
