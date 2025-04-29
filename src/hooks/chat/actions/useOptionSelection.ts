import { getMultiSelectionStatus } from "@/services/chatbotService";
import { toast } from "sonner";
import { useCompletionHandler } from "./options/useCompletionHandler";
import { useMultiSelectionHandler } from "./options/useMultiSelectionHandler";
import { useStandardOptionHandler } from "./options/useStandardOptionHandler";
import { useQuestionNavigation } from "./options/useQuestionNavigation";
import { ChatConfig } from "@/utils/chat/engine/types";
import { ChatMessage } from "@/types/chatTypes";

interface UseOptionSelectionProps {
  sessionId: string;
  messages: ChatMessage[];
  addMessage: (message: any) => void;
  progress: any;
  updateProgress: (updates: any) => void;
  formData: Record<string, any>;
  setFormData: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  currentSectionIndex: number;
  setCurrentSectionIndex: (index: number) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  setConversationStage: (stage: "intro" | "questions" | "completion") => void;
  config: ChatConfig;
  simulateBotTyping: (message: string, options?: any) => Promise<void>;
  alwaysShowOptions: boolean;
  updateChatProgress: Function;
  setValidationError: (error?: string) => void;
  setFieldType: (type: string | null) => void;
  getFieldTypeForCurrentQuestion: (sectionIndex?: number, questionIndex?: number) => string | null;
}

export const useOptionSelection = ({
  sessionId,
  messages,
  addMessage,
  progress,
  updateProgress,
  formData,
  setFormData,
  currentSectionIndex,
  setCurrentSectionIndex,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  setConversationStage,
  config,
  simulateBotTyping,
  alwaysShowOptions,
  updateChatProgress,
  setValidationError,
  setFieldType,
  getFieldTypeForCurrentQuestion
}: UseOptionSelectionProps) => {
  
  // Set up question navigation hook - pass updateProgress here
  const { advanceToNextQuestion } = useQuestionNavigation({
    sessionId,
    messages,
    progress,
    formData,
    currentSectionIndex,
    setCurrentSectionIndex,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setConversationStage,
    config,
    simulateBotTyping,
    alwaysShowOptions,
    updateChatProgress,
    setFieldType,
    getFieldTypeForCurrentQuestion,
    updateProgress // Pass it here!
  });
  
  // Set up completion handler hook
  const { handleCompletionOption } = useCompletionHandler({
    progress,
    messages,
    simulateBotTyping
  });
  
  // Set up multi-selection handler hook
  const { handleMultiSelection } = useMultiSelectionHandler({
    sessionId,
    addMessage,
    progress,
    formData,
    setFormData,
    currentSectionIndex,
    currentQuestionIndex,
    simulateBotTyping,
    advanceToNextQuestion
  });
  
  // Set up standard option handler hook
  const { handleStandardOption } = useStandardOptionHandler({
    sessionId,
    addMessage,
    progress,
    formData,
    setFormData,
    currentSectionIndex,
    currentQuestionIndex,
    simulateBotTyping,
    advanceToNextQuestion
  });
  
  const handleOptionSelection = async (optionId: string) => {
    setValidationError(undefined);
    
    // Check for special completion options
    if (progress.conversationStage === "completion") {
      const result = await handleCompletionOption(optionId);
      if (result) return result;
    }
    
    // Check if multi-selection is in progress
    const multiSelectStatus = getMultiSelectionStatus();
    if (multiSelectStatus.active) {
      await handleMultiSelection(optionId);
      return;
    }
    
    // Regular (non-multi-select) question handling
    await handleStandardOption(optionId);
  };

  return {
    handleOptionSelection,
    advanceToNextQuestion
  };
};
