
/**
 * Input validation functions for the chatbot
 */

/**
 * Validates chat input based on field type
 */
export const validateChatInput = (input: string, fieldType: string): { isValid: boolean; errorMessage?: string } => {
  if (!input || !input.trim()) {
    return { isValid: false, errorMessage: "This field cannot be empty" };
  }

  const trimmedInput = input.trim();

  switch (fieldType.toLowerCase()) {
    case "email": {
      // Basic email validation pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmedInput)) {
        return { 
          isValid: false, 
          errorMessage: "Please enter a valid email address (example@domain.com)" 
        };
      }
      return { isValid: true };
    }
    
    case "phone": {
      // Enhanced phone validation - more strict requirements
      // Remove all spaces, dashes, parentheses, and dots for validation
      const cleanedNumber = trimmedInput.replace(/[\s\-\(\)\.]/g, '');
      
      // Check if it starts with '+' (international format)
      if (cleanedNumber.startsWith('+')) {
        // International format: should have at least 8 digits after the '+'
        // This handles country codes of 1-3 digits plus at least 7 digits for the actual number
        if (!/^\+\d{8,15}$/.test(cleanedNumber)) {
          return { 
            isValid: false, 
            errorMessage: "Please use international format with country code (+1XXXXXXXXXX)" 
          };
        }
      } else {
        // Local format: should have at least 7 digits (minimal for most countries)
        // and shouldn't exceed 15 digits (ITU-T recommendation)
        if (!/^\d{7,15}$/.test(cleanedNumber)) {
          return { 
            isValid: false, 
            errorMessage: "Please enter a valid phone number with country code (e.g., +1XXXXXXXXXX)" 
          };
        }
      }
      
      return { isValid: true };
    }
    
    case "name": {
      // Name validation - just making sure it's not too short
      if (trimmedInput.length < 2) {
        return { 
          isValid: false, 
          errorMessage: "Name must be at least 2 characters" 
        };
      }
      
      // Check for only alphabetic characters, spaces, hyphens, and apostrophes
      const namePattern = /^[A-Za-z\s\-']+$/;
      if (!namePattern.test(trimmedInput)) {
        return { 
          isValid: false, 
          errorMessage: "Please use only letters, spaces, hyphens, and apostrophes in your name" 
        };
      }
      
      return { isValid: true };
    }
    
    case "budget": {
      // Budget validation - check for currency format or range
      const budgetPattern = /^\$?\s?\d+(\.\d{1,2})?(\s?-\s?\$?\s?\d+(\.\d{1,2})?)?(\s?\/\s?hour)?$/;
      if (!budgetPattern.test(trimmedInput) && !trimmedInput.toLowerCase().includes('negotiable')) {
        return { 
          isValid: false, 
          errorMessage: "Please enter a valid budget amount (e.g., $20-30/hour or Negotiable)" 
        };
      }
      return { isValid: true };
    }
    
    default:
      // For any other field type, just ensure it's not empty
      return { isValid: trimmedInput.length > 0 };
  }
};
