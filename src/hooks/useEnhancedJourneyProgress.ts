
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  is_optional: boolean;
  tooltip_content: string;
  detailed_explanation: string;
  time_estimate_minutes: number;
  link_path: string;
  icon_name: string;
  completed: boolean;
  accessible: boolean;
  prerequisites: string[];
}

interface JourneyPath {
  id: string;
  path_name: string;
  path_description: string;
  step_ids: number[];
  path_color: string;
  is_recommended: boolean;
}

interface JourneyProgressData {
  steps: JourneyStep[];
  paths: JourneyPath[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  currentStage: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  loading: boolean;
  carePlans: any[];
  showScheduleModal: boolean;
  setShowScheduleModal: (show: boolean) => void;
  careModel: string | null;
  trialCompleted: boolean;
  trackStepAction: (stepId: string, action: string) => Promise<void>;
}

export const useEnhancedJourneyProgress = (): JourneyProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [paths, setPaths] = useState<JourneyPath[]>([]);
  const [carePlans, setCarePlans] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentStage, setCurrentStage] = useState<'foundation' | 'scheduling' | 'trial' | 'conversion'>('foundation');
  const [careModel, setCareModel] = useState<string | null>(null);
  const [trialCompleted, setTrialCompleted] = useState(false);
  const [visitStatus, setVisitStatus] = useState<string>('not_started');

  const trackStepAction = async (stepId: string, action: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('journey_analytics')
        .insert({
          user_id: user.id,
          journey_step_id: stepId,
          action_type: action,
          session_id: `session_${Date.now()}`,
          additional_data: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Error tracking step action:', error);
    }
  };

  const fetchJourneyData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch journey steps from database
      const { data: journeySteps, error: stepsError } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('user_role', 'family')
        .eq('is_active', true)
        .order('order_index');

      if (stepsError) throw stepsError;

      // Fetch journey paths
      const { data: journeyPaths, error: pathsError } = await supabase
        .from('journey_step_paths')
        .select('*')
        .eq('user_role', 'family')
        .eq('is_active', true);

      if (pathsError) throw pathsError;

      // Get user profile and completion data
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_number, visit_scheduling_status, visit_scheduled_date, visit_notes')
        .eq('id', user.id)
        .maybeSingle();

      setVisitStatus(profile?.visit_scheduling_status || 'not_started');

      // Parse visit notes for care model
      let visitNotes = null;
      try {
        visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }
      setCareModel(visitNotes?.care_model || null);

      // Check other completion data
      const { data: careAssessment } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      const { data: careRecipient } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);
      setCarePlans(carePlansData || []);

      const { data: medications } = await supabase
        .from('medications')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      const { data: trialPayments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'trial_day')
        .eq('status', 'completed');

      const hasTrialPayment = trialPayments && trialPayments.length > 0;
      setTrialCompleted(hasTrialPayment);

      // Process steps with completion status
      const processedSteps = journeySteps?.map(step => {
        let completed = false;
        
        switch (step.step_number) {
          case 1:
            completed = !!(user && profile?.full_name);
            break;
          case 2:
            completed = !!careAssessment;
            break;
          case 3:
            completed = !!(careRecipient && careRecipient.full_name);
            break;
          case 4:
            completed = !!careRecipient;
            break;
          case 5:
            completed = !!(medications && medications.length > 0);
            break;
          case 6:
            completed = !!(mealPlans && mealPlans.length > 0);
            break;
          case 7:
            completed = profile?.visit_scheduling_status === 'scheduled' || profile?.visit_scheduling_status === 'completed';
            break;
          case 8:
            completed = profile?.visit_scheduling_status === 'completed';
            break;
          case 9:
          case 10:
          case 11:
            completed = hasTrialPayment;
            break;
          case 12:
            completed = !!visitNotes?.care_model;
            break;
        }

        return {
          ...step,
          id: step.id,
          completed,
          accessible: determineAccessibility(step.step_number, processedSteps || [], completed),
          prerequisites: step.prerequisites || []
        };
      }) || [];

      // Update accessibility
      const stepsWithAccessibility = updateStepAccessibility(processedSteps);
      setSteps(stepsWithAccessibility);

      // Process paths
      const processedPaths = journeyPaths?.map(path => ({
        ...path,
        step_ids: path.step_ids || []
      })) || [];
      setPaths(processedPaths);

      // Determine current stage
      const completedSteps = stepsWithAccessibility.filter(s => s.completed);
      setCurrentStage(determineJourneyStage(completedSteps));
      
    } catch (error) {
      console.error("Error fetching enhanced journey data:", error);
    } finally {
      setLoading(false);
    }
  };

  const determineAccessibility = (stepNumber: number, allSteps: any[], isCompleted: boolean) => {
    // Basic accessibility logic - can be enhanced based on prerequisites
    switch (stepNumber) {
      case 4: // Caregiver matches - need steps 1-3 completed
        const foundationComplete = allSteps.slice(0, 3).every(s => s.completed);
        return foundationComplete;
      case 8: // Confirm visit - need step 7 completed
        return allSteps.find(s => s.step_number === 7)?.completed || false;
      case 9: // Schedule trial - need step 7 completed
        return allSteps.find(s => s.step_number === 7)?.completed || false;
      case 10: // Pay for trial - need steps 8 and 9 completed
        const step8Complete = allSteps.find(s => s.step_number === 8)?.completed;
        const step9Complete = allSteps.find(s => s.step_number === 9)?.completed;
        return step8Complete && step9Complete;
      case 11: // Begin trial - need step 10 completed
        return allSteps.find(s => s.step_number === 10)?.completed || false;
      case 12: // Choose path - need step 8 completed (can skip trial)
        return allSteps.find(s => s.step_number === 8)?.completed || false;
      default:
        return true;
    }
  };

  const updateStepAccessibility = (steps: JourneyStep[]) => {
    return steps.map(step => ({
      ...step,
      accessible: determineAccessibility(step.step_number, steps, step.completed)
    }));
  };

  const determineJourneyStage = (completedSteps: JourneyStep[]) => {
    const foundationSteps = completedSteps.filter(s => s.category === 'foundation');
    const schedulingSteps = completedSteps.filter(s => s.category === 'scheduling');
    const trialSteps = completedSteps.filter(s => s.category === 'trial');
    
    if (trialSteps.length > 0 || careModel) {
      return 'conversion';
    } else if (schedulingSteps.length > 0) {
      return 'trial';
    } else if (foundationSteps.length >= 4) {
      return 'scheduling';
    } else {
      return 'foundation';
    }
  };

  const handleStepAction = (step: JourneyStep) => {
    if (!step.accessible) return;
    
    // Track the action
    trackStepAction(step.id, 'started');
    
    if (step.step_number === 5 || step.step_number === 6) {
      if (carePlans.length > 0) {
        const route = step.step_number === 5 ? 'medications' : 'meals';
        navigate(`/family/care-management/${carePlans[0].id}/${route}`);
      } else {
        navigate('/family/care-management/create');
      }
      return;
    }
    
    if (step.step_number === 7) {
      setShowScheduleModal(true);
      return;
    }
    
    if (step.link_path) {
      navigate(step.link_path);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJourneyData();
    }
  }, [user, visitStatus, careModel, trialCompleted]);

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const nextStep = steps.find(step => !step.completed && step.accessible);

  return {
    steps: steps.map(step => ({
      ...step,
      action: () => handleStepAction(step)
    })),
    paths,
    completionPercentage,
    nextStep,
    currentStage,
    loading,
    carePlans,
    showScheduleModal,
    setShowScheduleModal,
    careModel,
    trialCompleted,
    trackStepAction
  };
};
