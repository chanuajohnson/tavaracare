
/**
 * Simple session storage utility to replace Supabase in Phase 1
 */

// Generate a random session ID if needed
export function getOrCreateSessionId(): string {
  const storageKey = 'tavara_chat_session_id';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = generateRandomId();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

// Generate a random ID for message and conversation IDs
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Store chat messages in local storage
export function storeMessages(messages: any[]): void {
  localStorage.setItem('tavara_chat_messages', JSON.stringify(messages));
}

// Retrieve chat messages from local storage
export function getStoredMessages(): any[] {
  const stored = localStorage.getItem('tavara_chat_messages');
  return stored ? JSON.parse(stored) : [];
}

// Clear chat session
export function clearChatSession(): void {
  localStorage.removeItem('tavara_chat_session_id');
  localStorage.removeItem('tavara_chat_messages');
}
