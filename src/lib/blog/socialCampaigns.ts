/**
 * Campaign + slug helpers for the admin Social Share generator.
 * Used by SocialSharePanel and the generate-social-caption edge function.
 */

export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "whatsapp",
  "tiktok",
  "linkedin",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

export const CAMPAIGN_PRESETS = [
  "family-readiness",
  "caregiver-awareness",
  "care-coordination",
  "caregiver-burnout",
  "aging-in-place",
  "blog-launch",
] as const;
export type CampaignPreset = (typeof CAMPAIGN_PRESETS)[number];

export function slugify(input: string, max = 60): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
}

export function buildSocialUtmUrl(opts: {
  slug: string;
  platform: SocialPlatform;
  campaign: string;
  content: string;
}): string {
  const params = new URLSearchParams({
    utm_source: opts.platform,
    utm_medium: "social",
    utm_campaign: slugify(opts.campaign),
    utm_content: slugify(opts.content),
  });
  return `https://tavara.care/blog/${opts.slug}?${params.toString()}`;
}
