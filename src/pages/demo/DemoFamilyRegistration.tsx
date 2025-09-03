import React from 'react';
import { TavaraStateProvider } from '@/components/tav';
import FamilyRegistration from '@/pages/registration/FamilyRegistration';

const DemoFamilyRegistration = () => {
  return (
    <TavaraStateProvider initialRole="guest" forceDemoMode={true}>
      <FamilyRegistration isDemo={true} />
    </TavaraStateProvider>
  );
};

export default DemoFamilyRegistration;