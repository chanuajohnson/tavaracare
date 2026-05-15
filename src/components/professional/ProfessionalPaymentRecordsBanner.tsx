import React, { useEffect, useMemo, useState } from "react";
import { useUnifiedMatches } from "@/hooks/useUnifiedMatches";
import { supabase } from "@/lib/supabase";
import { PaymentMilestoneTicker } from "@/components/admin/care-plans/PaymentMilestoneTicker";

type MilestoneDates = { startDate?: string | null; endDate?: string | null };

/**
 * Read-only payment records + plan-date milestones for every care plan the
 * caregiver is actively assigned to. A caregiver can be on multiple care plans
 * (across one or more families), so we render one ticker per assignment,
 * labeled with the family name and care plan title.
 *
 * Renders nothing if the caregiver has no care_team assignments with a plan.
 */
export const ProfessionalPaymentRecordsBanner: React.FC = () => {
  const { assignments, isLoading } = useUnifiedMatches("professional");
  const [milestonesByFamily, setMilestonesByFamily] = useState<Map<string, MilestoneDates>>(new Map());
  const [resolved, setResolved] = useState(false);

  const planAssignments = useMemo(() => {
    if (!assignments?.length) return [] as any[];
    return assignments.filter(
      (a: any) => a?.assignment_type === "care_team" && a?.care_plan_id && a?.family_user_id
    );
  }, [assignments]);

  const familyIds = useMemo(() => {
    const ids = new Set<string>();
    planAssignments.forEach((a: any) => ids.add(a.family_user_id));
    return Array.from(ids);
  }, [planAssignments]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (familyIds.length === 0) {
        setMilestonesByFamily(new Map());
        setResolved(true);
        return;
      }
      const { data } = await supabase
        .from("onboarding_checklists")
        .select("family_id, checked_items")
        .in("family_id", familyIds);
      if (cancelled) return;
      const map = new Map<string, MilestoneDates>();
      (data || []).forEach((row: any) => {
        const items = (row.checked_items as Record<string, unknown> | null) || {};
        map.set(row.family_id, {
          startDate: (items["post_onboarding_3_date"] as string) || null,
          endDate: (items["post_onboarding_4_date"] as string) || null,
        });
      });
      setMilestonesByFamily(map);
      setResolved(true);
    })();
    return () => { cancelled = true; };
  }, [familyIds.join("|")]);

  if (isLoading || !resolved) return null;
  if (planAssignments.length === 0) return null;

  return (
    <div className="space-y-3">
      {planAssignments.map((a: any) => {
        const familyName: string | undefined = a.family_name;
        const planTitle: string | undefined = a.care_plan_title;
        const label =
          (familyName ? `Family payment records — ${familyName}` : "Family payment records") +
          (planTitle ? ` · ${planTitle}` : "");
        return (
          <PaymentMilestoneTicker
            key={`${a.family_user_id}:${a.care_plan_id}`}
            familyUserId={a.family_user_id}
            carePlanId={a.care_plan_id}
            mode="family"
            title={label}
            milestoneDates={milestonesByFamily.get(a.family_user_id) || {}}
          />
        );
      })}
    </div>
  );
};

export default ProfessionalPaymentRecordsBanner;
