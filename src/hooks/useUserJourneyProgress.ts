
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
}

interface UserJourneyData {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  loading: boolean;
}

export const useUserJourneyProgress = (userId: string, userRole: string): UserJourneyData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  const getStepsForRole = (role: string): JourneyStep[] => {
    switch (role) {
      case 'family':
        return [
          { id: 1, title: "Complete your profile", description: "Add your contact information and preferences", completed: false, link: "/registration/family" },
          { id: 2, title: "Complete initial care assessment", description: "Help us understand your care needs better", completed: false, link: "/family/care-assessment" },
          { id: 3, title: "Complete your loved one's Legacy Story", description: "Share their story to personalize care", completed: false, link: "/family/story" },
          { id: 4, title: "See your instant caregiver matches", description: "View personalized caregiver recommendations", completed: false, link: "/caregiver-matching" },
          { id: 5, title: "Set up medication management", description: "Add medications and schedules", completed: false, link: "/family/care-management" },
          { id: 6, title: "Set up meal management", description: "Plan meals and create grocery lists", completed: false, link: "/family/care-management" },
          { id: 7, title: "Schedule your Visit", description: "Meet your care coordinator", completed: false, link: "/family/schedule-visit" }
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

        // Mark steps as completed
        if (profile.full_name) updatedSteps[0].completed = true;
        if (careAssessment) updatedSteps[1].completed = true;
        if (careRecipient && careRecipient.full_name) updatedSteps[2].completed = true;
        if (careRecipient) updatedSteps[3].completed = true;
        if (medications && medications.length > 0) updatedSteps[4].completed = true;
        if (mealPlans && mealPlans.length > 0) updatedSteps[5].completed = true;

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
    loading
  };
};
