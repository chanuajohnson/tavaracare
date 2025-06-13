
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ProfessionalStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  buttonText?: string;
  action?: () => void;
}

interface ProfessionalProgressData {
  steps: ProfessionalStep[];
  completionPercentage: number;
  nextStep?: ProfessionalStep;
  loading: boolean;
}

export const useProfessionalProgress = (): ProfessionalProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<ProfessionalStep[]>([
    { 
      id: 1, 
      title: "Create your account", 
      description: "Set up your Tavara account", 
      completed: true, // Always completed if user exists
      link: "/auth" 
    },
    { 
      id: 2, 
      title: "Complete your professional profile", 
      description: "Add your experience and certifications", 
      completed: false, 
      link: "/registration/professional" 
    },
    { 
      id: 3, 
      title: "Upload certifications & documents", 
      description: "Verify your credentials", 
      completed: false, 
      link: "/professional/profile" 
    },
    { 
      id: 4, 
      title: "Set your availability preferences", 
      description: "Configure your work schedule", 
      completed: false, 
      link: "/professional/profile" 
    },
    { 
      id: 5, 
      title: "Complete training modules", 
      description: "Enhance your skills", 
      completed: false, 
      link: "/professional/training" 
    },
    { 
      id: 6, 
      title: "Schedule orientation session", 
      description: "Complete your onboarding", 
      completed: false, 
      link: "/professional/profile" 
    }
  ]);

  const handleStepAction = (step: ProfessionalStep) => {
    navigate(step.link);
  };

  const getButtonText = (step: ProfessionalStep) => {
    if (step.completed) {
      if (step.id === 1) return "Account Created";
      if (step.id === 2) return "Edit Profile";
      if (step.id === 3) return "View Documents";
      if (step.id === 4) return "Edit Availability";
      if (step.id === 5) return "Continue Training";
      if (step.id === 6) return "Reschedule";
      return "Edit";
    }
    
    if (step.id === 1) return "Complete";
    if (step.id === 2) return "Complete Profile";
    if (step.id === 3) return "Upload Docs";
    if (step.id === 4) return "Set Availability";
    if (step.id === 5) return "Start Training";
    if (step.id === 6) return "Schedule";
    
    return "Complete";
  };

  const checkStepCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check user profile completion - exact same logic as NextStepsPanel
      const { data: profile } = await supabase
        .from('profiles')
        .select('professional_type, years_of_experience, certifications, availability')
        .eq('id', user.id)
        .maybeSingle();

      // Check for uploaded documents
      const { data: documents } = await supabase
        .from('professional_documents')
        .select('id')
        .eq('user_id', user.id);

      const updatedSteps = steps.map(step => ({
        ...step,
        action: () => handleStepAction(step),
        buttonText: getButtonText(step)
      }));
      
      // Step 1: Account creation - always completed if user exists
      updatedSteps[0].completed = true;
      
      // Step 2: Complete professional profile - check if professional details are filled
      if (profile && profile.professional_type && profile.years_of_experience) {
        updatedSteps[1].completed = true;
      }
      
      // Step 3: Upload documents - check if any documents exist
      if (documents && documents.length > 0) {
        updatedSteps[2].completed = true;
      }
      
      // Step 4: Availability - check if availability is set
      if (profile && profile.availability && profile.availability.length > 0) {
        updatedSteps[3].completed = true;
      }
      
      // Steps 5 and 6 will be completed based on future implementations
      
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

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = Math.round((completedSteps / steps.length) * 100);
  const nextStep = steps.find(step => !step.completed);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading
  };
};
