
import { useEnhancedJourneyProgress } from '@/hooks/useEnhancedJourneyProgress';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

// Export the enhanced family journey data as the family progress for TAV
export const useFamilyProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || '';
  
  // Use the enhanced journey progress hook for real data
  const enhancedData = useEnhancedJourneyProgress();
  
  // Helper function to get proper button text for each step
  const getButtonText = (step: any) => {
    if (!step.accessible && step.id === 4) {
      return "Complete Above Steps";
    }
    
    switch (step.step_number || step.id) {
      case 1:
        return step.completed ? "Edit Profile" : "Complete Profile";
      case 2:
        return step.completed ? "Edit Assessment" : "Start Assessment";
      case 3:
        return step.completed ? "Edit Story" : "Create Story";
      case 4:
        return step.completed ? "View Matches" : "View Matches";
      case 5:
        return step.completed ? "Edit Medications" : "Add Medications";
      case 6:
        return step.completed ? "Edit Meals" : "Add Meals";
      case 7:
        if (step.completed && enhancedData.visitDetails) {
          return "Cancel Visit";
        }
        return step.completed ? "Visit Scheduled" : "Schedule Visit";
      case 11:
        return step.completed ? "Edit Selection" : "Choose Path";
      default:
        return step.completed ? "View" : "Continue";
    }
  };

  // Helper function to get step action - uses the enhanced data's step actions
  const getStepAction = (step: any) => {
    if (step.action) {
      return step.action;
    }
    
    // Fallback actions if step doesn't have action property
    switch (step.step_number || step.id) {
      case 1:
        return () => navigate('/dashboard/family');
      case 2:
        return () => navigate('/family/care-assessment');
      case 3:
        return () => navigate('/family/care-recipient');
      case 4:
        return () => enhancedData.setShowCaregiverMatchingModal(true);
      case 5:
        return () => {
          if (enhancedData.carePlans.length > 0) {
            navigate(`/family/care-management/${enhancedData.carePlans[0].id}/medications`);
          } else {
            navigate('/family/care-management/create');
          }
        };
      case 6:
        return () => {
          if (enhancedData.carePlans.length > 0) {
            navigate(`/family/care-management/${enhancedData.carePlans[0].id}/meals`);
          } else {
            navigate('/family/care-management/create');
          }
        };
      case 7:
        return () => {
          if (step.completed && enhancedData.visitDetails) {
            enhancedData.setShowCancelVisitModal(true);
          } else {
            enhancedData.setShowScheduleModal(true);
          }
        };
      case 11:
        return () => navigate('/family/care-model-selection');
      default:
        return () => navigate('/dashboard/family');
    }
  };

  // Add proper action handlers and button text to the steps
  const enhancedSteps = enhancedData.steps.map(step => ({
    ...step,
    action: getStepAction(step),
    buttonText: getButtonText(step),
    accessible: step.accessible !== undefined ? step.accessible : true
  }));
  
  return {
    ...enhancedData,
    steps: enhancedSteps
  };
};
