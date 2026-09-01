// src/components/ExitIntentPopup.jsx
import { useState, useEffect, useRef } from 'react';
import { isDisclaimerDue } from '../lib/disclaimer.js';

const KEY = 'exit_shown';

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const armedRef = useRef(false);

  useEffect(() => {
    function handleMouseLeave(e) {
      if (!armedRef.current) return;
      if (e.clientY >= 10) return;
      if (typeof window === 'undefined') return;
      if (window.localStorage.getItem(KEY)) return;
      if (isDisclaimerDue()) return;
      window.localStorage.setItem(KEY, 'true');
      setVisible(true);
    }

    // Arm after a tick so the disclaimer (if any) has a chance to render first
    // and so a mouseleave firing during initial page load doesn't trigger this.
    const armTimer = setTimeout(() => {
      armedRef.current = true;
    }, 1500);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  function goToFunnel() {
    setVisible(false);
    const target = document.querySelector('#pruefen');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-dark/50 flex items-center justify-center p-4"
      onClick={() => setVisible(false)}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl px-6 pt-6 pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-bold text-dark tracking-tight">
          Warten Sie — prüfen Sie zuerst Ihren Anspruch!
        </div>
        <p className="text-[14px] leading-relaxed text-[#3D4A50] mt-2.5">
          Viele Berechtigte wissen nicht, dass sie Anspruch auf bis zu CHF 3'000 pro Jahr haben. Die Prüfung dauert
          nur 20 Minuten.
        </p>
        <button
          type="button"
          onClick={goToFunnel}
          className="mt-4 w-full px-5 py-3.5 bg-teal text-white border-0 rounded-md text-[15px] font-bold cursor-pointer hover:bg-teal-dark"
        >
          Jetzt prüfen →
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="mt-3 w-full text-center text-[12.5px] text-[#8A979C] bg-transparent border-0 cursor-pointer hover:text-[#6B7A80]"
        >
          Nein danke, ich verzichte auf meine Verbilligung
        </button>
      </div>
    </div>
  );
}
