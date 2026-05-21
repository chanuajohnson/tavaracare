import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformMetrics {
  platform: string;
  copies: number;
  landings: number;
  ctaClicks: number;
  registrations: number;
  conversionRate: number;
}

export interface PostSocialAnalytics {
  postId: string;
  postSlug: string;
  postTitle: string;
  totals: PlatformMetrics;
  byPlatform: PlatformMetrics[];
  ctaByPlacement: Record<string, number>;
}

const PLATFORMS = ["facebook", "whatsapp", "linkedin", "instagram", "tiktok"];

/**
 * Aggregates per-platform performance for a single blog post by joining:
 *  - social_share_links (admin generated/copied links)
 *  - cta_engagement_tracking (blog_utm_landed, blog_cta_click, registration page views)
 */
export function useBlogSocialAnalytics(postId: string, postSlug: string, postTitle: string) {
  return useQuery<PostSocialAnalytics>({
    queryKey: ["blog-social-analytics", postId, postSlug],
    enabled: Boolean(postId && postSlug),
    queryFn: async () => {
      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

      const [sharesRes, eventsRes] = await Promise.all([
        supabase
          .from("social_share_links")
          .select("platform")
          .eq("post_id", postId),
        supabase
          .from("cta_engagement_tracking")
          .select("action_type, additional_data, created_at")
          .in("action_type", [
            "blog_utm_landed",
            "blog_cta_click",
            "family_registration_page_view",
            "professional_registration_page_view",
          ])
          .gte("created_at", since),
      ]);

      if (sharesRes.error) throw sharesRes.error;
      if (eventsRes.error) throw eventsRes.error;

      const copiesByPlatform = new Map<string, number>();
      for (const row of sharesRes.data ?? []) {
        copiesByPlatform.set(row.platform, (copiesByPlatform.get(row.platform) ?? 0) + 1);
      }

      const landingsByPlatform = new Map<string, number>();
      const ctaClicksByPlatform = new Map<string, number>();
      const ctaByPlacement: Record<string, number> = {};
      const registrationsByPlatform = new Map<string, number>();

      for (const ev of eventsRes.data ?? []) {
        const data = (ev.additional_data as Record<string, unknown>) ?? {};
        if (ev.action_type === "blog_utm_landed") {
          if (data.post_slug !== postSlug) continue;
          const src = String(data.utm_source ?? "unknown").toLowerCase();
          landingsByPlatform.set(src, (landingsByPlatform.get(src) ?? 0) + 1);
        } else if (ev.action_type === "blog_cta_click") {
          if (data.post_slug !== postSlug) continue;
          const src = String(data.inbound_utm_source ?? "direct").toLowerCase();
          ctaClicksByPlatform.set(src, (ctaClicksByPlatform.get(src) ?? 0) + 1);
          const placement = String(data.placement ?? "unknown");
          ctaByPlacement[placement] = (ctaByPlacement[placement] ?? 0) + 1;
        } else {
          // registration page views — credit if referrer matches this post
          const refContent = String(data.utm_referrer_content ?? "");
          const utmContent = String(data.utm_content ?? "");
          const blogCampaign = String(data.utm_campaign ?? "");
          const matchesPost =
            blogCampaign === `blog-${postSlug}` ||
            refContent.includes(postSlug) ||
            utmContent.includes(postSlug);
          if (!matchesPost) continue;
          const src = String(
            data.utm_referrer_source ?? data.utm_source ?? "unknown",
          ).toLowerCase();
          registrationsByPlatform.set(src, (registrationsByPlatform.get(src) ?? 0) + 1);
        }
      }

      const allPlatforms = new Set<string>([
        ...PLATFORMS,
        ...copiesByPlatform.keys(),
        ...landingsByPlatform.keys(),
        ...ctaClicksByPlatform.keys(),
        ...registrationsByPlatform.keys(),
      ]);

      const byPlatform: PlatformMetrics[] = Array.from(allPlatforms)
        .map((p) => {
          const landings = landingsByPlatform.get(p) ?? 0;
          const registrations = registrationsByPlatform.get(p) ?? 0;
          return {
            platform: p,
            copies: copiesByPlatform.get(p) ?? 0,
            landings,
            ctaClicks: ctaClicksByPlatform.get(p) ?? 0,
            registrations,
            conversionRate: landings > 0 ? (registrations / landings) * 100 : 0,
          };
        })
        .sort((a, b) => b.landings - a.landings || b.copies - a.copies);

      const sum = (key: keyof Omit<PlatformMetrics, "platform" | "conversionRate">) =>
        byPlatform.reduce((acc, row) => acc + row[key], 0);
      const totalLandings = sum("landings");
      const totalRegs = sum("registrations");

      return {
        postId,
        postSlug,
        postTitle,
        byPlatform,
        ctaByPlacement,
        totals: {
          platform: "all",
          copies: sum("copies"),
          landings: totalLandings,
          ctaClicks: sum("ctaClicks"),
          registrations: totalRegs,
          conversionRate: totalLandings > 0 ? (totalRegs / totalLandings) * 100 : 0,
        },
      };
    },
  });
}
