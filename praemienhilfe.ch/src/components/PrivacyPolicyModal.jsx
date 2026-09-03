// src/components/PrivacyPolicyModal.jsx
import { national } from '../data/national.js';

export default function PrivacyPolicyModal({ open, onClose, locale }) {
  if (!open) return null;

  const t = national[locale]?.privacyModal ?? national.de.privacyModal;

  return (
    <div className="fixed inset-0 z-[100] bg-dark/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-7 pt-6 pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-bold text-dark tracking-tight">{t.title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schliessen"
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md border border-[#D6DFE2] text-dark text-lg cursor-pointer hover:border-teal"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-5 text-[14.5px] leading-relaxed text-[#3D4A50]">
          <div>
            <div className="font-semibold text-dark">{t.responsibleParty.heading}</div>
            <p className="mt-1">
              {t.responsibleParty.address.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
              <a href="mailto:office@evo-partners.ch" className="text-teal">
                office@evo-partners.ch
              </a>
            </p>
          </div>
          <div>
            <div className="font-semibold text-dark">{t.purpose.heading}</div>
            <p className="mt-1">{t.purpose.intro}</p>
            <ul className="mt-2 grid gap-1.5 list-disc pl-5">
              {t.purpose.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-dark">{t.sharing.heading}</div>
            <p className="mt-1">{t.sharing.body}</p>
          </div>
          <div>
            <div className="font-semibold text-dark">{t.retention.heading}</div>
            <p className="mt-1">{t.retention.body}</p>
          </div>
          <div>
            <div className="font-semibold text-dark">{t.rights.heading}</div>
            <p className="mt-1">{t.rights.intro}</p>
            <ul className="mt-2 grid gap-1.5 list-disc pl-5">
              {t.rights.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-2">
              {t.rights.contact}{' '}
              <a href="mailto:office@evo-partners.ch" className="text-teal">
                office@evo-partners.ch
              </a>
            </p>
          </div>
          <div>
            <div className="font-semibold text-dark">{t.cookies.heading}</div>
            <p className="mt-1">{t.cookies.body}</p>
          </div>
          <div>
            <div className="font-semibold text-dark">{t.finma.heading}</div>
            <p className="mt-1">{t.finma.number}</p>
          </div>
        </div>

        <a
          href="/datenschutz"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-teal text-sm font-semibold underline"
        >
          {t.fullPolicyLink}
        </a>
      </div>
    </div>
  );
}
