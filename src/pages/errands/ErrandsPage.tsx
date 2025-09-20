import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ErrandsHero } from '@/components/errands/ErrandsHero';
import { PricingBanner } from '@/components/errands/PricingBanner';
import { ErrandsForm } from '@/components/errands/ErrandsForm';
import { useTracking } from '@/hooks/useTracking';
import { useEffect } from 'react';

const ErrandsPage: React.FC = () => {
  const { trackEngagement } = useTracking();

  useEffect(() => {
    trackEngagement('errands_page_view');
  }, [trackEngagement]);

  return (
    <Layout>
      <div className="w-full bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="w-full mobile-container mobile-viewport-fix">
          <ErrandsHero />
          <PricingBanner />
          <ErrandsForm />
        </div>
      </div>
    </Layout>
  );
};

export default ErrandsPage;