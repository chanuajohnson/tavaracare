
import { v4 as uuidv4 } from 'uuid';
import { ChatbotConversation } from '@/types/chatbotTypes';
import { createConversation, getConversation } from './conversationService';

/**
 * Gets or creates a session ID for the current user
 * @returns The session ID
 */
export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('chat_session_id');
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('chat_session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * Initializes a conversation, creating a new one if needed
 * @returns The conversation
 */
export async function initializeConversation(): Promise<ChatbotConversation | null> {
  const sessionId = getOrCreateSessionId();
  
  // Try to find existing conversation
  let conversation = await getConversation(sessionId);
  
  // Create new conversation if none exists
  if (!conversation) {
    conversation = await createConversation(sessionId);
  }
  
  return conversation;
}
