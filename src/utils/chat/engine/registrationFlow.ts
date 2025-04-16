
import { ChatMessage } from '@/types/chatTypes';
import { 
  generateNextQuestionMessage, 
  isEndOfSection, 
  isEndOfFlow,
  getSectionTitle
} from '@/services/chatbotService';
import { getRegistrationFlowByRole } from '@/data/chatRegistrationFlows';
import { ChatResponse } from './types';

/**
 * Handle registration flow with structured questions based on the selected role
 */
export const handleRegistrationFlow = async (
  messages: ChatMessage[],
  userRole: string,
  sessionId: string,
  questionIndex: number
): Promise<ChatResponse> => {
  try {
    // Extract the section index from the progress
    // For this implementation, we'll use questionIndex / 10 as the section index
    // This allows up to 10 questions per section
    const sectionIndex = Math.floor(questionIndex / 10);
    const questionInSectionIndex = questionIndex % 10;
    
    // If we've reached the end of all sections
    if (isEndOfFlow(userRole, sectionIndex)) {
      return {
        message: `Thank you for providing all this information! This will help us get you set up with the right care services. Would you like to proceed to the registration form with this information pre-filled?`,
        options: [
          { id: "proceed_to_registration", label: "Yes, proceed to registration" },
          { id: "talk_to_representative", label: "I'd like to talk to a representative first" }
        ]
      };
    }
    
    // If we've reached the end of the current section
    if (isEndOfSection(userRole, sectionIndex, questionInSectionIndex)) {
      // Prepare to move to the next section
      const nextSectionIndex = sectionIndex + 1;
      
      if (nextSectionIndex < getRegistrationFlowByRole(userRole).sections.length) {
        const nextSectionTitle = getSectionTitle(userRole, nextSectionIndex);
        
        return {
          message: `Great! Let's move on to the next section: ${nextSectionTitle}.`,
          options: [
            { id: "continue", label: "Continue" },
            { id: "take_break", label: "I need a break" }
          ]
        };
      }
    }
    
    // Generate the next question based on the role, section, and question index
    // If we're at the start of a section, mark it as a transition to prevent duplicate intros
    const isFirstQuestionInSection = questionInSectionIndex === 0;
    const questionResponse = generateNextQuestionMessage(userRole, sectionIndex, questionInSectionIndex, isFirstQuestionInSection);
    
    if (!questionResponse) {
      // If we couldn't generate a question, provide a generic fallback
      return {
        message: "Can you tell me more about your care needs?",
        options: [
          { id: "medical_care", label: "Medical care" },
          { id: "daily_assistance", label: "Daily assistance" },
          { id: "companionship", label: "Companionship" }
        ]
      };
    }
    
    // Return the generated question and options
    return questionResponse;
  } catch (error) {
    console.error('Error in registration flow:', error);
    
    // Fallback response
    return { 
      message: `I'm sorry, I'm having trouble with our registration process. You can also register using our form instead.`,
      options: [
        { id: "retry", label: "Try again" },
        { id: "go_to_form", label: "Go to registration form" }
      ]
    };
  }
};
