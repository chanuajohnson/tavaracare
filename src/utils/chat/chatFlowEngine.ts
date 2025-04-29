
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
  console.log(`[processConversation] Starting with params:`, { 
    sessionId: sessionId.substring(0, 6) + '...',
    role, 
    questionIndex, 
    isFirstQuestion,
    useAIPrompts: config.useAIPrompts
  });

  if (!role) {
    console.error(`[processConversation] No role provided!`);
    return {
      message: "I couldn't determine your role. Let's start over.",
      options: []
    };
  }

  try {
    // Get the section and question index
    const sectionIndex = Math.floor(questionIndex / 10);
    const localQuestionIndex = questionIndex % 10;
    
    console.log(`[processConversation] Processing for ${role}, section ${sectionIndex}, question ${localQuestionIndex}`);
    
    // Get the registration flow
    const flow = getRegistrationFlowByRole(role);
    
    if (!flow || !flow.sections || sectionIndex >= flow.sections.length) {
      console.error(`[processConversation] Invalid flow or section index out of bounds:`, {
        flowExists: !!flow,
        sectionsExist: !!(flow && flow.sections),
        sectionIndex
      });
      return {
        message: "I'm having trouble with this part of the registration. Let's try something else.",
        options: []
      };
    }
    
    // Check if the section exists and has questions
    const section = flow.sections[sectionIndex];
    if (!section || !section.questions || localQuestionIndex >= section.questions.length) {
      console.error(`[processConversation] Invalid section or question index out of bounds:`, {
        sectionExists: !!section,
        questionsExist: !!(section && section.questions),
        localQuestionIndex
      });
      return {
        message: "I'm having trouble finding the right questions. Let's try a different approach.",
        options: []
      };
    }
    
    // Choose between AI prompt generation or standard message generation
    let response;
    // Use the optional chaining operator to safely check if useAIPrompts is true
    if (config.useAIPrompts === true) {
      try {
        console.log(`[processConversation] Using AI prompt generation for ${role}, section ${sectionIndex}, question ${localQuestionIndex}`);
        response = await generatePrompt(role, messages, sectionIndex, localQuestionIndex);
        console.log(`[processConversation] AI prompt generated:`, {
          messageLength: response.message?.length || 0,
          hasOptions: !!(response.options && response.options.length),
          optionsCount: response.options?.length || 0
        });
      } catch (error) {
        console.error(`[processConversation] Error with AI prompt generation:`, error);
        // Fall back to standard message generation
        console.log(`[processConversation] Falling back to standard message generation`);
        response = generateNextQuestionMessage(role, sectionIndex, localQuestionIndex, isFirstQuestion);
      }
    } else {
      console.log(`[processConversation] Using standard message generation for ${role}, section ${sectionIndex}, question ${localQuestionIndex}`);
      response = generateNextQuestionMessage(role, sectionIndex, localQuestionIndex, isFirstQuestion);
    }
    
    if (!response || !response.message) {
      console.error(`[processConversation] Generated empty response!`);
      return {
        message: "Hmm, I couldn't find the next step. Would you like to refresh or try again?",
        options: [
          { id: "retry", label: "Try again" },
          { id: "restart", label: "Start over" }
        ]
      };
    }
    
    console.log(`[processConversation] Returning response:`, {
      messagePreview: response.message.substring(0, 50) + "...",
      hasOptions: !!(response.options && response.options.length),
      optionsCount: response.options?.length || 0
    });
    
    return response;
  } catch (error) {
    console.error(`[processConversation] Error processing conversation:`, error);
    return {
      message: "I encountered an error processing our conversation. Would you like to try again?",
      options: [
        { id: "retry", label: "Try again" },
        { id: "start_over", label: "Start over" }
      ]
    };
  }
};
