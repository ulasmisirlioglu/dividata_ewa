import type { StepDuration, DigitalStep, ProcessInterval } from '../store/useStore';

export interface ProjectRow {
  id: string;
  user_id: string;
  stadtname: string;
  use_case: string;
  project_name: string;
  bpmn_xml: string | null;
  step_durations: StepDuration[] | null;
  salary_group: string | null;
  hourly_rate: number | null;
  analog_cost_per_process: number | null;
  digital_steps: DigitalStep[] | null;
  analog_mitarbeiter_minutes: number | null;
  analog_buerger_minutes: number | null;
  digital_mitarbeiter_minutes: number | null;
  digital_buerger_minutes: number | null;
  digital_personnel_cost: number | null;
  license_cost_year: number | null;
  maintenance_cost_year: number | null;
  other_cost_year: number | null;
  implementation_cost: number | null;
  training_cost: number | null;
  yearly_total_cost: number | null;
  onetime_total_cost: number | null;
  process_intervals: ProcessInterval[] | null;
  mitarbeiter_minutes_saved_per_case: number | null;
  buerger_minutes_saved_per_case: number | null;
  cost_saving_per_case: number | null;
  breakeven_point: string | null;
  roi: number | null;
  created_at: string;
  updated_at: string;
}

interface DefaultBpmnRow {
  id: string;
  user_id: string;
  use_case: string;
  bpmn_xml: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      default_bpmns: {
        Row: DefaultBpmnRow;
        Insert: {
          id?: string;
          user_id: string;
          use_case: string;
          bpmn_xml: string;
        };
        Update: {
          user_id?: string;
          use_case?: string;
          bpmn_xml?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: ProjectRow;
        Insert: {
          id?: string;
          user_id: string;
          stadtname: string;
          use_case: string;
          project_name: string;
          bpmn_xml?: string | null;
          step_durations?: unknown;
          salary_group?: string | null;
          hourly_rate?: number | null;
          analog_cost_per_process?: number | null;
          digital_steps?: unknown;
          analog_mitarbeiter_minutes?: number | null;
          analog_buerger_minutes?: number | null;
          digital_mitarbeiter_minutes?: number | null;
          digital_buerger_minutes?: number | null;
          digital_personnel_cost?: number | null;
          license_cost_year?: number | null;
          maintenance_cost_year?: number | null;
          other_cost_year?: number | null;
          implementation_cost?: number | null;
          training_cost?: number | null;
          yearly_total_cost?: number | null;
          onetime_total_cost?: number | null;
          process_intervals?: unknown;
          mitarbeiter_minutes_saved_per_case?: number | null;
          buerger_minutes_saved_per_case?: number | null;
          cost_saving_per_case?: number | null;
          breakeven_point?: string | null;
          roi?: number | null;
        };
        Update: {
          user_id?: string;
          stadtname?: string;
          use_case?: string;
          project_name?: string;
          bpmn_xml?: string | null;
          step_durations?: unknown;
          salary_group?: string | null;
          hourly_rate?: number | null;
          analog_cost_per_process?: number | null;
          digital_steps?: unknown;
          analog_mitarbeiter_minutes?: number | null;
          analog_buerger_minutes?: number | null;
          digital_mitarbeiter_minutes?: number | null;
          digital_buerger_minutes?: number | null;
          digital_personnel_cost?: number | null;
          license_cost_year?: number | null;
          maintenance_cost_year?: number | null;
          other_cost_year?: number | null;
          implementation_cost?: number | null;
          training_cost?: number | null;
          yearly_total_cost?: number | null;
          onetime_total_cost?: number | null;
          process_intervals?: unknown;
          mitarbeiter_minutes_saved_per_case?: number | null;
          buerger_minutes_saved_per_case?: number | null;
          cost_saving_per_case?: number | null;
          breakeven_point?: string | null;
          roi?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      verify_login: {
        Args: { input_stadtname: string; input_password: string };
        Returns: { success: boolean; user_id?: string; stadtname?: string };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
