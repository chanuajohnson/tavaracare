
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { format } from 'date-fns';
import { useAnalyticsData } from "@/hooks/admin/useAnalyticsData";
import { AnalyticsMetrics } from "@/components/admin/analytics/AnalyticsMetrics";
import { EngagementTrendsChart } from "@/components/admin/analytics/EngagementTrendsChart";
import { UserRoleDistributionChart } from "@/components/admin/analytics/UserRoleDistributionChart";
import { TopActionsChart } from "@/components/admin/analytics/TopActionsChart";
import { DailyActiveUsersChart } from "@/components/admin/analytics/DailyActiveUsersChart";

export default function PlatformAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7');
  const { analyticsData, loading } = useAnalyticsData(dateRange);

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvData = analyticsData.engagementTrends
      .map(item => `${item.date},${item.count}`)
      .join('\n');
    
    const blob = new Blob([`Date,Engagements\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into platform usage and user engagement (excluding admin activities)
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {analyticsData && (
        <div className="grid gap-6">
          {/* Summary Cards */}
          <AnalyticsMetrics 
            totalMetrics={analyticsData.totalMetrics} 
            dateRange={dateRange} 
          />

          {/* Engagement Trends Chart */}
          <EngagementTrendsChart data={analyticsData.engagementTrends} />

          {/* User Role Distribution and Top Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserRoleDistributionChart data={analyticsData.userRoleDistribution} />
            <TopActionsChart data={analyticsData.topActions} />
          </div>

          {/* Daily Active Users */}
          <DailyActiveUsersChart data={analyticsData.dailyActiveUsers} />
        </div>
      )}
    </div>
  );
}
