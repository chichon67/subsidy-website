// src/components/StickyFunnelWidget.jsx
import { useState, useEffect } from 'react';
import { useTranslations } from '../i18n/useTranslations.js';

export default function StickyFunnelWidget({ activePage, cantonName, locale }) {
  const t = useTranslations(locale);
  const [pastHero, setPastHero] = useState(false);
  const isCantonLandingPage = activePage === 'basel-stadt' || activePage === 'basel-landschaft' || activePage === 'canton';
  const href = isCantonLandingPage ? '#funnel' : activePage === 'home' ? '#pruefen' : `/${locale}/antrag`;
  const heading = cantonName ? `${t('stickyCta.title')} ${cantonName}` : t('stickyCta.title');

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
      <div className="text-[15px] font-bold text-dark tracking-tight">{heading}</div>
      <div className="text-[13px] text-[#6B7A80] mt-1">{t('stickyCta.subtitle')}</div>
      <a
        href={href}
        className="mt-3 block text-center px-4 py-2.5 bg-teal text-white rounded-md text-[14px] font-semibold no-underline hover:bg-teal-dark"
      >
        {t('stickyCta.button')}
      </a>
    </div>
  );
}
