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
import { 
  isRepeatMessage, 
  setLastMessage, 
  clearMessageCache,
  startProcessingMessage 
} from "@/utils/chat/engine/messageCache";

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
    console.log(`[handleRoleSelection] Processing role selection: ${roleId}`);
    
    if (roleId === "resume") {
      console.log(`[handleRoleSelection] User chose to resume chat`);
      handleResumeChat();
      return;
    }
    
    if (roleId === "restart") {
      console.log(`[handleRoleSelection] User chose to restart chat`);
      // This will be handled by the main hook
      return { action: "restart" };
    }
    
    // Clear the message cache before processing a new role selection
    clearMessageCache(sessionId);
    
    // Add user message to chat
    addMessage({
      content: `I'm a ${roleId}.`,
      isUser: true,
      timestamp: Date.now()
    });
    
    try {
      console.log(`[handleRoleSelection] Saving role selection: ${roleId}`);
      
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
      console.error("[handleRoleSelection] Error saving role selection:", error);
    }
    
    // Update progress in app state
    updateProgress({
      role: roleId,
      questionIndex: 0
    });
    
    // Update section indices to start at the beginning
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    
    // Update form data with selected role
    setFormData(prev => ({
      ...prev,
      role: roleId
    }));
    
    try {
      let previousResponses = {};
      try {
        previousResponses = await getSessionResponses(sessionId);
      } catch (err) {
        console.log("[handleRoleSelection] No previous responses found");
      }
      
      console.log(`[handleRoleSelection] Processing conversation for role: ${roleId}, section: 0, isFirstQuestion: true`);
      
      const response = await processConversation(
        [...messages, { content: `I'm a ${roleId}.`, isUser: true, timestamp: Date.now() }],
        sessionId,
        roleId,
        0,
        config,
        true // Indicate this is the first question after role selection
      );
      
      console.log(`[handleRoleSelection] Received response from processConversation:`, response);
      
      // Detect the field type for the first question
      const questionType = getFieldTypeForCurrentQuestion(0, 0, roleId);
      console.log(`[handleRoleSelection] Setting field type to: ${questionType}`);
      setFieldType(questionType);
      
      // Add a consistent greeting that will be processed properly by simulateBotTyping
      const firstMessage = "Let's get started. " + response.message;
      
      // Mark that we're starting to process this message
      startProcessingMessage(sessionId);
      
      console.log(`[handleRoleSelection] Displaying bot message: "${firstMessage.substring(0, 50)}..."`);
      await simulateBotTyping(firstMessage, response.options);
      
      // Change conversation stage to questions
      console.log(`[handleRoleSelection] Setting conversation stage to questions`);
      setConversationStage("questions");
    } catch (error) {
      console.error("[handleRoleSelection] Error in role selection:", error);
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
    
    // Add a consistent greeting that will be processed properly by simulateBotTyping
    const firstMessage = "Let's get started. " + response.message;
    
    // Store this message in the cache to prevent repetition
    setLastMessage(sessionId, firstMessage);
    
    await simulateBotTyping(firstMessage, response.options);
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
