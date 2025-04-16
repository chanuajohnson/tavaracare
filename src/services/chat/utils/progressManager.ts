
/**
 * Chat progress management utilities
 */

/**
 * Updates chat progress in storage
 */
export const updateChatProgress = async (
  sessionId: string,
  role: string,
  sectionIndex: string,
  status: string,
  currentQuestion?: string,
  formData?: Record<string, any>
): Promise<boolean> => {
  try {
    // Save the progress to localStorage for now
    // In a real implementation, this would likely be sending data to a server
    const progressData = {
      sessionId,
      role,
      sectionIndex,
      status,
      currentQuestion,
      formData,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`tavara_chat_progress_${sessionId}`, JSON.stringify(progressData));
    return true;
  } catch (error) {
    console.error('Error updating chat progress:', error);
    return false;
  }
};

/**
 * Saves a chat response to storage
 */
export const saveChatResponse = async (
  sessionId: string,
  role: string,
  sectionIndex: string,
  questionId: string,
  response: string | string[]
): Promise<boolean> => {
  try {
    // Get existing responses or initialize an empty object
    const existingResponses = JSON.parse(localStorage.getItem(`tavara_chat_responses_${sessionId}`) || '{}');
    
    // Add the new response
    existingResponses[questionId] = {
      response,
      role,
      sectionIndex,
      timestamp: Date.now()
    };
    
    // Save back to localStorage
    localStorage.setItem(`tavara_chat_responses_${sessionId}`, JSON.stringify(existingResponses));
    return true;
  } catch (error) {
    console.error('Error saving chat response:', error);
    return false;
  }
};

/**
 * Retrieves all responses for a session
 */
export const getSessionResponses = async (sessionId: string): Promise<Record<string, any>> => {
  try {
    const responses = localStorage.getItem(`tavara_chat_responses_${sessionId}`);
    return responses ? JSON.parse(responses) : {};
  } catch (error) {
    console.error('Error getting session responses:', error);
    return {};
  }
};
