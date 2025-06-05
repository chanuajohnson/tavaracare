
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Heart, MessageSquare, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { analyticsService } from '@/services/analytics/analyticsService';
import { format, subDays } from 'date-fns';

interface SentimentData {
  id: string;
  feedback_type: string;
  sentiment_score: number;
  sentiment_label: string;
  urgency_score: number;
  keywords: string[];
  created_at: string;
  subject: string;
  message: string;
}

interface SentimentSummary {
  positive: number;
  negative: number;
  neutral: number;
  avgScore: number;
  avgUrgency: number;
  totalFeedback: number;
}

export const SentimentDashboard: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [summary, setSummary] = useState<SentimentSummary>({
    positive: 0,
    negative: 0,
    neutral: 0,
    avgScore: 0,
    avgUrgency: 0,
    totalFeedback: 0
  });
  const [dateRange, setDateRange] = useState<string>('7d');
  const [feedbackType, setFeedbackType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  const feedbackTypeOptions = [
    { value: 'all', label: 'All Feedback' },
    { value: 'general', label: 'General' },
    { value: 'technical', label: 'Technical' },
    { value: 'bug_report', label: 'Bug Reports' },
    { value: 'feature_request', label: 'Feature Requests' },
    { value: 'testimonial', label: 'Testimonials' }
  ];

  useEffect(() => {
    loadSentimentData();
  }, [dateRange, feedbackType]);

  const loadSentimentData = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      const data = await analyticsService.getFeedbackSentiment({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      let filteredData = data || [];
      if (feedbackType !== 'all') {
        filteredData = filteredData.filter((item: any) => item.feedback_type === feedbackType);
      }

      setSentimentData(filteredData);

      // Calculate summary
      const totalFeedback = filteredData.length;
      const positive = filteredData.filter((item: any) => item.sentiment_label === 'positive').length;
      const negative = filteredData.filter((item: any) => item.sentiment_label === 'negative').length;
      const neutral = filteredData.filter((item: any) => item.sentiment_label === 'neutral').length;
      
      const avgScore = totalFeedback > 0 
        ? filteredData.reduce((sum: number, item: any) => sum + (item.sentiment_score || 0), 0) / totalFeedback
        : 0;
      
      const avgUrgency = totalFeedback > 0
        ? filteredData.reduce((sum: number, item: any) => sum + (item.urgency_score || 0), 0) / totalFeedback
        : 0;

      setSummary({
        positive,
        negative,
        neutral,
        avgScore,
        avgUrgency,
        totalFeedback
      });
    } catch (error) {
      console.error('Error loading sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return 'text-red-600 bg-red-100';
    if (score >= 6) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getUrgencyLabel = (score: number) => {
    if (score >= 8) return 'High';
    if (score >= 6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
        <div className="flex gap-3">
          <Select value={feedbackType} onValueChange={setFeedbackType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Feedback type" />
            </SelectTrigger>
            <SelectContent>
              {feedbackTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{summary.totalFeedback}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Sentiment</p>
                <p className="text-2xl font-bold">{(summary.avgScore * 100).toFixed(1)}%</p>
              </div>
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positive Rate</p>
                <p className="text-2xl font-bold">
                  {summary.totalFeedback > 0 ? ((summary.positive / summary.totalFeedback) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Urgency</p>
                <p className="text-2xl font-bold">{summary.avgUrgency.toFixed(1)}/10</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Positive</span>
              <span className="text-green-600">{summary.positive} ({summary.totalFeedback > 0 ? ((summary.positive / summary.totalFeedback) * 100).toFixed(1) : 0}%)</span>
            </div>
            <Progress 
              value={summary.totalFeedback > 0 ? (summary.positive / summary.totalFeedback) * 100 : 0} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Neutral</span>
              <span className="text-gray-600">{summary.neutral} ({summary.totalFeedback > 0 ? ((summary.neutral / summary.totalFeedback) * 100).toFixed(1) : 0}%)</span>
            </div>
            <Progress 
              value={summary.totalFeedback > 0 ? (summary.neutral / summary.totalFeedback) * 100 : 0} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Negative</span>
              <span className="text-red-600">{summary.negative} ({summary.totalFeedback > 0 ? ((summary.negative / summary.totalFeedback) * 100).toFixed(1) : 0}%)</span>
            </div>
            <Progress 
              value={summary.totalFeedback > 0 ? (summary.negative / summary.totalFeedback) * 100 : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {sentimentData.slice(0, 10).map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{feedback.subject}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {feedback.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getSentimentColor(feedback.sentiment_label)}>
                          {feedback.sentiment_label}
                        </Badge>
                        <Badge className={getUrgencyColor(feedback.urgency_score)}>
                          {getUrgencyLabel(feedback.urgency_score)} Priority
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(feedback.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {(feedback.sentiment_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sentiment Score
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {sentimentData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No feedback data found for the selected period.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
