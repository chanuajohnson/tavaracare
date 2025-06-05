
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a session ID if one doesn't exist
 */
export const getOrCreateSessionId = (): string => {
  const existingSessionId = localStorage.getItem("tavara_chat_session");
  if (existingSessionId) {
    return existingSessionId;
  }
  
  const newSessionId = uuidv4();
  localStorage.setItem("tavara_chat_session", newSessionId);
  return newSessionId;
};
