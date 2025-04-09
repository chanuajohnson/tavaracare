
// Compiling all chatbot services into a single export file for backwards compatibility
import { createConversation, getConversation, getConversationBySessionId } from './chatbot/conversationService';
import { sendMessage } from './chatbot/messageService';
import { createSession, getSession } from './chatbot/sessionService';

// Re-export all the functions
export { 
  createConversation, 
  getConversation, 
  getConversationBySessionId,
  sendMessage,
  createSession,
  getSession
};

// Re-export types
export type { ChatbotConversation, ChatbotMessage } from '@/types/chatbotTypes';
