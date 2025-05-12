
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
  
  // Add a new utility function to get field type from multiple sources
  const getFieldTypeFromContext = (
    sectionIndex: number = 0,
    questionIndex: number = 0,
    role: string | null = null,
    lastBotMessage: string | null = null
  ): string | null => {
    // First try from the role and question index
    const fromQuestion = getFieldTypeForCurrentQuestion(sectionIndex, questionIndex, role);
    if (fromQuestion) return fromQuestion;
    
    // Next try from the last bot message if available
    if (lastBotMessage) {
      const fromMessage = detectFieldTypeFromMessage(lastBotMessage);
      if (fromMessage) return fromMessage;
    }
    
    return null;
  };

  return {
    getFieldTypeForCurrentQuestion,
    detectFieldTypeFromMessage: analyzeMessageForFieldType,
    getFieldTypeFromContext
  };
};
