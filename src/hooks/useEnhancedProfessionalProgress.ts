
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

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
  isInteractive: boolean;
}

interface ProfessionalStage {
  id: string;
  name: string;
  description: string;
  color: string;
  completed: boolean;
  accessible: boolean;
  steps: ProfessionalStep[];
}

// Export the type for use in other components
export interface ProfessionalJourneyStage {
  id: string;
  name: string;
  description: string;
  completionPercentage: number;
  isCompleted: boolean;
  isActive: boolean;
}

interface ProfessionalProgressData {
  steps: ProfessionalStep[];
  stages: ProfessionalStage[];
  currentStage: string;
  overallProgress: number;
  nextStep?: ProfessionalStep;
  completedSteps: number;
  totalSteps: number;
  loading: boolean;
  refreshProgress: () => void;
}

export const useEnhancedProfessionalProgress = (): ProfessionalProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<ProfessionalStep[]>([]);
  const [stages, setStages] = useState<ProfessionalStage[]>([]);

  const getButtonText = (step: ProfessionalStep) => {
    if (!step.accessible) {
      return "🔒 Locked";
    }
    
    if (step.completed) {
      if (step.id === 1) return "✓ Account Created";
      if (step.id === 2) return "Edit Profile"; // Changed from "View Profile"
      if (step.id === 3) return "Edit Availability";
      if (step.id === 4) return "View Documents";
      if (step.id === 5) return "View Family Matches";
      if (step.id === 6) return "Continue Training";
      return "✓ Complete";
    }
    
    if (step.id === 1) return "Complete Setup";
    if (step.id === 2) return "Complete Profile";
    if (step.id === 3) return "Set Availability";
    if (step.id === 4) return "Upload Documents";
    if (step.id === 5) return "View Family Matches";
    if (step.id === 6) return "Start Training";
    
    return "Complete";
  };

  const handleStepAction = (step: ProfessionalStep) => {
    if (!step.accessible) {
      return; // Don't allow navigation for locked steps
    }
    
    if (step.id === 2) {
      // For profile step, add edit=true parameter if profile is already completed
      const profileLink = step.completed 
        ? "/registration/professional?edit=true"
        : "/registration/professional";
      navigate(profileLink);
    } else if (step.id === 3) {
      // For availability step, always include edit=true for prefilling
      navigate("/registration/professional?scroll=availability&edit=true");
    } else if (step.id === 4) {
      // Use dynamic navigation for document step
      const hasDocuments = step.completed;
      const documentLink = hasDocuments 
        ? "/professional/profile?tab=documents#manage-documents"
        : "/professional/profile?tab=documents#upload-documents";
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
        .select('professional_type, years_of_experience, certifications, care_schedule')
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
          title: "Set your availability preferences", 
          description: "Configure your work schedule and location preferences", 
          link: "/registration/professional?scroll=availability&edit=true",
          category: "availability",
          stage: "foundation",
          isInteractive: true
        },
        { 
          id: 4, 
          title: "Upload certifications & documents", 
          description: "Verify your credentials and background", 
          link: "/professional/profile?tab=documents",
          category: "documents",
          stage: "qualification",
          isInteractive: true
        },
        { 
          id: 5, 
          title: "Match with Tavara Families", 
          description: "Get matched with families and begin your caregiving journey", 
          link: "/dashboard/professional#family-matches",
          category: "assignments",
          stage: "active",
          isInteractive: false
        },
        { 
          id: 6, 
          title: "Complete training modules", 
          description: "Enhance your skills with our professional development courses", 
          link: "/professional/training",
          category: "training",
          stage: "training",
          isInteractive: true
        }
      ];

      const updatedSteps = baseSteps.map(step => {
        let completed = false;
        let accessible = true;
        let stepLink = step.link;
        
        // Check completion status
        if (step.id === 1) {
          completed = true; // Account creation
        } else if (step.id === 2) {
          completed = !!(profile && profile.professional_type && profile.years_of_experience);
          // Update link for profile step - add edit=true if completed
          stepLink = completed ? "/registration/professional?edit=true" : "/registration/professional";
        } else if (step.id === 3) {
          completed = !!(profile && profile.care_schedule && profile.care_schedule.length > 0);
        } else if (step.id === 4) {
          completed = !!(documents && documents.length > 0);
          // Update document step link dynamically
          stepLink = completed 
            ? "/professional/profile?tab=documents#manage-documents"
            : "/professional/profile?tab=documents#upload-documents";
        } else if (step.id === 5) {
          completed = !!(assignments && assignments.length > 0);
        } else if (step.id === 6) {
          completed = !!(profile && profile.professional_type && profile.certifications && profile.certifications.length > 0);
        }
        
        // Check accessibility - Step 5 is only accessible if steps 1-4 are completed
        if (step.id === 5) {
          const step1Complete = true; // Account always complete for logged in users
          const step2Complete = !!(profile && profile.professional_type && profile.years_of_experience);
          const step3Complete = !!(profile && profile.care_schedule && profile.care_schedule.length > 0);
          const step4Complete = !!(documents && documents.length > 0);
          
          accessible = step1Complete && step2Complete && step3Complete && step4Complete;
        }
        
        return {
          ...step,
          link: stepLink,
          completed,
          accessible,
          action: () => handleStepAction({ ...step, link: stepLink, completed, accessible }),
          buttonText: getButtonText({ ...step, completed, accessible })
        } as ProfessionalStep;
      });
      
      setSteps(updatedSteps);

      // Create stages based on steps
      const foundationSteps = updatedSteps.filter(s => s.stage === 'foundation');
      const qualificationSteps = updatedSteps.filter(s => s.stage === 'qualification');
      const activeSteps = updatedSteps.filter(s => s.stage === 'active');
      const trainingSteps = updatedSteps.filter(s => s.stage === 'training');

      const stageData = [
        {
          id: 'foundation',
          name: 'Foundation',
          description: 'Build your professional foundation',
          color: '#3B82F6',
          steps: foundationSteps,
          completed: foundationSteps.every(s => s.completed),
          accessible: true
        },
        {
          id: 'qualification',
          name: 'Qualification',
          description: 'Verify your credentials',
          color: '#10B981',
          steps: qualificationSteps,
          completed: qualificationSteps.every(s => s.completed),
          accessible: foundationSteps.every(s => s.completed)
        },
        {
          id: 'active',
          name: 'Active',
          description: 'Start your caregiving journey',
          color: '#F59E0B',
          steps: activeSteps,
          completed: activeSteps.every(s => s.completed),
          accessible: [...foundationSteps, ...qualificationSteps].every(s => s.completed)
        },
        {
          id: 'training',
          name: 'Training',
          description: 'Enhance your skills',
          color: '#8B5CF6',
          steps: trainingSteps,
          completed: trainingSteps.every(s => s.completed),
          accessible: true
        }
      ];

      setStages(stageData);
    } catch (error) {
      console.error("Error checking professional progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProgress = () => {
    checkStepCompletion();
  };

  useEffect(() => {
    if (user) {
      checkStepCompletion();
    }
  }, [user]);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const overallProgress = Math.round((completedSteps / totalSteps) * 100);
  const nextStep = steps.find(step => !step.completed && step.accessible);

  // Determine current stage based on completed steps
  const getCurrentStage = () => {
    if (overallProgress === 100) return 'training';
    if (completedSteps >= 5) return 'active';
    if (completedSteps >= 4) return 'qualification';
    return 'foundation';
  };

  return {
    steps,
    stages,
    currentStage: getCurrentStage(),
    overallProgress,
    nextStep,
    completedSteps,
    totalSteps,
    loading,
    refreshProgress
  };
};
