
import { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';
import { ChatbotMessage, ChatbotConversation } from '@/types/chatbot';
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
  contextData: z.record(z.unknown()).optional()
});

// Specific adapters for our main entities
export function adaptChatbotMessage(dbMessage: DbChatbotMessage): ChatbotMessage {
  const adapted = adaptFromDb<ChatbotMessage>(dbMessage);
  return chatbotMessageSchema.parse(adapted);
}

export function adaptChatbotMessageToDb(message: ChatbotMessage): DbChatbotMessage {
  return adaptToDb<DbChatbotMessage>({
    id: message.id,
    message: message.message,
    sender_type: message.senderType,
    timestamp: message.timestamp,
    message_type: message.messageType,
    context_data: message.contextData || {}
  });
}

export function adaptChatbotConversation(dbConversation: DbChatbotConversation): ChatbotConversation {
  const adapted = adaptFromDb<any>(dbConversation);
  
  // Handle the conversation_data field explicitly to ensure proper typing
  const conversationData = Array.isArray(dbConversation.conversation_data) 
    ? dbConversation.conversation_data.map((msg: any) => {
        try {
          return chatbotMessageSchema.parse(adaptFromDb(msg));
        } catch (e) {
          console.error('Invalid message format in conversation data:', msg, e);
          // Provide a fallback with required fields
          return {
            id: msg.id || 'invalid-id',
            message: msg.message || 'Invalid message format',
            senderType: 'system',
            timestamp: msg.timestamp || new Date().toISOString()
          };
        }
      })
    : [];
  
  return {
    ...adapted,
    conversationData
  } as ChatbotConversation;
}

export function adaptChatbotConversationToDb(conversation: ChatbotConversation): Omit<DbChatbotConversation, 'created_at' | 'updated_at'> {
  // Handle the special case of conversationData
  const conversationData = conversation.conversationData?.map(msg => ({
    id: msg.id,
    message: msg.message,
    sender_type: msg.senderType,
    timestamp: msg.timestamp,
    message_type: msg.messageType,
    context_data: msg.contextData
  })) || [];
  
  return {
    id: conversation.id,
    user_id: conversation.userId,
    session_id: conversation.sessionId,
    conversation_data: conversationData as unknown as Json,
    care_needs: conversation.careNeeds as unknown as Json,
    qualification_status: conversation.qualificationStatus,
    lead_score: conversation.leadScore,
    handoff_requested: conversation.handoffRequested,
    converted_to_registration: conversation.convertedToRegistration,
    contact_info: conversation.contactInfo as unknown as Json
  };
}

export function adaptRegistrationProgress(dbProgress: DbRegistrationProgress): RegistrationProgress {
  return adaptFromDb<RegistrationProgress>(dbProgress);
}

export function adaptRegistrationProgressToDb(progress: Partial<RegistrationProgress>): Partial<DbRegistrationProgress> {
  return adaptToDb<Partial<DbRegistrationProgress>>(progress);
}
