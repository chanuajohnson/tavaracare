
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
    console.log("PayPal Create Subscription function called");
    
    // Get the request body
    const requestBody = await req.json();
    const { planId, userId, returnUrl, cancelUrl } = requestBody;
    
    console.log("Request payload:", { planId, returnUrl, cancelUrl, userId: userId?.substring(0, 10) + "..." });
    
    if (!planId || !userId || !returnUrl || !cancelUrl) {
      console.error("Missing required parameters:", { 
        hasPlanId: !!planId, 
        hasUserId: !!userId, 
        hasReturnUrl: !!returnUrl, 
        hasCancelUrl: !!cancelUrl 
      });
      
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
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

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error("PayPal credentials are missing");
      return new Response(
        JSON.stringify({ error: "PayPal integration not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token from PayPal
    console.log("Getting PayPal access token...");
    const accessToken = await getPayPalAccessToken();
    console.log("PayPal access token obtained");

    // Create a mock plan if we don't have a real one
    // In production, we should look up the plan in our database
    let planData;
    
    try {
      console.log("Connecting to Supabase...");
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      console.log("Fetching plan details for ID:", planId);
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (error) {
        console.error("Error fetching plan:", error);
        throw new Error(`Plan not found: ${error.message}`);
      }
      
      if (!data) {
        console.error("Plan not found with ID:", planId);
        throw new Error("Plan not found");
      }

      planData = data;
      console.log("Plan data retrieved:", planData);
    } catch (error) {
      console.error("Error fetching plan data:", error);
      
      // Use a fallback plan for testing - this should be removed in production
      planData = {
        id: planId,
        name: planId.includes("care") ? "Family Care" : "Family Premium",
        price: planId.includes("care") ? 14.99 : 29.99,
        description: "Subscription plan",
        duration_days: 30,
        features: ["feature1", "feature2"],
        paypal_plan_id: null // We'll create a dynamic plan
      };
      
      console.log("Using fallback plan data:", planData);
    }

    // Create subscription in PayPal
    console.log("Creating PayPal subscription...");
    const subscriptionResponse = await createPayPalSubscription(
      accessToken,
      planData,
      returnUrl,
      cancelUrl
    );

    console.log("PayPal subscription creation response:", subscriptionResponse);

    if (!subscriptionResponse.id || !subscriptionResponse.links) {
      console.error("Invalid PayPal response:", subscriptionResponse);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create subscription", 
          details: subscriptionResponse 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the subscription record in our database
    try {
      console.log("Creating subscription record in database...");
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          status: "pending", // Will be updated by webhook
          paypal_subscription_id: subscriptionResponse.id,
          payment_method: "paypal",
          start_date: new Date().toISOString(),
          end_date: calculateEndDate(planData.duration_days),
        })
        .select("id")
        .single();

      if (subscriptionError) {
        console.error("Error creating subscription record:", subscriptionError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to save subscription", 
            details: subscriptionError 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Subscription record created:", subscriptionData);
      
      // Find the approval URL
      const approvalLink = subscriptionResponse.links.find(link => link.rel === "approve");
      console.log("Approval link:", approvalLink);
      
      return new Response(
        JSON.stringify({
          success: true,
          subscription_id: subscriptionData.id,
          paypal_subscription_id: subscriptionResponse.id,
          approval_url: approvalLink ? approvalLink.href : null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ 
          error: "Database error", 
          details: dbError instanceof Error ? dbError.message : "Unknown error"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
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
      const responseText = await response.text();
      console.error("PayPal authentication error:", responseText);
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

async function createPayPalSubscription(accessToken, planData, returnUrl, cancelUrl) {
  console.log("Creating PayPal subscription with plan:", planData.name);
  
  try {
    let payload;
    
    // If we have a PayPal plan ID, use it; otherwise create a dynamic plan
    if (planData.paypal_plan_id) {
      payload = {
        plan_id: planData.paypal_plan_id,
        application_context: {
          brand_name: "Takes A Village",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        }
      };
      console.log("Using existing PayPal plan ID:", planData.paypal_plan_id);
    } else {
      // If we don't have a PayPal plan ID, create a dynamic subscription
      console.log("No PayPal plan ID found, creating dynamic subscription");
      
      payload = {
        plan: {
          name: planData.name,
          description: planData.description || `${planData.name} Subscription`,
          billing_cycles: [
            {
              frequency: {
                interval_unit: "MONTH",
                interval_count: 1,
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: 0, // Infinite
              pricing_scheme: {
                fixed_price: {
                  value: planData.price?.toString() || "14.99",
                  currency_code: "USD",
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: {
              value: "0",
              currency_code: "USD",
            },
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3,
          },
        },
        application_context: {
          brand_name: "Takes A Village",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        }
      };
    }

    console.log("Subscription payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`PayPal API response (status ${response.status}):`, responseText);

    if (!response.ok) {
      throw new Error(`Failed to create PayPal subscription: ${response.status} ${response.statusText} - ${responseText}`);
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse PayPal response as JSON:", e);
      throw new Error("Invalid response format from PayPal");
    }
    
    return jsonResponse;
  } catch (error) {
    console.error("Error in createPayPalSubscription:", error);
    throw error;
  }
}

function calculateEndDate(days) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (days || 30)); // Default to 30 days if not specified
  return endDate.toISOString();
}
