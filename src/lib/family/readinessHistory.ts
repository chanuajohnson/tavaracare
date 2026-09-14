/**
 * Readiness history + profile persistence.
 *
 * Every dimension change is appended to `family_readiness_history` so we can
 * see how a family moved over the care journey. Values are never silently
 * overwritten without a history row.
 */

import { supabase } from "@/integrations/supabase/client";
import {
  type FamilyReadinessProfile,
  type ReadinessDimension,
  type ReadinessUpdateSource,
  journeyStageToLegacyStage,
  READINESS_ASSESSMENT_PROFILE_KEY,
} from "@/data/familyReadinessAssessment";
import { FAMILY_READINESS_CHANGED_EVENT } from "@/hooks/family/useFamilyReadiness";

const TRACKED_DIMENSIONS: ReadinessDimension[] = [
  "current_journey_stage",
  "prior_care_experience",
  "outside_care_comfort",
  "information_capacity",
  "communication_frequency",
  "communication_window",
  "management_preference",
  "trust_privacy_sensitivity",
  "home_change_readiness",
  "cost_presentation_preference",
];

const valueOf = (
  profile: FamilyReadinessProfile | null,
  dim: ReadinessDimension
): string | null => {
  if (!profile) return null;
  const v = (profile as Record<string, unknown>)[dim];
  if (v === undefined || v === null) return null;
  return Array.isArray(v) ? v.join(",") : String(v);
};

const broadcast = () => {
  try {
    window.dispatchEvent(new CustomEvent(FAMILY_READINESS_CHANGED_EVENT));
  } catch {
    // ignore — non-browser env
  }
};

