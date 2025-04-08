
import { Json } from "@/integrations/supabase/types";
import { Database } from "@/integrations/supabase/types";

// Frontend Models (camelCase)
export interface ChatbotMessage {
  id?: string;
  message: string;
  senderType: "bot" | "user" | "system";
  conversationId?: string;
  messageType?: string;
  timestamp?: string;
  contextData?: Record<string, any>;
}

export interface ChatbotConversation {
  id?: string;
  sessionId: string;
  userId?: string;
  conversationData: ChatbotMessage[];
  careNeeds?: Record<string, any>;
  contactInfo?: Record<string, any>;
  handoffRequested?: boolean;
  convertedToRegistration?: boolean;
  leadScore?: number;
  qualificationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Database Types (snake_case)
export interface DbChatbotMessage {
  id?: string;
  message: string;
  sender_type: "bot" | "user" | "system";
  conversation_id?: string;
  message_type?: string;
  timestamp?: string;
  context_data?: Json;
}

export interface DbChatbotConversation {
  id?: string;
  session_id: string;
  user_id?: string;
  conversation_data: Json;
  care_needs?: Json;
  contact_info?: Json;
  handoff_requested?: boolean;
  converted_to_registration?: boolean;
  lead_score?: number;
  qualification_status?: string;
  created_at?: string;
  updated_at?: string;
}

// Type-safe service layer helpers to work around Supabase type issues
export type PostgresTable = keyof Database['public']['Tables'];
export type SupabaseGenericResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Adding this custom table type to handle type cast for Supabase
export type CustomTable = "chatbot_messages" | "chatbot_conversations";
