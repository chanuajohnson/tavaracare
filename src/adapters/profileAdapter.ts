
import { UserProfile as Profile } from "../types/profile";
import { UserProfile as DbProfile, UserProfile as DbProfileInsert } from "../types/profile";
import { fromJson, toJson } from "../utils/json";

/**
 * Adapts a frontend Profile to a database-ready object
 */
export function adaptProfileToDb(profile: Partial<Profile>): DbProfileInsert {
  return {
    id: profile.id!,
    role: profile.role!,
    full_name: profile.fullName || profile.full_name || "",
    avatar_url: profile.avatarUrl || profile.avatar_url,
    phone_number: profile.phoneNumber || profile.phone_number,
    address: profile.address,
    // Handle onboarding_progress properly to ensure it's stored as a JSON string
    onboarding_progress: profile.onboarding_progress ? 
      (typeof profile.onboarding_progress === 'string' ? 
        profile.onboarding_progress : 
        toJson(profile.onboarding_progress)) : 
      undefined,
    
    // Family-specific fields
    care_recipient_name: profile.careRecipientName || profile.care_recipient_name,
    relationship: profile.relationship,
    care_types: profile.careTypes || profile.care_types,
    special_needs: profile.specialNeeds || profile.special_needs,
    specialized_care: profile.specializedCare || profile.specialized_care,
    other_special_needs: profile.otherSpecialNeeds || profile.other_special_needs,
    caregiver_type: profile.caregiverType || profile.caregiver_type,
    preferred_contact_method: profile.preferredContactMethod || profile.preferred_contact_method,
    care_schedule: profile.careSchedule || profile.care_schedule,
    budget_preferences: profile.budgetPreferences || profile.budget_preferences,
    caregiver_preferences: profile.caregiverPreferences || profile.caregiver_preferences,
    additional_notes: profile.additionalNotes || profile.additional_notes,
    
    // Professional-specific fields
    professional_type: profile.professionalType || profile.professional_type,
    license_number: profile.licenseNumber || profile.license_number,
    certifications: profile.certifications,
    other_certification: profile.otherCertification || profile.other_certification,
    certification_proof_url: profile.certificationProofUrl || profile.certification_proof_url,
    care_services: profile.careServices || profile.care_services,
    languages: profile.languages,
    years_of_experience: profile.yearsOfExperience || profile.years_of_experience,
    work_type: profile.workType || profile.work_type,
    availability: profile.availability,
    background_check: profile.backgroundCheck || profile.background_check,
    background_check_proof_url: profile.backgroundCheckProofUrl || profile.background_check_proof_url,
    legally_authorized: profile.legallyAuthorized || profile.legally_authorized,
    expected_rate: profile.expectedRate || profile.expected_rate,
    payment_methods: profile.paymentMethods || profile.payment_methods,
    bio: profile.bio,
    why_choose_caregiving: profile.whyChooseCaregiving || profile.why_choose_caregiving,
    preferred_work_locations: profile.preferredWorkLocations || profile.preferred_work_locations,
    commute_mode: profile.commuteMode || profile.commute_mode,
    list_in_directory: profile.listInDirectory || profile.list_in_directory,
    enable_job_alerts: profile.enableJobAlerts || profile.enable_job_alerts,
    job_notification_method: profile.jobNotificationMethod || profile.job_notification_method,
    job_matching_criteria: profile.jobMatchingCriteria || profile.job_matching_criteria,
    custom_availability_alerts: profile.customAvailabilityAlerts || profile.custom_availability_alerts,
    has_training: profile.hasTraining || profile.has_training,
    
    // Community-specific fields
    location: profile.location,
    website: profile.website,
    community_roles: profile.communityRoles || profile.community_roles,
    contribution_interests: profile.contributionInterests || profile.contribution_interests,
    caregiving_experience: profile.caregivingExperience || profile.caregiving_experience,
    caregiving_areas: profile.caregivingAreas || profile.caregiving_areas,
    tech_interests: profile.techInterests || profile.tech_interests,
    involvement_preferences: profile.involvementPreferences || profile.involvement_preferences,
    communication_channels: profile.communicationChannels || profile.communication_channels,
    community_motivation: profile.communityMotivation || profile.community_motivation,
    improvement_ideas: profile.improvementIdeas || profile.improvement_ideas,
    list_in_community_directory: profile.listInCommunityDirectory || profile.list_in_community_directory,
    enable_community_notifications: profile.enableCommunityNotifications || profile.enable_community_notifications
  };
}

/**
 * Adapts a database Profile to a frontend-ready object
 */
export function adaptProfileFromDb(dbProfile: DbProfile): Profile {
  // Parse the onboarding_progress from JSON if it exists and is a string
  const onboardingProgress = dbProfile.onboarding_progress ? 
    (typeof dbProfile.onboarding_progress === 'string' ? 
      fromJson(dbProfile.onboarding_progress as string, {}) : 
      dbProfile.onboarding_progress) : 
    undefined;
    
  return {
    id: dbProfile.id,
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
    role: dbProfile.role,
    fullName: dbProfile.full_name,
    avatarUrl: dbProfile.avatar_url,
    phoneNumber: dbProfile.phone_number,
    address: dbProfile.address,
    onboarding_progress: onboardingProgress,
    
    // Family-specific fields
    careRecipientName: dbProfile.care_recipient_name,
    relationship: dbProfile.relationship,
    careTypes: dbProfile.care_types,
    specialNeeds: dbProfile.special_needs,
    specializedCare: dbProfile.specialized_care,
    otherSpecialNeeds: dbProfile.other_special_needs,
    caregiverType: dbProfile.caregiver_type,
    preferredContactMethod: dbProfile.preferred_contact_method,
    careSchedule: dbProfile.care_schedule,
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
    enableCommunityNotifications: dbProfile.enable_community_notifications
  };
}
