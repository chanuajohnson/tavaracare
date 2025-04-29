
import { updateChatProgress } from "@/services/chatbotService";
import { ChatMessage } from "@/types/chatTypes";
import { ChatConfig } from "@/utils/chat/engine/types";
import { useRoleSelection } from "./actions/useRoleSelection";
import { useOptionSelection } from "./actions/useOptionSelection";
import { useMessageInput } from "./actions/useMessageInput";
import { useChatReset } from "./actions/useChatReset";
import { useChatFieldUtils } from "./actions/useChatFieldUtils";

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
  // Get the field type utility function
  const { getFieldTypeForCurrentQuestion } = useChatFieldUtils();
  
  // Set up option selection hooks with the field utility
  const { handleOptionSelection, advanceToNextQuestion } = useOptionSelection({
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
  });
  
  // Set up message input hooks
  const { handleSendMessage } = useMessageInput({
    sessionId,
    messages,
    addMessage,
    progress,
    updateProgress,
    formData,
    setFormData,
    currentSectionIndex,
    currentQuestionIndex,
    setInput,
    conversationStage,
    config,
    simulateBotTyping,
    alwaysShowOptions,
    advanceToNextQuestion,
    setValidationError,
    getFieldTypeForCurrentQuestion
  });
  
  // Set up role selection hooks
  const { 
    handleRoleSelection: roleSelectionHandler,
    handleInitialRoleSelection, 
    handleResumeChat 
  } = useRoleSelection({
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
  });
  
  // Set up chat reset hooks
  const { resetChat, initializeChat: initializeChatHelper } = useChatReset({
    sessionId,
    clearMessages,
    clearProgress,
    resetChatState,
    simulateBotTyping,
    setValidationError,
    setFieldType
  });
  
  // Wrapper for the role selection handler
  const handleRoleSelection = async (roleId: string) => {
    const result = await roleSelectionHandler(roleId);
    if (result?.action === "restart") {
      resetChat(true);
    }
    return result;
  };
  
  // Initialize the chat
  const initializeChat = async () => {
    const storedProgress = localStorage.getItem(`tavara_chat_progress_${sessionId}`);
    
    const result = await initializeChatHelper(
      storedProgress,
      messages,
      skipIntro,
      progress,
      setIsResuming
    );
    
    if (result.action === 'handleInitialRole' && result.role) {
      handleInitialRoleSelection(result.role);
    }
  };
  
  return {
    handleRoleSelection,
    handleInitialRoleSelection,
    handleOptionSelection,
    handleSendMessage,
    resetChat,
    initializeChat,
    getFieldTypeForCurrentQuestion
  };
};
