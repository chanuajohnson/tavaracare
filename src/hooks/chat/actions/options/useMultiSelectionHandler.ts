
import { 
  saveChatResponse, 
  addToMultiSelection,
  completeMultiSelection,
  getMultiSelectionStatus,
  removeFromMultiSelection
} from "@/services/chatbotService";
import { ChatMessage } from "@/types/chatTypes";

interface UseMultiSelectionHandlerProps {
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

export const useMultiSelectionHandler = ({
  sessionId,
  addMessage,
  progress,
  formData,
  setFormData,
  currentSectionIndex,
  currentQuestionIndex,
  simulateBotTyping,
  advanceToNextQuestion
}: UseMultiSelectionHandlerProps) => {

  const handleMultiSelection = async (optionId: string) => {
    const currentQuestion = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    // Check if "done_selecting" option was chosen
    if (optionId === "done_selecting") {
      // Complete the multi-selection
      const selections = completeMultiSelection();
      
      if (selections.length === 0) {
        await simulateBotTyping("Please select at least one option before continuing.");
        return;
      }
      
      // Join selections and add as user message
      const selectionText = selections.join(", ");
      addMessage({
        content: selectionText,
        isUser: true,
        timestamp: Date.now()
      });
      
      // Update form data with the array of selections
      setFormData(prev => ({
        ...prev,
        [currentQuestion]: selections
      }));
      
      // Save the response
      try {
        await saveChatResponse(
          sessionId,
          progress.role!,
          currentSectionIndex.toString(),
          currentQuestion,
          selections
        );
      } catch (error) {
        console.error("Error saving multi-select response:", error);
      }
      
      // Now proceed to next question
      await advanceToNextQuestion(currentQuestion);
      return;
    }
    
    // Toggle selection (add or remove) without showing intermediate messages
    const multiSelectStatus = getMultiSelectionStatus();
    if (multiSelectStatus.selections.includes(optionId)) {
      removeFromMultiSelection(optionId);
    } else {
      addToMultiSelection(optionId);
    }
  };

  return {
    handleMultiSelection
  };
};
