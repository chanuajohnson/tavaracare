import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, MapPin, BarChart3, Trophy, RefreshCw, Bug, CheckCircle, XCircle, AlertTriangle, Users, Repeat, Trash2 } from 'lucide-react';
import { useFlyerAnalytics } from '@/hooks/admin/useFlyerAnalytics';
import { getCategoryByCode } from '@/constants/flyerCategories';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FlyerAnalyticsDashboardProps {
  dateRange: string;
}

export const FlyerAnalyticsDashboard: React.FC<FlyerAnalyticsDashboardProps> = ({ dateRange }) => {
  const [excludeTestData, setExcludeTestData] = useState(true);
  const { data, loading, refetch } = useFlyerAnalytics(dateRange, excludeTestData);
  const [showDebug, setShowDebug] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cleaningTestData, setCleaningTestData] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    connected: boolean;
    totalRecords: number;
    flyerRecords: number;
    error: string | null;
  } | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCleanTestData = async () => {
    if (!data?.testLocationCodes.length) return;
    
    const confirmed = window.confirm(
      `This will archive ${data.testLocationCodes.length} test location(s): ${data.testLocationCodes.join(', ')}. Continue?`
    );
    
    if (!confirmed) return;
    
    setCleaningTestData(true);
    try {
      // Delete test scans from cta_engagement_tracking
      for (const locationCode of data.testLocationCodes) {
        const { error } = await supabase
          .from('cta_engagement_tracking')
          .delete()
          .filter('additional_data->>utm_source', 'eq', 'flyer')
          .filter('additional_data->>utm_location', 'eq', locationCode);
        
        if (error) throw error;
      }
      
      toast.success(`Cleaned up ${data.testLocationCodes.length} test location(s)`);
      await refetch();
    } catch (error: any) {
      console.error('Error cleaning test data:', error);
      toast.error('Failed to clean test data: ' + error.message);
    } finally {
      setCleaningTestData(false);
    }
  };

  const runDebugCheck = async () => {
    try {
      const { data: testData, error: testError } = await supabase
        .from('cta_engagement_tracking')
        .select('id, additional_data')
        .limit(100);

      if (testError) {
        setDebugInfo({
          connected: false,
          totalRecords: 0,
          flyerRecords: 0,
          error: testError.message
        });
        return;
      }

      const flyerRecords = (testData || []).filter(r => {
        const ad = r.additional_data as any;
        return ad?.utm_source === 'flyer';
      });

      setDebugInfo({
        connected: true,
        totalRecords: testData?.length || 0,
        flyerRecords: flyerRecords.length,
        error: null
      });
    } catch (err: any) {
      setDebugInfo({
        connected: false,
        totalRecords: 0,
        flyerRecords: 0,
        error: err.message || 'Unknown error'
      });
    }
  };

  const getSignalColor = (signal: 'green' | 'yellow' | 'red') => {
    switch (signal) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
    }
  };

  const getSignalLabel = (signal: 'green' | 'yellow' | 'red') => {
    switch (signal) {
      case 'green': return 'Scale';
      case 'yellow': return 'Review';
      case 'red': return 'Relocate';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-80 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No analytics data available</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button 
            onClick={() => {
              setShowDebug(!showDebug);
              if (!showDebug) runDebugCheck();
            }} 
            variant="ghost" 
            size="sm"
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug
          </Button>
          <Button
            onClick={() => setExcludeTestData(!excludeTestData)}
            variant={excludeTestData ? 'secondary' : 'outline'}
            size="sm"
          >
            {excludeTestData ? 'Showing Real Data Only' : 'Showing All Data'}
          </Button>
          {data.hasTestData && (
            <Button
              onClick={handleCleanTestData}
              variant="destructive"
              size="sm"
              disabled={cleaningTestData}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {cleaningTestData ? 'Cleaning...' : `Clean Test Data (${data.testLocationCodes.length})`}
            </Button>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          Last {dateRange} days
        </Badge>
      </div>

      {/* Statistical Significance Warning */}
      {!data.isStatisticallySignificant && data.totalScans > 0 && (
        <Card className="border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Need More Data</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {data.totalScans < 25 && `Need ${25 - data.totalScans} more scans. `}
                  {data.daysOfData < 7 && `Need ${7 - data.daysOfData} more days of data. `}
                  Wait before making rollout decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <Card className="border-dashed border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {debugInfo ? (
              <>
                <div className="flex items-center gap-2">
                  {debugInfo.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Supabase Connection: {debugInfo.connected ? 'OK' : 'Failed'}</span>
                </div>
                <div>Total Records (last 100): {debugInfo.totalRecords}</div>
                <div>Flyer Scans Found: {debugInfo.flyerRecords}</div>
                {debugInfo.error && (
                  <div className="text-red-500">Error: {debugInfo.error}</div>
                )}
                <div className="pt-2 border-t">
                  <strong>Analytics Data:</strong>
                  <ul className="list-disc list-inside ml-2">
                    <li>Total Scans: {data.totalScans}</li>
                    <li>Unique Scans: {data.uniqueScans}</li>
                    <li>Repeat Scans: {data.repeatScans}</li>
                    <li>Locations: {data.locationScans.length}</li>
                    <li>Days of Data: {data.daysOfData}</li>
                    <li>Test Locations: {data.testLocationCodes.join(', ') || 'None'}</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Running diagnostics...</p>
            )}
            <Button onClick={runDebugCheck} size="sm" variant="outline" className="mt-2">
              Re-run Check
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{data.totalScans}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total Flyer Scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{data.uniqueScans}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Unique Scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{data.repeatScans}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Repeat Scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{data.locationScans.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active Locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Location Card (Enhanced) */}
      {data.topLocation && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-lg font-bold">{data.topLocation.business_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.topLocation.scans} scans • {data.topLocation.repeatScans} repeat scans
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getSignalColor(data.topLocation.signal)}`} />
                <span className="text-sm font-medium">{getSignalLabel(data.topLocation.signal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rollout Signals Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Rollout Signals
          </CardTitle>
          <CardDescription>Quick decisions based on scan patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {data.locationScans.filter(l => l.signal === 'green').length}
              </div>
              <p className="text-sm text-green-600 dark:text-green-500">Scale Here</p>
              <p className="text-xs text-muted-foreground mt-1">High unique + repeat</p>
            </div>
            <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {data.locationScans.filter(l => l.signal === 'yellow').length}
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-500">Review Placement</p>
              <p className="text-xs text-muted-foreground mt-1">High unique, low repeat</p>
            </div>
            <div className="text-center p-4 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {data.locationScans.filter(l => l.signal === 'red').length}
              </div>
              <p className="text-sm text-red-600 dark:text-red-500">Relocate</p>
              <p className="text-xs text-muted-foreground mt-1">Low visibility</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variant x Location Table */}
      <Card>
        <CardHeader>
          <CardTitle>Variant × Location Performance</CardTitle>
          <CardDescription>Which message works best at each location</CardDescription>
        </CardHeader>
        <CardContent>
          {data.variantByLocation.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Variant A</TableHead>
                  <TableHead className="text-center">Variant B</TableHead>
                  <TableHead className="text-center">Winner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.variantByLocation.slice(0, 10).map((loc) => (
                  <TableRow key={loc.location}>
                    <TableCell className="font-medium">{loc.business_name}</TableCell>
                    <TableCell className="text-center">{loc.variantA}</TableCell>
                    <TableCell className="text-center">{loc.variantB}</TableCell>
                    <TableCell className="text-center">
                      {loc.variantA > loc.variantB ? (
                        <Badge variant="default">A</Badge>
                      ) : loc.variantB > loc.variantA ? (
                        <Badge variant="secondary">B</Badge>
                      ) : (
                        <Badge variant="outline">Tie</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No location data yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* A/B Test Performance */}
      <Card>
        <CardHeader>
          <CardTitle>A/B Test Performance</CardTitle>
          <CardDescription>Compare which flyer variant drives more scans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {data.variantPerformance.map(v => (
              <div key={v.variant} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={v.variant === 'A' ? 'default' : 'secondary'}>
                      Variant {v.variant}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {v.variant === 'A' ? '"Find care now"' : '"Match with a caregiver today"'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{v.scans}</p>
                    <p className="text-sm text-muted-foreground">scans</p>
                  </div>
                </div>
                <Progress value={v.percentage} className="h-3" />
                <p className="text-sm text-center text-muted-foreground">{v.percentage}%</p>
              </div>
            ))}
          </div>
          {data.totalScans > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>Winner:</strong>{' '}
                {data.variantPerformance[0].scans > data.variantPerformance[1].scans ? (
                  <>Variant A is outperforming by {data.variantPerformance[0].scans - data.variantPerformance[1].scans} scans</>
                ) : data.variantPerformance[1].scans > data.variantPerformance[0].scans ? (
                  <>Variant B is outperforming by {data.variantPerformance[1].scans - data.variantPerformance[0].scans} scans</>
                ) : (
                  <>Both variants are performing equally</>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>Which business categories bring the most traffic</CardDescription>
        </CardHeader>
        <CardContent>
          {data.categoryPerformance.length > 0 ? (
            <div className="space-y-4">
              {data.categoryPerformance.map((cat, idx) => {
                const category = getCategoryByCode(cat.category);
                const maxScans = data.categoryPerformance[0]?.scans || 1;
                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        <span className="text-lg">{category?.icon || '📍'}</span>
                        <span className="font-medium">{category?.label || cat.category}</span>
                        <span className="text-sm text-muted-foreground">({cat.locations} locations)</span>
                      </div>
                      <span className="font-bold">{cat.scans} scans</span>
                    </div>
                    <Progress value={(cat.scans / maxScans) * 100} className="h-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No category data yet. Scans will appear here once flyers are distributed.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Locations Table (Enhanced) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Locations</CardTitle>
          <CardDescription>Ranked by number of scans with rollout signals</CardDescription>
        </CardHeader>
        <CardContent>
          {data.locationScans.length > 0 ? (
            <div className="space-y-2">
              {data.locationScans.slice(0, 10).map((loc, idx) => {
                const category = getCategoryByCode(loc.category);
                return (
                  <div 
                    key={loc.location}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${idx < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                          #{idx + 1}
                        </span>
                        <div className={`w-2.5 h-2.5 rounded-full ${getSignalColor(loc.signal)}`} />
                      </div>
                      <div>
                        <p className="font-medium">{loc.business_name}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{category?.icon} {category?.label}</span>
                          <span>•</span>
                          <span>A:{loc.variantA} B:{loc.variantB}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{loc.scans}</p>
                      <p className="text-sm text-muted-foreground">
                        {loc.uniqueScans} unique • {loc.repeatScans} repeat
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No location scans yet. Data will appear once flyers are scanned.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scans Over Time */}
      {data.scansByDay.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scans Over Time</CardTitle>
            <CardDescription>Daily flyer scan activity ({data.daysOfData} days of data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.scansByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
