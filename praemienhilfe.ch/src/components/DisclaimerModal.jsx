import { useState, useEffect } from 'react';
import { isDisclaimerDue, markDisclaimerShown } from '../lib/disclaimer.js';

export default function DisclaimerModal() {
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const due = isDisclaimerDue();
    setVisible(due);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  function dismiss() {
    markDisclaimerShown();
    setVisible(false);
  }

  if (!checked || !visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-dark/60 flex items-center justify-center p-4 md:p-6">
      <div className="w-full h-full md:h-auto md:max-w-lg bg-white rounded-none md:rounded-xl shadow-xl overflow-y-auto flex flex-col">
        <div className="px-7 pt-7 pb-2 flex items-center gap-2.5 text-sm font-semibold text-teal">
          <span>🔒</span>
          <span>Sicheres Formular</span>
        </div>

        <div className="px-7 pt-3 flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#0087A0"></rect>
            <rect x="14" y="14" width="24" height="24" rx="6" fill="#F0A500"></rect>
            <rect x="14" y="14" width="12" height="12" fill="#005F73"></rect>
          </svg>
          <span className="text-[17px] font-bold text-dark">
            prämienhilfe<span className="text-teal">.ch</span>
          </span>
        </div>

        <div className="px-7 pt-5">
          <div className="text-xl font-bold text-dark tracking-tight">Wichtiger Hinweis</div>
          <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-3">
            prämienhilfe.ch ist ein privater und unabhängiger Beratungsservice, betrieben von EVO Partners GmbH, einem
            FINMA-registrierten Versicherungsbroker. Wir sind weder ein Kantonsamt noch eine staatliche Behörde.
          </p>
          <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-3 font-semibold">Unser Service umfasst:</p>
          <ul className="mt-2 grid gap-1.5 text-[14.5px] leading-relaxed text-[#3D4A50]">
            <li className="flex items-start gap-2">
              <span className="text-swiss-green font-bold">✓</span>
              <span>Prüfung Ihres Anspruchs auf Prämienverbilligung</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-swiss-green font-bold">✓</span>
              <span>Zusammenstellung und Einreichung Ihres Dossiers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-swiss-green font-bold">✓</span>
              <span>Unabhängige Beratung zu Ihrer Krankenversicherung</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-swiss-green font-bold">✓</span>
              <span>Optimierung Ihrer Versicherungssituation</span>
            </li>
          </ul>
          <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-3">
            Die Hilfe bei der Prämienverbilligung ist für Sie kostenlos. Unsere Vergütung erfolgt ausschliesslich
            durch Versicherungspartner im Rahmen unserer Brokertätigkeit.
          </p>
          <p className="text-[14.5px] leading-relaxed text-[#3D4A50] mt-3">
            Der Antrag auf Prämienverbilligung kann auch eigenständig beim zuständigen Kantonsamt gestellt werden.
          </p>
        </div>

        <div className="px-7 mt-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-dark">+1'000</div>
            <div className="text-[11px] text-[#6B7A80] mt-0.5">Dossiers/Jahr</div>
          </div>
          <div>
            <div className="text-lg font-bold text-dark">FINMA</div>
            <div className="text-[11px] text-[#6B7A80] mt-0.5">Registriert</div>
          </div>
          <div>
            <div className="text-lg font-bold text-dark">4.8/5</div>
            <div className="text-[11px] text-[#6B7A80] mt-0.5">Kundenbewertung</div>
          </div>
        </div>

        <div className="px-7 pt-6 pb-4">
          <button
            type="button"
            onClick={dismiss}
            className="w-full px-5 py-4 bg-teal text-white border-0 rounded-md text-[16px] font-bold cursor-pointer hover:bg-teal-dark"
          >
            Ich habe gelesen und verstanden — Weiter →
          </button>
          <div className="text-center mt-3">
            <a
              href="https://asb.bs.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12.5px] text-[#6B7A80] hover:text-teal"
            >
              Direkt zum offiziellen Kantonsamt (asb.bs.ch) ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
