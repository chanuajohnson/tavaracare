import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import {
  buildOptionalServices,
  fmtTTD,
  fmtUSDBracket,
  type PricingCatalog,
} from '@/utils/lifecycleScenarios';

interface Props {
  pricing: PricingCatalog;
}

/**
 * Optional services menu — surfaced separately from the mandatory Day-0 bundle so
 * prospects see the full evolving cost picture and aren't blindsided. No totals
 * computed here; this is a transparent reference list, not a forced bundle.
 */
export const OptionalServicesRow: React.FC<Props> = ({ pricing }) => {
  const items = buildOptionalServices(pricing);
  const oneTime = items.filter((i) => i.cadence === 'one-time');
  const weekly = items.filter((i) => i.cadence === 'weekly');

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline">Optional</Badge>
              Services added when needed — not blindsided
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              These are <strong>never auto-billed</strong>. Families opt in over the journey as
              needs evolve. Shown here so prospects see the full menu upfront.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Day 0 / one-time options */}
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
            Day-0 / One-time options
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {oneTime.map((item) => (
              <OptionalRow key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* Weekly add-ons */}
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
            Recurring weekly add-ons
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {weekly.map((item) => (
              <OptionalRow key={item.label} item={item} />
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            <strong className="text-foreground">Also on-demand:</strong> Payroll & HR support,
            employer letters (NIS, BIR, employment), care history & report exports, plan
            adjustment, and escalation support — quoted per request.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const OptionalRow: React.FC<{
  item: { label: string; amount: number; cadence: 'one-time' | 'weekly' };
}> = ({ item }) => (
  <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
    <span className="text-xs leading-tight pr-2">{item.label}</span>
    <div className="text-right flex-shrink-0">
      <div className="text-xs font-semibold whitespace-nowrap">
        {fmtTTD(item.amount)}
        <span className="text-muted-foreground font-normal text-[10px]">
          {item.cadence === 'weekly' ? '/wk' : ' once'}
        </span>
      </div>
      <div className="text-[9px] text-muted-foreground/70">{fmtUSDBracket(item.amount)}</div>
    </div>
  </div>
);
