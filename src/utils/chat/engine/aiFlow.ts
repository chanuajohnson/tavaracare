
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { getChatCompletion, convertToOpenAIMessages } from '@/services/aiService';
import { phrasings } from '@/utils/chat/phrasings';
import { applyTrinidadianStyle, avoidRepetition } from './styleUtils';
import { isRepeatMessage, setLastMessage } from './messageCache';
import { ChatResponse } from './types';
import { formatChatHistoryForAI, generatePrompt } from '../generatePrompt';
import { getCurrentQuestion } from '@/services/chat/responseUtils';
import { getSessionResponses, validateChatInput } from '@/services/chat/databaseUtils';
import { toast } from 'sonner';

/**
 * Cleans up problematic phrases from responses
 */
const cleanupResponse = (text: string): string => {
  // Remove "a," at the beginning of sentences
  let cleaned = text.replace(/^a,\s*/i, '');
  cleaned = cleaned.replace(/\.\s+a,\s*/g, '. ');
  
  // Remove "Yuh" phrases
  cleaned = cleaned.replace(/\byuh\b/gi, '');
  
  // Fix any double spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Fix any punctuation issues from removals
  cleaned = cleaned.replace(/\s+\./g, '.');
  cleaned = cleaned.replace(/\s+\?/g, '?');
  cleaned = cleaned.replace(/\s+\!/g, '!');
  cleaned = cleaned.replace(/\s+,/g, ',');
  
  return cleaned;
};

/**
 * Handles AI-based conversation flow
 */
