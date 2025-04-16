
import { ChatMessage, ChatOption } from '@/types/chatTypes';
import { getCurrentQuestion, getFieldTypeForQuestion } from '@/services/chat/utils/questionUtils';

// Interface for the AI flow response
interface AIFlowResponse {
  message: string;
  options?: ChatOption[];
}

/**
 * Handle AI-based conversation flow
 * In a complete implementation, this would call an external AI service
 * For this simplified version, we'll provide some canned responses
 */
export const handleAIFlow = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole: string | null,
  questionIndex: number
): Promise<AIFlowResponse> => {
  try {
    console.log("AI Flow starting with:", { userRole, questionIndex });
    
    // If no messages, return welcome message
    if (messages.length === 0) {
      return {
        message: "Hello! I'm your Tavara assistant. I'm here to help you get started with our caregiving platform. Are you looking for care services, offering professional care, or interested in supporting our community?",
        options: [
          { id: "family", label: "I need care for someone" },
          { id: "professional", label: "I provide care services" },
          { id: "community", label: "I want to support the community" }
        ]
      };
    }
    
    // Get the latest user message
    const latestUserMessage = [...messages].reverse().find(m => m.isUser);
    
    // If we have a role and specific question index
    if (userRole && questionIndex >= 0) {
      const sectionIndex = Math.floor(questionIndex / 10);
      const questionInSectionIndex = questionIndex % 10;
      
      // Get current question
      const currentQuestion = getCurrentQuestion(userRole, sectionIndex, questionInSectionIndex);
      
      if (currentQuestion) {
        // Get validation type
        const fieldType = getFieldTypeForQuestion(userRole, sectionIndex, questionInSectionIndex);
        
        // Return the question with appropriate options
        if (currentQuestion.type === 'select' || currentQuestion.type === 'multiselect' || currentQuestion.type === 'checkbox') {
          return {
            message: currentQuestion.label,
            options: currentQuestion.options?.map(option => ({ id: option, label: option }))
          };
        } else if (currentQuestion.type === 'confirm') {
          return {
            message: currentQuestion.label,
            options: [
              { id: "yes", label: "Yes" },
              { id: "no", label: "No" }
            ]
          };
        } else {
          // Text input
          return { message: currentQuestion.label };
        }
      }
    }
    
    // If no role determined yet, try to understand user intent
    if (!userRole && latestUserMessage) {
      const message = latestUserMessage.content.toLowerCase();
      
      if (message.includes('care') && (message.includes('need') || message.includes('looking'))) {
        return {
          message: "It sounds like you're looking for care services. Let's get you registered as a family seeking care.",
          options: [
            { id: "family", label: "Yes, I need care services" },
            { id: "professional", label: "No, I provide care services" },
            { id: "community", label: "I want to support the community" }
          ]
        };
      } else if (message.includes('provide') || message.includes('caregiver') || message.includes('professional')) {
        return {
          message: "Great! It sounds like you're a care professional. I can help you register on our platform.",
          options: [
            { id: "professional", label: "Yes, I provide care" },
            { id: "family", label: "No, I need care" },
            { id: "community", label: "I want to support the community" }
          ]
        };
      } else if (message.includes('volunteer') || message.includes('community') || message.includes('support')) {
        return {
          message: "Wonderful! It sounds like you want to support our caregiving community. Let me help you sign up.",
          options: [
            { id: "community", label: "Yes, I want to help the community" },
            { id: "family", label: "No, I need care" },
            { id: "professional", label: "No, I provide care" }
          ]
        };
      }
    }
    
    // Generic fallback response
    return {
      message: "I'm here to help you with Tavara's caregiving platform. Could you tell me more about what you're looking for?",
      options: [
        { id: "family", label: "I need care for someone" },
        { id: "professional", label: "I provide care services" },
        { id: "community", label: "I want to support the community" }
      ]
    };
  } catch (error) {
    console.error("Error in AI flow:", error);
    
    return {
      message: "I apologize, but I'm having trouble understanding. Could you please select one of these options?",
      options: [
        { id: "family", label: "I need care for someone" },
        { id: "professional", label: "I provide care services" },
        { id: "community", label: "I want to support the community" },
        { id: "help", label: "I need help with something else" }
      ]
    };
  }
};
