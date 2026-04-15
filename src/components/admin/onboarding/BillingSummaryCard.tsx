
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle2, DollarSign } from 'lucide-react';

interface ServiceItemWithSelection {
  label: string;
  description: string;
  billing_type: string;
  unit_price: number;
  override_price: number | null;
  quantity: number;
  approved_by_family: boolean;
  category: string;
}

interface BillingSummaryCardProps {
  carePlanId: string;
}

function billingLabel(type: string): string {
  switch (type) {
    case 'one_time': return 'One-time';
    case 'weekly': return 'Per week';
    case 'monthly': return 'Per month';
    case 'hourly': return 'Per hour';
    default: return type;
  }
}

export default function BillingSummaryCard({ carePlanId }: BillingSummaryCardProps) {
  const [items, setItems] = useState<ServiceItemWithSelection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedServices();
  }, [carePlanId]);

  const fetchApprovedServices = async () => {
    setLoading(true);
    try {
      const { data: selections } = await supabase
        .from('care_plan_service_selections')
        .select('*, billable_service_items(*)')
        .eq('care_plan_id', carePlanId)
        .eq('selected', true);

      if (selections) {
        const mapped: ServiceItemWithSelection[] = (selections as any[]).map(s => ({
          label: s.billable_service_items?.label || 'Unknown',
          description: s.billable_service_items?.description || '',
          billing_type: s.billable_service_items?.billing_type || 'one_time',
          unit_price: s.billable_service_items?.unit_price || 0,
          override_price: s.override_price,
          quantity: s.quantity || 1,
          approved_by_family: s.approved_by_family,
          category: s.billable_service_items?.category || '',
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error('Error fetching billing summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!items.length) return null;

  // Group items by billing logic
  const corePlan = items.filter(i => i.category === 'core_plan');
  const hourly = items.filter(i => i.billing_type === 'hourly');
  const weeklyAddons = items.filter(i =>
    i.billing_type === 'weekly' && !corePlan.includes(i)
  );
  const oneTime = items.filter(i => i.billing_type === 'one_time');
  const monthly = items.filter(i => i.billing_type === 'monthly');

  const getPrice = (i: ServiceItemWithSelection) => (i.override_price ?? i.unit_price) * i.quantity;

  const corePlanTotal = corePlan.reduce((sum, i) => sum + getPrice(i), 0);
  const weeklyAddonsTotal = weeklyAddons.reduce((sum, i) => sum + getPrice(i), 0);
  const oneTimeTotal = oneTime.reduce((sum, i) => sum + getPrice(i), 0);
  const monthlyTotal = monthly.reduce((sum, i) => sum + getPrice(i), 0);
  const hourlyItems = hourly; // display only, no weekly total

  const projectedWeeklyTotal = corePlanTotal + weeklyAddonsTotal;
  const projectedMonthlyRecurring = Math.round((projectedWeeklyTotal * 4.33 + monthlyTotal) * 100) / 100;

  const approvedCount = items.filter(i => i.approved_by_family).length;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Care Plan Commercial Summary
          {approvedCount > 0 && (
            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
              {approvedCount}/{items.length} family approved
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core Plan */}
        {corePlan.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Core Plan
            </h5>
            {corePlan.map((item, i) => (
              <ServiceRow key={i} item={item} />
            ))}
          </div>
        )}

        {/* Hourly Care Services */}
        {hourlyItems.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Care Services (Hourly)
            </h5>
            {hourlyItems.map((item, i) => (
              <ServiceRow key={i} item={item} />
            ))}
          </div>
        )}

        {/* Weekly Add-Ons */}
        {weeklyAddons.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Weekly Add-Ons
            </h5>
            {weeklyAddons.map((item, i) => (
              <ServiceRow key={i} item={item} />
            ))}
            <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
              <span>Weekly Add-Ons Total</span>
              <span>${weeklyAddonsTotal.toFixed(2)}/wk</span>
            </div>
          </div>
        )}

        {/* Monthly Recurring */}
        {monthly.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Monthly Recurring
            </h5>
            {monthly.map((item, i) => (
              <ServiceRow key={i} item={item} />
            ))}
            <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
              <span>Monthly Total</span>
              <span>${monthlyTotal.toFixed(2)}/mo</span>
            </div>
          </div>
        )}

        {/* One-Time Fees */}
        {oneTime.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              One-Time Fees
            </h5>
            {oneTime.map((item, i) => (
              <ServiceRow key={i} item={item} />
            ))}
            <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
              <span>One-Time Total</span>
              <span>${oneTimeTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Separator />

        {/* Projected Totals */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <p className="font-semibold text-sm mb-2">Projected Totals</p>
          <div className="flex justify-between text-sm">
            <span>Projected Weekly Total</span>
            <span className="font-bold">${projectedWeeklyTotal.toFixed(2)}/wk</span>
          </div>
          {oneTimeTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span>Projected One-Time Total</span>
              <span className="font-bold">${oneTimeTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Projected Monthly Recurring</span>
            <span className="font-bold text-primary">${projectedMonthlyRecurring.toFixed(2)}/mo</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground italic">
          This is a care plan commercial summary — not a final invoice. Changes to care scope or services will always be discussed before taking effect.
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceRow({ item }: { item: ServiceItemWithSelection }) {
  const effectivePrice = item.override_price ?? item.unit_price;
  const hasDiscount = item.override_price !== null && item.override_price !== undefined && item.override_price !== item.unit_price;
  const isWaived = hasDiscount && item.override_price === 0;

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm">{item.label}</span>
        {item.approved_by_family && (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        )}
        {isWaived && (
          <Badge className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0">Waived</Badge>
        )}
        {hasDiscount && !isWaived && (
          <Badge className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0">Discounted</Badge>
        )}
      </div>
      <div className="text-sm font-medium">
        {hasDiscount && (
          <span className="line-through text-muted-foreground mr-1.5">
            ${item.unit_price.toFixed(2)}
          </span>
        )}
        ${effectivePrice.toFixed(2)}
        {item.quantity > 1 && ` × ${item.quantity}`}
        <span className="text-xs text-muted-foreground ml-1">
          {billingLabel(item.billing_type)}
        </span>
      </div>
    </div>
  );
}
