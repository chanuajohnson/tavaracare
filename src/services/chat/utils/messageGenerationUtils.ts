
import { getRegistrationFlowByRole } from "@/data/chatRegistrationFlows";
import { ChatResponseData } from "../types";

/**
 * Generate next question message based on role, section and question index
 */
export const generateNextQuestionMessage = (
  role: string,
  sectionIndex: number,
  questionIndex: number,
  isFirstQuestion: boolean = false
): ChatResponseData => {
  try {
    const flow = getRegistrationFlowByRole(role);
    
    if (
      sectionIndex < 0 ||
      sectionIndex >= flow.sections.length ||
      questionIndex < 0 ||
      questionIndex >= flow.sections[sectionIndex].questions.length
    ) {
      return {
        message: "I'm not sure what to ask next. Let's try something else.",
        options: [
          { id: "restart", label: "Start over" },
          { id: "form", label: "Fill out registration form" }
        ]
      };
    }
    
    const section = flow.sections[sectionIndex];
    const question = section.questions[questionIndex];
    
    // For select/multiselect/checkbox, provide options
    let options;
    if (
      question.type === "select" ||
      question.type === "multiselect" ||
      question.type === "checkbox"
    ) {
      options = question.options?.map(option => ({
        id: option,
        label: option
      }));
    }
    
    // For confirm questions, provide yes/no options
    if (question.type === "confirm") {
      options = [
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" }
      ];
    }
    
    // Use just the question label without redundant intro text
    let message = question.label;
    
    // Add special prompts for specific question types
    if (question.id === "budget") {
      message = `${question.label} Please specify an hourly range (e.g., $20-30/hour) or say 'Negotiable'.`;
    }
    
    // For multi-select questions, add instruction
    if (question.type === "checkbox" || question.type === "multiselect") {
      message = `${question.label} (Please select all that apply)`;
      
      // Add "Done selecting" option for multi-select
      if (options && options.length > 0) {
        options.push({ id: "done_selecting", label: "✓ Done selecting" });
      }
    }
    
    // Add section title handling - consider if this is the very first question after role selection
    if (isFirstQuestion) {
      // For the first question after role selection, use a more natural format
      // without adding redundant greetings
      message = `${message}`;
    }
    else if (questionIndex === 0) {
      // Only add section transition for subsequent sections, not the first one after role selection
      message = `Now let's talk about ${section.title.toLowerCase()}.\n\n${message}`;
    }
    
    return {
      message,
      options
    };
  } catch (err) {
    console.error("Error generating question message:", err);
    return {
      message: "I'm sorry, I encountered an error. Would you like to try again?",
      options: [
        { id: "retry", label: "Try again" },
        { id: "form", label: "Go to registration form" }
      ]
    };
  }
};
