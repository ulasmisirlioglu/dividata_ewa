import { supabase } from './supabase';

interface ProjectData {
  municipalityName: string;
  useCase: string;
  bpmnXml: string;
  stepDurations: unknown[];
  digitalSteps: unknown[];
  salaryGroup: string;
  monthlyVolume: number;
}

export async function saveProject(userId: string, data: ProjectData): Promise<string | null> {
  const { data: result, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      municipality_name: data.municipalityName,
      use_case: data.useCase,
      bpmn_xml: data.bpmnXml,
      step_durations: data.stepDurations as any,
      digital_steps: data.digitalSteps as any,
      salary_group: data.salaryGroup,
      monthly_volume: data.monthlyVolume,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Projekt konnte nicht gespeichert werden:', error.message);
    return null;
  }
  return result.id;
}

export async function loadProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Projekt konnte nicht geladen werden:', error.message);
    return null;
  }
  return data;
}
