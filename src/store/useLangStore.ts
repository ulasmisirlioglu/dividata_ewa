import { create } from 'zustand';

type Language = 'de' | 'en';

interface Translation {
  // Navigation
  navDashboard: string;
  navAnalog: string;
  navEvaluation: string;
  navCosts: string;
  navResults: string;

  // Auth
  authSignIn: string;
  authSignUp: string;
  authStadtnameLabel: string;
  authStadtnamePlaceholder: string;
  authPasswordLabel: string;
  authConfirmPasswordLabel: string;
  authPasswordMismatch: string;
  authSignInAction: string;
  authSignUpAction: string;
  authSignOutAction: string;
  heroTitle: string;
  heroSubtitle: string;

  // Dashboard
  dashboardLabel: string;
  dashboardWelcome: string;
  dashboardSubtitle: string;
  dashboardNewUseCase: string;
  dashboardEwaDesc: string;
  dashboardComingSoon: string;
  dashboardMoreUseCases: string;
  dashboardPreviousProjects: string;
  dashboardNoProjects: string;
  dashboardLoading: string;

  // Analog Process
  mapProcessTitle: string;
  mapProcessHeading: string;
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

  // Digitalization Costs
  costsTitle: string;
  costsDesc: string;
  licenseCostYear: string;
  implementationCost: string;
  trainingCost: string;
  maintenanceCostYear: string;
  otherCostYear: string;
  annualLabel: string;
  oneTimeLabel: string;
  totalAnnualCosts: string;
  totalOneTimeCosts: string;
  costsInfoTitle: string;
  costsInfoDesc: string;
  continueTo: string;
  figure35: string;

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
    navDashboard: 'Dashboard',
    navAnalog: 'Analoger Prozess',
    navEvaluation: 'Digitaler Prozess',
    navCosts: 'Kosten der Digitalisierung',
    navResults: 'Ergebnisse',

    authSignIn: 'Anmelden',
    authSignUp: 'Registrieren',
    authStadtnameLabel: '01 — Stadtname',
    authStadtnamePlaceholder: 'z.B. Stadt München',
    authPasswordLabel: '02 — Passwort',
    authConfirmPasswordLabel: '03 — Passwort bestätigen',
    authPasswordMismatch: 'Die Passwörter stimmen nicht überein.',
    authSignInAction: 'Anmelden',
    authSignUpAction: 'Registrieren',
    authSignOutAction: 'Abmelden',
    heroTitle: 'Kommunale\nEffizienz\nmessen.',
    heroSubtitle: 'DiviData berechnet den Return on Investment (ROI) für digitale öffentliche Dienste. Melden Sie sich an, um mit der wissenschaftlichen Bewertung zu beginnen.',

    dashboardLabel: 'Übersicht',
    dashboardWelcome: 'Willkommen',
    dashboardSubtitle: 'Wählen Sie einen Anwendungsfall oder sehen Sie Ihre bisherigen Projekte ein.',
    dashboardNewUseCase: 'Wählen Sie einen neuen Anwendungsfall',
    dashboardEwaDesc: 'Elektronische Wohnsitzanmeldung — ROI-Berechnung für den digitalen Meldeprozess.',
    dashboardComingSoon: 'Demnächst',
    dashboardMoreUseCases: 'Weitere Anwendungsfälle folgen.',
    dashboardPreviousProjects: 'Bisherige Projekte',
    dashboardNoProjects: 'Hier werden Ihre Projekte gespeichert.',
    dashboardLoading: 'Projekte werden geladen...',

    mapProcessTitle: '„Schritte" festlegen',
    mapProcessHeading: 'Analogen Prozess der Wohnsitzanmeldung abbilden',
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

    costsTitle: 'Kosten der Digitalisierung',
    costsDesc: 'Erfassen Sie die erwarteten Kosten für die Einführung und den Betrieb der digitalen Lösung.',
    licenseCostYear: 'Lizenzkosten',
    implementationCost: 'Implementierungskosten',
    trainingCost: 'Schulungskosten',
    maintenanceCostYear: 'Wartung & Support',
    otherCostYear: 'Sonstige Kosten',
    annualLabel: 'jährlich',
    oneTimeLabel: 'einmalig',
    totalAnnualCosts: 'Jährliche Gesamtkosten',
    totalOneTimeCosts: 'Einmalige Gesamtkosten',
    costsInfoTitle: 'Kostenmodell',
    costsInfoDesc: 'Einmalige Kosten (Implementierung, Schulung) werden auf 5 Jahre verteilt. Jährliche Kosten (Lizenzen, Wartung) fließen direkt in die ROI-Berechnung ein.',
    continueTo: 'Weiter zu Ergebnisse',
    figure35: 'Abbildung 3.5',

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
    navDashboard: 'Dashboard',
    navAnalog: 'Analog Process',
    navEvaluation: 'Digital Process',
    navCosts: 'Digitalization Costs',
    navResults: 'Results',

    authSignIn: 'Sign In',
    authSignUp: 'Sign Up',
    authStadtnameLabel: '01 — City Name',
    authStadtnamePlaceholder: 'e.g. Stadt München',
    authPasswordLabel: '02 — Password',
    authConfirmPasswordLabel: '03 — Confirm Password',
    authPasswordMismatch: 'Passwords do not match.',
    authSignInAction: 'Sign In',
    authSignUpAction: 'Sign Up',
    authSignOutAction: 'Sign Out',
    heroTitle: 'Measure\nGovernment\nEfficiency.',
    heroSubtitle: 'DiviData calculates the Return on Investment (ROI) for digital public services. Sign in to begin the scientific assessment.',

    dashboardLabel: 'Overview',
    dashboardWelcome: 'Welcome',
    dashboardSubtitle: 'Choose a use case or review your previous projects.',
    dashboardNewUseCase: 'Choose a new use case',
    dashboardEwaDesc: 'Electronic residence registration — ROI calculation for the digital registration process.',
    dashboardComingSoon: 'Coming Soon',
    dashboardMoreUseCases: 'More use cases coming soon.',
    dashboardPreviousProjects: 'Previous Projects',
    dashboardNoProjects: 'Your projects will be saved here.',
    dashboardLoading: 'Loading projects...',

    mapProcessTitle: 'Define Steps',
    mapProcessHeading: 'Map the Analog Residence Registration Process',
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

    costsTitle: 'Digitalization Costs',
    costsDesc: 'Enter the expected costs for implementing and operating the digital solution.',
    licenseCostYear: 'License Costs',
    implementationCost: 'Implementation Costs',
    trainingCost: 'Training Costs',
    maintenanceCostYear: 'Maintenance & Support',
    otherCostYear: 'Other Costs',
    annualLabel: 'annual',
    oneTimeLabel: 'one-time',
    totalAnnualCosts: 'Total Annual Costs',
    totalOneTimeCosts: 'Total One-Time Costs',
    costsInfoTitle: 'Cost Model',
    costsInfoDesc: 'One-time costs (implementation, training) are amortized over 5 years. Annual costs (licenses, maintenance) flow directly into the ROI calculation.',
    continueTo: 'Continue to Results',
    figure35: 'Figure 3.5',

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
  language: 'de', // Default to German
  t: translations.de,
  setLanguage: (lang) => set({ language: lang, t: translations[lang] }),
}));

