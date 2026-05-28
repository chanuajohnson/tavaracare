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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, MessageCircle, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AnalyticsEvent,
  SubscriptionAssignment,
  ProfessionalMilestone,
} from "@/hooks/admin/useBlogAnalyticsRange";

interface Props {
  events: AnalyticsEvent[];
  previousEvents?: AnalyticsEvent[];
  subscriptions?: SubscriptionAssignment[];
  proDocs?: ProfessionalMilestone[];
  proAssigned?: ProfessionalMilestone[];
}

type RoleFilter = "combined" | "family" | "professional";

interface Step {
  id: string;
  label: string;
  count: number;
  pctOfTop: number;
  dropFromPrev: number | null;
  applicable: boolean;
  note?: string;
  source: string;
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

function buildSteps(
  events: AnalyticsEvent[],
  role: RoleFilter,
  subscriptionsCount: number,
  proDocsCount: number,
  proAssignedCount: number,
): Step[] {
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
  const quizViews = count(["readiness_quiz_view"]);
  const quizCompleted = count(["readiness_quiz_completed"]);
  const quizCta = count(["quiz_cta_click"]);
  const regPageViews = count([
    "family_registration_page_view",
    "professional_registration_page_view",
  ]);
  const regFormStarted = count([
    "family_registration_form_started",
    "professional_registration_form_started",
  ]);
  const regCompleted = count(REG_COMPLETE_TYPES);

  const familyApplicable = role !== "professional";
  const proApplicable = role !== "family";

  const raw: Omit<Step, "pctOfTop" | "dropFromPrev">[] = [
    {
      id: "landing",
      label: "Blog / location landing",
      count: landings,
      applicable: role === "combined",
      note: role !== "combined" ? "Landings have no role yet — see Combined tab" : undefined,
      source: "blog_utm_landed + location_utm_landed",
    },
    {
      id: "cta",
      label: "CTA click",
      count: ctaClicks,
      applicable: role === "combined",
      note: role !== "combined" ? "CTA clicks are pre-auth — see Combined tab" : undefined,
      source: "blog_cta_click",
    },
    {
      id: "quiz_view",
      label: "Quiz viewed",
      count: familyApplicable ? quizViews : 0,
      applicable: familyApplicable,
      note: !familyApplicable ? "Family-only readiness quiz" : undefined,
      source: "readiness_quiz_view",
    },
    {
      id: "quiz_done",
      label: "Quiz completed",
      count: familyApplicable ? quizCompleted : 0,
      applicable: familyApplicable,
      note: !familyApplicable ? "Family-only readiness quiz" : undefined,
      source: "readiness_quiz_completed",
    },
    {
      id: "quiz_cta",
      label: "Quiz CTA clicked",
      count: familyApplicable ? quizCta : 0,
      applicable: familyApplicable,
      note: !familyApplicable ? "Family-only readiness quiz" : undefined,
      source: "quiz_cta_click",
    },
    {
      id: "reg_view",
      label: "Registration page view",
      count: regPageViews,
      applicable: true,
      source: "family_/professional_registration_page_view",
    },
    {
      id: "reg_started",
      label: "Registration form started",
      count: regFormStarted,
      applicable: true,
      note: regFormStarted === 0 ? "Pending instrumentation in registration forms" : undefined,
      source: "family_/professional_registration_form_started",
    },
    {
      id: "reg_done",
      label: "Registration completed",
      count: regCompleted,
      applicable: true,
      source: "family_/professional_/community_registration_complete",
    },
    {
      id: "pro_docs",
      label: "Documents uploaded (Professional)",
      count: proApplicable ? proDocsCount : 0,
      applicable: proApplicable,
      note: !proApplicable ? "Professional-only milestone" : undefined,
      source: "professional_documents",
    },
    {
      id: "sub_assigned",
      label: "Subscription assigned (Family)",
      count: familyApplicable ? subscriptionsCount : 0,
      applicable: familyApplicable,
      note: !familyApplicable
        ? "Family-only milestone (admin-assigned)"
        : "Admin onboarding checklist → 'Tavara subscription'. Timestamp = last checklist edit.",
      source: "onboarding_checklists.post_onboarding_6",
    },
    {
      id: "pro_assigned",
      label: "Assigned to family team (Professional)",
      count: proApplicable ? proAssignedCount : 0,
      applicable: proApplicable,
      note: !proApplicable ? "Professional-only milestone" : undefined,
      source: "care_team_members",
    },
  ];

  const top = raw[0].count || 1;
  return raw.map((r, i) => {
    // Drop-off only computed against the previous *applicable* step.
    let prevApplicable: typeof r | null = null;
    for (let j = i - 1; j >= 0; j--) {
      if (raw[j].applicable) {
        prevApplicable = raw[j];
        break;
      }
    }
    const dropFromPrev =
      prevApplicable === null || prevApplicable.count === 0 || !r.applicable
        ? null
        : 1 - r.count / prevApplicable.count;
    return {
      ...r,
      pctOfTop: r.applicable ? r.count / top : 0,
      dropFromPrev,
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
  const applicable = steps.filter((s) => s.applicable);
  for (let i = 1; i < applicable.length; i++) {
    const d = applicable[i].dropFromPrev;
    if (d === null) continue;
    if (!worst || d > worst.drop) {
      worst = { from: applicable[i - 1].label, to: applicable[i].label, drop: d };
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
      .filter((e) => REG_COMPLETE_TYPES.includes(e.action_type) && inScope(e))
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
      .select("id, full_name, role, phone_number, created_at")
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
                      <Badge variant="secondary" className="capitalize">{r}</Badge>
                    </div>
                    {p?.phone_number && (
                      <div className="text-xs text-muted-foreground truncate">
                        {p.phone_number}
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

function SubscriptionsDialog({
  open,
  onOpenChange,
  subscriptions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subscriptions: SubscriptionAssignment[];
}) {
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(false);

  const sorted = useMemo(
    () => [...subscriptions].sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)),
    [subscriptions],
  );

  useEffect(() => {
    if (!open) return;
    const ids = Array.from(new Set(sorted.map((s) => s.family_id)));
    if (ids.length === 0) {
      setProfiles({});
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, full_name, role, phone_number, created_at")
      .in("id", ids)
      .then(({ data, error }) => {
        if (error) {
          toast.error("Could not load family profiles");
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
  }, [open, sorted]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subscriptions assigned — families ({sorted.length})</DialogTitle>
          <DialogDescription>
            Families marked with "Tavara subscription" on the admin onboarding
            checklist in this window. Timestamp shows the last checklist edit.
          </DialogDescription>
        </DialogHeader>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No subscriptions assigned in this window.
          </p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {sorted.map((s, idx) => {
              const p = profiles[s.family_id];
              return (
                <div key={`${s.family_id}-${idx}`} className="rounded-md border p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{p?.full_name || "(profile not found)"}</span>
                    <Badge variant="secondary">Family</Badge>
                  </div>
                  {p?.phone_number && (
                    <div className="text-xs text-muted-foreground">{p.phone_number}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Assigned ~ {new Date(s.updated_at).toLocaleString()}
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

function ProMilestoneDialog({
  open,
  onOpenChange,
  rows,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rows: ProfessionalMilestone[];
  title: string;
  description: string;
}) {
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(false);
  const sorted = useMemo(
    () => [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [rows],
  );

  useEffect(() => {
    if (!open) return;
    const ids = Array.from(new Set(sorted.map((r) => r.professional_id)));
    if (ids.length === 0) {
      setProfiles({});
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, full_name, role, phone_number, created_at")
      .in("id", ids)
      .then(({ data, error }) => {
        if (error) setProfiles({});
        else {
          const map: Record<string, ProfileRow> = {};
          (data ?? []).forEach((p: any) => (map[p.id] = p as ProfileRow));
          setProfiles(map);
        }
        setLoading(false);
      });
  }, [open, sorted]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title} ({sorted.length})</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nothing in this window.
          </p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {sorted.map((r, idx) => {
              const p = profiles[r.professional_id];
              return (
                <div key={`${r.professional_id}-${idx}`} className="rounded-md border p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{p?.full_name || "(profile not found)"}</span>
                    <Badge variant="secondary">Professional</Badge>
                  </div>
                  {p?.phone_number && (
                    <div className="text-xs text-muted-foreground">{p.phone_number}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    First entry ~ {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              );
            })}
            {loading && (
              <p className="text-xs text-muted-foreground text-center py-2">Loading…</p>
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
  onViewSubscriptions,
  onViewDocs,
  onViewAssigned,
}: {
  steps: Step[];
  onViewUsers: () => void;
  onViewSubscriptions: () => void;
  onViewDocs: () => void;
  onViewAssigned: () => void;
}) {
  return (
    <div className="space-y-3">
      {steps.map((s) => {
        const widthPct = Math.max(4, Math.round(s.pctOfTop * 100));
        const greyed = !s.applicable;
        return (
          <div key={s.id} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <div className={`font-medium flex items-center gap-2 ${greyed ? "text-muted-foreground" : ""}`}>
                {s.label}
                {s.id === "reg_done" && s.count > 0 && (
                  <button
                    type="button"
                    onClick={onViewUsers}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    View users
                  </button>
                )}
                {s.id === "sub_assigned" && s.applicable && s.count > 0 && (
                  <button
                    type="button"
                    onClick={onViewSubscriptions}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    View subscriptions
                  </button>
                )}
                {s.id === "pro_docs" && s.applicable && s.count > 0 && (
                  <button
                    type="button"
                    onClick={onViewDocs}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    View professionals
                  </button>
                )}
                {s.id === "pro_assigned" && s.applicable && s.count > 0 && (
                  <button
                    type="button"
                    onClick={onViewAssigned}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    View assigned
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="tabular-nums">{s.count.toLocaleString()}</span>
                <span className="tabular-nums w-12 text-right">
                  {Math.round(s.pctOfTop * 100)}%
                </span>
                {s.dropFromPrev !== null ? (
                  <span className={`tabular-nums w-20 text-right ${dropColor(s.dropFromPrev)}`}>
                    ↓ {Math.round(s.dropFromPrev * 100)}%
                  </span>
                ) : (
                  <span className="w-20" />
                )}
              </div>
            </div>
            <div className="h-2 w-full rounded bg-muted overflow-hidden">
              <div
                className={`h-full rounded ${greyed ? "bg-muted-foreground/30" : "bg-primary"}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            {s.note && (
              <p className="text-xs text-muted-foreground italic">{s.note}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EngagementTiles({
  events,
  previousEvents,
}: {
  events: AnalyticsEvent[];
  previousEvents: AnalyticsEvent[];
}) {
  const countOf = (arr: AnalyticsEvent[], type: string) =>
    arr.reduce((n, e) => (e.action_type === type ? n + 1 : n), 0);

  const tiles = [
    {
      id: "wa",
      label: "WhatsApp clicks",
      icon: MessageCircle,
      current: countOf(events, "whatsapp_click"),
      previous: countOf(previousEvents, "whatsapp_click"),
    },
    {
      id: "match",
      label: "Caregiver match requests",
      icon: HeartHandshake,
      current: countOf(events, "caregiver_match_request"),
      previous: countOf(previousEvents, "caregiver_match_request"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 pt-2">
      {tiles.map((t) => {
        const delta = t.previous === 0 ? null : ((t.current - t.previous) / t.previous) * 100;
        const Icon = t.icon;
        return (
          <div key={t.id} className="rounded-md border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-semibold tabular-nums">{t.current}</span>
              {delta !== null ? (
                <span className={`text-xs tabular-nums ${delta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(0)}% vs prev
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">no prev data</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MethodologyBlock({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-md">
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/50">
          How this funnel is counted
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 text-xs text-muted-foreground space-y-2">
        <ul className="space-y-1">
          {steps.map((s) => (
            <li key={s.id} className="flex justify-between gap-3">
              <span className="font-medium text-foreground">{s.label}</span>
              <code className="text-[10px] font-mono">{s.source}</code>
            </li>
          ))}
        </ul>
        <div className="pt-2 border-t space-y-1">
          <p>• Landing → CTA → Reg page view are anonymous and can't be split by role; use Combined.</p>
          <p>• Quiz steps are family-only (no professional equivalent yet) and pre-auth, so attribution to later signups is directional.</p>
          <p>• Registration form started fires when a user focuses any field on the registration form (pending instrumentation).</p>
          <p>• Subscription assigned timestamp = last checklist edit, not exact tick moment.</p>
          <p>• Professional milestones dedupe to first occurrence per professional within the window.</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AcquisitionFunnelCard({
  events,
  previousEvents = [],
  subscriptions = [],
  proDocs = [],
  proAssigned = [],
}: Props) {
  const [tab, setTab] = useState<RoleFilter>("combined");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [assignedDialogOpen, setAssignedDialogOpen] = useState(false);

  const subCount = subscriptions.length;
  const docsCount = proDocs.length;
  const assignedCount = proAssigned.length;

  const combined = useMemo(
    () => buildSteps(events, "combined", subCount, docsCount, assignedCount),
    [events, subCount, docsCount, assignedCount],
  );
  const family = useMemo(
    () => buildSteps(events, "family", subCount, docsCount, assignedCount),
    [events, subCount, docsCount, assignedCount],
  );
  const professional = useMemo(
    () => buildSteps(events, "professional", subCount, docsCount, assignedCount),
    [events, subCount, docsCount, assignedCount],
  );

  const active =
    tab === "family" ? family : tab === "professional" ? professional : combined;
  const leak = biggestLeak(active);

  const applicable = active.filter((s) => s.applicable);
  const overall =
    applicable.length > 1 && applicable[0].count > 0
      ? (applicable[applicable.length - 1].count / applicable[0].count) * 100
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Acquisition funnel</CardTitle>
        <CardDescription>
          Landing → quiz → registration → onboarding milestone. Drop-off % from
          the previous applicable step. Green &lt;40%, amber 40–70%, red &gt;70%.
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
            <FunnelRows
              steps={combined}
              onViewUsers={() => setDialogOpen(true)}
              onViewSubscriptions={() => setSubDialogOpen(true)}
              onViewDocs={() => setDocsDialogOpen(true)}
              onViewAssigned={() => setAssignedDialogOpen(true)}
            />
          </TabsContent>
          <TabsContent value="family" className="mt-4">
            <FunnelRows
              steps={family}
              onViewUsers={() => setDialogOpen(true)}
              onViewSubscriptions={() => setSubDialogOpen(true)}
              onViewDocs={() => setDocsDialogOpen(true)}
              onViewAssigned={() => setAssignedDialogOpen(true)}
            />
          </TabsContent>
          <TabsContent value="professional" className="mt-4">
            <FunnelRows
              steps={professional}
              onViewUsers={() => setDialogOpen(true)}
              onViewSubscriptions={() => setSubDialogOpen(true)}
              onViewDocs={() => setDocsDialogOpen(true)}
              onViewAssigned={() => setAssignedDialogOpen(true)}
            />
          </TabsContent>
        </Tabs>

        <EngagementTiles events={events} previousEvents={previousEvents} />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-sm">
          <div className="text-muted-foreground">
            {leak ?? "Not enough data yet for drop-off analysis."}
          </div>
          <div className="text-muted-foreground">
            Top → terminal:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {overall.toFixed(1)}%
            </span>
          </div>
        </div>

        <MethodologyBlock steps={active} />

        <RegistrationUsersDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          events={events}
          role={tab}
        />
        <SubscriptionsDialog
          open={subDialogOpen}
          onOpenChange={setSubDialogOpen}
          subscriptions={subscriptions}
        />
        <ProMilestoneDialog
          open={docsDialogOpen}
          onOpenChange={setDocsDialogOpen}
          rows={proDocs}
          title="Documents uploaded — professionals"
          description="Professionals with at least one document uploaded in this window."
        />
        <ProMilestoneDialog
          open={assignedDialogOpen}
          onOpenChange={setAssignedDialogOpen}
          rows={proAssigned}
          title="Assigned to family — professionals"
          description="Professionals added to a family care team in this window."
        />
      </CardContent>
    </Card>
  );
}
