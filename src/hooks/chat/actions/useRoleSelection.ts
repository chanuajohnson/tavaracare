
import { syncMessagesToSupabase } from "@/services/aiService";
import { processConversation } from "@/utils/chat/chatFlowEngine";
import { 
  updateChatProgress, 
  saveChatResponse, 
  getSessionResponses,
  getSectionTitle
} from "@/services/chatbotService";
import { getRoleOptions } from "@/data/chatIntroMessage";
import { ChatMessage } from "@/types/chatTypes";
import { ChatConfig } from "@/utils/chat/engine/types";

interface UseRoleSelectionProps {
  sessionId: string;
  messages: ChatMessage[];
  addMessage: (message: any) => void;
  updateProgress: (updates: any) => void;
  setFormData: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  setCurrentSectionIndex: (index: number) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setConversationStage: (stage: "intro" | "questions" | "completion") => void;
  config: ChatConfig;
  setInitialRole: (role: string | null) => void;
  simulateBotTyping: (message: string, options?: any) => Promise<void>;
  setFieldType: (type: string | null) => void;
  getFieldTypeForCurrentQuestion: (sectionIndex?: number, questionIndex?: number) => string | null;
}

export const useRoleSelection = ({
  sessionId,
  messages,
  addMessage,
  updateProgress,
  setFormData,
  setCurrentSectionIndex,
  setCurrentQuestionIndex,
  setConversationStage,
  config,
  setInitialRole,
  simulateBotTyping,
  setFieldType,
  getFieldTypeForCurrentQuestion
}: UseRoleSelectionProps) => {
  
  const handleRoleSelection = async (roleId: string) => {
    if (roleId === "resume") {
      handleResumeChat();
      return;
    }
    
    if (roleId === "restart") {
      // This will be handled by the main hook
      return { action: "restart" };
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
      
      const questionType = getFieldTypeForCurrentQuestion(0, 0);
      setFieldType(questionType);
      
      // Use a cleaner transition message without redundant phrases
      const sectionTitle = getSectionTitle(roleId, 0);
      const introMessage = sectionTitle 
        ? `Great! Let's collect some ${sectionTitle.toLowerCase()} information. ${response.message}`
        : response.message;
        
      await simulateBotTyping(introMessage, response.options);
      setConversationStage("questions");
    } catch (error) {
      console.error("Error in role selection:", error);
      await simulateBotTyping("I'm having trouble with your selection. Could you try again?", getRoleOptions());
    }
    
    return { action: "continue" };
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
    
    // Use a cleaner transition message without redundant phrases
    const sectionTitle = getSectionTitle(roleId, 0);
    const introMessage = sectionTitle 
      ? `Great! Let's collect some ${sectionTitle.toLowerCase()} information. ${response.message}`
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
      return { action: "restart" };
    }
    return { action: "continue" };
  };

  return {
    handleRoleSelection,
    handleInitialRoleSelection,
    handleResumeChat
  };
};
