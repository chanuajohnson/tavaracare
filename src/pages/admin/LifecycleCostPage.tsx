import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, Sparkles, Info } from 'lucide-react';
import { useLifecycleCost } from '@/hooks/admin/useLifecycleCost';
import {
  buildScenarioPresets,
  buildScenarioTimeline,
  fmtUSD,
  type ScenarioConfig,
} from '@/utils/lifecycleScenarios';
import { LifecycleCostBuilder, type BuilderState } from '@/components/admin/lifecycle/LifecycleCostBuilder';
import { ScenarioComparisonGrid } from '@/components/admin/lifecycle/ScenarioComparisonGrid';

const DEFAULT_BUILDER: BuilderState = {
  hourlyRate: 40,
  hoursPerDay: 8,
  daysPerWeek: 5,
  subscription: 'active',
  addonMedication: false,
  addonSopMonitoring: false,
  addonMeal: false,
  addonSecondary: 'none',
  showWeek5Adjust: true,
  oneTimeSopActivation: false,
  oneTimeHomeReset: false,
};

export default function LifecycleCostPage() {
  const { pricing, isLoading } = useLifecycleCost();
  const [builder, setBuilder] = useState<BuilderState>(DEFAULT_BUILDER);

  const presets = useMemo(() => buildScenarioPresets(pricing), [pricing]);

  // Build the custom scenario from the builder state
  const customScenario: ScenarioConfig = useMemo(() => {
    const sub = builder.subscription === 'premium' ? pricing.sub_premium : pricing.sub_active;
    let weeklyAddons = 0;
    if (builder.addonMedication) weeklyAddons += pricing.addon_medication;
    if (builder.addonSopMonitoring) weeklyAddons += pricing.addon_sop_monitoring;
    if (builder.addonMeal) weeklyAddons += pricing.addon_meal;
    switch (builder.addonSecondary) {
      case 'light': weeklyAddons += pricing.addon_secondary_light; break;
      case 'standard': weeklyAddons += pricing.addon_secondary_standard; break;
      case 'high': weeklyAddons += pricing.addon_secondary_high; break;
      case 'podiatric': weeklyAddons += pricing.addon_secondary_podiatric; break;
    }
    return {
      key: 'conservative', // reuse type — render label as "Custom"
      label: 'Custom',
      description: `$${builder.hourlyRate}/hr × ${builder.hoursPerDay}h × ${builder.daysPerWeek}d, ${builder.subscription === 'premium' ? 'Premium' : 'Active'} Care Mgmt`,
      hourlyRate: builder.hourlyRate,
      hoursPerDay: builder.hoursPerDay,
      daysPerWeek: builder.daysPerWeek,
      subscriptionWeekly: sub,
      weeklyAddons,
    };
  }, [builder, pricing]);

  const timelines = useMemo(() => {
    return [presets.conservative, presets.typical, presets.premium].map((s) =>
      buildScenarioTimeline(s, pricing, { weeks: 13, includeWeek5Adjustment: builder.showWeek5Adjust })
    );
  }, [presets, pricing, builder.showWeek5Adjust]);

  const customTimeline = useMemo(() => {
    return buildScenarioTimeline(customScenario, pricing, {
      weeks: 13,
      includeWeek5Adjustment: builder.showWeek5Adjust,
    });
  }, [customScenario, pricing, builder.showWeek5Adjust]);

  const day0Optional =
    (builder.oneTimeSopActivation ? pricing.onetime_sop_activation : 0) +
    (builder.oneTimeHomeReset ? pricing.onetime_home_reset : 0);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Care Lifecycle Cost Visualizer</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Day 0 → Month 3 cost-of-care projection for prospects. All numbers pulled live from
            published billable services & subscription plans — single source of truth.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-1.5" /> Print / Save PDF
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/mnt/documents/tavara-lifecycle-cost.pdf" target="_blank" rel="noreferrer">
              <FileText className="h-4 w-4 mr-1.5" /> 1-page PDF
            </a>
          </Button>
        </div>
      </div>

      {/* Day 0 mandatory bundle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Badge variant="default">Day 0</Badge>
            Mandatory setup bundle — paid before any care begins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Day0Item label="Care Assessment & Setup" amount={pricing.setup_assessment} />
            <Day0Item label="Caregiver Matching & Placement" amount={pricing.setup_matching} />
            <Day0Item label="Care Readiness Assessment" amount={pricing.setup_readiness} />
            <Day0Item label="NIS Employer Registration" amount={pricing.setup_nis} />
            <div className="rounded-md bg-primary/10 border border-primary/30 p-3 flex flex-col justify-center">
              <div className="text-[10px] uppercase text-muted-foreground">Day 0 Total</div>
              <div className="text-lg font-bold text-primary">
                {fmtUSD(
                  pricing.setup_assessment + pricing.setup_matching +
                  pricing.setup_readiness + pricing.setup_nis + day0Optional
                )}
              </div>
              {day0Optional > 0 && (
                <div className="text-[10px] text-muted-foreground">
                  incl. {fmtUSD(day0Optional)} optional
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-foreground">Billing rhythm:</strong> Day 0 = setup fees only.
              Day 5 (Friday of week 1) = first partial-week wages + first week of subscription.
              Weeks 2–13 settle into the stable weekly rhythm shown below.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Three-scenario comparison */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Three side-by-side scenarios</h2>
        <ScenarioComparisonGrid timelines={timelines} showWeek5Adjust={builder.showWeek5Adjust} />
      </div>

      {/* Builder + Custom timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <LifecycleCostBuilder state={builder} pricing={pricing} onChange={setBuilder} />
        </div>
        <div>
          <ScenarioComparisonGrid
            timelines={[customTimeline]}
            showWeek5Adjust={builder.showWeek5Adjust}
          />
        </div>
      </div>

      {/* Optional add-ons reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Optional services — added when applicable</CardTitle>
          <p className="text-xs text-muted-foreground">
            These appear over the journey as needs evolve. Not bundled at Day 0.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            <AddonRow label="Medication Management Support" price={`${fmtUSD(pricing.addon_medication)}/wk`} />
            <AddonRow label="Daily Care SOP + Monitoring" price={`${fmtUSD(pricing.addon_sop_monitoring)}/wk`} />
            <AddonRow label="Daily Care SOP — One-Time Activation" price={`${fmtUSD(pricing.onetime_sop_activation)} once`} />
            <AddonRow label="Meal Support Upgrade" price={`${fmtUSD(pricing.addon_meal)}/wk`} />
            <AddonRow label="Light Secondary Support" price={`${fmtUSD(pricing.addon_secondary_light)}/wk`} />
            <AddonRow label="Standard Secondary Support" price={`${fmtUSD(pricing.addon_secondary_standard)}/wk`} />
            <AddonRow label="High-Need Secondary Support" price={`${fmtUSD(pricing.addon_secondary_high)}/wk`} />
            <AddonRow label="Podiatric — Secondary Member" price={`${fmtUSD(pricing.addon_secondary_podiatric)}/wk`} />
            <AddonRow label="Guided Home Reset" price={`${fmtUSD(pricing.onetime_home_reset)} once`} />
            <AddonRow label="Care Plan Adjustment Fee" price={`${fmtUSD(pricing.fee_plan_adjust)} per change`} />
            <AddonRow label="Basic Escalation Support" price={`${fmtUSD(pricing.fee_basic_escalation)} per event`} />
            <AddonRow label="Urgent Escalation Support" price={`${fmtUSD(pricing.fee_urgent_escalation)} per event`} />
          </div>
          <div className="mt-4 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Also available on-demand:</strong> Payroll & HR services,
            official letters (employment, NIS, BIR), care reports & history exports — quoted per request.
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Tavara Care</strong> is a Care Coordination & Management Platform —
        not an agency. Caregiver wages are paid by the family directly to the caregiver. Subscription and
        service fees are paid to Tavara for coordination, oversight, and platform services.
      </div>
    </div>
  );
}

const Day0Item: React.FC<{ label: string; amount: number }> = ({ label, amount }) => (
  <div className="rounded-md border p-3">
    <div className="text-[10px] uppercase text-muted-foreground leading-tight">{label}</div>
    <div className="text-base font-semibold mt-1">{fmtUSD(amount)}</div>
  </div>
);

const AddonRow: React.FC<{ label: string; price: string }> = ({ label, price }) => (
  <div className="flex items-center justify-between rounded-md border px-3 py-2">
    <span className="text-xs">{label}</span>
    <Badge variant="outline" className="text-[10px]">{price}</Badge>
  </div>
);
