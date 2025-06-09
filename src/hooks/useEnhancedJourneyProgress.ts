import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  accessible: boolean;
  icon_name: string;
  tooltip_content: string;
  detailed_explanation: string;
  time_estimate_minutes: number;
  is_optional: boolean;
  action?: () => void;
  cancelAction?: () => void;
  buttonText?: string;
}

interface JourneyPath {
  id: string;
  path_name: string;
  path_description: string;
  path_color: string;
  is_recommended: boolean;
  step_ids: string[];
}

interface VisitDetails {
  date: string;
  time: string;
  type: 'virtual' | 'in_person';
  payment_status?: 'payment_pending' | 'paid' | 'not_required';
}

export const useEnhancedJourneyProgress = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [paths, setPaths] = useState<JourneyPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInternalScheduleModal, setShowInternalScheduleModal] = useState(false);
  const [showCancelVisitModal, setShowCancelVisitModal] = useState(false);
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  const [showLeadCaptureModal, setShowLeadCaptureModal] = useState(false);
  const [visitDetails, setVisitDetails] = useState<VisitDetails | null>(null);

  const isAnonymous = !user;
  const userRole = 'family';

  const fetchJourneySteps = async () => {
    try {
      const { data, error } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('user_role', userRole)
        .eq('is_active', true)
        .order('step_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching journey steps:', error);
      return [];
    }
  };

  const fetchJourneyPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('journey_step_paths')
        .select('*')
        .eq('user_role', userRole)
        .eq('is_active', true)
        .order('path_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching journey paths:', error);
      return [];
    }
  };

  const determineAccessibility = (step: any, userProgress: any, visitDetailsData: VisitDetails | null) => {
    if (isAnonymous) return true;
    if (!userProgress) return step.step_number === 1;

    const completedSteps = userProgress.completed_steps || [];
    
    switch (step.step_number) {
      case 1:
        return true;
      case 2:
        return completedSteps.includes('1');
      case 3:
        return completedSteps.includes('1') && completedSteps.includes('2');
      case 4:
        return completedSteps.includes('1') && completedSteps.includes('2') && completedSteps.includes('3');
      case 5:
        return completedSteps.includes('4');
      case 6:
        return completedSteps.includes('4');
      case 7:
        return completedSteps.includes('4');
      case 8:
        return completedSteps.includes('7') && visitDetailsData !== null;
      default:
        return false;
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return null;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) return null;

      // Parse visit details from visit_notes
      let visitDetailsData: VisitDetails | null = null;
      if (profile.visit_notes) {
        try {
          const visitData = JSON.parse(profile.visit_notes);
          if (visitData.visit_date && visitData.visit_time && visitData.visit_type) {
            visitDetailsData = {
              date: visitData.visit_date,
              time: visitData.visit_time,
              type: visitData.visit_type,
              payment_status: visitData.payment_status || 'not_required'
            };
          }
        } catch (e) {
          console.warn('Failed to parse visit_notes:', e);
        }
      }

      // Also check visit_bookings table for more detailed payment status
      if (visitDetailsData) {
        try {
          const { data: bookingData } = await supabase
            .from('visit_bookings')
            .select('payment_status, visit_type')
            .eq('user_id', user.id)
            .eq('status', 'confirmed')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (bookingData) {
            visitDetailsData.payment_status = bookingData.payment_status;
          }
        } catch (e) {
          console.warn('No booking data found, using visit_notes data');
        }
      }

      setVisitDetails(visitDetailsData);

      const completedSteps = [];
      
      if (profile.full_name && profile.care_recipient_name) completedSteps.push('1');
      if (profile.care_needs_completed) completedSteps.push('2');
      if (profile.care_story_completed) completedSteps.push('3');
      if (profile.caregiver_matching_unlocked) completedSteps.push('4');
      if (profile.medication_management_setup) completedSteps.push('5');
      if (profile.meal_planning_setup) completedSteps.push('6');
      if (profile.visit_scheduling_status === 'scheduled' || profile.ready_for_admin_scheduling) {
        completedSteps.push('7');
      }
      if (visitDetailsData) completedSteps.push('8');

      return {
        completed_steps: completedSteps,
        profile
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  };

  const loadJourneyData = async () => {
    setLoading(true);
    try {
      const [stepsData, pathsData, userProgress] = await Promise.all([
        fetchJourneySteps(),
        fetchJourneyPaths(),
        fetchUserProgress()
      ]);

      const processedSteps = stepsData.map(step => {
        const isCompleted = isAnonymous ? 
          Math.random() > 0.5 : 
          userProgress?.completed_steps?.includes(step.step_number.toString()) || false;
        
        const isAccessible = determineAccessibility(step, userProgress, visitDetails);

        return {
          ...step,
          completed: isCompleted,
          accessible: isAccessible,
          action: getStepAction(step.step_number, isCompleted),
          cancelAction: step.step_number === 7 && isCompleted && visitDetails ? 
            () => setShowCancelVisitModal(true) : undefined
        };
      });

      setSteps(processedSteps);
      setPaths(pathsData);
    } catch (error) {
      console.error('Error loading journey data:', error);
      toast.error('Failed to load journey progress');
    } finally {
      setLoading(false);
    }
  };

  const getStepAction = (stepNumber: number, isCompleted: boolean) => {
    if (isAnonymous) {
      return () => setShowLeadCaptureModal(true);
    }

    switch (stepNumber) {
      case 1:
        return () => window.location.href = '/profile/setup';
      case 2:
        return () => window.location.href = '/profile/care-needs';
      case 3:
        return () => window.location.href = '/profile/care-story';
      case 4:
        return () => setShowCaregiverMatchingModal(true);
      case 5:
        return () => window.location.href = '/family/medication-management';
      case 6:
        return () => window.location.href = '/family/meal-planning';
      case 7:
        return () => setShowInternalScheduleModal(true);
      case 8:
        return () => window.location.href = '/family/care-coordination';
      default:
        return undefined;
    }
  };

  const trackStepAction = async (stepId: string, action: string) => {
    if (!user) return;

    try {
      await supabase
        .from('journey_analytics')
        .insert({
          user_id: user.id,
          journey_step_id: stepId,
          action_type: action,
          additional_data: {}
        });
    } catch (error) {
      console.error('Error tracking step action:', error);
    }
  };

  const onVisitCancelled = () => {
    setVisitDetails(null);
    loadJourneyData();
  };

  useEffect(() => {
    loadJourneyData();
  }, [user]);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  const nextStep = steps.find(step => !step.completed && step.accessible);
  const currentStage = nextStep ? nextStep.category : 'completed';

  return {
    steps,
    paths,
    completionPercentage,
    nextStep,
    currentStage,
    loading,
    showScheduleModal,
    setShowScheduleModal,
    showInternalScheduleModal,
    setShowInternalScheduleModal,
    showCancelVisitModal,
    setShowCancelVisitModal,
    showCaregiverMatchingModal,
    setShowCaregiverMatchingModal,
    showLeadCaptureModal,
    setShowLeadCaptureModal,
    visitDetails,
    trackStepAction,
    isAnonymous,
    onVisitCancelled
  };
};
