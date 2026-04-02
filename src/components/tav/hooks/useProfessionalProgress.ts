
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
  
  const storedProgress = useStoredJourneyProgress(user?.id || '', 'professional');

  const [steps, setSteps] = useState<ProfessionalStep[]>([
    { id: 1, title: "Create your account", description: "Set up your Tavara professional account", completed: true, accessible: true, link: "/auth", stage: "foundation", category: "account" },
    { id: 2, title: "Edit your professional registration", description: "Add your experience, certifications, and specialties", completed: false, accessible: true, link: "/registration/professional", stage: "foundation", category: "profile" },
    { id: 3, title: "Set your availability preferences", description: "Configure your work schedule and location preferences", completed: false, accessible: true, link: "/registration/professional?scroll=availability&edit=true", stage: "foundation", category: "availability" },
    { id: 4, title: "Upload certifications & documents", description: "Verify your credentials and background", completed: false, accessible: true, link: "/professional/profile?tab=documents", stage: "qualification", category: "documents" },
    { id: 5, title: "Submit 2 professional references", description: "Provide references from previous employers or colleagues", completed: false, accessible: true, link: "/professional/profile?tab=references", stage: "vetting", category: "references" },
    { id: 6, title: "Head nurse screening interview", description: "Complete a brief interview with our Head Nurse for final clearance", completed: false, accessible: true, link: "/professional/profile?tab=references", stage: "vetting", category: "screening" },
    { id: 7, title: "Match with Tavara Families", description: "Get matched with families and begin your caregiving journey", completed: false, accessible: false, link: "/dashboard/professional#family-matches", stage: "active", category: "assignments" },
    { id: 8, title: "Complete training modules", description: "Enhance your skills with our professional development courses", completed: false, accessible: true, link: "/professional/training", stage: "training", category: "training" }
  ]);

  const handleStepAction = (step: ProfessionalStep) => {
    if (!step.accessible) return;
    
    if (step.id === 4) {
      const hasDocuments = step.completed;
      const documentLink = getDocumentNavigationLink(hasDocuments);
      navigate(documentLink);
    } else if (step.id === 7) {
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

      const { data: references } = await supabase
        .from('professional_references')
        .select('id')
        .eq('professional_id', user.id);

      const { data: screenings } = await supabase
        .from('professional_screening')
        .select('id, screening_type, status')
        .eq('professional_id', user.id);

      // Also fetch screening_sessions
      const { data: screeningSessions } = await supabase
        .from('screening_sessions')
        .select('id, status, template_id')
        .eq('professional_id', user.id);

      const refsCount = references?.length || 0;
      const screeningPassed = screenings?.some(
        (s: any) => s.screening_type === 'head_nurse_interview' && s.status === 'passed'
      ) || false;

      // Determine screening session status
      const totalSessions = screeningSessions?.length || 0;
      const completedSessions = screeningSessions?.filter(
        (s: any) => s.status === 'completed' || s.status === 'reviewed'
      ).length || 0;
      const hasPendingSessions = screeningSessions?.some(
        (s: any) => s.status === 'pending' || s.status === 'in_progress'
      ) || false;
      const allSessionsComplete = totalSessions > 0 && completedSessions === totalSessions;
      const screeningComplete = screeningPassed || allSessionsComplete;

      const updatedSteps = steps.map(step => {
        let completed = step.completed;
        let stepLink = step.link;
        
        if (step.id === 1) {
          completed = true;
        } else if (step.id === 2) {
          completed = !!(profile && profile.full_name);
          stepLink = getProfessionalRegistrationLink(completed);
        } else if (step.id === 3) {
          completed = !!(profile && profile.care_schedule && profile.care_schedule.length > 0);
        } else if (step.id === 4) {
          completed = !!(documents && documents.length > 0);
          stepLink = getDocumentNavigationLink(completed);
        } else if (step.id === 5) {
          completed = refsCount >= 2;
        } else if (step.id === 6) {
          completed = screeningComplete;
        } else if (step.id === 7) {
          completed = !!(assignments && assignments.length > 0);
        } else if (step.id === 8) {
          completed = !!(profile && profile.professional_type && profile.certifications && profile.certifications.length > 0);
        }
        
        let accessible = true;
        if (step.id === 7) {
          const step1Complete = true;
          const step2Complete = !!(profile && profile.full_name);
          const step3Complete = !!(profile && profile.care_schedule && profile.care_schedule.length > 0);
          const step4Complete = !!(documents && documents.length > 0);
          const step5Complete = refsCount >= 2;
          const step6Complete = screeningComplete;
          
          accessible = step1Complete && step2Complete && step3Complete && step4Complete && step5Complete && step6Complete;
        }

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

  const calculatedCompletedSteps = steps.filter(step => step.completed).length;
  const calculatedCompletionPercentage = Math.round((calculatedCompletedSteps / steps.length) * 100);
  
  const completionPercentage = storedProgress.completionPercentage > 0 
    ? storedProgress.completionPercentage 
    : calculatedCompletionPercentage;
    
  const completedSteps = storedProgress.completionPercentage > 0
    ? Math.round((storedProgress.completionPercentage / 100) * steps.length)
    : calculatedCompletedSteps;
    
  const totalSteps = steps.length;
  const nextStep = steps.find(step => !step.completed && step.accessible);

  const getCurrentStage = () => {
    if (completionPercentage === 100) return 'training';
    if (completedSteps >= 7) return 'active';
    if (completedSteps >= 5) return 'vetting';
    if (completedSteps >= 4) return 'qualification';
    if (completedSteps >= 3) return 'foundation';
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
