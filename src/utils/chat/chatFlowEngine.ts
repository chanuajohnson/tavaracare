import { getChatCompletion, convertToOpenAIMessages, syncMessagesToSupabase } from '@/services/aiService';
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { handleAIFlow } from './engine/aiFlow';
import { handleScriptedFlow } from './engine/scriptedFlow';
import { handleRegistrationFlow } from './engine/registrationFlow';
import { ChatConfig, defaultChatConfig } from './engine/types';
import { getRetryState, resetRetryState } from './engine/retryManager';
import { applyTrinidadianStyle } from './engine/styleUtils';

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
  // For intro stage or scripted mode, use scripted flow
  if (config.mode === 'scripted' || messages.length === 0) {
    return await handleScriptedFlow(messages, userRole, sessionId, questionIndex);
  }

  // Handle registration flow once a role is selected
  if (userRole && questionIndex > 0) {
    return await handleRegistrationFlow(messages, userRole, sessionId, questionIndex);
  }

  // For AI or hybrid modes, try the AI flow first
  if (config.mode === 'ai' || config.mode === 'hybrid') {
    try {
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
  }

  // Default fallback
  return await handleScriptedFlow(messages, userRole, sessionId, questionIndex);
};

// Re-export utility functions
export { applyTrinidadianStyle };
