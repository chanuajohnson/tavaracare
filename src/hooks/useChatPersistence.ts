
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
      console.log(`[ChatPersistence] Loading state for caregiver: ${caregiverId}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[ChatPersistence] No authenticated user found');
        setIsLoading(false);
        return;
      }

      console.log(`[ChatPersistence] User ID: ${user.id}, Caregiver ID: ${caregiverId}`);

      // First, query chat requests for this family-caregiver pair
      const { data: chatRequests, error: requestError } = await supabase
        .from('caregiver_chat_requests')
        .select('*')
        .eq('family_user_id', user.id)
        .eq('caregiver_id', caregiverId)
        .order('created_at', { ascending: false });

      if (requestError) {
        console.error('[ChatPersistence] Error fetching chat requests:', requestError);
        setIsLoading(false);
        return;
      }

      console.log(`[ChatPersistence] Found ${chatRequests?.length || 0} chat requests:`, chatRequests);

      // Find the most recent non-cancelled request
      const activeRequest = chatRequests?.find(req => req.status !== 'cancelled');
      
      if (!activeRequest) {
        console.log('[ChatPersistence] No active chat requests found');
        setIsLoading(false);
        return;
      }

      console.log('[ChatPersistence] Active request found:', activeRequest);

      // Now look for conversation flows related to this request
      const { data: conversationFlows, error: flowError } = await supabase
        .from('chat_conversation_flows')
        .select('*')
        .order('created_at', { ascending: false });

      if (flowError) {
        console.error('[ChatPersistence] Error fetching conversation flows:', flowError);
      }

      console.log(`[ChatPersistence] Found ${conversationFlows?.length || 0} conversation flows:`, conversationFlows);

      // Try to find a conversation flow that matches this chat request
      // Check both session_id from localStorage and stage_data for chatRequestId
      const localKey = `chat_state_${caregiverId}`;
      const localState = localStorage.getItem(localKey);
      let parsedLocalState = null;
      
      if (localState) {
        parsedLocalState = JSON.parse(localState);
        console.log('[ChatPersistence] Local state found:', parsedLocalState);
      }

      let matchingFlow = null;
      
      if (parsedLocalState?.sessionId) {
        // First try to match by session_id
        matchingFlow = conversationFlows?.find(flow => flow.session_id === parsedLocalState.sessionId);
        console.log('[ChatPersistence] Matched flow by session_id:', matchingFlow);
      }
      
      if (!matchingFlow) {
        // Try to match by stage_data containing chat request info
        matchingFlow = conversationFlows?.find(flow => {
          const stageData = flow.stage_data || {};
          return stageData.chatRequestId === activeRequest.id || 
                 stageData.caregiverId === caregiverId;
        });
        console.log('[ChatPersistence] Matched flow by stage_data:', matchingFlow);
      }

      // Reconstruct chat state from database findings
      const reconstructedState: ChatState = {
        sessionId: matchingFlow?.session_id || parsedLocalState?.sessionId || crypto.randomUUID(),
        caregiverId,
        currentStage: matchingFlow?.current_stage || 
                     (activeRequest.status === 'pending' ? 'waiting_acceptance' : 
                      activeRequest.status === 'accepted' ? 'guided_qa' : 'introduction'),
        hasStartedChat: true, // We found an active request, so chat has started
        chatRequestId: activeRequest.id,
        conversationFlowId: matchingFlow?.id
      };

      console.log('[ChatPersistence] Reconstructed state:', reconstructedState);
      
      setChatState(reconstructedState);
      
      // Update localStorage with reconstructed state
      localStorage.setItem(localKey, JSON.stringify(reconstructedState));
      
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
      if (!user || !chatState?.chatRequestId) {
        console.error('[ChatPersistence] Cannot cancel - missing user or chat request ID');
        return { success: false, error: 'No active chat request to cancel' };
      }

      console.log(`[ChatPersistence] Cancelling chat request: ${chatState.chatRequestId}`);

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
