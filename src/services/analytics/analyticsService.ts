
import { supabase } from '@/lib/supabase';

export interface FunnelStage {
  id: string;
  user_id: string;
  session_id: string;
  funnel_name: string;
  stage_name: string;
  stage_order: number;
  entered_at: string;
  completed_at?: string;
  conversion_time_seconds?: number;
  additional_data: Record<string, any>;
}

export interface SessionAnalytics {
  id: string;
  session_id: string;
  user_id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  page_views: number;
  interactions_count: number;
  bounce_rate?: number;
  device_type?: string;
  browser?: string;
  referrer?: string;
  exit_page?: string;
  goal_completions: number;
  session_data: Record<string, any>;
}

export interface GoalCompletion {
  id: string;
  user_id?: string;
  session_id: string;
  goal_type: string;
  goal_name: string;
  completed_at: string;
  value?: number;
  conversion_path: string[];
  time_to_complete_seconds?: number;
  additional_data: Record<string, any>;
}

export interface CustomerHealthScore {
  id: string;
  user_id: string;
  overall_score: number;
  engagement_score: number;
  satisfaction_score: number;
  usage_score: number;
  support_score: number;
  churn_risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_calculated_at: string;
  trend_direction: 'improving' | 'stable' | 'declining';
  key_insights: string[];
  recommended_actions: string[];
}

export interface SentimentAnalysis {
  sentiment_score: number;
  sentiment_label: string;
  keywords: string[];
  urgency_score: number;
  satisfaction_prediction?: number;
}

export const analyticsService = {
  // Funnel tracking
  async trackFunnelStage(data: {
    user_id?: string;
    session_id: string;
    funnel_name: string;
    stage_name: string;
    stage_order: number;
    additional_data?: Record<string, any>;
  }) {
    const { error } = await supabase
      .from('user_journey_funnels')
      .insert(data);
    
    if (error) throw error;
  },

  async completeFunnelStage(funnelId: string) {
    const { error } = await supabase
      .from('user_journey_funnels')
      .update({ 
        completed_at: new Date().toISOString(),
        conversion_time_seconds: supabase.raw('EXTRACT(EPOCH FROM (NOW() - entered_at))::INTEGER')
      })
      .eq('id', funnelId);
    
    if (error) throw error;
  },

  async getFunnelAnalytics(funnelName?: string, dateRange?: { start: string; end: string }) {
    let query = supabase
      .from('user_journey_funnels')
      .select('*');
    
    if (funnelName) {
      query = query.eq('funnel_name', funnelName);
    }
    
    if (dateRange) {
      query = query
        .gte('entered_at', dateRange.start)
        .lte('entered_at', dateRange.end);
    }
    
    const { data, error } = await query.order('entered_at', { ascending: false });
    
    if (error) throw error;
    return data as FunnelStage[];
  },

  // Session analytics
  async trackSession(data: {
    session_id: string;
    user_id?: string;
    device_type?: string;
    browser?: string;
    referrer?: string;
    session_data?: Record<string, any>;
  }) {
    const { error } = await supabase
      .from('session_analytics')
      .insert(data);
    
    if (error) throw error;
  },

  async updateSession(sessionId: string, updates: {
    ended_at?: string;
    duration_seconds?: number;
    page_views?: number;
    interactions_count?: number;
    exit_page?: string;
    goal_completions?: number;
  }) {
    const { error } = await supabase
      .from('session_analytics')
      .update(updates)
      .eq('session_id', sessionId);
    
    if (error) throw error;
  },

  async getSessionAnalytics(dateRange?: { start: string; end: string }) {
    let query = supabase
      .from('session_analytics')
      .select('*');
    
    if (dateRange) {
      query = query
        .gte('started_at', dateRange.start)
        .lte('started_at', dateRange.end);
    }
    
    const { data, error } = await query.order('started_at', { ascending: false });
    
    if (error) throw error;
    return data as SessionAnalytics[];
  },

  // Goal tracking
  async trackGoalCompletion(data: {
    user_id?: string;
    session_id: string;
    goal_type: string;
    goal_name: string;
    value?: number;
    conversion_path: string[];
    additional_data?: Record<string, any>;
  }) {
    const { error } = await supabase
      .from('goal_completions')
      .insert(data);
    
    if (error) throw error;
  },

  async getGoalCompletions(goalType?: string, dateRange?: { start: string; end: string }) {
    let query = supabase
      .from('goal_completions')
      .select('*');
    
    if (goalType) {
      query = query.eq('goal_type', goalType);
    }
    
    if (dateRange) {
      query = query
        .gte('completed_at', dateRange.start)
        .lte('completed_at', dateRange.end);
    }
    
    const { data, error } = await query.order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data as GoalCompletion[];
  },

  // Customer health scores
  async getCustomerHealthScores(riskLevel?: string) {
    let query = supabase
      .from('customer_health_scores')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          role
        )
      `);
    
    if (riskLevel) {
      query = query.eq('churn_risk_level', riskLevel);
    }
    
    const { data, error } = await query.order('overall_score', { ascending: true });
    
    if (error) throw error;
    return data as CustomerHealthScore[];
  },

  async calculateHealthScore(userId: string) {
    const { error } = await supabase.rpc('calculate_customer_health_score', {
      target_user_id: userId
    });
    
    if (error) throw error;
  },

  // Sentiment analysis
  async getFeedbackSentiment(dateRange?: { start: string; end: string }) {
    let query = supabase
      .from('user_feedback')
      .select(`
        id,
        feedback_type,
        sentiment_score,
        sentiment_label,
        urgency_score,
        keywords,
        created_at,
        subject,
        message
      `)
      .not('sentiment_score', 'is', null);
    
    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getSentimentTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const { data, error } = await supabase
      .from('analytics_aggregations')
      .select('*')
      .eq('metric_name', 'sentiment_score')
      .eq('aggregation_period', period)
      .order('period_start', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Analytics aggregations
  async getMetricAggregation(
    metricName: string, 
    metricType: string, 
    period: 'daily' | 'weekly' | 'monthly',
    dateRange?: { start: string; end: string }
  ) {
    let query = supabase
      .from('analytics_aggregations')
      .select('*')
      .eq('metric_name', metricName)
      .eq('metric_type', metricType)
      .eq('aggregation_period', period);
    
    if (dateRange) {
      query = query
        .gte('period_start', dateRange.start)
        .lte('period_end', dateRange.end);
    }
    
    const { data, error } = await query.order('period_start', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};
