
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatState {
  sessionId: string;
  caregiverId: string;
  currentStage: string;
  hasStartedChat: boolean;
  chatRequestId?: string;
  conversationFlowId?: string;
}

export const useChatPersistence = (caregiverId: string) => {
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing chat state from localStorage and database
  useEffect(() => {
    loadChatState();
  }, [caregiverId]);

  const loadChatState = async () => {
    try {
      setIsLoading(true);
      
      // First check localStorage for session state
      const localKey = `chat_state_${caregiverId}`;
      const localState = localStorage.getItem(localKey);
      let parsedLocalState = null;
      
      if (localState) {
        parsedLocalState = JSON.parse(localState);
        console.log('[ChatPersistence] Loaded from localStorage:', parsedLocalState);
      }

      // Check database for any existing chat requests
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Query both chat requests and conversation flows
      const [requestResult, flowResult] = await Promise.all([
        supabase
          .from('caregiver_chat_requests')
          .select('*')
          .eq('family_user_id', user.id)
          .eq('caregiver_id', caregiverId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('chat_conversation_flows')
          .select('*')
          .eq('session_id', parsedLocalState?.sessionId || '')
          .maybeSingle()
      ]);

      const existingRequest = requestResult.data;
      const existingFlow = flowResult.data;

      console.log('[ChatPersistence] Database state:', { existingRequest, existingFlow });

      if (existingRequest || existingFlow || parsedLocalState) {
        const persistedState: ChatState = {
          sessionId: parsedLocalState?.sessionId || existingFlow?.session_id || crypto.randomUUID(),
          caregiverId,
          currentStage: existingFlow?.current_stage || 
                       (existingRequest?.status === 'pending' ? 'waiting_acceptance' : 
                        existingRequest?.status === 'accepted' ? 'guided_qa' : 'introduction'),
          hasStartedChat: !!(existingRequest || existingFlow || parsedLocalState?.hasStartedChat),
          chatRequestId: existingRequest?.id || parsedLocalState?.chatRequestId,
          conversationFlowId: existingFlow?.id
        };
        
        setChatState(persistedState);
        localStorage.setItem(localKey, JSON.stringify(persistedState));
        console.log('[ChatPersistence] Synced with database:', persistedState);
      }
    } catch (error) {
      console.error('[ChatPersistence] Error loading chat state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatState = (newState: Partial<ChatState>) => {
    const localKey = `chat_state_${caregiverId}`;
    const updatedState = { ...chatState, ...newState };
    setChatState(updatedState);
    localStorage.setItem(localKey, JSON.stringify(updatedState));
    console.log('[ChatPersistence] Saved chat state:', updatedState);
  };

  const clearChatState = () => {
    const localKey = `chat_state_${caregiverId}`;
    localStorage.removeItem(localKey);
    setChatState(null);
    console.log('[ChatPersistence] Cleared chat state for:', caregiverId);
  };

  const cancelChatRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !chatState?.chatRequestId) return { success: false, error: 'No active chat request to cancel' };

      // Update the chat request status to cancelled
      const { error } = await supabase
        .from('caregiver_chat_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', chatState.chatRequestId);

      if (error) {
        console.error('[ChatPersistence] Error cancelling chat request:', error);
        return { success: false, error: error.message };
      }

      // Clear local state
      clearChatState();
      
      console.log('[ChatPersistence] Chat request cancelled successfully');
      return { success: true };
    } catch (error) {
      console.error('[ChatPersistence] Error in cancelChatRequest:', error);
      return { success: false, error: 'Failed to cancel chat request' };
    }
  };

  return {
    chatState,
    isLoading,
    saveChatState,
    clearChatState,
    loadChatState,
    cancelChatRequest
  };
};
