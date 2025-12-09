import { create } from 'zustand';

type Language = 'de' | 'en';

interface Translation {
  // Navigation
  navStart: string;
  navAnalog: string;
  navEvaluation: string;
  navResults: string;
  
  // Onboarding
  heroTitle: string;
  heroSubtitle: string;
  municipalityLabel: string;
  municipalityPlaceholder: string;
  useCaseLabel: string;
  startMapping: string;

  // Analog Process
  mapProcessTitle: string;
  mapProcessDesc: string;
  stepDurationsTitle: string;
  stepDurationsDesc: string;
  stepNameHeader: string;
  suggestedHeader: string;
  estimateHeader: string;
  totalDuration: string;
  parametersTitle: string;
  parametersDesc: string;
  tariffGroup: string;
  monthlyVolume: string;
  casesPerMonth: string;
  back: string;
  nextStep: string;
  continueEvaluation: string;
  figure20: string;
  figure21: string;
  figure22: string;

  // Evaluation
  evalTitle: string;
  evalDesc: string;
  analogStepHeader: string;
  digitalReplacementHeader: string;
  analogTimeHeader: string;
  digitalizationHeader: string;
  digitalTimeHeader: string;
  weightedAvg: string;
  estimatedDigitalTime: string;
  assumptionTitle: string;
  assumptionDesc: string;
  calculateRoi: string;
  figure30: string;

  // Results
  roiTitle: string;
  projectedImpact: string;
  costSavingsYear: string;
  timeSavedCase: string;
  hoursFreedMonth: string;
  volume: string;
  processTimeComparison: string;
  processCostComparison: string;
  cumulativeSavings: string;
  downloadReport: string;
  reset: string;
  figure40: string;
  figure41: string;
  figure42: string;
  figure43: string;
  minPerCase: string;
  costPerCase: string;
  cumSavings: string;
  over5Years: string;
  fte: string;
  casesMonth: string;
}

