
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Heart, Star, X, Calculator } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PayPalSubscribeButton } from "@/components/subscription/PayPalSubscribeButton";

interface PostTrialConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialAmount?: number;
}

export const PostTrialConversionModal: React.FC<PostTrialConversionModalProps> = ({
  open,
  onOpenChange,
  trialAmount = 320
}) => {
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState<'direct_hire' | 'tavara_subscribed' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDirectHireSelection = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // Update profile with direct hire choice and apply trial credit
      const { error } = await supabase
        .from('profiles')
        .update({
          visit_notes: JSON.stringify({
            care_model: 'direct_hire',
            trial_completed: true,
            trial_credit_amount: trialAmount,
            trial_credit_available: true,
            conversion_date: new Date().toISOString()
          })
        })
        .eq('id', user.id);

      if (error) throw error;

      // Track the conversion choice
      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: 'direct_hire_selected',
          feature_name: 'post_trial_conversion',
          additional_data: { 
            trial_credit_amount: trialAmount,
            conversion_path: 'trial_to_direct_hire'
          }
        });

      toast.success("Direct Hire Model Selected", {
        description: `You have $${trialAmount} TTD credit available for future bookings!`
      });

      onOpenChange(false);
      
    } catch (error) {
      console.error('Error selecting direct hire:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscriptionSuccess = async (subscriptionId: string) => {
    if (!user) return;
    
    try {
      // First update profile with subscription status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          visit_notes: JSON.stringify({
            care_model: 'tavara_subscribed',
            trial_completed: true,
            subscription_active: true,
            trial_credit_applied: true,
            conversion_date: new Date().toISOString(),
            paypal_subscription_id: subscriptionId
          })
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Track the conversion
      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: 'subscription_converted',
          feature_name: 'post_trial_conversion',
          additional_data: { 
            trial_credit_amount: trialAmount,
            subscription_id: subscriptionId,
            conversion_path: 'trial_to_subscription'
          }
        });

      toast.success("Welcome to Tavara Care Village!", {
        description: `Your trial credit of $${trialAmount} TTD has been applied to your subscription.`
      });

      onOpenChange(false);
      
    } catch (error) {
      console.error('Error processing subscription conversion:', error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              🎉 Choose Your Care Journey
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Trial Credit Available!</h3>
              </div>
              <p className="text-green-700">
                You have <strong>${trialAmount} TTD</strong> credit from your trial. Choose how you'd like to continue your care journey:
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Direct Hire Option */}
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Users className="h-5 w-5" />
                  Direct Hire Model
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Hire your caregiver directly and manage everything yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-blue-600">$40/hour</div>
                  <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Calculator className="h-4 w-4" />
                    ${trialAmount} TTD Credit Available
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">What You Get:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Direct relationship with caregiver</li>
                      <li>• Lower hourly rate</li>
                      <li>• Basic Tavara tools access</li>
                      <li>• Flexible arrangements</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">You Handle:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Scheduling coordination</li>
                      <li>• Payroll management</li>
                      <li>• Administrative tasks</li>
                      <li>• Backup coverage</li>
                    </ul>
                  </div>
                </div>

                <Button 
                  onClick={handleDirectHireSelection}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? 'Processing...' : 'Choose Direct Hire'}
                </Button>
              </CardContent>
            </Card>

            {/* Tavara Subscription Option */}
            <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors relative">
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Recommended
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Heart className="h-5 w-5" />
                  Tavara Care Village
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Full-service care management - we handle everything so you can focus on family
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-purple-600">$45/hour</div>
                  <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Star className="h-4 w-4" />
                    First Month: ${trialAmount} TTD Credit Applied
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Full Service Includes:</h4>
                    <ul className="space-y-1 text-purple-700">
                      <li>• Complete care dashboard</li>
                      <li>• Medication management</li>
                      <li>• Meal planning tools</li>
                      <li>• Emergency coordination</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">We Handle:</h4>
                    <ul className="space-y-1 text-purple-700">
                      <li>• All payroll & admin</li>
                      <li>• Backup coverage</li>
                      <li>• 24/7 coordinator support</li>
                      <li>• Quality assurance</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-1">Credit Calculation:</h4>
                  <div className="text-sm text-purple-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Trial Credit:</span>
                      <span>-${trialAmount} TTD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effective First Month Rate:</span>
                      <span className="font-semibold">Significantly Reduced</span>
                    </div>
                  </div>
                </div>

                <PayPalSubscribeButton
                  planId="tavara_care_village"
                  planName="Tavara Care Village"
                  price="$45/hour"
                  onSuccess={handleSubscriptionSuccess}
                  className="w-full"
                  isComingSoon={false}
                  paymentType="subscription"
                />
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Need more time to decide? You can always upgrade later.</p>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-2">
              I'll Decide Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
