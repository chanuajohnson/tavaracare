import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import {
  AnalyticsEvent,
  countBy,
  pct,
} from "@/hooks/admin/useBlogAnalyticsRange";

interface Props {
  current: AnalyticsEvent[];
  previous: AnalyticsEvent[];
}

function Delta({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-xs text-muted-foreground">new</span>;
  }
  if (Math.abs(value) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> flat
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs ${
        up ? "text-green-600" : "text-red-600"
      }`}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function Tile({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delta?: number | null;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {delta !== undefined && <Delta value={delta} />}
        </div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function KpiStrip({ current, previous }: Props) {
  const landings =
    countBy(current, "blog_utm_landed") + countBy(current, "location_utm_landed");
  const landingsPrev =
    countBy(previous, "blog_utm_landed") +
    countBy(previous, "location_utm_landed");

  const clicks = countBy(current, "blog_cta_click");
  const clicksPrev = countBy(previous, "blog_cta_click");

  const quizStarts = countBy(current, "readiness_quiz_view");
  const quizDone = countBy(current, "readiness_quiz_completed");
  const dropOff =
    quizStarts > 0 ? Math.round((1 - quizDone / quizStarts) * 100) : 0;

  const regs =
    countBy(current, "family_registration_complete") +
    countBy(current, "professional_registration_complete") +
    countBy(current, "community_registration_complete");
  const regsPrev =
    countBy(previous, "family_registration_complete") +
    countBy(previous, "professional_registration_complete") +
    countBy(previous, "community_registration_complete");

  const engagement =
    landings > 0 ? Math.round((clicks / landings) * 100) : 0;
  const engagementPrev =
    landingsPrev > 0 ? Math.round((clicksPrev / landingsPrev) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Tile label="Landings" value={landings} delta={pct(landings, landingsPrev)} />
      <Tile label="CTA clicks" value={clicks} delta={pct(clicks, clicksPrev)} />
      <Tile
        label="Quiz starts → done"
        value={`${quizStarts} → ${quizDone}`}
        sub={`drop-off ${dropOff}%`}
      />
      <Tile label="Registrations" value={regs} delta={pct(regs, regsPrev)} />
      <Tile
        label="Engagement"
        value={`${engagement}%`}
        sub="clicks ÷ landings"
        delta={pct(engagement, engagementPrev)}
      />
    </div>
  );
}
