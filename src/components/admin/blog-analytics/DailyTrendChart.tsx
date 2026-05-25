import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { AnalyticsEvent } from "@/hooks/admin/useBlogAnalyticsRange";

interface Annotation {
  occurred_on: string;
  label: string;
}

interface Props {
  events: AnalyticsEvent[];
  rangeStart: Date;
  rangeEnd: Date;
  annotations: Annotation[];
}

function dayKey(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "yyyy-MM-dd");
}

export function DailyTrendChart({
  events,
  rangeStart,
  rangeEnd,
  annotations,
}: Props) {
  const data = useMemo(() => {
    // Build empty day buckets
    const buckets = new Map<
      string,
      { day: string; blog: number; location: number }
    >();
    const cursor = new Date(rangeStart);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(rangeEnd);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      buckets.set(dayKey(cursor), {
        day: dayKey(cursor),
        blog: 0,
        location: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const ev of events) {
      const key = dayKey(ev.created_at);
      const b = buckets.get(key);
      if (!b) continue;
      if (ev.action_type === "blog_utm_landed") b.blog++;
      else if (ev.action_type === "location_utm_landed") b.location++;
    }
    return Array.from(buckets.values());
  }, [events, rangeStart, rangeEnd]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily landings</CardTitle>
        <CardDescription>
          Blog vs location page landings per day. Vertical markers show
          annotations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="blogFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="locFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="day"
                tickFormatter={(v) => format(new Date(v), "MMM d")}
                fontSize={11}
              />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip
                labelFormatter={(v) => format(new Date(v as string), "PP")}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="blog"
                name="Blog landings"
                stroke="hsl(var(--primary))"
                fill="url(#blogFill)"
              />
              <Area
                type="monotone"
                dataKey="location"
                name="Location landings"
                stroke="hsl(var(--accent-foreground))"
                fill="url(#locFill)"
              />
              {annotations.map((a, i) => (
                <ReferenceLine
                  key={i}
                  x={a.occurred_on}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="2 2"
                  label={{
                    value: a.label.length > 24 ? a.label.slice(0, 22) + "…" : a.label,
                    position: "top",
                    fontSize: 10,
                    fill: "hsl(var(--destructive))",
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
