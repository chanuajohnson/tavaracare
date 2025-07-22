
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSharedFamilyJourneyData } from '@/hooks/useSharedFamilyJourneyData';
import { useStoredJourneyProgress } from '@/hooks/useStoredJourneyProgress';
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
  // Use stored progress as primary source for all roles
  const storedProgress = useStoredJourneyProgress(userId, userRole);
  
  // Use shared family data for family users (as fallback for detailed steps)
  const familyProgress = useSharedFamilyJourneyData(userRole === 'family' ? userId : '');
  
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [journeyStage, setJourneyStage] = useState<string>('foundation');

  console.log('🔍 User Journey Progress Data:', {
    userId,
    userRole,
    storedPercentage: storedProgress.completionPercentage,
    familyPercentage: familyProgress.completionPercentage,
    usingStored: storedProgress.completionPercentage > 0
  });

  // If this is a family user, return the shared family data with stored progress if available
  if (userRole === 'family') {
    const convertedSteps = familyProgress.steps.map(step => ({
      ...step,
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
            step.id === 12 ? "/family/schedule-visit" : "/dashboard"
    }));

    // Use stored completion percentage if available, otherwise use calculated
    const completionPercentage = storedProgress.completionPercentage > 0 
      ? storedProgress.completionPercentage 
      : familyProgress.completionPercentage;

    return {
      steps: convertedSteps,
      completionPercentage,
      nextStep: familyProgress.nextStep ? {
        ...familyProgress.nextStep,
        link: convertedSteps.find(s => s.id === familyProgress.nextStep?.id)?.link || "/dashboard"
      } : undefined,
      loading: familyProgress.loading || storedProgress.loading,
      journeyStage: familyProgress.journeyStage
    };
  }

  // For non-family users, use stored progress primarily and supplement with calculated data
  const getStepsForRole = (role: UserRole): JourneyStep[] => {
    switch (role) {
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

  const calculatedCompletedSteps = steps.filter(step => step.completed).length;
  const calculatedCompletionPercentage = steps.length > 0 ? Math.round((calculatedCompletedSteps / steps.length) * 100) : 0;
  
  // Use stored completion percentage if available, otherwise calculate from steps
  const completionPercentage = storedProgress.completionPercentage > 0 
    ? storedProgress.completionPercentage 
    : calculatedCompletionPercentage;
    
  const nextStep = steps.find(step => !step.completed);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading: loading || storedProgress.loading,
    journeyStage
  };
};
