
export interface FamilyProfileData {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  care_recipient_name?: string;
  relationship?: string;
  care_types?: string[];
  special_needs?: string[];
  care_schedule?: string;
  budget_preferences?: string;
  caregiver_type?: string;
  caregiver_preferences?: string;
  additional_notes?: string;
  preferred_contact_method?: string;
}

export interface CareAssessmentData {
  id: string;
  profile_id: string;
  care_recipient_name?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  care_location?: string;
  assistance_bathing?: boolean;
  assistance_dressing?: boolean;
  assistance_toileting?: boolean;
  assistance_feeding?: boolean;
  assistance_mobility?: boolean;
  assistance_medication?: boolean;
  assistance_companionship?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CareRecipientData {
  id: string;
  user_id: string;
  full_name: string;
  birth_year: string;
  personality_traits?: string[];
  hobbies_interests?: string[];
  life_story?: string;
  joyful_things?: string;
  unique_facts?: string;
  created_at?: string;
  last_updated?: string;
}

export interface FamilyReadinessData {
  registrationComplete: boolean;
  careAssessmentComplete: boolean;
  storyComplete: boolean;
  loading: boolean;
}
