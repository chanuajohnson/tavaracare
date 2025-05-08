import { Json } from '../utils/json';

/**
 * Frontend model for care plans (camelCase)
 */
export interface CarePlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  familyId: string;
  status: 'active' | 'completed' | 'cancelled';
  metadata?: CarePlanMetadata;
}

/**
 * Frontend model for care plan metadata (camelCase)
 */
export interface CarePlanMetadata {
  planType: 'scheduled' | 'on-demand' | 'both';
  weekdayCoverage?: '8am-4pm' | '8am-6pm' | '6am-6pm' | '6pm-8am' | 'none';
  weekendCoverage?: 'yes' | 'no';
  additionalShifts?: {
    weekdayEvening4pmTo6am?: boolean;
    weekdayEvening4pmTo8am?: boolean;
    weekdayEvening6pmTo6am?: boolean;
    weekdayEvening6pmTo8am?: boolean;
    weekday8amTo4pm?: boolean;
    weekday8amTo6pm?: boolean;
  };
  customShifts?: Array<{
    days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
    startTime: string; // In 24-hour format, e.g., "12:00"
    endTime: string; // In 24-hour format, e.g., "17:00"
    title?: string; // Optional custom title
  }>;
}

/**
 * Database model for care plan inserts (snake_case)
 */
export interface DbCarePlanInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  title: string;
  description: string;
  family_id: string;
  status?: 'active' | 'completed' | 'cancelled';
  metadata?: Json;
}

/**
 * Database model for care plans (snake_case)
 */
export interface DbCarePlan {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  family_id: string;
  status: 'active' | 'completed' | 'cancelled';
  metadata?: Json;
}

/**
 * Database model for care plan metadata (snake_case)
 */
export interface DbCarePlanMetadata {
  plan_type: 'scheduled' | 'on-demand' | 'both';
  weekday_coverage?: '8am-4pm' | '8am-6pm' | '6am-6pm' | '6pm-8am' | 'none';
  weekend_coverage?: 'yes' | 'no';
  additional_shifts?: {
    weekday_evening_4pm_to_6am?: boolean;
    weekday_evening_4pm_to_8am?: boolean;
    weekday_evening_6pm_to_6am?: boolean;
    weekday_evening_6pm_to_8am?: boolean;
    weekday_8am_to_4pm?: boolean;
    weekday_8am_to_6pm?: boolean;
  };
  custom_shifts?: Array<{
    days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
    start_time: string;
    end_time: string;
    title?: string;
  }>;
}

/**
 * Interface for family care needs
 */
export interface FamilyCareNeeds {
  id?: string;
  profileId: string;
  
  // Daily Living Assistance
  assistanceBathing?: boolean;
  assistanceDressing?: boolean;
  assistanceToileting?: boolean;
  assistanceOralCare?: boolean;
  assistanceFeeding?: boolean;
  assistanceMobility?: boolean;
  assistanceMedication?: boolean;
  assistanceCompanionship?: boolean;
  assistanceNaps?: boolean;
  
  // Cognitive & Memory Support
  dementiaRedirection?: boolean;
  memoryReminders?: boolean;
  gentleEngagement?: boolean;
  wanderingPrevention?: boolean;
  cognitiveNotes?: string;
  
  // Medical & Special Conditions
  diagnosedConditions?: string;
  equipmentUse?: boolean;
  fallMonitoring?: boolean;
  vitalsCheck?: boolean;
  
  // Housekeeping & Transportation
  tidyRoom?: boolean;
  laundrySupport?: boolean;
  groceryRuns?: boolean;
  mealPrep?: boolean;
  escortToAppointments?: boolean;
  freshAirWalks?: boolean;
  
  // Emergency & Communication
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  communicationMethod?: string;
  dailyReportRequired?: boolean;
  additionalNotes?: string;

  // Shift Info
  preferredDays?: string[];
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for database care needs (snake_case)
 */
export interface DbFamilyCareNeeds {
  id?: string;
  profile_id: string;
  
  // Daily Living Assistance
  assistance_bathing?: boolean;
  assistance_dressing?: boolean;
  assistance_toileting?: boolean;
  assistance_oral_care?: boolean;
  assistance_feeding?: boolean;
  assistance_mobility?: boolean;
  assistance_medication?: boolean;
  assistance_companionship?: boolean;
  assistance_naps?: boolean;
  
  // Cognitive & Memory Support
  dementia_redirection?: boolean;
  memory_reminders?: boolean;
  gentle_engagement?: boolean;
  wandering_prevention?: boolean;
  cognitive_notes?: string;
  
  // Medical & Special Conditions
  diagnosed_conditions?: string;
  equipment_use?: boolean;
  fall_monitoring?: boolean;
  vitals_check?: boolean;
  
  // Housekeeping & Transportation
  tidy_room?: boolean;
  laundry_support?: boolean;
  grocery_runs?: boolean;
  meal_prep?: boolean;
  escort_to_appointments?: boolean;
  fresh_air_walks?: boolean;
  
  // Emergency & Communication
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  communication_method?: string;
  daily_report_required?: boolean;
  additional_notes?: string;

  // Shift Info
  preferred_days?: string[];
  preferred_time_start?: string;
  preferred_time_end?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}
