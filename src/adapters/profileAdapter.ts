.
import { Profile } from "../types/profile";
import type { DbProfile, DbProfileInsert } from "../types/profile";
import { fromJson, toJson } from "../utils/json";

/**
 * Parse care schedule from various formats to ensure consistency
 */
const parseCareSchedule = (scheduleData: any): string => {
  if (!scheduleData) return '';
  
  // If it's already a string, return as-is
  if (typeof scheduleData === 'string') {
    return scheduleData;
  }
  
  // If it's an array, join with commas
  if (Array.isArray(scheduleData)) {
    return scheduleData.join(',');
  }
  
  // Try to parse as JSON if it looks like JSON
  try {
    const parsed = JSON.parse(scheduleData);
    if (Array.isArray(parsed)) {
      return parsed.join(',');
    }
    return String(parsed);
  } catch {
    return String(scheduleData);
  }
};

/**
 * Parse care schedule string to array for frontend use
 */
const parseCareScheduleToArray = (scheduleString: string | null | undefined): string[] => {
  if (!scheduleString) return [];
  
  try {
    // Try parsing as JSON first (for backward compatibility)
    const parsed = JSON.parse(scheduleString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Parse as comma-separated string
    return scheduleString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
};

/**
 * Adapts a frontend Profile to a database-ready object
 */
export function adaptProfileToDb(profile: Partial<Profile>): DbProfileInsert {
  return {
    id: profile.id!,
    role: profile.role!,
    full_name: profile.fullName || "",
    avatar_url: profile.avatarUrl,
    phone_number: profile.phoneNumber,
    address: profile.address,
    
    // Family-specific fields
    care_recipient_name: profile.careRecipientName,
    relationship: profile.relationship,
    care_types: profile.careTypes,
    special_needs: profile.specialNeeds,
    specialized_care: profile.specializedCare,
    other_special_needs: profile.otherSpecialNeeds,
    caregiver_type: profile.caregiverType,
    preferred_contact_method: profile.preferredContactMethod,
    care_schedule: parseCareSchedule(profile.careSchedule), // Ensure consistent format
    budget_preferences: profile.budgetPreferences,
    caregiver_preferences: profile.caregiverPreferences,
    additional_notes: profile.additionalNotes,
    
    // Professional-specific fields
    professional_type: profile.professionalType,
    license_number: profile.licenseNumber,
    certifications: profile.certifications,
    other_certification: profile.otherCertification,
    certification_proof_url: profile.certificationProofUrl,
    care_services: profile.careServices,
    languages: profile.languages,
    years_of_experience: profile.yearsOfExperience,
    work_type: profile.workType,
    availability: profile.availability,
    background_check: profile.backgroundCheck,
    background_check_proof_url: profile.backgroundCheckProofUrl,
    legally_authorized: profile.legallyAuthorized,
    expected_rate: profile.expectedRate,
    payment_methods: profile.paymentMethods,
    bio: profile.bio,
    why_choose_caregiving: profile.whyChooseCaregiving,
    preferred_work_locations: profile.preferredWorkLocations,
    commute_mode: profile.commuteMode,
    list_in_directory: profile.listInDirectory,
    enable_job_alerts: profile.enableJobAlerts,
    job_notification_method: profile.jobNotificationMethod,
    job_matching_criteria: profile.jobMatchingCriteria,
    custom_availability_alerts: profile.customAvailabilityAlerts,
    has_training: profile.hasTraining,
    
    // Community-specific fields
    location: profile.location,
    website: profile.website,
    community_roles: profile.communityRoles,
    contribution_interests: profile.contributionInterests,
    caregiving_experience: profile.caregivingExperience,
    caregiving_areas: profile.caregivingAreas,
    tech_interests: profile.techInterests,
    involvement_preferences: profile.involvementPreferences,
    communication_channels: profile.communicationChannels,
    community_motivation: profile.communityMotivation,
    improvement_ideas: profile.improvementIdeas,
    list_in_community_directory: profile.listInCommunityDirectory,
    enable_community_notifications: profile.enableCommunityNotifications
  };
}

/**
 * Adapts a database Profile to a frontend-ready object
 */
export function adaptProfileFromDb(dbProfile: DbProfile): Profile {
  return {
    id: dbProfile.id,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
    role: dbProfile.role,
    fullName: dbProfile.full_name,
    avatarUrl: dbProfile.avatar_url,
    phoneNumber: dbProfile.phone_number,
    address: dbProfile.address,
    
    // Family-specific fields
    careRecipientName: dbProfile.care_recipient_name,
    relationship: dbProfile.relationship,
    careTypes: dbProfile.care_types,
    specialNeeds: dbProfile.special_needs,
    specializedCare: dbProfile.specialized_care,
    otherSpecialNeeds: dbProfile.other_special_needs,
    caregiverType: dbProfile.caregiver_type,
    preferredContactMethod: dbProfile.preferred_contact_method,
    careSchedule: dbProfile.care_schedule, // Keep as string for consistency
    budgetPreferences: dbProfile.budget_preferences,
    caregiverPreferences: dbProfile.caregiver_preferences,
    additionalNotes: dbProfile.additional_notes,
    
    // Professional-specific fields
    professionalType: dbProfile.professional_type,
    licenseNumber: dbProfile.license_number,
    certifications: dbProfile.certifications,
    otherCertification: dbProfile.other_certification,
    certificationProofUrl: dbProfile.certification_proof_url,
    careServices: dbProfile.care_services,
    languages: dbProfile.languages,
    yearsOfExperience: dbProfile.years_of_experience,
    workType: dbProfile.work_type,
    availability: dbProfile.availability,
    backgroundCheck: dbProfile.background_check,
    backgroundCheckProofUrl: dbProfile.background_check_proof_url,
    legallyAuthorized: dbProfile.legally_authorized,
    expectedRate: dbProfile.expected_rate,
    paymentMethods: dbProfile.payment_methods,
    bio: dbProfile.bio,
    whyChooseCaregiving: dbProfile.why_choose_caregiving,
    preferredWorkLocations: dbProfile.preferred_work_locations,
    commuteMode: dbProfile.commute_mode,
    listInDirectory: dbProfile.list_in_directory,
    enableJobAlerts: dbProfile.enable_job_alerts,
    jobNotificationMethod: dbProfile.job_notification_method,
    jobMatchingCriteria: dbProfile.job_matching_criteria,
    customAvailabilityAlerts: dbProfile.custom_availability_alerts,
    hasTraining: dbProfile.has_training,
    
    // Community-specific fields
    location: dbProfile.location,
    website: dbProfile.website,
    communityRoles: dbProfile.community_roles,
    contributionInterests: dbProfile.contribution_interests,
    caregivingExperience: dbProfile.caregiving_experience,
    caregivingAreas: dbProfile.caregiving_areas,
    techInterests: dbProfile.tech_interests,
    involvementPreferences: dbProfile.involvement_preferences,
    communicationChannels: dbProfile.communication_channels,
    communityMotivation: dbProfile.community_motivation,
    improvementIdeas: dbProfile.improvement_ideas,
    listInCommunityDirectory: dbProfile.list_in_community_directory,
    enableCommun ityNotifications: dbProfile.enable_community_notifications
  };
}

// Export parsing utilities for use in matching algorithms
export { parseCareSchedule, parseCareScheduleToArray };
