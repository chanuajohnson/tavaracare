
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { FamilyCareNeeds } from "@/types/carePlan";
import { adaptFamilyCareNeedsFromDb, adaptFamilyCareNeedsToDb } from "@/adapters/familyCareNeedsAdapter";
import { updateOnboardingProgress } from "@/services/profileService";

/**
 * Fetch care needs for a family profile
 */
export const fetchFamilyCareNeeds = async (profileId: string): Promise<FamilyCareNeeds | null> => {
  try {
    const { data, error } = await supabase
      .from('care_needs_family')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? adaptFamilyCareNeedsFromDb(data) : null;
  } catch (error) {
    console.error("Error fetching family care needs:", error);
    toast.error("Failed to load care needs data");
    return null;
  }
};

/**
 * Save care needs for a family profile
 */
export const saveFamilyCareNeeds = async (careNeeds: FamilyCareNeeds): Promise<FamilyCareNeeds | null> => {
  try {
    const dbCareNeeds = adaptFamilyCareNeedsToDb(careNeeds);

    // Check if record exists
    const { data: existingData, error: checkError } = await supabase
      .from('care_needs_family')
      .select('id')
      .eq('profile_id', dbCareNeeds.profile_id)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    let result;

    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from('care_needs_family')
        .update(dbCareNeeds)
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      result = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('care_needs_family')
        .insert([dbCareNeeds])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      result = data;
    }

    // Update onboarding progress
    try {
      await updateOnboardingProgress(dbCareNeeds.profile_id, {
        currentStep: 'care_plan',
        completedSteps: {
          care_needs: true
        }
      });
    } catch (progressError) {
      console.warn("Could not update onboarding progress:", progressError);
    }

    toast.success("Care needs saved successfully");
    return adaptFamilyCareNeedsFromDb(result);
  } catch (error) {
    console.error("Error saving family care needs:", error);
    toast.error("Failed to save care needs data");
    return null;
  }
};

/**
 * Create a draft care plan from family care needs
 * 
 * @param careNeeds - The family care needs data
 * @param profileData - Additional profile data like care recipient name
 */
export const generateDraftCarePlanFromCareNeeds = (
  careNeeds: FamilyCareNeeds, 
  profileData: { 
    careRecipientName?: string;
    relationship?: string;
    careTypes?: string[];
  }
): {
  title: string;
  description: string;
  planType: 'scheduled' | 'on-demand' | 'both';
  metadata: {
    weekdayCoverage?: string;
    weekendCoverage?: string;
    customShifts?: Array<{
      days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
      startTime: string;
      endTime: string;
      title?: string;
    }>;
  };
} => {
  // Extract first name if full name is provided
  const recipientName = profileData.careRecipientName 
    ? profileData.careRecipientName.split(' ')[0] 
    : 'Care Recipient';

  // Build descriptive elements based on selected needs
  const adlNeeds = [];
  if (careNeeds.assistanceBathing) adlNeeds.push('bathing');
  if (careNeeds.assistanceDressing) adlNeeds.push('dressing');
  if (careNeeds.assistanceToileting) adlNeeds.push('toileting');
  if (careNeeds.assistanceFeeding) adlNeeds.push('feeding');
  if (careNeeds.assistanceMobility) adlNeeds.push('mobility assistance');
  
  const specialCare = [];
  if (careNeeds.dementiaRedirection) specialCare.push('dementia care');
  if (careNeeds.memoryReminders) specialCare.push('memory support');
  if (careNeeds.fallMonitoring) specialCare.push('fall prevention');

  // Create a description from the care needs - structured format that will be parsed by the UI
  let description = `Care plan for ${recipientName}`;
  if (profileData.relationship) {
    description += ` (${profileData.relationship})`;
  }
  description += ". ";
  
  if (careNeeds.diagnosedConditions) {
    description += `Medical conditions: ${careNeeds.diagnosedConditions}. `;
  }
  
  if (adlNeeds.length > 0) {
    description += `Assistance needed with: ${adlNeeds.join(', ')}. `;
  }
  
  if (specialCare.length > 0) {
    description += `Special care: ${specialCare.join(', ')}. `;
  }
  
  if (careNeeds.cognitiveNotes) {
    description += `Cognitive notes: ${careNeeds.cognitiveNotes}. `;
  }
  
  if (careNeeds.additionalNotes) {
    description += `Additional notes: ${careNeeds.additionalNotes}`;
  }

  // Determine plan type based on preferences
  // Use the explicitly selected plan type if available, otherwise infer from coverage preferences
  let planType: 'scheduled' | 'on-demand' | 'both' = careNeeds.planType || 'scheduled';
  
  // Only infer plan type if not explicitly selected
  if (!careNeeds.planType) {
    // Default to scheduled care unless explicitly set to on-demand
    if (careNeeds.weekdayCoverage === 'none' && careNeeds.weekendCoverage === 'no') {
      planType = 'on-demand';
    }
  }

  return {
    title: `Care Plan for ${recipientName}`,
    description: description,
    planType: planType,
    metadata: {
      weekdayCoverage: careNeeds.weekdayCoverage,
      weekendCoverage: careNeeds.weekendCoverage,
      customShifts: []  // We don't need custom shifts from care needs anymore
    }
  };
};
