import { 
  isEndOfSection,
  getTotalSectionsForRole,
  getSectionTitle,
  isMultiSelectQuestion,
  setMultiSelectionMode,
  resetMultiSelectionState
} from "@/services/chatbotService";
import { processConversation } from "@/utils/chat/chatFlowEngine";
import { preparePrefillDataAndGetRegistrationUrl } from "@/utils/chat/prefillGenerator";
import { ChatConfig } from "@/utils/chat/engine/types";
import { getRoleOptions } from "@/data/chatIntroMessage";

interface UseQuestionNavigationProps {
  sessionId: string;
  messages: any[];
  progress: any;
  formData: Record<string, any>;
  currentSectionIndex: number;
  setCurrentSectionIndex: (index: number) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  setConversationStage: (stage: "intro" | "questions" | "completion") => void;
  config: ChatConfig;
  simulateBotTyping: (message: string, options?: any) => Promise<void>;
  alwaysShowOptions: boolean;
  updateChatProgress: Function;
  setFieldType: (type: string | null) => void;
  getFieldTypeForCurrentQuestion: (sectionIndex?: number, questionIndex?: number) => string | null;
  updateProgress: (updates: any) => void;
}

export const useQuestionNavigation = ({
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
  updateProgress
}: UseQuestionNavigationProps) => {

  const advanceToNextQuestion = async (currentQuestionId: string) => {
    if (!progress.role) return;
    
    // Check if we've reached the end of the current section
    const isLastQuestionInSection = isEndOfSection(progress.role, currentSectionIndex, currentQuestionIndex);
    
    // Check if we've reached the end of all sections 
    const isLastSection = currentSectionIndex >= getTotalSectionsForRole(progress.role) - 1;
    const isLastQuestion = isLastSection && isLastQuestionInSection;
    
    let nextSectionIndex = currentSectionIndex;
    let nextQuestionIndex = currentQuestionIndex;
    let movingToNewSection = false;
    
    if (isLastQuestion) {
      // We've completed the entire flow
      setConversationStage("completion");
    } else if (isLastQuestionInSection) {
      // Move to the next section
      nextSectionIndex = currentSectionIndex + 1;
      nextQuestionIndex = 0;
      movingToNewSection = true;
      
      // Important: Reset multi-selection state when moving to a new section
      resetMultiSelectionState();
      console.log("[advanceToNextQuestion] Moving to new section, reset multi-selection state");
    } else {
      // Move to the next question in the current section
      nextQuestionIndex = currentQuestionIndex + 1;
    }
    
    const overallQuestionIndex = nextSectionIndex * 10 + nextQuestionIndex;
    
    setCurrentSectionIndex(nextSectionIndex);
    setCurrentQuestionIndex(nextQuestionIndex);
    
    updateProgress({
      role: progress.role,
      questionIndex: overallQuestionIndex
    });
    
    try {
      await updateChatProgress(
        sessionId,
        progress.role,
        currentSectionIndex.toString(),
        isLastQuestion ? "completed" : "in_progress",
        currentQuestionId,
        formData
      );
    } catch (error) {
      console.error("Error updating chat progress:", error);
    }
    
    const updatedMessages = [...messages, { content: "Selection saved", isUser: false, timestamp: Date.now() }];
    
    try {
      if (isLastQuestion) {
        // If this is the last question, move to completion stage
        // Ensure prefill data is generated and saved
        await preparePrefillDataAndGetRegistrationUrl(progress.role, updatedMessages);
        
        await simulateBotTyping(
          `Thanks for providing all this information! Based on your answers, we recommend completing your ${progress.role} registration. Click below to continue to the registration form with your data pre-filled.`,
          [
            { id: "proceed_to_registration", label: "Complete my registration" },
            { id: "talk_to_representative", label: "I'd like to talk to a representative first" }
          ]
        );
      } else {
        // If moving to a new section, show a transition message
        if (movingToNewSection) {
          const nextSectionTitle = getSectionTitle(progress.role, nextSectionIndex);
          
          // Add a brief transition delay to improve UX
          await new Promise(resolve => setTimeout(resolve, 300));
          
          await simulateBotTyping(
            `Great! You've completed the ${getSectionTitle(progress.role, currentSectionIndex).toLowerCase()} section.\n\nNow let's move on to ${nextSectionTitle.toLowerCase()}.`,
            [{ id: "continue", label: "Continue" }]
          );
          return;
        }
        
        const response = await processConversation(
          updatedMessages,
          sessionId,
          progress.role,
          overallQuestionIndex,
          config
        );
        
        // Check if next question is multi-select
        const nextIsMultiSelect = isMultiSelectQuestion(progress.role, nextSectionIndex, nextQuestionIndex);
        if (nextIsMultiSelect) {
          setMultiSelectionMode(false, []); // Reset multi-selection mode for new question
        } else {
          // Ensure multi-selection is turned off for non-multi-select questions
          resetMultiSelectionState();
        }
        
        const nextQuestionType = getFieldTypeForCurrentQuestion(nextSectionIndex, nextQuestionIndex);
        setFieldType(nextQuestionType);

        // If we're starting a new section, include section title in the message
        let responseMessage = response.message;
        if (nextQuestionIndex === 0) {
          const sectionTitle = getSectionTitle(progress.role, nextSectionIndex);
          responseMessage = `Now let's move on to ${sectionTitle.toLowerCase()}.\n\n${responseMessage}`;
        }
        
        await simulateBotTyping(responseMessage, response.options);
      }
    } catch (error) {
      console.error("Error processing option selection:", error);
      await simulateBotTyping("I'm having trouble processing that option. Let's continue with another question.", alwaysShowOptions ? getRoleOptions() : undefined);
    }
  };

  return {
    advanceToNextQuestion
  };
};
