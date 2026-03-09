import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { saveProject } from '../lib/projectService';

const DEBOUNCE_MS = 2000;

export function useAutoSave() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = useStore.subscribe((state, prevState) => {
      // Only auto-save if we have a project
      if (!state.currentProjectId) return;

      // Skip if only saveStatus changed
      if (
        state.saveStatus !== prevState.saveStatus &&
        state.municipalityName === prevState.municipalityName &&
        state.useCase === prevState.useCase &&
        state.bpmnXml === prevState.bpmnXml &&
        state.stepDurations === prevState.stepDurations &&
        state.salaryGroup === prevState.salaryGroup &&
        state.hourlyRate === prevState.hourlyRate &&
        state.monthlyVolume === prevState.monthlyVolume &&
        state.digitalSteps === prevState.digitalSteps &&
        state.digitalizationCosts === prevState.digitalizationCosts &&
        state.processIntervals === prevState.processIntervals &&
        state.projectName === prevState.projectName
      ) {
        return;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(async () => {
        const s = useStore.getState();
        if (!s.currentProjectId) return;

        s.setSaveStatus('saving');
        try {
          await saveProject(s.currentProjectId, {
            municipalityName: s.municipalityName,
            useCase: s.useCase,
            bpmnXml: s.bpmnXml,
            stepDurations: s.stepDurations,
            salaryGroup: s.salaryGroup,
            hourlyRate: s.hourlyRate,
            monthlyVolume: s.monthlyVolume,
            digitalSteps: s.digitalSteps,
            digitalizationCosts: s.digitalizationCosts,
            processIntervals: s.processIntervals,
          }, s.projectName);
          useStore.getState().setSaveStatus('saved');
        } catch (err) {
          console.error('Auto-save failed:', err);
          useStore.getState().setSaveStatus('error');
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      unsub();
    };
  }, []);
}
