
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceItem {
  id: string;
  category: string;
  label: string;
  description: string;
  billing_type: string;
  unit_price: number;
  default_quantity: number;
}

interface ServiceSelection {
  id?: string;
  service_item_id: string;
  selected: boolean;
  approved_by_family: boolean;
  quantity: number;
  override_price: number | null;
  notes: string | null;
}

interface ServiceSelectionBlockProps {
  carePlanId: string;
  filterCategory?: string;
  readOnly?: boolean;
  compact?: boolean;
}

function billingLabel(type: string): string {
  switch (type) {
    case 'one_time': return 'One-time';
    case 'weekly': return '/week';
    case 'monthly': return '/month';
    case 'hourly': return '/hour';
    default: return type;
  }
}

function billingBadgeColor(type: string): string {
  switch (type) {
    case 'one_time': return 'bg-blue-100 text-blue-800';
    case 'weekly': return 'bg-green-100 text-green-800';
    case 'monthly': return 'bg-purple-100 text-purple-800';
    case 'hourly': return 'bg-amber-100 text-amber-800';
    default: return '';
  }
}

export default function ServiceSelectionBlock({
  carePlanId,
  filterCategory,
  readOnly = false,
  compact = false,
}: ServiceSelectionBlockProps) {
  const [catalog, setCatalog] = useState<ServiceItem[]>([]);
  const [selections, setSelections] = useState<Record<string, ServiceSelection>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [carePlanId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch catalog
      let catalogQuery = supabase
        .from('billable_service_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (filterCategory) {
        catalogQuery = catalogQuery.eq('category', filterCategory);
      }

      const [catalogRes, selectionsRes] = await Promise.all([
        catalogQuery,
        supabase
          .from('care_plan_service_selections')
          .select('*')
          .eq('care_plan_id', carePlanId),
      ]);

      if (catalogRes.data) {
        setCatalog(catalogRes.data as ServiceItem[]);
      }

      if (selectionsRes.data) {
        const map: Record<string, ServiceSelection> = {};
        (selectionsRes.data as any[]).forEach((s) => {
          map[s.service_item_id] = {
            id: s.id,
            service_item_id: s.service_item_id,
            selected: s.selected,
            approved_by_family: s.approved_by_family,
            quantity: s.quantity,
            override_price: s.override_price,
            notes: s.notes,
          };
        });
        setSelections(map);
      }
    } catch (err) {
      console.error('Error loading service items:', err);
    } finally {
      setLoading(false);
    }
  };

  const upsertSelection = useCallback(async (serviceItemId: string, updates: Partial<ServiceSelection>) => {
    const existing = selections[serviceItemId];

    const payload = {
      care_plan_id: carePlanId,
      service_item_id: serviceItemId,
      selected: updates.selected ?? existing?.selected ?? false,
      approved_by_family: updates.approved_by_family ?? existing?.approved_by_family ?? false,
      quantity: updates.quantity ?? existing?.quantity ?? 1,
      override_price: updates.override_price !== undefined ? updates.override_price : (existing?.override_price ?? null),
      notes: updates.notes !== undefined ? updates.notes : (existing?.notes ?? null),
    };

    try {
      const { data, error } = await supabase
        .from('care_plan_service_selections')
        .upsert(payload, { onConflict: 'care_plan_id,service_item_id' })
        .select()
        .single();

      if (error) throw error;

      setSelections(prev => ({
        ...prev,
        [serviceItemId]: {
          id: data.id,
          service_item_id: data.service_item_id,
          selected: data.selected,
          approved_by_family: data.approved_by_family,
          quantity: data.quantity,
          override_price: data.override_price,
          notes: data.notes,
        },
      }));
    } catch (err) {
      console.error('Error saving service selection:', err);
      toast.error('Failed to save service selection');
    }
  }, [carePlanId, selections]);

  if (loading) {
    return <div className="text-sm text-muted-foreground py-2">Loading service items...</div>;
  }

  if (!catalog.length) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Approved Service Components
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {catalog.map(item => {
          const sel = selections[item.id];
          const isSelected = sel?.selected ?? false;
          const isApproved = sel?.approved_by_family ?? false;
          const effectivePrice = sel?.override_price ?? item.unit_price;

          return (
            <div
              key={item.id}
              className={`rounded-lg border p-3 transition-colors ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
            >
              <div className="flex items-start gap-3">
                {!readOnly && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      upsertSelection(item.id, { selected: !!checked })
                    }
                    className="mt-0.5"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge variant="outline" className={`text-[10px] ${billingBadgeColor(item.billing_type)}`}>
                      ${effectivePrice.toFixed(2)} {billingLabel(item.billing_type)}
                    </Badge>
                    {isApproved && (
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" />
                        Approved
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>

                  {isSelected && !compact && !readOnly && (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id={`approve-${item.id}`}
                          checked={isApproved}
                          onCheckedChange={(checked) =>
                            upsertSelection(item.id, { approved_by_family: !!checked })
                          }
                        />
                        <Label htmlFor={`approve-${item.id}`} className="text-xs cursor-pointer">
                          Family approved
                        </Label>
                      </div>
                      {item.billing_type === 'hourly' && (
                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs text-muted-foreground">Qty:</Label>
                          <Input
                            type="number"
                            min={1}
                            value={sel?.quantity ?? 1}
                            onChange={(e) =>
                              upsertSelection(item.id, { quantity: parseInt(e.target.value) || 1 })
                            }
                            className="h-7 w-16 text-xs"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-muted-foreground">Override $:</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={item.unit_price.toFixed(2)}
                          value={sel?.override_price ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : null;
                            upsertSelection(item.id, { override_price: val });
                          }}
                          className="h-7 w-24 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {isSelected && !compact && !readOnly && (
                    <Textarea
                      placeholder="Notes (optional)"
                      value={sel?.notes ?? ''}
                      onChange={(e) => upsertSelection(item.id, { notes: e.target.value || null })}
                      className="mt-2 text-xs h-16"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
