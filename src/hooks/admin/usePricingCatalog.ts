import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PricingCategory =
  | 'setup'
  | 'subscription'
  | 'add_on'
  | 'rate_tier'
  | 'escalation'
  | 'environment'
  | 'secondary_support';

export type PricingUnit =
  | 'one_time'
  | 'per_week'
  | 'per_month'
  | 'per_hour'
  | 'custom_quote';

export interface PricingItem {
  id: string;
  code: string;
  category: PricingCategory;
  display_name: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  unit: PricingUnit;
  is_active: boolean;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_LABELS: Record<PricingCategory, string> = {
  setup: 'Care Assessment & Onboarding',
  subscription: 'Subscription Plans',
  add_on: 'Weekly Add-Ons',
  rate_tier: 'Caregiver Rate Tiers',
  escalation: 'Escalation & Change Fees',
  environment: 'Care Environment Support',
  secondary_support: 'Secondary Support',
};

export const UNIT_LABELS: Record<PricingUnit, string> = {
  one_time: 'one-time',
  per_week: '/week',
  per_month: '/month',
  per_hour: '/hour',
  custom_quote: 'custom quote',
};

export function formatPrice(item: Pick<PricingItem, 'price_min' | 'price_max' | 'unit'>): string {
  if (item.unit === 'custom_quote' || (item.price_min == null && item.price_max == null)) {
    return 'Custom Quote';
  }
  const min = item.price_min != null ? `$${Number(item.price_min).toLocaleString()}` : '';
  const max = item.price_max != null && item.price_max !== item.price_min
    ? ` – $${Number(item.price_max).toLocaleString()}`
    : '';
  return `${min}${max}${item.unit !== 'one_time' ? ' ' + UNIT_LABELS[item.unit] : ''}`;
}

export function usePricingCatalog(includeInactive = false) {
  return useQuery({
    queryKey: ['pricing-catalog', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('pricing_catalog')
        .select('*')
        .order('category')
        .order('sort_order');
      if (!includeInactive) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PricingItem[];
    },
    staleTime: 60_000,
  });
}

export function usePricingByCode(code: string) {
  const { data } = usePricingCatalog(true);
  return data?.find((p) => p.code === code);
}

export function useUpdatePricingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PricingItem> }) => {
      const { error } = await supabase
        .from('pricing_catalog')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing-catalog'] });
      toast.success('Pricing updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update pricing'),
  });
}
