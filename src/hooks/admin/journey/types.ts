
export type JourneyCategory = 'foundation' | 'scheduling' | 'care_coordination' | 'care_environment' | 'trial' | 'conversion';

export interface JourneyStepData {
  id: number;
  title: string;
  category: JourneyCategory;
  completed: boolean;
  completionRate: number;
  avgTimeToComplete?: number;
  dropOffRate?: number;
}

export interface ConversionMetrics {
  foundationToScheduling: number;
  schedulingToTrial: number;
  trialToSubscription: number;
  directHireConversion: number;
  subscriptionConversion: number;
}

export interface AdminJourneyData {
  overallCompletionRate: number;
  stepData: JourneyStepData[];
  conversionMetrics: ConversionMetrics;
  totalUsers: number;
  activeJourneyUsers: number;
  completedJourneyUsers: number;
  loading: boolean;
}

export interface UserProgress {
  userStepCount: number;
  foundationCompleted: boolean;
  schedulingCompleted: boolean;
  careCoordinationCompleted: boolean;
  careEnvironmentCompleted: boolean;
  trialCompleted: boolean;
  subscriptionConversion: boolean;
  directHireConversion: boolean;
}
