
/**
 * Re-export all profile-related types from their respective files
 */
export * from './profileTypes';

// Export the OnboardingProgress interface directly here for easier imports
export interface OnboardingProgress {
  currentStep?: string;
  completedSteps?: {
    care_needs?: boolean;
    care_plan?: boolean;
    care_recipient_story?: boolean;
    [key: string]: boolean | undefined;
  };
}

// Export care plan metadata types for consistency
export interface CarePlanMetadata {
  site_visit_status?: 'not_scheduled' | 'scheduled' | 'completed';
  care_plan_status?: 'draft' | 'under_review' | 'active';
  plan_type?: 'scheduled' | 'on-demand' | 'both';
  weekday_coverage?: '8am-4pm' | '6am-6pm' | '6pm-8am' | 'none';
  weekend_coverage?: 'yes' | 'no';
  weekend_schedule_type?: '6am-6pm' | '8am-4pm' | '6pm-8am' | 'none';
  [key: string]: any;
}
