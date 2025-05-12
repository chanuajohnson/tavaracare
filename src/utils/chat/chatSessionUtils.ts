
/**
 * Clears all chat session related data from localStorage
 * Call this function after successful registration or when chat flow is complete
 * 
 * @param sessionId Optional specific session ID to clear. If not provided, will use the current session ID from localStorage
 */
export const clearChatSessionData = (sessionId?: string): void => {
  const chatSessionId = sessionId || localStorage.getItem("tavara_chat_session");
  
  if (!chatSessionId) {
    console.log('No chat session ID found to clear');
    return;
  }
  
  console.log('Clearing chat session data for:', chatSessionId);
  
  // Clear chat session flags
  localStorage.removeItem(`tavara_chat_completed_${chatSessionId}`);
  localStorage.removeItem(`tavara_chat_prefill_${chatSessionId}`);
  localStorage.removeItem(`tavara_chat_transition_${chatSessionId}`);
  localStorage.removeItem(`tavara_chat_auto_redirect_${chatSessionId}`);
  
  // Optionally, clear the session ID itself if the chat flow is completely done
  localStorage.removeItem("tavara_chat_session");
  
  // Additional chat-related items that might need to be cleared
  localStorage.removeItem(`tavara_chat_role_${chatSessionId}`);
  localStorage.removeItem(`tavara_chat_progress_${chatSessionId}`);
  localStorage.removeItem(`tavara_chat_responses_${chatSessionId}`);
  localStorage.removeItem(`tavara_chat_messages_${chatSessionId}`);
  
  // Reference code storage
  localStorage.removeItem(`tavara_chat_reference_${chatSessionId}`);
  
  // Context awareness data
  localStorage.removeItem(`tavara_chat_context_${chatSessionId}`);
  localStorage.removeItem(`tavara_chat_context_score_${chatSessionId}`);
};

/**
 * Checks if the chat widget should be displayed in a compact/mobile layout
 * based on the device screen size
 * 
 * @returns boolean indicating if compact layout should be used
 */
export const shouldUseCompactLayout = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Generate a support reference code in the format TV-YYMMDD-XXXXX
 * This matches the Tavara.care support reference format specified in the guidelines
 * 
 * @returns string with a unique support reference code
 */
export const generateSupportReference = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate a random 5-character alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `TV-${dateStr}-${randomStr}`;
};

/**
 * Stores a support reference code for the current session
 * 
 * @param sessionId The session ID to associate with the reference code
 * @param referenceCode The reference code to store
 */
export const storeSupportReference = (sessionId: string, referenceCode: string): void => {
  if (!sessionId || !referenceCode) return;
  
  try {
    localStorage.setItem(`tavara_chat_reference_${sessionId}`, referenceCode);
    console.log(`Stored support reference ${referenceCode} for session ${sessionId.substring(0, 8)}`);
  } catch (error) {
    console.error('Error storing support reference:', error);
  }
};

/**
 * Gets the stored support reference code for the given session
 * 
 * @param sessionId The session ID to retrieve the reference code for
 * @returns The stored reference code or null if not found
 */
export const getSupportReference = (sessionId: string): string | null => {
  if (!sessionId) return null;
  
  try {
    return localStorage.getItem(`tavara_chat_reference_${sessionId}`);
  } catch (error) {
    console.error('Error retrieving support reference:', error);
    return null;
  }
};

/**
 * Get appropriate width for the chat widget based on device type
 * 
 * @returns string with appropriate width value
 */
export const getChatWidgetWidth = (): string => {
  if (shouldUseCompactLayout()) {
    return '100%';  // For mobile devices
  }
  return '350px';   // For desktop
};
