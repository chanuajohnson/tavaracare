import { supabase } from "@/lib/supabase";

export interface UserReadinessStatus {
  isReady: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export interface FamilyReadinessCriteria {
  full_name: boolean;
  care_recipient_name: boolean;
  care_types: boolean;
  phone_number: boolean;
}

export interface ProfessionalReadinessCriteria {
  full_name: boolean;
  care_types: boolean;
  years_of_experience: boolean;
  phone_number: boolean;
}

/**
 * Check if a family user is ready for matching
 */
export const checkFamilyUserReadiness = (profile: any): UserReadinessStatus => {
  const criteria: FamilyReadinessCriteria = {
    full_name: !!profile.full_name,
    care_recipient_name: !!profile.care_recipient_name,
    care_types: Array.isArray(profile.care_types) && profile.care_types.length > 0,
    phone_number: !!profile.phone_number,
  };

  const missingFields: string[] = [];
  let completedFields = 0;
  const totalFields = Object.keys(criteria).length;

  Object.entries(criteria).forEach(([field, isComplete]) => {
    if (isComplete) {
      completedFields++;
    } else {
      missingFields.push(field);
    }
  });

  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  const isReady = completedFields === totalFields;

  return {
    isReady,
    missingFields,
    completionPercentage,
  };
};

/**
 * Check if a professional user is ready for matching
 */
export const checkProfessionalUserReadiness = (profile: any): UserReadinessStatus => {
  const criteria: ProfessionalReadinessCriteria = {
    full_name: !!profile.full_name,
    care_types: Array.isArray(profile.care_types) && profile.care_types.length > 0,
    years_of_experience: !!profile.years_of_experience,
    phone_number: !!profile.phone_number,
  };

  const missingFields: string[] = [];
  let completedFields = 0;
  const totalFields = Object.keys(criteria).length;

  Object.entries(criteria).forEach(([field, isComplete]) => {
    if (isComplete) {
      completedFields++;
    } else {
      missingFields.push(field);
    }
  });

  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  const isReady = completedFields === totalFields;

  return {
    isReady,
    missingFields,
    completionPercentage,
  };
};

/**
 * Get ready family users for professional matching
 */
export const getReadyFamilyUsers = async (limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'family')
      .not('full_name', 'is', null)
      .not('care_recipient_name', 'is', null)
      .not('phone_number', 'is', null)
      .limit(limit);

    if (error) {
      console.error("[getReadyFamilyUsers] Error:", error);
      return [];
    }

    // Further filter by care_types array not being empty
    const readyUsers = (data || []).filter(profile => {
      const readiness = checkFamilyUserReadiness(profile);
      return readiness.isReady;
    });

    return readyUsers;
  } catch (error) {
    console.error("[getReadyFamilyUsers] Exception:", error);
    return [];
  }
};

/**
 * Get ready professional users for family matching
 */
export const getReadyProfessionalUsers = async (limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'professional')
      .not('full_name', 'is', null)
      .not('phone_number', 'is', null)
      .limit(limit);

    if (error) {
      console.error("[getReadyProfessionalUsers] Error:", error);
      return [];
    }

    // Further filter by care_types and years_of_experience
    const readyUsers = (data || []).filter(profile => {
      const readiness = checkProfessionalUserReadiness(profile);
      return readiness.isReady;
    });

    return readyUsers;
  } catch (error) {
    console.error("[getReadyProfessionalUsers] Exception:", error);
    return [];
  }
};

/**
 * Check if current user is ready for matching
 */
export const checkCurrentUserReadiness = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      console.error("[checkCurrentUserReadiness] Error:", error);
      return { isReady: false, missingFields: ['profile'], completionPercentage: 0 };
    }

    if (profile.role === 'family') {
      return checkFamilyUserReadiness(profile);
    } else if (profile.role === 'professional') {
      return checkProfessionalUserReadiness(profile);
    }

    return { isReady: false, missingFields: ['role'], completionPercentage: 0 };
  } catch (error) {
    console.error("[checkCurrentUserReadiness] Exception:", error);
    return { isReady: false, missingFields: ['error'], completionPercentage: 0 };
  }
};
