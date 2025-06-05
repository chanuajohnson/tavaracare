
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
    // Get existing progress data to merge with
    const existingProgress = JSON.parse(localStorage.getItem(`tavara_chat_progress_${sessionId}`) || '{}');
    
    // Save the progress to localStorage for now
    // In a real implementation, this would likely be sending data to a server
    const progressData = {
      ...existingProgress,
      sessionId,
      role,
      sectionIndex,
      status,
      currentQuestion,
      lastActive: Date.now(),
      ...(formData ? { formData: { ...existingProgress.formData, ...formData } } : {})
    };
    
    localStorage.setItem(`tavara_chat_progress_${sessionId}`, JSON.stringify(progressData));
    console.log(`[progressManager] Updated progress for session ${sessionId.substring(0, 6)}...`, { 
      role, 
      sectionIndex, 
      status 
    });
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
    console.log(`[progressManager] Saved response for question ${questionId}`);
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
    const parsed = responses ? JSON.parse(responses) : {};
    console.log(`[progressManager] Retrieved ${Object.keys(parsed).length} responses for session ${sessionId.substring(0, 6)}...`);
    return parsed;
  } catch (error) {
    console.error('Error getting session responses:', error);
    return {};
  }
};

/**
 * Get a summary of completed questions
 */
export const getCompletedQuestionsSummary = async (sessionId: string): Promise<string> => {
  try {
    const responses = await getSessionResponses(sessionId);
    const questionCount = Object.keys(responses).length;
    
    if (questionCount === 0) {
      return "We don't have any information from you yet.";
    }
    
    // Just a simple summary for now - this could be enhanced with AI to generate better summaries
    return `You've answered ${questionCount} question${questionCount > 1 ? 's' : ''} so far.`;
  } catch (error) {
    console.error('Error generating questions summary:', error);
    return "We have some of your information saved.";
  }
};
