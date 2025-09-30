import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, MessageCircle, CreditCard } from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';
import { PayPalSubscribeButton } from '@/components/subscription/PayPalSubscribeButton';

export const SubscriptionPlans: React.FC = () => {
  const { trackEngagement } = useTracking();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const plans = [
    {
      id: 'basic',
      paypalPlanId: 'P-9PB85015TF740164FNDLNDWY',
      name: 'Basic',
      monthlyPrice: 'TT$299',
      quarterlyPrice: 'TT$799',
      yearlyPrice: 'TT$2,999',
      features: [
        '2 errands per month',
        '4 hours companion care',
        'WhatsApp support',
        'Basic scheduling'
      ],
      popular: false
    },
    {
      id: 'standard',
      paypalPlanId: 'P-0R5579286P619693SNDLNEOI',
      name: 'Standard',
      monthlyPrice: 'TT$599',
      quarterlyPrice: 'TT$1,599',
      yearlyPrice: 'TT$5,999',
      features: [
        '4 errands per month',
        '8 hours care services',
        '1 vehicle service',
        'Priority scheduling',
        'Email & WhatsApp support'
      ],
      popular: true
    },
    {
      id: 'premium',
      paypalPlanId: 'P-9HS61985N95652101NDLNE3Q',
      name: 'Premium',
      monthlyPrice: 'TT$999',
      quarterlyPrice: 'TT$2,699',
      yearlyPrice: 'TT$9,999',
      features: [
        'Unlimited errands',
        '20 hours care services',
        '2 vehicle services',
        '24/7 priority support',
        'Dedicated care coordinator',
        'Emergency response'
      ],
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
          Monthly Care Plans
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground px-4">
          Choose a plan that fits your family's needs. Save more with quarterly and yearly subscriptions.
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
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Quarterly: {plan.quarterlyPrice} <span className="text-green-600">(Save 10%)</span></div>
                  <div>Yearly: {plan.yearlyPrice} <span className="text-green-600">(Save 20%)</span></div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="mobile-padding-responsive">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
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
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Quarterly: {selectedPlan?.quarterlyPrice} <span className="text-green-600">(Save 10%)</span></div>
                <div>Yearly: {selectedPlan?.yearlyPrice} <span className="text-green-600">(Save 20%)</span></div>
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