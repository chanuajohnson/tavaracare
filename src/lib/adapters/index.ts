
// Re-export all adapters for convenient imports
export * from './adapter-utils';
export * from './chatbot-message-adapter';
export * from './chatbot-conversation-adapter';
export * from './registration-adapter';

// Additional type exports for convenience
export type {
  DbChatbotMessage,
  DbChatbotConversation,
  DbRegistrationProgress
} from '@/lib/adapters/chatbot-message-adapter';
