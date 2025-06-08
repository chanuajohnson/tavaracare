
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

interface PayPalPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitDetails: {
    date: string;
    time: string;
    type: 'in_person';
  };
  onPaymentComplete: () => void;
}

export const PayPalPaymentModal: React.FC<PayPalPaymentModalProps> = ({
  open,
  onOpenChange,
  visitDetails,
  onPaymentComplete
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // Create PayPal payment
      const { data, error } = await supabase.functions.invoke('paypal-create-visit-payment', {
        body: {
          visitType: visitDetails.type,
          visitDate: visitDetails.date,
          visitTime: visitDetails.time
        }
      });

      if (error) throw error;

      // Redirect to PayPal for payment
      if (data.approvalUrl) {
        window.open(data.approvalUrl, '_blank');
        
        // Poll for payment completion (simplified approach)
        const pollForCompletion = setInterval(async () => {
          try {
            const { data: completionData, error: completionError } = await supabase.functions.invoke('paypal-complete-visit-payment', {
              body: {
                orderId: data.orderId,
                visitDate: visitDetails.date,
                visitTime: visitDetails.time,
                visitType: visitDetails.type
              }
            });

            if (completionData?.success) {
              clearInterval(pollForCompletion);
              setPaymentCompleted(true);
              toast.success("Payment completed successfully! Your visit has been scheduled.");
              setTimeout(() => {
                onPaymentComplete();
                onOpenChange(false);
              }, 2000);
            }
          } catch (error) {
            // Continue polling - user might still be completing payment
          }
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollForCompletion);
          if (!paymentCompleted) {
            toast.error("Payment timeout. Please try again.");
            setIsProcessing(false);
          }
        }, 300000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to create payment. Please try again.");
      setIsProcessing(false);
    }
  };

  if (paymentCompleted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              Your in-person visit has been scheduled and paid for. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Visit Details:</h4>
              <div className="text-sm text-green-800">
                <p><strong>Date:</strong> {new Date(visitDetails.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {visitDetails.time}</p>
                <p><strong>Type:</strong> In-Person Home Visit</p>
                <p><strong>Amount Paid:</strong> $300 TTD</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Required
          </DialogTitle>
          <DialogDescription>
            Complete payment to schedule your in-person visit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visit Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Visit Summary:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Date:</strong> {new Date(visitDetails.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {visitDetails.time}</p>
              <p><strong>Type:</strong> In-Person Home Visit</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Payment Details:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Amount:</strong> $300 TTD</p>
              <p><strong>Payment Method:</strong> PayPal</p>
              <p><strong>Description:</strong> In-person care consultation and assessment</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important:</p>
                <p>Payment is required to confirm your in-person visit. You'll be redirected to PayPal to complete the payment securely.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay with PayPal
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
