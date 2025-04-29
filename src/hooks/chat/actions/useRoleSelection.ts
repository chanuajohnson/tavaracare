
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
import { isRepeatMessage, setLastMessage } from "@/utils/chat/engine/messageCache";

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
  getFieldTypeForCurrentQuestion: (sectionIndex?: number, questionIndex?: number, role?: string | null) => string | null;
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
        config,
        true // Indicate this is the first question after role selection
      );
      
      const questionType = getFieldTypeForCurrentQuestion(0, 0, roleId);
      setFieldType(questionType);
      
      // Use a simpler greeting without redundant section introduction
      const simpleIntro = "Great! Let's get started. ";
      const finalMessage = simpleIntro + response.message;
      
      // Store this message in the cache to prevent repetition
      setLastMessage(sessionId, finalMessage);
      
      await simulateBotTyping(finalMessage, response.options);
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
      config,
      true // Indicate this is the first question after role selection
    );
    
    const questionType = getFieldTypeForCurrentQuestion(0, 0, roleId);
    setFieldType(questionType);
    
    // Use a simpler greeting without redundant section information
    const simpleIntro = "Great! Let's get started. ";
    const finalMessage = simpleIntro + response.message;
    
    // Store this message in the cache to prevent repetition
    setLastMessage(sessionId, finalMessage);
    
    await simulateBotTyping(finalMessage, response.options);
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
        
        // Get previous responses to provide context
        const previousResponses = await getSessionResponses(sessionId);
        const responseCount = Object.keys(previousResponses).length;
        
        // Generate a personalized welcome back message
        let welcomeBackMessage = "";
        
        if (responseCount > 0) {
          welcomeBackMessage = `Welcome back! I see we were discussing ${getSectionTitle(partialProgress.role, sectionIndex).toLowerCase()}. Let's continue where we left off. `;
        } else {
          welcomeBackMessage = "Welcome back! Let's continue where we left off. ";
        }
        
        const response = await processConversation(
          messages,
          sessionId,
          partialProgress.role,
          partialProgress.questionIndex || 0, 
          config
        );
        
        const fieldType = getFieldTypeForCurrentQuestion(sectionIndex, questionIndex, partialProgress.role);
        setFieldType(fieldType);
        
        // Only add the welcome back message if this is a new message (not cached)
        const finalMessage = welcomeBackMessage + response.message;
        
        if (!isRepeatMessage(sessionId, finalMessage)) {
          setLastMessage(sessionId, finalMessage);
          await simulateBotTyping(finalMessage, response.options);
        } else {
          // If message would be repetitive, just ask the next question
          const nextQuestion = await processConversation(
            [...messages, { content: "Continue", isUser: true, timestamp: Date.now() }],
            sessionId,
            partialProgress.role,
            partialProgress.questionIndex || 0,
            config
          );
          
          await simulateBotTyping(welcomeBackMessage + nextQuestion.message, nextQuestion.options);
        }
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
