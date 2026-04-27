import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles } from 'lucide-react';
import type { PlatformSummary, UnitEconomicsSummary } from '@/hooks/admin/useUnitEconomics';

interface Props {
  scenarioClientCount: number;
  onScenarioChange: (n: number) => void;
  realActiveClientCount: number;
  platformSummary: PlatformSummary;
  summary: UnitEconomicsSummary;
}

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString();
}

export function ScenarioControlsCard({
  scenarioClientCount,
  onScenarioChange,
  realActiveClientCount,
  platformSummary,
  summary,
}: Props) {
  // Estimate average direct margin per client (revenue − direct − careOps), then project
  const projection = useMemo(() => {
    const n = realActiveClientCount || 1;
    const avgRevenue = summary.totalMonthlyRevenue / n;
    const avgDirect = summary.totalMonthlyDirectCost / n;
    const avgCareOps = summary.totalMonthlyCareOpsCost / n;
    const avgMarginalProfit = avgRevenue - avgDirect - avgCareOps;
    const newPerClientPlatform = platformSummary.weeklyTotal * 4.333 / Math.max(scenarioClientCount, 1);
    const newAvgMargin = avgMarginalProfit - newPerClientPlatform;
    const newAvgMarginPct = avgRevenue > 0 ? (newAvgMargin / avgRevenue) * 100 : 0;
    // Break-even: how many clients to absorb platform with current avg marginal profit
    const breakEven = avgMarginalProfit > 0
      ? Math.ceil((platformSummary.weeklyTotal * 4.333) / avgMarginalProfit)
      : null;
    return {
      newPerClientPlatform,
      newAvgMargin,
      newAvgMarginPct: Math.round(newAvgMarginPct * 10) / 10,
      avgMarginalProfit,
      breakEven,
    };
  }, [scenarioClientCount, realActiveClientCount, summary, platformSummary]);

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Scenario — How does Tavara scale?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium">Simulate active clients</label>
            <Badge variant="outline" className="text-base px-3">
              {scenarioClientCount} client{scenarioClientCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[scenarioClientCount]}
            onValueChange={v => onScenarioChange(v[0])}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1</span>
            <span>Currently {realActiveClientCount} active</span>
            <span>50</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-xs space-y-1">
            <div className="text-muted-foreground">Platform cost / client / mo</div>
            <div className="text-lg font-semibold text-purple-700">{fmt(projection.newPerClientPlatform)}</div>
            <div className="text-[10px] text-muted-foreground">
              Total {fmt(platformSummary.monthlyTotal)} ÷ {scenarioClientCount}
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div className="text-muted-foreground">Projected avg margin</div>
            <div className={`text-lg font-semibold ${projection.newAvgMarginPct >= 20 ? 'text-green-700' : projection.newAvgMarginPct >= 0 ? 'text-yellow-700' : 'text-red-700'}`}>
              {projection.newAvgMarginPct}%
            </div>
            <div className="text-[10px] text-muted-foreground">
              {fmt(projection.newAvgMargin)}/mo per client
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Break-even client count
            </div>
            <div className="text-lg font-semibold">
              {projection.breakEven ? `${projection.breakEven} clients` : 'N/A'}
            </div>
            <div className="text-[10px] text-muted-foreground">
              At avg marginal profit {fmt(projection.avgMarginalProfit)}/mo per client
            </div>
          </div>
        </div>

        {scenarioClientCount !== realActiveClientCount && (
          <div className="text-xs bg-primary/5 border border-primary/20 rounded px-3 py-2">
            💡 The Per-Client Economics table above is now showing margins as if you had{' '}
            <strong>{scenarioClientCount}</strong> active clients. Reset the slider to{' '}
            <button className="underline" onClick={() => onScenarioChange(realActiveClientCount)}>
              {realActiveClientCount}
            </button>{' '}
            to see today's reality.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
