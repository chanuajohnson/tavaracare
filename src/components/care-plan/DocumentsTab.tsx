
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, FileText, Receipt, FileCheck, Loader2 } from "lucide-react";
import { format, addDays, addMonths, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  generateQuotePDF,
  generateInvoicePDF,
  generateReceiptPDF,
  buildDefaultCareBillingData,
  type CareBillingData,
} from "@/services/care-plans/invoiceService";
import { toast } from "sonner";

interface DocumentsTabProps {
  carePlanId: string;
  carePlanTitle: string;
  familyId: string;
  familyName: string;
  familyEmail?: string;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  carePlanId,
  carePlanTitle,
  familyId,
  familyName,
  familyEmail,
}) => {
  const [billingStartDate, setBillingStartDate] = useState<Date | undefined>(undefined);
  const [billingCadence, setBillingCadence] = useState<string>('weekly');
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(0);
  const [generating, setGenerating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load billing config from onboarding_checklists
  useEffect(() => {
    const loadBillingConfig = async () => {
      try {
        const { data } = await supabase
          .from('onboarding_checklists')
          .select('checked_items')
          .eq('family_id', familyId)
          .maybeSingle();

        if (data?.checked_items) {
          const items = data.checked_items as Record<string, unknown>;
          if (items.billing_start_date) {
            setBillingStartDate(new Date(items.billing_start_date as string));
          }
          if (items.billing_cadence) {
            setBillingCadence(items.billing_cadence as string);
          }
        }
      } catch (err) {
        console.error('Failed to load billing config:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBillingConfig();
  }, [familyId]);

  // Generate billing periods based on start date and cadence
  const getBillingPeriods = () => {
    if (!billingStartDate) return [];
    const periods = [];
    const now = new Date();
    let periodStart = new Date(billingStartDate);

    for (let i = 0; i < 12; i++) {
      const periodEnd = billingCadence === 'weekly'
        ? addDays(periodStart, 6)
        : addDays(addMonths(periodStart, 1), -1);

      const label = billingCadence === 'weekly'
        ? `Week ${i + 1}: ${format(periodStart, 'MMM d')} – ${format(periodEnd, 'MMM d, yyyy')}`
        : `Month ${i + 1}: ${format(periodStart, 'MMM d')} – ${format(periodEnd, 'MMM d, yyyy')}`;

      periods.push({ start: periodStart, end: periodEnd, label });

      periodStart = billingCadence === 'weekly'
        ? addDays(periodStart, 7)
        : addMonths(periodStart, 1);

      // Stop generating periods far into the future
      if (periodStart > addMonths(now, 3)) break;
    }
    return periods;
  };

  const periods = getBillingPeriods();
  const selectedPeriod = periods[selectedPeriodIndex] || null;

  const buildBillingData = (): CareBillingData => {
    return buildDefaultCareBillingData({
      familyName,
      familyEmail,
      carePlanId,
      carePlanTitle,
      billingPeriodStart: selectedPeriod?.start,
      billingPeriodEnd: selectedPeriod?.end,
      dueDate: selectedPeriod ? addDays(selectedPeriod.end, 3) : undefined,
      paymentDate: new Date(),
      amountPaid: undefined,
    });
  };

  const handleGenerate = async (type: 'quote' | 'invoice' | 'receipt') => {
    if (!selectedPeriod && type !== 'receipt') {
      toast.error('Please select a billing period first');
      return;
    }
    setGenerating(type);
    try {
      const data = buildBillingData();
      if (type === 'quote') await generateQuotePDF(data);
      else if (type === 'invoice') await generateInvoicePDF(data);
      else await generateReceiptPDF(data);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} downloaded successfully`);
    } catch (err) {
      console.error(`Failed to generate ${type}:`, err);
      toast.error(`Failed to generate ${type}`);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Period Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Period</CardTitle>
          <CardDescription>
            Select the billing period for document generation.
            {billingCadence && (
              <Badge variant="outline" className="ml-2">
                {billingCadence === 'weekly' ? 'Weekly' : 'Monthly'} Billing
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!billingStartDate ? (
            <div className="text-center py-6 text-muted-foreground">
              <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No service start date configured</p>
              <p className="text-xs mt-1">
                An admin needs to set the service start date and billing cadence in the Onboarding Checklist.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Service started: <span className="font-medium text-foreground">{format(billingStartDate, 'MMMM d, yyyy')}</span>
                  </p>
                  <Select
                    value={String(selectedPeriodIndex)}
                    onValueChange={(v) => setSelectedPeriodIndex(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select billing period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedPeriod && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <span className="font-medium">Selected Period:</span>{' '}
                  {format(selectedPeriod.start, 'MMM d, yyyy')} – {format(selectedPeriod.end, 'MMM d, yyyy')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Quote</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Generate a quotation for the selected billing period. Valid for 14 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerate('quote')}
              disabled={!!generating || !billingStartDate}
            >
              {generating === 'quote' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                'Generate Quote'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Invoice</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Generate an invoice for the selected billing period with payment terms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleGenerate('invoice')}
              disabled={!!generating || !billingStartDate}
            >
              {generating === 'invoice' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                'Generate Invoice'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Receipt</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Generate a payment receipt confirming amount received.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleGenerate('receipt')}
              disabled={!!generating}
            >
              {generating === 'receipt' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                'Generate Receipt'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
