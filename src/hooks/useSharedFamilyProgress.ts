
import { useFamilyJourneyProgress } from './useFamilyJourneyProgress';

// Single source of truth for family journey progress
// This hook ensures all components (Family Dashboard, Admin Dashboard, TAV) 
// use the same step definitions and progress calculations
export const useSharedFamilyProgress = (userId?: string) => {
  // If userId is provided (for admin views), we use the original hook
  // If no userId (for family dashboard), we use the current user's progress
  const progressData = useFamilyJourneyProgress();
  
  // Return standardized progress data that all components can use
  return {
    ...progressData,
    // Ensure we have consistent step numbering (11 total steps)
    totalSteps: 11,
    // Foundation steps: 1-6
    foundationSteps: progressData.steps.filter(step => step.category === 'foundation'),
    // Scheduling steps: 7
    schedulingSteps: progressData.steps.filter(step => step.category === 'scheduling'),
    // Trial steps: 8-10
    trialSteps: progressData.steps.filter(step => step.category === 'trial'),
    // Conversion steps: 11
    conversionSteps: progressData.steps.filter(step => step.category === 'conversion'),
    
    // Helper to get steps by category for different views
    getStepsByCategory: (category: 'foundation' | 'scheduling' | 'trial' | 'conversion') => {
      return progressData.steps.filter(step => step.category === category);
    },
    
    // Helper to get foundation steps only (for family dashboard display)
    getFoundationStepsOnly: () => {
      return progressData.steps.filter(step => step.category === 'foundation').slice(0, 6);
    }
  };
};
