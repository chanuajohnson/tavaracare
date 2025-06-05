
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { analyticsService } from '@/services/analytics/analyticsService';
import { format, subDays } from 'date-fns';

interface FunnelData {
  stage: string;
  entered: number;
  completed: number;
  conversionRate: number;
  avgTimeToComplete: number;
}

export const FunnelAnalytics: React.FC = () => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('registration');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [loading, setLoading] = useState(true);

  const funnelOptions = [
    { value: 'registration', label: 'User Registration' },
    { value: 'onboarding', label: 'User Onboarding' },
    { value: 'subscription', label: 'Subscription Flow' },
    { value: 'careplan_creation', label: 'Care Plan Creation' }
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  useEffect(() => {
    loadFunnelData();
  }, [selectedFunnel, dateRange]);

  const loadFunnelData = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      const rawData = await analyticsService.getFunnelAnalytics(selectedFunnel, {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      // Process data to calculate funnel metrics
      const stageMetrics = new Map<string, { entered: number; completed: number; totalTime: number; completedCount: number }>();

      rawData.forEach(record => {
        const stageName = record.stage_name;
        
        if (!stageMetrics.has(stageName)) {
          stageMetrics.set(stageName, { entered: 0, completed: 0, totalTime: 0, completedCount: 0 });
        }

        const metrics = stageMetrics.get(stageName)!;
        metrics.entered++;

        if (record.completed_at) {
          metrics.completed++;
          if (record.conversion_time_seconds) {
            metrics.totalTime += record.conversion_time_seconds;
            metrics.completedCount++;
          }
        }
      });

      const processedData: FunnelData[] = Array.from(stageMetrics.entries()).map(([stage, metrics]) => ({
        stage,
        entered: metrics.entered,
        completed: metrics.completed,
        conversionRate: metrics.entered > 0 ? (metrics.completed / metrics.entered) * 100 : 0,
        avgTimeToComplete: metrics.completedCount > 0 ? metrics.totalTime / metrics.completedCount : 0
      })).sort((a, b) => a.stage.localeCompare(b.stage));

      setFunnelData(processedData);
    } catch (error) {
      console.error('Error loading funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallConversion = () => {
    if (funnelData.length === 0) return 0;
    const firstStage = funnelData[0];
    const lastStage = funnelData[funnelData.length - 1];
    return firstStage.entered > 0 ? (lastStage.completed / firstStage.entered) * 100 : 0;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Funnel Analytics</h2>
        <div className="flex gap-3">
          <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select funnel" />
            </SelectTrigger>
            <SelectContent>
              {funnelOptions.map(option => (
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
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">
                  {funnelData.reduce((sum, stage) => sum + stage.entered, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Conversion</p>
                <p className="text-2xl font-bold">{calculateOverallConversion().toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completions</p>
                <p className="text-2xl font-bold">
                  {funnelData.reduce((sum, stage) => sum + stage.completed, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold">
                  {formatTime(funnelData.reduce((sum, stage) => sum + stage.avgTimeToComplete, 0) / Math.max(funnelData.length, 1))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">{stage.stage.replace('_', ' ')}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{stage.entered} entered</span>
                        <span>{stage.completed} completed</span>
                        <span>{formatTime(stage.avgTimeToComplete)} avg time</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stage.conversionRate.toFixed(1)}%</div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(stage.conversionRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {index < funnelData.length - 1 && (
                    <div className="flex justify-center py-2">
                      <TrendingDown className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
