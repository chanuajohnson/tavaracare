import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useUnitEconomics } from '@/hooks/admin/useUnitEconomics';
import { UnitEconomicsTable } from '@/components/admin/UnitEconomicsTable';
import { OperatingCostConfig } from '@/components/admin/OperatingCostConfig';
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

export default function UnitEconomicsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const { clients, summary, loading, framework, updateFramework, availableMonths, carePlansWithoutPayroll, fetchErrors } = useUnitEconomics(selectedMonth);

  const marginColor = summary.avgMarginPercent >= 20
    ? 'text-green-700'
    : summary.avgMarginPercent >= 10
      ? 'text-yellow-700'
      : 'text-red-700';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Unit Economics</h1>
          <p className="text-muted-foreground">Profit per client — know your margins in real time.</p>
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

      {/* Summary Cards */}
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
                <p className="text-2xl font-bold">{loading ? '...' : `$${summary.totalMonthlyRevenue.toLocaleString()}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cost/mo</p>
                <p className="text-2xl font-bold">{loading ? '...' : `$${summary.totalMonthlyCost.toLocaleString()}`}</p>
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
              </div>
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
          {!loading && carePlansWithoutPayroll > 0 && (
            <div className="rounded border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              <strong>{carePlansWithoutPayroll}</strong> active care plan{carePlansWithoutPayroll !== 1 ? 's have' : ' has'} no payroll entries for {formatMonthLabel(selectedMonth)}. They are still listed below with zero values — log work hours to populate revenue and cost data.
            </div>
          )}

          {/* Operating Cost Framework */}
          <OperatingCostConfig framework={framework} onChange={updateFramework} />

          {/* Per-Client Table */}
          <Card>
            <CardHeader>
              <CardTitle>Per-Client Economics — {formatMonthLabel(selectedMonth)} (Payroll Month)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading economics data...</p>
              ) : (
                <UnitEconomicsTable clients={clients} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarterly_plan" className="mt-4">
          <QuarterlyActionPlanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
