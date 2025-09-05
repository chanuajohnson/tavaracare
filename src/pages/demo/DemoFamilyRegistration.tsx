import React, { useCallback, useState } from 'react';
import FamilyRegistration from '@/pages/registration/FamilyRegistration';
import { useRealTimeFormSync } from '@/hooks/useRealTimeFormSync';
import { TavaraStateProvider } from '@/components/tav/hooks/TavaraStateContext';

const DemoFamilyRegistration = () => {
  const [formSetters, setFormSetters] = useState<any>(null);
  const { processMessage } = useRealTimeFormSync(formSetters);
  
  console.log('🔗 [DemoFamilyRegistration] processMessage ready:', !!processMessage);

  const handleFormReady = useCallback((setters: any) => {
    setFormSetters(setters);
  }, []);

  return (
    <TavaraStateProvider 
      forceDemoMode={true}
      initialRole="family"
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