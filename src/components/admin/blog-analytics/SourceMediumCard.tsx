import { useMemo } from "react";
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
import { AnalyticsEvent } from "@/hooks/admin/useBlogAnalyticsRange";

export function SourceMediumCard({ events }: { events: AnalyticsEvent[] }) {
  const rows = useMemo(() => {
    const map = new Map<
      string,
      {
        source: string;
        medium: string;
        landings: number;
        clicks: number;
        regs: number;
      }
    >();

    const bump = (
      source: string | undefined,
      medium: string | undefined,
      field: "landings" | "clicks" | "regs",
    ) => {
      if (!source) return;
      const key = `${source}|${medium ?? "(none)"}`;
      const existing = map.get(key) ?? {
        source,
        medium: medium ?? "(none)",
        landings: 0,
        clicks: 0,
        regs: 0,
      };
      existing[field]++;
      map.set(key, existing);
    };

    for (const ev of events) {
      const a = ev.additional_data || {};
      if (
        ev.action_type === "blog_utm_landed" ||
        ev.action_type === "location_utm_landed"
      ) {
        bump(a.utm_source, a.utm_medium, "landings");
      } else if (ev.action_type === "blog_cta_click") {
        bump(
          a.utm_source || a.utm_referrer_source,
          a.utm_medium,
          "clicks",
        );
      } else if (
        ev.action_type === "family_registration_complete" ||
        ev.action_type === "professional_registration_complete" ||
        ev.action_type === "community_registration_complete"
      ) {
        bump(
          a.utm_source || a.utm_referrer_source,
          a.utm_medium,
          "regs",
        );
      }
    }
    return Array.from(map.values()).sort((a, b) => b.landings - a.landings);
  }, [events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Source / medium</CardTitle>
        <CardDescription>
          Which channels are driving traffic and conversions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No data.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead className="text-right">Landings</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
                <TableHead className="text-right">Regs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.source}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.medium}
                  </TableCell>
                  <TableCell className="text-right">{r.landings}</TableCell>
                  <TableCell className="text-right">{r.clicks}</TableCell>
                  <TableCell className="text-right">
                    {r.landings > 0
                      ? `${Math.round((r.clicks / r.landings) * 100)}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">{r.regs}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
