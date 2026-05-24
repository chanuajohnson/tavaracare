import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAllPosts } from "@/lib/blog/api";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardRow {
  postId: string;
  slug: string;
  title: string;
  landings: number;
  ctaClicks: number;
  quizStarts: number;
  quizCompletions: number;
  quizCtaClicks: number;
  registrations: number;
  convertRate: number;
  dropOffRate: number;
}

function useLeaderboard(posts: { id: string; slug: string; title: string }[]) {
  return useQuery<LeaderboardRow[]>({
    queryKey: ["blog-analytics-leaderboard", posts.map((p) => p.id).join(",")],
    enabled: posts.length > 0,
    queryFn: async () => {
      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("cta_engagement_tracking")
        .select("action_type, additional_data")
        .in("action_type", [
          "blog_utm_landed",
          "blog_cta_click",
          "readiness_quiz_view",
          "readiness_quiz_completed",
          "quiz_cta_click",
          "family_registration_page_view",
          "professional_registration_page_view",
        ])
        .gte("created_at", since);
      if (error) throw error;

      const landings = new Map<string, number>();
      const clicks = new Map<string, number>();
      const quizStarts = new Map<string, number>();
      const quizCompletions = new Map<string, number>();
      const quizCtaClicks = new Map<string, number>();
      const regs = new Map<string, number>();

      const slugFromCampaign = (d: Record<string, unknown>): string => {
        const campaign = String(d.utm_campaign ?? "");
        const refContent = String(d.utm_referrer_content ?? "");
        return campaign.startsWith("blog-") ? campaign.slice(5) : refContent;
      };

      for (const ev of data ?? []) {
        const d = (ev.additional_data as Record<string, unknown>) ?? {};
        const slug = String(d.post_slug ?? "");
        if (ev.action_type === "blog_utm_landed" && slug) {
          landings.set(slug, (landings.get(slug) ?? 0) + 1);
        } else if (ev.action_type === "blog_cta_click" && slug) {
          clicks.set(slug, (clicks.get(slug) ?? 0) + 1);
        } else if (ev.action_type === "readiness_quiz_view") {
          const s = slugFromCampaign(d);
          if (s) quizStarts.set(s, (quizStarts.get(s) ?? 0) + 1);
        } else if (ev.action_type === "readiness_quiz_completed") {
          const s = slugFromCampaign(d);
          if (s) quizCompletions.set(s, (quizCompletions.get(s) ?? 0) + 1);
        } else if (ev.action_type === "quiz_cta_click") {
          const s = slugFromCampaign(d);
          if (s) quizCtaClicks.set(s, (quizCtaClicks.get(s) ?? 0) + 1);
        } else if (
          ev.action_type === "family_registration_page_view" ||
          ev.action_type === "professional_registration_page_view"
        ) {
          const matchSlug = slugFromCampaign(d);
          if (matchSlug) {
            regs.set(matchSlug, (regs.get(matchSlug) ?? 0) + 1);
          }
        }
      }

      const rows: LeaderboardRow[] = posts.map((p) => {
        const l = landings.get(p.slug) ?? 0;
        const c = clicks.get(p.slug) ?? 0;
        const qs = quizStarts.get(p.slug) ?? 0;
        const qc = quizCompletions.get(p.slug) ?? 0;
        const qcta = quizCtaClicks.get(p.slug) ?? 0;
        const r = regs.get(p.slug) ?? 0;
        return {
          postId: p.id,
          slug: p.slug,
          title: p.title,
          landings: l,
          ctaClicks: c,
          quizStarts: qs,
          quizCompletions: qc,
          quizCtaClicks: qcta,
          registrations: r,
          convertRate: l > 0 ? (r / l) * 100 : 0,
          dropOffRate: qs > 0 ? (1 - qc / qs) * 100 : 0,
        };
      });
      rows.sort(
        (a, b) =>
          b.landings - a.landings ||
          b.ctaClicks - a.ctaClicks ||
          a.title.localeCompare(b.title),
      );
      return rows;
    },
  });
}

export default function BlogAnalyticsLeaderboardPage() {
  const { user, userRole, isLoading } = useAuth();
  const { data: posts = [] } = useAllPosts();
  const lite = useMemo(
    () => posts.map((p) => ({ id: p.id, slug: p.slug, title: p.title })),
    [posts],
  );
  const { data: rows = [], isLoading: loading } = useLeaderboard(lite);

  if (isLoading) return <div className="container py-12">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (userRole !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Admin", path: "/dashboard/admin" },
          { label: "Blog", path: "/admin/blog" },
          { label: "Leaderboard", path: "/admin/blog/analytics" },
        ]}
      />
      <div className="container max-w-5xl py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Blog leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            Last 90 days, sorted by landings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All posts</CardTitle>
            <CardDescription>
              Click a row to open per-platform analytics for that post. Convert %
              measures landings that become registrations (via the quiz).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead className="text-right">Landings</TableHead>
                    <TableHead className="text-right">CTA clicks</TableHead>
                    <TableHead className="text-right">Quiz starts</TableHead>
                    <TableHead className="text-right">Quiz done</TableHead>
                    <TableHead className="text-right">Drop-off %</TableHead>
                    <TableHead className="text-right">Quiz CTA</TableHead>
                    <TableHead className="text-right">Registrations</TableHead>
                    <TableHead className="text-right">Convert %</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.postId}>
                      <TableCell className="font-medium max-w-md truncate">
                        {row.title}
                      </TableCell>
                      <TableCell className="text-right">{row.landings}</TableCell>
                      <TableCell className="text-right">{row.ctaClicks}</TableCell>
                      <TableCell className="text-right">{row.quizStarts}</TableCell>
                      <TableCell className="text-right">{row.quizCompletions}</TableCell>
                      <TableCell className="text-right">
                        {row.quizStarts > 0 ? `${row.dropOffRate.toFixed(0)}%` : "—"}
                      </TableCell>
                      <TableCell className="text-right">{row.quizCtaClicks}</TableCell>
                      <TableCell className="text-right">{row.registrations}</TableCell>
                      <TableCell className="text-right">
                        {row.convertRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/admin/blog/${row.postId}/analytics`}>
                            Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
