import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SubscriptionPlans } from './SubscriptionPlans';

export const PricingBanner: React.FC = () => {
  const pricingItems = [
    { service: 'Errands & runs', price: 'TT$100–$150 + cost of items', icon: '🏃' },
    { service: 'Child care / companion', price: 'TT$50–$80 / hr', icon: '👶' },
    { service: 'Vehicle pick-up/service', price: 'from TT$200', icon: '🚗' },
    { service: 'Meds & supplies', price: 'TT$80–$120 + cost', icon: '💊' },
    { service: 'Bill payments / gov runs', price: 'from TT$100', icon: '🧾' },
  ];

  return (
    <div className="w-full space-y-8 sm:space-y-12 md:space-y-16">
      {/* One-time Services */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-lg">
        <CardContent className="mobile-padding-responsive">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            💰 One-Time Service Pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pricingItems.map((item, index) => (
              <div key={index} className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground block mb-1 text-sm sm:text-base">{item.service}</span>
                    <span className="text-primary font-bold text-sm sm:text-base">{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              All prices in Trinidad & Tobago Dollars (TTD) • TT$100 deposit required to secure booking
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <SubscriptionPlans />
    </div>
  );
};