import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsEvent } from "@/hooks/admin/useBlogAnalyticsRange";

interface Props {
  events: AnalyticsEvent[];
}

type RoleFilter = "combined" | "family" | "professional";

interface Step {
  label: string;
  count: number;
  pctOfTop: number;
  dropFromPrev: number | null;
  isPlaceholder?: boolean;
}

const REG_COMPLETE_TYPES = [
  "family_registration_complete",
  "professional_registration_complete",
  "community_registration_complete",
];

function roleOf(ev: AnalyticsEvent): string | null {
  const d = ev.additional_data ?? {};
  const r =
    (d.role as string) ||
    (d.user_type as string) ||
    (d.intended_role as string) ||
    null;
  if (!r) {
    if (ev.action_type.startsWith("family_")) return "family";
    if (ev.action_type.startsWith("professional_")) return "professional";
    if (ev.action_type.startsWith("community_")) return "community";
  }
  return r;
}

function buildSteps(events: AnalyticsEvent[], role: RoleFilter): Step[] {
  const inScope = (ev: AnalyticsEvent) => {
    if (role === "combined") return true;
    const r = roleOf(ev);
    if (!r) return false;
    return r === role;
  };

  const count = (types: string[]) =>
    events.reduce(
      (n, e) => (types.includes(e.action_type) && inScope(e) ? n + 1 : n),
      0,
    );

  const landings = count(["blog_utm_landed", "location_utm_landed"]);
  const ctaClicks = count(["blog_cta_click"]);
  const regPageViews = count([
    "family_registration_page_view",
    "professional_registration_page_view",
  ]);
  const regCompleted = count(REG_COMPLETE_TYPES);
  const subStarted = count(["subscription_started"]);

  const raw: { label: string; count: number; isPlaceholder?: boolean }[] = [
    { label: "Blog / location landing", count: landings },
    { label: "CTA click", count: ctaClicks },
    { label: "Registration page view", count: regPageViews },
    { label: "Registration completed", count: regCompleted },
    {
      label: "Subscription started",
      count: subStarted,
      isPlaceholder: subStarted === 0,
    },
  ];

  const top = raw[0].count || 1;
  return raw.map((r, i) => {
    const prev = i === 0 ? null : raw[i - 1].count;
    const dropFromPrev =
      prev === null || prev === 0 ? null : 1 - r.count / prev;
    return {
      label: r.label,
      count: r.count,
      pctOfTop: r.count / top,
      dropFromPrev,
      isPlaceholder: r.isPlaceholder,
    };
  });
}

