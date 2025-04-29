
import { getCurrentQuestion } from "@/services/chatbotService";

export const useChatFieldUtils = () => {
  const getFieldTypeForCurrentQuestion = (
    sectionIndex: number = 0, 
    questionIndex: number = 0,
    role: string | null = null
  ): string | null => {
    // Handle the case where role is null or empty
    if (!role) {
      console.log("[useChatFieldUtils] Warning: No role provided for field type detection");
      return null;
    }
    
    console.log(`[useChatFieldUtils] Getting field type for role: ${role}, section: ${sectionIndex}, question: ${questionIndex}`);
    
    try {
      const question = getCurrentQuestion(
        role,
        sectionIndex,
        questionIndex
      );
      
      if (!question) {
        console.log(`[useChatFieldUtils] No question found for role: ${role}, section: ${sectionIndex}, question: ${questionIndex}`);
        return null;
      }
      
      const label = (question.label || "").toLowerCase();
      const id = (question.id || "").toLowerCase();
      
      console.log(`[useChatFieldUtils] Analyzing question: ${label} (${id})`);
      
      if (label.includes("email") || id.includes("email")) {
        console.log(`[useChatFieldUtils] Detected email field for question: ${label}`);
        return "email";
      } else if (label.includes("phone") || id.includes("phone") || label.includes("contact number") || id.includes("contact_number")) {
        console.log(`[useChatFieldUtils] Detected phone field for question: ${label}`);
        return "phone";
      } else if (
        label.includes("first name") || 
        id.includes("first_name") ||
        label.includes("full name") ||
        id.includes("full_name") ||
        label.includes("name")
      ) {
        console.log(`[useChatFieldUtils] Detected name field for question: ${label}`);
        return "name";
      } else if (
        label.includes("last name") || 
        id.includes("last_name")
      ) {
        console.log(`[useChatFieldUtils] Detected name field for question: ${label}`);
        return "name";
      } else if (
        label.includes("budget") ||
        id.includes("budget")
      ) {
        console.log(`[useChatFieldUtils] Detected budget field for question: ${label}`);
        return "budget";
      }
      
      console.log(`[useChatFieldUtils] No specific field type detected for question: ${label}`);
    } catch (error) {
      console.error(`[useChatFieldUtils] Error detecting field type:`, error);
    }
    
    return null;
  };

  return {
    getFieldTypeForCurrentQuestion
  };
};
