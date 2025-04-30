
import { getCurrentQuestion } from '@/services/chat/utils/questionUtils';

/**
 * Detects and extracts field type from question details
 * @param userRole User's selected role
 * @param questionIndex Current question index
 */
export const detectFieldType = (userRole: string | null, questionIndex: number): string | null => {
  if (!userRole) return null;
  
  console.log(`[fieldDetection] Detecting field type for role=${userRole}, questionIndex=${questionIndex}`);
  
  const sectionIndex = Math.floor(questionIndex / 10);
  const sectionQuestionIndex = questionIndex % 10;
  const questionDetails = getCurrentQuestion(userRole, sectionIndex, sectionQuestionIndex);
  
  if (!questionDetails) {
    console.log(`[fieldDetection] No question details found for role=${userRole}, section=${sectionIndex}, question=${sectionQuestionIndex}`);
    return null;
  }
  
  const label = (questionDetails.label || "").toLowerCase();
  const id = (questionDetails.id || "").toLowerCase();
  
  console.log(`[fieldDetection] Analyzing question: "${label}" (id: ${id})`);
  
  if (label.includes("email") || id.includes("email")) {
    console.log(`[fieldDetection] Detected email field type`);
    return "email";
  } else if (
    label.includes("phone") || 
    id.includes("phone") || 
    label.includes("contact number") || 
    id.includes("contact_number") ||
    label.includes("telephone")
  ) {
    console.log(`[fieldDetection] Detected phone field type`);
    return "phone";
  } else if (
    label.includes("name") || 
    id.includes("name") ||
    label.includes("first name") || 
    id.includes("first_name") ||
    label.includes("last name") || 
    id.includes("last_name") ||
    label.includes("full name")
  ) {
    console.log(`[fieldDetection] Detected name field type`);
    return "name";
  } else if (
    label.includes("budget") ||
    id.includes("budget") ||
    label.includes("cost") ||
    label.includes("price") ||
    label.includes("hour")
  ) {
    console.log(`[fieldDetection] Detected budget field type`);
    return "budget";
  }
  
  console.log(`[fieldDetection] No specific field type detected`);
  return null;
};

/**
 * Analyzes message content to detect input field types
 * @param messageContent The bot message to analyze
 */
export const detectFieldTypeFromMessage = (messageContent: string): string | null => {
  if (!messageContent) return null;
  
  const lowerContent = messageContent.toLowerCase();
  console.log(`[fieldDetection] Analyzing message content (first 50 chars): ${lowerContent.substring(0, 50)}...`);
  
  if (
    lowerContent.includes("email") ||
    lowerContent.includes("e-mail") ||
    lowerContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  ) {
    console.log(`[fieldDetection] Detected email field from message`);
    return "email";
  }
  
  if (
    lowerContent.includes("phone") ||
    lowerContent.includes("contact number") ||
    lowerContent.includes("telephone") ||
    lowerContent.includes("call you") ||
    lowerContent.match(/\+[0-9]{1,3}\s[0-9]{3}\s[0-9]{3,4}/)
  ) {
    console.log(`[fieldDetection] Detected phone field from message`);
    return "phone";
  }
  
  if (
    lowerContent.includes("name") ||
    lowerContent.includes("what should i call you") ||
    lowerContent.includes("who am i talking to")
  ) {
    console.log(`[fieldDetection] Detected name field from message`);
    return "name";
  }
  
  if (
    lowerContent.includes("budget") ||
    lowerContent.includes("price") ||
    lowerContent.includes("per hour") ||
    lowerContent.includes("$/hour") ||
    lowerContent.includes("$")
  ) {
    console.log(`[fieldDetection] Detected budget field from message`);
    return "budget";
  }
  
  console.log(`[fieldDetection] No field type detected from message content`);
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
