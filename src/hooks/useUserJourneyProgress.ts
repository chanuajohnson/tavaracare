import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSharedFamilyJourneyData } from '@/hooks/useSharedFamilyJourneyData';
import type { UserRole } from '@/types/userRoles';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  accessible?: boolean;
  step_number: number;
  link: string;
  category?: string;
  optional?: boolean;
  icon_name?: string;
  tooltip_content?: string;
  detailed_explanation?: string;
  link_path?: string;
  time_estimate_minutes?: number;
  is_optional?: boolean;
}

interface UserJourneyData {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  loading: boolean;
  journeyStage?: string;
}

export const useUserJourneyProgress = (userId: string, userRole: UserRole): UserJourneyData => {
  // Use shared family data for family users
  const familyProgress = useSharedFamilyJourneyData(userRole === 'family' ? userId : '');
  
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [journeyStage, setJourneyStage] = useState<string>('foundation');

  // If this is a family user, return the shared family data
  if (userRole === 'family') {
    const convertedSteps = familyProgress.steps.map(step => ({
      ...step,
      accessible: step.accessible !== undefined ? step.accessible : true,
      step_number: step.id,
      link: step.id === 1 ? "/registration/family" :
            step.id === 2 ? "/family/care-assessment" :
            step.id === 3 ? "/family/story" :
            step.id === 4 ? "/caregiver/matching" :
            step.id === 5 ? "/family/care-management" :
            step.id === 6 ? "/family/care-management" :
            step.id === 7 ? "/family/schedule-visit" :
            step.id === 8 ? "/family/schedule-visit" :
            step.id === 9 ? "/family/schedule-visit" :
            step.id === 10 ? "/family/schedule-visit" :
            step.id === 11 ? "/family/schedule-visit" :
            step.id === 12 ? "/family/schedule-visit" : "/dashboard",
      time_estimate_minutes: step.time_estimate_minutes,
      is_optional: step.is_optional || false
    }));

    return {
      steps: convertedSteps,
      completionPercentage: familyProgress.completionPercentage,
      nextStep: familyProgress.nextStep ? {
        ...familyProgress.nextStep,
        accessible: true,
        step_number: familyProgress.nextStep.id,
        link: convertedSteps.find(s => s.id === familyProgress.nextStep?.id)?.link || "/dashboard",
        time_estimate_minutes: familyProgress.nextStep.time_estimate_minutes,
        is_optional: familyProgress.nextStep.is_optional || false
      } : undefined,
      loading: familyProgress.loading,
      journeyStage: familyProgress.journeyStage
    };
  }

  // For non-family users, keep the existing logic
  const getStepsForRole = (role: UserRole): JourneyStep[] => {
    switch (role) {
      case 'professional':
        return [
          { id: 1, title: "Create your account", description: "Set up your Tavara account", completed: true, accessible: true, step_number: 1, link: "/auth", time_estimate_minutes: 5, is_optional: false },
          { id: 2, title: "Complete your professional profile", description: "Add your experience and certifications", completed: false, accessible: true, step_number: 2, link: "/registration/professional", time_estimate_minutes: 15, is_optional: false },
          { id: 3, title: "Upload certifications & documents", description: "Verify your credentials", completed: false, accessible: true, step_number: 3, link: "/professional/profile", time_estimate_minutes: 10, is_optional: false },
          { id: 4, title: "Set your availability preferences", description: "Configure your work schedule", completed: false, accessible: true, step_number: 4, link: "/professional/profile", time_estimate_minutes: 5, is_optional: false },
          { id: 5, title: "Complete training modules", description: "Enhance your skills", completed: false, accessible: true, step_number: 5, link: "/professional/training", time_estimate_minutes: 30, is_optional: true },
          { id: 6, title: "Schedule orientation session", description: "Complete your onboarding", completed: false, accessible: true, step_number: 6, link: "/professional/profile", time_estimate_minutes: 20, is_optional: false }
        ];
      case 'community':
        return [
          { id: 1, title: "Complete your profile", description: "Add your contact information", completed: false, accessible: true, step_number: 1, link: "/registration/community", time_estimate_minutes: 10, is_optional: false },
          { id: 2, title: "Tell us about your interests", description: "Share how you'd like to help", completed: false, accessible: true, step_number: 2, link: "/community/interests", time_estimate_minutes: 5, is_optional: false },
          { id: 3, title: "Join community activities", description: "Start supporting families", completed: false, accessible: true, step_number: 3, link: "/community/activities", time_estimate_minutes: 15, is_optional: true }
        ];
      case 'admin':
        return [
          { id: 1, title: "Admin account setup", description: "Configure admin settings", completed: false, accessible: true, step_number: 1, link: "/admin/dashboard", time_estimate_minutes: 10, is_optional: false },
          { id: 2, title: "System configuration", description: "Set up system preferences", completed: false, accessible: true, step_number: 2, link: "/admin/settings", time_estimate_minutes: 20, is_optional: false }
        ];
      default:
        return [{ id: 1, title: "Getting Started", description: "Complete your profile", completed: false, accessible: true, step_number: 1, link: "/dashboard", time_estimate_minutes: 5, is_optional: false }];
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

      if (userRole === 'professional') {
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
    // Since family users are handled above with early return, 
    // this useEffect only runs for non-family users
    if (userId) {
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
