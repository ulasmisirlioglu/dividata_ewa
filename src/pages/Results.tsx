import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { useAuthStore } from '../store/useAuthStore';
import { Layout } from '../components/Layout';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import jsPDF from 'jspdf';
import {
  Download, RefreshCcw, ArrowLeft, ChevronDown,
  Plus, X, Info,
} from 'lucide-react';
import clsx from 'clsx';
import { FigLabel } from '../components/Decorations';
import { saveProject } from '../lib/projectService';
import type { StepDuration, DigitalStep, ProcessInterval, DigitalizationCosts } from '../store/useStore';

/* ─── helpers ─── */

function nextMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

function formatMonthLabel(yyyyMm: string, lang: 'de' | 'en'): string {
  const [year, month] = yyyyMm.split('-').map(Number);
  const d = new Date(year, month - 1);
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { month: 'short', year: 'numeric' });
}

/* ─── calculation: per-case savings ─── */

interface PerCaseSavings {
  mitarbeiterMinutesSaved: number;
  buergerMinutesSaved: number;
  costSavedPerCase: number;
}

function calculatePerCaseSavings(
  stepDurations: StepDuration[],
  digitalSteps: DigitalStep[],
  hourlyRate: number,
): PerCaseSavings {
  let mitarbeiterSaved = 0;
  let buergerSaved = 0;

  for (const step of stepDurations) {
    const ds = digitalSteps.find(d => d.id === step.id);
    if (!ds) continue;
    // Pro Fall: dijital kanala giren vaka her adımı tamamen dijital sürede yapıyor
    // Kaç vakanın dijitale gittiğini interval digitalisierungsquote belirler
    const saved = step.actual - ds.digitalDuration;
    if (step.actor === 'Mitarbeiter') mitarbeiterSaved += saved;
    else buergerSaved += saved;
  }

  return {
    mitarbeiterMinutesSaved: mitarbeiterSaved,
    buergerMinutesSaved: buergerSaved,
    costSavedPerCase: (mitarbeiterSaved / 60) * hourlyRate,
  };
}

/* ─── calculation: monthly time-series ─── */

interface MonthlyPoint {
  month: string;
  cumMitarbeiterH: number;
  cumBuergerH: number;
  cumEur: number;
}

function generateTimeSeries(
  intervals: ProcessInterval[],
  perCase: PerCaseSavings,
  costs: DigitalizationCosts,
  hourlyRate: number,
): MonthlyPoint[] {
  const valid = intervals
    .filter(i => i.von && i.bis && i.volumen > 0)
    .sort((a, b) => a.von.localeCompare(b.von));

  if (valid.length === 0) return [];

  const startMonth = valid[0].von;
  const endMonth = valid[valid.length - 1].bis;
  if (!startMonth || !endMonth || endMonth < startMonth) return [];

  const annualCosts = costs.licenseCostYear + costs.maintenanceCostYear + costs.otherCostYear;
  const monthlyOverhead = annualCosts / 12;
  const oneTimeCosts = costs.implementationCost + costs.trainingCost;

  const result: MonthlyPoint[] = [];
  let cumM = 0;
  let cumB = 0;
  let cumE = -oneTimeCosts;

  let cur = startMonth;
  while (cur <= endMonth) {
    const interval = valid.find(i => cur >= i.von && cur <= i.bis);
    let mH = 0;
    let bH = 0;
    let eurSav = 0;

    if (interval) {
      const Q = interval.digitalisierungsquote / 100;
      const V = interval.volumen;
      mH = V * Q * perCase.mitarbeiterMinutesSaved / 60;
      bH = V * Q * perCase.buergerMinutesSaved / 60;
      eurSav = V * Q * (perCase.mitarbeiterMinutesSaved / 60) * hourlyRate;
    }

    cumM += mH;
    cumB += bH;
    cumE += eurSav - monthlyOverhead;

    result.push({ month: cur, cumMitarbeiterH: cumM, cumBuergerH: cumB, cumEur: cumE });
    cur = nextMonth(cur);
  }

  return result;
}

