import React, { useCallback, useState } from 'react';
import { TavaraStateProvider } from '@/components/tav';
import FamilyRegistration from '@/pages/registration/FamilyRegistration';
import { useRealTimeFormSync } from '@/hooks/useRealTimeFormSync';

const DemoFamilyRegistration = () => {
  const [formSetters, setFormSetters] = useState<any>(null);
  const { processMessage } = useRealTimeFormSync(formSetters);

  console.log('🏗️ [Demo Family Registration] Component state:', {
    hasFormSetters: !!formSetters,
    formSetterKeys: formSetters ? Object.keys(formSetters) : null,
    hasProcessMessage: !!processMessage
  });

  const handleFormReady = useCallback((setters: any) => {
    console.log('🎛️ [Demo Family Registration] handleFormReady called with setters:', setters);
    console.log('📋 [Demo Family Registration] Setter functions:', Object.keys(setters));
    setFormSetters(setters);
    console.log('✅ [Demo Family Registration] Form setters stored in state');
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