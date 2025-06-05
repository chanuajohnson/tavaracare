
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/userRoles';

interface ProgressStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  link: string;
}

interface UserSpecificProgressData {
  steps: ProgressStep[];
  completionPercentage: number;
  nextStep?: ProgressStep;
  loading: boolean;
}

export const useUserSpecificProgress = (userId: string, userRole: UserRole): UserSpecificProgressData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<ProgressStep[]>([]);

  const getStepsForRole = (role: UserRole): ProgressStep[] => {
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
          { id: 1, title: "Admin account setup", description: "Configure admin settings", completed: true, link: "/admin/dashboard" },
          { id: 2, title: "System configuration", description: "Set up system preferences", completed: true, link: "/admin/settings" }
        ];
      default:
        return [{ id: 1, title: "Getting Started", description: "Complete your profile", completed: false, link: "/dashboard" }];
    }
  };

  const checkStepCompletion = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log(`[useUserSpecificProgress] Checking progress for user ${userId} with role ${userRole}`);
      
      let updatedSteps = getStepsForRole(userRole);

      if (userRole === 'family') {
        // Enhanced data fetching with better error handling
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', userId)
          .maybeSingle();

        console.log(`[useUserSpecificProgress] Family profile data:`, profile);

        // Check care assessment
        const { data: careAssessment } = await supabase
          .from('care_needs_family')
          .select('id')
          .eq('profile_id', userId)
          .maybeSingle();

        console.log(`[useUserSpecificProgress] Care assessment:`, careAssessment);

        // Check care recipient profile
        const { data: careRecipient } = await supabase
          .from('care_recipient_profiles')
          .select('id, full_name')
          .eq('user_id', userId)
          .maybeSingle();

        console.log(`[useUserSpecificProgress] Care recipient:`, careRecipient);

        // Check care plans
        const { data: carePlans } = await supabase
          .from('care_plans')
          .select('id')
          .eq('family_id', userId);

        console.log(`[useUserSpecificProgress] Care plans:`, carePlans);

        // Check medications (improved query with proper error handling)
        let medications = [];
        if (carePlans && carePlans.length > 0) {
          const { data: medicationData } = await supabase
            .from('medications')
            .select('id')
            .in('care_plan_id', carePlans.map(cp => cp.id));
          medications = medicationData || [];
        }

        console.log(`[useUserSpecificProgress] Medications:`, medications);

        // Check meal plans (improved query with proper error handling)
        let mealPlans = [];
        if (carePlans && carePlans.length > 0) {
          const { data: mealPlanData } = await supabase
            .from('meal_plans')
            .select('id')
            .in('care_plan_id', carePlans.map(cp => cp.id));
          mealPlans = mealPlanData || [];
        }

        console.log(`[useUserSpecificProgress] Meal plans:`, mealPlans);

        // Mark steps as completed based on data availability
        if (userId && profile?.full_name) {
          updatedSteps[0].completed = true;
          console.log(`[useUserSpecificProgress] Step 1 completed: profile exists with full_name`);
        }
        
        if (careAssessment) {
          updatedSteps[1].completed = true;
          console.log(`[useUserSpecificProgress] Step 2 completed: care assessment exists`);
        }
        
        if (careRecipient && careRecipient.full_name) {
          updatedSteps[2].completed = true;
          console.log(`[useUserSpecificProgress] Step 3 completed: care recipient has full_name`);
        }
        
        if (careRecipient) {
          updatedSteps[3].completed = true;
          console.log(`[useUserSpecificProgress] Step 4 completed: care recipient exists`);
        }
        
        if (medications && medications.length > 0) {
          updatedSteps[4].completed = true;
          console.log(`[useUserSpecificProgress] Step 5 completed: medications exist`);
        }
        
        if (mealPlans && mealPlans.length > 0) {
          updatedSteps[5].completed = true;
          console.log(`[useUserSpecificProgress] Step 6 completed: meal plans exist`);
        }
        
      } else if (userRole === 'professional') {
        // Enhanced professional progress logic
        const { data: profile } = await supabase
          .from('profiles')
          .select('professional_type, years_of_experience, certifications, availability')
          .eq('id', userId)
          .maybeSingle();

        console.log(`[useUserSpecificProgress] Professional profile data:`, profile);

        // Check documents
        const { data: documents } = await supabase
          .from('professional_documents')
          .select('id')
          .eq('user_id', userId);

        console.log(`[useUserSpecificProgress] Professional documents:`, documents);

        // Mark steps as completed
        updatedSteps[0].completed = true; // Account always completed
        
        if (profile && profile.professional_type && profile.years_of_experience) {
          updatedSteps[1].completed = true;
          console.log(`[useUserSpecificProgress] Step 2 completed: professional profile complete`);
        }
        
        if (documents && documents.length > 0) {
          updatedSteps[2].completed = true;
          console.log(`[useUserSpecificProgress] Step 3 completed: documents uploaded`);
        }
        
        if (profile && profile.availability && profile.availability.length > 0) {
          updatedSteps[3].completed = true;
          console.log(`[useUserSpecificProgress] Step 4 completed: availability set`);
        }
        
      } else if (userRole === 'community') {
        // Community progress logic
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, contribution_interests')
          .eq('id', userId)
          .maybeSingle();

        console.log(`[useUserSpecificProgress] Community profile data:`, profile);

        if (userId && profile?.full_name) {
          updatedSteps[0].completed = true;
          console.log(`[useUserSpecificProgress] Step 1 completed: community profile exists with full_name`);
        }
        
        if (profile && profile.contribution_interests && profile.contribution_interests.length > 0) {
          updatedSteps[1].completed = true;
          console.log(`[useUserSpecificProgress] Step 2 completed: contribution interests set`);
        }
        
      } else if (userRole === 'admin') {
        // Admin steps are typically completed
        updatedSteps[0].completed = true;
        updatedSteps[1].completed = true;
        console.log(`[useUserSpecificProgress] Admin steps completed`);
      }

      const completedCount = updatedSteps.filter(step => step.completed).length;
      const calculatedPercentage = updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0;
      
      console.log(`[useUserSpecificProgress] Final calculation: ${completedCount}/${updatedSteps.length} = ${calculatedPercentage}%`);
      
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
