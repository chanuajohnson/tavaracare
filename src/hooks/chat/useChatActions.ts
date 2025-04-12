
import { useState } from "react";
import { syncMessagesToSupabase } from "@/services/aiService";
import { processConversation } from "@/utils/chat/chatFlowEngine";
import { updateChatProgress, saveChatResponse } from "@/services/chatbotService";
import { generatePrefillJson } from "@/utils/chat/prefillGenerator";
import { toast } from "sonner";
import { ChatConfig } from "@/utils/chat/engine/types";
import { getIntroMessage, getRoleOptions } from "@/data/chatIntroMessage";
import { ChatMessage } from "@/types/chatTypes";

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
  alwaysShowOptions: boolean
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
      const response = await processConversation(
        [...messages, { content: `I'm a ${roleId}.`, isUser: true, timestamp: Date.now() }],
        sessionId,
        roleId,
        0,
        config
      );
      
      await simulateBotTyping(response.message, response.options);
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
    
    await simulateBotTyping(response.message, response.options);
    setConversationStage("questions");
  };

  const handleResumeChat = async () => {
    try {
      const partialProgress = JSON.parse(localStorage.getItem(`tavara_chat_progress_${sessionId}`) || "{}");
      if (partialProgress.role) {
        updateProgress({
          role: partialProgress.role,
          questionIndex: partialProgress.questionIndex || 0
        });
        
        setCurrentSectionIndex(Math.floor((partialProgress.questionIndex || 0) / 10));
        setCurrentQuestionIndex((partialProgress.questionIndex || 0) % 10);
        
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
      const nextQuestionIndex = currentQuestionIndex + 1;
      const maxQuestionsPerSection = 10;
      
      if (nextQuestionIndex >= maxQuestionsPerSection) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        setCurrentQuestionIndex(nextQuestionIndex);
      }
      
      const overallQuestionIndex = currentSectionIndex * 10 + nextQuestionIndex;
      
      updateProgress({
        role: progress.role,
        questionIndex: overallQuestionIndex
      });
      
      try {
        await updateChatProgress(
          sessionId,
          progress.role,
          currentSectionIndex.toString(),
          "in_progress",
          currentQuestion,
          formData
        );
      } catch (error) {
        console.error("Error updating chat progress:", error);
      }
      
      const updatedMessages = [...messages, { content: optionId, isUser: true, timestamp: Date.now() }];
      
      try {
        const response = await processConversation(
          updatedMessages,
          sessionId,
          progress.role,
          overallQuestionIndex,
          config
        );
        
        await simulateBotTyping(response.message, response.options);
        
        if (overallQuestionIndex >= 50) {
          setConversationStage("completion");
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
      const nextQuestionIndex = currentQuestionIndex + 1;
      const maxQuestionsPerSection = 10;
      
      if (nextQuestionIndex >= maxQuestionsPerSection) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        setCurrentQuestionIndex(nextQuestionIndex);
      }
      
      const overallQuestionIndex = currentSectionIndex * 10 + nextQuestionIndex;
      
      updateProgress({
        role: progress.role,
        questionIndex: overallQuestionIndex
      });
      
      try {
        await updateChatProgress(
          sessionId,
          progress.role,
          currentSectionIndex.toString(),
          "in_progress",
          currentQuestion,
          formData
        );
      } catch (error) {
        console.error("Error updating chat progress:", error);
      }
      
      try {
        if (conversationStage === "completion") {
          const prefillJson = generatePrefillJson(progress.role, [
            ...messages, 
            userMessage
          ]);
          
          clearProgress();
          console.log("Generated prefill JSON:", prefillJson);
          return;
        }
        
        const updatedMessages = [...messages, userMessage];
        
        const response = await processConversation(
          updatedMessages,
          sessionId,
          progress.role,
          overallQuestionIndex,
          config
        );
        
        if (overallQuestionIndex >= 50) {
          setConversationStage("completion");
          
          await simulateBotTyping(
            `Thanks for providing this information! Based on your answers, we recommend completing your ${progress.role} registration. Click below to continue to the registration form with your data pre-filled.`
          );
        } else {
          await simulateBotTyping(response.message, response.options);
        }
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
  };

  const initializeChat = async () => {
    const storedProgress = localStorage.getItem(`tavara_chat_progress_${sessionId}`);
    
    if (initialRole) {
      handleInitialRoleSelection(initialRole);
    } else if (skipIntro && progress.role) {
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

  return {
    handleRoleSelection,
    handleInitialRoleSelection,
    handleOptionSelection,
    handleSendMessage,
    resetChat,
    initializeChat
  };
};
