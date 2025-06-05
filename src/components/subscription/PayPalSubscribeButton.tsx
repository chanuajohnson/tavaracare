
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { usePayPalSubscription } from '@/hooks/usePayPalSubscription';
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
  const [{ isPending }] = usePayPalScriptReducer();
  const { createSubscription, completeSubscription, isLoading } = usePayPalSubscription();
  const [showPayPal, setShowPayPal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();
  
  // Default URLs if not provided
  const defaultReturnUrl = window.location.origin + '/subscription/success';
  const defaultCancelUrl = window.location.origin + '/subscription/cancel';
  
  const handleShowPayPal = () => {
    setShowPayPal(true);
  };
  
  const handleCreateSubscription = async () => {
    try {
      setProcessingPayment(true);
      console.log(`Creating ${paymentType} for plan: ${planId} (${planName})`);
      
      if (paymentType === 'subscription') {
        const result = await createSubscription({
          planId,
          returnUrl: returnUrl || defaultReturnUrl,
          cancelUrl: cancelUrl || defaultCancelUrl,
        });
        
        if (!result) {
          console.error("No result from createSubscription");
          throw new Error("Failed to initiate subscription");
        }
        
        console.log("Subscription creation result:", result);
        
        if (result.approval_url) {
          console.log("Redirecting to PayPal approval URL:", result.approval_url);
          window.location.href = result.approval_url;
          return result.subscription_id;
        } else {
          console.error("No approval URL in response", result);
          throw new Error("Missing PayPal approval URL");
        }
      } else {
        // For trial_day and one_time payments, return a mock order ID
        // In a real implementation, you'd call PayPal's Orders API
        const mockOrderId = `ORDER_${Date.now()}`;
        console.log("Mock one-time payment order created:", mockOrderId);
        return mockOrderId;
      }
    } catch (error) {
      console.error(`Error creating ${paymentType}:`, error);
      
      toast.error(`${paymentType === 'subscription' ? 'Subscription' : 'Payment'} Error`, {
        description: error instanceof Error 
          ? error.message 
          : `An unknown error occurred while creating your ${paymentType}`
      });
      
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
      return null;
    } finally {
      setProcessingPayment(false);
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
        
        const subscription = await completeSubscription({
          subscriptionId: data.subscriptionID
        });
        
        if (!subscription) {
          throw new Error("Failed to complete subscription");
        }
        
        console.log("Subscription completed:", subscription);
        
        if (onSuccess) {
          onSuccess(subscription.id);
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
  
  if (isPending || isLoading) {
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
          createOrder={paymentType === 'subscription' ? undefined : handleCreateSubscription}
          createSubscription={paymentType === 'subscription' ? handleCreateSubscription : undefined}
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
  
  const buttonText = paymentType === 'subscription' 
    ? 'Subscribe with PayPal' 
    : `Pay $${price.replace('$', '').replace(' TTD', '')} TTD with PayPal`;
  
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
        buttonText
      )}
    </Button>
  );
}
