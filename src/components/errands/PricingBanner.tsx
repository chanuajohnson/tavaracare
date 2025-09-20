import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const PricingBanner: React.FC = () => {
  const pricingItems = [
    { service: 'Errands & runs', price: 'TT$100–$150 + cost of items' },
    { service: 'Child care / companion', price: 'TT$50–$80 / hr' },
    { service: 'Vehicle pick-up/service', price: 'from TT$200' },
    { service: 'Meds & supplies', price: 'TT$80–$120 + cost' },
    { service: 'Bill payments / gov runs', price: 'from TT$100' },
  ];

  return (
    <Card className="mb-8 bg-primary/5 border-primary/20">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
          Service Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pricingItems.map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <span className="font-medium text-foreground">{item.service}</span>
              <span className="text-primary font-semibold">{item.price}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};