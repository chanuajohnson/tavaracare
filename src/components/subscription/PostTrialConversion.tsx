
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, ArrowRight, Heart, Clock } from "lucide-react";
import { UnifiedPaymentFlow } from './UnifiedPaymentFlow';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

interface PostTrialConversionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialPaymentId?: string;
  trialCreditAmount?: number;
}

export const PostTrialConversion: React.FC<PostTrialConversionProps> = ({
  open,
  onOpenChange,
  trialPaymentId,
  trialCreditAmount = 0
}) => {
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: string;
    originalPrice: number;
    discountedPrice: number;
  } | null>(null);

  const familyPlans = [
    {
      id: 'family-care',
      name: 'Family Care',
      originalPrice: 14.99,
      features: ['Basic care coordination', 'Medication tracking', 'Family portal access']
    },
    {
      id: 'family-premium',
      name: 'Family Premium', 
      originalPrice: 29.99,
      features: ['Everything in Care', 'Advanced scheduling', 'Priority support', '24/7 emergency line']
    }
  ];

  const handlePlanSelection = (plan: typeof familyPlans[0]) => {
    const discountedPrice = Math.max(0, plan.originalPrice - trialCreditAmount);
    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      price: `$${discountedPrice.toFixed(2)}`,
      originalPrice: plan.originalPrice,
      discountedPrice
    });
    setShowPayment(true);
  };

  const handleSubscriptionSuccess = async (subscriptionId: string) => {
    // Mark trial credit as used
    if (user && trialPaymentId) {
      await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          trial_credit_used: true,
          subscription_id: subscriptionId
        })
        .eq('user_id', user.id)
        .eq('status', 'trial_credit');
    }
    
    onOpenChange(false);
  };

  if (showPayment && selectedPlan) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
          </DialogHeader>
          <UnifiedPaymentFlow
            paymentType="subscription"
            planId={selectedPlan.id}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            onSubscriptionSuccess={handleSubscriptionSuccess}
            onCancel={() => setShowPayment(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            How was your trial day?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trial Credit Display */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">Your Trial Credit</h3>
                  <p className="text-sm text-green-700">
                    ${trialCreditAmount.toFixed(2)} USD credit ready to apply!
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Star className="h-3 w-3 mr-1" />
                  Applied
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Continue with Subscription */}
          <div className="space-y-4">
            <h3 className="font-medium">Ready to continue? Choose your plan:</h3>
            
            {familyPlans.map((plan) => {
              const discountedPrice = Math.max(0, plan.originalPrice - trialCreditAmount);
              const savings = plan.originalPrice - discountedPrice;
              
              return (
                <Card 
                  key={plan.id}
                  className="cursor-pointer hover:border-primary transition-all"
                  onClick={() => handlePlanSelection(plan)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <div className="text-right">
                        {savings > 0 && (
                          <div className="text-sm text-gray-500 line-through">
                            ${plan.originalPrice}/month
                          </div>
                        )}
                        <div className="font-bold text-primary">
                          ${discountedPrice.toFixed(2)}/month
                        </div>
                        {savings > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Save ${savings.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Not Ready Yet */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-800 mb-1">Need more time?</h4>
              <p className="text-sm text-gray-600 mb-3">
                No pressure! Your credit will remain available for 30 days.
              </p>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                I'll decide later
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
