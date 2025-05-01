
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
