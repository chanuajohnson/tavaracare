
import React from 'react';
import { FadeIn } from '@/components/framer';

const FamilyCareNeedsPage = () => {
  return (
    <FadeIn duration={0.5}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Family Care Needs</h1>
        <p className="text-gray-600">
          This page will contain the family care needs assessment and management features.
        </p>
      </div>
    </FadeIn>
  );
};

export default FamilyCareNeedsPage;
