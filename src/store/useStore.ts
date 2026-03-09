import { create } from 'zustand';
import { initialBpmnXml } from '../assets/initialBpmn';
import type { ProjectRow } from '../lib/database.types';

export type StepActor = 'Mitarbeiter' | 'Bürger';

/** Parse BPMN XML → valid process tasks vs abort-path tasks */
export function parseBpmnXml(xml: string) {
  const allTasks: { id: string; name: string }[] = [];
  const tagRegex = /<bpmn:task\s([^>]*?)>/g;
  let m;
  while ((m = tagRegex.exec(xml)) !== null) {
    const id = m[1].match(/id="([^"]+)"/)?.[1];
    const name = m[1].match(/name="([^"]*)"/)?.[1] ?? '';
    if (id) allTasks.push({ id, name });
  }

  // Sequence flows
  const flows: { source: string; target: string }[] = [];
  const flowRegex = /<bpmn:sequenceFlow\s([^>]*?)\/?>/g;
  while ((m = flowRegex.exec(xml)) !== null) {
    const src = m[1].match(/sourceRef="([^"]+)"/)?.[1];
    const tgt = m[1].match(/targetRef="([^"]+)"/)?.[1];
    if (src && tgt) flows.push({ source: src, target: tgt });
  }

  // Abort end events (name contains Abbruch / Fehler / Error / Cancel)
  const abortEnds = new Set<string>();
  const endRegex = /<bpmn:endEvent\s([^>]*?)>/g;
  while ((m = endRegex.exec(xml)) !== null) {
    const id = m[1].match(/id="([^"]+)"/)?.[1];
    const name = m[1].match(/name="([^"]*)"/)?.[1] ?? '';
    if (id && /abbruch|fehler|error|cancel/i.test(name)) {
      abortEnds.add(id);
    }
  }

  // Build outgoing map
  const outgoing = new Map<string, string[]>();
  for (const f of flows) {
    if (!outgoing.has(f.source)) outgoing.set(f.source, []);
    outgoing.get(f.source)!.push(f.target);
  }

  // Iteratively find nodes whose ALL outgoing paths lead to abort
  const abortNodes = new Set(abortEnds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const t of allTasks) {
      if (abortNodes.has(t.id)) continue;
      const targets = outgoing.get(t.id) || [];
      if (targets.length > 0 && targets.every((tgt) => abortNodes.has(tgt))) {
        abortNodes.add(t.id);
        changed = true;
      }
    }
  }

  return {
    validTasks: allTasks.filter((t) => !abortNodes.has(t.id)),
    excludedTasks: allTasks.filter((t) => abortNodes.has(t.id)),
  };
}

export interface StepDuration {
  id: string;
  name: string;
  suggested: number;
  actual: number;
  actor: StepActor;
}

export interface DigitalStep {
  id: string; // correlates to analog step id
  name: string;
  digitalReplacement: string;
  digitalizationPercent: number; // 0-100
  digitalDuration: number; // minutes
}

export interface ProcessInterval {
  id: string;
  label: string;
  von: string;
  bis: string;
  volumen: number;
  digitalisierungsquote: number; // 0-100
}

