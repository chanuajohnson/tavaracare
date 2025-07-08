
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
