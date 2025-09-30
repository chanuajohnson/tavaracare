import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Minimal PayPal subscription recording edge function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") ?? "sandbox";
const BASE = PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const id = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  
  if (!id || !secret) {
    throw new Error("PayPal credentials not configured");
  }
  
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${id}:${secret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OAuth failed: ${res.status} ${errorText}`);
  }
  
  const json = await res.json();
  return json.access_token as string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan_id, return_url, cancel_url } = await req.json();
    
    if (!plan_id) {
      return new Response(
        JSON.stringify({ error: "plan_id required" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Creating PayPal subscription for plan: ${plan_id}`);

    const token = await getAccessToken();
    
    const subscriptionPayload = {
      plan_id,
      application_context: {
        brand_name: "Tavara",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: return_url || "https://tavara.care/subscription/success",
        cancel_url: cancel_url || "https://tavara.care/subscription/cancel",
      },
    };

    console.log("Creating subscription with payload:", subscriptionPayload);

    const response = await fetch(`${BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(), // idempotency
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const responseBody = await response.text();
    
    if (!response.ok) {
      console.error(`PayPal API error: ${response.status} ${responseBody}`);
      throw new Error(`PayPal subscription creation failed: ${response.status}`);
    }

    const subscription = JSON.parse(responseBody);
    console.log("PayPal subscription created:", subscription.id);

    // Return the full subscription object for client processing
    return new Response(responseBody, { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    });

  } catch (error) {
    // Don't leak secrets; include correlation id for debugging
    const correlationId = crypto.randomUUID();
    console.error("[paypal-create-subscription]", correlationId, error);
    
    return new Response(
      JSON.stringify({ 
        error: "paypal_subscription_failed", 
        correlation_id: correlationId 
      }), 
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
      }
    );
  }
});