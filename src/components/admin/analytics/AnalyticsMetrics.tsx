
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, TrendingUp, Calendar } from "lucide-react";

interface TotalMetrics {
  totalUsers: number;
  totalEngagements: number;
  avgSessionTime: number;
  conversionRate: number;
}

interface AnalyticsMetricsProps {
  totalMetrics: TotalMetrics;
  dateRange: string;
}

export const AnalyticsMetrics: React.FC<AnalyticsMetricsProps> = ({ totalMetrics, dateRange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMetrics.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Active users (non-admin)</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMetrics.totalEngagements}</div>
          <p className="text-xs text-muted-foreground">User interactions tracked</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalMetrics.totalUsers > 0 
              ? Math.round(totalMetrics.totalEngagements / totalMetrics.totalUsers)
              : 0}
          </div>
          <p className="text-xs text-muted-foreground">Avg engagements per user</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Date Range</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dateRange}</div>
          <p className="text-xs text-muted-foreground">Days analyzed</p>
        </CardContent>
      </Card>
    </div>
  );
};
