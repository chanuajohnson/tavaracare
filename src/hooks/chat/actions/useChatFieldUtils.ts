
import { detectFieldType, detectFieldTypeFromMessage } from "@/utils/chat/engine/modules/fieldDetection";

export const useChatFieldUtils = () => {
  const getFieldTypeForCurrentQuestion = (
    sectionIndex: number = 0, 
    questionIndex: number = 0,
    role: string | null = null
  ): string | null => {
    // Calculate a unified question index
    const questionGlobalIndex = (sectionIndex * 10) + questionIndex;
    
    // Use the consolidated field detector
    return detectFieldType(role, questionGlobalIndex);
  };

  // Use the consolidated message analyzer
  const analyzeMessageForFieldType = (messageContent: string): string | null => {
    return detectFieldTypeFromMessage(messageContent);
  };

  return {
    getFieldTypeForCurrentQuestion,
    detectFieldTypeFromMessage: analyzeMessageForFieldType
  };
};
