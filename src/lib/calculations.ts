import type { StepDuration, DigitalStep, ProcessInterval, DigitalizationCosts } from '../store/useStore';
import { isMitarbeiter, isBuerger } from '../store/useStore';

/* ─── helpers ─── */

function nextMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

/* ─── per-case savings ─── */

interface PerCaseSavings {
  mitarbeiterMinutesSaved: number;
  buergerMinutesSaved: number;
  costSavedPerCase: number;
}

export function calculatePerCaseSavings(
  stepDurations: StepDuration[],
  digitalSteps: DigitalStep[],
  hourlyRate: number,
): PerCaseSavings {
  let mitarbeiterSaved = 0;
  let buergerSaved = 0;

  for (const step of stepDurations) {
    const ds = digitalSteps.find(d => d.id === step.id);
    if (!ds) continue;
    if (isMitarbeiter(step.actor)) {
      mitarbeiterSaved += step.actual - ds.digitalDuration;
    }
    if (isBuerger(step.actor)) {
      const analogBuerger = step.actor === 'Beide' ? step.actualBuerger : step.actual;
      const digitalBuerger = step.actor === 'Beide' ? ds.digitalDurationBuerger : ds.digitalDuration;
      buergerSaved += analogBuerger - digitalBuerger;
    }
  }

  return {
    mitarbeiterMinutesSaved: mitarbeiterSaved,
    buergerMinutesSaved: buergerSaved,
    costSavedPerCase: (mitarbeiterSaved / 60) * hourlyRate,
  };
}

/* ─── monthly time-series ─── */

interface MonthlyPoint {
  month: string;
  mitarbeiterH: number;
  buergerH: number;
  eurSav: number;
  cumMitarbeiterH: number;
  cumBuergerH: number;
  cumEur: number;
}

export function generateTimeSeries(
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

    result.push({ month: cur, mitarbeiterH: mH, buergerH: bH, eurSav: eurSav - monthlyOverhead, cumMitarbeiterH: cumM, cumBuergerH: cumB, cumEur: cumE });
    cur = nextMonth(cur);
  }

  return result;
}

/* ─── compute all derived DB columns from store state ─── */

interface ProjectDerivedValues {
  analog_cost_per_process: number;
  analog_mitarbeiter_minutes: number;
  analog_buerger_minutes: number;
  digital_mitarbeiter_minutes: number;
  digital_buerger_minutes: number;
  digital_personnel_cost: number;
  yearly_total_cost: number;
  onetime_total_cost: number;
  mitarbeiter_minutes_saved_per_case: number;
  buerger_minutes_saved_per_case: number;
  cost_saving_per_case: number;
  breakeven_point: string | null;
  roi: number | null;
}

export function computeProjectDerivedValues(state: {
  stepDurations: StepDuration[];
  digitalSteps: DigitalStep[];
  hourlyRate: number;
  digitalizationCosts: DigitalizationCosts;
  processIntervals: ProcessInterval[];
}): ProjectDerivedValues {
  const { stepDurations, digitalSteps, hourlyRate, digitalizationCosts, processIntervals } = state;

  // Analog minutes
  const analogMitarbeiterMin = stepDurations
    .filter(s => isMitarbeiter(s.actor))
    .reduce((acc, s) => acc + s.actual, 0);
  const analogBuergerMin = stepDurations
    .filter(s => isBuerger(s.actor))
    .reduce((acc, s) => acc + (s.actor === 'Beide' ? s.actualBuerger : s.actual), 0);
  const analogCostPerProcess = (analogMitarbeiterMin / 60) * hourlyRate;

  // Digital minutes (weighted by digitalization percent)
  let digitalMitarbeiterMin = 0;
  let digitalBuergerMin = 0;
  for (const ds of digitalSteps) {
    const step = stepDurations.find(s => s.id === ds.id);
    if (!step) continue;
    if (isMitarbeiter(step.actor)) {
      digitalMitarbeiterMin += ds.digitalDuration;
    }
    if (isBuerger(step.actor)) {
      digitalBuergerMin += step.actor === 'Beide' ? ds.digitalDurationBuerger : ds.digitalDuration;
    }
  }
  const digitalPersonnelCost = (digitalMitarbeiterMin / 60) * hourlyRate;

  // Costs
  const yearlyTotalCost = digitalizationCosts.licenseCostYear
    + digitalizationCosts.maintenanceCostYear
    + digitalizationCosts.otherCostYear;
  const onetimeTotalCost = digitalizationCosts.implementationCost
    + digitalizationCosts.trainingCost;

  // Per-case savings
  const perCase = calculatePerCaseSavings(stepDurations, digitalSteps, hourlyRate);

  // Time series for breakeven + ROI
  const timeSeries = generateTimeSeries(processIntervals, perCase, digitalizationCosts, hourlyRate);

  // Breakeven
  let breakevenPoint: string | null = null;
  if (timeSeries.length > 0) {
    const beIndex = timeSeries.findIndex(p => p.cumEur >= 0);
    if (beIndex !== -1) {
      breakevenPoint = timeSeries[beIndex].month;
    }
  }

  // ROI
  let roi: number | null = null;
  if (timeSeries.length > 0) {
    const last = timeSeries[timeSeries.length - 1];
    const months = timeSeries.length;
    const totalInvestment = onetimeTotalCost + (yearlyTotalCost / 12) * months;
    if (totalInvestment > 0) {
      roi = Math.round((last.cumEur / totalInvestment) * 10000) / 100;
    }
  }

  return {
    analog_cost_per_process: analogCostPerProcess,
    analog_mitarbeiter_minutes: analogMitarbeiterMin,
    analog_buerger_minutes: analogBuergerMin,
    digital_mitarbeiter_minutes: digitalMitarbeiterMin,
    digital_buerger_minutes: digitalBuergerMin,
    digital_personnel_cost: digitalPersonnelCost,
    yearly_total_cost: yearlyTotalCost,
    onetime_total_cost: onetimeTotalCost,
    mitarbeiter_minutes_saved_per_case: perCase.mitarbeiterMinutesSaved,
    buerger_minutes_saved_per_case: perCase.buergerMinutesSaved,
    cost_saving_per_case: perCase.costSavedPerCase,
    breakeven_point: breakevenPoint,
    roi,
  };
}
