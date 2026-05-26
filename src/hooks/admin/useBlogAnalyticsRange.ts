import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RangeDays = 7 | 28 | 90;

export interface AnalyticsEvent {
  action_type: string;
  created_at: string;
  additional_data: Record<string, any> | null;
}

export interface BlogAnalyticsData {
  current: AnalyticsEvent[];
  previous: AnalyticsEvent[];
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

      const { data, error } = await supabase
        .from("cta_engagement_tracking")
        .select("action_type, created_at, additional_data")
        .in("action_type", TRACKED)
        .gte("created_at", previousStart.toISOString())
        .order("created_at", { ascending: true })
        .limit(10000);

      if (error) throw error;

      const all = (data ?? []) as AnalyticsEvent[];
      const current: AnalyticsEvent[] = [];
      const previous: AnalyticsEvent[] = [];
      for (const ev of all) {
        const t = new Date(ev.created_at);
        if (t >= rangeStart) current.push(ev);
        else if (t >= previousStart) previous.push(ev);
      }
      return { current, previous, rangeStart, rangeEnd: now };
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
