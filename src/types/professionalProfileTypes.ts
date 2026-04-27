
/**
 * Professional-specific profile fields
 */
export interface ProfessionalProfileFields {
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
  customSchedule?: string;
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
}

/**
 * Database model for professional profile fields (snake_case)
 */
export interface DbProfessionalProfileFields {
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
  custom_schedule?: string;
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
}
