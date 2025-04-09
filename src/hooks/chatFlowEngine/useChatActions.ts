
import { useCallback } from 'react';
import * as chatbotService from '@/services/chatbot';
import { 
  ChatStepType, 
  ChatSenderType, 
  ChatMessageType, 
  ContactInfo, 
  CareNeeds,
  ChatbotMessage
} from './chatFlowTypes';

export interface UseChatActionsProps {
  conversation: {
    id?: string;
    contactInfo?: ContactInfo;
    careNeeds?: CareNeeds;
  };
  currentStep: ChatStepType;
  dispatch: React.Dispatch<any>;
}

export function useChatActions({ conversation, currentStep, dispatch }: UseChatActionsProps) {
  // Add a user message to the conversation
  const addUserMessage = useCallback(async (
    message: string, 
    contextData?: any
  ): Promise<ChatbotMessage | null> => {
    if (!conversation.id) return null;
    
    const userMessage: ChatbotMessage = {
      senderType: ChatSenderType.USER,
      message,
      messageType: ChatMessageType.TEXT,
      contextData: {
        ...contextData,
        step: currentStep,
      },
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    
    try {
      return await chatbotService.sendUserMessage(
        conversation.id,
        message,
        userMessage.contextData,
      );
    } catch (error) {
      console.error('Error adding user message:', error);
      return null;
    }
  }, [conversation.id, currentStep, dispatch]);

  // Add a bot message to the conversation
  const addBotMessage = useCallback(async (
    message: string, 
    options?: any,
    contextData?: any,
  ): Promise<ChatbotMessage | null> => {
    if (!conversation.id) return null;
    
    const botMessage: ChatbotMessage = {
      senderType: ChatSenderType.BOT,
      message,
      messageType: options ? ChatMessageType.OPTION : ChatMessageType.TEXT,
      contextData: {
        ...contextData,
        options,
        step: currentStep,
      },
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: botMessage });
    
    try {
      return await chatbotService.sendBotMessage(
        conversation.id,
        message,
        options,
        botMessage.contextData,
      );
    } catch (error) {
      console.error('Error adding bot message:', error);
      return null;
    }
  }, [conversation.id, currentStep, dispatch]);

  // Update contact information in the conversation
  const updateContactInfo = useCallback(async (
    contactInfo: Partial<ContactInfo>
  ): Promise<boolean> => {
    if (!conversation.id) return false;
    
    dispatch({ type: 'UPDATE_CONTACT_INFO', payload: contactInfo });
    
    try {
      const updatedConversation = await chatbotService.updateContactInfo(
        conversation.id,
        {
          ...conversation.contactInfo,
          ...contactInfo,
        }
      );
      
      return !!updatedConversation;
    } catch (error) {
      console.error('Error updating contact info:', error);
      return false;
    }
  }, [conversation.id, conversation.contactInfo, dispatch]);

  // Update care needs in the conversation
  const updateCareNeeds = useCallback(async (
    careNeeds: Partial<CareNeeds>
  ): Promise<boolean> => {
    if (!conversation.id) return false;
    
    dispatch({ type: 'UPDATE_CARE_NEEDS', payload: careNeeds });
    
    try {
      const updatedConversation = await chatbotService.updateCareNeeds(
        conversation.id,
        {
          ...conversation.careNeeds,
          ...careNeeds,
        }
      );
      
      return !!updatedConversation;
    } catch (error) {
      console.error('Error updating care needs:', error);
      return false;
    }
  }, [conversation.id, conversation.careNeeds, dispatch]);

  // Calculate lead score based on conversation data
  const calculateLeadScore = useCallback((): number => {
    let score = 0;
    const { contactInfo, careNeeds } = conversation;

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
  }, [conversation]);

  // Update conversion status for the conversation
  const updateConversionStatus = useCallback(async (
    converted: boolean
  ): Promise<boolean> => {
    if (!conversation.id) return false;
    
    try {
      const updatedConversation = await chatbotService.updateConversionStatus(
        conversation.id,
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
  }, [conversation.id, dispatch]);

  return {
    addUserMessage,
    addBotMessage,
    updateContactInfo,
    updateCareNeeds,
    calculateLeadScore,
    updateConversionStatus
  };
}
