
/**
 * Legacy adapter file that forwards to new modular adapter implementation
 * This file is kept for backward compatibility
 */

// Re-export everything from the new structure
export {
  snakeToCamel,
  camelToSnake,
  adaptFromDb,
  adaptToDb,
  toJson,
  adaptChatbotMessage,
  adaptChatbotMessageToDb,
  adaptChatbotConversation,
  adaptChatbotConversationToDb,
  adaptRegistrationProgress,
  adaptRegistrationProgressToDb,
  chatbotMessageSchema
} from './adapters';

// Re-export types
export type {
  DbChatbotMessage,
  DbChatbotConversation,
  DbRegistrationProgress
} from './adapters';
