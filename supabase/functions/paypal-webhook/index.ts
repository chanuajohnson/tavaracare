
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log("PayPal Webhook function called");
    
    // Get the webhook data
    const webhookData = await req.json();
    console.log("Received PayPal webhook:", webhookData.event_type);

    // Create a Supabase client with the service role key for admin access
    console.log("Connecting to Supabase...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the raw webhook event
    console.log("Storing webhook event...");
    const { data: webhookEvent, error: webhookError } = await supabase
      .from("webhook_events")
      .insert({
        provider: "paypal",
        event_type: webhookData.event_type,
        event_id: webhookData.id,
        raw_data: webhookData,
      })
      .select("id")
      .single();

    if (webhookError) {
      console.error("Error storing webhook event:", webhookError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to store webhook event",
          details: webhookError
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Webhook event stored with ID:", webhookEvent.id);

    // Process the webhook based on event type
    if (webhookData.event_type.startsWith("PAYMENT.")) {
      console.log("Processing payment event...");
      await processPaymentEvent(supabase, webhookData, webhookEvent.id);
    } else if (webhookData.event_type.startsWith("BILLING.SUBSCRIPTION.")) {
      console.log("Processing subscription event...");
      await processSubscriptionEvent(supabase, webhookData, webhookEvent.id);
    } else {
      console.log("Unknown event type, no specific processing needed");
    }

    // Mark the webhook event as processed
    console.log("Marking webhook event as processed...");
    await supabase
      .from("webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("id", webhookEvent.id);

    console.log("Webhook processing complete");
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processPaymentEvent(supabase, webhookData, webhookEventId) {
  try {
    console.log("Processing payment event:", webhookData.event_type);
    
    // Extract resource data
    const resource = webhookData.resource;
    console.log("Payment resource:", resource);
    
    if (!resource || !resource.billing_agreement_id) {
      console.error("Missing billing_agreement_id in payment resource");
      return;
    }
    
    // Find the subscription by PayPal subscription ID
    console.log("Finding subscription for PayPal ID:", resource.billing_agreement_id);
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("id, user_id, plan_id")
      .eq("paypal_subscription_id", resource.billing_agreement_id)
      .single();

    if (subscriptionError) {
      console.error("Subscription not found:", subscriptionError);
      return;
    }

    console.log("Found subscription:", subscription);

    // Create a payment transaction record
    console.log("Creating payment transaction record...");
    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: subscription.user_id,
        subscription_id: subscription.id,
        amount: resource.amount ? resource.amount.total : 0,
        currency: resource.amount ? resource.amount.currency : "USD",
        status: webhookData.event_type === "PAYMENT.SALE.COMPLETED" ? "completed" : 
               webhookData.event_type === "PAYMENT.SALE.DENIED" ? "failed" : 
               webhookData.event_type === "PAYMENT.SALE.REFUNDED" ? "refunded" : "pending",
        provider: "paypal",
        provider_transaction_id: resource.id,
        provider_subscription_id: resource.billing_agreement_id,
        transaction_type: "subscription",
        metadata: {
          webhook_event_id: webhookEventId,
          payment_mode: webhookData.event_type,
          resource_type: webhookData.resource_type,
        }
      })
      .select("id")
      .single();

    if (transactionError) {
      console.error("Error creating payment transaction:", transactionError);
      return;
    }

    console.log("Payment transaction created:", transaction);

    // Update the subscription last payment date
    if (webhookData.event_type === "PAYMENT.SALE.COMPLETED") {
      console.log("Updating subscription payment date and status...");
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          last_payment_date: new Date().toISOString(),
          status: "active"
        })
        .eq("id", subscription.id);
        
      if (updateError) {
        console.error("Error updating subscription payment date:", updateError);
      } else {
        console.log("Subscription payment date updated successfully");
      }
    }
  } catch (error) {
    console.error("Error processing payment event:", error);
    throw error;
  }
}

async function processSubscriptionEvent(supabase, webhookData, webhookEventId) {
  try {
    console.log("Processing subscription event:", webhookData.event_type);
    const resource = webhookData.resource;
    console.log("Subscription resource:", resource);
    
    if (!resource || !resource.id) {
      console.error("Missing id in subscription resource");
      return;
    }
    
    // Find the user by PayPal subscription ID
    console.log("Finding subscription for PayPal ID:", resource.id);
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("id, user_id")
      .eq("paypal_subscription_id", resource.id)
      .single();

    // If subscription not found, this might be a new subscription
    if (subscriptionError) {
      console.log("Subscription not found, might be new:", resource.id);
      return;
    }

    console.log("Found subscription:", subscription);

    // Update subscription status based on the event type
    let newStatus = subscription.status;
    
    if (webhookData.event_type === "BILLING.SUBSCRIPTION.CREATED") {
      newStatus = "pending";
    } else if (webhookData.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      newStatus = "active";
    } else if (webhookData.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      newStatus = "cancelled";
    } else if (webhookData.event_type === "BILLING.SUBSCRIPTION.SUSPENDED") {
      newStatus = "suspended";
    } else if (webhookData.event_type === "BILLING.SUBSCRIPTION.EXPIRED") {
      newStatus = "expired";
    }

    // Update subscription status
    console.log("Updating subscription status to:", newStatus);
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Error updating subscription status:", updateError);
    } else {
      console.log(`Updated subscription ${subscription.id} status to ${newStatus}`);
    }
  } catch (error) {
    console.error("Error processing subscription event:", error);
    throw error;
  }
}
