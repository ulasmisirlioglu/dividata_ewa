import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Activity, FileText, SlidersHorizontal, BarChart3, X, Loader2, Check, CloudOff } from 'lucide-react';
import { useLangStore } from '../store/useLangStore';
import { useStore } from '../store/useStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ROUTES } from '../lib/routes';

const Navbar: React.FC = () => {
  const saveStatus = useStore(s => s.saveStatus);
  const currentProjectId = useStore(s => s.currentProjectId);
  const { t } = useLangStore();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-hb-paper/90 backdrop-blur-sm z-50 border-b border-hb-line h-24 flex items-center">
      <div className="container mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="font-display font-semibold text-3xl tracking-tight">DIVIDATA</div>
          <span className="text-sm font-mono text-hb-gray tracking-widest uppercase">{t.navbarSubtitle}</span>
        </div>
        <div className="flex items-center gap-4 mr-8">
          {currentProjectId && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-hb-gray">
              {saveStatus === 'saving' && <><Loader2 size={14} className="animate-spin" /> {t.saveStatusSaving}</>}
              {saveStatus === 'saved' && <><Check size={14} className="text-green-600" /> {t.saveStatusSaved}</>}
              {saveStatus === 'error' && <><CloudOff size={14} className="text-red-500" /> {t.saveStatusError}</>}
            </div>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useLangStore();

  const steps = [
    { path: ROUTES.DASHBOARD, label: t.navDashboard, icon: LayoutDashboard },
    { path: ROUTES.ANALOG_PROCESS, label: t.navAnalog, icon: Activity },
    { path: ROUTES.EVALUATION, label: t.navEvaluation, icon: FileText },
    { path: ROUTES.PROCESS_PARAMETERS, label: t.navParams, icon: SlidersHorizontal },
    { path: ROUTES.RESULTS, label: t.navResults, icon: BarChart3 },
  ];

  const currentIndex = steps.findIndex(step => step.path === currentPath);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-hb-line hidden lg:block fixed left-0 top-24 bottom-0 bg-hb-paper/50 backdrop-blur-sm z-40 pl-8 pt-12">
      <div className="flex flex-col space-y-8">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <Link
              to={step.path}
              key={step.path}
              className="flex flex-col items-start min-w-[120px] group"
            >
              <span className={clsx(
                "font-mono text-[10px] mb-2 transition-colors group-hover:text-hb-ink",
                isActive ? "text-hb-ink" : "text-hb-gray/40"
              )}>
                0{index + 1}
              </span>
              <span className={clsx(
                "text-sm font-display tracking-tight uppercase transition-colors duration-300 group-hover:text-hb-ink",
                isActive ? "text-hb-ink border-b border-hb-ink pb-1" :
                isCompleted ? "text-hb-gray" :
                "text-hb-gray/30"
              )}>
                {step.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

const LegalModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; closeLabel: string }> = ({ isOpen, onClose, title, children, closeLabel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded shadow-xl flex flex-col mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-hb-line px-6 py-4">
          <h2 className="text-lg font-display font-medium">{title}</h2>
          <button onClick={onClose} className="text-hb-gray hover:text-hb-ink transition-colors p-1"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto px-6 py-6 text-sm text-hb-ink leading-relaxed prose prose-sm max-w-none">
          {children}
        </div>
        <div className="border-t border-hb-line px-6 py-3 text-right">
          <button onClick={onClose} className="hb-btn text-xs px-4 py-2 border border-hb-line hover:bg-hb-paper transition-colors">{closeLabel}</button>
        </div>
      </div>
    </div>
  );
};

const datenschutzDe = () => (
  <>
    <p className="text-xs text-hb-gray mb-4">Stand: März 2025 | MVP-Version (geschlossener Beta-Zugang)</p>
    <h3>1. Verantwortliche</h3>
    <p>Verantwortlich für die Verarbeitung personenbezogener Daten im Sinne der DSGVO sind:</p>
    <p><strong>Julia Wölfel, Ulas Misirlioglu, Felix Apel</strong><br />Kontakt: julia.woelfel@dividata.de</p>
    <p>DiviData befindet sich derzeit in der MVP-Phase (Minimum Viable Product) und wird ausschließlich ausgewählten kommunalen Testkunden zugänglich gemacht.</p>
    <h3>2. Was ist DiviData?</h3>
    <p>DiviData ist ein digitales Analyse-Tool für Kommunen und öffentliche Verwaltungen. Es ermöglicht kommunalen Mitarbeitern, analoge Verwaltungsprozesse zu modellieren, Digitalisierungspotenziale zu berechnen und Kosten-Nutzen-Analysen für Digitalisierungsvorhaben durchzuführen.</p>
    <h3>3. Welche Daten werden verarbeitet?</h3>
    <h4>3.1 Zugangsdaten</h4>
    <p>Für den Zugang zur Plattform werden folgende Daten verarbeitet:</p>
    <ul><li>Organisationsname der Kommune</li></ul>
    <p>Im MVP wird kein individueller E-Mail-basierter Login verwendet. Der Zugang erfolgt über einen gemeinsamen Organisations-Zugang.</p>
    <h4>3.2 Eingabedaten</h4>
    <ul>
      <li>Prozessbeschreibungen und Prozessschritte (analoge Verwaltungsprozesse)</li>
      <li>Zeitangaben (Dauer von Prozessschritten)</li>
      <li>Tarifgruppen und Stundenlohndaten</li>
      <li>Digitalisierungsparameter und Kostenangaben</li>
      <li>Projektbezeichnungen und Berechnungsergebnisse</li>
    </ul>
    <h4>3.3 Pseudonymisierung</h4>
    <p>Der Organisationsname wird in der Datenbank pseudonymisiert gespeichert.</p>
    <h3>4. Rechtsgrundlage der Verarbeitung</h3>
    <ul>
      <li>Art. 6 Abs. 1 lit. b DSGVO: Verarbeitung zur Durchführung eines Vertrags</li>
      <li>Art. 6 Abs. 1 lit. f DSGVO: Berechtigte Interessen von DiviData</li>
    </ul>
    <h3>5. Eingesetzte Drittdienste</h3>
    <h4>5.1 Supabase</h4>
    <p>Datenbank- und Authentifizierungsdienst. Hosting: EU (Frankfurt, Deutschland).</p>
    <h4>5.2 Railway</h4>
    <p>Hosting und Deployment der Anwendung.</p>
    <h3>6. Datensicherheit</h3>
    <ul>
      <li>Verschlüsselte Übertragung via HTTPS/TLS</li>
      <li>Pseudonymisierung der Organisationsnamen</li>
      <li>Hosting innerhalb der EU</li>
      <li>Zugangsbeschränkung</li>
    </ul>
    <h3>7. Datenweitergabe</h3>
    <p>Eine Weitergabe personenbezogener Daten an Dritte erfolgt nicht, außer an die genannten Auftragsverarbeiter oder bei gesetzlicher Verpflichtung.</p>
    <h3>8. Speicherdauer</h3>
    <p>Daten werden gespeichert, solange dies für die Erbringung des Dienstes notwendig ist. Im MVP-Betrieb werden alle Testdaten nach Abschluss der Testphase gelöscht.</p>
    <h3>9. Ihre Rechte (Betroffenenrechte)</h3>
    <ul>
      <li>Auskunftsrecht (Art. 15 DSGVO)</li>
      <li>Berichtigungsrecht (Art. 16 DSGVO)</li>
      <li>Löschungsrecht (Art. 17 DSGVO)</li>
      <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
      <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
      <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
    </ul>
    <p>Kontakt: julia.woelfel@dividata.de</p>
    <h3>10. Änderungen dieser Datenschutzerklärung</h3>
    <p>Da sich DiviData in aktiver Entwicklung befindet, kann sich diese Datenschutzerklärung ändern. Bei wesentlichen Änderungen werden Nutzer informiert.</p>
  </>
);

const datenschutzEn = () => (
  <>
    <p className="text-xs text-hb-gray mb-4">As of: March 2025 | MVP Version (closed beta access)</p>
    <h3>1. Data Controller</h3>
    <p>Responsible for the processing of personal data under GDPR:</p>
    <p><strong>Julia Wölfel, Ulas Misirlioglu, Felix Apel</strong><br />Contact: julia.woelfel@dividata.de</p>
    <p>DiviData is currently in the MVP phase (Minimum Viable Product) and is only accessible to selected municipal test customers.</p>
    <h3>2. What is DiviData?</h3>
    <p>DiviData is a digital analysis tool for municipalities and public administrations. It enables municipal employees to model analog administrative processes, calculate digitalization potential, and conduct cost-benefit analyses for digitalization projects.</p>
    <h3>3. What Data is Processed?</h3>
    <h4>3.1 Access Data</h4>
    <ul><li>Organization name of the municipality</li></ul>
    <p>The MVP does not use individual email-based login. Access is via a shared organizational login.</p>
    <h4>3.2 Input Data</h4>
    <ul>
      <li>Process descriptions and process steps (analog administrative processes)</li>
      <li>Time data (duration of process steps)</li>
      <li>Salary groups and hourly rate data</li>
      <li>Digitalization parameters and cost data</li>
      <li>Project names and calculation results</li>
    </ul>
    <h4>3.3 Pseudonymization</h4>
    <p>The organization name is stored pseudonymized in the database.</p>
    <h3>4. Legal Basis</h3>
    <ul>
      <li>Art. 6(1)(b) GDPR: Processing for contract performance</li>
      <li>Art. 6(1)(f) GDPR: Legitimate interests of DiviData</li>
    </ul>
    <h3>5. Third-Party Services</h3>
    <h4>5.1 Supabase</h4>
    <p>Database and authentication service. Hosting: EU (Frankfurt, Germany).</p>
    <h4>5.2 Railway</h4>
    <p>Application hosting and deployment.</p>
    <h3>6. Data Security</h3>
    <ul>
      <li>Encrypted transmission via HTTPS/TLS</li>
      <li>Pseudonymization of organization names</li>
      <li>Hosting within the EU</li>
      <li>Access restriction</li>
    </ul>
    <h3>7. Data Sharing</h3>
    <p>Personal data is not shared with third parties, except with the named processors or when legally required.</p>
    <h3>8. Data Retention</h3>
    <p>Data is stored as long as necessary for service provision. All test data will be deleted after the test phase.</p>
    <h3>9. Your Rights</h3>
    <ul>
      <li>Right of access (Art. 15 GDPR)</li>
      <li>Right to rectification (Art. 16 GDPR)</li>
      <li>Right to erasure (Art. 17 GDPR)</li>
      <li>Right to restriction (Art. 18 GDPR)</li>
      <li>Right to data portability (Art. 20 GDPR)</li>
      <li>Right to object (Art. 21 GDPR)</li>
    </ul>
    <p>Contact: julia.woelfel@dividata.de</p>
    <h3>10. Changes to this Privacy Policy</h3>
    <p>As DiviData is in active development, this privacy policy may change. Users will be informed of significant changes.</p>
  </>
);

const impressumDe = () => (
  <>
    <p className="text-xs text-hb-gray mb-4">Stand: März 2025 | MVP-Version (geschlossener Beta-Zugang)</p>
    <h3>Angaben gemäß § 5 TMG</h3>
    <p>Julia Wölfel<br />Liebigstraße 10B<br />80538 München</p>
    <p><strong>Vertreten durch:</strong> Julia Wölfel, Ulas Misirlioglu, Felix Apel</p>
    <h3>Kontakt</h3>
    <p>E-Mail: julia.woelfel@dividata.de</p>
    <h3>Hinweis zum Entwicklungsstatus</h3>
    <p>DiviData befindet sich derzeit in der MVP-Phase (Minimum Viable Product) und ist ausschließlich für ausgewählte kommunale Testkunden zugänglich. Eine Gründung des Unternehmens ist in Vorbereitung. Dieses Impressum wird nach erfolgter Gründung entsprechend aktualisiert.</p>
    <h3>Haftung für Inhalte</h3>
    <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
    <h3>Haftung für Links</h3>
    <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.</p>
  </>
);

const impressumEn = () => (
  <>
    <p className="text-xs text-hb-gray mb-4">As of: March 2025 | MVP Version (closed beta access)</p>
    <h3>Information pursuant to § 5 TMG</h3>
    <p>Julia Wölfel<br />Liebigstraße 10B<br />80538 Munich, Germany</p>
    <p><strong>Represented by:</strong> Julia Wölfel, Ulas Misirlioglu, Felix Apel</p>
    <h3>Contact</h3>
    <p>Email: julia.woelfel@dividata.de</p>
    <h3>Development Status</h3>
    <p>DiviData is currently in the MVP phase (Minimum Viable Product) and is exclusively accessible to selected municipal test customers. Company incorporation is in preparation. This legal notice will be updated accordingly after incorporation.</p>
    <h3>Liability for Content</h3>
    <p>As a service provider, we are responsible for our own content on these pages in accordance with § 7(1) TMG. According to §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored third-party information.</p>
    <h3>Liability for Links</h3>
    <p>Our website contains links to external third-party websites over whose content we have no influence. We therefore cannot accept any liability for this third-party content.</p>
  </>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showSidebar = location.pathname !== '/';
  const { t, language } = useLangStore();
  const [showDatenschutz, setShowDatenschutz] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);

  return (
    <div className="min-h-screen bg-hb-paper text-hb-ink flex flex-col font-sans relative">
      <Navbar />

      <div className="flex pt-24 min-h-screen">
        {showSidebar && <Sidebar />}
        <main className={clsx(
          "flex-grow ml-0 p-8 relative z-10 transition-all duration-300",
          showSidebar ? "lg:ml-64" : ""
        )}>
          <div className="max-w-6xl mx-auto pt-8">
            {children}
          </div>
        </main>
      </div>

      <footer className={clsx(
        "border-t border-hb-line py-8 bg-hb-paper relative z-10 transition-all duration-300",
        showSidebar ? "lg:ml-64" : ""
      )}>
        <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-mono text-hb-gray uppercase tracking-widest">
            &copy; {new Date().getFullYear()} DiviData &bull; {t.footerTagline}
          </span>
          <div className="flex items-center gap-6">
            <button onClick={() => setShowDatenschutz(true)}
              className="text-xs text-hb-gray hover:text-hb-ink transition-colors underline underline-offset-2">
              {t.footerDatenschutz}
            </button>
            <button onClick={() => setShowImpressum(true)}
              className="text-xs text-hb-gray hover:text-hb-ink transition-colors underline underline-offset-2">
              {t.footerImpressum}
            </button>
          </div>
        </div>
      </footer>

      <LegalModal isOpen={showDatenschutz} onClose={() => setShowDatenschutz(false)} title={t.footerDatenschutz} closeLabel={t.footerClose}>
        {language === 'de' ? datenschutzDe() : datenschutzEn()}
      </LegalModal>
      <LegalModal isOpen={showImpressum} onClose={() => setShowImpressum(false)} title={t.footerImpressum} closeLabel={t.footerClose}>
        {language === 'de' ? impressumDe() : impressumEn()}
      </LegalModal>
    </div>
  );
};
