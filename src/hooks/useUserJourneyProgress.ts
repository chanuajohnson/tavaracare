
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/userRoles';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  category?: string;
  optional?: boolean;
}

interface UserJourneyData {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  loading: boolean;
  journeyStage?: string;
}

export const useUserJourneyProgress = (userId: string, userRole: UserRole): UserJourneyData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [journeyStage, setJourneyStage] = useState<string>('foundation');

  const getStepsForRole = (role: UserRole): JourneyStep[] => {
    switch (role) {
      case 'family':
        return [
          { id: 1, title: "Complete your profile", description: "Add your contact information and preferences", completed: false, link: "/registration/family", category: "foundation" },
          { id: 2, title: "Complete initial care assessment", description: "Help us understand your care needs better", completed: false, link: "/family/care-assessment", category: "foundation" },
          { id: 3, title: "Complete your loved one's Legacy Story", description: "Share their story to personalize care", completed: false, link: "/family/story", category: "foundation", optional: true },
          { id: 4, title: "See your instant caregiver matches", description: "View personalized caregiver recommendations", completed: false, link: "/caregiver/matching", category: "foundation" },
          { id: 5, title: "Set up medication management", description: "Add medications and schedules", completed: false, link: "/family/care-management", category: "foundation" },
          { id: 6, title: "Set up meal management", description: "Plan meals and create grocery lists", completed: false, link: "/family/care-management", category: "foundation" },
          { id: 7, title: "Schedule your Visit", description: "Meet your care coordinator", completed: false, link: "/family/schedule-visit", category: "scheduling" },
          { id: 8, title: "Confirm Visit", description: "Confirm video link or complete payment", completed: false, link: "/family/schedule-visit", category: "scheduling" },
          { id: 9, title: "Schedule Trial Day", description: "Choose a trial date with your caregiver", completed: false, link: "/family/schedule-visit", category: "trial", optional: true },
          { id: 10, title: "Pay for Trial Day", description: "Pay trial fee for 8-hour experience", completed: false, link: "/family/schedule-visit", category: "trial", optional: true },
          { id: 11, title: "Begin Your Trial", description: "Start your trial session", completed: false, link: "/family/schedule-visit", category: "trial", optional: true },
          { id: 12, title: "Rate & Choose Your Path", description: "Decide between Direct Hire or Tavara Subscription", completed: false, link: "/family/schedule-visit", category: "conversion" }
        ];
      case 'professional':
        return [
          { id: 1, title: "Create your account", description: "Set up your Tavara account", completed: true, link: "/auth" },
          { id: 2, title: "Complete your professional profile", description: "Add your experience and certifications", completed: false, link: "/registration/professional" },
          { id: 3, title: "Upload certifications & documents", description: "Verify your credentials", completed: false, link: "/professional/profile" },
          { id: 4, title: "Set your availability preferences", description: "Configure your work schedule", completed: false, link: "/professional/profile" },
          { id: 5, title: "Complete training modules", description: "Enhance your skills", completed: false, link: "/professional/training" },
          { id: 6, title: "Schedule orientation session", description: "Complete your onboarding", completed: false, link: "/professional/profile" }
        ];
      case 'community':
        return [
          { id: 1, title: "Complete your profile", description: "Add your contact information", completed: false, link: "/registration/community" },
          { id: 2, title: "Tell us about your interests", description: "Share how you'd like to help", completed: false, link: "/community/interests" },
          { id: 3, title: "Join community activities", description: "Start supporting families", completed: false, link: "/community/activities" }
        ];
      case 'admin':
        return [
          { id: 1, title: "Admin account setup", description: "Configure admin settings", completed: false, link: "/admin/dashboard" },
          { id: 2, title: "System configuration", description: "Set up system preferences", completed: false, link: "/admin/settings" }
        ];
      default:
        return [{ id: 1, title: "Getting Started", description: "Complete your profile", completed: false, link: "/dashboard" }];
    }
  };

  const checkStepCompletion = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profile) return;

      let updatedSteps = getStepsForRole(userRole);

      if (userRole === 'family') {
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
        const { data: carePlans } = await supabase
          .from('care_plans')
          .select('id')
          .eq('family_id', userId);

        // Check medications
        const { data: medications } = await supabase
          .from('medications')
          .select('id')
          .in('care_plan_id', (carePlans || []).map(cp => cp.id));

        // Check meal plans
        const { data: mealPlans } = await supabase
          .from('meal_plans')
          .select('id')
          .in('care_plan_id', (carePlans || []).map(cp => cp.id));

        // Check trial payments
        const { data: trialPayments } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('user_id', userId)
          .eq('transaction_type', 'trial_day')
          .eq('status', 'completed');

        // Parse visit notes for care model
        let visitNotes = null;
        try {
          visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
        } catch (error) {
          console.error('Error parsing visit notes:', error);
        }

        // Mark steps as completed
        if (profile.full_name) updatedSteps[0].completed = true;
        if (careAssessment) updatedSteps[1].completed = true;
        if (careRecipient && careRecipient.full_name) updatedSteps[2].completed = true;
        if (careRecipient) updatedSteps[3].completed = true;
        if (medications && medications.length > 0) updatedSteps[4].completed = true;
        if (mealPlans && mealPlans.length > 0) updatedSteps[5].completed = true;
        if (profile.visit_scheduling_status === 'scheduled' || profile.visit_scheduling_status === 'completed') updatedSteps[6].completed = true;
        if (profile.visit_scheduling_status === 'completed') updatedSteps[7].completed = true;
        
        const hasTrialPayment = trialPayments && trialPayments.length > 0;
        if (hasTrialPayment) {
          updatedSteps[8].completed = true;  // Schedule trial
          updatedSteps[9].completed = true;  // Pay for trial
          updatedSteps[10].completed = true; // Begin trial
        }
        
        if (visitNotes?.care_model) updatedSteps[11].completed = true;

        // Determine journey stage
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

      } else if (userRole === 'professional') {
        // Check documents
        const { data: documents } = await supabase
          .from('professional_documents')
          .select('id')
          .eq('user_id', userId);

        // Mark steps as completed
        updatedSteps[0].completed = true; // Account always completed
        if (profile.professional_type && profile.years_of_experience) updatedSteps[1].completed = true;
        if (documents && documents.length > 0) updatedSteps[2].completed = true;
        if (profile.availability && profile.availability.length > 0) updatedSteps[3].completed = true;

      } else if (userRole === 'community') {
        // Mark steps as completed for community
        if (profile.full_name) updatedSteps[0].completed = true;
        if (profile.contribution_interests && profile.contribution_interests.length > 0) updatedSteps[1].completed = true;
      } else if (userRole === 'admin') {
        // Mark admin steps as completed based on admin-specific criteria
        if (profile.full_name) updatedSteps[0].completed = true;
        updatedSteps[1].completed = true; // Assume system config is done for existing admins
      }

      setSteps(updatedSteps);
    } catch (error) {
      console.error("Error checking user journey progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      checkStepCompletion();
    }
  }, [userId, userRole]);

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const nextStep = steps.find(step => !step.completed);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading,
    journeyStage
  };
};
