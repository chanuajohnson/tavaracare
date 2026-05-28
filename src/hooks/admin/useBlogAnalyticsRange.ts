import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RangeDays = 7 | 28 | 90;

export interface AnalyticsEvent {
  action_type: string;
  created_at: string;
  additional_data: Record<string, any> | null;
  user_id: string | null;
}

export interface SubscriptionAssignment {
  family_id: string;
  updated_at: string;
}

export interface BlogAnalyticsData {
  current: AnalyticsEvent[];
  previous: AnalyticsEvent[];
  subscriptionsCurrent: SubscriptionAssignment[];
  subscriptionsPrevious: SubscriptionAssignment[];
  rangeStart: Date;
  rangeEnd: Date;
}


const TRACKED = [
  "blog_utm_landed",
  "location_utm_landed",
  "blog_cta_click",
  "readiness_quiz_view",
  "readiness_quiz_completed",
  "quiz_cta_click",
  "family_registration_page_view",
  "professional_registration_page_view",
  "family_registration_complete",
  "professional_registration_complete",
  "community_registration_complete",
  "subscription_started",
  "whatsapp_click",
  "caregiver_match_request",
];

export function useBlogAnalyticsRange(days: RangeDays) {
  return useQuery<BlogAnalyticsData>({
    queryKey: ["blog-analytics-range", days],
    queryFn: async () => {
      const now = new Date();
      const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const previousStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

      const [{ data, error }, subResp] = await Promise.all([
        supabase
          .from("cta_engagement_tracking")
          .select("action_type, created_at, additional_data, user_id")
          .in("action_type", TRACKED)
          .gte("created_at", previousStart.toISOString())
          .order("created_at", { ascending: true })
          .limit(10000),
        supabase
          .from("onboarding_checklists")
          .select("family_id, updated_at, checked_items")
          .gte("updated_at", previousStart.toISOString()),
      ]);

      if (error) throw error;
      if (subResp.error) throw subResp.error;

      const all = (data ?? []) as AnalyticsEvent[];
      const current: AnalyticsEvent[] = [];
      const previous: AnalyticsEvent[] = [];
      for (const ev of all) {
        const t = new Date(ev.created_at);
        if (t >= rangeStart) current.push(ev);
        else if (t >= previousStart) previous.push(ev);
      }

      const subscriptionsCurrent: SubscriptionAssignment[] = [];
      const subscriptionsPrevious: SubscriptionAssignment[] = [];
      for (const row of (subResp.data ?? []) as any[]) {
        const checked = row.checked_items;
        if (!checked || checked.post_onboarding_6 !== true) continue;
        const t = new Date(row.updated_at);
        const entry = { family_id: row.family_id, updated_at: row.updated_at };
        if (t >= rangeStart) subscriptionsCurrent.push(entry);
        else if (t >= previousStart) subscriptionsPrevious.push(entry);
      }

      return {
        current,
        previous,
        subscriptionsCurrent,
        subscriptionsPrevious,
        rangeStart,
        rangeEnd: now,
      };

    },
    staleTime: 60_000,
  });
}

export function pct(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return ((curr - prev) / prev) * 100;
}

export function countBy(events: AnalyticsEvent[], type: string): number {
  return events.reduce((n, e) => (e.action_type === type ? n + 1 : n), 0);
}
