
import { syncMessagesToSupabase } from "@/services/aiService";
import { processConversation } from "@/utils/chat/chatFlowEngine";
import { updateChatProgress, saveChatResponse, getSessionResponses, validateChatInput } from "@/services/chatbotService";
import { generatePrefillJson } from "@/utils/chat/prefillGenerator";
import { toast } from "sonner";
import { ChatConfig } from "@/utils/chat/engine/types";
import { getIntroMessage, getRoleOptions } from "@/data/chatIntroMessage";
import { ChatMessage } from "@/types/chatTypes";
import { getCurrentQuestion, isEndOfSection, isEndOfFlow, getSectionTitle, getTotalSectionsForRole } from "@/services/chatbotService";

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
          currentQuestion,
          formData
        );
      } catch (error) {
        console.error("Error updating chat progress:", error);
      }
      
      const updatedMessages = [...messages, { content: optionId, isUser: true, timestamp: Date.now() }];
      
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
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    
    const questionType = getFieldTypeForCurrentQuestion();
    
    if (questionType) {
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
    
    const currentQuestion = `section_${currentSectionIndex}_question_${currentQuestionIndex}`;
    
    setFormData(prev => ({
      ...prev,
      [currentQuestion]: trimmedInput
    }));
    
    try {
      await saveChatResponse(
        sessionId,
        progress.role!,
        currentSectionIndex.toString(),
        currentQuestion,
        trimmedInput
      );
    } catch (error) {
      console.error("Error saving response:", error);
    }
    
    if (progress.role) {
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
          currentQuestion,
          formData
        );
      } catch (error) {
        console.error("Error updating chat progress:", error);
      }
      
      try {
        if (conversationStage === "completion" || isLastQuestion) {
          const prefillJson = generatePrefillJson(progress.role, [
            ...messages, 
            userMessage
          ]);
          
          await simulateBotTyping(
            `Thanks for providing all this information! Based on your answers, we recommend completing your ${progress.role} registration. Click below to continue to the registration form with your data pre-filled.`,
            [
              { id: "proceed_to_registration", label: "Complete my registration" },
              { id: "talk_to_representative", label: "I'd like to talk to a representative first" }
            ]
          );
          
          console.log("Generated prefill JSON:", prefillJson);
          return;
        }
        
        const updatedMessages = [...messages, userMessage];
        
        let previousResponses = {};
        try {
          previousResponses = await getSessionResponses(sessionId);
        } catch (err) {
          console.log("No previous responses found");
        }
        
        const response = await processConversation(
          updatedMessages,
          sessionId,
          progress.role,
          overallQuestionIndex,
          config
        );
        
        const nextQuestionType = getFieldTypeForCurrentQuestion(
          nextSectionIndex,
          nextQuestionIndex
        );
        setFieldType(nextQuestionType);
        
        if (response.validationNeeded) {
          console.log(`Next question requires ${response.validationNeeded} validation`);
          setFieldType(response.validationNeeded);
        }
        
        // If we're starting a new section, include section title in the message
        let responseMessage = response.message;
        if (nextQuestionIndex === 0) {
          const sectionTitle = getSectionTitle(progress.role, nextSectionIndex);
          responseMessage = `Great! Let's talk about ${sectionTitle.toLowerCase()}.\n\n${response.message}`;
        }
        
        await simulateBotTyping(responseMessage, response.options);
      } catch (error) {
        console.error("Error processing conversation:", error);
        toast.error("Sorry, I encountered an error. Please try again.");
        await simulateBotTyping("I'm having trouble processing that. Could you try again or rephrase?", alwaysShowOptions ? getRoleOptions() : undefined);
      }
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