export const cacheProfileLocally = (profile: FamilyReadinessProfile) => {
  try {
    localStorage.setItem(READINESS_ASSESSMENT_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
};

/**
 * Persists a full profile (initial assessment) and records one history row per
 * dimension that changed. Also keeps the legacy `client_stage` in step so
 * existing consumers keep working.
 */
export const saveReadinessProfile = async (
  userId: string,
  profile: FamilyReadinessProfile,
  source: ReadinessUpdateSource = "initial_quiz"
): Promise<{ ok: boolean; error?: string }> => {
  cacheProfileLocally(profile);

  const { data: existing } = await supabase
    .from("profiles")
    .select("family_readiness_profile")
    .eq("id", userId)
    .maybeSingle();

  const previous = (existing?.family_readiness_profile ??
    null) as unknown as FamilyReadinessProfile | null;

  const legacyStage = journeyStageToLegacyStage(profile.current_journey_stage);

  const { error } = await supabase
    .from("profiles")
    .update({
      family_readiness_profile: profile as unknown as never,
      care_journey_stage: profile.current_journey_stage ?? null,
      information_capacity: profile.information_capacity ?? null,
      // Backward compatibility — legacy consumers of client_stage.
      client_stage: legacyStage,
      client_stage_assessed_at: profile.assessed_at,
      client_stage_quiz_responses: (profile.raw_answers ?? {}) as unknown as never,
    })
    .eq("id", userId);

  if (error) {
    console.error("[readiness] failed to save profile:", error);
    return { ok: false, error: error.message };
  }

  const rows = TRACKED_DIMENSIONS.map((dim) => ({
    profile_id: userId,
    dimension: dim,
    previous_value: valueOf(previous, dim),
    new_value: valueOf(profile, dim),
    source,
  })).filter((r) => r.new_value !== null && r.previous_value !== r.new_value);

  if (rows.length) {
    const { error: histError } = await supabase
      .from("family_readiness_history")
      .insert(rows);
    if (histError) {
      // History is important but must never block the family.
      console.error("[readiness] failed to write history:", histError);
    }
  }

  broadcast();
  return { ok: true };
};

/**
 * Updates a single dimension from a contextual check-in, preserving history.
 */
export const updateReadinessDimension = async (
  userId: string,
  dimension: ReadinessDimension,
  newValue: string,
  source: ReadinessUpdateSource,
  notes?: string
): Promise<{ ok: boolean; error?: string }> => {
  const { data: existing } = await supabase
    .from("profiles")
    .select("family_readiness_profile")
    .eq("id", userId)
    .maybeSingle();

  const previous = (existing?.family_readiness_profile ??
    null) as unknown as FamilyReadinessProfile | null;

  const updated: FamilyReadinessProfile = {
    ...(previous ?? { version: 2, assessed_at: new Date().toISOString() }),
    version: 2,
    [dimension]: newValue,
    last_source: source,
  } as FamilyReadinessProfile;

  const patch: Record<string, unknown> = {
    family_readiness_profile: updated,
  };
  if (dimension === "current_journey_stage") {
    patch.care_journey_stage = newValue;
    patch.client_stage = journeyStageToLegacyStage(
      newValue as FamilyReadinessProfile["current_journey_stage"]
    );
  }
  if (dimension === "information_capacity") {
    patch.information_capacity = newValue;
  }

  const { error } = await supabase
    .from("profiles")
    .update(patch as never)
    .eq("id", userId);

  if (error) {
    console.error("[readiness] failed to update dimension:", error);
    return { ok: false, error: error.message };
  }

  const { error: histError } = await supabase.from("family_readiness_history").insert({
    profile_id: userId,
    dimension,
    previous_value: valueOf(previous, dimension),
    new_value: newValue,
    source,
    notes: notes ?? null,
  });
  if (histError) console.error("[readiness] failed to write history:", histError);

  cacheProfileLocally(updated);
  broadcast();
  return { ok: true };
};

export interface ReadinessHistoryRow {
  id: string;
  dimension: string;
  previous_value: string | null;
  new_value: string | null;
  source: string;
  notes: string | null;
  created_at: string;
}

export const fetchReadinessHistory = async (
  profileId: string,
  limit = 20
): Promise<ReadinessHistoryRow[]> => {
  const { data, error } = await supabase
    .from("family_readiness_history")
    .select("id, dimension, previous_value, new_value, source, notes, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[readiness] failed to fetch history:", error);
    return [];
  }
  return (data ?? []) as ReadinessHistoryRow[];
};

/* ------------------------------------------------------------------ */
/* Understanding checkpoints                                           */
/* ------------------------------------------------------------------ */

export type CheckpointKey =
  | "placement_confirmation"
  | "first_invoice"
  | "nis_explanation"
  | "additional_provider"
  | "home_recommendation";

export type CheckpointResponse =
  | "ready"
  | "needs_time"
  | "explain_simply"
  | "speak_to_someone";

export interface CheckpointRow {
  id: string;
  checkpoint_key: string;
  response: string | null;
  resolved_at: string | null;
  created_at: string;
}

export const fetchCheckpoints = async (profileId: string): Promise<CheckpointRow[]> => {
  const { data, error } = await supabase
    .from("family_understanding_checkpoints")
    .select("id, checkpoint_key, response, resolved_at, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[readiness] failed to fetch checkpoints:", error);
    return [];
  }
  return (data ?? []) as CheckpointRow[];
};

export const recordCheckpoint = async (
  profileId: string,
  key: CheckpointKey,
  response: CheckpointResponse,
  context?: Record<string, unknown>
): Promise<{ ok: boolean }> => {
  const { error } = await supabase.from("family_understanding_checkpoints").upsert(
    {
      profile_id: profileId,
      checkpoint_key: key,
      response,
      context: (context ?? {}) as never,
      // Only "ready" closes the loop. The other three raise coordinator follow-up.
      resolved_at: response === "ready" ? new Date().toISOString() : null,
    },
    { onConflict: "profile_id,checkpoint_key" }
  );
  if (error) {
    console.error("[readiness] failed to record checkpoint:", error);
    return { ok: false };
  }
  return { ok: true };
};
