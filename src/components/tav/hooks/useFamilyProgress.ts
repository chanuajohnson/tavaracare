import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface FamilyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  buttonText?: string;
  action?: () => void;
}

interface FamilyProgressData {
  steps: FamilyStep[];
  completionPercentage: number;
  nextStep?: FamilyStep;
  loading: boolean;
  carePlans: any[];
  showScheduleModal: boolean;
  setShowScheduleModal: (show: boolean) => void;
}

export const useFamilyProgress = (): FamilyProgressData => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [carePlans, setCarePlans] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [steps, setSteps] = useState<FamilyStep[]>([
    { 
      id: 1, 
      title: "Complete your profile", 
      description: "Add your contact information and preferences", 
      completed: false, 
      link: "/registration/family" 
    },
    { 
      id: 2, 
      title: "Complete initial care assessment", 
      description: "Help us understand your care needs better", 
      completed: false, 
      link: "/family/care-assessment" 
    },
    { 
      id: 3, 
      title: "Complete your loved one's Legacy Story", 
      description: "Share their story to personalize care", 
      completed: false, 
      link: "/family/story" 
    },
    { 
      id: 4, 
      title: "See your instant caregiver matches", 
      description: "View personalized caregiver recommendations", 
      completed: false, 
      link: "/caregiver-matching" 
    },
    { 
      id: 5, 
      title: "Set up medication management", 
      description: "Add medications and schedules", 
      completed: false, 
      link: "/family/care-management" 
    },
    { 
      id: 6, 
      title: "Set up meal management", 
      description: "Plan meals and create grocery lists", 
      completed: false, 
      link: "/family/care-management" 
    },
    { 
      id: 7, 
      title: "Schedule your Visit", 
      description: "Meet your care coordinator", 
      completed: false, 
      link: "/family/schedule-visit" 
    }
  ]);

  const handleStepAction = (step: FamilyStep) => {
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
        navigate(`/family/care-management/${carePlans[0].id}?tab=meal-planning`);
      } else {
        navigate('/family/care-management/create');
      }
      return;
    }
    
    if (step.id === 7) {
      setShowScheduleModal(true);
      return;
    }
    
    navigate(step.link);
  };

  const getButtonText = (step: FamilyStep) => {
    if (step.id === 4) {
      const canAccessMatching = steps[0]?.completed && steps[1]?.completed && steps[2]?.completed;
      if (!canAccessMatching) return "Complete Above Steps";
      return step.completed ? "View Matches" : "View Matches";
    }
    
    if (step.id === 5) {
      return step.completed ? "Edit Medications" : "Start Setup";
    }
    
    if (step.id === 6) {
      return step.completed ? "Edit Meal Plans" : "Start Planning";
    }
    
    if (step.id === 7) {
      return "Schedule Visit";
    }
    
    if (step.completed) {
      if (step.id === 1) return "Edit Profile";
      if (step.id === 2) return "Edit Assessment";
      if (step.id === 3) return "Edit Story";
      return "Edit";
    }
    
    return step.id === 2 ? "Start Assessment" : "Complete";
  };

  const checkStepCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if care assessment is completed
      const { data: careAssessment } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      // Check if care recipient profile exists
      const { data: careRecipient } = await supabase
        .from('care_recipient_profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check user profile completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_number')
        .eq('id', user.id)
        .maybeSingle();

      // Check for care plans
      const { data: carePlansData } = await supabase
        .from('care_plans')
        .select('id, title')
        .eq('family_id', user.id);

      setCarePlans(carePlansData || []);

      // Check for medications
      const { data: medications } = await supabase
        .from('medications')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      // Check for meal plans
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .in('care_plan_id', (carePlansData || []).map(cp => cp.id));

      const updatedSteps = steps.map(step => ({
        ...step,
        action: () => handleStepAction(step),
        buttonText: getButtonText(step)
      }));
      
      // Mark steps as completed based on data - exact same logic as FamilyNextStepsPanel
      if (user && profile?.full_name) {
        updatedSteps[0].completed = true;
      }
      
      if (careAssessment) {
        updatedSteps[1].completed = true;
      }
      
      if (careRecipient && careRecipient.full_name) {
        updatedSteps[2].completed = true;
      }
      
      if (careRecipient) {
        updatedSteps[3].completed = true;
      }
      
      if (medications && medications.length > 0) {
        updatedSteps[4].completed = true;
      }
      
      if (mealPlans && mealPlans.length > 0) {
        updatedSteps[5].completed = true;
      }
      
      setSteps(updatedSteps);
    } catch (error) {
      console.error("Error checking family progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkStepCompletion();
    }
  }, [user]);

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = Math.round((completedSteps / steps.length) * 100);
  const nextStep = steps.find(step => !step.completed);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading,
    carePlans,
    showScheduleModal,
    setShowScheduleModal
  };
};
