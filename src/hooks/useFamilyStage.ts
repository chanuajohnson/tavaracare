import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  READINESS_LOCAL_STORAGE_KEY,
  READINESS_RESPONSES_LOCAL_KEY,
  READINESS_PROGRESS_LOCAL_KEY,
  type ReadinessStage,
} from "@/data/familyReadinessQuiz";

interface UseFamilyStageResult {
  /** Resolved stage. Defaults to 1 if unknown. `null` while loading & unknown. */
  stage: ReadinessStage;
  /** True only when we have an explicit value (DB or localStorage). */
  hasStage: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  /**
   * Wipes the saved readiness state so the dashboard reverts to the
   * `ReadinessQuizBanner`. For signed-in users, also nullifies the related
   * `profiles` columns. Returns true on success.
   */
  clearStage: () => Promise<boolean>;
}

const readLocalStage = (): ReadinessStage | null => {
  try {
    const raw = localStorage.getItem(READINESS_LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    if (parsed >= 1 && parsed <= 4) return parsed as ReadinessStage;
    return null;
  } catch {
    return null;
  }
};

const wipeLocalReadinessKeys = () => {
  try {
    localStorage.removeItem(READINESS_LOCAL_STORAGE_KEY);
    localStorage.removeItem(READINESS_RESPONSES_LOCAL_KEY);
    localStorage.removeItem(READINESS_PROGRESS_LOCAL_KEY);
  } catch {
    // ignore
  }
};

/**
 * Returns the current family's readiness stage (1–4).
 *
 * Resolution order:
 *  1. Signed-in family → `profiles.client_stage`
 *  2. Anyone (incl. anonymous) → `localStorage.tavara_readiness_stage`
 *  3. Default → stage 1 (gentlest experience)
 *
 * `hasStage` lets callers distinguish "actually set" from "just defaulted",
 * so the dashboard can offer the quiz CTA when nothing has been chosen.
 */
export const useFamilyStage = (): UseFamilyStageResult => {
  const { user } = useAuth();
  const [stage, setStage] = useState<ReadinessStage>(1);
  const [hasStage, setHasStage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);

    // 1) Try DB if signed in
    if (user?.id) {
      const { data, error } = await supabase
        .from("profiles")
        .select("client_stage")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data?.client_stage) {
        const dbStage = data.client_stage as ReadinessStage;
        setStage(dbStage);
        setHasStage(true);
        setIsLoading(false);
        return;
      }
    }

    // 2) Fall back to localStorage
    const local = readLocalStage();
    if (local) {
      setStage(local);
      setHasStage(true);
      setIsLoading(false);
      return;
    }

    // 3) Default
    setStage(1);
    setHasStage(false);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const clearStage = useCallback(async (): Promise<boolean> => {
    // Always wipe local state first so abandonment of the DB call still
    // gives an immediate fresh-start experience.
    wipeLocalReadinessKeys();

    if (user?.id) {
      const { error } = await supabase
        .from("profiles")
        .update({
          client_stage: null,
          client_stage_assessed_at: null,
          client_stage_quiz_responses: null,
        })
        .eq("id", user.id);

      if (error) {
        console.error("[useFamilyStage] failed to clear stage:", error);
        // Refresh from source of truth so UI reflects actual DB state
        await load();
        return false;
      }
    }

    setStage(1);
    setHasStage(false);
    setIsLoading(false);
    return true;
  }, [user?.id, load]);

  return { stage, hasStage, isLoading, refresh: load, clearStage };
};
