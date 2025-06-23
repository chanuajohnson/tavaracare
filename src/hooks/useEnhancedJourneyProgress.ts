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
  isInteractive?: boolean;
  buttonText?: string;
}

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  current: boolean;
  progress: number;
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
  stages: JourneyStage[];
  paths: JourneyPath[];
  completionPercentage: number;
  overallProgress: number;
  nextStep?: JourneyStep;
  completedSteps: number;
  totalSteps: number;
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
  refreshProgress: () => void;
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
      title: 'Create your account',
      description: 'Set up your Tavara account',
      category: 'foundation',
      is_optional: false,
      tooltip_content: 'Start by creating your account with Tavara',
      detailed_explanation: 'Your account lets you access all of our care services',
      time_estimate_minutes: 5,
      link_path: '/profile/edit',
      icon_name: 'User',
      completed: true,
      accessible: true,
      prerequisites: [],
      isInteractive: false,
      buttonText: 'Complete'
    },
    {
      id: 'dummy-2',
      step_number: 2,
      title: 'Complete your registration',
      description: 'Tell us about your care needs',
      category: 'foundation',
      is_optional: false,
      tooltip_content: 'Complete your family registration to get personalized care',
      detailed_explanation: 'Your registration helps us understand your unique care situation',
      time_estimate_minutes: 10,
      link_path: '/registration/family',
      icon_name: 'ClipboardCheck',
      completed: false,
      accessible: true,
      prerequisites: [],
      isInteractive: true,
      buttonText: 'Continue'
    },
    {
      id: 'dummy-3',
      step_number: 3,
      title: 'Complete Initial Care Assessment',
      description: 'Help us understand your care needs better',
      category: 'foundation',
      is_optional: false,
      tooltip_content: 'Help us understand the specific care needs',
      detailed_explanation: 'This assessment ensures we match you with the right caregivers',
      time_estimate_minutes: 15,
      link_path: '/family/care-assessment',
      icon_name: 'ClipboardList',
      completed: false,
      accessible: true,
      prerequisites: [],
      isInteractive: true,
      buttonText: 'Start'
    },
    {
      id: 'dummy-4',
      step_number: 4,
      title: 'Complete Your Loved One\'s Legacy Story',
      description: 'Honor the voices, memories, and wisdom of those we care for',
      category: 'foundation',
      is_optional: false,
      tooltip_content: 'Share details about the person receiving care',
      detailed_explanation: 'This helps caregivers provide personalized, compassionate care',
      time_estimate_minutes: 15,
      link_path: '/family/story',
      icon_name: 'Heart',
      completed: false,
      accessible: true,
      prerequisites: [],
      isInteractive: true,
      buttonText: 'Begin'
    }
  ];

  const dummyPaths: JourneyPath[] = [
    {
      id: 'dummy-path-1',
      path_name: 'Quick Start Path',
      path_description: 'Get matched with a caregiver in 24-48 hours',
      step_ids: [1, 2, 3, 4],
      path_color: '#10B981',
      is_recommended: true
    }
  ];

  return { steps: dummySteps, paths: dummyPaths };
};

