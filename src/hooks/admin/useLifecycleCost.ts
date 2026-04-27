import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_PRICING, type PricingCatalog } from '@/utils/lifecycleScenarios';

/**
 * Pull live pricing from billable_service_items + subscription_plans.
 * Falls back to DEFAULT_PRICING if a row is missing — never throws.
 */
export function useLifecycleCost() {
  const [pricing, setPricing] = useState<PricingCatalog>(DEFAULT_PRICING);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const [itemsRes, plansRes] = await Promise.all([
          supabase
            .from('billable_service_items')
            .select('label, billing_type, unit_price, category')
            .eq('is_active', true),
          supabase
            .from('subscription_plans')
            .select('slug, audience, price_weekly')
            .eq('is_active', true)
            .eq('audience', 'family'),
        ]);

        if (itemsRes.error) throw itemsRes.error;
        if (plansRes.error) throw plansRes.error;

        const next: PricingCatalog = { ...DEFAULT_PRICING };
        const items = itemsRes.data || [];
        const findPrice = (re: RegExp) => {
          const it = items.find((r: any) => re.test(r.label));
          return it ? Number(it.unit_price) : undefined;
        };

        next.setup_assessment = findPrice(/care assessment & setup/i) ?? next.setup_assessment;
        next.setup_matching = findPrice(/caregiver matching/i) ?? next.setup_matching;
        next.setup_readiness = findPrice(/care readiness/i) ?? next.setup_readiness;
        next.setup_nis = findPrice(/nis employer/i) ?? next.setup_nis;
        next.addon_medication = findPrice(/medication management/i) ?? next.addon_medication;
        next.addon_sop_monitoring = findPrice(/daily care sop \+ monitoring/i) ?? next.addon_sop_monitoring;
        next.addon_meal = findPrice(/meal support upgrade/i) ?? next.addon_meal;
        next.addon_secondary_light = findPrice(/light secondary/i) ?? next.addon_secondary_light;
        next.addon_secondary_standard = findPrice(/standard secondary/i) ?? next.addon_secondary_standard;
        next.addon_secondary_high = findPrice(/high-need secondary/i) ?? next.addon_secondary_high;
        next.addon_secondary_podiatric = findPrice(/podiatric/i) ?? next.addon_secondary_podiatric;
        next.onetime_sop_activation = findPrice(/sop.*one-time activation/i) ?? next.onetime_sop_activation;
        next.onetime_home_reset = findPrice(/guided home reset/i) ?? next.onetime_home_reset;
        next.fee_plan_adjust = findPrice(/care plan adjustment/i) ?? next.fee_plan_adjust;
        next.fee_basic_escalation = findPrice(/basic escalation/i) ?? next.fee_basic_escalation;
        next.fee_urgent_escalation = findPrice(/urgent escalation/i) ?? next.fee_urgent_escalation;

        const plans = plansRes.data || [];
        const active = plans.find((p: any) => p.slug === 'care');
        const premium = plans.find((p: any) => p.slug === 'premium');
        if (active?.price_weekly != null) next.sub_active = Number(active.price_weekly);
        if (premium?.price_weekly != null) next.sub_premium = Number(premium.price_weekly);

        if (!cancelled) setPricing(next);
      } catch (err: any) {
        console.error('[useLifecycleCost] fetch error:', err);
        if (!cancelled) setError(err.message || 'Failed to load pricing');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { pricing, isLoading, error };
}
