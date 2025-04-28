
export interface CarePlan {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  familyId: string;
  metadata?: CarePlanMetadata;
  createdAt: string;
  updatedAt: string;
}

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
}

// Database models for adapter conversion
export interface DbCarePlan {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  family_id: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface DbCarePlanInsert {
  id?: string;
  title: string;
  description?: string;
  status?: 'active' | 'completed' | 'cancelled';
  family_id: string;
  metadata?: any;
}

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
}
