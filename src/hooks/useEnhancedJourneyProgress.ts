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
      completed: true,
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
    }
  ];

  // Complete steps 1-3 for 25% completion
  dummySteps[0].completed = true;
  dummySteps[1].completed = true;
  dummySteps[2].completed = true;

  const dummyPaths: JourneyPath[] = [
    {
      id: 'dummy-path-1',
      path_name: 'Quick Start Path',
      path_description: 'Get matched with a caregiver in 24-48 hours',
      step_ids: [1, 2, 3, 4, 7],
      path_color: '#10B981',
      is_recommended: true
    },
    {
      id: 'dummy-path-2',
      path_name: 'Comprehensive Planning',
      path_description: 'Take time to plan every detail of your care',
      step_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      path_color: '#3B82F6',
      is_recommended: false
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
  const [carePlans, setCarePlans] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLeadCaptureModal, setShowLeadCaptureModal] = useState(false);
  const [showInternalScheduleModal, setShowInternalScheduleModal] = useState(false);
  const [showCancelVisitModal, setShowCancelVisitModal] = useState(false);
  const [currentStage, setCurrentStage] = useState<'foundation' | 'scheduling' | 'trial' | 'conversion'>('foundation');
  const [careModel, setCareModel] = useState<string | null>(null);
  const [trialCompleted, setTrialCompleted] = useState(false);
  const [visitStatus, setVisitStatus] = useState<string>('not_started');
  const [visitDetails, setVisitDetails] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isAnonymous = !user;

  // Function to trigger a refresh of journey data
  const refreshJourneyProgress = () => {
    setRefreshTrigger(prev => prev + 1);
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

  // Handle anonymous users with dummy data
  useEffect(() => {
    if (isAnonymous) {
      const { steps: dummySteps, paths: dummyPaths } = getDummyJourneyData();
      setSteps(dummySteps.map(step => ({
        ...step,
        action: () => handleAnonymousStepAction(step)
      })));
      setPaths(dummyPaths);
      setCurrentStage('foundation');
      setLoading(false);
      return;
    }

    if (user) {
      fetchJourneyData();
    }
  }, [user, refreshTrigger]);

  const handleAnonymousStepAction = (step: JourneyStep) => {
    setShowLeadCaptureModal(true);
  };

  // Helper function to determine step accessibility
  const determineStepAccessibility = (stepNumber: number, allSteps: JourneyStep[], profileData: any, visitBookingData: any) => {
    switch (stepNumber) {
      case 4: // Caregiver matches - need steps 1-3 completed
        const foundationSteps = allSteps.filter(s => [1, 2, 3].includes(s.step_number));
        return foundationSteps.every(s => s.completed);
      case 7: // Schedule initial visit - need step 4 completed
        const step4 = allSteps.find(s => s.step_number === 4);
        return step4?.completed || false;
      case 9: // Schedule trial - need step 7 completed (visit scheduled)
        // Check both profile status and actual visit bookings
        const hasVisitScheduled = visitBookingData || 
          (profileData?.visit_scheduling_status && 
           ['scheduled', 'completed'].includes(profileData.visit_scheduling_status));
        return hasVisitScheduled;
      case 10: // Pay for trial - need step 9 completed
        const step9 = allSteps.find(s => s.step_number === 9);
        return step9?.completed || false;
      case 11: // Begin trial - need step 10 completed
        const step10 = allSteps.find(s => s.step_number === 10);
        return step10?.completed || false;
      case 12: // Choose path - need step 7 completed (can skip trial)
        const step7Complete = allSteps.find(s => s.step_number === 7);
        return step7Complete?.completed || false;
      default:
        return true;
    }
  };

  // Enhanced helper function to extract visit details from various sources
  const extractVisitDetails = (profile: any, visitBooking: any) => {
    let details = null;

    // First priority: visit_bookings table (most reliable source)
    if (visitBooking) {
      details = {
        date: visitBooking.booking_date,
        time: visitBooking.booking_time,
        type: visitBooking.visit_type,
        status: visitBooking.status,
        admin_status: visitBooking.admin_status,
        id: visitBooking.id,
        is_admin_scheduled: !visitBooking.availability_slot_id || visitBooking.admin_status === 'confirmed'
      };
    }

    // Second priority: visit_notes in profile
    if (!details && profile?.visit_notes) {
      try {
        const visitNotes = JSON.parse(profile.visit_notes);
        if (visitNotes.visit_type || visitNotes.visit_date) {
          details = {
            date: visitNotes.visit_date || profile.visit_scheduled_date,
            time: visitNotes.visit_time || '11:00 AM',
            type: visitNotes.visit_type || 'virtual',
            is_admin_scheduled: visitNotes.scheduled_by === 'admin'
          };
        }
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }
    }

    // Third priority: profile fields
    if (!details && profile?.visit_scheduled_date) {
      details = {
        date: profile.visit_scheduled_date,
        time: '11:00 AM',
        type: 'virtual',
        is_admin_scheduled: false
      };
    }

    return details;
  };

  const fetchJourneyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch visit bookings for this user
      const { data: visitBookings } = await supabase
        .from('visit_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const latestVisitBooking = visitBookings?.[0];

      // Extract visit details with priority to visit_bookings table
      const extractedVisitDetails = extractVisitDetails(profile, latestVisitBooking);
      setVisitDetails(extractedVisitDetails);

      // Determine visit status based on multiple sources
      let currentVisitStatus = 'not_started';
      if (latestVisitBooking) {
        currentVisitStatus = latestVisitBooking.status === 'confirmed' ? 'scheduled' : latestVisitBooking.status;
      } else if (profile?.visit_scheduling_status) {
        currentVisitStatus = profile.visit_scheduling_status;
      }
      setVisitStatus(currentVisitStatus);

      const { data: journeySteps } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('user_role', 'family')
        .eq('is_active', true)
        .order('step_number');

      const { data: journeyPaths } = await supabase
        .from('journey_step_paths')
        .select('*')
        .eq('user_role', 'family')
        .eq('is_active', true);

      const { data: careData } = await supabase
        .from('care_plans')
        .select('*')
        .eq('family_id', user.id);

      setCarePlans(careData || []);

      if (journeySteps) {
        const processedSteps = journeySteps.map(step => {
          const stepCategory = validateCategory(step.category);
          let isCompleted = false;
          let isAccessible = true;

          // Enhanced step completion logic
          switch (step.step_number) {
            case 1: // Profile creation
              isCompleted = !!profile?.full_name;
              break;
            case 2: // Care assessment
              isCompleted = !!profile?.care_assessment_completed;
              break;
            case 3: // Care recipient profile
              isCompleted = !!profile?.care_recipient_completed;
              break;
            case 4: // View caregiver matches
              isCompleted = !!profile?.caregiver_matches_viewed;
              break;
            case 5: // Medication management
              isCompleted = !!profile?.medication_setup_completed;
              break;
            case 6: // Meal plans
              isCompleted = !!profile?.meal_plans_completed;
              break;
            case 7: // Schedule initial visit
              // Check both visit bookings and profile status
              isCompleted = !!latestVisitBooking || 
                          (profile?.visit_scheduling_status === 'scheduled' || 
                           profile?.visit_scheduling_status === 'completed');
              break;
            case 8: // Prepare for visit
              isCompleted = currentVisitStatus === 'completed' || !!profile?.visit_prep_completed;
              break;
            case 9: // Schedule trial
              isCompleted = !!profile?.trial_scheduled;
              break;
            case 10: // Pay for trial
              isCompleted = !!profile?.trial_payment_completed;
              break;
            case 11: // Begin trial
              isCompleted = !!profile?.trial_started;
              break;
            case 12: // Choose subscription
              isCompleted = !!profile?.subscription_selected;
              break;
            default:
              isCompleted = false;
          }

          // Determine accessibility
          isAccessible = determineStepAccessibility(step.step_number, journeySteps, profile, latestVisitBooking);

          return {
            id: step.id,
            step_number: step.step_number,
            title: step.title,
            description: step.description,
            category: stepCategory,
            is_optional: step.is_optional,
            tooltip_content: step.tooltip_content || '',
            detailed_explanation: step.detailed_explanation || '',
            time_estimate_minutes: step.time_estimate_minutes || 0,
            link_path: step.link_path || '',
            icon_name: step.icon_name || 'Circle',
            completed: isCompleted,
            accessible: isAccessible,
            prerequisites: (step.prerequisites as string[]) || [],
            action: step.step_number === 7 && extractedVisitDetails ? 
              () => setShowCancelVisitModal(true) : 
              () => handleStepAction(step),
            cancelAction: step.step_number === 7 && extractedVisitDetails ? 
              () => setShowCancelVisitModal(true) : 
              undefined
          };
        });

        setSteps(processedSteps);
        setPaths(journeyPaths || []);

        // Determine current stage
        const completedCount = processedSteps.filter(s => s.completed).length;
        if (completedCount <= 3) {
          setCurrentStage('foundation');
        } else if (completedCount <= 7) {
          setCurrentStage('scheduling');
        } else if (completedCount <= 11) {
          setCurrentStage('trial');
        } else {
          setCurrentStage('conversion');
        }
      }
    } catch (error) {
      console.error('Error fetching journey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepAction = (step: JourneyStep) => {
    if (step.step_number === 7) {
      // If visit is already scheduled, show cancel option
      if (visitDetails) {
        setShowCancelVisitModal(true);
      } else {
        setShowScheduleModal(true);
      }
    } else if (step.link_path) {
      navigate(step.link_path);
    }
  };

  const onVisitScheduled = () => {
    refreshJourneyProgress();
  };

  const onVisitCancelled = async () => {
    if (!user || !visitDetails?.id) return;

    try {
      // Cancel the visit booking
      await supabase
        .from('visit_bookings')
        .update({
          status: 'cancelled',
          admin_status: 'cancelled'
        })
        .eq('id', visitDetails.id);

      // Update user profile
      await supabase
        .from('profiles')
        .update({
          visit_scheduling_status: 'cancelled',
          visit_notes: null
        })
        .eq('id', user.id);

      setShowCancelVisitModal(false);
      refreshJourneyProgress();
    } catch (error) {
      console.error('Error cancelling visit:', error);
    }
  };

  // Calculate completion percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  // Find next step
  const nextStep = steps.find(step => !step.completed && step.accessible);

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
