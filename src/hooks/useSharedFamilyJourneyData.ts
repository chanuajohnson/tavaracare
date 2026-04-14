
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  accessible?: boolean;
}

interface SharedFamilyJourneyData {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  loading: boolean;
  journeyStage: 'foundation' | 'scheduling' | 'trial' | 'conversion' | 'active';
}

export const useSharedFamilyJourneyData = (userId: string): SharedFamilyJourneyData => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [journeyStage, setJourneyStage] = useState<'foundation' | 'scheduling' | 'trial' | 'conversion' | 'active'>('foundation');

  const [steps, setSteps] = useState<JourneyStep[]>([
    // Foundation Steps (1-6)
    { 
      id: 1, 
      title: "Complete Your Profile", 
      description: "Add your contact information and care preferences.", 
      completed: false, 
      category: 'foundation',
      accessible: true
    },
    { 
      id: 2, 
      title: "Complete Initial Care Assessment", 
      description: "Help us understand your care needs better.", 
      completed: false, 
      category: 'foundation',
      accessible: true
    },
    { 
      id: 3, 
      title: "Complete Your Loved One's Legacy Story", 
      description: "Because care is more than tasks—our Legacy Story feature honors the voices, memories, and wisdom of those we care for.", 
      completed: false, 
      optional: true,
      category: 'foundation',
      accessible: true
    },
    { 
      id: 4, 
      title: "See Your Instant Caregiver Matches", 
      description: "Now that your loved one's profile is complete, unlock personalized caregiver recommendations.", 
      completed: false, 
      category: 'foundation',
      accessible: false
    },
    { 
      id: 5, 
      title: "Set Up Medication Management", 
      description: "Add medications and set up schedules for your care plan.", 
      completed: false, 
      category: 'foundation',
      accessible: true
    },
    { 
      id: 6, 
      title: "Set Up Meal Management", 
      description: "Plan meals and create grocery lists for your care plan.", 
      completed: false, 
      category: 'foundation',
      accessible: true
    },
    // Scheduling Steps (7-8)
    { 
      id: 7, 
      title: "Get Started with Care", 
      description: "Begin your care journey with a scheduled visit from our care coordinators", 
      completed: false, 
      category: 'foundation',
      accessible: true
    },
    { 
      id: 8, 
      title: "Confirm Your Visit", 
      description: "Your visit has been scheduled and confirmed with our care coordinator.", 
      completed: false, 
      category: 'scheduling',
      accessible: false
    },
    // Care Coordination Steps (9-11)
    {
      id: 9,
      title: "Care Team Confirmed",
      description: "A care team member has been selected and coordinated for your family. View your care team.",
      completed: false,
      category: 'scheduling',
      accessible: false
    },
    {
      id: 10,
      title: "Initial Family Meeting",
      description: "Meet and greet with your care team member at your home.",
      completed: false,
      category: 'scheduling',
      accessible: false
    },
    {
      id: 11,
      title: "Care Begins",
      description: "Your care team begins providing support. View your care plan for schedules and details.",
      completed: false,
      category: 'scheduling',
      accessible: false
    },
    // Trial Steps (12-14)
    { 
      id: 12, 
      title: "Schedule Trial Day (Optional)", 
      description: "Choose a trial date with your matched caregiver. This is an optional step before choosing your care model.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    { 
      id: 13, 
      title: "Pay for Trial Day (Optional)", 
      description: "Complete payment for an optional 8-hour caregiver trial experience.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    { 
      id: 14, 
      title: "Begin Your Trial (Optional)", 
      description: "Your caregiver begins the scheduled trial session.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    // Conversion Step (15)
    { 
      id: 15, 
      title: "Rate & Choose Your Path", 
      description: "Choose your care model — view subscription plans or hire directly.", 
      completed: false, 
      category: 'conversion',
      accessible: false
    }
  ]);

  // Enhanced registration completion logic - matches useEnhancedJourneyProgress
  const calculateRegistrationCompletion = (profile: any) => {
    if (!profile) return false;

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

    // Registration is complete if has all required fields AND at least some enhanced data
    return hasAllRequiredFields && hasEnhancedData;
  };

  const checkStepCompletion = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get comprehensive profile data for enhanced registration completion check
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_number, address, care_recipient_name, relationship, care_types, care_schedule, budget_preferences, caregiver_type, visit_scheduling_status, visit_scheduled_date, visit_notes')
        .eq('id', userId)
        .maybeSingle();

      // Parse visit notes for care model
      let visitNotes = null;
      try {
        visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }

      // Check care assessment
      const { data: careAssessment } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();

      // Check care recipient profile
      const { data: careRecipient } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('🔍 SharedFamilyJourneyData step completion check:', {
        profileComplete: calculateRegistrationCompletion(profile),
        careAssessment: !!careAssessment,
        careRecipient: !!(careRecipient && careRecipient.full_name)
      });

      // Check care plans
      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', userId);

      // Check medications and meal plans
      const { data: medications } = await supabase
        .from('medications')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      // Check visit details
      const { data: visitData } = await supabase
        .from('visit_bookings')
        .select('*')
        .eq('user_id', userId)
        .eq('is_cancelled', false)
        .order('created_at', { ascending: false })
        .maybeSingle();

      // Check trial payments
      const { data: trialPayments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'trial_day')
        .eq('status', 'completed');

      const hasTrialPayment = trialPayments && trialPayments.length > 0;

      // Check caregiver assignments (new steps 9-11)
      const { data: caregiverAssignments } = await supabase
        .from('caregiver_assignments')
        .select('id, caregiver_id, status')
        .eq('family_user_id', userId)
        .eq('is_active', true);

      const { data: manualAssignments } = await supabase
        .from('admin_match_interventions')
        .select('id, caregiver_id, status')
        .eq('family_user_id', userId)
        .eq('status', 'active');

      const hasCaregiverAssigned = (caregiverAssignments && caregiverAssignments.length > 0) || 
                                    (manualAssignments && manualAssignments.length > 0);

      // Check family onboarding checklist for meeting/start dates
      const { data: familyChecklist } = await supabase
        .from('onboarding_checklists')
        .select('checked_items')
        .eq('family_id', userId)
        .maybeSingle();

      let introductionDate: string | null = null;
      let startDate: string | null = null;
      try {
        if (familyChecklist?.checked_items) {
          const items = typeof familyChecklist.checked_items === 'string' 
            ? JSON.parse(familyChecklist.checked_items) 
            : familyChecklist.checked_items;
          introductionDate = items?.post_onboarding_1_date || null;
          startDate = items?.post_onboarding_3_date || null;
        }
      } catch (e) {
        console.error('Error parsing family checklist:', e);
      }

      // Update step completion status with enhanced registration logic
      const updatedSteps = steps.map(step => {
        let completed = false;
        let accessible = step.accessible;
        
        switch (step.id) {
          case 1: // Enhanced Profile completion
            completed = calculateRegistrationCompletion(profile);
            break;
          case 2: // Care assessment
            completed = !!careAssessment;
            break;
          case 3: // Legacy story
            completed = !!(careRecipient && careRecipient.full_name);
            break;
          case 4: // Caregiver matches
            completed = calculateRegistrationCompletion(profile) && !!careAssessment;
            accessible = calculateRegistrationCompletion(profile) && !!careAssessment;
            break;
          case 5: // Medication management
            completed = !!(medications && medications.length > 0);
            break;
          case 6: // Meal management
            completed = !!(mealPlans && mealPlans.length > 0);
            break;
          case 7: // Schedule visit
            completed = profile?.visit_scheduling_status === 'scheduled' || profile?.visit_scheduling_status === 'completed' || profile?.visit_scheduling_status === 'ready_to_schedule' || hasCaregiverAssigned;
            break;
          case 8: // Confirm visit
            completed = profile?.visit_scheduling_status === 'completed' || hasCaregiverAssigned;
            accessible = profile?.visit_scheduling_status === 'scheduled' || hasCaregiverAssigned;
            break;
          case 9: // Caregiver Assigned
            completed = hasCaregiverAssigned;
            accessible = profile?.visit_scheduling_status === 'completed' || hasCaregiverAssigned;
            break;
          case 10: // Initial Family Meeting
            completed = !!introductionDate;
            accessible = hasCaregiverAssigned;
            break;
          case 11: // Care Begins
            const hasActiveCareTeam = !!(carePlansData && carePlansData.length > 0 && hasCaregiverAssigned);
            completed = !!startDate || hasActiveCareTeam;
            accessible = !!introductionDate || !!startDate || hasActiveCareTeam;
            break;
          case 12: // Schedule trial day
            completed = hasTrialPayment;
            accessible = profile?.visit_scheduling_status === 'completed';
            break;
          case 13: // Pay for trial day
            completed = hasTrialPayment;
            accessible = profile?.visit_scheduling_status === 'completed';
            break;
          case 14: // Begin trial
            completed = hasTrialPayment;
            accessible = hasTrialPayment;
            break;
          case 15: // Rate & choose path
            const careBegunCheck = !!startDate || !!(carePlansData && carePlansData.length > 0 && hasCaregiverAssigned);
            completed = !!visitNotes?.care_model || !!visitNotes?.care_option || careBegunCheck;
            accessible = profile?.visit_scheduling_status === 'completed' || hasTrialPayment || careBegunCheck;
            break;
        }
        
        // Add action functions for steps
        let action;
        switch (step.id) {
          case 1:
            action = () => {
              const isCompleted = calculateRegistrationCompletion(profile);
              navigate(isCompleted ? '/registration/family?edit=true' : '/registration/family');
            };
            break;
          case 2:
            action = () => {
              const isCompleted = !!careAssessment;
              navigate(isCompleted ? '/family/care-assessment?mode=edit' : '/family/care-assessment');
            };
            break;
          case 3:
            action = () => {
              const isCompleted = !!(careRecipient && careRecipient.full_name);
              navigate(isCompleted ? '/family/story?edit=true' : '/family/story');
            };
            break;
          case 9:
            action = () => navigate('/family/care-management');
            break;
          case 10:
            action = () => navigate('/family/care-management');
            break;
          case 11:
            action = () => navigate('/family/care-management');
            break;
          default:
            action = undefined;
        }
        
        return { ...step, completed, accessible, action };
      });
      
      setSteps(updatedSteps);
      
      // Determine current journey stage
      const completedSteps = updatedSteps.filter(s => s.completed);
      const foundationSteps = completedSteps.filter(s => s.category === 'foundation');
      const schedulingSteps = completedSteps.filter(s => s.category === 'scheduling');
      const trialSteps = completedSteps.filter(s => s.category === 'trial');
      
      // Count total steps per category for "all complete" checks
      const totalSchedulingSteps = updatedSteps.filter(s => s.category === 'scheduling');
      const conversionStep = updatedSteps.find(s => s.category === 'conversion');
      const allSchedulingComplete = totalSchedulingSteps.length > 0 && totalSchedulingSteps.every(s => s.completed);
      const conversionComplete = conversionStep?.completed || false;
      
      if (allSchedulingComplete && conversionComplete) {
        setJourneyStage('active');
      } else if (trialSteps.length > 0 || visitNotes?.care_model) {
        setJourneyStage('conversion');
      } else if (allSchedulingComplete) {
        setJourneyStage('conversion');
      } else if (schedulingSteps.length > 0) {
        setJourneyStage('scheduling');
      } else if (foundationSteps.length >= 4) {
        setJourneyStage('scheduling');
      } else {
        setJourneyStage('foundation');
      }
      
    } catch (error) {
      console.error("Error checking shared family journey progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      checkStepCompletion();
    }
  }, [userId]);

  const nonOptionalSteps = steps.filter(step => !step.optional);
  const completedNonOptional = nonOptionalSteps.filter(step => step.completed).length;
  const completionPercentage = Math.round((completedNonOptional / nonOptionalSteps.length) * 100);
  const nextStep = steps.find(step => !step.completed && step.accessible);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading,
    journeyStage
  };
};
