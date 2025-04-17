
import { getRegistrationFlowByRole } from "@/data/chatRegistrationFlows";

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
 * Generate a transition message between sections
 */
export const generateSectionTransitionMessage = (
  role: string,
  currentSectionIndex: number,
  nextSectionIndex: number
): string | null => {
  try {
    // If we're not actually changing sections, don't generate a message
    if (currentSectionIndex === nextSectionIndex) {
      return null;
    }
    
    const flow = getRegistrationFlowByRole(role);
    
    // Check if indices are valid
    if (nextSectionIndex < 0 || nextSectionIndex >= flow.sections.length) {
      return null;
    }
    
    const nextSection = flow.sections[nextSectionIndex];
    
    // Generate transition message
    return `Great! Let's talk about ${nextSection.title.toLowerCase()}.`;
  } catch (err) {
    console.error("Error generating section transition:", err);
    return null;
  }
};

/**
 * Calculate the overall question index from section and question indices
 */
export const calculateOverallQuestionIndex = (
  sectionIndex: number,
  questionIndex: number
): number => {
  return sectionIndex * 10 + questionIndex;
};

/**
 * Extract section and question indices from overall index
 */
export const extractSectionAndQuestionIndices = (
  overallQuestionIndex: number
): { sectionIndex: number; questionIndex: number } => {
  const sectionIndex = Math.floor(overallQuestionIndex / 10);
  const questionIndex = overallQuestionIndex % 10;
  
  return { sectionIndex, questionIndex };
};
