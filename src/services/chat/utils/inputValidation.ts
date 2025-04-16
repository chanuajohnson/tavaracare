
import { ValidationResult } from '@/types/chatTypes';

/**
 * Input validation functions for the chatbot
 */
export const validateChatInput = (input: string, fieldType: string): ValidationResult => {
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
        // Local format: should have at least 7 digits
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
      // Name validation - making sure it's not too short
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
      const budgetPattern = /^(\$?\d+(\.\d{2})?(-\$?\d+(\.\d{2})?)?\/?(hour|hr)?|negotiable)$/i;
      if (!budgetPattern.test(input) && !input.toLowerCase().includes("negotiable")) {
        return {
          isValid: false,
          errorMessage: "Please enter a valid budget (e.g., $20/hour, $20-30/hour, or 'Negotiable')"
        };
      }
      
      return { isValid: true };
    }
    
    // Default case - basic length validation
    default: {
      if (input.trim().length < 2) {
        return { 
          isValid: false, 
          errorMessage: "Input must be at least 2 characters" 
        };
      }
      return { isValid: true };
    }
  }
};
