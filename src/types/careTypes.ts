
// Domain model type definitions for care-related entities

// Care Plan 
export interface CarePlan {
  id: string;
  familyId: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  metadata?: CarePlanMetadata;
}

// Care Plan Metadata
export interface CarePlanMetadata {
  planType: 'scheduled' | 'on-demand' | 'both';
  weekdayCoverage?: '8am-4pm' | '6am-6pm' | '6pm-8am' | 'none';
  weekendCoverage?: 'yes' | 'no';
  additionalShifts?: {
    weekdayEvening4pmTo6am?: boolean;
    weekdayEvening4pmTo8am?: boolean;
    weekdayEvening6pmTo6am?: boolean;
    weekdayEvening6pmTo8am?: boolean;
  };
}

// Care Shift
export interface CareShift {
  id: string;
  carePlanId: string;
  familyId: string;
  caregiverId?: string;
  title: string;
  description?: string;
  location?: string;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  recurringPattern?: string;
  recurrenceRule?: string;
  createdAt: string;
  updatedAt: string;
  googleCalendarEventId?: string;
}

// Care Team Member
export interface CareTeamMember {
  id: string;
  carePlanId: string;
  familyId: string;
  caregiverId: string;
  role: 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other';
  status: 'invited' | 'active' | 'declined' | 'removed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  display_name?: string;
}

// Professional details from profiles
export interface ProfessionalDetails {
  full_name?: string | null;
  professional_type?: string | null;
  avatar_url?: string | null;
}

// Care Team Member with associated profile information
export interface CareTeamMemberWithProfile extends CareTeamMember {
  professionalDetails?: ProfessionalDetails;
  profile?: {
    fullName: string;
    avatarUrl?: string;
    professionalType?: string;
    yearsOfExperience?: string;
    certifications?: string[];
  };
  displayName?: string;
}

// DTOs for database interaction

// Care Plan database model
export interface CarePlanDto {
  id?: string;
  family_id: string;
  title: string;
  description?: string;
  status?: 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  metadata?: any;
}

// Care Plan Input for create/update operations
export interface CarePlanInput {
  title: string;
  description: string;
  familyId: string;
  status?: 'active' | 'completed' | 'cancelled';
  metadata?: CarePlanMetadata;
}

// Care Shift database model
export interface CareShiftDto {
  id?: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id?: string;
  title: string;
  description?: string;
  location?: string;
  status?: 'open' | 'assigned' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  recurring_pattern?: string;
  recurrence_rule?: string;
  created_at?: string;
  updated_at?: string;
  google_calendar_event_id?: string;
}

// Care Shift Input for create/update operations
export interface CareShiftInput {
  carePlanId: string;
  familyId: string;
  caregiverId?: string;
  title: string;
  description?: string;
  location?: string;
  status?: 'open' | 'assigned' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  recurringPattern?: string;
  recurrenceRule?: string;
  googleCalendarEventId?: string;
}

// Care Team Member database model
export interface CareTeamMemberDto {
  id?: string;
  care_plan_id: string;
  family_id: string;
  caregiver_id: string;
  role?: 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other';
  status?: 'invited' | 'active' | 'declined' | 'removed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  display_name?: string;
}

// Care Team Member Input for create/update operations
export interface CareTeamMemberInput {
  carePlanId: string;
  familyId: string;
  caregiverId: string;
  role?: 'caregiver' | 'nurse' | 'therapist' | 'doctor' | 'other';
  status?: 'invited' | 'active' | 'declined' | 'removed';
  notes?: string;
}
