
import { ChatbotMessage, ChatbotConversation } from '@/types/chatbot';

export interface ChatbotAPIResponse<T> {
  data: T | null;
  error: any | null;
}

export interface ChatbotAPISuccessResponse {
  success: boolean;
  error: any | null;
}

export interface BotResponseResult {
  botResponse: ChatbotMessage;
  updatedLeadScore: number;
}
