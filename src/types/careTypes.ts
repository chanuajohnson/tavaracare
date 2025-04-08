
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
}

// Care Team Member with associated profile information
export interface CareTeamMemberWithProfile extends CareTeamMember {
  profile?: {
    fullName: string;
    avatarUrl?: string;
    professionalType?: string;
    yearsOfExperience?: string;
    certifications?: string[];
  };
}
