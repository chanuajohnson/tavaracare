
import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useTracking } from './useTracking';

interface CreateSubscriptionParams {
  planId: string;
  returnUrl: string;
  cancelUrl: string;
}

interface CompleteSubscriptionParams {
  subscriptionId: string;
}

export function usePayPalSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user } = useAuth();
  const { trackEngagement } = useTracking();

  /**
   * Create a new PayPal subscription
   */
  const createSubscription = async ({ planId, returnUrl, cancelUrl }: CreateSubscriptionParams) => {
    if (!user?.id) {
      toast.error("Authentication Required", {
        description: "You must be logged in to subscribe"
      });
      return null;
    }

    try {
      setIsLoading(true);
      console.log(`Creating PayPal subscription for plan ${planId}`);

      // Track subscription initiation
      await trackEngagement('subscription_initiated', {
        plan_id: planId,
        payment_method: 'paypal',
      });

      // Call our edge function to create the subscription
      console.log("Calling paypal-create-subscription edge function...");
      console.log("Request payload:", { planId, userId: user.id, returnUrl, cancelUrl });
      
      const { data, error } = await supabase.functions.invoke('paypal-create-subscription', {
        body: {
          planId,
          userId: user.id,
          returnUrl,
          cancelUrl,
        },
      });

      if (error) {
        console.error('Error creating PayPal subscription:', error);
        throw new Error(`Failed to create subscription: ${error.message || "Unknown error"}`);
      }

      console.log("Subscription creation response:", data);
      
      if (!data || !data.subscription_id) {
        console.error("Invalid response from subscription creation:", data);
        throw new Error("Invalid response from subscription service");
      }

      // Track successful creation (but not completion yet)
      await trackEngagement('subscription_created', {
        subscription_id: data.subscription_id,
        paypal_subscription_id: data.paypal_subscription_id,
        plan_id: planId,
      });

      return data;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete a PayPal subscription after user approval
   */
  const completeSubscription = async ({ subscriptionId }: CompleteSubscriptionParams) => {
    if (!user?.id) {
      toast.error("Authentication Required", {
        description: "You must be logged in to complete subscription"
      });
      return null;
    }

    try {
      setIsCompleting(true);
      console.log(`Completing PayPal subscription ${subscriptionId}`);

      // Call our edge function to complete the subscription
      console.log("Calling paypal-complete-subscription edge function...");
      const { data, error } = await supabase.functions.invoke('paypal-complete-subscription', {
        body: {
          subscription_id: subscriptionId,
        },
      });

      if (error) {
        console.error('Error completing PayPal subscription:', error);
        throw new Error(`Failed to complete subscription: ${error.message || "Unknown error"}`);
      }

      console.log("Subscription completion response:", data);
      
      if (!data || !data.subscription) {
        console.error("Invalid response from subscription completion:", data);
        throw new Error("Invalid response from subscription service");
      }

      // Track successful completion
      await trackEngagement('subscription_completed', {
        subscription_id: subscriptionId,
        status: data.subscription.status,
        plan_id: data.subscription.plan_id,
        payment_method: 'paypal',
      });

      toast.success("Subscription Active", {
        description: "Your subscription has been activated successfully!"
      });

      return data.subscription;
    } catch (error) {
      console.error('Error in completeSubscription:', error);
      throw error;
    } finally {
      setIsCompleting(false);
    }
  };

  /**
   * Get user's current subscription details
   */
  const getUserSubscription = async () => {
    if (!user?.id) return null;

    try {
      console.log("Fetching user subscription for user", user.id);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          plan_id,
          start_date,
          end_date,
          paypal_subscription_id,
          payment_method,
          subscription_plans (
            name,
            price,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching subscription:', error);
        return null;
      }

      console.log("User subscription data:", data);
      return data || null;
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  };

  /**
   * Cancel a subscription
   */
  const cancelSubscription = async (subscriptionId: string) => {
    if (!user?.id) {
      toast.error("Authentication Required", {
        description: "You must be logged in to cancel a subscription"
      });
      return false;
    }

    try {
      setIsLoading(true);
      console.log(`Cancelling subscription ${subscriptionId}`);

      // This should be implemented with a dedicated edge function
      // For now, just update the local status
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error cancelling subscription:', error);
        toast.error("Cancellation Failed", {
          description: "Failed to cancel your subscription. Please try again."
        });
        return false;
      }

      // Track cancellation
      await trackEngagement('subscription_cancelled', {
        subscription_id: subscriptionId,
        user_id: user.id,
      });

      toast.success("Subscription Cancelled", {
        description: "Your subscription has been cancelled successfully."
      });

      return true;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      toast.error("Cancellation Error", {
        description: "An unexpected error occurred. Please try again later."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSubscription,
    completeSubscription,
    getUserSubscription,
    cancelSubscription,
    isLoading,
    isCompleting,
  };
}
