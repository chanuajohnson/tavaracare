
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfessionalStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  buttonText: string;
  category: string;
  stage: string;
  isInteractive: boolean;
}

interface SpecificUserProfessionalProgressData {
  steps: ProfessionalStep[];
  completionPercentage: number;
  nextStep?: ProfessionalStep;
  loading: boolean;
}

export const useSpecificUserProfessionalProgress = (userId: string): SpecificUserProfessionalProgressData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<ProfessionalStep[]>([]);

  // Base steps definition - exactly the same as useEnhancedProfessionalProgress
  const baseSteps = [
    { 
      id: 1, 
      title: "Create your account", 
      description: "Set up your Tavara professional account", 
      link: "/auth",
      category: "account",
      stage: "foundation",
      isInteractive: false
    },
    { 
      id: 2, 
      title: "Complete your professional profile", 
      description: "Add your experience, certifications, and specialties", 
      link: "/registration/professional",
      category: "profile",
      stage: "foundation",
      isInteractive: true
    },
    { 
      id: 3, 
      title: "Upload certifications & documents", 
      description: "Verify your credentials and background", 
      link: "/professional/profile?tab=documents",
      category: "documents",
      stage: "qualification",
      isInteractive: true
    },
    { 
      id: 4, 
      title: "Set your availability preferences", 
      description: "Configure your work schedule and location preferences", 
      link: "/professional/profile?tab=availability",
      category: "availability",
      stage: "matching",
      isInteractive: true
    },
    { 
      id: 5, 
      title: "Complete training modules", 
      description: "Enhance your skills with our professional development courses", 
      link: "/professional/training",
      category: "training",
      stage: "qualification",
      isInteractive: true
    },
    { 
      id: 6, 
      title: "Start receiving assignments", 
      description: "Get matched with families and begin your caregiving journey", 
      link: "/professional/profile?tab=assignments",
      category: "assignments",
      stage: "active",
      isInteractive: false
    }
  ];

  const getButtonText = (step: typeof baseSteps[0], completed: boolean) => {
    if (completed) {
      switch (step.id) {
        case 1: return "✓ Account Created";
        case 2: return "✓ Profile Complete";
        case 3: return "View Documents";
        case 4: return "Edit Availability";
        case 5: return "Continue Training";
        case 6: return "View Assignments";
        default: return "✓ Complete";
      }
    }
    
    switch (step.id) {
      case 1: return "Complete Setup";
      case 2: return "Complete Profile";
      case 3: return "Upload Documents";
      case 4: return "Set Availability";
      case 5: return "Start Training";
      case 6: return "Get Assignments";
      default: return "Complete";
    }
  };

  const checkStepCompletion = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch profile data - exact same queries as useEnhancedProfessionalProgress
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Fetch documents
      const { data: documents } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('user_id', userId);

      // Fetch care team assignments
      const { data: assignments } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('caregiver_id', userId);

      const processedSteps: ProfessionalStep[] = baseSteps.map(baseStep => {
        let completed = false;

        // Exact same completion logic as useEnhancedProfessionalProgress
        switch (baseStep.id) {
          case 1: // Account creation
            completed = !!userId; // Always true if userId exists
            break;
          case 2: // Professional profile
            completed = !!(profile?.professional_type && profile?.years_of_experience);
            break;
          case 3: // Documents upload
            completed = (documents?.length || 0) > 0;
            break;
          case 4: // Availability
            completed = !!(profile?.availability && profile.availability.length > 0);
            break;
          case 5: // Training modules - check if professional_type is set and certifications exist
            completed = !!(profile?.professional_type && profile?.certifications && profile.certifications.length > 0);
            break;
          case 6: // Assignments
            completed = (assignments?.length || 0) > 0;
            break;
        }

        return {
          ...baseStep,
          completed,
          buttonText: getButtonText(baseStep, completed)
        };
      });

      setSteps(processedSteps);
    } catch (error) {
      console.error("Error checking specific user professional progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      checkStepCompletion();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  const nextStep = steps.find(step => !step.completed);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading
  };
};
