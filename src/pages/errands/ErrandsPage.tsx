import React from 'react';
import { ErrandsHero } from '@/components/errands/ErrandsHero';
import { PricingBanner } from '@/components/errands/PricingBanner';
import { CareSupplyPackages } from '@/components/errands/CareSupplyPackages';
import { ErrandsForm } from '@/components/errands/ErrandsForm';
import { useTracking } from '@/hooks/useTracking';
import { useEffect } from 'react';
import { SEO } from '@/components/seo/SEO';

const ErrandsPage: React.FC = () => {
  const { trackEngagement } = useTracking();

  useEffect(() => {
    trackEngagement('errands_page_view');
  }, [trackEngagement]);

  return (
    <div className="w-full bg-gradient-to-br from-background via-primary/5 to-background">
      <SEO
        title="On-Demand Errands for Seniors & Families | Tavara Care"
        description="Book on-demand errand services for seniors and families in Trinidad and Tobago. Groceries, pharmacy runs, appointments and more — coordinated through Tavara."
        canonicalPath="/errands"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'On-Demand Errand Services',
          serviceType: 'Errand & Concierge Services',
          provider: {
            '@type': 'Organization',
            name: 'Tavara Care',
            url: 'https://tavara.care',
          },
          areaServed: {
            '@type': 'Country',
            name: 'Trinidad and Tobago',
          },
          description:
            'Grocery shopping, pharmacy runs, medical appointment transport, and care-supply delivery for seniors and families.',
        }}
      />
      <div className="w-full mobile-container mobile-viewport-fix">
        <ErrandsHero />
        <PricingBanner />
        <section id="supplies" className="scroll-mt-24">
          <CareSupplyPackages />
        </section>
        <ErrandsForm />
      </div>
    </div>
  );
};

export default ErrandsPage;
