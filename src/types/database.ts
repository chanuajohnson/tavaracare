
export type UserRole = 'family' | 'professional' | 'community' | 'admin';

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
  
  // Family-specific fields
  care_recipient_name?: string;
  relationship?: string;
  care_types?: string[];
  special_needs?: string[];
  specialized_care?: string[];
  other_special_needs?: string;
  caregiver_type?: string;
  preferred_contact_method?: string;
  care_schedule?: string;
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
