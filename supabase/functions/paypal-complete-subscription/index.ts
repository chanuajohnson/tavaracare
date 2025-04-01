
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID") || "";
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET") || "";
const PAYPAL_API_URL = Deno.env.get("PAYPAL_API_URL") || "https://api-m.sandbox.paypal.com"; // Default to sandbox URL

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("PayPal Complete Subscription function called");
    
    // Get the request body
    const requestBody = await req.json();
    const { subscriptionId } = requestBody;
    
    console.log("Completing subscription:", subscriptionId);

    if (!subscriptionId) {
      console.error("Missing subscription_id parameter");
      return new Response(
        JSON.stringify({ error: "Missing subscription_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log environment variables (without secrets)
    console.log("Environment check:", { 
      hasPayPalClientId: !!PAYPAL_CLIENT_ID,
      hasPayPalClientSecret: !!PAYPAL_CLIENT_SECRET,
      paypalApiUrl: PAYPAL_API_URL,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      hasSupabaseServiceKey: !!supabaseServiceKey
    });

    // Get access token from PayPal
    console.log("Getting PayPal access token...");
    const accessToken = await getPayPalAccessToken();
    console.log("PayPal access token obtained");

    // Get the subscription details from our database
    console.log("Connecting to Supabase...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let subscriptionData;
    
    // First try to find the subscription by PayPal subscription ID
    console.log("Trying to find subscription by PayPal ID:", subscriptionId);
    const { data: paypalSubscriptionData, error: paypalSubscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("paypal_subscription_id", subscriptionId)
      .single();
      
    if (paypalSubscriptionData) {
      console.log("Found subscription by PayPal ID:", paypalSubscriptionData);
      subscriptionData = paypalSubscriptionData;
    } else {
      // If not found by PayPal ID, try by our internal ID
      console.log("Fetching subscription details for ID:", subscriptionId);
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .single();
  
      if (error || !data) {
        console.error("Subscription not found:", error);
        return new Response(
          JSON.stringify({ 
            error: "Subscription not found", 
            details: error
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Found subscription by internal ID:", data);
      subscriptionData = data;
    }

    // Verify the subscription status with PayPal
    console.log("Verifying subscription status with PayPal for ID:", subscriptionData.paypal_subscription_id);
    const paypalSubscription = await getPayPalSubscriptionDetails(
      accessToken,
      subscriptionData.paypal_subscription_id
    );

    console.log("PayPal subscription details:", paypalSubscription);

    // Update our database record with the latest status
    console.log("Updating subscription status in database...");
    const newStatus = mapPayPalStatusToOurStatus(paypalSubscription.status);
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        // Add additional fields from PayPal response if needed
      })
      .eq("id", subscriptionData.id);
      
    if (updateError) {
      console.error("Error updating subscription status:", updateError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update subscription status", 
          details: updateError
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Subscription status updated successfully to:", newStatus);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscriptionData.id,
          status: newStatus,
          plan_id: subscriptionData.plan_id,
          paypal_status: paypalSubscription.status,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error completing subscription:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
        type: typeof error
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getPayPalAccessToken() {
  console.log("Requesting access token from PayPal...");
  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("PayPal authentication error:", errorResponse);
      throw new Error(`Failed to authenticate with PayPal: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("PayPal authentication successful");
    return data.access_token;
  } catch (error) {
    console.error("Error in getPayPalAccessToken:", error);
    throw error;
  }
}

async function getPayPalSubscriptionDetails(accessToken, subscriptionId) {
  console.log("Getting subscription details from PayPal for ID:", subscriptionId);
  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const responseText = await response.text();
    console.log(`PayPal API response (status ${response.status}):`, responseText);

    if (!response.ok) {
      throw new Error(`Failed to get subscription details from PayPal: ${response.status} ${response.statusText} - ${responseText}`);
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse PayPal response as JSON:", e);
      throw new Error("Invalid response format from PayPal");
    }
    
    console.log("PayPal subscription details retrieved successfully");
    return jsonResponse;
  } catch (error) {
    console.error("Error in getPayPalSubscriptionDetails:", error);
    throw error;
  }
}

function mapPayPalStatusToOurStatus(paypalStatus) {
  console.log("Mapping PayPal status to our status:", paypalStatus);
  const statusMap = {
    "APPROVAL_PENDING": "pending",
    "APPROVED": "active",
    "ACTIVE": "active",
    "SUSPENDED": "suspended",
    "CANCELLED": "cancelled",
    "EXPIRED": "expired",
  };
  
  const mappedStatus = statusMap[paypalStatus] || "pending";
  console.log("Mapped status:", mappedStatus);
  return mappedStatus;
}
