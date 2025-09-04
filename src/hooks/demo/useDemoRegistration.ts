import { useState, useEffect, useCallback } from 'react';
import { processTAVForRegistration, DemoSessionData, TAVConversationData } from '@/utils/demo/tavToDemoRegistration';
import { saveDemoSession, loadDemoSession, markLeadCaptured } from '@/services/demo/demoSessionManager';

export interface DemoRegistrationState {
  sessionId: string | null;
  conversationData: TAVConversationData;
  completionLevel: number;
  isReadyForRegistration: boolean;
  isLoadingSession: boolean;
  hasLeadCaptured: boolean;
}

export const useDemoRegistration = (initialSessionId?: string) => {
  const [state, setState] = useState<DemoRegistrationState>({
    sessionId: initialSessionId || null,
    conversationData: {},
    completionLevel: 0,
    isReadyForRegistration: false,
    isLoadingSession: true,
    hasLeadCaptured: false
  });

  // Initialize or restore demo session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setState(prev => ({ ...prev, isLoadingSession: true }));

        // Try to load existing demo session first
        const existingSession = await loadDemoSession();
        
        if (existingSession) {
          // Restore existing session
          const sessionData = await processTAVForRegistration(existingSession.sessionId);
          
          if (sessionData) {
            setState(prev => ({
              ...prev,
              sessionId: existingSession.sessionId,
              conversationData: sessionData.conversationData,
              completionLevel: sessionData.completionLevel,
              isReadyForRegistration: sessionData.isReadyForRegistration,
              hasLeadCaptured: existingSession.leadCaptured,
              isLoadingSession: false
            }));
            
            console.log('🔄 Restored demo session:', existingSession.sessionId);
            return;
          }
        }

        // If we have an initial session ID, process it
        if (initialSessionId) {
          const sessionData = await processTAVForRegistration(initialSessionId);
          
          if (sessionData) {
            setState(prev => ({
              ...prev,
              sessionId: initialSessionId,
              conversationData: sessionData.conversationData,
              completionLevel: sessionData.completionLevel,
              isReadyForRegistration: sessionData.isReadyForRegistration,
              isLoadingSession: false
            }));
            
            // Save new demo session
            await saveDemoSession(initialSessionId, sessionData.conversationData, {});
            console.log('💾 Created new demo session:', initialSessionId);
            return;
          }
        }

        // No session found or couldn't process, set loading to false
        setState(prev => ({ ...prev, isLoadingSession: false }));

      } catch (error) {
        console.error('❌ Error initializing demo session:', error);
        setState(prev => ({ ...prev, isLoadingSession: false }));
      }
    };

    initializeSession();
  }, [initialSessionId]);

  // Update session data when TAV conversation progresses
  const updateSessionData = useCallback(async (sessionId: string) => {
    try {
      const sessionData = await processTAVForRegistration(sessionId);
      
      if (sessionData) {
        setState(prev => ({
          ...prev,
          sessionId,
          conversationData: sessionData.conversationData,
          completionLevel: sessionData.completionLevel,
          isReadyForRegistration: sessionData.isReadyForRegistration
        }));

        // Save updated session
        await saveDemoSession(sessionId, sessionData.conversationData, {});
        
        console.log('🔄 Updated demo session data:', {
          sessionId,
          completion: sessionData.completionLevel,
          ready: sessionData.isReadyForRegistration
        });
      }
    } catch (error) {
      console.error('❌ Error updating session data:', error);
    }
  }, []);

  // Handle lead capture completion
  const handleLeadCaptured = useCallback(async () => {
    if (state.sessionId) {
      setState(prev => ({ ...prev, hasLeadCaptured: true }));
      await markLeadCaptured(state.sessionId);
      console.log('✅ Lead captured for session:', state.sessionId);
    }
  }, [state.sessionId]);

  // Populate form fields in real-time
  const populateFormField = useCallback((fieldName: string, value: any, setFormValue?: (field: string, value: any) => void) => {
    if (setFormValue && value) {
      setFormValue(fieldName, value);
      console.log(`✨ Auto-populated field ${fieldName}:`, value);
    }
  }, []);

  // Get registration URL with prefilled data
  const getRegistrationUrl = useCallback(() => {
    if (!state.sessionId) return '/demo/registration/family';
    return `/demo/registration/family?session=${state.sessionId}&prefilled=true`;
  }, [state.sessionId]);

  // Check if ready to show "Complete Registration" button
  const shouldShowCompleteButton = useCallback(() => {
    return state.completionLevel >= 60 && state.isReadyForRegistration && !state.hasLeadCaptured;
  }, [state.completionLevel, state.isReadyForRegistration, state.hasLeadCaptured]);

  return {
    // State
    sessionId: state.sessionId,
    conversationData: state.conversationData,
    completionLevel: state.completionLevel,
    isReadyForRegistration: state.isReadyForRegistration,
    isLoadingSession: state.isLoadingSession,
    hasLeadCaptured: state.hasLeadCaptured,
    
    // Actions
    updateSessionData,
    handleLeadCaptured,
    populateFormField,
    
    // Utilities
    getRegistrationUrl,
    shouldShowCompleteButton,
    
    // Data helpers
    getFieldValue: (fieldName: string) => state.conversationData[fieldName],
    getCompletedFields: () => Object.keys(state.conversationData).filter(key => 
      state.conversationData[key] && String(state.conversationData[key]).trim().length > 0
    ),
    getProgress: () => ({
      completed: state.completionLevel,
      isReady: state.isReadyForRegistration,
      fieldsCount: Object.keys(state.conversationData).length
    })
  };
};