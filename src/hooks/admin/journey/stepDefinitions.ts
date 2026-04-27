
import { JourneyStepData, JourneyCategory } from './types';

export const STEP_TITLES = [
  'Complete Profile',           // 1
  'Care Assessment',            // 2
  'Legacy Story',               // 3
  'View Matches',               // 4
  'Medication Setup',           // 5
  'Meal Planning',              // 6
  'Schedule Visit',             // 7
  'Confirm Visit',              // 8
  'Care Team Confirmed',        // 9
  'Initial Family Meeting',     // 10
  'Care Begins',                // 11
  'Care Readiness Assessment',  // 12
  'Home Environment Optimization', // 13
  'Schedule Trial',             // 14
  'Pay for Trial',              // 15
  'Begin Trial',                // 16
  'Choose Path'                 // 17
];

export const STEP_CATEGORIES: JourneyCategory[] = [
  'foundation', 'foundation', 'foundation', 'foundation', 'foundation', 'foundation',
  'scheduling', 'scheduling',
  'care_coordination', 'care_coordination', 'care_coordination',
  'care_environment', 'care_environment',
  'trial', 'trial', 'trial',
  'conversion'
];

export const createStepData = (stepCompletionData: Record<number, number>, totalUsers: number): JourneyStepData[] => {
  return STEP_TITLES.map((title, index) => ({
    id: index + 1,
    title,
    category: STEP_CATEGORIES[index],
    completed: stepCompletionData[index + 1] > 0,
    completionRate: totalUsers > 0 ? (stepCompletionData[index + 1] / totalUsers) * 100 : 0
  }));
};
