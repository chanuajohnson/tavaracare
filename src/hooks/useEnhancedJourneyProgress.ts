
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useUserJourneyProgress } from './useUserJourneyProgress';

export interface JourneyStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  accessible: boolean;
  step_number: number;
  action?: () => void;
}

export interface JourneyProgress {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep: JourneyStep | null;
  currentStage: string;
  isAnonymous: boolean;
}

export const useEnhancedJourneyProgress = (): JourneyProgress => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [visitDetails, setVisitDetails] = useState<any>(null);
  const [carePlans, setCarePlans] = useState<any[]>([]);
  
  // Use the existing journey progress hook for step data
  const { steps: rawSteps, isLoading } = useUserJourneyProgress(user?.id);

  // Enhanced step actions with simple navigation (following professional pattern)
  const getStepAction = (step: any): (() => void) => {
    switch (step.step_number) {
      case 1: // Family Profile
        return () => navigate('/dashboard/family');
      case 2: // Family Registration  
        return () => navigate('/registration/family');
      case 5: // Care Assessment
        return () => navigate('/family/care-assessment');
      case 6: // Legacy Story
        return () => navigate('/family/story');
      case 7: // Caregiver Matches - Navigate to matches page instead of modal
        return () => navigate('/family/caregiver-matches');
      case 8: // Medications
        return () => {
          if (carePlans.length > 0) {
            navigate(`/family/care-management/${carePlans[0].id}/medications`);
          } else {
            navigate('/family/care-management/create');
          }
        };
      case 9: // Meals
        return () => {
          if (carePlans.length > 0) {
            navigate(`/family/care-management/${carePlans[0].id}/meals`);
          } else {
            navigate('/family/care-management/create');
          }
        };
      case 10: // Schedule Visit - Navigate to scheduling page instead of modal
        return () => navigate('/family/schedule-visit');
      case 14: // Choose Path
        return () => navigate('/family/care-model-selection');
      default:
        return () => navigate('/dashboard/family');
    }
  };

  // Enhanced steps with proper actions
  const enhancedSteps: JourneyStep[] = rawSteps.map(step => ({
    id: step.id || `step-${step.step_number}`,
    title: step.title || step.step_title || `Step ${step.step_number}`,
    description: step.description,
    completed: step.completed || false,
    accessible: step.accessible !== undefined ? step.accessible : true,
    step_number: step.step_number,
    action: getStepAction(step)
  }));

  // Calculate completion percentage
  const completedSteps = enhancedSteps.filter(step => step.completed).length;
  const totalSteps = enhancedSteps.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Find next step
  const nextStep = enhancedSteps.find(step => !step.completed && step.accessible) || null;

  // Determine current stage based on progress
  const getCurrentStage = (): string => {
    if (completionPercentage === 0) return 'foundation';
    if (completionPercentage < 30) return 'foundation';
    if (completionPercentage < 60) return 'assessment';
    if (completionPercentage < 90) return 'matching';
    return 'active';
  };

  // Load care plans for medication/meal navigation
  useEffect(() => {
    if (!user?.id) return;
    
    const loadCarePlans = async () => {
      try {
        const { data } = await supabase
          .from('care_plans')
          .select('id, name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setCarePlans(data);
        }
      } catch (error) {
        console.error('Error loading care plans:', error);
      }
    };

    loadCarePlans();
  }, [user?.id]);

  return {
    steps: enhancedSteps,
    completionPercentage,
    nextStep,
    currentStage: getCurrentStage(),
    isAnonymous: !user
  };
};
