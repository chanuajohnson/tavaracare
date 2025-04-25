
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
  weekdayCoverage?: '8am-4pm' | '6am-6pm' | '6pm-8am' | 'none';
  weekendCoverage?: 'yes' | 'no' | '8am-6pm';
  additionalShifts?: {
    weekdayEvening4pmTo6am?: boolean;
    weekdayEvening4pmTo8am?: boolean;
    weekdayEvening6pmTo6am?: boolean;
    weekdayEvening6pmTo8am?: boolean;
  };
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
  weekday_coverage?: '8am-4pm' | '6am-6pm' | '6pm-8am' | 'none';
  weekend_coverage?: 'yes' | 'no' | '8am-6pm';
  additional_shifts?: {
    weekday_evening_4pm_to_6am?: boolean;
    weekday_evening_4pm_to_8am?: boolean;
    weekday_evening_6pm_to_6am?: boolean;
    weekday_evening_6pm_to_8am?: boolean;
  };
}
