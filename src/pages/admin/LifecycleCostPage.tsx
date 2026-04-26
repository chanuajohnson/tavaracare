import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Download, FileText, Sparkles, Info } from 'lucide-react';
import { useLifecycleCost } from '@/hooks/admin/useLifecycleCost';
import {
  buildScenarioPresets,
  buildScenarioTimeline,
  fmtTTD,
  fmtUSDBracket,
  type ScenarioConfig,
} from '@/utils/lifecycleScenarios';
import { LifecycleCostBuilder, type BuilderState } from '@/components/admin/lifecycle/LifecycleCostBuilder';
import { ScenarioComparisonGrid } from '@/components/admin/lifecycle/ScenarioComparisonGrid';
import { OptionalServicesRow } from '@/components/admin/lifecycle/OptionalServicesRow';
import { FreePlanValueCard } from '@/components/admin/lifecycle/FreePlanValueCard';

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
      key: 'conservative',
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
      {/* Print override: expand all accordion panels in printed PDF */}
      <style>{`
        @media print {
          [data-radix-collection-item] [data-state="closed"] {
            display: block !important;
          }
          [data-state="closed"] > div[role="region"],
          [data-state="closed"] + div[role="region"] {
            display: block !important;
            height: auto !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* Header — always visible */}
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
            <a href="/mnt/documents/tavara-lifecycle-cost_v3.pdf" target="_blank" rel="noreferrer">
              <FileText className="h-4 w-4 mr-1.5" /> 1-page PDF (v3)
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/mnt/documents/tavara-lifecycle-cost_v3.pptx" target="_blank" rel="noreferrer">
              <FileText className="h-4 w-4 mr-1.5" /> 6-slide deck (v3)
            </a>
          </Button>
        </div>
      </div>

      {/* Stacked accordion — only "Before Day 0" open by default */}
      <Accordion
        type="multiple"
        defaultValue={['before-day-0']}
        className="space-y-3"
      >
        {/* 1. Before Day 0 */}
        <AccordionItem
          value="before-day-0"
          className="border rounded-lg px-4 bg-card"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-left">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground w-fit">
                Before Day 0
              </Badge>
              <div>
                <div className="font-semibold text-base">
                  What families get for free — no payment required
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  Register, assess, capture Legacy Story, see auto-matches — all at zero cost
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <FreePlanValueCard />
          </AccordionContent>
        </AccordionItem>

        {/* 2. Day 0 mandatory bundle */}
        <AccordionItem
          value="day-0"
          className="border rounded-lg px-4 bg-card"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-left">
              <Badge variant="default" className="w-fit">Day 0</Badge>
              <div>
                <div className="font-semibold text-base">
                  Mandatory setup bundle — paid before any care begins
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  Care Assessment, Caregiver Matching & Placement, Care Readiness
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Day0Item label="Care Assessment & Setup" amount={pricing.setup_assessment} />
              <Day0Item label="Caregiver Matching & Placement" amount={pricing.setup_matching} />
              <Day0Item label="Care Readiness Assessment" amount={pricing.setup_readiness} />
              <div className="rounded-md bg-primary/10 border border-primary/30 p-3 flex flex-col justify-center">
                <div className="text-[10px] uppercase text-muted-foreground">Day 0 Total</div>
                <div className="text-lg font-bold text-primary">
                  {fmtTTD(
                    pricing.setup_assessment + pricing.setup_matching +
                    pricing.setup_readiness + day0Optional
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground/70">
                  {fmtUSDBracket(
                    pricing.setup_assessment + pricing.setup_matching +
                    pricing.setup_readiness + day0Optional
                  )}
                </div>
                {day0Optional > 0 && (
                  <div className="text-[10px] text-muted-foreground mt-1">
                    incl. {fmtTTD(day0Optional)} optional
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-foreground">Billing rhythm:</strong> Day 0 = mandatory setup
                fees only. Day 5 (Friday of week 1) = first full-week care payments + first week of
                subscription. Weeks 2–13 settle into the stable weekly rhythm shown below.
                All figures in <strong className="text-foreground">TTD</strong>; USD shown
                in brackets at indicative rate.
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Three side-by-side scenarios */}
        <AccordionItem
          value="scenarios"
          className="border rounded-lg px-4 bg-card"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-left">
              <Badge variant="secondary" className="w-fit">Scenarios</Badge>
              <div>
                <div className="font-semibold text-base">
                  Three side-by-side scenarios
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  Conservative · Typical · Premium — first 13 weeks of care
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ScenarioComparisonGrid timelines={timelines} showWeek5Adjust={builder.showWeek5Adjust} />
          </AccordionContent>
        </AccordionItem>

        {/* 4. Optional services */}
        <AccordionItem
          value="optional"
          className="border rounded-lg px-4 bg-card"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-left">
              <Badge variant="outline" className="w-fit">Optional</Badge>
              <div>
                <div className="font-semibold text-base">
                  Services added when needed — not blindsided
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  Never auto-billed. Families opt in over the journey as needs evolve.
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <OptionalServicesRow pricing={pricing} />
          </AccordionContent>
        </AccordionItem>

        {/* 5. Custom builder */}
        <AccordionItem
          value="builder"
          className="border rounded-lg px-4 bg-card"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-left">
              <Badge variant="secondary" className="w-fit">Build</Badge>
              <div>
                <div className="font-semibold text-base">
                  Build your own scenario
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  Customize hours, rate, subscription tier, and add-ons
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Disclaimer — always visible */}
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
        <p>
          <strong className="text-foreground">Tavara is a Care Coordination & Management Platform —
          not an agency.</strong> Families pay all care payments and subscription fees to Tavara.
          Tavara coordinates disbursement to caregivers, NIS filings, care payment records, and
          compliance reporting on the family's behalf as the household employer of record.
        </p>
        <p className="text-[11px]">
          All figures shown in <strong className="text-foreground">TTD</strong>. USD equivalents in
          brackets at an indicative rate of TTD 6.78 = USD 1.00 (for reference only).
        </p>
      </div>
    </div>
  );
}

const Day0Item: React.FC<{ label: string; amount: number }> = ({ label, amount }) => (
  <div className="rounded-md border p-3">
    <div className="text-[10px] uppercase text-muted-foreground leading-tight">{label}</div>
    <div className="text-base font-semibold mt-1">{fmtTTD(amount)}</div>
    <div className="text-[10px] text-muted-foreground/70">{fmtUSDBracket(amount)}</div>
  </div>
);
