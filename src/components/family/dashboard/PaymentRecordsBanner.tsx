import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { PaymentMilestoneTicker } from '@/components/admin/care-plans/PaymentMilestoneTicker';

/**
 * Read-only payment records strip for the family dashboard.
 * Sits directly under <LimitedAccessBanner /> as a milestone history.
 */
export const PaymentRecordsBanner: React.FC = () => {
  const { user } = useAuth();
  const [carePlanId, setCarePlanId] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('care_plans')
        .select('id, status')
        .eq('family_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (cancelled) return;
      setCarePlanId(data?.[0]?.id || null);
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
    />
  );
};

export default PaymentRecordsBanner;
