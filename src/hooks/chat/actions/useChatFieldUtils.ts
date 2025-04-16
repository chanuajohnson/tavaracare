
import { getCurrentQuestion } from "@/services/chatbotService";

export const useChatFieldUtils = () => {
  const getFieldTypeForCurrentQuestion = (
    role: string | null,
    sectionIndex: number = 0, 
    questionIndex: number = 0
  ): string | null => {
    if (!role) return null;
    
    const question = getCurrentQuestion(
      role,
      sectionIndex,
      questionIndex
    );
    
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

  return {
    getFieldTypeForCurrentQuestion
  };
};
