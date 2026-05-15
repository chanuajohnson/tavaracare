import React, { useEffect, useState } from "react";
import { useUnifiedMatches } from "@/hooks/useUnifiedMatches";
import { supabase } from "@/lib/supabase";
import { PaymentMilestoneTicker } from "@/components/admin/care-plans/PaymentMilestoneTicker";

/**
 * Read-only payment records + plan-date milestones for the assigned family,
 * shown at the top of the professional dashboard (just under status banners).
 *
 * Pulls Plan Start / Plan End from the family's onboarding_checklists row
 * (post_onboarding_3_date / post_onboarding_4_date) so caregivers see all key
 * billing-period milestones at a glance.
 */
export const ProfessionalPaymentRecordsCard: React.FC = () => {
  const { assignments, isLoading } = useUnifiedMatches("professional");
  const [milestoneDates, setMilestoneDates] = useState<{ startDate?: string | null; endDate?: string | null }>({});
  const [resolved, setResolved] = useState(false);

  // Pick the most relevant active assignment (care_team takes priority, then most recent).
  const active = React.useMemo(() => {
    if (!assignments?.length) return null;
    const careTeam = assignments.find((a: any) => a.assignment_type === "care_team");
    return careTeam || assignments[0];
  }, [assignments]);

  const familyUserId: string | undefined = active?.family_user_id;
  const carePlanId: string | undefined = active?.care_plan_id;
  const familyName: string | undefined = active?.family_name;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!familyUserId) {
        setResolved(true);
        return;
      }
      const { data } = await supabase
        .from("onboarding_checklists")
        .select("checked_items")
        .eq("family_id", familyUserId)
        .maybeSingle();
      if (cancelled) return;
      const items = (data?.checked_items as Record<string, unknown> | null) || {};
      setMilestoneDates({
        startDate: (items["post_onboarding_3_date"] as string) || null,
        endDate: (items["post_onboarding_4_date"] as string) || null,
      });
      setResolved(true);
    })();
    return () => { cancelled = true; };
  }, [familyUserId]);

  if (isLoading || !resolved) return null;
  if (!familyUserId) return null;

  return (
    <PaymentMilestoneTicker
      familyUserId={familyUserId}
      carePlanId={carePlanId || null}
      mode="family"
      title={familyName ? `Family payment records — ${familyName}` : "Family payment records"}
      milestoneDates={milestoneDates}
    />
  );
};

export default ProfessionalPaymentRecordsCard;
