import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin, BarChart3, Trophy } from 'lucide-react';
import { useFlyerAnalytics } from '@/hooks/admin/useFlyerAnalytics';
import { getCategoryByCode } from '@/constants/flyerCategories';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface FlyerAnalyticsDashboardProps {
  dateRange: string;
}

export const FlyerAnalyticsDashboard: React.FC<FlyerAnalyticsDashboardProps> = ({ dateRange }) => {
  const { data, loading } = useFlyerAnalytics(dateRange);

  if (loading) {
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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{data.locationScans.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active Locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold truncate">
                {data.topLocation?.business_name || 'N/A'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Top Location</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{data.categoryPerformance.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active Categories</p>
          </CardContent>
        </Card>
      </div>

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

      {/* Top Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Locations</CardTitle>
          <CardDescription>Ranked by number of scans</CardDescription>
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
                      <span className={`font-bold text-lg ${idx < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-medium">{loc.business_name}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{category?.icon} {category?.label}</span>
                          <span>•</span>
                          <span>Variant {loc.variant}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{loc.scans}</p>
                      <p className="text-sm text-muted-foreground">scans</p>
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
            <CardDescription>Daily flyer scan activity</CardDescription>
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
