
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
  cancelAction?: () => void;
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
  showInternalScheduleModal: boolean;
  setShowInternalScheduleModal: (show: boolean) => void;
  showCancelVisitModal: boolean;
  setShowCancelVisitModal: (show: boolean) => void;
  showCaregiverMatchingModal: boolean;
  setShowCaregiverMatchingModal: (show: boolean) => void;
  visitDetails: any;
  careModel: string | null;
  trialCompleted: boolean;
  trackStepAction: (stepId: string, action: string) => Promise<void>;
  isAnonymous: boolean;
  showLeadCaptureModal: boolean;
  setShowLeadCaptureModal: (show: boolean) => void;
  onVisitScheduled: () => void;
  onVisitCancelled: () => void;
}

// Helper function to validate and convert category
const validateCategory = (category: string): 'foundation' | 'scheduling' | 'trial' | 'conversion' => {
  if (['foundation', 'scheduling', 'trial', 'conversion'].includes(category)) {
    return category as 'foundation' | 'scheduling' | 'trial' | 'conversion';
  }
  return 'foundation';
};

const getDummyJourneyData = (): { steps: JourneyStep[], paths: JourneyPath[] } => {
  const dummySteps: JourneyStep[] = [
    {
      id: 'dummy-1',
      step_number: 1,
      title: 'Create your family profile',
      description: 'Tell us about your care needs',
      category: 'foundation',
      is_optional: false,
      tooltip_content: 'Start by creating your family profile to get personalized care recommendations',
      detailed_explanation: 'Your profile helps us understand your unique care situation',
      time_estimate_minutes: 10,
      link_path: '/registration/family',
      icon_name: 'User',
      completed: true,
      accessible: true,
      prerequisites: []
    },
    {
      id: 'dummy-2',
      step_number: 2,
      title: 'Complete care assessment',
      description: 'Detail your care requirements',
      category: 'foundation',
      is_optional: false,
      tooltip_content: 'Help us understand the specific care needs',
      detailed_explanation: 'This assessment ensures we match you with the right caregivers',
      time_estimate_minutes: 15,
      link_path: '/family/care-assessment',
      icon_name: 'ClipboardList',
      completed: true,
      accessible: true,
      prerequisites: []
    },
    {
      id: 'dummy-3',
      step_number: 3,
      title: 'Create care recipient profile',
      description: 'Tell us about your loved one',
      category: 'foundation',
      is_optional: false,
      tooltip_content: 'Share details about the person receiving care',
      detailed_explanation: 'This helps caregivers provide personalized, compassionate care',
      time_estimate_minutes: 15,
      link_path: '/family/care-recipient',
      icon_name: 'Heart',
      completed: false,
      accessible: true,
      prerequisites: []
    },
    {
      id: 'dummy-4',
      step_number: 4,
      title: 'View caregiver matches',
      description: 'See caregivers who match your needs',
      category: 'foundation',
      is_optional: false,
      tooltip_content: 'Browse qualified caregivers in your area',
      detailed_explanation: 'We\'ve found caregivers who specialize in your care needs',
      time_estimate_minutes: 10,
      link_path: '/family/caregiver-matches',
      icon_name: 'Users',
      completed: false,
      accessible: false,
      prerequisites: []
    },
    {
      id: 'dummy-5',
      step_number: 5,
      title: 'Set up medication management',
      description: 'Track medications and schedules',
      category: 'scheduling',
      is_optional: false,
      tooltip_content: 'Create a medication plan for your loved one',
      detailed_explanation: 'Ensure medications are taken correctly and on time',
      time_estimate_minutes: 20,
      link_path: '/family/medications',
      icon_name: 'Pill',
      completed: false,
      accessible: false,
      prerequisites: []
    },
    {
      id: 'dummy-6',
      step_number: 6,
      title: 'Create meal plans',
      description: 'Plan nutritious meals',
      category: 'scheduling',
      is_optional: true,
      tooltip_content: 'Develop meal plans tailored to dietary needs',
      detailed_explanation: 'Ensure proper nutrition with customized meal planning',
      time_estimate_minutes: 15,
      link_path: '/family/meal-plans',
      icon_name: 'Utensils',
      completed: false,
      accessible: false,
      prerequisites: []
    },
    {
      id: 'dummy-7',
      step_number: 7,
      title: 'Schedule initial visit',
      description: 'Meet your care coordinator',
      category: 'scheduling',
      is_optional: false,
      tooltip_content: 'Schedule a time to meet your care team',
      detailed_explanation: 'This visit helps establish care goals and expectations',
      time_estimate_minutes: 5,
      link_path: '/family/schedule-visit',
      icon_name: 'Calendar',
      completed: false,
      accessible: false,
      prerequisites: []
    },
    {
      id: 'dummy-11',
      step_number: 11,
      title: 'Choose Your Care Model',
      description: 'Decide between subscription or direct hire',
      category: 'conversion',
      is_optional: false,
      tooltip_content: 'Select the care model that works best for your family',
      detailed_explanation: 'Choose between our managed subscription service or direct hire options',
      time_estimate_minutes: 10,
      link_path: '/family/care-model-selection',
      icon_name: 'Settings',
      completed: false,
      accessible: false,
      prerequisites: []
    }
  ];

  const dummyPaths: JourneyPath[] = [
    {
      id: 'dummy-foundation',
      path_name: 'Foundation Setup',
      path_description: 'Essential steps to get started',
      step_ids: [1, 2, 3, 4],
      path_color: '#3B82F6',
      is_recommended: true
    },
    {
      id: 'dummy-scheduling',
      path_name: 'Care Coordination',
      path_description: 'Set up your care schedule and team',
      step_ids: [5, 6, 7],
      path_color: '#10B981',
      is_recommended: true
    },
    {
      id: 'dummy-conversion',
      path_name: 'Service Selection',
      path_description: 'Choose your ongoing care model',
      step_ids: [11],
      path_color: '#8B5CF6',
      is_recommended: true
    }
  ];

  return { steps: dummySteps, paths: dummyPaths };
};

