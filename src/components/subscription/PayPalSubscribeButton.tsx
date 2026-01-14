import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PayPalSubscribeButtonProps {
  planId: string;
  planName: string;
  price: string;
  returnUrl?: string;
  cancelUrl?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
  isComingSoon?: boolean;
  paymentType?: 'subscription' | 'trial_day' | 'one_time';
}

export function PayPalSubscribeButton({
  planId,
  planName,
  price,
  returnUrl,
  cancelUrl,
  variant = "default",
  className = "",
  onSuccess,
  onError,
  isComingSoon = true,
  paymentType = 'subscription'
}: PayPalSubscribeButtonProps) {
  const [showPayPal, setShowPayPal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();
  
  // Check if PayPal is available (env var set)
  const hasPayPalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  
  // Only use PayPal hooks if client ID exists
  let isPending = false;
  try {
    if (hasPayPalClientId) {
      const [{ isPending: scriptPending }] = usePayPalScriptReducer();
      isPending = scriptPending;
    }
  } catch (error) {
    // Fail silently if hook can't be used
    console.warn("PayPal script reducer unavailable");
  }
  
  // Default URLs if not provided
  const defaultReturnUrl = window.location.origin + '/subscription/success';
  const defaultCancelUrl = window.location.origin + '/subscription/cancel';
  
  const handleShowPayPal = () => {
    setShowPayPal(true);
  };
  
  const handleCreateSubscription = async (data: any, actions: any) => {
    try {
      console.log(`Creating subscription for plan: ${planId} (${planName})`);
      
      // Create subscription with USD plan
      return actions.subscription.create({
        plan_id: planId
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      
      toast.error('Subscription Error', {
        description: error instanceof Error 
          ? error.message 
          : 'An unknown error occurred while creating your subscription'
      });
      
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  };

  const handleApprove = async (data: any) => {
    try {
      console.log("PayPal payment approved:", data);
      setProcessingPayment(true);
      
      if (paymentType === 'subscription') {
        if (!data.subscriptionID) {
          throw new Error("No subscription ID received from PayPal");
        }
        
        console.log("Subscription approved:", data.subscriptionID);
        
        if (onSuccess) {
          onSuccess(data.subscriptionID);
        }
        
        toast.success("Subscription Activated", {
          description: `Your ${planName} subscription has been activated successfully!`
        });
        
        navigate('/subscription/success', {
          state: { 
            subscriptionId: data.subscriptionID,
            planName
          }
        });
      } else {
        // Handle one-time payments (trial_day, etc.)
        const orderId = data.orderID || data.subscriptionID;
        
        if (!orderId) {
          throw new Error("No order ID received from PayPal");
        }
        
        console.log("One-time payment completed:", orderId);
        
        if (onSuccess) {
          onSuccess(orderId);
        }
        
        toast.success("Payment Completed", {
          description: `Your ${planName} payment has been processed successfully!`
        });
      }
    } catch (error) {
      console.error(`Error completing ${paymentType}:`, error);
      
      toast.error(`${paymentType === 'subscription' ? 'Subscription' : 'Payment'} Error`, {
        description: error instanceof Error 
          ? error.message 
          : `An unknown error occurred while activating your ${paymentType}`
      });
      
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
      
      navigate('/subscription/cancel', {
        state: { 
          error: error instanceof Error ? error.message : "Unknown error",
          planName
        }
      });
    } finally {
      setProcessingPayment(false);
    }
  };
  
  if (isPending) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading PayPal...
      </Button>
    );
  }
  
  if (processingPayment) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }
  
  // Display disabled button if PayPal is not configured
  if (!hasPayPalClientId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={variant} 
              className={`${className} opacity-90`}
              disabled
            >
              <Clock className="mr-2 h-4 w-4" />
              PayPal Unavailable
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>PayPal integration is not configured in this environment</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Display Coming Soon button if isComingSoon is true (only for subscriptions)
  if (isComingSoon && paymentType === 'subscription') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={variant} 
              className={`${className} opacity-90`}
              disabled
            >
              <Clock className="mr-2 h-4 w-4" />
              Coming Soon
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>PayPal subscriptions are launching soon!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (showPayPal) {
    return (
      <div className={`w-full ${className}`}>
        <Button 
          variant="outline" 
          size="sm"
          className="mb-2 w-full"
          onClick={() => setShowPayPal(false)}
        >
          Cancel
        </Button>
        <PayPalButtons
          style={{ layout: "vertical", tagline: false }}
          createSubscription={handleCreateSubscription}
          onApprove={handleApprove}
          onError={(err) => {
            console.error("PayPal Error:", err);
            if (onError) {
              const errorMessage = typeof err === 'object' && err !== null && 'message' in err 
                ? String(err.message) 
                : `PayPal ${paymentType} error`;
              onError(new Error(errorMessage));
            }
            
            toast.error("PayPal Error", {
              description: typeof err === 'object' && err !== null && 'message' in err 
                ? String(err.message) 
                : 'An error occurred with PayPal. Please try again.'
            });
          }}
          onCancel={() => {
            console.log(`PayPal ${paymentType} cancelled by user`);
            setShowPayPal(false);
            
            navigate('/subscription/cancel', {
              state: { 
                cancelled: true,
                planName
              }
            });
          }}
        />
      </div>
    );
  }
  
  return (
    <Button 
      onClick={handleShowPayPal} 
      variant={variant} 
      className={className}
      disabled={processingPayment}
    >
      {processingPayment ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Subscribe with PayPal'
      )}
    </Button>
  );
}
