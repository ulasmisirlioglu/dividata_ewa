import { create } from 'zustand';
import { initialBpmnXml } from '../assets/initialBpmn';

export interface StepDuration {
  id: string;
  name: string;
  suggested: number;
  actual: number;
}

export interface DigitalStep {
  id: string; // correlates to analog step id
  name: string;
  digitalReplacement: string;
  digitalizationPercent: number; // 0-100
  digitalDuration: number; // minutes
}

export interface DigitalizationCosts {
  licenseCostYear: number;       // Annual license costs
  implementationCost: number;    // One-time implementation
  trainingCost: number;          // One-time training
  maintenanceCostYear: number;   // Annual maintenance/support
  otherCostYear: number;         // Annual other costs
}

export interface StoreState {
  municipalityName: string;
  useCase: string;
  bpmnXml: string;
  stepDurations: StepDuration[];
  salaryGroup: string;
  monthlyVolume: number;
  digitalSteps: DigitalStep[];
  digitalizationCosts: DigitalizationCosts;

  // Actions
  setMunicipalityName: (name: string) => void;
  setUseCase: (useCase: string) => void;
  setBpmnXml: (xml: string) => void;
  setStepDuration: (id: string, duration: number) => void;
  setSalaryGroup: (group: string) => void;
  setMonthlyVolume: (volume: number) => void;
  setDigitalStep: (id: string, updates: Partial<DigitalStep>) => void;
  setDigitalizationCosts: (updates: Partial<DigitalizationCosts>) => void;
  reset: () => void;
}

const defaultStepDurations: StepDuration[] = [
  { id: 'Task_1', name: 'Anmeldeformular ausfüllen (Papier)', suggested: 5, actual: 5 },
  { id: 'Task_2', name: 'Wartenummer ziehen', suggested: 1, actual: 1 },
  { id: 'Task_3', name: 'Warten bis Aufruf', suggested: 15, actual: 15 },
  { id: 'Task_4', name: 'Identifikation prüfen (Ausweis)', suggested: 2, actual: 2 },
  { id: 'Task_5', name: 'Daten erfassen (Fachverfahren)', suggested: 5, actual: 5 },
  { id: 'Task_6', name: 'Bescheinigung drucken', suggested: 2, actual: 2 },
  { id: 'Task_7', name: 'Gebühren kassieren', suggested: 3, actual: 3 },
  { id: 'Task_8', name: 'Bescheinigung entgegennehmen', suggested: 1, actual: 1 },
];

const defaultDigitalSteps: DigitalStep[] = [
  { id: 'Task_1', name: 'Anmeldeformular ausfüllen (Papier)', digitalReplacement: 'Online-Formular (eWA)', digitalizationPercent: 90, digitalDuration: 3 },
  { id: 'Task_2', name: 'Wartenummer ziehen', digitalReplacement: 'Entfällt (Online Antrag)', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_3', name: 'Warten bis Aufruf', digitalReplacement: 'Entfällt', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_4', name: 'Identifikation prüfen (Ausweis)', digitalReplacement: 'eID (Online Ausweis)', digitalizationPercent: 80, digitalDuration: 1 },
  { id: 'Task_5', name: 'Daten erfassen (Fachverfahren)', digitalReplacement: 'Automatische Datenübernahme', digitalizationPercent: 90, digitalDuration: 1 },
  { id: 'Task_6', name: 'Bescheinigung drucken', digitalReplacement: 'Digitaler Versand', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_7', name: 'Gebühren kassieren', digitalReplacement: 'E-Payment', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_8', name: 'Bescheinigung entgegennehmen', digitalReplacement: 'Digitaler Download / E-Mail', digitalizationPercent: 100, digitalDuration: 0 },
];

const defaultDigitalizationCosts: DigitalizationCosts = {
  licenseCostYear: 0,
  implementationCost: 0,
  trainingCost: 0,
  maintenanceCostYear: 0,
  otherCostYear: 0,
};

export const useStore = create<StoreState>((set) => ({
  municipalityName: 'Stadt München',
  useCase: 'Elektronische Wohnsitzanmeldung (eWA)',
  bpmnXml: initialBpmnXml,
  stepDurations: defaultStepDurations,
  salaryGroup: 'TVöD EG 6',
  monthlyVolume: 500,
  digitalSteps: defaultDigitalSteps,
  digitalizationCosts: defaultDigitalizationCosts,

  setMunicipalityName: (name) => set({ municipalityName: name }),
  setUseCase: (useCase) => set({ useCase: useCase }),
  setBpmnXml: (xml) => set({ bpmnXml: xml }),
  setStepDuration: (id, duration) => set((state) => ({
    stepDurations: state.stepDurations.map((s) => s.id === id ? { ...s, actual: duration } : s)
  })),
  setSalaryGroup: (group) => set({ salaryGroup: group }),
  setMonthlyVolume: (volume) => set({ monthlyVolume: volume }),
  setDigitalStep: (id, updates) => set((state) => ({
    digitalSteps: state.digitalSteps.map((s) => s.id === id ? { ...s, ...updates } : s)
  })),
  setDigitalizationCosts: (updates) => set((state) => ({
    digitalizationCosts: { ...state.digitalizationCosts, ...updates }
  })),
  reset: () => set({
    municipalityName: 'Stadt München',
    useCase: 'Elektronische Wohnsitzanmeldung (eWA)',
    bpmnXml: initialBpmnXml,
    stepDurations: defaultStepDurations,
    salaryGroup: 'TVöD EG 6',
    monthlyVolume: 500,
    digitalSteps: defaultDigitalSteps,
    digitalizationCosts: defaultDigitalizationCosts,
  })
}));


