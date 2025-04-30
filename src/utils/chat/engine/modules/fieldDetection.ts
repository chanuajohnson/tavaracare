
import { getCurrentQuestion } from '@/services/chat/utils/questionUtils';

/**
 * Detects and extracts field type from question details
 * @param userRole User's selected role
 * @param questionIndex Current question index
 */
export const detectFieldType = (userRole: string | null, questionIndex: number): string | null => {
  if (!userRole) return null;
  
  const sectionIndex = Math.floor(questionIndex / 10);
  const sectionQuestionIndex = questionIndex % 10;
  const questionDetails = getCurrentQuestion(userRole, sectionIndex, sectionQuestionIndex);
  
  if (!questionDetails) return null;
  
  const label = (questionDetails.label || "").toLowerCase();
  const id = (questionDetails.id || "").toLowerCase();
  
  if (label.includes("email") || id.includes("email")) {
    return "email";
  } else if (label.includes("phone") || id.includes("phone")) {
    return "phone";
  } else if (
    label.includes("name") || 
    id.includes("name") ||
    label.includes("first name") || 
    id.includes("first_name") ||
    label.includes("last name") || 
    id.includes("last_name")
  ) {
    return "name";
  }
  
  return null;
};

/**
 * Generates options for questions based on question type
 * @param userRole User's selected role
 * @param questionIndex Current question index
 */
export const generateQuestionOptions = (userRole: string | null, questionIndex: number) => {
  if (!userRole) {
    if (questionIndex <= 0) {
      return [
        { id: "family", label: "I need care for someone" },
        { id: "professional", label: "I provide care services" },
        { id: "community", label: "I want to support the community" }
      ];
    }
    return undefined;
  }
  
  const sectionIndex = Math.floor(questionIndex / 10);
  const sectionQuestionIndex = questionIndex % 10;
  const questionDetails = getCurrentQuestion(userRole, sectionIndex, sectionQuestionIndex);
  
  if (!questionDetails) return undefined;
  
  if (['select', 'multiselect', 'checkbox'].includes(questionDetails.type)) {
    return questionDetails.options?.map(option => ({
      id: option,
      label: option
    }));
  } else if (questionDetails.type === 'confirm') {
    return [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" }
    ];
  }
  
  return undefined;
};
