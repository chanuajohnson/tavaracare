
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, CheckCircle2, User, Calendar, FileText, DollarSign } from 'lucide-react';

interface ApprovedService {
  label: string;
  billing_type: string;
  effective_price: number;
  quantity: number;
  approved_by_family: boolean;
}

interface ServiceCommencementConfirmationProps {
  carePlanId: string;
  careRecipientName?: string;
  familyName?: string;
  scheduleSummary?: string;
  startDate?: string;
  billingCadence?: string;
}

function billingLabel(type: string): string {
  switch (type) {
    case 'one_time': return 'one-time';
    case 'weekly': return 'weekly';
    case 'monthly': return 'monthly';
    case 'hourly': return 'per hour';
    default: return type;
  }
}

export default function ServiceCommencementConfirmation({
  carePlanId,
  careRecipientName,
  familyName,
  scheduleSummary,
  startDate,
  billingCadence = 'Weekly (every Friday)',
}: ServiceCommencementConfirmationProps) {
  const [services, setServices] = useState<ApprovedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [carePlanId]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('care_plan_service_selections')
        .select('*, billable_service_items(*)')
        .eq('care_plan_id', carePlanId)
        .eq('selected', true);

      if (data) {
        setServices((data as any[]).map(s => ({
          label: s.billable_service_items?.label || 'Unknown',
          billing_type: s.billable_service_items?.billing_type || 'one_time',
          effective_price: s.override_price ?? s.billable_service_items?.unit_price ?? 0,
          quantity: s.quantity || 1,
          approved_by_family: s.approved_by_family,
        })));
      }
    } catch (err) {
      console.error('Error fetching services for confirmation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const allApproved = services.length > 0 && services.every(s => s.approved_by_family);

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-900">
          <Shield className="h-4 w-4" />
          Service Commencement Confirmation
          {allApproved && (
            <Badge className="bg-green-100 text-green-800 text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-0.5" />
              All services approved
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {careRecipientName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Care Recipient:</span>
              <span className="font-medium">{careRecipientName}</span>
            </div>
          )}
          {familyName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Family:</span>
              <span className="font-medium">{familyName}</span>
            </div>
          )}
          {scheduleSummary && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Schedule:</span>
              <span className="font-medium">{scheduleSummary}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{startDate}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Billing:</span>
            <span className="font-medium">{billingCadence}</span>
          </div>
        </div>

        {/* Approved Services */}
        {services.length > 0 && (
          <>
            <Separator />
            <div>
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Approved Services
              </h5>
              <div className="space-y-1.5">
                {services.map((svc, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {svc.approved_by_family ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-400" />
                      )}
                      <span>{svc.label}</span>
                    </div>
                    <span className="font-medium">
                      ${svc.effective_price.toFixed(2)} {billingLabel(svc.billing_type)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        <p className="text-xs text-amber-800">
          By confirming service commencement, the family acknowledges all approved services, rates, and billing terms above. 
          Any changes to care scope or services will be discussed and approved before taking effect.
        </p>
      </CardContent>
    </Card>
  );
}
