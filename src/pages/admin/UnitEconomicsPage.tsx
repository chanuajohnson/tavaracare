import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useUnitEconomics } from '@/hooks/admin/useUnitEconomics';
import { UnitEconomicsTable } from '@/components/admin/UnitEconomicsTable';
import { OperatingCostConfig } from '@/components/admin/OperatingCostConfig';

export default function UnitEconomicsPage() {
  const [weeksBack, setWeeksBack] = useState(4);
  const { clients, summary, loading, operatingCosts, updateOperatingCosts } = useUnitEconomics(weeksBack);

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
        <Select value={String(weeksBack)} onValueChange={v => setWeeksBack(Number(v))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Last 2 weeks</SelectItem>
            <SelectItem value="4">Last 4 weeks</SelectItem>
            <SelectItem value="8">Last 8 weeks</SelectItem>
            <SelectItem value="12">Last 12 weeks</SelectItem>
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
                <p className="text-sm text-muted-foreground">Avg Revenue/wk</p>
                <p className="text-2xl font-bold">{loading ? '...' : `$${summary.avgWeeklyRevenue.toLocaleString()}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Cost/wk</p>
                <p className="text-2xl font-bold">{loading ? '...' : `$${summary.avgWeeklyCost.toLocaleString()}`}</p>
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

      {/* Operating Cost Config */}
      <OperatingCostConfig costs={operatingCosts} onChange={updateOperatingCosts} />

      {/* Per-Client Table */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Client Economics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading economics data...</p>
          ) : (
            <UnitEconomicsTable clients={clients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
