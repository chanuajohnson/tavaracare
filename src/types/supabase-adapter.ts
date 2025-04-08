
/**
 * Type adapter to connect our custom types with Supabase types.
 * This file serves as a bridge between our frontend models and database schema.
 */
import { Database } from '@/integrations/supabase/types';
import { ChatbotConversationsTable, ChatbotMessagesTable, RegistrationProgressTable } from './chatbot';

/**
 * Type definitions for tables that are not properly defined in the generated types
 */
export interface CustomSupabaseTables {
  chatbot_conversations: {
    Row: ChatbotConversationsTable;
    Insert: Omit<ChatbotConversationsTable, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<ChatbotConversationsTable, 'id' | 'created_at'>>;
  };
  chatbot_messages: {
    Row: ChatbotMessagesTable;
    Insert: Omit<ChatbotMessagesTable, 'id'>;
    Update: Partial<Omit<ChatbotMessagesTable, 'id'>>;
  };
  registration_progress: {
    Row: RegistrationProgressTable;
    Insert: Omit<RegistrationProgressTable, 'id' | 'created_at' | 'updated_at' | 'last_active_at'>;
    Update: Partial<Omit<RegistrationProgressTable, 'id' | 'created_at'>>;
  };
}

/**
 * Extended Database type that includes our custom tables
 */
export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & CustomSupabaseTables;
  };
}

/**
 * Helper function to convert snake_case database objects to camelCase for frontend
 */
export function snakeToCamel<T>(obj: any): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    // Convert key from snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Recursively convert nested objects
    const value = obj[key];
    result[camelKey] = snakeToCamel(value);
    
    return result;
  }, {} as any) as T;
}

/**
 * Helper function to convert camelCase frontend objects to snake_case for database
 */
export function camelToSnake<T>(obj: any): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    // Convert key from camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
    
    // Recursively convert nested objects
    const value = obj[key];
    result[snakeKey] = camelToSnake(value);
    
    return result;
  }, {} as any) as T;
}
