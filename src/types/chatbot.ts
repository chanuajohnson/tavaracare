
import { Json } from '@/integrations/supabase/types';

// Base message types
export type MessageSenderType = 'user' | 'system' | 'assistant';
export type MessageType = 'text' | 'option' | 'input' | 'form';

// Domain model types - used in application code
export interface ChatbotMessage {
  id?: string;
  sender: MessageSenderType;
  content: string;
  type?: MessageType;
  timestamp?: string;
  contextData?: Record<string, any>;
}

export interface ChatbotConversation {
  id?: string;
  userId?: string;
  sessionId: string;
  messages: ChatbotMessage[];
  createdAt?: string;
  updatedAt?: string;
  careNeeds?: Record<string, any>;
  contactInfo?: Record<string, any>;
  leadScore?: number;
  qualificationStatus?: string;
  handoffRequested?: boolean;
  convertedToRegistration?: boolean;
}

// Database model types - used for database operations
export interface DbChatbotMessage {
  id: string;
  conversation_id?: string;
  sender_type: string;
  message: string;
  message_type?: string;
  context_data?: Json;
  timestamp: string;
}

export interface DbChatbotConversation {
  id: string;
  user_id?: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  conversation_data: Json;
  care_needs?: Json;
  contact_info?: Json;
  lead_score?: number;
  qualification_status?: string;
  handoff_requested?: boolean;
  converted_to_registration?: boolean;
}

// Insert types - used specifically for database insert operations
export interface DbChatbotMessageInsert {
  conversation_id?: string;
  sender_type: string;
  message: string;
  message_type?: string;
  context_data?: any; // Use any for insert to avoid deep type instantiation
}

export interface DbChatbotConversationInsert {
  user_id?: string;
  session_id: string;
  conversation_data?: any; // Use any for insert to avoid deep type instantiation
  care_needs?: any; // Use any for insert to avoid deep type instantiation
  contact_info?: any; // Use any for insert to avoid deep type instantiation
  lead_score?: number;
  qualification_status?: string;
  handoff_requested?: boolean;
  converted_to_registration?: boolean;
}
