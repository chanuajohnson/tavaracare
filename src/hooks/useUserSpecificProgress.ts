
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  is_optional: boolean;
  completed: boolean;
  accessible: boolean;
}

interface UserSpecificProgressData {
  steps: JourneyStep[];
  completionPercentage: number;
  nextStep?: JourneyStep;
  loading: boolean;
}

const isValidCategory = (category: string): category is 'foundation' | 'scheduling' | 'trial' | 'conversion' => {
  return ['foundation', 'scheduling', 'trial', 'conversion'].includes(category);
};

export const useUserSpecificProgress = (userId: string, userRole: string): UserSpecificProgressData => {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  useEffect(() => {
    if (!userId || !userRole) return;
    
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        
        // Fetch journey steps for the user role
        const { data: journeySteps, error: stepsError } = await supabase
          .from('journey_steps')
          .select('*')
          .eq('user_role', userRole)
          .eq('is_active', true)
          .order('order_index');

        if (stepsError) throw stepsError;

        // Get user profile data for completion checking
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // Get additional completion data based on user role
        let completionData = {};
        
        if (userRole === 'family') {
          const [careAssessment, careRecipient, carePlans, medications, mealPlans] = await Promise.all([
            supabase.from('care_needs_family').select('id').eq('profile_id', userId).maybeSingle(),
            supabase.from('care_recipient_profiles').select('*').eq('user_id', userId).maybeSingle(),
            supabase.from('care_plans').select('id, title').eq('family_id', userId),
            supabase.from('medications').select('id').eq('care_plan_id', userId),
            supabase.from('meal_plans').select('id').eq('care_plan_id', userId)
          ]);
          
          completionData = {
            careAssessment: careAssessment.data,
            careRecipient: careRecipient.data,
            carePlans: carePlans.data || [],
            medications: medications.data || [],
            mealPlans: mealPlans.data || []
          };
        }

        // Process steps with completion status
        const processedSteps = journeySteps?.map(step => {
          let completed = false;
          
          // Check completion based on step number and user role
          if (userRole === 'family') {
            switch (step.step_number) {
              case 1:
                completed = !!(profile?.full_name);
                break;
              case 2:
                completed = !!(completionData as any).careAssessment;
                break;
              case 3:
                completed = !!((completionData as any).careRecipient?.full_name);
                break;
              case 4:
                completed = !!(completionData as any).careRecipient;
                break;
              case 5:
                completed = ((completionData as any).medications?.length || 0) > 0;
                break;
              case 6:
                completed = ((completionData as any).mealPlans?.length || 0) > 0;
                break;
              case 7:
                completed = profile?.visit_scheduling_status === 'scheduled' || profile?.visit_scheduling_status === 'completed';
                break;
              case 8:
                completed = profile?.visit_scheduling_status === 'completed';
                break;
              default:
                completed = false;
            }
          } else if (userRole === 'professional') {
            // Use onboarding_progress field for professional users
            const onboardingProgress = profile?.onboarding_progress || {};
            completed = onboardingProgress[step.step_number.toString()] === true;
          } else if (userRole === 'community') {
            // Basic completion logic for community users
            switch (step.step_number) {
              case 1:
                completed = !!(profile?.full_name);
                break;
              case 2:
                completed = !!(profile?.location);
                break;
              case 3:
                completed = !!(profile?.phone_number);
                break;
              default:
                completed = false;
            }
          }

          // Ensure category is valid, fallback to 'foundation' if not
          const validCategory = isValidCategory(step.category) ? step.category : 'foundation';

          return {
            id: step.id,
            step_number: step.step_number,
            title: step.title,
            description: step.description,
            category: validCategory,
            is_optional: step.is_optional || false,
            completed,
            accessible: true // For admin view, all steps are accessible to see
          };
        }) || [];

        setSteps(processedSteps);
        
      } catch (error) {
        console.error("Error fetching user-specific progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, [userId, userRole]);

  const completedSteps = steps.filter(step => step.completed).length;
  const completionPercentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;
  const nextStep = steps.find(step => !step.completed && step.accessible);

  return {
    steps,
    completionPercentage,
    nextStep,
    loading
  };
};
