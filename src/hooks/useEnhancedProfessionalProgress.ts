
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export interface ProfessionalJourneyStage {
  id: string;
  name: string;
  description: string;
  color: string;
  completionPercentage: number;
  isActive: boolean;
  isCompleted: boolean;
}

export interface ProfessionalStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  buttonText: string;
  action: () => void;
  category: string;
  stage: string;
  isInteractive: boolean;
  modalAction?: string;
}

interface ProfessionalProgressData {
  steps: ProfessionalStep[];
  stages: ProfessionalJourneyStage[];
  currentStage: string;
  overallProgress: number;
  nextStep?: ProfessionalStep;
  completedSteps: number;
  totalSteps: number;
  loading: boolean;
  refreshProgress: () => Promise<void>;
}

export const useEnhancedProfessionalProgress = (): ProfessionalProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any[]>([]);

  // Define journey stages
  const stages: ProfessionalJourneyStage[] = [
    {
      id: 'foundation',
      name: 'Foundation',
      description: 'Complete your basic profile and account setup',
      color: 'bg-blue-500',
      completionPercentage: 0,
      isActive: false,
      isCompleted: false
    },
    {
      id: 'qualification',
      name: 'Qualification',
      description: 'Upload credentials and complete background verification',
      color: 'bg-indigo-500',
      completionPercentage: 0,
      isActive: false,
      isCompleted: false
    },
    {
      id: 'matching',
      name: 'Matching',
      description: 'Set availability and enable family matching',
      color: 'bg-purple-500',
      completionPercentage: 0,
      isActive: false,
      isCompleted: false
    },
    {
      id: 'active',
      name: 'Active Professional',
      description: 'Receive assignments and grow your career',
      color: 'bg-green-500',
      completionPercentage: 0,
      isActive: false,
      isCompleted: false
    }
  ];

  const [currentStages, setCurrentStages] = useState<ProfessionalJourneyStage[]>(stages);

  const handleStepAction = (step: ProfessionalStep) => {
    if (step.modalAction) {
      // Handle modal actions for interactive steps
      switch (step.modalAction) {
        case 'document_upload':
          // Navigate to profile with document upload focus
          navigate('/professional/profile?tab=documents&action=upload');
          break;
        case 'training_modules':
          navigate('/professional/training');
          break;
        case 'availability_setup':
          navigate('/professional/profile?tab=availability&action=setup');
          break;
        default:
          navigate(step.link);
      }
    } else {
      navigate(step.link);
    }
  };

  const getButtonText = (step: ProfessionalStep) => {
    if (step.completed) {
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

  // Base steps definition
  const baseSteps: Omit<ProfessionalStep, 'completed' | 'action' | 'buttonText'>[] = [
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
      isInteractive: true,
      modalAction: "document_upload"
    },
    { 
      id: 4, 
      title: "Set your availability preferences", 
      description: "Configure your work schedule and location preferences", 
      link: "/professional/profile?tab=availability",
      category: "availability",
      stage: "matching",
      isInteractive: true,
      modalAction: "availability_setup"
    },
    { 
      id: 5, 
      title: "Complete training modules", 
      description: "Enhance your skills with our professional development courses", 
      link: "/professional/training",
      category: "training",
      stage: "qualification",
      isInteractive: true,
      modalAction: "training_modules"
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

  const checkStepCompletion = async () => {
    if (!user) return { steps: [], stages: currentStages };
    
    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Fetch documents
      const { data: documents } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('user_id', user.id);

      // Fetch care team assignments
      const { data: assignments } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('caregiver_id', user.id);

      setProfileData(profile);
      setDocumentsData(documents || []);

      const steps: ProfessionalStep[] = baseSteps.map(baseStep => {
        let completed = false;

        // Check completion status for each step
        switch (baseStep.id) {
          case 1: // Account creation
            completed = !!user;
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
          action: () => handleStepAction({ ...baseStep, completed, action: () => {}, buttonText: '' }),
          buttonText: getButtonText({ ...baseStep, completed, action: () => {}, buttonText: '' })
        };
      });

      // Calculate stage completion
      const updatedStages = currentStages.map(stage => {
        const stageSteps = steps.filter(step => step.stage === stage.id);
        const completedStageSteps = stageSteps.filter(step => step.completed);
        const completionPercentage = stageSteps.length > 0 ? 
          Math.round((completedStageSteps.length / stageSteps.length) * 100) : 0;
        
        return {
          ...stage,
          completionPercentage,
          isCompleted: completionPercentage === 100,
          isActive: completionPercentage > 0 && completionPercentage < 100
        };
      });

      return { steps, stages: updatedStages };
    } catch (error) {
      console.error("Error checking professional progress:", error);
      return { steps: [], stages: currentStages };
    } finally {
      setLoading(false);
    }
  };

  const [steps, setSteps] = useState<ProfessionalStep[]>([]);

  const refreshProgress = async () => {
    const { steps: newSteps, stages: newStages } = await checkStepCompletion();
    setSteps(newSteps);
    setCurrentStages(newStages);
  };

  useEffect(() => {
    if (user) {
      refreshProgress();
    }
  }, [user]);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const overallProgress = Math.round((completedSteps / totalSteps) * 100);
  const nextStep = steps.find(step => !step.completed);
  
  // Determine current stage
  const currentStage = currentStages.find(stage => stage.isActive)?.id || 
                     (overallProgress === 100 ? 'active' : 'foundation');

  return {
    steps,
    stages: currentStages,
    currentStage,
    overallProgress,
    nextStep,
    completedSteps,
    totalSteps,
    loading,
    refreshProgress
  };
};
