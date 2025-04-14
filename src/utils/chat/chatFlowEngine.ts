
import { ChatMessage } from '@/types/chatTypes';
import { handleAIFlow } from './engine/aiFlow';
import { handleRegistrationFlow } from './engine/registrationFlow';
import { handleScriptedFlow } from './engine/scriptedFlow';
import { ChatConfig, ChatResponse } from './engine/types';

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
  // Use AI flow
  if (config.mode === 'ai') {
    const response = await handleAIFlow(messages, sessionId, userRole, questionIndex);
    return {
      message: response.message,
      options: response.options,
      validationNeeded: response.validationNeeded
    };
  }
  
  // Use scripted flow
  if (config.mode === 'scripted') {
    return handleScriptedFlow(messages, userRole, questionIndex, config);
  }
  
  // Use registration flow
  if (userRole && questionIndex >= 0) {
    return handleRegistrationFlow(userRole, questionIndex);
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
