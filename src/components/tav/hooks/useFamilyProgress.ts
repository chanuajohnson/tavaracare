
import { useSharedFamilyJourneyData } from '@/hooks/useSharedFamilyJourneyData';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';

// Export the shared family journey data as the family progress for TAV
export const useFamilyProgress = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  
  const sharedData = useSharedFamilyJourneyData(userId);
  
  // Add modal state management to the shared data
  return {
    ...sharedData,
    showCaregiverMatchingModal,
    setShowCaregiverMatchingModal,
    // Override step 4 action to open modal
    steps: sharedData.steps?.map(step => ({
      ...step,
      action: step.step_number === 4 
        ? () => setShowCaregiverMatchingModal(true)
        : step.action
    })) || []
  };
};
