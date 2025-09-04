import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TavaraStateProvider } from '@/components/tav';
import FamilyRegistration from '@/pages/registration/FamilyRegistration';
import { DemoRegistrationCompleteButton } from '@/components/demo/DemoRegistrationCompleteButton';
import { useDemoRegistration } from '@/hooks/demo/useDemoRegistration';
import { cleanupOldDemoSessions } from '@/services/demo/demoSessionManager';
import { useRealTimeFormSync } from '@/hooks/demo/useRealTimeFormSync';
import { v4 as uuidv4 } from 'uuid';

const DemoFamilyRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    // Get session ID from URL params or create new one
    const urlSessionId = searchParams.get('session');
    return urlSessionId || uuidv4();
  });
  
  // Real-time form sync state
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const formSetValueRef = useRef<((field: string, value: any) => void) | null>(null);

  const {
    sessionId,
    completionLevel,
    isReadyForRegistration,
    isLoadingSession,
    hasLeadCaptured,
    updateSessionData,
    handleLeadCaptured,
    shouldShowCompleteButton
  } = useDemoRegistration(currentSessionId);

  // Clean up old demo sessions on mount
  useEffect(() => {
    cleanupOldDemoSessions();
  }, []);

  // Real-time form sync
  useRealTimeFormSync(extractedData, formSetValueRef.current || (() => {}), {
    showVisualFeedback: true,
    onFieldUpdate: (fieldName, value) => {
      console.log(`✨ Real-time sync: ${fieldName} = ${value}`);
    }
  });

  // Handle real-time data extraction from TAV
  const handleRealTimeDataExtract = (data: Record<string, any>) => {
    console.log('🔄 Real-time data extracted from TAV:', data);
    setExtractedData(data);
  };

  // Handle form setValue reference
  const handleSetFormValueRef = (setFormValue: (field: string, value: any) => void) => {
    formSetValueRef.current = setFormValue;
    console.log('📝 Form setValue reference connected');
  };

  // Handle demo completion flow
  const handleDemoComplete = () => {
    if (searchParams.get('demo_complete') === 'true') {
      // Show success message that form is pre-filled
      console.log('✅ Demo completed - showing pre-filled form');
    }
  };

  useEffect(() => {
    handleDemoComplete();
  }, [searchParams]);

  return (
    <TavaraStateProvider 
      initialRole="guest" 
      forceDemoMode={true}
      sessionId={currentSessionId}
      onDataUpdate={updateSessionData}
      onRealTimeDataExtract={handleRealTimeDataExtract}
    >
      <div className="relative">
        {/* Show completion button when ready and lead not captured */}
        {shouldShowCompleteButton() && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4">
            <DemoRegistrationCompleteButton
              completionLevel={completionLevel}
              isReady={isReadyForRegistration}
              sessionId={sessionId || currentSessionId}
              onLeadCaptured={handleLeadCaptured}
            />
          </div>
        )}

        {/* Demo registration form */}
        <FamilyRegistration 
          isDemo={true} 
          demoSessionId={sessionId || currentSessionId}
          demoCompletionLevel={completionLevel}
          isDemoDataReady={isReadyForRegistration}
          onSetFormValueRef={handleSetFormValueRef}
        />
      </div>
    </TavaraStateProvider>
  );
};

export default DemoFamilyRegistration;