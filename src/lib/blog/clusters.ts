/**
 * Blog content clusters.
 *
 * Each cluster groups posts that should pass authority and reading attention
 * to one another. The "Keep reading" block on a post prefers same-cluster
 * posts before falling back to recency.
 *
 * Keep the map explicit (slug -> cluster) so relationships are reviewable
 * and not guessed from category names.
 */

export type BlogCluster =
  | "cost-and-planning"
  | "emotional-realities"
  | "finding-care"
  | "onboarding";

export const BLOG_CLUSTERS: Record<string, BlogCluster> = {
  // Cost & planning cluster — anchored by the spike post
  "senior-care-costs-trinidad-tobago-2026": "cost-and-planning",
  "live-in-vs-hourly-care-trinidad-tobago": "cost-and-planning",
  "cost-of-dementia-care-trinidad-tobago": "cost-and-planning",
  "paying-for-care-without-going-broke-trinidad": "cost-and-planning",
  "preparing-your-home-for-care-trinidad-tobago": "cost-and-planning",
  "caring-on-a-public-holiday-trinidad-tobago": "cost-and-planning",

  // Finding care cluster — practical "how do I start" posts
  "how-to-find-trusted-caregiver-trinidad-tobago": "finding-care",
  "finding-a-caregiver-in-port-of-spain-or-san-fernando": "finding-care",
  "family-readiness-quiz-trinidad-tobago": "finding-care",
  "know-someone-who-needs-care-trinidad-tobago": "finding-care",

  // Emotional realities cluster
  "adult-child-trap-caring-for-parent-burnout": "emotional-realities",
  "caribbean-families-and-caregiving-why-this-is-hard": "emotional-realities",
  "when-help-feels-like-pressure": "emotional-realities",
  "why-families-resist-care": "emotional-realities",
  "how-to-talk-to-family-about-getting-caregiver": "emotional-realities",
  "when-a-home-starts-feeling-heavy-aging-accumulation-caregiving": "emotional-realities",

  // Onboarding cluster
  "inside-tavara-onboarding-step-by-step": "onboarding",
};

export const getClusterForSlug = (slug: string): BlogCluster | undefined =>
  BLOG_CLUSTERS[slug];

/**
 * Pick related posts for a given post: cluster-mates first (most-recent first),
 * then fall back to other recent posts to fill up to `limit`.
 */
export function pickRelatedPosts<T extends { slug: string; published_at: string | null }>(
  current: { slug: string },
  all: T[],
  limit = 3,
): T[] {
  const cluster = getClusterForSlug(current.slug);
  const others = all.filter((p) => p.slug !== current.slug);

  const sortByDateDesc = (a: T, b: T) =>
    (b.published_at ?? "").localeCompare(a.published_at ?? "");

  if (!cluster) return others.slice(0, limit);

  const clusterMates = others
    .filter((p) => getClusterForSlug(p.slug) === cluster)
    .sort(sortByDateDesc);

  if (clusterMates.length >= limit) return clusterMates.slice(0, limit);

  const fillers = others
    .filter((p) => getClusterForSlug(p.slug) !== cluster)
    .sort(sortByDateDesc)
    .slice(0, limit - clusterMates.length);

  return [...clusterMates, ...fillers];
}
