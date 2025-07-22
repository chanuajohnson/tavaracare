
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useStoredJourneyProgress } from '@/hooks/useStoredJourneyProgress';
import { getDocumentNavigationLink, getProfessionalRegistrationLink, getButtonText } from '../../../hooks/professional/stepDefinitions';

interface ProfessionalStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  accessible: boolean;
  link: string;
  buttonText?: string;
  action?: () => void;
  stage: string;
  category: string;
}

interface ProfessionalProgressData {
  steps: ProfessionalStep[];
  completionPercentage: number;
  nextStep?: ProfessionalStep;
  currentStage: string;
  completedSteps: number;
  totalSteps: number;
  loading: boolean;
}

export const useProfessionalProgress = (): ProfessionalProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Use stored progress as primary source
  const storedProgress = useStoredJourneyProgress(user?.id || '', 'professional');
  
  const [steps, setSteps] = useState<ProfessionalStep[]>([
    { 
      id: 1, 
      title: "Create your account", 
      description: "Set up your Tavara professional account", 
      completed: true,
      accessible: true,
      link: "/auth",
      stage: "foundation",
      category: "account"
    },
    { 
      id: 2, 
      title: "Edit your professional registration", 
      description: "Add your experience, certifications, and specialties", 
      completed: false,
      accessible: true,
      link: "/registration/professional",
      stage: "foundation",
      category: "profile"
    },
    { 
      id: 3, 
      title: "Set your availability preferences", 
      description: "Configure your work schedule and location preferences", 
      completed: false,
      accessible: true,
      link: "/registration/professional?scroll=availability&edit=true",
      stage: "foundation",
      category: "availability"
    },
    { 
      id: 4, 
      title: "Upload certifications & documents", 
      description: "Verify your credentials and background", 
      completed: false,
      accessible: true,
      link: "/professional/profile?tab=documents",
      stage: "qualification",
      category: "documents"
    },
    { 
      id: 5, 
      title: "Match with Tavara Families", 
      description: "Get matched with families and begin your caregiving journey", 
      completed: false,
      accessible: false,
      link: "/dashboard/professional#family-matches",
      stage: "active",
      category: "assignments"
    },
    { 
      id: 6, 
      title: "Complete training modules", 
      description: "Enhance your skills with our professional development courses", 
      completed: false,
      accessible: true,
      link: "/professional/training",
      stage: "training",
      category: "training"
    }
  ]);

  const handleStepAction = (step: ProfessionalStep) => {
    if (!step.accessible) {
      return; // Don't allow navigation for locked steps
    }
    
    if (step.id === 4) {
      // Use dynamic navigation for document step
      const hasDocuments = step.completed; // Use completion status as proxy for having documents
      const documentLink = getDocumentNavigationLink(hasDocuments);
      navigate(documentLink);
    } else if (step.id === 5) {
      // For family matches, scroll to the family matches section
      navigate('/dashboard/professional');
      setTimeout(() => {
        const element = document.getElementById('family-matches');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(step.link);
    }
  };

  const checkStepCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('professional_type, years_of_experience, certifications, care_schedule, full_name')
        .eq('id', user.id)
        .maybeSingle();

      const { data: documents } = await supabase
        .from('professional_documents')
        .select('id')
        .eq('user_id', user.id);

      const { data: assignments } = await supabase
        .from('care_team_members')
        .select('id')
        .eq('caregiver_id', user.id);

      const updatedSteps = steps.map(step => {
        let completed = step.completed;
        let stepLink = step.link;
        
        // Check completion status for step details (but use stored overall percentage)
        if (step.id === 1) {
          completed = true; // Account creation
        } else if (step.id === 2) {
          completed = !!(profile && profile.full_name);
          // Use dynamic link based on completion status
          stepLink = getProfessionalRegistrationLink(completed);
        } else if (step.id === 3) {
          completed = !!(profile && profile.care_schedule && profile.care_schedule.length > 0);
        } else if (step.id === 4) {
          completed = !!(documents && documents.length > 0);
          stepLink = getDocumentNavigationLink(completed);
        } else if (step.id === 5) {
          completed = !!(assignments && assignments.length > 0);
        } else if (step.id === 6) {
          completed = !!(profile && profile.professional_type && profile.certifications && profile.certifications.length > 0);
        }
        
        // Check accessibility - Step 5 is only accessible if steps 1-4 are completed
        let accessible = true;
        if (step.id === 5) {
          const step1Complete = true; // Account always complete for logged in users
          const step2Complete = !!(profile && profile.full_name);
          const step3Complete = !!(profile && profile.care_schedule && profile.care_schedule.length > 0);
          const step4Complete = !!(documents && documents.length > 0);
          
          accessible = step1Complete && step2Complete && step3Complete && step4Complete;
        }

        // Create a base step object for the getButtonText function
        const baseStep = {
          id: step.id,
          title: step.title,
          description: step.description,
          link: stepLink,
          category: step.category,
          stage: step.stage,
          isInteractive: true
        };
        
        return {
          ...step,
          link: stepLink,
          completed,
          accessible,
          action: () => handleStepAction({ ...step, link: stepLink, completed, accessible }),
          buttonText: getButtonText(baseStep, completed, accessible, step.id === 4 ? completed : undefined)
        };
      });
      
      setSteps(updatedSteps);
    } catch (error) {
      console.error("Error checking professional progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkStepCompletion();
    }
  }, [user]);

  // Use stored completion percentage if available, otherwise calculate from steps
  const calculatedCompletedSteps = steps.filter(step => step.completed).length;
  const calculatedCompletionPercentage = Math.round((calculatedCompletedSteps / steps.length) * 100);
  
  console.log('🔍 TAV Professional Progress Data:', {
    userId: user?.id,
    storedPercentage: storedProgress.completionPercentage,
    calculatedPercentage: calculatedCompletionPercentage,
    usingStored: storedProgress.completionPercentage > 0
  });

  // Prioritize stored progress over calculated
  const completionPercentage = storedProgress.completionPercentage > 0 
    ? storedProgress.completionPercentage 
    : calculatedCompletionPercentage;
    
  const completedSteps = storedProgress.completionPercentage > 0
    ? Math.round((storedProgress.completionPercentage / 100) * steps.length)
    : calculatedCompletedSteps;
    
  const totalSteps = steps.length;
  const nextStep = steps.find(step => !step.completed && step.accessible);

  // Determine current stage based on stored or calculated progress
  const getCurrentStage = () => {
    if (completionPercentage === 100) return 'training';
    if (completedSteps >= 5) return 'active'; //  Step 5 is now assignments (active stage)
    if (completedSteps >= 4) return 'qualification'; // Step 4 completes qualification
    if (completedSteps >= 3) return 'foundation'; // Steps 1-3 are foundation
    return 'foundation';
  };

  return {
    steps,
    completionPercentage,
    nextStep,
    currentStage: getCurrentStage(),
    completedSteps,
    totalSteps,
    loading: loading || storedProgress.loading
  };
};
