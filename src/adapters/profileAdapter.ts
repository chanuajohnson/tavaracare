
import { Profile } from "../types/profile";
import type { DbProfile, DbProfileInsert } from "../types/profile";
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
    bio: profile.bio,
    
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
    certifications: profile.certifications,
    services: profile.services,
    years_of_experience: profile.yearsOfExperience,
    availability: profile.availability,
    legally_authorized: profile.legallyAuthorized,
    hourly_rate: profile.hourlyRate,
    location: profile.location,
    
    // Community-specific fields
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
    bio: dbProfile.bio,
    lastLoginAt: dbProfile.last_login_at,
    
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
    certifications: dbProfile.certifications,
    services: dbProfile.services,
    yearsOfExperience: dbProfile.years_of_experience,
    availability: dbProfile.availability,
    legallyAuthorized: dbProfile.legally_authorized,
    hourlyRate: dbProfile.hourly_rate,
    location: dbProfile.location,
    
    // Community-specific fields
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
