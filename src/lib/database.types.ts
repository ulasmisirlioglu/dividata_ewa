export interface StepDurationRecord {
  id: string;
  name: string;
  suggested: number;
  actual: number;
}

export interface DigitalStepRecord {
  id: string;
  name: string;
  digitalReplacement: string;
  digitalizationPercent: number;
  digitalDuration: number;
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          municipality_name: string;
          use_case: string;
          bpmn_xml: string;
          step_durations: StepDurationRecord[];
          digital_steps: DigitalStepRecord[];
          salary_group: string;
          monthly_volume: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          municipality_name: string;
          use_case: string;
          bpmn_xml: string;
          step_durations?: StepDurationRecord[];
          digital_steps?: DigitalStepRecord[];
          salary_group?: string;
          monthly_volume?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          municipality_name?: string;
          use_case?: string;
          bpmn_xml?: string;
          step_durations?: StepDurationRecord[];
          digital_steps?: DigitalStepRecord[];
          salary_group?: string;
          monthly_volume?: number;
          created_at?: string;
          updated_at?: string;
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
