
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
 * Get the field type for validation based on the current question
 */
export const getFieldTypeForQuestion = (
  role: string,
  sectionIndex: number,
  questionIndex: number
): string | null => {
  const question = getCurrentQuestion(role, sectionIndex, questionIndex);
  
  if (!question) return null;
  
  const label = (question.label || "").toLowerCase();
  const id = (question.id || "").toLowerCase();
  
  if (label.includes("email") || id.includes("email")) {
    return "email";
  } else if (label.includes("phone") || id.includes("phone") || label.includes("contact number") || id.includes("contact_number")) {
    return "phone";
  } else if (
    label.includes("first name") || 
    id.includes("first_name") ||
    label.includes("full name") ||
    id.includes("full_name")
  ) {
    return "name";
  } else if (
    label.includes("last name") || 
    id.includes("last_name")
  ) {
    return "name";
  } else if (
    label.includes("budget") ||
    id.includes("budget")
  ) {
    return "budget";
  }
  
  return null;
};
