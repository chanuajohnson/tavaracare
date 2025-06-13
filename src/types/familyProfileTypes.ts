
/**
 * Family-specific profile fields
 */
export interface FamilyProfileFields {
  careRecipientName?: string;
  relationship?: string;
  careTypes?: string[];
  specialNeeds?: string[];
  specializedCare?: string[];
  otherSpecialNeeds?: string;
  caregiverType?: string;
  preferredContactMethod?: string;
  careSchedule?: string;  // Changed from string | string[] to just string to match database
  budgetPreferences?: string;
  caregiverPreferences?: string;
  additionalNotes?: string;
}

/**
 * Database model for family profile fields (snake_case)
 */
export interface DbFamilyProfileFields {
  care_recipient_name?: string;
  relationship?: string;
  care_types?: string[];
  special_needs?: string[];
  specialized_care?: string[];
  other_special_needs?: string;
  caregiver_type?: string;
  preferred_contact_method?: string;
  care_schedule?: string;  // Changed from string | string[] to just string to match database
  budget_preferences?: string;
  caregiver_preferences?: string;
  additional_notes?: string;
}
