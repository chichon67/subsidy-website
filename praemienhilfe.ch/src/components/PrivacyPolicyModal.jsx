// src/components/PrivacyPolicyModal.jsx
import { localePath } from '../i18n/index.js';

const CLOSE_LABEL = { de: 'Schliessen', en: 'Close', es: 'Cerrar' };
const TITLE = { de: 'Datenschutzbestimmungen', en: 'Privacy Policy', es: 'Política de privacidad' };
const FULL_POLICY_LINK = {
  de: 'Vollständige Datenschutzerklärung öffnen →',
  en: 'Open full privacy policy →',
  es: 'Abrir la política de privacidad completa →',
};

export default function PrivacyPolicyModal({ open, onClose, lang = 'de' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-dark/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-7 pt-6 pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-bold text-dark tracking-tight">{TITLE[lang] || TITLE.de}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={CLOSE_LABEL[lang] || CLOSE_LABEL.de}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md border border-[#D6DFE2] text-dark text-lg cursor-pointer hover:border-teal"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-5 text-[14.5px] leading-relaxed text-[#3D4A50]">
          <div>
            <div className="font-semibold text-dark">
              {lang === 'de' && 'Verantwortliche Stelle'}
              {lang === 'en' && 'Data Controller'}
              {lang === 'es' && 'Responsable del tratamiento'}
            </div>
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
            <div className="font-semibold text-dark">
              {lang === 'de' && 'Zweck der Datenerhebung'}
              {lang === 'en' && 'Purpose of Data Collection'}
              {lang === 'es' && 'Finalidad de la recopilación de datos'}
            </div>
            {lang === 'de' && (
              <p className="mt-1">
                Wir erheben personenbezogene Daten (Name, Telefon, E-Mail, Situation) ausschliesslich zu folgenden
                Zwecken:
              </p>
            )}
            {lang === 'en' && (
              <p className="mt-1">
                We collect personal data (name, phone, email, situation) exclusively for the following purposes:
              </p>
            )}
            {lang === 'es' && (
              <p className="mt-1">
                Recopilamos datos personales (nombre, teléfono, correo electrónico, situación) exclusivamente para
                los siguientes fines:
              </p>
            )}
            {lang === 'de' && (
              <ul className="mt-2 grid gap-1.5 list-disc pl-5">
                <li>Prüfung Ihres Anspruchs auf Prämienverbilligung</li>
                <li>Kontaktaufnahme durch EVO Partners GmbH oder akkreditierte FINMA-Partner für Beratungsleistungen im Bereich Krankenversicherung</li>
                <li>Zusammenstellung und Einreichung Ihres Dossiers beim zuständigen Kantonsamt</li>
              </ul>
            )}
            {lang === 'en' && (
              <ul className="mt-2 grid gap-1.5 list-disc pl-5">
                <li>Reviewing your entitlement to the premium reduction</li>
                <li>Being contacted by EVO Partners GmbH or accredited FINMA partners for advisory services in the health insurance field</li>
                <li>Compiling and submitting your dossier to the responsible cantonal office</li>
              </ul>
            )}
            {lang === 'es' && (
              <ul className="mt-2 grid gap-1.5 list-disc pl-5">
                <li>Comprobar su derecho a la reducción de primas</li>
                <li>Ser contactado por EVO Partners GmbH o por socios acreditados de la FINMA para servicios de asesoramiento en el ámbito del seguro de enfermedad</li>
                <li>Preparar y presentar su expediente ante la oficina cantonal competente</li>
              </ul>
            )}
          </div>
          <div>
            <div className="font-semibold text-dark">
              {lang === 'de' && 'Datenweitergabe'}
              {lang === 'en' && 'Data Sharing'}
              {lang === 'es' && 'Cesión de datos'}
            </div>
            {lang === 'de' && (
              <p className="mt-1">
                Ihre Daten können an akkreditierte FINMA-Partner weitergegeben werden, sofern dies zur Erbringung
                unserer Dienstleistungen erforderlich ist. Eine Weitergabe an Dritte zu Werbezwecken findet nicht
                statt.
              </p>
            )}
            {lang === 'en' && (
              <p className="mt-1">
                Your data may be shared with accredited FINMA partners where this is necessary to provide our
                services. Your data is not shared with third parties for advertising purposes.
              </p>
            )}
            {lang === 'es' && (
              <p className="mt-1">
                Sus datos pueden compartirse con socios acreditados de la FINMA cuando ello sea necesario para la
                prestación de nuestros servicios. Sus datos no se comparten con terceros con fines publicitarios.
              </p>
            )}
          </div>
          <div>
            <div className="font-semibold text-dark">
              {lang === 'de' && 'Speicherdauer'}
              {lang === 'en' && 'Retention Period'}
              {lang === 'es' && 'Plazo de conservación'}
            </div>
            {lang === 'de' && (
              <p className="mt-1">
                Ihre Daten werden so lange gespeichert, wie es für die Erbringung unserer Dienstleistungen erforderlich
                ist, längstens jedoch 5 Jahre.
              </p>
            )}
            {lang === 'en' && (
              <p className="mt-1">
                Your data is retained for as long as necessary to provide our services, but for no longer than 5
                years.
              </p>
            )}
            {lang === 'es' && (
              <p className="mt-1">
                Sus datos se conservan durante el tiempo necesario para la prestación de nuestros servicios, con un
                máximo de 5 años.
              </p>
            )}
          </div>
          <div>
            <div className="font-semibold text-dark">
              {lang === 'de' && 'Ihre Rechte'}
              {lang === 'en' && 'Your Rights'}
              {lang === 'es' && 'Sus derechos'}
            </div>
            {lang === 'de' && <p className="mt-1">Sie haben das Recht auf:</p>}
            {lang === 'en' && <p className="mt-1">You have the right to:</p>}
            {lang === 'es' && <p className="mt-1">Usted tiene derecho a:</p>}
            {lang === 'de' && (
              <ul className="mt-2 grid gap-1.5 list-disc pl-5">
                <li>Auskunft über Ihre gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer Daten</li>
                <li>Widerspruch gegen die Verarbeitung</li>
              </ul>
            )}
            {lang === 'en' && (
              <ul className="mt-2 grid gap-1.5 list-disc pl-5">
                <li>Information about your stored data</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Object to the processing</li>
              </ul>
            )}
            {lang === 'es' && (
              <ul className="mt-2 grid gap-1.5 list-disc pl-5">
                <li>Solicitar información sobre los datos almacenados</li>
                <li>Rectificación de datos inexactos</li>
                <li>Supresión de sus datos</li>
                <li>Oponerse al tratamiento</li>
              </ul>
            )}
            <p className="mt-2">
              {lang === 'de' && 'Anfragen richten Sie an: '}
              {lang === 'en' && 'Please send requests to: '}
              {lang === 'es' && 'Dirija sus solicitudes a: '}
              <a href="mailto:office@evo-partners.ch" className="text-teal">
                office@evo-partners.ch
              </a>
            </p>
          </div>
          <div>
            <div className="font-semibold text-dark">
              {lang === 'de' && 'Cookies und Tracking'}
              {lang === 'en' && 'Cookies and Tracking'}
              {lang === 'es' && 'Cookies y seguimiento'}
            </div>
            {lang === 'de' && (
              <p className="mt-1">
                Diese Website verwendet Google Analytics 4 zur Analyse des Nutzerverhaltens. Sie können der Verwendung
                jederzeit widersprechen.
              </p>
            )}
            {lang === 'en' && (
              <p className="mt-1">
                This website uses Google Analytics 4 to analyze user behavior. You may object to this use at any
                time.
              </p>
            )}
            {lang === 'es' && (
              <p className="mt-1">
                Este sitio web utiliza Google Analytics 4 para analizar el comportamiento de los usuarios. Puede
                oponerse a este uso en cualquier momento.
              </p>
            )}
          </div>
          <div>
            <div className="font-semibold text-dark">
              {lang === 'de' && 'FINMA-Registernummer'}
              {lang === 'en' && 'FINMA Registration Number'}
              {lang === 'es' && 'Número de registro FINMA'}
            </div>
            <p className="mt-1">F01552602</p>
          </div>
        </div>

        <a
          href={localePath(lang, '/datenschutz')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-teal text-sm font-semibold underline"
        >
          {FULL_POLICY_LINK[lang] || FULL_POLICY_LINK.de}
        </a>
      </div>
    </div>
  );
}
