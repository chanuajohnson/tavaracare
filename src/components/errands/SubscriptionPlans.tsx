import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, MessageCircle, CreditCard } from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';
import { PayPalSubscribeButton } from '@/components/subscription/PayPalSubscribeButton';
import { PAYPAL_PLAN_IDS_USD, PLAN_PRICES_USD } from '@/constants/paypalPlans';
import { formatUsdWithTtd, formatTtdEstimate } from '@/utils/currency';

export const SubscriptionPlans: React.FC = () => {
  const { trackEngagement } = useTracking();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const plans = [
    {
      id: 'basic',
      paypalPlanId: PAYPAL_PLAN_IDS_USD.basic,
      name: 'Basic',
      monthlyPriceUsd: PLAN_PRICES_USD.basic,
      monthlyPrice: formatUsdWithTtd(PLAN_PRICES_USD.basic),
      monthlyPriceTtd: formatTtdEstimate(PLAN_PRICES_USD.basic),
      features: [
        '2 errands per month',
        '4 hours companion care',
        'WhatsApp support',
        'Basic scheduling',
        'Rollover unused hours'
      ],
      savingsVsOnDemand: 'TT$100+',
      onDemandEquivalent: '≈ TT$200–300 on-demand',
      popular: false
    },
    {
      id: 'standard',
      paypalPlanId: PAYPAL_PLAN_IDS_USD.standard,
      name: 'Standard',
      monthlyPriceUsd: PLAN_PRICES_USD.standard,
      monthlyPrice: formatUsdWithTtd(PLAN_PRICES_USD.standard),
      monthlyPriceTtd: formatTtdEstimate(PLAN_PRICES_USD.standard),
      features: [
        '4 errands per month',
        '8 hours care services',
        '1 vehicle service',
        'Priority scheduling',
        'Email & WhatsApp support',
        'Rollover unused hours'
      ],
      savingsVsOnDemand: 'TT$300+',
      onDemandEquivalent: '≈ TT$500–700 on-demand',
      popular: true
    },
    {
      id: 'premium',
      paypalPlanId: PAYPAL_PLAN_IDS_USD.premium,
      name: 'Premium',
      monthlyPriceUsd: PLAN_PRICES_USD.premium,
      monthlyPrice: formatUsdWithTtd(PLAN_PRICES_USD.premium),
      monthlyPriceTtd: formatTtdEstimate(PLAN_PRICES_USD.premium),
      features: [
        'Unlimited errands',
        '20 hours care services',
        '2 vehicle services',
        '24/7 priority support',
        'Dedicated care coordinator',
        'Emergency response'
      ],
      savingsVsOnDemand: 'TT$600+',
      onDemandEquivalent: '≈ TT$1000+ on-demand',
      popular: false
    }
  ];

  const handlePlanClick = (plan: any) => {
    trackEngagement('subscription_plan_click', {
      plan: plan.id,
      planName: plan.name,
      source: 'errands_page'
    });
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handleWhatsAppContact = (plan: any) => {
    const message = `Hi Tavara! I'm interested in the ${plan.name} subscription plan (${plan.monthlyPrice}/month). Could you help me get started and answer any questions I have about the services included?`;
    const whatsappUrl = `https://wa.me/+18681234567?text=${encodeURIComponent(message)}`;
    
    trackEngagement('subscription_whatsapp_click', {
      plan: plan.id,
      planName: plan.name
    });
    
    window.open(whatsappUrl, '_blank');
    setShowPlanModal(false);
  };

  return (
    <div className="w-full py-8 sm:py-12 md:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
          💰 Save with Monthly Plans
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground px-4 mb-2">
          Use errands 2+ times per month? Lock in lower rates and skip the on-demand fees.
        </p>
        <p className="text-sm text-primary font-semibold px-4">
          Save up to 40% vs paying on-demand every time
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {plans.map((plan, index) => (
          <Card 
            key={index}
            className={`relative h-full ${
              plan.popular 
                ? 'border-primary bg-primary/5 scale-105 shadow-lg' 
                : 'border-border hover:border-primary/50 transition-colors'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center mobile-padding-responsive">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                {plan.name}
              </CardTitle>
              
              <div className="space-y-2 mt-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {plan.monthlyPrice}
                </div>
                <div className="text-sm text-muted-foreground">
                  per month • Billed in USD
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="mobile-padding-responsive">
              <ul className="space-y-3 mb-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Savings Highlight */}
              <div className="bg-primary/10 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground text-center mb-1">Monthly Savings:</p>
                <p className="text-sm font-bold text-primary text-center">{plan.savingsVsOnDemand} saved</p>
                <p className="text-xs text-muted-foreground text-center italic">{plan.onDemandEquivalent}</p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full mobile-button-responsive ${
                    plan.popular ? 'bg-primary hover:bg-primary/90' : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Start {plan.name} Plan
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  No setup fee • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Selection Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Get Started with {selectedPlan?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {selectedPlan?.monthlyPrice}
              </div>
              <div className="text-sm text-muted-foreground">
                per month • Billed in USD
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => handleWhatsAppContact(selectedPlan)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with us on WhatsApp
              </Button>
              
              <PayPalSubscribeButton
                planId={selectedPlan?.paypalPlanId || selectedPlan?.id || ''}
                planName={selectedPlan?.name || ''}
                price={selectedPlan?.monthlyPrice || ''}
                returnUrl={`${window.location.origin}/subscription/success`}
                cancelUrl={`${window.location.origin}/subscription/cancel`}
                paymentType="subscription"
                isComingSoon={false}
                onSuccess={() => {
                  setShowPlanModal(false);
                  // Handle successful subscription
                }}
                onError={(error) => {
                  console.error('Subscription error:', error);
                  // Handle subscription error - fallback to WhatsApp
                  handleWhatsAppContact(selectedPlan);
                }}
              />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Prefer to talk first? Use WhatsApp to discuss your needs and get personalized recommendations.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};