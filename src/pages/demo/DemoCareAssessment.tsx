import React from 'react';
import { TavaraStateProvider } from '@/components/tav';
import CareNeedsAssessmentPage from '@/pages/family/CareNeedsAssessmentPage';

const DemoCareAssessment = () => {
  return (
    <TavaraStateProvider initialRole="guest" forceDemoMode={true}>
      <CareNeedsAssessmentPage isDemo={true} />
    </TavaraStateProvider>
  );
};

export default DemoCareAssessment;