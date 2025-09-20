import React from 'react';

export const ErrandsHero: React.FC = () => {
  return (
    <div className="text-center py-8 sm:py-12 md:py-16 mobile-header-spacing">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
          Get everyday support in minutes.
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 sm:mb-6 px-4">
          Errands, childcare, companions, pharmacy runs, bill payments, vehicle service.
        </p>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
          We respond in minutes. Prices shown up front. Deposit secures your slot.
        </p>
      </div>
    </div>
  );
};