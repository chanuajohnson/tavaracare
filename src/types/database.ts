
export type UserRole = 'family' | 'professional' | 'community' | 'admin';

export interface OnboardingProgress {
  currentStep?: string;
  completedSteps?: {
    care_needs?: boolean;
    care_plan?: boolean;
    care_recipient_story?: boolean;
    [key: string]: boolean | undefined;
  };
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
  onboarding_progress?: OnboardingProgress;
  
  // Family-specific fields
  care_recipient_name?: string;
  relationship?: string;
  care_types?: string[];
  special_needs?: string[];
  specialized_care?: string[];
  other_special_needs?: string;
  caregiver_type?: string;
  preferred_contact_method?: string;
  care_schedule?: string;  // Changed from string | string[] to string for database compatibility
  budget_preferences?: string;
  caregiver_preferences?: string;
  additional_notes?: string;
  
  // Professional-specific fields
  professional_type?: string;
  license_number?: string;
  certifications?: string[];
  other_certification?: string;
  certification_proof_url?: string;
  care_services?: string[];
  languages?: string[];
  years_of_experience?: string;
  work_type?: string;
  availability?: string[];
  background_check?: boolean;
  background_check_proof_url?: string;
  legally_authorized?: boolean;
  expected_rate?: string;
  payment_methods?: string[];
  bio?: string;
  why_choose_caregiving?: string;
  preferred_work_locations?: string;
  commute_mode?: string;
  list_in_directory?: boolean;
  enable_job_alerts?: boolean;
  job_notification_method?: string;
  job_matching_criteria?: string[];
  custom_availability_alerts?: string;
  has_training?: boolean; // This field is needed
  
  // Community-specific fields
  location?: string;
  website?: string;
  community_roles?: string[];
  contribution_interests?: string[];
  caregiving_experience?: string;
  caregiving_areas?: string[];
  tech_interests?: string[];
  involvement_preferences?: string[];
  communication_channels?: string[];
  community_motivation?: string;
  improvement_ideas?: string;
  list_in_community_directory?: boolean;
  enable_community_notifications?: boolean;
}

export interface CarePlan {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  family_id: string;
  status: 'active' | 'completed' | 'cancelled';
  metadata?: CarePlanMetadata | any; // Added 'any' as a fallback for JSON data
}

export interface CarePlanMetadata {
  plan_type: 'scheduled' | 'on-demand' | 'both';
  weekday_coverage?: '8am-4pm' | '6am-6pm' | '6pm-8am' | 'none';
  weekend_coverage?: 'yes' | 'no';
  additional_shifts?: {
    weekdayEvening4pmTo6am?: boolean;
    weekdayEvening4pmTo8am?: boolean;
    weekdayEvening6pmTo6am?: boolean;
    weekdayEvening6pmTo8am?: boolean;
  };
}

export interface CareTask {
  id: string;
  created_at: string;
  updated_at: string;
  care_plan_id: string;
  assigned_to: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Document {
  id: string;
  created_at: string;
  care_plan_id: string;
  name: string;
  file_url: string;
  uploaded_by: string;
  type: 'medical' | 'care_plan' | 'other';
}
