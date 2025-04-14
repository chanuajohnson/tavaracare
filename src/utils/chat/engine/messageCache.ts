
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
  return similarity > 0.8; // If more than 80% similar, consider a repeat
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
};
