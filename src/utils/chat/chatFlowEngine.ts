import { getChatCompletion, convertToOpenAIMessages, syncMessagesToSupabase } from '@/services/aiService';
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { handleAIFlow } from './engine/aiFlow';
import { handleScriptedFlow } from './engine/scriptedFlow';
import { handleRegistrationFlow } from './engine/registrationFlow';
import { ChatConfig, defaultChatConfig } from './engine/types';
import { getRetryState, resetRetryState } from './engine/retryManager';
import { applyTrinidadianStyle } from './engine/styleUtils';
import { getSessionResponses } from '@/services/chat/databaseUtils';

/**
 * Processes the conversation and generates the next message
 */
export const processConversation = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number,
  config: ChatConfig = defaultChatConfig
): Promise<{ message: string; options?: ChatOption[] }> => {
  try {
    // Get existing responses for context if available
    let previousAnswers: Record<string, any> = {};
    try {
      if (sessionId && userRole) {
        previousAnswers = await getSessionResponses(sessionId);
        console.log("Retrieved previous answers for context:", previousAnswers);
      }
    } catch (error) {
      console.error("Error fetching previous responses:", error);
    }
    
    // For intro stage or scripted mode, use scripted flow
    if (config.mode === 'scripted' || messages.length === 0) {
      console.log("Using scripted flow (intro stage or scripted mode)");
      return await handleScriptedFlow(messages, userRole, sessionId, questionIndex);
    }

    // Always use AI flow for a more natural conversation experience
    try {
      console.log("Attempting AI flow with context:", { 
        userRole, 
        questionIndex, 
        messagesCount: messages.length,
        previousAnswers: Object.keys(previousAnswers).length
      });
      
      const aiResponse = await handleAIFlow(messages, sessionId, userRole, questionIndex);
      
      // Reset retry count after successful AI response
      resetRetryState(sessionId);
      
      return aiResponse;
    } catch (error) {
      console.error('Error in AI flow:', error);
      
      // Update retry state
      const retryState = getRetryState(sessionId);
      retryState.count++;
      retryState.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      // If hybrid mode and exceeded fallback threshold, fall back to scripted
      if (config.mode === 'hybrid' && retryState.count > (config.fallbackThreshold || 2)) {
        console.log(`Falling back to scripted mode after ${retryState.count} failed AI attempts`);
        return await handleScriptedFlow(messages, userRole, sessionId, questionIndex);
      }
      
      console.log("AI fallback: Using registration flow");
      // Try registration flow as a fallback if we have a role
      if (userRole) {
        return await handleRegistrationFlow(messages, userRole, sessionId, questionIndex);
      }
      
      // Otherwise, return an error message with options
      return { 
        message: `Sorry, I'm having trouble understanding. Please select one of the options below:`,
        options: [
          { id: "family", label: "I need care for someone" },
          { id: "professional", label: "I provide care services" },
          { id: "community", label: "I want to support the community" },
          { id: "restart", label: "Start over" }
        ]
      };
    }
  } catch (error) {
    console.error('Unhandled error in process conversation:', error);
    // Always return a valid response to prevent Promise rejection
    return {
      message: "I apologize, but I encountered an unexpected error. Please try again.",
      options: [
        { id: "restart", label: "Start over" }
      ]
    };
  }
};

// Re-export utility functions
export { applyTrinidadianStyle };
