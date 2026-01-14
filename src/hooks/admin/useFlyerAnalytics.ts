import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

interface LocationScanData {
  location: string;
  category: string;
  business_name: string;
  scans: number;
  variant: string;
}

interface VariantPerformance {
  variant: string;
  scans: number;
  percentage: number;
}

interface CategoryPerformance {
  category: string;
  scans: number;
  locations: number;
}

interface FlyerAnalyticsData {
  locationScans: LocationScanData[];
  variantPerformance: VariantPerformance[];
  categoryPerformance: CategoryPerformance[];
  totalScans: number;
  topLocation: LocationScanData | null;
  scansByDay: Array<{ date: string; scans: number }>;
}

interface AdditionalDataType {
  utm_location?: string;
  utm_content?: string;
  utm_source?: string;
  [key: string]: any;
}

export const useFlyerAnalytics = (dateRange: string) => {
  const [data, setData] = useState<FlyerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange));

      // Fetch flyer-related engagements with server-side filter
      const { data: flyerVisits, error: engError } = await supabase
        .from('cta_engagement_tracking')
        .select('created_at, additional_data')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .filter('additional_data->>utm_source', 'eq', 'flyer')
        .order('created_at', { ascending: false });

      if (engError) throw engError;

      console.log('[FlyerAnalytics] Fetched flyer visits:', flyerVisits?.length || 0);

      // Fetch flyer locations for enrichment
      const { data: locations, error: locError } = await supabase
        .from('flyer_locations')
        .select('code, category, business_name, variant');

      if (locError) throw locError;

      const locationMap = new Map(
        (locations || []).map(l => [l.code, l])
      );

      // Process scans by location
      const locationCounts: Record<string, number> = {};
      const variantCounts: Record<string, number> = { A: 0, B: 0 };
      const categoryCounts: Record<string, { scans: number; locations: Set<string> }> = {};
      const dailyCounts: Record<string, number> = {};

      flyerVisits.forEach(visit => {
        const ad = visit.additional_data as AdditionalDataType;
        const locationCode = ad?.utm_location || 'unknown';
        const utmContent = ad?.utm_content || '';
        
        // Count by location
        locationCounts[locationCode] = (locationCounts[locationCode] || 0) + 1;
        
        // Count by variant (from utm_content)
        const variant = utmContent.includes('match_caregiver') ? 'B' : 'A';
        variantCounts[variant]++;

        // Count by category
        const loc = locationMap.get(locationCode);
        if (loc) {
          if (!categoryCounts[loc.category]) {
            categoryCounts[loc.category] = { scans: 0, locations: new Set() };
          }
          categoryCounts[loc.category].scans++;
          categoryCounts[loc.category].locations.add(locationCode);
        }

        // Count by day
        const day = visit.created_at.split('T')[0];
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

      // Build location scan data
      const locationScans: LocationScanData[] = Object.entries(locationCounts)
        .map(([code, scans]) => {
          const loc = locationMap.get(code);
          return {
            location: code,
            category: loc?.category || 'unknown',
            business_name: loc?.business_name || code,
            scans,
            variant: loc?.variant || 'A'
          };
        })
        .sort((a, b) => b.scans - a.scans);

      // Build variant performance
      const totalScans = variantCounts.A + variantCounts.B;
      const variantPerformance: VariantPerformance[] = [
        { variant: 'A', scans: variantCounts.A, percentage: totalScans > 0 ? Math.round((variantCounts.A / totalScans) * 100) : 0 },
        { variant: 'B', scans: variantCounts.B, percentage: totalScans > 0 ? Math.round((variantCounts.B / totalScans) * 100) : 0 }
      ];

      // Build category performance
      const categoryPerformance: CategoryPerformance[] = Object.entries(categoryCounts)
        .map(([category, data]) => ({
          category,
          scans: data.scans,
          locations: data.locations.size
        }))
        .sort((a, b) => b.scans - a.scans);

      // Build daily scans
      const scansByDay = Object.entries(dailyCounts)
        .map(([date, scans]) => ({ date, scans }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setData({
        locationScans,
        variantPerformance,
        categoryPerformance,
        totalScans,
        topLocation: locationScans[0] || null,
        scansByDay
      });
    } catch (error) {
      console.error('Error fetching flyer analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  return { data, loading, refetch: fetchAnalytics };
};
