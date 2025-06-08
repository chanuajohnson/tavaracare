
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { orderId, visitDate, visitTime, visitType } = await req.json();

    // PayPal API credentials
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_API_URL = Deno.env.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';

    // Get PayPal access token
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    const tokenResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Capture the PayPal order
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
      throw new Error('Payment capture failed');
    }

    // Update database with successful payment and schedule visit
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Update profile with payment success and visit scheduling
    await supabaseService.from('profiles').update({
      visit_payment_status: 'completed',
      visit_payment_reference: orderId,
      visit_scheduling_status: 'scheduled',
      visit_scheduled_date: visitDate,
      visit_notes: JSON.stringify({
        visit_type: visitType,
        visit_date: visitDate,
        visit_time: visitTime,
        payment_completed: true,
        payment_reference: orderId,
        payment_amount: '300.00',
        payment_currency: 'TTD'
      })
    }).eq('id', user.id);

    // Create visit booking record
    await supabaseService.from('visit_bookings').insert({
      user_id: user.id,
      booking_date: visitDate,
      booking_time: visitTime,
      visit_type: visitType,
      status: 'scheduled',
      payment_status: 'completed',
      payment_reference: orderId,
      payment_amount: 300.00,
      payment_currency: 'TTD'
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentStatus: 'completed',
        visitScheduled: true,
        paymentReference: orderId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('PayPal payment completion error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