const generateStages = (steps: JourneyStep[], currentStage: string): JourneyStage[] => {
  return [
    {
      id: 'registration',
      name: 'Registration',
      description: 'Complete your family profile',
      completed: steps.filter(s => s.category === 'foundation' && s.step_number <= 2).every(s => s.completed),
      current: currentStage === 'foundation',
      progress: steps.filter(s => s.category === 'foundation' && s.step_number <= 2 && s.completed).length / 2 * 100
    },
    {
      id: 'assessment',
      name: 'Assessment',
      description: 'Tell us about your care needs',
      completed: steps.filter(s => s.step_number >= 3 && s.step_number <= 4).every(s => s.completed),
      current: currentStage === 'foundation' && steps.find(s => s.step_number === 2)?.completed,
      progress: steps.filter(s => s.step_number >= 3 && s.step_number <= 4 && s.completed).length / 2 * 100
    },
    {
      id: 'matching',
      name: 'Matching',
      description: 'Find your perfect caregiver',
      completed: currentStage !== 'foundation',
      current: currentStage === 'scheduling',
      progress: currentStage === 'foundation' ? 0 : 100
    }
  ];
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
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  const [currentStage, setCurrentStage] = useState<'foundation' | 'scheduling' | 'trial' | 'conversion'>('foundation');
  const [careModel, setCareModel] = useState<string | null>(null);
  const [trialCompleted, setTrialCompleted] = useState(false);
  const [visitStatus, setVisitStatus] = useState<string>('not_started');
  const [visitDetails, setVisitDetails] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isAnonymous = !user;

  // Function to trigger a refresh of journey data
  const refreshProgress = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const onVisitScheduled = () => {
    refreshProgress();
  };

  const onVisitCancelled = () => {
    refreshProgress();
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
    if (step.step_number === 5) {
      // For caregiver matches, show modal
      setShowCaregiverMatchingModal(true);
    } else {
      setShowLeadCaptureModal(true);
    }
  };

  // Helper function to determine step accessibility
  const determineStepAccessibility = (stepNumber: number, completedSteps: Set<number>, profileData: any, visitBookingData: any) => {
    switch (stepNumber) {
      case 1: // Create account - always accessible
        return true;
      case 2: // Complete registration - accessible after account creation
        return true;
      case 5: // Care assessment - accessible after registration (step 2)
        return completedSteps.has(2);
      case 6: // Legacy story - accessible after registration (step 2)
        return completedSteps.has(2);
      case 7: // Caregiver matches - accessible after registration (step 2) AND care assessment (step 5) OR legacy story (step 6)
        return completedSteps.has(2) && (completedSteps.has(5) || completedSteps.has(6));
      case 8: // Medication management - accessible after caregiver matches (step 7)
        return completedSteps.has(7);
      case 9: // Meal management - accessible after caregiver matches (step 7)
        return completedSteps.has(7);
      case 10: // Schedule initial visit - accessible after caregiver matches (step 7)
        return completedSteps.has(7);
      case 11: // Schedule trial - need step 10 completed (admin has scheduled visit)
        const hasAdminScheduledVisit = visitBookingData || 
          (profileData?.visit_scheduling_status && 
           ['scheduled', 'completed'].includes(profileData.visit_scheduling_status));
        return hasAdminScheduledVisit;
      case 12: // Pay for trial - need step 11 completed
        return completedSteps.has(11);
      case 13: // Begin trial - need step 12 completed
        return completedSteps.has(12);
      case 14: // Choose path - accessible after visit scheduled (step 10)
        const hasVisitScheduled = visitBookingData || 
          (profileData?.visit_scheduling_status && 
           ['scheduled', 'completed'].includes(profileData.visit_scheduling_status));
        return hasVisitScheduled;
      default:
        return true;
    }
  };

  // Enhanced helper function to extract visit details from various sources
  const extractVisitDetails = (profile: any, visitBooking: any) => {
    let details = null;

    // First priority: visit_bookings table (most reliable source)
    if (visitBooking && visitBooking.status !== 'cancelled') {
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

    // Second priority: visit_notes in profile (only if not cancelled)
    if (!details && profile?.visit_notes && profile?.visit_scheduling_status !== 'cancelled') {
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

    // Third priority: profile fields (only if not cancelled)
    if (!details && profile?.visit_scheduled_date && profile?.visit_scheduling_status !== 'cancelled') {
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
      
      console.log('DEBUG: Journey Progress - Fetching data for user ID:', user.id);
      
      // Fetch user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('DEBUG: Error fetching profile:', profileError);
      } else {
        console.log('DEBUG: Profile data found:', profile);
      }
      
      // Fetch active (non-cancelled) visit bookings for this user
      const { data: visitBookings } = await supabase
        .from('visit_bookings')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
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
      } else if (profile?.visit_scheduling_status && profile.visit_scheduling_status !== 'cancelled') {
        currentVisitStatus = profile.visit_scheduling_status;
      }
      setVisitStatus(currentVisitStatus);
      
      // Fetch actual data for step completion checks
      const { data: registrationData, error: regError } = await supabase
        .from('chatbot_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'family')
        .eq('section_status', 'completed')
        .maybeSingle();
      
      console.log('DEBUG: Registration/chatbot data:', registrationData, 'Error:', regError);
      
      const { data: careNeedsData, error: careNeedsError } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
      
      console.log('DEBUG: Care needs data:', careNeedsData, 'Error:', careNeedsError);
      
      const { data: careRecipientData, error: careRecipientError } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      console.log('DEBUG: Care recipient data:', careRecipientData, 'Error:', careRecipientError);
      
      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);
      setCarePlans(carePlansData || []);
      
      console.log('DEBUG: Care plans data:', carePlansData);
      
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
        // First, calculate which steps are completed
        const completedStepsSet = new Set<number>();
        
        journeySteps.forEach(step => {
          let isCompleted = false;
          
          // Enhanced step completion logic using actual data
          switch (step.step_number) {
            case 1: // Account creation - just check if user exists
              isCompleted = !!user;
              console.log('DEBUG: Step 1 (Account) completion:', isCompleted);
              break;
            case 2: // Complete registration - check for ACTUAL profile data completion
              // Check for essential family registration fields that indicate form completion
              const hasEssentialProfileData = profile && 
                profile.care_recipient_name && 
                profile.relationship && 
                (profile.care_types && profile.care_types.length > 0);
              
              // Also check for chatbot completion as fallback
              const hasChatbotCompletion = registrationData || careNeedsData;
              
              // Mark complete if either the profile form was filled out OR chatbot was completed
              isCompleted = !!(hasEssentialProfileData || hasChatbotCompletion);
              console.log('DEBUG: Step 2 (Registration) completion:', isCompleted, {
                hasEssentialProfileData,
                hasChatbotCompletion,
                profileFields: {
                  care_recipient_name: profile?.care_recipient_name,
                  relationship: profile?.relationship,
                  care_types: profile?.care_types
                }
              });
              break;
            case 5: // Care assessment (step 5 in database)
              isCompleted = !!careNeedsData;
              console.log('DEBUG: Step 5 (Care Assessment) completion:', isCompleted);
              break;
            case 6: // Legacy story / Care recipient profile (step 6 in database)
              isCompleted = !!(careRecipientData && careRecipientData.full_name);
              console.log('DEBUG: Step 6 (Legacy Story) completion:', isCompleted, {
                careRecipientData,
                hasFullName: careRecipientData?.full_name
              });
              break;
            case 7: // View caregiver matches (step 7 in database)
              isCompleted = false; // This can only be marked complete by user action
              console.log('DEBUG: Step 7 (Caregiver Matches) completion:', isCompleted);
              break;
            case 8: // Medication management
              isCompleted = !!(medicationsData && medicationsData.length > 0);
              console.log('DEBUG: Step 8 (Medications) completion:', isCompleted);
              break;
            case 9: // Meal management
              isCompleted = !!(mealPlansData && mealPlansData.length > 0);
              console.log('DEBUG: Step 9 (Meal Plans) completion:', isCompleted);
              break;
            case 10: // Schedule initial visit - completed when admin has scheduled
              isCompleted = !!latestVisitBooking || 
                          (profile?.visit_scheduling_status === 'scheduled' || 
                           profile?.visit_scheduling_status === 'completed');
              console.log('DEBUG: Step 10 (Schedule Visit) completion:', isCompleted);
              break;
            case 11: // Schedule trial day
              isCompleted = hasTrialPayment;
              console.log('DEBUG: Step 11 (Schedule Trial) completion:', isCompleted);
              break;
            case 12: // Pay for trial day
              isCompleted = hasTrialPayment;
              console.log('DEBUG: Step 12 (Pay Trial) completion:', isCompleted);
              break;
            case 13: // Begin trial
              isCompleted = hasTrialPayment;
              console.log('DEBUG: Step 13 (Begin Trial) completion:', isCompleted);
              break;
            case 14: // Rate & choose path
              isCompleted = !!profile?.visit_notes && JSON.parse(profile.visit_notes || '{}')?.care_model;
              console.log('DEBUG: Step 14 (Choose Path) completion:', isCompleted);
              break;
            default:
              isCompleted = false;
          }
          
          if (isCompleted) {
            completedStepsSet.add(step.step_number);
          }
        });
        
        console.log('DEBUG: Completed steps set:', Array.from(completedStepsSet));
        
        // Now process steps with completion and accessibility
        const updatedSteps = journeySteps.map(step => {
          const stepCategory = validateCategory(step.category);
          const isCompleted = completedStepsSet.has(step.step_number);
          const isAccessible = determineStepAccessibility(step.step_number, completedStepsSet, profile, latestVisitBooking);
          
          console.log(`DEBUG: Step ${step.step_number} - Completed: ${isCompleted}, Accessible: ${isAccessible}`);
          
          const processedStep: JourneyStep = {
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
            isInteractive: !isCompleted,
            buttonText: isCompleted ? 'Completed' : 'Continue',
            action: step.step_number === 10 && extractedVisitDetails ? 
              () => setShowCancelVisitModal(true) : 
              () => handleStepAction(processedStep),
            cancelAction: step.step_number === 10 && extractedVisitDetails ? 
              () => setShowCancelVisitModal(true) : 
              undefined
          };
          
          return processedStep;
        });
        
        // Update steps with actions
        const stepsWithActions = updatedSteps.map(step => ({
          ...step,
          action: () => handleStepAction(step)
        }));
        
        setSteps(stepsWithActions);
        
        // Convert journey paths step_ids from JSON to number array
        const convertedPaths = (journeyPaths || []).map(path => ({
          ...path,
          step_ids: Array.isArray(path.step_ids) ? path.step_ids : JSON.parse(path.step_ids as string)
        }));
        setPaths(convertedPaths);
        
        // Determine current stage
        const completedCount = updatedSteps.filter(s => s.completed).length;
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
      console.error("Error fetching journey data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepAction = (step: JourneyStep) => {
    if (!step.accessible && !isAnonymous) return;
    
    // Track the action
    if (!isAnonymous) {
      trackStepAction(step.id, 'step_action_clicked');
    }
    
    // Handle specific step actions based on step number and completion status
    switch (step.step_number) {
      case 1: // Account creation/profile edit
        navigate('/profile/edit');
        return;
      case 2: // Complete registration
        navigate('/registration/family');
        return;
      case 5: // Care assessment (step 5 in database)
        // If data exists, edit existing; otherwise create new
        if (step.completed) {
          navigate('/family/care-assessment?mode=edit');
        } else {
          navigate('/family/care-assessment');
        }
        return;
      case 6: // Legacy story (step 6 in database)
        // If data exists, edit existing; otherwise create new
        if (step.completed) {
          navigate('/family/story?mode=edit');
        } else {
          navigate('/family/story');
        }
        return;
      case 7: // Caregiver matches (step 7 in database)
        setShowCaregiverMatchingModal(true);
        return;
      case 8: // Medication management
        if (carePlans.length > 0) {
          navigate(`/family/care-management/${carePlans[0].id}/medications`);
        } else {
          navigate('/family/care-management/create');
        }
        return;
      case 9: // Meal management
        if (carePlans.length > 0) {
          navigate(`/family/care-management/${carePlans[0].id}/meals`);
        } else {
          navigate('/family/care-management/create');
        }
        return;
      case 10: // Schedule visit
        setShowScheduleModal(true);
        return;
      default:
        // For other steps, use the link_path if available
        if (step.link_path) {
          navigate(step.link_path);
        }
    }
  };

  // Calculate completion percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const overallProgress = completionPercentage;

  // Find next step
  const nextStep = steps.find(step => !step.completed && step.accessible);

  // Generate stages based on current data
  const stages = generateStages(steps, currentStage);

  return {
    steps,
    stages,
    paths,
    completionPercentage,
    overallProgress,
    nextStep,
    completedSteps,
    totalSteps,
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
    onVisitCancelled,
    refreshProgress
  };
};
