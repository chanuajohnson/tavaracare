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

// Dummy data for anonymous users
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
    {
      id: 'dummy-8',
      step_number: 8,
      title: 'Manage visit details',
      description: 'Review and adjust your visit arrangements',
      category: 'scheduling',
      is_optional: false,
      tooltip_content: 'Manage your scheduled visit details and preferences',
      detailed_explanation: 'Handle visit modifications, confirmations, and special requirements',
      time_estimate_minutes: 10,
      link_path: '/family/visit-management',
      icon_name: 'Settings',
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
      step_ids: [1, 2, 3, 4, 7, 8],
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
  }, [user]);

  const handleAnonymousStepAction = (step: JourneyStep) => {
    setShowLeadCaptureModal(true);
  };

  // Helper function to determine step accessibility
  const determineStepAccessibility = (stepNumber: number, allSteps: JourneyStep[], profileData: any) => {
    switch (stepNumber) {
      case 4: // Caregiver matches - need steps 1-3 completed
        const foundationSteps = allSteps.filter(s => [1, 2, 3].includes(s.step_number));
        return foundationSteps.every(s => s.completed);
      case 7: // Schedule initial visit - need step 4 completed
        const step4 = allSteps.find(s => s.step_number === 4);
        return step4?.completed || false;
      case 8: // Manage visit details - need step 7 completed and visit scheduled (not cancelled)
        const hasValidVisit = profileData?.visit_scheduling_status && 
          ['scheduled', 'completed'].includes(profileData.visit_scheduling_status);
        return hasValidVisit;
      case 9: // Schedule trial - need step 7 completed (visit scheduled)
        const hasVisitForTrial = profileData?.visit_scheduling_status && 
          ['scheduled', 'completed'].includes(profileData.visit_scheduling_status);
        return hasVisitForTrial;
      case 10: // Pay for trial - need steps 8 and 9 completed
        const step8 = allSteps.find(s => s.step_number === 8);
        const step9 = allSteps.find(s => s.step_number === 9);
        return (step8?.completed && step9?.completed) || false;
      case 11: // Begin trial - need step 10 completed
        const step10 = allSteps.find(s => s.step_number === 10);
        return step10?.completed || false;
      case 12: // Choose path - need step 8 completed (can skip trial)
        const step8Complete = allSteps.find(s => s.step_number === 8);
        return step8Complete?.completed || false;
      default:
        return true;
    }
  };

  // Helper function to extract visit details from various sources
  const extractVisitDetails = (profile: any, visitBooking: any) => {
    let details = null;

    // First try visit_bookings table
    if (visitBooking) {
      details = {
        date: visitBooking.booking_date,
        time: visitBooking.booking_time,
        type: visitBooking.visit_type
      };
    }

    // Then try visit_notes in profile
    if (!details && profile?.visit_notes) {
      try {
        const visitNotes = JSON.parse(profile.visit_notes);
        if (visitNotes.visit_type || visitNotes.visit_date) {
          details = {
            date: visitNotes.visit_date || profile.visit_scheduled_date,
            time: visitNotes.visit_time || '11:00 AM',
            type: visitNotes.visit_type || 'virtual'
          };
        }
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }
    }

    // Fallback to profile fields
    if (!details && profile?.visit_scheduled_date) {
      details = {
        date: profile.visit_scheduled_date,
        time: '11:00 AM', // Default time
        type: 'virtual' // Default type
      };
    }

    return details;
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

      // Get visit details from visit_bookings table or profile
      let visitBooking = null;
      if (profile?.visit_scheduling_status && 
          ['scheduled', 'completed', 'cancelled'].includes(profile.visit_scheduling_status)) {
        const { data: booking } = await supabase
          .from('visit_bookings')
          .select('booking_date, booking_time, visit_type')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        visitBooking = booking;
      }

      // Extract visit details from multiple sources
      const extractedVisitDetails = extractVisitDetails(profile, visitBooking);
      setVisitDetails(extractedVisitDetails);

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

      // Process steps with completion status first
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
            // Step 7 is completed when a visit has been scheduled (any status except cancelled)
            completed = !!(profile?.visit_scheduling_status && 
              ['scheduled', 'completed'].includes(profile.visit_scheduling_status));
            console.log(`Step 7 completion: visit_status=${profile?.visit_scheduling_status}, completed=${completed}`);
            break;
          case 8:
            // Step 8 is accessible when visit is scheduled/completed, completed when user has managed details
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

        // Update tooltip content for step 10 if needed
        let tooltipContent = step.tooltip_content || '';
        let detailedExplanation = step.detailed_explanation || '';
        
        if (step.step_number === 10) {
          tooltipContent = 'Secure your trial day with payment. The trial day fee covers 8 hours of professional caregiving coordinated by Tavara.';
          detailedExplanation = 'Secure your trial day with payment. The trial day fee covers 8 hours of professional caregiving coordinated by Tavara. You have options via our subscription service to add trial days or make your final decision between direct hire and Tavara Care Village subscription based on your experience and preferences. Choose Direct Hire ($40/hr) to manage everything yourself, or Tavara Care Village ($45/hr) for full support including payroll, scheduling, medication management, and 24/7 coordinator support.';
        }

        // Update Step 8 title and description
        let title = step.title;
        let description = step.description;
        if (step.step_number === 8) {
          title = 'Manage visit details';
          description = 'Review and adjust your visit arrangements';
          tooltipContent = 'Manage your scheduled visit details and preferences';
          detailedExplanation = 'Handle visit modifications, confirmations, and special requirements';
        }

        return {
          id: step.id,
          step_number: step.step_number,
          title,
          description,
          category: validateCategory(step.category),
          is_optional: step.is_optional || false,
          tooltip_content: tooltipContent,
          detailed_explanation: detailedExplanation,
          time_estimate_minutes: step.time_estimate_minutes || 0,
          link_path: step.link_path || '',
          icon_name: step.icon_name || '',
          completed,
          accessible: true, // Will be updated in the next step
          prerequisites: step.prerequisites ? (Array.isArray(step.prerequisites) ? step.prerequisites : []) : []
        } as JourneyStep;
      }) || [];

      // Now update accessibility for all steps using the completed steps array and profile data
      const processedSteps = stepsWithCompletion.map(step => ({
        ...step,
        accessible: determineStepAccessibility(step.step_number, stepsWithCompletion, profile)
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
    
    // Handle step 4 specifically - redirect to family matching page
    if (step.step_number === 4) {
      navigate('/family/matching');
      return;
    }
    
    if (step.step_number === 5 || step.step_number === 6) {
      if (carePlans.length > 0) {
        const route = step.step_number === 5 ? 'medications' : 'meals';
        navigate(`/family/care-management/${carePlans[0].id}/${route}`);
      } else {
        navigate('/family/care-management/create');
      }
      return;
    }
    
    // Step 7 - Direct to internal scheduling modal (bypass path selection)
    if (step.step_number === 7) {
      setShowInternalScheduleModal(true);
      return;
    }
    
    if (step.link_path) {
      navigate(step.link_path);
    }
  };

  const handleVisitScheduled = () => {
    // Immediately refresh the journey progress when a visit is scheduled
    refreshJourneyProgress();
  };

  const handleVisitCancelled = () => {
    // Refresh the journey progress when a visit is cancelled
    refreshJourneyProgress();
  };

  // Effect to fetch data and listen for changes
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

  // Additional effect to refresh when visit status changes
  useEffect(() => {
    if (user && visitStatus) {
      fetchJourneyData();
    }
  }, [user, visitStatus, careModel, trialCompleted]);

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const nextStep = steps.find(step => !step.completed && step.accessible);

  return {
    steps: steps.map(step => ({
      ...step,
      action: () => handleStepAction(step),
      cancelAction: step.step_number === 7 && step.completed ? () => setShowCancelVisitModal(true) : undefined
    })),
    paths,
    completionPercentage,
    nextStep,
    currentStage,
    loading,
    carePlans,
    showScheduleModal,
    setShowScheduleModal: (show: boolean) => {
      setShowScheduleModal(show);
      if (!show) {
        refreshJourneyProgress();
      }
    },
    showInternalScheduleModal,
    setShowInternalScheduleModal: (show: boolean) => {
      setShowInternalScheduleModal(show);
      if (!show) {
        refreshJourneyProgress();
      }
    },
    showCancelVisitModal,
    setShowCancelVisitModal,
    visitDetails,
    careModel,
    trialCompleted,
    trackStepAction,
    isAnonymous,
    showLeadCaptureModal,
    setShowLeadCaptureModal,
    onVisitScheduled: handleVisitScheduled,
    onVisitCancelled: handleVisitCancelled
  };
};
