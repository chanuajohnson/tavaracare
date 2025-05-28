export interface CareNeedsFormData {
  // Header fields
  care_recipient_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  care_location: string;
  preferred_shift_start: string;
  preferred_shift_end: string;
  preferred_days: string[];
  
  // Daily Living Tasks (ADLs)
  assistance_bathing: boolean;
  assistance_dressing: boolean;
  assistance_toileting: boolean;
  assistance_oral_care: boolean;
  assistance_feeding: boolean;
  assistance_mobility: boolean;
  assistance_medication: boolean;
  assistance_companionship: boolean;
  assistance_naps: boolean;
  
  // Cognitive / Memory Support
  dementia_redirection: boolean;
  memory_reminders: boolean;
  gentle_engagement: boolean;
  wandering_prevention: boolean;
  triggers_soothing_techniques: string;
  
  // Medical & Special Conditions
  diagnosed_conditions: string;
  chronic_illness_type: string;
  vitals_check: boolean;
  equipment_use: boolean;
  fall_monitoring: boolean;
  
  // Housekeeping & Meals
  tidy_room: boolean;
  laundry_support: boolean;
  meal_prep: boolean;
  grocery_runs: boolean;
  
  // Transportation
  escort_to_appointments: boolean;
  fresh_air_walks: boolean;
  
  // Emergency Protocols
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  known_allergies: string;
  emergency_plan: string;
  
  // Communication Preferences
  communication_method: string;
  daily_report_required: boolean;
  checkin_preference: string;
  
  // Cultural Preferences
  cultural_preferences: string;
  additional_notes: string;
}

export const initialFormData: CareNeedsFormData = {
  care_recipient_name: "",
  primary_contact_name: "",
  primary_contact_phone: "",
  care_location: "",
  preferred_shift_start: "",
  preferred_shift_end: "",
  preferred_days: [],
  assistance_bathing: false,
  assistance_dressing: false,
  assistance_toileting: false,
  assistance_oral_care: false,
  assistance_feeding: false,
  assistance_mobility: false,
  assistance_medication: false,
  assistance_companionship: false,
  assistance_naps: false,
  dementia_redirection: false,
  memory_reminders: false,
  gentle_engagement: false,
  wandering_prevention: false,
  triggers_soothing_techniques: "",
  diagnosed_conditions: "",
  chronic_illness_type: "",
  vitals_check: false,
  equipment_use: false,
  fall_monitoring: false,
  tidy_room: false,
  laundry_support: false,
  meal_prep: false,
  grocery_runs: false,
  escort_to_appointments: false,
  fresh_air_walks: false,
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  known_allergies: "",
  emergency_plan: "",
  communication_method: "text",
  daily_report_required: false,
  checkin_preference: "written",
  cultural_preferences: "",
  additional_notes: ""
};

export const daysOfWeek = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" }
];
