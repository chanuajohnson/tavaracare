import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { PaymentMilestoneTicker } from '@/components/admin/care-plans/PaymentMilestoneTicker';

/**
 * Read-only payment records strip for the family dashboard.
 * Sits directly under <LimitedAccessBanner /> as a milestone history.
 *
 * Also surfaces the Plan Start / Plan End dates pulled from the
 * onboarding_checklists row (post_onboarding_3_date / post_onboarding_4_date)
 * so families see all key billing-period milestones at a glance.
 */
export const PaymentRecordsBanner: React.FC = () => {
  const { user } = useAuth();
  const [carePlanId, setCarePlanId] = useState<string | null>(null);
  const [milestoneDates, setMilestoneDates] = useState<{ startDate?: string | null; endDate?: string | null }>({});
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;

      const [planRes, checklistRes] = await Promise.all([
        supabase
          .from('care_plans')
          .select('id, status')
          .eq('family_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('onboarding_checklists')
          .select('checked_items')
          .eq('family_id', user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      setCarePlanId(planRes.data?.[0]?.id || null);

      const items = (checklistRes.data?.checked_items as Record<string, unknown> | null) || {};
      setMilestoneDates({
        startDate: (items['post_onboarding_3_date'] as string) || null,
        endDate: (items['post_onboarding_4_date'] as string) || null,
      });

      setResolved(true);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!user?.id || !resolved) return null;
  return (
    <PaymentMilestoneTicker
      familyUserId={user.id}
      carePlanId={carePlanId}
      mode="family"
      title="Your payment records"
      milestoneDates={milestoneDates}
    />
  );
};

export default PaymentRecordsBanner;