function dropColor(drop: number): string {
  if (drop < 0.4) return "text-emerald-600 dark:text-emerald-400";
  if (drop < 0.7) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

function biggestLeak(steps: Step[]): string | null {
  let worst: { from: string; to: string; drop: number } | null = null;
  for (let i = 1; i < steps.length; i++) {
    const d = steps[i].dropFromPrev;
    if (d === null) continue;
    if (steps[i].isPlaceholder && steps[i].count === 0) continue;
    if (!worst || d > worst.drop) {
      worst = { from: steps[i - 1].label, to: steps[i].label, drop: d };
    }
  }
  if (!worst) return null;
  return `Biggest drop-off: ${worst.from} → ${worst.to} (${Math.round(
    worst.drop * 100,
  )}%)`;
}

interface RegEvent {
  user_id: string | null;
  action_type: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: string | null;
  phone_number: string | null;
  created_at: string | null;
}

function RegistrationUsersDialog({
  open,
  onOpenChange,
  events,
  role,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  events: AnalyticsEvent[];
  role: RoleFilter;
}) {
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(false);

  const regEvents: RegEvent[] = useMemo(() => {
    const inScope = (ev: AnalyticsEvent) => {
      if (role === "combined") return true;
      const r = roleOf(ev);
      if (!r) return false;
      return r === role;
    };
    return events
      .filter(
        (e) => REG_COMPLETE_TYPES.includes(e.action_type) && inScope(e),
      )
      .map((e) => ({
        user_id: e.user_id ?? null,
        action_type: e.action_type,
        created_at: e.created_at,
      }))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [events, role]);

  useEffect(() => {
    if (!open) return;
    const ids = Array.from(
      new Set(regEvents.map((e) => e.user_id).filter((x): x is string => !!x)),
    );
    if (ids.length === 0) {
      setProfiles({});
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("id", ids)
      .then(({ data, error }) => {
        if (error) {
          toast.error("Could not load profiles");
          setProfiles({});
        } else {
          const map: Record<string, ProfileRow> = {};
          (data ?? []).forEach((p: any) => {
            map[p.id] = p as ProfileRow;
          });
          setProfiles(map);
        }
        setLoading(false);
      });
  }, [open, regEvents]);

  const roleLabel =
    role === "combined" ? "All roles" : role === "family" ? "Family" : "Professional";

  const roleFromEvent = (actionType: string) => {
    if (actionType.startsWith("family_")) return "family";
    if (actionType.startsWith("professional_")) return "professional";
    if (actionType.startsWith("community_")) return "community";
    return "unknown";
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registration completed — users ({regEvents.length})</DialogTitle>
          <DialogDescription>
            Users behind this funnel step in the selected window ({roleLabel}).
            Counts <em>form completions</em>, not new auth signups, so accounts
            may have been created earlier.
          </DialogDescription>
        </DialogHeader>

        {regEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No registration completions in this window.
          </p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {regEvents.map((ev, idx) => {
              const p = ev.user_id ? profiles[ev.user_id] : undefined;
              const r = p?.role ?? roleFromEvent(ev.action_type);
              return (
                <div
                  key={`${ev.user_id ?? "anon"}-${ev.created_at}-${idx}`}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {p?.full_name || "(profile not found)"}
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {r}
                      </Badge>
                    </div>
                    {p?.email && (
                      <div className="text-xs text-muted-foreground truncate">
                        {p.email}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Completed {new Date(ev.created_at).toLocaleString()}
                    </div>
                    {ev.user_id && (
                      <div className="flex items-center gap-1 mt-1">
                        <code className="text-[10px] font-mono text-muted-foreground">
                          {ev.user_id.slice(0, 8)}…{ev.user_id.slice(-4)}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => copy(ev.user_id!)}
                          aria-label="Copy user id"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Loading profile details…
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FunnelRows({
  steps,
  onViewUsers,
}: {
  steps: Step[];
  onViewUsers: () => void;
}) {
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const widthPct = Math.max(4, Math.round(s.pctOfTop * 100));
        const isRegCompleted = s.label === "Registration completed";
        return (
          <div key={s.label} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <div className="font-medium flex items-center gap-2">
                {s.label}
                {isRegCompleted && s.count > 0 && (
                  <button
                    type="button"
                    onClick={onViewUsers}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    View users
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="tabular-nums">
                  {s.count.toLocaleString()}
                </span>
                <span className="tabular-nums w-12 text-right">
                  {Math.round(s.pctOfTop * 100)}%
                </span>
                {s.dropFromPrev !== null ? (
                  <span
                    className={`tabular-nums w-20 text-right ${dropColor(
                      s.dropFromPrev,
                    )}`}
                  >
                    ↓ {Math.round(s.dropFromPrev * 100)}%
                  </span>
                ) : (
                  <span className="w-20" />
                )}
              </div>
            </div>
            <div className="h-2 w-full rounded bg-muted overflow-hidden">
              <div
                className={`h-full rounded ${
                  s.isPlaceholder && s.count === 0
                    ? "bg-muted-foreground/30"
                    : "bg-primary"
                }`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            {s.isPlaceholder && s.count === 0 && i === steps.length - 1 && (
              <p className="text-xs text-muted-foreground italic">
                Not yet tracked — will populate once subscription_started event
                is wired into the checkout flow.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AcquisitionFunnelCard({ events }: Props) {
  const [tab, setTab] = useState<RoleFilter>("combined");
  const [dialogOpen, setDialogOpen] = useState(false);

  const combined = useMemo(() => buildSteps(events, "combined"), [events]);
  const family = useMemo(() => buildSteps(events, "family"), [events]);
  const professional = useMemo(
    () => buildSteps(events, "professional"),
    [events],
  );

  const active =
    tab === "family" ? family : tab === "professional" ? professional : combined;
  const leak = biggestLeak(active);

  const overall =
    active[0].count > 0
      ? (active[active.length - 2].count / active[0].count) * 100
      : 0;

  const openUsers = () => setDialogOpen(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Acquisition funnel</CardTitle>
        <CardDescription>
          Landing → CTA → registration → subscription. Drop-off % from the
          previous step. Green &lt;40%, amber 40–70%, red &gt;70%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as RoleFilter)}>
          <TabsList>
            <TabsTrigger value="combined">Combined</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
          </TabsList>
          <TabsContent value="combined" className="mt-4">
            <FunnelRows steps={combined} onViewUsers={openUsers} />
          </TabsContent>
          <TabsContent value="family" className="mt-4">
            <FunnelRows steps={family} onViewUsers={openUsers} />
          </TabsContent>
          <TabsContent value="professional" className="mt-4">
            <FunnelRows steps={professional} onViewUsers={openUsers} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-sm">
          <div className="text-muted-foreground">
            {leak ?? "Not enough data yet for drop-off analysis."}
          </div>
          <div className="text-muted-foreground">
            Landing → registration:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {overall.toFixed(1)}%
            </span>
          </div>
        </div>
        {tab !== "combined" && (
          <p className="text-xs text-muted-foreground">
            Role tabs exclude events with no role attached. Use Combined for
            totals that include early-funnel landings without a known role.
          </p>
        )}

        <RegistrationUsersDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          events={events}
          role={tab}
        />
      </CardContent>
    </Card>
  );
}