export const handleAIFlow = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number
): Promise<ChatResponse & { validationNeeded?: string }> => {
  try {
    console.log("AI Flow starting with:", { userRole, questionIndex });
    
    // If we have a role and are in registration flow, use the prompt generator
    if (userRole) {
      const sectionIndex = Math.floor(questionIndex / 10);
      const sectionQuestionIndex = questionIndex % 10;
      
      try {
        console.log("Using contextual prompt generator for", { userRole, sectionIndex, sectionQuestionIndex });
        
        // Get previous user responses to provide context
        let previousResponses = {};
        try {
          if (sessionId && userRole) {
            previousResponses = await getSessionResponses(sessionId);
            console.log("Retrieved previous responses for context:", Object.keys(previousResponses).length);
          }
        } catch (error) {
          console.error("Error fetching previous responses:", error);
          // Continue execution despite error
        }
        
        // Use the context-aware prompt generator
        const generatedPrompt = await generatePrompt(
          userRole, 
          messages, 
          sectionIndex, 
          sectionQuestionIndex
        );
        console.log("Generated prompt result:", generatedPrompt);
        
        if (generatedPrompt && generatedPrompt.message) {
          const currentQuestion = getCurrentQuestion(userRole, sectionIndex, sectionQuestionIndex);
          
          // Clean up the generated message
          const cleanedMessage = cleanupResponse(generatedPrompt.message);
          
          // Return validation information based on the question type
          if (currentQuestion) {
            let fieldType = "";
            
            // Try to determine field type from question label or id
            const label = currentQuestion.label.toLowerCase();
            const id = currentQuestion.id?.toLowerCase() || "";
            
            if (label.includes("email") || id.includes("email")) {
              fieldType = "email";
            } else if (label.includes("phone") || id.includes("phone")) {
              fieldType = "phone";
            } else if (
              label.includes("name") || 
              id.includes("name") ||
              label.includes("first name") || 
              id.includes("first_name") ||
              label.includes("last name") || 
              id.includes("last_name")
            ) {
              fieldType = "name";
            }
            
            return { 
              ...generatedPrompt,
              message: cleanedMessage,
              validationNeeded: fieldType || undefined 
            };
          }
          
          return {
            ...generatedPrompt,
            message: cleanedMessage
          };
        } else {
          console.warn("Generated prompt was empty, falling back to OpenAI direct call");
        }
      } catch (error) {
        console.error("Error generating context-aware prompt:", error);
        // Fall back to direct OpenAI call
      }
    }
    
    console.log("Using standard OpenAI approach");
    
    // Get previous responses to provide context
    let previousAnswers: Record<string, any> = {};
    try {
      if (sessionId && userRole) {
        previousAnswers = await getSessionResponses(sessionId);
        console.log("Retrieved previous answers for OpenAI context:", Object.keys(previousAnswers).length);
      }
    } catch (error) {
      console.error("Error fetching previous responses for OpenAI:", error);
      // Continue execution despite error
    }
    
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

IMPORTANT: Do NOT use field labels directly like "First Name" or "Last Name". Instead, ask naturally like "What's your first name?" or "And your last name?".

Keep your responses natural and conversational. Use direct, warm language that reflects how real people speak.
DO NOT use phrases like "how would you like to engage with us today" or other artificial corporate language.
NEVER start sentences with "a" (like "a, what's your name?")
NEVER use "Yuh" as it sounds artificial.

When moving between registration sections, add a brief transition like "Great! Now let's talk about your care preferences."
If the user has provided information previously, acknowledge it and don't ask for it again.`;

    // If we have previous answers, add them as context
    if (Object.keys(previousAnswers).length > 0) {
      systemPrompt += "\n\nThe user has already provided the following information:";
      
      Object.entries(previousAnswers).forEach(([key, value]) => {
        // Format key for readability
        const readableKey = key.replace(/_/g, ' ').toLowerCase();
        systemPrompt += `\n- ${readableKey}: ${value}`;
      });
    }

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

    // Define field context for the AI
    const fieldContext = {
      currentField: questionIndex >= 0 ? `question_${questionIndex}` : undefined,
      previousAnswers
    };
    
    console.log("Calling AI service with field context:", { 
      fieldContextDefined: !!fieldContext, 
      messagesCount: limitedHistory.length,
      systemPromptLength: systemPrompt.length
    });

    // Call the AI service with error handling
    try {
      // Call the AI service
      const response = await getChatCompletion({
        messages: limitedHistory,
        sessionId,
        userRole: userRole || undefined,
        fieldContext
      });

      if (response.error) {
        console.error("AI service error:", response.error);
        throw new Error(`AI service error: ${response.error}`);
      }

      // Process the AI response
      const message = response.message || "I'm here to help you with your caregiving needs.";
      console.log("Received AI response:", message);
      
      // Apply T&T cultural transformations
      const styledMessage = applyTrinidadianStyle(message);
      
      // Clean up any problematic phrases
      const cleanedMessage = cleanupResponse(styledMessage);
      
      // Check for repetition and fix if necessary
      const finalMessage = isRepeatMessage(sessionId, cleanedMessage) 
        ? avoidRepetition(cleanedMessage)
        : cleanedMessage;
      
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
        
        // Determine if field validation is needed
        let validationNeeded: string | undefined;
        
        if (currentQuestion) {
          const label = (currentQuestion.label || "").toLowerCase();
          const id = (currentQuestion.id || "").toLowerCase();
          
          if (label.includes("email") || id.includes("email")) {
            validationNeeded = "email";
          } else if (label.includes("phone") || id.includes("phone")) {
            validationNeeded = "phone";
          } else if (label.includes("name") || id.includes("name")) {
            validationNeeded = "name";
          }
        }
        
        return { message: finalMessage, options, validationNeeded };
      }
      
      return { message: finalMessage, options };
    } catch (error) {
      console.error("Error calling AI service:", error);
      
      // More descriptive error for users
      const errorMessage = phrasings.connectionErrors[Math.floor(Math.random() * phrasings.connectionErrors.length)];
      
      throw new Error(`${errorMessage} Original error: ${error instanceof Error ? error.message : String(error)}`);
    }
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
    
    // Use a Trinidad & Tobago style error message
    const errorMessage = phrasings.errorRecovery[Math.floor(Math.random() * phrasings.errorRecovery.length)];
    
    return {
      message: `${errorMessage} Would you like to continue or try another approach?`,
      options: fallbackOptions
    };
  }
};