export interface DigitalizationCosts {
  licenseCostYear: number;       // Annual license costs
  implementationCost: number;    // One-time implementation
  trainingCost: number;          // One-time training
  maintenanceCostYear: number;   // Annual maintenance/support
  otherCostYear: number;         // Annual other costs
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface StoreState {
  // Project tracking
  currentProjectId: string | null;
  projectName: string;
  saveStatus: SaveStatus;

  // Data
  municipalityName: string;
  useCase: string;
  bpmnXml: string;
  stepDurations: StepDuration[];
  salaryGroup: string;
  hourlyRate: number;
  monthlyVolume: number;
  digitalSteps: DigitalStep[];
  digitalizationCosts: DigitalizationCosts;
  processIntervals: ProcessInterval[];

  // Actions
  setCurrentProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setMunicipalityName: (name: string) => void;
  setUseCase: (useCase: string) => void;
  setBpmnXml: (xml: string) => void;
  setStepDuration: (id: string, duration: number) => void;
  setStepActor: (id: string, actor: StepActor) => void;
  setSalaryGroup: (group: string) => void;
  setHourlyRate: (rate: number) => void;
  setMonthlyVolume: (volume: number) => void;
  setDigitalStep: (id: string, updates: Partial<DigitalStep>) => void;
  setDigitalizationCosts: (updates: Partial<DigitalizationCosts>) => void;
  setProcessInterval: (id: string, updates: Partial<ProcessInterval>) => void;
  addProcessInterval: () => void;
  removeProcessInterval: (id: string) => void;
  loadProject: (data: ProjectRow) => void;
  reset: () => void;
}

const defaultStepDurations: StepDuration[] = [
  { id: 'Task_1', name: 'Anmeldeformular ausfüllen (Papier)', suggested: 5, actual: 0, actor: 'Bürger' },
  { id: 'Task_2', name: 'Wartenummer ziehen', suggested: 1, actual: 0, actor: 'Bürger' },
  { id: 'Task_3', name: 'Warten bis Aufruf', suggested: 15, actual: 0, actor: 'Bürger' },
  { id: 'Task_4', name: 'Identifikation prüfen (Ausweis)', suggested: 2, actual: 0, actor: 'Mitarbeiter' },
  { id: 'Task_5', name: 'Daten erfassen (Fachverfahren)', suggested: 5, actual: 0, actor: 'Mitarbeiter' },
  { id: 'Task_6', name: 'Bescheinigung drucken', suggested: 2, actual: 0, actor: 'Mitarbeiter' },
  { id: 'Task_7', name: 'Gebühren kassieren', suggested: 3, actual: 0, actor: 'Mitarbeiter' },
  { id: 'Task_8', name: 'Bescheinigung entgegennehmen', suggested: 1, actual: 0, actor: 'Bürger' },
];

const defaultDigitalSteps: DigitalStep[] = [
  { id: 'Task_1', name: 'Anmeldeformular ausfüllen (Papier)', digitalReplacement: 'Online-Formular (eWA)', digitalizationPercent: 90, digitalDuration: 0 },
  { id: 'Task_2', name: 'Wartenummer ziehen', digitalReplacement: 'Entfällt (Online Antrag)', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_3', name: 'Warten bis Aufruf', digitalReplacement: 'Entfällt', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_4', name: 'Identifikation prüfen (Ausweis)', digitalReplacement: 'eID (Online Ausweis)', digitalizationPercent: 80, digitalDuration: 0 },
  { id: 'Task_5', name: 'Daten erfassen (Fachverfahren)', digitalReplacement: 'Automatische Datenübernahme', digitalizationPercent: 90, digitalDuration: 0 },
  { id: 'Task_6', name: 'Bescheinigung drucken', digitalReplacement: 'Digitaler Versand', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_7', name: 'Gebühren kassieren', digitalReplacement: 'E-Payment', digitalizationPercent: 100, digitalDuration: 0 },
  { id: 'Task_8', name: 'Bescheinigung entgegennehmen', digitalReplacement: 'Digitaler Download / E-Mail', digitalizationPercent: 100, digitalDuration: 0 },
];

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const defaultProcessIntervals: ProcessInterval[] = [
  { id: 'interval_1', label: 'Intervall 1', von: getCurrentMonth(), bis: '', volumen: 0, digitalisierungsquote: 0 },
  { id: 'interval_2', label: 'Intervall 2', von: '', bis: '', volumen: 0, digitalisierungsquote: 0 },
  { id: 'interval_3', label: 'Intervall 3', von: '', bis: '', volumen: 0, digitalisierungsquote: 0 },
];

const defaultDigitalizationCosts: DigitalizationCosts = {
  licenseCostYear: 0,
  implementationCost: 0,
  trainingCost: 0,
  maintenanceCostYear: 0,
  otherCostYear: 0,
};

export const useStore = create<StoreState>((set) => ({
  // Project tracking
  currentProjectId: null,
  projectName: '',
  saveStatus: 'idle',

  // Data
  municipalityName: '',
  useCase: 'Elektronische Wohnsitzanmeldung (eWA)',
  bpmnXml: initialBpmnXml,
  stepDurations: defaultStepDurations,
  salaryGroup: '',
  hourlyRate: 0,
  monthlyVolume: 500,
  digitalSteps: defaultDigitalSteps,
  digitalizationCosts: defaultDigitalizationCosts,
  processIntervals: defaultProcessIntervals,

  // Project tracking actions
  setCurrentProjectId: (id) => {
    if (id) localStorage.setItem('dividata_project_id', id);
    else localStorage.removeItem('dividata_project_id');
    set({ currentProjectId: id });
  },
  setProjectName: (name) => set({ projectName: name }),
  setSaveStatus: (status) => set({ saveStatus: status }),

  // Data actions
  setMunicipalityName: (name) => set({ municipalityName: name }),
  setUseCase: (useCase) => set({ useCase: useCase }),
  setBpmnXml: (xml) => set((state) => {
    const { validTasks } = parseBpmnXml(xml);

    const validIds = new Set(validTasks.map((t) => t.id));
    const nameMap = new Map(validTasks.map((t) => [t.id, t.name]));

    // Sync stepDurations: update existing, add new, remove deleted/abort
    const existingStepIds = new Set(state.stepDurations.map((s) => s.id));
    const updatedSteps = state.stepDurations
      .filter((s) => validIds.has(s.id))
      .map((s) => {
        const newName = nameMap.get(s.id);
        return newName !== undefined && newName !== s.name ? { ...s, name: newName } : s;
      });
    for (const task of validTasks) {
      if (!existingStepIds.has(task.id)) {
        updatedSteps.push({ id: task.id, name: task.name, suggested: 0, actual: 0, actor: 'Mitarbeiter' as StepActor });
      }
    }

    // Sync digitalSteps: update existing, add new, remove deleted/abort
    const existingDigitalIds = new Set(state.digitalSteps.map((s) => s.id));
    const updatedDigital = state.digitalSteps
      .filter((s) => validIds.has(s.id))
      .map((s) => {
        const newName = nameMap.get(s.id);
        return newName !== undefined && newName !== s.name ? { ...s, name: newName } : s;
      });
    for (const task of validTasks) {
      if (!existingDigitalIds.has(task.id)) {
        updatedDigital.push({ id: task.id, name: task.name, digitalReplacement: '', digitalizationPercent: 0, digitalDuration: 0 });
      }
    }

    return {
      bpmnXml: xml,
      stepDurations: updatedSteps,
      digitalSteps: updatedDigital,
    };
  }),
  setStepDuration: (id, duration) => set((state) => ({
    stepDurations: state.stepDurations.map((s) => s.id === id ? { ...s, actual: duration } : s)
  })),
  setStepActor: (id, actor) => set((state) => ({
    stepDurations: state.stepDurations.map((s) => s.id === id ? { ...s, actor } : s)
  })),
  setSalaryGroup: (group) => set({ salaryGroup: group }),
  setHourlyRate: (rate) => set({ hourlyRate: rate }),
  setMonthlyVolume: (volume) => set({ monthlyVolume: volume }),
  setDigitalStep: (id, updates) => set((state) => ({
    digitalSteps: state.digitalSteps.map((s) => s.id === id ? { ...s, ...updates } : s)
  })),
  setDigitalizationCosts: (updates) => set((state) => ({
    digitalizationCosts: { ...state.digitalizationCosts, ...updates }
  })),
  setProcessInterval: (id, updates) => set((state) => ({
    processIntervals: state.processIntervals.map((i) => i.id === id ? { ...i, ...updates } : i)
  })),
  addProcessInterval: () => set((state) => {
    const nextNum = state.processIntervals.length;
    return {
      processIntervals: [...state.processIntervals, {
        id: `interval_${nextNum}`,
        label: `Intervall ${nextNum}`,
        von: '',
        bis: '',
        volumen: 500,
        digitalisierungsquote: 0,
      }]
    };
  }),
  removeProcessInterval: (id) => set((state) => ({
    processIntervals: state.processIntervals.filter((i) => i.id !== id)
  })),

  loadProject: (data) => {
    localStorage.setItem('dividata_project_id', data.id);
    return set({
    currentProjectId: data.id,
    projectName: data.project_name,
    municipalityName: data.stadtname,
    useCase: data.use_case,
    bpmnXml: data.bpmn_xml ?? initialBpmnXml,
    stepDurations: (data.step_durations as StepDuration[]) ?? defaultStepDurations,
    salaryGroup: data.salary_group ?? '',
    hourlyRate: data.hourly_rate ?? 0,
    monthlyVolume: 500,
    digitalSteps: (data.digital_steps as DigitalStep[]) ?? defaultDigitalSteps,
    digitalizationCosts: {
      licenseCostYear: data.license_cost_year ?? 0,
      maintenanceCostYear: data.maintenance_cost_year ?? 0,
      otherCostYear: data.other_cost_year ?? 0,
      implementationCost: data.implementation_cost ?? 0,
      trainingCost: data.training_cost ?? 0,
    },
    processIntervals: (data.process_intervals as ProcessInterval[]) ?? defaultProcessIntervals,
    saveStatus: 'saved',
  });
  },

  reset: () => {
    localStorage.removeItem('dividata_project_id');
    return set({
    currentProjectId: null,
    projectName: '',
    saveStatus: 'idle',
    municipalityName: '',
    useCase: 'Elektronische Wohnsitzanmeldung (eWA)',
    bpmnXml: initialBpmnXml,
    stepDurations: defaultStepDurations,
    salaryGroup: '',
    hourlyRate: 0,
    monthlyVolume: 500,
    digitalSteps: defaultDigitalSteps,
    digitalizationCosts: defaultDigitalizationCosts,
    processIntervals: defaultProcessIntervals,
  });
  },
}));


