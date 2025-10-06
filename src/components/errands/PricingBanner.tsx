import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SubscriptionPlans } from './SubscriptionPlans';
import { WhatsAppButton } from './WhatsAppButton';
import { PayPalDepositButton } from './PayPalDepositButton';

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
      {/* On-Demand Pricing */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-lg">
        <CardContent className="mobile-padding-responsive">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
            🚗 On-Demand Pricing (Pay Per Use)
          </h2>
          <p className="text-center text-muted-foreground mb-6 sm:mb-8">
            Perfect for one-off needs • No commitment • Just pay when you need help
          </p>
          
          {/* Base Fee */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 border-2 border-primary/30 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">TT$50</div>
              <div className="text-lg font-semibold text-foreground mb-4">Base Fee (Every Errand)</div>
              <p className="text-sm text-muted-foreground">Covers coordination, confirmation, and basic service time</p>
            </div>
          </div>

          {/* Distance/Complexity Add-Ons */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-foreground text-center text-lg">+ Distance / Complexity Add-Ons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">+TT$50–80</div>
                  <div className="text-sm font-medium text-foreground mb-2">Quick Local Runs</div>
                  <p className="text-xs text-muted-foreground">Within 5km • Under 30 mins</p>
                </div>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">+TT$100–120</div>
                  <div className="text-sm font-medium text-foreground mb-2">City Runs</div>
                  <p className="text-xs text-muted-foreground">Bill payments • Pharmacy • 30–60 mins</p>
                </div>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">+TT$150+</div>
                  <div className="text-sm font-medium text-foreground mb-2">Big Hauls</div>
                  <p className="text-xs text-muted-foreground">PriceSmart • Groceries • 1+ hour</p>
                </div>
              </div>
            </div>
          </div>

          {/* Common Examples */}
          <div className="bg-card/60 rounded-lg p-4 border border-border/30">
            <h4 className="font-semibold text-foreground mb-3 text-center">Common Examples:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pricingItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground block text-sm">{item.service}</span>
                    <span className="text-primary font-bold text-sm">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call-to-Action Section */}
          <div className="mt-8 pt-6 border-t-2 border-primary/20">
            <h4 className="font-semibold text-foreground mb-4 text-center text-lg">
              🚀 Ready to Book Your Errand?
            </h4>
            <p className="text-center text-muted-foreground mb-6">
              Message us on WhatsApp or secure your slot with a TT$100 deposit
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <WhatsAppButton quickRequest={true} />
              <PayPalDepositButton />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Final price confirmed via WhatsApp after we discuss your specific needs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* On-Demand vs Subscription Comparison */}
      <Card className="border-2 border-primary/20">
        <CardContent className="mobile-padding-responsive">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 text-center">
            💡 When Should You Choose a Monthly Plan?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card/60 rounded-lg p-5 border border-border/50">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <span className="text-2xl mr-2">🚗</span> On-Demand (Pay Per Use)
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">✅ Perfect if you need help once or twice</p>
                <p className="text-muted-foreground">✅ No commitment, pay only when used</p>
                <p className="text-muted-foreground">✅ Great for urgent "period week" or sick days</p>
                <p className="text-destructive font-medium mt-4">⚠️ Can get expensive if used 3+ times/month</p>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-5 border-2 border-primary/30">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <span className="text-2xl mr-2">📅</span> Monthly Plans
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">✅ Save up to 40% vs on-demand pricing</p>
                <p className="text-muted-foreground">✅ Budget-friendly for regular needs (2–4x/month)</p>
                <p className="text-muted-foreground">✅ Priority scheduling + rollover unused hours</p>
                <p className="text-primary font-medium mt-4">💙 Best for working parents & caregivers</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center bg-primary/10 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground">
              💡 <strong>Trini Tip:</strong> If you'd use on-demand 3+ times/month, a subscription saves you money!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <SubscriptionPlans />
    </div>
  );
};