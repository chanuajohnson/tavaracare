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
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { AnalyticsEvent } from "@/hooks/admin/useBlogAnalyticsRange";

interface Row {
  campaign: string;
  source: string;
  content: string;
  landings: number;
  clicks: number;
  registrations: number;
  lastSeen: string;
}

export function CampaignBreakdownCard({
  events,
}: {
  events: AnalyticsEvent[];
}) {
  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();

    const add = (
      a: Record<string, any>,
      created_at: string,
      field: "landings" | "clicks" | "registrations",
    ) => {
      const source = a.utm_source;
      if (!source) return;
      const campaign = a.utm_campaign || "(none)";
      const content =
        a.utm_content || a.post_slug || a.location_slug || "(none)";
      const key = `${campaign}|${source}|${content}`;
      const existing = map.get(key);
      if (existing) {
        existing[field]++;
        if (new Date(created_at) > new Date(existing.lastSeen)) {
          existing.lastSeen = created_at;
        }
      } else {
        map.set(key, {
          campaign,
          source,
          content,
          landings: 0,
          clicks: 0,
          registrations: 0,
          lastSeen: created_at,
          [field]: 1,
        } as Row);
      }
    };

    for (const ev of events) {
      const a = ev.additional_data || {};
      if (
        ev.action_type === "blog_utm_landed" ||
        ev.action_type === "location_utm_landed"
      ) {
        add(a, ev.created_at, "landings");
      } else if (ev.action_type === "blog_cta_click") {
        // use referrer fields if present so a click counts under originating campaign
        const merged = {
          ...a,
          utm_source: a.utm_source || a.utm_referrer_source,
          utm_campaign: a.utm_campaign || a.utm_referrer_campaign,
          utm_content: a.utm_content || a.utm_referrer_content || a.post_slug,
        };
        add(merged, ev.created_at, "clicks");
      } else if (
        ev.action_type === "family_registration_complete" ||
        ev.action_type === "professional_registration_complete" ||
        ev.action_type === "community_registration_complete"
      ) {
        const merged = {
          ...a,
          utm_source: a.utm_source || a.utm_referrer_source,
          utm_campaign: a.utm_campaign || a.utm_referrer_campaign,
          utm_content: a.utm_content || a.utm_referrer_content,
        };
        add(merged, ev.created_at, "registrations");
      }
    }

    return Array.from(map.values()).sort((a, b) => b.landings - a.landings);
  }, [events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Campaign performance</CardTitle>
        <CardDescription>
          Landings, clicks and registrations grouped by UTM campaign → source →
          destination. Mirrors GA4 Traffic Acquisition.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No UTM-tagged traffic in this window.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Landings</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Regs</TableHead>
                <TableHead>Last seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.campaign}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.source}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {r.content}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {r.landings}
                  </TableCell>
                  <TableCell className="text-right">{r.clicks}</TableCell>
                  <TableCell className="text-right">{r.registrations}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(r.lastSeen), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
