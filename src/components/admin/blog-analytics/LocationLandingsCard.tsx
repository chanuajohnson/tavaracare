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
import { formatDistanceToNow } from "date-fns";
import { AnalyticsEvent } from "@/hooks/admin/useBlogAnalyticsRange";

export function LocationLandingsCard({ events }: { events: AnalyticsEvent[] }) {
  const rows = useMemo(() => {
    const map = new Map<
      string,
      { slug: string; landings: number; lastSeen: string }
    >();
    for (const ev of events) {
      if (ev.action_type !== "location_utm_landed") continue;
      const slug = (ev.additional_data?.location_slug as string) || "(unknown)";
      const existing = map.get(slug);
      if (existing) {
        existing.landings++;
        if (new Date(ev.created_at) > new Date(existing.lastSeen)) {
          existing.lastSeen = ev.created_at;
        }
      } else {
        map.set(slug, { slug, landings: 1, lastSeen: ev.created_at });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.landings - a.landings);
  }, [events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Location pages</CardTitle>
        <CardDescription>
          UTM-tagged landings on /locations/ pages in this window.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No location landings yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location slug</TableHead>
                <TableHead className="text-right">Landings</TableHead>
                <TableHead>Last visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.slug}>
                  <TableCell className="font-medium">{r.slug}</TableCell>
                  <TableCell className="text-right">{r.landings}</TableCell>
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
