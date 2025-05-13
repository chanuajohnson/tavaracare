
export interface Profile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  onboarding_progress?: {
    completedSteps?: {
      profile?: boolean;
      care_needs?: boolean;
      care_recipient_story?: boolean;
      care_plan?: boolean;
      [key: string]: boolean | undefined;
    };
    currentStep?: string;
    lastUpdated?: string;
  };
  [key: string]: any;
}
