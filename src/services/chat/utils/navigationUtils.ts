
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
