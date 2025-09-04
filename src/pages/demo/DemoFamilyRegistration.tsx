import React, { useCallback, useState } from 'react';
import { TavaraStateProvider } from '@/components/tav';
import FamilyRegistration from '@/pages/registration/FamilyRegistration';
import { useRealTimeFormSync } from '@/hooks/useRealTimeFormSync';

const DemoFamilyRegistration = () => {
  const [formSetters, setFormSetters] = useState<any>(null);
  const { processMessage } = useRealTimeFormSync(formSetters);

  const handleFormReady = useCallback((setters: any) => {
    setFormSetters(setters);
  }, []);

  return (
    <TavaraStateProvider 
      initialRole="guest" 
      forceDemoMode={true}
      realTimeDataCallback={processMessage}
    >
      <FamilyRegistration 
        isDemo={true} 
        onFormReady={handleFormReady}
      />
    </TavaraStateProvider>
  );
};

export default DemoFamilyRegistration;