
import { useReducer, useCallback } from 'react';
import { chatFlowReducer } from './chatFlowReducer';
import { initialChatFlowState, ChatStepType, ChatbotMessage, ChatSenderType, ChatMessageType } from './chatFlowTypes';
import { useUIControls } from './useUIControls';
import { createConversation, getConversationBySessionId, sendMessage } from '@/services/chatbot';
import { v4 as uuidv4 } from 'uuid';

export function useChatFlowEngine() {
  const [state, dispatch] = useReducer(chatFlowReducer, initialChatFlowState);
  
  // Generate a session ID if none exists
  const ensureSessionId = useCallback(async () => {
    if (!state.sessionId) {
      const sessionId = uuidv4();
      
      try {
        const conversation = await createConversation(sessionId);
        dispatch({ type: 'SET_CONVERSATION', payload: conversation });
      } catch (error) {
        console.error('Error initializing chat flow:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      
      return sessionId;
    }
    return state.sessionId;
  }, [state.sessionId]);

  // Action to add a user message to the conversation
  const addUserMessage = useCallback(async (messageText: string) => {
    const sessionId = await ensureSessionId();
    
    const message: ChatbotMessage = {
      id: uuidv4(),
      message: messageText,
      sender: ChatSenderType.USER,
      timestamp: new Date().toISOString(),
      type: ChatMessageType.TEXT,
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    
    try {
      await sendMessage(state.conversation.id || sessionId, messageText, ChatSenderType.USER);
    } catch (error) {
      console.error('Error sending user message:', error);
    }
    
    return message;
  }, [state.conversation.id, ensureSessionId]);

  // Action to add a bot message to the conversation
  const addBotMessage = useCallback(async (
    messageText: string,
    options?: { label: string; value: string }[],
    contextData?: Record<string, any>
  ) => {
    const sessionId = await ensureSessionId();
    
    const message: ChatbotMessage = {
      id: uuidv4(),
      message: messageText,
      sender: ChatSenderType.BOT,
      timestamp: new Date().toISOString(),
      type: options ? ChatMessageType.OPTIONS : ChatMessageType.TEXT,
      options,
      contextData,
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    
    try {
      await sendMessage(
        state.conversation.id || sessionId, 
        messageText, 
        ChatSenderType.BOT
      );
    } catch (error) {
      console.error('Error sending bot message:', error);
    }
    
    return message;
  }, [state.conversation.id, ensureSessionId]);

  // Action to update contact information
  const updateContactInfo = useCallback((contactInfo: Record<string, any>) => {
    dispatch({ type: 'UPDATE_CONTACT_INFO', payload: contactInfo });
  }, []);

  // Action to update care needs
  const updateCareNeeds = useCallback((careNeeds: Record<string, any>) => {
    dispatch({ type: 'UPDATE_CARE_NEEDS', payload: careNeeds });
  }, []);

  // Function to update conversion status
  const updateConversionStatus = useCallback(async (converted: boolean) => {
    if (!state.conversation.id) return false;
    
    try {
      // Implementation would go here to update the conversion status in database
      return true;
    } catch (error) {
      console.error('Error updating conversion status:', error);
      return false;
    }
  }, [state.conversation.id]);

  // UI Controls (open, minimize, navigate)
  const uiControls = useUIControls({ 
    state, 
    dispatch, 
    updateConversionStatus 
  });

  return {
    state,
    dispatch,
    addUserMessage,
    addBotMessage,
    updateContactInfo,
    updateCareNeeds,
    ...uiControls,
  };
}

export type ChatFlowHookResult = ReturnType<typeof useChatFlowEngine>;
