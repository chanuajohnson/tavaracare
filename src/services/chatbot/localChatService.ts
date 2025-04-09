
import { generateRandomId, getStoredMessages, storeMessages } from '@/utils/local/sessionStorage';
import { ChatbotMessage, ChatOption, ChatbotMessageType } from '@/types/chatbotTypes';

/**
 * Local implementation of chat services without Supabase for Phase 1
 */

// Get messages for the current session
export function getLocalMessages(): ChatbotMessage[] {
  return getStoredMessages();
}

// Add a user message to the chat
export function addLocalUserMessage(message: string, contextData?: any): ChatbotMessage {
  const messages = getStoredMessages();
  
  const newMessage: ChatbotMessage = {
    id: generateRandomId(),
    senderType: 'user',
    message,
    contextData,
    timestamp: new Date().toISOString()
  };
  
  const updatedMessages = [...messages, newMessage];
  storeMessages(updatedMessages);
  
  return newMessage;
}

// Add a bot message to the chat
export function addLocalBotMessage(
  message: string, 
  messageType: ChatbotMessageType = 'text',
  options?: ChatOption[]
): ChatbotMessage {
  const messages = getStoredMessages();
  
  const newMessage: ChatbotMessage = {
    id: generateRandomId(),
    senderType: 'bot',
    message,
    messageType,
    options,
    timestamp: new Date().toISOString()
  };
  
  const updatedMessages = [...messages, newMessage];
  storeMessages(updatedMessages);
  
  return newMessage;
}

// Simple bot response logic for Phase 1 testing
export function generateSimpleBotResponse(userMessage: string): {
  message: string;
  messageType: ChatbotMessageType;
  options?: ChatOption[];
} {
  // Convert to lowercase for easier matching
  const lowerMessage = userMessage.toLowerCase();
  
  // Very simple response logic for testing
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return {
      message: "Hi there! I'm the Tavara Care Assistant. How can I help you today?",
      messageType: 'text'
    };
  }
  
  if (lowerMessage.includes('help')) {
    return {
      message: "I can help you with caregiving needs. Are you looking for care or offering care services?",
      messageType: 'option',
      options: [
        { label: "I need care for a loved one", value: "need_care" },
        { label: "I'm a caregiver looking for opportunities", value: "offer_care" }
      ]
    };
  }
  
  if (lowerMessage.includes('need') || lowerMessage.includes('looking for')) {
    return {
      message: "I can help you find the right care solution. What type of care are you looking for?",
      messageType: 'option',
      options: [
        { label: "Home Care", value: "home_care" },
        { label: "Respite Care", value: "respite_care" },
        { label: "Memory Care", value: "memory_care" },
        { label: "Other", value: "other_care" }
      ]
    };
  }
  
  if (lowerMessage.includes('caregiver') || lowerMessage.includes('offer')) {
    return {
      message: "That's great! We're always looking for qualified caregivers. Would you like to register as a professional?",
      messageType: 'option',
      options: [
        { label: "Yes, I'd like to register", value: "/registration/professional" },
        { label: "Tell me more first", value: "more_info" }
      ]
    };
  }
  
  // Default response
  return {
    message: "I'm here to help connect families with caregivers. Can you tell me more about what you're looking for?",
    messageType: 'text'
  };
}
