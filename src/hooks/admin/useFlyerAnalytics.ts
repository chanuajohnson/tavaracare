import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

interface LocationScanData {
  location: string;
  category: string;
  business_name: string;
  scans: number;
  uniqueScans: number;
  repeatScans: number;
  variant: string;
  variantA: number;
  variantB: number;
  signal: 'green' | 'yellow' | 'red';
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

interface VariantLocationData {
  location: string;
  business_name: string;
  variantA: number;
  variantB: number;
}

interface FlyerAnalyticsData {
  locationScans: LocationScanData[];
  variantPerformance: VariantPerformance[];
  categoryPerformance: CategoryPerformance[];
  variantByLocation: VariantLocationData[];
  totalScans: number;
  uniqueScans: number;
  repeatScans: number;
  topLocation: LocationScanData | null;
  scansByDay: Array<{ date: string; scans: number }>;
  hasTestData: boolean;
  testLocationCodes: string[];
  daysOfData: number;
  isStatisticallySignificant: boolean;
}

interface AdditionalDataType {
  utm_location?: string;
  utm_content?: string;
  utm_source?: string;
  [key: string]: any;
}

export const useFlyerAnalytics = (dateRange: string, excludeTestData: boolean = true) => {
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
        .select('created_at, additional_data, session_id')
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
      
      // Identify valid location codes
      const validLocationCodes = new Set((locations || []).map(l => l.code));

      // Find test locations (not in flyer_locations table)
      const testLocationCodes = new Set<string>();
      flyerVisits.forEach(visit => {
        const ad = visit.additional_data as AdditionalDataType;
        const locationCode = ad?.utm_location || 'unknown';
        if (!validLocationCodes.has(locationCode)) {
          testLocationCodes.add(locationCode);
        }
      });

      // Filter visits based on excludeTestData flag
      const filteredVisits = excludeTestData 
        ? flyerVisits.filter(visit => {
            const ad = visit.additional_data as AdditionalDataType;
            const locationCode = ad?.utm_location || 'unknown';
            return validLocationCodes.has(locationCode);
          })
        : flyerVisits;

      // Process scans by location with session tracking
      const locationCounts: Record<string, { 
        total: number; 
        sessions: Set<string>;
        variantA: number;
        variantB: number;
      }> = {};
      const variantCounts: Record<string, number> = { A: 0, B: 0 };
      const categoryCounts: Record<string, { scans: number; locations: Set<string> }> = {};
      const dailyCounts: Record<string, number> = {};
      const allSessions = new Set<string>();

      filteredVisits.forEach(visit => {
        const ad = visit.additional_data as AdditionalDataType;
        const locationCode = ad?.utm_location || 'unknown';
        const utmContent = ad?.utm_content || '';
        const sessionId = visit.session_id || 'unknown';
        
        // Initialize location data
        if (!locationCounts[locationCode]) {
          locationCounts[locationCode] = { 
            total: 0, 
            sessions: new Set(),
            variantA: 0,
            variantB: 0
          };
        }
        
        // Count by location
        locationCounts[locationCode].total++;
        locationCounts[locationCode].sessions.add(sessionId);
        allSessions.add(sessionId);
        
        // Count by variant (from utm_content)
        const variant = utmContent.includes('match_caregiver') ? 'B' : 'A';
        variantCounts[variant]++;
        
        if (variant === 'A') {
          locationCounts[locationCode].variantA++;
        } else {
          locationCounts[locationCode].variantB++;
        }

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

      // Build location scan data with signals
      const locationScans: LocationScanData[] = Object.entries(locationCounts)
        .map(([code, data]) => {
          const loc = locationMap.get(code);
          const uniqueScans = data.sessions.size;
          const repeatScans = data.total - uniqueScans;
          
          // Calculate signal based on unique and repeat scans
          let signal: 'green' | 'yellow' | 'red' = 'red';
          if (uniqueScans >= 3 && repeatScans >= 2) {
            signal = 'green'; // High unique + high repeat = scale here
          } else if (uniqueScans >= 2 && repeatScans < 2) {
            signal = 'yellow'; // High unique + low repeat = placement issue
          }
          // Low unique = red (remove/relocate)
          
          return {
            location: code,
            category: loc?.category || 'unknown',
            business_name: loc?.business_name || code,
            scans: data.total,
            uniqueScans,
            repeatScans,
            variant: loc?.variant || 'A',
            variantA: data.variantA,
            variantB: data.variantB,
            signal
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

      // Build variant by location table
      const variantByLocation: VariantLocationData[] = locationScans.map(loc => ({
        location: loc.location,
        business_name: loc.business_name,
        variantA: loc.variantA,
        variantB: loc.variantB
      }));

      // Build daily scans
      const scansByDay = Object.entries(dailyCounts)
        .map(([date, scans]) => ({ date, scans }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate days of data
      const daysOfData = scansByDay.length;
      
      // Statistical significance: need at least 25 scans and 7 days
      const isStatisticallySignificant = totalScans >= 25 && daysOfData >= 7;

      setData({
        locationScans,
        variantPerformance,
        categoryPerformance,
        variantByLocation,
        totalScans,
        uniqueScans: allSessions.size,
        repeatScans: totalScans - allSessions.size,
        topLocation: locationScans[0] || null,
        scansByDay,
        hasTestData: testLocationCodes.size > 0,
        testLocationCodes: Array.from(testLocationCodes),
        daysOfData,
        isStatisticallySignificant
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
