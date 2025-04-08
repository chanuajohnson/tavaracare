
import { z } from 'zod';
import { chatbotMessageSchema } from './supabase-adapter';

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
export function safeChatbotMessage(data: unknown): any {
  try {
    return chatbotMessageSchema.parse(data);
  } catch (error) {
    console.error('Invalid ChatbotMessage, using fallback:', error);
    return {
      id: 'invalid-id',
      message: 'Invalid message format',
      senderType: 'system',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Type guard function to check if something is a ChatbotMessage
 */
export function isChatbotMessage(data: unknown): boolean {
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
