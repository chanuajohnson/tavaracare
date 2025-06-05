
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
      // Enhanced phone validation - more comprehensive for admin use
      // Remove all spaces, dashes, parentheses, and dots for validation
      const cleanedNumber = trimmedInput.replace(/[\s\-\(\)\.]/g, '');
      
      // Check if it starts with '+' (international format)
      if (cleanedNumber.startsWith('+')) {
        // International format: should have at least 8 digits after the '+'
        // Support country codes of 1-4 digits plus at least 7 digits for the actual number
        if (!/^\+\d{8,15}$/.test(cleanedNumber)) {
          return { 
            isValid: false, 
            errorMessage: "International format should be +[country code][number] (8-15 digits total)" 
          };
        }
        
        // Check for specific known patterns
        if (cleanedNumber.startsWith('+1') && cleanedNumber.length !== 12) {
          return { 
            isValid: false, 
            errorMessage: "US/Canada numbers should be +1 followed by 10 digits" 
          };
        }
        
        // FIXED: Trinidad & Tobago validation - should be 12 digits total (+1868 + 7 digits)
        if (cleanedNumber.startsWith('+1868') && cleanedNumber.length !== 12) {
          return { 
            isValid: false, 
            errorMessage: "Trinidad & Tobago numbers should be +1868 followed by 7 digits" 
          };
        }
      } else {
        // Local format: should have at least 7 digits for most countries
        // Trinidad & Tobago local format is 7 digits, US is 10 digits
        if (!/^\d{7,15}$/.test(cleanedNumber)) {
          return { 
            isValid: false, 
            errorMessage: "Local format should be 7-15 digits (will auto-format to international)" 
          };
        }
        
        // If it's a 10-digit number, assume US/Canada
        if (cleanedNumber.length === 10) {
          return { isValid: true };
        }
        
        // If it's a 7-digit number, could be Trinidad & Tobago local
        if (cleanedNumber.length === 7) {
          return { isValid: true };
        }
        
        // If it's 11 digits starting with 1, it's US/Canada without +
        if (cleanedNumber.length === 11 && cleanedNumber.startsWith('1')) {
          return { isValid: true };
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
