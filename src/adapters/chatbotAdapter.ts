
import { 
  ChatbotConversation,
  ChatbotMessage,
  ChatSenderType,
  ChatMessageType,
  ChatbotStatus
} from '@/types/chatbotTypes';
import { fromJson, toJson } from '@/utils/json';

// Define the database types that match our Supabase tables
export type ChatbotConversationDto = {
  id?: string;
  session_id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'completed' | 'abandoned';
  lead_score?: number;
  qualification_status?: string;
  conversation_data: any;
  contact_info?: any;
  care_needs?: any;
  handoff_requested?: boolean;
  converted_to_registration?: boolean;
};

export type ChatbotMessageDto = {
  id?: string;
  conversation_id?: string;
  sender_type: 'user' | 'bot' | 'human_agent';
  message: string;
  message_type?: 'text' | 'option' | 'handoff' | 'form';
  timestamp?: string;
  context_data?: any;
};

// Function to convert from frontend model to database model for a conversation
export function toConversationDto(conversation: Partial<ChatbotConversation>): ChatbotConversationDto {
  // Ensure conversationData is always defined
  const conversationData = conversation.conversationData || [];
  
  return {
    id: conversation.id,
    session_id: conversation.sessionId || '',
    user_id: conversation.userId,
    created_at: conversation.createdAt,
    updated_at: conversation.updatedAt,
    status: conversation.status as 'active' | 'completed' | 'abandoned',
    lead_score: conversation.leadScore,
    qualification_status: conversation.qualificationStatus,
    conversation_data: toJson(conversationData),
    contact_info: toJson(conversation.contactInfo || {}),
    care_needs: toJson(conversation.careNeeds || {}),
    handoff_requested: conversation.handoffRequested,
    converted_to_registration: conversation.convertedToRegistration,
  };
}

// Function to convert from database model to frontend model for a conversation
export function fromConversationDto(dto: ChatbotConversationDto): ChatbotConversation {
  return {
    id: dto.id,
    sessionId: dto.session_id,
    userId: dto.user_id,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    status: dto.status as ChatbotStatus,
    leadScore: dto.lead_score,
    qualificationStatus: dto.qualification_status,
    conversationData: fromJson<ChatbotMessage[]>(dto.conversation_data, []),
    contactInfo: fromJson(dto.contact_info, {}),
    careNeeds: fromJson(dto.care_needs, {}),
    handoffRequested: dto.handoff_requested,
    convertedToRegistration: dto.converted_to_registration,
  };
}

// Function to convert from frontend model to database model for a message
export function toMessageDto(message: ChatbotMessage): ChatbotMessageDto {
  return {
    id: message.id,
    conversation_id: message.conversationId,
    sender_type: message.senderType as 'user' | 'bot' | 'human_agent',
    message: message.message,
    message_type: message.messageType as 'text' | 'option' | 'handoff' | 'form',
    timestamp: message.timestamp,
    context_data: toJson(message.contextData || {}),
  };
}

// Function to convert from database model to frontend model for a message
export function fromMessageDto(dto: ChatbotMessageDto): ChatbotMessage {
  return {
    id: dto.id,
    conversationId: dto.conversation_id,
    senderType: dto.sender_type as ChatSenderType,
    message: dto.message,
    messageType: dto.message_type as ChatMessageType,
    timestamp: dto.timestamp,
    contextData: fromJson(dto.context_data, {}),
  };
}
