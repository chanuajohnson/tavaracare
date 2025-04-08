
import { 
  fetchExistingConversation,
  createConversation,
  updateConversation,
  updateConversationMessages
} from '@/services/chatbot/conversationService';

import {
  fetchMessages,
  saveMessage
} from '@/services/chatbot/messageService';

/**
 * Hook for handling all Supabase API operations related to the chatbot
 */
export const useChatbotAPI = () => {
  // Return the API functions
  return {
    // Conversation operations
    fetchExistingConversation,
    createConversation,
    updateConversation,
    updateConversationMessages,
    
    // Message operations
    fetchMessages,
    saveMessage
  };
};
