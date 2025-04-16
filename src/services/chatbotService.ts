
// Re-export functions from responseUtils
export { 
  generateNextQuestionMessage,
  isEndOfSection,
  isEndOfFlow,
  getSectionTitle,
  getCurrentQuestion,
  generateDataSummary,
  getTotalSectionsForRole
} from './chat/responseUtils';

// Input validation function
export const validateChatInput = (input: string, fieldType: string): { isValid: boolean; errorMessage?: string } => {
  if (!input.trim()) {
    return { isValid: false, errorMessage: "This field cannot be empty" };
  }

  switch (fieldType.toLowerCase()) {
    case "email": {
      // Basic email validation pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input)) {
        return { 
          isValid: false, 
          errorMessage: "Please enter a valid email address (example@domain.com)" 
        };
      }
      return { isValid: true };
    }
    
    case "phone": {
      // Phone validation - accepting different formats
      // Strip all non-numeric characters except + for international format
      const cleanedNumber = input.replace(/[^\d+]/g, '');
      
      // Check if it's a reasonable length for a phone number (with country code)
      if (cleanedNumber.length < 7 || cleanedNumber.length > 15) {
        return { 
          isValid: false, 
          errorMessage: "Please enter a valid phone number" 
        };
      }
      
      // If it doesn't start with +, it should have at least 7 digits
      if (!cleanedNumber.startsWith('+') && cleanedNumber.length < 7) {
        return { 
          isValid: false, 
          errorMessage: "Please include your country code (e.g., +1868)" 
        };
      }
      
      return { isValid: true };
    }
    
    case "name": {
      // Name validation - just making sure it's not too short
      if (input.trim().length < 2) {
        return { 
          isValid: false, 
          errorMessage: "Name must be at least 2 characters" 
        };
      }
      
      // Check for only alphabetic characters, spaces, hyphens, and apostrophes
      const namePattern = /^[A-Za-z\s\-']+$/;
      if (!namePattern.test(input)) {
        return { 
          isValid: false, 
          errorMessage: "Please use only letters, spaces, hyphens, and apostrophes" 
        };
      }
      
      return { isValid: true };
    }
    
    default:
      // For any other field type, just ensure it's not empty
      return { isValid: input.trim().length > 0 };
  }
};

// Chat progress management functions
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

// Chat response saving function
export const saveChatResponse = async (
  sessionId: string,
  role: string,
  sectionIndex: string,
  questionId: string,
  response: string
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

// Function to get all responses for a session
export const getSessionResponses = async (sessionId: string): Promise<Record<string, any>> => {
  try {
    const responses = localStorage.getItem(`tavara_chat_responses_${sessionId}`);
    return responses ? JSON.parse(responses) : {};
  } catch (error) {
    console.error('Error getting session responses:', error);
    return {};
  }
};
