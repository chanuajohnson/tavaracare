
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { getChatCompletion, convertToOpenAIMessages } from '@/services/aiService';
import { phrasings } from '@/utils/chat/phrasings';
import { applyTrinidadianStyle, avoidRepetition } from './styleUtils';
import { isRepeatMessage, setLastMessage } from './messageCache';
import { ChatResponse } from './types';
import { formatChatHistoryForAI, generatePrompt } from '../generatePrompt';
import { getCurrentQuestion } from '@/services/chat/responseUtils';

/**
 * Handles AI-based conversation flow
 */
export const handleAIFlow = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number
): Promise<ChatResponse> => {
  try {
    // If we have a role and are in registration flow, use the prompt generator
    if (userRole) {
      const sectionIndex = Math.floor(questionIndex / 10);
      const sectionQuestionIndex = questionIndex % 10;
      
      try {
        // Use the context-aware prompt generator
        return await generatePrompt(userRole, messages, sectionIndex, sectionQuestionIndex);
      } catch (error) {
        console.error("Error generating context-aware prompt:", error);
        // Continue to fallback OpenAI approach
      }
    }
    
    // Fallback to standard OpenAI approach if prompt generator fails or we're in general chat
    
    // Convert messages to OpenAI format
    const openAIMessages = convertToOpenAIMessages(messages);
    
    // Limit chat history to prevent token overflow
    const limitedHistory = openAIMessages.slice(-10);

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
    if (!limitedHistory.some(msg => msg.role === 'system')) {
      limitedHistory.unshift({
        role: 'system',
        content: systemPrompt
      });
    }

    // Call the AI service
    const response = await getChatCompletion({
      messages: limitedHistory,
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
    } else if (userRole && questionIndex < 50) {
      // For registration questions, check if we should provide options
      const sectionIndex = Math.floor(questionIndex / 10);
      const sectionQuestionIndex = questionIndex % 10;
      const currentQuestion = getCurrentQuestion(userRole, sectionIndex, sectionQuestionIndex);
      
      if (currentQuestion && ['select', 'multiselect', 'checkbox'].includes(currentQuestion.type)) {
        options = currentQuestion.options?.map(option => ({
          id: option,
          label: option
        }));
      } else if (currentQuestion && currentQuestion.type === 'confirm') {
        options = [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" }
        ];
      }
    }
    
    return { message: finalMessage, options };
  } catch (error) {
    console.error("Error in handleAIFlow:", error);
    
    // Fallback options for error cases
    const fallbackOptions: ChatOption[] = [
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
    
    return {
      message: "Sorry about that. I'm having a bit of trouble with my thinking. Would you like to continue or try another approach?",
      options: fallbackOptions
    };
  }
};
