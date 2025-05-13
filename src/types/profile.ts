
// Type definitions related to user profiles and onboarding

// Add a Json type to handle onboarding_progress
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface OnboardingProgress {
  completedSteps?: {
    profile?: boolean;
    care_needs?: boolean;
    care_recipient_story?: boolean;
    care_plan?: boolean;
    subscription?: boolean;
    [key: string]: boolean | undefined;
  };
  currentStep?: string;
  lastUpdated?: string;
  [key: string]: any; // Allow additional properties
}

export interface CarePlanMetadata {
  site_visit_status?: 'pending' | 'scheduled' | 'completed';
  site_visit_date?: string;
  site_visit_notes?: string;
  care_plan_status?: 'draft' | 'under_review' | 'active' | 'inactive' | 'completed';
  care_plan_notes?: string;
  [key: string]: any;
}

export interface ProfileCarePlan {
  id: string;
  family_id: string;
  metadata?: CarePlanMetadata;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  onboarding_progress?: OnboardingProgress | Json;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Family-specific fields
  careRecipientName?: string;
  relationship?: string;
  careTypes?: string[];
  specialNeeds?: string[];
  specializedCare?: string[];
  otherSpecialNeeds?: string;
  caregiverType?: string;
  preferredContactMethod?: string;
  careSchedule?: string;
  budgetPreferences?: string;
  caregiverPreferences?: string;
  additionalNotes?: string;
  care_needs?: string[]; // Add care_needs property
  
  // Professional-specific fields
  professionalType?: string;
  licenseNumber?: string;
  certifications?: string[];
  otherCertification?: string;
  certificationProofUrl?: string;
  careServices?: string[];
  languages?: string[];
  yearsOfExperience?: string;
  workType?: string;
  availability?: string[];
  backgroundCheck?: boolean;
  backgroundCheckProofUrl?: string;
  legallyAuthorized?: boolean;
  expectedRate?: string;
  paymentMethods?: string[];
  bio?: string;
  whyChooseCaregiving?: string;
  preferredWorkLocations?: string;
  commuteMode?: string;
  listInDirectory?: boolean;
  enableJobAlerts?: boolean;
  jobNotificationMethod?: string;
  jobMatchingCriteria?: string[];
  customAvailabilityAlerts?: string;
  hasTraining?: boolean;
  
  // Community-specific fields
  location?: string;
  website?: string;
  communityRoles?: string[];
  contributionInterests?: string[];
  caregivingExperience?: string;
  caregivingAreas?: string[];
  techInterests?: string[];
  involvementPreferences?: string[];
  communicationChannels?: string[];
  communityMotivation?: string;
  improvementIdeas?: string;
  listInCommunityDirectory?: boolean;
  enableCommunityNotifications?: boolean;
  
  // Database fields (snake_case versions)
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  care_recipient_name?: string;
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
  professional_type?: string;
  license_number?: string;
  other_certification?: string;
  certification_proof_url?: string;
  care_services?: string[];
  years_of_experience?: string;
  work_type?: string;
  background_check?: boolean;
  background_check_proof_url?: string;
  legally_authorized?: boolean;
  expected_rate?: string;
  payment_methods?: string[];
  why_choose_caregiving?: string;
  preferred_work_locations?: string;
  commute_mode?: string;
  list_in_directory?: boolean;
  enable_job_alerts?: boolean;
  job_notification_method?: string;
  job_matching_criteria?: string[];
  custom_availability_alerts?: string;
  has_training?: boolean;
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
  
  // Additional fields sometimes present in database responses
  additional_professional_notes?: string;
  administers_medication?: boolean;
  has_liability_insurance?: boolean;
  other_medical_condition?: string;
  hourly_rate?: string;
  medical_conditions_experience?: string[];
  custom_schedule?: string;
  registration_skipped?: boolean;
  emergency_contact?: string;
  provides_housekeeping?: boolean;
  provides_transportation?: boolean;
  handles_medical_equipment?: boolean;
}

