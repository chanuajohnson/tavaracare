
// Compiling all chatbot services into a single export file for backwards compatibility
import { createConversation, getConversation, updateConversation, updateContactInfo, updateCareNeeds, updateConversionStatus } from './chatbot/conversationService';
import { addMessage, getMessages, sendUserMessage, sendBotMessage } from './chatbot/messageService';
import { getOrCreateSessionId, initializeConversation } from './chatbot/sessionService';

// Re-export all the functions
export { 
  createConversation, 
  getConversation,
  updateConversation,
  updateContactInfo,
  updateCareNeeds,
  updateConversionStatus,
  addMessage,
  getMessages,
  sendUserMessage,
  sendBotMessage,
  getOrCreateSessionId,
  initializeConversation
};

// Re-export types
export type { ChatbotConversation, ChatbotMessage } from '@/types/chatbotTypes';
