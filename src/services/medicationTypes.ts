
export interface MedicationAdministration {
  id: string;
  medication_id: string;
  administered_at: string;
  administered_by?: string;
  administered_by_role?: 'family' | 'professional';
  status: 'administered' | 'missed' | 'refused';
  notes?: string;
  conflict_detected?: boolean;
  conflict_resolved_at?: string;
  conflict_resolution_method?: string;
  original_administration_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationAdministrationWithProfile extends MedicationAdministration {
  profiles?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

export interface ConflictAwareAdministrationResult {
  success: boolean;
  requiresResolution?: boolean;
  conflicts?: Array<{
    id: string;
    administered_at: string;
    administered_by: string;
    administered_by_role: 'family' | 'professional';
    status: string;
    notes?: string;
  }>;
  timeWindow?: number;
  data?: MedicationAdministration;
  conflictDetected?: boolean;
  error?: string;
}
