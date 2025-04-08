export type SenderType = 'bot' | 'user' | 'system';
export type MessageType = 'greeting' | 'question' | 'response' | 'suggestion' | 'action';

export interface ChatbotMessage {
  id: string;
  message: string;
  senderType: SenderType;
  timestamp: string;
  messageType?: MessageType;
  contextData?: Record<string, any> | null;
  conversationId?: string; // This maps to conversation_id in DB
}

export interface ChatbotConversation {
  id: string;
  userId?: string;
  sessionId: string;
  conversationData: ChatbotMessage[];
  careNeeds?: Record<string, any> | null;
  qualificationStatus?: string;
  leadScore?: number;
  createdAt: string;
  updatedAt: string;
  convertedToRegistration: boolean;
  contactInfo?: Record<string, any> | null;
  handoffRequested: boolean;
}

export interface ChatbotState {
  conversation: ChatbotConversation | null;
  currentMessage: string;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

export interface ChatbotAction {
  type: string;
  label: string;
  action: () => void;
  icon?: React.ReactNode;
}

// Database table types for Supabase
export interface ChatbotConversationsTable {
  id: string;
  user_id?: string;
  session_id: string;
  conversation_data: any;
  care_needs?: any;
  qualification_status?: string;
  lead_score?: number;
  created_at: string;
  updated_at: string;
  converted_to_registration: boolean;
  contact_info?: any;
  handoff_requested: boolean;
}

export interface ChatbotMessagesTable {
  id: string;
  conversation_id?: string;
  message: string;
  sender_type: string;
  timestamp: string;
  message_type?: string;
  context_data?: any;
}

export interface RegistrationProgressTable {
  id: string;
  user_id?: string;
  session_id?: string;
  email?: string;
  current_step: string;
  registration_data: any;
  status: string;
  care_type?: string[];
  urgency?: string;
  created_at: string;
  updated_at: string;
  last_active_at: string;
  completed_steps: any;
  total_steps?: number;
  completed_step_count?: number;
  referral_source?: string;
  device_info?: any;
}

// Type guard function for type safety
export function isChatbotConversationsTable(obj: any): obj is ChatbotConversationsTable {
  return obj 
    && typeof obj.id === 'string'
    && typeof obj.session_id === 'string';
}

export function isChatbotMessagesTable(obj: any): obj is ChatbotMessagesTable {
  return obj 
    && typeof obj.id === 'string'
    && typeof obj.message === 'string'
    && typeof obj.sender_type === 'string';
}

export function isRegistrationProgressTable(obj: any): obj is RegistrationProgressTable {
  return obj 
    && typeof obj.id === 'string'
    && typeof obj.current_step === 'string';
}

// Helper utility for safe JSON conversion
export const toJson = <T>(value: T): any => {
  if (value === undefined) return null;
  
  try {
    // Handle special cases
    if (value === null) return null;
    
    // Use a more robust approach for deeply nested objects
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    console.error('Error converting to JSON:', e);
    return null;
  }
};
