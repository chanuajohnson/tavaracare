import React from 'react';

export const ErrandsHero: React.FC = () => {
  return (
    <div className="text-center py-8 sm:py-12 md:py-16 mobile-header-spacing">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 sm:mb-4">
          On-Demand Errands for Seniors &amp; Families
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-foreground/80 font-medium italic mb-4 sm:mb-6">
          Your On-Demand Errands Buddy 🚗
        </p>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 sm:mb-6 px-4">
          PriceSmart runs • Pharmacy pickups • Bill payments • School runs • Whatever you need
        </p>
        <p className="text-base sm:text-lg md:text-xl text-primary font-semibold px-4 mb-2">
          TT$50 base fee + distance/complexity
        </p>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Same-day response • Pay only when you use it • No subscription required
        </p>
      </div>
    </div>
  );
};