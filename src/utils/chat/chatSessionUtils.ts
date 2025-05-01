
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
  // Uncomment this if you want to completely reset the chat flow
  localStorage.removeItem("tavara_chat_session");
  
  // Additional chat-related items that might need to be cleared
  localStorage.removeItem(`tavara_chat_role_${chatSessionId}`);
  localStorage.removeItem(`tavara_chat_progress_${chatSessionId}`);
};
