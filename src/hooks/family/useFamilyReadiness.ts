/**
 * useFamilyReadiness — the single read path for the family pacing layer.
 *
 * Returns the stored per-dimension profile plus the evaluated protective rules.
 * Never averages anything. Absence of a profile yields the cautious defaults
 * defined in the rule engine.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  type FamilyReadinessProfile,
  READINESS_ASSESSMENT_PROFILE_KEY,
} from "@/data/familyReadinessAssessment";
import {
  evaluateReadiness,
  deriveObservedEngagement,
  type ReadinessDecisions,
} from "@/lib/family/readinessRules";

export const FAMILY_READINESS_CHANGED_EVENT = "tavara:family-readiness-changed";

const readLocalProfile = (): FamilyReadinessProfile | null => {
  try {
    const raw = localStorage.getItem(READINESS_ASSESSMENT_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FamilyReadinessProfile;
    return parsed?.version === 2 ? parsed : null;
  } catch {
    return null;
  }
};

interface UseFamilyReadinessResult {
  profile: FamilyReadinessProfile | null;
  decisions: ReadinessDecisions;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * @param profileId Optional — pass a family's id to read their readiness
 * (admin/coordinator use). Defaults to the signed-in user.
 */
export const useFamilyReadiness = (profileId?: string): UseFamilyReadinessResult => {
  const { user } = useAuth();
  const targetId = profileId ?? user?.id;

  const [profile, setProfile] = useState<FamilyReadinessProfile | null>(null);
  const [engagementEvents, setEngagementEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);

    if (!targetId) {
      setProfile(readLocalProfile());
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("family_readiness_profile")
      .eq("id", targetId)
      .maybeSingle();

    if (!error) {
      // Signed-in family: their own record is the only source of truth. A
      // cached profile from an earlier session must never stand in for it.
      setProfile(
        (data?.family_readiness_profile as unknown as FamilyReadinessProfile) ?? null
      );
    } else {
      setProfile(readLocalProfile());
    }

    // Observed engagement — behavioural evidence only, never treated as
    // self-reported comfort.
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("cta_engagement_tracking")
      .select("id", { count: "exact", head: true })
      .eq("user_id", targetId)
      .gte("created_at", since);
    setEngagementEvents(count ?? 0);

    setIsLoading(false);
  }, [targetId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener(FAMILY_READINESS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(FAMILY_READINESS_CHANGED_EVENT, handler);
  }, [load]);

  const decisions = evaluateReadiness({
    profile,
    observedEngagement: deriveObservedEngagement(engagementEvents),
  });

  return { profile, decisions, isLoading, refresh: load };
};
