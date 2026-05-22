import { useMemo } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAllPosts } from "@/lib/blog/api";
import { useBlogSocialAnalytics } from "@/hooks/admin/useBlogSocialAnalytics";

const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
  blog: "Internal (blog)",
  direct: "Direct / unknown",
  unknown: "Unknown",
};

export default function BlogAnalyticsPage() {
  const { user, userRole, isLoading } = useAuth();
  const { postId } = useParams<{ postId: string }>();
  const { data: posts = [] } = useAllPosts();
  const post = useMemo(() => posts.find((p) => p.id === postId), [posts, postId]);

  const { data, isLoading: loadingAnalytics } = useBlogSocialAnalytics(
    post?.id ?? "",
    post?.slug ?? "",
    post?.title ?? "",
  );

  if (isLoading) return <div className="container py-12">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (userRole !== "admin") return <Navigate to="/" replace />;
  if (!post) return <div className="container py-12">Post not found.</div>;

  const totals = data?.totals;
  const byPlatform = data?.byPlatform ?? [];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Admin", path: "/dashboard/admin" },
          { label: "Blog", path: "/admin/blog" },
          { label: "Analytics", path: `/admin/blog/${post.id}/analytics` },
        ]}
      />
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Social analytics</h1>
            <p className="text-sm text-muted-foreground">{post.title}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/blog/${post.id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to editor
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard label="Links generated" value={totals?.copies ?? 0} />
          <KpiCard label="Landings (90d)" value={totals?.landings ?? 0} />
          <KpiCard label="CTA clicks" value={totals?.ctaClicks ?? 0} />
          <KpiCard label="Registrations attributed" value={totals?.registrations ?? 0} />
          <KpiCard
            label="Land → reg rate"
            value={`${(totals?.conversionRate ?? 0).toFixed(1)}%`}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Landings — last 30 days</CardTitle>
            <CardDescription>
              Daily blog landings tagged with any inbound UTM source.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Sparkline points={data?.daily ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-platform performance</CardTitle>
            <CardDescription>
              Landings come from <code>blog_utm_landed</code> events tagged with each
              platform's <code>utm_source</code>. Engage % = CTA clicks / landings.
              Convert % = registrations / landings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAnalytics ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Links</TableHead>
                    <TableHead className="text-right">Landings</TableHead>
                    <TableHead className="text-right">CTA clicks</TableHead>
                    <TableHead className="text-right">Engage %</TableHead>
                    <TableHead className="text-right">Registrations</TableHead>
                    <TableHead className="text-right">Convert %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byPlatform.map((row) => (
                    <TableRow key={row.platform}>
                      <TableCell className="font-medium">
                        {PLATFORM_LABEL[row.platform] ?? row.platform}
                      </TableCell>
                      <TableCell className="text-right">{row.copies}</TableCell>
                      <TableCell className="text-right">{row.landings}</TableCell>
                      <TableCell className="text-right">{row.ctaClicks}</TableCell>
                      <TableCell className="text-right">
                        {row.engageRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">{row.registrations}</TableCell>
                      <TableCell className="text-right">
                        {row.conversionRate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">CTA clicks by placement</CardTitle>
            <CardDescription>
              Where readers tap inside the article. Helps tune mid-article vs end-of-article
              vs sticky mobile bar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(data?.ctaByPlacement ?? {}).length === 0 ? (
              <p className="text-sm text-muted-foreground">No CTA clicks recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placement</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(data?.ctaByPlacement ?? {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([placement, count]) => (
                      <TableRow key={placement}>
                        <TableCell className="font-medium">{placement}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
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

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function Sparkline({ points }: { points: { date: string; landings: number }[] }) {
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No landings yet.</p>;
  }
  const width = 600;
  const height = 60;
  const padding = 4;
  const max = Math.max(1, ...points.map((p) => p.landings));
  const stepX = (width - padding * 2) / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (p.landings / max) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${coords.join(" L ")}`;
  const last = points[points.length - 1];
  const total = points.reduce((acc, p) => acc + p.landings, 0);
  return (
    <div className="flex items-center gap-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="flex-1 h-16 w-full text-primary"
        role="img"
        aria-label="30-day landings sparkline"
      >
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2} />
      </svg>
      <div className="text-right shrink-0">
        <div className="text-2xl font-bold">{total}</div>
        <div className="text-xs text-muted-foreground">
          30d total · {last.landings} today
        </div>
      </div>
    </div>
  );
}
