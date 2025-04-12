
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { getChatCompletion, convertToOpenAIMessages } from '@/services/aiService';
import { phrasings } from '@/utils/chat/phrasings';
import { applyTrinidadianStyle, avoidRepetition } from './styleUtils';
import { isRepeatMessage, setLastMessage } from './messageCache';
import { ChatResponse } from './types';

/**
 * Handles AI-based conversation flow
 */
export const handleAIFlow = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number
): Promise<ChatResponse> => {
  // Convert messages to OpenAI format
  const openAIMessages = convertToOpenAIMessages(messages);

  // Add role context to help the AI generate better responses
  let systemPrompt = `You are Tavara, a friendly assistant for Tavara.care, a platform connecting families with caregivers in Trinidad & Tobago.
    
Use warm, conversational language with occasional local phrases from Trinidad & Tobago like "${phrasings.greetings.join('", "')}" or "${phrasings.acknowledgments.join('", "')}" or expressions like "${phrasings.expressions.join('", "')}" to sound authentic but not overdone.

${userRole ? `The user has indicated they are a ${userRole}.` : ''}
${userRole === 'family' ? "Help them find caregiving support for their loved ones." : ''}
${userRole === 'professional' ? "Help them register as a caregiver on our platform." : ''}
${userRole === 'community' ? "Help them find ways to contribute to our caregiving community." : ''}

You are currently helping them through the registration process. We are at question ${questionIndex + 1}.
Keep your responses concise (1-3 sentences), friendly, and focused on gathering relevant information.
Do NOT list multiple questions at once. Focus on ONE question at a time.

Keep your responses natural and conversational. Use direct, warm language that reflects how real people speak.
DO NOT use phrases like "how would you like to engage with us today" or other artificial corporate language.`;

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
  const message = response.message || "I'm here to help you with your caregiving needs.";
  
  // Apply T&T cultural transformations
  const styledMessage = applyTrinidadianStyle(message);
  
  // Check for repetition and fix if necessary
  const finalMessage = isRepeatMessage(sessionId, styledMessage) 
    ? avoidRepetition(styledMessage)
    : styledMessage;
  
  // Store this message for repetition detection
  setLastMessage(sessionId, finalMessage);
  
  // Always provide options for the user to select from if at the beginning of the conversation
  let options: ChatOption[] | undefined;
  if (!userRole && messages.length <= 3) {
    options = [
      { id: "family", label: "I need care for someone" },
      { id: "professional", label: "I provide care services" },
      { id: "community", label: "I want to support the community" }
    ];
  } else if (questionIndex < 5) {
    // For subsequent questions, provide some contextual options based on the question
    // This ensures users can click rather than type free text
    switch (userRole) {
      case 'family':
        if (questionIndex === 0) {
          options = [
            { id: "parent", label: "For my parent" },
            { id: "spouse", label: "For my spouse" },
            { id: "child", label: "For my child" },
            { id: "other", label: "Someone else" }
          ];
        } else if (questionIndex === 1) {
          options = [
            { id: "daily_activities", label: "Help with daily activities" },
            { id: "medical", label: "Medical care" },
            { id: "companionship", label: "Companionship" },
            { id: "specialized", label: "Specialized care" }
          ];
        }
        break;
      case 'professional':
        if (questionIndex === 0) {
          options = [
            { id: "home_care", label: "Home care" },
            { id: "medical_care", label: "Medical care" },
            { id: "therapy", label: "Therapy" },
            { id: "specialized", label: "Specialized care" }
          ];
        } else if (questionIndex === 1) {
          options = [
            { id: "0-2", label: "0-2 years" },
            { id: "3-5", label: "3-5 years" },
            { id: "5-10", label: "5-10 years" },
            { id: "10+", label: "10+ years" }
          ];
        }
        break;
    }
  }
  
  return { message: finalMessage, options };
};
