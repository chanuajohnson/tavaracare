
/**
 * Simple cache to track the last message for each session
 * to detect and prevent repetition
 */
const lastMessageCache = new Map<string, string>();

/**
 * Set the last message for a session
 */
export const setLastMessage = (sessionId: string, message: string): void => {
  if (!sessionId || !message) return; // Prevent invalid entries
  console.log(`[messageCache] Storing message for session ${sessionId.substring(0, 6)}...`);
  lastMessageCache.set(sessionId, message);
};

/**
 * Check if the current message is too similar to the last message
 */
export const isRepeatMessage = (sessionId: string, message: string): boolean => {
  if (!sessionId || !message) return false; // Handle invalid input
  
  const lastMessage = lastMessageCache.get(sessionId);
  if (!lastMessage) return false;
  
  // Simple string similarity check (can be improved)
  const similarity = calculateSimilarity(lastMessage, message);
  const isRepeat = similarity > 0.8; // If more than 80% similar, consider a repeat
  
  if (isRepeat) {
    console.log(`[messageCache] Detected repeat message for session ${sessionId.substring(0, 6)}... (${(similarity * 100).toFixed(1)}% similar)`);
  }
  
  return isRepeat;
};

/**
 * Calculate similarity between two strings
 * Returns a value between 0 (completely different) and 1 (identical)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  // For invalid inputs, return 0
  if (!str1 || !str2) return 0;
  
  // For very short messages, use stricter comparison
  if (str1.length < 10 || str2.length < 10) {
    return str1.toLowerCase() === str2.toLowerCase() ? 1 : 0;
  }
  
  // For longer messages, use a simple word overlap calculation
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  // Count words in common
  let commonWords = 0;
  for (const word of words1) {
    if (words2.has(word)) commonWords++;
  }
  
  // Calculate similarity ratio
  return commonWords / Math.max(words1.size, words2.size);
};

/**
 * Clear the message cache for a session
 */
export const clearMessageCache = (sessionId: string): void => {
  lastMessageCache.delete(sessionId);
  console.log(`[messageCache] Cleared cache for session ${sessionId.substring(0, 6)}...`);
};

/**
 * Get the last message for a session (for debugging)
 */
export const getLastMessage = (sessionId: string): string | undefined => {
  return lastMessageCache.get(sessionId);
};
