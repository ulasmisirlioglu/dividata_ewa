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

export interface StoreState {
  municipalityName: string;
  useCase: string;
  bpmnXml: string;
  stepDurations: StepDuration[];
  salaryGroup: string;
  monthlyVolume: number;
  digitalSteps: DigitalStep[];
  
  // Actions
  setMunicipalityName: (name: string) => void;
  setUseCase: (useCase: string) => void;
  setBpmnXml: (xml: string) => void;
  setStepDuration: (id: string, duration: number) => void;
  setSalaryGroup: (group: string) => void;
  setMonthlyVolume: (volume: number) => void;
  setDigitalStep: (id: string, updates: Partial<DigitalStep>) => void;
  reset: () => void;
}

const defaultStepDurations: StepDuration[] = [
  { id: 'Task_1', name: 'Wartenummer ziehen', suggested: 1, actual: 1 },
  { id: 'Task_2', name: 'Warten', suggested: 15, actual: 15 },
  { id: 'Task_3', name: 'Identifikation prüfen', suggested: 2, actual: 2 },
  { id: 'Task_4', name: 'Daten erfassen', suggested: 5, actual: 5 },
  { id: 'Task_5', name: 'Adressaufkleber drucken', suggested: 2, actual: 2 },
  { id: 'Task_6', name: 'Gebühren kassieren', suggested: 3, actual: 3 },
];

const defaultDigitalSteps: DigitalStep[] = [
  { id: 'Task_1', name: 'Wartenummer ziehen', digitalReplacement: 'Entfällt (Online Termin/Antrag)', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_2', name: 'Warten', digitalReplacement: 'Entfällt', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_3', name: 'Identifikation prüfen', digitalReplacement: 'eID (Online Ausweis)', digitalizationPercent: 80, digitalDuration: 0 },
  { id: 'Task_4', name: 'Daten erfassen', digitalReplacement: 'Online Formular', digitalizationPercent: 90, digitalDuration: 1 },
  { id: 'Task_5', name: 'Adressaufkleber drucken', digitalReplacement: 'Automatischer Versand / Digital', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_6', name: 'Gebühren kassieren', digitalReplacement: 'E-Payment', digitalizationPercent: 100, digitalDuration: 0 },
];

export const useStore = create<StoreState>((set) => ({
  municipalityName: 'Stadt München',
  useCase: 'Elektronische Wohnsitzanmeldung (eWA)',
  bpmnXml: initialBpmnXml,
  stepDurations: defaultStepDurations,
  salaryGroup: 'TVöD EG 6',
  monthlyVolume: 500,
  digitalSteps: defaultDigitalSteps,

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
  reset: () => set({
    municipalityName: 'Stadt München',
    useCase: 'Elektronische Wohnsitzanmeldung (eWA)',
    bpmnXml: initialBpmnXml,
    stepDurations: defaultStepDurations,
    salaryGroup: 'TVöD EG 6',
    monthlyVolume: 500,
    digitalSteps: defaultDigitalSteps,
  })
}));