const translations: Record<Language, Translation> = {
  de: {
    navStart: 'Start',
    navAnalog: 'Analoger Prozess',
    navEvaluation: 'Bewertung',
    navResults: 'Ergebnisse',
    
    heroTitle: 'Kommunale Effizienz messen.',
    heroSubtitle: 'DiviData berechnet den Return on Investment (ROI) für digitale öffentliche Dienste. Definieren Sie Ihren kommunalen Kontext, um mit der wissenschaftlichen Bewertung zu beginnen.',
    municipalityLabel: '01 — Name der Kommune',
    municipalityPlaceholder: 'z.B. Stadt München',
    useCaseLabel: '02 — Anwendungsfall',
    startMapping: 'Prozessierung starten',

    mapProcessTitle: 'Analogen Prozess abbilden',
    mapProcessDesc: 'Überprüfen und bearbeiten Sie den analogen Standardprozess. Drag & Drop von Elementen zur Anpassung.',
    stepDurationsTitle: 'Dauer der Schritte',
    stepDurationsDesc: 'Schätzen Sie die Zeit (in Minuten), die jeder Schritt im aktuellen analogen Prozess in Anspruch nimmt.',
    stepNameHeader: 'Schrittname',
    suggestedHeader: 'Vorschlag (min)',
    estimateHeader: 'Ihre Schätzung (min)',
    totalDuration: 'Gesamtdauer',
    parametersTitle: 'Prozessparameter',
    parametersDesc: 'Definieren Sie die mit diesem Prozess verbundenen Kosten und das Volumen.',
    tariffGroup: 'Tarifgruppe Personal',
    monthlyVolume: 'Monatliches Volumen',
    casesPerMonth: 'Fälle / Monat',
    back: 'Zurück',
    nextStep: 'Nächster Schritt',
    continueEvaluation: 'Weiter zur Bewertung',
    figure20: 'Abbildung 2.0',
    figure21: 'Abbildung 2.1',
    figure22: 'Abbildung 2.2',

    evalTitle: 'Digitale Prozessbewertung',
    evalDesc: 'Überprüfen Sie, wie sich die digitale Lösung (eWA) auf jeden Schritt auswirkt. Passen Sie die Digitalisierungsquote an, um die Auswirkungen auf die Effizienz zu sehen.',
    analogStepHeader: 'Analoger Schritt',
    digitalReplacementHeader: 'Digitaler Ersatz',
    analogTimeHeader: 'Analoge Zeit',
    digitalizationHeader: 'Digitalisierung %',
    digitalTimeHeader: 'Digitale Zeit (min)',
    weightedAvg: 'Gewichteter Durchschnitt',
    estimatedDigitalTime: 'Geschätzte digitale Zeit',
    assumptionTitle: 'Annahmemodell',
    assumptionDesc: 'Die Digitalisierungsquote stellt den Anteil der Fälle dar, die über den digitalen Weg bearbeitet werden. Die übrigen Fälle fallen automatisch auf die analoge Prozessdauer zurück.',
    calculateRoi: 'ROI berechnen',
    figure30: 'Abbildung 3.0',

    roiTitle: 'ROI-Berechnungsergebnisse',
    projectedImpact: 'Projizierte Auswirkung für',
    costSavingsYear: 'Kosteneinsparung / Jahr',
    timeSavedCase: 'Zeitersparnis / Fall',
    hoursFreedMonth: 'Freigesetzte Stunden / Monat',
    volume: 'Volumen',
    processTimeComparison: 'Vergleich der Prozesszeit (Minuten)',
    processCostComparison: 'Vergleich der Prozesskosten (EUR)',
    cumulativeSavings: 'Kumulierte Einsparungsprognose (5 Jahre)',
    downloadReport: 'Bericht herunterladen',
    reset: 'Zurücksetzen',
    figure40: 'Abbildung 4.0',
    figure41: 'Abbildung 4.1',
    figure42: 'Abbildung 4.2',
    figure43: 'Abbildung 4.3',
    minPerCase: 'Minuten pro Fall',
    costPerCase: 'Kosten pro Fall (€)',
    cumSavings: 'Kumulierte Einsparungen (€)',
    over5Years: 'über 5 Jahre',
    fte: 'VZÄ',
    casesMonth: 'Fälle / Monat',
  },
  en: {
    navStart: 'Start',
    navAnalog: 'Analog Process',
    navEvaluation: 'Evaluation',
    navResults: 'Results',
    
    heroTitle: 'Measure\nGovernment\nEfficiency.',
    heroSubtitle: 'DiviData calculates the Return on Investment (ROI) for digital public services. Define your municipality context to begin the scientific assessment.',
    municipalityLabel: '01 — Municipality Name',
    municipalityPlaceholder: 'e.g. Stadt München',
    useCaseLabel: '02 — Use Case',
    startMapping: 'Start Mapping',

    mapProcessTitle: 'Map the Analog Process',
    mapProcessDesc: 'Review and edit the standard analog process. Drag and drop elements to reflect the current physical workflow.',
    stepDurationsTitle: 'Step Durations',
    stepDurationsDesc: 'Estimate the time (in minutes) each step takes in the current analog process.',
    stepNameHeader: 'Step Name',
    suggestedHeader: 'Suggested (min)',
    estimateHeader: 'Your Estimate (min)',
    totalDuration: 'Total Duration',
    parametersTitle: 'Process Parameters',
    parametersDesc: 'Define the costs and volume associated with this process.',
    tariffGroup: 'Staff Tariff Group (Tarifgruppe)',
    monthlyVolume: 'Monthly Process Volume',
    casesPerMonth: 'cases / month',
    back: 'Back',
    nextStep: 'Next Step',
    continueEvaluation: 'Continue to Evaluation',
    figure20: 'Figure 2.0',
    figure21: 'Figure 2.1',
    figure22: 'Figure 2.2',

    evalTitle: 'Digital Process Evaluation',
    evalDesc: 'Review how the digital solution (eWA) impacts each step. Adjust digitalization percentages to see the impact on efficiency.',
    analogStepHeader: 'Analog Step',
    digitalReplacementHeader: 'Digital Replacement',
    analogTimeHeader: 'Analog Time',
    digitalizationHeader: 'Digitalization %',
    digitalTimeHeader: 'Digital Time (min)',
    weightedAvg: 'Weighted Avg Totals',
    estimatedDigitalTime: 'Estimated Digital Time',
    assumptionTitle: 'Assumption Model',
    assumptionDesc: 'Digitalization percentage represents the share of cases processed via the digital route. Remaining cases fall back to the analog process duration automatically.',
    calculateRoi: 'Calculate ROI',
    figure30: 'Figure 3.0',

    roiTitle: 'ROI Calculation Results',
    projectedImpact: 'Projected impact for',
    costSavingsYear: 'Cost Savings / Year',
    timeSavedCase: 'Time Saved / Case',
    hoursFreedMonth: 'Hours Freed / Month',
    volume: 'Volume',
    processTimeComparison: 'Process Time Comparison (Minutes)',
    processCostComparison: 'Process Cost Comparison (EUR)',
    cumulativeSavings: 'Cumulative Savings Projection (5 Years)',
    downloadReport: 'Download Report',
    reset: 'Reset',
    figure40: 'Figure 4.0',
    figure41: 'Figure 4.1',
    figure42: 'Figure 4.2',
    figure43: 'Figure 4.3',
    minPerCase: 'Minutes per Case',
    costPerCase: 'Cost per Case (€)',
    cumSavings: 'Cumulative Savings (€)',
    over5Years: 'over 5 years',
    fte: 'FTE',
    casesMonth: 'Cases / Month',
  }
};

interface LangState {
  language: Language;
  t: Translation;
  setLanguage: (lang: Language) => void;
}

export const useLangStore = create<LangState>((set) => ({
  language: 'en', // Default to English
  t: translations.en,
  setLanguage: (lang) => set({ language: lang, t: translations[lang] }),
}));

