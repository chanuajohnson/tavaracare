import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import { useStoredJourneyProgress } from './useStoredJourneyProgress';
import { useSharedFamilyJourneyData } from './useSharedFamilyJourneyData';

export const useEnhancedJourneyProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is anonymous early
  const isAnonymous = !user?.id;
  
  // Use stored progress as primary source (like admin dashboard) - only if not anonymous
  const storedProgress = useStoredJourneyProgress(
    isAnonymous ? '' : (user?.id || ''), 
    isAnonymous ? 'family' : (user?.user_metadata?.role || 'family')
  );
  const sharedJourneyData = useSharedFamilyJourneyData(isAnonymous ? '' : (user?.id || ''));
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [careAssessment, setCareAssessment] = useState<any>(null);
  const [careRecipient, setCareRecipient] = useState<any>(null);
  const [visitDetails, setVisitDetails] = useState<any>(null);
  const [trialPayments, setTrialPayments] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<{ agreedRate?: string; weeklyHours?: number; projectedWeeklyCost?: number }>({});
  const [journeyProgress, setJourneyProgress] = useState<any>(null);
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInternalScheduleModal, setShowInternalScheduleModal] = useState(false);
  const [showCancelVisitModal, setShowCancelVisitModal] = useState(false);
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  const [showLeadCaptureModal, setShowLeadCaptureModal] = useState(false);

  // Generate mock steps for anonymous users (now includes all 15 steps)
  const generateMockStepsForAnonymous = () => {
    return [
      { id: "1", step_number: 1, title: "Complete Your Profile", description: "Add your contact information and care preferences", completed: true, accessible: true, category: 'foundation', icon_name: 'User', tooltip_content: 'Complete your family registration form', detailed_explanation: 'Fill out care needs, schedule, and preferences', time_estimate_minutes: 15, is_optional: false, action: () => {} },
      { id: "2", step_number: 2, title: "Complete Initial Care Assessment", description: "Help us understand your care needs better", completed: false, accessible: true, category: 'foundation', icon_name: 'FileCheck', tooltip_content: 'Complete detailed care assessment', detailed_explanation: 'Provide detailed information about care needs', time_estimate_minutes: 20, is_optional: false, action: () => {} },
      { id: "3", step_number: 3, title: "Complete Your Loved One's Legacy Story", description: "Honor the voices, memories, and wisdom of those we care for", completed: false, accessible: true, category: 'foundation', icon_name: 'Heart', tooltip_content: "Share your loved one's story", detailed_explanation: 'Add personal details about your care recipient', time_estimate_minutes: 10, is_optional: true, action: () => {} },
      { id: "4", step_number: 4, title: "See Your Instant Caregiver Matches", description: "Unlock personalized caregiver recommendations", completed: false, accessible: false, category: 'foundation', icon_name: 'Users', tooltip_content: 'Browse matched caregivers', detailed_explanation: 'View and connect with potential caregivers', time_estimate_minutes: 30, is_optional: false, action: () => {} },
      { id: "5", step_number: 5, title: "Set Up Medication Management", description: "Add medications and set up schedules", completed: false, accessible: true, category: 'foundation', icon_name: 'Pill', tooltip_content: 'Manage medications for your care plan', detailed_explanation: 'Set up medication schedules and tracking', time_estimate_minutes: 15, is_optional: false, action: () => {} },
      { id: "6", step_number: 6, title: "Set Up Meal Management", description: "Plan meals and create grocery lists", completed: false, accessible: true, category: 'foundation', icon_name: 'Utensils', tooltip_content: 'Plan meals for your care plan', detailed_explanation: 'Set up meal planning and grocery management', time_estimate_minutes: 15, is_optional: false, action: () => {} },
      { id: "7", step_number: 7, title: "Get Started with Care", description: "Begin your care journey with a scheduled visit from our care coordinators", completed: false, accessible: true, category: 'foundation', icon_name: 'Calendar', tooltip_content: 'Schedule your care assessment visit', detailed_explanation: 'Book a visit from our care coordinators', time_estimate_minutes: 10, is_optional: false, action: () => {} },
      { id: "8", step_number: 8, title: "Confirm Your Visit", description: "Your visit has been scheduled and confirmed", completed: false, accessible: false, category: 'scheduling', icon_name: 'CheckCircle', tooltip_content: 'Visit confirmation completed', detailed_explanation: 'Your care coordinator visit is confirmed', time_estimate_minutes: 0, is_optional: false, action: () => {} },
      { id: "9", step_number: 9, title: "Care Team Confirmed", description: "A care team member has been selected and coordinated for your family", completed: false, accessible: false, category: 'scheduling', icon_name: 'UserCheck', tooltip_content: 'View your care team member', detailed_explanation: 'Your care team member has been confirmed. View your care team.', time_estimate_minutes: 0, is_optional: false, action: () => {} },
      { id: "10", step_number: 10, title: "Initial Family Meeting", description: "Meet and greet with your care team member at your home", completed: false, accessible: false, category: 'scheduling', icon_name: 'Home', tooltip_content: 'Family meeting scheduled', detailed_explanation: 'Introduction visit at your home', time_estimate_minutes: 60, is_optional: false, action: () => {} },
      { id: "11", step_number: 11, title: "Care Begins", description: "Your care team begins providing support", completed: false, accessible: false, category: 'scheduling', icon_name: 'Play', tooltip_content: 'Care has started', detailed_explanation: 'View your care plan for schedules and details', time_estimate_minutes: 0, is_optional: false, action: () => {} },
      { id: "12", step_number: 12, title: "Care Readiness Assessment", description: "A home walkthrough completed by your care team during their first week", completed: false, accessible: false, category: 'care_environment', icon_name: 'Home', tooltip_content: 'Care environment assessment', detailed_explanation: 'Your care team assesses your home for sustainable caregiving', time_estimate_minutes: 0, is_optional: false, action: () => {} },
      { id: "13", step_number: 13, title: "Home Environment Optimization", description: "Guided or full care environment coordination", completed: false, accessible: false, category: 'care_environment', icon_name: 'Sparkles', tooltip_content: 'Optimize home for care', detailed_explanation: 'Prepare your home for safe, comfortable caregiving', time_estimate_minutes: 0, is_optional: true, action: () => {} },
      { id: "14", step_number: 14, title: "Schedule Trial Day (Optional)", description: "Choose a trial date with your matched caregiver", completed: false, accessible: false, category: 'trial', icon_name: 'Calendar', tooltip_content: 'Schedule optional trial with caregiver', detailed_explanation: 'Optional step before choosing your care model', time_estimate_minutes: 15, is_optional: true, action: () => {} },
      { id: "15", step_number: 15, title: "Pay for Trial Day (Optional)", description: "Complete payment for an optional 8-hour caregiver trial experience", completed: false, accessible: false, category: 'trial', icon_name: 'CreditCard', tooltip_content: 'Complete trial payment', detailed_explanation: 'Pay for your optional trial day', time_estimate_minutes: 5, is_optional: true, action: () => {} },
      { id: "16", step_number: 16, title: "Begin Your Trial (Optional)", description: "Your caregiver begins the scheduled trial session", completed: false, accessible: false, category: 'trial', icon_name: 'Play', tooltip_content: 'Start your trial experience', detailed_explanation: 'Begin your trial with the matched caregiver', time_estimate_minutes: 480, is_optional: true, action: () => {} },
      { id: "17", step_number: 17, title: "Rate & Choose Your Path", description: "Choose your care model — view subscription plans or hire directly", completed: false, accessible: false, category: 'conversion', icon_name: 'Star', tooltip_content: 'Choose your care model', detailed_explanation: 'Select your preferred care arrangement', time_estimate_minutes: 10, is_optional: false, action: () => {} }
    ];
  };

  const fetchUserData = async () => {
    // Handle anonymous users immediately
    if (isAnonymous) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch profile data directly (own profile access is allowed)
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

        // Also try to get journey progress from the dedicated table
        const { data: journeyData, error: journeyError } = await supabase
          .from('user_journey_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (journeyError) {
          console.log('❌ Error fetching journey progress data:', journeyError);
          setJourneyProgress(null);
        } else if (journeyData) {
          console.log('✅ Journey progress data loaded from database:', {
            completion_percentage: journeyData.completion_percentage,
            current_step: journeyData.current_step,
            total_steps: journeyData.total_steps,
            completed_steps: journeyData.completed_steps
          });
          
          // Check if the stored data is outdated (all zeros)
          if (journeyData.completion_percentage === 0 && journeyData.current_step <= 1) {
            console.log('⚠️ Stored progress data appears outdated, will use calculated fallback');
            setJourneyProgress(null); // Force fallback to step calculation
          } else {
            setJourneyProgress(journeyData);
          }
        } else {
          console.log('ℹ️ No journey progress data found in database, will calculate from steps');
          setJourneyProgress(null);
        }
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

      // Fetch financial/billing data from onboarding checklist
      const { data: checklistData } = await supabase
        .from('onboarding_checklists' as any)
        .select('checked_items')
        .eq('user_id', user.id)
        .eq('user_type', 'family')
        .maybeSingle();
      
      const items = (checklistData as any)?.checked_items;
      if (items?.care_rate) {
        const cr = items.care_rate;
        const rate = cr.rate || cr.hourlyRate;
        const hours = cr.weeklyHours || cr.hours || 40;
        setFinancialData({
          agreedRate: cr.label || cr.tierName || (rate ? `$${rate}/hr` : undefined),
          weeklyHours: hours,
          projectedWeeklyCost: rate && hours ? rate * hours : undefined
        });
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

  // Merge shared journey data (rich step definitions) with stored progress completion data
  const getStepsData = () => {
    // For anonymous users, return mock data immediately
    if (isAnonymous) {
      const mockSteps = generateMockStepsForAnonymous();
      return {
        steps: mockSteps,
        completionPercentage: 7,
        totalSteps: 15,
        completedSteps: 1,
        nextStep: mockSteps.find(step => !step.completed && step.accessible) || mockSteps[1],
        currentStage: 'foundation',
        loading: false
      };
    }
    
    // If we have shared journey data with rich step definitions, use those as the base
    if (!sharedJourneyData.loading && sharedJourneyData.steps && sharedJourneyData.steps.length > 0) {
      const richSteps = sharedJourneyData.steps;
      
      // If we also have stored progress data, merge the completion states
      if (!storedProgress.loading && storedProgress.steps && storedProgress.steps.length > 0) {
        console.log('✅ Merging rich step definitions with stored progress completion:', {
          richStepsCount: richSteps.length,
          storedCompletionPercentage: storedProgress.completionPercentage,
          storedCompletedSteps: storedProgress.completedSteps
        });
        
        // Create a map of completion status from stored progress
        const storedCompletionMap = new Map();
        storedProgress.steps.forEach((step, index) => {
          storedCompletionMap.set(index + 1, step.completed);
        });
        
        // Merge rich step definitions — real data-driven completion takes priority
        // over stored progress to prevent stale data from hiding CTAs
        const mergedSteps = richSteps.map(step => ({
          ...step,
          id: String(step.id),
          step_number: step.id,
          icon_name: 'User',
          tooltip_content: step.description,
          detailed_explanation: step.description,
          time_estimate_minutes: 15,
          is_optional: step.optional || false,
          accessible: step.accessible || false,
          // Use real data-driven completion (from sharedJourneyData) as source of truth
          completed: step.completed,
            action: () => {
              const isCompleted = storedCompletionMap.get(step.id) || step.completed;
              console.log(`🔘 Action triggered for step ${step.id}, completed: ${isCompleted}`);
              // Basic navigation logic based on step
              try {
                switch(step.id) {
                  case 1:
                    // Add edit parameter if step is completed to trigger prefill
                    const editParam = isCompleted ? '?edit=true' : '';
                    console.log(`🚀 Navigating to: /registration/family${editParam}`);
                    navigate(`/registration/family${editParam}`);
                    break;
                  case 2:
                    // Add edit parameter if step is completed to trigger prefill
                    const assessmentEditParam = isCompleted ? '?mode=edit' : '';
                    console.log(`🚀 Navigating to: /family/care-assessment${assessmentEditParam}`);
                    navigate(`/family/care-assessment${assessmentEditParam}`);
                    break;
                  case 3:
                    // Add edit parameter if step is completed to trigger prefill
                    const storyEditParam = isCompleted ? '?edit=true' : '';
                    console.log(`🚀 Navigating to: /family/story${storyEditParam}`);
                    navigate(`/family/story${storyEditParam}`);
                    break;
                  case 4:
                    console.log('🚀 Navigating to: /family/matching');
                    navigate('/family/matching');
                    break;
                  case 5:
                    console.log('🚀 Navigating to: /family/care-management (medications)');
                    navigate('/family/care-management');
                    break;
                  case 6:
                    console.log('🚀 Navigating to: /family/care-management (meals)');
                    navigate('/family/care-management');
                    break;
                  case 7:
                    console.log('🚀 Opening Schedule Visit modal');
                    setShowScheduleModal(true);
                    break;
                  case 8:
                    console.log('🚀 Navigating to family dashboard for visit status');
                    navigate('/dashboard/family');
                    toast.info('Check your visit status below.');
                    break;
                  case 9:
                    console.log('🚀 Navigating to care management for care team');
                    navigate('/family/care-management');
                    break;
                  case 10:
                    console.log('ℹ️ Step 10 - Initial Family Meeting awaiting admin confirmation');
                    toast.info('This step is confirmed by your care coordinator after the initial meeting takes place.');
                    break;
                  case 11:
                    console.log('🚀 Navigating to care management');
                    navigate('/family/care-management');
                    break;
                  default:
                    console.log(`No navigation defined for step ${step.id}`);
                    break;
                }
              } catch (error) {
                console.error(`❌ Navigation error for step ${step.id}:`, error);
                toast.error('Navigation failed. Please try again.');
              }
            }
        }));
        
        // Use shared journey data completion (dynamically calculated) as primary source
        const nonOptionalMerged = mergedSteps.filter(step => !step.is_optional);
        const completedNonOptional = nonOptionalMerged.filter(step => step.completed).length;
        const dynamicPercentage = nonOptionalMerged.length > 0 
          ? Math.round((completedNonOptional / nonOptionalMerged.length) * 100) 
          : sharedJourneyData.completionPercentage;
        
        return {
          steps: mergedSteps,
          completionPercentage: dynamicPercentage,
          totalSteps: nonOptionalMerged.length,
          completedSteps: completedNonOptional,
          nextStep: mergedSteps.find(step => !step.completed && step.accessible),
          currentStage: sharedJourneyData.journeyStage,
          loading: false
        };
      }
      
      // Use shared journey data directly if no stored progress
      console.log('📋 Using shared journey data directly:', {
        totalSteps: richSteps.length,
        completionPercentage: sharedJourneyData.completionPercentage
      });
      
      // Add required properties to rich steps for components
      const enhancedRichSteps = richSteps.map(step => ({
        ...step,
        id: String(step.id),
        step_number: step.id,
        icon_name: 'User',
        tooltip_content: step.description,
        detailed_explanation: step.description,
        time_estimate_minutes: 15,
        is_optional: step.optional || false,
        accessible: step.accessible || false,
        action: () => {
          console.log(`🔘 Action triggered for step ${step.id}, completed: ${step.completed}`);
          // Basic navigation logic based on step
          try {
            switch(step.id) {
              case 1:
                // Add edit parameter if step is completed to trigger prefill
                const editParam = step.completed ? '?edit=true' : '';
                console.log(`🚀 Navigating to: /registration/family${editParam}`);
                navigate(`/registration/family${editParam}`);
                break;
              case 2:
                // Add edit parameter if step is completed to trigger prefill
                const assessmentEditParam = step.completed ? '?mode=edit' : '';
                console.log(`🚀 Navigating to: /family/care-assessment${assessmentEditParam}`);
                navigate(`/family/care-assessment${assessmentEditParam}`);
                break;
              case 3:
                // Add edit parameter if step is completed to trigger prefill
                const storyEditParam = step.completed ? '?edit=true' : '';
                console.log(`🚀 Navigating to: /family/story${storyEditParam}`);
                navigate(`/family/story${storyEditParam}`);
                break;
              case 4:
                console.log('🚀 Navigating to: /family/matching');
                navigate('/family/matching');
                break;
              case 5:
                console.log('🚀 Navigating to: /family/care-management (medications)');
                navigate('/family/care-management');
                break;
              case 6:
                console.log('🚀 Navigating to: /family/care-management (meals)');
                navigate('/family/care-management');
                break;
              case 7:
                console.log('🚀 Opening Schedule Visit modal');
                setShowScheduleModal(true);
                break;
              case 8:
                console.log('🚀 Navigating to family dashboard for visit status');
                navigate('/dashboard/family');
                toast.info('Check your visit status below.');
                break;
              case 9:
                console.log('🚀 Navigating to care management for care team');
                navigate('/family/care-management');
                break;
              case 10:
                console.log('ℹ️ Step 10 - Initial Family Meeting awaiting admin confirmation');
                toast.info('This step is confirmed by your care coordinator after the initial meeting takes place.');
                break;
              case 11:
                console.log('🚀 Navigating to care management');
                navigate('/family/care-management');
                break;
              case 12:
                console.log('🚀 Navigating to care management (care environment)');
                navigate('/family/care-management');
                break;
              case 13:
                console.log('🚀 Navigating to care management (home optimization)');
                navigate('/family/care-management');
                break;
            }
          } catch (error) {
            console.error(`❌ Navigation error for step ${step.id}:`, error);
            toast.error('Navigation failed. Please try again.');
          }
        }
      }));

      return {
        steps: enhancedRichSteps,
        completionPercentage: sharedJourneyData.completionPercentage,
        totalSteps: richSteps.length,
        completedSteps: richSteps.filter(step => step.completed).length,
        nextStep: sharedJourneyData.nextStep,
        currentStage: sharedJourneyData.journeyStage,
        loading: false
      };
    }

    // Fallback to calculated steps for anonymous users or when both hooks are unavailable
    const calculatedSteps = calculateSteps();
    const totalSteps = calculatedSteps.length;
    const completedSteps = calculatedSteps.filter(step => step.completed).length;
    const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const nextStep = calculatedSteps.find(step => !step.completed);
    
    console.log('📊 Using calculated steps as fallback:', {
      totalSteps,
      completedSteps,
      completionPercentage,
      nextStepId: nextStep?.id
    });

    return {
      steps: calculatedSteps,
      completionPercentage,
      totalSteps,
      completedSteps,
      nextStep,
      currentStage: 'foundation',
      loading: false
    };
  };

  // Enhanced registration completion logic using correct database field names
  const calculateRegistrationCompletion = () => {
    if (!profile || !user) {
      console.log('🔍 Registration completion: No profile data', { hasProfile: !!profile, hasUser: !!user });
      return false;
    }

    console.log('🔍 Profile data being analyzed:', {
      full_name: profile.full_name,
      phone_number: profile.phone_number,
      address: profile.address,
      care_recipient_name: profile.care_recipient_name,
      relationship: profile.relationship,
      care_types: profile.care_types,
      care_schedule: profile.care_schedule,
      budget_preferences: profile.budget_preferences,
      caregiver_type: profile.caregiver_type
    });

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
        console.log(`❌ Registration completion: Missing required field ${field}:`, value);
      } else {
        console.log(`✅ Registration completion: Has required field ${field}:`, value);
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

    console.log('🔍 Registration completion check:', {
      hasAllRequiredFields,
      hasEnhancedData,
      requiredFieldsStatus: requiredFields,
      enhancedFieldsStatus: enhancedFields,
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
    
    // Check if caregiver is assigned via shared journey data (steps 9-11 are updated from sharedJourneyData)
    const hasCaregiverAssigned = sharedJourneyData.steps.find(s => s.id === 9)?.completed || false;

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
        completed: (() => {
          const completed = !!careAssessment?.id;
          console.log('🔍 Step 2 (Care Assessment) completion check:', {
            careAssessment,
            hasId: !!careAssessment?.id,
            completed
          });
          return completed;
        })(),
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
        completed: (() => {
          const completed = !!(careRecipient?.id && careRecipient?.full_name);
          console.log('🔍 Step 3 (Care Recipient) completion check:', {
            careRecipient,
            hasId: !!careRecipient?.id,
            hasFullName: !!careRecipient?.full_name,
            completed
          });
          return completed;
        })(),
        accessible: true,
        category: 'foundation',
        icon_name: 'Heart',
        tooltip_content: 'Share your loved one\'s story',
        detailed_explanation: 'Add personal details about your care recipient',
        time_estimate_minutes: 10,
        is_optional: true,
        action: () => {
          const isCompleted = !!(careRecipient?.id && careRecipient?.full_name);
          navigate(isCompleted ? '/family/story?edit=true' : '/family/story');
        }
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
        action: () => {
          const element = document.getElementById('caregiver-matches-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      },
      {
        id: "5",
        step_number: 5,
        title: "Edit Medication Management",
        description: "Add medications and set up schedules",
        completed: !!(carePlans && carePlans.length > 0), // Simplified for now
        accessible: true,
        category: 'foundation',
        icon_name: 'Pill',
        tooltip_content: 'Manage medications for your care plan',
        detailed_explanation: 'Set up medication schedules and tracking',
        time_estimate_minutes: 15,
        is_optional: false,
        action: () => navigate('/family/care-management')
      },
      {
        id: "6",
        step_number: 6,
        title: "Edit Meal Management",
        description: "Plan meals and create grocery lists",
        completed: !!(carePlans && carePlans.length > 0), // Simplified for now
        accessible: true,
        category: 'foundation',
        icon_name: 'Utensils',
        tooltip_content: 'Plan meals for your care plan',
        detailed_explanation: 'Set up meal planning and grocery management',
        time_estimate_minutes: 15,
        is_optional: false,
        action: () => navigate('/family/care-management')
      },
      {
        id: "7",
        step_number: 7,
        title: "Get Started with Care",
        description: isVisitConfirmed ? "Your care team is set up and active" : "Begin your care journey with a scheduled visit from our care coordinators",
        completed: isVisitScheduled || isVisitConfirmed || hasCaregiverAssigned,
        accessible: true,
        category: 'foundation',
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
        completed: isVisitConfirmed || hasCaregiverAssigned,
        accessible: isVisitScheduled || hasCaregiverAssigned,
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
        title: "Care Team Confirmed",
        description: "A care team member has been selected and coordinated for your family",
        completed: false, // Will be updated via sharedJourneyData
        accessible: isVisitConfirmed,
        category: 'scheduling',
        icon_name: 'UserCheck',
        tooltip_content: 'View your care team member',
        detailed_explanation: 'Your care team member has been confirmed. View your care team.',
        time_estimate_minutes: 0,
        is_optional: false,
        action: () => navigate('/family/care-management')
      },
      {
        id: "10",
        step_number: 10,
        title: "Initial Family Meeting",
        description: "Meet and greet with your care team member at your home",
        completed: false, // Will be updated via sharedJourneyData
        accessible: false,
        category: 'scheduling',
        icon_name: 'Home',
        tooltip_content: 'Family meeting scheduled',
        detailed_explanation: 'Introduction visit at your home',
        time_estimate_minutes: 60,
        is_optional: false,
        action: () => navigate('/family/care-management')
      },
      {
        id: "11",
        step_number: 11,
        title: "Care Begins",
        description: "Your care team begins providing support",
        completed: false, // Will be updated via sharedJourneyData
        accessible: false,
        category: 'scheduling',
        icon_name: 'Play',
        tooltip_content: 'Care has started',
        detailed_explanation: 'View your care plan for schedules and details',
        time_estimate_minutes: 0,
        is_optional: false,
        action: () => navigate('/family/care-management')
      },
      {
        id: "12",
        step_number: 12,
        title: "Care Readiness Assessment",
        description: "A home walkthrough completed by your care team during their first week to assess readiness for sustainable caregiving",
        completed: !!(carePlans && carePlans.length > 0 && hasCaregiverAssigned), // Auto-complete when care has started
        accessible: hasCaregiverAssigned || !!(carePlans && carePlans.length > 0),
        category: 'care_environment',
        icon_name: 'Home',
        tooltip_content: 'Care environment assessment',
        detailed_explanation: 'Your care team assesses your home for sustainable caregiving during their first week',
        time_estimate_minutes: 0,
        is_optional: false,
        action: () => navigate('/family/care-management')
      },
      {
        id: "13",
        step_number: 13,
        title: "Home Environment Optimization",
        description: "Guided or full care environment coordination to prepare your home for safe, comfortable caregiving",
        completed: false, // Marked via care_plan_service_selections
        accessible: hasCaregiverAssigned || !!(carePlans && carePlans.length > 0),
        category: 'care_environment',
        icon_name: 'Sparkles',
        tooltip_content: 'Optimize home for care',
        detailed_explanation: 'Choose from our care environment readiness services to prepare your home',
        time_estimate_minutes: 0,
        is_optional: true,
        action: () => navigate('/family/care-management')
      },
      {
        id: "14",
        step_number: 14,
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
        id: "15",
        step_number: 15,
        title: "Pay for Trial Day (Optional)",
        description: "Complete payment for an optional 8-hour caregiver trial experience",
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
        id: "16",
        step_number: 16,
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
        id: "17",
        step_number: 17,
        title: "Rate & Choose Your Path",
        description: "Choose your care model — view subscription plans or hire directly",
        completed: !!visitNotes?.care_model || !!visitNotes?.care_option || (hasCaregiverAssigned && carePlans.length > 0),
        accessible: isVisitConfirmed || hasTrialPayment || (hasCaregiverAssigned && carePlans.length > 0),
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
  const nonOptionalSteps = steps_calculated.filter(step => !step.is_optional);
  const completedSteps = nonOptionalSteps.filter(step => step.completed).length;
  const totalSteps = nonOptionalSteps.length;
  
  // Log detailed step completion info
  console.log('📊 Step Completion Analysis:', {
    totalSteps,
    completedSteps,
    optionalStepsExcluded: steps_calculated.length - nonOptionalSteps.length,
    completedStepIds: steps_calculated.filter(step => step.completed).map(step => ({ id: step.id, title: step.title })),
    incompleteSteps: steps_calculated.filter(step => !step.completed).map(step => ({ id: step.id, title: step.title, optional: step.is_optional }))
  });
  
  // Use dynamically calculated percentage as the primary source of truth
  const calculatedPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const finalCompletionPercentage = calculatedPercentage;
    
  console.log('📈 Family Dashboard Progress Calculation:', {
    calculatedPercentage,
    finalCompletionPercentage,
    storedCompletionPercentage: storedProgress.completionPercentage
  });
    
  // Use stored current step if available
  const nextStep = journeyProgress?.current_step != null
    ? steps_calculated.find(step => step.step_number === journeyProgress.current_step && !step.completed)
    : steps_calculated.find(step => !step.completed && step.accessible);
    
  const currentStage = sharedJourneyData.journeyStage || 'foundation';

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

  

  // Get the final steps data using prioritized logic
  const stepsData = getStepsData();

  // Sync calculated progress back to user_journey_progress table for admin/TAV consistency
  const syncedPercentageRef = useRef<number | null>(null);
  useEffect(() => {
    if (isAnonymous || !user?.id || stepsData.loading) return;
    const currentPercentage = stepsData.completionPercentage;
    // Only sync when percentage actually changes and differs from last synced value
    if (currentPercentage === syncedPercentageRef.current) return;
    syncedPercentageRef.current = currentPercentage;
    
    console.log('🔄 Syncing journey progress to DB:', { userId: user.id, percentage: currentPercentage });
    supabase
      .rpc('calculate_and_update_journey_progress', { target_user_id: user.id })
      .then(({ error }) => {
        if (error) {
          console.error('❌ Failed to sync journey progress:', error.message);
        } else {
          console.log('✅ Journey progress synced to DB successfully');
        }
      });
  }, [isAnonymous, user?.id, stepsData.completionPercentage, stepsData.loading]);
  return {
    loading: isAnonymous ? false : (stepsData.loading || loading || sharedJourneyData.loading),
    steps: stepsData.steps,
    paths,
    profile,
    carePlans,
    careAssessment,
    careRecipient,
    visitDetails,
    completionPercentage: stepsData.completionPercentage,
    totalSteps: stepsData.totalSteps,
    completedSteps: stepsData.completedSteps,
    nextStep: stepsData.nextStep,
    currentStage: stepsData.currentStage,
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
    refreshData: fetchUserData,
    agreedRate: financialData.agreedRate,
    weeklyHours: financialData.weeklyHours,
    projectedWeeklyCost: financialData.projectedWeeklyCost
  };
};
