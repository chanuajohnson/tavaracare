
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/userRoles';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  accessible?: boolean;
}

interface UserSpecificProgressData {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  loading: boolean;
  journeyStage: 'foundation' | 'scheduling' | 'trial' | 'conversion';
}

export const useUserSpecificProgress = (userId: string, userRole: UserRole): UserSpecificProgressData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [journeyStage, setJourneyStage] = useState<'foundation' | 'scheduling' | 'trial' | 'conversion'>('foundation');

  // Define the same 11-step structure as useFamilyJourneyProgress
  const familySteps: JourneyStep[] = [
    // Foundation Steps (1-6)
    { 
      id: 1, 
      title: "Complete Your Profile", 
      description: "Add your contact information and preferences.", 
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
    // Scheduling Steps (7)
    { 
      id: 7, 
      title: "Schedule Your Tavara.Care Visit", 
      description: "Choose to meet your match and a care coordinator virtually (Free) or in person ($300 TTD).", 
      completed: false, 
      category: 'scheduling',
      accessible: true
    },
    // Trial Steps (8-10)
    { 
      id: 8, 
      title: "Schedule Trial Day (Optional)", 
      description: "Choose a trial date with your matched caregiver. This is an optional step before choosing your care model.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    { 
      id: 9, 
      title: "Pay for Trial Day (Optional)", 
      description: "Pay a one-time fee of $320 TTD for an 8-hour caregiver experience.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    { 
      id: 10, 
      title: "Begin Your Trial (Optional)", 
      description: "Your caregiver begins the scheduled trial session.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    // Conversion Step (11)
    { 
      id: 11, 
      title: "Rate & Choose Your Path", 
      description: "Decide between: Hire your caregiver ($40/hr) or Subscribe to Tavara ($45/hr) for full support tools. Can skip trial and go directly here after visit confirmation.", 
      completed: false, 
      category: 'conversion',
      accessible: false
    }
  ];

  const checkUserProgress = async () => {
    if (!userId || userRole !== 'family') {
      setSteps([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

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

      // Check trial payments
      const { data: trialPayments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'trial_day')
        .eq('status', 'completed');

      const hasTrialPayment = trialPayments && trialPayments.length > 0;

      // Parse visit notes for care model
      let visitNotes = null;
      try {
        visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }

      // Update step completion status using the same logic as family hook
      const updatedSteps = familySteps.map(step => {
        let completed = false;
        
        switch (step.id) {
          case 1: // Profile completion
            completed = !!(profile && profile.full_name);
            break;
          case 2: // Care assessment
            completed = !!careAssessment;
            break;
          case 3: // Legacy story
            completed = !!(careRecipient && careRecipient.full_name);
            break;
          case 4: // Caregiver matches
            completed = !!careRecipient;
            break;
          case 5: // Medication management
            completed = !!(medications && medications.length > 0);
            break;
          case 6: // Meal management
            completed = !!(mealPlans && mealPlans.length > 0);
            break;
          case 7: // Schedule visit
            completed = profile?.visit_scheduling_status === 'scheduled' || profile?.visit_scheduling_status === 'completed';
            break;
          case 8: // Schedule trial day
            completed = hasTrialPayment;
            break;
          case 9: // Pay for trial day
            completed = hasTrialPayment;
            break;
          case 10: // Begin trial
            completed = hasTrialPayment;
            break;
          case 11: // Rate & choose path
            completed = !!visitNotes?.care_model;
            break;
        }
        
        return { ...step, completed };
      });
      
      setSteps(updatedSteps);
      
      // Determine current journey stage
      const completedSteps = updatedSteps.filter(s => s.completed);
      const foundationSteps = completedSteps.filter(s => s.category === 'foundation');
      const schedulingSteps = completedSteps.filter(s => s.category === 'scheduling');
      const trialSteps = completedSteps.filter(s => s.category === 'trial');
      
      if (trialSteps.length > 0 || visitNotes?.care_model) {
        setJourneyStage('conversion');
      } else if (schedulingSteps.length > 0) {
        setJourneyStage('trial');
      } else if (foundationSteps.length >= 4) {
        setJourneyStage('scheduling');
      } else {
        setJourneyStage('foundation');
      }
      
    } catch (error) {
      console.error("Error checking user progress:", error);
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userRole === 'family') {
      checkUserProgress();
    } else {
      setLoading(false);
    }
  }, [userId, userRole]);

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const nextStep = steps.find(step => !step.completed && step.accessible);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading,
    journeyStage
  };
};
