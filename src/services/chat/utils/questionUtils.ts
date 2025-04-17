
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
  return question ? (question.type === "checkbox" || question.type === "multiselect") : false;
};

/**
 * Get the section title for a given role and section index
 */
export const getSectionTitle = (
  role: string,
  sectionIndex: number
): string => {
  try {
    const flow = getRegistrationFlowByRole(role);
    
    if (sectionIndex < 0 || sectionIndex >= flow.sections.length) {
      return "Registration";
    }
    
    return flow.sections[sectionIndex].title;
  } catch (err) {
    console.error("Error getting section title:", err);
    return "Registration";
  }
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
 * Determines the field type based on question content
 */
export const getFieldTypeForQuestion = (question: ChatRegistrationQuestion | null): string | null => {
  if (!question) return null;
  
  const label = (question.label || "").toLowerCase();
  const id = (question.id || "").toLowerCase();
  
  // Email detection
  if (label.includes("email") || id.includes("email")) {
    return "email";
  }
  
  // Phone detection
  if (
    label.includes("phone") || 
    id.includes("phone") || 
    label.includes("contact number") || 
    id.includes("contact_number") ||
    label.includes("mobile") ||
    id.includes("mobile")
  ) {
    return "phone";
  }
  
  // Name detection
  if (
    label.includes("first name") || 
    id.includes("first_name") ||
    label.includes("full name") ||
    id.includes("full_name") ||
    label.includes("last name") || 
    id.includes("last_name") ||
    (label.includes("name") && !label.includes("username"))
  ) {
    return "name";
  }
  
  // Budget detection
  if (
    label.includes("budget") ||
    id.includes("budget") ||
    label.includes("rate") ||
    id.includes("rate") ||
    label.includes("price") ||
    id.includes("price")
  ) {
    return "budget";
  }
  
  // Address detection
  if (
    label.includes("address") ||
    id.includes("address") ||
    label.includes("street") ||
    id.includes("street")
  ) {
    return "address";
  }
  
  // Zip/Postal code detection
  if (
    label.includes("zip") ||
    id.includes("zip") ||
    label.includes("postal") ||
    id.includes("postal")
  ) {
    return "zipcode";
  }
  
  // Date detection
  if (
    label.includes("date") ||
    id.includes("date") ||
    label.includes("birthday") ||
    id.includes("birthday") ||
    label.includes("born")
  ) {
    return "date";
  }
  
  // Default to text for input types
  if (question.type === "text" || question.type === "textarea") {
    return "text";
  }
  
  return null;
};
