// src/components/PrivacyPolicyModal.jsx
export default function PrivacyPolicyModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-dark/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-7 pt-6 pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-bold text-dark tracking-tight">Datenschutzbestimmungen</div>
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
            <div className="font-semibold text-dark">Verantwortliche Stelle</div>
            <p className="mt-1">
              EVO Partners GmbH
              <br />
              c/o ExpertFid &amp; Audit AG
              <br />
              Strehlgasse 2, 8001 Zürich
              <br />
              <a href="mailto:office@evo-partners.ch" className="text-teal">
                office@evo-partners.ch
              </a>
            </p>
          </div>
          <div>
            <div className="font-semibold text-dark">Zweck der Datenerhebung</div>
            <p className="mt-1">
              Wir erheben personenbezogene Daten (Name, Telefon, E-Mail, Situation) ausschliesslich zu folgenden
              Zwecken:
            </p>
            <ul className="mt-2 grid gap-1.5 list-disc pl-5">
              <li>Prüfung Ihres Anspruchs auf Prämienverbilligung</li>
              <li>Kontaktaufnahme durch EVO Partners GmbH oder akkreditierte FINMA-Partner für Beratungsleistungen im Bereich Krankenversicherung</li>
              <li>Zusammenstellung und Einreichung Ihres Dossiers beim zuständigen Kantonsamt</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-dark">Datenweitergabe</div>
            <p className="mt-1">
              Ihre Daten können an akkreditierte FINMA-Partner weitergegeben werden, sofern dies zur Erbringung
              unserer Dienstleistungen erforderlich ist. Eine Weitergabe an Dritte zu Werbezwecken findet nicht
              statt.
            </p>
          </div>
          <div>
            <div className="font-semibold text-dark">Speicherdauer</div>
            <p className="mt-1">
              Ihre Daten werden so lange gespeichert, wie es für die Erbringung unserer Dienstleistungen erforderlich
              ist, längstens jedoch 5 Jahre.
            </p>
          </div>
          <div>
            <div className="font-semibold text-dark">Ihre Rechte</div>
            <p className="mt-1">Sie haben das Recht auf:</p>
            <ul className="mt-2 grid gap-1.5 list-disc pl-5">
              <li>Auskunft über Ihre gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung Ihrer Daten</li>
              <li>Widerspruch gegen die Verarbeitung</li>
            </ul>
            <p className="mt-2">
              Anfragen richten Sie an:{' '}
              <a href="mailto:office@evo-partners.ch" className="text-teal">
                office@evo-partners.ch
              </a>
            </p>
          </div>
          <div>
            <div className="font-semibold text-dark">Cookies und Tracking</div>
            <p className="mt-1">
              Diese Website verwendet Google Analytics 4 zur Analyse des Nutzerverhaltens. Sie können der Verwendung
              jederzeit widersprechen.
            </p>
          </div>
          <div>
            <div className="font-semibold text-dark">FINMA-Registernummer</div>
            <p className="mt-1">F01552602</p>
          </div>
        </div>

        <a
          href="/datenschutz"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-teal text-sm font-semibold underline"
        >
          Vollständige Datenschutzerklärung öffnen →
        </a>
      </div>
    </div>
  );
}
