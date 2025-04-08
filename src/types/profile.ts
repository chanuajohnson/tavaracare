
import { Json } from '../utils/json';

export type UserRole = 'family' | 'professional' | 'community' | 'admin';

/**
 * Frontend model for profiles (camelCase)
 */
export interface Profile {
  id: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  
  // Family-specific fields
  careRecipientName?: string;
  relationship?: string;
  careTypes?: string[];
  specialNeeds?: string[];
  specializedCare?: string[];
  otherSpecialNeeds?: string;
  caregiverType?: string;
  preferredContactMethod?: string;
  careSchedule?: string | string[];
  budgetPreferences?: string;
  caregiverPreferences?: string;
  additionalNotes?: string;
  
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
}

/**
 * Database model for profile inserts (snake_case)
 */
export interface DbProfileInsert {
  id: string;
  role: UserRole;
  full_name?: string;
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
  care_schedule?: string | string[];
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
  has_training?: boolean;
  
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

/**
 * Database model for profiles (snake_case)
 */
export interface DbProfile {
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
  care_schedule?: string | string[];
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
  has_training?: boolean;
  
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
