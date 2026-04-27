import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { UTMLinkGenerator } from '@/components/admin/UTMLinkGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, Users, MousePointer } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SignupsBySource {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  count: number;
  last_signup: string;
}

export default function CampaignLinksPage() {
  const [signupsBySource, setSignupsBySource] = useState<SignupsBySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSignups, setTotalSignups] = useState(0);
  const [trackedSignups, setTrackedSignups] = useState(0);

  useEffect(() => {
    fetchSignupsBySource();
  }, []);

  const fetchSignupsBySource = async () => {
    try {
      setLoading(true);
      
      // Fetch signups with UTM data from cta_engagement_tracking
      const { data: trackingData, error } = await supabase
        .from('cta_engagement_tracking')
        .select('additional_data, created_at')
        .in('action_type', ['family_registration_complete', 'professional_registration_complete', 'community_registration_complete', 'registration_complete'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracking data:', error);
        return;
      }

      // Aggregate by source/medium/campaign
      const aggregated = new Map<string, SignupsBySource>();
      let tracked = 0;

      trackingData?.forEach((item) => {
        const additionalData = item.additional_data as Record<string, any> | null;
        const utmSource = additionalData?.utm_source || null;
        const utmMedium = additionalData?.utm_medium || null;
        const utmCampaign = additionalData?.utm_campaign || null;

        if (utmSource) {
          tracked++;
          const key = `${utmSource}|${utmMedium}|${utmCampaign}`;
          const existing = aggregated.get(key);
          
          if (existing) {
            existing.count++;
            if (new Date(item.created_at) > new Date(existing.last_signup)) {
              existing.last_signup = item.created_at;
            }
          } else {
            aggregated.set(key, {
              utm_source: utmSource,
              utm_medium: utmMedium,
              utm_campaign: utmCampaign,
              count: 1,
              last_signup: item.created_at
            });
          }
        }
      });

      const sortedResults = Array.from(aggregated.values())
        .sort((a, b) => b.count - a.count);

      setSignupsBySource(sortedResults);
      setTotalSignups(trackingData?.length || 0);
      setTrackedSignups(tracked);
    } catch (error) {
      console.error('Error fetching signups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: "Admin Dashboard", path: "/dashboard/admin" },
          { label: "Campaign Links", path: "/admin/campaign-links" }
        ]}
      />

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Campaign Links & Attribution</h1>
          <p className="text-muted-foreground">
            Generate tracked links for your social media campaigns and see which ads are driving signups.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Signups</p>
                  <p className="text-2xl font-bold">{totalSignups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MousePointer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tracked Signups</p>
                  <p className="text-2xl font-bold">{trackedSignups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attribution Rate</p>
                  <p className="text-2xl font-bold">
                    {totalSignups > 0 ? Math.round((trackedSignups / totalSignups) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* UTM Link Generator */}
        <div className="mb-8">
          <UTMLinkGenerator />
        </div>

        {/* Signups by Source Table */}
        <Card>
          <CardHeader>
            <CardTitle>Signups by Source</CardTitle>
            <CardDescription>
              Track which campaigns are driving the most registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : signupsBySource.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tracked signups yet.</p>
                <p className="text-sm mt-1">
                  Generate a UTM link above and use it in your next ad campaign!
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Medium</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead>Last Signup</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signupsBySource.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{row.utm_source || '-'}</Badge>
                      </TableCell>
                      <TableCell>{row.utm_medium || '-'}</TableCell>
                      <TableCell className="font-medium">{row.utm_campaign || '-'}</TableCell>
                      <TableCell className="text-right font-bold">{row.count}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(row.last_signup), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
