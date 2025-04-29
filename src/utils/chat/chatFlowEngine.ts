
import { getRegistrationFlowByRole } from "@/data/chatRegistrationFlows";
import { generateNextQuestionMessage } from "@/services/chat/responseUtils";
import { ChatConfig } from "./engine/types";
import { generatePrompt } from "./generatePrompt";

/**
 * Process the conversation state and determine the next message/options
 */
export const processConversation = async (
  messages: any[],
  sessionId: string,
  role: string | null,
  questionIndex: number,
  config: ChatConfig,
  isFirstQuestion: boolean = false
) => {
  if (!role) {
    return {
      message: "I couldn't determine your role. Let's start over.",
      options: []
    };
  }

  try {
    // Get the section and question index
    const sectionIndex = Math.floor(questionIndex / 10);
    const localQuestionIndex = questionIndex % 10;
    
    console.log(`Processing conversation for ${role}, section ${sectionIndex}, question ${localQuestionIndex}`);
    
    // Get the registration flow
    const flow = getRegistrationFlowByRole(role);
    
    if (!flow || !flow.sections || sectionIndex >= flow.sections.length) {
      console.error("Invalid flow or section index out of bounds");
      return {
        message: "I'm having trouble with this part of the registration. Let's try something else.",
        options: []
      };
    }
    
    // Check if the section exists and has questions
    const section = flow.sections[sectionIndex];
    if (!section || !section.questions || localQuestionIndex >= section.questions.length) {
      console.error("Invalid section or question index out of bounds");
      return {
        message: "I'm having trouble finding the right questions. Let's try a different approach.",
        options: []
      };
    }
    
    // Choose between AI prompt generation or standard message generation
    let response;
    if (config.useAIPrompts) {
      try {
        console.log("Using AI prompt generation");
        response = await generatePrompt(role, messages, sectionIndex, localQuestionIndex);
      } catch (error) {
        console.error("Error with AI prompt generation:", error);
        // Fall back to standard message generation
        response = generateNextQuestionMessage(role, sectionIndex, localQuestionIndex, isFirstQuestion);
      }
    } else {
      console.log("Using standard message generation");
      response = generateNextQuestionMessage(role, sectionIndex, localQuestionIndex, isFirstQuestion);
    }
    
    return response;
  } catch (error) {
    console.error("Error processing conversation:", error);
    return {
      message: "I encountered an error processing our conversation. Would you like to try again?",
      options: [
        { id: "retry", label: "Try again" },
        { id: "start_over", label: "Start over" }
      ]
    };
  }
};
