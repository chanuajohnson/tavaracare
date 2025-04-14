
import { ChatMessage } from '@/types/chatTypes';
import { handleAIFlow } from './engine/aiFlow';
import { handleRegistrationFlow } from './engine/registrationFlow';
import { handleScriptedFlow } from './engine/scriptedFlow';
import { ChatConfig, ChatResponse, RetryState } from './engine/types';

// Tracking retry attempts for AI
const aiRetryState: Map<string, RetryState> = new Map();

/**
 * Processes a conversation and decides which flow to use based on role and other factors.
 * 
 * @param messages Full chat history as an array of messages
 * @param sessionId Unique session ID for the conversation
 * @param userRole Selected user role or null if not yet selected
 * @param questionIndex Current question index in the conversation flow
 * @param config Chat configuration to use
 * @returns Response object with message text and optional UI options
 */
export const processConversation = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number,
  config: ChatConfig
): Promise<ChatResponse> => {
  // Get or initialize the retry state for this session
  let retryState = aiRetryState.get(sessionId);
  if (!retryState) {
    retryState = { count: 0, lastError: null };
    aiRetryState.set(sessionId, retryState);
  }
  
  // Use AI flow first (prioritize this flow)
  if (config.mode === 'ai') {
    try {
      console.log("Using AI flow for conversation processing");
      const response = await handleAIFlow(messages, sessionId, userRole, questionIndex);
      
      // Reset retry count on success
      retryState.count = 0;
      retryState.lastError = null;
      aiRetryState.set(sessionId, retryState);
      
      return {
        message: response.message,
        options: response.options,
        validationNeeded: response.validationNeeded
      };
    } catch (error) {
      // Increment retry count
      retryState.count += 1;
      retryState.lastError = error.message || 'Unknown error';
      aiRetryState.set(sessionId, retryState);
      
      console.error(`AI flow error (attempt ${retryState.count}):`, error);
      
      // If exceeded threshold, fall back to scripted
      if (config.fallbackThreshold && retryState.count >= config.fallbackThreshold) {
        console.log(`Falling back to scripted flow after ${retryState.count} failures`);
        
        // Add a message explaining the fallback
        const fallbackMsg = `I'm having a bit of trouble with my thinking right now. Let me ask you a simpler way.`;
        
        // Get scripted response
        const scriptedResponse = handleScriptedFlow(messages, userRole, questionIndex, config);
        
        // Combine fallback message with scripted response
        return {
          message: fallbackMsg + " " + scriptedResponse.message,
          options: scriptedResponse.options,
          validationNeeded: scriptedResponse.validationNeeded
        };
      }
      
      // Still under threshold, return error and retry options
      return {
        message: "Sorry, I'm having trouble processing that. Could you try again?",
        options: [
          { id: "retry", label: "Try again" },
          { id: "scripted", label: "Switch to simple questions" }
        ]
      };
    }
  }
  
  // Use scripted flow
  if (config.mode === 'scripted') {
    return handleScriptedFlow(messages, userRole, questionIndex, config);
  }
  
  // Hybrid mode - try AI first, then scripted as fallback
  if (config.mode === 'hybrid') {
    try {
      const response = await handleAIFlow(messages, sessionId, userRole, questionIndex);
      
      // Reset retry count on success
      retryState.count = 0;
      retryState.lastError = null;
      aiRetryState.set(sessionId, retryState);
      
      return {
        message: response.message,
        options: response.options,
        validationNeeded: response.validationNeeded
      };
    } catch (error) {
      // Log error and fall back to scripted
      console.error('Hybrid mode: AI flow failed, falling back to scripted:', error);
      
      // Get scripted response
      const scriptedResponse = handleScriptedFlow(messages, userRole, questionIndex, config);
      
      return scriptedResponse;
    }
  }
  
  // Registration flow should only be used if no other mode is specified
  if (userRole && questionIndex >= 0) {
    console.log("Falling back to registration flow");
    return handleRegistrationFlow(messages, userRole, sessionId, questionIndex);
  }

  // Default response if no flow is matched
  return {
    message: "I'm not sure how to respond. Can you tell me more?",
    options: [
      { id: "family", label: "I need care for someone" },
      { id: "professional", label: "I provide care services" },
      { id: "community", label: "I want to support the community" }
    ]
  };
};
