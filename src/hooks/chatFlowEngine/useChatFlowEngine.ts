
import { useReducer, useEffect } from 'react';
import * as chatbotService from '@/services/chatbot';
import { chatFlowReducer } from './chatFlowReducer';
import { initialChatFlowState, ChatStepType } from './chatFlowTypes';
import { useChatActions } from './useChatActions';
import { useUIControls } from './useUIControls';

export function useChatFlowEngine() {
  const sessionId = chatbotService.getOrCreateSessionId();
  
  const [state, dispatch] = useReducer(chatFlowReducer, {
    ...initialChatFlowState,
    sessionId,
  });

  // Initialize the chat conversation on component mount
  useEffect(() => {
    const initializeChat = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const conversation = await chatbotService.initializeConversation();
        
        if (conversation) {
          dispatch({ type: 'SET_CONVERSATION', payload: conversation });
          
          if (conversation.conversationData && conversation.conversationData.length === 0) {
            dispatch({ type: 'SET_STEP', payload: ChatStepType.WELCOME });
          } else {
            const messages = conversation.conversationData || [];
            const lastStepMessage = [...messages]
              .reverse()
              .find(msg => msg.contextData?.step);
            
            if (lastStepMessage && lastStepMessage.contextData?.step) {
              dispatch({ 
                type: 'SET_STEP', 
                payload: lastStepMessage.contextData.step 
              });
            }
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeChat();
  }, []);

  // Import and use the chat actions
  const { 
    addUserMessage, 
    addBotMessage, 
    updateContactInfo, 
    updateCareNeeds,
    calculateLeadScore,
    updateConversionStatus 
  } = useChatActions({ 
    conversation: state.conversation,
    currentStep: state.currentStep,
    dispatch 
  });

  // Import and use the UI controls
  const { 
    setStep, 
    toggleOpen, 
    toggleMinimized, 
    navigateToRegistration 
  } = useUIControls({ 
    state,
    dispatch,
    updateConversionStatus
  });

  // Return the state and all actions
  return {
    state,
    addUserMessage,
    addBotMessage,
    updateContactInfo,
    updateCareNeeds,
    calculateLeadScore,
    updateConversionStatus,
    setStep,
    toggleOpen,
    toggleMinimized,
    navigateToRegistration,
  };
}
