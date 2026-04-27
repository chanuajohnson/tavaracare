import React from 'react';
import { TavaraStateProvider } from '@/components/tav';
import FamilyStoryPage from '@/pages/family/FamilyStoryPage';

const DemoFamilyStory = () => {
  return (
    <TavaraStateProvider initialRole="guest" forceDemoMode={true}>
      <FamilyStoryPage isDemo={true} />
    </TavaraStateProvider>
  );
};

export default DemoFamilyStory;