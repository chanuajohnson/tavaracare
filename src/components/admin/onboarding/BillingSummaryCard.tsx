
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle2 } from 'lucide-react';

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
    case 'weekly': return 'Weekly';
    case 'monthly': return 'Monthly';
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

  const oneTime = items.filter(i => i.billing_type === 'one_time');
  const weekly = items.filter(i => i.billing_type === 'weekly');
  const monthly = items.filter(i => i.billing_type === 'monthly');
  const hourly = items.filter(i => i.billing_type === 'hourly');

  const weeklyTotal = weekly.reduce((sum, i) => sum + ((i.override_price ?? i.unit_price) * i.quantity), 0);
  const monthlyTotal = monthly.reduce((sum, i) => sum + ((i.override_price ?? i.unit_price) * i.quantity), 0);
  const oneTimeTotal = oneTime.reduce((sum, i) => sum + ((i.override_price ?? i.unit_price) * i.quantity), 0);

  const approvedCount = items.filter(i => i.approved_by_family).length;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Billing & Care Structure Summary
          {approvedCount > 0 && (
            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
              {approvedCount}/{items.length} family approved
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recurring Weekly */}
        {weekly.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Recurring Weekly Services
            </h5>
            {weekly.map((item, i) => (
              <ServiceRow key={i} item={item} />
            ))}
            <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
              <span>Weekly Total</span>
              <span>${weeklyTotal.toFixed(2)}/wk</span>
            </div>
          </div>
        )}

        {/* Recurring Monthly */}
        {monthly.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Recurring Monthly Services
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

        {/* One-time */}
        {oneTime.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              One-Time Setup Fees
            </h5>
            {oneTime.map((item, i) => (
              <ServiceRow key={i} item={item} />
            ))}
            <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
              <span>Setup Total</span>
              <span>${oneTimeTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Hourly */}
        {hourly.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Hourly Services (as needed)
            </h5>
            {hourly.map((item, i) => (
              <ServiceRow key={i} item={item} />
            ))}
          </div>
        )}

        <Separator />

        <div className="text-xs text-muted-foreground italic">
          This is an organized service summary — not a final invoice. Changes to care scope or services will always be discussed before taking effect.
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceRow({ item }: { item: ServiceItemWithSelection }) {
  const effectivePrice = item.override_price ?? item.unit_price;
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm">{item.label}</span>
        {item.approved_by_family && (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        )}
      </div>
      <div className="text-sm font-medium">
        ${effectivePrice.toFixed(2)}
        {item.quantity > 1 && ` × ${item.quantity}`}
        <span className="text-xs text-muted-foreground ml-1">
          {billingLabel(item.billing_type)}
        </span>
      </div>
    </div>
  );
}
