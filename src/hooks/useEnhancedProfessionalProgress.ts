import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useStoredJourneyProgress } from '@/hooks/useStoredJourneyProgress';
import { getDocumentNavigationLink, getProfessionalRegistrationLink } from './professional/stepDefinitions';

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
  accessible: boolean;
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

  const storedProgress = useStoredJourneyProgress(user?.id || '', 'professional');

  console.log('🔍 Enhanced Professional Progress Data:', {
    userId: user?.id,
    storedPercentage: storedProgress.completionPercentage,
    usingStored: storedProgress.completionPercentage > 0
  });

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
      id: 'vetting',
      name: 'Vetting',
      description: 'Submit references and complete screening interview',
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
    },
    {
      id: 'training',
      name: 'Training',
      description: 'Complete optional training modules to enhance your skills',
      color: 'bg-yellow-500',
      completionPercentage: 0,
      isActive: false,
      isCompleted: false
    }
  ];

  const [currentStages, setCurrentStages] = useState<ProfessionalJourneyStage[]>(stages);

  const handleStepAction = (step: ProfessionalStep) => {
    if (!step.accessible) return;
    
    if (step.modalAction) {
      switch (step.modalAction) {
        case 'document_upload':
          const hasDocuments = documentsData && documentsData.length > 0;
          const documentLink = getDocumentNavigationLink(hasDocuments);
          navigate(documentLink);
          break;
        case 'training_modules':
          navigate('/professional/training');
          break;
        case 'availability_setup':
          navigate('/registration/professional?scroll=availability&edit=true');
          break;
        default:
          navigate(step.link);
      }
    } else {
      if (step.id === 7) {
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
    }
  };

  const handleDemoStepAction = () => {
    navigate('/auth');
  };

  const getButtonText = (step: ProfessionalStep) => {
    if (!step.accessible) return "🔒 Locked";
    
    if (step.completed) {
      switch (step.id) {
        case 1: return "✓ Account Created";
        case 2: return "✓ Edit Profile";
        case 3: return "Edit Availability";
        case 4: return "View Documents";
        case 5: return "✓ References Submitted";
        case 6: return "✓ Screening Passed";
        case 7: return "View Family Matches";
        case 8: return "Continue Training";
        default: return "✓ Complete";
      }
    }
    
    switch (step.id) {
      case 1: return "Complete Setup";
      case 2: return "Complete Profile";
      case 3: return "Set Availability";
      case 4: return "Upload Documents";
      case 5: return "Add References";
      case 6: return "Awaiting Interview";
      case 7: return "View Family Matches";
      case 8: return "Start Training";
      default: return "Complete";
    }
  };

  const baseSteps: Omit<ProfessionalStep, 'completed' | 'action' | 'buttonText' | 'accessible'>[] = [
    { 
      id: 1, title: "Create your account", 
      description: "Set up your Tavara professional account", 
      link: "/auth", category: "account", stage: "foundation", isInteractive: false
    },
    { 
      id: 2, title: "Edit your professional registration", 
      description: "Add your experience, certifications, and specialties", 
      link: "/registration/professional", category: "profile", stage: "foundation", isInteractive: true
    },
    { 
      id: 3, title: "Set your availability preferences", 
      description: "Configure your work schedule and location preferences", 
      link: "/registration/professional?scroll=availability&edit=true", category: "availability", stage: "foundation", isInteractive: true, modalAction: "availability_setup"
    },
    { 
      id: 4, title: "Upload certifications & documents", 
      description: "Verify your credentials and background", 
      link: "/professional/profile?tab=documents", category: "documents", stage: "qualification", isInteractive: true, modalAction: "document_upload"
    },
    { 
      id: 5, title: "Submit 2 professional references", 
      description: "Provide references from previous employers or colleagues", 
      link: "/professional/profile?tab=references", category: "references", stage: "vetting", isInteractive: true
    },
    { 
      id: 6, title: "Head nurse screening interview", 
      description: "Complete a brief interview with our Head Nurse for final clearance", 
      link: "/professional/profile?tab=references", category: "screening", stage: "vetting", isInteractive: false
    },
    { 
      id: 7, title: "Match with Tavara Families", 
      description: "Get matched with families and begin your caregiving journey", 
      link: "/dashboard/professional#family-matches", category: "assignments", stage: "active", isInteractive: false
    },
    { 
      id: 8, title: "Complete training modules", 
      description: "Enhance your skills with our professional development courses", 
      link: "/professional/training", category: "training", stage: "training", isInteractive: true, modalAction: "training_modules"
    }
  ];

  const generateDemoData = () => {
    const demoSteps: ProfessionalStep[] = baseSteps.map(baseStep => {
      let completed = false;
      let accessible = true;

      switch (baseStep.id) {
        case 1: case 2: completed = true; break;
        case 3: case 4: case 5: case 6: completed = false; break;
        case 7: completed = false; accessible = false; break;
        case 8: default: completed = false; break;
      }

      return {
        ...baseStep,
        completed,
        accessible,
        action: handleDemoStepAction,
        buttonText: getButtonText({ ...baseStep, completed, accessible, action: () => {}, buttonText: '' })
      };
    });

    const demoStages = currentStages.map(stage => {
      const stageSteps = demoSteps.filter(step => step.stage === stage.id);
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

    return { steps: demoSteps, stages: demoStages };
  };

  const checkStepCompletion = async () => {
    if (!user) return { steps: [], stages: currentStages };
    
    try {
      setLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: documents } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('user_id', user.id);

      const { data: assignments } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('caregiver_id', user.id);

      const { data: references } = await supabase
        .from('professional_references')
        .select('*')
        .eq('professional_id', user.id);

      const { data: screenings } = await supabase
        .from('professional_screening')
        .select('*')
        .eq('professional_id', user.id);

      setProfileData(profile);
      setDocumentsData(documents || []);

      const refsCount = references?.length || 0;
      const screeningPassed = screenings?.some(
        (s: any) => s.screening_type === 'head_nurse_interview' && s.status === 'passed'
      ) || false;

      const steps: ProfessionalStep[] = baseSteps.map(baseStep => {
        let completed = false;
        let stepLink = baseStep.link;

        if (baseStep.id === 1) {
          completed = !!user;
        } else if (baseStep.id === 2) {
          completed = !!(profile?.full_name);
          stepLink = getProfessionalRegistrationLink(completed);
        } else if (baseStep.id === 3) {
          completed = !!(profile?.care_schedule && profile.care_schedule.length > 0);
        } else if (baseStep.id === 4) {
          completed = (documents?.length || 0) > 0;
          stepLink = getDocumentNavigationLink(completed);
        } else if (baseStep.id === 5) {
          completed = refsCount >= 2;
        } else if (baseStep.id === 6) {
          completed = screeningPassed;
        } else if (baseStep.id === 7) {
          completed = (assignments?.length || 0) > 0;
        } else if (baseStep.id === 8) {
          completed = !!(profile?.professional_type && profile?.certifications && profile.certifications.length > 0);
        }

        let accessible = true;
        if (baseStep.id === 7) {
          const step1Complete = !!user;
          const step2Complete = !!(profile?.full_name);
          const step3Complete = !!(profile?.care_schedule && profile.care_schedule.length > 0);
          const step4Complete = (documents?.length || 0) > 0;
          const step5Complete = refsCount >= 2;
          const step6Complete = screeningPassed;
          
          accessible = step1Complete && step2Complete && step3Complete && step4Complete && step5Complete && step6Complete;
        }

        return {
          ...baseStep,
          link: stepLink,
          completed,
          accessible,
          action: () => handleStepAction({ ...baseStep, link: stepLink, completed, accessible, action: () => {}, buttonText: '' }),
          buttonText: getButtonText({ ...baseStep, completed, accessible, action: () => {}, buttonText: '' })
        };
      });

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
    if (!user) {
      const { steps: demoSteps, stages: demoStages } = generateDemoData();
      setSteps(demoSteps);
      setCurrentStages(demoStages);
      setLoading(false);
      return;
    }

    const { steps: newSteps, stages: newStages } = await checkStepCompletion();
    setSteps(newSteps);
    setCurrentStages(newStages);
  };

  useEffect(() => {
    if (!user) {
      const { steps: demoSteps, stages: demoStages } = generateDemoData();
      setSteps(demoSteps);
      setCurrentStages(demoStages);
      setLoading(false);
    } else {
      refreshProgress();
    }
  }, [user]);

  const calculatedCompletedSteps = steps.filter(step => step.completed).length;
  const calculatedOverallProgress = Math.round((calculatedCompletedSteps / (steps.length || 1)) * 100);
  
  const overallProgress = storedProgress.completionPercentage > 0 
    ? storedProgress.completionPercentage 
    : calculatedOverallProgress;
    
  const completedSteps = storedProgress.completionPercentage > 0
    ? Math.round((storedProgress.completionPercentage / 100) * steps.length)
    : calculatedCompletedSteps;
    
  const totalSteps = steps.length;
  const nextStep = steps.find(step => !step.completed && step.accessible);
  
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
    loading: loading || storedProgress.loading,
    refreshProgress
  };
};
