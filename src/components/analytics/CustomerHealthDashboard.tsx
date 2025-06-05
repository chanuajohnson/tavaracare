
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { analyticsService, CustomerHealthScore } from '@/services/analytics/analyticsService';
import { toast } from 'sonner';

export const CustomerHealthDashboard: React.FC = () => {
  const [healthScores, setHealthScores] = useState<CustomerHealthScore[]>([]);
  const [filteredScores, setFilteredScores] = useState<CustomerHealthScore[]>([]);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const riskOptions = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'critical', label: 'Critical Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'low', label: 'Low Risk' }
  ];

  useEffect(() => {
    loadHealthScores();
  }, []);

  useEffect(() => {
    filterScores();
  }, [healthScores, riskFilter]);

  const loadHealthScores = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getCustomerHealthScores();
      setHealthScores(data);
    } catch (error) {
      console.error('Error loading health scores:', error);
      toast.error('Failed to load customer health scores');
    } finally {
      setLoading(false);
    }
  };

  const filterScores = () => {
    if (riskFilter === 'all') {
      setFilteredScores(healthScores);
    } else {
      setFilteredScores(healthScores.filter(score => score.churn_risk_level === riskFilter));
    }
  };

  const updateHealthScore = async (userId: string) => {
    setUpdating(userId);
    try {
      await analyticsService.calculateHealthScore(userId);
      await loadHealthScores();
      toast.success('Health score updated successfully');
    } catch (error) {
      console.error('Error updating health score:', error);
      toast.error('Failed to update health score');
    } finally {
      setUpdating(null);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateSummary = () => {
    const total = filteredScores.length;
    const critical = filteredScores.filter(s => s.churn_risk_level === 'critical').length;
    const high = filteredScores.filter(s => s.churn_risk_level === 'high').length;
    const avgScore = total > 0 ? filteredScores.reduce((sum, s) => sum + s.overall_score, 0) / total : 0;
    
    return { total, critical, high, avgScore };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Health Scores</h2>
        <div className="flex gap-3">
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              {riskOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={loadHealthScores} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{summary.high}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(summary.avgScore)}`}>
                  {summary.avgScore.toFixed(0)}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-bold">{summary.avgScore.toFixed(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Health Scores List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Health Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScores.map((customer) => (
                <div key={customer.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">
                          {(customer as any).profiles?.full_name || 'Unknown User'}
                        </h4>
                        <Badge className={getRiskColor(customer.churn_risk_level)}>
                          {customer.churn_risk_level} Risk
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(customer.trend_direction)}
                          <span className="text-sm text-muted-foreground">
                            {customer.trend_direction}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Overall</p>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(customer.overall_score)}`}>
                              {customer.overall_score}
                            </span>
                            <Progress value={customer.overall_score} className="flex-1 h-2" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(customer.engagement_score)}`}>
                              {customer.engagement_score}
                            </span>
                            <Progress value={customer.engagement_score} className="flex-1 h-2" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground">Satisfaction</p>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(customer.satisfaction_score)}`}>
                              {customer.satisfaction_score}
                            </span>
                            <Progress value={customer.satisfaction_score} className="flex-1 h-2" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground">Usage</p>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(customer.usage_score)}`}>
                              {customer.usage_score}
                            </span>
                            <Progress value={customer.usage_score} className="flex-1 h-2" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground">Support</p>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(customer.support_score)}`}>
                              {customer.support_score}
                            </span>
                            <Progress value={customer.support_score} className="flex-1 h-2" />
                          </div>
                        </div>
                      </div>
                      
                      {customer.key_insights.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground mb-1">Key Insights:</p>
                          <div className="flex flex-wrap gap-1">
                            {customer.key_insights.slice(0, 3).map((insight, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {insight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateHealthScore(customer.user_id)}
                        disabled={updating === customer.user_id}
                      >
                        {updating === customer.user_id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Recalculate'
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last updated: {new Date(customer.last_calculated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredScores.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No customer health data found for the selected filter.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
