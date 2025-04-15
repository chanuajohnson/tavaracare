
// Add these functions to the file; if they already exist, replace them

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

// Add this function to the exports if necessary
