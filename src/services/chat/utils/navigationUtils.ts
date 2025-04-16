
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
 * Get the total number of sections for a role
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
 * Get the title of a section
 */
export const getSectionTitle = (role: string, sectionIndex: number): string => {
  const flow = getRegistrationFlowByRole(role);
  
  if (sectionIndex >= 0 && sectionIndex < flow.sections.length) {
    return flow.sections[sectionIndex].title;
  }
  
  return "";
};
