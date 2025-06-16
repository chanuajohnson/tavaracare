
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Activity, MousePointer, Calendar, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  topActions: Array<{ action_type: string; count: number }>;
  dailyEngagement: Array<{ date: string; events: number; users: number }>;
  roleDistribution: Array<{ role: string; count: number }>;
  journeyProgress: Array<{ stage: string; users: number }>;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PlatformAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedTab, setSelectedTab] = useState('overview');

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Calculate date filter based on selection
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch total users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, role, created_at');

      if (usersError) throw usersError;

      // Fetch engagement tracking data
      const { data: eventsData, error: eventsError } = await supabase
        .from('cta_engagement_tracking')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (eventsError) throw eventsError;

      // Fetch journey analytics
      const { data: journeyData, error: journeyError } = await supabase
        .from('user_journey_progress')
        .select('*');

      if (journeyError) throw journeyError;

      // Process the data
      const totalUsers = usersData?.length || 0;
      const activeUsers = new Set(eventsData?.map(e => e.user_id).filter(Boolean)).size;
      const totalEvents = eventsData?.length || 0;

      // Top actions
      const actionCounts = eventsData?.reduce((acc: Record<string, number>, event) => {
        acc[event.action_type] = (acc[event.action_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const topActions = Object.entries(actionCounts)
        .map(([action_type, count]) => ({ action_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Daily engagement
      const dailyStats = eventsData?.reduce((acc: Record<string, { events: number; users: Set<string> }>, event) => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { events: 0, users: new Set() };
        }
        acc[date].events++;
        if (event.user_id) acc[date].users.add(event.user_id);
        return acc;
      }, {}) || {};

      const dailyEngagement = Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          events: stats.events,
          users: stats.users.size
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Role distribution
      const roleCounts = usersData?.reduce((acc: Record<string, number>, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};

      const roleDistribution = Object.entries(roleCounts)
        .map(([role, count]) => ({ role, count }));

      // Journey progress
      const stageCounts = journeyData?.reduce((acc: Record<string, number>, journey) => {
        const stage = `Step ${journey.current_step}`;
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {}) || {};

      const journeyProgress = Object.entries(stageCounts)
        .map(([stage, users]) => ({ stage, users }));

      setAnalyticsData({
        totalUsers,
        activeUsers,
        totalEvents,
        topActions,
        dailyEngagement,
        roleDistribution,
        journeyProgress
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Total Users',
      value: analyticsData?.totalUsers || 0,
      change: '+12%',
      icon: <Users className="h-4 w-4" />,
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: analyticsData?.activeUsers || 0,
      change: '+8%',
      icon: <Activity className="h-4 w-4" />,
      trend: 'up'
    },
    {
      title: 'Total Events',
      value: analyticsData?.totalEvents || 0,
      change: '+24%',
      icon: <MousePointer className="h-4 w-4" />,
      trend: 'up'
    },
    {
      title: 'Avg. Events/User',
      value: analyticsData?.activeUsers ? Math.round((analyticsData.totalEvents || 0) / analyticsData.activeUsers) : 0,
      change: '+5%',
      icon: <TrendingUp className="h-4 w-4" />,
      trend: 'up'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into platform usage and user engagement
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change} from last period
                  </p>
                </div>
                <div className="text-muted-foreground">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.dailyEngagement || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="events" stroke="#8884d8" name="Events" />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.roleDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, count }) => `${role}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData?.roleDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top User Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.topActions || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="action_type" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.dailyEngagement || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Daily Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Registered Users</span>
                    <span className="font-semibold">{analyticsData?.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users ({dateRange})</span>
                    <span className="font-semibold">{analyticsData?.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activity Rate</span>
                    <span className="font-semibold">
                      {analyticsData?.totalUsers ? 
                        Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.journeyProgress || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
