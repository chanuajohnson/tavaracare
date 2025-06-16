
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Download, Users, Activity, TrendingUp, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsData {
  engagementTrends: Array<{ date: string; count: number }>;
  userRoleDistribution: Array<{ role: string; count: number; percentage: number }>;
  topActions: Array<{ action: string; count: number }>;
  dailyActiveUsers: Array<{ date: string; users: number }>;
  totalMetrics: {
    totalUsers: number;
    totalEngagements: number;
    avgSessionTime: number;
    conversionRate: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PlatformAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('7');
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange));

      // Fetch engagement trends (excluding admin users)
      const { data: engagementData } = await supabase
        .from('cta_engagement_tracking')
        .select(`
          created_at,
          user_id,
          action_type,
          additional_data
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Filter out admin users from the data
      const nonAdminEngagements = engagementData?.filter(item => 
        item.additional_data?.user_role !== 'admin'
      ) || [];

      // Process engagement trends
      const engagementTrends = processEngagementTrends(nonAdminEngagements, startDate, endDate);

      // Get user role distribution (excluding admin)
      const userRoleDistribution = processUserRoleDistribution(nonAdminEngagements);

      // Get top actions
      const topActions = processTopActions(nonAdminEngagements);

      // Get daily active users
      const dailyActiveUsers = processDailyActiveUsers(nonAdminEngagements, startDate, endDate);

      // Calculate total metrics
      const totalMetrics = calculateTotalMetrics(nonAdminEngagements);

      setAnalyticsData({
        engagementTrends,
        userRoleDistribution,
        topActions,
        dailyActiveUsers,
        totalMetrics
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEngagementTrends = (data: any[], startDate: Date, endDate: Date) => {
    const trends: { [key: string]: number } = {};
    
    // Initialize all dates with 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'MMM dd');
      trends[dateKey] = 0;
    }

    // Count engagements per day
    data.forEach(item => {
      const date = format(new Date(item.created_at), 'MMM dd');
      if (trends.hasOwnProperty(date)) {
        trends[date]++;
      }
    });

    return Object.entries(trends).map(([date, count]) => ({ date, count }));
  };

  const processUserRoleDistribution = (data: any[]) => {
    const roleCounts: { [key: string]: number } = {};
    
    data.forEach(item => {
      const role = item.additional_data?.user_role || 'anonymous';
      if (role !== 'admin') { // Double check to exclude admin
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      }
    });

    const total = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(roleCounts).map(([role, count]) => ({
      role: role.charAt(0).toUpperCase() + role.slice(1),
      count,
      percentage: Math.round((count / total) * 100)
    }));
  };

  const processTopActions = (data: any[]) => {
    const actionCounts: { [key: string]: number } = {};
    
    data.forEach(item => {
      actionCounts[item.action_type] = (actionCounts[item.action_type] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  };

  const processDailyActiveUsers = (data: any[], startDate: Date, endDate: Date) => {
    const dailyUsers: { [key: string]: Set<string> } = {};
    
    // Initialize all dates
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'MMM dd');
      dailyUsers[dateKey] = new Set();
    }

    // Track unique users per day
    data.forEach(item => {
      if (item.user_id) {
        const date = format(new Date(item.created_at), 'MMM dd');
        if (dailyUsers[date]) {
          dailyUsers[date].add(item.user_id);
        }
      }
    });

    return Object.entries(dailyUsers).map(([date, userSet]) => ({
      date,
      users: userSet.size
    }));
  };

  const calculateTotalMetrics = (data: any[]) => {
    const uniqueUsers = new Set(data.filter(item => item.user_id).map(item => item.user_id));
    const totalEngagements = data.length;
    
    return {
      totalUsers: uniqueUsers.size,
      totalEngagements,
      avgSessionTime: 0, // Would need session data to calculate
      conversionRate: 0 // Would need conversion data to calculate
    };
  };

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

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalMetrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Active users (non-admin)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalMetrics.totalEngagements}</div>
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
                  {analyticsData.totalMetrics.totalUsers > 0 
                    ? Math.round(analyticsData.totalMetrics.totalEngagements / analyticsData.totalMetrics.totalUsers)
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

          {/* Engagement Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Engagements",
                    color: "#8884d8",
                  },
                }}
                className="h-[300px]"
              >
                <LineChart data={analyticsData.engagementTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* User Role Distribution and Top Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Users",
                      color: "#8884d8",
                    },
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={analyticsData.userRoleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, percentage }) => `${role}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.userRoleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top User Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Actions",
                      color: "#82ca9d",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={analyticsData.topActions} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="action" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Active Users */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: {
                    label: "Active Users",
                    color: "#ffc658",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={analyticsData.dailyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="users" fill="#ffc658" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
