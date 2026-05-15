import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { PaymentMilestoneTicker } from '@/components/admin/care-plans/PaymentMilestoneTicker';

type PlanRow = { id: string; title: string | null; status: string | null };

/**
 * Read-only payment records strip for the family dashboard.
 *
 * A family can have more than one care plan, so we render one ticker per
 * care plan, each clearly labeled with the plan title. Plan-period milestone
 * dates from `onboarding_checklists` are family-wide (not plan-specific yet)
 * and are shown on every ticker as today.
 */
export const PaymentRecordsBanner: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [milestoneDates, setMilestoneDates] = useState<{ startDate?: string | null; endDate?: string | null }>({});
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;

      const [planRes, checklistRes] = await Promise.all([
        supabase
          .from('care_plans')
          .select('id, title, status')
          .eq('family_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('onboarding_checklists')
          .select('checked_items')
          .eq('family_id', user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      setPlans((planRes.data as PlanRow[] | null) || []);

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

  // No care plans — preserve previous behavior with a single fallback ticker.
  if (plans.length === 0) {
    return (
      <PaymentMilestoneTicker
        familyUserId={user.id}
        carePlanId={null}
        mode="family"
        title="Your payment records"
        milestoneDates={milestoneDates}
      />
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <PaymentMilestoneTicker
          key={plan.id}
          familyUserId={user.id}
          carePlanId={plan.id}
          mode="family"
          title={`Your payment records — ${plan.title || 'Untitled care plan'}`}
          milestoneDates={milestoneDates}
        />
      ))}
    </div>
  );
};

export default PaymentRecordsBanner;
