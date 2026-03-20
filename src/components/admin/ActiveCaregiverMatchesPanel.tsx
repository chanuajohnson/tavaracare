import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, ChevronDown, ChevronUp, UserCheck, UserX, Clock } from "lucide-react";

interface CaregiverMatch {
  id: string;
  caregiver_id: string;
  assignment_type: string;
  match_score: number;
  status: string;
  is_active: boolean;
  created_at: string;
  match_explanation: string | null;
  assignment_reason: string | null;
  caregiver_name: string | null;
  professional_type: string | null;
  location: string | null;
  available_for_matching: boolean;
}

interface ActiveCaregiverMatchesPanelProps {
  userId: string;
}

export const ActiveCaregiverMatchesPanel = ({ userId }: ActiveCaregiverMatchesPanelProps) => {
  const [matches, setMatches] = useState<CaregiverMatch[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchMatches = useCallback(async () => {
    if (!userId) return;

    const [assignmentsResult, availableResult] = await Promise.all([
      supabase
        .from("caregiver_assignments")
        .select("id, caregiver_id, assignment_type, match_score, status, is_active, created_at, match_explanation, assignment_reason")
        .eq("family_user_id", userId)
        .order("is_active", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("role", "professional")
        .eq("available_for_matching", true),
    ]);

    setTotalAvailable(availableResult.count ?? 0);

    if (assignmentsResult.error || !assignmentsResult.data?.length) {
      setMatches([]);
      setIsLoading(false);
      return;
    }

    const caregiverIds = [...new Set(assignmentsResult.data.map((a) => a.caregiver_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, professional_type, location, available_for_matching")
      .in("id", caregiverIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

    const enriched: CaregiverMatch[] = assignmentsResult.data.map((a) => {
      const profile = profileMap.get(a.caregiver_id);
      return {
        ...a,
        caregiver_name: profile?.full_name ?? "Unknown",
        professional_type: profile?.professional_type ?? null,
        location: profile?.location ?? null,
        available_for_matching: profile?.available_for_matching ?? false,
      };
    });

    setMatches(enriched);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`matches-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "caregiver_assignments", filter: `family_user_id=eq.${userId}` },
        () => fetchMatches()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          if (matches.some((m) => m.caregiver_id === payload.new.id)) {
            fetchMatches();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMatches, matches]);

  const activeMatches = matches.filter((m) => m.is_active);
  const inactiveMatches = matches.filter((m) => !m.is_active);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIndicator = (match: CaregiverMatch) => {
    if (!match.is_active) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-muted-foreground/40" title="Inactive" />;
    if (match.available_for_matching) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Available" />;
    return <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" title="Unavailable for new matches" />;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Active Caregiver Matches
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{activeMatches.length} active</Badge>
            <span>of {totalAvailable} available caregivers</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeMatches.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No active matches for this user.</p>
        )}

        {activeMatches.map((match) => (
          <div
            key={match.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              {getStatusIndicator(match)}
              <div>
                <p className="font-medium text-sm">{match.caregiver_name}</p>
                <p className="text-xs text-muted-foreground">
                  {match.professional_type ?? "Caregiver"}
                  {match.location ? ` · ${match.location}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <Badge
                variant={match.assignment_type === "manual" ? "default" : "outline"}
                className="text-xs"
              >
                {match.assignment_type}
              </Badge>
              <span className="text-sm font-semibold tabular-nums w-10 text-right">{match.match_score}</span>
              <span className="text-xs text-muted-foreground w-20 text-right">
                {new Date(match.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        ))}

        {inactiveMatches.length > 0 && (
          <Collapsible open={showInactive} onOpenChange={setShowInactive}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 cursor-pointer">
              {showInactive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Previous Matches ({inactiveMatches.length})
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {inactiveMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-dashed opacity-60"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIndicator(match)}
                    <div>
                      <p className="font-medium text-sm">{match.caregiver_name}</p>
                      <p className="text-xs text-muted-foreground">{match.professional_type ?? "Caregiver"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs text-muted-foreground">{match.assignment_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(match.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
