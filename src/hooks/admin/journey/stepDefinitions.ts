
import { JourneyStepData } from './types';

export const STEP_TITLES = [
  'Complete Profile',
  'Care Assessment',
  'Legacy Story',
  'View Matches',
  'Medication Setup',
  'Meal Planning',
  'Schedule Visit',
  'Confirm Visit',
  'Schedule Trial',
  'Pay for Trial',
  'Begin Trial',
  'Choose Path'
];

export const STEP_CATEGORIES: Array<'foundation' | 'scheduling' | 'trial' | 'conversion'> = [
  'foundation', 'foundation', 'foundation', 'foundation', 'foundation', 'foundation',
  'scheduling', 'scheduling',
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
