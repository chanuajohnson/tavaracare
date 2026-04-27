import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CareSupplyItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  unit_label: string;
  unit_price_ttd: number;
  is_active: boolean;
  sort_order: number;
}

export interface CareSupplyBundleItem {
  item_id: string;
  default_quantity: number;
}

export interface CareSupplyBundle {
  id: string;
  name: string;
  description: string | null;
  category: string;
  emoji: string | null;
  sort_order: number;
  items: CareSupplyBundleItem[];
}

export const useCareSupplyCatalog = () => {
  const [items, setItems] = useState<CareSupplyItem[]>([]);
  const [bundles, setBundles] = useState<CareSupplyBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [itemsRes, bundlesRes, bundleItemsRes] = await Promise.all([
          supabase
            .from('care_supply_items')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('care_supply_bundles')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase.from('care_supply_bundle_items').select('*'),
        ]);

        if (itemsRes.error) throw itemsRes.error;
        if (bundlesRes.error) throw bundlesRes.error;
        if (bundleItemsRes.error) throw bundleItemsRes.error;

        if (!mounted) return;

        const bundleItemsByBundle = new Map<string, CareSupplyBundleItem[]>();
        (bundleItemsRes.data || []).forEach((bi: any) => {
          const arr = bundleItemsByBundle.get(bi.bundle_id) || [];
          arr.push({ item_id: bi.item_id, default_quantity: bi.default_quantity });
          bundleItemsByBundle.set(bi.bundle_id, arr);
        });

        const bundlesWithItems: CareSupplyBundle[] = (bundlesRes.data || []).map((b: any) => ({
          ...b,
          items: bundleItemsByBundle.get(b.id) || [],
        }));

        setItems((itemsRes.data || []) as CareSupplyItem[]);
        setBundles(bundlesWithItems);
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load catalog');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { items, bundles, loading, error };
};
