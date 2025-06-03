
import { ChatResponse } from '../types';
import { phrasings } from '@/utils/chat/phrasings';

/**
 * Provides fallback options for error cases
 * @param userRole Current user role
 */
export const getFallbackResponse = (userRole: string | null): ChatResponse => {
  // Fallback options for error cases
  const fallbackOptions = [
    { id: "restart", label: "Start over" },
    { id: "form", label: "Switch to form view" }
  ];
  
  if (!userRole) {
    // Add role selection options if we don't have a role
    return {
      message: "Sorry, I'm having a bit of trouble. Please let me know which option best describes you:",
      options: [
        { id: "family", label: "I need care for someone" },
        { id: "professional", label: "I provide care services" },
        { id: "community", label: "I want to support the community" },
        ...fallbackOptions
      ]
    };
  }
  
  // Use a Trinidad & Tobago style error message
  const errorMessage = phrasings.errorRecovery[Math.floor(Math.random() * phrasings.errorRecovery.length)];
  
  return {
    message: `${errorMessage} Would you like to continue or try another approach?`,
    options: fallbackOptions
  };
};
