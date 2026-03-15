import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, isMitarbeiter, isBuerger } from '../store/useStore';
import { useLangStore } from '../store/useLangStore';
import { useAuthStore } from '../store/useAuthStore';

import { Layout } from '../components/Layout';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceDot, Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Download, ArrowLeft, ChevronDown,
  Plus, X, Info, Pencil,
} from 'lucide-react';
import clsx from 'clsx';
// @ts-ignore
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

import type { DigitalizationCosts } from '../store/useStore';
import { calculatePerCaseSavings, generateTimeSeries } from '../lib/calculations';
import { ROUTES } from '../lib/routes';

/* ─── helpers ─── */

function formatMonthLabel(yyyyMm: string, lang: 'de' | 'en'): string {
  const [year, month] = yyyyMm.split('-').map(Number);
  const d = new Date(year, month - 1);
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { month: 'short', year: 'numeric' });
}

const BUERGER_HOURLY_RATE = 23.15;

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
    useCase, bpmnXml,
    stepDurations, setStepDuration, setStepActualBuerger, setStepActor, toggleStepActor,
    digitalSteps, setDigitalStep,
    salaryGroup, setSalaryGroup, hourlyRate, setHourlyRate,
    digitalizationCosts, setDigitalizationCosts,
    processIntervals, setProcessInterval, addProcessInterval, removeProcessInterval,
  } = store;
  const { t, language } = useLangStore();
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  const { stadtname } = useAuthStore();


  // Collapsible section state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bpmn: false, analog: false, salary: false, digital: false, costs: false, intervals: false,
  });
  const toggle = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  // BPMN read-only viewer
  const bpmnContainerRef = useRef<HTMLDivElement>(null);
  const bpmnViewerRef = useRef<any>(null);

  useEffect(() => {
    if (!openSections.bpmn || !bpmnContainerRef.current || !bpmnXml) return;

    const viewer = new NavigatedViewer({ container: bpmnContainerRef.current });
    bpmnViewerRef.current = viewer;

    viewer.importXML(bpmnXml).then(({ warnings }: any) => {
      if (warnings?.length) console.warn('BPMN warnings', warnings);
      const canvas = viewer.get('canvas');
      canvas.zoom('fit-viewport');
      canvas.zoom(canvas.zoom() * 0.85);

      // Add actor text labels below each task
      const elReg = viewer.get('elementRegistry') as any;
      const ovService = viewer.get('overlays') as any;
      elReg.filter((el: any) => el.type === 'bpmn:Task').forEach((element: any) => {
        const step = stepDurations.find(s => s.id === element.id);
        if (!step) return;
        const actorLabel = step.actor === 'Beide' ? (language === 'de' ? 'MA & BÜ' : 'Emp. & Cit.') : step.actor;
        const c = document.createElement('div');
        c.style.cssText = `width:${element.width}px;text-align:right;padding:1px 4px 0 0;pointer-events:none;`;
        c.innerHTML = `<span style="font-size:8px;font-family:Inter,sans-serif;color:#111;font-weight:500;">${actorLabel}</span>`;
        ovService.add(element.id, { position: { top: element.height + 2, left: 0 }, html: c });
      });
    });

    return () => { viewer.destroy(); };
  }, [openSections.bpmn, bpmnXml, stepDurations, language]);

  // Chart line visibility
  const [showMitarbeiter, setShowMitarbeiter] = useState(true);
  const [showBuerger, setShowBuerger] = useState(true);
  // Sicht toggle: Kommun = Mitarbeitersicht, Bürger = Bürgersicht
  const [sicht, setSicht] = useState<'Kommun' | 'Bürger'>('Kommun');

  // Derived values
  const perCase = useMemo(
    () => calculatePerCaseSavings(stepDurations, digitalSteps, hourlyRate),
    [stepDurations, digitalSteps, hourlyRate],
  );

  const timeSeries = useMemo(
    () => generateTimeSeries(processIntervals, perCase, digitalizationCosts, hourlyRate),
    [processIntervals, perCase, digitalizationCosts, hourlyRate],
  );

  const monthlyTimeData = useMemo(() => timeSeries.map(p => ({
    month: formatMonthLabel(p.month, language),
    [t.monthlyMitarbeiterH]: Math.round(p.mitarbeiterH * 10) / 10,
    [t.monthlyBuergerH]: Math.round(p.buergerH * 10) / 10,
  })), [timeSeries, language, t]);

  const monthlyEurData = useMemo(() => timeSeries.map(p => ({
    month: formatMonthLabel(p.month, language),
    [t.monthlyNetSavings]: Math.round(p.eurSav * 100) / 100,
  })), [timeSeries, language, t]);

  const timeChartData = useMemo(() => timeSeries.map(p => ({
    month: formatMonthLabel(p.month, language),
    [t.mitarbeiterHoursFreed]: Math.round(p.cumMitarbeiterH * 10) / 10,
    [t.buergerHoursFreed]: Math.round(p.cumBuergerH * 10) / 10,
  })), [timeSeries, language, t]);

  const eurChartData = useMemo(() => timeSeries.map((p, i) => ({
    idx: i,
    month: formatMonthLabel(p.month, language),
    [t.cumulativeNetSavings]: Math.round(p.cumEur * 100) / 100,
  })), [timeSeries, language, t]);

  const buergerMonthlyEurData = useMemo(() => timeSeries.map(p => ({
    month: formatMonthLabel(p.month, language),
    [t.buergerEurSavLabel]: Math.round(p.buergerH * BUERGER_HOURLY_RATE * 100) / 100,
  })), [timeSeries, language, t]);

  const buergerCumEurData = useMemo(() => {
    let cum = 0;
    return timeSeries.map((p, i) => {
      cum += p.buergerH * BUERGER_HOURLY_RATE;
      return { idx: i, month: formatMonthLabel(p.month, language), [t.buergerCumEurLabel]: Math.round(cum * 100) / 100 };
    });
  }, [timeSeries, language, t]);

  const breakEvenPoint = useMemo(() => {
    const crossIdx = timeSeries.findIndex((p, i) => i > 0 && timeSeries[i - 1].cumEur < 0 && p.cumEur >= 0);
    if (crossIdx <= 0) return null;
    const prev = timeSeries[crossIdx - 1];
    const curr = timeSeries[crossIdx];
    const fraction = Math.abs(prev.cumEur) / (Math.abs(prev.cumEur) + Math.abs(curr.cumEur));
    return {
      x: crossIdx - 1 + fraction,
      label: 'Break-Even',
    };
  }, [timeSeries, language]);

  // Break-even calculation
  const breakEven = useMemo(() => {
    if (timeSeries.length === 0) return null;
    const beIndex = timeSeries.findIndex(p => p.cumEur >= 0);
    if (beIndex === -1) return null;
    const beMonth = timeSeries[beIndex].month;
    const startMonth = timeSeries[0].month;
    // Calculate months between start and break-even
    const [sy, sm] = startMonth.split('-').map(Number);
    const [by, bm] = beMonth.split('-').map(Number);
    const monthsCount = (by - sy) * 12 + (bm - sm);
    return { month: beMonth, monthsCount };
  }, [timeSeries]);

  // ROI calculation
  const roi = useMemo(() => {
    if (timeSeries.length === 0) return null;
    const last = timeSeries[timeSeries.length - 1];
    const months = timeSeries.length;
    const annualCosts = digitalizationCosts.licenseCostYear + digitalizationCosts.maintenanceCostYear + digitalizationCosts.otherCostYear;
    const oneTimeCosts = digitalizationCosts.implementationCost + digitalizationCosts.trainingCost;
    const totalInvestment = oneTimeCosts + (annualCosts / 12) * months;
    if (totalInvestment === 0) return null;
    return Math.round((last.cumEur / totalInvestment) * 10000) / 100;
  }, [timeSeries, digitalizationCosts]);

  // Interval ranges for labeling charts
  const intervalRanges = useMemo(() => {
    const valid = processIntervals
      .filter(i => i.von && i.bis && i.volumen > 0)
      .sort((a, b) => a.von.localeCompare(b.von));
    if (valid.length < 2 || timeSeries.length === 0) return [];
    return valid.map(interval => {
      let count = 0;
      for (const p of timeSeries) {
        if (p.month >= interval.von && p.month <= interval.bis) count++;
      }
      return { label: interval.label, months: count };
    }).filter(r => r.months > 0);
  }, [processIntervals, timeSeries]);

  const intervalLabels = intervalRanges.length >= 2 ? (
    <div className="flex" style={{ paddingLeft: 70, paddingRight: 30, marginTop: 2 }}>
      {intervalRanges.map((r, i) => (
        <div key={i} style={{ flex: r.months }} className="text-center">
          <div className="border-t border-hb-gray/30 mx-1 pt-1">
            <span className="text-[10px] text-hb-gray/70 font-light">{r.label}</span>
          </div>
        </div>
      ))}
    </div>
  ) : null;

  // Helper to get actor for a digital step
  const getActorRaw = (id: string) => stepDurations.find(s => s.id === id)?.actor ?? null;
  const getActor = (id: string) => {
    const actor = getActorRaw(id);
    if (!actor) return '';
    if (actor === 'Beide') return `${t.employeeLabel} & ${t.citizenLabel}`;
    return actor;
  };
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
  const handleDownloadPdf = async () => {
    const INK = [17, 17, 17] as const;
    const GRAY = [102, 102, 102] as const;
    const LINE = [224, 224, 224] as const;
    const PAPER = [247, 247, 247] as const;
    const M = 20;
    const W = 170; // usable width
    const doc = new jsPDF();
    let y = 0;

    const eur = (v: number) => v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

    const check = (need: number) => { if (y + need > 280) { addFooter(); doc.addPage(); y = 20; } };

    const addFooter = () => {
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(t.pdfConfidential, 105, 290, { align: 'center' });
    };

    const heading = (num: string, text: string) => {
      check(16);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(`${num}  ${text}`, M, y);
      y += 2;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.4);
      doc.line(M, y, M + W, y);
      y += 9;
    };

    const label = (num: string, text: string) => {
      check(10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(`${num}  ${text.toUpperCase()}`, M, y);
      y += 7;
    };

    const kv = (key: string, val: string) => {
      check(6);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(key, M, y);
      doc.setTextColor(...INK);
      doc.text(val, M + W, y, { align: 'right' });
      y += 5;
    };

    const captureChart = async (id: string): Promise<{ img: string; w: number; h: number } | null> => {
      const el = document.getElementById(id);
      if (!el) return null;
      const canvas = await html2canvas(el, { backgroundColor: '#FFFFFF', scale: 2 });
      return { img: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height };
    };

    const pageHeader = () => {
      doc.setFillColor(...PAPER);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GRAY);
      doc.text('DiviData', M, 10);
      doc.text(stadtname || '', M + W, 10, { align: 'right' });
    };

    // ═══ PAGE 1: COVER + INPUTS ═══
    y = 55;
    doc.setFillColor(...PAPER);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text('DiviData', M, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(t.roiTitle, M, 30);
    doc.setFontSize(9);
    doc.text(new Date().toLocaleDateString(locale), M + W, 22, { align: 'right' });
    if (stadtname) doc.text(stadtname, M + W, 30, { align: 'right' });

    // ─── INPUTS ───
    heading('1.', t.pdfInputParams);

    // BPMN diagram inline – use saveSVG to get exact diagram bounds
    if (bpmnXml) {
      const tempBpmn = document.createElement('div');
      tempBpmn.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;overflow:hidden';
      document.body.appendChild(tempBpmn);
      const tempViewer = new NavigatedViewer({ container: tempBpmn });
      try {
        await tempViewer.importXML(bpmnXml);
        const { svg } = await (tempViewer as any).saveSVG();
        // Parse SVG viewBox to get natural diagram dimensions
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
        const svgEl = svgDoc.querySelector('svg');
        const vb = svgEl?.getAttribute('viewBox')?.split(' ').map(Number) ?? [0, 0, 800, 300];
        const svgW = vb[2] || 800;
        const svgH = vb[3] || 300;
        // Render SVG to canvas at high resolution
        const vbX = vb[0];
        const vbY = vb[1];
        const PAD = 20;
        const ACTOR_EXTRA = 24;
        const scale = 3;
        const canvasW = (svgW + PAD * 2) * scale;
        const canvasH = (svgH + PAD * 2 + ACTOR_EXTRA) * scale;

        // Gather task positions and actor labels from the temp viewer
        const elReg = tempViewer.get('elementRegistry');
        const pdfTasks = elReg.filter((el: any) => el.type === 'bpmn:Task').map((el: any) => {
          const step = stepDurations.find((s: any) => s.id === el.id);
          let actorLabel = '';
          if (step) {
            const mit = isMitarbeiter(step.actor);
            const bue = isBuerger(step.actor);
            if (mit && bue) actorLabel = `${t.employeeLabel} & ${t.citizenLabel}`;
            else if (mit) actorLabel = t.employeeLabel;
            else if (bue) actorLabel = t.citizenLabel;
          }
          return { x: el.x, y: el.y, width: el.width, height: el.height, actorLabel };
        });

        const dataUrl = await new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = canvasW;
            c.height = canvasH;
            const ctx = c.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.drawImage(img, PAD * scale, PAD * scale, svgW * scale, svgH * scale);

            // Draw actor labels below each task
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const fontSize = 8 * scale;
            ctx.font = `600 ${fontSize}px "Inter", system-ui, sans-serif`;
            pdfTasks.forEach((task: any) => {
              if (!task.actorLabel) return;
              const cx = (task.x + task.width / 2 - vbX + PAD) * scale;
              const cy = (task.y + task.height - vbY + PAD) * scale + 3 * scale;
              const textW = ctx.measureText(task.actorLabel).width;
              const pillPadX = 6 * scale;
              const pillH = 14 * scale;
              const pillW = textW + pillPadX * 2;
              const r = 3 * scale;
              const rx = cx - pillW / 2;
              const ry = cy;
              ctx.beginPath();
              ctx.moveTo(rx + r, ry);
              ctx.lineTo(rx + pillW - r, ry);
              ctx.quadraticCurveTo(rx + pillW, ry, rx + pillW, ry + r);
              ctx.lineTo(rx + pillW, ry + pillH - r);
              ctx.quadraticCurveTo(rx + pillW, ry + pillH, rx + pillW - r, ry + pillH);
              ctx.lineTo(rx + r, ry + pillH);
              ctx.quadraticCurveTo(rx, ry + pillH, rx, ry + pillH - r);
              ctx.lineTo(rx, ry + r);
              ctx.quadraticCurveTo(rx, ry, rx + r, ry);
              ctx.closePath();
              ctx.fillStyle = '#111111';
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.fillText(task.actorLabel, cx, cy + 2.5 * scale);
            });

            resolve(c.toDataURL('image/png'));
          };
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        });
        const bpmnRatio = canvasH / canvasW;
        let bpmnH = W * bpmnRatio;
        if (bpmnH > 120) bpmnH = 120;
        check(bpmnH + 10);
        label('1.1', t.resultsBpmnProcess);
        doc.addImage(dataUrl, 'PNG', M, y, W, bpmnH);
        y += bpmnH + 5;
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.3);
        doc.line(M, y, M + W, y);
        y += 8;
      } catch (e) { /* skip */ }
      tempViewer.destroy();
      document.body.removeChild(tempBpmn);
    }

    // Pre-calculate analog steps table height to avoid page split
    const beideCount = stepDurations.filter(s => s.actor === 'Beide').length;
    const analogTableH = 5 + 5 + (stepDurations.length + beideCount) * 4.5 + 21; // label + header + rows (Beide=2 rows) + sums
    check(analogTableH);

    label('1.2', t.resultsAnalogSteps);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(t.pdfStep, M, y);
    doc.text(t.pdfActor, M + 95, y);
    doc.text(t.pdfMinLabel, M + W, y, { align: 'right' });
    y += 1;
    doc.setDrawColor(...LINE);
    doc.line(M, y, M + W, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    for (const step of stepDurations) {
      if (step.actor === 'Beide') {
        // Mitarbeiter row
        doc.setTextColor(...INK);
        doc.text(doc.splitTextToSize(step.name, 85)[0], M, y);
        doc.setTextColor(...GRAY);
        doc.text(language === 'de' ? 'Mitarbeiter' : 'Employee', M + 95, y);
        doc.setTextColor(...INK);
        doc.text(step.actual.toString(), M + W, y, { align: 'right' });
        y += 4.5;
        // Bürger row
        doc.setTextColor(...INK);
        doc.text(doc.splitTextToSize(step.name, 85)[0], M, y);
        doc.setTextColor(...GRAY);
        doc.text(language === 'de' ? 'Bürger' : 'Citizen', M + 95, y);
        doc.setTextColor(...INK);
        doc.text(step.actualBuerger.toString(), M + W, y, { align: 'right' });
        y += 4.5;
      } else {
        doc.setTextColor(...INK);
        doc.text(doc.splitTextToSize(step.name, 90)[0], M, y);
        doc.setTextColor(...GRAY);
        doc.text(step.actor, M + 95, y);
        doc.setTextColor(...INK);
        doc.text(step.actual.toString(), M + W, y, { align: 'right' });
        y += 4.5;
      }
    }
    // Analog sums
    const analogMitarbeiterMin = stepDurations.filter(s => isMitarbeiter(s.actor)).reduce((a, s) => a + s.actual, 0);
    const analogBuergerMin = stepDurations.filter(s => isBuerger(s.actor)).reduce((a, s) => a + (s.actor === 'Beide' ? s.actualBuerger : s.actual), 0);
    y += 1;
    doc.setDrawColor(...LINE);
    doc.line(M + W - 30, y, M + W, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(language === 'de' ? 'Mitarbeiter' : 'Employee', M + 95, y);
    doc.setTextColor(...INK);
    doc.text(analogMitarbeiterMin.toString(), M + W, y, { align: 'right' });
    y += 4;
    doc.setTextColor(...GRAY);
    doc.text(language === 'de' ? 'Bürger' : 'Citizen', M + 95, y);
    doc.setTextColor(...INK);
    doc.text(analogBuergerMin.toString(), M + W, y, { align: 'right' });
    y += 6;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.15);
    doc.line(M, y, M + W, y);
    y += 6;

    // ─── Personalkosten ───
    // Pre-calculate salary section height: label(8) + 3 kv(15) + spacing(4) = 27
    check(27);
    label('1.3', t.resultsSalary);
    kv('TVöD EG', salaryGroup);
    kv(language === 'de' ? 'Stundenlohn' : 'Hourly Rate', `${hourlyRate} ${t.eurPerHour}`);
    const analogCostPerProcess = (analogMitarbeiterMin / 60) * hourlyRate;
    kv(t.costPerProcess, eur(analogCostPerProcess));
    y += 4;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.15);
    doc.line(M, y, M + W, y);
    y += 6;

    // Pre-calculate digital steps table height to avoid page split
    const digitalBeideCount = digitalSteps.filter(d => stepDurations.find(s => s.id === d.id)?.actor === 'Beide').length;
    const digitalTableH = 9 + 5 + (digitalSteps.length + digitalBeideCount) * 4.5 + 21; // heading + header + rows (Beide=2) + sums
    check(digitalTableH);

    label('1.4', t.resultsDigitalSteps);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(t.analogStepHeader, M, y);
    doc.text(t.digitalReplacementHeader, M + 80, y);
    doc.text(t.pdfDigMin, M + W, y, { align: 'right' });
    y += 1;
    doc.setDrawColor(...LINE);
    doc.line(M, y, M + W, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    for (const ds of digitalSteps) {
      const stepActor = stepDurations.find(s => s.id === ds.id)?.actor;
      if (stepActor === 'Beide') {
        // Mitarbeiter row
        doc.setTextColor(...INK);
        doc.text(doc.splitTextToSize(ds.name + ` (${language === 'de' ? 'MA' : 'Emp'})`, 75)[0], M, y);
        doc.setTextColor(...GRAY);
        doc.text(doc.splitTextToSize(ds.digitalReplacement || '—', 75)[0], M + 80, y);
        doc.setTextColor(...INK);
        doc.text(ds.digitalDuration.toString(), M + W, y, { align: 'right' });
        y += 4.5;
        // Bürger row
        doc.setTextColor(...INK);
        doc.text(doc.splitTextToSize(ds.name + ` (${language === 'de' ? 'BÜ' : 'Cit'})`, 75)[0], M, y);
        doc.setTextColor(...GRAY);
        doc.text(doc.splitTextToSize(ds.digitalReplacementBuerger || '—', 75)[0], M + 80, y);
        doc.setTextColor(...INK);
        doc.text(ds.digitalDurationBuerger.toString(), M + W, y, { align: 'right' });
        y += 4.5;
      } else {
        doc.setTextColor(...INK);
        doc.text(doc.splitTextToSize(ds.name, 75)[0], M, y);
        doc.setTextColor(...GRAY);
        doc.text(doc.splitTextToSize(ds.digitalReplacement || '—', 75)[0], M + 80, y);
        doc.setTextColor(...INK);
        doc.text(ds.digitalDuration.toString(), M + W, y, { align: 'right' });
        y += 4.5;
      }
    }
    // Digital sums
    const digitalMitarbeiterMin = digitalSteps.filter(d => { const a = stepDurations.find(s => s.id === d.id)?.actor; return a && isMitarbeiter(a); }).reduce((a, d) => a + d.digitalDuration, 0);
    const digitalBuergerMin = digitalSteps.filter(d => { const a = stepDurations.find(s => s.id === d.id)?.actor; return a && isBuerger(a); }).reduce((a, d) => { const actor = stepDurations.find(s => s.id === d.id)?.actor; return a + (actor === 'Beide' ? d.digitalDurationBuerger : d.digitalDuration); }, 0);
    y += 1;
    doc.setDrawColor(...LINE);
    doc.line(M + W - 30, y, M + W, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(language === 'de' ? 'Mitarbeiter' : 'Employee', M + 95, y);
    doc.setTextColor(...INK);
    doc.text(digitalMitarbeiterMin.toString(), M + W, y, { align: 'right' });
    y += 4;
    doc.setTextColor(...GRAY);
    doc.text(language === 'de' ? 'Bürger' : 'Citizen', M + 95, y);
    doc.setTextColor(...INK);
    doc.text(digitalBuergerMin.toString(), M + W, y, { align: 'right' });
    y += 6;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.15);
    doc.line(M, y, M + W, y);
    y += 6;

    // Pre-calculate Digitalisierungskosten height: label(5) + 3 yearly kv(15) + yearly sum(11) + 2 onetime kv(10) + onetime sum(11) = 52
    check(52);
    label('1.5', t.pdfDigCosts);
    kv(t.licenseCostYear, eur(digitalizationCosts.licenseCostYear) + (language === 'de' ? ' / Jahr' : ' / year'));
    kv(t.maintenanceCostYear, eur(digitalizationCosts.maintenanceCostYear) + (language === 'de' ? ' / Jahr' : ' / year'));
    kv(t.otherCostYear, eur(digitalizationCosts.otherCostYear) + (language === 'de' ? ' / Jahr' : ' / year'));
    // Yearly sum
    y += 1;
    doc.setDrawColor(...LINE);
    doc.line(M + W - 60, y, M + W, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(language === 'de' ? 'Jährlich gesamt' : 'Annual Total', M, y);
    doc.text(eur(totalAnnual) + (language === 'de' ? ' / Jahr' : ' / year'), M + W, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 8;
    kv(t.implementationCost, eur(digitalizationCosts.implementationCost) + (language === 'de' ? ' (einmalig)' : ' (one-time)'));
    kv(t.trainingCost, eur(digitalizationCosts.trainingCost) + (language === 'de' ? ' (einmalig)' : ' (one-time)'));
    // One-time sum
    y += 1;
    doc.setDrawColor(...LINE);
    doc.line(M + W - 60, y, M + W, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(language === 'de' ? 'Einmalig gesamt' : 'One-Time Total', M, y);
    doc.text(eur(totalOneTime) + (language === 'de' ? ' (einmalig)' : ' (one-time)'), M + W, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 5;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.15);
    doc.line(M, y, M + W, y);
    y += 10;

    // Pre-calculate process intervals height: label(5) + rows
    const validIntervals = processIntervals.filter(i => i.von && i.bis && i.volumen > 0);
    const intervalsTableH = 5 + validIntervals.length * 5;
    check(intervalsTableH);
    label('1.6', t.pdfProcessIntervals);
    for (const iv of validIntervals) {
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(`${formatMonthLabel(iv.von, language)} – ${formatMonthLabel(iv.bis, language)}`, M, y);
      doc.setTextColor(...GRAY);
      doc.text(`${iv.volumen} ${t.pdfCasesMonth}  |  ${iv.digitalisierungsquote}%`, M + W, y, { align: 'right' });
      y += 5;
    }

    addFooter();

    // ═══ PAGES 2+: RESULTS ═══

    // Sub-heading
    const subheading = (num: string, text: string) => {
      check(12);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...INK);
      doc.text(num + '  ' + text, M, y);
      y += 2;
      doc.setDrawColor(...LINE); doc.setLineWidth(0.3);
      doc.line(M, y, M + W, y);
      y += 8;
    };

    // Section label (bold uppercase, no number)
    const sLabel = (text: string) => {
      check(10);
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...INK);
      doc.text(text.toUpperCase(), M, y);
      y += 6;
    };

    const IMG_H = W * 0.4; // 320/800 aspect → 68mm at W=170

    const embedChart = async (id: string, title: string) => {
      check(IMG_H + 16);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...INK);
      doc.text(title, M, y); y += 5;
      const result = await captureChart(id);
      if (result) {
        doc.addImage(result.img, 'PNG', M, y, W, IMG_H);
        y += IMG_H + 9;
      }
    };

    // ── Page 2: heading + 2.1 Kommunalsicht ──
    doc.addPage(); y = 20; pageHeader();
    y += 8;
    heading('2.', t.navResults);

    subheading('2.1', language === 'de' ? 'Kommunalsicht' : 'Municipality View');

    sLabel(t.timeSavingsPerCase);
    kv(t.mitarbeiterMinSaved, perCase.mitarbeiterMinutesSaved.toFixed(1) + ' min');
    y += 2;

    sLabel(t.costSavingsPerCase);
    kv(t.costSavingsPerCase, eur(perCase.costSavedPerCase));
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text('= (' + perCase.mitarbeiterMinutesSaved.toFixed(1) + ' min / 60) × ' + hourlyRate + ' ' + t.eurPerHour, M, y);
    y += 8;

    sLabel(t.breakEvenLabel);
    if (breakEven) {
      kv(t.breakEvenDate, formatMonthLabel(breakEven.month, language));
      kv(t.breakEvenDuration, breakEven.monthsCount + ' ' + t.months);
    } else {
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
      doc.text(t.breakEvenNotReached, M, y); y += 5;
    }
    y += 2;

    sLabel(t.roiLabel);
    if (roi !== null && timeSeries.length > 0) {
      kv('ROI', roi.toFixed(1) + ' %');
      kv(t.roiPeriod,
        formatMonthLabel(timeSeries[0].month, language) + ' – ' +
        formatMonthLabel(timeSeries[timeSeries.length - 1].month, language) +
        ' (' + timeSeries.length + ' ' + t.months + ')'
      );
    } else {
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
      doc.text(t.roiNotAvailable, M, y); y += 5;
    }
    y += 6;

    if (timeSeries.length > 0) {
      await embedChart('pdf-mtb-monthly-time', t.monthlyTimeTitle);
      await embedChart('pdf-mtb-cum-time', t.timeProjectionTitle);
      await embedChart('pdf-mtb-monthly-eur', t.monthlyEurTitle);
      await embedChart('pdf-mtb-cum-eur', t.eurProjectionTitle);
    }

    addFooter();

    // ── Page: 2.2 Bürgersicht ──
    doc.addPage(); y = 20; pageHeader();
    y += 8;

    subheading('2.2', language === 'de' ? 'Bürgersicht' : 'Citizen View');

    sLabel(t.timeSavingsPerCase);
    kv(t.buergerMinSaved, perCase.buergerMinutesSaved.toFixed(1) + ' min');
    y += 2;

    sLabel(t.buergerCostSavingsPerCase);
    kv(t.buergerCostSavingsPerCase, eur(perCase.buergerMinutesSaved / 60 * BUERGER_HOURLY_RATE));
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text('= (' + perCase.buergerMinutesSaved.toFixed(1) + ' min / 60) × ' + BUERGER_HOURLY_RATE + ' ' + t.eurPerHour, M, y);
    y += 5;
    const noteLines = doc.splitTextToSize(t.buergerHourlyRateNote, W);
    doc.setFontSize(7); doc.text(noteLines, M, y);
    y += (noteLines.length * 3.5) + 6;

    if (timeSeries.length > 0) {
      await embedChart('pdf-bue-monthly-time', t.monthlyTimeTitle);
      await embedChart('pdf-bue-cum-time', t.timeProjectionTitle);
      await embedChart('pdf-bue-monthly-eur', t.monthlyEurTitle);
      await embedChart('pdf-bue-cum-eur', t.eurProjectionTitle);
    }

    addFooter();

    doc.save(`dividata-bericht-${(stadtname || 'report').toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };


  /* ─── RENDER ─── */
  return (
    <Layout>
      <div className="space-y-10 animate-fade-in pb-12">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>

            <h1 className="text-4xl font-light text-hb-ink mb-2">{t.roiTitle}</h1>
            <p className="text-hb-gray font-light">{t.projectedImpact} {stadtname}</p>
          </div>
          <div className="flex space-x-4">
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

          {/* 1 — BPMN Process */}
          <CollapsibleSection title={t.resultsBpmnProcess} isOpen={!!openSections.bpmn} onToggle={() => toggle('bpmn')}>
            <div className="mt-4 relative">
              <div ref={bpmnContainerRef} className="h-[400px] bg-white border border-hb-line" />
              <button
                onClick={() => navigate(ROUTES.ANALOG_PROCESS)}
                className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-white border border-hb-line text-hb-ink hover:border-hb-ink px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors shadow-sm"
              >
                <Pencil size={14} />
                {t.editBpmn}
              </button>
            </div>
          </CollapsibleSection>

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
                  {stepDurations.flatMap(step => {
                    const renderRow = (rowActor: 'Mitarbeiter' | 'Bürger') => {
                      const isMitRow = rowActor === 'Mitarbeiter';
                      const isBothActors = step.actor === 'Beide';
                      const duration = (isBothActors && !isMitRow) ? step.actualBuerger : step.actual;
                      const handleDuration = (v: number) =>
                        (isBothActors && !isMitRow) ? setStepActualBuerger(step.id, v) : setStepDuration(step.id, v);
                      return (
                        <tr key={`${step.id}_${rowActor}`} className="hover:bg-hb-paper transition-colors">
                          <td className="hb-table-cell px-4 font-medium text-sm">
                            {step.name}
                            {isBothActors && <span className="ml-2 text-xs text-hb-gray font-normal">({rowActor === 'Mitarbeiter' ? t.employeeLabel : t.citizenLabel})</span>}
                          </td>
                          <td className="hb-table-cell px-4">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => toggleStepActor(step.id, 'Mitarbeiter')}
                                className={clsx('px-3 py-1 text-xs rounded-l border border-hb-line transition-colors',
                                  isMitRow ? 'bg-hb-ink text-white border-hb-ink' : 'bg-transparent text-hb-gray hover:bg-hb-paper')}
                              >{t.employeeLabel}</button>
                              <button
                                onClick={() => toggleStepActor(step.id, 'Bürger')}
                                className={clsx('px-3 py-1 text-xs rounded-r border border-hb-line transition-colors',
                                  !isMitRow ? 'bg-hb-ink text-white border-hb-ink' : 'bg-transparent text-hb-gray hover:bg-hb-paper')}
                              >{t.citizenLabel}</button>
                            </div>
                          </td>
                          <td className="hb-table-cell px-4 text-right">
                            <input type="number" min="0" value={duration || ''}
                              onChange={e => handleDuration(parseFloat(e.target.value) || 0)}
                              className="bg-transparent border-b border-hb-line w-20 text-right focus:border-hb-ink focus:outline-none py-1 transition-colors" />
                          </td>
                        </tr>
                      );
                    };
                    return step.actor === 'Beide'
                      ? [renderRow('Mitarbeiter'), renderRow('Bürger')]
                      : [renderRow(step.actor === 'Bürger' ? 'Bürger' : 'Mitarbeiter')];
                  })}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>

          {/* 1b — Salary */}
          <CollapsibleSection title={t.resultsSalary} isOpen={!!openSections.salary} onToggle={() => toggle('salary')}>
            <div className="mt-4">
              <label className="block text-xs font-medium text-hb-gray uppercase tracking-wider mb-4">{t.tariffGroup}</label>
              <div className="flex items-center gap-6 p-4 border border-hb-line">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-light">TVöD EG</span>
                  <input type="text" value={salaryGroup}
                    onChange={e => setSalaryGroup(e.target.value)}
                    className="bg-transparent border-b border-hb-line w-16 text-center focus:border-hb-ink focus:outline-none text-sm transition-colors"
                    placeholder="6" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={hourlyRate || ''}
                    onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-b border-hb-line w-16 text-right focus:border-hb-ink focus:outline-none text-sm transition-colors"
                    placeholder="48" />
                  <span className="text-xs text-hb-gray">{t.eurPerHour}</span>
                </div>
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
                    <th className="hb-table-header px-4 pt-4 text-right">{t.digitalTimeHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hb-line">
                  {digitalSteps.flatMap(step => {
                    const actor = getActorRaw(step.id);
                    const analogStep = stepDurations.find(s => s.id === step.id);
                    if (actor === 'Beide') {
                      return [
                        <tr key={`${step.id}_MA`} className="hover:bg-hb-paper transition-colors">
                          <td className="hb-table-cell px-4 font-medium text-sm">
                            {step.name} <span className="text-xs text-hb-gray font-normal">({t.employeeLabel})</span>
                          </td>
                          <td className="hb-table-cell px-4 text-center text-xs text-hb-gray">{t.employeeLabel}</td>
                          <td className="hb-table-cell px-4 text-right text-hb-gray">{analogStep?.actual ?? 0} min</td>
                          <td className="hb-table-cell px-4">
                            <input type="text" value={step.digitalReplacement}
                              onChange={e => setDigitalStep(step.id, { digitalReplacement: e.target.value })}
                              className="bg-transparent border-b border-transparent hover:border-hb-line focus:border-hb-ink focus:outline-none w-full py-1 transition-all text-sm" />
                          </td>
                          <td className="hb-table-cell px-4 text-right">
                            <input type="number" min="0" value={step.digitalDuration || ''}
                              onChange={e => setDigitalStep(step.id, { digitalDuration: parseFloat(e.target.value) || 0 })}
                              className="w-12 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 transition-colors" />
                          </td>
                        </tr>,
                        <tr key={`${step.id}_BU`} className="hover:bg-hb-paper transition-colors">
                          <td className="hb-table-cell px-4 font-medium text-sm">
                            {step.name} <span className="text-xs text-hb-gray font-normal">({t.citizenLabel})</span>
                          </td>
                          <td className="hb-table-cell px-4 text-center text-xs text-hb-gray">{t.citizenLabel}</td>
                          <td className="hb-table-cell px-4 text-right text-hb-gray">{analogStep?.actualBuerger ?? 0} min</td>
                          <td className="hb-table-cell px-4">
                            <input type="text" value={step.digitalReplacementBuerger}
                              onChange={e => setDigitalStep(step.id, { digitalReplacementBuerger: e.target.value })}
                              className="bg-transparent border-b border-transparent hover:border-hb-line focus:border-hb-ink focus:outline-none w-full py-1 transition-all text-sm" />
                          </td>
                          <td className="hb-table-cell px-4 text-right">
                            <input type="number" min="0" value={step.digitalDurationBuerger || ''}
                              onChange={e => setDigitalStep(step.id, { digitalDurationBuerger: parseFloat(e.target.value) || 0 })}
                              className="w-12 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 transition-colors" />
                          </td>
                        </tr>,
                      ];
                    }
                    return [
                      <tr key={step.id} className="hover:bg-hb-paper transition-colors">
                        <td className="hb-table-cell px-4 font-medium text-sm">{step.name}</td>
                        <td className="hb-table-cell px-4 text-center text-xs text-hb-gray">{getActor(step.id)}</td>
                        <td className="hb-table-cell px-4 text-right text-hb-gray">{analogStep?.actual ?? 0} min</td>
                        <td className="hb-table-cell px-4">
                          <input type="text" value={step.digitalReplacement}
                            onChange={e => setDigitalStep(step.id, { digitalReplacement: e.target.value })}
                            className="bg-transparent border-b border-transparent hover:border-hb-line focus:border-hb-ink focus:outline-none w-full py-1 transition-all text-sm" />
                        </td>
                        <td className="hb-table-cell px-4 text-right">
                          <input type="number" min="0" value={step.digitalDuration || ''}
                            onChange={e => setDigitalStep(step.id, { digitalDuration: parseFloat(e.target.value) || 0 })}
                            className="w-12 bg-transparent border-b border-hb-line text-right focus:border-hb-ink focus:outline-none py-1 transition-colors" />
                        </td>
                      </tr>,
                    ];
                  })}
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
                    <td className="hb-table-cell px-4 text-right font-medium">{totalAnnual.toLocaleString(locale)} €</td>
                  </tr>
                  <tr className="bg-hb-paper border-t border-hb-line">
                    <td className="hb-table-cell px-4 font-medium text-sm">{t.totalOneTimeCosts}</td>
                    <td className="hb-table-cell px-4 text-right">
                      <span className="text-xs font-mono text-hb-gray uppercase tracking-wider">{t.oneTimeLabel}</span>
                    </td>
                    <td className="hb-table-cell px-4 text-right font-medium">{totalOneTime.toLocaleString(locale)} €</td>
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
                  {processIntervals.map((interval, idx) => (
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
                            onChange={e => {
                              const bisVal = e.target.value;
                              setProcessInterval(interval.id, { bis: bisVal });
                              if (bisVal && idx < processIntervals.length - 1) {
                                const [y, m] = bisVal.split('-').map(Number);
                                const next = new Date(y, m); // month is 0-indexed, so m = bis_month+1
                                const nextVon = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
                                setProcessInterval(processIntervals[idx + 1].id, { von: nextVon });
                              }
                            }}
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

        {/* ── Results Section Heading + Sicht Toggle ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-hb-gray">{t.resultsSectionTitle}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-hb-gray uppercase tracking-wider font-medium">{language === 'de' ? 'Sicht' : 'View'}</span>
            <div className="flex border border-hb-line">
              <button
                onClick={() => setSicht('Kommun')}
                className={clsx('px-4 py-2 text-xs uppercase tracking-wider transition-colors',
                  sicht === 'Kommun' ? 'bg-hb-ink text-white' : 'bg-transparent text-hb-gray hover:bg-hb-paper')}
              >{language === 'de' ? 'Kommun' : 'Municipality'}</button>
              <button
                onClick={() => setSicht('Bürger')}
                className={clsx('px-4 py-2 text-xs uppercase tracking-wider transition-colors border-l border-hb-line',
                  sicht === 'Bürger' ? 'bg-hb-ink text-white' : 'bg-transparent text-hb-gray hover:bg-hb-paper')}
              >{t.citizenLabel}</button>
            </div>
            {/* Info tooltip */}
            <div className="relative group">
              <button className="text-hb-gray/50 hover:text-hb-gray transition-colors">
                <Info size={15} />
              </button>
              <div className="absolute right-0 top-6 z-50 w-64 p-3 bg-hb-ink text-white text-xs font-light leading-relaxed
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                {t.sichtToggleInfo}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            ROW 1 — ZEITERSPARNIS + KOSTENERSPARNIS
           ═══════════════════════════════════════ */}
        {sicht === 'Kommun' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="hb-card">

              <h3 className="text-lg font-light mb-6 mt-2">{t.timeSavingsPerCase}</h3>
              <div className="space-y-5">
                <div className="border-l-2 border-l-hb-ink pl-6">
                  <h4 className="text-xs text-hb-gray uppercase tracking-wider font-medium mb-2">{t.mitarbeiterMinSaved}</h4>
                  <p className="text-3xl font-display text-hb-ink">{perCase.mitarbeiterMinutesSaved.toFixed(1)} <span className="text-lg text-hb-gray font-light">min</span></p>
                  <p className="text-xs text-hb-gray/60 mt-1 font-mono">
                    {stepDurations.filter(s => isMitarbeiter(s.actor)).reduce((a, s) => a + s.actual, 0)} min (analog) &rarr; {digitalSteps.filter(d => { const a = stepDurations.find(s => s.id === d.id)?.actor; return a && isMitarbeiter(a); }).reduce((a, d) => a + d.digitalDuration, 0)} min (digital)
                  </p>
                </div>
              </div>
            </div>

            <div className="hb-card">

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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="hb-card">
              <h3 className="text-lg font-light mb-6 mt-2">{t.timeSavingsPerCase}</h3>
              <div className="border-l-2 border-l-hb-line pl-6">
                <h4 className="text-xs text-hb-gray uppercase tracking-wider font-medium mb-2">{t.buergerMinSaved}</h4>
                <p className="text-3xl font-display text-hb-ink">{perCase.buergerMinutesSaved.toFixed(1)} <span className="text-lg text-hb-gray font-light">min</span></p>
                <p className="text-xs text-hb-gray/60 mt-1 font-mono">
                  {stepDurations.filter(s => isBuerger(s.actor)).reduce((a, s) => a + (s.actor === 'Beide' ? s.actualBuerger : s.actual), 0)} min (analog) &rarr; {digitalSteps.filter(d => { const a = stepDurations.find(s => s.id === d.id)?.actor; return a && isBuerger(a); }).reduce((a, d) => { const actor = stepDurations.find(s => s.id === d.id)?.actor; return a + (actor === 'Beide' ? d.digitalDurationBuerger : d.digitalDuration); }, 0)} min (digital)
                </p>
              </div>
            </div>
            <div className="hb-card">
              <h3 className="text-lg font-light mb-6 mt-2">{t.buergerCostSavingsPerCase}</h3>
              <div className="border-l-2 border-l-hb-line pl-6">
                <p className="text-4xl font-display text-hb-ink">
                  {(perCase.buergerMinutesSaved / 60 * BUERGER_HOURLY_RATE).toFixed(2)} <span className="text-lg text-hb-gray font-light">€</span>
                </p>
              </div>
              <div className="flex items-start mt-6 pt-4 border-t border-hb-line/50">
                <Info className="h-4 w-4 text-hb-gray mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-xs text-hb-gray font-light leading-relaxed">{t.buergerHourlyRateNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            ROW 2 — BREAK-EVEN + ROI
           ═══════════════════════════════════════ */}
        {sicht === 'Kommun' && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hb-card">
            <h3 className="text-lg font-light mb-6">{t.breakEvenLabel}</h3>
            {breakEven ? (
              <div className="space-y-5">
                <div className="border-l-2 border-l-hb-ink pl-6">
                  <h4 className="text-xs text-hb-gray uppercase tracking-wider font-medium mb-2">{t.breakEvenDate}</h4>
                  <p className="text-3xl font-display text-hb-ink">
                    {formatMonthLabel(breakEven.month, language)}
                  </p>
                </div>
                <div className="border-l-2 border-l-hb-line pl-6">
                  <h4 className="text-xs text-hb-gray uppercase tracking-wider font-medium mb-2">{t.breakEvenDuration}</h4>
                  <p className="text-3xl font-display text-hb-ink">
                    {breakEven.monthsCount} <span className="text-lg text-hb-gray font-light">{t.months}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-hb-gray font-light">{t.breakEvenNotReached}</p>
            )}
            <div className="flex items-start mt-6 pt-4 border-t border-hb-line/50">
              <Info className="h-4 w-4 text-hb-gray mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-xs text-hb-gray font-light leading-relaxed">{t.breakEvenDesc}</p>
            </div>
          </div>

          <div className="hb-card">
            <h3 className="text-lg font-light mb-6">{t.roiLabel}</h3>
            {roi !== null && timeSeries.length > 0 ? (
              <div className="space-y-5">
                <div className="border-l-2 border-l-hb-ink pl-6">
                  <p className="text-4xl font-display text-hb-ink">
                    {roi.toFixed(1)} <span className="text-lg text-hb-gray font-light">%</span>
                  </p>
                </div>
                <div className="border-l-2 border-l-hb-line pl-6">
                  <h4 className="text-xs text-hb-gray uppercase tracking-wider font-medium mb-2">{t.roiPeriod}</h4>
                  <p className="text-xl font-display text-hb-ink">
                    {formatMonthLabel(timeSeries[0].month, language)} &ndash; {formatMonthLabel(timeSeries[timeSeries.length - 1].month, language)}
                  </p>
                  <p className="text-xs text-hb-gray mt-1 font-light">
                    {timeSeries.length} {t.months}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-hb-gray font-light">{t.roiNotAvailable}</p>
            )}
            <div className="flex items-start mt-6 pt-4 border-t border-hb-line/50">
              <Info className="h-4 w-4 text-hb-gray mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-xs text-hb-gray font-light leading-relaxed">{t.roiDesc}</p>
            </div>
          </div>
        </div>}

        {/* ═══════════════════════════════════════
            SECTION 4a — EINSPARUNGSPROGNOSE (ZEIT) — monatlich
           ═══════════════════════════════════════ */}
        <div className="hb-card">

          <h3 className="text-lg font-light mb-2 mt-2">{t.monthlyTimeTitle}</h3>

          {timeSeries.length === 0 ? (
            <div className="flex items-center gap-3 bg-hb-paper border border-hb-line p-4 mt-4 text-sm text-hb-gray font-light">
              <Info size={16} className="flex-shrink-0" />
              {t.noIntervalsWarning}
            </div>
          ) : (
            <div id="chart-monthly-time" className="mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTimeData} margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                    <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                    <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      label={{ value: t.hoursAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)} h`} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="square"
                      wrapperStyle={{ fontSize: 12, fontWeight: 300 }}
                      formatter={(value: string) => value === t.monthlyMitarbeiterH ? 'Mitarbeiter' : 'Bürger'}
                    />
                    {sicht === 'Kommun' && <Bar dataKey={t.monthlyMitarbeiterH} fill="#111111" name={t.monthlyMitarbeiterH} />}
                    {sicht === 'Bürger' && <Bar dataKey={t.monthlyBuergerH} fill="#444444" name={t.monthlyBuergerH} />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {intervalLabels}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            SECTION 4b — KUMULIERTE EINSPARUNGSPROGNOSE (ZEIT)
           ═══════════════════════════════════════ */}
        <div className="hb-card">

          <h3 className="text-lg font-light mb-2 mt-2">{t.timeProjectionTitle}</h3>

          {timeSeries.length === 0 ? (
            <div className="flex items-center gap-3 bg-hb-paper border border-hb-line p-4 mt-4 text-sm text-hb-gray font-light">
              <Info size={16} className="flex-shrink-0" />
              {t.noIntervalsWarning}
            </div>
          ) : (
            <>

              <div id="chart-cum-time">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeChartData} margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                      <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                        interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                      <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                        label={{ value: t.hoursAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                      <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)} h`} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="line"
                        wrapperStyle={{ fontSize: 12, fontWeight: 300 }}
                        payload={sicht === 'Kommun'
                          ? [{ value: t.mitarbeiterHoursFreed, type: 'line', color: '#111111' }]
                          : [{ value: t.buergerHoursFreed, type: 'line', color: '#444444' }]}
                      />
                      {sicht === 'Kommun' && (
                        <Line type="monotone" dataKey={t.mitarbeiterHoursFreed} stroke="#111111" strokeWidth={2}
                          dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#111111', strokeWidth: 2 } : false}
                          activeDot={{ r: 5, fill: '#111111' }} />
                      )}
                      {sicht === 'Bürger' && (
                        <Line type="monotone" dataKey={t.buergerHoursFreed} stroke="#444444" strokeWidth={2} strokeDasharray="4 2"
                          dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#444444', strokeWidth: 2 } : false}
                          activeDot={{ r: 5, fill: '#444444' }} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {intervalLabels}
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════
            SECTION 5a — EINSPARUNGSPROGNOSE (EUR) — monatlich
           ═══════════════════════════════════════ */}
        {sicht === 'Kommun' && <div className="hb-card">

          <h3 className="text-lg font-light mb-2 mt-2">{t.monthlyEurTitle}</h3>

          {timeSeries.length === 0 ? (
            <div className="flex items-center gap-3 bg-hb-paper border border-hb-line p-4 mt-4 text-sm text-hb-gray font-light">
              <Info size={16} className="flex-shrink-0" />
              {t.noIntervalsWarning}
            </div>
          ) : (
            <div id="chart-monthly-eur" className="mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyEurData} margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                    <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                    <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                      label={{ value: t.euroAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                    <ReferenceLine y={0} stroke="#E0E0E0" strokeDasharray="3 3" />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })} />
                    <Bar dataKey={t.monthlyNetSavings} fill="#111111" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {intervalLabels}
            </div>
          )}
          <div className="flex items-start mt-4 pt-4 border-t border-hb-line/50">
            <Info className="h-4 w-4 text-hb-gray mt-0.5 flex-shrink-0" />
            <p className="ml-3 text-xs text-hb-gray font-light leading-relaxed">{t.monthlyEurNote}</p>
          </div>
        </div>}

        {/* ═══════════════════════════════════════
            SECTION 5b — KUMULIERTE EINSPARUNGSPROGNOSE (EUR)
           ═══════════════════════════════════════ */}
        {sicht === 'Kommun' && <div className="hb-card">

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
                {t.totalOneTimeCosts}: {totalOneTime.toLocaleString(locale)} € &middot; {t.totalAnnualCosts}: {totalAnnual.toLocaleString(locale)} € {language === 'de' ? '/ Jahr' : '/ year'}
              </p>

              <div id="chart-cum-eur">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={eurChartData} margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                      <XAxis dataKey="idx" type="number" domain={[0, timeSeries.length - 1]}
                        ticks={eurChartData.map(d => d.idx)}
                        tickFormatter={(i: number) => eurChartData[i]?.month ?? ''}
                        stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                        interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                      <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                        label={{ value: t.euroAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                      <ReferenceLine y={0} stroke="#666666" strokeWidth={1.5} strokeDasharray="6 3" />
                      {breakEvenPoint && (
                        <ReferenceDot x={breakEvenPoint.x} y={0}
                          r={6} fill="#111111" stroke="#FFFFFF" strokeWidth={2}
                          label={{ value: breakEvenPoint.label, fill: '#111111', fontSize: 10, fontWeight: 600, position: 'top', offset: 14 }} />
                      )}
                      <Tooltip {...tooltipStyle}
                        labelFormatter={(i: number) => eurChartData[i]?.month ?? ''}
                        formatter={(value: number) => value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })} />
                      <Line type="monotone" dataKey={t.cumulativeNetSavings} stroke="#111111" strokeWidth={2}
                        dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#111111', strokeWidth: 2 } : false}
                        activeDot={{ r: 5, fill: '#111111' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {intervalLabels}
              </div>
            </>
          )}
          <div className="flex items-start mt-4 pt-4 border-t border-hb-line/50">
            <Info className="h-4 w-4 text-hb-gray mt-0.5 flex-shrink-0" />
            <p className="ml-3 text-xs text-hb-gray font-light leading-relaxed">{t.cumulativeEurNote}</p>
          </div>
        </div>}

        {/* ═══════════════════════════════════════
            SECTION 6a — EINSPARUNGSPROGNOSE (EUR) — BÜRGER
           ═══════════════════════════════════════ */}
        {sicht === 'Bürger' && <div className="hb-card">
          <h3 className="text-lg font-light mb-2 mt-2">{t.monthlyEurTitle}</h3>
          {timeSeries.length === 0 ? (
            <div className="flex items-center gap-3 bg-hb-paper border border-hb-line p-4 mt-4 text-sm text-hb-gray font-light">
              <Info size={16} className="flex-shrink-0" />
              {t.noIntervalsWarning}
            </div>
          ) : (
            <div className="mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buergerMonthlyEurData} margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                    <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                    <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                      label={{ value: t.euroAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                    <ReferenceLine y={0} stroke="#E0E0E0" strokeDasharray="3 3" />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })} />
                    <Bar dataKey={t.buergerEurSavLabel} fill="#444444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {intervalLabels}
            </div>
          )}
          <div className="flex items-start mt-4 pt-4 border-t border-hb-line/50">
            <Info className="h-4 w-4 text-hb-gray mt-0.5 flex-shrink-0" />
            <p className="ml-3 text-xs text-hb-gray font-light leading-relaxed">{t.buergerHourlyRateNote}</p>
          </div>
        </div>}

        {/* ═══════════════════════════════════════
            SECTION 6b — KUMULIERTE EINSPARUNGSPROGNOSE (EUR) — BÜRGER
           ═══════════════════════════════════════ */}
        {sicht === 'Bürger' && <div className="hb-card">
          <h3 className="text-lg font-light mb-2 mt-2">{t.eurProjectionTitle}</h3>
          {timeSeries.length === 0 ? (
            <div className="flex items-center gap-3 bg-hb-paper border border-hb-line p-4 mt-4 text-sm text-hb-gray font-light">
              <Info size={16} className="flex-shrink-0" />
              {t.noIntervalsWarning}
            </div>
          ) : (
            <div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={buergerCumEurData} margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                    <XAxis dataKey="idx" type="number" domain={[0, timeSeries.length - 1]}
                      ticks={buergerCumEurData.map(d => d.idx)}
                      tickFormatter={(i: number) => buergerCumEurData[i]?.month ?? ''}
                      stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                    <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                      tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                      label={{ value: t.euroAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                    <ReferenceLine y={0} stroke="#666666" strokeWidth={1.5} strokeDasharray="6 3" />
                    <Tooltip {...tooltipStyle}
                      labelFormatter={(i: number) => buergerCumEurData[i]?.month ?? ''}
                      formatter={(value: number) => value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })} />
                    <Line type="monotone" dataKey={t.buergerCumEurLabel} stroke="#444444" strokeWidth={2} strokeDasharray="4 2"
                      dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#444444', strokeWidth: 2 } : false}
                      activeDot={{ r: 5, fill: '#444444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {intervalLabels}
            </div>
          )}
          <div className="flex items-start mt-4 pt-4 border-t border-hb-line/50">
            <Info className="h-4 w-4 text-hb-gray mt-0.5 flex-shrink-0" />
            <p className="ml-3 text-xs text-hb-gray font-light leading-relaxed">{t.buergerHourlyRateNote}</p>
          </div>
        </div>}


        {/* ── Hidden off-screen charts for PDF capture ── */}
        {timeSeries.length > 0 && (
          <div style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {/* PDF Kommunal 1: Monthly Time */}
            <div id="pdf-mtb-monthly-time" style={{ width: 800, height: 320, background: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTimeData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                  <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    label={{ value: t.hoursAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)} h`} />
                  <Bar dataKey={t.monthlyMitarbeiterH} fill="#111111" name={t.monthlyMitarbeiterH} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* PDF Kommunal 2: Cumulative Time */}
            <div id="pdf-mtb-cum-time" style={{ width: 800, height: 320, background: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeChartData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                  <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    label={{ value: t.hoursAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)} h`} />
                  <Line type="monotone" dataKey={t.mitarbeiterHoursFreed} stroke="#111111" strokeWidth={2}
                    dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#111111', strokeWidth: 2 } : false}
                    activeDot={{ r: 5, fill: '#111111' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* PDF Kommunal 3: Monthly EUR */}
            <div id="pdf-mtb-monthly-eur" style={{ width: 800, height: 320, background: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEurData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                  <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                    label={{ value: t.euroAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                  <ReferenceLine y={0} stroke="#E0E0E0" strokeDasharray="3 3" />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })} />
                  <Bar dataKey={t.monthlyNetSavings} fill="#111111" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* PDF Kommunal 4: Cumulative EUR */}
            <div id="pdf-mtb-cum-eur" style={{ width: 800, height: 320, background: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eurChartData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="idx" type="number" domain={[0, timeSeries.length - 1]}
                    ticks={eurChartData.map(d => d.idx)}
                    tickFormatter={(i: number) => eurChartData[i]?.month ?? ''}
                    stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                  <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                    label={{ value: t.euroAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                  <ReferenceLine y={0} stroke="#666666" strokeWidth={1.5} strokeDasharray="6 3" />
                  {breakEvenPoint && (
                    <ReferenceDot x={breakEvenPoint.x} y={0}
                      r={6} fill="#111111" stroke="#FFFFFF" strokeWidth={2}
                      label={{ value: breakEvenPoint.label, fill: '#111111', fontSize: 10, fontWeight: 600, position: 'top', offset: 14 }} />
                  )}
                  <Tooltip {...tooltipStyle}
                    labelFormatter={(i: number) => eurChartData[i]?.month ?? ''}
                    formatter={(value: number) => value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })} />
                  <Line type="monotone" dataKey={t.cumulativeNetSavings} stroke="#111111" strokeWidth={2}
                    dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#111111', strokeWidth: 2 } : false}
                    activeDot={{ r: 5, fill: '#111111' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* PDF Bürger 1: Monthly Time */}
            <div id="pdf-bue-monthly-time" style={{ width: 800, height: 320, background: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTimeData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                  <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    label={{ value: t.hoursAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)} h`} />
                  <Bar dataKey={t.monthlyBuergerH} fill="#444444" name={t.monthlyBuergerH} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* PDF Bürger 2: Cumulative Time */}
            <div id="pdf-bue-cum-time" style={{ width: 800, height: 320, background: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeChartData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                  <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    label={{ value: t.hoursAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)} h`} />
                  <Line type="monotone" dataKey={t.buergerHoursFreed} stroke="#444444" strokeWidth={2} strokeDasharray="4 2"
                    dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#444444', strokeWidth: 2 } : false}
                    activeDot={{ r: 5, fill: '#444444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* PDF Bürger 3: Monthly EUR */}
            <div id="pdf-bue-monthly-eur" style={{ width: 800, height: 320, background: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buergerMonthlyEurData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                  <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                    label={{ value: t.euroAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                  <ReferenceLine y={0} stroke="#E0E0E0" strokeDasharray="3 3" />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })} />
                  <Bar dataKey={t.buergerEurSavLabel} fill="#444444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* PDF Bürger 4: Cumulative EUR */}
            <div id="pdf-bue-cum-eur" style={{ width: 800, height: 320, background: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buergerCumEurData} margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="idx" type="number" domain={[0, timeSeries.length - 1]}
                    ticks={buergerCumEurData.map(d => d.idx)}
                    tickFormatter={(i: number) => buergerCumEurData[i]?.month ?? ''}
                    stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    interval={timeSeries.length > 24 ? Math.floor(timeSeries.length / 12) : timeSeries.length > 12 ? 2 : 0} />
                  <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                    label={{ value: t.euroAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#666666', fontSize: 11 } }} />
                  <ReferenceLine y={0} stroke="#666666" strokeWidth={1.5} strokeDasharray="6 3" />
                  <Tooltip {...tooltipStyle}
                    labelFormatter={(i: number) => buergerCumEurData[i]?.month ?? ''}
                    formatter={(value: number) => value.toLocaleString(locale, { style: 'currency', currency: 'EUR' })} />
                  <Line type="monotone" dataKey={t.buergerCumEurLabel} stroke="#444444" strokeWidth={2} strokeDasharray="4 2"
                    dot={timeSeries.length <= 24 ? { r: 3, fill: '#FFFFFF', stroke: '#444444', strokeWidth: 2 } : false}
                    activeDot={{ r: 5, fill: '#444444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex justify-between border-t border-hb-line/50 pt-8">
          <button onClick={() => navigate(ROUTES.PROCESS_PARAMETERS)} className="hb-btn-secondary flex items-center">
            <ArrowLeft size={20} className="mr-2" />
            {t.back}
          </button>
        </div>
      </div>
    </Layout>
  );
};
