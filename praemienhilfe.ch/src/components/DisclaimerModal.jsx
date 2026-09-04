import { useState, useEffect } from 'react';
import { isDisclaimerDue, markDisclaimerShown } from '../lib/disclaimer.js';
import { getDictionary, t } from '../i18n/index.js';

export default function DisclaimerModal({ lang = 'de', dict }) {
  const d = dict || getDictionary(lang);
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const due = isDisclaimerDue();
    setVisible(due);
    setChecked(true);
  }, []);

  function dismiss() {
    markDisclaimerShown();
    setVisible(false);
  }

  if (!checked || !visible) return null;

  return (
    <div className="fixed top-1/2 right-0 md:right-4 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-l-2xl md:rounded-2xl shadow-2xl px-6 pt-6 pb-6">
      <div className="text-[15px] font-bold text-dark tracking-tight">
        prämienhilfe<span className="text-teal">.ch</span>
      </div>

      <div className="text-base font-bold text-dark tracking-tight mt-4">{t(d, 'widgets.disclaimer.heading')}</div>
      <p className="text-sm leading-relaxed text-[#3D4A50] mt-2.5">
        {t(d, 'widgets.disclaimer.paragraph1')}
      </p>
      <p className="text-sm leading-relaxed text-[#3D4A50] mt-2.5">
        {t(d, 'widgets.disclaimer.paragraph2')}
      </p>

      <button
        type="button"
        onClick={dismiss}
        className="mt-5 w-full px-5 py-3.5 bg-teal text-white border-0 rounded-md text-[15px] font-bold cursor-pointer hover:bg-teal-dark"
      >
        {t(d, 'widgets.disclaimer.cta')}
      </button>
    </div>
  );
}
