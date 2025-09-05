import React, { useCallback, useState, useEffect } from 'react';
import FamilyRegistration from '@/pages/registration/FamilyRegistration';
import { useRealTimeFormSync } from '@/hooks/useRealTimeFormSync';
import { realTimeCallbackService } from '@/services/realTimeCallbackService';

const DemoFamilyRegistration = () => {
  const [formSetters, setFormSetters] = useState<any>(null);
  const { processMessage } = useRealTimeFormSync(formSetters);

  console.log('🏗️ [Demo Family Registration] Component state:', {
    hasFormSetters: !!formSetters,
    formSetterKeys: formSetters ? Object.keys(formSetters) : null,
    hasProcessMessage: !!processMessage
  });

  // DEBUG: Create wrapper to trace the callback - wrapped in useCallback to prevent re-registrations
  const debugProcessMessage = useCallback((message: string, isUser: boolean) => {
    console.warn('🔗 [DemoFamilyRegistration] debugProcessMessage called:', { message, isUser });
    if (processMessage) {
      return processMessage(message, isUser);
    } else {
      console.error('🚨 [DemoFamilyRegistration] processMessage is not available yet!');
    }
  }, [processMessage]);

  const handleFormReady = useCallback((setters: any) => {
    console.log('🎛️ [Demo Family Registration] handleFormReady called with setters:', setters);
    console.log('📋 [Demo Family Registration] Setter functions:', Object.keys(setters));
    setFormSetters(setters);
    console.log('✅ [Demo Family Registration] Form setters stored in state');
  }, []);

  // Register the callback with the global service when form is ready
  useEffect(() => {
    if (processMessage) {
      console.log('🔧 [Demo Family Registration] Registering callback with service...');
      realTimeCallbackService.registerCallback(debugProcessMessage);
      console.log('✅ [Demo Family Registration] Callback registered with global service');
    }
    
    return () => {
      console.log('🧹 [Demo Family Registration] Unregistering callback from service...');
      realTimeCallbackService.unregisterCallback();
      console.log('🧹 [Demo Family Registration] Callback unregistered from global service');
    };
  }, [processMessage, debugProcessMessage]);

  return (
    <FamilyRegistration 
      isDemo={true} 
      onFormReady={handleFormReady}
    />
  );
};

export default DemoFamilyRegistration;