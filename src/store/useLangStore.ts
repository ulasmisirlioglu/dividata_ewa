import { create } from 'zustand';

type Language = 'de' | 'en';

interface Translation {
  // Navigation
  navDashboard: string;
  navAnalog: string;
  navEvaluation: string;
  navCosts: string;
  navParams: string;
  navResults: string;

  // Auth
  authSignIn: string;
  authStadtnameLabel: string;
  authStadtnamePlaceholder: string;
  authPasswordLabel: string;
  authSignInAction: string;
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
  stepDurationsHeading: string;
  stepDurationsDesc: string;
  stepNameHeader: string;
  actorHeader: string;
  suggestedHeader: string;
  estimateHeader: string;
  totalDuration: string;
  parametersTitle: string;
  parametersDesc: string;
  tariffGroup: string;
  hourlyRateLabel: string;
  eurPerHour: string;
  costPerProcess: string;
  monthlyVolume: string;
  casesPerMonth: string;
  back: string;
  nextStep: string;
  costInfoTitle: string;
  costInfoDesc: string;
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
  digitalTimeInfo: string;
  evalInfoActorTime: string;
  evalInfoReplacement: string;
  weightedAvg: string;
  totalAnalog: string;
  totalDigital: string;
  estimatedDigitalTime: string;
  assumptionTitle: string;
  assumptionDesc: string;
  calculateRoi: string;
  figure30: string;

  // Digitalization Costs
  costPositionHeader: string;
  costTypeHeader: string;
  costAmountHeader: string;
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
  digitalPersonnelCost: string;
  digitalPersonnelCostInfo: string;
  perProcessLabel: string;
  preCalculated: string;
  costsInfoTitle: string;
  costsInfoDesc: string;
  continueTo: string;
  figure35: string;

  // Process Parameters
  paramsTitle: string;
  paramsDesc: string;
  paramsZeitraumHeader: string;
  paramsVolumenHeader: string;
  paramsQuoteHeader: string;
  paramsVolumenInfo: string;
  paramsQuoteInfo: string;
  paramsAddInterval: string;
  paramsContinue: string;
  paramsValidationWarning: string;
  figure40p: string;

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

  // Results - Rebuilt sections
  resultsInputsTitle: string;
  resultsAnalogSteps: string;
  resultsSalary: string;
  resultsDigitalSteps: string;
  resultsDigCosts: string;
  resultsIntervals: string;
  timeSavingsPerCase: string;
  mitarbeiterMinSaved: string;
  buergerMinSaved: string;
  costSavingsPerCase: string;
  costSavingsPerCaseNote: string;
  timeProjectionTitle: string;
  mitarbeiterHoursFreed: string;
  buergerHoursFreed: string;
  eurProjectionTitle: string;
  cumulativeNetSavings: string;
  figure50: string;
  figure51: string;
  figure52: string;
  figure53: string;
  digitalizationPercentHeader: string;
  noIntervalsWarning: string;
}

