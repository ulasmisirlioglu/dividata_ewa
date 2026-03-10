import { supabase } from './supabase';
import { computeProjectDerivedValues } from './calculations';
import type { StoreState } from '../store/useStore';
import type { ProjectRow } from './database.types';

export interface ProjectSummary {
  id: string;
  project_name: string;
  use_case: string;
  created_at: string;
  updated_at: string;
  roi: number | null;
  cost_saving_per_case: number | null;
}

export async function listProjects(userId: string): Promise<ProjectSummary[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, project_name, use_case, created_at, updated_at, roi, cost_saving_per_case')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data as ProjectSummary[]) ?? [];
}

export async function loadProject(projectId: string): Promise<ProjectRow | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data as ProjectRow | null;
}

export async function createProject(params: {
  userId: string;
  stadtname: string;
  useCase: string;
  projectName: string;
}): Promise<ProjectRow> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: params.userId,
      stadtname: params.stadtname,
      use_case: params.useCase,
      project_name: params.projectName,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProjectRow;
}

export async function saveProject(
  projectId: string,
  state: Pick<StoreState,
    'municipalityName' | 'useCase' | 'bpmnXml' |
    'stepDurations' | 'salaryGroup' | 'hourlyRate' | 'monthlyVolume' |
    'digitalSteps' | 'digitalizationCosts' | 'processIntervals'
  >,
  projectName: string,
) {
  const derived = computeProjectDerivedValues({
    stepDurations: state.stepDurations,
    digitalSteps: state.digitalSteps,
    hourlyRate: state.hourlyRate,
    digitalizationCosts: state.digitalizationCosts,
    processIntervals: state.processIntervals,
  });

  const { error } = await supabase
    .from('projects')
    .update({
      stadtname: state.municipalityName,
      use_case: state.useCase,
      project_name: projectName,
      bpmn_xml: state.bpmnXml,
      step_durations: state.stepDurations as unknown,
      salary_group: state.salaryGroup,
      hourly_rate: state.hourlyRate,
      digital_steps: state.digitalSteps as unknown,
      license_cost_year: state.digitalizationCosts.licenseCostYear,
      maintenance_cost_year: state.digitalizationCosts.maintenanceCostYear,
      other_cost_year: state.digitalizationCosts.otherCostYear,
      implementation_cost: state.digitalizationCosts.implementationCost,
      training_cost: state.digitalizationCosts.trainingCost,
      process_intervals: state.processIntervals as unknown,
      ...derived,
    })
    .eq('id', projectId);

  if (error) throw error;
}

export async function setDefaultBpmn(userId: string, useCase: string, bpmnXml: string) {
  const { error } = await supabase
    .from('default_bpmns')
    .upsert(
      { user_id: userId, use_case: useCase, bpmn_xml: bpmnXml },
      { onConflict: 'user_id,use_case' },
    );

  if (error) throw error;
}

export async function getDefaultBpmn(userId: string, useCase: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('default_bpmns')
    .select('bpmn_xml')
    .eq('user_id', userId)
    .eq('use_case', useCase)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no rows
    throw error;
  }
  return data?.bpmn_xml ?? null;
}

export async function copyProject(projectId: string, newName: string): Promise<ProjectRow> {
  // Load the original project
  const original = await loadProject(projectId);
  if (!original) throw new Error('Project not found');

  // Strip id and timestamps, insert as new row
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = original;
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...rest, project_name: newName })
    .select()
    .single();

  if (error) throw error;
  return data as ProjectRow;
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}
