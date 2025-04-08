
import { z } from 'zod';
import { chatbotMessageSchema } from './supabase-adapter';
import { ChatbotMessage, ChatbotConversation } from '@/types/chatbot';
import { RegistrationProgress } from '@/types/registration';

/**
 * Helper function to ensure data conforms to expected shape at runtime
 * This provides runtime validation of data received from the database
 */
export function validateChatbotMessage(data: unknown): boolean {
  try {
    chatbotMessageSchema.parse(data);
    return true;
  } catch (error) {
    console.error('Invalid ChatbotMessage format:', error);
    return false;
  }
}

/**
 * Safety wrapper to ensure data conforms to expected shape and fallback if not
 */
export function safeChatbotMessage(data: unknown): ChatbotMessage {
  try {
    return chatbotMessageSchema.parse(data) as ChatbotMessage;
  } catch (error) {
    console.error('Invalid ChatbotMessage, using fallback:', error);
    return {
      id: crypto.randomUUID(),
      message: 'Invalid message format',
      senderType: 'system',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Type guard function to check if something is a ChatbotMessage
 */
export function isChatbotMessage(data: unknown): data is ChatbotMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'message' in data &&
    'senderType' in data &&
    'timestamp' in data
  );
}

/**
 * Type guard for ChatbotConversation
 */
export function isChatbotConversation(data: unknown): data is ChatbotConversation {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'sessionId' in data &&
    'conversationData' in data &&
    Array.isArray((data as any).conversationData)
  );
}

/**
 * Type guard for RegistrationProgress
 */
export function isRegistrationProgress(data: unknown): data is RegistrationProgress {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'currentStep' in data &&
    'registrationData' in data
  );
}

/**
 * Helper to create typesafe Zod schemas for our database entities
 */
export function createSchemaFor<T>(schemaDefinition: z.ZodRawShape): z.ZodObject<z.ZodRawShape> {
  return z.object(schemaDefinition);
}

/**
 * JSON field validator for runtime validation of JSON data
 */
export function validateJsonField<T>(
  data: unknown,
  schema: z.ZodType<T>
): { valid: boolean; value: T | null; errors?: z.ZodError } {
  try {
    const parsed = schema.parse(data);
    return { valid: true, value: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, value: null, errors: error };
    }
    return { valid: false, value: null };
  }
}

/**
 * Ensure array has the expected shape and items
 */
export function validateArray<T>(
  data: unknown,
  itemSchema: z.ZodType<T>
): T[] {
  if (!Array.isArray(data)) {
    return [];
  }
  
  return data
    .map(item => {
      try {
        return itemSchema.parse(item);
      } catch (e) {
        console.error('Invalid array item:', e);
        return null;
      }
    })
    .filter((item): item is T => item !== null);
}

/**
 * Safe casting helper for Supabase data
 */
export function safelyAdaptFromDb<T>(
  data: unknown | null | undefined,
  validator: (item: unknown) => boolean,
  adapter: (item: any) => T,
  fallback: T
): T {
  if (!data) return fallback;
  
  try {
    if (validator(data)) {
      return adapter(data);
    }
    return fallback;
  } catch (e) {
    console.error('Error adapting data:', e);
    return fallback;
  }
}
