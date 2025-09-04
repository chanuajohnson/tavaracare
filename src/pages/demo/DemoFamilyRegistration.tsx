import React, { useCallback } from 'react';
import { TavaraStateProvider } from '@/components/tav';
import FamilyRegistration from '@/pages/registration/FamilyRegistration';
import { useRealTimeFormSync } from '@/hooks/useRealTimeFormSync';

const DemoFamilyRegistration = () => {
  const [realTimeDataCallback, setRealTimeDataCallback] = React.useState<((message: string, isUser: boolean) => void) | null>(null);

  const handleFormReady = useCallback((formSetters: any) => {
    const { processMessage } = useRealTimeFormSync(formSetters);
    setRealTimeDataCallback(() => processMessage);
  }, []);

  return (
    <TavaraStateProvider 
      initialRole="guest" 
      forceDemoMode={true}
      realTimeDataCallback={realTimeDataCallback}
    >
      <FamilyRegistration 
        isDemo={true} 
        onFormReady={handleFormReady}
      />
    </TavaraStateProvider>
  );
};

export default DemoFamilyRegistration;