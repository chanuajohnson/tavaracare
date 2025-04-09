
// Enum types for chatbot messages and conversations
export type ChatbotSenderType = 'user' | 'bot' | 'human_agent';
export type ChatbotMessageType = 'text' | 'option' | 'handoff' | 'form';
export type ChatbotStatus = 'active' | 'completed' | 'cancelled';
export type QualificationStatus = 'high' | 'medium' | 'low' | 'unqualified';

// Frontend (camelCase) models
export interface ChatOption {
  label: string;
  value: string;
}

export interface ChatbotMessage {
  id?: string;
  conversationId?: string;
  sessionId?: string;
  senderType: ChatbotSenderType;
  message: string;
  messageType?: ChatbotMessageType;
  timestamp?: string;
  options?: ChatOption[];
  contextData?: {
    options?: ChatOption[];
    [key: string]: any;
  };
}

export interface ContactInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
}

export interface CareNeeds {
  careType?: string[];
  relationship?: string;
  schedule?: string;
  additionalDetails?: string;
}

export interface ChatbotConversation {
  id?: string;
  sessionId: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: ChatbotStatus;
  leadScore?: number;
  handoffRequested?: boolean;
  convertedToRegistration?: boolean;
  conversationData?: ChatbotMessage[];
  contactInfo?: ContactInfo;
  careNeeds?: CareNeeds;
  qualificationStatus?: QualificationStatus;
  userRole?: 'family' | 'professional' | 'community';
}

// Database (snake_case) models for Supabase
export interface DbChatbotMessage {
  id?: string;
  conversation_id: string;
  sender_type: ChatbotSenderType;
  message: string;
  message_type?: ChatbotMessageType;
  timestamp?: string;
  context_data?: any;
}

export interface DbContactInfo {
  full_name?: string;
  email?: string;
  phone?: string;
  city?: string;
}

export interface DbCareNeeds {
  care_type?: string[];
  relationship?: string;
  schedule?: string;
  additional_details?: string;
}

export interface DbChatbotConversation {
  id?: string;
  session_id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: ChatbotStatus;
  lead_score?: number;
  handoff_requested?: boolean;
  converted_to_registration?: boolean;
  conversation_data?: any;
  contact_info?: any;
  care_needs?: any;
  qualification_status?: QualificationStatus;
  user_role?: 'family' | 'professional' | 'community';
}

// Insert types (omitting generated fields)
export type DbChatbotMessageInsert = DbChatbotMessage;
export type DbChatbotConversationInsert = Omit<DbChatbotConversation, 'created_at' | 'updated_at'>;

// Prefill types for registration forms
export interface ChatbotPrefillData {
  family?: Record<string, any>;
  professional?: Record<string, any>;
  community?: Record<string, any>;
}
