
// Type definitions related to user profiles and onboarding

export interface OnboardingProgress {
  completedSteps?: {
    profile?: boolean;
    care_needs?: boolean;
    care_recipient_story?: boolean;
    care_plan?: boolean;
    subscription?: boolean;
    [key: string]: boolean | undefined;
  };
  currentStep?: string;
  lastUpdated?: string;
}

export interface CarePlanMetadata {
  site_visit_status?: 'pending' | 'scheduled' | 'completed';
  site_visit_date?: string;
  site_visit_notes?: string;
  care_plan_status?: 'draft' | 'under_review' | 'active' | 'inactive' | 'completed';
  care_plan_notes?: string;
  [key: string]: any;
}

export interface ProfileCarePlan {
  id: string;
  family_id: string;
  metadata?: CarePlanMetadata;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  onboarding_progress?: OnboardingProgress;
  created_at?: string;
  updated_at?: string;
}
