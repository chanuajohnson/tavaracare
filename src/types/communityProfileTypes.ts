
/**
 * Community-specific profile fields
 */
export interface CommunityProfileFields {
  location?: string;
  website?: string;
  communityRoles?: string[];
  contributionInterests?: string[];
  caregivingExperience?: string;
  caregivingAreas?: string[];
  techInterests?: string[];
  involvementPreferences?: string[];
  communicationChannels?: string[];
  communityMotivation?: string;
  improvementIdeas?: string;
  listInCommunityDirectory?: boolean;
  enableCommunityNotifications?: boolean;
}

/**
 * Database model for community profile fields (snake_case)
 */
export interface DbCommunityProfileFields {
  location?: string;
  website?: string;
  community_roles?: string[];
  contribution_interests?: string[];
  caregiving_experience?: string;
  caregiving_areas?: string[];
  tech_interests?: string[];
  involvement_preferences?: string[];
  communication_channels?: string[];
  community_motivation?: string;
  improvement_ideas?: string;
  list_in_community_directory?: boolean;
  enable_community_notifications?: boolean;
}
