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
    },
    // Note: Step 8 removed as requested
    {
      id: 'dummy-8',
      step_number: 8,
      title: 'Schedule trial day (Optional)',
      description: 'Choose a trial date with your matched caregiver. This is an optional step before choosing your care model.',
      category: 'trial',
      is_optional: true,
      tooltip_content: 'Experience care with a trial day',
      detailed_explanation: 'Test your caregiver match before committing',
      time_estimate_minutes: 5,
      link_path: '/family/trial',
      icon_name: 'TestTube',
      completed: false,
      accessible: false,
      prerequisites: []
    },
    {
      id: 'dummy-9',
      step_number: 9,
      title: 'Pay for trial day (Optional)',
      description: 'Pay a one-time fee of $320 TTD for an 8-hour caregiver experience.',
      category: 'trial',
      is_optional: true,
      tooltip_content: 'Complete payment for trial',
      detailed_explanation: 'Secure your trial day with payment',
      time_estimate_minutes: 10,
      link_path: '/family/trial-payment',
      icon_name: 'CreditCard',
      completed: false,
      accessible: false,
      prerequisites: []
    },
    {
      id: 'dummy-10',
      step_number: 10,
      title: 'Begin your trial (Optional)',
      description: 'Your caregiver begins the scheduled trial session.',
      category: 'trial',
      is_optional: true,
      tooltip_content: 'Start your trial experience',
      detailed_explanation: 'Experience personalized care during your trial',
      time_estimate_minutes: 480,
      link_path: '/family/trial-session',
      icon_name: 'Play',
      completed: false,
      accessible: false,
      prerequisites: []
    },
    {
      id: 'dummy-11',
      step_number: 11,
      title: 'Rate & Choose Your Path',
      description: 'Decide between: Hire your caregiver ($40/hr) or Subscribe to Tavara ($45/hr) for full support tools. Can skip trial and go directly here after visit confirmation.',
      category: 'conversion',
      is_optional: false,
      tooltip_content: 'Choose your care model',
      detailed_explanation: 'Select the best care option for your family',
      time_estimate_minutes: 15,
      link_path: '/family/choose-path',
      icon_name: 'Star',
      completed: false,
      accessible: false,
      prerequisites: []
    }
  ];

  // Complete steps 1-3 for demo
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
      step_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
      case 8: // Schedule trial - need step 7 completed (visit scheduled)
        // Check both profile status and actual visit bookings
        const hasVisitScheduled = visitBookingData || 
          (profileData?.visit_scheduling_status && 
           ['scheduled', 'completed'].includes(profileData.visit_scheduling_status));
        return hasVisitScheduled;
      case 9: // Pay for trial - need step 8 completed
        const step8 = allSteps.find(s => s.step_number === 8);
        return step8?.completed || false;
      case 10: // Begin trial - need step 9 completed
        const step9 = allSteps.find(s => s.step_number === 9);
        return step9?.completed || false;
      case 11: // Choose path - need step 7 completed (can skip trial)
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

      // Fetch actual data for step completion checks
      const { data: careNeedsData } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      const { data: careRecipientData } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);
      setCarePlans(carePlansData || []);

      const { data: medicationsData } = await supabase
        .from('medications')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      const { data: mealPlansData } = await supabase
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

      if (journeySteps) {
        const processedSteps = journeySteps.map(step => {
          const stepCategory = validateCategory(step.category);
          let isCompleted = false;
          let isAccessible = true;

          // Enhanced step completion logic using actual data
          switch (step.step_number) {
            case 1: // Profile creation
              isCompleted = !!(user && profile?.full_name);
              break;
            case 2: // Care assessment
              isCompleted = !!careNeedsData;
              break;
            case 3: // Care recipient profile
              isCompleted = !!(careRecipientData && careRecipientData.full_name);
              break;
            case 4: // View caregiver matches
              isCompleted = !!careRecipientData;
              break;
            case 5: // Medication management
              isCompleted = !!(medicationsData && medicationsData.length > 0);
              break;
            case 6: // Meal plans
              isCompleted = !!(mealPlansData && mealPlansData.length > 0);
              break;
            case 7: // Schedule initial visit
              // Check both visit bookings and profile status
              isCompleted = !!latestVisitBooking || 
                          (profile?.visit_scheduling_status === 'scheduled' || 
                           profile?.visit_scheduling_status === 'completed');
              break;
            case 8: // Schedule trial day (renumbered from previous step 9)
              isCompleted = hasTrialPayment;
              break;
            case 9: // Pay for trial day (renumbered from previous step 10)
              isCompleted = hasTrialPayment;
              break;
            case 10: // Begin trial (renumbered from previous step 11)
              isCompleted = hasTrialPayment;
              break;
            case 11: // Rate & choose path (renumbered from previous step 12)
              isCompleted = !!profile?.visit_notes && JSON.parse(profile.visit_notes || '{}')?.care_model;
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
        
        // Convert journey paths step_ids from JSON to number array
        const convertedPaths = (journeyPaths || []).map(path => ({
          ...path,
          step_ids: Array.isArray(path.step_ids) ? path.step_ids : JSON.parse(path.step_ids as string)
        }));
        setPaths(convertedPaths);

        // Determine current stage
        const completedCount = processedSteps.filter(s => s.completed).length;
        if (completedCount <= 3) {
          setCurrentStage('foundation');
        } else if (completedCount <= 7) {
          setCurrentStage('scheduling');
        } else if (completedCount <= 10) {
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
