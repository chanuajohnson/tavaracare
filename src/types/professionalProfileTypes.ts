
/**
 * Professional-specific profile fields
 */
export interface ProfessionalProfileFields {
  professionalType?: string;
  yearsOfExperience?: string;
  specializations?: string[];
  certifications?: string[];
  services?: string[];
  hourlyRate?: string;
  availability?: string[];  // Changed from string to string[] to match database
  location?: string;
  legallyAuthorized?: boolean;
  backgroundCheckStatus?: string;
  references?: string[];
  experience?: string;
  workPreference?: string;
  transportation?: string;
  additionalSkills?: string;
  carePhilosophy?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

/**
 * Database model for professional profile fields (snake_case)
 */
export interface DbProfessionalProfileFields {
  professional_type?: string;
  years_of_experience?: string;
  specializations?: string[];
  certifications?: string[];
  services?: string[];
  hourly_rate?: string;
  availability?: string[];  // Changed from string to string[] to match database
  location?: string;
  legally_authorized?: boolean;
  background_check_status?: string;
  references?: string[];
  experience?: string;
  work_preference?: string;
  transportation?: string;
  additional_skills?: string;
  care_philosophy?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}
