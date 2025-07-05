
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

export const useEnhancedJourneyProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [careAssessment, setCareAssessment] = useState<any>(null);
  const [careRecipient, setCareRecipient] = useState<any>(null);
  const [visitDetails, setVisitDetails] = useState<any>(null);
  const [trialPayments, setTrialPayments] = useState<any[]>([]);
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInternalScheduleModal, setShowInternalScheduleModal] = useState(false);
  const [showCancelVisitModal, setShowCancelVisitModal] = useState(false);
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  const [showLeadCaptureModal, setShowLeadCaptureModal] = useState(false);

  // Generate mock steps for anonymous users (now includes all 12 steps)
  const generateMockStepsForAnonymous = () => {
    return [
      {
        id: "1",
        step_number: 1,
        title: "Complete Your Profile",
        description: "Add your contact information and care preferences",
        completed: true,
        accessible: true,
        category: 'foundation',
        icon_name: 'User',
        tooltip_content: 'Complete your family registration form',
        detailed_explanation: 'Fill out care needs, schedule, and preferences',
        time_estimate_minutes: 15,
        is_optional: false,
        action: () => {}
      },
      {
        id: "2",
        step_number: 2,
        title: "Complete Initial Care Assessment",
        description: "Help us understand your care needs better",
        completed: false,
        accessible: true,
        category: 'foundation',
        icon_name: 'FileCheck',
        tooltip_content: 'Complete detailed care assessment',
        detailed_explanation: 'Provide detailed information about care needs',
        time_estimate_minutes: 20,
        is_optional: false,
        action: () => {}
      },
      {
        id: "3",
        step_number: 3,
        title: "Complete Your Loved One's Legacy Story",
        description: "Honor the voices, memories, and wisdom of those we care for",
        completed: false,
        accessible: true,
        category: 'foundation',
        icon_name: 'Heart',
        tooltip_content: 'Share your loved one\'s story',
        detailed_explanation: 'Add personal details about your care recipient',
        time_estimate_minutes: 10,
        is_optional: true,
        action: () => {}
      },
      {
        id: "4",
        step_number: 4,
        title: "See Your Instant Caregiver Matches",
        description: "Unlock personalized caregiver recommendations",
        completed: false,
        accessible: false,
        category: 'foundation',
        icon_name: 'Users',
        tooltip_content: 'Browse matched caregivers',
        detailed_explanation: 'View and connect with potential caregivers',
        time_estimate_minutes: 30,
        is_optional: false,
        action: () => {}
      },
      {
        id: "5",
        step_number: 5,
        title: "Set Up Medication Management",
        description: "Add medications and set up schedules",
        completed: false,
        accessible: true,
        category: 'foundation',
        icon_name: 'Pill',
        tooltip_content: 'Manage medications for your care plan',
        detailed_explanation: 'Set up medication schedules and tracking',
        time_estimate_minutes: 15,
        is_optional: false,
        action: () => {}
      },
      {
        id: "6",
        step_number: 6,
        title: "Set Up Meal Management",
        description: "Plan meals and create grocery lists",
        completed: false,
        accessible: true,
        category: 'foundation',
        icon_name: 'Utensils',
        tooltip_content: 'Plan meals for your care plan',
        detailed_explanation: 'Set up meal planning and grocery management',
        time_estimate_minutes: 15,
        is_optional: false,
        action: () => {}
      },
      {
        id: "7",
        step_number: 7,
        title: "Schedule Your Tavara.Care Visit",
        description: "Meet your match and care coordinator virtually or in person",
        completed: false,
        accessible: true,
        category: 'scheduling',
        icon_name: 'Calendar',
        tooltip_content: 'Schedule your care assessment visit',
        detailed_explanation: 'Book a visit from our care coordinators',
        time_estimate_minutes: 10,
        is_optional: false,
        action: () => {}
      },
      {
        id: "8",
        step_number: 8,
        title: "Confirm Your Visit",
        description: "Your visit has been scheduled and confirmed",
        completed: false,
        accessible: false,
        category: 'scheduling',
        icon_name: 'CheckCircle',
        tooltip_content: 'Visit confirmation completed',
        detailed_explanation: 'Your care coordinator visit is confirmed',
        time_estimate_minutes: 0,
        is_optional: false,
        action: () => {}
      },
      {
        id: "9",
        step_number: 9,
        title: "Schedule Trial Day (Optional)",
        description: "Choose a trial date with your matched caregiver",
        completed: false,
        accessible: false,
        category: 'trial',
        icon_name: 'Calendar',
        tooltip_content: 'Schedule optional trial with caregiver',
        detailed_explanation: 'Optional step before choosing your care model',
        time_estimate_minutes: 15,
        is_optional: true,
        action: () => {}
      },
      {
        id: "10",
        step_number: 10,
        title: "Pay for Trial Day (Optional)",
        description: "Pay a one-time fee of $320 TTD for an 8-hour caregiver experience",
        completed: false,
        accessible: false,
        category: 'trial',
        icon_name: 'CreditCard',
        tooltip_content: 'Complete trial payment',
        detailed_explanation: 'Pay for your optional trial day',
        time_estimate_minutes: 5,
        is_optional: true,
        action: () => {}
      },
      {
        id: "11",
        step_number: 11,
        title: "Begin Your Trial (Optional)",
        description: "Your caregiver begins the scheduled trial session",
        completed: false,
        accessible: false,
        category: 'trial',
        icon_name: 'Play',
        tooltip_content: 'Start your trial experience',
        detailed_explanation: 'Begin your trial with the matched caregiver',
        time_estimate_minutes: 480,
        is_optional: true,
        action: () => {}
      },
      {
        id: "12",
        step_number: 12,
        title: "Rate & Choose Your Path",
        description: "Decide between: Hire your caregiver ($40/hr) or Subscribe to Tavara ($45/hr)",
        completed: false,
        accessible: false,
        category: 'conversion',
        icon_name: 'Star',
        tooltip_content: 'Choose your care model',
        detailed_explanation: 'Select your preferred care arrangement',
        time_estimate_minutes: 10,
        is_optional: false,
        action: () => {}
      }
    ];
  };

  const fetchUserData = async () => {
    // Handle anonymous users immediately
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
        console.log('Profile data loaded:', profileData);
      }

      // Fetch care plans
      const { data: carePlansData, error: carePlansError } = await supabase
        .from('care_plans')
        .select('*')
        .eq('family_id', user.id);

      if (carePlansError) {
        console.error('Error fetching care plans:', carePlansError);
      } else {
        setCarePlans(carePlansData || []);
      }

      // Fetch care assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('care_needs_family')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (assessmentError) {
        console.error('Error fetching care assessment:', assessmentError);
      } else {
        setCareAssessment(assessmentData);
      }

      // Fetch care recipient
      const { data: recipientData, error: recipientError } = await supabase
        .from('care_recipient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (recipientError) {
        console.error('Error fetching care recipient:', recipientError);
      } else {
        setCareRecipient(recipientData);
      }

      // Fetch visit details
      const { data: visitData, error: visitError } = await supabase
        .from('visit_bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_cancelled', false)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (visitError) {
        console.error('Error fetching visit details:', visitError);
      } else {
        setVisitDetails(visitData);
      }

      // Fetch trial payments
      const { data: trialPaymentsData, error: trialPaymentsError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'trial_day')
        .eq('status', 'completed');

      if (trialPaymentsError) {
        console.error('Error fetching trial payments:', trialPaymentsError);
      } else {
        setTrialPayments(trialPaymentsData || []);
      }

    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  // Enhanced registration completion logic using correct database field names
  const calculateRegistrationCompletion = () => {
    if (!profile || !user) {
      console.log('Registration completion: No profile data');
      return false;
    }

    // Core required fields (must have all)
    const requiredFields = {
      full_name: profile.full_name,
      phone_number: profile.phone_number,
      address: profile.address,
      care_recipient_name: profile.care_recipient_name,
      relationship: profile.relationship
    };

    const hasAllRequiredFields = Object.entries(requiredFields).every(([field, value]) => {
      const hasValue = !!(value && String(value).trim());
      if (!hasValue) {
        console.log(`Registration completion: Missing required field ${field}`);
      }
      return hasValue;
    });

    // Enhanced completion indicators (at least one should be present for comprehensive registration)
    const enhancedFields = {
      care_types: profile.care_types && Array.isArray(profile.care_types) && profile.care_types.length > 0,
      care_schedule: profile.care_schedule && String(profile.care_schedule).trim(),
      budget_preferences: profile.budget_preferences && String(profile.budget_preferences).trim(),
      caregiver_type: profile.caregiver_type && String(profile.caregiver_type).trim()
    };

    const hasEnhancedData = Object.values(enhancedFields).some(Boolean);

    console.log('Registration completion check:', {
      hasAllRequiredFields,
      hasEnhancedData,
      requiredFields,
      enhancedFields,
      finalResult: hasAllRequiredFields && hasEnhancedData
    });

    // Registration is complete if has all required fields AND at least some enhanced data
    return hasAllRequiredFields && hasEnhancedData;
  };

  // Calculate if caregiver matches are accessible
  const calculateCaregiverMatchesAccessible = () => {
    if (!user) return false;
    
    const registrationComplete = calculateRegistrationCompletion();
    const hasAssessment = !!careAssessment?.id;
    
    console.log('Caregiver matches accessibility:', {
      registrationComplete,
      hasAssessment,
      accessible: registrationComplete && hasAssessment
    });
    
    return registrationComplete && hasAssessment;
  };

  // Calculate if trial steps are accessible
  const calculateTrialAccessible = () => {
    return !!visitDetails?.id && visitDetails?.status === 'confirmed';
  };

  // Calculate completion status for each step
  const calculateSteps = () => {
    // Return mock steps for anonymous users
    if (!user) {
      return generateMockStepsForAnonymous();
    }

    if (!profile) return [];

    console.log('Calculating steps with profile:', profile);

    // Parse visit notes for care model
    let visitNotes = null;
    try {
      visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
    } catch (error) {
      console.error('Error parsing visit notes:', error);
    }

    const hasTrialPayment = trialPayments && trialPayments.length > 0;
    const isTrialAccessible = calculateTrialAccessible();
    const isVisitScheduled = !!visitDetails?.id;
    const isVisitConfirmed = visitDetails?.status === 'confirmed';

    const steps = [
      {
        id: "1",
        step_number: 1,
        title: "Complete Your Profile",
        description: "Add your contact information and care preferences",
        completed: calculateRegistrationCompletion(),
        accessible: true,
        category: 'foundation',
        icon_name: 'User',
        tooltip_content: 'Complete your family registration form',
        detailed_explanation: 'Fill out care needs, schedule, and preferences',
        time_estimate_minutes: 15,
        is_optional: false,
        action: () => {
          const isCompleted = calculateRegistrationCompletion();
          navigate(isCompleted ? '/registration/family?edit=true' : '/registration/family');
        }
      },
      {
        id: "2",
        step_number: 2,
        title: "Complete Initial Care Assessment",
        description: "Help us understand your care needs better",
        completed: !!careAssessment?.id,
        accessible: true,
        category: 'foundation',
        icon_name: 'FileCheck',
        tooltip_content: 'Complete detailed care assessment',
        detailed_explanation: 'Provide detailed information about care needs',
        time_estimate_minutes: 20,
        is_optional: false,
        action: () => {
          const isCompleted = !!careAssessment?.id;
          navigate(isCompleted ? '/family/care-assessment?mode=edit' : '/family/care-assessment');
        }
      },
      {
        id: "3",
        step_number: 3,
        title: "Complete Your Loved One's Legacy Story",
        description: "Honor the voices, memories, and wisdom of those we care for",
        completed: !!(careRecipient?.id && careRecipient?.full_name),
        accessible: true,
        category: 'foundation',
        icon_name: 'Heart',
        tooltip_content: 'Share your loved one\'s story',
        detailed_explanation: 'Add personal details about your care recipient',
        time_estimate_minutes: 10,
        is_optional: true,
        action: () => navigate('/family/story')
      },
      {
        id: "4",
        step_number: 4,
        title: "See Your Instant Caregiver Matches",
        description: "Unlock personalized caregiver recommendations",
        completed: false,
        accessible: calculateCaregiverMatchesAccessible(),
        category: 'foundation',
        icon_name: 'Users',
        tooltip_content: 'Browse matched caregivers',
        detailed_explanation: 'View and connect with potential caregivers',
        time_estimate_minutes: 30,
        is_optional: false,
        action: () => setShowCaregiverMatchingModal(true)
      },
      {
        id: "5",
        step_number: 5,
        title: "Set Up Medication Management",
        description: "Add medications and set up schedules",
        completed: !!(carePlans && carePlans.length > 0), // Simplified for now
        accessible: true,
        category: 'foundation',
        icon_name: 'Pill',
        tooltip_content: 'Manage medications for your care plan',
        detailed_explanation: 'Set up medication schedules and tracking',
        time_estimate_minutes: 15,
        is_optional: false,
        action: () => navigate('/family/medication-management')
      },
      {
        id: "6",
        step_number: 6,
        title: "Set Up Meal Management",
        description: "Plan meals and create grocery lists",
        completed: !!(carePlans && carePlans.length > 0), // Simplified for now
        accessible: true,
        category: 'foundation',
        icon_name: 'Utensils',
        tooltip_content: 'Plan meals for your care plan',
        detailed_explanation: 'Set up meal planning and grocery management',
        time_estimate_minutes: 15,
        is_optional: false,
        action: () => navigate('/family/meal-management')
      },
      {
        id: "7",
        step_number: 7,
        title: "Schedule Your Tavara.Care Visit",
        description: "Meet your match and care coordinator virtually or in person",
        completed: isVisitScheduled,
        accessible: true,
        category: 'scheduling',
        icon_name: 'Calendar',
        tooltip_content: 'Schedule your care assessment visit',
        detailed_explanation: 'Book a visit from our care coordinators',
        time_estimate_minutes: 10,
        is_optional: false,
        action: () => {
          if (visitDetails?.id) {
            setShowCancelVisitModal(true);
          } else {
            setShowScheduleModal(true);
          }
        }
      },
      {
        id: "8",
        step_number: 8,
        title: "Confirm Your Visit",
        description: "Your visit has been scheduled and confirmed",
        completed: isVisitConfirmed,
        accessible: isVisitScheduled,
        category: 'scheduling',
        icon_name: 'CheckCircle',
        tooltip_content: 'Visit confirmation completed',
        detailed_explanation: 'Your care coordinator visit is confirmed',
        time_estimate_minutes: 0,
        is_optional: false,
        action: () => {
          toast.info("Visit confirmation will be completed by our care coordinators");
        }
      },
      {
        id: "9",
        step_number: 9,
        title: "Schedule Trial Day (Optional)",
        description: "Choose a trial date with your matched caregiver",
        completed: hasTrialPayment,
        accessible: isVisitConfirmed,
        category: 'trial',
        icon_name: 'Calendar',
        tooltip_content: 'Schedule optional trial with caregiver',
        detailed_explanation: 'Optional step before choosing your care model',
        time_estimate_minutes: 15,
        is_optional: true,
        action: () => {
          toast.info("Trial scheduling will be available after your visit is confirmed");
        }
      },
      {
        id: "10",
        step_number: 10,
        title: "Pay for Trial Day (Optional)",
        description: "Pay a one-time fee of $320 TTD for an 8-hour caregiver experience",
        completed: hasTrialPayment,
        accessible: isVisitConfirmed,
        category: 'trial',
        icon_name: 'CreditCard',
        tooltip_content: 'Complete trial payment',
        detailed_explanation: 'Pay for your optional trial day',
        time_estimate_minutes: 5,
        is_optional: true,
        action: () => {
          toast.info("Trial payment will be available after scheduling");
        }
      },
      {
        id: "11",
        step_number: 11,
        title: "Begin Your Trial (Optional)",
        description: "Your caregiver begins the scheduled trial session",
        completed: hasTrialPayment,
        accessible: hasTrialPayment,
        category: 'trial',
        icon_name: 'Play',
        tooltip_content: 'Start your trial experience',
        detailed_explanation: 'Begin your trial with the matched caregiver',
        time_estimate_minutes: 480,
        is_optional: true,
        action: () => {
          toast.info("Trial will begin on your scheduled date");
        }
      },
      {
        id: "12",
        step_number: 12,
        title: "Rate & Choose Your Path",
        description: "Decide between: Hire your caregiver ($40/hr) or Subscribe to Tavara ($45/hr)",
        completed: !!visitNotes?.care_model,
        accessible: isVisitConfirmed || hasTrialPayment,
        category: 'conversion',
        icon_name: 'Star',
        tooltip_content: 'Choose your care model',
        detailed_explanation: 'Select your preferred care arrangement',
        time_estimate_minutes: 10,
        is_optional: false,
        action: () => {
          toast.info("Care model selection will be available after your visit or trial");
        }
      }
    ];

    return steps;
  };

  const steps_calculated = calculateSteps();
  const completedSteps = steps_calculated.filter(step => step.completed).length;
  const totalSteps = steps_calculated.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const nextStep = steps_calculated.find(step => !step.completed && step.accessible);
  const currentStage = 'foundation'; // Default stage

  // Create paths with proper JourneyPath interface properties
  const paths = [
    { 
      id: 'foundation', 
      name: 'Foundation', 
      path_name: 'Foundation',
      path_description: 'Set up your profile and care needs',
      step_ids: steps_calculated.filter(s => s.category === 'foundation').map(s => parseInt(s.id)),
      path_color: 'blue',
      is_recommended: true,
      steps: steps_calculated.filter(s => s.category === 'foundation') 
    },
    { 
      id: 'scheduling', 
      name: 'Scheduling', 
      path_name: 'Scheduling',
      path_description: 'Meet your care team and coordinate services',
      step_ids: steps_calculated.filter(s => s.category === 'scheduling').map(s => parseInt(s.id)),
      path_color: 'green',
      is_recommended: false,
      steps: steps_calculated.filter(s => s.category === 'scheduling') 
    },
    { 
      id: 'trial', 
      name: 'Trial', 
      path_name: 'Trial',
      path_description: 'Optional trial experience with caregivers',
      step_ids: steps_calculated.filter(s => s.category === 'trial').map(s => parseInt(s.id)),
      path_color: 'purple',
      is_recommended: false,
      steps: steps_calculated.filter(s => s.category === 'trial') 
    },
    { 
      id: 'conversion', 
      name: 'Conversion', 
      path_name: 'Conversion',
      path_description: 'Choose your care model and begin service',
      step_ids: steps_calculated.filter(s => s.category === 'conversion').map(s => parseInt(s.id)),
      path_color: 'orange',
      is_recommended: false,
      steps: steps_calculated.filter(s => s.category === 'conversion') 
    }
  ];

  const onVisitScheduled = () => {
    setShowScheduleModal(false);
    setShowInternalScheduleModal(false);
    toast.success('Visit scheduled successfully!');
    if (user) {
      fetchUserData(); // Only refresh data for authenticated users
    }
  };

  const onVisitCancelled = () => {
    setVisitDetails(null);
    setShowCancelVisitModal(false);
    toast.success('Visit cancelled successfully');
    if (user) {
      fetchUserData(); // Only refresh data for authenticated users
    }
  };

  const trackStepAction = (stepId: string, action: string) => {
    console.log(`Step ${stepId} action: ${action}`);
  };

  const isAnonymous = !user;

  return {
    loading,
    steps: steps_calculated,
    paths,
    profile,
    carePlans,
    careAssessment,
    careRecipient,
    visitDetails,
    completionPercentage,
    nextStep,
    currentStage,
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
    onVisitScheduled,
    onVisitCancelled,
    trackStepAction,
    isAnonymous,
    refreshData: fetchUserData
  };
};
