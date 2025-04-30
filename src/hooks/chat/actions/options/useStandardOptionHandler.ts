
import { saveChatResponse, isMultiSelectQuestion, setMultiSelectionMode, isTransitionOption, resetMultiSelectionState } from "@/services/chatbotService";

interface UseStandardOptionHandlerProps {
  sessionId: string;
  addMessage: (message: any) => void;
  progress: any;
  formData: Record<string, any>;
  setFormData: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  simulateBotTyping: (message: string, options?: any) => Promise<void>;
  advanceToNextQuestion: (currentQuestionId: string) => Promise<void>;
}

export const useStandardOptionHandler = ({
  sessionId,
  addMessage,
  progress,
  formData,
  setFormData,
  currentSectionIndex,
  currentQuestionIndex,
  simulateBotTyping,
  advanceToNextQuestion
}: UseStandardOptionHandlerProps) => {

  const handleStandardOption = async (optionId: string) => {
    const currentQuestion = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    // Check if this is a section transition option like "continue"
    // These should never trigger multi-selection behavior
    const isTransition = isTransitionOption(optionId);
    
    if (isTransition) {
      console.log(`[handleStandardOption] Handling transition option: ${optionId}`);
      // Reset multi-selection state when processing transition options
      resetMultiSelectionState();
    }
    
    setFormData(prev => ({
      ...prev,
      [currentQuestion]: optionId
    }));
    
    addMessage({
      content: optionId,
      isUser: true,
      timestamp: Date.now()
    });
    
    try {
      await saveChatResponse(
        sessionId,
        progress.role!,
        currentSectionIndex.toString(),
        currentQuestion,
        optionId
      );
    } catch (error) {
      console.error("Error saving response:", error);
    }
    
    if (progress.role) {
      // Skip multi-select check for transition options
      if (isTransition) {
        console.log(`[handleStandardOption] Processing transition option, skipping multi-select check`);
        await advanceToNextQuestion(currentQuestion);
        return true;
      }
      
      // Check if this is a multi-select question
      const isMultiSelect = isMultiSelectQuestion(progress.role, currentSectionIndex, currentQuestionIndex);
      
      if (isMultiSelect) {
        // Start multi-selection mode
        setMultiSelectionMode(true, [optionId]);
        
        await simulateBotTyping(
          `Added "${optionId}" to your selections. You can select more options or click "✓ Done selecting" when finished.`,
          [{ id: "done_selecting", label: "✓ Done selecting" }]
        );
        return true;
      }
      
      // Process normal (non-multi-select) question
      await advanceToNextQuestion(currentQuestion);
      return true;
    }
    
    return false;
  };

  return {
    handleStandardOption
  };
};