const translations: Record<Language, Translation> = {
  de: {
    navDashboard: 'Dashboard',
    navAnalog: 'Analoger Prozess',
    navEvaluation: 'Digitaler Prozess',
    navCosts: 'Kosten der Digitalisierung',
    navParams: 'Prozessparameter',
    navResults: 'Ergebnisse',

    authSignIn: 'Anmelden',
    authStadtnameLabel: '01 — Stadtname',
    authStadtnamePlaceholder: 'z.B. Stadt Lindau',
    authPasswordLabel: '02 — Passwort',
    authSignInAction: 'Anmelden',
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
    stepDurationsHeading: 'Dauer der analogen Schritte',
    stepDurationsDesc: 'Schätzen Sie die Zeit (in Minuten), die jeder Schritt im aktuellen analogen Prozess in Anspruch nimmt.',
    stepNameHeader: 'Schrittname',
    actorHeader: 'Mitarbeiter / Bürger',
    suggestedHeader: 'Vorschlag (min)',
    estimateHeader: 'Ihre Schätzung (min)',
    totalDuration: 'Gesamtdauer',
    parametersTitle: 'Kosten des analogen Prozesses',
    parametersDesc: 'Definieren Sie die Personalkosten des aktuellen analogen Prozesses.',
    tariffGroup: 'Tarifgruppe Personal',
    hourlyRateLabel: 'Stundenlohn',
    eurPerHour: '€ / Std.',
    costPerProcess: 'Kosten pro Prozess (Mitarbeitersicht)',
    monthlyVolume: 'Monatliches Volumen',
    casesPerMonth: 'Fälle / Monat',
    back: 'Zurück',
    nextStep: 'Nächster Schritt',
    costInfoTitle: 'Kostenberechnung',
    costInfoDesc: 'Die Kosten des analogen Prozesses werden aus den Mitarbeiter-Minuten (Schritt 2) und dem Stundenlohn der hier gewählten Tarifgruppe berechnet. Es werden ausschließlich die Mitarbeiterkosten berücksichtigt — die Bürgerzeit fließt nicht in die Kostenberechnung ein.',
    continueEvaluation: 'Weiter zum digitalen Prozess',
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
    digitalTimeInfo: 'Die digitale Zeit gibt an, wie lange ein Schritt nach der Digitalisierung dauert. Auch bei einer digitalen Lösung kann die Bearbeitungszeit nicht immer auf 0 reduziert werden — z.\u00A0B. bleibt bei einer eID-Prüfung ein Restaufwand bestehen.',
    evalInfoActorTime: 'Die Zuordnung Mitarbeiter/Bürger sowie die analoge Zeit wurden aus Schritt 2 übernommen. Um diese Werte zu ändern, bearbeiten Sie bitte den vorherigen Schritt.',
    evalInfoReplacement: 'Digitaler Ersatz beschreibt, wie der analoge Schritt durch die eWA-Lösung ersetzt wird. Dieses Feld ist optional und dient der Prozessdokumentation — es beeinflusst die Berechnung nicht direkt.',
    weightedAvg: 'Gesamtdauer',
    totalAnalog: 'Analog',
    totalDigital: 'Digital',
    estimatedDigitalTime: 'Geschätzte digitale Zeit',
    assumptionTitle: 'Annahmemodell',
    assumptionDesc: 'Die Digitalisierungsquote stellt den Anteil der Fälle dar, die über den digitalen Weg bearbeitet werden. Die übrigen Fälle fallen automatisch auf die analoge Prozessdauer zurück.',
    calculateRoi: 'ROI berechnen',
    figure30: 'Abbildung 3.0',

    costPositionHeader: 'Kosten',
    costTypeHeader: 'Typ',
    costAmountHeader: 'Betrag (EUR)',
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
    digitalPersonnelCost: 'Digitale Personalkosten',
    digitalPersonnelCostInfo: 'Dieser Wert wird automatisch aus der digitalen Prozessbewertung berechnet: Mitarbeiter-Minuten des digitalen Prozesses × Stundenlohn der gewählten Tarifgruppe. Um diesen Wert zu ändern, passen Sie die vorherigen Schritte an.',
    perProcessLabel: 'pro Prozess',
    preCalculated: 'vorberechnet',
    costsInfoTitle: 'Kostenmodell',
    costsInfoDesc: 'Einmalige Kosten (Implementierung, Schulung) werden auf 5 Jahre verteilt. Jährliche Kosten (Lizenzen, Wartung) fließen direkt in die ROI-Berechnung ein.',
    continueTo: 'Weiter zu Prozessparameter',
    figure35: 'Abbildung 3.5',

    paramsTitle: 'Prozessparameter',
    paramsDesc: 'Definieren Sie Zeiträume und wie sich das Volumen und die Digitalisierungsquote über die Zeit entwickeln.',
    paramsZeitraumHeader: 'Zeitraum',
    paramsVolumenHeader: 'Volumen',
    paramsQuoteHeader: 'Digitalisierungsquote %',
    paramsVolumenInfo: 'Gesamtanzahl der Wohnsitzanmeldungen pro Monat in diesem Zeitraum — unabhängig davon, ob sie analog oder digital bearbeitet werden.',
    paramsQuoteInfo: 'Anteil der Fälle, die voraussichtlich über den digitalen Weg (eWA) abgewickelt werden. Die übrigen Fälle laufen weiterhin analog.',
    paramsAddInterval: 'Intervall hinzufügen',
    paramsContinue: 'Weiter zu Ergebnisse',
    paramsValidationWarning: 'Bitte füllen Sie Volumen und Digitalisierungsquote für alle Intervalle aus.',
    figure40p: 'Abbildung 4.0',

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
    figure40: 'Abbildung 5.0',
    figure41: 'Abbildung 5.1',
    figure42: 'Abbildung 5.2',
    figure43: 'Abbildung 5.3',
    minPerCase: 'Minuten pro Fall',
    costPerCase: 'Kosten pro Fall (€)',
    cumSavings: 'Kumulierte Einsparungen (€)',
    over5Years: 'über 5 Jahre',
    fte: 'VZÄ',
    casesMonth: 'Fälle / Monat',

    resultsInputsTitle: 'Eingabeparameter',
    resultsAnalogSteps: 'Analoge Schritte',
    resultsSalary: 'Tarifgruppe & Stundenlohn',
    resultsDigitalSteps: 'Digitale Schritte',
    resultsDigCosts: 'Digitalisierungskosten',
    resultsIntervals: 'Prozessintervalle',
    timeSavingsPerCase: 'Zeitersparnis pro Fall',
    mitarbeiterMinSaved: 'Mitarbeiter-Minuten eingespart',
    buergerMinSaved: 'Bürger-Minuten eingespart',
    costSavingsPerCase: 'Kostenersparnis pro Fall',
    costSavingsPerCaseNote: 'Nur aus Mitarbeitersicht (kommunale Sicht). Einmalige Digitalisierungskosten sind nicht enthalten.',
    timeProjectionTitle: 'Kumulierte Einsparungsprognose (Zeit)',
    mitarbeiterHoursFreed: 'Freigesetzte Mitarbeiterstunden',
    buergerHoursFreed: 'Freigesetzte Bürgerstunden',
    eurProjectionTitle: 'Kumulierte Einsparungsprognose (EUR)',
    cumulativeNetSavings: 'Kumulierte Nettoeinsparung (€)',
    figure50: 'Abbildung 5.0',
    figure51: 'Abbildung 5.1',
    figure52: 'Abbildung 5.2',
    figure53: 'Abbildung 5.3',
    digitalizationPercentHeader: 'Digitalisierung %',
    noIntervalsWarning: 'Bitte definieren Sie mindestens ein gültiges Prozessintervall (mit Von, Bis, Volumen > 0).',
  },
  en: {
    navDashboard: 'Dashboard',
    navAnalog: 'Analog Process',
    navEvaluation: 'Digital Process',
    navCosts: 'Digitalization Costs',
    navParams: 'Process Parameters',
    navResults: 'Results',

    authSignIn: 'Sign In',
    authStadtnameLabel: '01 — City Name',
    authStadtnamePlaceholder: 'e.g. Stadt Lindau',
    authPasswordLabel: '02 — Password',
    authSignInAction: 'Sign In',
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
    stepDurationsHeading: 'Analog Step Durations',
    stepDurationsDesc: 'Estimate the time (in minutes) each step takes in the current analog process.',
    stepNameHeader: 'Step Name',
    actorHeader: 'Employee / Citizen',
    suggestedHeader: 'Suggested (min)',
    estimateHeader: 'Your Estimate (min)',
    totalDuration: 'Total Duration',
    parametersTitle: 'Analog Process Costs',
    parametersDesc: 'Define the staff costs of the current analog process.',
    tariffGroup: 'Staff Tariff Group (Tarifgruppe)',
    hourlyRateLabel: 'Hourly Rate',
    eurPerHour: '€ / hr',
    costPerProcess: 'Cost per Process (Employee View)',
    monthlyVolume: 'Monthly Process Volume',
    casesPerMonth: 'cases / month',
    back: 'Back',
    nextStep: 'Next Step',
    costInfoTitle: 'Cost Calculation',
    costInfoDesc: 'The analog process costs are calculated from the employee minutes (Step 2) and the hourly rate of the selected tariff group. Only employee costs are considered — citizen time is not included in the cost calculation.',
    continueEvaluation: 'Continue to Digital Process',
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
    digitalTimeInfo: 'Digital time indicates how long a step takes after digitalization. Even with a digital solution, processing time cannot always be reduced to 0 — e.g., an eID verification still requires some residual effort.',
    evalInfoActorTime: 'The Employee/Citizen assignment and analog time were taken from Step 2. To change these values, please edit the previous step.',
    evalInfoReplacement: 'Digital Replacement describes how the analog step is replaced by the eWA solution. This field is optional and serves process documentation — it does not directly affect the calculation.',
    weightedAvg: 'Total Duration',
    totalAnalog: 'Analog',
    totalDigital: 'Digital',
    estimatedDigitalTime: 'Estimated Digital Time',
    assumptionTitle: 'Assumption Model',
    assumptionDesc: 'Digitalization percentage represents the share of cases processed via the digital route. Remaining cases fall back to the analog process duration automatically.',
    calculateRoi: 'Calculate ROI',
    figure30: 'Figure 3.0',

    costPositionHeader: 'Costs',
    costTypeHeader: 'Type',
    costAmountHeader: 'Amount (EUR)',
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
    digitalPersonnelCost: 'Digital Personnel Cost',
    digitalPersonnelCostInfo: 'This value is automatically calculated from the digital process evaluation: employee minutes of the digital process × hourly rate of the selected tariff group. To change this value, adjust the previous steps.',
    perProcessLabel: 'per process',
    preCalculated: 'pre-calculated',
    costsInfoTitle: 'Cost Model',
    costsInfoDesc: 'One-time costs (implementation, training) are amortized over 5 years. Annual costs (licenses, maintenance) flow directly into the ROI calculation.',
    continueTo: 'Continue to Parameters',
    figure35: 'Figure 3.5',

    paramsTitle: 'Process Parameters',
    paramsDesc: 'Define time periods and how volume and digitalization rate evolve over time.',
    paramsZeitraumHeader: 'Time Period',
    paramsVolumenHeader: 'Volume',
    paramsQuoteHeader: 'Digitalization Rate %',
    paramsVolumenInfo: 'Total number of residence registrations per month in this period — regardless of whether they are processed analog or digitally.',
    paramsQuoteInfo: 'Share of cases expected to be processed via the digital route (eWA). The remaining cases continue to run analog.',
    paramsAddInterval: 'Add Interval',
    paramsContinue: 'Continue to Results',
    paramsValidationWarning: 'Please fill in Volume and Digitalization Rate for all intervals.',
    figure40p: 'Figure 4.0',

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
    figure40: 'Figure 5.0',
    figure41: 'Figure 5.1',
    figure42: 'Figure 5.2',
    figure43: 'Figure 5.3',
    minPerCase: 'Minutes per Case',
    costPerCase: 'Cost per Case (€)',
    cumSavings: 'Cumulative Savings (€)',
    over5Years: 'over 5 years',
    fte: 'FTE',
    casesMonth: 'Cases / Month',

    resultsInputsTitle: 'Input Parameters',
    resultsAnalogSteps: 'Analog Steps',
    resultsSalary: 'Tariff Group & Hourly Rate',
    resultsDigitalSteps: 'Digital Steps',
    resultsDigCosts: 'Digitalization Costs',
    resultsIntervals: 'Process Intervals',
    timeSavingsPerCase: 'Time Savings per Case',
    mitarbeiterMinSaved: 'Employee Minutes Saved',
    buergerMinSaved: 'Citizen Minutes Saved',
    costSavingsPerCase: 'Cost Savings per Case',
    costSavingsPerCaseNote: 'Employee costs only (municipal perspective). One-time digitalization costs are not included.',
    timeProjectionTitle: 'Cumulative Savings Projection (Time)',
    mitarbeiterHoursFreed: 'Employee Hours Freed',
    buergerHoursFreed: 'Citizen Hours Freed',
    eurProjectionTitle: 'Cumulative Savings Projection (EUR)',
    cumulativeNetSavings: 'Cumulative Net Savings (€)',
    figure50: 'Figure 5.0',
    figure51: 'Figure 5.1',
    figure52: 'Figure 5.2',
    figure53: 'Figure 5.3',
    digitalizationPercentHeader: 'Digitalization %',
    noIntervalsWarning: 'Please define at least one valid process interval (with From, To, Volume > 0).',
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

