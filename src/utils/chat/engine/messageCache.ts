// Keep track of the last message sent to avoid repetition
const lastMessages = new Map<string, string>();

/**
 * Get a cached message for a session
 */
export const getLastMessage = (sessionId: string): string | undefined => {
  return lastMessages.get(sessionId);
};

/**
 * Cache a message for a session
 */
export const setLastMessage = (sessionId: string, message: string): void => {
  lastMessages.set(sessionId, message);
};

/**
 * Check if a message is the same as the last one
 */
export const isRepeatMessage = (sessionId: string, message: string): boolean => {
  return lastMessages.get(sessionId) === message;
};
