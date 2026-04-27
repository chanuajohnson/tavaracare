
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
  category: 'foundation' | 'scheduling' | 'care_coordination' | 'trial' | 'conversion';
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
  showCaregiverMatchingModal: boolean;
  setShowCaregiverMatchingModal: (show: boolean) => void;
  journeyStage: 'foundation' | 'scheduling' | 'care_coordination' | 'trial' | 'conversion';
  careModel: string | null;
  trialCompleted: boolean;
  agreedRate?: string;
  weeklyHours?: number;
}

export const useFamilyJourneyProgress = (): JourneyProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [carePlans, setCarePlans] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);
  const [journeyStage, setJourneyStage] = useState<'foundation' | 'scheduling' | 'care_coordination' | 'trial' | 'conversion'>('foundation');
  const [careModel, setCareModel] = useState<string | null>(null);
  const [trialCompleted, setTrialCompleted] = useState(false);
  const [visitStatus, setVisitStatus] = useState<string>('not_started');
  const [visitDate, setVisitDate] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [careAssessment, setCareAssessment] = useState<any>(null);
  const [careRecipient, setCareRecipient] = useState<any>(null);
  const [agreedRate, setAgreedRate] = useState<string | undefined>();
  const [weeklyHours, setWeeklyHours] = useState<number | undefined>();

  const [steps, setSteps] = useState<JourneyStep[]>([
    // Foundation Steps (1-6)
    { 
      id: 1, title: "Complete Your Profile", 
      description: "Add your contact information and preferences.", 
      completed: false, category: 'foundation', link: "/registration/family", accessible: true
    },
    { 
      id: 2, title: "Complete Initial Care Assessment", 
      description: "Help us understand your care needs better.", 
      completed: false, category: 'foundation', link: "/family/care-assessment", accessible: true
    },
    { 
      id: 3, title: "Complete Your Loved One's Legacy Story", 
      description: "Because care is more than tasks—our Legacy Story feature honors the voices, memories, and wisdom of those we care for.", 
      completed: false, optional: true, category: 'foundation', link: "/family/story", accessible: true
    },
    { 
      id: 4, title: "See Your Instant Caregiver Matches", 
      description: "Now that your loved one's profile is complete, unlock personalized caregiver recommendations.", 
      completed: false, category: 'foundation', link: "/family/matching", accessible: false
    },
    { 
      id: 5, title: "Set Up Medication Management", 
      description: "Add medications and set up schedules for your care plan.", 
      completed: false, category: 'foundation', link: "/family/care-management", accessible: true
    },
    { 
      id: 6, title: "Set Up Meal Management", 
      description: "Plan meals and create grocery lists for your care plan.", 
      completed: false, category: 'foundation', link: "/family/care-management", accessible: true
    },
    // Scheduling Steps (7-8)
    { 
      id: 7, title: "Get Started with Care", 
      description: "Begin your care journey with a scheduled visit from our care coordinators", 
      completed: false, category: 'scheduling', link: "/family/schedule-visit", accessible: true
    },
    { 
      id: 8, title: "Confirm Visit", 
      description: "Confirm the video link or complete payment for in-person visit.", 
      completed: false, category: 'scheduling', accessible: false
    },
    // Care Coordination Steps (9-11)
    {
      id: 9, title: "Care Team Confirmed",
      description: "Your caregiver has been matched and assigned to your family.",
      completed: false, category: 'care_coordination', accessible: false
    },
    {
      id: 10, title: "Initial Family Meeting",
      description: "Meet your caregiver and discuss the care plan together.",
      completed: false, category: 'care_coordination', accessible: false
    },
    {
      id: 11, title: "Care Begins",
      description: "Your caregiver starts providing care to your loved one.",
      completed: false, category: 'care_coordination', accessible: false
    },
    // Trial Steps (12-14) - Optional path
    { 
      id: 12, title: "Schedule Trial Day (Optional)", 
      description: "Choose a trial date with your matched caregiver.", 
      completed: false, optional: true, category: 'trial', accessible: false
    },
    { 
      id: 13, title: "Pay for Trial Day (Optional)", 
      description: "Complete payment for an optional 8-hour caregiver trial experience.", 
      completed: false, optional: true, category: 'trial', accessible: false
    },
    { 
      id: 14, title: "Begin Your Trial (Optional)", 
      description: "Your caregiver begins the scheduled trial session.", 
      completed: false, optional: true, category: 'trial', accessible: false
    },
    // Conversion Step (15)
    { 
      id: 15, title: "Rate & Choose Your Path", 
      description: "Choose your care model — view subscription plans or hire directly.", 
      completed: false, category: 'conversion', accessible: false
    }
  ]);

  const updateStepAccessibility = (updatedSteps: JourneyStep[]) => {
    return updatedSteps.map(step => {
      let accessible = true;
      
      switch (step.id) {
        case 4: // Caregiver matches - need steps 1-3
          accessible = updatedSteps[0]?.completed && updatedSteps[1]?.completed && updatedSteps[2]?.completed;
          break;
        case 8: // Confirm visit - need step 7
          accessible = updatedSteps[6]?.completed;
          break;
        case 9: // Care Team - need step 8
          accessible = updatedSteps[7]?.completed;
          break;
        case 10: // Family Meeting - need step 9
          accessible = updatedSteps[8]?.completed;
          break;
        case 11: // Care Begins - need step 10
          accessible = updatedSteps[9]?.completed;
          break;
        case 12: // Schedule trial - need step 8
          accessible = updatedSteps[7]?.completed;
          break;
        case 13: // Pay for trial - need steps 8 and 12
          accessible = updatedSteps[7]?.completed && updatedSteps[11]?.completed;
          break;
        case 14: // Begin trial - need step 13
          accessible = updatedSteps[12]?.completed;
          break;
        case 15: // Choose path - need step 8
          accessible = updatedSteps[7]?.completed;
          break;
        default:
          accessible = true;
      }
      
      return { ...step, accessible };
    });
  };

  const handleStepAction = (step: JourneyStep) => {
    if (!step.accessible) return;
    
    if (step.id === 1) {
      const isCompleted = !!(user && profile?.full_name);
      navigate(isCompleted ? '/registration/family?edit=true' : '/registration/family');
      return;
    }
    
    if (step.id === 2) {
      const isCompleted = !!careAssessment;
      navigate(isCompleted ? '/family/care-assessment?mode=edit' : '/family/care-assessment');
      return;
    }
    
    if (step.id === 3) {
      const isCompleted = !!(careRecipient && careRecipient.full_name);
      navigate(isCompleted ? '/family/story?edit=true' : '/family/story');
      return;
    }
    
    if (step.id === 4) {
      const canAccessMatching = steps[0]?.completed && steps[1]?.completed && steps[2]?.completed;
      if (!canAccessMatching) return;
      setShowCaregiverMatchingModal(true);
      return;
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
      if (step.id === 9) return "Confirm Visit First";
      if (step.id === 10) return "Awaiting Care Team";
      if (step.id === 11) return "Meeting First";
      if (step.id === 12) return "Schedule Visit First";
      if (step.id === 13) return "Complete Previous Steps";
      if (step.id === 14) return "Complete Previous Steps";
      if (step.id === 15) return "Confirm Visit First";
      return "Not Available";
    }
    
    if (step.id === 4) return "View Matches";
    if (step.id === 5) return step.completed ? "Edit Medications" : "Start Setup";
    if (step.id === 6) return step.completed ? "Edit Meal Plans" : "Start Planning";
    
    if (step.id === 7) {
      switch (visitStatus) {
        case 'scheduled':
          return visitDate 
            ? `Scheduled for ${new Date(visitDate).toLocaleDateString()}`
            : "Modify Visit";
        case 'completed': return "Schedule Another";
        case 'cancelled': return "Schedule Visit";
        default: return "Schedule Visit";
      }
    }
    
    if (step.id === 8) return visitStatus === 'completed' ? "Visit Completed" : "Confirm Visit";
    if (step.id === 9) return step.completed ? "✓ Team Assigned" : "Pending Assignment";
    if (step.id === 10) return step.completed ? "✓ Meeting Done" : "Schedule Meeting";
    if (step.id === 11) return step.completed ? "✓ Care Started" : "Awaiting Start";
    if (step.id === 12) return trialCompleted ? "Trial Scheduled" : "Schedule Trial";
    if (step.id === 13) return trialCompleted ? "Trial Paid" : "Pay for Trial";
    if (step.id === 14) return trialCompleted ? "Trial Completed" : "Begin Trial";
    if (step.id === 15) return careModel ? "Path Chosen" : "Choose Path";
    
    if (step.completed) return "Edit";
    return "Complete";
  };

  const determineJourneyStage = (completedSteps: JourneyStep[]) => {
    const careCoordSteps = completedSteps.filter(s => s.category === 'care_coordination');
    const trialSteps = completedSteps.filter(s => s.category === 'trial');
    const schedulingSteps = completedSteps.filter(s => s.category === 'scheduling');
    const foundationSteps = completedSteps.filter(s => s.category === 'foundation');
    
    if (trialSteps.length > 0 || careModel) return 'conversion';
    if (careCoordSteps.length > 0) return 'care_coordination';
    if (schedulingSteps.length > 0) return 'scheduling';
    if (foundationSteps.length >= 4) return 'scheduling';
    return 'foundation';
  };

  const checkStepCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone_number, address, care_recipient_name, relationship, care_types, visit_scheduling_status, visit_scheduled_date, visit_notes')
        .eq('id', user.id)
        .maybeSingle();

      setProfile(profileData);
      setVisitStatus(profileData?.visit_scheduling_status || 'not_started');
      setVisitDate(profileData?.visit_scheduled_date || null);

      let visitNotes = null;
      try {
        visitNotes = profileData?.visit_notes ? JSON.parse(profileData.visit_notes) : null;
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }
      setCareModel(visitNotes?.care_model || null);

      const { data: careAssessmentData } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      setCareAssessment(careAssessmentData);

      const { data: careRecipientData } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      setCareRecipient(careRecipientData);

      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);
      setCarePlans(carePlansData || []);

      const { data: medications } = await supabase
        .from('medications')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      const { data: mealPlans } = await supabase
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

      // Check care team assignments
      const { data: assignments } = await supabase
        .from('caregiver_assignments')
        .select('id')
        .eq('family_user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      const { data: manualAssignments } = await supabase
        .from('admin_match_interventions')
        .select('id')
        .eq('family_user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      const hasCareTeam = (assignments?.length || 0) > 0 || (manualAssignments?.length || 0) > 0;

      // Check onboarding checklist for introduction_date and care_start_date
      const { data: checklist } = await supabase
        .from('onboarding_checklists' as any)
        .select('checked_items')
        .eq('user_id', user.id)
        .eq('user_type', 'family')
        .maybeSingle();

      const checkedItems = (checklist as any)?.checked_items as Record<string, any> | null;
      const hasIntroductionDate = !!checkedItems?.introduction_date;
      const hasCareStartDate = !!checkedItems?.care_start_date;

      // Extract rate/hours from checklist
      if (checkedItems?.care_rate) {
        const rateData = checkedItems.care_rate;
        if (typeof rateData === 'object') {
          setAgreedRate(rateData.label || rateData.rate || undefined);
          setWeeklyHours(rateData.weeklyHours || rateData.hours || undefined);
        } else if (typeof rateData === 'string') {
          setAgreedRate(rateData);
        }
      }

      // Enhanced profile completion check
      const profileComplete = !!(
        profileData?.full_name && 
        profileData?.phone_number && 
        profileData?.address && 
        profileData?.care_recipient_name && 
        profileData?.relationship &&
        (profileData?.care_types && (profileData.care_types as string[]).length > 0)
      );

      const updatedSteps = steps.map(step => {
        let completed = false;
        
        switch (step.id) {
          case 1: completed = profileComplete; break;
          case 2: completed = !!careAssessmentData; break;
          case 3: completed = !!(careRecipientData && careRecipientData.full_name); break;
          case 4: completed = !!careRecipientData; break;
          case 5: completed = !!(medications && medications.length > 0); break;
          case 6: completed = !!(mealPlans && mealPlans.length > 0); break;
          case 7: completed = profileData?.visit_scheduling_status === 'scheduled' || profileData?.visit_scheduling_status === 'completed'; break;
          case 8: completed = profileData?.visit_scheduling_status === 'completed'; break;
          case 9: completed = hasCareTeam; break;
          case 10: completed = hasIntroductionDate; break;
          case 11: completed = hasCareStartDate; break;
          case 12: completed = hasTrialPayment; break;
          case 13: completed = hasTrialPayment; break;
          case 14: completed = hasTrialPayment; break;
          case 15: completed = !!visitNotes?.care_model; break;
        }
        
        return {
          ...step,
          completed,
          action: () => handleStepAction(step),
          buttonText: getButtonText({ ...step, completed })
        };
      });
      
      const stepsWithAccessibility = updateStepAccessibility(updatedSteps);
      setSteps(stepsWithAccessibility);
      
      const completedStepsList = updatedSteps.filter(s => s.completed);
      setJourneyStage(determineJourneyStage(completedStepsList));
      
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
    showCaregiverMatchingModal,
    setShowCaregiverMatchingModal,
    journeyStage,
    careModel,
    trialCompleted,
    agreedRate,
    weeklyHours
  };
};
