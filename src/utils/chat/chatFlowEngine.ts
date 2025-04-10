import { getChatCompletion, convertToOpenAIMessages } from '@/services/aiService';
import { getIntroMessage, getRoleFollowupMessage, getNextQuestion } from '@/data/chatIntroMessage';
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { phrasings } from '@/utils/chat/phrasings';

export interface ChatConfig {
  mode: 'ai' | 'scripted' | 'hybrid';
  temperature?: number;
  fallbackThreshold?: number; // Number of retries before falling back to scripted
}

// Default configuration
export const defaultChatConfig: ChatConfig = {
  mode: 'hybrid',
  temperature: 0.7,
  fallbackThreshold: 2
};

// Interface for tracking retry attempts
interface RetryState {
  count: number;
  lastError: string | null;
}

// Keep track of retry attempts per session
const retryStates = new Map<string, RetryState>();

// Get or initialize retry state for a session
const getRetryState = (sessionId: string): RetryState => {
  if (!retryStates.has(sessionId)) {
    retryStates.set(sessionId, { count: 0, lastError: null });
  }
  return retryStates.get(sessionId)!;
};

// Reset retry state for a session
const resetRetryState = (sessionId: string): void => {
  retryStates.set(sessionId, { count: 0, lastError: null });
};

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
  // If we're in scripted mode, or we're in the intro stage, use scripted messages
  if (config.mode === 'scripted' || messages.length === 0) {
    return handleScriptedFlow(messages, userRole, questionIndex);
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
        return handleScriptedFlow(messages, userRole, questionIndex);
      }
      
      // Otherwise, return an error message
      return { 
        message: `Sorry, I'm having trouble understanding. Could you please try again or rephrase? ${
          retryState.count > 1 ? '(You can also start over if needed)' : ''
        }`
      };
    }
  }

  // Default fallback
  return handleScriptedFlow(messages, userRole, questionIndex);
};

/**
 * Handles AI-based conversation flow
 */
const handleAIFlow = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number
): Promise<{ message: string; options?: ChatOption[] }> => {
  // Convert messages to OpenAI format
  const openAIMessages = convertToOpenAIMessages(messages);

  // Add role context to help the AI generate better responses
  let systemPrompt = `You are Tavara, a friendly assistant for Tavara.care, a platform connecting families with caregivers in Trinidad & Tobago.
    
Use warm, conversational language with occasional local phrases from Trinidad & Tobago like "${phrasings.greetings.join('", "')}" or "${phrasings.acknowledgments.join('", "')}" or expressions like "${phrasings.expressions.join('", "')}" to sound authentic.

${userRole ? `The user has indicated they are a ${userRole}.` : ''}
${userRole === 'family' ? "Help them find caregiving support for their loved ones." : ''}
${userRole === 'professional' ? "Help them register as a caregiver on our platform." : ''}
${userRole === 'community' ? "Help them find ways to contribute to our caregiving community." : ''}

You are currently helping them through the registration process. We are at question ${questionIndex + 1}.
Keep your responses concise (1-3 sentences), friendly, and focused on gathering relevant information.
Do NOT list multiple questions at once. Focus on ONE question at a time.`;

  // Special instructions for first interaction
  if (!userRole && messages.length <= 3) {
    systemPrompt += `\n\nSince this is the beginning of our conversation, help the user identify which role they fall into (family, professional, or community) so we can direct them to the right registration flow. Be warm and welcoming.`;
  }

  // Add system message if it doesn't exist already
  if (!openAIMessages.some(msg => msg.role === 'system')) {
    openAIMessages.unshift({
      role: 'system',
      content: systemPrompt
    });
  }

  // Call the AI service
  const response = await getChatCompletion({
    messages: openAIMessages,
    sessionId,
    userRole: userRole || undefined
  });

  if (response.error) {
    throw new Error(`AI service error: ${response.error}`);
  }

  // Process the AI response
  let message = response.message;
  
  // Apply T&T cultural transformations
  message = applyTrinidadianStyle(message);
  
  return { message };
};

/**
 * Handles scripted conversation flow
 */
const handleScriptedFlow = (
  messages: ChatMessage[],
  userRole: string | null,
  questionIndex: number
): { message: string; options?: ChatOption[] } => {
  // Intro stage - no messages yet or only 1-2 messages
  if (messages.length <= 2) {
    return {
      message: applyTrinidadianStyle(getIntroMessage()),
      options: [
        { id: 'family', label: 'I need care for someone' },
        { id: 'professional', label: 'I provide care services' },
        { id: 'community', label: 'I want to support the community' }
      ]
    };
  }

  // Role selection followup
  if (messages.length <= 4 && userRole) {
    return {
      message: applyTrinidadianStyle(getRoleFollowupMessage(userRole))
    };
  }

  // Subsequent questions based on selected role
  if (userRole) {
    return {
      message: applyTrinidadianStyle(getNextQuestion(userRole, questionIndex))
    };
  }

  // Fallback generic message
  return { 
    message: applyTrinidadianStyle("I'd be happy to help you. What would you like to know about our caregiving services?") 
  };
};

/**
 * Applies Trinidad & Tobago cultural style to messages
 */
export const applyTrinidadianStyle = (message: string): string => {
  // Don't modify empty messages
  if (!message) return message;

  // Random chance of applying each transformation for variety
  const shouldApplyGreeting = Math.random() < 0.3 && message.includes('hello') || message.includes('hi');
  const shouldApplyAcknowledgment = Math.random() < 0.4 && (message.includes('thank') || message.includes('great'));
  const shouldApplyExpression = Math.random() < 0.2;

  let modifiedMessage = message;

  // Replace greetings
  if (shouldApplyGreeting) {
    const greetingIndex = Math.floor(Math.random() * phrasings.greetings.length);
    const greeting = phrasings.greetings[greetingIndex];
    modifiedMessage = modifiedMessage
      .replace(/\b(hello|hi)\b/i, greeting);
  }

  // Add acknowledgments
  if (shouldApplyAcknowledgment) {
    const ackIndex = Math.floor(Math.random() * phrasings.acknowledgments.length);
    const acknowledgment = phrasings.acknowledgments[ackIndex];
    modifiedMessage = modifiedMessage
      .replace(/\b(thank you|thanks)\b/i, acknowledgment);
  }

  // Add expressions
  if (shouldApplyExpression) {
    const exprIndex = Math.floor(Math.random() * phrasings.expressions.length);
    const expression = phrasings.expressions[exprIndex];
    
    // 50% chance to add at beginning, 50% at end
    if (Math.random() < 0.5) {
      modifiedMessage = `${expression} ${modifiedMessage}`;
    } else {
      modifiedMessage = `${modifiedMessage} ${expression}`;
    }
  }

  return modifiedMessage;
};
