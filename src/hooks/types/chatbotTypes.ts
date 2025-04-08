
import { ChatbotMessage, ChatbotConversation } from '@/types/chatbot';
import { Json } from '@/integrations/supabase/types';

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

// Helper type for converting ChatbotMessage to a database-friendly format
export type DbChatbotMessage = {
  id: string;
  conversation_id?: string;
  message: string;
  sender_type: string;
  timestamp: string;
  message_type?: string;
  context_data?: Json;
};

// Helper type for converting ChatbotConversation to a database-friendly format
export type DbChatbotConversation = {
  id: string;
  user_id?: string;
  session_id: string;
  conversation_data: Json;
  care_needs?: Json;
  qualification_status?: string;
  lead_score?: number;
  created_at?: string;
  updated_at?: string;
  converted_to_registration?: boolean;
  contact_info?: Json;
  handoff_requested?: boolean;
};
