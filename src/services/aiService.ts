
// AI Service - Legacy implementation
// Note: This service is deprecated and replaced by the TAV system

import { supabase } from "@/lib/supabase";

interface LegacyMessage {
  content: string;
  isUser: boolean;
  timestamp: number;
}

export const processAIResponse = async (
  userMessage: string,
  conversationHistory: LegacyMessage[] = []
): Promise<string> => {
  console.warn('processAIResponse is deprecated - replaced by TAV system');
  
  try {
    // Simulate AI response for backward compatibility
    return "I understand you're looking for assistance. Our new TAV assistant is now available to help guide you through your caregiving journey.";
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error('AI service temporarily unavailable');
  }
};

export const generateContextualResponse = async (
  userMessage: string,
  userRole: string,
  currentProgress: any
): Promise<string> => {
  console.warn('generateContextualResponse is deprecated - replaced by TAV system');
  
  return "Our TAV assistant can provide personalized guidance based on your role and progress. Please use the TAV panel for assistance.";
};
