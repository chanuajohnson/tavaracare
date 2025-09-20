import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export const SubscriptionPlans: React.FC = () => {
  const plans = [
    {
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
    </div>
  );
};