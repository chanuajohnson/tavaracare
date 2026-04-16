import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Info } from 'lucide-react';
import {
  CostCategory,
  categoryWeeklyTotal,
  getCategoryLayer,
} from '@/hooks/admin/operatingCostFramework';
import type { PlatformSummary } from '@/hooks/admin/useUnitEconomics';

interface Props {
  framework: CostCategory[];
  platformSummary: PlatformSummary;
}

const ICONS: Record<string, string> = {
  founder_admin: '👤',
  software: '💻',
  devices: '🖥️',
  marketing: '📣',
  professional: '⚖️',
  banking: '🏦',
  statutory: '🇹🇹',
};

function fmt(n: number) {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function PlatformOperationsCard({ framework, platformSummary }: Props) {
  const platformCats = framework.filter(c => getCategoryLayer(c) === 'platform');

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-700" />
            Platform &amp; Operations (Shared Overhead)
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-normal">
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              {fmt(platformSummary.weeklyTotal)}/wk
            </Badge>
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              {fmt(platformSummary.monthlyTotal)}/mo
            </Badge>
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              {fmt(platformSummary.yearlyTotal)}/yr run-rate
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-purple-50 border border-purple-100 rounded px-3 py-2">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-purple-700" />
          <span>
            These costs are <strong>shared across all active clients</strong> and allocated equally,
            not assigned to any single client. Each active client absorbs{' '}
            <strong className="text-purple-700">{fmt(platformSummary.perClientMonthlyAllocation)}/mo</strong>
            {' '}({fmt(platformSummary.perClientWeeklyAllocation)}/wk) based on{' '}
            <strong>{platformSummary.allocationDivisor}</strong> client{platformSummary.allocationDivisor !== 1 ? 's' : ''}.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {platformCats.map(cat => {
            const weekly = categoryWeeklyTotal(cat);
            const monthly = weekly * 4.333;
            const perClient = weekly / platformSummary.allocationDivisor * 4.333;
            return (
              <div key={cat.key} className="border rounded p-3 bg-background">
                <div className="flex items-center gap-2 mb-1">
                  <span>{ICONS[cat.key] || '📊'}</span>
                  <span className="text-sm font-semibold">{cat.label}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{cat.description}</div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Weekly</span>
                  <span className="font-medium">{fmt(weekly)}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-medium">{fmt(monthly)}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs pt-1 mt-1 border-t border-dashed">
                  <span className="text-purple-700">Per client/mo</span>
                  <span className="font-semibold text-purple-700">{fmt(perClient)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
