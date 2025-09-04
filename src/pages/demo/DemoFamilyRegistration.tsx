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

  // DEBUG: Create wrapper to trace the callback
  const debugProcessMessage = (message: string, isUser: boolean) => {
    console.warn('🔗 [DemoFamilyRegistration] debugProcessMessage called:', { message, isUser });
    if (processMessage) {
      return processMessage(message, isUser);
    } else {
      console.error('🚨 [DemoFamilyRegistration] processMessage is not available yet!');
    }
  };

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
      realTimeDataCallback={debugProcessMessage}
    >
      <FamilyRegistration 
        isDemo={true} 
        onFormReady={handleFormReady}
      />
    </TavaraStateProvider>
  );
};

export default DemoFamilyRegistration;