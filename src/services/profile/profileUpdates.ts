
import { supabase } from "@/lib/supabase";
import { OnboardingProgress } from "@/types/profile";

/**
 * Update the onboarding progress for a user's profile
 * @param userId The user ID
 * @param step The step that was completed
 * @param completed Whether the step is completed
 * @returns Promise indicating success or failure
 */
export const updateProfileOnboardingProgress = async (
  userId: string,
  step: string,
  completed: boolean
): Promise<boolean> => {
  try {
    // First get the current profile to access existing onboarding progress
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('onboarding_progress')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching profile onboarding progress:", fetchError);
      return false;
    }

    // Get existing onboarding progress or initialize a new object
    let existingProgress: OnboardingProgress = {};
    
    if (profile?.onboarding_progress) {
      // Handle both string and object formats
      if (typeof profile.onboarding_progress === 'string') {
        try {
          existingProgress = JSON.parse(profile.onboarding_progress);
        } catch (e) {
          console.error("Error parsing onboarding_progress string:", e);
          existingProgress = {};
        }
      } else if (typeof profile.onboarding_progress === 'object') {
        existingProgress = profile.onboarding_progress as OnboardingProgress;
      }
    }
    
    // Safely update the completed steps
    const completedSteps = existingProgress.completedSteps || {};
    const updatedProgress: OnboardingProgress = {
      ...existingProgress,
      completedSteps: {
        ...completedSteps,
        [step]: completed
      }
    };

    // Update the profile with the new onboarding progress
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_progress: updatedProgress,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error("Error updating profile onboarding progress:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating profile onboarding progress:", error);
    return false;
  }
};
