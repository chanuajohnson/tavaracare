
/**
 * Chatbot component and data types
 */

// Enum for chat step types
export enum ChatStepType {
  WELCOME = 'welcome',
  RELATIONSHIP = 'relationship',
  CARE_TYPE = 'care_type',
  CARE_SCHEDULE = 'care_schedule',
  CONTACT_INFO = 'contact_info',
  LOCATION = 'location',
  ROLE_IDENTIFICATION = 'role_identification',
  REGISTRATION_CTA = 'registration_cta',
  FAREWELL = 'farewell',
}

// Enum for sender types matching DB enum
export enum ChatSenderType {
  USER = 'user',
  BOT = 'bot',
  HUMAN_AGENT = 'human_agent',
}

// Enum for message types matching DB enum
export enum ChatMessageType {
  TEXT = 'text',
  OPTION = 'option',
  HANDOFF = 'handoff',
  FORM = 'form',
}

// Enum for chatbot status matching DB enum
export enum ChatbotStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

// Enum for lead quality matching DB enum
export enum LeadQuality {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNQUALIFIED = 'unqualified',
}

// Type for chat message option buttons
export interface ChatOption {
  label: string;
  value: string;
  action?: () => void;
}

// Type for contact information collected through chat
export interface ContactInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
}

// Type for care needs information collected through chat
export interface CareNeeds {
  relationship?: string;
  careType?: string[];
  schedule?: string;
  urgency?: string;
  specialNeeds?: string[];
  role?: 'family' | 'professional' | 'community';
}

// Type for a chat message
export interface ChatbotMessage {
  id?: string;
  conversationId?: string;
  senderType: ChatSenderType;
  message: string;
  messageType?: ChatMessageType;
  timestamp?: string;
  contextData?: {
    step?: ChatStepType;
    options?: ChatOption[];
    [key: string]: any;
  };
}

// Type for a chat conversation
export interface ChatbotConversation {
  id?: string;
  sessionId: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: ChatbotStatus;
  leadScore?: number;
  qualificationStatus?: string;
  conversationData: ChatbotMessage[];
  contactInfo?: ContactInfo;
  careNeeds?: CareNeeds;
  handoffRequested?: boolean;
  convertedToRegistration?: boolean;
}

// Type for chat flow state
export interface ChatFlowState {
  currentStep: ChatStepType;
  conversation: ChatbotConversation;
  isLoading: boolean;
  isMinimized: boolean;
  isOpen: boolean;
  sessionId: string;
}

// Types for chat flow actions
export type ChatFlowAction =
  | { type: 'SET_STEP'; payload: ChatStepType }
  | { type: 'ADD_MESSAGE'; payload: ChatbotMessage }
  | { type: 'SET_CONVERSATION'; payload: ChatbotConversation }
  | { type: 'UPDATE_CONTACT_INFO'; payload: Partial<ContactInfo> }
  | { type: 'UPDATE_CARE_NEEDS'; payload: Partial<CareNeeds> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MINIMIZED'; payload: boolean }
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'RESET' };
