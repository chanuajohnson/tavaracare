
export interface ProfessionalDocument {
  document_type: string;
  file_name: string;
  [key: string]: any;
}

export interface CareTeamAssignment {
  id: string;
  status: string;
  role: string;
  [key: string]: any;
}

export interface ProfileData {
  id: string;
  professional_type?: string;
  years_of_experience?: string;
  certifications?: string[];
  care_schedule?: string[] | string;
  [key: string]: any;
}

export interface ProfessionalReference {
  id: string;
  professional_id: string;
  reference_name: string;
  reference_phone?: string;
  reference_email?: string;
  reference_relationship: string;
  years_known?: string;
  reference_notes?: string;
  verified_by?: string;
  verified_at?: string;
  status: 'pending' | 'verified' | 'flagged';
  created_at: string;
  updated_at: string;
}

export interface ProfessionalScreening {
  id: string;
  professional_id: string;
  screening_type: 'head_nurse_interview' | 'skills_assessment';
  scheduled_at?: string;
  completed_at?: string;
  interviewer_name?: string;
  status: 'pending' | 'scheduled' | 'passed' | 'failed' | 'needs_followup';
  notes?: string;
  rating?: number;
  recommendation?: 'approve' | 'reject' | 'conditional';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  accessible: boolean;
  link: string;
  buttonText: string;
  category: string;
  stage: string;
  isInteractive: boolean;
}

export interface SpecificUserProfessionalProgressData {
  steps: ProfessionalStep[];
  completionPercentage: number;
  nextStep?: ProfessionalStep;
  loading: boolean;
}
