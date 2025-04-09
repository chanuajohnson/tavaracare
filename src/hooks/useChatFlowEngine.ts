import { useReducer, useEffect, useCallback } from 'react';
import {
  ChatFlowState,
  ChatFlowAction,
  ChatStepType,
  ChatbotMessage,
  ChatSenderType,
  ChatMessageType,
  ContactInfo,
  CareNeeds,
} from '@/types/chatbotTypes';
import * as chatbotService from '@/services/chatbotService';

const initialState: ChatFlowState = {
  currentStep: ChatStepType.WELCOME,
  conversation: {
    sessionId: '',
    conversationData: [],
  },
  isLoading: true,
  isMinimized: false,
  isOpen: false,
  sessionId: '',
};

function chatFlowReducer(state: ChatFlowState, action: ChatFlowAction): ChatFlowState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          conversationData: [...state.conversation.conversationData, action.payload],
        },
      };
    case 'SET_CONVERSATION':
      const conversation = action.payload;
      if (!conversation.conversationData) {
        conversation.conversationData = [];
      }
      
      return {
        ...state,
        conversation,
        sessionId: conversation.sessionId,
      };
    case 'UPDATE_CONTACT_INFO':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          contactInfo: {
            ...state.conversation.contactInfo || {},
            ...action.payload,
          },
        },
      };
    case 'UPDATE_CARE_NEEDS':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          careNeeds: {
            ...state.conversation.careNeeds || {},
            ...action.payload,
          },
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_MINIMIZED':
      return {
        ...state,
        isMinimized: action.payload,
      };
    case 'SET_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };
    case 'RESET':
      return {
        ...initialState,
        sessionId: chatbotService.getOrCreateSessionId(),
      };
    default:
      return state;
  }
}

export function useChatFlowEngine() {
  const sessionId = chatbotService.getOrCreateSessionId();
  
  const [state, dispatch] = useReducer(chatFlowReducer, {
    ...initialState,
    sessionId,
  });

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

  const addUserMessage = useCallback(async (
    message: string, 
    contextData?: any
  ): Promise<ChatbotMessage | null> => {
    if (!state.conversation.id) return null;
    
    const userMessage: ChatbotMessage = {
      senderType: ChatSenderType.USER,
      message,
      messageType: ChatMessageType.TEXT,
      contextData: {
        ...contextData,
        step: state.currentStep,
      },
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    
    try {
      return await chatbotService.sendUserMessage(
        state.conversation.id,
        message,
        userMessage.contextData,
      );
    } catch (error) {
      console.error('Error adding user message:', error);
      return null;
    }
  }, [state.conversation.id, state.currentStep]);

  const addBotMessage = useCallback(async (
    message: string, 
    options?: any,
    contextData?: any,
  ): Promise<ChatbotMessage | null> => {
    if (!state.conversation.id) return null;
    
    const botMessage: ChatbotMessage = {
      senderType: ChatSenderType.BOT,
      message,
      messageType: options ? ChatMessageType.OPTION : ChatMessageType.TEXT,
      contextData: {
        ...contextData,
        options,
        step: state.currentStep,
      },
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: botMessage });
    
    try {
      return await chatbotService.sendBotMessage(
        state.conversation.id,
        message,
        options,
        botMessage.contextData,
      );
    } catch (error) {
      console.error('Error adding bot message:', error);
      return null;
    }
  }, [state.conversation.id, state.currentStep]);

  const updateContactInfo = useCallback(async (
    contactInfo: Partial<ContactInfo>
  ): Promise<boolean> => {
    if (!state.conversation.id) return false;
    
    dispatch({ type: 'UPDATE_CONTACT_INFO', payload: contactInfo });
    
    try {
      const updatedConversation = await chatbotService.updateContactInfo(
        state.conversation.id,
        {
          ...state.conversation.contactInfo,
          ...contactInfo,
        }
      );
      
      return !!updatedConversation;
    } catch (error) {
      console.error('Error updating contact info:', error);
      return false;
    }
  }, [state.conversation.id, state.conversation.contactInfo]);

  const updateCareNeeds = useCallback(async (
    careNeeds: Partial<CareNeeds>
  ): Promise<boolean> => {
    if (!state.conversation.id) return false;
    
    dispatch({ type: 'UPDATE_CARE_NEEDS', payload: careNeeds });
    
    try {
      const updatedConversation = await chatbotService.updateCareNeeds(
        state.conversation.id,
        {
          ...state.conversation.careNeeds,
          ...careNeeds,
        }
      );
      
      return !!updatedConversation;
    } catch (error) {
      console.error('Error updating care needs:', error);
      return false;
    }
  }, [state.conversation.id, state.conversation.careNeeds]);

  const calculateLeadScore = useCallback((): number => {
    let score = 0;
    const { contactInfo, careNeeds } = state.conversation;

    if (contactInfo) {
      if (contactInfo.firstName) score += 5;
      if (contactInfo.lastName) score += 5;
      if (contactInfo.email) score += 10;
      if (contactInfo.phone) score += 15;
      if (contactInfo.location) score += 10;
    }

    if (careNeeds) {
      if (careNeeds.relationship) score += 10;
      if (careNeeds.careType && careNeeds.careType.length > 0) score += 15;
      if (careNeeds.schedule) score += 10;
      if (careNeeds.urgency === 'immediate') score += 20;
      if (careNeeds.urgency === 'soon') score += 10;
      if (careNeeds.role) score += 10;
    }

    return score;
  }, [state.conversation]);

  const updateConversionStatus = useCallback(async (
    converted: boolean
  ): Promise<boolean> => {
    if (!state.conversation.id) return false;
    
    try {
      const updatedConversation = await chatbotService.updateConversionStatus(
        state.conversation.id,
        converted
      );
      
      if (updatedConversation) {
        dispatch({ 
          type: 'SET_CONVERSATION', 
          payload: updatedConversation 
        });
      }
      
      return !!updatedConversation;
    } catch (error) {
      console.error('Error updating conversion status:', error);
      return false;
    }
  }, [state.conversation.id]);

  const setStep = useCallback((step: ChatStepType) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const toggleOpen = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: !state.isOpen });
    
    if (!state.isOpen) {
      dispatch({ type: 'SET_MINIMIZED', payload: false });
    }
  }, [state.isOpen]);

  const toggleMinimized = useCallback(() => {
    dispatch({ type: 'SET_MINIMIZED', payload: !state.isMinimized });
  }, [state.isMinimized]);

  const navigateToRegistration = useCallback(() => {
    if (!state.conversation.id || !state.conversation.careNeeds?.role) {
      console.error('Cannot navigate: missing conversation ID or role');
      return;
    }
    
    const role = state.conversation.careNeeds.role;
    window.location.href = `/registration/${role}?prefill=${state.conversation.id}`;
    
    updateConversionStatus(true);
  }, [state.conversation.id, state.conversation.careNeeds?.role, updateConversionStatus]);

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
