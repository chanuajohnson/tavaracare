import { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';
import { 
  ChatbotMessage, 
  ChatbotConversation, 
  SenderType, 
  MessageType,
  toJson
} from '@/types/chatbot';
import { RegistrationProgress } from '@/types/registration';
import { z } from 'zod';

/**
 * Type-safe adapter functions for Supabase data conversion
 * Bridge between database snake_case and frontend camelCase
 */

// Helper to convert snake_case to camelCase
export function snakeToCamel(s: string): string {
  return s.replace(/(_\w)/g, m => m[1].toUpperCase());
}

// Helper to convert camelCase to snake_case
export function camelToSnake(s: string): string {
  return s.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`);
}

// Adapter for converting snake_case keys to camelCase
export function adaptFromDb<T extends object>(data: Record<string, any>): T {
  if (!data) return {} as T;
  
  const result: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    const camelKey = snakeToCamel(key);
    let value = data[key];
    
    // Handle nested objects including arrays
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        value = value.map(item => 
          typeof item === 'object' && item !== null ? adaptFromDb(item) : item
        );
      } else {
        value = adaptFromDb(value);
      }
    }
    
    result[camelKey] = value;
  });
  
  return result as T;
}

// Adapter for converting camelCase keys to snake_case
export function adaptToDb<T extends object>(data: Record<string, any>): T {
  if (!data) return {} as T;
  
  const result: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    const snakeKey = camelToSnake(key);
    let value = data[key];
    
    // Handle nested objects including arrays
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        value = value.map(item => 
          typeof item === 'object' && item !== null ? adaptToDb(item) : item
        );
      } else {
        value = adaptToDb(value);
      }
    }
    
    result[snakeKey] = value;
  });
  
  return result as T;
}

// Type definitions for database tables
export type DbChatbotConversation = Database['public']['Tables']['chatbot_conversations']['Row'];
export type DbChatbotMessage = Database['public']['Tables']['chatbot_messages']['Row'];
export type DbRegistrationProgress = Database['public']['Tables']['registration_progress']['Row'];

// Zod schema for ChatbotMessage for runtime validation
export const chatbotMessageSchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  senderType: z.union([z.literal('bot'), z.literal('user'), z.literal('system')]),
  timestamp: z.string(),
  messageType: z.union([
    z.literal('greeting'),
    z.literal('question'),
    z.literal('response'),
    z.literal('suggestion'),
    z.literal('action')
  ]).optional(),
  contextData: z.record(z.unknown()).nullable().optional(),
  conversationId: z.string().optional()
});

// Specific adapters for our main entities
export function adaptChatbotMessage(dbMessage: DbChatbotMessage): ChatbotMessage {
  // First convert keys from snake_case to camelCase
  const adapted = adaptFromDb<Record<string, any>>(dbMessage);
  
  // Ensure required fields are present with default values if needed
  const validatedMessage: ChatbotMessage = {
    id: adapted.id || crypto.randomUUID(),
    message: adapted.message || '',
    senderType: (adapted.senderType as SenderType) || 'system',
    timestamp: adapted.timestamp || new Date().toISOString(),
    messageType: adapted.messageType as MessageType | undefined,
    contextData: adapted.contextData ? adapted.contextData as Record<string, any> : undefined,
    conversationId: dbMessage.conversation_id
  };
  
  // Run validation to ensure the adapted message meets our schema
  try {
    chatbotMessageSchema.parse(validatedMessage);
  } catch (e) {
    console.error('Invalid message format:', e);
  }
  
  return validatedMessage;
}

export function adaptChatbotMessageToDb(message: Partial<ChatbotMessage>): Record<string, any> {
  // Ensure we have required fields before converting
  const validated: Partial<ChatbotMessage> = { ...message };
  
  if (!validated.id) {
    validated.id = crypto.randomUUID();
  }
  
  if (!validated.timestamp) {
    validated.timestamp = new Date().toISOString();
  }
  
  // Convert camelCase to snake_case
  return {
    id: validated.id,
    message: validated.message || '',
    sender_type: validated.senderType || 'system',
    timestamp: validated.timestamp,
    message_type: validated.messageType,
    context_data: validated.contextData ? toJson(validated.contextData) : null,
    conversation_id: validated.conversationId
  };
}

export function adaptChatbotConversation(dbConversation: DbChatbotConversation): ChatbotConversation {
  const adapted = adaptFromDb<any>(dbConversation);
  
  // Handle the conversation_data field explicitly to ensure proper typing
  let conversationData: ChatbotMessage[] = [];
  
  if (Array.isArray(dbConversation.conversation_data)) {
    conversationData = (dbConversation.conversation_data as any[]).map(msg => {
      try {
        return {
          id: msg.id || crypto.randomUUID(),
          message: msg.message || '',
          senderType: msg.sender_type as SenderType || 'system',
          timestamp: msg.timestamp || new Date().toISOString(),
          messageType: msg.message_type as MessageType | undefined,
          contextData: msg.context_data ? msg.context_data as Record<string, any> : undefined
        };
      } catch (e) {
        console.error('Invalid message format in conversation data:', msg, e);
        // Provide a fallback with required fields
        return {
          id: crypto.randomUUID(),
          message: 'Invalid message format',
          senderType: 'system' as SenderType,
          timestamp: new Date().toISOString()
        };
      }
    });
  }
  
  return {
    id: adapted.id,
    userId: adapted.userId,
    sessionId: adapted.sessionId,
    conversationData: conversationData,
    careNeeds: adapted.careNeeds as Record<string, any> | null,
    qualificationStatus: adapted.qualificationStatus,
    leadScore: adapted.leadScore,
    createdAt: adapted.createdAt || new Date().toISOString(),
    updatedAt: adapted.updatedAt || new Date().toISOString(),
    convertedToRegistration: adapted.convertedToRegistration || false,
    contactInfo: adapted.contactInfo as Record<string, any> | null,
    handoffRequested: adapted.handoffRequested || false
  };
}

export function adaptChatbotConversationToDb(conversation: Partial<ChatbotConversation>): Record<string, any> {
  if (!conversation) return {};
  
  // Handle the special case of conversationData
  const conversationData = conversation.conversationData?.map(msg => ({
    id: msg.id,
    message: msg.message,
    sender_type: msg.senderType,
    timestamp: msg.timestamp,
    message_type: msg.messageType,
    context_data: toJson(msg.contextData)
  })) || [];
  
  return {
    id: conversation.id,
    user_id: conversation.userId,
    session_id: conversation.sessionId,
    conversation_data: toJson(conversationData),
    care_needs: conversation.careNeeds ? toJson(conversation.careNeeds) : null,
    qualification_status: conversation.qualificationStatus,
    lead_score: conversation.leadScore,
    handoff_requested: conversation.handoffRequested,
    converted_to_registration: conversation.convertedToRegistration,
    contact_info: conversation.contactInfo ? toJson(conversation.contactInfo) : null
  };
}

export function adaptRegistrationProgress(dbProgress: DbRegistrationProgress): RegistrationProgress {
  return adaptFromDb<RegistrationProgress>(dbProgress);
}

export function adaptRegistrationProgressToDb(progress: Partial<RegistrationProgress>): Partial<DbRegistrationProgress> {
  return adaptToDb<Partial<DbRegistrationProgress>>(progress);
}
