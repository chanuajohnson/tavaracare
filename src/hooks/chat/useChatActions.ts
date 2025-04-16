
import { syncMessagesToSupabase } from "@/services/aiService";
import { processConversation } from "@/utils/chat/chatFlowEngine";
import { 
  updateChatProgress, 
  saveChatResponse, 
  getSessionResponses, 
  validateChatInput,
  setMultiSelectionMode,
  getMultiSelectionStatus,
  addToMultiSelection,
  completeMultiSelection
} from "@/services/chatbotService";
import { generatePrefillJson } from "@/utils/chat/prefillGenerator";
import { toast } from "sonner";
import { ChatConfig } from "@/utils/chat/engine/types";
import { getIntroMessage, getRoleOptions } from "@/data/chatIntroMessage";
import { ChatMessage } from "@/types/chatTypes";
import { 
  getCurrentQuestion, 
  isEndOfSection, 
  isEndOfFlow, 
  getSectionTitle, 
  getTotalSectionsForRole, 
  isMultiSelectQuestion
} from "@/services/chatbotService";

export const useChatActions = (
  sessionId: string,
  messages: ChatMessage[],
  addMessage: (message: any) => void,
  progress: any,
  updateProgress: (updates: any) => void,
  formData: Record<string, any>,
  setFormData: (updater: (prev: Record<string, any>) => Record<string, any>) => void,
  currentSectionIndex: number,
  setCurrentSectionIndex: (index: number) => void,
  currentQuestionIndex: number,
  setCurrentQuestionIndex: (index: number) => void,
  setConversationStage: (stage: "intro" | "questions" | "completion") => void,
  config: ChatConfig,
  setInitialRole: (role: string | null) => void,
  clearMessages: () => void,
  clearProgress: () => void,
  simulateBotTyping: (message: string, options?: any) => Promise<void>,
  resetChatState: () => void,
  alwaysShowOptions: boolean,
  input: string,
  setInput: (value: string) => void,
  conversationStage: "intro" | "questions" | "completion",
  skipIntro: boolean,
  setIsResuming: (value: boolean) => void,
  setValidationError: (error?: string) => void,
  setFieldType: (type: string | null) => void
) => {
  const handleRoleSelection = async (roleId: string) => {
    if (roleId === "resume") {
      handleResumeChat();
      return;
    }
    
    if (roleId === "restart") {
      resetChat(true);
      return;
    }
    
    addMessage({
      content: `I'm a ${roleId}.`,
      isUser: true,
      timestamp: Date.now()
    });
    
    try {
      await saveChatResponse(
        sessionId,
        roleId,
        "intro",
        "role_selection",
        roleId
      );
      
      await updateChatProgress(
        sessionId,
        roleId,
        "0",
        "not_started",
        "role_selection",
        { role: roleId }
      );
    } catch (error) {
      console.error("Error saving role selection:", error);
    }
    
    updateProgress({
      role: roleId,
      questionIndex: 0
    });
    
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    
    setFormData(prev => ({
      ...prev,
      role: roleId
    }));
    
    try {
      let previousResponses = {};
      try {
        previousResponses = await getSessionResponses(sessionId);
      } catch (err) {
        console.log("No previous responses found");
      }
      
      const response = await processConversation(
        [...messages, { content: `I'm a ${roleId}.`, isUser: true, timestamp: Date.now() }],
        sessionId,
        roleId,
        0,
        config
      );
      
      const questionType = getFieldTypeForCurrentQuestion();
      setFieldType(questionType);
      
      const sectionTitle = getSectionTitle(roleId, 0);
      const introMessage = sectionTitle 
        ? `Great! Let's start with some ${sectionTitle.toLowerCase()}. ${response.message}`
        : response.message;
        
      await simulateBotTyping(introMessage, response.options);
      setConversationStage("questions");
    } catch (error) {
      console.error("Error in role selection:", error);
      await simulateBotTyping("I'm having trouble with your selection. Could you try again?", getRoleOptions());
    }
  };

  const handleInitialRoleSelection = async (roleId: string) => {
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    
    updateProgress({
      role: roleId,
      questionIndex: 0
    });
    
    setInitialRole(null);
    localStorage.removeItem('tavara_chat_initial_role');
    
    setFormData(prev => ({
      ...prev,
      role: roleId
    }));
    
    try {
      await updateChatProgress(
        sessionId,
        roleId,
        "0",
        "not_started",
        undefined,
        { role: roleId }
      );
    } catch (error) {
      console.error("Error updating chat progress:", error);
    }
    
    const response = await processConversation(
      [],
      sessionId,
      roleId,
      0,
      config
    );
    
    const sectionTitle = getSectionTitle(roleId, 0);
    const introMessage = sectionTitle 
      ? `Great! Let's start with some ${sectionTitle.toLowerCase()}. ${response.message}`
      : response.message;
      
    await simulateBotTyping(introMessage, response.options);
    setConversationStage("questions");
  };

  const handleResumeChat = async () => {
    try {
      const partialProgress = JSON.parse(localStorage.getItem(`tavara_chat_progress_${sessionId}`) || "{}");
      if (partialProgress.role) {
        const sectionIndex = Math.floor((partialProgress.questionIndex || 0) / 10);
        const questionIndex = (partialProgress.questionIndex || 0) % 10;
        
        updateProgress({
          role: partialProgress.role,
          questionIndex: partialProgress.questionIndex || 0
        });
        
        setCurrentSectionIndex(sectionIndex);
        setCurrentQuestionIndex(questionIndex);
        
        setConversationStage("questions");
        
        const response = await processConversation(
          messages,
          sessionId,
          partialProgress.role,
          partialProgress.questionIndex || 0, 
          config
        );
        
        await simulateBotTyping("Great! Let's continue where we left off. " + response.message, response.options);
      }
    } catch (error) {
      console.error("Error resuming chat:", error);
      resetChat(true);
    }
  };

  const handleOptionSelection = async (optionId: string) => {
    setValidationError(undefined);
    
    const currentQuestion = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    // Check for special completion options
    if (conversationStage === "completion") {
      if (optionId === "proceed_to_registration") {
        // Handle direct navigation to registration form
        console.log("Redirecting to registration form");
        if (progress.role) {
          window.location.href = `/registration/${progress.role}?session=${sessionId}`;
        }
        return;
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
        resetChat(true);
        return;
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
        const prefillJson = generatePrefillJson(progress.role, updatedMessages);
        
        await simulateBotTyping(
          `Thanks for providing all this information! Based on your answers, we recommend completing your ${progress.role} registration. Click below to continue to the registration form with your data pre-filled.`,
          [
            { id: "proceed_to_registration", label: "Complete my registration" },
            { id: "talk_to_representative", label: "I'd like to talk to a representative first" }
          ]
        );
        
        console.log("Generated prefill JSON:", prefillJson);
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    
    // Special handling for completion stage
    if (conversationStage === "completion") {
      addMessage({
        content: trimmedInput,
        isUser: true,
        timestamp: Date.now()
      });
      
      setInput("");
      
      await simulateBotTyping(
        "Thanks for your message. Would you like to proceed with registration or speak with a representative?",
        [
          { id: "proceed_to_registration", label: "Complete my registration" },
          { id: "talk_to_representative", label: "I'd like to talk to a representative first" }
        ]
      );
      
      return;
    }
    
    // Get the current question type
    const questionType = getFieldTypeForCurrentQuestion();
    const currentQuestion = getCurrentQuestion(
      progress.role!,
      currentSectionIndex,
      currentQuestionIndex
    );
    
    // Special validation for budget questions
    if (currentQuestion?.id === "budget") {
      const budgetValidation = validateChatInput(trimmedInput, "budget");
      if (!budgetValidation.isValid) {
        setValidationError(budgetValidation.errorMessage);
        toast.error(budgetValidation.errorMessage);
        return;
      }
    }
    // Normal validation for other question types
    else if (questionType) {
      const validationResult = validateChatInput(trimmedInput, questionType);
      
      if (!validationResult.isValid) {
        setValidationError(validationResult.errorMessage);
        toast.error(validationResult.errorMessage);
        return;
      } else {
        setValidationError(undefined);
        if (questionType === "email" || questionType === "phone") {
          toast.success(`Valid ${questionType} format!`);
        }
      }
    }
    
    const userMessage = {
      content: trimmedInput,
      isUser: true,
      timestamp: Date.now()
    };
    
    addMessage(userMessage);
    setInput("");
    
    const currentQuestionId = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    setFormData(prev => ({
      ...prev,
      [currentQuestionId]: trimmedInput
    }));
    
    try {
      await saveChatResponse(
        sessionId,
        progress.role!,
        currentSectionIndex.toString(),
        currentQuestionId,
        trimmedInput
      );
    } catch (error) {
      console.error("Error saving response:", error);
    }
    
    if (progress.role) {
      await advanceToNextQuestion(currentQuestionId);
    } else {
      try {
        const response = await processConversation(
          [...messages, userMessage],
          sessionId,
          null,
          0,
          config
        );
        
        await simulateBotTyping(response.message, response.options || (alwaysShowOptions ? [
          { id: "family", label: "I need care for someone" },
          { id: "professional", label: "I provide care services" },
          { id: "community", label: "I want to support the community" }
        ] : undefined));
      } catch (error) {
        console.error("Error detecting user role:", error);
        await simulateBotTyping(
          "I'd like to help you better. Are you looking for caregiving services, offering professional care, or interested in community support?",
          [
            { id: "family", label: "I need care for someone" },
            { id: "professional", label: "I provide care services" },
            { id: "community", label: "I want to support the community" }
          ]
        );
      }
    }
  };

  const resetChat = (manual = false) => {
    clearMessages();
    clearProgress();
    resetChatState();
    
    localStorage.removeItem(`tavara_chat_progress_${sessionId}`);
    
    if (manual) {
      setTimeout(async () => {
        const introMessage = getIntroMessage();
        await simulateBotTyping(introMessage, getRoleOptions());
      }, 100);
    }
    
    setValidationError(undefined);
    setFieldType(null);
  };

  const initializeChat = async () => {
    const storedProgress = localStorage.getItem(`tavara_chat_progress_${sessionId}`);
    
    if (setInitialRole && skipIntro && progress.role) {
      handleInitialRoleSelection(progress.role);
    } else if (storedProgress && messages.length === 0 && !skipIntro) {
      setIsResuming(true);
      const introMessage = "Welcome back! Would you like to continue where you left off?";
      await simulateBotTyping(introMessage, [
        { id: "resume", label: "Yes, continue" },
        { id: "restart", label: "No, start over" }
      ]);
    } else if (messages.length === 0) {
      const introMessage = getIntroMessage();
      await simulateBotTyping(introMessage, getRoleOptions());
    }
  };

  const getFieldTypeForCurrentQuestion = (sectionIndex = currentSectionIndex, questionIndex = currentQuestionIndex): string | null => {
    if (!progress.role) return null;
    
    const question = getCurrentQuestion(
      progress.role,
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
    handleRoleSelection,
    handleInitialRoleSelection,
    handleOptionSelection,
    handleSendMessage,
    resetChat,
    initializeChat
  };
};
