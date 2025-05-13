
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
    full_name: profile.fullName || "",
    avatar_url: profile.avatarUrl,
    phone_number: profile.phoneNumber,
    address: profile.address,
    onboarding_progress: profile.onboarding_progress ? toJson(profile.onboarding_progress) : undefined,
    
    // Family-specific fields
    care_recipient_name: profile.careRecipientName,
    relationship: profile.relationship,
    care_types: profile.careTypes,
    special_needs: profile.specialNeeds,
    specialized_care: profile.specializedCare,
    other_special_needs: profile.otherSpecialNeeds,
    caregiver_type: profile.caregiverType,
    preferred_contact_method: profile.preferredContactMethod,
    care_schedule: profile.careSchedule,
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
  // Parse the onboarding_progress from JSON if it exists
  const onboardingProgress = dbProfile.onboarding_progress ? 
    fromJson(dbProfile.onboarding_progress, {}) : 
    undefined;
    
  return {
    id: dbProfile.id,
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
