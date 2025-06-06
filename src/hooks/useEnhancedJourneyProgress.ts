
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
  action?: () => void;
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

  // Helper function to determine step accessibility - moved outside of fetchJourneyData
  const determineStepAccessibility = (stepNumber: number, allSteps: JourneyStep[]) => {
    switch (stepNumber) {
      case 4: // Caregiver matches - need steps 1-3 completed
        const foundationSteps = allSteps.filter(s => [1, 2, 3].includes(s.step_number));
        return foundationSteps.every(s => s.completed);
      case 8: // Confirm visit - need step 7 completed
        const step7 = allSteps.find(s => s.step_number === 7);
        return step7?.completed || false;
      case 9: // Schedule trial - need step 7 completed
        const step7ForTrial = allSteps.find(s => s.step_number === 7);
        return step7ForTrial?.completed || false;
      case 10: // Pay for trial - need steps 8 and 9 completed
        const step8 = allSteps.find(s => s.step_number === 8);
        const step9 = allSteps.find(s => s.step_number === 9);
        return (step8?.completed && step9?.completed) || false;
      case 11: // Begin trial - need step 10 completed
        const step10 = allSteps.find(s => s.step_number === 10);
        return step10?.completed || false;
      case 12: // Choose path - need step 8 completed (can skip trial)
        const step8ForPath = allSteps.find(s => s.step_number === 8);
        return step8ForPath?.completed || false;
      default:
        return true;
    }
  };

  const fetchJourneyData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching journey data for user:', user.id);
      
      // Fetch journey steps from database
      const { data: journeySteps, error: stepsError } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('user_role', 'family')
        .eq('is_active', true)
        .order('order_index');

      if (stepsError) throw stepsError;
      console.log('Journey steps fetched:', journeySteps);

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

      console.log('User profile:', profile);
      setVisitStatus(profile?.visit_scheduling_status || 'not_started');

      // Parse visit notes for care model
      let visitNotes = null;
      try {
        visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }
      setCareModel(visitNotes?.care_model || null);

      // Check care assessment
      const { data: careAssessment } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
      console.log('Care assessment:', careAssessment);

      // Check care recipient
      const { data: careRecipient } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      console.log('Care recipient:', careRecipient);

      // Check care plans
      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);
      console.log('Care plans:', carePlansData);
      setCarePlans(carePlansData || []);

      // Check medications - using care_plan_id from care plans
      let medications = [];
      if (carePlansData && carePlansData.length > 0) {
        const carePlanIds = carePlansData.map(cp => cp.id);
        const { data: medicationsData } = await supabase
          .from('medications')
          .select('id, care_plan_id')
          .in('care_plan_id', carePlanIds);
        medications = medicationsData || [];
      }
      console.log('Medications:', medications);

      // Check meal plans - using care_plan_id from care plans
      let mealPlans = [];
      if (carePlansData && carePlansData.length > 0) {
        const carePlanIds = carePlansData.map(cp => cp.id);
        const { data: mealPlansData } = await supabase
          .from('meal_plans')
          .select('id, care_plan_id')
          .in('care_plan_id', carePlanIds);
        mealPlans = mealPlansData || [];
      }
      console.log('Meal plans:', mealPlans);

      // Check trial payments
      const { data: trialPayments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'trial_day')
        .eq('status', 'completed');

      const hasTrialPayment = trialPayments && trialPayments.length > 0;
      setTrialCompleted(hasTrialPayment);

      // Process steps with completion status first (without accessibility)
      const stepsWithCompletion = journeySteps?.map(step => {
        let completed = false;
        
        console.log(`Checking completion for step ${step.step_number}: ${step.title}`);
        
        switch (step.step_number) {
          case 1:
            completed = !!(user && profile?.full_name);
            console.log(`Step 1 completion: user=${!!user}, full_name=${!!profile?.full_name}, completed=${completed}`);
            break;
          case 2:
            completed = !!careAssessment;
            console.log(`Step 2 completion: careAssessment=${!!careAssessment}, completed=${completed}`);
            break;
          case 3:
            completed = !!(careRecipient && careRecipient.full_name);
            console.log(`Step 3 completion: careRecipient=${!!careRecipient}, full_name=${!!careRecipient?.full_name}, completed=${completed}`);
            break;
          case 4:
            completed = !!careRecipient;
            console.log(`Step 4 completion: careRecipient=${!!careRecipient}, completed=${completed}`);
            break;
          case 5:
            completed = !!(medications && medications.length > 0);
            console.log(`Step 5 completion: medications count=${medications?.length || 0}, completed=${completed}`);
            break;
          case 6:
            completed = !!(mealPlans && mealPlans.length > 0);
            console.log(`Step 6 completion: meal plans count=${mealPlans?.length || 0}, completed=${completed}`);
            break;
          case 7:
            completed = profile?.visit_scheduling_status === 'scheduled' || profile?.visit_scheduling_status === 'completed';
            console.log(`Step 7 completion: visit_status=${profile?.visit_scheduling_status}, completed=${completed}`);
            break;
          case 8:
            completed = profile?.visit_scheduling_status === 'completed';
            console.log(`Step 8 completion: visit_status=${profile?.visit_scheduling_status}, completed=${completed}`);
            break;
          case 9:
          case 10:
          case 11:
            completed = hasTrialPayment;
            console.log(`Step ${step.step_number} completion: hasTrialPayment=${hasTrialPayment}, completed=${completed}`);
            break;
          case 12:
            completed = !!visitNotes?.care_model;
            console.log(`Step 12 completion: care_model=${!!visitNotes?.care_model}, completed=${completed}`);
            break;
        }

        return {
          ...step,
          id: step.id,
          completed,
          accessible: true, // Will be updated in the next step
          prerequisites: step.prerequisites || []
        };
      }) || [];

      // Now update accessibility for all steps using the completed steps array
      const processedSteps = stepsWithCompletion.map(step => ({
        ...step,
        accessible: determineStepAccessibility(step.step_number, stepsWithCompletion)
      }));

      console.log('Processed steps with completion status and accessibility:', processedSteps);
      setSteps(processedSteps);

      const completedCount = processedSteps.filter(s => s.completed).length;
      const totalCount = processedSteps.length;
      const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      console.log(`Progress calculation: ${completedCount}/${totalCount} = ${percentage}%`);

      // Process paths - properly handle step_ids type conversion
      const processedPaths = journeyPaths?.map(path => {
        let stepIds: number[] = [];
        
        // Handle different possible types for step_ids
        if (Array.isArray(path.step_ids)) {
          stepIds = path.step_ids.map(id => Number(id)).filter(id => !isNaN(id));
        } else if (typeof path.step_ids === 'string') {
          try {
            const parsed = JSON.parse(path.step_ids);
            if (Array.isArray(parsed)) {
              stepIds = parsed.map(id => Number(id)).filter(id => !isNaN(id));
            }
          } catch (error) {
            console.error('Error parsing step_ids:', error);
          }
        }

        return {
          ...path,
          step_ids: stepIds
        };
      }) || [];
      
      setPaths(processedPaths);

      // Determine current stage
      const completedSteps = processedSteps.filter(s => s.completed);
      setCurrentStage(determineJourneyStage(completedSteps));
      
    } catch (error) {
      console.error("Error fetching enhanced journey data:", error);
    } finally {
      setLoading(false);
    }
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
