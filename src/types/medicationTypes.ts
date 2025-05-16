
export interface Medication {
  id: string;
  care_plan_id: string;
  name: string;
  dosage?: string;
  instructions?: string;
  special_instructions?: string;
  schedule?: MedicationSchedule;
  medication_type?: string;
  prescription_terms?: string;
  term_definitions?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationSchedule {
  morning?: boolean;
  afternoon?: boolean;
  evening?: boolean;
  night?: boolean;
  times?: string[];
  days?: string[];
  custom?: string;
}

export interface MedicationAdministration {
  id: string;
  medication_id: string;
  administered_by?: string;
  administered_at: string;
  status: 'administered' | 'skipped' | 'refused' | 'pending';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  caregiver_name?: string; // Joined field for display
}

export interface MedicationFormData {
  name: string;
  dosage: string;
  instructions: string;
  special_instructions: string;
  medication_type: string;
  prescription_terms: string;
  schedule: MedicationSchedule;
}
