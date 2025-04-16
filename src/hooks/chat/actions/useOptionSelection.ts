
import { 
  saveChatResponse, 
  isMultiSelectQuestion, 
  setMultiSelectionMode,
  getMultiSelectionStatus,
  addToMultiSelection,
  completeMultiSelection,
  isEndOfSection,
  getTotalSectionsForRole,
  getSectionTitle,
  getCurrentQuestion
} from "@/services/chatbotService";
import { processConversation } from "@/utils/chat/chatFlowEngine";
import { preparePrefillDataAndGetRegistrationUrl } from "@/utils/chat/prefillGenerator";
import { ChatConfig } from "@/utils/chat/engine/types";
import { ChatMessage } from "@/types/chatTypes";
import { getRoleOptions } from "@/data/chatIntroMessage";
import { toast } from "sonner";

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
  
  const handleOptionSelection = async (optionId: string) => {
    setValidationError(undefined);
    
    const currentQuestion = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    // Check for special completion options
    if (progress.conversationStage === "completion") {
      if (optionId === "proceed_to_registration") {
        // Handle direct navigation to registration form
        console.log("Preparing to redirect to registration form");
        try {
          // Generate prefill data before redirection
          const registrationUrl = await preparePrefillDataAndGetRegistrationUrl(progress.role, messages);
          window.location.href = registrationUrl;
          return;
        } catch (error) {
          console.error("Error preparing registration redirect:", error);
          // Fallback if there's an error
          if (progress.role) {
            window.location.href = `/registration/${progress.role}`;
          }
          return;
        }
      } else if (optionId === "talk_to_representative") {
        // Handle request to talk to a representative
        await simulateBotTyping(
          "I've noted that you'd like to speak with a representative. Someone from our team will reach out to you soon. In the meantime, would you like to complete your registration?",
          [
            { id: "proceed_to_registration", label: "Complete my registration" },
            { id: "close_chat", label: "Close this chat" }
          ]
        );
        return;
      } else if (optionId === "close_chat") {
        // Reset chat if user chooses to close
        return { action: "reset" };
      }
    }
    
    // Check if multi-selection is in progress
    const multiSelectStatus = getMultiSelectionStatus();
    if (multiSelectStatus.active) {
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
      
      // Add or remove this option from the current selections
      const updatedSelections = addToMultiSelection(optionId);
      
      // Add a temporary user message showing the selection
      addMessage({
        content: `Selected: ${optionId}`,
        isUser: true,
        timestamp: Date.now()
      });
      
      // Show a message confirming the selection and asking for more
      await simulateBotTyping(
        `Added "${optionId}" to your selections. You can select more options or click "✓ Done selecting" when finished.`,
        multiSelectStatus.selections.length > 0 ? [
          { id: "done_selecting", label: "✓ Done selecting" }
        ] : undefined
      );
      
      return;
    }
    
    // Regular (non-multi-select) question handling
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
      // Check if this is a multi-select question
      const isMultiSelect = isMultiSelectQuestion(progress.role, currentSectionIndex, currentQuestionIndex);
      
      if (isMultiSelect) {
        // Start multi-selection mode
        setMultiSelectionMode(true, [optionId]);
        
        await simulateBotTyping(
          `Added "${optionId}" to your selections. You can select more options or click "✓ Done selecting" when finished.`,
          [{ id: "done_selecting", label: "✓ Done selecting" }]
        );
        return;
      }
      
      // Process normal (non-multi-select) question
      await advanceToNextQuestion(currentQuestion);
    }
  };
  
  const advanceToNextQuestion = async (currentQuestionId: string) => {
    if (!progress.role) return;
    
    // Check if we've reached the end of the current section
    const isLastQuestionInSection = isEndOfSection(progress.role, currentSectionIndex, currentQuestionIndex);
    
    // Check if we've reached the end of all sections 
    const isLastSection = currentSectionIndex >= getTotalSectionsForRole(progress.role) - 1;
    const isLastQuestion = isLastSection && isLastQuestionInSection;
    
    let nextSectionIndex = currentSectionIndex;
    let nextQuestionIndex = currentQuestionIndex;
    
    if (isLastQuestion) {
      // We've completed the entire flow
      setConversationStage("completion");
    } else if (isLastQuestionInSection) {
      // Move to the next section
      nextSectionIndex = currentSectionIndex + 1;
      nextQuestionIndex = 0;
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
        }
        
        const nextQuestionType = getFieldTypeForCurrentQuestion(nextSectionIndex, nextQuestionIndex);
        setFieldType(nextQuestionType);

        // If we're starting a new section, include section title in the message
        let responseMessage = response.message;
        if (nextQuestionIndex === 0) {
          const sectionTitle = getSectionTitle(progress.role, nextSectionIndex);
          responseMessage = `Great! Let's talk about ${sectionTitle.toLowerCase()}.\n\n${response.message}`;
        }
        
        await simulateBotTyping(responseMessage, response.options);
      }
    } catch (error) {
      console.error("Error processing option selection:", error);
      await simulateBotTyping("I'm having trouble processing that option. Let's continue with another question.", alwaysShowOptions ? getRoleOptions() : undefined);
    }
  };

  return {
    handleOptionSelection,
    advanceToNextQuestion
  };
};
