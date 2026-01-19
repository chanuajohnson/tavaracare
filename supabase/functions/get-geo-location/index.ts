import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeoData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  ip?: string;
}

serve(async (req) => {
  console.log('[get-geo-location] ========== FUNCTION INVOKED ==========');
  console.log('[get-geo-location] Method:', req.method);
  console.log('[get-geo-location] URL:', req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[get-geo-location] Handling OPTIONS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log all headers for debugging
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    console.log('[get-geo-location] Request headers:', JSON.stringify(headersObj));
    
    // Get client IP from various headers (Supabase edge functions)
    const clientIP = 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';
    
    console.log('[get-geo-location] Detected client IP:', clientIP);

    // Skip lookup for localhost/private IPs
    const isPrivateIP = 
      clientIP === 'unknown' ||
      clientIP.startsWith('127.') ||
      clientIP.startsWith('192.168.') ||
      clientIP.startsWith('10.') ||
      clientIP.startsWith('172.') ||
      clientIP === '::1';

    if (isPrivateIP) {
      console.log('[get-geo-location] Private/local IP detected, returning unknown');
      return new Response(
        JSON.stringify({
          country: 'Unknown',
          countryCode: 'XX',
          region: 'Unknown',
          city: 'Unknown',
          timezone: 'Unknown',
          isPrivateIP: true
        } as GeoData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Use ip-api.com free tier (no API key needed, 45 requests/minute limit)
    // For production at scale, consider ipinfo.io or maxmind
    const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,message,country,countryCode,regionName,city,timezone`);
    
    if (!geoResponse.ok) {
      throw new Error(`Geo API returned ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();
    console.log('[get-geo-location] Geo API response:', geoData);

    if (geoData.status === 'fail') {
      console.error('[get-geo-location] Geo lookup failed:', geoData.message);
      return new Response(
        JSON.stringify({
          country: 'Unknown',
          countryCode: 'XX',
          region: 'Unknown',
          city: 'Unknown',
          timezone: 'Unknown',
          error: geoData.message
        } as GeoData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const result: GeoData = {
      country: geoData.country || 'Unknown',
      countryCode: geoData.countryCode || 'XX',
      region: geoData.regionName || 'Unknown',
      city: geoData.city || 'Unknown',
      timezone: geoData.timezone || 'Unknown'
    };

    console.log('[get-geo-location] Returning geo data:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[get-geo-location] Error:', error);
    
    return new Response(
      JSON.stringify({
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown', 
        city: 'Unknown',
        timezone: 'Unknown',
        error: error.message
      } as GeoData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 even on error to not break tracking
      }
    );
  }
});
