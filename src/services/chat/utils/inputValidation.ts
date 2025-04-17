
/**
 * Input validation functions for the chatbot
 */

/**
 * Validates chat input based on field type
 */
export const validateChatInput = (input: string, fieldType: string): { isValid: boolean; errorMessage?: string } => {
  if (!input.trim()) {
    return { isValid: false, errorMessage: "This field cannot be empty" };
  }

  switch (fieldType.toLowerCase()) {
    case "email": {
      // Enhanced email validation pattern
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
      // Enhanced phone validation - more strict requirements
      // Remove all spaces, dashes, parentheses, and dots for validation
      const cleanedNumber = input.replace(/[\s\-\(\)\.]/g, '');
      
      // Check if it starts with '+' (international format)
      if (cleanedNumber.startsWith('+')) {
        // International format: should have at least 8 digits after the '+'
        if (!/^\+\d{8,15}$/.test(cleanedNumber)) {
          return { 
            isValid: false, 
            errorMessage: "International format should be like +18687865357" 
          };
        }
      } else {
        // Local format: should have at least 7 digits (minimal for most countries)
        if (!/^\d{7,15}$/.test(cleanedNumber)) {
          return { 
            isValid: false, 
            errorMessage: "Please enter a valid phone number with country code (e.g., +18687865357)" 
          };
        }
      }
      
      return { isValid: true };
    }
    
    case "name": {
      // Name validation - just making sure it's not too short and contains valid characters
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
    
    case "budget": {
      // Budget validation - check for currency format or range
      const budgetPattern = /^\$?\s?\d+(\.\d{1,2})?(\s?-\s?\$?\s?\d+(\.\d{1,2})?)?(\s?\/\s?hour)?$/;
      if (!budgetPattern.test(input) && !input.toLowerCase().includes('negotiable')) {
        return { 
          isValid: false, 
          errorMessage: "Please enter a valid budget amount (e.g., $20-30/hour or Negotiable)" 
        };
      }
      return { isValid: true };
    }
    
    case "address": {
      // Basic address validation
      if (input.trim().length < 5) {
        return {
          isValid: false,
          errorMessage: "Please enter a complete address"
        };
      }
      return { isValid: true };
    }
    
    case "zipcode": {
      // Basic zipcode/postal code validation (varies by country)
      const zipPattern = /^[A-Z0-9]{3,10}$/i;
      if (!zipPattern.test(input.trim())) {
        return {
          isValid: false,
          errorMessage: "Please enter a valid postal/zip code"
        };
      }
      return { isValid: true };
    }
    
    case "date": {
      // Simple date validation (could be enhanced for specific formats)
      const datePattern = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/;
      if (!datePattern.test(input) && !Date.parse(input)) {
        return {
          isValid: false,
          errorMessage: "Please enter a valid date (MM/DD/YYYY or YYYY-MM-DD)"
        };
      }
      return { isValid: true };
    }
    
    default:
      // For any other field type, ensure it's not empty and reasonable length
      if (input.trim().length < 1) {
        return { 
          isValid: false, 
          errorMessage: "This field cannot be empty" 
        };
      }
      
      if (input.trim().length > 1000) {
        return {
          isValid: false,
          errorMessage: "Response is too long. Please keep it under 1000 characters."
        };
      }
      
      return { isValid: true };
  }
};
