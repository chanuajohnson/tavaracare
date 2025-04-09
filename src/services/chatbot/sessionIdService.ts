
import { v4 as uuidv4 } from 'uuid';

// Generate a unique session ID
export function generateSessionId(): string {
  return uuidv4();
}

// Get or create a session ID from localStorage
export async function getOrCreateSessionId(): Promise<string> {
  const storedSessionId = localStorage.getItem('chatbot_session_id');
  
  if (storedSessionId) {
    return storedSessionId;
  }
  
  const newSessionId = generateSessionId();
  localStorage.setItem('chatbot_session_id', newSessionId);
  
  return newSessionId;
}
