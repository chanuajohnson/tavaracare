import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    // Get client info from headers
    const client_ip_address = req.headers.get('x-forwarded-for') || 
                             req.headers.get('x-real-ip') || 
                             req.headers.get('cf-connecting-ip') || '';
    const client_user_agent = req.headers.get('user-agent') || '';
    const event_time = Math.floor(Date.now() / 1000);

    // Hash email with SHA256
    const encoder = new TextEncoder();
    const emailData = encoder.encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', emailData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashed_email = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Build payload for Facebook Conversions API
    const payload = {
      data: [
        {
          event_name: 'CompleteRegistration',
          event_time,
          event_id: `family-signup-${event_time}`,
          action_source: 'website',
          event_source_url: 'https://tavara.care/registration/family',
          user_data: {
            em: [hashed_email],
            client_ip_address,
            client_user_agent
          }
        }
      ]
    };

    // Get secrets from environment
    const meta_pixel_id = Deno.env.get('META_PIXEL_ID');
    const meta_access_token = Deno.env.get('META_ACCESS_TOKEN');

    if (!meta_pixel_id || !meta_access_token) {
      console.error('Missing META_PIXEL_ID or META_ACCESS_TOKEN');
      return new Response(
        JSON.stringify({ error: 'Missing required configuration' }), 
        { status: 500, headers: corsHeaders }
      );
    }

    // Send to Facebook Graph API
    const url = `https://graph.facebook.com/v18.0/${meta_pixel_id}/events?access_token=${meta_access_token}`;
    
    console.log('Sending Facebook CAPI event:', {
      event_id: payload.data[0].event_id,
      event_name: payload.data[0].event_name,
      pixel_id: meta_pixel_id
    });

    const fbResponse = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const fbResult = await fbResponse.json();
    
    if (!fbResponse.ok) {
      console.error('Facebook API error:', fbResult);
      return new Response(
        JSON.stringify({ error: 'Facebook API error', details: fbResult }), 
        { status: fbResponse.status, headers: corsHeaders }
      );
    }

    console.log('Facebook CAPI success:', fbResult);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        event_id: payload.data[0].event_id,
        facebook_response: fbResult 
      }), 
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Facebook CAPI error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: corsHeaders }
    );
  }
});