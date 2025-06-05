
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { getChatCompletion, convertToOpenAIMessages } from '@/services/aiService';
import { phrasings } from '@/utils/chat/phrasings';
import { isRepeatMessage, setLastMessage } from './messageCache';
import { ChatResponse } from './types';
import { formatChatHistoryForAI, generatePrompt } from '../generatePrompt';
import { getCurrentQuestion } from '@/services/chat/utils/questionUtils';
import { getSessionResponses, validateChatInput } from '@/services/chat/databaseUtils';
import { toast } from 'sonner';
import { avoidRepetition } from './styleUtils';

// Import modular components
import { cleanupResponse } from './modules/responseFormatter';
import { getFallbackResponse } from './modules/fallbackResponses';
import { generateSystemPrompt } from './modules/promptGenerator';
import { detectFieldType, generateQuestionOptions } from './modules/fieldDetection';

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
          const questionDetails = getCurrentQuestion(userRole, sectionIndex, sectionQuestionIndex);
          
          // Clean up the generated message
          const cleanedMessage = cleanupResponse(generatedPrompt.message);
          
          // Return validation information based on the question type
          if (questionDetails) {
            let fieldType = "";
            
            // Try to determine field type from question label or id
            const label = questionDetails.label.toLowerCase();
            const id = questionDetails.id?.toLowerCase() || "";
            
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

    // Add system prompt with context
    const systemPrompt = generateSystemPrompt(userRole, previousAnswers, questionIndex);

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
    
      // Determine field type for validation
      const fieldType = detectFieldType(userRole, questionIndex);
    
      // Clean up the message
      const cleanedMessage = cleanupResponse(message, fieldType);
    
      // Check for repetition
      const finalMessage = isRepeatMessage(sessionId, cleanedMessage) 
        ? avoidRepetition(cleanedMessage)
        : cleanedMessage;
      
      // Store this message for repetition detection
      setLastMessage(sessionId, finalMessage);
      
      // Generate options for the user to select from if needed
      const options = generateQuestionOptions(userRole, questionIndex);
      
      return { 
        message: finalMessage, 
        options,
        validationNeeded: fieldType || undefined 
      };
    } catch (error) {
      console.error("Error calling AI service:", error);
      
      // More descriptive error for users
      const errorMessage = phrasings.connectionErrors[Math.floor(Math.random() * phrasings.connectionErrors.length)];
      
      throw new Error(`${errorMessage} Original error: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    console.error("Error in handleAIFlow:", error);
    
    // Get fallback response for error cases
    return getFallbackResponse(userRole);
  }
};
