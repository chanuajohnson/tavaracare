import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlanFeature = {
  name: string;
  included: boolean;
  is_addon?: boolean;
};

export type SubscriptionPlan = {
  id: string;
  slug: string | null;
  audience: "family" | "professional";
  name: string;
  description: string | null;
  price_weekly: number | null;
  price_monthly: number | null;
  period_weekly: string;
  period_monthly: string;
  button_text: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  features: PlanFeature[];
};

const normalizeFeatures = (raw: unknown): PlanFeature[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => {
      if (typeof f === "string") {
        return { name: f, included: true, is_addon: false };
      }
      if (f && typeof f === "object") {
        const obj = f as Record<string, unknown>;
        const name = typeof obj.name === "string" ? obj.name : "";
        if (!name) return null;
        return {
          name,
          included: obj.included !== false,
          is_addon: !!obj.is_addon || name.startsWith("Add-on:"),
        };
      }
      return null;
    })
    .filter((f) => f !== null) as PlanFeature[];
};

export function formatPlanPrice(value: number | null): string {
  if (value === null || value === undefined) return "Free";
  if (Number.isInteger(value)) {
    return `$${value.toLocaleString("en-US")}`;
  }
  return `$${value.toFixed(2)}`;
}

export function useSubscriptionPlans(includeInactive = false) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("subscription_plans")
        .select("*")
        .order("audience", { ascending: true })
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      const mapped: SubscriptionPlan[] = (data || []).map((row: any) => ({
        id: row.id,
        slug: row.slug,
        audience: (row.audience === "professional" ? "professional" : "family") as
          | "family"
          | "professional",
        name: row.name,
        description: row.description,
        price_weekly: row.price_weekly !== null ? Number(row.price_weekly) : null,
        price_monthly:
          row.price_monthly !== null ? Number(row.price_monthly) : null,
        period_weekly: row.period_weekly ?? "",
        period_monthly: row.period_monthly ?? "",
        button_text: row.button_text ?? "Choose Plan",
        is_popular: !!row.is_popular,
        is_active: row.is_active !== false,
        sort_order: row.sort_order ?? 0,
        features: normalizeFeatures(row.features),
      }));

      setPlans(mapped);
    } catch (err: any) {
      console.error("[useSubscriptionPlans] fetch error:", err);
      setError(err.message || "Failed to load plans");
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const familyPlans = plans.filter((p) => p.audience === "family");
  const professionalPlans = plans.filter((p) => p.audience === "professional");

  return {
    plans,
    familyPlans,
    professionalPlans,
    isLoading,
    error,
    refetch: fetchPlans,
  };
}
