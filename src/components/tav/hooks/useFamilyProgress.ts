
import { useEnhancedJourneyProgress } from '@/hooks/useEnhancedJourneyProgress';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Form field completion tracking interface
interface FormFieldStatus {
  formId: string;
  totalFields: number;
  completedFields: number;
  missingFields: string[];
  completionPercentage: number;
}

// Export the enhanced family journey data as the family progress for TAV
export const useFamilyProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?.id || '';
  const [formStatus, setFormStatus] = useState<FormFieldStatus | null>(null);
  
  // Use the enhanced journey progress hook for real data
  const enhancedData = useEnhancedJourneyProgress();

  // Track form field completion for context awareness
  useEffect(() => {
    if (!userId) return;
    
    const checkFormCompletion = async () => {
      const path = location.pathname;
      
      // Check profile completion on family registration/profile pages
      if (path.includes('/registration/family') || path.includes('/dashboard/family')) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone_number, email')
            .eq('id', userId)
            .maybeSingle();

          if (profile) {
            const fields = ['full_name', 'phone_number', 'email'];
            const completedFields = fields.filter(field => profile[field]).length;
            const missingFields = fields.filter(field => !profile[field]);
            
            setFormStatus({
              formId: 'family-profile',
              totalFields: fields.length,
              completedFields,
              missingFields,
              completionPercentage: Math.round((completedFields / fields.length) * 100)
            });
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
        }
      }
      
      // Check care assessment completion
      else if (path.includes('/family/care-assessment')) {
        try {
          const { data: assessment } = await supabase
            .from('care_needs_family')
            .select('*')
            .eq('profile_id', userId)
            .maybeSingle();

          const requiredFields = ['care_recipient_name', 'relationship_to_care_recipient', 'primary_care_needs'];
          if (assessment) {
            const completedFields = requiredFields.filter(field => assessment[field]).length;
            const missingFields = requiredFields.filter(field => !assessment[field]);
            
            setFormStatus({
              formId: 'care-assessment',
              totalFields: requiredFields.length,
              completedFields,
              missingFields,
              completionPercentage: Math.round((completedFields / requiredFields.length) * 100)
            });
          } else {
            setFormStatus({
              formId: 'care-assessment',
              totalFields: requiredFields.length,
              completedFields: 0,
              missingFields: requiredFields,
              completionPercentage: 0
            });
          }
        } catch (error) {
          console.error('Error checking assessment completion:', error);
        }
      }
      
      // Check story completion
      else if (path.includes('/family/story')) {
        try {
          const { data: recipient } = await supabase
            .from('care_recipient_profiles')
            .select('full_name, story')
            .eq('user_id', userId)
            .maybeSingle();

          const requiredFields = ['full_name'];
          const optionalFields = ['story'];
          
          if (recipient) {
            const completedRequired = requiredFields.filter(field => recipient[field]).length;
            const completedOptional = optionalFields.filter(field => recipient[field]).length;
            const totalCompleted = completedRequired + completedOptional;
            const totalFields = requiredFields.length + optionalFields.length;
            
            setFormStatus({
              formId: 'legacy-story',
              totalFields,
              completedFields: totalCompleted,
              missingFields: [
                ...requiredFields.filter(field => !recipient[field]),
                ...optionalFields.filter(field => !recipient[field])
              ],
              completionPercentage: Math.round((totalCompleted / totalFields) * 100)
            });
          } else {
            setFormStatus({
              formId: 'legacy-story',
              totalFields: 2,
              completedFields: 0,
              missingFields: ['full_name', 'story'],
              completionPercentage: 0
            });
          }
        } catch (error) {
          console.error('Error checking story completion:', error);
        }
      }
      
      else {
        setFormStatus(null);
      }
    };

    checkFormCompletion();
  }, [userId, location.pathname]);

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
    // Use the action from enhanced data if available
    const enhancedStep = enhancedData.steps.find(s => s.id === step.id);
    if (enhancedStep?.action) {
      return enhancedStep.action;
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
    steps: enhancedSteps,
    formStatus // Add form completion status for contextual awareness
  };
};