export const useEnhancedJourneyProgress = (): JourneyProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [paths, setPaths] = useState<JourneyPath[]>([]);
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [visitDetails, setVisitDetails] = useState<any>(null);
  const [careModel, setCareModel] = useState<string | null>(null);
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInternalScheduleModal, setShowInternalScheduleModal] = useState(false);
  const [showCancelVisitModal, setShowCancelVisitModal] = useState(false);
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  const [showLeadCaptureModal, setShowLeadCaptureModal] = useState(false);

  const isAnonymous = !user;

  useEffect(() => {
    const loadJourneyData = async () => {
      setLoading(true);

      if (!user) {
        // Use dummy data for anonymous users
        const { steps: dummySteps, paths: dummyPaths } = getDummyJourneyData();
        setSteps(dummySteps);
        setPaths(dummyPaths);
        setLoading(false);
        return;
      }

      try {
        // For authenticated users, calculate real progress
        const userId = user.id;

        // Fetch user profile data with only existing columns
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number, location')
          .eq('id', userId)
          .maybeSingle();

        // Check care assessment completion
        const { data: careAssessment } = await supabase
          .from('care_needs_family')
          .select('*')
          .eq('profile_id', userId)
          .maybeSingle();

        // Check care recipient profile
        const { data: careRecipient } = await supabase
          .from('care_recipient_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        // Check care plans
        const { data: userCarePlans } = await supabase
          .from('care_plans')
          .select('*')
          .eq('family_id', userId);

        setCarePlans(userCarePlans || []);

        // Check medications
        const { data: medications } = await supabase
          .from('medications')
          .select('*')
          .in('care_plan_id', (userCarePlans || []).map(cp => cp.id));

        // Check meal plans
        const { data: mealPlans } = await supabase
          .from('meal_plans')
          .select('*')
          .in('care_plan_id', (userCarePlans || []).map(cp => cp.id));

        // Check visit bookings
        const { data: visitBookings } = await supabase
          .from('visit_bookings')
          .select('*')
          .eq('user_id', userId);

        setVisitDetails(visitBookings?.[0] || null);

        // Parse care model from visit notes if available (checking if profile has visit_notes)
        let visitNotes = null;
        try {
          if (profile && 'visit_notes' in profile && profile.visit_notes && typeof profile.visit_notes === 'string') {
            visitNotes = JSON.parse(profile.visit_notes);
          }
        } catch (error) {
          console.error('Error parsing visit notes:', error);
        }
        setCareModel(visitNotes?.care_model || null);

        // Calculate step completion with STRICT requirements for new users
        const stepCompletions = {
          1: !!(profile?.full_name && profile?.phone_number), // STRICT: Require both name AND phone
          2: !!(careAssessment && Object.keys(careAssessment).length > 2), // Check if assessment has meaningful data beyond id and profile_id
          3: !!(careRecipient && careRecipient.full_name),
          4: false, // Viewing matches doesn't mark as completed
          5: !!(medications && medications.length > 0),
          6: !!(mealPlans && mealPlans.length > 0),
          7: !!(visitBookings && visitBookings.length > 0),
          11: !!(visitNotes?.care_model)
        };

        // Create actual steps with real completion status
        const realSteps: JourneyStep[] = [
          {
            id: '1',
            step_number: 1,
            title: 'Create your family profile',
            description: 'Tell us about your care needs',
            category: 'foundation',
            is_optional: false,
            tooltip_content: 'Start by creating your family profile to get personalized care recommendations',
            detailed_explanation: 'Your profile helps us understand your unique care situation',
            time_estimate_minutes: 10,
            link_path: '/dashboard/family',
            icon_name: 'User',
            completed: stepCompletions[1],
            accessible: true,
            prerequisites: []
          },
          {
            id: '2',
            step_number: 2,
            title: 'Complete care assessment',
            description: 'Detail your care requirements',
            category: 'foundation',
            is_optional: false,
            tooltip_content: 'Help us understand the specific care needs',
            detailed_explanation: 'This assessment ensures we match you with the right caregivers',
            time_estimate_minutes: 15,
            link_path: '/family/care-assessment',
            icon_name: 'ClipboardList',
            completed: stepCompletions[2],
            accessible: stepCompletions[1], // Only accessible after profile completion
            prerequisites: ['1']
          },
          {
            id: '3',
            step_number: 3,
            title: 'Create care recipient profile',
            description: 'Tell us about your loved one',
            category: 'foundation',
            is_optional: false,
            tooltip_content: 'Share details about the person receiving care',
            detailed_explanation: 'This helps caregivers provide personalized, compassionate care',
            time_estimate_minutes: 15,
            link_path: '/family/care-recipient',
            icon_name: 'Heart',
            completed: stepCompletions[3],
            accessible: stepCompletions[2], // Only accessible after assessment
            prerequisites: ['2']
          },
          {
            id: '4',
            step_number: 4,
            title: 'View caregiver matches',
            description: 'See caregivers who match your needs',
            category: 'foundation',
            is_optional: false,
            tooltip_content: 'Browse qualified caregivers in your area',
            detailed_explanation: 'We\'ve found caregivers who specialize in your care needs',
            time_estimate_minutes: 10,
            link_path: '/family/caregiver-matches',
            icon_name: 'Users',
            completed: stepCompletions[4],
            accessible: stepCompletions[3], // Only accessible after care recipient profile
            prerequisites: ['3']
          },
          {
            id: '5',
            step_number: 5,
            title: 'Set up medication management',
            description: 'Track medications and schedules',
            category: 'scheduling',
            is_optional: false,
            tooltip_content: 'Create a medication plan for your loved one',
            detailed_explanation: 'Ensure medications are taken correctly and on time',
            time_estimate_minutes: 20,
            link_path: '/family/medications',
            icon_name: 'Pill',
            completed: stepCompletions[5],
            accessible: stepCompletions[4] || stepCompletions[3], // Accessible after foundation
            prerequisites: ['4']
          },
          {
            id: '6',
            step_number: 6,
            title: 'Create meal plans',
            description: 'Plan nutritious meals',
            category: 'scheduling',
            is_optional: true,
            tooltip_content: 'Develop meal plans tailored to dietary needs',
            detailed_explanation: 'Ensure proper nutrition with customized meal planning',
            time_estimate_minutes: 15,
            link_path: '/family/meal-plans',
            icon_name: 'Utensils',
            completed: stepCompletions[6],
            accessible: stepCompletions[4] || stepCompletions[3], // Accessible after foundation
            prerequisites: ['4']
          },
          {
            id: '7',
            step_number: 7,
            title: 'Schedule initial visit',
            description: 'Meet your care coordinator',
            category: 'scheduling',
            is_optional: false,
            tooltip_content: 'Schedule a time to meet your care team',
            detailed_explanation: 'This visit helps establish care goals and expectations',
            time_estimate_minutes: 5,
            link_path: '/family/schedule-visit',
            icon_name: 'Calendar',
            completed: stepCompletions[7],
            accessible: stepCompletions[4] || stepCompletions[3], // Accessible after foundation
            prerequisites: ['4']
          },
          {
            id: '11',
            step_number: 11,
            title: 'Choose Your Care Model',
            description: 'Decide between subscription or direct hire',
            category: 'conversion',
            is_optional: false,
            tooltip_content: 'Select the care model that works best for your family',
            detailed_explanation: 'Choose between our managed subscription service or direct hire options',
            time_estimate_minutes: 10,
            link_path: '/family/care-model-selection',
            icon_name: 'Settings',
            completed: stepCompletions[11],
            accessible: stepCompletions[7], // Only accessible after visit scheduling
            prerequisites: ['7']
          }
        ];

        const realPaths: JourneyPath[] = [
          {
            id: 'foundation',
            path_name: 'Foundation Setup',
            path_description: 'Essential steps to get started',
            step_ids: [1, 2, 3, 4],
            path_color: '#3B82F6',
            is_recommended: true
          },
          {
            id: 'scheduling',
            path_name: 'Care Coordination',
            path_description: 'Set up your care schedule and team',
            step_ids: [5, 6, 7],
            path_color: '#10B981',
            is_recommended: true
          },
          {
            id: 'conversion',
            path_name: 'Service Selection',
            path_description: 'Choose your ongoing care model',
            step_ids: [11],
            path_color: '#8B5CF6',
            is_recommended: true
          }
        ];

        setSteps(realSteps);
        setPaths(realPaths);

      } catch (error) {
        console.error('Error loading journey data:', error);
        // Fallback to empty progress on error
        const { steps: emptySteps, paths: emptyPaths } = getDummyJourneyData();
        // Mark all as not completed for error state
        const errorSteps = emptySteps.map(step => ({ ...step, completed: false, accessible: step.step_number === 1 }));
        setSteps(errorSteps);
        setPaths(emptyPaths);
      } finally {
        setLoading(false);
      }
    };

    loadJourneyData();
  }, [user?.id]);

  // Calculate completion percentage
  const completionPercentage = steps.length > 0 
    ? Math.round((steps.filter(step => step.completed).length / steps.length) * 100)
    : 0;

  // Find next step
  const nextStep = steps.find(step => !step.completed && step.accessible);

  // Determine current stage
  const currentStage: 'foundation' | 'scheduling' | 'trial' | 'conversion' = 
    completionPercentage < 50 ? 'foundation' :
    completionPercentage < 75 ? 'scheduling' :
    completionPercentage < 90 ? 'trial' : 'conversion';

  const trialCompleted = steps.filter(step => step.category === 'trial' && step.completed).length > 0;

  const trackStepAction = async (stepId: string, action: string) => {
    try {
      await supabase.from('journey_analytics').insert([{
        user_id: user?.id,
        journey_step_id: stepId,
        action_type: action,
        session_id: sessionStorage.getItem('session_id') || 'anonymous',
        additional_data: { timestamp: new Date().toISOString() }
      }]);
    } catch (error) {
      console.error('Error tracking step action:', error);
    }
  };

  const onVisitScheduled = () => {
    setShowScheduleModal(false);
    setShowInternalScheduleModal(false);
    // Reload journey data to reflect the new visit
    window.location.reload();
  };

  const onVisitCancelled = () => {
    setShowCancelVisitModal(false);
    // Reload journey data to reflect the cancellation
    window.location.reload();
  };

  return {
    steps,
    paths,
    completionPercentage,
    nextStep,
    currentStage,
    loading,
    carePlans,
    showScheduleModal,
    setShowScheduleModal,
    showInternalScheduleModal,
    setShowInternalScheduleModal,
    showCancelVisitModal,
    setShowCancelVisitModal,
    showCaregiverMatchingModal,
    setShowCaregiverMatchingModal,
    visitDetails,
    careModel,
    trialCompleted,
    trackStepAction,
    isAnonymous,
    showLeadCaptureModal,
    setShowLeadCaptureModal,
    onVisitScheduled,
    onVisitCancelled
  };
};
