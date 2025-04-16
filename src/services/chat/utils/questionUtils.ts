
import { getRegistrationFlowByRole, ChatRegistrationQuestion } from "@/data/chatRegistrationFlows";

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
 * Check if a question is a multi-select type
 */
export const isMultiSelectQuestion = (
  role: string,
  sectionIndex: number,
  questionIndex: number
): boolean => {
  const question = getCurrentQuestion(role, sectionIndex, questionIndex);
  return question?.type === "checkbox" || question?.type === "multiselect";
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
