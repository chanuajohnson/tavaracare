
export interface JourneyStepData {
  id: number;
  title: string;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
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
  trialCompleted: boolean;
  subscriptionConversion: boolean;
  directHireConversion: boolean;
}
