import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign, Users, TrendingUp, FileEdit, ArrowRight,
  Building2, Wrench, Layers, Coins, Sparkles,
} from 'lucide-react';
import { useUnitEconomics } from '@/hooks/admin/useUnitEconomics';
import { UnitEconomicsTable } from '@/components/admin/UnitEconomicsTable';
import { OperatingCostConfig } from '@/components/admin/OperatingCostConfig';
import { PlatformOperationsCard } from '@/components/admin/PlatformOperationsCard';
import { ScenarioControlsCard } from '@/components/admin/ScenarioControlsCard';
import { QuarterlyActionPlanTab } from '@/components/admin/expenses/QuarterlyActionPlanTab';
import { format, parse } from 'date-fns';

function getCurrentMonth() {
  return format(new Date(), 'yyyy-MM');
}

function formatMonthLabel(m: string) {
  try {
    return format(parse(m, 'yyyy-MM', new Date()), 'MMMM yyyy');
  } catch {
    return m;
  }
}

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString();
}

export default function UnitEconomicsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [scenarioClientCount, setScenarioClientCount] = useState<number | undefined>(undefined);

  const {
    clients,
    draftCarePlans,
    statusCounts,
    summary,
    platformSummary,
    loading,
    framework,
    updateFramework,
    availableMonths,
    carePlansWithoutPayroll,
    fetchErrors,
    activeClientCount,
  } = useUnitEconomics(selectedMonth, scenarioClientCount);

  // Default scenario slider to real active count once known
  React.useEffect(() => {
    if (scenarioClientCount === undefined && activeClientCount > 0) {
      setScenarioClientCount(activeClientCount);
    }
  }, [activeClientCount, scenarioClientCount]);

  const effectiveScenario = scenarioClientCount ?? Math.max(activeClientCount, 1);

  const marginColor = summary.avgMarginPercent >= 20
    ? 'text-green-700'
    : summary.avgMarginPercent >= 10
      ? 'text-yellow-700'
      : 'text-red-700';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Unit Economics</h1>
          <p className="text-muted-foreground">Profit per client — know your margins in real time.</p>
          <p className="text-xs text-muted-foreground italic max-w-2xl">
            💡 Platform costs are <strong>distributed across active clients</strong> to reflect true marginal profitability,
            not assigned in full to any single client.
          </p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map(m => (
              <SelectItem key={m} value={m}>{formatMonthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards — Row 1 (primary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">{loading ? '...' : summary.totalActiveClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue/mo</p>
                <p className="text-2xl font-bold">{loading ? '...' : fmt(summary.totalMonthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-purple-700" />
              <div>
                <p className="text-sm text-muted-foreground">Platform Cost/mo</p>
                <p className="text-2xl font-bold text-purple-700">
                  {loading ? '...' : fmt(platformSummary.monthlyTotal)}
                </p>
                <p className="text-[10px] text-muted-foreground">Shared overhead — allocated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className={`h-8 w-8 ${marginColor}`} />
              <div>
                <p className="text-sm text-muted-foreground">Avg Margin</p>
                <p className={`text-2xl font-bold ${marginColor}`}>
                  {loading ? '...' : `${summary.avgMarginPercent}%`}
                </p>
                <p className="text-[10px] text-muted-foreground">After all 3 cost layers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards — Row 2 (mini-stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-blue-100">
          <CardContent className="py-4 flex items-center gap-3">
            <Layers className="h-5 w-5 text-blue-700 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Direct Care/mo (Layer 1)</p>
              <p className="text-lg font-semibold text-blue-700">
                {loading ? '...' : fmt(summary.totalMonthlyDirectCost)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-100">
          <CardContent className="py-4 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-amber-700 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Care Ops/mo (Layer 2)</p>
              <p className="text-lg font-semibold text-amber-700">
                {loading ? '...' : fmt(summary.totalMonthlyCareOpsCost)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardContent className="py-4 flex items-center gap-3">
            <Coins className="h-5 w-5 text-purple-700 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Allocated/Client/mo (Layer 3)</p>
              <p className="text-lg font-semibold text-purple-700">
                {loading ? '...' : fmt(platformSummary.perClientMonthlyAllocation)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                ÷ {platformSummary.allocationDivisor} client{platformSummary.allocationDivisor !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed sections */}
      <Tabs defaultValue="per_client" className="w-full">
        <TabsList>
          <TabsTrigger value="per_client">Per-Client Economics</TabsTrigger>
          <TabsTrigger value="quarterly_plan">Quarterly Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="per_client" className="space-y-6 mt-4">
          {fetchErrors && fetchErrors.length > 0 && (
            <div className="rounded border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <strong>Some data could not be loaded:</strong>
              <ul className="list-disc list-inside text-xs mt-1">
                {fetchErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {!loading && Object.keys(statusCounts).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2">
              <span className="font-medium text-foreground">Care plans found:</span>
              {Object.entries(statusCounts).map(([status, count]) => (
                <Badge key={status} variant="outline" className="text-[10px]">
                  {count} {status}
                </Badge>
              ))}
            </div>
          )}

          {!loading && carePlansWithoutPayroll > 0 && (
            <div className="rounded border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              <strong>{carePlansWithoutPayroll}</strong> active care plan{carePlansWithoutPayroll !== 1 ? 's have' : ' has'} no payroll entries for {formatMonthLabel(selectedMonth)}. They are still listed below with zero values — log work hours to populate revenue and cost data.
            </div>
          )}

          {/* § Operating Cost Framework */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between border-b pb-1">
              <h2 className="text-lg font-semibold">Operating Cost Framework</h2>
              <span className="text-xs text-muted-foreground">Grouped by cost layer</span>
            </div>
            <OperatingCostConfig framework={framework} onChange={updateFramework} />
          </section>

          {/* § Per-Client Economics */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between border-b pb-1">
              <h2 className="text-lg font-semibold">Per-Client Economics</h2>
              <span className="text-xs text-muted-foreground">{formatMonthLabel(selectedMonth)} (payroll month)</span>
            </div>
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading economics data...</p>
                ) : (
                  <UnitEconomicsTable clients={clients} />
                )}
              </CardContent>
            </Card>

            {!loading && draftCarePlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    Care Plans Not in Active Payroll ({draftCarePlans.length})
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    These care plans exist but are not in <code>active</code> status. They don't appear in the unit economics table above. Click "Open" to review and activate.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {draftCarePlans.map(p => (
                      <div key={p.carePlanId} className="flex items-center justify-between border rounded px-3 py-2 hover:bg-muted/50">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{p.carePlanTitle}</div>
                          <div className="text-xs text-muted-foreground truncate">{p.familyName}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-[10px] capitalize">{p.status}</Badge>
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/family/care-management/${p.carePlanId}`}>
                              Open <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {/* § Platform & Operations */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between border-b pb-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-700" />
                Platform &amp; Operations
              </h2>
              <span className="text-xs text-muted-foreground">Shared overhead — allocated</span>
            </div>
            <PlatformOperationsCard framework={framework} platformSummary={platformSummary} />
          </section>

          {/* § Scenario Simulation */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between border-b pb-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Scenario Simulation
              </h2>
              <span className="text-xs text-muted-foreground">What-if: how do margins improve as we scale?</span>
            </div>
            <ScenarioControlsCard
              scenarioClientCount={effectiveScenario}
              onScenarioChange={setScenarioClientCount}
              realActiveClientCount={activeClientCount}
              platformSummary={platformSummary}
              summary={summary}
            />
          </section>
        </TabsContent>

        <TabsContent value="quarterly_plan" className="mt-4">
          <QuarterlyActionPlanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
