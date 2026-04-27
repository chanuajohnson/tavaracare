
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

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

interface AdditionalDataType {
  user_role?: string;
  [key: string]: any;
}

export const useAnalyticsData = (dateRange: string) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

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
      const additionalData = item.additional_data as AdditionalDataType;
      const role = additionalData?.user_role || 'anonymous';
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
      const nonAdminEngagements = engagementData?.filter(item => {
        const additionalData = item.additional_data as AdditionalDataType;
        return additionalData?.user_role !== 'admin';
      }) || [];

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

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  return { analyticsData, loading, refetch: fetchAnalyticsData };
};
