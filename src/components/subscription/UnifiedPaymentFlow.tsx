
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PayPalSubscribeButton } from './PayPalSubscribeButton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CreditCard, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UnifiedPaymentFlowProps {
  paymentType: 'trial' | 'subscription';
  planId?: string;
  planName?: string;
  planPrice?: string;
  trialDate?: string;
  trialType?: 'video' | 'in-person';
  onTrialPaymentSuccess?: (transactionId: string) => void;
  onSubscriptionSuccess?: (subscriptionId: string) => void;
  onCancel?: () => void;
}

export const UnifiedPaymentFlow: React.FC<UnifiedPaymentFlowProps> = ({
  paymentType,
  planId,
  planName,
  planPrice,
  trialDate,
  trialType,
  onTrialPaymentSuccess,
  onSubscriptionSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const getTrialPrice = () => {
    if (trialType === 'video') return { ttd: '150', usd: '22.15' };
    return { ttd: '320', usd: '47.28' };
  };

  const trialPrice = getTrialPrice();

  const handleTrialPayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // Create trial payment record
      const { data: paymentData, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'trial_payment',
          amount: parseFloat(trialPrice.usd),
          currency: 'USD',
          status: 'completed',
          payment_method: 'paypal',
          metadata: {
            trial_type: trialType,
            trial_date: trialDate,
            ttd_amount: trialPrice.ttd
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Award trial credit for future subscription
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          status: 'trial_credit',
          trial_credit_amount: parseFloat(trialPrice.usd),
          metadata: {
            trial_payment_id: paymentData.id,
            trial_type: trialType,
            trial_date: trialDate
          }
        });

      toast.success(`Trial payment successful! ${trialPrice.ttd} TTD ($${trialPrice.usd} USD) credit applied for future subscription.`);
      
      if (onTrialPaymentSuccess) {
        onTrialPaymentSuccess(paymentData.id);
      }
    } catch (error) {
      console.error('Trial payment error:', error);
      toast.error('Trial payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentType === 'trial') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Calendar className="h-5 w-5 text-primary" />
            Confirm Your Trial Day
          </CardTitle>
          <CardDescription>
            Experience Tavara care with no long-term commitment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">Trial Type:</span>
              <Badge variant={trialType === 'video' ? 'secondary' : 'default'}>
                {trialType === 'video' ? 'Video Call' : 'In-Person Visit'}
              </Badge>
            </div>
            {trialDate && (
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-800">Date:</span>
                <span className="text-green-700">{new Date(trialDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium text-green-800">Trial Fee:</span>
              <div className="text-right">
                <div className="font-bold text-green-800">${trialPrice.ttd} TTD</div>
                <div className="text-xs text-green-600">(${trialPrice.usd} USD)</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Trial Credit</span>
            </div>
            <p className="text-sm text-blue-700">
              Your trial fee will be credited toward your first monthly subscription if you decide to continue!
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button 
              onClick={handleTrialPayment}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : `Pay ${trialPrice.ttd} TTD Trial Fee`}
            </Button>
            
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="w-full">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Subscription payment flow
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Subscribe to {planName}</CardTitle>
        <CardDescription>
          {planPrice}/month - Cancel anytime
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {planId && (
          <PayPalSubscribeButton
            planId={planId}
            planName={planName || ''}
            price={planPrice || ''}
            onSuccess={onSubscriptionSuccess}
            className="w-full"
            isComingSoon={false}
          />
        )}
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
