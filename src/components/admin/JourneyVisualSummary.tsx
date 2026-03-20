import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  ClipboardCheck,
  Star,
  LayoutDashboard,
  FileHeart,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Clock,
} from "lucide-react";

interface UserProfile {
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
}

interface JourneyEvent {
  action_type: string;
  created_at: string;
  additional_data: any;
}

interface Props {
  journeyData: JourneyEvent[];
  userProfile: UserProfile | null;
}

interface MilestoneItem {
  label: string;
  date: Date;
  type: "registration" | "assessment" | "milestone" | "dashboard" | "care_plan";
  count: number;
}

const MILESTONE_CONFIG = {
  registration: { color: "bg-blue-500", border: "border-blue-500", text: "text-blue-700", bg: "bg-blue-50", Icon: UserPlus },
  assessment: { color: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", Icon: ClipboardCheck },
  milestone: { color: "bg-amber-500", border: "border-amber-500", text: "text-amber-700", bg: "bg-amber-50", Icon: Star },
  dashboard: { color: "bg-violet-500", border: "border-violet-500", text: "text-violet-700", bg: "bg-violet-50", Icon: LayoutDashboard },
  care_plan: { color: "bg-teal-500", border: "border-teal-500", text: "text-teal-700", bg: "bg-teal-50", Icon: FileHeart },
};

function classifyEvent(actionType: string): MilestoneItem["type"] {
  if (actionType.includes("registration")) return "registration";
  if (actionType.includes("assessment")) return "assessment";
  if (actionType.includes("milestone")) return "milestone";
  if (actionType.includes("care_plan") || actionType.includes("care plan")) return "care_plan";
  if (actionType.includes("dashboard") || actionType.includes("view")) return "dashboard";
  return "dashboard";
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const JourneyVisualSummary = ({ journeyData, userProfile }: Props) => {
  const { milestones, sessions, deviceInfo, firstSeen, lastActive, totalTime } = useMemo(() => {
    if (!journeyData.length) {
      return { milestones: [], sessions: 0, deviceInfo: null, firstSeen: null, lastActive: null, totalTime: 0 };
    }

    const sorted = [...journeyData].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Build milestones — group by type+date, deduplicate
    const seen = new Map<string, MilestoneItem>();
    for (const evt of sorted) {
      const type = classifyEvent(evt.action_type);
      const d = new Date(evt.created_at);
      const dateKey = d.toDateString();
      const key = `${type}_${dateKey}`;
      if (seen.has(key)) {
        seen.get(key)!.count++;
      } else {
        seen.set(key, { label: evt.action_type.replace(/_/g, " "), date: d, type, count: 1 });
      }
    }
    const milestones = Array.from(seen.values());

    // Sessions — group by unique dates
    const uniqueDates = new Set(sorted.map((e) => new Date(e.created_at).toDateString()));
    const sessions = uniqueDates.size;

    // Device info from first event with additional_data
    const withDevice = sorted.find((e) => e.additional_data?.device_type || e.additional_data?.browser);
    const deviceInfo = withDevice?.additional_data
      ? {
          type: withDevice.additional_data.device_type || "unknown",
          browser: withDevice.additional_data.browser || "Unknown",
          os: withDevice.additional_data.os || "Unknown",
        }
      : null;

    const firstSeen = new Date(sorted[0].created_at);
    const lastActive = new Date(sorted[sorted.length - 1].created_at);

    // Total tracked time from time_on_previous_page
    let totalTime = 0;
    for (const evt of sorted) {
      const t = evt.additional_data?.time_on_previous_page;
      if (typeof t === "number") totalTime += t;
    }

    return { milestones, sessions, deviceInfo, firstSeen, lastActive, totalTime };
  }, [journeyData]);

  if (!journeyData.length) return null;

  const DeviceIcon = deviceInfo?.type === "mobile" ? Smartphone : deviceInfo?.type === "tablet" ? Tablet : Monitor;

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.round(secs / 60)}m`;
    return `${(secs / 3600).toFixed(1)}h`;
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* User info bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {getInitials(userProfile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">{userProfile?.full_name || "Unknown User"}</span>
          {userProfile?.role && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
              {userProfile.role}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            First seen: {firstSeen ? formatShortDate(firstSeen) : "—"}
          </span>
          <span className="text-xs text-muted-foreground">{journeyData.length} events</span>
        </div>

        {/* Horizontal milestone timeline */}
        <div className="relative overflow-x-auto pb-2">
          <div className="flex items-start gap-0 min-w-max px-2">
            {milestones.map((m, i) => {
              const cfg = MILESTONE_CONFIG[m.type];
              const Icon = cfg.Icon;
              const showGap =
                i > 0 &&
                m.date.toDateString() !== milestones[i - 1].date.toDateString() &&
                m.date.getTime() - milestones[i - 1].date.getTime() > 86400000;
              const gapDays = showGap
                ? Math.round((m.date.getTime() - milestones[i - 1].date.getTime()) / 86400000)
                : 0;

              return (
                <div key={i} className="flex items-start">
                  {/* Connector line */}
                  {i > 0 && (
                    <div className="flex flex-col items-center justify-start pt-4 mx-0.5">
                      <div
                        className={`h-0.5 ${showGap ? "border-t border-dashed border-muted-foreground/40 w-12" : "bg-muted-foreground/20 w-8"}`}
                      />
                      {showGap && (
                        <span className="text-[10px] text-muted-foreground mt-0.5">{gapDays}d</span>
                      )}
                    </div>
                  )}

                  {/* Milestone dot */}
                  <div className="flex flex-col items-center w-20 shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                    </div>
                    <span className="text-[11px] font-medium text-foreground mt-1.5 text-center leading-tight capitalize truncate w-full">
                      {m.type.replace(/_/g, " ")}
                      {m.count > 1 && (
                        <span className="text-muted-foreground"> ×{m.count}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatShortDate(m.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
          {deviceInfo && (
            <span className="flex items-center gap-1">
              <DeviceIcon className="w-3.5 h-3.5" />
              {deviceInfo.os}/{deviceInfo.browser}
            </span>
          )}
          <span className="flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            {sessions} session{sessions !== 1 ? "s" : ""}
          </span>
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{formatTime(totalTime)} tracked
            </span>
          )}
          {lastActive && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last active: {formatShortDate(lastActive)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
