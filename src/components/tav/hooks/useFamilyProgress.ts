
import { useSharedFamilyProgress } from '@/hooks/useSharedFamilyProgress';

// TAV family progress now uses the shared source of truth
// This ensures consistency across Family Dashboard, Admin Dashboard, and TAV
export const useFamilyProgress = () => {
  const sharedProgress = useSharedFamilyProgress();
  
  // Return the data in the format expected by TAV components
  return {
    ...sharedProgress,
    // TAV-specific helpers if needed
    isFoundationComplete: sharedProgress.foundationSteps.every(step => step.completed),
    isSchedulingComplete: sharedProgress.schedulingSteps.every(step => step.completed),
    isTrialComplete: sharedProgress.trialSteps.every(step => step.completed),
    isConversionComplete: sharedProgress.conversionSteps.every(step => step.completed),
  };
};
