
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { updateProfileOnboardingProgress } from "@/services/profile/profileUpdates";

/**
 * Fetch care needs for a family profile
 */
export const fetchFamilyCareNeeds = async (profileId: string) => {
  try {
    console.log("Fetching care needs for profile:", profileId);
    const { data, error } = await supabase
      .from('care_needs_family')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    console.log("Fetched care needs data:", data);
    
    // If data exists, return it; otherwise return an empty object
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
export const saveFamilyCareNeeds = async (careNeeds) => {
  try {
    const { profileId, ...careNeedsData } = careNeeds;
    
    const dbCareNeeds = {
      profile_id: profileId,
      daily_living: careNeedsData.dailyLiving || {},
      cognitive_memory: careNeedsData.cognitiveMemory || {},
      medical_conditions: careNeedsData.medicalConditions || {},
      emergency: careNeedsData.emergency || {},
      housekeeping: careNeedsData.housekeeping || {},
      shift_preferences: careNeedsData.shiftPreferences || {},
      updated_at: new Date().toISOString()
    };
    
    console.log("Saving care needs to DB:", dbCareNeeds);

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
      console.log("Updating existing care needs with ID:", existingData.id);
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
      console.log("Creating new care needs record");
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

    console.log("Saved care needs result:", result);

    // Update onboarding progress
    try {
      await updateProfileOnboardingProgress(dbCareNeeds.profile_id, 'care_needs', true);
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

// Helper function to convert from database format to application format
const adaptFamilyCareNeedsFromDb = (dbData) => {
  return {
    id: dbData.id,
    profileId: dbData.profile_id,
    dailyLiving: dbData.daily_living || {},
    cognitiveMemory: dbData.cognitive_memory || {},
    medicalConditions: dbData.medical_conditions || {},
    emergency: dbData.emergency || {},
    housekeeping: dbData.housekeeping || {},
    shiftPreferences: dbData.shift_preferences || {},
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  };
};
