
import { getRegistrationFlowByRole, ChatRegistrationQuestion } from "@/data/chatRegistrationFlows";
import { ChatResponseData } from "./types";

/**
 * Generate next question message based on role, section and question index
 */
export const generateNextQuestionMessage = (
  role: string,
  sectionIndex: number,
  questionIndex: number
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
    
    // Add section context to first question in each section
    let message = question.label;
    if (questionIndex === 0) {
      message = `Let's talk about ${section.title.toLowerCase()}.\n\n${question.label}`;
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

/**
 * Check if we've reached the end of the current section
 */
export const isEndOfSection = (
  role: string,
  sectionIndex: number,
  questionIndex: number
): boolean => {
  const flow = getRegistrationFlowByRole(role);
  
  if (sectionIndex < 0 || sectionIndex >= flow.sections.length) {
    return true;
  }
  
  return questionIndex >= flow.sections[sectionIndex].questions.length - 1;
};

/**
 * Check if we've reached the end of all sections
 */
export const isEndOfFlow = (
  role: string,
  sectionIndex: number
): boolean => {
  const flow = getRegistrationFlowByRole(role);
  return sectionIndex >= flow.sections.length - 1;
};

/**
 * Get the current question
 */
export const getCurrentQuestion = (
  role: string,
  sectionIndex: number,
  questionIndex: number
): ChatRegistrationQuestion | null => {
  try {
    const flow = getRegistrationFlowByRole(role);
    
    if (
      sectionIndex < 0 ||
      sectionIndex >= flow.sections.length ||
      questionIndex < 0 ||
      questionIndex >= flow.sections[sectionIndex].questions.length
    ) {
      return null;
    }
    
    return flow.sections[sectionIndex].questions[questionIndex];
  } catch (err) {
    console.error("Error getting current question:", err);
    return null;
  }
};

/**
 * Export the function to get the section title
 */
export const getSectionTitle = (role: string, sectionIndex: number): string => {
  const flow = getRegistrationFlowByRole(role);
  
  if (sectionIndex >= 0 && sectionIndex < flow.sections.length) {
    return flow.sections[sectionIndex].title;
  }
  
  return "";
};

/**
 * Get total number of sections for a specific role
 */
export const getTotalSectionsForRole = (role: string): number => {
  try {
    const flow = getRegistrationFlowByRole(role);
    return flow.sections.length;
  } catch (err) {
    console.error("Error getting total sections:", err);
    return 0;
  }
};

/**
 * Generate a summary of the collected data
 */
export const generateDataSummary = (formData: Record<string, any>): string => {
  const entries = Object.entries(formData);
  if (entries.length === 0) {
    return "No information collected yet.";
  }
  
  const lines = entries.map(([key, value]) => {
    let displayValue = value;
    
    // Format arrays
    if (Array.isArray(value)) {
      displayValue = value.join(", ");
    }
    
    // Format the key for display
    const displayKey = key
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
      
    return `${displayKey}: ${displayValue}`;
  });
  
  return lines.join("\n");
};