/* ─── CollapsibleSection ─── */

const CollapsibleSection: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, isOpen, onToggle, children }) => (
  <div className="border border-hb-line bg-white mb-3">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 hover:bg-hb-paper transition-colors"
    >
      <h3 className="text-sm font-medium uppercase tracking-wider text-hb-gray">{title}</h3>
      <ChevronDown size={18} className={clsx('text-hb-gray transition-transform duration-200', isOpen && 'rotate-180')} />
    </button>
    {isOpen && <div className="px-6 pb-6 border-t border-hb-line">{children}</div>}
  </div>
);

/* ═══════════════════════════════════════════
   RESULTS PAGE
   ═══════════════════════════════════════════ */

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const store = useStore();
  const {
    municipalityName, useCase,
    stepDurations, setStepDuration, setStepActor,
    digitalSteps, setDigitalStep,
    salaryGroup, setSalaryGroup, salaryRates, setSalaryRate,
    digitalizationCosts, setDigitalizationCosts,
    processIntervals, setProcessInterval, addProcessInterval, removeProcessInterval,
    reset,
  } = store;
  const { t, language } = useLangStore();
  const { userId } = useAuthStore();

  // Collapsible section state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    analog: false, salary: false, digital: false, costs: false, intervals: false,
  });
  const toggle = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Chart line visibility
  const [showMitarbeiter, setShowMitarbeiter] = useState(true);
  const [showBuerger, setShowBuerger] = useState(true);

  // Derived values
  const hourlyRate = salaryRates[salaryGroup] || 48;

  const perCase = useMemo(
    () => calculatePerCaseSavings(stepDurations, digitalSteps, hourlyRate),
    [stepDurations, digitalSteps, hourlyRate],
  );

  const timeSeries = useMemo(
    () => generateTimeSeries(processIntervals, perCase, digitalizationCosts, hourlyRate),
    [processIntervals, perCase, digitalizationCosts, hourlyRate],
  );

  const timeChartData = useMemo(() => timeSeries.map(p => ({
    month: formatMonthLabel(p.month, language),
    [t.mitarbeiterHoursFreed]: Math.round(p.cumMitarbeiterH * 10) / 10,
    [t.buergerHoursFreed]: Math.round(p.cumBuergerH * 10) / 10,
  })), [timeSeries, language, t]);

  const eurChartData = useMemo(() => timeSeries.map(p => ({
    month: formatMonthLabel(p.month, language),
    [t.cumulativeNetSavings]: Math.round(p.cumEur * 100) / 100,
  })), [timeSeries, language, t]);

  // Helper to get actor for a digital step
  const getActor = (id: string) => stepDurations.find(s => s.id === id)?.actor ?? '';
  const getAnalogDur = (id: string) => stepDurations.find(s => s.id === id)?.actual ?? 0;

  // Cost table fields
  const costFields: { key: keyof DigitalizationCosts; label: string; type: string }[] = [
    { key: 'licenseCostYear', label: t.licenseCostYear, type: t.annualLabel },
    { key: 'maintenanceCostYear', label: t.maintenanceCostYear, type: t.annualLabel },
    { key: 'otherCostYear', label: t.otherCostYear, type: t.annualLabel },
    { key: 'implementationCost', label: t.implementationCost, type: t.oneTimeLabel },
    { key: 'trainingCost', label: t.trainingCost, type: t.oneTimeLabel },
  ];
  const totalAnnual = digitalizationCosts.licenseCostYear + digitalizationCosts.maintenanceCostYear + digitalizationCosts.otherCostYear;
  const totalOneTime = digitalizationCosts.implementationCost + digitalizationCosts.trainingCost;

  // Tooltip styling shared
  const tooltipStyle = {
    contentStyle: { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#111111', fontFamily: 'Inter', fontSize: '12px' } as React.CSSProperties,
    itemStyle: { color: '#111111' } as React.CSSProperties,
  };

  /* PDF */
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`DiviData Bericht: ${municipalityName}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Anwendungsfall: ${useCase}`, 20, 30);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 20, 36);
    doc.setFontSize(16);
    doc.text('Ergebnisse pro Fall', 20, 50);
    doc.setFontSize(12);
    doc.text(`${t.mitarbeiterMinSaved}: ${perCase.mitarbeiterMinutesSaved.toFixed(1)} min`, 20, 60);
    doc.text(`${t.buergerMinSaved}: ${perCase.buergerMinutesSaved.toFixed(1)} min`, 20, 66);
    doc.text(`${t.costSavingsPerCase}: ${perCase.costSavedPerCase.toFixed(2)} EUR`, 20, 72);
    if (timeSeries.length > 0) {
      const last = timeSeries[timeSeries.length - 1];
      doc.setFontSize(16);
      doc.text('Kumulierte Prognose', 20, 88);
      doc.setFontSize(12);
      doc.text(`${t.mitarbeiterHoursFreed}: ${last.cumMitarbeiterH.toFixed(0)} h`, 20, 98);
      doc.text(`${t.buergerHoursFreed}: ${last.cumBuergerH.toFixed(0)} h`, 20, 104);
      doc.text(`${t.cumulativeNetSavings}: ${last.cumEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`, 20, 110);
    }
    doc.text('Dieser Bericht wurde von DiviData erstellt.', 20, 280);
    doc.save('dividata-report.pdf');
  };

  /* Auto-save */
  React.useEffect(() => {
    if (userId) {
      saveProject(userId, {
        municipalityName, useCase,
        bpmnXml: useStore.getState().bpmnXml,
        stepDurations, digitalSteps, salaryGroup, monthlyVolume: store.monthlyVolume, digitalizationCosts,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── RENDER ─── */
  return (
    <Layout>
      <div className="space-y-10 animate-fade-in pb-12">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <FigLabel>{t.figure50}</FigLabel>
            <h1 className="text-4xl font-light text-hb-ink mb-2">{t.roiTitle}</h1>
            <p className="text-hb-gray font-light">{t.projectedImpact} {municipalityName}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => { if (confirm(t.reset + '?')) { reset(); window.location.href = '/dashboard'; } }}
              className="hb-btn-secondary text-hb-gray hover:text-hb-ink px-4 py-2 transition-colors flex items-center border-transparent hover:border-transparent"
            >
              <RefreshCcw size={18} className="mr-2" />
              {t.reset}
            </button>
            <button onClick={handleDownloadPdf} className="hb-btn-primary flex items-center shadow-lg shadow-black/5">
              <Download size={20} className="mr-2" />
              {t.downloadReport}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 1 — EDITABLE INPUTS
           ═══════════════════════════════════════ */}
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-hb-gray mb-4">{t.resultsInputsTitle}</h2>

          {/* 1a — Analog Steps */}
          <CollapsibleSection title={t.resultsAnalogSteps} isOpen={!!openSections.analog} onToggle={() => toggle('analog')}>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="hb-table-header px-4 pt-4">{t.stepNameHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-center">{t.actorHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-right">{t.estimateHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hb-line">
                  {stepDurations.map(step => (
                    <tr key={step.id} className="hover:bg-hb-paper transition-colors">
                      <td className="hb-table-cell px-4 font-medium text-sm">{step.name}</td>
                      <td className="hb-table-cell px-4">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setStepActor(step.id, 'Mitarbeiter')}
                            className={clsx('px-3 py-1 text-xs rounded-l border border-hb-line transition-colors',
                              step.actor === 'Mitarbeiter' ? 'bg-hb-ink text-white border-hb-ink' : 'bg-transparent text-hb-gray hover:bg-hb-paper')}
                          >Mitarbeiter</button>
                          <button
                            onClick={() => setStepActor(step.id, 'Bürger')}
                            className={clsx('px-3 py-1 text-xs rounded-r border border-hb-line transition-colors',
                              step.actor === 'Bürger' ? 'bg-hb-ink text-white border-hb-ink' : 'bg-transparent text-hb-gray hover:bg-hb-paper')}
                          >Bürger</button>
                        </div>
                      </td>
                      <td className="hb-table-cell px-4 text-right">
                        <input type="number" min="0" value={step.actual || ''}
                          onChange={e => setStepDuration(step.id, parseFloat(e.target.value) || 0)}
                          className="bg-transparent border-b border-hb-line w-20 text-right focus:border-hb-ink focus:outline-none py-1 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>

          {/* 1b — Salary */}
          <CollapsibleSection title={t.resultsSalary} isOpen={!!openSections.salary} onToggle={() => toggle('salary')}>
            <div className="mt-4">
              <label className="block text-xs font-medium text-hb-gray uppercase tracking-wider mb-4">{t.tariffGroup}</label>
              <div className="grid grid-cols-2 gap-3">
                {['TVöD EG 5', 'TVöD EG 6', 'TVöD EG 7', 'TVöD EG 8'].map(group => (
                  <label key={group} className={clsx(
                    'flex items-center justify-between p-4 border cursor-pointer transition-all duration-200',
                    salaryGroup === group ? 'border-hb-ink bg-hb-paper' : 'border-hb-line hover:border-hb-gray',
                  )}>
                    <div className="flex items-center">
                      <input type="radio" name="salaryGroupResults" checked={salaryGroup === group}
                        onChange={() => setSalaryGroup(group)} className="hidden" />
                      <div className={clsx('w-4 h-4 rounded-full border mr-3 flex items-center justify-center',
                        salaryGroup === group ? 'border-hb-ink' : 'border-hb-gray')}>
                        {salaryGroup === group && <div className="w-2 h-2 rounded-full bg-hb-ink" />}
                      </div>
                      <span className="text-sm font-light">{group}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="number" min="0" value={salaryRates[group] || ''}
                        onChange={e => { e.stopPropagation(); setSalaryRate(group, parseFloat(e.target.value) || 0); }}
                        onClick={e => e.stopPropagation()}
                        className="bg-transparent border-b border-hb-line w-14 text-right focus:border-hb-ink focus:outline-none text-sm transition-colors" />
                      <span className="text-xs text-hb-gray">{t.eurPerHour}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* 1c — Digital Steps */}
          <CollapsibleSection title={t.resultsDigitalSteps} isOpen={!!openSections.digital} onToggle={() => toggle('digital')}>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="hb-table-header px-4 pt-4">{t.analogStepHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-center">{t.actorHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-right">{t.analogTimeHeader}</th>
                    <th className="hb-table-header px-4 pt-4">{t.digitalReplacementHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-right">{t.digitalizationPercentHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-right">{t.digitalTimeHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hb-line">
                  {digitalSteps.map(step => (
                    <tr key={step.id} className="hover:bg-hb-paper transition-colors">
                      <td className="hb-table-cell px-4 font-medium text-sm">{step.name}</td>
                      <td className="hb-table-cell px-4 text-center text-xs text-hb-gray">{getActor(step.id)}</td>
                      <td className="hb-table-cell px-4 text-right text-hb-gray">{getAnalogDur(step.id)} min</td>
                      <td className="hb-table-cell px-4">
                        <input type="text" value={step.digitalReplacement}
                          onChange={e => setDigitalStep(step.id, { digitalReplacement: e.target.value })}
                          className="bg-transparent border-b border-transparent hover:border-hb-line focus:border-hb-ink focus:outline-none w-full py-1 transition-all text-sm" />
                      </td>
                      <td className="hb-table-cell px-4 text-right">
                        <div className="flex items-center justify-end">
                          <input type="number" min="0" max="100"
                            value={step.digitalizationPercent}
                            onChange={e => setDigitalStep(step.id, { digitalizationPercent: parseFloat(e.target.value) || 0 })}
                            className="w-14 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 mr-1 transition-colors" />
                          <span className="text-hb-gray text-xs">%</span>
                        </div>
                      </td>
                      <td className="hb-table-cell px-4 text-right">
                        <input type="number" min="0" value={step.digitalDuration}
                          onChange={e => setDigitalStep(step.id, { digitalDuration: parseFloat(e.target.value) || 0 })}
                          className="w-12 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>

          {/* 1d — Digitalization Costs */}
          <CollapsibleSection title={t.resultsDigCosts} isOpen={!!openSections.costs} onToggle={() => toggle('costs')}>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="hb-table-header px-4 pt-4 text-left">{t.costPositionHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-right">{t.costTypeHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-right">{t.costAmountHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hb-line">
                  {costFields.map(field => (
                    <tr key={field.key} className="hover:bg-hb-paper transition-colors">
                      <td className="hb-table-cell px-4 font-medium text-sm">{field.label}</td>
                      <td className="hb-table-cell px-4 text-right">
                        <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">{field.type}</span>
                      </td>
                      <td className="hb-table-cell px-4 text-right">
                        <div className="flex items-center justify-end">
                          <input type="number" min="0" value={digitalizationCosts[field.key] || ''}
                            onChange={e => setDigitalizationCosts({ [field.key]: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-28 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 mr-2 transition-colors placeholder:text-hb-gray/40" />
                          <span className="text-hb-gray text-xs">€</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-hb-paper">
                    <td className="hb-table-cell px-4 font-medium text-sm">{t.totalAnnualCosts}</td>
                    <td className="hb-table-cell px-4 text-right">
                      <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">{t.annualLabel}</span>
                    </td>
                    <td className="hb-table-cell px-4 text-right font-medium">{totalAnnual.toLocaleString('de-DE')} €</td>
                  </tr>
                  <tr className="bg-hb-paper border-t border-hb-line">
                    <td className="hb-table-cell px-4 font-medium text-sm">{t.totalOneTimeCosts}</td>
                    <td className="hb-table-cell px-4 text-right">
                      <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">{t.oneTimeLabel}</span>
                    </td>
                    <td className="hb-table-cell px-4 text-right font-medium">{totalOneTime.toLocaleString('de-DE')} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CollapsibleSection>

          {/* 1e — Process Intervals */}
          <CollapsibleSection title={t.resultsIntervals} isOpen={!!openSections.intervals} onToggle={() => toggle('intervals')}>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="hb-table-header px-4 pt-4 text-left w-1/5"></th>
                    <th className="hb-table-header px-4 pt-4 text-left w-2/5">{t.paramsZeitraumHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-right w-1/5">{t.paramsVolumenHeader}</th>
                    <th className="hb-table-header px-4 pt-4 text-right w-1/5">{t.paramsQuoteHeader}</th>
                    <th className="hb-table-header px-4 pt-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hb-line">
                  {processIntervals.map(interval => (
                    <tr key={interval.id} className="hover:bg-hb-paper transition-colors">
                      <td className="hb-table-cell px-4 font-medium text-sm">{interval.label}</td>
                      <td className="hb-table-cell px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-hb-gray whitespace-nowrap">von</span>
                          <input type="month" value={interval.von}
                            onChange={e => setProcessInterval(interval.id, { von: e.target.value })}
                            onClick={e => (e.target as HTMLInputElement).showPicker()}
                            className="bg-transparent border-b border-hb-line hover:border-hb-gray focus:border-hb-ink focus:outline-none py-1 transition-all text-sm cursor-pointer" />
                          <span className="text-xs text-hb-gray whitespace-nowrap">bis</span>
                          <input type="month" value={interval.bis}
                            onChange={e => setProcessInterval(interval.id, { bis: e.target.value })}
                            onClick={e => (e.target as HTMLInputElement).showPicker()}
                            className="bg-transparent border-b border-hb-line hover:border-hb-gray focus:border-hb-ink focus:outline-none py-1 transition-all text-sm cursor-pointer" />
                        </div>
                      </td>
                      <td className="hb-table-cell px-4 text-right">
                        <input type="number" min="0" value={interval.volumen || ''}
                          onChange={e => setProcessInterval(interval.id, { volumen: parseFloat(e.target.value) || 0 })}
                          placeholder="—"
                          className="w-20 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 transition-colors placeholder:text-hb-gray/40" />
                      </td>
                      <td className="hb-table-cell px-4 text-right">
                        <div className="flex items-center justify-end">
                          <input type="number" min="0" max="100" value={interval.digitalisierungsquote || ''}
                            onChange={e => setProcessInterval(interval.id, { digitalisierungsquote: parseFloat(e.target.value) || 0 })}
                            placeholder="—"
                            className="w-14 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 mr-2 transition-colors placeholder:text-hb-gray/40" />
                          <span className="text-hb-gray text-xs">%</span>
                        </div>
                      </td>
                      <td className="hb-table-cell px-4 text-center">
                        <button onClick={() => removeProcessInterval(interval.id)}
                          className="text-hb-gray/40 hover:text-hb-ink transition-colors p-1">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addProcessInterval}
                className="w-full flex items-center justify-center py-3 text-sm text-hb-gray hover:text-hb-ink hover:bg-hb-paper transition-all border-t border-hb-line">
                <Plus size={16} className="mr-2" />
                {t.paramsAddInterval}
              </button>
            </div>
          </CollapsibleSection>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 2 — ZEITERSPARNIS PRO FALL
           ═══════════════════════════════════════ */}
        <div className="hb-card">
          <FigLabel>{t.figure51}</FigLabel>
          <h3 className="text-lg font-light mb-6 mt-2">{t.timeSavingsPerCase}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-l-2 border-l-hb-ink pl-6">
              <h4 className="text-xs text-hb-gray uppercase tracking-wider font-medium mb-2">{t.mitarbeiterMinSaved}</h4>
              <p className="text-3xl font-display text-hb-ink">{perCase.mitarbeiterMinutesSaved.toFixed(1)} <span className="text-lg text-hb-gray font-light">min</span></p>
              <p className="text-xs text-hb-gray/60 mt-1 font-mono">
                {stepDurations.filter(s => s.actor === 'Mitarbeiter').reduce((a, s) => a + s.actual, 0)} min (analog)
              </p>
            </div>
            <div className="border-l-2 border-l-hb-line pl-6">
              <h4 className="text-xs text-hb-gray uppercase tracking-wider font-medium mb-2">{t.buergerMinSaved}</h4>
              <p className="text-3xl font-display text-hb-ink">{perCase.buergerMinutesSaved.toFixed(1)} <span className="text-lg text-hb-gray font-light">min</span></p>
              <p className="text-xs text-hb-gray/60 mt-1 font-mono">
                {stepDurations.filter(s => s.actor === 'Bürger').reduce((a, s) => a + s.actual, 0)} min (analog)
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 3 — KOSTENERSPARNIS PRO FALL
           ═══════════════════════════════════════ */}
        <div className="hb-card">
          <FigLabel>{t.figure52}</FigLabel>
          <h3 className="text-lg font-light mb-6 mt-2">{t.costSavingsPerCase}</h3>
          <div className="border-l-2 border-l-hb-ink pl-6">
            <p className="text-4xl font-display text-hb-ink">{perCase.costSavedPerCase.toFixed(2)} <span className="text-lg text-hb-gray font-light">€</span></p>
            <p className="text-xs text-hb-gray mt-2 font-light">
              = ({perCase.mitarbeiterMinutesSaved.toFixed(1)} min / 60) &times; {hourlyRate} {t.eurPerHour}
            </p>
          </div>
          <div className="flex items-start mt-6 pt-4 border-t border-hb-line/50">
            <Info className="h-4 w-4 text-hb-gray mt-0.5 flex-shrink-0" />
            <p className="ml-3 text-xs text-hb-gray font-light leading-relaxed">{t.costSavingsPerCaseNote}</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 4 — KUMULIERTE EINSPARUNGSPROGNOSE (ZEIT)
           ═══════════════════════════════════════ */}
        <div className="hb-card">
          <FigLabel>{t.figure53}</FigLabel>
          <h3 className="text-lg font-light mb-2 mt-2">{t.timeProjectionTitle}</h3>

          {timeSeries.length === 0 ? (
            <div className="flex items-center gap-3 bg-hb-paper border border-hb-line p-4 mt-4 text-sm text-hb-gray font-light">
              <Info size={16} className="flex-shrink-0" />
              {t.noIntervalsWarning}
            </div>
          ) : (
            <>
              {/* Toggle legend */}
              <div className="flex items-center gap-6 mt-4 mb-6">
                <button onClick={() => setShowMitarbeiter(!showMitarbeiter)}
                  className={clsx('flex items-center gap-2 text-xs uppercase tracking-wider transition-opacity', !showMitarbeiter && 'opacity-30')}>
                  <span className="w-5 h-0.5 bg-hb-ink inline-block" />
                  {t.mitarbeiterHoursFreed}
                </button>
                <button onClick={() => setShowBuerger(!showBuerger)}
                  className={clsx('flex items-center gap-2 text-xs uppercase tracking-wider transition-opacity', !showBuerger && 'opacity-30')}>
                  <span className="w-5 h-0.5 bg-hb-gray inline-block" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #666 0, #666 4px, transparent 4px, transparent 6px)' }} />
                  {t.buergerHoursFreed}
                </button>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                    <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                    <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)} h`} />
                    {showMitarbeiter && (
                      <Line type="monotone" dataKey={t.mitarbeiterHoursFreed} stroke="#111111" strokeWidth={2}
                        dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#111111', strokeWidth: 2 } : false}
                        activeDot={{ r: 5, fill: '#111111' }} />
                    )}
                    {showBuerger && (
                      <Line type="monotone" dataKey={t.buergerHoursFreed} stroke="#666666" strokeWidth={2} strokeDasharray="4 2"
                        dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#666666', strokeWidth: 2 } : false}
                        activeDot={{ r: 5, fill: '#666666' }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════
            SECTION 5 — KUMULIERTE EINSPARUNGSPROGNOSE (EUR)
           ═══════════════════════════════════════ */}
        <div className="hb-card">
          <FigLabel>{t.figure40}</FigLabel>
          <h3 className="text-lg font-light mb-2 mt-2">{t.eurProjectionTitle}</h3>

          {timeSeries.length === 0 ? (
            <div className="flex items-center gap-3 bg-hb-paper border border-hb-line p-4 mt-4 text-sm text-hb-gray font-light">
              <Info size={16} className="flex-shrink-0" />
              {t.noIntervalsWarning}
            </div>
          ) : (
            <>
              {/* Summary line */}
              <p className="text-xs text-hb-gray font-light mt-2 mb-6">
                {t.totalOneTimeCosts}: {totalOneTime.toLocaleString('de-DE')} € &middot; {t.totalAnnualCosts}: {totalAnnual.toLocaleString('de-DE')} € / Jahr
              </p>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eurChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                    <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                    <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                    <ReferenceLine y={0} stroke="#E0E0E0" strokeDasharray="3 3" label={{ value: 'Break-Even', fill: '#666666', fontSize: 10, position: 'insideTopLeft' }} />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} />
                    <Line type="monotone" dataKey={t.cumulativeNetSavings} stroke="#111111" strokeWidth={2}
                      dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#111111', strokeWidth: 2 } : false}
                      activeDot={{ r: 5, fill: '#111111' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="flex justify-between border-t border-hb-line/50 pt-8">
          <button onClick={() => navigate('/process-parameters')} className="hb-btn-secondary flex items-center">
            <ArrowLeft size={20} className="mr-2" />
            {t.back}
          </button>
        </div>
      </div>
    </Layout>
  );
};
