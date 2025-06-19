
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatState {
  sessionId: string;
  caregiverId: string;
  currentStage: string;
  hasStartedChat: boolean;
  chatRequestId?: string;
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
      
      if (localState) {
        const parsedState = JSON.parse(localState);
        setChatState(parsedState);
        console.log('[ChatPersistence] Loaded from localStorage:', parsedState);
      }

      // Then check database for any existing chat requests
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingRequest } = await supabase
        .from('caregiver_chat_requests')
        .select('*')
        .eq('family_user_id', user.id)
        .eq('caregiver_id', caregiverId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingRequest) {
        const persistedState: ChatState = {
          sessionId: localState ? JSON.parse(localState).sessionId : crypto.randomUUID(),
          caregiverId,
          currentStage: existingRequest.status === 'pending' ? 'waiting_acceptance' : 
                       existingRequest.status === 'accepted' ? 'guided_qa' : 'interest_expression',
          hasStartedChat: true,
          chatRequestId: existingRequest.id
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

  return {
    chatState,
    isLoading,
    saveChatState,
    clearChatState,
    loadChatState
  };
};
