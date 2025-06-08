import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  link?: string;
  action?: () => void;
  buttonText?: string;
  accessible?: boolean;
}

interface JourneyProgressData {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  loading: boolean;
  carePlans: any[];
  showScheduleModal: boolean;
  setShowScheduleModal: (show: boolean) => void;
  journeyStage: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  careModel: string | null;
  trialCompleted: boolean;
}

export const useFamilyJourneyProgress = (): JourneyProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [carePlans, setCarePlans] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [journeyStage, setJourneyStage] = useState<'foundation' | 'scheduling' | 'trial' | 'conversion'>('foundation');
  const [careModel, setCareModel] = useState<string | null>(null);
  const [trialCompleted, setTrialCompleted] = useState(false);
  const [visitStatus, setVisitStatus] = useState<string>('not_started');
  const [visitDate, setVisitDate] = useState<string | null>(null);

  const [steps, setSteps] = useState<JourneyStep[]>([
    // Foundation Steps (1-6)
    { 
      id: 1, 
      title: "Complete Your Profile", 
      description: "Add your contact information and preferences.", 
      completed: false, 
      category: 'foundation',
      link: "/registration/family",
      accessible: true
    },
    { 
      id: 2, 
      title: "Complete Initial Care Assessment", 
      description: "Help us understand your care needs better.", 
      completed: false, 
      category: 'foundation',
      link: "/family/care-assessment",
      accessible: true
    },
    { 
      id: 3, 
      title: "Complete Your Loved One's Legacy Story", 
      description: "Because care is more than tasks—our Legacy Story feature honors the voices, memories, and wisdom of those we care for.", 
      completed: false, 
      optional: true,
      category: 'foundation',
      link: "/family/story",
      accessible: true
    },
    { 
      id: 4, 
      title: "See Your Instant Caregiver Matches", 
      description: "Now that your loved one's profile is complete, unlock personalized caregiver recommendations.", 
      completed: false, 
      category: 'foundation',
      link: "/caregiver/matching",
      accessible: false
    },
    { 
      id: 5, 
      title: "Set Up Medication Management", 
      description: "Add medications and set up schedules for your care plan.", 
      completed: false, 
      category: 'foundation',
      link: "/family/care-management",
      accessible: true
    },
    { 
      id: 6, 
      title: "Set Up Meal Management", 
      description: "Plan meals and create grocery lists for your care plan.", 
      completed: false, 
      category: 'foundation',
      link: "/family/care-management",
      accessible: true
    },
    // Scheduling Steps (7-8)
    { 
      id: 7, 
      title: "Schedule Your Tavara.Care Visit", 
      description: "Choose to meet your match and a care coordinator virtually (Free) or in person ($300 TTD).", 
      completed: false, 
      category: 'scheduling',
      link: "/family/schedule-visit",
      accessible: true
    },
    { 
      id: 8, 
      title: "Confirm Visit", 
      description: "Confirm the video link or complete payment for in-person visit.", 
      completed: false, 
      category: 'scheduling',
      accessible: false
    },
    // Trial Steps (9-11) - Optional path
    { 
      id: 9, 
      title: "Schedule Trial Day (Optional)", 
      description: "Choose a trial date with your matched caregiver. This is an optional step before choosing your care model.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    { 
      id: 10, 
      title: "Pay for Trial Day (Optional)", 
      description: "Pay a one-time fee of $320 TTD for an 8-hour caregiver experience.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    { 
      id: 11, 
      title: "Begin Your Trial (Optional)", 
      description: "Your caregiver begins the scheduled trial session.", 
      completed: false, 
      optional: true,
      category: 'trial',
      accessible: false
    },
    // Conversion Step (12)
    { 
      id: 12, 
      title: "Rate & Choose Your Path", 
      description: "Decide between: Hire your caregiver ($40/hr) or Subscribe to Tavara ($45/hr) for full support tools. Can skip trial and go directly here after visit confirmation.", 
      completed: false, 
      category: 'conversion',
      accessible: false
    }
  ]);

  const updateStepAccessibility = (updatedSteps: JourneyStep[]) => {
    return updatedSteps.map(step => {
      let accessible = true;
      
      switch (step.id) {
        case 4: // Caregiver matches - need steps 1-3 completed
          accessible = updatedSteps[0]?.completed && updatedSteps[1]?.completed && updatedSteps[2]?.completed;
          break;
        case 8: // Confirm visit - need step 7 completed
          accessible = updatedSteps[6]?.completed; // Step 7 (index 6)
          break;
        case 9: // Schedule trial - need step 7 completed
          accessible = updatedSteps[6]?.completed; // Step 7 (index 6)
          break;
        case 10: // Pay for trial - need steps 8 and 9 completed
          accessible = updatedSteps[7]?.completed && updatedSteps[8]?.completed; // Steps 8,9
          break;
        case 11: // Begin trial - need step 10 completed
          accessible = updatedSteps[9]?.completed; // Step 10 (index 9)
          break;
        case 12: // Choose path - need step 8 completed (can skip trial)
          accessible = updatedSteps[7]?.completed; // Step 8 (index 7)
          break;
        default:
          accessible = true;
      }
      
      return { ...step, accessible };
    });
  };

  const handleStepAction = (step: JourneyStep) => {
    if (!step.accessible) return;
    
    if (step.id === 4) {
      const canAccessMatching = steps[0]?.completed && steps[1]?.completed && steps[2]?.completed;
      if (!canAccessMatching) return;
    }
    
    if (step.id === 5) {
      if (carePlans.length > 0) {
        navigate(`/family/care-management/${carePlans[0].id}/medications`);
      } else {
        navigate('/family/care-management/create');
      }
      return;
    }
    
    if (step.id === 6) {
      if (carePlans.length > 0) {
        navigate(`/family/care-management/${carePlans[0].id}/meals`);
      } else {
        navigate('/family/care-management/create');
      }
      return;
    }
    
    if (step.id === 7) {
      setShowScheduleModal(true);
      return;
    }
    
    if (step.link) {
      navigate(step.link);
    }
  };

  const getButtonText = (step: JourneyStep) => {
    if (!step.accessible) {
      if (step.id === 4) return "Complete Above Steps";
      if (step.id === 8) return "Schedule Visit First";
      if (step.id === 9) return "Schedule Visit First";
      if (step.id === 10) return "Complete Previous Steps";
      if (step.id === 11) return "Complete Previous Steps";
      if (step.id === 12) return "Confirm Visit First";
      return "Not Available";
    }
    
    if (step.id === 4) {
      return step.completed ? "View Matches" : "View Matches";
    }
    
    if (step.id === 5) {
      return step.completed ? "Edit Medications" : "Start Setup";
    }
    
    if (step.id === 6) {
      return step.completed ? "Edit Meal Plans" : "Start Planning";
    }
    
    if (step.id === 7) {
      switch (visitStatus) {
        case 'scheduled':
          return visitDate 
            ? `Scheduled for ${new Date(visitDate).toLocaleDateString()}`
            : "Modify Visit";
        case 'completed':
          return "Schedule Another";
        case 'cancelled':
          return "Schedule Visit";
        default:
          return "Schedule Visit";
      }
    }
    
    if (step.id === 8) {
      return visitStatus === 'completed' ? "Visit Completed" : "Confirm Visit";
    }
    
    if (step.id === 9) {
      return trialCompleted ? "Trial Scheduled" : "Schedule Trial";
    }
    
    if (step.id === 10) {
      return trialCompleted ? "Trial Paid" : "Pay for Trial";
    }
    
    if (step.id === 11) {
      return trialCompleted ? "Trial Completed" : "Begin Trial";
    }
    
    if (step.id === 12) {
      return careModel ? "Path Chosen" : "Choose Path";
    }
    
    if (step.completed) {
      return "Edit";
    }
    
    return "Complete";
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

  const checkStepCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get user profile completion and visit status
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_number, visit_scheduling_status, visit_scheduled_date, visit_notes')
        .eq('id', user.id)
        .maybeSingle();

      setVisitStatus(profile?.visit_scheduling_status || 'not_started');
      setVisitDate(profile?.visit_scheduled_date || null);

      // Parse visit notes for care model
      let visitNotes = null;
      try {
        visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }
      setCareModel(visitNotes?.care_model || null);

      // Check care assessment
      const { data: careAssessment } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      // Check care recipient profile
      const { data: careRecipient } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check care plans
      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);
      setCarePlans(carePlansData || []);

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
        .eq('user_id', user.id)
        .eq('transaction_type', 'trial_day')
        .eq('status', 'completed');

      const hasTrialPayment = trialPayments && trialPayments.length > 0;
      setTrialCompleted(hasTrialPayment);

      // Update step completion status
      const updatedSteps = steps.map(step => {
        let completed = false;
        
        switch (step.id) {
          case 1: // Profile completion
            completed = !!(user && profile?.full_name);
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
          case 8: // Confirm visit
            completed = profile?.visit_scheduling_status === 'completed';
            break;
          case 9: // Schedule trial day
            completed = hasTrialPayment;
            break;
          case 10: // Pay for trial day
            completed = hasTrialPayment;
            break;
          case 11: // Begin trial
            completed = hasTrialPayment;
            break;
          case 12: // Rate & choose path
            completed = !!visitNotes?.care_model;
            break;
        }
        
        return {
          ...step,
          completed,
          action: () => handleStepAction(step),
          buttonText: getButtonText({ ...step, completed })
        };
      });
      
      // Update accessibility based on completion
      const stepsWithAccessibility = updateStepAccessibility(updatedSteps);
      setSteps(stepsWithAccessibility);
      
      // Determine current journey stage
      const completedSteps = updatedSteps.filter(s => s.completed);
      setJourneyStage(determineJourneyStage(completedSteps));
      
    } catch (error) {
      console.error("Error checking family journey progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkStepCompletion();
    }
  }, [user, visitStatus, visitDate, careModel, trialCompleted]);

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = Math.round((completedSteps / steps.length) * 100);
  const nextStep = steps.find(step => !step.completed && step.accessible);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading,
    carePlans,
    showScheduleModal,
    setShowScheduleModal,
    journeyStage,
    careModel,
    trialCompleted
  };
};
