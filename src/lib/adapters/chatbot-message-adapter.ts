
import { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';
import { ChatbotMessage, SenderType, MessageType } from '@/types/chatbot';
import { z } from 'zod';
import { adaptFromDb } from './adapter-utils';
import { toJson } from './adapter-utils';

// Type definition for database table
export type DbChatbotMessage = Database['public']['Tables']['chatbot_messages']['Row'];

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

/**
 * Adapter for converting database message to frontend message
 */
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

/**
 * Adapter for converting frontend message to database format
 */
export function adaptChatbotMessageToDb(message: Partial<ChatbotMessage>): Record<string, any> {
  // Ensure we have required fields before converting
  const validated: Partial<ChatbotMessage> = { ...message };
  
  if (!validated.id) {
    validated.id = crypto.randomUUID();
  }
  
  if (!validated.timestamp) {
    validated.timestamp = new Date().toISOString();
  }
  
  // Verify required fields are present
  if (!validated.message) {
    throw new Error("Message content is required");
  }
  
  if (!validated.senderType) {
    throw new Error("Sender type is required");
  }
  
  // Convert to DB format with exact field names expected by Supabase
  return {
    id: validated.id,
    message: validated.message,
    sender_type: validated.senderType,
    timestamp: validated.timestamp,
    message_type: validated.messageType,
    context_data: validated.contextData ? toJson(validated.contextData) : null,
    conversation_id: validated.conversationId
  };
}
