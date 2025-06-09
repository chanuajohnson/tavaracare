
import { useSharedFamilyJourneyData } from '@/hooks/useSharedFamilyJourneyData';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Export the shared family journey data as the family progress for TAV
export const useFamilyProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || '';
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  
  const sharedData = useSharedFamilyJourneyData(userId);
  
  // Enhanced step action handlers that match the family dashboard
  const getStepAction = (stepId: number) => {
    switch (stepId) {
      case 1: // Complete Profile
        return () => navigate('/dashboard/family');
      case 2: // Care Assessment
        return () => navigate('/family/care-assessment');
      case 3: // Legacy Story
        return () => navigate('/family/care-recipient');
      case 4: // Caregiver Matches
        return () => {
          const canAccess = sharedData.steps.find(s => s.id === 1)?.completed && 
                           sharedData.steps.find(s => s.id === 2)?.completed && 
                           sharedData.steps.find(s => s.id === 3)?.completed;
          if (canAccess) {
            navigate('/family/caregiver-matching');
          }
        };
      case 5: // Medication Management
        return () => navigate('/family/care-management');
      case 6: // Meal Management
        return () => navigate('/family/care-management');
      case 7: // Schedule Visit
        return () => navigate('/family/schedule-visit');
      case 8: // Schedule Trial (Optional)
        return () => navigate('/family/trial-scheduling');
      case 9: // Pay for Trial (Optional)
        return () => navigate('/family/trial-payment');
      case 10: // Begin Trial (Optional)
        return () => navigate('/family/trial-day');
      case 11: // Rate & Choose Path
        return () => navigate('/family/care-model-selection');
      default:
        return () => navigate('/dashboard/family');
    }
  };

  // Add proper action handlers to the steps
  const enhancedSteps = sharedData.steps.map(step => ({
    ...step,
    action: getStepAction(step.id),
    accessible: step.id === 4 
      ? sharedData.steps.find(s => s.id === 1)?.completed && 
        sharedData.steps.find(s => s.id === 2)?.completed && 
        sharedData.steps.find(s => s.id === 3)?.completed
      : step.accessible
  }));
  
  return {
    ...sharedData,
    steps: enhancedSteps,
    showCaregiverMatchingModal,
    setShowCaregiverMatchingModal
  };
};
